/**
 * Turns the React app into plain HTML files — one per page, per language.
 *
 * Why: the people this site is for are on 2G phones, and a search engine or a
 * Facebook link preview should not have to run JavaScript to see the content.
 * After this runs, `dist/` is a static folder any host can serve, and React
 * hydrates on top of markup that already says everything.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const distDir = join(root, 'dist');

const serverEntry = pathToFileURL(join(root, 'dist-ssr', 'entry-server.js')).href;
const { render, prerenderPages, SITE } = await import(serverEntry);

const template = await readFile(join(distDir, 'index.html'), 'utf8');

const escape = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const OG_IMAGE = `${SITE.url}/og-image.png`;

function jsonLd(page) {
  const graph = [
    {
      '@type': 'WebSite',
      '@id': `${SITE.url}/#website`,
      url: `${SITE.url}/`,
      name: page.lang === 'ne' ? 'बाढी उद्धार नेपाल' : 'Nepal Flood Relief',
      inLanguage: page.lang === 'ne' ? 'ne-NP' : 'en',
    },
    {
      '@type': 'WebPage',
      '@id': `${page.canonical}#webpage`,
      url: page.canonical,
      name: page.title,
      description: page.description,
      inLanguage: page.lang === 'ne' ? 'ne-NP' : 'en',
      isPartOf: { '@id': `${SITE.url}/#website` },
    },
  ];

  // The homepage is the entry point people share, so describe the service there.
  if (page.page === 'home') {
    graph.push({
      '@type': 'EmergencyService',
      name: page.lang === 'ne' ? 'बाढी उद्धार नेपाल' : 'Nepal Flood Relief',
      description: page.description,
      areaServed: { '@type': 'Country', name: 'Nepal' },
      url: `${SITE.url}/`,
    });
  }

  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph });
}

function head(page) {
  const alternates = page.alternates
    .map((a) => `<link rel="alternate" hreflang="${a.hreflang}" href="${escape(a.href)}">`)
    .join('\n    ');

  return `<title>${escape(page.title)}</title>
    <meta name="description" content="${escape(page.description)}">
    <link rel="canonical" href="${escape(page.canonical)}">
    ${alternates}
    <meta name="robots" content="index, follow, max-image-preview:large">
    <meta name="theme-color" content="#c62828">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="${escape(page.lang === 'ne' ? 'बाढी उद्धार नेपाल' : 'Nepal Flood Relief')}">
    <meta property="og:title" content="${escape(page.title)}">
    <meta property="og:description" content="${escape(page.description)}">
    <meta property="og:url" content="${escape(page.canonical)}">
    <meta property="og:locale" content="${page.lang === 'ne' ? 'ne_NP' : 'en_US'}">
    <meta property="og:image" content="${escape(OG_IMAGE)}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="${escape(page.lang === 'ne' ? 'बाढी उद्धार नेपाल' : 'Nepal Flood Relief')}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escape(page.title)}">
    <meta name="twitter:description" content="${escape(page.description)}">
    <meta name="twitter:image" content="${escape(OG_IMAGE)}">
    <link rel="manifest" href="${SITE.basePath}manifest.webmanifest">
    <link rel="icon" href="${SITE.basePath}icon.svg" type="image/svg+xml">
    <script type="application/ld+json">${jsonLd(page)}</script>`;
}

/** "/" -> dist/index.html, "/en/missing" -> dist/en/missing/index.html */
function outputPath(url) {
  const clean = url.replace(/^\/+|\/+$/g, '');
  return clean ? join(distDir, clean, 'index.html') : join(distDir, 'index.html');
}

const pages = prerenderPages();

for (const page of pages) {
  const html = template
    .replace('<html lang="ne">', `<html lang="${page.lang}">`)
    .replace('<!--app-head-->', head(page))
    .replace('<!--app-html-->', render(page.url));

  const file = outputPath(page.url);
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, html, 'utf8');
}

// GitHub Pages serves this for any path we did not prerender.
const notFound = template
  .replace('<!--app-head-->', `<title>404</title><meta name="robots" content="noindex">`)
  .replace('<!--app-html-->', render('/__not-found__'));
await writeFile(join(distDir, '404.html'), notFound, 'utf8');

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${pages
  .map(
    (page) => `  <url>
    <loc>${escape(page.canonical)}</loc>
${page.alternates
  .map(
    (a) =>
      `    <xhtml:link rel="alternate" hreflang="${a.hreflang}" href="${escape(a.href)}"/>`,
  )
  .join('\n')}
    <changefreq>${page.page === 'home' ? 'daily' : 'hourly'}</changefreq>
    <priority>${page.page === 'home' || page.page === 'sos' ? '1.0' : '0.8'}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>
`;

await writeFile(join(distDir, 'sitemap.xml'), sitemap, 'utf8');

await writeFile(
  join(distDir, 'robots.txt'),
  `User-agent: *\nAllow: /\n\nSitemap: ${SITE.url}/sitemap.xml\n`,
  'utf8',
);

console.log(`Prerendered ${pages.length} pages + 404, sitemap.xml and robots.txt.`);
