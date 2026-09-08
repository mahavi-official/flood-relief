import { Suspense, lazy, useMemo, useState } from 'react'
import { useLang } from '../lib/i18n'
import { useReports } from '../lib/useReports'
import { IconPhone, IconPin, IconSearch } from '../components/Icons'

const HelpMap = lazy(() => import('../components/HelpMap'))

const FILTERS = [
  { value: 'all', labelKey: 'filterAll' },
  { value: 'help', labelKey: 'filterNeedsHelp' },
  { value: 'missing', labelKey: 'filterMissing' },
  { value: 'found', labelKey: 'filterFound' }
]

function needLabelKey(needType) {
  if (needType === 'food') return 'needFood'
  if (needType === 'shelter') return 'needShelter'
  if (needType === 'medicine') return 'needMedicine'
  return 'needOther'
}

function formatTime(iso, lang) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleString(lang === 'ne' ? 'ne-NP' : 'en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Every report type is flattened into the same shape so volunteers get one
// list to read and one search box to use, instead of three separate pages.
function toEntry(kind, row, t) {
  if (kind === 'help') {
    return {
      kind,
      id: `help-${row.id}`,
      title: t(needLabelKey(row.needType)),
      place: row.locationText || (row.lat ? `${Number(row.lat).toFixed(4)}, ${Number(row.lng).toFixed(4)}` : ''),
      phone: row.contactPhone,
      people: row.numPeople,
      details: row.details,
      timestamp: row.timestamp,
      searchText: [row.needType, row.locationText, row.details, row.contactPhone].filter(Boolean).join(' ')
    }
  }
  if (kind === 'missing') {
    return {
      kind,
      id: `missing-${row.id}`,
      title: row.name,
      place: [row.district, row.location].filter(Boolean).join(' · '),
      phone: row.reporterPhone,
      details: [row.description, row.notes].filter(Boolean).join(' — '),
      photo: row.photo,
      timestamp: row.timestamp,
      searchText: [row.name, row.district, row.location, row.description, row.notes, row.reporterName, row.reporterPhone]
        .filter(Boolean)
        .join(' ')
    }
  }
  return {
    kind,
    id: `found-${row.id}`,
    title: row.name,
    place: row.location,
    phone: row.reporterPhone,
    condition: row.condition,
    details: [row.shelter && `${t('shelterAt')} ${row.shelter}`, row.notes].filter(Boolean).join(' — '),
    photo: row.photo,
    timestamp: row.timestamp,
    searchText: [row.name, row.location, row.shelter, row.notes, row.reporterName, row.reporterPhone]
      .filter(Boolean)
      .join(' ')
  }
}

export default function Volunteers() {
  const { t, lang } = useLang()
  const help = useReports('help')
  const missing = useReports('missing')
  const found = useReports('found')

  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [showMap, setShowMap] = useState(false)

  const loading = [help.state, missing.state, found.state].some((s) => s === 'loading')
  const notConfigured = help.state === 'not-configured'
  const failed = [help.state, missing.state, found.state].every((s) => s === 'error')

  const entries = useMemo(() => {
    const all = [
      ...help.rows.map((r) => toEntry('help', r, t)),
      ...missing.rows.map((r) => toEntry('missing', r, t)),
      ...found.rows.map((r) => toEntry('found', r, t))
    ]
    // People asking for help come first — they are the ones waiting right now.
    const rank = { help: 0, missing: 1, found: 2 }
    return all.sort((a, b) => rank[a.kind] - rank[b.kind] || new Date(b.timestamp) - new Date(a.timestamp))
  }, [help.rows, missing.rows, found.rows, t])

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return entries
      .filter((e) => (filter === 'all' ? true : e.kind === filter))
      .filter((e) => (q ? `${e.title} ${e.place} ${e.searchText}`.toLowerCase().includes(q) : true))
  }, [entries, filter, query])

  const mapRows = useMemo(() => help.rows.filter((r) => r.lat && r.lng), [help.rows])

  function reloadAll() {
    help.reload()
    missing.reload()
    found.reload()
  }

  return (
    <div>
      <h1 className="page-title">{t('volunteerPageTitle')}</h1>
      <p className="page-subtitle">{t('volunteerPageIntro')}</p>

      {notConfigured && <div className="config-warning">{t('notConfigured')}</div>}

      <div className="search-box">
        <IconSearch aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('volunteerSearchPlaceholder')}
          aria-label={t('volunteerSearchPlaceholder')}
        />
      </div>

      <div className="filter-row" role="group" aria-label={t('filterAll')}>
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            className={`filter-chip${filter === f.value ? ' active' : ''}`}
            aria-pressed={filter === f.value}
            onClick={() => setFilter(f.value)}
          >
            {t(f.labelKey)}
          </button>
        ))}
      </div>

      <div className="result-bar">
        <span className="result-count">
          <strong>{visible.length}</strong> {t('volunteerCount')}
        </span>
        <div className="result-bar-actions">
          {mapRows.length > 0 && (
            <button type="button" className="btn btn-outline btn-small" onClick={() => setShowMap((v) => !v)}>
              {showMap ? t('listView') : t('mapView')}
            </button>
          )}
          <button type="button" className="btn btn-outline btn-small" onClick={reloadAll}>
            {t('volunteerRefresh')}
          </button>
        </div>
      </div>

      {showMap && mapRows.length > 0 && (
        <Suspense fallback={<div className="state-panel">{t('loading')}</div>}>
          <HelpMap rows={mapRows} />
        </Suspense>
      )}

      {loading && <div className="state-panel">{t('loading')}</div>}
      {failed && (
        <div className="state-panel">
          <p>{t('loadError')}</p>
          <button className="btn btn-outline" onClick={reloadAll}>
            {t('fldLocationRetry')}
          </button>
        </div>
      )}

      {!loading && !failed && !notConfigured && visible.length === 0 && (
        <div className="state-panel">{t('volunteerNoResults')}</div>
      )}

      <div className="report-list">
        {visible.map((e) => (
          <article className={`report-card kind-${e.kind}`} key={e.id}>
            <div className="report-card-top">
              <div>
                <span className={`report-tag tag-${e.kind}`}>
                  {t(e.kind === 'help' ? 'badgeNeedsHelp' : e.kind === 'missing' ? 'badgeMissing' : 'badgeFound')}
                </span>
                <p className="report-name">{e.title || '—'}</p>
                {e.place && (
                  <p className="report-meta">
                    <IconPin aria-hidden="true" /> {e.place}
                  </p>
                )}
              </div>
              {e.people && (
                <span className="report-tag tag-count">
                  {e.people} {t('peopleCount')}
                </span>
              )}
            </div>

            {e.condition && (
              <p className="report-desc">
                {t(
                  e.condition === 'safe'
                    ? 'fldConditionSafe'
                    : e.condition === 'injured'
                      ? 'fldConditionInjured'
                      : 'fldConditionMedical'
                )}
              </p>
            )}
            {e.details && <p className="report-desc">{e.details}</p>}

            <div className="report-card-actions">
              {e.phone && (
                <a className="btn btn-primary tone-river btn-small" href={`tel:${e.phone}`}>
                  <IconPhone /> {t('callBtn')} {e.phone}
                </a>
              )}
            </div>
            <p className="report-meta report-time">
              {t('reportedAt')}: {formatTime(e.timestamp, lang)}
            </p>
          </article>
        ))}
      </div>

      <p className="page-footnote">{t('volunteerHowTo')}</p>
    </div>
  )
}
