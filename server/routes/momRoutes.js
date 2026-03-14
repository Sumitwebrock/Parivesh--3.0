import fs from 'node:fs'
import path from 'node:path'
import express from 'express'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { Document, Packer, Paragraph, TextRun } from 'docx'

function makeError(message, status = 500) {
  return Object.assign(new Error(message), { status })
}

function ensureDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true })
}

function htmlToPlainText(input) {
  return String(input || '')
    .replace(/<\s*br\s*\/?\s*>/gi, '\n')
    .replace(/<\/(p|div|h1|h2|h3|li)>/gi, '\n')
    .replace(/<li>/gi, '- ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function buildFallbackGist(appRow) {
  return [
    'SCRUTINY GIST SUMMARY',
    `Application ID: ${appRow.application_id}`,
    `Project Name: ${appRow.project_name}`,
    `Proponent: ${appRow.proponent_name || appRow.owner_name || '-'}`,
    `Category: ${appRow.category}`,
    `Sector: ${appRow.sector || appRow.sector_name || '-'}`,
    `Organization: ${appRow.organization || '-'}`,
    `Location: ${[appRow.district, appRow.state].filter(Boolean).join(', ') || '-'}`,
    `Estimated Cost: INR ${Number(appRow.estimated_cost || 0).toLocaleString('en-IN')}`,
    '',
    'Project Description:',
    String(appRow.project_description || '-').trim() || '-',
  ].join('\n')
}

async function writeDocx(filePath, content) {
  const children = htmlToPlainText(content)
    .split(/\r?\n/)
    .map((line) => new Paragraph({ children: [new TextRun(line || ' ')] }))

  const doc = new Document({
    sections: [{ properties: {}, children }],
  })

  const buffer = await Packer.toBuffer(doc)
  fs.writeFileSync(filePath, buffer)
}

async function writePdf(filePath, content) {
  const pdf = await PDFDocument.create()
  const font = await pdf.embedFont(StandardFonts.Helvetica)
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold)
  const text = htmlToPlainText(content)
  const lines = text.split(/\r?\n/)

  let page = pdf.addPage([595.28, 841.89])
  let y = page.getHeight() - 50
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index] || ' '
    const isHeader = index < 5
    page.drawText(line, {
      x: 50,
      y,
      size: isHeader ? 12 : 10,
      font: isHeader ? fontBold : font,
      color: rgb(0, 0, 0),
      maxWidth: page.getWidth() - 100,
      lineHeight: 14,
    })
    y -= isHeader ? 18 : 14
    if (y < 50) {
      page = pdf.addPage([595.28, 841.89])
      y = page.getHeight() - 50
    }
  }

  const bytes = await pdf.save()
  fs.writeFileSync(filePath, bytes)
}

export function createMomRoutes({ db, uploadsDir }) {
  const router = express.Router()
  const momUploadsDir = path.join(uploadsDir, 'mom')
  ensureDirectory(momUploadsDir)

  const queueStmt = db.prepare(`
    SELECT
      a.id,
      a.application_id,
      a.project_name,
      a.category,
      a.status,
      a.gist_content,
      a.mom_path,
      COALESCE(a.finalized, 0) AS finalized,
      a.finalized_at,
      s.name AS sector,
      s.name AS sector_name,
      u.full_name AS proponent_name,
      u.full_name AS owner_name,
      a.updated_at,
      a.created_at
    FROM applications a
    JOIN sectors s ON s.id = a.sector_id
    JOIN users u ON u.id = a.owner_user_id
    WHERE a.status IN ('Referred', 'MoMGenerated', 'Finalized')
    ORDER BY a.updated_at DESC
  `)

  const appStmt = db.prepare(`
    SELECT
      a.*,
      s.name AS sector,
      s.name AS sector_name,
      u.full_name AS proponent_name,
      u.full_name AS owner_name
    FROM applications a
    JOIN sectors s ON s.id = a.sector_id
    JOIN users u ON u.id = a.owner_user_id
    WHERE a.id = ?
  `)

  const scrutinyGistStmt = db.prepare('SELECT gist_content FROM scrutiny_gists WHERE application_id = ?')
  const scrutinyGistInsertStmt = db.prepare(`
    INSERT INTO scrutiny_gists (application_id, docx_path, pdf_path, gist_content, generated_by, generated_at)
    VALUES (?, ?, ?, ?, ?, datetime('now'))
  `)
  const historyInsertStmt = db.prepare(`
    INSERT INTO application_status_history (application_id, status, comment, created_by, created_at)
    VALUES (?, ?, ?, ?, datetime('now'))
  `)

  function ensureStoredGist(appRow) {
    const scrutinyGist = scrutinyGistStmt.get(appRow.id)
    const existingContent = String(appRow.gist_content || scrutinyGist?.gist_content || '').trim()
    if (existingContent) return existingContent

    const fallback = buildFallbackGist(appRow)
    db.prepare(`
      UPDATE applications
      SET gist_content = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(fallback, appRow.id)

    if (!scrutinyGist) {
      scrutinyGistInsertStmt.run(appRow.id, '', '', fallback, 'system')
    }

    historyInsertStmt.run(appRow.id, appRow.status || 'Referred', 'Gist auto-generated for MoM handoff', 'system')
    return fallback
  }

  router.get('/applications', (_req, res) => {
    res.json(queueStmt.all())
  })

  router.get('/applications/:id/gist', (req, res) => {
    const appRow = appStmt.get(req.params.id)
    if (!appRow) throw makeError('Application not found.', 404)

    const gistContent = ensureStoredGist(appRow)

    res.json({ gist_content: gistContent })
  })

  router.put('/applications/:id/gist', (req, res) => {
    const appRow = appStmt.get(req.params.id)
    if (!appRow) throw makeError('Application not found.', 404)
    if (Number(appRow.finalized || 0) === 1) throw makeError('MoM is locked', 403)

    const { content } = req.body || {}
    if (typeof content !== 'string' || !content.trim()) throw makeError('Content is required.', 400)

    db.prepare(`
      UPDATE applications
      SET gist_content = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(content, appRow.id)

    historyInsertStmt.run(appRow.id, appRow.status || 'Referred', 'Gist edited', String(req.user.id))
    res.json({ success: true })
  })

  router.post('/applications/:id/convert', async (req, res) => {
    const appRow = appStmt.get(req.params.id)
    if (!appRow) throw makeError('Application not found.', 404)
    if (Number(appRow.finalized || 0) === 1) throw makeError('MoM is locked', 403)

    const gistContent = ensureStoredGist(appRow)

    const today = new Date().toLocaleDateString('en-IN')
    const header = [
      'MINUTES OF THE MEETING',
      `Project: ${appRow.project_name}`,
      `Category: ${appRow.category}`,
      `Sector: ${appRow.sector}`,
      `Date: ${today}`,
      '',
    ].join('\n')
    const finalContent = `${header}${htmlToPlainText(gistContent)}`

    const relativeDocxPath = path.posix.join('mom', `${appRow.id}_mom.docx`)
    const relativePdfPath = path.posix.join('mom', `${appRow.id}_mom.pdf`)
    const docxPath = path.join(uploadsDir, relativeDocxPath)
    const pdfPath = path.join(uploadsDir, relativePdfPath)

    await writeDocx(docxPath, finalContent)
    await writePdf(pdfPath, finalContent)

    db.prepare(`
      UPDATE applications
      SET mom_path = ?, status = 'MoMGenerated', updated_at = datetime('now')
      WHERE id = ?
    `).run(relativePdfPath, appRow.id)

    const existingMom = db.prepare('SELECT id FROM mom_records WHERE application_id = ?').get(appRow.id)
    if (existingMom) {
      db.prepare(`
        UPDATE mom_records
        SET gist_draft = ?, mom_docx_path = ?, mom_pdf_path = ?, converted_by = ?, converted_at = datetime('now'), updated_at = datetime('now')
        WHERE application_id = ?
      `).run(gistContent, relativeDocxPath, relativePdfPath, String(req.user.id), appRow.id)
    } else {
      db.prepare(`
        INSERT INTO mom_records (application_id, gist_draft, mom_docx_path, mom_pdf_path, converted_by, converted_at)
        VALUES (?, ?, ?, ?, ?, datetime('now'))
      `).run(appRow.id, gistContent, relativeDocxPath, relativePdfPath, String(req.user.id))
    }

    historyInsertStmt.run(appRow.id, 'MoMGenerated', 'MoM converted and documents generated', String(req.user.id))

    res.json({
      docxUrl: `/uploads/mom/${appRow.id}_mom.docx`,
      pdfUrl: `/uploads/mom/${appRow.id}_mom.pdf`,
    })
  })

  router.put('/applications/:id/finalize', (req, res) => {
    const appRow = appStmt.get(req.params.id)
    if (!appRow) throw makeError('Application not found.', 404)
    if (Number(appRow.finalized || 0) === 1) throw makeError('Already finalized', 400)
    if (!String(appRow.mom_path || '').trim()) throw makeError('Convert to MoM before finalizing.', 400)

    const finalizedAt = new Date().toISOString()
    db.prepare(`
      UPDATE applications
      SET finalized = 1, finalized_at = ?, finalized_by = ?, status = 'Finalized', updated_at = datetime('now')
      WHERE id = ?
    `).run(finalizedAt, req.user.id, appRow.id)

    const existingMom = db.prepare('SELECT id FROM mom_records WHERE application_id = ?').get(appRow.id)
    if (existingMom) {
      db.prepare(`
        UPDATE mom_records
        SET finalized = 1, finalized_at = ?, finalized_by = ?, updated_at = datetime('now')
        WHERE application_id = ?
      `).run(finalizedAt, String(req.user.id), appRow.id)
    }

    historyInsertStmt.run(appRow.id, 'Finalized', 'MoM Finalized and Locked', String(req.user.id))
    res.json({ success: true, finalizedAt })
  })

  return router
}
