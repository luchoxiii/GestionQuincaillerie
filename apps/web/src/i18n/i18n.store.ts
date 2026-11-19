import { create } from 'zustand';
import {
  type SupportedLanguage,
  type LanguageOption,
  SUPPORTED_LANGUAGES,
  DEFAULT_LANGUAGE,
  LANGUAGE_STORAGE_KEY,
} from '@ferreteria/shared';
import type { TranslationDictionary } from './types';
import { es } from './locales/es';
import { en } from './locales/en';
import { pt } from './locales/pt';
import { fr } from './locales/fr';

const dictionaries: Record<SupportedLanguage, TranslationDictionary> = {
  es,
  en,
  pt,
  fr,
};

interface I18nState {
  currentLanguage: SupportedLanguage;
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  supportedLanguages: LanguageOption[];
  getCurrentLanguageInfo: () => LanguageOption;
}

function getStoredLanguage(): SupportedLanguage {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE;
  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored && ['es', 'en', 'pt', 'fr'].includes(stored)) {
      return stored as SupportedLanguage;
    }
  } catch {}
  return DEFAULT_LANGUAGE;
}

function resolveNestedKey(obj: any, path: string): string | undefined {
  if (!obj || !path) return undefined;
  const parts = path.split('.');
  let current = obj;
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return undefined;
    }
  }
  return typeof current === 'string' ? current : undefined;
}

function interpolate(text: string, params?: Record<string, string | number>): string {
  if (!params || !text) return text;
  return Object.entries(params).reduce((acc, [key, value]) => {
    return acc.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
  }, text);
}

export const useI18nStore = create<I18nState>((set, get) => {
  const initialLang = getStoredLanguage();
  return {
    currentLanguage: initialLang,
    language: initialLang,

    setLanguage: (lang: SupportedLanguage) => {
      if (!['es', 'en', 'pt', 'fr'].includes(lang)) return;

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
        } catch {}

        if (typeof document !== 'undefined') {
          document.documentElement.lang = lang;
        }

        window.dispatchEvent(
          new CustomEvent('language-changed', {
            detail: { language: lang },
          })
        );
      }

      set({ currentLanguage: lang, language: lang });
    },

  t: (key: string, params?: Record<string, string | number>): string => {
    const lang = get().currentLanguage;
    const activeDict = dictionaries[lang] || dictionaries[DEFAULT_LANGUAGE];
    
    // Resolve in active language dictionary
    let text = resolveNestedKey(activeDict, key);

    // Fallback to Spanish if missing
    if (text === undefined && lang !== DEFAULT_LANGUAGE) {
      text = resolveNestedKey(dictionaries[DEFAULT_LANGUAGE], key);
    }

    // Fallback to raw key if not found in any dictionary
    if (text === undefined) {
      return key;
    }

    return interpolate(text, params);
  },

  supportedLanguages: SUPPORTED_LANGUAGES,

  getCurrentLanguageInfo: () => {
    const lang = get().currentLanguage;
    return (
      SUPPORTED_LANGUAGES.find((l) => l.code === lang) ||
      SUPPORTED_LANGUAGES[0]
    );
  },
};
});

export function useI18n() {
  const currentLanguage = useI18nStore((s) => s.currentLanguage);
  const language = useI18nStore((s) => s.language);
  const setLanguage = useI18nStore((s) => s.setLanguage);
  const t = useI18nStore((s) => s.t);
  const supportedLanguages = useI18nStore((s) => s.supportedLanguages);
  const currentLanguageInfo = useI18nStore((s) => s.getCurrentLanguageInfo());

  return {
    currentLanguage,
    language,
    setLanguage,
    t,
    supportedLanguages,
    currentLanguageInfo,
  };
}

// Global standalone translate function for non-React contexts
export const t = (key: string, params?: Record<string, string | number>): string => {
  return useI18nStore.getState().t(key, params);
};
