# Setup: connecting the site to Google Forms and Google Sheets

The website ships working, with sample data, before you do any of this. Follow
these steps to point it at real forms. Budget about 45 minutes for all three.

Everything you have to change lives in one file: **`src/site.config.ts`**.

---

## How the pieces fit together

```
  Person's phone                     Google                       Anyone browsing
 ┌───────────────┐          ┌────────────────────────┐          ┌───────────────┐
 │ Our own form  │  POST    │  Google Form           │          │  Listing page │
 │ (React, fast, │ ───────► │      ↓                 │          │      ▲        │
 │  bilingual)   │          │  Google Sheet  ────────┼── CSV ──►│      │        │
 └───────────────┘          │  (the database)        │  fetch   └───────────────┘
                            └────────────────────────┘
```

There is no server of ours anywhere in that picture. The Sheet **is** the
database, Google hosts the write path, and the listing pages read a published
CSV straight from the browser.

---

## Step 1 — Create the three Google Forms

Create **three separate forms** at <https://forms.google.com>. The question
*order* matters: the code maps spreadsheet columns by position, so keep it
exactly as listed. Question titles can be worded however you like (write them
bilingually — the Sheet is what your moderators will read).

### Form 1 — Missing person

| # | Question | Type | Required |
|---|----------|------|----------|
| 1 | Full name of missing person | Short answer | Yes |
| 2 | District | Short answer | Yes |
| 3 | Last seen location | Paragraph | Yes |
| 4 | Reporter's name | Short answer | Yes |
| 5 | Reporter's contact number | Short answer | Yes |
| 6 | Age | Short answer | No |
| 7 | Gender | Short answer | No |
| 8 | Photo link | Short answer | No |
| 9 | Last seen date and time | Short answer | No |
| 10 | Physical description | Paragraph | No |
| 11 | Additional notes | Paragraph | No |

### Form 2 — Found person

| # | Question | Type | Required |
|---|----------|------|----------|
| 1 | Name of found person | Short answer | Yes |
| 2 | District | Short answer | Yes |
| 3 | Current location of person | Paragraph | Yes |
| 4 | Reporter's name | Short answer | Yes |
| 5 | Reporter's contact number | Short answer | Yes |
| 6 | Age | Short answer | No |
| 7 | Gender | Short answer | No |
| 8 | Photo link | Short answer | No |
| 9 | Condition | Short answer | No |
| 10 | Where the person is sheltered | Paragraph | No |
| 11 | Additional notes | Paragraph | No |

### Form 3 — Help request (SOS)

| # | Question | Type | Required |
|---|----------|------|----------|
| 1 | Type of need | Short answer | Yes |
| 2 | Contact number | Short answer | Yes |
| 3 | District | Short answer | No |
| 4 | Location description | Paragraph | No |
| 5 | Latitude | Short answer | No |
| 6 | Longitude | Short answer | No |
| 7 | Accuracy (m) | Short answer | No |
| 8 | Number of people | Short answer | No |
| 9 | Additional details | Paragraph | No |

> **Use "Short answer" for every field, including "Type of need" and "Condition".**
> Our site sends its own text (`Food, Shelter`), and a Google multiple-choice
> question rejects anything that is not one of its own options. Short answer
> accepts whatever we send.

**In each form's Settings, turn OFF:**

- "Collect email addresses"
- "Limit to 1 response"
- "Require sign in"

Any of these makes the form reject anonymous submissions, which is the whole
point of the site.

---

## Step 2 — Get each form's ID

Click **Send → link icon (🔗)** and copy the live URL. It looks like:

```
https://docs.google.com/forms/d/e/1FAIpQLSd_EXAMPLE_LONG_STRING/viewform
                                  └────────── this is the formId ──────────┘
```

Put it in `src/site.config.ts`:

```ts
export const FORMS = {
  missing: { formId: '1FAIpQLSd_EXAMPLE_LONG_STRING', fields: { … } },
  …
};
```

---

## Step 3 — Get the `entry.…` field IDs

Google names every field `entry.<number>`. To read them all at once:

1. Open the live form URL (the `/viewform` one) in Chrome or Firefox.
2. Press **Ctrl+U** (View source).
3. Press **Ctrl+F** and search for `entry.`

You will see them in the same order as your questions. A faster way: paste this
into the browser console **while the live form is open**:

```js
[...document.querySelectorAll('[name^="entry."]')]
  .map((el, i) => `${i + 1}. ${el.name}`)
  .join('\n');
```

Copy each number into the matching field in `src/site.config.ts`:

```ts
missing: {
  formId: '…',
  fields: {
    personName: 'entry.1234567890',   // question 1
    district: 'entry.0987654321',     // question 2
    …
  },
},
```

**Test it before you rely on it.** Run the site, submit one report, and check the
row appears in the Sheet. If a column is empty, that field's `entry.` number is
wrong.

---

## Step 4 — Publish each Sheet as CSV

In the form: **Responses → link to Sheets → Create a new spreadsheet.**

Then in the spreadsheet:

1. **File → Share → Publish to web**
2. Choose the specific sheet tab (not "Entire document")
3. Choose **Comma-separated values (.csv)**
4. Click **Publish** and copy the URL

It looks like:

```
https://docs.google.com/spreadsheets/d/e/2PACX-1vRxxxxx/pub?gid=0&single=true&output=csv
```

Paste it into `src/site.config.ts`:

```ts
export const SHEETS = {
  missing: {
    csvUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-…&output=csv',
    sheetUrl: 'https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit',
    columns: { … },   // leave these alone if you kept the question order above
  },
};
```

`sheetUrl` is the ordinary editing link. The site offers it as a fallback if the
CSV fetch ever fails, so a volunteer can still read the data.

> Publishing to the web makes the responses **public to anyone with the link**.
> That is intentional here — see [`docs/DESIGN-NOTES.md`](docs/DESIGN-NOTES.md)
> — but never put anything in these Sheets you would not put on a public
> noticeboard.

---

## Step 5 — Moderation

Add one extra column at the far right of each response sheet, headed `Status`.
Leave it empty for normal rows. Type any of these to hide a row from the website:

```
spam   hide   hidden   remove   deleted   duplicate
```

The listing pages drop those rows on every load. This is the site's real defence
against abuse — the in-browser checks only slow bots down.

Do not insert the column anywhere else: the code reads it by position, and
Google always appends new form answers to the left of it as long as you add it
after the last question column.

---

## Step 6 — Deploy

```bash
npm install
npm run build          # writes dist/
```

`dist/` is a plain static folder. Any host will serve it.

### GitHub Pages (what this repo is configured for)

Push to `main` and the included workflow
(`.github/workflows/deploy.yml`) builds and publishes automatically. Enable it
once, under **Settings → Pages → Source → GitHub Actions**.

The site will be at `https://<user>.github.io/<repo>/`.

### A custom domain, Netlify, Vercel or Cloudflare Pages

1. In `vite.config.ts` the base path comes from `VITE_BASE_PATH`; set it to `/`.
2. In `src/site.config.ts`, set `SITE.url` to your domain (no trailing slash)
   and `SITE.basePath` to `'/'`.
3. Build command `npm run build`, publish directory `dist`.

Both values feed the canonical URLs, the sitemap and the language tags, so
getting them right matters for search engines.

---

## Checklist before you tell people about the site

- [ ] All three forms accept a submission from the live site
- [ ] All three listing pages show that submission within a few minutes
- [ ] The demo-data banner is **gone** (it disappears once `csvUrl` is set)
- [ ] `Status` column added to all three sheets, and someone is watching them
- [ ] Emergency numbers in `site.config.ts` verified with a local authority
- [ ] `SITE.moderatorContact` filled in, so people can ask for a takedown
- [ ] Someone has actually tested the SOS form outdoors, on a phone, on mobile data
