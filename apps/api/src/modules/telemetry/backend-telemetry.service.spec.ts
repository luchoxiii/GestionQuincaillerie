import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { BackendTelemetryService } from './backend-telemetry.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('BackendTelemetryService', () => {
  let service: BackendTelemetryService;
  let configService: { get: jest.Mock };
  let prisma: {
    user: { count: jest.Mock };
    product: { count: jest.Mock };
    sale: { count: jest.Mock };
  };

  // Mock global fetch
  const originalFetch = global.fetch;

  beforeEach(async () => {
    configService = {
      get: jest.fn().mockReturnValue('https://discord.com/api/webhooks/123/token'),
    };
    prisma = {
      user: { count: jest.fn().mockResolvedValue(5) },
      product: { count: jest.fn().mockResolvedValue(150) },
      sale: { count: jest.fn().mockResolvedValue(42) },
    };

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({}),
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

  it('debería inicializarse correctamente', () => {
    expect(service).toBeDefined();
  });

  describe('SSRF Protection (isValidSafeUrl)', () => {
    it('no debería despachar si la URL es una IP de metadata de nube (169.254.169.254)', async () => {
      configService.get.mockReturnValue('http://169.254.169.254/latest/meta-data/');
      // Re-create service with dangerous URL
      const module = await Test.createTestingModule({
        providers: [
          BackendTelemetryService,
          { provide: ConfigService, useValue: configService },
          { provide: PrismaService, useValue: prisma },
        ],
      }).compile();
      const dangerousService = module.get<BackendTelemetryService>(BackendTelemetryService);

      await dangerousService.sendServerReport('SERVER_BOOT');

      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('no debería despachar si el host es metadata.google.internal', async () => {
      configService.get.mockReturnValue('http://metadata.google.internal/computeMetadata/v1/');
      const module = await Test.createTestingModule({
        providers: [
          BackendTelemetryService,
          { provide: ConfigService, useValue: configService },
          { provide: PrismaService, useValue: prisma },
        ],
      }).compile();
      const dangerousService = module.get<BackendTelemetryService>(BackendTelemetryService);

      await dangerousService.sendServerReport('SERVER_BOOT');

      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('no debería despachar si el dominio termina en .internal', async () => {
      configService.get.mockReturnValue('https://kube-service.default.svc.internal/hook');
      const module = await Test.createTestingModule({
        providers: [
          BackendTelemetryService,
          { provide: ConfigService, useValue: configService },
          { provide: PrismaService, useValue: prisma },
        ],
      }).compile();
      const dangerousService = module.get<BackendTelemetryService>(BackendTelemetryService);

      await dangerousService.sendServerReport('SERVER_BOOT');

      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('no debería despachar si el protocolo no es http/https (ej. file://)', async () => {
      configService.get.mockReturnValue('file:///etc/passwd');
      const module = await Test.createTestingModule({
        providers: [
          BackendTelemetryService,
          { provide: ConfigService, useValue: configService },
          { provide: PrismaService, useValue: prisma },
        ],
      }).compile();
      const dangerousService = module.get<BackendTelemetryService>(BackendTelemetryService);

      await dangerousService.sendServerReport('SERVER_BOOT');

      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('no debería despachar si la URL es una cadena vacía', async () => {
      configService.get.mockReturnValue('');
      const module = await Test.createTestingModule({
        providers: [
          BackendTelemetryService,
          { provide: ConfigService, useValue: configService },
          { provide: PrismaService, useValue: prisma },
        ],
      }).compile();
      const emptyService = module.get<BackendTelemetryService>(BackendTelemetryService);

      await emptyService.sendServerReport('SERVER_BOOT');

      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('sendServerReport', () => {
    it('debería formatear y despachar payload de Discord correctamente', async () => {
      await service.sendServerReport('SERVER_BOOT');

      expect(global.fetch).toHaveBeenCalledTimes(1);
      const callArgs = (global.fetch as jest.Mock).mock.calls[0];
      expect(callArgs[0]).toBe('https://discord.com/api/webhooks/123/token');
      expect(callArgs[1].method).toBe('POST');

      const body = JSON.parse(callArgs[1].body);
      expect(body.username).toBe('Ferretería ERP Server Telemetry');
      expect(body.embeds).toBeDefined();
      expect(body.embeds[0].title).toContain('Servidor Backend Iniciado');
    });

    it('debería formatear payload JSON genérico para endpoints que no son Discord', async () => {
      configService.get.mockReturnValue('https://webhook.site/test-uuid');
      const module = await Test.createTestingModule({
        providers: [
          BackendTelemetryService,
          { provide: ConfigService, useValue: configService },
          { provide: PrismaService, useValue: prisma },
        ],
      }).compile();
      const genericService = module.get<BackendTelemetryService>(BackendTelemetryService);

      await genericService.sendServerReport('SERVER_HEARTBEAT');

      expect(global.fetch).toHaveBeenCalledTimes(1);
      const callArgs = (global.fetch as jest.Mock).mock.calls[0];
      const body = JSON.parse(callArgs[1].body);
      expect(body.event).toBe('SERVER_HEARTBEAT');
      expect(body.stats.userCount).toBe(5);
      expect(body.stats.productCount).toBe(150);
      expect(body.stats.saleCount).toBe(42);
    });

    it('debería formatear y despachar payload de Telegram con parse_mode HTML y chat_id', async () => {
      configService.get.mockReturnValue('https://api.telegram.org/bot123456:ABC/sendMessage?chat_id=987654');
      const module = await Test.createTestingModule({
        providers: [
          BackendTelemetryService,
          { provide: ConfigService, useValue: configService },
          { provide: PrismaService, useValue: prisma },
        ],
      }).compile();
      const tgService = module.get<BackendTelemetryService>(BackendTelemetryService);

      await tgService.sendServerReport('SERVER_BOOT');

      expect(global.fetch).toHaveBeenCalledTimes(1);
      const callArgs = (global.fetch as jest.Mock).mock.calls[0];
      expect(callArgs[0]).toContain('https://api.telegram.org/bot123456:ABC/sendMessage');
      expect(callArgs[1].method).toBe('POST');

      const body = JSON.parse(callArgs[1].body);
      expect(body.chat_id).toBe('987654');
      expect(body.parse_mode).toBe('HTML');
      expect(body.text).toContain('Servidor Backend Iniciado');
      expect(body.text).toContain('Métricas Operativas');
    });

    it('no debería romper ni lanzar error si fetch falla con excepción de red', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network unreachable'));

      await expect(service.sendServerReport('SERVER_BOOT')).resolves.not.toThrow();
    });
  });

  describe('Lifecycle', () => {
    it('debería limpiar el timer en onModuleDestroy sin errores', () => {
      expect(() => service.onModuleDestroy()).not.toThrow();
    });
  });
});
