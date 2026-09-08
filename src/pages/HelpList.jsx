import { Suspense, lazy, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLang } from '../lib/i18n'
import { useReports } from '../lib/useReports'
import { IconPhone, IconPin } from '../components/Icons'

const HelpMap = lazy(() => import('../components/HelpMap'))

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

function needLabelKey(needType) {
  if (needType === 'food') return 'needFood'
  if (needType === 'shelter') return 'needShelter'
  if (needType === 'medicine') return 'needMedicine'
  return 'needOther'
}

export default function HelpList() {
  const { t, lang } = useLang()
  const { rows, state, reload } = useReports('help')
  const [view, setView] = useState('list')

  const sorted = useMemo(() => [...rows].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)), [rows])
  const mapRows = useMemo(() => sorted.filter((r) => r.lat && r.lng), [sorted])

  return (
    <div>
      <h1 className="page-title">{t('helpListTitle')}</h1>

      {state === 'not-configured' && <div className="config-warning">{t('notConfigured')}</div>}

      {mapRows.length > 0 && (
        <div className="filter-row">
          <button
            type="button"
            className={`filter-chip${view === 'list' ? ' active' : ''}`}
            aria-pressed={view === 'list'}
            onClick={() => setView('list')}
          >
            {t('listView')}
          </button>
          <button
            type="button"
            className={`filter-chip${view === 'map' ? ' active' : ''}`}
            aria-pressed={view === 'map'}
            onClick={() => setView('map')}
          >
            {t('mapView')}
          </button>
        </div>
      )}

      {state === 'loading' && <div className="state-panel">{t('loading')}</div>}
      {state === 'error' && (
        <div className="state-panel">
          <p>{t('loadError')}</p>
          <button className="btn btn-outline" onClick={reload}>
            {t('fldLocationRetry')}
          </button>
        </div>
      )}

      {(state === 'loaded' || state === 'refreshing') && (
        <>
          {view === 'map' && mapRows.length > 0 && (
            <Suspense fallback={<div className="state-panel">{t('loading')}</div>}>
              <HelpMap rows={mapRows} />
            </Suspense>
          )}

          {sorted.length === 0 && <div className="state-panel">{t('noResults')}</div>}

          {view === 'list' && (
            <div className="report-list">
              {sorted.map((row) => (
                <article className="report-card kind-help" key={row.id}>
                  <div className="report-card-top">
                    <div>
                      <span className="report-tag tag-help">{t('badgeNeedsHelp')}</span>
                      <p className="report-name">{t(needLabelKey(row.needType))}</p>
                      <p className="report-meta">
                        <IconPin aria-hidden="true" />{' '}
                        {row.locationText || (row.lat ? `${Number(row.lat).toFixed(4)}, ${Number(row.lng).toFixed(4)}` : '—')}
                      </p>
                    </div>
                    {row.numPeople && (
                      <span className="report-tag tag-count">
                        {row.numPeople} {t('peopleCount')}
                      </span>
                    )}
                  </div>
                  {row.details && <p className="report-desc">{row.details}</p>}
                  {row.contactPhone && (
                    <div className="report-card-actions">
                      <a className="btn btn-primary tone-river btn-small" href={`tel:${row.contactPhone}`}>
                        <IconPhone /> {t('callBtn')} {row.contactPhone}
                      </a>
                    </div>
                  )}
                  <p className="report-meta report-time">
                    {t('reportedAt')}: {formatTime(row.timestamp, lang)}
                  </p>
                </article>
              ))}
            </div>
          )}
        </>
      )}

      <Link to="/volunteers" className="page-back">
        {t('volunteerBtn')}
      </Link>
    </div>
  )
}
