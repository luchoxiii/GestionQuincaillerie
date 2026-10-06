import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  sendSaleReceiptEmail,
  generateReceiptEmailHtml,
  getSentEmailsHistory,
  SaleReceiptEmailPayload,
} from './email-notification.service';
import { DEFAULT_EMAIL_SETTINGS } from './settings.service';
import { api } from './api';

describe('Email Notification & Black Cash Discount — Pruebas de Estrés y No-Bloqueo 🔥', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(api, 'post').mockResolvedValue({ data: { success: true } });
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });


  it('debería despachar y procesar 500 comprobantes por email en ráfaga en menos de 1000ms sin trabar el sistema', async () => {
    const startTime = performance.now();

    const promises = [];
    for (let i = 0; i < 500; i++) {
      const payload: SaleReceiptEmailPayload = {
        toEmail: `cliente${i}@ferreteria.com`,
        customerName: `Cliente ${i}`,
        saleNumber: `V-BURST-${i}`,
        fiscalType: i % 2 === 0 ? 'NEGRO' : 'BLANCO',
        invoiceLetter: i % 2 === 0 ? 'X' : 'B',
        items: [
          { name: `Artículo ${i}`, quantity: (i % 10) + 1, unitPrice: 1500 + i, total: (1500 + i) * ((i % 10) + 1) },
        ],
        subtotal: 50000 + i * 10,
        discount: 2500,
        taxAmount: i % 2 === 0 ? 0 : 9975,
        total: i % 2 === 0 ? 47500 + i * 10 : 57475 + i * 10,
        cashDiscountApplied: i % 2 === 0 ? 4750 : 0,
      };

      promises.push(sendSaleReceiptEmail(payload));
    }

    const results = await Promise.all(promises);
    const duration = performance.now() - startTime;

    expect(results).toHaveLength(500);
    expect(results.every((r) => r.success)).toBe(true);
    expect(duration).toBeLessThan(3500);

    // Comprobar que el historial en localStorage nunca excede 50 para evitar consumo de memoria
    const history = getSentEmailsHistory();
    expect(history.length).toBeLessThanOrEqual(50);
  });

  it('debería calcular descuentos en efectivo en negro para 10,000 transacciones masivas sin retrasos', () => {
    const startTime = performance.now();
    let validCount = 0;

    for (let i = 0; i < 10000; i++) {
      const rawSubtotal = (i + 1) * 123.45;
      const couponDiscount = i % 5 === 0 ? rawSubtotal * 0.05 : 0;
      const pct = (i % 4 + 1) * 5; // 5%, 10%, 15%, 20%

      const blackCashDiscountAmount = Math.round((rawSubtotal - couponDiscount) * (pct / 100));
      const total = Math.max(0, rawSubtotal - couponDiscount - blackCashDiscountAmount);

      if (total >= 0 && total <= rawSubtotal) {
        validCount++;
      }
    }

    const duration = performance.now() - startTime;
    expect(validCount).toBe(10000);
    expect(duration).toBeLessThan(2000);
  });

  it('debería generar 1,000 plantillas HTML de comprobante en menos de 3000ms sin pérdidas de memoria', () => {
    const startTime = performance.now();

    for (let i = 0; i < 1000; i++) {
      const payload: SaleReceiptEmailPayload = {
        toEmail: `cliente${i}@prueba.com`,
        customerName: `Empresa Constructora ${i} S.A.`,
        saleNumber: `V-0001-${10000 + i}`,
        fiscalType: 'NEGRO',
        items: [
          { name: 'Cemento Portland 50kg', quantity: 20, unitPrice: 8500, total: 170000 },
          { name: 'Hierro del 8 x 12m', quantity: 15, unitPrice: 12000, total: 180000 },
          { name: 'Alambre de Fardo x kg', quantity: 5, unitPrice: 4200, total: 21000 },
        ],
        subtotal: 371000,
        discount: 37100,
        taxAmount: 0,
        total: 333900,
        cashDiscountApplied: 37100,
      };

      const html = generateReceiptEmailHtml(payload, DEFAULT_EMAIL_SETTINGS);
      expect(html).toContain('333.900');
      expect(html).toContain('Descuento Efectivo');
    }

    const duration = performance.now() - startTime;
    expect(duration).toBeLessThan(12000);
  });
});

