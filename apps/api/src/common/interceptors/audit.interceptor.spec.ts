import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { AuditInterceptor } from './audit.interceptor';
import { PrismaService } from '../../prisma/prisma.service';

describe('AuditInterceptor', () => {
  let interceptor: AuditInterceptor;
  let prisma: { auditLog: { create: jest.Mock } };

  beforeEach(() => {
    prisma = {
      auditLog: {
        create: jest.fn().mockResolvedValue({ id: 'log-1' }),
      },
    };
    interceptor = new AuditInterceptor(prisma as unknown as PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const createMockContext = (method: string, url: string, body: any, user: any) => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          method,
          url,
          body,
          user,
          ip: '192.168.1.100',
          headers: {},
        }),
      }),
    } as unknown as ExecutionContext;
  };

  const createCallHandler = (responseValue: any = { id: 'created-id-123' }) => {
    return {
      handle: () => of(responseValue),
    } as CallHandler;
  };

  it('debería ignorar peticiones GET y no registrar auditoría', (done) => {
    const context = createMockContext('GET', '/api/products', null, { id: 'u1' });
    const handler = createCallHandler({ data: [] });

    interceptor.intercept(context, handler).subscribe({
      next: (val) => {
        expect(val).toEqual({ data: [] });
        expect(prisma.auditLog.create).not.toHaveBeenCalled();
        done();
      },
      error: done,
    });
  });

  it('debería auditar peticiones POST (CREATE) con detalles sanitizados', (done) => {
    const body = {
      name: 'Taladro Percutor',
      price: 45000,
      password: 'sensitive-password-123',
      creditCard: '4500-1234-5678-9012',
      token: 'jwt-super-secret-token',
    };

    const context = createMockContext('POST', '/api/products', body, { id: 'u1' });
    const handler = createCallHandler({ id: 'prod-99' });

    interceptor.intercept(context, handler).subscribe({
      next: (val) => {
        expect(val).toEqual({ id: 'prod-99' });
        // Prisma call runs in tap
        setTimeout(() => {
          expect(prisma.auditLog.create).toHaveBeenCalledWith({
            data: {
              userId: 'u1',
              action: 'CREATE',
              entity: 'products',
              entityId: 'prod-99',
              ipAddress: '192.168.1.100',
              details: {
                name: 'Taladro Percutor',
                price: 45000,
                password: '[REDACTED]',
                creditCard: '[REDACTED]',
                token: '[REDACTED]',
              },
            },
          });
          done();
        }, 10);
      },
      error: done,
    });
  });

  it('debería auditar peticiones PUT y PATCH como UPDATE', (done) => {
    const body = { price: 50000 };
    const context = createMockContext('PUT', '/api/products/prod-99', body, { id: 'u1' });
    const handler = createCallHandler({ id: 'prod-99' });

    interceptor.intercept(context, handler).subscribe({
      next: () => {
        setTimeout(() => {
          expect(prisma.auditLog.create).toHaveBeenCalledWith(
            expect.objectContaining({
              data: expect.objectContaining({
                action: 'UPDATE',
                entity: 'products',
                entityId: 'prod-99',
              }),
            }),
          );
          done();
        }, 10);
      },
      error: done,
    });
  });

  it('debería auditar peticiones DELETE como DELETE', (done) => {
    const context = createMockContext('DELETE', '/api/customers/cust-42', null, { id: 'u2' });
    const handler = createCallHandler({ success: true });

    interceptor.intercept(context, handler).subscribe({
      next: () => {
        setTimeout(() => {
          expect(prisma.auditLog.create).toHaveBeenCalledWith(
            expect.objectContaining({
              data: expect.objectContaining({
                action: 'DELETE',
                entity: 'customers',
                entityId: 'cust-42',
              }),
            }),
          );
          done();
        }, 10);
      },
      error: done,
    });
  });

  it('debería redactar recursivamente claves sensibles en objetos anidados y arrays', (done) => {
    const nestedBody = {
      orderId: 'ord-1',
      payment: {
        method: 'CARD',
        cvv: '999',
        pin: '1234',
        apiKey: 'sk_live_123',
        billingAddress: {
          city: 'Buenos Aires',
          secret: 'internal-code',
        },
      },
      items: [
        { sku: 'P1', currentPassword: 'test' },
        { sku: 'P2', clientSecret: 'sec' },
      ],
    };

    const context = createMockContext('POST', '/api/orders', nestedBody, { id: 'u1' });
    const handler = createCallHandler({ id: 'ord-1' });

    interceptor.intercept(context, handler).subscribe({
      next: () => {
        setTimeout(() => {
          const callData = prisma.auditLog.create.mock.calls[0][0].data;
          expect(callData.details.payment.cvv).toBe('[REDACTED]');
          expect(callData.details.payment.pin).toBe('[REDACTED]');
          expect(callData.details.payment.apiKey).toBe('[REDACTED]');
          expect(callData.details.payment.billingAddress.secret).toBe('[REDACTED]');
          expect(callData.details.payment.billingAddress.city).toBe('Buenos Aires');
          expect(callData.details.items[0].currentPassword).toBe('[REDACTED]');
          expect(callData.details.items[1].clientSecret).toBe('[REDACTED]');
          expect(callData.details.items[0].sku).toBe('P1');
          done();
        }, 10);
      },
      error: done,
    });
  });

  it('no debería lanzar error si falla el guardado del audit log (falla silenciosa de auditoría)', (done) => {
    prisma.auditLog.create.mockRejectedValue(new Error('DB Connection Timeout'));
    const context = createMockContext('POST', '/api/sales', { total: 100 }, { id: 'u1' });
    const handler = createCallHandler({ id: 'sale-1' });

    // The subscription should complete successfully without bubbling the DB audit error
    interceptor.intercept(context, handler).subscribe({
      next: (val) => {
        expect(val).toEqual({ id: 'sale-1' });
        done();
      },
      error: (err) => {
        done(new Error('Audit failure should not bubble to response: ' + err.message));
      },
    });
  });
});
