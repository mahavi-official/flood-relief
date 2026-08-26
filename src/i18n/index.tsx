import { createContext, useContext, type ReactNode } from 'react';
import { en, type Dict } from './en';
import { ne } from './ne';

export type Lang = 'ne' | 'en';

export const LANGS: Lang[] = ['ne', 'en'];
/** Nepali first: the people this site is for read Nepali. */
export const DEFAULT_LANG: Lang = 'ne';

const DICTS: Record<Lang, Dict> = { ne, en };

const LangContext = createContext<Lang>(DEFAULT_LANG);

export function LangProvider({ lang, children }: { lang: Lang; children: ReactNode }) {
  return <LangContext.Provider value={lang}>{children}</LangContext.Provider>;
}

export function useLang(): Lang {
  return useContext(LangContext);
}

/** The whole dictionary for the active language: `const t = useT(); t.home.h1`. */
export function useT(): Dict {
  return DICTS[useContext(LangContext)];
}

export function dictFor(lang: Lang): Dict {
  return DICTS[lang];
}

export function otherLang(lang: Lang): Lang {
  return lang === 'ne' ? 'en' : 'ne';
}

/** Fills `{n}` style holes: fmt(t.common.minutesAgo, { n: 5 }). */
export function fmt(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (whole, key: string) =>
    key in vars ? String(vars[key]) : whole,
  );
}

const NE_DIGITS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];

/**
 * Turns Devanagari digits back into ASCII. Somebody typing on a Nepali keyboard
 * answers "६", and it would be a poor joke to reject their report for it.
 */
export function toAsciiDigits(value: string): string {
  return value.replace(/[०-९]/g, (d) => String(NE_DIGITS.indexOf(d)));
}

/** Nepali readers expect Devanagari numerals; English readers do not. */
export function localeNum(value: number | string, lang: Lang): string {
  const s = String(value);
  if (lang !== 'ne') return s;
  return s.replace(/[0-9]/g, (d) => NE_DIGITS[Number(d)]);
}
