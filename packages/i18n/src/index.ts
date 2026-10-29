import type { i18n as I18n, Resource } from 'i18next';

import languages from './languages.json';
import ar from './locales/ar.json';
import bn from './locales/bn.json';
import de from './locales/de.json';
import en from './locales/en.json';
import es from './locales/es.json';
import fa from './locales/fa.json';
import fr from './locales/fr.json';
import ha from './locales/ha.json';
import hi from './locales/hi.json';
import id from './locales/id.json';
import ig from './locales/ig.json';
import it from './locales/it.json';
import ja from './locales/ja.json';
import ko from './locales/ko.json';
import nl from './locales/nl.json';
import pl from './locales/pl.json';
import pt from './locales/pt.json';
import ru from './locales/ru.json';
import sw from './locales/sw.json';
import th from './locales/th.json';
import tr from './locales/tr.json';
import ur from './locales/ur.json';
import vi from './locales/vi.json';
import yo from './locales/yo.json';
import zh from './locales/zh.json';

export type LanguageCode = keyof typeof languages;
export type MessageKey = keyof typeof en;

export interface Language {
  code: LanguageCode;
  /** Endonym, e.g. "Français". */
  name: string;
  dir: 'ltr' | 'rtl';
}

export const LANGUAGES: Language[] = Object.entries(languages).map(([code, meta]) => ({
  code: code as LanguageCode,
  name: meta.name,
  dir: meta.dir as Language['dir'],
}));

const messages = { ar, bn, de, en, es, fa, fr, ha, hi, id, ig, it, ja, ko, nl, pl, pt, ru, sw, th, tr, ur, vi, yo, zh };

export const resources: Resource = Object.fromEntries(
  Object.entries(messages).map(([code, translation]) => [code, { translation }]),
);

export function isRtl(code: string): boolean {
  return LANGUAGES.find((language) => language.code === code)?.dir === 'rtl';
}

/** Best supported language for a device locale such as "fr-CA"; English otherwise. */
export function matchLanguage(locale: string | null | undefined): LanguageCode {
  const base = (locale ?? '').split(/[-_]/)[0]?.toLowerCase();
  return LANGUAGES.find((language) => language.code === base)?.code ?? 'en';
}

/**
 * Initialises an i18next instance with every locale. Keys contain dots ("sport.football"),
 * so nesting is disabled.
 */
export function initI18n(instance: I18n, lng: LanguageCode): Promise<unknown> {
  return instance.init({
    resources,
    lng,
    fallbackLng: 'en',
    keySeparator: false,
    nsSeparator: false,
    interpolation: { escapeValue: false },
    returnNull: false,
    // Resources are bundled, so initialise synchronously and render translated on first paint.
    initAsync: false,
  });
}
