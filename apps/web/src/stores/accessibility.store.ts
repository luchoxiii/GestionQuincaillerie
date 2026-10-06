import { create } from 'zustand';

export type HighContrastMode = 'none' | 'yellow-black' | 'dark' | 'light';
export type FontSizeMode = 'normal' | 'large' | 'xlarge' | 'huge';
export type ColorBlindnessMode = 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia';

export interface AccessibilitySettings {
  highContrast: HighContrastMode;
  fontSize: FontSizeMode;
  dyslexicFont: boolean;
  colorBlindness: ColorBlindnessMode;
  reducedMotion: boolean;
  readingGuide: boolean;
  largeCursor: boolean;
  soundFeedback: boolean;
  textToSpeech: boolean;
  keyboardHelper: boolean;
}

interface AccessibilityStore extends AccessibilitySettings {
  isMenuOpen: boolean;
  openMenu: () => void;
  closeMenu: () => void;
  toggleMenu: () => void;
  setHighContrast: (mode: HighContrastMode) => void;
  setFontSize: (size: FontSizeMode) => void;
  setDyslexicFont: (enabled: boolean) => void;
  setColorBlindness: (mode: ColorBlindnessMode) => void;
  setReducedMotion: (enabled: boolean) => void;
  setReadingGuide: (enabled: boolean) => void;
  setLargeCursor: (enabled: boolean) => void;
  setSoundFeedback: (enabled: boolean) => void;
  setTextToSpeech: (enabled: boolean) => void;
  setKeyboardHelper: (enabled: boolean) => void;
  resetToDefaults: () => void;
  applyToDOM: () => void;
}

const STORAGE_KEY = '_ferr_a11y_settings';

const defaultSettings: AccessibilitySettings = {
  highContrast: 'none',
  fontSize: 'normal',
  dyslexicFont: false,
  colorBlindness: 'none',
  reducedMotion: false,
  readingGuide: false,
  largeCursor: false,
  soundFeedback: true,
  textToSpeech: false,
  keyboardHelper: true,
};

function loadSavedSettings(): AccessibilitySettings {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return { ...defaultSettings, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error('Error loading a11y settings:', e);
  }
  return defaultSettings;
}

function saveSettings(settings: AccessibilitySettings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving a11y settings:', e);
  }
}

function updateDOMClasses(settings: AccessibilitySettings) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  // 1. Alto Contraste
  root.classList.remove(
    'a11y-hc-yellow-black',
    'a11y-hc-dark',
    'a11y-hc-light'
  );
  if (settings.highContrast === 'yellow-black') {
    root.classList.add('a11y-hc-yellow-black');
  } else if (settings.highContrast === 'dark') {
    root.classList.add('a11y-hc-dark');
  } else if (settings.highContrast === 'light') {
    root.classList.add('a11y-hc-light');
  }

  // 2. Tamaño de Fuente
  root.classList.remove(
    'a11y-font-large',
    'a11y-font-xlarge',
    'a11y-font-huge'
  );
  if (settings.fontSize === 'large') {
    root.classList.add('a11y-font-large');
  } else if (settings.fontSize === 'xlarge') {
    root.classList.add('a11y-font-xlarge');
  } else if (settings.fontSize === 'huge') {
    root.classList.add('a11y-font-huge');
  }

  // 3. Tipografía para Dislexia
  if (settings.dyslexicFont) {
    root.classList.add('a11y-dyslexic');
  } else {
    root.classList.remove('a11y-dyslexic');
  }

  // 4. Modo Daltónico
  root.classList.remove(
    'a11y-filter-protanopia',
    'a11y-filter-deuteranopia',
    'a11y-filter-tritanopia',
    'a11y-filter-achromatopsia'
  );
  if (settings.colorBlindness !== 'none') {
    root.classList.add(`a11y-filter-${settings.colorBlindness}`);
  }

  // 5. Movimiento Reducido
  if (settings.reducedMotion) {
    root.classList.add('a11y-reduced-motion');
  } else {
    root.classList.remove('a11y-reduced-motion');
  }

  // 6. Cursor Agrandado
  if (settings.largeCursor) {
    root.classList.add('a11y-large-cursor');
  } else {
    root.classList.remove('a11y-large-cursor');
  }

  // 7. Enfoque Ultra-Visible
  if (settings.keyboardHelper) {
    root.classList.add('a11y-focus-visible');
  } else {
    root.classList.remove('a11y-focus-visible');
  }
}

export const useAccessibilityStore = create<AccessibilityStore>((set, get) => {
  const initial = loadSavedSettings();

  // Aplicar clases de inmediato si estamos en el navegador
  if (typeof document !== 'undefined') {
    updateDOMClasses(initial);
  }

  const syncAndSave = (partial: Partial<AccessibilitySettings>) => {
    set(partial);
    const updated = {
      highContrast: get().highContrast,
      fontSize: get().fontSize,
      dyslexicFont: get().dyslexicFont,
      colorBlindness: get().colorBlindness,
      reducedMotion: get().reducedMotion,
      readingGuide: get().readingGuide,
      largeCursor: get().largeCursor,
      soundFeedback: get().soundFeedback,
      textToSpeech: get().textToSpeech,
      keyboardHelper: get().keyboardHelper,
    };
    saveSettings(updated);
    updateDOMClasses(updated);
  };

  return {
    ...initial,
    isMenuOpen: false,

    openMenu: () => set({ isMenuOpen: true }),
    closeMenu: () => set({ isMenuOpen: false }),
    toggleMenu: () => set((state) => ({ isMenuOpen: !state.isMenuOpen })),

    setHighContrast: (mode) => syncAndSave({ highContrast: mode }),
    setFontSize: (size) => syncAndSave({ fontSize: size }),
    setDyslexicFont: (enabled) => syncAndSave({ dyslexicFont: enabled }),
    setColorBlindness: (mode) => syncAndSave({ colorBlindness: mode }),
    setReducedMotion: (enabled) => syncAndSave({ reducedMotion: enabled }),
    setReadingGuide: (enabled) => syncAndSave({ readingGuide: enabled }),
    setLargeCursor: (enabled) => syncAndSave({ largeCursor: enabled }),
    setSoundFeedback: (enabled) => syncAndSave({ soundFeedback: enabled }),
    setTextToSpeech: (enabled) => syncAndSave({ textToSpeech: enabled }),
    setKeyboardHelper: (enabled) => syncAndSave({ keyboardHelper: enabled }),

    resetToDefaults: () => {
      syncAndSave(defaultSettings);
    },

    applyToDOM: () => {
      updateDOMClasses({
        highContrast: get().highContrast,
        fontSize: get().fontSize,
        dyslexicFont: get().dyslexicFont,
        colorBlindness: get().colorBlindness,
        reducedMotion: get().reducedMotion,
        readingGuide: get().readingGuide,
        largeCursor: get().largeCursor,
        soundFeedback: get().soundFeedback,
        textToSpeech: get().textToSpeech,
        keyboardHelper: get().keyboardHelper,
      });
    },
  };
});
