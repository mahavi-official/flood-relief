import { useLang } from '../lib/i18n'
import { IconPhone, IconPin } from './Icons'

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

function photoSrc(photo) {
  const value = String(photo || '').trim()
  try {
    const url = new URL(value)
    if (url.hostname === 'drive.google.com') {
      const fileId = url.searchParams.get('id') || url.pathname.match(/\/d\/([^/]+)/)?.[1]
      if (fileId) return `https://lh3.googleusercontent.com/d/${encodeURIComponent(fileId)}`
    }
  } catch {
    // Keep non-URL photo values unchanged so the card can still fail normally.
  }
  return value
}

const conditionKey = {
  safe: 'fldConditionSafe',
  injured: 'fldConditionInjured',
  medical: 'fldConditionMedical'
}

export default function ReportCard({ kind, row }) {
  const { t, lang } = useLang()
  const locationLine = kind === 'missing' ? [row.district, row.location].filter(Boolean).join(' · ') : row.location

  return (
    <article className={`report-card kind-${kind}`}>
      <div className="report-card-top">
        <div>
          <span className={`report-tag tag-${kind}`}>{t(kind === 'missing' ? 'badgeMissing' : 'badgeFound')}</span>
          <p className="report-name">{row.name || '—'}</p>
          {locationLine && (
            <p className="report-meta">
              <IconPin aria-hidden="true" /> {locationLine}
            </p>
          )}
        </div>
        {kind === 'found' && row.condition && conditionKey[row.condition] && (
          <span className={`report-tag tag-${row.condition}`}>{t(conditionKey[row.condition])}</span>
        )}
      </div>

      {row.description && <p className="report-desc">{row.description}</p>}
      {row.shelter && (
        <p className="report-desc">
          {t('shelterAt')} {row.shelter}
        </p>
      )}
      {row.notes && <p className="report-desc">{row.notes}</p>}

      {row.photo && (
        <img
          className="report-photo"
          src={photoSrc(row.photo)}
          alt={row.name || 'report photo'}
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      )}

      {row.reporterPhone && (
        <div className="report-card-actions">
          <a className="btn btn-primary tone-river btn-small" href={`tel:${row.reporterPhone}`}>
            <IconPhone /> {t('callBtn')} {row.reporterPhone}
          </a>
        </div>
      )}

      <p className="report-meta report-time">
        {t('reportedAt')}: {formatTime(row.timestamp, lang)}
      </p>
    </article>
  )
}
