import { MIN_FILL_MS, RATE_LIMIT } from '../site.config';

/**
 * No backend means no server-side spam filter, so this is deliberately a set of
 * cheap client-side speed bumps rather than real security. The actual defence is
 * a human reading the Sheet and marking bad rows `spam` (see SETUP.md).
 */

export const HONEYPOT_NAME = 'website_url';

/** A bot fills every input it can find; a person never sees this one. */
export function honeypotTripped(form: HTMLFormElement): boolean {
  const field = form.elements.namedItem(HONEYPOT_NAME);
  return field instanceof HTMLInputElement && field.value.trim() !== '';
}

export function filledTooFast(startedAt: number): boolean {
  return Date.now() - startedAt < MIN_FILL_MS;
}

const RATE_KEY = 'flood-relief:submissions';

function readStamps(): number[] {
  try {
    const raw = localStorage.getItem(RATE_KEY);
    return raw ? (JSON.parse(raw) as number[]) : [];
  } catch {
    return [];
  }
}

export function rateLimited(): boolean {
  const cutoff = Date.now() - RATE_LIMIT.windowMs;
  return readStamps().filter((t) => t > cutoff).length >= RATE_LIMIT.max;
}

export function recordSubmission(): void {
  try {
    const cutoff = Date.now() - RATE_LIMIT.windowMs;
    const stamps = [...readStamps().filter((t) => t > cutoff), Date.now()];
    localStorage.setItem(RATE_KEY, JSON.stringify(stamps));
  } catch {
    // Private browsing with storage disabled — the other checks still apply.
  }
}

export interface MathChallenge {
  a: number;
  b: number;
  answer: number;
}

/**
 * A two-number sum instead of a hosted CAPTCHA: no third-party script, no extra
 * bytes on a 2G connection, and it reads the same in Nepali and English.
 * Deliberately NOT used on the SOS form, where seconds matter more than spam.
 */
export function makeChallenge(): MathChallenge {
  const a = 1 + Math.floor(Math.random() * 5);
  const b = 1 + Math.floor(Math.random() * 4);
  return { a, b, answer: a + b };
}
