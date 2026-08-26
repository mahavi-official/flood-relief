import { Link } from 'react-router-dom';
import { LANGS, useLang } from '../i18n';
import { dictFor } from '../i18n';
import { pathFor, type PageKey } from '../routes';

/**
 * Two real links rather than a JS switch, so the toggle works before hydration
 * and each language keeps its own indexable URL.
 */
export function LangToggle({ page }: { page: PageKey }) {
  const current = useLang();
  return (
    <div className="lang-toggle">
      {LANGS.map((lang) => (
        <Link
          key={lang}
          to={pathFor(page, lang)}
          lang={lang}
          hrefLang={lang}
          aria-current={lang === current ? 'page' : undefined}
        >
          {dictFor(lang).meta.langName}
        </Link>
      ))}
    </div>
  );
}
