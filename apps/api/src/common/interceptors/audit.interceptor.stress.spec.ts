import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';
import { AuditInterceptor } from './audit.interceptor';
import { PrismaService } from '../../prisma/prisma.service';

describe('AuditInterceptor Stress & Performance Tests', () => {
  let interceptor: AuditInterceptor;
  let prisma: { auditLog: { create: jest.Mock } };

  beforeEach(() => {
    prisma = {
      auditLog: {
        create: jest.fn().mockResolvedValue({ id: 'log-stress' }),
      },
    };
    interceptor = new AuditInterceptor(prisma as unknown as PrismaService);
  });

  const createMockContext = (body: any) => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          method: 'POST',
          url: '/api/stress-test',
          body,
          user: { id: 'user-stress' },
          ip: '127.0.0.1',
          headers: {},
        }),
      }),
    } as unknown as ExecutionContext;
  };

  const createCallHandler = () => {
    return {
      handle: () => of({ ok: true }),
    } as CallHandler;
  };

  it('debería procesar objetos con anidación profunda (12 niveles) sin desbordar el stack', (done) => {
    // Generar objeto anidado de 12 niveles con datos sensibles en el fondo
    let deepObject: any = { password: 'deep-secret', data: 'leaf' };
    for (let i = 0; i < 12; i++) {
      deepObject = { level: i, child: deepObject, token: `token-lvl-${i}` };
    }

    const context = createMockContext(deepObject);
    const handler = createCallHandler();
    const startTime = Date.now();

    interceptor.intercept(context, handler).subscribe({
      next: () => {
        setTimeout(() => {
          try {
            const duration = Date.now() - startTime;
            expect(prisma.auditLog.create).toHaveBeenCalled();
            expect(duration).toBeLessThan(500);
            done();
          } catch (err) {
            done(err);
          }
        }, 10);
      },
      error: done,
    });
  }, 10000);

  it('debería sanitizar un objeto masivo con 2,000 propiedades en menos de 500ms', (done) => {
    const hugeObject: Record<string, any> = {};
    for (let i = 0; i < 2000; i++) {
      if (i % 50 === 0) {
        hugeObject[`field_password_${i}`] = `pass-${i}`;
        hugeObject[`field_token_${i}`] = `token-${i}`;
      } else {
        hugeObject[`field_normal_${i}`] = `value-${i}`;
      }
    }

    const context = createMockContext(hugeObject);
    const handler = createCallHandler();
    const startTime = Date.now();

    interceptor.intercept(context, handler).subscribe({
      next: () => {
        setTimeout(() => {
          try {
            const duration = Date.now() - startTime;
            expect(prisma.auditLog.create).toHaveBeenCalled();
            expect(duration).toBeLessThan(500);
            done();
          } catch (err) {
            done(err);
          }
        }, 10);
      },
      error: done,
    });
  }, 10000);

  it('debería procesar arrays de 500 elementos complejos sin degradar el event loop', (done) => {
    const largeArray = Array.from({ length: 500 }, (_, idx) => ({
      id: idx,
      sku: `PROD-${idx}`,
      price: idx * 10,
      apiKey: idx % 10 === 0 ? 'secret-key-123' : undefined,
    }));

    const context = createMockContext({ items: largeArray });
    const handler = createCallHandler();
    const startTime = Date.now();

    interceptor.intercept(context, handler).subscribe({
      next: () => {
        setTimeout(() => {
          try {
            const duration = Date.now() - startTime;
            expect(prisma.auditLog.create).toHaveBeenCalled();
            expect(duration).toBeLessThan(500);
            done();
          } catch (err) {
            done(err);
          }
        }, 10);
      },
      error: done,
    });
  }, 10000);
});
