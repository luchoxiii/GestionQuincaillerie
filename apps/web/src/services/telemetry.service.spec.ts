import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { telemetry } from './telemetry.service';

describe('Frontend Telemetry Service', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    localStorage.clear();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.clearAllMocks();
  });

  it('debería ser un singleton exportado listo para usar', () => {
    expect(telemetry).toBeDefined();
    expect(typeof telemetry.trackSale).toBe('function');
    expect(typeof telemetry.trackQuote).toBe('function');
    expect(typeof telemetry.trackUserLogin).toBe('function');
  });

  it('debería registrar ventas e incrementar contadores sin arrojar errores', () => {
    expect(() => {
      telemetry.trackSale({
        total: 25000,
        fiscalType: 'FACTURA_B',
        itemCount: 3,
        saleId: 'v-100',
      });
    }).not.toThrow();

    // Las métricas se guardan en cache local
    const raw = localStorage.getItem('_ferr_telemetry_cache');
    expect(raw).toBeDefined();
    const cached = JSON.parse(raw!);
    expect(cached.sessionSalesCount).toBeGreaterThanOrEqual(1);
    expect(cached.sessionSalesTotal).toBeGreaterThanOrEqual(25000);
  });

  it('debería registrar confección de cotizaciones', () => {
    expect(() => {
      telemetry.trackQuote({
        quoteNumber: 'COT-2026-001',
        total: 150000,
        validityHours: 48,
      });
    }).not.toThrow();

    const raw = localStorage.getItem('_ferr_telemetry_cache');
    const cached = JSON.parse(raw!);
    expect(cached.sessionQuotesCount).toBeGreaterThanOrEqual(1);
  });

  it('debería registrar login de usuario y navegación sin bloquear', () => {
    expect(() => {
      telemetry.trackUserLogin({
        id: 'u1',
        username: 'juan.perez',
        name: 'Juan Pérez',
        role: 'VENDEDOR',
      });
      telemetry.trackNavigation('/pos');
      telemetry.trackNavigation('/presupuestos');
    }).not.toThrow();
  });

  it('debería tolerar caídas de red completas en fetch de forma 100% silenciosa', () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network offline / Webhook down'));
    telemetry.setWebhookUrl('https://discord.com/api/webhooks/mock/test');

    expect(() => {
      telemetry.trackSale({ total: 1000, fiscalType: 'TICKET', itemCount: 1 });
      telemetry.sendHeartbeat();
    }).not.toThrow();
  });
});
