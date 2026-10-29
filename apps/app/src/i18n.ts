import { initI18n, isRtl, matchLanguage } from '@touchline/i18n';
import { getLocales } from 'expo-localization';
import i18n from 'i18next';
import { I18nManager, Platform } from 'react-native';
import { initReactI18next } from 'react-i18next';

const language = matchLanguage(getLocales()[0]?.languageTag);

i18n.use(initReactI18next);
void initI18n(i18n, language);

if (Platform.OS === 'web') {
  // Guarded because web pages are also rendered on the server.
  if (typeof document !== 'undefined') {
    document.documentElement.lang = language;
    document.documentElement.dir = isRtl(language) ? 'rtl' : 'ltr';
  }
} else {
  // Native layout direction is fixed per launch; a language change applies after restart.
  I18nManager.allowRTL(true);
  I18nManager.forceRTL(isRtl(language));
}

export default i18n;
