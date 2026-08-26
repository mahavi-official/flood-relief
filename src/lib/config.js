// Set VITE_APPS_SCRIPT_URL in a .env file (see .env.example) after you deploy
// the Apps Script Web App from /google-apps-script/Code.gs.
export const APPS_SCRIPT_URL = import.meta.env.VITE_APPS_SCRIPT_URL || ''

export const REPORT_TYPES = {
  MISSING: 'missing',
  FOUND: 'found',
  HELP: 'help'
}

// Districts most affected list is intentionally left open-ended — free text
// entry is used instead of a fixed dropdown so the form still works for any
// district without needing a code update mid-crisis.

// Basic client-side abuse deterrent: a per-browser id sent with every
// submission so the backend can rate-limit repeat submissions from the same
// client. It is NOT a security boundary (a determined spammer can reset it),
// just a cheap first line of defence per the brief's "basic spam protection"
// requirement.
const CLIENT_ID_KEY = 'flood-relief-client-id'
export function getClientId() {
  try {
    let id = localStorage.getItem(CLIENT_ID_KEY)
    if (!id) {
      id = (crypto.randomUUID && crypto.randomUUID()) || `${Date.now()}-${Math.random().toString(16).slice(2)}`
      localStorage.setItem(CLIENT_ID_KEY, id)
    }
    return id
  } catch {
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`
  }
}
