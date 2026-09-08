import { createContext, useContext, useEffect, useMemo, useState } from 'react'

// English is the default for first-time visitors; Nepali is one tap away.
// The choice is remembered locally so returning visitors don't re-pick it.
export const LANGS = ['en', 'ne']
const STORAGE_KEY = 'flood-relief-lang'

export const dict = {
  siteName: { ne: 'सहयोग', en: 'Sahayog' },
  siteTagline: { ne: 'बाढी राहत', en: 'Flood Relief Help' },
  langLabel: { ne: 'भाषा', en: 'Language' },
  langEnglish: { ne: 'English', en: 'English' },
  langNepali: { ne: 'नेपाली', en: 'नेपाली' },

  navHome: { ne: 'गृहपृष्ठ', en: 'Home' },
  backHome: { ne: '← गृहपृष्ठ', en: '← Home' },

  // --- Home page ---
  homeQuestion: { ne: 'तपाईंलाई के गर्नु छ?', en: 'What do you want to do?' },
  homeIntro: {
    ne: 'तलको ठूलो बटन थिच्नुहोस्। खाता बनाउनु पर्दैन, लगइन गर्नु पर्दैन।',
    en: 'Tap one of the big buttons below. No account, no login needed.'
  },

  helpTitle: { ne: 'मलाई तुरुन्त सहयोग चाहियो', en: 'I Need Urgent Help' },
  helpDesc: {
    ne: 'खाना, पानी, आश्रय वा औषधि चाहिन्छ? तुरुन्त अनुरोध पठाउनुहोस्। स्वयंसेवकहरूले तपाईंलाई देख्नेछन्।',
    en: 'Need food, water, shelter or medicine? Send a request now. Volunteers will see it.'
  },
  missingTitle: { ne: 'म हराएको मान्छे खोज्दै छु', en: 'I Am Looking for Someone I Lost' },
  missingDesc: {
    ne: 'तपाईंको आफन्त हराएको छ? उहाँको विवरण लेख्नुहोस्, वा हराएका मानिसहरूको सूची हेर्नुहोस्।',
    en: 'Is a family member or friend missing? Write their details, or look through the list of missing people.'
  },
  foundTitle: { ne: 'मैले कसैलाई भेटें', en: 'I Found Someone' },
  foundDesc: {
    ne: 'तपाईंले सुरक्षित वा घाइते मान्छे भेट्नुभयो? उहाँको जानकारी लेख्नुहोस् ताकि परिवारले थाहा पाऊन्।',
    en: 'Did you find a person who is safe or hurt? Write their details so their family can find them.'
  },
  volunteerTitle: { ne: 'म स्वयंसेवक हुँ', en: 'I Am a Volunteer' },
  volunteerDesc: {
    ne: 'सहयोग चाहिने सबै मानिसहरू एकै ठाउँमा खोज्नुहोस् — के चाहिएको छ, कहाँ छन् र फोन नम्बर सहित।',
    en: 'Search everyone who needs help in one place — what they need, where they are, and their phone number.'
  },

  reportBtn: { ne: 'जानकारी लेख्नुहोस्', en: 'Write a Report' },
  browseBtn: { ne: 'सूची हेर्नुहोस्', en: 'See the List' },
  sosBtn: { ne: 'अहिले नै सहयोग माग्नुहोस्', en: 'Ask for Help Now' },
  volunteerBtn: { ne: 'सहयोग चाहिनेहरू खोज्नुहोस्', en: 'Find People Who Need Help' },

  // --- Shared form bits ---
  required: { ne: 'भर्नै पर्ने', en: 'must fill' },
  optional: { ne: 'छाडे पनि हुन्छ', en: 'can skip' },
  submit: { ne: 'पठाउनुहोस्', en: 'Send' },
  submitting: { ne: 'पठाउँदै…', en: 'Sending…' },
  cancel: { ne: 'रद्द गर्नुहोस्', en: 'Cancel' },
  successTitle: { ne: 'पठाइयो', en: 'Sent' },
  successMissing: {
    ne: 'तपाईंको जानकारी पुग्यो। स्वयंसेवकहरूले चाँडै हेर्नेछन्। तपाईं यसलाई सूचीमा हेर्न सक्नुहुन्छ।',
    en: 'We received your report. Volunteers will see it soon. You can also see it in the list.'
  },
  successFound: {
    ne: 'धन्यवाद! जानकारी सूचीमा थपियो, ताकि परिवारले खोज्न सकून्।',
    en: 'Thank you! The details are now in the list, so the family can find them.'
  },
  successHelp: {
    ne: 'तपाईंको अनुरोध पठाइयो। नजिकैका स्वयंसेवकहरूले हेर्नेछन्। फोन नजिकै राख्नुहोस्।',
    en: 'Your request has been sent. Volunteers nearby will see it. Please keep your phone close.'
  },
  errorGeneric: {
    ne: 'पठाउन सकिएन। कृपया फेरि प्रयास गर्नुहोस्।',
    en: 'It could not be sent. Please try again.'
  },
  errorRequired: {
    ne: 'कृपया "भर्नै पर्ने" लेखिएका सबै ठाउँ भर्नुहोस्।',
    en: 'Please fill in every box marked "must fill".'
  },
  viewAnother: { ne: 'अर्को थप्नुहोस्', en: 'Send Another' },

  // --- Missing form fields ---
  fldFullName: { ne: 'हराएको मान्छेको पूरा नाम', en: 'Full name of the missing person' },
  fldLastSeenDistrict: { ne: 'अन्तिम पटक देखिएको जिल्ला', en: 'District where they were last seen' },
  fldLastSeenLocation: { ne: 'अन्तिम पटक देखिएको ठाउँ (गाउँ, टोल, बाटो)', en: 'Place where they were last seen (village, tole, road)' },
  fldReporterName: { ne: 'तपाईंको नाम', en: 'Your name' },
  fldReporterPhone: { ne: 'तपाईंको फोन नम्बर', en: 'Your phone number' },
  fldReporterPhoneHint: {
    ne: 'स्वयंसेवकले खबर गर्न यही नम्बरमा फोन गर्नेछन्।',
    en: 'Volunteers will call this number when they have news.'
  },
  fldAge: { ne: 'उमेर (वर्ष)', en: 'Age (in years)' },
  fldGender: { ne: 'लिङ्ग', en: 'Man or woman?' },
  fldGenderMale: { ne: 'पुरुष', en: 'Man' },
  fldGenderFemale: { ne: 'महिला', en: 'Woman' },
  fldGenderOther: { ne: 'अन्य', en: 'Other' },
  fldLastSeenDateTime: { ne: 'अन्तिम पटक कहिले देखिनुभयो?', en: 'When were they last seen?' },
  fldDescription: { ne: 'कस्तो देखिनुहुन्छ? (लुगा, उचाइ, चिन्ह)', en: 'What do they look like? (clothes, height, marks)' },
  fldNotes: { ne: 'अरू केही भन्नु छ?', en: 'Anything else you want to add?' },
  fldPhoto: { ne: 'फोटो', en: 'Photo' },
  fldPhotoHint: {
    ne: 'फोटो भए चिन्न सजिलो हुन्छ। फोटो आफै सानो बनाइन्छ, त्यसैले सुस्त इन्टरनेटमा पनि जान्छ।',
    en: 'A photo makes it much easier to recognise them. We shrink the photo for you, so it works on slow internet too.'
  },

  // --- Found form fields ---
  fldFoundName: { ne: 'उहाँको नाम (थाहा नभए "थाहा छैन" लेख्नुहोस्)', en: 'Their name (write "unknown" if you do not know)' },
  fldCurrentLocation: { ne: 'उहाँ अहिले कहाँ हुनुहुन्छ?', en: 'Where is this person right now?' },
  fldCondition: { ne: 'उहाँको अवस्था कस्तो छ?', en: 'How is this person?' },
  fldConditionSafe: { ne: 'सुरक्षित', en: 'Safe' },
  fldConditionInjured: { ne: 'घाइते', en: 'Hurt' },
  fldConditionMedical: { ne: 'उपचार चाहिन्छ', en: 'Needs a doctor' },
  shelterAt: { ne: 'अहिले बस्ने ठाउँ:', en: 'Staying at:' },
  fldShelterLocation: { ne: 'कुन शिविर वा घरमा राखिएको छ?', en: 'Which camp or house are they staying in?' },

  // --- Help form fields ---
  fldNeedType: { ne: 'तपाईंलाई के चाहिन्छ?', en: 'What do you need?' },
  needFood: { ne: 'खाना र पानी', en: 'Food and water' },
  needShelter: { ne: 'बस्ने ठाउँ', en: 'A place to stay' },
  needMedicine: { ne: 'औषधि / उपचार', en: 'Medicine or a doctor' },
  needOther: { ne: 'अरू केही', en: 'Something else' },
  fldContactPhone: { ne: 'तपाईंको फोन नम्बर', en: 'Your phone number' },
  fldContactPhoneHint: {
    ne: 'स्वयंसेवकले यही नम्बरमा फोन गर्नेछन्।',
    en: 'Volunteers will call you on this number.'
  },
  fldLocation: { ne: 'तपाईं कहाँ हुनुहुन्छ?', en: 'Where are you?' },
  fldLocationHint: {
    ne: 'गाउँ, टोल वा नजिकैको ठूलो ठाउँ लेख्नुहोस् (जस्तै: स्कुल, मन्दिर, पुल)।',
    en: 'Write your village or tole, and a big landmark nearby (school, temple, bridge).'
  },
  fldLocationAuto: { ne: 'तपाईंको ठाउँ खोज्दै छौं…', en: 'Finding your location…' },
  fldLocationOk: { ne: 'तपाईंको ठाउँ भेटियो', en: 'We found your location' },
  fldLocationFailed: {
    ne: 'ठाउँ आफैं पत्ता लाग्न सकेन। कृपया तल लेखिदिनुहोस्।',
    en: 'We could not find your location. Please type it below.'
  },
  fldLocationRetry: { ne: 'फेरि प्रयास गर्नुहोस्', en: 'Try again' },
  fldNumPeople: { ne: 'कतिजनालाई सहयोग चाहिन्छ?', en: 'How many people need help?' },
  fldDetails: { ne: 'अरू केही भन्नु छ?', en: 'Anything else you want to tell us?' },
  helpUrgentNote: {
    ne: 'यो फारम छोटो छ। तीनवटा कुरा मात्र भन्नुहोस् — के चाहियो, फोन नम्बर र कहाँ हुनुहुन्छ।',
    en: 'This form is short. Just tell us three things — what you need, your phone number, and where you are.'
  },

  // --- Listing pages ---
  missingListTitle: { ne: 'हराएका मानिसहरू', en: 'Missing People' },
  foundListTitle: { ne: 'भेटिएका मानिसहरू', en: 'People Who Were Found' },
  helpListTitle: { ne: 'सहयोग मागिएका ठाउँहरू', en: 'People Asking for Help' },
  searchPlaceholder: { ne: 'नाम वा ठाउँ लेखेर खोज्नुहोस्…', en: 'Search by name or place…' },
  filterAllDistricts: { ne: 'सबै जिल्ला', en: 'All districts' },
  noResults: { ne: 'केही भेटिएन।', en: 'Nothing found.' },
  loading: { ne: 'ल्याउँदै छौं…', en: 'Loading…' },
  loadError: {
    ne: 'सूची ल्याउन सकिएन। कृपया फेरि प्रयास गर्नुहोस्।',
    en: 'The list could not be loaded. Please try again.'
  },
  reportedAt: { ne: 'लेखिएको', en: 'Sent' },
  mapView: { ne: 'नक्सामा हेर्नुहोस्', en: 'Show map' },
  listView: { ne: 'सूचीमा हेर्नुहोस्', en: 'Show list' },
  callBtn: { ne: 'फोन गर्नुहोस्', en: 'Call' },
  peopleCount: { ne: 'जना', en: 'people' },
  notConfigured: {
    ne: 'साइट अझै तयार हुँदैछ — कृपया केही बेरपछि फेरि आउनुहोस्।',
    en: 'The site is still being set up — please come back in a little while.'
  },

  // --- Volunteer page ---
  volunteerPageTitle: { ne: 'स्वयंसेवक खोज', en: 'Volunteer Search' },
  volunteerPageIntro: {
    ne: 'सहयोग मागेका, हराएका र भेटिएका सबै मानिसहरू यहाँ एकै ठाउँमा छन्। नाम, ठाउँ वा फोन नम्बर लेखेर खोज्नुहोस्।',
    en: 'Everyone who asked for help, everyone missing, and everyone found — all in one place. Search by name, place or phone number.'
  },
  volunteerSearchPlaceholder: {
    ne: 'नाम, ठाउँ, जिल्ला वा फोन नम्बर लेख्नुहोस्…',
    en: 'Type a name, place, district or phone number…'
  },
  filterAll: { ne: 'सबै', en: 'Everyone' },
  filterNeedsHelp: { ne: 'सहयोग चाहिने', en: 'Needs help' },
  filterMissing: { ne: 'हराएका', en: 'Missing' },
  filterFound: { ne: 'भेटिएका', en: 'Found' },
  filterUrgentFirst: { ne: 'पहिले जरुरी', en: 'Most urgent first' },
  volunteerCount: { ne: 'जना देखाइँदै छ', en: 'people shown' },
  volunteerRefresh: { ne: 'नयाँ जानकारी ल्याउनुहोस्', en: 'Refresh' },
  badgeNeedsHelp: { ne: 'सहयोग चाहियो', en: 'Needs help' },
  badgeMissing: { ne: 'हराएको', en: 'Missing' },
  badgeFound: { ne: 'भेटियो', en: 'Found' },
  volunteerNoResults: {
    ne: 'यो खोजमा कोही भेटिएन। अर्को शब्दले खोज्नुहोस्।',
    en: 'Nobody matches this search. Try another word.'
  },
  volunteerHowTo: {
    ne: 'फोन बटन थिच्दा सिधै फोन लाग्छ। सहयोग पुर्‍याएपछि टोलीलाई खबर गर्नुहोस्।',
    en: 'Tap the Call button to phone the person directly. Tell your team once help has reached them.'
  }
}

export function t(key, lang) {
  const entry = dict[key]
  if (!entry) return key
  return entry[lang] ?? entry.en ?? key
}

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return LANGS.includes(saved) ? saved : 'en'
    } catch {
      return 'en'
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, lang)
    } catch {
      // ignore storage failures (private browsing etc.)
    }
    document.documentElement.lang = lang
  }, [lang])

  const value = useMemo(
    () => ({
      lang,
      setLang: (next) => LANGS.includes(next) && setLang(next),
      toggleLang: () => setLang((l) => (l === 'ne' ? 'en' : 'ne')),
      t: (key) => t(key, lang)
    }),
    [lang]
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLang() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLang must be used within a LanguageProvider')
  return ctx
}
