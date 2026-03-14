function safeJsonParse(raw, fallback = null) {
  try {
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

function toStringValue(value) {
  return String(value ?? '').trim()
}

function normalizeDocName(value) {
  return toStringValue(value).toLowerCase().replace(/\s+/g, ' ')
}

function parseCoordinates(raw) {
  const text = toStringValue(raw)
  if (!text) return null

  const parsed = safeJsonParse(text, null)
  if (Array.isArray(parsed) && parsed.length >= 2) {
    const lat = Number(parsed[0])
    const lng = Number(parsed[1])
    if (Number.isFinite(lat) && Number.isFinite(lng)) return [lat, lng]
  }
  if (parsed && typeof parsed === 'object') {
    const lat = Number(parsed.lat ?? parsed.latitude)
    const lng = Number(parsed.lng ?? parsed.longitude ?? parsed.lon)
    if (Number.isFinite(lat) && Number.isFinite(lng)) return [lat, lng]
  }

  const values = text.match(/-?\d+(?:\.\d+)?/g)?.map(Number).filter(Number.isFinite) ?? []
  if (values.length >= 2) {
    const lat = values[0]
    const lng = values[1]
    if (Math.abs(lat) <= 90 && Math.abs(lng) <= 180) return [lat, lng]
  }

  return null
}

function toRadians(value) {
  return (value * Math.PI) / 180
}

function haversineMeters(a, b) {
  const earth = 6371000
  const dLat = toRadians(b[0] - a[0])
  const dLon = toRadians(b[1] - a[1])
  const lat1 = toRadians(a[0])
  const lat2 = toRadians(b[0])
  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2)
  return 2 * earth * Math.asin(Math.sqrt(h))
}

function estimateRiskLevel({ protectedOverlap, distanceToForestMeters, distanceToWaterMeters }) {
  let score = 0
  if (protectedOverlap) score += 3
  if (distanceToWaterMeters !== null && distanceToWaterMeters < 1000) score += 1
  if (distanceToForestMeters !== null && distanceToForestMeters < 2000) score += 1

  if (score >= 4) return 'High'
  if (score >= 2) return 'Medium'
  return 'Low'
}

function truncateForPrompt(value, max = 4000) {
  const text = toStringValue(value)
  if (text.length <= max) return text
  return `${text.slice(0, max)}...`
}

function createHeuristicDocumentInsights(documents, environmentalData) {
  const impactText = toStringValue(environmentalData.impact).toLowerCase()
  const resourceText = toStringValue(environmentalData.resources).toLowerCase()
  const wasteText = toStringValue(environmentalData.wastePlan).toLowerCase()

  return documents.map((doc) => {
    const insights = []
    const name = toStringValue(doc.doc_name).toLowerCase()

    if (name.includes('eia') || name.includes('impact')) {
      insights.push('Environmental impact details are available and should be cross-verified against mitigation actions.')
      if (impactText.includes('air')) insights.push('Potential air quality impact is referenced in the application narrative.')
      if (impactText.includes('water')) insights.push('Potential water impact is referenced and needs scrutiny validation.')
    }

    if (name.includes('land')) {
      insights.push('Land ownership and land-use compatibility should be validated with submitted coordinates and area.')
    }

    if (resourceText) {
      insights.push('Resource usage statements are present; verify quantities against sector norms.')
    }

    if (wasteText) {
      insights.push('Waste management commitments are stated; verify implementation feasibility.')
    }

    if (!insights.length) {
      insights.push('Document uploaded; verify completeness, consistency, and environmental commitments during scrutiny.')
    }

    return {
      documentName: doc.doc_name,
      insights: insights.slice(0, 3),
    }
  })
}

async function fetchOverpassDistance(center, queryBody) {
  const [lat, lon] = center
  const body = `[out:json][timeout:20];(${queryBody});out center tags 80;`

  const res = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body,
  })
  if (!res.ok) return null

  const payload = await res.json()
  const rows = Array.isArray(payload?.elements) ? payload.elements : []
  if (!rows.length) return null

  let best = Number.POSITIVE_INFINITY
  for (const row of rows) {
    const rowLat = Number.isFinite(row.lat) ? row.lat : row?.center?.lat
    const rowLon = Number.isFinite(row.lon) ? row.lon : row?.center?.lon
    if (!Number.isFinite(rowLat) || !Number.isFinite(rowLon)) continue
    const distance = haversineMeters(center, [rowLat, rowLon])
    best = Math.min(best, distance)
  }

  if (!Number.isFinite(best)) return null
  return best
}

async function computeGisIndicators(appRow) {
  const center = parseCoordinates(appRow.coordinates)
  if (!center) {
    return {
      distanceToForestMeters: null,
      distanceToWaterMeters: null,
      nearestProtectedAreaMeters: null,
      protectedAreaOverlap: false,
      riskLevel: 'Low',
      note: 'Coordinates unavailable for GIS proximity calculation.',
    }
  }

  const [lat, lon] = center
  const around10k = `(around:10000,${lat},${lon})`
  const around15k = `(around:15000,${lat},${lon})`

  const [forest, water, protectedDist] = await Promise.all([
    fetchOverpassDistance(center, `nwr["landuse"="forest"]${around10k};nwr["natural"="wood"]${around10k};`),
    fetchOverpassDistance(center, `nwr["natural"="water"]${around10k};nwr["waterway"]${around10k};nwr["water"]${around10k};`),
    fetchOverpassDistance(center, `nwr["boundary"="protected_area"]${around15k};nwr["leisure"="nature_reserve"]${around15k};nwr["protect_class"]${around15k};`),
  ])

  const siteRadiusMeters = Math.max(120, Math.sqrt(Math.max(0, Number(appRow.land_area || 0) * 10000) / Math.PI))
  const protectedOverlap = protectedDist !== null && protectedDist <= siteRadiusMeters

  return {
    distanceToForestMeters: forest,
    distanceToWaterMeters: water,
    nearestProtectedAreaMeters: protectedDist,
    protectedAreaOverlap: protectedOverlap,
    riskLevel: estimateRiskLevel({
      protectedOverlap,
      distanceToForestMeters: forest,
      distanceToWaterMeters: water,
    }),
    note: null,
  }
}

function formatDistance(meters) {
  if (meters === null || Number.isNaN(meters)) return 'Not available'
  if (meters < 1000) return `${Math.round(meters)} m`
  return `${(meters / 1000).toFixed(1)} km`
}

function buildHeuristicReport({ appRow, docs, deficiencies, gisIndicators, environmentalData }) {
  const missingDocs = deficiencies
    .filter((d) => d.type === 'required_document')
    .map((d) => d.message)
  const dataIssues = deficiencies
    .filter((d) => d.type !== 'required_document')
    .map((d) => d.message)

  const environmentalObservations = [
    `Distance to forest area: ${formatDistance(gisIndicators.distanceToForestMeters)}.`,
    `Nearest water body: ${formatDistance(gisIndicators.distanceToWaterMeters)}.`,
    `Protected area overlap: ${gisIndicators.protectedAreaOverlap ? 'Yes' : 'No'}.`,
    `Environmental risk level: ${gisIndicators.riskLevel}.`,
  ]
  if (gisIndicators.note) environmentalObservations.push(gisIndicators.note)

  if (!toStringValue(environmentalData.impact)) {
    dataIssues.push('Environmental impact description is incomplete.')
  }
  if (!toStringValue(environmentalData.resources)) {
    dataIssues.push('Resource usage section is incomplete.')
  }
  if (!toStringValue(environmentalData.wastePlan)) {
    dataIssues.push('Waste management plan is incomplete.')
  }

  const recommendedActions = [
    ...missingDocs.map((line) => `Resolve document gap: ${line}`),
    ...dataIssues.slice(0, 4).map((line) => `Correct data issue: ${line}`),
  ]

  if (!recommendedActions.length) {
    recommendedActions.push('No major compliance gaps detected. Proceed with standard scrutiny verification.')
  }

  const verificationFocusAreas = [
    'Verify supporting documents against sector checklist and environmental declarations.',
    'Validate coordinates and land area consistency with project category.',
    'Cross-check mitigation strategy against observed GIS proximity indicators.',
  ]

  return {
    title: 'AI Compliance Report',
    advisoryOnly: true,
    model: 'heuristic-fallback',
    documentIssues: Array.from(new Set(missingDocs)).slice(0, 6),
    dataIssues: Array.from(new Set(dataIssues)).slice(0, 8),
    environmentalObservations: Array.from(new Set(environmentalObservations)).slice(0, 6),
    recommendedActions: Array.from(new Set(recommendedActions)).slice(0, 8),
    verificationFocusAreas,
    documentInsights: createHeuristicDocumentInsights(docs, environmentalData),
    gisIndicators,
  }
}

function normalizeLlmReport(raw, fallback) {
  if (!raw || typeof raw !== 'object') return fallback

  const asArray = (value) => (Array.isArray(value) ? value.map((x) => toStringValue(x)).filter(Boolean) : [])
  const documentInsights = Array.isArray(raw.documentInsights)
    ? raw.documentInsights
        .map((row) => {
          if (!row || typeof row !== 'object') return null
          const documentName = toStringValue(row.documentName)
          const insights = asArray(row.insights)
          if (!documentName && !insights.length) return null
          return {
            documentName: documentName || 'Uploaded document',
            insights: insights.length ? insights.slice(0, 4) : ['Requires manual scrutiny review.'],
          }
        })
        .filter(Boolean)
    : fallback.documentInsights

  return {
    ...fallback,
    model: toStringValue(raw.model) || fallback.model,
    documentIssues: asArray(raw.documentIssues).slice(0, 8),
    dataIssues: asArray(raw.dataIssues).slice(0, 8),
    environmentalObservations: asArray(raw.environmentalObservations).slice(0, 8),
    recommendedActions: asArray(raw.recommendedActions).slice(0, 8),
    verificationFocusAreas: asArray(raw.verificationFocusAreas).slice(0, 6),
    documentInsights,
  }
}

async function callOpenAiForReport({ appRow, docs, deficiencies, gisIndicators, environmentalData }) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return null

  const model = process.env.AI_COMPLIANCE_MODEL || 'gpt-4o-mini'
  const promptPayload = {
    project: {
      applicationId: appRow.application_id,
      category: appRow.category,
      sector: appRow.sector_name,
      projectName: appRow.project_name,
      organization: appRow.organization,
      projectType: appRow.project_type,
      estimatedCost: appRow.estimated_cost,
      state: appRow.state,
      district: appRow.district,
      coordinates: appRow.coordinates,
      landArea: appRow.land_area,
      projectDescription: truncateForPrompt(appRow.project_description, 1200),
      environmentalData,
    },
    documents: docs.map((doc) => ({
      name: doc.doc_name,
      originalName: doc.original_name,
      status: doc.verification_status,
      deficiencyComment: truncateForPrompt(doc.deficiency_comment, 300),
    })),
    detectedDeficiencies: deficiencies,
    gisIndicators,
  }

  const instructions = [
    'You are an environmental compliance analyst for India PARIVESH clearances.',
    'Return STRICT JSON only with keys: model, documentIssues, dataIssues, environmentalObservations, recommendedActions, verificationFocusAreas, documentInsights.',
    'documentInsights must be an array of objects: { documentName: string, insights: string[] }.',
    'Each list should be concise bullet-ready text and advisory-only.',
    'Do not include markdown or code fences.',
  ].join(' ')

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: instructions },
        { role: 'user', content: JSON.stringify(promptPayload) },
      ],
    }),
  })

  if (!res.ok) {
    const detail = await res.text()
    throw new Error(`OpenAI request failed (${res.status}): ${detail.slice(0, 300)}`)
  }

  const payload = await res.json()
  const content = payload?.choices?.[0]?.message?.content
  if (!content) return null
  return safeJsonParse(content, null)
}

export function createAiComplianceService({ db }) {
  const queued = new Set()

  const collectContext = async (appId) => {
    const appRow = db.prepare(`
      SELECT a.*, s.name as sector_name, u.full_name as owner_name
      FROM applications a
      JOIN sectors s ON s.id = a.sector_id
      JOIN users u ON u.id = a.owner_user_id
      WHERE a.id = ?
    `).get(appId)
    if (!appRow) return null

    const docs = db.prepare(
      'SELECT id, doc_name, original_name, verification_status, deficiency_comment, uploaded_at FROM application_documents WHERE application_id = ? ORDER BY uploaded_at DESC'
    ).all(appId)

    const payment = db.prepare(
      'SELECT status, amount, upi_ref, updated_at FROM application_payments WHERE application_id = ? ORDER BY id DESC LIMIT 1'
    ).get(appId) ?? null

    const uploadedByName = new Map()
    for (const doc of docs) {
      const key = normalizeDocName(doc.doc_name)
      if (!uploadedByName.has(key)) uploadedByName.set(key, [])
      uploadedByName.get(key).push(doc)
    }

    const deficiencies = []

    const requiredDocs = db.prepare(
      'SELECT doc_name FROM sector_doc_checklists WHERE sector_id = ? AND category = ? AND required = 1 ORDER BY sort_order ASC, id ASC'
    ).all(appRow.sector_id, appRow.category)

    for (const reqDoc of requiredDocs) {
      const expected = toStringValue(reqDoc.doc_name)
      const matched = uploadedByName.get(normalizeDocName(expected)) || []
      if (!matched.length) {
        deficiencies.push({
          type: 'required_document',
          field: expected,
          message: `Required document "${expected}" is missing.`,
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
      if (!toStringValue(value)) {
        deficiencies.push({
          type: 'mandatory_field',
          field,
          message: `Mandatory field "${field}" is empty.`,
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

    if (!payment || !['Pending Verification', 'Verified'].includes(toStringValue(payment.status))) {
      deficiencies.push({
        type: 'data_correctness',
        field: 'payment.status',
        message: 'Payment status should be Pending Verification or Verified before scrutiny review.',
      })
    }

    const environmentalData = safeJsonParse(appRow.environmental_data, {}) || {}

    return { appRow, docs, payment, deficiencies, environmentalData }
  }

  const generateAndStoreComplianceReport = async (appId, trigger = 'submitted') => {
    const context = await collectContext(appId)
    if (!context) return null

    const { appRow, docs, deficiencies, environmentalData } = context
    const gisIndicators = await computeGisIndicators(appRow)
    const fallbackReport = buildHeuristicReport({
      appRow,
      docs,
      deficiencies,
      gisIndicators,
      environmentalData,
    })

    let report = fallbackReport
    let source = 'heuristic'

    try {
      const provider = toStringValue(process.env.AI_COMPLIANCE_PROVIDER || 'heuristic').toLowerCase()
      if (provider === 'openai') {
        const llmReport = await callOpenAiForReport({
          appRow,
          docs,
          deficiencies,
          gisIndicators,
          environmentalData,
        })
        if (llmReport) {
          report = normalizeLlmReport(llmReport, fallbackReport)
          source = 'openai'
        }
      }
    } catch (error) {
      console.error('[PARIVESH] AI compliance LLM call failed, using heuristic fallback.', error)
    }

    const payload = {
      ...report,
      generatedAt: new Date().toISOString(),
      trigger,
      source,
    }

    db.prepare(
      'UPDATE applications SET ai_compliance_report = ?, updated_at = datetime(\'now\') WHERE id = ?'
    ).run(JSON.stringify(payload), appRow.id)

    return payload
  }

  const queueAiCompliancePrecheck = (appId, trigger = 'submitted') => {
    const key = `${appId}`
    if (queued.has(key)) return
    queued.add(key)

    setTimeout(async () => {
      try {
        await generateAndStoreComplianceReport(appId, trigger)
      } catch (error) {
        console.error('[PARIVESH] AI compliance pre-check failed', error)
      } finally {
        queued.delete(key)
      }
    }, 0)
  }

  return {
    queueAiCompliancePrecheck,
    generateAndStoreComplianceReport,
  }
}
