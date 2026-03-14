import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

const DEFAULT_RETRY_MS = 30_000
const MAX_RETRY_MS = 15 * 60_000

function toIsoNow() {
  return new Date().toISOString()
}

function safeJsonParse(raw, fallback = null) {
  try {
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

function canonicalStringify(value) {
  if (Array.isArray(value)) {
    return `[${value.map((entry) => canonicalStringify(entry)).join(',')}]`
  }
  if (value && typeof value === 'object') {
    const keys = Object.keys(value).sort()
    return `{${keys.map((key) => `${JSON.stringify(key)}:${canonicalStringify(value[key])}`).join(',')}}`
  }
  return JSON.stringify(value)
}

function sha256Hex(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex')
}

function sha256File(filePath) {
  if (!filePath || !fs.existsSync(filePath)) {
    return sha256Hex(`missing:${filePath || 'unknown'}`)
  }
  const content = fs.readFileSync(filePath)
  return crypto.createHash('sha256').update(content).digest('hex')
}

function extractRole(userRole = '') {
  const normalized = String(userRole || '').toLowerCase()
  if (normalized.includes('admin')) return 'admin'
  if (normalized.includes('scrutiny')) return 'scrutiny'
  if (normalized.includes('mom')) return 'mom'
  return 'proponent'
}

async function createProvider(config) {
  const mode = String(config.mode || '').toLowerCase()
  if (mode !== 'evm') return createMockProvider(config)

  try {
    const { ethers } = await import('ethers')
    const rpcUrl = String(config.rpcUrl || '').trim()
    const privateKey = String(config.privateKey || '').trim()
    const contractAddress = String(config.contractAddress || '').trim()

    if (!rpcUrl || !privateKey || !contractAddress) {
      console.warn('[PARIVESH][Blockchain] EVM mode configured without rpc/privateKey/contractAddress. Falling back to mock provider.')
      return createMockProvider(config)
    }

    const abi = [
      'function recordApplicationSubmission(string applicationId, string documentHash, string submittedBy, uint256 timestamp)',
      'function recordWorkflowEvent(string applicationId, string action, string performedBy, uint256 timestamp)',
      'function recordMoMHash(string applicationId, string momDocumentHash, string finalizedBy, uint256 timestamp)',
      'function verifyDocumentHash(string applicationId) view returns (string)',
    ]

    const provider = new ethers.JsonRpcProvider(rpcUrl)
    const wallet = new ethers.Wallet(privateKey, provider)
    const contract = new ethers.Contract(contractAddress, abi, wallet)

    return {
      name: 'evm',
      network: config.networkName || 'evm-testnet',
      async submit(method, args, payloadHash) {
        const fn = contract[method]
        if (typeof fn !== 'function') {
          throw new Error(`Contract method not available: ${method}`)
        }
        const tx = await fn(...args)
        const receipt = await tx.wait(Number(config.confirmations || 1))
        return {
          txHash: tx.hash,
          provider: 'evm',
          network: config.networkName || 'evm-testnet',
          blockNumber: receipt?.blockNumber || null,
          payloadHash,
        }
      },
      async verifyDocumentHash(applicationId) {
        if (typeof contract.verifyDocumentHash !== 'function') return null
        try {
          const chainHash = await contract.verifyDocumentHash(applicationId)
          return String(chainHash || '').trim() || null
        } catch {
          return null
        }
      },
    }
  } catch (error) {
    console.warn('[PARIVESH][Blockchain] Unable to initialize EVM provider, using mock ledger.', error)
    return createMockProvider(config)
  }
}

function createMockProvider(config) {
  const ledgerPath = path.join(config.dataDir, 'blockchain-ledger.jsonl')
  if (!fs.existsSync(ledgerPath)) fs.writeFileSync(ledgerPath, '', 'utf8')

  const readLastEntry = () => {
    const raw = fs.readFileSync(ledgerPath, 'utf8').trim()
    if (!raw) return null
    const lines = raw.split(/\r?\n/)
    const last = lines[lines.length - 1]
    return safeJsonParse(last, null)
  }

  return {
    name: 'mock',
    network: config.networkName || 'local-ledger',
    async submit(method, args, payloadHash) {
      const now = toIsoNow()
      const prev = readLastEntry()
      const block = {
        method,
        args,
        payloadHash,
        network: config.networkName || 'local-ledger',
        previousHash: prev?.blockHash || 'GENESIS',
        timestamp: now,
        nonce: crypto.randomUUID(),
      }
      const blockHash = sha256Hex(canonicalStringify(block))
      const record = { ...block, blockHash, txHash: blockHash }
      fs.appendFileSync(ledgerPath, `${JSON.stringify(record)}\n`, 'utf8')
      return {
        txHash: blockHash,
        provider: 'mock',
        network: config.networkName || 'local-ledger',
        blockNumber: null,
        payloadHash,
      }
    },
    async verifyDocumentHash(applicationId) {
      const raw = fs.readFileSync(ledgerPath, 'utf8').trim()
      if (!raw) return null
      const lines = raw.split(/\r?\n/)
      for (let idx = lines.length - 1; idx >= 0; idx -= 1) {
        const row = safeJsonParse(lines[idx], null)
        if (!row || row.method !== 'recordApplicationSubmission') continue
        const args = Array.isArray(row.args) ? row.args : []
        if (String(args[0] || '') === String(applicationId)) {
          return String(args[1] || '').trim() || null
        }
      }
      return null
    },
  }
}

export async function createBlockchainAuditService({ db, dataDir, uploadsDir }) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS blockchain_audit_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      application_id INTEGER NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
      application_ref TEXT NOT NULL,
      action TEXT NOT NULL,
      user_role TEXT NOT NULL DEFAULT '',
      performed_by TEXT NOT NULL DEFAULT '',
      event_time TEXT NOT NULL,
      payload_hash TEXT NOT NULL,
      payload_json TEXT NOT NULL,
      tx_hash TEXT,
      provider TEXT DEFAULT 'mock',
      network TEXT DEFAULT 'local-ledger',
      status TEXT NOT NULL DEFAULT 'queued',
      block_number INTEGER,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS blockchain_outbox (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      job_type TEXT NOT NULL,
      application_id INTEGER NOT NULL,
      payload_json TEXT NOT NULL,
      attempts INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'pending',
      last_error TEXT DEFAULT '',
      next_retry_at TEXT NOT NULL DEFAULT (datetime('now')),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `)

  const config = {
    mode: process.env.BLOCKCHAIN_MODE || 'mock',
    networkName: process.env.BLOCKCHAIN_NETWORK_NAME || 'local-ledger',
    rpcUrl: process.env.BLOCKCHAIN_RPC_URL || '',
    privateKey: process.env.BLOCKCHAIN_PRIVATE_KEY || '',
    contractAddress: process.env.BLOCKCHAIN_CONTRACT_ADDRESS || '',
    confirmations: Number(process.env.BLOCKCHAIN_CONFIRMATIONS || 1),
    dataDir,
  }

  const provider = await createProvider(config)

  const insertOutbox = db.prepare(`
    INSERT INTO blockchain_outbox (job_type, application_id, payload_json, status, attempts, last_error, next_retry_at, created_at, updated_at)
    VALUES (?, ?, ?, 'pending', 0, '', datetime('now'), datetime('now'), datetime('now'))
  `)
  const listDueOutbox = db.prepare(`
    SELECT * FROM blockchain_outbox
    WHERE status = 'pending' AND datetime(next_retry_at) <= datetime('now')
    ORDER BY id ASC
    LIMIT 20
  `)
  const markProcessing = db.prepare(`
    UPDATE blockchain_outbox SET status = 'processing', updated_at = datetime('now') WHERE id = ?
  `)
  const markCompleted = db.prepare(`
    UPDATE blockchain_outbox SET status = 'completed', updated_at = datetime('now') WHERE id = ?
  `)
  const markPendingRetry = db.prepare(`
    UPDATE blockchain_outbox
    SET status = 'pending',
        attempts = ?,
        last_error = ?,
        next_retry_at = ?,
        updated_at = datetime('now')
    WHERE id = ?
  `)

  const insertAuditEvent = db.prepare(`
    INSERT INTO blockchain_audit_events
      (application_id, application_ref, action, user_role, performed_by, event_time, payload_hash, payload_json, tx_hash, provider, network, status, block_number)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const selectApplication = db.prepare('SELECT id, application_id, coordinates, created_at, updated_at, status, application_hash, blockchain_txn_id, application_hash_recorded_at FROM applications WHERE id = ?')
  const selectDocuments = db.prepare('SELECT id, doc_name, file_path, original_name, uploaded_at FROM application_documents WHERE application_id = ? ORDER BY id ASC')

  const updateSubmissionHash = db.prepare(`
    UPDATE applications
    SET application_hash = ?, blockchain_txn_id = ?, application_hash_recorded_at = ?, updated_at = datetime('now')
    WHERE id = ?
  `)

  const updateAuditTxn = db.prepare(`
    UPDATE applications
    SET audit_txn_id = ?, updated_at = datetime('now')
    WHERE id = ?
  `)

  const updateMomHash = db.prepare(`
    UPDATE applications
    SET mom_hash = ?, blockchain_txn_id = ?, updated_at = datetime('now')
    WHERE id = ?
  `)

  const readLatestSubmissionEvent = db.prepare(`
    SELECT payload_json
    FROM blockchain_audit_events
    WHERE application_id = ? AND action = 'Application Submitted' AND status = 'confirmed'
    ORDER BY id DESC LIMIT 1
  `)

  const listAuditEventsStmt = db.prepare(`
    SELECT
      e.id,
      e.application_id,
      e.application_ref,
      e.action,
      e.user_role,
      e.performed_by,
      e.event_time,
      e.tx_hash,
      e.provider,
      e.network,
      e.status,
      e.block_number,
      e.created_at
    FROM blockchain_audit_events e
    WHERE (? = '' OR e.application_ref = ?)
    ORDER BY e.id DESC
    LIMIT ?
  `)

  const getEventCounts = db.prepare(`
    SELECT
      COUNT(*) AS total,
      SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) AS confirmed,
      SUM(CASE WHEN status = 'queued' THEN 1 ELSE 0 END) AS queued
    FROM blockchain_audit_events
    WHERE (? = '' OR application_ref = ?)
  `)

  function computeDocumentFingerprints(applicationId) {
    const docs = selectDocuments.all(applicationId)
    return docs.map((doc) => ({
      docId: doc.id,
      docName: doc.doc_name,
      originalName: doc.original_name,
      uploadedAt: doc.uploaded_at,
      fileHash: sha256File(path.join(uploadsDir, doc.file_path)),
    }))
  }

  function buildSubmissionDigest({ applicationRef, coordinates, submittedAt, documentFingerprints }) {
    const payload = {
      applicationId: applicationRef,
      coordinates: String(coordinates || ''),
      submittedAt,
      documents: [...documentFingerprints]
        .sort((a, b) => String(a.docName).localeCompare(String(b.docName)))
        .map((doc) => ({
          docName: doc.docName,
          originalName: doc.originalName,
          uploadedAt: doc.uploadedAt,
          fileHash: doc.fileHash,
        })),
    }
    const digest = sha256Hex(canonicalStringify(payload))
    return { digest, payload }
  }

  function scheduleJob(jobType, applicationId, payload) {
    insertOutbox.run(jobType, applicationId, JSON.stringify(payload))
  }

  let processing = false

  async function processOutboxBatch() {
    if (processing) return
    processing = true
    try {
      const jobs = listDueOutbox.all()
      for (const job of jobs) {
        markProcessing.run(job.id)
        const payload = safeJsonParse(job.payload_json, null)
        if (!payload) {
          markCompleted.run(job.id)
          continue
        }

        try {
          await processSingleJob(job.job_type, Number(job.application_id), payload)
          markCompleted.run(job.id)
        } catch (error) {
          const nextAttempts = Number(job.attempts || 0) + 1
          const waitMs = Math.min(DEFAULT_RETRY_MS * (2 ** Math.max(0, nextAttempts - 1)), MAX_RETRY_MS)
          const nextRetryAt = new Date(Date.now() + waitMs).toISOString()
          markPendingRetry.run(nextAttempts, String(error?.message || error || 'Unknown blockchain error'), nextRetryAt, job.id)
        }
      }
    } finally {
      processing = false
    }
  }

  async function processSingleJob(jobType, applicationId, payload) {
    const app = selectApplication.get(applicationId)
    if (!app) return

    if (jobType === 'application_submission') {
      const args = [
        app.application_id,
        payload.documentHash,
        payload.submittedBy,
        Math.floor(new Date(payload.timestamp).getTime() / 1000),
      ]
      const tx = await provider.submit('recordApplicationSubmission', args, payload.payloadHash)
      updateSubmissionHash.run(payload.documentHash, tx.txHash, payload.timestamp, app.id)
      insertAuditEvent.run(
        app.id,
        app.application_id,
        payload.action || 'Application Submitted',
        payload.userRole,
        payload.submittedBy,
        payload.timestamp,
        payload.payloadHash,
        JSON.stringify(payload),
        tx.txHash,
        tx.provider,
        tx.network,
        'confirmed',
        tx.blockNumber,
      )
      return
    }

    if (jobType === 'workflow_event') {
      const args = [
        app.application_id,
        payload.action,
        payload.performedBy,
        Math.floor(new Date(payload.timestamp).getTime() / 1000),
      ]
      const tx = await provider.submit('recordWorkflowEvent', args, payload.payloadHash)
      updateAuditTxn.run(tx.txHash, app.id)
      insertAuditEvent.run(
        app.id,
        app.application_id,
        payload.action,
        payload.userRole,
        payload.performedBy,
        payload.timestamp,
        payload.payloadHash,
        JSON.stringify(payload),
        tx.txHash,
        tx.provider,
        tx.network,
        'confirmed',
        tx.blockNumber,
      )
      return
    }

    if (jobType === 'mom_hash') {
      const args = [
        app.application_id,
        payload.momHash,
        payload.finalizedBy,
        Math.floor(new Date(payload.timestamp).getTime() / 1000),
      ]
      const tx = await provider.submit('recordMoMHash', args, payload.payloadHash)
      updateMomHash.run(payload.momHash, tx.txHash, app.id)
      insertAuditEvent.run(
        app.id,
        app.application_id,
        payload.action || 'MoM Finalized',
        payload.userRole,
        payload.finalizedBy,
        payload.timestamp,
        payload.payloadHash,
        JSON.stringify(payload),
        tx.txHash,
        tx.provider,
        tx.network,
        'confirmed',
        tx.blockNumber,
      )
    }
  }

  setInterval(() => {
    processOutboxBatch().catch((error) => {
      console.error('[PARIVESH][Blockchain] Outbox processor error:', error)
    })
  }, 4_000)

  function queueApplicationSubmission(applicationId, options = {}) {
    const app = selectApplication.get(applicationId)
    if (!app) return null
    const submittedAt = options.timestamp || toIsoNow()
    const documentFingerprints = computeDocumentFingerprints(app.id)
    const digestPayload = buildSubmissionDigest({
      applicationRef: app.application_id,
      coordinates: app.coordinates || '',
      submittedAt,
      documentFingerprints,
    })

    const payload = {
      action: options.action || 'Application Submitted',
      applicationRef: app.application_id,
      submittedBy: String(options.performedBy || 'system'),
      userRole: extractRole(options.userRole || options.performedBy || 'proponent'),
      timestamp: submittedAt,
      documentHash: digestPayload.digest,
      payloadHash: sha256Hex(canonicalStringify(digestPayload.payload)),
      documentCount: documentFingerprints.length,
    }

    scheduleJob('application_submission', app.id, payload)
    return payload
  }

  function queueWorkflowEvent(applicationId, action, options = {}) {
    const app = selectApplication.get(applicationId)
    if (!app || !String(action || '').trim()) return null
    const payload = {
      action: String(action).trim(),
      applicationRef: app.application_id,
      performedBy: String(options.performedBy || 'system'),
      userRole: extractRole(options.userRole || options.performedBy || 'system'),
      timestamp: options.timestamp || toIsoNow(),
    }
    payload.payloadHash = sha256Hex(canonicalStringify(payload))

    scheduleJob('workflow_event', app.id, payload)
    return payload
  }

  function queueMoMHash(applicationId, momFilePath, options = {}) {
    const app = selectApplication.get(applicationId)
    if (!app || !momFilePath) return null
    const absolute = path.join(uploadsDir, momFilePath)
    const momHash = sha256File(absolute)
    const payload = {
      action: options.action || 'MoM Finalized',
      applicationRef: app.application_id,
      finalizedBy: String(options.performedBy || 'system'),
      userRole: extractRole(options.userRole || options.performedBy || 'mom'),
      timestamp: options.timestamp || toIsoNow(),
      momHash,
      sourcePath: momFilePath,
    }
    payload.payloadHash = sha256Hex(canonicalStringify(payload))

    scheduleJob('mom_hash', app.id, payload)
    return payload
  }

  function verifyDocumentIntegrity(applicationId) {
    const app = selectApplication.get(applicationId)
    if (!app) {
      return { status: 'unavailable', message: 'Application not found.' }
    }

    const recordedHash = String(app.application_hash || '').trim()
    const recordedAt = String(app.application_hash_recorded_at || '').trim()
    if (!recordedHash || !recordedAt) {
      return {
        status: 'unavailable',
        message: 'No blockchain submission hash recorded yet.',
        expectedHash: null,
        calculatedHash: null,
        txHash: app.blockchain_txn_id || null,
      }
    }

    const docs = computeDocumentFingerprints(app.id)
    const { digest } = buildSubmissionDigest({
      applicationRef: app.application_id,
      coordinates: app.coordinates || '',
      submittedAt: recordedAt,
      documentFingerprints: docs,
    })

    const latestPayload = safeJsonParse(readLatestSubmissionEvent.get(app.id)?.payload_json || '', null)
    const blockchainHash = latestPayload?.documentHash || null

    return {
      status: digest === recordedHash ? 'verified' : 'mismatch',
      message: digest === recordedHash
        ? 'Verified (No changes detected)'
        : 'Integrity mismatch (document set may have been altered)',
      expectedHash: recordedHash,
      calculatedHash: digest,
      blockchainHash,
      txHash: app.blockchain_txn_id || null,
      recordedAt,
      documentCount: docs.length,
    }
  }

  async function verifyDocumentHashFromChain(applicationRef) {
    return provider.verifyDocumentHash(applicationRef)
  }

  function listAuditEvents({ applicationRef = '', limit = 200 } = {}) {
    const rows = listAuditEventsStmt.all(applicationRef, applicationRef, Math.max(1, Math.min(Number(limit) || 200, 1000)))
    const counts = getEventCounts.get(applicationRef, applicationRef)
    return {
      rows,
      totals: {
        total: Number(counts?.total || 0),
        confirmed: Number(counts?.confirmed || 0),
        queued: Number(counts?.queued || 0),
      },
      provider: provider.name,
      network: provider.network,
    }
  }

  return {
    queueApplicationSubmission,
    queueWorkflowEvent,
    queueMoMHash,
    verifyDocumentIntegrity,
    verifyDocumentHashFromChain,
    listAuditEvents,
    processOutboxBatch,
    provider: {
      name: provider.name,
      network: provider.network,
    },
  }
}
