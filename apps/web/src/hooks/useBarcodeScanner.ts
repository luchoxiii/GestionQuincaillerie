import { useEffect, useCallback } from 'react';

export const useBarcodeScanner = (onScan: (barcode: string) => void) => {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Only capture if we aren't typing in an input, textarea, select, or contentEditable
    const target = e.target as HTMLElement | null;
    if (
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      target instanceof HTMLSelectElement ||
      target?.isContentEditable
    ) {
      return;
    }

    const now = Date.now();
    if (!window.lastKeyTime || now - window.lastKeyTime > 50) {
      window.barcodeBuffer = '';
    }

    if (e.key === 'Enter' && window.barcodeBuffer && window.barcodeBuffer.length >= 3) {
      onScan(window.barcodeBuffer);
      window.barcodeBuffer = '';
      window.lastKeyTime = 0;
      return;
    }

    if (e.key.length === 1) {
      window.barcodeBuffer = (window.barcodeBuffer || '') + e.key;
    }

    window.lastKeyTime = now;
  }, [onScan]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
};

declare global {
  interface Window {
    barcodeBuffer: string;
    lastKeyTime: number;
  }
}
