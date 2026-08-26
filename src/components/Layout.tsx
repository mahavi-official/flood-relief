import { useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { fmt, localeNum, otherLang, useLang, useT } from '../i18n';
import { pathFor, type PageKey } from '../routes';
import { SITE } from '../site.config';
import { flushQueue, readQueue } from '../lib/submit';
import { L } from './Link';
import { LangToggle } from './LangToggle';
import { Seo } from './Seo';

const NAV: PageKey[] = ['sos', 'reportMissing', 'reportFound', 'missing', 'found', 'help'];

function navLabel(page: PageKey, t: ReturnType<typeof useT>): string {
  switch (page) {
    case 'sos':
      return t.nav.sos;
    case 'reportMissing':
      return t.nav.reportMissing;
    case 'reportFound':
      return t.nav.reportFound;
    case 'missing':
      return t.nav.browseMissing;
    case 'found':
      return t.nav.browseFound;
    case 'help':
      return t.nav.browseHelp;
    default:
      return t.common.home;
  }
}

/**
 * Watches the connection and drains anything the forms had to store locally.
 * A report written during an outage is exactly the report that matters most,
 * so this runs on every page, not just the form pages.
 */
function OfflineBanner() {
  const t = useT();
  const lang = useLang();
  const [offline, setOffline] = useState(false);
  const [pending, setPending] = useState(0);

  useEffect(() => {
    const sync = () => {
      setOffline(!navigator.onLine);
      setPending(readQueue().length);
    };
    sync();

    const onOnline = () => {
      void flushQueue().then(sync);
      sync();
    };

    window.addEventListener('online', onOnline);
    window.addEventListener('offline', sync);
    if (navigator.onLine) void flushQueue().then(sync);

    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', sync);
    };
  }, []);

  if (!offline && pending === 0) return null;

  return (
    <div className="wrap">
      <p className="notice notice--warn" role="status">
        {offline && t.forms.offlineBanner}
        {pending > 0 && ' ' + fmt(t.forms.pendingBanner, { n: localeNum(pending, lang) })}
      </p>
    </div>
  );
}

export function Layout({ page, children }: { page: PageKey; children: ReactNode }) {
  const t = useT();
  const lang = useLang();

  return (
    <>
      <Seo page={page} />
      <a className="skip-link" href="#main">
        {t.common.skipToContent}
      </a>

      <header className="site-header">
        <div className="wrap">
          <L page="home" className="brand">
            <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="currentColor"
                d="M12 2c3.6 4.2 6 7.6 6 10.7A6 6 0 0 1 6 12.7C6 9.6 8.4 6.2 12 2Z"
              />
            </svg>
            {t.common.siteShort}
          </L>
          <LangToggle page={page} />
        </div>
      </header>

      <nav className="subnav" aria-label={t.nav.browse}>
        {NAV.map((key) => (
          <L key={key} page={key} aria-current={key === page ? 'page' : undefined}>
            {navLabel(key, t)}
          </L>
        ))}
      </nav>

      <OfflineBanner />

      <main id="main">{children}</main>

      <footer className="site-footer">
        <div className="wrap">
          <nav aria-label={t.nav.about}>
            <L page="about">{t.nav.about}</L>
            <L page="safety">{t.nav.safety}</L>
            <a href={SITE.repoUrl} rel="noreferrer noopener">
              {t.footer.sourceCode}
            </a>
            <Link
              to={pathFor(page, otherLang(lang))}
              hrefLang={otherLang(lang)}
              lang={otherLang(lang)}
            >
              {t.meta.otherLangName}
            </Link>
          </nav>
          <p>{t.footer.builtFor}</p>
          <p>{t.footer.noWarranty}</p>
          <p>{t.footer.emergency}</p>
        </div>
      </footer>
    </>
  );
}
