/**
 * Everything you need to change to put this site live is in this one file.
 * Follow SETUP.md to create the three Google Forms and get these IDs.
 */

export const SITE = {
  /** No trailing slash. Used for canonical URLs, hreflang, sitemap and og:url. */
  url: 'https://mahavi-official.github.io/flood-relief',
  /** Must match `base` in vite.config.ts. Use '/' for a custom domain. */
  basePath: '/flood-relief/',
  repoUrl: 'https://github.com/mahavi-official/flood-relief',
  /** Shown on the Safety page so people can ask for a report to be removed. */
  moderatorContact: '',
};

/**
 * Emergency numbers shown on the homepage.
 * VERIFY THESE WITH A LOCAL AUTHORITY BEFORE LAUNCHING.
 */
export const EMERGENCY_NUMBERS: { label: { ne: string; en: string }; number: string }[] = [
  { label: { ne: 'प्रहरी', en: 'Police' }, number: '100' },
  { label: { ne: 'एम्बुलेन्स', en: 'Ambulance' }, number: '102' },
  { label: { ne: 'दमकल', en: 'Fire' }, number: '101' },
  {
    label: { ne: 'राष्ट्रिय आपत्कालीन कक्ष', en: 'National Emergency Operation Centre' },
    number: '1149',
  },
];

/**
 * One Google Form per report type.
 *
 * `formId` is the long id in the form's *live* URL:
 *   https://docs.google.com/forms/d/e/<formId>/viewform
 *
 * `fields` maps our field names to Google's `entry.<number>` names. SETUP.md
 * explains how to read them out of the form's HTML in about two minutes.
 *
 * Leave a formId as an empty string and that form shows a clear "not connected
 * yet" message instead of silently throwing submissions away.
 */
export const FORMS = {
  missing: {
    formId: '',
    fields: {
      personName: 'entry.000000001',
      district: 'entry.000000002',
      lastSeenPlace: 'entry.000000003',
      reporterName: 'entry.000000004',
      reporterPhone: 'entry.000000005',
      age: 'entry.000000006',
      gender: 'entry.000000007',
      photoUrl: 'entry.000000008',
      lastSeenAt: 'entry.000000009',
      description: 'entry.000000010',
      notes: 'entry.000000011',
    },
  },
  found: {
    formId: '',
    fields: {
      personName: 'entry.000000001',
      district: 'entry.000000002',
      currentLocation: 'entry.000000003',
      reporterName: 'entry.000000004',
      reporterPhone: 'entry.000000005',
      age: 'entry.000000006',
      gender: 'entry.000000007',
      photoUrl: 'entry.000000008',
      condition: 'entry.000000009',
      shelteredAt: 'entry.000000010',
      notes: 'entry.000000011',
    },
  },
  help: {
    formId: '',
    fields: {
      needs: 'entry.000000001',
      reporterPhone: 'entry.000000002',
      district: 'entry.000000003',
      locationText: 'entry.000000004',
      latitude: 'entry.000000005',
      longitude: 'entry.000000006',
      accuracy: 'entry.000000007',
      peopleCount: 'entry.000000008',
      details: 'entry.000000009',
    },
  },
} as const;

/**
 * The public read side. In Google Sheets: File > Share > Publish to web >
 * pick the sheet > Comma-separated values (.csv) > Publish. Paste that URL here.
 *
 * `columns` maps a zero-based spreadsheet column index to a field. Google puts
 * the submission time in column A and then one column per question in the order
 * the questions appear in the form, so these indexes follow SETUP.md's ordering.
 * If you reorder your form questions, update these numbers.
 *
 * `sheetUrl` is the normal (human) spreadsheet link, offered to the user when
 * the fetch fails so they can still read the data.
 */
export const SHEETS = {
  missing: {
    csvUrl: '',
    sheetUrl: '',
    columns: {
      timestamp: 0,
      personName: 1,
      district: 2,
      lastSeenPlace: 3,
      reporterName: 4,
      reporterPhone: 5,
      age: 6,
      gender: 7,
      photoUrl: 8,
      lastSeenAt: 9,
      description: 10,
      notes: 11,
      /** Optional column YOU add by hand in the Sheet. See "Moderation" in SETUP.md. */
      status: 12,
    },
  },
  found: {
    csvUrl: '',
    sheetUrl: '',
    columns: {
      timestamp: 0,
      personName: 1,
      district: 2,
      currentLocation: 3,
      reporterName: 4,
      reporterPhone: 5,
      age: 6,
      gender: 7,
      photoUrl: 8,
      condition: 9,
      shelteredAt: 10,
      notes: 11,
      status: 12,
    },
  },
  help: {
    csvUrl: '',
    sheetUrl: '',
    columns: {
      timestamp: 0,
      needs: 1,
      reporterPhone: 2,
      district: 3,
      locationText: 4,
      latitude: 5,
      longitude: 6,
      accuracy: 7,
      peopleCount: 8,
      details: 9,
      status: 10,
    },
  },
} as const;

/** Rows whose moderation column holds one of these are never rendered. */
export const HIDDEN_STATUSES = ['spam', 'hide', 'hidden', 'remove', 'deleted', 'duplicate'];

/** How long a fetched CSV is reused before we ask Google again. */
export const DATA_CACHE_MS = 60_000;

/** Client-side throttle: how many reports one browser may send per window. */
export const RATE_LIMIT = { max: 5, windowMs: 10 * 60_000 };

/** A form submitted faster than this is almost certainly a bot. */
export const MIN_FILL_MS = 3_000;

export type FormKey = keyof typeof FORMS;
