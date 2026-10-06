import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { BackendTelemetryService } from './backend-telemetry.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('BackendTelemetryService — Pruebas de Estrés y Alta Concurrencia 🔥', () => {
  let service: BackendTelemetryService;
  let configService: { get: jest.Mock };
  let prisma: any;
  const originalFetch = global.fetch;

  beforeEach(async () => {
    configService = {
      get: jest.fn().mockImplementation((key: string) => {
        if (key === 'TELEMETRY_WEBHOOK_URL') return 'https://discord.com/api/webhooks/123/token';
        if (key === 'TELEGRAM_BOT_TOKEN') return '123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11';
        if (key === 'TELEGRAM_CHAT_ID') return '12345678';
        return null;
      }),
    };

    prisma = {
      user: { count: jest.fn().mockResolvedValue(10) },
      product: { count: jest.fn().mockResolvedValue(1500) },
      sale: { count: jest.fn().mockResolvedValue(350) },
    };

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ ok: true, result: { message_id: 999 } }),
    }) as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BackendTelemetryService,
        { provide: ConfigService, useValue: configService },
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<BackendTelemetryService>(BackendTelemetryService);
  });

  afterEach(() => {
    service.onModuleDestroy();
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });

  it('debería soportar una ráfaga concurrente de 300 reportes de servidor sin degradación', async () => {
    const startTime = Date.now();

    const dispatches = Array.from({ length: 300 }, (_, i) =>
      service.sendServerReport(i % 2 === 0 ? 'SERVER_BOOT' : 'SERVER_HEARTBEAT')
    );

    await Promise.all(dispatches);
    const duration = Date.now() - startTime;

    expect(global.fetch).toHaveBeenCalled();
    expect(duration).toBeLessThan(3500);
  });

  it('debería ser resiliente ante fallos de red persistentes (500 rechazos consecutivos) sin arrojar errores fatales', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Connection reset by peer'));

    const startTime = Date.now();
    const dispatches = Array.from({ length: 500 }, () =>
      service.sendServerReport('SERVER_BOOT')
    );

    await expect(Promise.all(dispatches)).resolves.toBeDefined();
    const duration = Date.now() - startTime;

    expect(duration).toBeLessThan(3500);
  });

  it('debería tolerar respuestas HTTP 429 (Rate Limit) de Telegram sin bloquear la aplicación', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 429,
      statusText: 'Too Many Requests',
      json: jest.fn().mockResolvedValue({
        ok: false,
        error_code: 429,
        description: 'Too Many Requests: retry after 30',
        parameters: { retry_after: 30 },
      }),
    }) as any;

    const startTime = Date.now();
    for (let i = 0; i < 100; i++) {
      await service.sendServerReport('SERVER_HEARTBEAT');
    }
    const duration = Date.now() - startTime;

    expect(duration).toBeLessThan(1500);
  });
});
