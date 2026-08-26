import { useMemo, useState } from 'react'
import { useLang } from '../lib/i18n'
import { useReports } from '../lib/useReports'
import ReportCard from '../components/ReportCard'

export default function MissingList() {
  const { t } = useLang()
  const { rows, state, reload } = useReports('missing')
  const [query, setQuery] = useState('')
  const [district, setDistrict] = useState('')

  const districts = useMemo(
    () => Array.from(new Set(rows.map((r) => r.district).filter(Boolean))).sort(),
    [rows]
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return rows
      .filter((r) => (district ? r.district === district : true))
      .filter((r) => (q ? `${r.name} ${r.district}`.toLowerCase().includes(q) : true))
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  }, [rows, query, district])

  return (
    <div>
      <h1 className="page-title">{t('missingListTitle')}</h1>

      {state === 'not-configured' && <div className="config-warning">{t('notConfigured')}</div>}

      <div className="list-toolbar">
        <input type="text" placeholder={t('searchPlaceholder')} value={query} onChange={(e) => setQuery(e.target.value)} />
        {districts.length > 0 && (
          <select value={district} onChange={(e) => setDistrict(e.target.value)}>
            <option value="">{t('filterAllDistricts')}</option>
            {districts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        )}
      </div>

      {(state === 'loading') && <div className="state-panel">{t('loading')}</div>}
      {state === 'error' && (
        <div className="state-panel">
          {t('loadError')}{' '}
          <button className="btn btn-outline" onClick={reload}>
            {t('fldLocationRetry')}
          </button>
        </div>
      )}
      {(state === 'loaded' || state === 'refreshing') && filtered.length === 0 && (
        <div className="state-panel">{t('noResults')}</div>
      )}

      <div className="report-list">
        {filtered.map((row) => (
          <ReportCard key={row.id} kind="missing" row={row} />
        ))}
      </div>
    </div>
  )
}
