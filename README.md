# बाढी उद्धार नेपाल · Nepal Flood Relief

A public, bilingual website for the Nepal floods. Anyone can report a missing
person, report someone they have found, or send an SOS with their GPS location.
Everything submitted is publicly searchable. No account, no login, on either
side.

**There is no backend.** Three Google Forms take the submissions, three Google
Sheets store them, and the site reads the published CSVs straight from the
browser. The Sheet is the database.

- **Setup (Google Forms + Sheets + deploy):** [`SETUP.md`](SETUP.md)
- **Why it is built this way, and its limits:** [`docs/DESIGN-NOTES.md`](docs/DESIGN-NOTES.md)

| Homepage | Report a missing person |
|---|---|
| ![Homepage](docs/screenshots/homepage.png) | ![Report missing](docs/screenshots/report-missing.png) |

---

## Quick start

```bash
npm install
npm run dev            # http://localhost:5173/flood-relief/
```

It runs immediately with bundled sample data and a visible "sample data" banner.
Connect real forms by filling in `src/site.config.ts` — see [`SETUP.md`](SETUP.md).

```bash
npm run build          # client + SSR + prerender -> dist/
npm run typecheck
npm run og             # regenerate the social preview image
```

---

## What is built in

**Bilingual, properly.** Nepali is the default and lives at the root; English
lives under `/en`. Every string, label, error and placeholder is translated —
not just the shell. Numbers render in Devanagari for Nepali readers, and the
forms accept Devanagari digits as input. The toggle is two real links, so it
works before JavaScript loads.

**Prerendered React.** Every page is rendered to static HTML at build time and
React hydrates on top. The text is readable, and the site is fully indexable,
before the bundle arrives — which matters on the connections this is for. Each
page ships its own `<title>`, description, canonical URL, `hreflang` pair,
Open Graph tags and JSON-LD; `sitemap.xml` and `robots.txt` are generated.

**Built for a bad connection.**

| Asset | Gzipped |
|---|---|
| HTML (per page, content included) | ~4 KB |
| CSS | ~2 KB |
| JS bundle (React + router + app) | ~93 KB |
| Leaflet map | ~44 KB, **only** when someone taps "Map" |

No web fonts — every phone already has a Devanagari face, and a font download is
the most expensive thing you can add to a page like this. No images in the UI
beyond one inline SVG.

**Offline tolerance.** A report that cannot be sent is saved to the device and
retried automatically when the connection returns, with the difference between
"sent" and "saved on your phone" stated honestly on screen. A small service
worker keeps the site openable after one visit.

**Spam handling without a server.** Honeypot, time trap, an arithmetic check and
a client-side rate limit — with the SOS form deliberately exempt from everything
that costs time. The real defence is a `Status` column a human edits in the
Sheet. Details in [`docs/DESIGN-NOTES.md`](docs/DESIGN-NOTES.md#4-spam-prevention-and-safety).

---

## Layout

```
src/
  site.config.ts      ← every value you need to change lives here
  routes.ts             page list, URL shapes, per-page SEO metadata
  App.tsx               both language route trees
  main.tsx              hydrates in the browser
  entry-server.tsx      renders at build time
  i18n/                 en.ts is the source of truth; ne.ts must match its shape
  data/districts.ts     all 77 districts, English + Nepali
  lib/                  CSV parser, Sheets reads, Form POST + offline queue,
                        geolocation, anti-spam, formatting
  components/           layout, form fields, cards, the lazy map
  pages/                nine pages
scripts/
  prerender.js          writes the 18 HTML files, sitemap and robots.txt
  make-og-image.js      generates the social preview PNG
public/sample-data/     demo CSVs used until a real Sheet is connected
```

`src/i18n/en.ts` defines the shape of the dictionary; `ne.ts` is typed against
it, so a missing Nepali translation is a build error rather than an English
string leaking into the Nepali site.

---

## Known limits

These are properties of the design, not bugs. They are spelled out for users on
the `/about/` page too.

- Google's submission endpoint is opaque to us — a sent report is confirmed by
  appearing in the public list, not by the browser.
- Reports appear within a few minutes, not instantly.
- Photos are links, not uploads: Google's file upload requires a Google login.
- Reports are unverified. Anyone can post anything.
- Exact GPS coordinates and phone numbers are public by design, to make rescue
  fast. See `/safety/`.
- Nobody is on duty. This site does not dispatch anyone.
