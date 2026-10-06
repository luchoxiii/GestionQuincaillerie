import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../../prisma/prisma.service';

const SENSITIVE_KEYS = new Set([
  'password',
  'newpassword',
  'currentpassword',
  'token',
  'refreshtoken',
  'accesstoken',
  'secret',
  'clientsecret',
  'apikey',
  'cvv',
  'pin',
  'creditcard',
  'cardnumber',
]);

function sanitizeDetails(data: any): any {
  if (!data || typeof data !== 'object') return data;
  if (Array.isArray(data)) return data.map(sanitizeDetails);

  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (SENSITIVE_KEYS.has(key.toLowerCase())) {
      clean[key] = '[REDACTED]';
    } else if (value && typeof value === 'object') {
      clean[key] = sanitizeDetails(value);
    } else {
      clean[key] = value;
    }
  }
  return clean;
}

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const { method, url, body, user } = req;

    // Only audit mutations
    if (method !== 'POST' && method !== 'PUT' && method !== 'DELETE' && method !== 'PATCH') {
      return next.handle();
    }

    return next.handle().pipe(
      tap(async (response) => {
        try {
          if (user?.id) {
            let action = 'CREATE';
            if (method === 'PUT' || method === 'PATCH') action = 'UPDATE';
            if (method === 'DELETE') action = 'DELETE';

            const urlParts = (url || '').split('/').filter(Boolean);
            const entity = urlParts[1] || 'unknown';
            const entityId = response?.id || urlParts[2] || 'unknown';

            const sanitizedDetails = body ? sanitizeDetails(body) : undefined;

            await this.prisma.auditLog.create({
              data: {
                userId: user.id,
                action,
                entity,
                entityId: String(entityId),
                details: sanitizedDetails,
                ipAddress: req.ip || req.headers?.['x-forwarded-for'] || 'unknown',
              },
            });
          }
        } catch (e) {
          console.error('Failed to write audit log:', e);
        }
      }),
    );
  }
}
