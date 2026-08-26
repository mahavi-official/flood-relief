import { Link } from 'react-router-dom'
import { useLang } from '../lib/i18n'
import WaterRule from './WaterRule'

export default function Header() {
  const { t, toggleLang } = useLang()
  return (
    <>
      <header className="site-header">
        <Link to="/" className="wordmark">
          <span className="wordmark-main">{t('siteName')}</span>
          <span className="wordmark-sub">{t('siteTagline')}</span>
        </Link>
        <button className="lang-toggle" onClick={toggleLang} aria-label="Switch language">
          {t('langToggle')}
        </button>
      </header>
      <WaterRule />
    </>
  )
}
