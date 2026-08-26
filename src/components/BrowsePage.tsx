import { useMemo, useState, type ReactNode } from 'react';
import { fmt, localeNum, useLang, useT } from '../i18n';
import { DISTRICTS } from '../data/districts';
import { timeAgo } from '../lib/format';
import { useSheet } from '../lib/useSheet';
import type { SheetKey, SheetRow } from '../lib/sheets';
import { SHEETS } from '../site.config';
import { Layout } from '../components/Layout';
import type { PageKey } from '../routes';

interface Props {
  page: PageKey;
  sheetKey: SheetKey;
  heading: string;
  intro: string;
  /** Fields a free-text search should look inside, e.g. name and place. */
  searchFields: string[];
  renderCard: (row: SheetRow) => ReactNode;
  /** Extra controls (the map/list tabs, the need filter) rendered under the search box. */
  toolbar?: (rows: SheetRow[]) => ReactNode;
  children?: (rows: SheetRow[]) => ReactNode;
}

/**
 * Shared shell for the three public lists: fetch, search, filter, render.
 * Search runs over the rows already in memory — with a few thousand reports that
 * is instant, and it keeps working when the connection drops mid-session.
 */
export function BrowsePage({
  page,
  sheetKey,
  heading,
  intro,
  searchFields,
  renderCard,
  toolbar,
  children,
}: Props) {
  const t = useT();
  const lang = useLang();
  const { state, refresh } = useSheet(sheetKey);
  const [query, setQuery] = useState('');
  const [district, setDistrict] = useState('');

  const rows = state.status === 'ready' ? state.data.rows : [];

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (district && row.values.district !== district) return false;
      if (!needle) return true;
      return searchFields.some((field) =>
        (row.values[field] ?? '').toLowerCase().includes(needle),
      );
    });
  }, [rows, query, district, searchFields]);

  return (
    <Layout page={page}>
      <div className="wrap">
        <h1>{heading}</h1>
        <p className="lede">{intro}</p>

        {state.status === 'ready' && state.data.isSample && (
          <p className="notice notice--warn">{t.list.sampleBanner}</p>
        )}

        <div className="filters">
          <input
            id="q"
            type="search"
            value={query}
            aria-label={t.common.search}
            placeholder={t.common.searchPlaceholder}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="filters-row">
            <select
              value={district}
              aria-label={t.common.district}
              onChange={(e) => setDistrict(e.target.value)}
            >
              <option value="">{t.common.allDistricts}</option>
              {DISTRICTS.map((d) => (
                <option key={d.en} value={d.en}>
                  {lang === 'ne' ? d.ne : d.en}
                </option>
              ))}
            </select>
            {(query || district) && (
              <button
                type="button"
                className="btn btn--sm btn--ghost"
                onClick={() => {
                  setQuery('');
                  setDistrict('');
                }}
              >
                {t.common.clearFilters}
              </button>
            )}
          </div>
        </div>

        {toolbar?.(filtered)}

        {state.status === 'loading' && (
          <div className="cards" aria-busy="true">
            <div className="skeleton" />
            <div className="skeleton" />
            <div className="skeleton" />
            <p className="card-time">{t.common.loading}</p>
          </div>
        )}

        {state.status === 'error' && (
          <div className="notice notice--error">
            <p>
              <strong>{t.list.loadError}</strong> {t.list.loadErrorHelp}
            </p>
            <div className="btn-row">
              <button type="button" className="btn btn--sm" onClick={refresh}>
                {t.common.retry}
              </button>
              {SHEETS[sheetKey].sheetUrl && (
                <a
                  className="btn btn--sm btn--ghost"
                  href={SHEETS[sheetKey].sheetUrl}
                  rel="noreferrer noopener"
                >
                  {t.list.openSheet}
                </a>
              )}
            </div>
          </div>
        )}

        {state.status === 'ready' && (
          <>
            <div className="result-meta">
              <span>{fmt(t.common.resultCount, { n: localeNum(filtered.length, lang) })}</span>
              <span>
                {fmt(t.list.freshness, { time: timeAgo(state.data.fetchedAt, lang) })}{' '}
                <button type="button" className="link-button" onClick={refresh}>
                  {t.list.refresh}
                </button>
              </span>
            </div>

            {children ? (
              children(filtered)
            ) : filtered.length === 0 ? (
              <p className="panel">{t.common.noResults}</p>
            ) : (
              <ul className="cards">
                {filtered.map((row) => (
                  <li key={row.id}>{renderCard(row)}</li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
