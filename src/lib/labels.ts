import type { Dict } from '../i18n/en';
import { DISTRICTS } from '../data/districts';
import type { Lang } from '../i18n';

/**
 * Values are stored in the Sheet in English so both languages filter on the same
 * string. These turn a stored value back into the reader's language, and fall
 * back to the raw text when somebody typed something we do not recognise.
 */

export function districtLabel(stored: string, lang: Lang): string {
  const match = DISTRICTS.find((d) => d.en.toLowerCase() === stored.trim().toLowerCase());
  if (!match) return stored;
  return lang === 'ne' ? match.ne : match.en;
}

export function conditionLabel(stored: string, t: Dict): string {
  switch (stored.trim().toLowerCase()) {
    case 'safe':
      return t.found.conditionSafe;
    case 'injured':
      return t.found.conditionInjured;
    case 'needs medical attention':
      return t.found.conditionMedical;
    case 'deceased':
      return t.found.conditionDeceased;
    default:
      return stored;
  }
}

export function needLabel(stored: string, t: Dict): string {
  switch (stored.trim().toLowerCase()) {
    case 'food':
      return t.sos.needFood;
    case 'drinking water':
    case 'water':
      return t.sos.needWater;
    case 'shelter':
      return t.sos.needShelter;
    case 'medicine':
      return t.sos.needMedicine;
    case 'rescue':
      return t.sos.needRescue;
    case 'other':
      return t.sos.needOther;
    default:
      return stored;
  }
}

/** Google joins checkbox answers with ", " — split them back into chips. */
export function splitNeeds(stored: string): string[] {
  return stored
    .split(/[,;|]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function genderLabel(stored: string, t: Dict): string {
  switch (stored.trim().toLowerCase()) {
    case 'male':
      return t.forms.genderMale;
    case 'female':
      return t.forms.genderFemale;
    case 'other':
      return t.forms.genderOther;
    default:
      return stored;
  }
}
