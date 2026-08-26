import { Suspense, lazy, useMemo, useState } from 'react'
import { useLang } from '../lib/i18n'
import { useReports } from '../lib/useReports'
import { IconPhone, IconPin } from '../components/Icons'

const HelpMap = lazy(() => import('../components/HelpMap'))

function timeAgo(iso, lang) {
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

export default function HelpList() {
  const { t, lang } = useLang()
  const { rows, state, reload } = useReports('help')
  const [view, setView] = useState('map')

  const sorted = useMemo(() => [...rows].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)), [rows])

  return (
    <div>
      <h1 className="page-title">{t('helpListTitle')}</h1>

      {state === 'not-configured' && <div className="config-warning">{t('notConfigured')}</div>}

      <div className="list-toolbar" style={{ justifyContent: 'space-between' }}>
        <div className="view-switch">
          <button className={view === 'map' ? 'active' : ''} onClick={() => setView('map')}>
            {t('mapView')}
          </button>
          <button className={view === 'list' ? 'active' : ''} onClick={() => setView('list')}>
            {t('listView')}
          </button>
        </div>
      </div>

      {state === 'loading' && <div className="state-panel">{t('loading')}</div>}
      {state === 'error' && (
        <div className="state-panel">
          {t('loadError')}{' '}
          <button className="btn btn-outline" onClick={reload}>
            {t('fldLocationRetry')}
          </button>
        </div>
      )}

      {(state === 'loaded' || state === 'refreshing') && (
        <>
          {view === 'map' && (
            <Suspense fallback={<div className="state-panel">{t('loading')}</div>}>
              <HelpMap rows={sorted} />
            </Suspense>
          )}

          {sorted.length === 0 && <div className="state-panel">{t('noResults')}</div>}

          {(view === 'list' || sorted.length > 0) && (
            <div className="report-list">
              {sorted.map((row) => (
                <article className="report-card" key={row.id}>
                  <div className="report-card-top">
                    <div>
                      <p className="report-name">{t(needLabelKey(row.needType))}</p>
                      <div className="report-meta">
                        <IconPin style={{ verticalAlign: '-2px', marginRight: 4 }} />
                        {row.locationText || (row.lat ? `${Number(row.lat).toFixed(4)}, ${Number(row.lng).toFixed(4)}` : '—')}
                      </div>
                    </div>
                    {row.numPeople && (
                      <span className="report-tag tag-injured">
                        {row.numPeople} {t('peopleCount')}
                      </span>
                    )}
                  </div>
                  {row.details && <p className="report-desc">{row.details}</p>}
                  <div className="report-card-actions">
                    {row.contactPhone && (
                      <a className="btn btn-outline" style={{ padding: '7px 14px', fontSize: 13 }} href={`tel:${row.contactPhone}`}>
                        <IconPhone /> {t('callBtn')}
                      </a>
                    )}
                  </div>
                  <div className="report-meta" style={{ marginTop: 8 }}>
                    {t('reportedAt')}: {timeAgo(row.timestamp, lang)}
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

function needLabelKey(needType) {
  if (needType === 'food') return 'needFood'
  if (needType === 'shelter') return 'needShelter'
  if (needType === 'medicine') return 'needMedicine'
  return 'needOther'
}
