import React, { useEffect } from 'react';
import { useAccessibilityStore } from '@/stores/accessibility.store';
import { a11yAudio } from '@/services/a11y-audio.service';
import { ColorBlindnessFilters } from './ColorBlindnessFilters';
import { ReadingGuide } from './ReadingGuide';
import { AccessibilityModal } from './AccessibilityModal';

interface AccessibilityProviderProps {
  children: React.ReactNode;
}

export function AccessibilityProvider({ children }: AccessibilityProviderProps) {
  const { applyToDOM, toggleMenu, isMenuOpen, textToSpeech } = useAccessibilityStore();

  // Apply a11y classes to DOM on initial mount
  useEffect(() => {
    applyToDOM();
  }, [applyToDOM]);

  // Global accessibility keyboard shortcuts (Alt+A for menu, Alt+S for screen reader summary)
  useEffect(() => {
    const handleGlobalShortcuts = (e: KeyboardEvent) => {
      // Check for Alt + A (Toggle Accessibility Settings)
      if (e.altKey && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        toggleMenu();
        return;
      }

      // Check for Alt + S (Read current page title / summary)
      if (e.altKey && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        const mainHeading = document.querySelector('h1, h2')?.textContent;
        const pageTitle = document.title || 'Ferretería ERP';
        const summary = mainHeading
          ? `Pantalla actual: ${mainHeading}.`
          : `Sistema de Gestión Ferretería. Página: ${pageTitle}.`;
        
        a11yAudio.speak(summary, true);
        return;
      }
    };

    window.addEventListener('keydown', handleGlobalShortcuts);
    return () => window.removeEventListener('keydown', handleGlobalShortcuts);
  }, [toggleMenu, textToSpeech]);

  return (
    <>
      {/* Skip to main content link for screen readers & keyboard navigation (WCAG 2.4.1) */}
      <a href="#main-content" className="a11y-skip-link">
        Saltar al contenido principal (Presione Enter)
      </a>

      {/* Main App Content */}
      {children}

      {/* Accessibility Overlays & Utilities */}
      <ColorBlindnessFilters />
      <ReadingGuide />
      <AccessibilityModal />
    </>
  );
}
