/**
 * Nepal Flood Relief — Apps Script backend.
 *
 * Turns a Google Sheet into a tiny public API for the React frontend:
 *   - doPost writes a new Missing / Found / Help row.
 *   - doGet reads back all open rows of one type as JSON.
 *
 * SETUP (see the top-level README.md for the full walkthrough):
 *   1. Create a Google Sheet. Open Extensions > Apps Script and paste this file in.
 *   2. Optionally set SPREADSHEET_ID below if this script is NOT bound to the sheet.
 *   3. Deploy > New deployment > "Web app".
 *        Execute as:    Me
 *        Who has access: Anyone
 *   4. Copy the deployment URL into the frontend's VITE_APPS_SCRIPT_URL (.env).
 *
 * WHY text/plain instead of application/json:
 *   Apps Script Web Apps cannot reliably answer CORS preflight (OPTIONS)
 *   requests. The frontend deliberately posts a JSON *string* as the request
 *   body without setting a Content-Type header, so the browser defaults to
 *   `text/plain`, which is a CORS "simple request" and skips the preflight
 *   entirely. This file parses that string back into JSON itself.
 */

// If this script is bound to the spreadsheet (Extensions > Apps Script from
// within the sheet), leave this blank — getActiveSpreadsheet() is used.
// If it's a standalone script, paste the spreadsheet ID from its URL here.
const SPREADSHEET_ID = ''

const DRIVE_FOLDER_NAME = 'Nepal Flood Relief Photos'
const HONEYPOT_FIELD = 'website'

// Basic abuse throttle per browser (see config.js on the frontend for why
// this is a deterrent, not a security boundary).
const RATE_LIMIT_SECONDS = 20
const RATE_LIMIT_MAX_PER_HOUR = 8

const SHEET_CONFIG = {
  missing: {
    name: 'Missing',
    columns: [
      'id', 'timestamp', 'name', 'age', 'gender', 'district', 'location',
      'lastSeenAt', 'description', 'reporterName', 'reporterPhone', 'photo',
      'notes', 'status', 'clientId'
    ],
    required: ['name', 'district', 'location', 'reporterName', 'reporterPhone']
  },
  found: {
    name: 'Found',
    columns: [
      'id', 'timestamp', 'name', 'age', 'gender', 'location', 'condition',
      'shelter', 'reporterName', 'reporterPhone', 'photo', 'notes', 'status',
      'clientId'
    ],
    required: ['name', 'location', 'reporterName', 'reporterPhone']
  },
  help: {
    name: 'Help',
    columns: [
      'id', 'timestamp', 'needType', 'contactPhone', 'lat', 'lng',
      'locationText', 'numPeople', 'details', 'status', 'clientId'
    ],
    required: ['needType', 'contactPhone']
  }
}

function doGet(e) {
  try {
    const type = e.parameter.type
    const config = SHEET_CONFIG[type]
    if (!config) return jsonOut({ ok: false, error: 'UNKNOWN_TYPE' })

    const sheet = getSheet(config)
    const rows = readRows(sheet, config.columns).filter((r) => {
      const s = (r.status || '').toLowerCase()
      return s !== 'resolved' && s !== 'closed'
    })
    return jsonOut({ ok: true, rows })
  } catch (err) {
    return jsonOut({ ok: false, error: String(err) })
  }
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents)
    const type = body.type
    const config = SHEET_CONFIG[type]
    if (!config) return jsonOut({ ok: false, error: 'UNKNOWN_TYPE' })

    // Honeypot: bots fill every field; real users never see this one.
    // Pretend success so the bot doesn't learn anything, but write nothing.
    if (body[HONEYPOT_FIELD]) {
      return jsonOut({ ok: true, id: null })
    }

    for (const field of config.required) {
      if (!body[field] || String(body[field]).trim() === '') {
        return jsonOut({ ok: false, error: 'MISSING_FIELDS' })
      }
    }

    // help requests need either GPS coords or a typed location
    if (type === 'help' && !(body.lat && body.lng) && !body.locationText) {
      return jsonOut({ ok: false, error: 'MISSING_FIELDS' })
    }

    const rateLimitError = checkRateLimit(type, body.clientId)
    if (rateLimitError) return jsonOut({ ok: false, error: rateLimitError })

    let photoUrl = ''
    if (body.photo) {
      try {
        photoUrl = savePhoto(body.photo, body.name || type)
      } catch (photoErr) {
        // A failed photo upload should never block a life-safety report.
        photoUrl = ''
      }
    }

    const id = Utilities.getUuid()
    const record = Object.assign({}, body, {
      id: id,
      timestamp: new Date().toISOString(),
      status: 'open',
      photo: photoUrl
    })

    const sheet = getSheet(config)
    const row = config.columns.map((col) => (record[col] !== undefined ? record[col] : ''))
    sheet.appendRow(row)

    return jsonOut({ ok: true, id: id })
  } catch (err) {
    return jsonOut({ ok: false, error: String(err) })
  }
}

// ---------- helpers ----------

function getSpreadsheet() {
  return SPREADSHEET_ID ? SpreadsheetApp.openById(SPREADSHEET_ID) : SpreadsheetApp.getActiveSpreadsheet()
}

function getSheet(config) {
  const ss = getSpreadsheet()
  let sheet = ss.getSheetByName(config.name)
  if (!sheet) {
    sheet = ss.insertSheet(config.name)
  }
  const firstRow = sheet.getRange(1, 1, 1, config.columns.length).getValues()[0]
  const hasHeaders = firstRow.join('') !== ''
  if (!hasHeaders) {
    sheet.getRange(1, 1, 1, config.columns.length).setValues([config.columns])
    sheet.setFrozenRows(1)
  }
  return sheet
}

function readRows(sheet, columns) {
  const lastRow = sheet.getLastRow()
  if (lastRow < 2) return []
  const values = sheet.getRange(2, 1, lastRow - 1, columns.length).getValues()
  return values
    .filter((r) => r.join('') !== '')
    .map((r) => {
      const obj = {}
      columns.forEach((col, i) => {
        obj[col] = r[i]
      })
      return obj
    })
}

function checkRateLimit(type, clientId) {
  if (!clientId) return null // can't rate-limit what we can't identify; let it through
  const cache = CacheService.getScriptCache()
  const key = 'rl:' + type + ':' + clientId
  const now = Date.now()
  const raw = cache.get(key)
  const state = raw ? JSON.parse(raw) : { last: 0, count: 0, windowStart: now }

  if (now - state.last < RATE_LIMIT_SECONDS * 1000) {
    return 'RATE_LIMITED'
  }
  if (now - state.windowStart > 3600 * 1000) {
    state.windowStart = now
    state.count = 0
  }
  if (state.count >= RATE_LIMIT_MAX_PER_HOUR) {
    return 'RATE_LIMITED'
  }

  state.last = now
  state.count += 1
  cache.put(key, JSON.stringify(state), 3600)
  return null
}

function savePhoto(base64, label) {
  const folder = getOrCreateFolder(DRIVE_FOLDER_NAME)
  const bytes = Utilities.base64Decode(base64)
  const blob = Utilities.newBlob(bytes, 'image/jpeg', sanitizeFileName(label) + '-' + Date.now() + '.jpg')
  const file = folder.createFile(blob)
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW)
  return 'https://drive.google.com/uc?export=view&id=' + file.getId()
}

function getOrCreateFolder(name) {
  const it = DriveApp.getFoldersByName(name)
  if (it.hasNext()) return it.next()
  return DriveApp.createFolder(name)
}

function sanitizeFileName(name) {
  return String(name).replace(/[^a-zA-Z0-9-_]/g, '_').slice(0, 40) || 'photo'
}

function jsonOut(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON)
}
