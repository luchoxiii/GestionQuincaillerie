import React, { useEffect, useState } from 'react';
import { useAccessibilityStore } from '@/stores/accessibility.store';

/**
 * Regla de lectura visual para personas con TDAH, dislexia o fatiga visual
 */
export const ReadingGuide: React.FC = () => {
  const readingGuideEnabled = useAccessibilityStore((state) => state.readingGuide);
  const [topPos, setTopPos] = useState<number>(-100);

  useEffect(() => {
    if (!readingGuideEnabled) return;

    const handleMouseMove = (e: MouseEvent) => {
      // Centrar la barra en la posición del cursor
      setTopPos(e.clientY - 19);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [readingGuideEnabled]);

  if (!readingGuideEnabled || topPos < 0) return null;

  return (
    <div
      className="a11y-reading-guide-line"
      style={{ top: `${topPos}px` }}
      aria-hidden="true"
    />
  );
};
