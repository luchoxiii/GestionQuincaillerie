import { useEffect, useCallback } from 'react';

export const useBarcodeScanner = (onScan: (barcode: string) => void) => {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Only capture if we aren't typing in an input
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return;
    }

    if (e.key === 'Enter' && window.barcodeBuffer) {
      onScan(window.barcodeBuffer);
      window.barcodeBuffer = '';
      window.lastKeyTime = 0;
      return;
    }

    const now = Date.now();
    if (!window.lastKeyTime || now - window.lastKeyTime > 40) {
      window.barcodeBuffer = '';
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
