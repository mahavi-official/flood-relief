import { Link } from 'react-router-dom'
import { useLang } from '../lib/i18n'
import { IconCheck } from './Icons'

export default function SuccessPanel({ descriptionKey, listPath, onReset }) {
  const { t } = useLang()
  return (
    <div className="form-card success-panel">
      <div className="success-check">
        <IconCheck />
      </div>
      <h2 className="success-title">{t('successTitle')}</h2>
      <p className="success-desc">{t(descriptionKey)}</p>
      <div className="success-actions">
        <button className="btn btn-outline" onClick={onReset}>
          {t('viewAnother')}
        </button>
        {listPath && (
          <Link className="btn btn-primary tone-river" to={listPath}>
            {t('browseBtn')}
          </Link>
        )}
        <Link className="btn btn-outline" to="/">
          {t('backHome')}
        </Link>
      </div>
    </div>
  )
}
