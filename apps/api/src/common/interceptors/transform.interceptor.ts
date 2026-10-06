import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  data: T;
  meta?: any;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    return next.handle().pipe(map(data => {
      // Check if data is already wrapped (like pagination results)
      if (data && typeof data === 'object' && 'data' in data && 'meta' in data) {
        return data as unknown as Response<T>;
      }
      return { data };
    }));
  }
}
