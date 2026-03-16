import fs from 'node:fs'
import path from 'node:path'
import express from 'express'
import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import Database from 'better-sqlite3'
import multer from 'multer'
import PDFDocument from 'pdfkit'
import {
  AlignmentType,
  BorderStyle,
  Document as WordDocument,
  HeadingLevel,
  Packer,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableLayoutType,
  TableRow,
  TextRun,
  VerticalAlign,
  WidthType,
} from 'docx'
import { createMomRoutes } from './routes/momRoutes.js'
import { createAiComplianceService } from './services/aiComplianceService.js'
import { createBlockchainAuditService } from './services/blockchainAuditService.js'

dotenv.config()

const app = express()
app.use(express.json())

const PORT = Number(process.env.AUTH_PORT || 8787)
const JWT_SECRET = process.env.JWT_SECRET || 'change-this-to-a-strong-random-secret'
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'parivesh-admin-secret-2026'

// ── Directories ───────────────────────────────────────────────────────────────
const dataDir = path.join(process.cwd(), 'data')
const templatesDir = path.join(dataDir, 'templates')
const uploadsDir = path.join(dataDir, 'uploads')
for (const d of [dataDir, templatesDir, uploadsDir]) {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true })
}

// ── Database ──────────────────────────────────────────────────────────────────
const dbPath = path.join(dataDir, 'auth.db')
const db = new Database(dbPath)

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    login_id TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    mobile TEXT,
    organization TEXT,
    role TEXT,
    state TEXT,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT DEFAULT '',
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    uploaded_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS sectors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS sector_params (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sector_id INTEGER NOT NULL REFERENCES sectors(id) ON DELETE CASCADE,
    param_label TEXT NOT NULL,
    param_type TEXT NOT NULL DEFAULT 'text',
    required INTEGER NOT NULL DEFAULT 0,
    options TEXT DEFAULT '[]',
    sort_order INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS sector_doc_checklists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sector_id INTEGER NOT NULL REFERENCES sectors(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    doc_name TEXT NOT NULL,
    required INTEGER NOT NULL DEFAULT 1,
    sort_order INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    application_id TEXT NOT NULL UNIQUE,
    owner_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    sector_id INTEGER NOT NULL REFERENCES sectors(id),
    status TEXT NOT NULL DEFAULT 'Draft',
    project_name TEXT NOT NULL,
    organization TEXT NOT NULL,
    project_description TEXT DEFAULT '',
    estimated_cost REAL DEFAULT 0,
    project_type TEXT DEFAULT '',
    state TEXT DEFAULT '',
    district TEXT DEFAULT '',
    coordinates TEXT DEFAULT '',
    land_area REAL DEFAULT 0,
    environmental_data TEXT DEFAULT '{}',
    sector_params_data TEXT DEFAULT '{}',
    eds_comments TEXT DEFAULT '',
    payment_status TEXT NOT NULL DEFAULT 'Not Initiated',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS application_documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    application_id INTEGER NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    doc_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    original_name TEXT NOT NULL,
    mime_type TEXT,
    size_bytes INTEGER DEFAULT 0,
    verification_status TEXT NOT NULL DEFAULT 'Uploaded',
    deficiency_comment TEXT DEFAULT '',
    uploaded_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS application_payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    application_id INTEGER NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    amount REAL NOT NULL,
    qr_payload TEXT NOT NULL,
    upi_ref TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'Initiated',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS application_status_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    application_id INTEGER NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    comment TEXT DEFAULT '',
    created_by TEXT DEFAULT 'system',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS scrutiny_reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    application_id INTEGER NOT NULL UNIQUE REFERENCES applications(id) ON DELETE CASCADE,
    review_data TEXT NOT NULL DEFAULT '{}',
    payment_verification TEXT NOT NULL DEFAULT 'Pending',
    review_notes TEXT DEFAULT '',
    reviewed_by TEXT DEFAULT '',
    reviewed_at TEXT NOT NULL DEFAULT (datetime('now')),
    locked INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS scrutiny_gists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    application_id INTEGER NOT NULL UNIQUE REFERENCES applications(id) ON DELETE CASCADE,
    docx_path TEXT NOT NULL,
    pdf_path TEXT NOT NULL,
    generated_by TEXT DEFAULT '',
    generated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS mom_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    application_id INTEGER NOT NULL UNIQUE REFERENCES applications(id) ON DELETE CASCADE,
    gist_draft TEXT NOT NULL DEFAULT '',
    meeting_date TEXT,
    meeting_id TEXT,
    committee_name TEXT,
    members_present TEXT,
    mom_docx_path TEXT,
    mom_pdf_path TEXT,
    converted_by TEXT,
    converted_at TEXT,
    finalized INTEGER NOT NULL DEFAULT 0,
    finalized_by TEXT,
    finalized_at TEXT,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS gist_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT CHECK(category IN ('A','B1','B2')),
    sector TEXT,
    template_content TEXT,
    created_by INTEGER,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS pp_notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    application_id INTEGER REFERENCES applications(id) ON DELETE CASCADE,
    type TEXT NOT NULL DEFAULT 'info',
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`)

// Safely add new columns to existing users rows
try { db.exec(`ALTER TABLE users ADD COLUMN assigned_role TEXT DEFAULT 'proponent'`) } catch (_) {}
try { db.exec(`ALTER TABLE users ADD COLUMN account_status TEXT DEFAULT 'active'`) } catch (_) {}
try { db.exec(`ALTER TABLE application_payments ADD COLUMN upi_reference_note TEXT DEFAULT ''`) } catch (_) {}
try { db.exec(`ALTER TABLE application_payments ADD COLUMN payee_upi_id TEXT DEFAULT 'sumitkumarsahoo772@okicici'`) } catch (_) {}
try { db.exec(`ALTER TABLE application_payments ADD COLUMN verified_by TEXT DEFAULT ''`) } catch (_) {}
try { db.exec(`ALTER TABLE application_payments ADD COLUMN verified_at TEXT`) } catch (_) {}
try { db.exec(`ALTER TABLE scrutiny_gists ADD COLUMN gist_content TEXT DEFAULT ''`) } catch (_) {}
try { db.exec(`ALTER TABLE applications ADD COLUMN eds_reason TEXT`) } catch (_) {}
try { db.exec(`ALTER TABLE applications ADD COLUMN eds_raised_at TEXT`) } catch (_) {}
try { db.exec(`ALTER TABLE applications ADD COLUMN gist_path TEXT`) } catch (_) {}
try { db.exec(`ALTER TABLE applications ADD COLUMN mom_path TEXT`) } catch (_) {}
try { db.exec(`ALTER TABLE applications ADD COLUMN gist_content TEXT`) } catch (_) {}
try { db.exec(`ALTER TABLE applications ADD COLUMN finalized INTEGER DEFAULT 0`) } catch (_) {}
try { db.exec(`ALTER TABLE applications ADD COLUMN finalized_at TEXT`) } catch (_) {}
try { db.exec(`ALTER TABLE applications ADD COLUMN finalized_by INTEGER`) } catch (_) {}
try { db.exec(`ALTER TABLE applications ADD COLUMN eds_summary TEXT DEFAULT ''`) } catch (_) {}
try { db.exec(`ALTER TABLE applications ADD COLUMN ai_compliance_report TEXT DEFAULT ''`) } catch (_) {}
try { db.exec(`ALTER TABLE applications ADD COLUMN application_hash TEXT DEFAULT ''`) } catch (_) {}
try { db.exec(`ALTER TABLE applications ADD COLUMN blockchain_txn_id TEXT DEFAULT ''`) } catch (_) {}
try { db.exec(`ALTER TABLE applications ADD COLUMN mom_hash TEXT DEFAULT ''`) } catch (_) {}
try { db.exec(`ALTER TABLE applications ADD COLUMN audit_txn_id TEXT DEFAULT ''`) } catch (_) {}
try { db.exec(`ALTER TABLE applications ADD COLUMN application_hash_recorded_at TEXT`) } catch (_) {}

const { queueAiCompliancePrecheck } = createAiComplianceService({ db })
const blockchainAudit = await createBlockchainAuditService({ db, dataDir, uploadsDir })

const queueWorkflowAudit = (applicationId, action, actor = null) => {
  try {
    blockchainAudit.queueWorkflowEvent(applicationId, action, {
      performedBy: actor?.login_id || actor?.username || 'system',
      userRole: actor?.assigned_role || actor?.role || actor?.username || 'system',
    })
  } catch (error) {
    console.error('[PARIVESH][Blockchain] Unable to queue workflow audit event', error)
  }
}

const queueSubmissionAudit = (applicationId, actor = null, action = 'Application Submitted') => {
  try {
    blockchainAudit.queueApplicationSubmission(applicationId, {
      action,
      performedBy: actor?.login_id || actor?.username || 'system',
      userRole: actor?.assigned_role || actor?.role || actor?.username || 'proponent',
    })
  } catch (error) {
    console.error('[PARIVESH][Blockchain] Unable to queue submission integrity audit', error)
  }
}

const queueMoMFinalizationAudit = (applicationId, momPdfPath, actor = null) => {
  try {
    blockchainAudit.queueMoMHash(applicationId, momPdfPath, {
      action: 'MoM Finalized',
      performedBy: actor?.login_id || actor?.username || 'system',
      userRole: actor?.assigned_role || actor?.role || actor?.username || 'mom',
    })
  } catch (error) {
    console.error('[PARIVESH][Blockchain] Unable to queue MoM hash audit', error)
  }
}

const createPpNotification = ({ userId, applicationId = null, type = 'info', title, message }) => {
  if (!userId || !title || !message) return
  db.prepare(`
    INSERT INTO pp_notifications (user_id, application_id, type, title, message, is_read, created_at)
    VALUES (?, ?, ?, ?, ?, 0, datetime('now'))
  `).run(userId, applicationId, type, String(title).trim(), String(message).trim())
}

// Backfill legacy rows where assigned_role stayed at default despite role label.
db.prepare(`
  UPDATE users
  SET assigned_role = CASE
    WHEN lower(role) LIKE '%scrutiny%' THEN 'scrutiny'
    WHEN lower(role) LIKE '%mom%' OR lower(role) LIKE '%minutes of meeting%' THEN 'mom'
    ELSE assigned_role
  END
  WHERE assigned_role = 'proponent'
`).run()

// Seed default admin account (username: admin / password: Admin@12345)
if (!db.prepare('SELECT id FROM admin_users WHERE username = ?').get('admin')) {
  db.prepare('INSERT INTO admin_users (username, password_hash) VALUES (?, ?)').run('admin', bcrypt.hashSync('Admin@12345', 10))
  console.log('[PARIVESH] Default admin created → username: admin | password: Admin@12345')
}

// Seed default sectors
const sectorSeeds = [
  ['Mining', 'Coal, metal ore, and mineral extraction projects'],
  ['Infrastructure', 'Roads, bridges, airports, ports and harbour projects'],
  ['Industrial / Chemical', 'Chemical plants, refineries, and industrial complexes'],
  ['Thermal Power', 'Thermal power stations and coal-based energy projects'],
  ['Construction / Township', 'Buildings, townships, and area development projects'],
  ['River Valley / Hydropower', 'Dams, reservoirs, and hydroelectric power projects'],
]
for (const [name, description] of sectorSeeds) {
  try { db.prepare('INSERT INTO sectors (name, description) VALUES (?, ?)').run(name, description) } catch (_) {}
}

const checklistSeeds = [
  'Form 1 - Application Form',
  'Pre-feasibility Report',
  'Site Layout / Map',
  'Land Ownership Document',
]
const sectorRowsForSeed = db.prepare('SELECT id FROM sectors').all()
for (const s of sectorRowsForSeed) {
  for (const category of ['A', 'B1', 'B2']) {
    checklistSeeds.forEach((doc, idx) => {
      const exists = db.prepare('SELECT id FROM sector_doc_checklists WHERE sector_id = ? AND category = ? AND doc_name = ?').get(s.id, category, doc)
      if (!exists) {
        db.prepare('INSERT INTO sector_doc_checklists (sector_id, category, doc_name, required, sort_order) VALUES (?, ?, ?, ?, ?)')
          .run(s.id, category, doc, 1, idx)
      }
    })
  }
}

// ── Multer (Template Uploads) ─────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, templatesDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    cb(null, `template_${Date.now()}${ext}`)
  },
})
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    if (['.doc', '.docx', '.pdf'].includes(ext)) cb(null, true)
    else cb(new Error('Only .doc, .docx and .pdf files are allowed'))
  },
})

const appDocStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    cb(null, `appdoc_${Date.now()}_${Math.round(Math.random() * 1e6)}${ext}`)
  },
})
const appDocUpload = multer({
  storage: appDocStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    if (['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'].includes(ext)) cb(null, true)
    else cb(new Error('Only PDF, DOC, DOCX and image files are allowed'))
  },
})

// ── Token Helpers ─────────────────────────────────────────────────────────────
const createToken = (user) =>
  jwt.sign({ sub: String(user.id), loginId: user.login_id, email: user.email }, JWT_SECRET, { expiresIn: '7d' })

const createAdminToken = (admin) =>
  jwt.sign({ sub: String(admin.id), username: admin.username, isAdmin: true }, ADMIN_SECRET, { expiresIn: '8h' })

const createApplicationId = () => `EC/${new Date().getFullYear()}/${Math.floor(Math.random() * 90000 + 10000)}`

const paymentByCategory = { A: 15000, B1: 2000, B2: 7000 }
// Update this one value to route every generated QR payment to your UPI account.
const DEFAULT_PAYEE_UPI_ID = 'sumitkumarsahoo772@okicici'
const DEFAULT_PAYEE_NAME = 'GraamSetu Portal'

const buildPaymentQrPayload = (upiId, amount, note) =>
  `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(DEFAULT_PAYEE_NAME)}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`

const reportParagraphsFromText = (text) => {
  const lines = String(text || '').split(/\r?\n/)
  return lines.map((line, index) => {
    const trimmed = line.trim()
    if (!trimmed) return new Paragraph({ children: [new TextRun(' ')] })

    const isTitle = index === 0
    const isSectionHeading = /:$/.test(trimmed) || /^[-=]{6,}$/.test(trimmed)

    return new Paragraph({
      heading: isTitle ? HeadingLevel.TITLE : undefined,
      spacing: { after: 160 },
      children: [
        new TextRun({
          text: line,
          bold: isTitle || isSectionHeading,
          size: isTitle ? 32 : undefined,
        }),
      ],
    })
  })
}

async function writeDocxReport(filePath, text) {
  const doc = new WordDocument({
    sections: [
      {
        properties: {},
        children: reportParagraphsFromText(text),
      },
    ],
  })
  const buffer = await Packer.toBuffer(doc)
  fs.writeFileSync(filePath, buffer)
}

function writePdfReport(filePath, title, text) {
  return new Promise((resolve, reject) => {
    const pdf = new PDFDocument({ margin: 48, size: 'A4' })
    const stream = fs.createWriteStream(filePath)
    pdf.pipe(stream)

    pdf.font('Helvetica-Bold').fontSize(16).text(title, { align: 'center' })
    pdf.moveDown(1)
    pdf.font('Helvetica').fontSize(10).text(String(text || ''), {
      align: 'left',
      lineGap: 3,
    })
    pdf.end()

    stream.on('finish', resolve)
    stream.on('error', reject)
  })
}

const GIST_TITLE = 'GIST Document Template (Auto-Generated After Successful Scrutiny)'
const GIST_SECTION_FILL = 'E7F4EA'
const GIST_TABLE_HEADER_FILL = 'F3F8F4'
const GIST_BORDER_COLOR = 'B7C9BA'
const GIST_SECTION_TEXT = '1B4332'

const formatDisplayValue = (value, fallback = '-') => {
  if (value === null || value === undefined) return fallback
  if (Array.isArray(value)) {
    const normalized = value.map((item) => formatDisplayValue(item, '')).filter(Boolean)
    return normalized.length ? normalized.join(', ') : fallback
  }
  if (typeof value === 'object') {
    const entries = Object.entries(value)
      .filter(([, item]) => item !== null && item !== undefined && String(item).trim())
      .slice(0, 3)
      .map(([key, item]) => `${key}: ${String(item).trim()}`)
    return entries.length ? entries.join(' | ') : fallback
  }
  const text = String(value).trim()
  return text || fallback
}

const formatCurrencyValue = (value) => `INR ${Number(value || 0).toLocaleString('en-IN')}`

const formatDateValue = (value, fallback = 'AUTO') => {
  if (!value) return fallback
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return formatDisplayValue(value, fallback)
  return parsed.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const formatDateTimeValue = (value, fallback = 'AUTO') => {
  if (!value) return fallback
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return formatDisplayValue(value, fallback)
  return parsed.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const normalizeLookupKey = (value) => String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '')

const getCaseInsensitiveValue = (source, candidates = []) => {
  if (!source || typeof source !== 'object') return ''
  const entries = Object.entries(source)
  if (!entries.length) return ''
  const normalizedMap = new Map(entries.map(([key, value]) => [normalizeLookupKey(key), value]))
  for (const candidate of candidates) {
    const normalized = normalizeLookupKey(candidate)
    if (!normalized) continue
    if (normalizedMap.has(normalized)) return normalizedMap.get(normalized)
  }
  return ''
}

const pickFirstValue = (sources, candidates, fallback = '-') => {
  for (const source of sources) {
    const value = getCaseInsensitiveValue(source, candidates)
    const formatted = formatDisplayValue(value, '')
    if (formatted) return formatted
  }
  return fallback
}

const summarizeObjectEntries = (source, limit = 3, fallback = '-') => {
  if (!source || typeof source !== 'object') return fallback
  const entries = Object.entries(source)
    .filter(([, value]) => value !== null && value !== undefined && String(value).trim())
    .slice(0, limit)
    .map(([key, value]) => `${key}: ${String(value).trim()}`)
  return entries.length ? entries.join(' | ') : fallback
}

const toYesNoUnknown = (value) => {
  const normalized = String(value || '').trim().toLowerCase()
  if (!normalized) return '-'
  if (['yes', 'y', 'true', 'present', 'available'].includes(normalized)) return 'Yes'
  if (['no', 'n', 'false', 'absent', 'none'].includes(normalized)) return 'No'
  return formatDisplayValue(value)
}

const normalizeVerificationStatus = (value) => {
  const normalized = String(value || '').trim().toLowerCase()
  if (!normalized) return 'Submitted'
  if (normalized === 'verified') return 'Verified'
  if (normalized === 'rejected') return 'Rejected'
  if (normalized === 'flagged') return 'Flagged'
  if (normalized === 'pending') return 'Pending'
  return formatDisplayValue(value)
}

const inferNextStageLabel = (status) => {
  switch (String(status || '').trim()) {
    case 'Under Scrutiny': return 'Technical Evaluation'
    case 'EDS': return 'Proponent Resubmission'
    case 'Referred': return 'Committee Review'
    case 'Finalized': return 'Completed'
    default: return 'Technical Evaluation'
  }
}

const resolveProposalType = (appRow, detailSources) => {
  const explicit = pickFirstValue(detailSources, ['proposalType', 'proposal_type', 'proposal', 'expansionType', 'expansion_type'], '')
  if (explicit && explicit !== '-') return explicit
  const projectType = formatDisplayValue(appRow.project_type, '')
  if (projectType) return projectType
  return 'New / Expansion'
}

const buildScrutinyVerificationSummary = ({ docs, payment, review, appRow }) => {
  const verifiedDocs = docs.filter((doc) => String(doc.verification_status || '').toLowerCase() === 'verified').length
  const hasDeficiencies = String(appRow.status || '') === 'EDS'
  const verificationResult = formatDisplayValue(review?.review_data?.verificationResult, '')
  const reviewPassed = verificationResult === 'VERIFIED' || String(review?.review_data?.verified || '') === 'true'
  const paymentOk = ['verified', 'paid'].includes(String(payment?.status || '').toLowerCase()) || String(review?.payment_verification || '').toLowerCase() === 'verified'

  return [
    ['Data Completeness', hasDeficiencies ? 'Requires Clarification' : reviewPassed ? 'Passed' : 'Under Review'],
    ['Document Verification', docs.length ? (verifiedDocs === docs.length ? 'Passed' : verifiedDocs > 0 ? 'Partially Verified' : 'Pending Review') : 'Pending Uploads'],
    ['Eligibility Check', hasDeficiencies ? 'Requires Clarification' : ['Under Scrutiny', 'Referred', 'Finalized'].includes(String(appRow.status || '')) ? 'Passed' : 'Under Review'],
    ['Compliance Check', paymentOk ? 'Passed' : hasDeficiencies ? 'Requires Clarification' : 'Pending Review'],
  ]
}

const buildScrutinyOfficerRemarks = ({ review, appRow, docs, generatedAt }) => {
  const directNotes = formatDisplayValue(review?.review_notes, '')
  if (directNotes) return directNotes
  if (String(appRow.status || '') === 'EDS') {
    return formatDisplayValue(appRow.eds_comments, 'The proposal requires clarifications from the proponent before it can proceed to the next scrutiny stage.')
  }
  if (docs.length) {
    return `The proposal submitted by the proponent has been examined during the scrutiny stage. ${docs.length} supporting document(s) and the application details were reviewed on ${formatDateTimeValue(generatedAt)}.`
  }
  return 'The proposal submitted by the proponent has been examined during the scrutiny stage. All mandatory information currently available in the system has been compiled into this GIST for further evaluation.'
}

function buildScrutinyGistDocumentModel({ appRow, docs, payment, review, generatedBy, generatedAt }) {
  const environmentalData = safeJson(appRow.environmental_data, {})
  const sectorParams = safeJson(appRow.sector_params_data, {})
  const reviewData = safeJson(review?.review_data, {})
  const detailSources = [environmentalData, sectorParams, reviewData]

  const locationCoords = formatDisplayValue(appRow.coordinates, '-')
  const projectDescription = formatDisplayValue(appRow.project_description, '-')
  const projectObjective = pickFirstValue(detailSources, ['projectObjective', 'project_objective', 'objective'], projectDescription)
  const installedCapacity = pickFirstValue(detailSources, ['installedCapacity', 'installed_capacity', 'capacity', 'scale', 'projectScale'], summarizeObjectEntries(sectorParams, 2, '-'))
  const projectTimeline = pickFirstValue(detailSources, ['expectedTimeline', 'expected_timeline', 'timeline', 'projectTimeline', 'project_timeline'], '-')
  const village = pickFirstValue(detailSources, ['village', 'villageName', 'village_name'], '-')
  const landType = pickFirstValue(detailSources, ['landType', 'land_type', 'ownershipType', 'ownership_type'], '-')
  const landUseClassification = pickFirstValue(detailSources, ['landUseClassification', 'land_use_classification', 'landUse', 'land_use'], '-')
  const protectedAreaDistance = pickFirstValue(detailSources, ['distanceFromProtectedAreas', 'distance_from_protected_areas', 'protectedAreaDistance', 'protected_area_distance'], '-')
  const forestPresence = toYesNoUnknown(getCaseInsensitiveValue(environmentalData, ['presenceOfForestLand', 'presence_of_forest_land', 'forestLand', 'forest_land']))
  const waterSource = pickFirstValue(detailSources, ['waterSource', 'water_source'], pickFirstValue(detailSources, ['resources', 'resourceSource'], '-'))
  const wasteManagementPlan = pickFirstValue(detailSources, ['wasteManagementPlan', 'waste_management_plan', 'wastePlan', 'waste_plan'], '-')
  const proposalType = resolveProposalType(appRow, detailSources)

  const documentRows = docs.length
    ? docs.map((doc) => [
        `${formatDisplayValue(doc.doc_name)}${doc.original_name ? ` (${formatDisplayValue(doc.original_name)})` : ''}`,
        normalizeVerificationStatus(doc.verification_status),
      ])
    : [['No supporting documents available in the application record', 'Pending']]

  return {
    title: GIST_TITLE,
    meta: {
      applicationId: formatDisplayValue(appRow.application_id, 'AUTO-GENERATED'),
      projectName: formatDisplayValue(appRow.project_name),
      proponentName: formatDisplayValue(appRow.owner_name),
      organization: formatDisplayValue(appRow.organization),
      category: formatDisplayValue(appRow.category),
      sector: formatDisplayValue(appRow.sector_name),
      status: formatDisplayValue(appRow.status),
      generatedAt,
      generatedBy: formatDisplayValue(generatedBy, 'System'),
    },
    sections: [
      {
        title: '1. Basic Application Information',
        headers: ['Field', 'Details'],
        widths: [32, 68],
        rows: [
          ['Application ID', formatDisplayValue(appRow.application_id, 'AUTO-GENERATED')],
          ['Submission Date', formatDateValue(appRow.created_at)],
          ['Proponent Name', formatDisplayValue(appRow.owner_name)],
          ['Organization', formatDisplayValue(appRow.organization)],
          ['Project Title', formatDisplayValue(appRow.project_name)],
          ['Category', formatDisplayValue(appRow.category)],
          ['Sector', formatDisplayValue(appRow.sector_name)],
          ['Proposal Type', proposalType],
        ],
      },
      {
        title: '2. Project Overview',
        headers: ['Parameter', 'Details'],
        widths: [32, 68],
        rows: [
          ['Project Description', projectDescription],
          ['Installed Capacity / Scale', installedCapacity],
          ['Estimated Project Cost', formatCurrencyValue(appRow.estimated_cost)],
          ['Expected Project Timeline', projectTimeline],
          ['Project Objective', projectObjective],
        ],
      },
      {
        title: '3. Location Details',
        headers: ['Parameter', 'Details'],
        widths: [32, 68],
        rows: [
          ['Village', village],
          ['District', formatDisplayValue(appRow.district)],
          ['State', formatDisplayValue(appRow.state)],
          ['Latitude / Longitude', locationCoords],
          ['Total Land Area', `${Number(appRow.land_area || 0).toLocaleString('en-IN')} ha`],
          ['Land Type', landType],
        ],
      },
      {
        title: '4. Environmental Information',
        headers: ['Parameter', 'Details'],
        widths: [32, 68],
        rows: [
          ['Land Use Classification', landUseClassification],
          ['Distance from Protected Areas', protectedAreaDistance],
          ['Presence of Forest Land', forestPresence],
          ['Water Source', waterSource],
          ['Waste Management Plan', wasteManagementPlan],
        ],
      },
      {
        title: '5. Key Documents Submitted',
        headers: ['Document Name', 'Status'],
        widths: [70, 30],
        rows: documentRows,
      },
      {
        title: '6. Scrutiny Verification Summary',
        headers: ['Parameter', 'Status'],
        widths: [58, 42],
        rows: buildScrutinyVerificationSummary({ docs, payment, review, appRow }),
      },
      {
        title: '7. Scrutiny Officer Remarks',
        paragraphs: [buildScrutinyOfficerRemarks({ review, appRow, docs, generatedAt })],
      },
      {
        title: '8. System Generated Metadata',
        headers: ['Field', 'Value'],
        widths: [32, 68],
        rows: [
          ['Scrutiny Status', formatDisplayValue(appRow.status, 'Approved')],
          ['GIST Generated On', formatDateTimeValue(generatedAt)],
          ['Generated By', formatDisplayValue(generatedBy, 'System')],
          ['Next Stage', inferNextStageLabel(appRow.status)],
        ],
      },
    ],
  }
}

function buildFallbackScrutinyGistDocumentModel({ appRow, generatedBy, generatedAt, fallbackText = '' }) {
  return {
    title: GIST_TITLE,
    meta: {
      applicationId: formatDisplayValue(appRow?.application_id, 'AUTO-GENERATED'),
      projectName: formatDisplayValue(appRow?.project_name),
      proponentName: formatDisplayValue(appRow?.owner_name),
      organization: formatDisplayValue(appRow?.organization),
      category: formatDisplayValue(appRow?.category),
      sector: formatDisplayValue(appRow?.sector_name),
      status: formatDisplayValue(appRow?.status),
      generatedAt,
      generatedBy: formatDisplayValue(generatedBy, 'System'),
    },
    sections: [
      {
        title: '1. Basic Application Information',
        headers: ['Field', 'Details'],
        widths: [32, 68],
        rows: [
          ['Application ID', formatDisplayValue(appRow?.application_id, 'AUTO-GENERATED')],
          ['Submission Date', formatDateValue(appRow?.created_at)],
          ['Proponent Name', formatDisplayValue(appRow?.owner_name)],
          ['Organization', formatDisplayValue(appRow?.organization)],
          ['Project Title', formatDisplayValue(appRow?.project_name)],
          ['Category', formatDisplayValue(appRow?.category)],
          ['Sector', formatDisplayValue(appRow?.sector_name)],
          ['Proposal Type', formatDisplayValue(appRow?.project_type, 'New / Expansion')],
        ],
      },
      {
        title: '2. Project Overview',
        headers: ['Parameter', 'Details'],
        widths: [32, 68],
        rows: [
          ['Project Description', formatDisplayValue(appRow?.project_description)],
          ['Installed Capacity / Scale', '-'],
          ['Estimated Project Cost', formatCurrencyValue(appRow?.estimated_cost)],
          ['Expected Project Timeline', '-'],
          ['Project Objective', '-'],
        ],
      },
      {
        title: '3. Location Details',
        headers: ['Parameter', 'Details'],
        widths: [32, 68],
        rows: [
          ['Village', '-'],
          ['District', formatDisplayValue(appRow?.district)],
          ['State', formatDisplayValue(appRow?.state)],
          ['Latitude / Longitude', formatDisplayValue(appRow?.coordinates)],
          ['Total Land Area', `${Number(appRow?.land_area || 0).toLocaleString('en-IN')} ha`],
          ['Land Type', '-'],
        ],
      },
      {
        title: '4. Environmental Information',
        headers: ['Parameter', 'Details'],
        widths: [32, 68],
        rows: [
          ['Land Use Classification', '-'],
          ['Distance from Protected Areas', '-'],
          ['Presence of Forest Land', '-'],
          ['Water Source', '-'],
          ['Waste Management Plan', '-'],
        ],
      },
      {
        title: '5. Key Documents Submitted',
        headers: ['Document Name', 'Status'],
        widths: [70, 30],
        rows: [['Fallback recovery used existing stored gist content', 'Recovered']],
      },
      {
        title: '6. Scrutiny Verification Summary',
        headers: ['Parameter', 'Status'],
        widths: [58, 42],
        rows: [
          ['Data Completeness', 'Recovered'],
          ['Document Verification', 'Recovered'],
          ['Eligibility Check', 'Recovered'],
          ['Compliance Check', 'Recovered'],
        ],
      },
      {
        title: '7. Scrutiny Officer Remarks',
        paragraphs: [
          formatDisplayValue(
            fallbackText,
            'Auto-generated fallback gist was used because detailed GIST regeneration data could not be reconstructed fully from the database.',
          ),
        ],
      },
      {
        title: '8. System Generated Metadata',
        headers: ['Field', 'Value'],
        widths: [32, 68],
        rows: [
          ['Scrutiny Status', formatDisplayValue(appRow?.status, 'Recovered')],
          ['GIST Generated On', formatDateTimeValue(generatedAt)],
          ['Generated By', formatDisplayValue(generatedBy, 'System')],
          ['Next Stage', inferNextStageLabel(appRow?.status)],
        ],
      },
    ],
  }
}

function buildScrutinyGistText(model) {
  const lines = [model.title, '']
  for (const section of model.sections) {
    lines.push(section.title)
    if (section.rows?.length) {
      for (const row of section.rows) {
        if (row.length === 2) lines.push(`${row[0]}: ${row[1]}`)
        else lines.push(row.join(' | '))
      }
    }
    if (section.paragraphs?.length) lines.push(...section.paragraphs)
    lines.push('')
  }
  return lines.join('\n').trim()
}

const buildDocxCellParagraphs = (text, bold = false) => {
  const lines = String(text || '-').split(/\r?\n/)
  return lines.map((line) => new Paragraph({
    spacing: { after: 0 },
    children: [new TextRun({ text: line || ' ', bold })],
  }))
}

function createDocxTable(section) {
  const widths = Array.isArray(section.widths) && section.widths.length === section.headers.length
    ? section.widths
    : new Array(section.headers.length).fill(Math.floor(100 / Math.max(section.headers.length, 1)))

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    rows: [
      new TableRow({
        children: section.headers.map((header, index) => new TableCell({
          width: { size: widths[index], type: WidthType.PERCENTAGE },
          verticalAlign: VerticalAlign.CENTER,
          shading: { type: ShadingType.CLEAR, fill: GIST_TABLE_HEADER_FILL, color: 'auto' },
          margins: { top: 100, bottom: 100, left: 100, right: 100 },
          children: buildDocxCellParagraphs(header, true),
        })),
      }),
      ...section.rows.map((row) => new TableRow({
        children: section.headers.map((_, index) => new TableCell({
          width: { size: widths[index], type: WidthType.PERCENTAGE },
          verticalAlign: VerticalAlign.CENTER,
          margins: { top: 100, bottom: 100, left: 100, right: 100 },
          children: buildDocxCellParagraphs(row[index] ?? '-'),
        })),
      })),
    ],
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: GIST_BORDER_COLOR },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: GIST_BORDER_COLOR },
      left: { style: BorderStyle.SINGLE, size: 1, color: GIST_BORDER_COLOR },
      right: { style: BorderStyle.SINGLE, size: 1, color: GIST_BORDER_COLOR },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: GIST_BORDER_COLOR },
      insideVertical: { style: BorderStyle.SINGLE, size: 1, color: GIST_BORDER_COLOR },
    },
  })
}

async function writeScrutinyGistDocx(filePath, model) {
  const children = [
    new Paragraph({
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 240 },
      children: [new TextRun({ text: model.title, bold: true, size: 30 })],
    }),
  ]

  for (const section of model.sections) {
    children.push(new Paragraph({
      spacing: { before: 220, after: 120 },
      children: [new TextRun({ text: section.title, bold: true, size: 24 })],
    }))
    if (section.rows?.length) children.push(createDocxTable(section))
    if (section.paragraphs?.length) {
      for (const paragraphText of section.paragraphs) {
        children.push(new Paragraph({
          spacing: { after: 120 },
          children: [new TextRun({ text: paragraphText })],
        }))
      }
    }
  }

  const doc = new WordDocument({
    sections: [{ properties: {}, children }],
  })
  const buffer = await Packer.toBuffer(doc)
  fs.writeFileSync(filePath, buffer)
}

const getPdfPageBounds = (pdf) => ({
  left: pdf.page.margins.left,
  right: pdf.page.width - pdf.page.margins.right,
  bottom: pdf.page.height - pdf.page.margins.bottom,
  width: pdf.page.width - pdf.page.margins.left - pdf.page.margins.right,
})

const ensurePdfSpace = (pdf, heightNeeded) => {
  const bounds = getPdfPageBounds(pdf)
  if (pdf.y + heightNeeded > bounds.bottom) pdf.addPage()
}

const drawPdfSectionHeading = (pdf, title) => {
  ensurePdfSpace(pdf, 28)
  const bounds = getPdfPageBounds(pdf)
  const startY = pdf.y
  pdf.save()
  pdf.roundedRect(bounds.left, startY, bounds.width, 22, 4).fill(`#${GIST_SECTION_FILL}`)
  pdf.fillColor(`#${GIST_SECTION_TEXT}`).font('Helvetica-Bold').fontSize(10.5)
  pdf.text(title, bounds.left + 8, startY + 6, { width: bounds.width - 16 })
  pdf.restore()
  pdf.y = startY + 30
}

const drawPdfTable = (pdf, section) => {
  const bounds = getPdfPageBounds(pdf)
  const padding = 6
  const widths = Array.isArray(section.widths) && section.widths.length === section.headers.length
    ? section.widths
    : new Array(section.headers.length).fill(Math.floor(100 / Math.max(section.headers.length, 1)))
  const columnWidths = widths.map((width, index) => index === widths.length - 1
    ? bounds.width - widths.slice(0, -1).reduce((sum, item) => sum + (bounds.width * item / 100), 0)
    : bounds.width * width / 100)

  const drawRow = (row, options = {}) => {
    pdf.font(options.bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(9.5)
    const rowHeight = Math.max(
      ...row.map((cell, index) => pdf.heightOfString(String(cell || '-'), {
        width: columnWidths[index] - padding * 2,
        align: 'left',
      })),
      12,
    ) + padding * 2

    ensurePdfSpace(pdf, rowHeight)
    const rowTop = pdf.y
    let cellX = bounds.left

    for (let index = 0; index < row.length; index += 1) {
      const cellText = String(row[index] || '-')
      const cellWidth = columnWidths[index]
      pdf.save()
      pdf.rect(cellX, rowTop, cellWidth, rowHeight)
      if (options.fill) {
        pdf.fillAndStroke(options.fill, `#${GIST_BORDER_COLOR}`)
      } else {
        pdf.stroke(`#${GIST_BORDER_COLOR}`)
      }
      pdf.restore()
      pdf.fillColor('#1F2937')
      pdf.text(cellText, cellX + padding, rowTop + padding, {
        width: cellWidth - padding * 2,
        align: 'left',
      })
      cellX += cellWidth
    }

    pdf.y = rowTop + rowHeight
  }

  drawRow(section.headers, { bold: true, fill: `#${GIST_TABLE_HEADER_FILL}` })
  for (const row of section.rows) drawRow(row)
  pdf.moveDown(0.6)
}

function writeScrutinyGistPdf(filePath, model) {
  return new Promise((resolve, reject) => {
    const meta = model.meta || {}
    const generatedDateStr = meta.generatedAt
      ? formatDateTimeValue(meta.generatedAt)
      : formatDateTimeValue(new Date().toISOString())

    // Margins: extra top/bottom space reserved for running header and footer bands
    const PDF_MARGINS = { top: 80, bottom: 64, left: 40, right: 40 }
    const HEADER_BAND_H = 36

    const pdf = new PDFDocument({ margins: PDF_MARGINS, size: 'A4', autoFirstPage: false })
    const stream = fs.createWriteStream(filePath)
    pdf.pipe(stream)

    let pageNumber = 0
    let enableHeaderFooter = false

    const drawRunningHeader = () => {
      const pw = pdf.page.width
      const cw = pw - PDF_MARGINS.left - PDF_MARGINS.right
      pdf.save()
      pdf.rect(0, 0, pw, HEADER_BAND_H).fill(`#${GIST_SECTION_FILL}`)
      pdf.fontSize(7.5).font('Helvetica-Bold').fillColor(`#${GIST_SECTION_TEXT}`)
        .text(
          'Government of India  |  Ministry of Environment, Forest and Climate Change',
          PDF_MARGINS.left, 8,
          { width: cw * 0.72, lineBreak: false },
        )
      pdf.fontSize(7).font('Helvetica').fillColor('#374151')
        .text(
          `PARIVESH Portal${meta.applicationId ? `  |  Ref: ${meta.applicationId}` : ''}`,
          PDF_MARGINS.left, 22,
          { width: cw, align: 'right', lineBreak: false },
        )
      pdf.strokeColor(`#${GIST_BORDER_COLOR}`).lineWidth(0.5)
        .moveTo(0, HEADER_BAND_H).lineTo(pw, HEADER_BAND_H).stroke()
      pdf.restore()
    }

    const drawRunningFooter = () => {
      const pw = pdf.page.width
      const ph = pdf.page.height
      const cw = pw - PDF_MARGINS.left - PDF_MARGINS.right
      const fy = ph - PDF_MARGINS.bottom + 6
      pdf.save()
      pdf.strokeColor(`#${GIST_BORDER_COLOR}`).lineWidth(0.5)
        .moveTo(PDF_MARGINS.left, ph - PDF_MARGINS.bottom)
        .lineTo(pw - PDF_MARGINS.right, ph - PDF_MARGINS.bottom).stroke()
      pdf.fontSize(7).font('Helvetica').fillColor('#9CA3AF')
        .text('Parivesh Environmental Portal  |  For Official Use Only', PDF_MARGINS.left, fy, {
          width: cw * 0.6, align: 'left', lineBreak: false,
        })
        .text(`Page ${pageNumber}  |  ${generatedDateStr}`, PDF_MARGINS.left, fy, {
          width: cw, align: 'right', lineBreak: false,
        })
      pdf.restore()
    }

    // pageAdded fires before PDFKit resets pdf.x / pdf.y, so header/footer draw
    // safely; PDFKit then resets cursor to (margins.left, margins.top) after the event.
    pdf.on('pageAdded', () => {
      pageNumber++
      if (enableHeaderFooter) {
        drawRunningHeader()
        drawRunningFooter()
      }
    })

    // ─── Page 1: Cover page ──────────────────────────────────────────────────
    pdf.addPage()   // pageNumber = 1, enableHeaderFooter = false → no header/footer
    enableHeaderFooter = true

    const pw = pdf.page.width
    const ph = pdf.page.height
    const cw = pw - PDF_MARGINS.left - PDF_MARGINS.right

    // Top governmental band
    pdf.rect(0, 0, pw, 68).fill(`#${GIST_SECTION_FILL}`)
    pdf.fontSize(11).font('Helvetica-Bold').fillColor(`#${GIST_SECTION_TEXT}`)
      .text('Government of India', 0, 11, { width: pw, align: 'center', lineBreak: false })
    pdf.fontSize(9.5).font('Helvetica').fillColor(`#${GIST_SECTION_TEXT}`)
      .text('Ministry of Environment, Forest and Climate Change', 0, 28, { width: pw, align: 'center', lineBreak: false })
    pdf.fontSize(8.5).font('Helvetica').fillColor('#2D6A4F')
      .text('Parivesh Environmental Clearance Portal', 0, 47, { width: pw, align: 'center', lineBreak: false })

    // Switch to flow positioning below the top band
    pdf.x = PDF_MARGINS.left
    pdf.y = 86

    // PARIVESH branding
    pdf.fontSize(34).font('Helvetica-Bold').fillColor(`#${GIST_SECTION_TEXT}`)
      .text('PARIVESH', { align: 'center', width: cw })
    pdf.moveDown(0.2)
    pdf.fontSize(11).font('Helvetica').fillColor('#6B7280')
      .text('Environmental Clearance Portal', { align: 'center', width: cw })
    pdf.moveDown(0.6)

    // Thin horizontal rule
    const rule1Y = pdf.y
    pdf.strokeColor(`#${GIST_BORDER_COLOR}`).lineWidth(1.5)
      .moveTo(PDF_MARGINS.left + 60, rule1Y)
      .lineTo(pw - PDF_MARGINS.right - 60, rule1Y).stroke()
    pdf.y = rule1Y + 18

    // Document type label
    pdf.fontSize(17).font('Helvetica-Bold').fillColor('#0F172A')
      .text('SCRUTINY GIST DOCUMENT', { align: 'center', width: cw })
    pdf.moveDown(0.25)
    pdf.fontSize(8.5).font('Helvetica').fillColor('#6B7280')
      .text('Auto-Generated After Successful Scrutiny Review  —  PARIVESH Portal', { align: 'center', width: cw })
    pdf.moveDown(0.8)

    // Application ID pill
    if (meta.applicationId) {
      const pillW = Math.min(280, cw)
      const pillX = PDF_MARGINS.left + (cw - pillW) / 2
      const pillY = pdf.y
      pdf.roundedRect(pillX, pillY, pillW, 28, 7).fill('#0F172A')
      pdf.fontSize(10.5).font('Helvetica-Bold').fillColor('#FFFFFF')
        .text(`Application Ref: ${meta.applicationId}`, pillX, pillY + 9, { width: pillW, align: 'center', lineBreak: false })
      pdf.y = pillY + 42
    }

    pdf.moveDown(0.4)

    // Summary details table
    const coverItems = [
      ['Project Title',    meta.projectName    || '-'],
      ['Proponent',        meta.proponentName  || '-'],
      ['Organization',     meta.organization   || '-'],
      ['Category',         meta.category       || '-'],
      ['Sector',           meta.sector         || '-'],
      ['Current Status',   meta.status         || '-'],
      ['Document Generated', generatedDateStr],
      ['Generated By',     meta.generatedBy    || 'System'],
    ]
    const boxLeft   = PDF_MARGINS.left + 20
    const boxWidth  = cw - 40
    const labelColW = boxWidth * 0.35
    const valueColW = boxWidth * 0.65
    const itemH     = 22
    const boxTop    = pdf.y
    const boxTotalH = coverItems.length * itemH + 4

    // Box border
    pdf.roundedRect(boxLeft, boxTop, boxWidth, boxTotalH, 5).stroke(`#${GIST_BORDER_COLOR}`)

    for (let i = 0; i < coverItems.length; i++) {
      const [label, val] = coverItems[i]
      const rY = boxTop + 2 + i * itemH
      if (i % 2 === 0) {
        pdf.rect(boxLeft, rY, boxWidth, itemH).fill(`#${GIST_TABLE_HEADER_FILL}`)
      }
      // Vertical divider
      pdf.strokeColor(`#${GIST_BORDER_COLOR}`).lineWidth(0.4)
        .moveTo(boxLeft + labelColW, rY)
        .lineTo(boxLeft + labelColW, rY + itemH).stroke()
      // Horizontal divider between rows
      if (i > 0) {
        pdf.lineWidth(0.3)
          .moveTo(boxLeft, rY).lineTo(boxLeft + boxWidth, rY).stroke()
      }
      pdf.fontSize(7.8).font('Helvetica-Bold').fillColor('#374151')
        .text(String(label), boxLeft + 6, rY + 7, { width: labelColW - 10, lineBreak: false })
      pdf.fontSize(7.8).font('Helvetica').fillColor('#111827')
        .text(String(val).slice(0, 65), boxLeft + labelColW + 6, rY + 7, { width: valueColW - 10, lineBreak: false })
    }

    // Bottom bar (absolute position)
    pdf.rect(0, ph - 36, pw, 36).fill(`#${GIST_SECTION_FILL}`)
    pdf.fontSize(7.5).font('Helvetica').fillColor('#2D6A4F')
      .text(
        'This is a computer-generated document from the PARIVESH Environmental Clearance Portal.  Government of India.',
        0, ph - 23,
        { width: pw, align: 'center', lineBreak: false },
      )

    // ─── Content pages ────────────────────────────────────────────────────────
    // pageAdded fires: pageNumber=2, enableHeaderFooter=true → header/footer drawn
    // PDFKit then resets pdf.y = PDF_MARGINS.top = 80
    pdf.addPage()

    for (const section of model.sections) {
      drawPdfSectionHeading(pdf, section.title)
      if (section.rows?.length) drawPdfTable(pdf, section)
      if (section.paragraphs?.length) {
        for (const paragraphText of section.paragraphs) {
          ensurePdfSpace(pdf, 40)
          pdf.font('Helvetica').fontSize(9.8).fillColor('#1F2937').text(paragraphText, {
            align: 'left',
            lineGap: 3,
          })
          pdf.moveDown(0.6)
        }
      }
    }

    // ─── Certification & Sign-off block ──────────────────────────────────────
    ensurePdfSpace(pdf, 110)
    const certBounds = getPdfPageBounds(pdf)
    pdf.moveDown(0.6)
    pdf.strokeColor(`#${GIST_BORDER_COLOR}`).lineWidth(0.8)
      .moveTo(certBounds.left, pdf.y).lineTo(certBounds.right, pdf.y).stroke()
    pdf.y += 8

    drawPdfSectionHeading(pdf, '9. Document Certification & Sign-off')

    pdf.font('Helvetica').fontSize(8.5).fillColor('#374151')
      .text(
        `This Scrutiny GIST Document has been automatically generated by the PARIVESH Environmental Clearance Portal, ` +
        `Ministry of Environment, Forest and Climate Change, Government of India. ` +
        `It summarises the scrutiny findings for Application Ref: ${meta.applicationId || '(see cover page)'} ` +
        `and constitutes an official system record. The contents of this document should be treated as confidential ` +
        `and used only for the purposes of the environmental clearance process.`,
        { align: 'justify', lineGap: 2, width: certBounds.width },
      )
    pdf.moveDown(1.4)

    const sigY = pdf.y
    pdf.strokeColor('#9CA3AF').lineWidth(0.5)
      .moveTo(certBounds.left, sigY).lineTo(certBounds.left + 210, sigY).stroke()
    pdf.moveTo(certBounds.right - 150, sigY).lineTo(certBounds.right, sigY).stroke()
    pdf.moveDown(0.3)
    const sigLabelY = pdf.y
    pdf.fontSize(7.5).font('Helvetica').fillColor('#6B7280')
      .text('Scrutiny Officer / Designated Authority', certBounds.left, sigLabelY, { width: 210 })
    pdf.text(`Date: ${formatDateValue(meta.generatedAt)}`, certBounds.right - 150, sigLabelY, { width: 150, align: 'right' })
    pdf.moveDown(0.2)
    pdf.text('Ministry of Environment, Forest and Climate Change, GoI', certBounds.left, pdf.y, { width: 310 })

    pdf.end()
    stream.on('finish', resolve)
    stream.on('error', reject)
  })
}

async function writeScrutinyGistArtifacts({ prefix, stamp, model }) {
  const docxFile = `${prefix}_${stamp}.docx`
  const pdfFile = `${prefix}_${stamp}.pdf`
  const docxPath = path.join(uploadsDir, docxFile)
  const pdfPath = path.join(uploadsDir, pdfFile)

  await writeScrutinyGistDocx(docxPath, model)
  await writeScrutinyGistPdf(pdfPath, model)

  return { docxFile, pdfFile, docxPath, pdfPath }
}

async function writeReportArtifacts({ prefix, stamp, title, text }) {
  const docxFile = `${prefix}_${stamp}.docx`
  const pdfFile = `${prefix}_${stamp}.pdf`
  const docxPath = path.join(uploadsDir, docxFile)
  const pdfPath = path.join(uploadsDir, pdfFile)

  await writeDocxReport(docxPath, text)
  await writePdfReport(pdfPath, title, text)

  return { docxFile, pdfFile, docxPath, pdfPath }
}

function toPrettyLines(value) {
  if (value === null || value === undefined) return ['-']
  if (typeof value === 'string') {
    return value.trim() ? value.split(/\r?\n/) : ['-']
  }
  if (Array.isArray(value) || typeof value === 'object') {
    return JSON.stringify(value, null, 2).split(/\r?\n/)
  }
  return [String(value)]
}

function loadScrutinyGistSourceData(appId) {
  const appRow = db.prepare(`
    SELECT a.*, s.name as sector_name, u.full_name as owner_name
    FROM applications a
    JOIN sectors s ON s.id = a.sector_id
    JOIN users u ON u.id = a.owner_user_id
    WHERE a.id = ?
  `).get(appId)
  if (!appRow) throw new Error('Application not found.')

  return {
    appRow,
    docs: parseDocumentsWithVerification(appRow.id),
    payment: parsePaymentForReview(appRow.id),
    review: db.prepare('SELECT review_data, payment_verification, review_notes, reviewed_by, reviewed_at FROM scrutiny_reviews WHERE application_id = ?').get(appRow.id),
  }
}

function readLegacyGistText(gistRow) {
  if (!gistRow) return ''
  if (gistRow.gist_content) return gistRow.gist_content
  try {
    const docxPath = path.join(uploadsDir, gistRow.docx_path)
    if (fs.existsSync(docxPath)) return fs.readFileSync(docxPath, 'utf8')
  } catch (_) {}
  return ''
}

const ensureDefaultPaymentDestination = (applicationRow, paymentRow) => {
  if (!applicationRow || !paymentRow) return paymentRow

  const nextAmount = Number(paymentRow.amount) || paymentByCategory[applicationRow.category] || 5000
  const nextNote = paymentRow.upi_reference_note || `Application-${applicationRow.application_id}`
  const nextQrPayload = buildPaymentQrPayload(DEFAULT_PAYEE_UPI_ID, nextAmount, nextNote)
  const needsUpdate =
    paymentRow.payee_upi_id !== DEFAULT_PAYEE_UPI_ID ||
    paymentRow.upi_reference_note !== nextNote ||
    paymentRow.qr_payload !== nextQrPayload

  if (needsUpdate) {
    db.prepare('UPDATE application_payments SET amount = ?, qr_payload = ?, payee_upi_id = ?, upi_reference_note = ?, updated_at = datetime(\'now\') WHERE id = ?')
      .run(nextAmount, nextQrPayload, DEFAULT_PAYEE_UPI_ID, nextNote, paymentRow.id)
  }

  return {
    ...paymentRow,
    amount: nextAmount,
    qr_payload: nextQrPayload,
    payee_upi_id: DEFAULT_PAYEE_UPI_ID,
    upi_reference_note: nextNote,
  }
}

const toClientUser = (row) => ({
  id: row.id,
  fullName: row.full_name,
  loginId: row.login_id,
  email: row.email,
  mobile: row.mobile,
  organization: row.organization,
  role: row.role,
  state: row.state,
  assignedRole: row.assigned_role ?? 'proponent',
  accountStatus: row.account_status ?? 'active',
})

// ── Admin Middleware ───────────────────────────────────────────────────────────
const adminAuth = (req, res, next) => {
  const header = req.headers['authorization']
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ message: 'Admin authentication required.' })
  try {
    const payload = jwt.verify(header.slice(7), ADMIN_SECRET)
    if (!payload.isAdmin) throw new Error('Not an admin token')
    req.admin = payload
    next()
  } catch {
    res.status(401).json({ message: 'Invalid or expired admin session. Please log in again.' })
  }
}

const auth = (req, res, next) => {
  const header = req.headers['authorization']
  const headerToken = header?.startsWith('Bearer ') ? header.slice(7) : null
  const queryToken = typeof req.query.token === 'string' ? req.query.token : null
  const token = headerToken || queryToken
  if (!token) return res.status(401).json({ message: 'Authentication required.' })
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(payload.sub)
    if (!user) return res.status(401).json({ message: 'User not found.' })
    if ((user.account_status ?? 'active') !== 'active') {
      return res.status(403).json({ message: 'Your account is suspended. Contact administrator.' })
    }
    req.user = user
    next()
  } catch {
    res.status(401).json({ message: 'Invalid or expired session. Please log in again.' })
  }
}

function roleRedirect(assignedRole) {
  switch ((assignedRole || 'proponent').toLowerCase()) {
    case 'scrutiny': return '/scrutiny'
    case 'mom': return '/mom'
    default: return '/proponent'
  }
}

function inferAssignedRole(roleLabel) {
  const role = String(roleLabel || '').toLowerCase()
  if (role.includes('scrutiny')) return 'scrutiny'
  if (role.includes('mom') || role.includes('minutes of meeting')) return 'mom'
  return 'proponent'
}

const requireAssignedRole = (roles) => (req, res, next) => {
  const assigned = (req.user.assigned_role ?? 'proponent').toLowerCase()
  if (!roles.includes(assigned)) {
    return res.status(403).json({ message: 'You are not authorized for this module.' })
  }
  next()
}

const scrutinyAuth = [auth, requireAssignedRole(['scrutiny'])]
const momAuth = [auth, requireAssignedRole(['mom'])]

// ── CORS for admin panel ──────────────────────────────────────────────────────
app.use((_req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization')
  if (_req.method === 'OPTIONS') return res.sendStatus(204)
  next()
})

app.use('/uploads', express.static(uploadsDir))
app.use('/api/mom', ...momAuth, createMomRoutes({ db, uploadsDir, blockchainAudit }))

// ── Health ────────────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'auth-api' }))

// ── Public Auth ───────────────────────────────────────────────────────────────
app.post('/api/auth/register', (req, res) => {
  const { fullName, loginId, email, mobile = '', organization = '', role = '', state = '', password } = req.body || {}
  if (!fullName?.trim()) return res.status(400).json({ message: 'Full Name is required.' })
  if (!loginId?.trim()) return res.status(400).json({ message: 'Login ID is required.' })
  if (!email?.trim() || !email.includes('@')) return res.status(400).json({ message: 'A valid email is required.' })
  if (!password || password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters.' })

  if (db.prepare('SELECT id FROM users WHERE lower(login_id) = lower(?) OR lower(email) = lower(?)').get(loginId.trim(), email.trim()))
    return res.status(409).json({ message: 'Login ID or email already exists.' })

  const passwordHash = bcrypt.hashSync(password, 10)
  const assignedRole = inferAssignedRole(role)
  const result = db.prepare(`
    INSERT INTO users (full_name, login_id, email, mobile, organization, role, state, password_hash, assigned_role)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(fullName.trim(), loginId.trim(), email.trim().toLowerCase(), String(mobile).trim(),
         String(organization).trim(), String(role).trim(), String(state).trim(), passwordHash, assignedRole)

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid)
  return res.status(201).json({ token: createToken(user), user: toClientUser(user), redirectTo: roleRedirect(user.assigned_role) })
})

app.post('/api/auth/login', (req, res) => {
  const { loginId, password } = req.body || {}
  if (!loginId?.trim()) return res.status(400).json({ message: 'Login ID is required.' })
  if (!password) return res.status(400).json({ message: 'Password is required.' })

  const user = db.prepare('SELECT * FROM users WHERE lower(login_id) = lower(?) OR lower(email) = lower(?)').get(loginId.trim(), loginId.trim())
  if (!user || !bcrypt.compareSync(password, user.password_hash))
    return res.status(401).json({ message: 'Invalid login ID or password.' })

  if ((user.account_status ?? 'active') !== 'active')
    return res.status(403).json({ message: 'Your account is suspended. Contact administrator.' })

  return res.json({ token: createToken(user), user: toClientUser(user), redirectTo: roleRedirect(user.assigned_role) })
})

// ── PP Profile ───────────────────────────────────────────────────────────────
app.get('/api/pp/profile', auth, (req, res) => {
  res.json(toClientUser(req.user))
})

app.patch('/api/pp/profile', auth, (req, res) => {
  const { fullName, email, mobile = '', organization = '' } = req.body || {}
  if (!fullName?.trim()) return res.status(400).json({ message: 'Full name is required.' })
  if (!email?.trim()) return res.status(400).json({ message: 'Email is required.' })
  const conflict = db.prepare('SELECT id FROM users WHERE email = ? AND id != ?').get(email.trim().toLowerCase(), req.user.id)
  if (conflict) return res.status(409).json({ message: 'Email already in use.' })

  db.prepare('UPDATE users SET full_name = ?, email = ?, mobile = ?, organization = ? WHERE id = ?')
    .run(fullName.trim(), email.trim().toLowerCase(), String(mobile).trim(), String(organization).trim(), req.user.id)
  const updated = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id)
  res.json(toClientUser(updated))
})

app.patch('/api/pp/profile/password', auth, (req, res) => {
  const { currentPassword, newPassword } = req.body || {}
  if (!currentPassword || !newPassword) return res.status(400).json({ message: 'Both current and new password are required.' })
  if (newPassword.length < 8) return res.status(400).json({ message: 'New password must be at least 8 characters.' })
  if (!bcrypt.compareSync(currentPassword, req.user.password_hash)) {
    return res.status(401).json({ message: 'Current password is incorrect.' })
  }
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(bcrypt.hashSync(newPassword, 10), req.user.id)
  res.json({ ok: true })
})

// ── PP Dynamic Config Bootstrap ──────────────────────────────────────────────
app.get('/api/pp/config', auth, (_req, res) => {
  const sectors = db.prepare('SELECT * FROM sectors ORDER BY name ASC').all()
  const params = db.prepare('SELECT * FROM sector_params ORDER BY sort_order ASC, id ASC').all()
  const checklist = db.prepare('SELECT * FROM sector_doc_checklists ORDER BY sort_order ASC, id ASC').all()
  const templates = db.prepare('SELECT id, name, category, description, original_name, uploaded_at FROM templates ORDER BY uploaded_at DESC').all()
  res.json({
    categories: ['A', 'B1', 'B2'],
    sectors: sectors.map((s) => ({
      ...s,
      params: params.filter((p) => p.sector_id === s.id),
      checklist: checklist.filter((c) => c.sector_id === s.id),
    })),
    templates,
  })
})

app.get('/api/pp/templates/:id/download', auth, (req, res) => {
  const tpl = db.prepare('SELECT * FROM templates WHERE id = ?').get(req.params.id)
  if (!tpl) return res.status(404).json({ message: 'Template not found.' })
  const filePath = path.join(templatesDir, tpl.filename)
  if (!fs.existsSync(filePath)) return res.status(404).json({ message: 'Template file missing.' })
  res.download(filePath, tpl.original_name)
})

// ── PP Applications ──────────────────────────────────────────────────────────
app.get('/api/pp/applications', auth, (req, res) => {
  const rows = db.prepare(`
    SELECT a.*, s.name as sector_name
    FROM applications a
    JOIN sectors s ON s.id = a.sector_id
    WHERE a.owner_user_id = ?
    ORDER BY a.updated_at DESC
  `).all(req.user.id)
  res.json(rows)
})

app.get('/api/pp/applications/:id', auth, (req, res) => {
  const row = db.prepare(`
    SELECT a.*, s.name as sector_name
    FROM applications a
    JOIN sectors s ON s.id = a.sector_id
    WHERE a.id = ? AND a.owner_user_id = ?
  `).get(req.params.id, req.user.id)
  if (!row) return res.status(404).json({ message: 'Application not found.' })
  const docs = db.prepare('SELECT * FROM application_documents WHERE application_id = ? ORDER BY uploaded_at DESC').all(row.id)
  const pay = ensureDefaultPaymentDestination(
    row,
    db.prepare('SELECT * FROM application_payments WHERE application_id = ? ORDER BY id DESC LIMIT 1').get(row.id) ?? null,
  )
  const history = db.prepare('SELECT * FROM application_status_history WHERE application_id = ? ORDER BY created_at ASC').all(row.id)
  if (!row.ai_compliance_report && ['Submitted', 'Under Scrutiny', 'EDS', 'Referred', 'Finalized'].includes(row.status)) {
    queueAiCompliancePrecheck(row.id, 'pp_detail_lazy_load')
  }
  res.json({ ...row, documents: docs, payment: pay, history })
})

app.post('/api/pp/applications', auth, (req, res) => {
  const {
    category, sectorId, saveAsDraft = true,
    projectName, organization, projectDescription = '', estimatedCost = 0, projectType = '',
    state = '', district = '', coordinates = '', landArea = 0,
    environmentalData = {}, sectorParamsData = {}
  } = req.body || {}

  if (!['A', 'B1', 'B2'].includes(category)) return res.status(400).json({ message: 'Invalid category.' })
  const sector = db.prepare('SELECT * FROM sectors WHERE id = ?').get(sectorId)
  if (!sector) return res.status(400).json({ message: 'Invalid sector.' })
  if (!projectName?.trim()) return res.status(400).json({ message: 'Project name is required.' })
  if (!organization?.trim()) return res.status(400).json({ message: 'Organization is required.' })

  const status = saveAsDraft ? 'Draft' : 'Submitted'
  const appId = createApplicationId()
  const result = db.prepare(`
    INSERT INTO applications (
      application_id, owner_user_id, category, sector_id, status,
      project_name, organization, project_description, estimated_cost, project_type,
      state, district, coordinates, land_area, environmental_data, sector_params_data,
      payment_status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
  `).run(
    appId, req.user.id, category, sectorId, status,
    projectName.trim(), organization.trim(), String(projectDescription).trim(), Number(estimatedCost) || 0, String(projectType).trim(),
    String(state).trim(), String(district).trim(), String(coordinates).trim(), Number(landArea) || 0,
    JSON.stringify(environmentalData ?? {}), JSON.stringify(sectorParamsData ?? {}),
    'Not Initiated'
  )

  db.prepare('INSERT INTO application_status_history (application_id, status, comment, created_by) VALUES (?, ?, ?, ?)')
    .run(result.lastInsertRowid, status, status === 'Draft' ? 'Draft saved by PP' : 'Application submitted by PP', req.user.login_id)

  if (status === 'Submitted') {
    queueAiCompliancePrecheck(result.lastInsertRowid, 'pp_create_submitted')
    queueSubmissionAudit(result.lastInsertRowid, req.user, 'Application Submitted')
    queueWorkflowAudit(result.lastInsertRowid, 'Application Submitted', req.user)
    createPpNotification({
      userId: req.user.id,
      applicationId: result.lastInsertRowid,
      type: 'success',
      title: 'Application Submitted',
      message: `Your application ${appId} has been submitted successfully and moved to scrutiny queue.`,
    })
  }

  const created = db.prepare('SELECT * FROM applications WHERE id = ?').get(result.lastInsertRowid)
  res.status(201).json(created)
})

app.patch('/api/pp/applications/:id', auth, (req, res) => {
  const row = db.prepare('SELECT * FROM applications WHERE id = ? AND owner_user_id = ?').get(req.params.id, req.user.id)
  if (!row) return res.status(404).json({ message: 'Application not found.' })
  const {
    status,
    projectName = row.project_name,
    organization = row.organization,
    projectDescription = row.project_description,
    estimatedCost = row.estimated_cost,
    projectType = row.project_type,
    state = row.state,
    district = row.district,
    coordinates = row.coordinates,
    landArea = row.land_area,
    environmentalData,
    sectorParamsData,
  } = req.body || {}

  let nextStatus = status ?? row.status
  const allowedStatuses = ['Draft', 'Submitted', 'Under Scrutiny']
  if (!allowedStatuses.includes(nextStatus)) {
    return res.status(400).json({ message: 'Invalid status update requested by PP.' })
  }
  if (row.status !== 'EDS' && nextStatus === 'Under Scrutiny') {
    return res.status(400).json({ message: 'Only EDS applications can be resubmitted to Under Scrutiny.' })
  }
  if (row.status === 'Referred' || row.status === 'Finalized') {
    return res.status(400).json({ message: 'Application is locked and cannot be edited by PP.' })
  }

  const clearingEds = row.status === 'EDS' && nextStatus === 'Under Scrutiny'
  db.prepare(`
    UPDATE applications SET
      status = ?, project_name = ?, organization = ?, project_description = ?, estimated_cost = ?, project_type = ?,
      state = ?, district = ?, coordinates = ?, land_area = ?,
      environmental_data = ?, sector_params_data = ?, eds_comments = ?,
      updated_at = datetime('now')
    WHERE id = ?
  `).run(
    nextStatus,
    String(projectName).trim(), String(organization).trim(), String(projectDescription).trim(), Number(estimatedCost) || 0, String(projectType).trim(),
    String(state).trim(), String(district).trim(), String(coordinates).trim(), Number(landArea) || 0,
    JSON.stringify(environmentalData ?? safeJson(row.environmental_data, {})),
    JSON.stringify(sectorParamsData ?? safeJson(row.sector_params_data, {})),
    clearingEds ? '' : row.eds_comments,
    row.id
  )

  if (status && status !== row.status) {
    const statusComment = clearingEds
      ? 'PP resubmitted corrections after EDS. Back to Under Scrutiny.'
      : `Status updated to ${status} by PP`
    db.prepare('INSERT INTO application_status_history (application_id, status, comment, created_by) VALUES (?, ?, ?, ?)')
      .run(row.id, status, statusComment, req.user.login_id)

    if (status === 'Submitted') {
      queueSubmissionAudit(row.id, req.user, 'Application Submitted')
      queueWorkflowAudit(row.id, 'Application Submitted', req.user)
    } else {
      queueWorkflowAudit(row.id, `Status changed to ${status}`, req.user)
    }
  } else if (clearingEds && nextStatus === 'Under Scrutiny') {
    queueSubmissionAudit(row.id, req.user, 'Application Resubmitted')
    queueWorkflowAudit(row.id, 'Application Resubmitted to Under Scrutiny', req.user)
  }

  if (nextStatus === 'Submitted') {
    queueAiCompliancePrecheck(row.id, 'pp_update_submitted')
  }

  res.json(db.prepare('SELECT * FROM applications WHERE id = ?').get(row.id))
})

app.post('/api/pp/applications/:id/documents', auth, appDocUpload.single('file'), (req, res) => {
  const row = db.prepare('SELECT * FROM applications WHERE id = ? AND owner_user_id = ?').get(req.params.id, req.user.id)
  if (!row) return res.status(404).json({ message: 'Application not found.' })
  if (!req.file) return res.status(400).json({ message: 'File is required.' })
  const docName = String(req.body.docName || req.file.originalname).trim()
  if (!docName) return res.status(400).json({ message: 'docName is required.' })

  const result = db.prepare(`
    INSERT INTO application_documents (application_id, doc_name, file_path, original_name, mime_type, size_bytes, verification_status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(row.id, docName, req.file.filename, req.file.originalname, req.file.mimetype, req.file.size, 'Uploaded')

  db.prepare('UPDATE applications SET updated_at = datetime(\'now\') WHERE id = ?').run(row.id)

  if (row.status === 'Submitted') {
    queueAiCompliancePrecheck(row.id, 'document_upload')
  }

  res.status(201).json(db.prepare('SELECT * FROM application_documents WHERE id = ?').get(result.lastInsertRowid))
})

app.get('/api/pp/applications/:id/documents', auth, (req, res) => {
  const row = db.prepare('SELECT * FROM applications WHERE id = ? AND owner_user_id = ?').get(req.params.id, req.user.id)
  if (!row) return res.status(404).json({ message: 'Application not found.' })
  res.json(db.prepare('SELECT * FROM application_documents WHERE application_id = ? ORDER BY uploaded_at DESC').all(row.id))
})

app.get('/api/pp/documents/:docId/download', auth, (req, res) => {
  const doc = db.prepare(`
    SELECT d.*, a.owner_user_id
    FROM application_documents d
    JOIN applications a ON a.id = d.application_id
    WHERE d.id = ?
  `).get(req.params.docId)
  if (!doc || doc.owner_user_id !== req.user.id) return res.status(404).json({ message: 'Document not found.' })
  const filePath = path.join(uploadsDir, doc.file_path)
  if (!fs.existsSync(filePath)) return res.status(404).json({ message: 'Document file missing.' })
  res.download(filePath, doc.original_name)
})

app.post('/api/pp/applications/:id/payment/initiate', auth, (req, res) => {
  const row = db.prepare('SELECT * FROM applications WHERE id = ? AND owner_user_id = ?').get(req.params.id, req.user.id)
  if (!row) return res.status(404).json({ message: 'Application not found.' })
  const amount = paymentByCategory[row.category] ?? 5000
  const payeeUpiId = DEFAULT_PAYEE_UPI_ID
  const upiReferenceNote = `Application-${row.application_id}`
  const qrPayload = buildPaymentQrPayload(payeeUpiId, amount, upiReferenceNote)

  const existing = db.prepare('SELECT id FROM application_payments WHERE application_id = ? ORDER BY id DESC LIMIT 1').get(row.id)
  if (existing) {
    db.prepare('UPDATE application_payments SET amount = ?, qr_payload = ?, payee_upi_id = ?, upi_reference_note = ?, status = ?, upi_ref = ?, verified_by = ?, verified_at = NULL, updated_at = datetime(\'now\') WHERE id = ?')
      .run(amount, qrPayload, payeeUpiId, upiReferenceNote, 'Pending', '', '', existing.id)
  } else {
    db.prepare('INSERT INTO application_payments (application_id, amount, qr_payload, upi_ref, payee_upi_id, upi_reference_note, status, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, datetime(\'now\'))')
      .run(row.id, amount, qrPayload, '', payeeUpiId, upiReferenceNote, 'Pending')
  }

  db.prepare('UPDATE applications SET payment_status = ?, updated_at = datetime(\'now\') WHERE id = ?').run('Pending', row.id)
  res.status(201).json({ amount, qrPayload, status: 'Pending', upiId: payeeUpiId, upiReferenceNote })
})

app.patch('/api/pp/applications/:id/payment/mark-paid', auth, (req, res) => {
  const row = db.prepare('SELECT * FROM applications WHERE id = ? AND owner_user_id = ?').get(req.params.id, req.user.id)
  if (!row) return res.status(404).json({ message: 'Application not found.' })
  const { upiRef = '' } = req.body || {}
  const payment = db.prepare('SELECT * FROM application_payments WHERE application_id = ? ORDER BY id DESC LIMIT 1').get(row.id)
  if (!payment) return res.status(400).json({ message: 'No initiated payment found. Please generate payment first.' })

  db.prepare('UPDATE application_payments SET status = ?, upi_ref = ?, updated_at = datetime(\'now\') WHERE id = ?')
    .run('Pending Verification', String(upiRef).trim(), payment.id)

  const nextAppStatus = row.status === 'Draft' ? 'Submitted' : row.status
  db.prepare('UPDATE applications SET payment_status = ?, status = ?, updated_at = datetime(\'now\') WHERE id = ?')
    .run('Pending Verification', nextAppStatus, row.id)

  if (row.status === 'Draft') {
    db.prepare('INSERT INTO application_status_history (application_id, status, comment, created_by) VALUES (?, ?, ?, ?)')
      .run(row.id, 'Submitted', 'Application auto-submitted after payment by PP.', req.user.login_id)
    queueSubmissionAudit(row.id, req.user, 'Application Submitted')
    queueWorkflowAudit(row.id, 'Application Submitted', req.user)
  }

  db.prepare('INSERT INTO application_status_history (application_id, status, comment, created_by) VALUES (?, ?, ?, ?)')
    .run(row.id, nextAppStatus, 'Payment marked paid by PP. Pending scrutiny verification.', req.user.login_id)
  queueWorkflowAudit(row.id, 'Payment marked paid', req.user)
  createPpNotification({
    userId: req.user.id,
    applicationId: row.id,
    type: 'info',
    title: 'Payment Submitted',
    message: `Payment reference ${String(upiRef || '').trim() || '-'} has been submitted. Verification is pending scrutiny review.`,
  })

  if (nextAppStatus === 'Submitted') {
    queueAiCompliancePrecheck(row.id, 'payment_mark_paid_submitted')
  }

  res.json({ ok: true, paymentStatus: 'Pending Verification' })
})

app.get('/api/pp/applications/:id/tracking', auth, (req, res) => {
  const row = db.prepare('SELECT * FROM applications WHERE id = ? AND owner_user_id = ?').get(req.params.id, req.user.id)
  if (!row) return res.status(404).json({ message: 'Application not found.' })
  const history = db.prepare('SELECT id, status, comment, created_by, created_at FROM application_status_history WHERE application_id = ? ORDER BY created_at ASC').all(row.id)
  if (!row.ai_compliance_report && ['Submitted', 'Under Scrutiny', 'EDS', 'Referred', 'Finalized'].includes(row.status)) {
    queueAiCompliancePrecheck(row.id, 'pp_tracking_lazy_load')
  }
  res.json({
    id: row.id,
    applicationId: row.application_id,
    status: row.status,
    edsComments: row.eds_comments,
    edsSummary: row.eds_summary || '',
    paymentStatus: row.payment_status,
    history,
  })
})

app.get('/api/pp/payments/recent', auth, (req, res) => {
  const limit = Math.min(Math.max(Number(req.query.limit || 10), 1), 50)
  const rows = db.prepare(`
    SELECT p.id, p.application_id, p.amount, p.upi_ref, p.status, p.verified_by, p.verified_at, p.updated_at,
           a.application_id as application_ref, a.project_name, a.category, a.status as application_status,
           s.name as sector_name
    FROM application_payments p
    JOIN applications a ON a.id = p.application_id
    JOIN sectors s ON s.id = a.sector_id
    WHERE a.owner_user_id = ?
      AND p.status IN ('Pending Verification', 'Verified', 'Invalid')
    ORDER BY p.updated_at DESC, p.id DESC
    LIMIT ?
  `).all(req.user.id, limit)
  res.json(rows)
})

app.get('/api/pp/notifications', auth, (req, res) => {
  const rows = db.prepare(`
    SELECT n.id, n.application_id, n.type, n.title, n.message, n.is_read, n.created_at,
           a.application_id as application_ref
    FROM pp_notifications n
    LEFT JOIN applications a ON a.id = n.application_id
    WHERE n.user_id = ?
    ORDER BY n.created_at DESC, n.id DESC
    LIMIT 200
  `).all(req.user.id)
  res.json(rows)
})

app.patch('/api/pp/notifications/:id/read', auth, (req, res) => {
  const notificationId = Number(req.params.id)
  const { read = true } = req.body || {}
  const existing = db.prepare('SELECT id FROM pp_notifications WHERE id = ? AND user_id = ?').get(notificationId, req.user.id)
  if (!existing) return res.status(404).json({ message: 'Notification not found.' })
  db.prepare('UPDATE pp_notifications SET is_read = ? WHERE id = ? AND user_id = ?')
    .run(read ? 1 : 0, notificationId, req.user.id)
  res.json({ ok: true })
})

app.patch('/api/pp/notifications/read-all', auth, (req, res) => {
  db.prepare('UPDATE pp_notifications SET is_read = 1 WHERE user_id = ?').run(req.user.id)
  res.json({ ok: true })
})

app.delete('/api/pp/notifications/:id', auth, (req, res) => {
  const notificationId = Number(req.params.id)
  const result = db.prepare('DELETE FROM pp_notifications WHERE id = ? AND user_id = ?').run(notificationId, req.user.id)
  if (!result.changes) return res.status(404).json({ message: 'Notification not found.' })
  res.json({ ok: true })
})

app.delete('/api/pp/notifications', auth, (req, res) => {
  db.prepare('DELETE FROM pp_notifications WHERE user_id = ?').run(req.user.id)
  res.json({ ok: true })
})

app.get('/api/public/track', (req, res) => {
  const reference = String(req.query.ref || '').trim()
  if (!reference) return res.status(400).json({ message: 'Application reference is required.' })

  const row = db.prepare(`
    SELECT a.id, a.application_id, a.status, a.payment_status, a.project_name, a.category,
           a.state, a.district, a.eds_comments, a.eds_summary, a.updated_at,
           s.name as sector_name
    FROM applications a
    JOIN sectors s ON s.id = a.sector_id
    WHERE lower(a.application_id) = lower(?)
  `).get(reference)

  if (!row) return res.status(404).json({ message: 'No application found for the provided reference.' })

  const history = db.prepare(
    'SELECT status, comment, created_at FROM application_status_history WHERE application_id = ? ORDER BY created_at ASC'
  ).all(row.id)

  const stageSequence = ['Draft', 'Submitted', 'Under Scrutiny', 'EDS', 'Referred', 'Finalized']
  const currentStageIndex = Math.max(stageSequence.indexOf(String(row.status || '')), 0)

  res.json({
    applicationId: row.application_id,
    projectName: row.project_name,
    category: row.category,
    sectorName: row.sector_name,
    status: row.status,
    paymentStatus: row.payment_status,
    location: [row.district, row.state].filter(Boolean).join(', '),
    updatedAt: row.updated_at,
    edsComments: row.eds_comments || '',
    edsSummary: row.eds_summary || '',
    currentStageIndex,
    stageSequence,
    history,
  })
})

function safeJson(raw, fallback) {
  try { return JSON.parse(raw) } catch { return fallback }
}

const parseDocumentsWithVerification = (appId) => db.prepare(
  'SELECT id, doc_name, original_name, verification_status, deficiency_comment, uploaded_at FROM application_documents WHERE application_id = ? ORDER BY uploaded_at DESC'
).all(appId)

const parsePaymentForReview = (appId) => {
  const applicationRow = db.prepare('SELECT id, application_id, category FROM applications WHERE id = ?').get(appId)
  const paymentRow = db.prepare(
    'SELECT id, amount, qr_payload, upi_ref, payee_upi_id, upi_reference_note, status, verified_by, verified_at, updated_at FROM application_payments WHERE application_id = ? ORDER BY id DESC LIMIT 1'
  ).get(appId) ?? null
  return ensureDefaultPaymentDestination(applicationRow, paymentRow)
}

const normalizeDocName = (value) => String(value || '').trim().toLowerCase().replace(/\s+/g, ' ')

const getStringValue = (value) => String(value ?? '').trim()

const buildScrutinyDeficiencies = (appRow, docs, payment) => {
  const deficiencies = []
  const flaggedDocumentIds = []
  const uploadedByName = new Map()

  for (const doc of docs) {
    const key = normalizeDocName(doc.doc_name)
    if (!uploadedByName.has(key)) uploadedByName.set(key, [])
    uploadedByName.get(key).push(doc)
  }

  const requiredDocs = db.prepare(
    'SELECT doc_name FROM sector_doc_checklists WHERE sector_id = ? AND category = ? AND required = 1 ORDER BY sort_order ASC, id ASC'
  ).all(appRow.sector_id, appRow.category)

  for (const reqDoc of requiredDocs) {
    const expectedName = String(reqDoc.doc_name)
    const matched = uploadedByName.get(normalizeDocName(expectedName)) || []

    if (!matched.length) {
      deficiencies.push({
        type: 'required_document',
        field: expectedName,
        message: `Required document \"${expectedName}\" is missing.`,
      })
      continue
    }

    const hasInvalid = matched.some((d) => ['Flagged', 'Missing'].includes(String(d.verification_status || '')))
    if (hasInvalid) {
      deficiencies.push({
        type: 'required_document',
        field: expectedName,
        message: `Required document \"${expectedName}\" is flagged or marked missing.`,
      })
      matched.forEach((d) => {
        if (['Flagged', 'Missing'].includes(String(d.verification_status || ''))) flaggedDocumentIds.push(d.id)
      })
    }
  }

  const mandatoryFields = [
    ['project_name', appRow.project_name],
    ['organization', appRow.organization],
    ['project_description', appRow.project_description],
    ['project_type', appRow.project_type],
    ['state', appRow.state],
    ['district', appRow.district],
    ['coordinates', appRow.coordinates],
  ]

  for (const [field, value] of mandatoryFields) {
    if (!getStringValue(value)) {
      deficiencies.push({
        type: 'mandatory_field',
        field,
        message: `Mandatory field \"${field}\" is empty.`,
      })
    }
  }

  if (!(Number(appRow.estimated_cost) > 0)) {
    deficiencies.push({
      type: 'data_correctness',
      field: 'estimated_cost',
      message: 'Estimated cost must be greater than zero.',
    })
  }

  if (!(Number(appRow.land_area) > 0)) {
    deficiencies.push({
      type: 'data_correctness',
      field: 'land_area',
      message: 'Land area must be greater than zero.',
    })
  }

  const env = safeJson(appRow.environmental_data, {})
  const requiredEnvKeys = ['impact', 'resources', 'wastePlan']
  for (const key of requiredEnvKeys) {
    if (!getStringValue(env?.[key])) {
      deficiencies.push({
        type: 'data_completeness',
        field: `environmental_data.${key}`,
        message: `Environmental detail \"${key}\" is missing.`,
      })
    }
  }

  const sectorParams = safeJson(appRow.sector_params_data, {})
  const requiredParams = db.prepare(
    'SELECT param_label FROM sector_params WHERE sector_id = ? AND required = 1 ORDER BY sort_order ASC, id ASC'
  ).all(appRow.sector_id)
  for (const param of requiredParams) {
    const key = String(param.param_label)
    if (!getStringValue(sectorParams?.[key])) {
      deficiencies.push({
        type: 'data_completeness',
        field: `sector_params.${key}`,
        message: `Required sector parameter \"${key}\" is missing.`,
      })
    }
  }

  if (!payment) {
    deficiencies.push({
      type: 'data_completeness',
      field: 'payment',
      message: 'Payment record is not available for scrutiny verification.',
    })
  } else if (!['Pending Verification', 'Verified'].includes(String(payment.status || ''))) {
    deficiencies.push({
      type: 'data_correctness',
      field: 'payment.status',
      message: 'Payment status must be Pending Verification or Verified before successful scrutiny verification.',
    })
  }

  return { deficiencies, flaggedDocumentIds: Array.from(new Set(flaggedDocumentIds)) }
}

const createEdsMessageFromDeficiencies = (deficiencies) => {
  const header = 'EDS generated by scrutiny verification due to following deficiencies:'
  const items = deficiencies.map((d, index) => `${index + 1}. [${d.type}] ${d.field} - ${d.message}`)
  return [header, ...items].join('\n')
}

const splitCommentLines = (text) => String(text || '')
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter(Boolean)

const listMissingChecklistDocs = (appRow, docs) => {
  const uploadedDocNames = new Set(docs.map((doc) => normalizeDocName(doc.doc_name)))
  const requiredDocs = db.prepare(
    'SELECT doc_name FROM sector_doc_checklists WHERE sector_id = ? AND category = ? AND required = 1 ORDER BY sort_order ASC, id ASC'
  ).all(appRow.sector_id, appRow.category)

  return requiredDocs
    .map((row) => String(row.doc_name || '').trim())
    .filter(Boolean)
    .filter((docName) => !uploadedDocNames.has(normalizeDocName(docName)))
}

const createEdsSummary = ({ appRow, docs, deficiencies, deficiencyComments = '', remarks = '', selectedFlaggedDocumentIds = [] }) => {
  const bullets = []

  for (const deficiency of deficiencies) {
    bullets.push(deficiency.message)
  }

  const selectedDocNames = docs
    .filter((doc) => selectedFlaggedDocumentIds.includes(doc.id))
    .map((doc) => String(doc.doc_name || '').trim())
    .filter(Boolean)
  for (const docName of selectedDocNames) {
    bullets.push(`Document requires correction: ${docName}.`)
  }

  const missingDocs = listMissingChecklistDocs(appRow, docs)
  for (const docName of missingDocs) {
    bullets.push(`Required checklist document is missing: ${docName}.`)
  }

  const reviewerCommentLines = [
    ...splitCommentLines(deficiencyComments),
    ...splitCommentLines(remarks),
  ]
  for (const line of reviewerCommentLines) {
    bullets.push(`Reviewer comment: ${line}`)
  }

  const uniqueBullets = Array.from(new Set(
    bullets
      .map((item) => String(item || '').trim())
      .filter(Boolean)
  ))

  if (!uniqueBullets.length) {
    return ''
  }

  return ['EDS Summary of Required Changes:', ...uniqueBullets.map((item) => `- ${item}`)].join('\n')
}

const upsertScrutinyReview = ({ appId, paymentVerification, reviewData, reviewNotes, reviewedBy, locked = null }) => {
  const existing = db.prepare('SELECT id, payment_verification, locked FROM scrutiny_reviews WHERE application_id = ?').get(appId)
  const resolvedPaymentVerification = paymentVerification ?? existing?.payment_verification ?? 'Pending'
  const resolvedLocked = locked ?? existing?.locked ?? 0

  if (existing) {
    db.prepare(`
      UPDATE scrutiny_reviews
      SET review_data = ?, payment_verification = ?, review_notes = ?, reviewed_by = ?, reviewed_at = datetime('now'), locked = ?
      WHERE application_id = ?
    `).run(JSON.stringify(reviewData ?? {}), resolvedPaymentVerification, String(reviewNotes || ''), reviewedBy, resolvedLocked, appId)
  } else {
    db.prepare(`
      INSERT INTO scrutiny_reviews (application_id, review_data, payment_verification, review_notes, reviewed_by, reviewed_at, locked)
      VALUES (?, ?, ?, ?, ?, datetime('now'), ?)
    `).run(appId, JSON.stringify(reviewData ?? {}), resolvedPaymentVerification, String(reviewNotes || ''), reviewedBy, resolvedLocked)
  }
}

async function generateAndStoreScrutinyGist(appId, generatedBy) {
  const { appRow, docs, payment, review } = loadScrutinyGistSourceData(appId)
  const generatedAt = new Date().toISOString()
  const fallbackModel = buildFallbackScrutinyGistDocumentModel({
    appRow,
    generatedBy,
    generatedAt,
  })
  const fallbackGistText = buildScrutinyGistText(fallbackModel)

  let gistText = fallbackGistText
  let artifacts
  try {
    const documentModel = buildScrutinyGistDocumentModel({
      appRow,
      docs,
      payment,
      review,
      generatedBy,
      generatedAt,
    })
    gistText = buildScrutinyGistText(documentModel)

    artifacts = await writeScrutinyGistArtifacts({
      prefix: 'gist',
      stamp: `${Date.now()}_${appRow.id}`,
      model: documentModel,
    })
  } catch (primaryError) {
    console.error('[PARIVESH] Primary scrutiny gist generation failed. Retrying with fallback gist.', primaryError)
    gistText = fallbackGistText
    artifacts = await writeScrutinyGistArtifacts({
      prefix: 'gist_fallback',
      stamp: `${Date.now()}_${appRow.id}`,
      model: fallbackModel,
    })
  }

  const existing = db.prepare('SELECT * FROM scrutiny_gists WHERE application_id = ?').get(appRow.id)
  if (existing) {
    try {
      const oldDocx = path.join(uploadsDir, existing.docx_path)
      const oldPdf = path.join(uploadsDir, existing.pdf_path)
      if (fs.existsSync(oldDocx)) fs.unlinkSync(oldDocx)
      if (fs.existsSync(oldPdf)) fs.unlinkSync(oldPdf)
    } catch (_) {}

    db.prepare('UPDATE scrutiny_gists SET docx_path = ?, pdf_path = ?, gist_content = ?, generated_by = ?, generated_at = datetime(\'now\') WHERE application_id = ?')
      .run(artifacts.docxFile, artifacts.pdfFile, gistText, generatedBy, appRow.id)
  } else {
    db.prepare('INSERT INTO scrutiny_gists (application_id, docx_path, pdf_path, gist_content, generated_by, generated_at) VALUES (?, ?, ?, ?, ?, datetime(\'now\'))')
      .run(appRow.id, artifacts.docxFile, artifacts.pdfFile, gistText, generatedBy)
  }

  return {
    generatedAt,
    docxDownloadUrl: `/api/scrutiny/applications/${appRow.id}/gist/docx`,
    pdfDownloadUrl: `/api/scrutiny/applications/${appRow.id}/gist/pdf`,
  }
}

async function ensureScrutinyGistArtifacts(appId, requestedBy = 'system_recovery') {
  const existing = db.prepare('SELECT * FROM scrutiny_gists WHERE application_id = ?').get(appId)
  if (!existing) return null

  const docxPath = path.join(uploadsDir, existing.docx_path || '')
  const pdfPath = path.join(uploadsDir, existing.pdf_path || '')
  const hasDocx = Boolean(existing.docx_path) && fs.existsSync(docxPath)
  const hasPdf = Boolean(existing.pdf_path) && fs.existsSync(pdfPath)

  if (hasDocx && hasPdf) return existing
  if (!String(existing.gist_content || '').trim()) return null

  try {
    let model
    try {
      const { appRow, docs, payment, review } = loadScrutinyGistSourceData(appId)
      model = buildScrutinyGistDocumentModel({
        appRow,
        docs,
        payment,
        review,
        generatedBy: requestedBy,
        generatedAt: new Date().toISOString(),
      })
    } catch (_) {
      const appRow = db.prepare(`
        SELECT a.*, s.name as sector_name, u.full_name as owner_name
        FROM applications a
        LEFT JOIN sectors s ON s.id = a.sector_id
        LEFT JOIN users u ON u.id = a.owner_user_id
        WHERE a.id = ?
      `).get(appId)
      model = buildFallbackScrutinyGistDocumentModel({
        appRow,
        generatedBy: requestedBy,
        generatedAt: new Date().toISOString(),
        fallbackText: String(existing.gist_content || ''),
      })
    }

    const artifacts = await writeScrutinyGistArtifacts({
      prefix: 'gist_recovery',
      stamp: `${Date.now()}_${appId}`,
      model,
    })

    db.prepare('UPDATE scrutiny_gists SET docx_path = ?, pdf_path = ?, generated_by = ?, generated_at = datetime(\'now\') WHERE application_id = ?')
      .run(artifacts.docxFile, artifacts.pdfFile, requestedBy, appId)

    return db.prepare('SELECT * FROM scrutiny_gists WHERE application_id = ?').get(appId)
  } catch (error) {
    console.error('[PARIVESH] Failed to recover scrutiny gist artifacts from stored content', error)
    return null
  }
}

const hasLockedScrutinyReview = (appId, appStatus = '') => {
  // Locked review should only block when the application is actually beyond scrutiny.
  if (!['Referred', 'Finalized'].includes(String(appStatus || ''))) return false
  const row = db.prepare('SELECT locked FROM scrutiny_reviews WHERE application_id = ?').get(appId)
  return Boolean(row?.locked)
}

const toScrutinyQueueRow = (row) => ({
  id: row.id,
  applicationId: row.application_id,
  projectName: row.project_name,
  projectProponentName: row.owner_name,
  category: row.category,
  sector: row.sector_name,
  submittedAt: row.created_at,
  currentStatus: row.status,
  paymentStatus: row.payment_status,
})

// ── Scrutiny Team Workflow ───────────────────────────────────────────────────
app.get('/api/scrutiny/queue', scrutinyAuth, (req, res) => {
  const { status = '', category = '', sector = '', sort = 'latest' } = req.query
  const rows = db.prepare(`
    SELECT a.*, s.name as sector_name, u.full_name as owner_name
    FROM applications a
    JOIN sectors s ON s.id = a.sector_id
    JOIN users u ON u.id = a.owner_user_id
    WHERE a.status IN ('Submitted', 'Under Scrutiny', 'EDS', 'Referred')
    ORDER BY a.created_at DESC
  `).all()

  const filtered = rows.filter((r) => {
    if (status && String(status) !== 'all' && r.status !== String(status)) return false
    if (category && String(category) !== 'all' && r.category !== String(category)) return false
    if (sector && String(sector) !== 'all' && r.sector_name !== String(sector)) return false
    return true
  })

  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'priority') {
      const rank = (x) => (x.status === 'Submitted' ? 2 : x.status === 'Under Scrutiny' ? 1 : 0)
      return rank(b) - rank(a) || String(b.created_at).localeCompare(String(a.created_at))
    }
    return String(b.created_at).localeCompare(String(a.created_at))
  })

  res.json(sorted.map(toScrutinyQueueRow))
})

app.get('/api/scrutiny/applications/:id', scrutinyAuth, (req, res) => {
  const row = db.prepare(`
    SELECT a.*, s.name as sector_name, u.full_name as owner_name, u.login_id as owner_login_id, u.email as owner_email
    FROM applications a
    JOIN sectors s ON s.id = a.sector_id
    JOIN users u ON u.id = a.owner_user_id
    WHERE a.id = ?
  `).get(req.params.id)
  if (!row) return res.status(404).json({ message: 'Application not found.' })

  const docs = parseDocumentsWithVerification(row.id)
  const payment = parsePaymentForReview(row.id)
  const history = db.prepare('SELECT status, comment, created_by, created_at FROM application_status_history WHERE application_id = ? ORDER BY created_at ASC').all(row.id)
  const review = db.prepare('SELECT * FROM scrutiny_reviews WHERE application_id = ?').get(row.id)
  const gistRow = db.prepare('SELECT id, generated_by, generated_at, gist_content FROM scrutiny_gists WHERE application_id = ?').get(row.id)
  const integrity = blockchainAudit.verifyDocumentIntegrity(row.id)
  if (!row.ai_compliance_report && ['Submitted', 'Under Scrutiny', 'EDS', 'Referred', 'Finalized'].includes(row.status)) {
    queueAiCompliancePrecheck(row.id, 'scrutiny_detail_lazy_load')
  }

  res.json({
    application: row,
    documents: docs,
    payment,
    history,
    gistRow: gistRow || null,
    review: review
      ? {
          ...review,
          review_data: safeJson(review.review_data, {}),
        }
      : null,
    integrity,
  })
})

app.patch('/api/scrutiny/applications/:id/documents/:docId', scrutinyAuth, (req, res) => {
  const appRow = db.prepare('SELECT * FROM applications WHERE id = ?').get(req.params.id)
  if (!appRow) return res.status(404).json({ message: 'Application not found.' })
  if (hasLockedScrutinyReview(appRow.id, appRow.status) || ['Referred', 'Finalized'].includes(appRow.status)) {
    return res.status(400).json({ message: 'Scrutiny stage is locked for this application.' })
  }

  const { verificationStatus, deficiencyComment = '' } = req.body || {}
  if (!['Verified', 'Flagged', 'Uploaded', 'Missing'].includes(verificationStatus)) {
    return res.status(400).json({ message: 'Invalid verification status.' })
  }

  const doc = db.prepare('SELECT * FROM application_documents WHERE id = ? AND application_id = ?').get(req.params.docId, appRow.id)
  if (!doc) return res.status(404).json({ message: 'Document not found.' })

  db.prepare('UPDATE application_documents SET verification_status = ?, deficiency_comment = ? WHERE id = ?')
    .run(verificationStatus, String(deficiencyComment).trim(), doc.id)
  db.prepare('UPDATE applications SET status = ?, updated_at = datetime(\'now\') WHERE id = ?')
    .run('Under Scrutiny', appRow.id)
  if (appRow.status !== 'Under Scrutiny') {
    queueWorkflowAudit(appRow.id, 'Scrutiny Review Started', req.user)
  }

  res.json(db.prepare('SELECT * FROM application_documents WHERE id = ?').get(doc.id))
})

app.get('/api/scrutiny/documents/:docId/download', scrutinyAuth, (req, res) => {
  const doc = db.prepare(`
    SELECT d.*, a.id as app_id
    FROM application_documents d
    JOIN applications a ON a.id = d.application_id
    WHERE d.id = ?
  `).get(req.params.docId)
  if (!doc) return res.status(404).json({ message: 'Document not found.' })

  const filePath = path.join(uploadsDir, doc.file_path)
  if (!fs.existsSync(filePath)) return res.status(404).json({ message: 'Document file missing.' })
  res.download(filePath, doc.original_name)
})

app.patch('/api/scrutiny/applications/:id/payment', scrutinyAuth, (req, res) => {
  const appRow = db.prepare('SELECT * FROM applications WHERE id = ?').get(req.params.id)
  if (!appRow) return res.status(404).json({ message: 'Application not found.' })
  if (hasLockedScrutinyReview(appRow.id, appRow.status) || ['Referred', 'Finalized'].includes(appRow.status)) {
    return res.status(400).json({ message: 'Scrutiny stage is locked for this application.' })
  }

  const { paymentVerification } = req.body || {}
  if (!['Verified', 'Pending', 'Invalid'].includes(paymentVerification)) {
    return res.status(400).json({ message: 'paymentVerification must be Verified, Pending or Invalid.' })
  }

  const payment = db.prepare('SELECT * FROM application_payments WHERE application_id = ? ORDER BY id DESC LIMIT 1').get(appRow.id)
  if (!payment) return res.status(400).json({ message: 'Payment record not found.' })

  const appPaymentStatus = paymentVerification === 'Verified'
    ? 'Verified'
    : paymentVerification === 'Invalid'
      ? 'Invalid'
      : 'Pending Verification'

  const isVerifiedDecision = paymentVerification === 'Verified' || paymentVerification === 'Invalid'
  const verifiedBy = isVerifiedDecision ? req.user.login_id : ''
  db.prepare('UPDATE application_payments SET status = ?, verified_by = ?, verified_at = ?, updated_at = datetime(\'now\') WHERE id = ?')
    .run(appPaymentStatus, verifiedBy, isVerifiedDecision ? new Date().toISOString() : null, payment.id)
  db.prepare('UPDATE applications SET payment_status = ?, status = ?, updated_at = datetime(\'now\') WHERE id = ?')
    .run(appPaymentStatus, 'Under Scrutiny', appRow.id)
  createPpNotification({
    userId: appRow.owner_user_id,
    applicationId: appRow.id,
    type: appPaymentStatus === 'Invalid' ? 'alert' : 'success',
    title: 'Payment Review Updated',
    message: `Scrutiny has updated your payment status to ${appPaymentStatus} for application ${appRow.application_id}.`,
  })
  if (appRow.status !== 'Under Scrutiny') {
    queueWorkflowAudit(appRow.id, 'Scrutiny Review Started', req.user)
  }

  const existing = db.prepare('SELECT id FROM scrutiny_reviews WHERE application_id = ?').get(appRow.id)
  if (existing) {
    db.prepare('UPDATE scrutiny_reviews SET payment_verification = ?, reviewed_by = ?, reviewed_at = datetime(\'now\') WHERE application_id = ?')
      .run(paymentVerification, req.user.login_id, appRow.id)
  } else {
    db.prepare('INSERT INTO scrutiny_reviews (application_id, payment_verification, reviewed_by, reviewed_at) VALUES (?, ?, ?, datetime(\'now\'))')
      .run(appRow.id, paymentVerification, req.user.login_id)
  }

  res.json({ ok: true, paymentStatus: appPaymentStatus })
})

app.post('/api/scrutiny/applications/:id/eds', scrutinyAuth, (req, res) => {
  const appRow = db.prepare('SELECT * FROM applications WHERE id = ?').get(req.params.id)
  if (!appRow) return res.status(404).json({ message: 'Application not found.' })
  if (hasLockedScrutinyReview(appRow.id, appRow.status) || ['Referred', 'Finalized'].includes(appRow.status)) {
    return res.status(400).json({ message: 'Scrutiny stage is locked for this application.' })
  }

  const { deficiencyComments = '', flaggedDocumentIds = [], remarks = '' } = req.body || {}
  const message = [String(deficiencyComments).trim(), String(remarks).trim()].filter(Boolean).join('\n\n')
  if (!message) return res.status(400).json({ message: 'Deficiency comments are required.' })

  const docs = parseDocumentsWithVerification(appRow.id)
  const payment = parsePaymentForReview(appRow.id)
  const { deficiencies } = buildScrutinyDeficiencies(appRow, docs, payment)
  const edsSummary = createEdsSummary({
    appRow,
    docs,
    deficiencies,
    deficiencyComments,
    remarks,
    selectedFlaggedDocumentIds: Array.isArray(flaggedDocumentIds) ? flaggedDocumentIds : [],
  })

  if (Array.isArray(flaggedDocumentIds) && flaggedDocumentIds.length) {
    const stmt = db.prepare('UPDATE application_documents SET verification_status = ?, deficiency_comment = ? WHERE id = ? AND application_id = ?')
    for (const docId of flaggedDocumentIds) {
      stmt.run('Flagged', message, docId, appRow.id)
    }
  }

  db.prepare('UPDATE applications SET status = ?, eds_comments = ?, eds_summary = ?, updated_at = datetime(\'now\') WHERE id = ?')
    .run('EDS', message, edsSummary, appRow.id)
  db.prepare('INSERT INTO application_status_history (application_id, status, comment, created_by) VALUES (?, ?, ?, ?)')
    .run(appRow.id, 'EDS', 'EDS issued by scrutiny team', req.user.login_id)
  queueWorkflowAudit(appRow.id, 'EDS Issued', req.user)
  createPpNotification({
    userId: appRow.owner_user_id,
    applicationId: appRow.id,
    type: 'alert',
    title: 'EDS Issued',
    message: `Your application ${appRow.application_id} has been sent back with EDS comments. Please review and resubmit.`,
  })

  const existing = db.prepare('SELECT id FROM scrutiny_reviews WHERE application_id = ?').get(appRow.id)
  if (existing) {
    db.prepare('UPDATE scrutiny_reviews SET review_notes = ?, reviewed_by = ?, reviewed_at = datetime(\'now\') WHERE application_id = ?')
      .run(message, req.user.login_id, appRow.id)
  } else {
    db.prepare('INSERT INTO scrutiny_reviews (application_id, review_notes, reviewed_by, reviewed_at) VALUES (?, ?, ?, datetime(\'now\'))')
      .run(appRow.id, message, req.user.login_id)
  }

  res.json({ ok: true, status: 'EDS' })
})

app.post('/api/scrutiny/applications/:id/verify', scrutinyAuth, async (req, res) => {
  const appRow = db.prepare('SELECT * FROM applications WHERE id = ?').get(req.params.id)
  if (!appRow) return res.status(404).json({ message: 'Application not found.' })
  if (hasLockedScrutinyReview(appRow.id, appRow.status) || ['Referred', 'Finalized'].includes(appRow.status)) {
    return res.status(400).json({ message: 'Scrutiny stage is locked for this application.' })
  }

  const docs = parseDocumentsWithVerification(appRow.id)
  const payment = parsePaymentForReview(appRow.id)
  const { deficiencies, flaggedDocumentIds } = buildScrutinyDeficiencies(appRow, docs, payment)

  if (deficiencies.length) {
    const edsMessage = createEdsMessageFromDeficiencies(deficiencies)
    const edsSummary = createEdsSummary({
      appRow,
      docs,
      deficiencies,
      deficiencyComments: edsMessage,
      remarks: '',
      selectedFlaggedDocumentIds: flaggedDocumentIds,
    })

    if (flaggedDocumentIds.length) {
      const stmt = db.prepare('UPDATE application_documents SET verification_status = ?, deficiency_comment = ? WHERE id = ? AND application_id = ?')
      for (const docId of flaggedDocumentIds) {
        stmt.run('Flagged', edsMessage, docId, appRow.id)
      }
    }

    db.prepare('UPDATE applications SET status = ?, eds_comments = ?, eds_summary = ?, updated_at = datetime(\'now\') WHERE id = ?')
      .run('EDS', edsMessage, edsSummary, appRow.id)
    db.prepare('INSERT INTO application_status_history (application_id, status, comment, created_by) VALUES (?, ?, ?, ?)')
      .run(appRow.id, 'EDS', 'EDS auto-generated by scrutiny verification due to unmet requirements.', req.user.login_id)
    queueWorkflowAudit(appRow.id, 'EDS Issued', req.user)
    createPpNotification({
      userId: appRow.owner_user_id,
      applicationId: appRow.id,
      type: 'alert',
      title: 'EDS Issued',
      message: `Automated scrutiny checks found deficiencies for ${appRow.application_id}. Please correct and resubmit.`,
    })

    const existingReview = db.prepare('SELECT payment_verification FROM scrutiny_reviews WHERE application_id = ?').get(appRow.id)
    upsertScrutinyReview({
      appId: appRow.id,
      paymentVerification: existingReview?.payment_verification || 'Pending',
      reviewData: {
        verificationResult: 'EDS',
        verified: false,
        checkedAt: new Date().toISOString(),
        deficiencyCount: deficiencies.length,
      },
      reviewNotes: edsMessage,
      reviewedBy: req.user.login_id,
    })

    return res.json({
      ok: true,
      result: 'EDS',
      status: 'EDS',
      deficiencyCount: deficiencies.length,
      deficiencies,
      edsMessage,
    })
  }

  let gist
  try {
    gist = await generateAndStoreScrutinyGist(appRow.id, req.user.login_id)
  } catch (error) {
    console.error('[PARIVESH] Failed to auto-generate scrutiny gist after verification', error)
    return res.status(500).json({ message: 'Verification passed, but GIST generation failed.' })
  }

  db.prepare('UPDATE applications SET status = ?, eds_comments = ?, updated_at = datetime(\'now\') WHERE id = ?')
    .run('Under Scrutiny', '', appRow.id)
  db.prepare('INSERT INTO application_status_history (application_id, status, comment, created_by) VALUES (?, ?, ?, ?)')
    .run(appRow.id, 'Under Scrutiny', 'Scrutiny verification successful. GIST generated automatically.', req.user.login_id)
  queueWorkflowAudit(appRow.id, 'Scrutiny Review Started', req.user)

  const existingReview = db.prepare('SELECT payment_verification FROM scrutiny_reviews WHERE application_id = ?').get(appRow.id)
  upsertScrutinyReview({
    appId: appRow.id,
    paymentVerification: existingReview?.payment_verification || 'Pending',
    reviewData: {
      verificationResult: 'VERIFIED',
      verified: true,
      checkedAt: new Date().toISOString(),
      deficiencyCount: 0,
    },
    reviewNotes: 'Scrutiny verification successful. All required conditions are satisfied.',
    reviewedBy: req.user.login_id,
  })

  return res.json({
    ok: true,
    result: 'VERIFIED',
    status: 'Under Scrutiny',
    verified: true,
    gist,
  })
})

app.post('/api/scrutiny/applications/:id/gist/generate', scrutinyAuth, async (req, res) => {
  const appRow = db.prepare('SELECT id, status FROM applications WHERE id = ?').get(req.params.id)
  if (!appRow) return res.status(404).json({ message: 'Application not found.' })
  if (hasLockedScrutinyReview(appRow.id, appRow.status) || ['Referred', 'Finalized'].includes(appRow.status)) {
    return res.status(400).json({ message: 'Scrutiny stage is locked for this application.' })
  }

  let gist
  try {
    gist = await generateAndStoreScrutinyGist(Number(req.params.id), req.user.login_id)
  } catch (error) {
    console.error('[PARIVESH] Failed to generate scrutiny gist artifacts', error)
    const recovered = await ensureScrutinyGistArtifacts(Number(req.params.id), req.user.login_id)
    if (recovered) {
      return res.json({
        ok: true,
        gist: {
          generatedAt: recovered.generated_at || new Date().toISOString(),
          docxDownloadUrl: `/api/scrutiny/applications/${Number(req.params.id)}/gist/docx`,
          pdfDownloadUrl: `/api/scrutiny/applications/${Number(req.params.id)}/gist/pdf`,
        },
        warning: 'New gist generation failed. Existing gist content was recovered into fresh documents.',
      })
    }
    return res.status(500).json({ message: 'Failed to generate gist documents.' })
  }

  db.prepare('UPDATE applications SET status = ?, updated_at = datetime(\'now\') WHERE id = ?').run('Under Scrutiny', Number(req.params.id))
  db.prepare('INSERT INTO application_status_history (application_id, status, comment, created_by) VALUES (?, ?, ?, ?)')
    .run(Number(req.params.id), 'Under Scrutiny', 'Meeting gist generated by scrutiny team', req.user.login_id)
  queueWorkflowAudit(Number(req.params.id), 'Scrutiny Review Started', req.user)

  res.json({
    ok: true,
    gist,
  })
})

app.get('/api/scrutiny/applications/:id/gist/:format', scrutinyAuth, (req, res) => {
  const appRow = db.prepare('SELECT * FROM applications WHERE id = ?').get(req.params.id)
  if (!appRow) return res.status(404).json({ message: 'Application not found.' })
  const gist = db.prepare('SELECT * FROM scrutiny_gists WHERE application_id = ?').get(appRow.id)
  if (!gist) return res.status(404).json({ message: 'Gist not generated yet.' })

  const format = String(req.params.format).toLowerCase()
  if (!['docx', 'pdf'].includes(format)) return res.status(400).json({ message: 'Invalid format.' })
  const fileName = format === 'docx' ? gist.docx_path : gist.pdf_path
  const filePath = path.join(uploadsDir, fileName || '')

  const streamFile = (resolvedPath) => res.download(resolvedPath, `meeting_gist_${appRow.application_id}.${format}`)

  if (fileName && fs.existsSync(filePath)) {
    return streamFile(filePath)
  }

  ensureScrutinyGistArtifacts(appRow.id, req.user?.login_id || 'download_recovery')
    .then((recovered) => {
      if (!recovered) return res.status(404).json({ message: 'Generated gist file missing.' })
      const recoveredName = format === 'docx' ? recovered.docx_path : recovered.pdf_path
      const recoveredPath = path.join(uploadsDir, recoveredName || '')
      if (!recoveredName || !fs.existsSync(recoveredPath)) {
        return res.status(404).json({ message: 'Generated gist file missing.' })
      }
      return streamFile(recoveredPath)
    })
    .catch((error) => {
      console.error('[PARIVESH] Failed to recover missing gist file during download', error)
      return res.status(500).json({ message: 'Failed to recover missing gist file.' })
    })
})

app.post('/api/scrutiny/applications/:id/refer', scrutinyAuth, async (req, res) => {
  const appRow = db.prepare('SELECT * FROM applications WHERE id = ?').get(req.params.id)
  if (!appRow) return res.status(404).json({ message: 'Application not found.' })
  if (hasLockedScrutinyReview(appRow.id, appRow.status) || ['Referred', 'Finalized'].includes(appRow.status)) {
    return res.status(400).json({ message: 'Application already moved beyond scrutiny stage.' })
  }

  const hasFlagged = db.prepare(
    'SELECT id FROM application_documents WHERE application_id = ? AND verification_status = ? LIMIT 1'
  ).get(appRow.id, 'Flagged')
  if (hasFlagged) return res.status(400).json({ message: 'Cannot refer while flagged documents exist.' })

  const payment = db.prepare('SELECT * FROM application_payments WHERE application_id = ? ORDER BY id DESC LIMIT 1').get(appRow.id)
  if (!payment || !['Verified', 'Pending Verification'].includes(payment.status)) {
    return res.status(400).json({ message: 'Payment must be at least Pending Verification before referral.' })
  }

  const existingGist = db.prepare('SELECT id FROM scrutiny_gists WHERE application_id = ?').get(appRow.id)
  if (!existingGist) {
    try {
      await generateAndStoreScrutinyGist(appRow.id, req.user.login_id)
    } catch (error) {
      console.error('[PARIVESH] Failed to auto-generate scrutiny gist before referral', error)
      return res.status(500).json({ message: 'Unable to refer application because GIST generation failed.' })
    }
  }

  db.prepare('UPDATE applications SET status = ?, updated_at = datetime(\'now\') WHERE id = ?').run('Referred', appRow.id)
  db.prepare('INSERT INTO application_status_history (application_id, status, comment, created_by) VALUES (?, ?, ?, ?)')
    .run(appRow.id, 'Referred', 'Application referred to MoM by scrutiny team', req.user.login_id)
  queueWorkflowAudit(appRow.id, 'Application Referred to Meeting', req.user)

  const existing = db.prepare('SELECT id FROM scrutiny_reviews WHERE application_id = ?').get(appRow.id)
  if (existing) {
    db.prepare('UPDATE scrutiny_reviews SET locked = 1, reviewed_by = ?, reviewed_at = datetime(\'now\') WHERE application_id = ?')
      .run(req.user.login_id, appRow.id)
  } else {
    db.prepare('INSERT INTO scrutiny_reviews (application_id, payment_verification, review_notes, reviewed_by, reviewed_at, locked) VALUES (?, ?, ?, ?, datetime(\'now\'), 1)')
      .run(appRow.id, 'Pending', 'Referred to meeting', req.user.login_id)
  }

  res.json({ ok: true, status: 'Referred' })
})

app.post('/api/scrutiny/applications/:id/reopen', scrutinyAuth, (req, res) => {
  const appRow = db.prepare('SELECT * FROM applications WHERE id = ?').get(req.params.id)
  if (!appRow) return res.status(404).json({ message: 'Application not found.' })
  if (appRow.status === 'Finalized') {
    return res.status(400).json({ message: 'Finalized application cannot be reopened to scrutiny.' })
  }
  if (appRow.status !== 'Referred') {
    return res.status(400).json({ message: 'Only Referred applications can be reopened to scrutiny.' })
  }

  db.prepare('UPDATE applications SET status = ?, updated_at = datetime(\'now\') WHERE id = ?').run('Under Scrutiny', appRow.id)
  db.prepare('INSERT INTO application_status_history (application_id, status, comment, created_by) VALUES (?, ?, ?, ?)')
    .run(appRow.id, 'Under Scrutiny', 'Application reopened to scrutiny for re-review', req.user.login_id)
  queueWorkflowAudit(appRow.id, 'Scrutiny Review Reopened', req.user)

  const existing = db.prepare('SELECT id FROM scrutiny_reviews WHERE application_id = ?').get(appRow.id)
  if (existing) {
    db.prepare('UPDATE scrutiny_reviews SET locked = 0, reviewed_by = ?, reviewed_at = datetime(\'now\') WHERE application_id = ?')
      .run(req.user.login_id, appRow.id)
  }

  res.json({ ok: true, status: 'Under Scrutiny' })
})

// ── Shared: Application Status History ──────────────────────────────────────
app.get('/api/applications/:id/history', [auth, requireAssignedRole(['scrutiny', 'mom'])], (req, res) => {
  const history = db.prepare(
    'SELECT status, comment, created_by, created_at FROM application_status_history WHERE application_id = ? ORDER BY created_at ASC'
  ).all(req.params.id)
  res.json(history)
})

// ── MoM Module ───────────────────────────────────────────────────────────────

// Queue: all referred + finalized applications visible to MoM team
app.get('/api/mom/referred', momAuth, (req, res) => {
  const { category, sector, status: filterStatus, sort } = req.query
  let where = `a.status IN ('Referred', 'Finalized')`
  const params = []
  if (category && category !== 'all') { where += ` AND a.category = ?`; params.push(category) }
  if (sector && sector !== 'all') { where += ` AND s.name = ?`; params.push(sector) }
  if (filterStatus && filterStatus !== 'all') { where += ` AND a.status = ?`; params.push(filterStatus) }
  const orderBy = sort === 'oldest' ? 'a.updated_at ASC' : 'a.updated_at DESC'

  const rows = db.prepare(`
    SELECT a.id, a.application_id, a.project_name, a.category, a.status,
           a.created_at, a.updated_at, a.payment_status,
           s.name as sector_name, u.full_name as owner_name,
           mr.finalized, mr.converted_at, mr.mom_docx_path, mr.mom_pdf_path
    FROM applications a
    JOIN sectors s ON s.id = a.sector_id
    JOIN users u ON u.id = a.owner_user_id
    LEFT JOIN mom_records mr ON mr.application_id = a.id
    WHERE ${where}
    ORDER BY ${orderBy}
  `).all(...params)
  res.json(rows)
})

// Full detail of a single referred application (read-only for MoM)
app.get('/api/mom/applications/:id', momAuth, (req, res) => {
  const appRow = db.prepare(`
    SELECT a.*, s.name as sector_name, u.full_name as owner_name,
           u.login_id as owner_login_id, u.email as owner_email
    FROM applications a
    JOIN sectors s ON s.id = a.sector_id
    JOIN users u ON u.id = a.owner_user_id
    WHERE a.id = ?
  `).get(req.params.id)
  if (!appRow) return res.status(404).json({ message: 'Application not found.' })
  if (!['Referred', 'Finalized'].includes(appRow.status))
    return res.status(403).json({ message: 'Application is not in MoM queue.' })

  const documents = db.prepare(`
    SELECT id, doc_name, original_name, file_path, verification_status, deficiency_comment, uploaded_at
    FROM application_documents WHERE application_id = ?
  `).all(appRow.id)

  const payment = db.prepare('SELECT * FROM application_payments WHERE application_id = ? ORDER BY id DESC LIMIT 1').get(appRow.id)
  const history = db.prepare('SELECT status, comment, created_by, created_at FROM application_status_history WHERE application_id = ? ORDER BY id DESC').all(appRow.id)
  const review = db.prepare('SELECT * FROM scrutiny_reviews WHERE application_id = ?').get(appRow.id)
  const gistRow = db.prepare('SELECT * FROM scrutiny_gists WHERE application_id = ?').get(appRow.id)
  const momRecord = db.prepare('SELECT * FROM mom_records WHERE application_id = ?').get(appRow.id)

  res.json({ application: appRow, documents, payment: payment || null, history, review: review || null, gistRow: gistRow || null, momRecord: momRecord || null })
})

// Get editable gist draft for MoM (returns saved draft or scrutiny-generated content)
app.get('/api/mom/applications/:id/gist', momAuth, (req, res) => {
  const appRow = db.prepare('SELECT * FROM applications WHERE id = ?').get(req.params.id)
  if (!appRow) return res.status(404).json({ message: 'Application not found.' })
  if (!['Referred', 'Finalized'].includes(appRow.status))
    return res.status(403).json({ message: 'Application is not in MoM queue.' })

  const momRecord = db.prepare('SELECT * FROM mom_records WHERE application_id = ?').get(appRow.id)
  if (momRecord && momRecord.gist_draft) return res.json({ content: momRecord.gist_draft, source: 'mom_draft' })

  const gistRow = db.prepare('SELECT * FROM scrutiny_gists WHERE application_id = ?').get(appRow.id)
  if (gistRow) {
    const content = readLegacyGistText(gistRow)
    if (content) return res.json({ content, source: 'scrutiny_gist' })
  }

  res.json({ content: `Meeting Gist Draft\nApplication ID: ${appRow.application_id}\nProject Name: ${appRow.project_name}\n\n[No scrutiny gist available. Please write meeting notes here.]`, source: 'empty' })
})

// Save edited gist draft
app.put('/api/mom/applications/:id/gist', momAuth, (req, res) => {
  const appRow = db.prepare('SELECT * FROM applications WHERE id = ?').get(req.params.id)
  if (!appRow) return res.status(404).json({ message: 'Application not found.' })
  if (appRow.status === 'Finalized') return res.status(403).json({ message: 'Application is finalized. No edits allowed.' })
  if (!['Referred', 'Finalized'].includes(appRow.status))
    return res.status(403).json({ message: 'Application is not in MoM queue.' })

  const { content } = req.body || {}
  if (typeof content !== 'string') return res.status(400).json({ message: 'Content is required.' })

  const existing = db.prepare('SELECT id FROM mom_records WHERE application_id = ?').get(appRow.id)
  if (existing) {
    db.prepare(`UPDATE mom_records SET gist_draft = ?, updated_at = datetime('now') WHERE application_id = ?`).run(content, appRow.id)
  } else {
    db.prepare(`INSERT INTO mom_records (application_id, gist_draft) VALUES (?, ?)`).run(appRow.id, content)
  }
  res.json({ ok: true })
})

// Convert gist to MoM — generates formal document with meeting metadata
app.post('/api/mom/applications/:id/convert', momAuth, async (req, res) => {
  const appRow = db.prepare(`
    SELECT a.*, s.name as sector_name, u.full_name as owner_name
    FROM applications a JOIN sectors s ON s.id = a.sector_id JOIN users u ON u.id = a.owner_user_id
    WHERE a.id = ?
  `).get(req.params.id)
  if (!appRow) return res.status(404).json({ message: 'Application not found.' })
  if (appRow.status === 'Finalized') return res.status(403).json({ message: 'Application already finalized.' })
  if (!['Referred', 'Finalized'].includes(appRow.status))
    return res.status(403).json({ message: 'Application is not in MoM queue.' })

  const { meetingDate, meetingId, committeeName, membersPresent, gistContent } = req.body || {}
  if (!meetingDate?.trim()) return res.status(400).json({ message: 'Meeting date is required.' })
  if (!meetingId?.trim()) return res.status(400).json({ message: 'Meeting ID is required.' })
  if (!committeeName?.trim()) return res.status(400).json({ message: 'Committee name is required.' })
  if (!gistContent?.trim()) return res.status(400).json({ message: 'Gist content is required.' })

  const membersArray = Array.isArray(membersPresent) ? membersPresent : (membersPresent ? [membersPresent] : [])

  const momText = [
    '═══════════════════════════════════════════════════════════════════',
    'GOVERNMENT OF INDIA',
    'MINISTRY OF ENVIRONMENT, FOREST AND CLIMATE CHANGE',
    committeeName.toUpperCase(),
    '═══════════════════════════════════════════════════════════════════',
    '',
    `MINUTES OF MEETING`,
    '',
    `Meeting ID    : ${meetingId}`,
    `Meeting Date  : ${meetingDate}`,
    `Prepared By   : ${req.user.login_id}`,
    `Prepared At   : ${new Date().toISOString()}`,
    '',
    '───────────────────────────────────────────────────────────────────',
    'APPLICATION DETAILS',
    '───────────────────────────────────────────────────────────────────',
    `Application ID : ${appRow.application_id}`,
    `Project Name   : ${appRow.project_name}`,
    `Organization   : ${appRow.organization}`,
    `Category       : ${appRow.category}`,
    `Sector         : ${appRow.sector_name}`,
    `Proponent      : ${appRow.owner_name}`,
    '',
    '───────────────────────────────────────────────────────────────────',
    'MEMBERS PRESENT',
    '───────────────────────────────────────────────────────────────────',
    ...membersArray.map((m, i) => `  ${i + 1}. ${m}`),
    '',
    '───────────────────────────────────────────────────────────────────',
    'MEETING DISCUSSIONS AND DECISIONS',
    '───────────────────────────────────────────────────────────────────',
    '',
    gistContent,
    '',
    '───────────────────────────────────────────────────────────────────',
    'SIGNATURES',
    '───────────────────────────────────────────────────────────────────',
    '',
    'Member Secretary                    Chairperson',
    `${committeeName}                   Expert Appraisal Committee`,
    '',
    '═══════════════════════════════════════════════════════════════════',
  ].join('\n')

  let artifacts
  try {
    artifacts = await writeReportArtifacts({
      prefix: 'mom',
      stamp: `${Date.now()}_${appRow.id}`,
      title: `Minutes of Meeting - ${appRow.application_id}`,
      text: momText,
    })
  } catch (error) {
    console.error('[PARIVESH] Failed to generate MoM artifacts', error)
    return res.status(500).json({ message: 'Failed to generate Minutes of Meeting documents.' })
  }

  const existing = db.prepare('SELECT id FROM mom_records WHERE application_id = ?').get(appRow.id)
  const now = new Date().toISOString()
  if (existing) {
    db.prepare(`UPDATE mom_records
      SET gist_draft = ?, meeting_date = ?, meeting_id = ?, committee_name = ?, members_present = ?,
          mom_docx_path = ?, mom_pdf_path = ?, converted_by = ?, converted_at = ?, updated_at = datetime('now')
      WHERE application_id = ?`).run(
      gistContent, meetingDate, meetingId, committeeName, JSON.stringify(membersArray),
      artifacts.docxFile, artifacts.pdfFile, req.user.login_id, now, appRow.id
    )
  } else {
    db.prepare(`INSERT INTO mom_records
      (application_id, gist_draft, meeting_date, meeting_id, committee_name, members_present, mom_docx_path, mom_pdf_path, converted_by, converted_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
      appRow.id, gistContent, meetingDate, meetingId, committeeName, JSON.stringify(membersArray),
      artifacts.docxFile, artifacts.pdfFile, req.user.login_id, now
    )
  }

  queueWorkflowAudit(appRow.id, 'MoM Generated', req.user)

  res.json({ ok: true, docxUrl: `/api/mom/applications/${appRow.id}/mom/docx`, pdfUrl: `/api/mom/applications/${appRow.id}/mom/pdf` })
})

// Finalize MoM — locks the record, sets application status to Finalized
app.post('/api/mom/applications/:id/finalize', momAuth, (req, res) => {
  const appRow = db.prepare('SELECT * FROM applications WHERE id = ?').get(req.params.id)
  if (!appRow) return res.status(404).json({ message: 'Application not found.' })
  if (appRow.status === 'Finalized') return res.status(409).json({ message: 'Application is already finalized.' })
  if (appRow.status !== 'Referred') return res.status(400).json({ message: 'Application must be Referred before finalization.' })

  const momRecord = db.prepare('SELECT * FROM mom_records WHERE application_id = ?').get(appRow.id)
  if (!momRecord || !momRecord.mom_docx_path) return res.status(400).json({ message: 'MoM document must be generated (Convert to MoM) before finalizing.' })

  const now = new Date().toISOString()
  db.prepare(`UPDATE mom_records SET finalized = 1, finalized_by = ?, finalized_at = ?, updated_at = datetime('now') WHERE application_id = ?`)
    .run(req.user.login_id, now, appRow.id)
  db.prepare(`UPDATE applications SET status = 'Finalized', updated_at = datetime('now') WHERE id = ?`).run(appRow.id)
  db.prepare('INSERT INTO application_status_history (application_id, status, comment, created_by) VALUES (?, ?, ?, ?)')
    .run(appRow.id, 'Finalized', 'Minutes of Meeting finalized and locked', req.user.login_id)
  createPpNotification({
    userId: appRow.owner_user_id,
    applicationId: appRow.id,
    type: 'success',
    title: 'Application Finalized',
    message: `Minutes of Meeting have been finalized for application ${appRow.application_id}. Final documents are now available.`,
  })

  queueWorkflowAudit(appRow.id, 'MoM Finalized', req.user)
  queueMoMFinalizationAudit(appRow.id, momRecord.mom_pdf_path || momRecord.mom_docx_path, req.user)

  res.json({ ok: true, status: 'Finalized' })
})

// Download MoM document
app.get('/api/mom/applications/:id/mom/:format', momAuth, (req, res) => {
  const { format } = req.params
  if (!['docx', 'pdf'].includes(format)) return res.status(400).json({ message: 'Invalid format.' })
  const appRow = db.prepare('SELECT * FROM applications WHERE id = ?').get(req.params.id)
  if (!appRow) return res.status(404).json({ message: 'Application not found.' })
  const momRecord = db.prepare('SELECT * FROM mom_records WHERE application_id = ?').get(appRow.id)
  if (!momRecord) return res.status(404).json({ message: 'No MoM document generated yet.' })
  const fileName = format === 'docx' ? momRecord.mom_docx_path : momRecord.mom_pdf_path
  if (!fileName) return res.status(404).json({ message: `MoM ${format.toUpperCase()} not found.` })
  const filePath = path.join(uploadsDir, fileName)
  if (!fs.existsSync(filePath)) return res.status(404).json({ message: 'MoM file not found on server.' })
  const mime = format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  res.setHeader('Content-Type', mime)
  res.setHeader('Content-Disposition', `attachment; filename="MoM_${appRow.application_id}.${format}"`)
  fs.createReadStream(filePath).pipe(res)
})

// MoM document download for project proponent (read-only, only Finalized)
app.get('/api/pp/applications/:id/mom/:format', auth, (req, res) => {
  const { format } = req.params
  if (!['docx', 'pdf'].includes(format)) return res.status(400).json({ message: 'Invalid format.' })
  const appRow = db.prepare('SELECT * FROM applications WHERE id = ? AND owner_user_id = ?').get(req.params.id, req.user.id)
  if (!appRow) return res.status(404).json({ message: 'Application not found.' })
  if (appRow.status !== 'Finalized') return res.status(403).json({ message: 'MoM is only available after finalization.' })
  const momRecord = db.prepare('SELECT * FROM mom_records WHERE application_id = ? AND finalized = 1').get(appRow.id)
  if (!momRecord) return res.status(404).json({ message: 'Finalized MoM not available.' })
  const fileName = format === 'docx' ? momRecord.mom_docx_path : momRecord.mom_pdf_path
  if (!fileName) return res.status(404).json({ message: `MoM ${format.toUpperCase()} not found.` })
  const filePath = path.join(uploadsDir, fileName)
  if (!fs.existsSync(filePath)) return res.status(404).json({ message: 'MoM file not found.' })
  const mime = format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  res.setHeader('Content-Type', mime)
  res.setHeader('Content-Disposition', `attachment; filename="MoM_${appRow.application_id}.${format}"`)
  fs.createReadStream(filePath).pipe(res)
})



// ── Admin Login ───────────────────────────────────────────────────────────────
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body || {}
  if (!username?.trim()) return res.status(400).json({ message: 'Username is required.' })
  if (!password) return res.status(400).json({ message: 'Password is required.' })

  const admin = db.prepare('SELECT * FROM admin_users WHERE username = ?').get(username.trim())
  if (!admin || !bcrypt.compareSync(password, admin.password_hash))
    return res.status(401).json({ message: 'Invalid username or password.' })

  return res.json({ token: createAdminToken(admin), username: admin.username })
})

// ── Admin: User Management ────────────────────────────────────────────────────
app.get('/api/admin/users', adminAuth, (_req, res) => {
  res.json(db.prepare('SELECT * FROM users ORDER BY created_at DESC').all().map(toClientUser))
})

app.post('/api/admin/users', adminAuth, (req, res) => {
  const { fullName, loginId, email, mobile = '', organization = '', role = '', state = '', password, assignedRole = 'proponent' } = req.body || {}
  if (!fullName?.trim() || !loginId?.trim() || !email?.trim() || !password)
    return res.status(400).json({ message: 'fullName, loginId, email and password are required.' })
  if (password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters.' })

  if (db.prepare('SELECT id FROM users WHERE login_id = ? OR email = ?').get(loginId.trim(), email.trim().toLowerCase()))
    return res.status(409).json({ message: 'Login ID or email already exists.' })

  const result = db.prepare(`
    INSERT INTO users (full_name, login_id, email, mobile, organization, role, state, password_hash, assigned_role)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(fullName.trim(), loginId.trim(), email.trim().toLowerCase(), String(mobile).trim(),
         String(organization).trim(), String(role).trim(), String(state).trim(), bcrypt.hashSync(password, 10), assignedRole)

  res.status(201).json(toClientUser(db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid)))
})

app.patch('/api/admin/users/:id/role', adminAuth, (req, res) => {
  const { assignedRole } = req.body || {}
  if (!['proponent', 'scrutiny', 'mom', 'admin'].includes(assignedRole))
    return res.status(400).json({ message: 'Invalid role.' })
  const r = db.prepare('UPDATE users SET assigned_role = ? WHERE id = ?').run(assignedRole, req.params.id)
  if (r.changes === 0) return res.status(404).json({ message: 'User not found.' })
  res.json({ ok: true })
})

app.patch('/api/admin/users/:id/status', adminAuth, (req, res) => {
  const { status } = req.body || {}
  if (!['active', 'suspended'].includes(status)) return res.status(400).json({ message: 'Status must be active or suspended.' })
  const r = db.prepare('UPDATE users SET account_status = ? WHERE id = ?').run(status, req.params.id)
  if (r.changes === 0) return res.status(404).json({ message: 'User not found.' })
  res.json({ ok: true })
})

app.delete('/api/admin/users/:id', adminAuth, (req, res) => {
  const r = db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id)
  if (r.changes === 0) return res.status(404).json({ message: 'User not found.' })
  res.json({ ok: true })
})

// ── Admin: Templates ──────────────────────────────────────────────────────────
app.get('/api/admin/templates', adminAuth, (_req, res) => {
  res.json(db.prepare('SELECT * FROM templates ORDER BY uploaded_at DESC').all())
})

app.post('/api/admin/templates', adminAuth, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'File is required.' })
  const { name, category, description = '' } = req.body || {}
  if (!name?.trim()) return res.status(400).json({ message: 'Template name is required.' })
  if (!['A', 'B1', 'B2'].includes(category)) return res.status(400).json({ message: 'Category must be A, B1 or B2.' })

  const result = db.prepare(`
    INSERT INTO templates (name, category, description, filename, original_name)
    VALUES (?, ?, ?, ?, ?)
  `).run(name.trim(), category, description.trim(), req.file.filename, req.file.originalname)

  res.status(201).json(db.prepare('SELECT * FROM templates WHERE id = ?').get(result.lastInsertRowid))
})

app.get('/api/admin/templates/:id/download', adminAuth, (req, res) => {
  const tpl = db.prepare('SELECT * FROM templates WHERE id = ?').get(req.params.id)
  if (!tpl) return res.status(404).json({ message: 'Template not found.' })
  const filePath = path.join(templatesDir, tpl.filename)
  if (!fs.existsSync(filePath)) return res.status(404).json({ message: 'File not found on disk.' })
  res.download(filePath, tpl.original_name)
})

app.delete('/api/admin/templates/:id', adminAuth, (req, res) => {
  const tpl = db.prepare('SELECT * FROM templates WHERE id = ?').get(req.params.id)
  if (!tpl) return res.status(404).json({ message: 'Template not found.' })
  const filePath = path.join(templatesDir, tpl.filename)
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
  db.prepare('DELETE FROM templates WHERE id = ?').run(req.params.id)
  res.json({ ok: true })
})

// ── Admin: Sectors ────────────────────────────────────────────────────────────
app.get('/api/admin/sectors', adminAuth, (_req, res) => {
  const sectors = db.prepare('SELECT * FROM sectors ORDER BY name ASC').all()
  const params = db.prepare('SELECT * FROM sector_params ORDER BY sort_order ASC, id ASC').all()
  res.json(sectors.map(s => ({ ...s, params: params.filter(p => p.sector_id === s.id) })))
})

app.post('/api/admin/sectors', adminAuth, (req, res) => {
  const { name, description = '' } = req.body || {}
  if (!name?.trim()) return res.status(400).json({ message: 'Sector name is required.' })
  try {
    const result = db.prepare('INSERT INTO sectors (name, description) VALUES (?, ?)').run(name.trim(), description.trim())
    res.status(201).json(db.prepare('SELECT * FROM sectors WHERE id = ?').get(result.lastInsertRowid))
  } catch (_) {
    res.status(409).json({ message: 'A sector with this name already exists.' })
  }
})

app.patch('/api/admin/sectors/:id', adminAuth, (req, res) => {
  const sector = db.prepare('SELECT * FROM sectors WHERE id = ?').get(req.params.id)
  if (!sector) return res.status(404).json({ message: 'Sector not found.' })
  const name = req.body.name?.trim() ?? sector.name
  const description = req.body.description?.trim() ?? sector.description
  db.prepare('UPDATE sectors SET name = ?, description = ? WHERE id = ?').run(name, description, req.params.id)
  res.json({ ok: true })
})

app.delete('/api/admin/sectors/:id', adminAuth, (req, res) => {
  const r = db.prepare('DELETE FROM sectors WHERE id = ?').run(req.params.id)
  if (r.changes === 0) return res.status(404).json({ message: 'Sector not found.' })
  res.json({ ok: true })
})

app.post('/api/admin/sectors/:id/params', adminAuth, (req, res) => {
  const { paramLabel, paramType = 'text', required = false, options = [], sortOrder = 0 } = req.body || {}
  if (!paramLabel?.trim()) return res.status(400).json({ message: 'paramLabel is required.' })
  if (!db.prepare('SELECT id FROM sectors WHERE id = ?').get(req.params.id))
    return res.status(404).json({ message: 'Sector not found.' })

  const result = db.prepare(`
    INSERT INTO sector_params (sector_id, param_label, param_type, required, options, sort_order)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(req.params.id, paramLabel.trim(), paramType, required ? 1 : 0, JSON.stringify(options), sortOrder)

  res.status(201).json(db.prepare('SELECT * FROM sector_params WHERE id = ?').get(result.lastInsertRowid))
})

app.delete('/api/admin/sectors/:sectorId/params/:paramId', adminAuth, (req, res) => {
  const r = db.prepare('DELETE FROM sector_params WHERE id = ? AND sector_id = ?').run(req.params.paramId, req.params.sectorId)
  if (r.changes === 0) return res.status(404).json({ message: 'Parameter not found.' })
  res.json({ ok: true })
})

app.get('/api/admin/blockchain/audit', adminAuth, async (req, res) => {
  const applicationRef = String(req.query.applicationId || '').trim()
  const limit = Number(req.query.limit || 200)
  const result = blockchainAudit.listAuditEvents({ applicationRef, limit })

  let chainDocumentHash = null
  if (applicationRef) {
    try {
      chainDocumentHash = await blockchainAudit.verifyDocumentHashFromChain(applicationRef)
    } catch {
      chainDocumentHash = null
    }
  }

  res.json({
    rows: result.rows,
    totals: result.totals,
    provider: result.provider,
    network: result.network,
    chainDocumentHash,
  })
})

// ── Error Handler ─────────────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('Auth API error:', err)
  res.status(err.status || 500).json({ error: err.message || 'Internal server error. Please try again.', message: err.message || 'Internal server error. Please try again.' })
})

app.listen(PORT, () => {
  console.log(`Auth API listening at http://localhost:${PORT}`)
})
