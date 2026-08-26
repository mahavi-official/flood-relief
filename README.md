# Sahayog (सहयोग) — Nepal Flood Relief & Missing Persons Site

A public, no-login site for Nepal flood response: report a missing person,
report a found person, or send an urgent "Help Me" SOS request with a live
location. Built to work for someone in a hurry, on a slow phone connection,
in Nepali or English.

React (Vite) frontend + a Google Sheet as the database, with a small Google
Apps Script Web App in between. No servers to host or pay for.

---

## 1. Site structure

```
/                 Home — three big actions: Help Me / Missing / Found
/missing          Report a missing person (form)
/missing/list     Browse missing-person reports (search + district filter)
/found            Report a found person (form)
/found/list       Browse found-person reports (search)
/help             "Help Me" SOS form (auto-captures GPS)
/help/list        Browse help requests — map view (default) or list view
```

Language toggle (English ⇄ Nepali) lives in the header on every page.
Nepali is the default for first-time visitors; the choice is remembered
locally after that.

---

## 2. How data is wired up (and where this deviates from "just use Google Forms")

The brief's brief asked to evaluate **Google Forms embedded in the page** as
the simplest option. We're using a close cousin instead, based on your
answer to the clarifying question: **custom React forms that POST straight
into the Sheet via a small Google Apps Script Web App**, rather than
embedding the actual Google Forms UI. Trade-off, spelled out:

| | Embedded Google Forms | Custom forms → Apps Script (chosen) |
|---|---|---|
| Setup effort | Lowest — no script to write/deploy | Small script to paste in and deploy once |
| Visual/language consistency | Breaks — Forms UI can't be bilingual or restyled | Fully consistent, bilingual, on-brand |
| GPS auto-capture for SOS | Not possible inside a Form | Native `navigator.geolocation` |
| Still "just a Sheet as the database"? | Yes | Yes — same core simplicity |

The Sheet is still the entire database. There is no other backend to host,
patch, or pay for — the Apps Script is just a thin, free relay that Google
runs for you.

**Data flow:**
1. A visitor submits a form → the React app `POST`s a JSON string to your
   Apps Script Web App URL.
2. The script (`google-apps-script/Code.gs`) validates it, applies basic
   spam checks, appends a row to the matching sheet tab (`Missing`,
   `Found`, or `Help`), and (if a photo was attached) saves it to a Drive
   folder and stores the public view URL in the row.
3. Listing pages (`/missing/list`, `/found/list`, `/help/list`) call the
   same Web App with `GET ?type=missing|found|help`, which reads the sheet
   and returns open rows as JSON.
4. Reads are near-real-time (typically a few seconds' delay, sometimes up
   to a minute under load) — fine for this use case, as flagged in the
   brief.

**To mark a report resolved** (a person found, a help request fulfilled):
open the Sheet directly and set that row's `status` column to `resolved`
or `closed`. It immediately drops out of the public listing. No admin UI
was built for this in the interest of keeping the system small — the
Sheet *is* the admin panel.

### Setup steps

1. **Create a Google Sheet.** Any name. You don't need to add tabs or
   headers — the script creates `Missing`, `Found`, and `Help` tabs (with
   headers) automatically on first use.
2. **Open Extensions → Apps Script** from within that Sheet, delete the
   placeholder code, and paste in the contents of
   `google-apps-script/Code.gs`.
3. **Deploy → New deployment → type "Web app".**
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Deploy, and authorize the permissions it asks for (Sheets + Drive,
     for photo storage).
4. Copy the resulting URL (ends in `/exec`).
5. In the frontend project, copy `.env.example` to `.env` and paste that
   URL into `VITE_APPS_SCRIPT_URL`.
6. `npm install && npm run dev` to run locally, or `npm run build` to
   produce a `dist/` folder you can deploy to any static host (Netlify,
   Vercel, GitHub Pages, Cloudflare Pages, or Google Sites via a custom
   domain).

If you re-deploy the Apps Script later (e.g. after editing `Code.gs`),
Apps Script gives you a **new** URL each time you create a new deployment
version — use "Manage deployments → Edit → new version" instead, so the
URL stays stable and you don't have to update `.env` again.

---

## 3. Wireframe

```
┌─────────────────────────────────────────┐
│ सहयोग                          [English] │  ← header, language toggle
│ बाढी राहत ड्यासबोर्ड                      │
│ ╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲  ← water-gauge rule │
│                                           │
│  Report a missing/found person, or       │
│  request urgent help. No login needed.   │
│                                           │
│ ┌───────────────────────────────────┐   │
│ │ ⚑  मलाई सहयोग चाहियो                │   │  ← crimson, full-width,
│ │    Need food/shelter/medicine?     │   │     pulsing — the visual anchor
│ │  [   REQUEST HELP NOW   ]          │   │
│ └───────────────────────────────────┘   │
│ ┌───────────────┐ ┌───────────────┐     │
│ │ ◐ हराएको व्यक्ति  │ │ ✓ भेटिएको व्यक्ति │     │  ← marigold / river cards
│ │ [Report][List]│ │ [Report][List]│     │
│ └───────────────┘ └───────────────┘     │
└─────────────────────────────────────────┘

Help form (fastest path):
┌─────────────────────────────────────────┐
│ मलाई सहयोग चाहियो                         │
│ ⟳ स्थान स्वतः पत्ता लगाइँदै…                │  ← GPS auto-capture status
│ के आवश्यक छ?  [खाना][आश्रय][औषधि][अन्य]     │  ← tap chips, not a dropdown
│ सम्पर्क फोन नम्बर  [______________]        │
│ कतिजना मानिसलाई सहयोग चाहियो?  [___]       │
│ थप विवरण  [______________________]        │
│         [  सहयोग माग्नुहोस्  ]              │
└─────────────────────────────────────────┘
```

This is implemented, not just sketched — run `npm run dev` and open
`/` and `/help` to see the real thing.

---

## 4. Spam / abuse protection (as flagged in the brief)

There's no login, by design, so anyone can submit. Two lightweight,
no-CAPTCHA measures are built in — CAPTCHAs were deliberately avoided
since they add friction for a stressed person on a bad connection:

- **Honeypot field.** Every form has a hidden input real users never see.
  Bots that auto-fill every field on a page fill it too; if it's non-empty
  on submit, the backend silently drops the entry (while still telling the
  bot "success", so it doesn't adapt).
- **Rate limiting.** Each browser gets a random ID stored locally. The
  backend rejects more than 1 submission per 20 seconds, or more than 8
  per hour, from the same ID. This is a deterrent, not a hard security
  boundary — a determined spammer could reset it — but it stops naive bots
  and accidental double-submits cheaply.

If real-world abuse turns out to be worse than this handles, the
documented upgrade path is Google reCAPTCHA v3 (invisible, scores requests
instead of showing a puzzle) or Cloudflare Turnstile, both addable to the
existing form submit handler without restructuring anything.

## 5. Location privacy (as flagged in the brief)

Per your call: the **Help Me** map and list show the **exact GPS
coordinates** publicly, prioritizing rescue speed over location privacy.
Worth knowing operationally:
- Anyone browsing `/help/list` can see exactly where every open request
  is, not just verified volunteers.
- Once a request is handled, set its `status` to `resolved` in the Sheet
  so the exact location stops being public.
- If this becomes a problem in practice (e.g. bad actors targeting empty
  homes), the cheapest fix is snapping displayed coordinates to the
  nearest ~500m grid for the public map, while keeping exact coordinates
  in the Sheet for anyone coordinating the actual response.

## 6. Photos (one simplification worth flagging)

The brief listed photo upload as optional on Missing/Found reports. Rather
than a raw file upload (which real Google Forms handles, but a bare
Sheets+Apps Script backend doesn't out of the box), photos are resized to
≤800px and compressed client-side, sent as part of the same JSON request,
and saved to a Drive folder by the script — still zero extra
infrastructure, still works on a slow connection, just capped at small
image sizes. If a photo fails to upload for any reason, the rest of the
report still submits — a life-safety report should never be blocked by a
photo problem.

## 7. What would need to change to scale beyond this

Google Sheets is fine for hundreds to low thousands of rows per tab; past
that (or under sustained heavy write traffic), a few things start to
strain:
- **Sheets API rate limits** — Apps Script's Sheet read/write calls will
  start throttling under high concurrent load.
- **No real query/index** — the frontend currently downloads the whole
  sheet and filters client-side; fine at this scale, not at 50,000+ rows.
- **Single point of moderation** — resolving reports by hand-editing the
  Sheet works for one or two admins, not a large volunteer team.

The smallest next step, if that point is reached, is to swap the Apps
Script layer for a small serverless function (Cloudflare Workers /
Firebase Functions) backed by a proper lightweight database (Firestore,
Supabase/Postgres) — the React frontend barely changes, since it already
only talks to a fetch-based API in `src/lib/api.js`. A full custom backend
is very unlikely to be needed at Nepal-flood-relief scale.

---

## 8. Project layout

```
src/
  lib/            i18n, API client, config, image compression, data hook
  components/     Header, form fields, report cards, icons, the Leaflet map
  pages/          Home, the three report forms, the three listing pages
google-apps-script/
  Code.gs         The entire backend
.env.example      Copy to .env and fill in your deployed Web App URL
```
