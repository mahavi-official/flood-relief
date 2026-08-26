import { parseCsv } from './csv';
import { parseSheetDate } from './format';
import { DATA_CACHE_MS, HIDDEN_STATUSES, SHEETS } from '../site.config';

export type SheetKey = keyof typeof SHEETS;

export interface SheetRow {
  /** Stable enough to use as a React key and a deep link. */
  id: string;
  submittedAt: number | null;
  values: Record<string, string>;
}

export interface SheetResult {
  rows: SheetRow[];
  /** True when we fell back to the bundled demo CSV because no Sheet is wired up. */
  isSample: boolean;
  fetchedAt: number;
}

const cache = new Map<SheetKey, { at: number; result: SheetResult }>();
const inflight = new Map<SheetKey, Promise<SheetResult>>();

function sampleUrl(key: SheetKey): string {
  return `${import.meta.env.BASE_URL}sample-data/${key}.csv`;
}

/**
 * Google's published-CSV endpoint sends `access-control-allow-origin: *`, so a
 * plain fetch from the browser is enough — no API key and no proxy.
 */
export async function loadSheet(key: SheetKey, force = false): Promise<SheetResult> {
  const cached = cache.get(key);
  if (!force && cached && Date.now() - cached.at < DATA_CACHE_MS) return cached.result;

  const existing = inflight.get(key);
  if (existing && !force) return existing;

  const promise = fetchSheet(key)
    .then((result) => {
      cache.set(key, { at: Date.now(), result });
      return result;
    })
    .finally(() => inflight.delete(key));

  inflight.set(key, promise);
  return promise;
}

async function fetchSheet(key: SheetKey): Promise<SheetResult> {
  const config = SHEETS[key];
  const isSample = !config.csvUrl;
  const url = isSample ? sampleUrl(key) : config.csvUrl;

  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) throw new Error(`Sheet ${key} responded ${response.status}`);

  const table = parseCsv(await response.text());
  const columns = config.columns as Record<string, number>;

  // Row 0 is the header Google writes from the question text; skip it.
  const rows = table.slice(1).map<SheetRow>((cells, index) => {
    const values: Record<string, string> = {};
    for (const [field, columnIndex] of Object.entries(columns)) {
      values[field] = (cells[columnIndex] ?? '').trim();
    }
    return {
      id: `${key}-${index}-${values.timestamp ?? ''}`,
      submittedAt: parseSheetDate(values.timestamp ?? ''),
      values,
    };
  });

  const visible = rows.filter(
    (row) => !HIDDEN_STATUSES.includes((row.values.status ?? '').trim().toLowerCase()),
  );

  // Newest first: a two-hour-old rescue request matters more than a two-day-old one.
  visible.sort((a, b) => (b.submittedAt ?? 0) - (a.submittedAt ?? 0));

  return { rows: visible, isSample, fetchedAt: Date.now() };
}
