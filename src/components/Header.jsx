import { Link, useLocation } from 'react-router-dom'
import { useLang } from '../lib/i18n'
import { IconHome } from './Icons'

export default function Header() {
  const { t, lang, setLang } = useLang()
  const { pathname } = useLocation()
  const isHome = pathname === '/'

  return (
    <header className="site-header">
      <Link to="/" className="wordmark">
        <span className="wordmark-main">{t('siteName')}</span>
        <span className="wordmark-sub">{t('siteTagline')}</span>
      </Link>

      <div className="header-actions">
        {!isHome && (
          <Link to="/" className="header-home" aria-label={t('navHome')}>
            <IconHome />
            <span>{t('navHome')}</span>
          </Link>
        )}
        {/* Both languages are always visible: a single toggle button makes
            people guess which language they are about to get. */}
        <div className="lang-switch" role="group" aria-label={t('langLabel')}>
          <button
            type="button"
            className={lang === 'en' ? 'active' : ''}
            aria-pressed={lang === 'en'}
            onClick={() => setLang('en')}
          >
            {t('langEnglish')}
          </button>
          <button
            type="button"
            className={lang === 'ne' ? 'active' : ''}
            aria-pressed={lang === 'ne'}
            onClick={() => setLang('ne')}
          >
            {t('langNepali')}
          </button>
        </div>
      </div>
    </header>
  )
}
