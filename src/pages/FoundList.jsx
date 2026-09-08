import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLang } from '../lib/i18n'
import { useReports } from '../lib/useReports'
import ReportCard from '../components/ReportCard'
import { IconSearch } from '../components/Icons'

export default function FoundList() {
  const { t } = useLang()
  const { rows, state, reload } = useReports('found')
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return rows
      .filter((r) => (q ? `${r.name} ${r.location} ${r.shelter || ''}`.toLowerCase().includes(q) : true))
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  }, [rows, query])

  return (
    <div>
      <h1 className="page-title">{t('foundListTitle')}</h1>

      {state === 'not-configured' && <div className="config-warning">{t('notConfigured')}</div>}

      <div className="search-box">
        <IconSearch aria-hidden="true" />
        <input
          type="search"
          placeholder={t('searchPlaceholder')}
          aria-label={t('searchPlaceholder')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {state === 'loading' && <div className="state-panel">{t('loading')}</div>}
      {state === 'error' && (
        <div className="state-panel">
          <p>{t('loadError')}</p>
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
          <ReportCard key={row.id} kind="found" row={row} />
        ))}
      </div>

      <Link to="/found" className="page-back">
        {t('reportBtn')}
      </Link>
    </div>
  )
}
