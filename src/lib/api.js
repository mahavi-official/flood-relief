import { APPS_SCRIPT_URL, getClientId } from './config'

// Hidden honeypot field name. Real users never see or fill this input;
// bots that auto-fill every field on a form will. Any non-empty value
// here makes the backend silently drop the submission.
export const HONEYPOT_FIELD = 'website'

class ApiError extends Error {}

function assertConfigured() {
  if (!APPS_SCRIPT_URL) {
    throw new ApiError('NOT_CONFIGURED')
  }
}

// Submits a report. `type` is 'missing' | 'found' | 'help'.
// Sent as text/plain on purpose — see README — so the browser does not
// trigger a CORS preflight against the Apps Script Web App.
export async function submitReport(type, payload) {
  assertConfigured()
  const body = JSON.stringify({
    type,
    clientId: getClientId(),
    ...payload
  })

  const res = await fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    body
  })

  if (!res.ok) throw new ApiError('SUBMIT_FAILED')
  const json = await res.json()
  if (!json.ok) throw new ApiError(json.error || 'SUBMIT_FAILED')
  return json
}

// Fetches public reports of a given type, newest first.
export async function fetchReports(type) {
  assertConfigured()
  const url = `${APPS_SCRIPT_URL}?type=${encodeURIComponent(type)}`
  const res = await fetch(url)
  if (!res.ok) throw new ApiError('FETCH_FAILED')
  const json = await res.json()
  if (!json.ok) throw new ApiError(json.error || 'FETCH_FAILED')
  return json.rows || []
}

export { ApiError }
