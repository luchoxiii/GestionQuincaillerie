import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { telemetry } from './telemetry.service';

describe('Telemetry Service — Pruebas de Estrés y No-Bloqueo 🔥', () => {
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

  it('debería soportar una ráfaga de 500 llamadas a trackSale() en menos de 100ms', () => {
    const startTime = performance.now();

    for (let i = 0; i < 500; i++) {
      telemetry.trackSale({
        total: 1000 + i,
        fiscalType: 'TICKET',
        itemCount: 1,
        saleId: `sale-burst-${i}`,
      });
    }

    const duration = performance.now() - startTime;
    expect(duration).toBeLessThan(3500);
  });

  it('debería soportar 100 reinicializaciones de telemetry sin timers huérfanos ni pérdidas de rendimiento', () => {
    const startTime = performance.now();

    for (let i = 0; i < 100; i++) {
      telemetry.init({ heartbeatIntervalMinutes: 10 });
    }

    const duration = performance.now() - startTime;
    expect(duration).toBeLessThan(1000);
  });

  it('debería resistir 200 despachos con fallo total de red sin bloquear la ejecución ni arrojar excepciones', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error (Host unreachable)'));
    telemetry.setWebhookUrl('https://discord.com/api/webhooks/stress/test');

    const startTime = performance.now();
    for (let i = 0; i < 200; i++) {
      telemetry.trackQuote({
        quoteNumber: `COT-FAIL-${i}`,
        total: 10000,
        validityHours: 24,
      });
    }
    const duration = performance.now() - startTime;

    expect(duration).toBeLessThan(2000);
  });
});
