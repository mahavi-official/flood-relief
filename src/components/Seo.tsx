import { useEffect } from 'react';
import { useLang } from '../i18n';
import { canonicalPath, metaFor, type PageKey } from '../routes';
import { SITE } from '../site.config';

function setMeta(selector: string, attr: string, value: string) {
  const el = document.head.querySelector(selector);
  if (el) el.setAttribute(attr, value);
}

/**
 * The prerenderer writes the real <head> for every page, so search engines and
 * link previews get correct tags with no JavaScript at all. This only has to
 * keep them in step when React takes over and the reader navigates client-side.
 */
export function Seo({ page }: { page: PageKey }) {
  const lang = useLang();

  useEffect(() => {
    const { title, description } = metaFor(page, lang);
    const canonical = SITE.url + canonicalPath(page, lang);

    document.title = title;
    document.documentElement.lang = lang;
    setMeta('meta[name="description"]', 'content', description);
    setMeta('link[rel="canonical"]', 'href', canonical);
    setMeta('meta[property="og:title"]', 'content', title);
    setMeta('meta[property="og:description"]', 'content', description);
    setMeta('meta[property="og:url"]', 'content', canonical);
    setMeta('meta[property="og:locale"]', 'content', lang === 'ne' ? 'ne_NP' : 'en_US');
  }, [page, lang]);

  return null;
}
