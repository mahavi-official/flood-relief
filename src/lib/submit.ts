import { FORMS, type FormKey } from '../site.config';

export interface QueuedSubmission {
  key: FormKey;
  values: Record<string, string>;
  queuedAt: number;
}

const QUEUE_KEY = 'flood-relief:queue';

export class FormNotConfiguredError extends Error {
  constructor(key: FormKey) {
    super(`No Google Form id configured for "${key}"`);
    this.name = 'FormNotConfiguredError';
  }
}

function endpoint(key: FormKey): string {
  const { formId } = FORMS[key];
  if (!formId) throw new FormNotConfiguredError(key);
  return `https://docs.google.com/forms/d/e/${formId}/formResponse`;
}

/** Turns our field names into the `entry.123456` names Google expects. */
function toGoogleBody(key: FormKey, values: Record<string, string>): URLSearchParams {
  const fields = FORMS[key].fields as Record<string, string>;
  const body = new URLSearchParams();
  for (const [field, value] of Object.entries(values)) {
    const entry = fields[field];
    if (entry && value !== '') body.append(entry, value);
  }
  return body;
}

/**
 * Google Forms sends no CORS headers, so this is a `no-cors` POST: the browser
 * delivers the body but hands us back an opaque response we cannot inspect.
 * A resolved promise therefore means "the request left the device", not "Google
 * stored it" — which is why the success screen tells people to check the public
 * list rather than promising the report is saved.
 */
export async function submitToGoogleForm(
  key: FormKey,
  values: Record<string, string>,
): Promise<void> {
  const url = endpoint(key);
  await fetch(url, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: toGoogleBody(key, values).toString(),
  });
}

export function readQueue(): QueuedSubmission[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? (JSON.parse(raw) as QueuedSubmission[]) : [];
  } catch {
    return [];
  }
}

function writeQueue(items: QueuedSubmission[]): void {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(items));
  } catch {
    // Storage full or blocked; nothing useful we can do from here.
  }
}

/** Keeps a report that could not be sent so a returning connection can flush it. */
export function enqueue(key: FormKey, values: Record<string, string>): void {
  writeQueue([...readQueue(), { key, values, queuedAt: Date.now() }]);
}

/**
 * Tries every queued report once. Anything that fails again stays queued, so a
 * flapping connection cannot silently drop somebody's SOS.
 */
export async function flushQueue(): Promise<number> {
  const queue = readQueue();
  if (queue.length === 0) return 0;

  const stillPending: QueuedSubmission[] = [];
  let sent = 0;

  for (const item of queue) {
    try {
      await submitToGoogleForm(item.key, item.values);
      sent++;
    } catch (error) {
      // An unconfigured form will never succeed; drop it rather than retry forever.
      if (!(error instanceof FormNotConfiguredError)) stillPending.push(item);
    }
  }

  writeQueue(stillPending);
  return sent;
}

export function isFormConfigured(key: FormKey): boolean {
  return FORMS[key].formId !== '';
}
