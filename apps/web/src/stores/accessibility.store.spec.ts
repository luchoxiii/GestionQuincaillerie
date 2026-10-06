import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useAccessibilityStore } from './accessibility.store';

describe('Accessibility Store (useAccessibilityStore)', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
    useAccessibilityStore.getState().resetToDefaults();
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
  });

  it('debería inicializar con las configuraciones por defecto de WCAG', () => {
    const state = useAccessibilityStore.getState();
    expect(state.highContrast).toBe('none');
    expect(state.fontSize).toBe('normal');
    expect(state.dyslexicFont).toBe(false);
    expect(state.colorBlindness).toBe('none');
    expect(state.reducedMotion).toBe(false);
    expect(state.readingGuide).toBe(false);
    expect(state.largeCursor).toBe(false);
    expect(state.soundFeedback).toBe(true);
    expect(state.textToSpeech).toBe(false);
    expect(state.keyboardHelper).toBe(true);
    expect(state.isMenuOpen).toBe(false);
  });

  it('debería controlar la apertura, cierre y alternancia del modal de accesibilidad', () => {
    const store = useAccessibilityStore.getState();
    expect(store.isMenuOpen).toBe(false);

    store.openMenu();
    expect(useAccessibilityStore.getState().isMenuOpen).toBe(true);

    store.closeMenu();
    expect(useAccessibilityStore.getState().isMenuOpen).toBe(false);

    store.toggleMenu();
    expect(useAccessibilityStore.getState().isMenuOpen).toBe(true);

    store.toggleMenu();
    expect(useAccessibilityStore.getState().isMenuOpen).toBe(false);
  });

  describe('Gestión de Alto Contraste y clases DOM', () => {
    it('debería aplicar modo amarillo sobre negro (WCAG AAA) y actualizar el DOM', () => {
      useAccessibilityStore.getState().setHighContrast('yellow-black');

      expect(useAccessibilityStore.getState().highContrast).toBe('yellow-black');
      expect(document.documentElement.classList.contains('a11y-hc-yellow-black')).toBe(true);
      expect(document.documentElement.classList.contains('a11y-hc-dark')).toBe(false);
    });

    it('debería aplicar modo oscuro de alto contraste y actualizar el DOM', () => {
      useAccessibilityStore.getState().setHighContrast('dark');

      expect(useAccessibilityStore.getState().highContrast).toBe('dark');
      expect(document.documentElement.classList.contains('a11y-hc-dark')).toBe(true);
      expect(document.documentElement.classList.contains('a11y-hc-yellow-black')).toBe(false);
    });

    it('debería remover todas las clases de alto contraste al volver a "none"', () => {
      useAccessibilityStore.getState().setHighContrast('light');
      expect(document.documentElement.classList.contains('a11y-hc-light')).toBe(true);

      useAccessibilityStore.getState().setHighContrast('none');
      expect(document.documentElement.classList.contains('a11y-hc-light')).toBe(false);
      expect(document.documentElement.classList.contains('a11y-hc-dark')).toBe(false);
      expect(document.documentElement.classList.contains('a11y-hc-yellow-black')).toBe(false);
    });
  });

  describe('Escalado de Fuente y Tipografía Dislexia', () => {
    it('debería cambiar el tamaño de fuente y aplicar clase CSS correspondiente', () => {
      useAccessibilityStore.getState().setFontSize('xlarge');
      expect(useAccessibilityStore.getState().fontSize).toBe('xlarge');
      expect(document.documentElement.classList.contains('a11y-font-xlarge')).toBe(true);

      useAccessibilityStore.getState().setFontSize('huge');
      expect(useAccessibilityStore.getState().fontSize).toBe('huge');
      expect(document.documentElement.classList.contains('a11y-font-huge')).toBe(true);
      expect(document.documentElement.classList.contains('a11y-font-xlarge')).toBe(false);
    });

    it('debería alternar la tipografía para dislexia', () => {
      useAccessibilityStore.getState().setDyslexicFont(true);
      expect(useAccessibilityStore.getState().dyslexicFont).toBe(true);
      expect(document.documentElement.classList.contains('a11y-dyslexic')).toBe(true);

      useAccessibilityStore.getState().setDyslexicFont(false);
      expect(useAccessibilityStore.getState().dyslexicFont).toBe(false);
      expect(document.documentElement.classList.contains('a11y-dyslexic')).toBe(false);
    });
  });

  describe('Filtros Daltonismo, Movimiento Reducido y Cursor Gigante', () => {
    it('debería activar y desactivar daltonismo', () => {
      useAccessibilityStore.getState().setColorBlindness('protanopia');
      expect(useAccessibilityStore.getState().colorBlindness).toBe('protanopia');

      useAccessibilityStore.getState().setColorBlindness('none');
      expect(useAccessibilityStore.getState().colorBlindness).toBe('none');
    });

    it('debería aplicar reducción de movimiento en el DOM', () => {
      useAccessibilityStore.getState().setReducedMotion(true);
      expect(useAccessibilityStore.getState().reducedMotion).toBe(true);
      expect(document.documentElement.classList.contains('a11y-reduced-motion')).toBe(true);

      useAccessibilityStore.getState().setReducedMotion(false);
      expect(document.documentElement.classList.contains('a11y-reduced-motion')).toBe(false);
    });

    it('debería aplicar cursor de alto contraste en el DOM', () => {
      useAccessibilityStore.getState().setLargeCursor(true);
      expect(useAccessibilityStore.getState().largeCursor).toBe(true);
      expect(document.documentElement.classList.contains('a11y-large-cursor')).toBe(true);

      useAccessibilityStore.getState().setLargeCursor(false);
      expect(document.documentElement.classList.contains('a11y-large-cursor')).toBe(false);
    });
  });

  describe('Audio, Síntesis de Voz y Guía de Lectura', () => {
    it('debería actualizar toggles de audio, síntesis de voz y guía de lectura', () => {
      useAccessibilityStore.getState().setReadingGuide(true);
      expect(useAccessibilityStore.getState().readingGuide).toBe(true);

      useAccessibilityStore.getState().setSoundFeedback(false);
      expect(useAccessibilityStore.getState().soundFeedback).toBe(false);

      useAccessibilityStore.getState().setTextToSpeech(true);
      expect(useAccessibilityStore.getState().textToSpeech).toBe(true);

      useAccessibilityStore.getState().setKeyboardHelper(false);
      expect(useAccessibilityStore.getState().keyboardHelper).toBe(false);
    });
  });

  describe('Persistencia y Reinicio a Valores de Fábrica', () => {
    it('debería persistir las preferencias en localStorage', () => {
      useAccessibilityStore.getState().setHighContrast('yellow-black');
      useAccessibilityStore.getState().setFontSize('large');

      const raw = localStorage.getItem('_ferr_a11y_settings');
      expect(raw).not.toBeNull();
      const parsed = JSON.parse(raw!);
      expect(parsed.highContrast).toBe('yellow-black');
      expect(parsed.fontSize).toBe('large');
    });

    it('debería restablecer todos los valores por defecto y limpiar clases al llamar resetToDefaults', () => {
      useAccessibilityStore.getState().setHighContrast('yellow-black');
      useAccessibilityStore.getState().setFontSize('huge');
      useAccessibilityStore.getState().setDyslexicFont(true);
      useAccessibilityStore.getState().setLargeCursor(true);

      expect(document.documentElement.className.length).toBeGreaterThan(0);

      useAccessibilityStore.getState().resetToDefaults();

      const state = useAccessibilityStore.getState();
      expect(state.highContrast).toBe('none');
      expect(state.fontSize).toBe('normal');
      expect(state.dyslexicFont).toBe(false);
      expect(state.largeCursor).toBe(false);

      expect(document.documentElement.classList.contains('a11y-hc-yellow-black')).toBe(false);
      expect(document.documentElement.classList.contains('a11y-font-huge')).toBe(false);
      expect(document.documentElement.classList.contains('a11y-dyslexic')).toBe(false);
      expect(document.documentElement.classList.contains('a11y-large-cursor')).toBe(false);
    });
  });
});
