import { describe, it, expect } from 'vitest';
import {
  computeQuoteValidityStatus,
  generateWhatsAppMessage,
  Quote,
} from './quotes.service';

describe('Quotes Service Pure Functions', () => {
  const baseQuote: Quote = {
    id: 'cot-test-1',
    number: 'COT-2026-099',
    createdAt: new Date().toISOString(),
    validUntil: new Date(Date.now() + 48 * 3600 * 1000).toISOString(), // 48h en el futuro
    validityHours: 48,
    status: 'SENT',
    customerName: 'Constructora del Valle SA',
    customerPhone: '+54 9 11 1122-3344',
    subtotal: 100000,
    discountTotal: 5000,
    taxTotal: 19950,
    total: 114950,
    items: [
      {
        id: 'item-1',
        productId: 'prod-1',
        code: 'CEM-50',
        name: 'Cemento Portland 50kg',
        unit: 'BOLSA',
        quantity: 10,
        unitPrice: 8000,
        discountPct: 5,
        taxRate: 21,
        subtotal: 76000,
        taxAmount: 15960,
        total: 91960,
      },
      {
        id: 'item-2',
        productId: 'prod-2',
        code: 'HIERRO-8',
        name: 'Hierro 8mm Barra 12m',
        unit: 'UNID',
        quantity: 5,
        unitPrice: 4000,
        discountPct: 0,
        taxRate: 21,
        subtotal: 20000,
        taxAmount: 4200,
        total: 24200,
      },
    ],
    notes: 'Entrega en acoplado con descarga en planta baja.',
  };

  describe('computeQuoteValidityStatus', () => {
    it('debería marcar como Vencido si validUntil está en el pasado', () => {
      const expiredQuote = {
        ...baseQuote,
        validUntil: new Date(Date.now() - 3600 * 1000).toISOString(), // 1 hora atrás
      };

      const result = computeQuoteValidityStatus(expiredQuote);
      expect(result.isExpired).toBe(true);
      expect(result.isExpiringSoon).toBe(false);
      expect(result.hoursRemaining).toBe(0);
      expect(result.formattedRemaining).toBe('Vencido');
    });

    it('debería indicar "Expiring Soon" si quedan menos de 12 horas', () => {
      const soonQuote = {
        ...baseQuote,
        validUntil: new Date(Date.now() + 6 * 3600 * 1000).toISOString(), // 6 horas restantes
      };

      const result = computeQuoteValidityStatus(soonQuote);
      expect(result.isExpired).toBe(false);
      expect(result.isExpiringSoon).toBe(true);
      expect(result.hoursRemaining).toBeGreaterThanOrEqual(5);
      expect(result.hoursRemaining).toBeLessThanOrEqual(7);
      expect(result.formattedRemaining).toContain('h restantes');
    });

    it('debería formatear en días y horas cuando restan más de 24 horas', () => {
      const validQuote = {
        ...baseQuote,
        validUntil: new Date(Date.now() + (2 * 24 + 5) * 3600 * 1000).toISOString(), // ~2 días 5 horas
      };

      const result = computeQuoteValidityStatus(validQuote);
      expect(result.isExpired).toBe(false);
      expect(result.isExpiringSoon).toBe(false);
      expect(result.formattedRemaining).toMatch(/\d+d \d+h/);
    });
  });

  describe('generateWhatsAppMessage', () => {
    it('debería formatear correctamente el mensaje con emojis, items y totales de ferretería', () => {
      const msg = generateWhatsAppMessage(baseQuote);

      expect(msg).toContain('*PRESUPUESTO COT-2026-099 - FERRETERÍA & CORRALÓN* 🏗️');
      expect(msg).toContain('Cliente: *Constructora del Valle SA*');
      expect(msg).toContain('1. *Cemento Portland 50kg*');
      expect(msg).toContain('Cant: 10 BOLSA');
      expect(msg).toContain('2. *Hierro 8mm Barra 12m*');
      expect(msg).toContain('Cant: 5 UNID');
      expect(msg).toContain('Descuento Bonificado:');
      expect(msg).toContain('*TOTAL FINAL (IVA inc.):');
      expect(msg).toContain('Entrega en acoplado con descarga en planta baja.');
    });

    it('debería excluir la línea de descuento si el descuento total es 0', () => {
      const noDiscountQuote = {
        ...baseQuote,
        discountTotal: 0,
      };

      const msg = generateWhatsAppMessage(noDiscountQuote);
      expect(msg).not.toContain('Descuento Bonificado:');
    });

    it('debería formatear correctamente una cotización en DÓLARES con tasa de cambio e importes duales', () => {
      const usdQuote: Quote = {
        ...baseQuote,
        id: 'cot-usd-1',
        number: 'COT-2026-USD1',
        currency: 'USD',
        currencySymbol: 'US$',
        exchangeRate: 1400,
        totalSecondary: 450520, // 321.80 * 1400
        subtotal: 280,
        discountTotal: 14,
        taxTotal: 55.86,
        total: 321.86,
        items: [
          {
            id: 'item-usd-1',
            productId: 'prod-1',
            code: 'BOSH-TAL',
            name: 'Taladro Percutor 750W',
            unit: 'UNID',
            quantity: 2,
            unitPrice: 140,
            discountPct: 5,
            taxRate: 21,
            subtotal: 266,
            taxAmount: 55.86,
            total: 321.86,
          },
        ],
      };

      const msg = generateWhatsAppMessage(usdQuote);

      expect(msg).toContain('*Moneda de Cotización:* Dólares Estadounidenses (USD)');
      expect(msg).toContain('*Tipo de Cambio Pactado:* $1.400 por USD');
      expect(msg).toContain('US$');
      expect(msg).toContain('Cant: 2 UNID x US$140 = *US$321,86*');
      expect(msg).toContain('*TOTAL FINAL (IVA inc.): US$ 321,86*');
      expect(msg).toContain('*Equivalente en Pesos:* $450.520,00 (TC: $1.400)');
    });
  });
});

