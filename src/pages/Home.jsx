import { Link } from 'react-router-dom'
import { useLang } from '../lib/i18n'
import { IconMissing, IconFound, IconSOS, IconVolunteer } from '../components/Icons'

export default function Home() {
  const { t } = useLang()
  return (
    <div>
      <h1 className="page-title">{t('homeQuestion')}</h1>
      <p className="page-subtitle">{t('homeIntro')}</p>

      <div className="action-grid">
        {/* Asking for help is the most urgent thing anyone can do here, so it
            is the first, largest and loudest card on the page. */}
        <section className="action-card tone-crimson action-card-lead">
          <div className="action-card-head">
            <div className="action-icon">
              <IconSOS />
            </div>
            <h2 className="action-title">{t('helpTitle')}</h2>
          </div>
          <p className="action-desc">{t('helpDesc')}</p>
          <div className="action-buttons">
            <Link to="/help" className="btn btn-big btn-primary tone-crimson">
              {t('sosBtn')}
            </Link>
          </div>
        </section>

        <section className="action-card tone-marigold">
          <div className="action-card-head">
            <div className="action-icon">
              <IconMissing />
            </div>
            <h2 className="action-title">{t('missingTitle')}</h2>
          </div>
          <p className="action-desc">{t('missingDesc')}</p>
          <div className="action-buttons">
            <Link to="/missing" className="btn btn-big btn-primary tone-marigold">
              {t('reportBtn')}
            </Link>
            <Link to="/missing/list" className="btn btn-big btn-outline">
              {t('browseBtn')}
            </Link>
          </div>
        </section>

        <section className="action-card tone-river">
          <div className="action-card-head">
            <div className="action-icon">
              <IconFound />
            </div>
            <h2 className="action-title">{t('foundTitle')}</h2>
          </div>
          <p className="action-desc">{t('foundDesc')}</p>
          <div className="action-buttons">
            <Link to="/found" className="btn btn-big btn-primary tone-river">
              {t('reportBtn')}
            </Link>
            <Link to="/found/list" className="btn btn-big btn-outline">
              {t('browseBtn')}
            </Link>
          </div>
        </section>

        <section className="action-card tone-slate">
          <div className="action-card-head">
            <div className="action-icon">
              <IconVolunteer />
            </div>
            <h2 className="action-title">{t('volunteerTitle')}</h2>
          </div>
          <p className="action-desc">{t('volunteerDesc')}</p>
          <div className="action-buttons">
            <Link to="/volunteers" className="btn btn-big btn-primary tone-slate">
              {t('volunteerBtn')}
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
