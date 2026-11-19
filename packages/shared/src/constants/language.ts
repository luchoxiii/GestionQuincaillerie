export type SupportedLanguage = 'es' | 'en' | 'pt' | 'fr';

export interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
  locale: string;
  speechLocale: string;
}

export const DEFAULT_LANGUAGE: SupportedLanguage = 'es';

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'es', name: 'Español', nativeName: 'Español', flag: '🇪🇸', locale: 'es-ES', speechLocale: 'es-ES' },
  { code: 'en', name: 'Inglés', nativeName: 'English', flag: '🇺🇸', locale: 'en-US', speechLocale: 'en-US' },
  { code: 'pt', name: 'Portugués', nativeName: 'Português', flag: '🇧🇷', locale: 'pt-BR', speechLocale: 'pt-BR' },
  { code: 'fr', name: 'Francés', nativeName: 'Français', flag: '🇫🇷', locale: 'fr-FR', speechLocale: 'fr-FR' },
];

export const LANGUAGE_STORAGE_KEY = 'ferreteria_language';
