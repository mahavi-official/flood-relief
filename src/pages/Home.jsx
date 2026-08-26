import { Link } from 'react-router-dom'
import { useLang } from '../lib/i18n'
import { IconMissing, IconFound, IconSOS } from '../components/Icons'

export default function Home() {
  const { t } = useLang()
  return (
    <div>
      <p className="home-intro">{t('homeIntro')}</p>

      <div className="action-grid">
        <section className="action-card tone-crimson">
          <div className="action-card-head">
            <div className="action-icon">
              <IconSOS />
            </div>
            <div>
              <h2 className="action-title">{t('helpTitle')}</h2>
              <p className="action-desc">{t('helpDesc')}</p>
            </div>
          </div>
          <Link to="/help" className="sos-button" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
            {t('sosBtn')}
          </Link>
        </section>

        <section className="action-card tone-marigold">
          <div className="action-card-head">
            <div className="action-icon">
              <IconMissing />
            </div>
            <div>
              <h2 className="action-title">{t('missingTitle')}</h2>
              <p className="action-desc">{t('missingDesc')}</p>
            </div>
          </div>
          <div className="action-buttons">
            <Link to="/missing" className="btn btn-primary tone-marigold">
              {t('reportBtn')}
            </Link>
            <Link to="/missing/list" className="btn btn-outline">
              {t('browseBtn')}
            </Link>
          </div>
        </section>

        <section className="action-card tone-river">
          <div className="action-card-head">
            <div className="action-icon">
              <IconFound />
            </div>
            <div>
              <h2 className="action-title">{t('foundTitle')}</h2>
              <p className="action-desc">{t('foundDesc')}</p>
            </div>
          </div>
          <div className="action-buttons">
            <Link to="/found" className="btn btn-primary tone-river">
              {t('reportBtn')}
            </Link>
            <Link to="/found/list" className="btn btn-outline">
              {t('browseBtn')}
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
