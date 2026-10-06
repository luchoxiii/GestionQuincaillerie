import { describe, it, expect, beforeEach } from 'vitest';
import {
  generateReceiptEmailHtml,
  sendSaleReceiptEmail,
  sendTestEmail,
  getSentEmailsHistory,
  saveSentEmailRecord,
  SaleReceiptEmailPayload,
} from './email-notification.service';
import { DEFAULT_EMAIL_SETTINGS } from './settings.service';

describe('Email Notification Service', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const mockPayload: SaleReceiptEmailPayload = {
    toEmail: 'cliente@test.com',
    customerName: 'Juan Pérez',
    saleNumber: 'V-0001-00000542',
    fiscalType: 'BLANCO',
    invoiceLetter: 'B',
    items: [
      { name: 'Taladro Percutor 750W', quantity: 1, unitPrice: 45000, total: 45000 },
      { name: 'Mechas para Concreto x 5', quantity: 2, unitPrice: 3500, total: 7000 },
    ],
    subtotal: 52000,
    discount: 2000,
    taxAmount: 10500,
    total: 60500,
    paymentMethodName: 'Tarjeta de Débito',
    date: '2026-10-01',
  };

  describe('generateReceiptEmailHtml', () => {
    it('debería generar una plantilla HTML completa con los detalles de la venta', () => {
      const html = generateReceiptEmailHtml(mockPayload, DEFAULT_EMAIL_SETTINGS);

      expect(html).toContain('Juan Pérez');
      expect(html).toContain('V-0001-00000542');
      expect(html).toContain('Taladro Percutor 750W');
      expect(html).toContain('Mechas para Concreto x 5');
      expect(html).toContain('Tarjeta de Débito');
      expect(html).toContain(DEFAULT_EMAIL_SETTINGS.fromName);
    });

    it('debería incluir el descuento en efectivo cuando se factura en negro', () => {
      const blackPayload: SaleReceiptEmailPayload = {
        ...mockPayload,
        fiscalType: 'NEGRO',
        cashDiscountApplied: 5000,
      };

      const html = generateReceiptEmailHtml(blackPayload, DEFAULT_EMAIL_SETTINGS);
      expect(html).toContain('Ticket X / Remito');
      expect(html).toContain('Descuento Efectivo');
    });
  });

  describe('sendSaleReceiptEmail', () => {
    it('debería arrojar un error si el correo del cliente no es válido', async () => {
      await expect(
        sendSaleReceiptEmail({
          ...mockPayload,
          toEmail: 'correo-invalido-sin-arroba',
        })
      ).rejects.toThrow('El correo del cliente no es válido');
    });

    it('debería despachar el correo y registrar el historial en el almacenamiento local', async () => {
      const res = await sendSaleReceiptEmail(mockPayload);

      expect(res.success).toBe(true);
      expect(res.record.to).toBe('cliente@test.com');
      expect(res.record.saleNumber).toBe('V-0001-00000542');

      const history = getSentEmailsHistory();
      expect(history).toHaveLength(1);
      expect(history[0].to).toBe('cliente@test.com');
    });
  });

  describe('sendTestEmail', () => {
    it('debería enviar un correo de prueba correctamente', async () => {
      const res = await sendTestEmail('admin@ferreteriacentral.com.ar');

      expect(res.success).toBe(true);
      expect(res.message).toContain('admin@ferreteriacentral.com.ar');

      const history = getSentEmailsHistory();
      expect(history.length).toBeGreaterThan(0);
    });

    it('debería rechazar un correo de destino sin formato válido', async () => {
      await expect(sendTestEmail('emailinvalido')).rejects.toThrow();
    });
  });

  describe('getSentEmailsHistory & saveSentEmailRecord', () => {
    it('debería guardar y recuperar registros de envíos manteniendo un límite máximo', () => {
      for (let i = 0; i < 55; i++) {
        saveSentEmailRecord({
          id: `eml-${i}`,
          to: `cliente${i}@test.com`,
          subject: `Comprobante ${i}`,
          sentAt: new Date().toISOString(),
          status: 'SIMULATED',
          previewSnippet: `Venta ${i}`,
        });
      }

      const history = getSentEmailsHistory();
      // Debe truncar a un máximo de 50
      expect(history).toHaveLength(50);
      expect(history[0].to).toBe('cliente54@test.com');
    });
  });
});
