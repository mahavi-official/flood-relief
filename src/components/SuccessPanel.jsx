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
      <h1 className="success-title">{t('successTitle')}</h1>
      <p className="success-desc">{t(descriptionKey)}</p>
      <div className="success-actions">
        {listPath && (
          <Link className="btn btn-primary tone-river" to={listPath}>
            {t('browseBtn')}
          </Link>
        )}
        <button className="btn btn-outline" onClick={onReset}>
          {t('viewAnother')}
        </button>
        <Link className="btn btn-outline" to="/">
          {t('backHome')}
        </Link>
      </div>
    </div>
  )
}
