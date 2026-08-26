import { fmt, localeNum, type Lang } from '../i18n';
import { dictFor } from '../i18n';

/**
 * Google Sheets writes its timestamp in the spreadsheet's own locale, so we
 * accept the three shapes that actually turn up rather than trusting Date.parse.
 */
export function parseSheetDate(value: string): number | null {
  const s = value.trim();
  if (!s) return null;

  // ISO-ish: 2026-08-26 14:33:21 or 2026-08-26T14:33:21Z
  const iso = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{1,2}):(\d{2})(?::(\d{2}))?/.exec(s);
  if (iso) {
    const [, y, mo, d, h, mi, se] = iso;
    return new Date(+y, +mo - 1, +d, +h, +mi, +(se ?? 0)).getTime();
  }

  // Google's default en-US export: 8/26/2026 14:33:21
  const us = /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[ ,]+(\d{1,2}):(\d{2})(?::(\d{2}))?)?\s*(AM|PM)?/i.exec(s);
  if (us) {
    const [, mo, d, y, h, mi, se, ampm] = us;
    let hour = h ? +h : 0;
    if (ampm) {
      const upper = ampm.toUpperCase();
      if (upper === 'PM' && hour < 12) hour += 12;
      if (upper === 'AM' && hour === 12) hour = 0;
    }
    return new Date(+y, +mo - 1, +d, hour, mi ? +mi : 0, se ? +se : 0).getTime();
  }

  const fallback = Date.parse(s);
  return Number.isNaN(fallback) ? null : fallback;
}

export function timeAgo(ts: number | null, lang: Lang, now = Date.now()): string {
  const t = dictFor(lang);
  if (ts === null) return '';
  const mins = Math.floor((now - ts) / 60_000);
  if (mins < 1) return t.common.justNow;
  if (mins < 60) return fmt(t.common.minutesAgo, { n: localeNum(mins, lang) });
  const hours = Math.floor(mins / 60);
  if (hours < 24) return fmt(t.common.hoursAgo, { n: localeNum(hours, lang) });
  return fmt(t.common.daysAgo, { n: localeNum(Math.floor(hours / 24), lang) });
}

/** Strip spaces and dashes so `tel:` links work on every phone. */
export function telHref(phone: string): string {
  return 'tel:' + phone.replace(/[^\d+]/g, '');
}

export function isLikelyPhone(phone: string): boolean {
  const digits = phone.replace(/[^\d]/g, '');
  return digits.length >= 7 && digits.length <= 15;
}

export function mapsHref(lat: string | number, lng: string | number): string {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}

export function parseCoord(value: string | undefined): number | null {
  if (!value) return null;
  const n = Number(value.trim());
  return Number.isFinite(n) && n !== 0 ? n : null;
}
