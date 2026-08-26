import type { Lang } from './i18n';
import { dictFor } from './i18n';

/** Every page, and the URL slug it lives at. The slug is the same in both languages. */
export const PAGES = {
  home: '',
  reportMissing: 'report-missing',
  reportFound: 'report-found',
  sos: 'sos',
  missing: 'missing',
  found: 'found',
  help: 'help',
  safety: 'safety',
  about: 'about',
} as const;

export type PageKey = keyof typeof PAGES;
export const PAGE_KEYS = Object.keys(PAGES) as PageKey[];

/**
 * Nepali is the default and sits at the root; English is nested under /en.
 * Paths here are relative to the router basename (SITE.basePath).
 */
export function pathFor(page: PageKey, lang: Lang): string {
  const slug = PAGES[page];
  if (lang === 'ne') return slug ? `/${slug}` : '/';
  return slug ? `/en/${slug}` : '/en';
}

/**
 * The address search engines should index. A static host serves /missing/ and
 * redirects /missing to it, so the trailing-slash form is the real URL — the
 * router keeps using the slash-less path above, which matches both.
 */
export function canonicalPath(page: PageKey, lang: Lang): string {
  const path = pathFor(page, lang);
  return path.endsWith('/') ? path : `${path}/`;
}

/** The <title> and <meta description> for one page in one language. */
export function metaFor(page: PageKey, lang: Lang): { title: string; description: string } {
  const t = dictFor(lang);
  switch (page) {
    case 'home':
      return {
        title: `${t.common.siteName} — ${t.nav.reportMissing}, ${t.nav.reportFound}, ${t.nav.sos}`,
        description: t.common.tagline + ' ' + t.home.intro,
      };
    case 'reportMissing':
      return { title: t.missing.metaTitle, description: t.missing.metaDesc };
    case 'reportFound':
      return { title: t.found.metaTitle, description: t.found.metaDesc };
    case 'sos':
      return { title: t.sos.metaTitle, description: t.sos.metaDesc };
    case 'missing':
      return { title: t.list.missingMetaTitle, description: t.list.missingMetaDesc };
    case 'found':
      return { title: t.list.foundMetaTitle, description: t.list.foundMetaDesc };
    case 'help':
      return { title: t.list.helpMetaTitle, description: t.list.helpMetaDesc };
    case 'safety':
      return { title: t.safety.metaTitle, description: t.safety.metaDesc };
    case 'about':
      return { title: t.about.metaTitle, description: t.about.metaDesc };
  }
}

/** Given a pathname, work out which page and language is being shown. */
export function resolvePath(pathname: string): { page: PageKey; lang: Lang } | null {
  const clean = pathname.replace(/^\/+|\/+$/g, '');
  const isEn = clean === 'en' || clean.startsWith('en/');
  const lang: Lang = isEn ? 'en' : 'ne';
  const slug = isEn ? clean.slice(2).replace(/^\/+/, '') : clean;
  const page = PAGE_KEYS.find((k) => PAGES[k] === slug);
  return page ? { page, lang } : null;
}
