import { useLang } from '../lib/i18n'
import { IconPhone, IconPin } from './Icons'

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

export default function ReportCard({ kind, row }) {
  const { t, lang } = useLang()
  const conditionTag =
    kind === 'found' && row.condition && row.condition !== 'safe' ? (
      <span className={`report-tag tag-${row.condition}`}>{t(row.condition === 'injured' ? 'fldConditionInjured' : 'fldConditionMedical')}</span>
    ) : kind === 'found' && row.condition === 'safe' ? (
      <span className="report-tag tag-safe">{t('fldConditionSafe')}</span>
    ) : null

  const locationLine = kind === 'missing' ? [row.district, row.location].filter(Boolean).join(' · ') : row.location

  return (
    <article className="report-card">
      <div className="report-card-top">
        <div>
          <p className="report-name">{row.name || '—'}</p>
          <div className="report-meta">
            <IconPin style={{ verticalAlign: '-2px', marginRight: 4 }} />
            {locationLine}
          </div>
        </div>
        {conditionTag}
      </div>

      {row.description && <p className="report-desc">{row.description}</p>}
      {row.shelter && (
        <p className="report-desc">
          {t('fldShelterLocation')}: {row.shelter}
        </p>
      )}
      {row.notes && <p className="report-desc">{row.notes}</p>}

      {row.photo && <img className="report-photo" src={row.photo} alt={row.name || 'report photo'} loading="lazy" />}

      <div className="report-card-actions">
        {row.reporterPhone && (
          <a className="btn btn-outline" style={{ padding: '7px 14px', fontSize: 13 }} href={`tel:${row.reporterPhone}`}>
            <IconPhone /> {t('callBtn')}
          </a>
        )}
      </div>
      <div className="report-meta" style={{ marginTop: 8 }}>
        {t('reportedAt')}: {timeAgo(row.timestamp, lang)}
      </div>
    </article>
  )
}
