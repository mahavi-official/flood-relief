import { createContext, useContext, useEffect, useMemo, useState } from 'react'

// Nepali is the default for first-time visitors, per the brief.
// Preference is remembered locally so returning visitors don't have to re-toggle.
export const LANGS = ['ne', 'en']
const STORAGE_KEY = 'flood-relief-lang'

export const dict = {
  siteName: { ne: 'सहयोग', en: 'Sahayog' },
  siteTagline: { ne: 'बाढी राहत ड्यासबोर्ड', en: 'Flood Relief Dashboard' },
  langToggle: { ne: 'English', en: 'नेपालीमा' },

  navMissing: { ne: 'हराएको व्यक्ति', en: 'Missing Person' },
  navFound: { ne: 'भेटिएको व्यक्ति', en: 'Found Person' },
  navHelp: { ne: 'सहयोग माग्नुहोस्', en: 'Ask for Help' },
  navHome: { ne: 'गृहपृष्ठ', en: 'Home' },

  // --- Home page ---
  homeIntro: {
    ne: 'हराएका वा भेटिएका व्यक्तिको जानकारी दिनुहोस्, वा तत्काल सहयोग माग्नुहोस्। लगइन आवश्यक छैन।',
    en: 'Report a missing or found person, or request urgent help. No login needed.'
  },
  missingTitle: { ne: 'हराएको व्यक्ति खोज्दै', en: 'Looking for Someone' },
  missingDesc: {
    ne: 'हराएको व्यक्तिको विवरण रिपोर्ट गर्नुहोस् वा हालसम्मका रिपोर्टहरू हेर्नुहोस्।',
    en: 'Report details of a missing person, or browse existing reports.'
  },
  foundTitle: { ne: 'भेटिएको व्यक्ति', en: 'Found Someone' },
  foundDesc: {
    ne: 'तपाईंले भेट्टाउनु भएको व्यक्तिको जानकारी दिनुहोस् वा सूची हेर्नुहोस्।',
    en: 'Report a person you found safe, or browse the list.'
  },
  helpTitle: { ne: 'मलाई सहयोग चाहियो', en: 'I Need Help' },
  helpDesc: {
    ne: 'खाना, आश्रय वा औषधि चाहिन्छ? तपाईंको स्थानसहित तुरुन्त अनुरोध पठाउनुहोस्।',
    en: 'Need food, shelter, or medicine? Send an urgent request with your location.'
  },
  reportBtn: { ne: 'रिपोर्ट गर्नुहोस्', en: 'Report' },
  browseBtn: { ne: 'सूची हेर्नुहोस्', en: 'Browse List' },
  sosBtn: { ne: 'सहयोग माग्नुहोस्', en: 'Request Help Now' },

  // --- Shared form bits ---
  required: { ne: 'आवश्यक', en: 'required' },
  optional: { ne: 'ऐच्छिक', en: 'optional' },
  submit: { ne: 'पेश गर्नुहोस्', en: 'Submit' },
  submitting: { ne: 'पेश हुँदैछ…', en: 'Submitting…' },
  cancel: { ne: 'रद्द गर्नुहोस्', en: 'Cancel' },
  backHome: { ne: '← गृहपृष्ठमा फर्कनुहोस्', en: '← Back to home' },
  successTitle: { ne: 'सफलतापूर्वक पेश भयो', en: 'Submitted successfully' },
  successMissing: {
    ne: 'रिपोर्ट प्राप्त भयो। स्वयंसेवकहरूले चाँडै हेर्नेछन्। तपाईं सूचीमा यसलाई हेर्न सक्नुहुन्छ।',
    en: 'Your report was received. Volunteers will see it shortly. You can view it in the list.'
  },
  successFound: {
    ne: 'धन्यवाद! जानकारी सूचीमा थपियो।',
    en: 'Thank you! The information has been added to the list.'
  },
  successHelp: {
    ne: 'तपाईंको अनुरोध पठाइयो। नजिकैका स्वयंसेवकहरूले हेर्नेछन्।',
    en: 'Your request has been sent. Nearby volunteers will see it.'
  },
  errorGeneric: {
    ne: 'केही समस्या भयो। कृपया फेरि प्रयास गर्नुहोस्।',
    en: 'Something went wrong. Please try again.'
  },
  errorRequired: { ne: 'कृपया सबै आवश्यक क्षेत्रहरू भर्नुहोस्।', en: 'Please fill in all required fields.' },
  viewAnother: { ne: 'अर्को थप्नुहोस्', en: 'Submit another' },

  // --- Missing form fields ---
  fldFullName: { ne: 'हराएको व्यक्तिको पूरा नाम', en: 'Full name of missing person' },
  fldLastSeenDistrict: { ne: 'अन्तिम देखिएको जिल्ला', en: 'Last seen district' },
  fldLastSeenLocation: { ne: 'अन्तिम देखिएको ठाउँ (विवरण)', en: 'Last seen location (details)' },
  fldReporterName: { ne: 'रिपोर्ट गर्नेको नाम', en: 'Your name' },
  fldReporterPhone: { ne: 'रिपोर्ट गर्नेको फोन नम्बर', en: 'Your phone number' },
  fldAge: { ne: 'उमेर', en: 'Age' },
  fldGender: { ne: 'लिङ्ग', en: 'Gender' },
  fldGenderMale: { ne: 'पुरुष', en: 'Male' },
  fldGenderFemale: { ne: 'महिला', en: 'Female' },
  fldGenderOther: { ne: 'अन्य', en: 'Other' },
  fldLastSeenDateTime: { ne: 'अन्तिम देखिएको मिति/समय', en: 'Last seen date/time' },
  fldDescription: { ne: 'शारीरिक विवरण / छुट्टै चिन्ह', en: 'Physical description / distinguishing marks' },
  fldNotes: { ne: 'थप जानकारी', en: 'Additional notes' },
  fldPhoto: { ne: 'फोटो', en: 'Photo' },
  fldPhotoHint: {
    ne: 'फोटोले चिन्न सजिलो बनाउँछ। फाइल सानो राख्नुहोस् — ढिलो नेटवर्कमा पनि काम गर्न।',
    en: 'A photo helps with identification. Kept small so it still works on slow networks.'
  },

  // --- Found form fields ---
  fldFoundName: { ne: 'नाम (थाहा नभए "थाहा छैन" लेख्नुहोस्)', en: 'Name (write "unknown" if not known)' },
  fldCurrentLocation: { ne: 'हाल भेटिएको ठाउँ', en: 'Current location of the found person' },
  fldCondition: { ne: 'अवस्था', en: 'Condition' },
  fldConditionSafe: { ne: 'सुरक्षित', en: 'Safe' },
  fldConditionInjured: { ne: 'घाइते', en: 'Injured' },
  fldConditionMedical: { ne: 'उपचार आवश्यक', en: 'Needs medical attention' },
  fldShelterLocation: { ne: 'हाल कहाँ राखिएको छ', en: 'Where currently sheltered/kept' },

  // --- Help form fields ---
  fldNeedType: { ne: 'के आवश्यक छ?', en: 'Type of need' },
  needFood: { ne: 'खाना', en: 'Food' },
  needShelter: { ne: 'आश्रय', en: 'Shelter' },
  needMedicine: { ne: 'औषधि', en: 'Medicine' },
  needOther: { ne: 'अन्य', en: 'Other' },
  fldContactPhone: { ne: 'सम्पर्क फोन नम्बर', en: 'Contact phone number' },
  fldLocation: { ne: 'स्थान', en: 'Location' },
  fldLocationAuto: { ne: 'स्थान स्वतः पत्ता लगाइँदै…', en: 'Detecting your location…' },
  fldLocationFailed: {
    ne: 'स्थान पत्ता लगाउन सकिएन। कृपया आफैं लेख्नुहोस्।',
    en: 'Could not detect location automatically. Please enter it yourself.'
  },
  fldLocationRetry: { ne: 'फेरि प्रयास गर्नुहोस्', en: 'Try again' },
  fldNumPeople: { ne: 'कतिजना मानिसलाई सहयोग चाहियो?', en: 'Number of people needing help' },
  fldDetails: { ne: 'थप विवरण', en: 'Additional details' },
  helpUrgentNote: {
    ne: 'यो फारम सकेसम्म छोटो राखिएको छ — हतारमा भर्नका लागि।',
    en: "This form is kept as short as possible — for filling in a hurry."
  },

  // --- Listing pages ---
  missingListTitle: { ne: 'हराएका व्यक्तिहरूको सूची', en: 'Missing Persons' },
  foundListTitle: { ne: 'भेटिएका व्यक्तिहरूको सूची', en: 'Found Persons' },
  helpListTitle: { ne: 'सहयोग अनुरोधहरू', en: 'Help Requests' },
  searchPlaceholder: { ne: 'नाम वा जिल्लाले खोज्नुहोस्…', en: 'Search by name or district…' },
  filterAllDistricts: { ne: 'सबै जिल्ला', en: 'All districts' },
  noResults: { ne: 'कुनै रिपोर्ट भेटिएन।', en: 'No reports found.' },
  loading: { ne: 'लोड हुँदैछ…', en: 'Loading…' },
  loadError: {
    ne: 'सूची लोड गर्न सकिएन। पछि फेरि प्रयास गर्नुहोस्।',
    en: 'Could not load the list. Please try again later.'
  },
  reportedAt: { ne: 'रिपोर्ट गरिएको समय', en: 'Reported' },
  contact: { ne: 'सम्पर्क', en: 'Contact' },
  mapView: { ne: 'नक्सा', en: 'Map' },
  listView: { ne: 'सूची', en: 'List' },
  callBtn: { ne: 'फोन गर्नुहोस्', en: 'Call' },
  peopleCount: { ne: 'जना', en: 'people' },
  notConfigured: {
    ne: 'साइट अझै सेटअप हुँदैछ — कृपया केही बेरपछि फेरि आउनुहोस्।',
    en: 'The site is still being set up — please check back shortly.'
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
      return localStorage.getItem(STORAGE_KEY) || 'ne'
    } catch {
      return 'ne'
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
