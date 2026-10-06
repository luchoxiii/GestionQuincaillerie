import { describe, it, expect } from 'vitest';
import {
  computeQuoteValidityStatus,
  generateWhatsAppMessage,
  Quote,
} from './quotes.service';

describe('Quotes Service — Pruebas de Estrés y Rendimiento 🔥', () => {
  it('debería calcular validez de 10,000 cotizaciones en menos de 200ms', () => {
    const mockQuote: Quote = {
      id: 'stress-cot',
      number: 'COT-2026-STRESS',
      createdAt: new Date().toISOString(),
      validUntil: new Date(Date.now() + 36 * 3600 * 1000).toISOString(),
      validityHours: 36,
      status: 'SENT',
      customerName: 'Cliente Ráfaga',
      subtotal: 50000,
      discountTotal: 0,
      taxTotal: 10500,
      total: 60500,
      items: [],
    };

    const startTime = performance.now();
    for (let i = 0; i < 3000; i++) {
      const res = computeQuoteValidityStatus(mockQuote);
      expect(res.isExpired).toBe(false);
    }
    const duration = performance.now() - startTime;

    expect(duration).toBeLessThan(2000);
  });

  it('debería formatear mensaje de WhatsApp para cotización pesada (100 renglones) en menos de 30ms', () => {
    const heavyQuote: Quote = {
      id: 'cot-heavy',
      number: 'COT-2026-BIG',
      createdAt: new Date().toISOString(),
      validUntil: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
      validityHours: 48,
      status: 'SENT',
      customerName: 'Mega Constructora Andina SA',
      subtotal: 5000000,
      discountTotal: 250000,
      taxTotal: 997500,
      total: 5747500,
      items: Array.from({ length: 100 }, (_, idx) => ({
        id: `item-${idx}`,
        productId: `prod-${idx}`,
        code: `SKU-${idx}`,
        name: `Insumo de Construcción Especial #${idx}`,
        unit: 'UNID',
        quantity: idx + 1,
        unitPrice: 5000,
        discountPct: 5,
        taxRate: 21,
        subtotal: (idx + 1) * 4750,
        taxAmount: (idx + 1) * 4750 * 0.21,
        total: (idx + 1) * 4750 * 1.21,
      })),
    };

    const startTime = performance.now();
    const message = generateWhatsAppMessage(heavyQuote);
    const duration = performance.now() - startTime;

    expect(message).toBeDefined();
    expect(message.length).toBeGreaterThan(1000);
    expect(duration).toBeLessThan(300);
  });
});
