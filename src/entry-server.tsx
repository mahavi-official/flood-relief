import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import { App } from './App';
import { LANGS, type Lang } from './i18n';
import { PAGE_KEYS, canonicalPath, metaFor, pathFor, type PageKey } from './routes';
import { SITE } from './site.config';

/** '/flood-relief' on GitHub Pages, '' on a custom domain. */
const BASENAME = SITE.basePath.replace(/\/$/, '');

/**
 * Called by scripts/prerender.js once per page, per language.
 *
 * `path` is a router path such as '/' or '/en/missing'. The StaticRouter needs
 * the same basename the browser router uses, or every server-rendered href
 * would omit the base path and React would throw the whole tree away on
 * hydration.
 */
export function render(path: string): string {
  const location = (BASENAME + path).replace(/\/+$/, '') || '/';
  return renderToString(
    <StrictMode>
      <StaticRouter basename={BASENAME || undefined} location={location}>
        <App />
      </StaticRouter>
    </StrictMode>,
  );
}

export interface PrerenderPage {
  /** Router path, e.g. "/" or "/en/missing". */
  url: string;
  lang: Lang;
  page: PageKey;
  title: string;
  description: string;
  /** Absolute canonical URL. */
  canonical: string;
  /** hreflang -> absolute URL, for the alternate link tags. */
  alternates: { hreflang: string; href: string }[];
}

/** The full list of pages the prerenderer should write out. */
export function prerenderPages(): PrerenderPage[] {
  return LANGS.flatMap((lang) =>
    PAGE_KEYS.map((page) => {
      const { title, description } = metaFor(page, lang);
      return {
        url: pathFor(page, lang),
        lang,
        page,
        title,
        description,
        canonical: SITE.url + canonicalPath(page, lang),
        alternates: [
          ...LANGS.map((l) => ({ hreflang: l, href: SITE.url + canonicalPath(page, l) })),
          // Nepali is what an unmatched visitor should land on.
          { hreflang: 'x-default', href: SITE.url + canonicalPath(page, 'ne') },
        ],
      };
    }),
  );
}

export { SITE } from './site.config';
