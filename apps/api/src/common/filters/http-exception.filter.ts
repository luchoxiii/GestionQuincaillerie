import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message = typeof exceptionResponse === 'object' && (exceptionResponse as any).message 
        ? (exceptionResponse as any).message 
        : exception.message;
    } else if ((exception as any)?.code === 'P2002') {
      status = HttpStatus.CONFLICT;
      message = 'El registro ya existe (valor duplicado)';
    } else if ((exception as any)?.code === 'P2025') {
      status = HttpStatus.NOT_FOUND;
      message = 'Registro no encontrado';
    } else if ((exception as any)?.code === 'P2003') {
      status = HttpStatus.BAD_REQUEST;
      message = 'Referencia inválida o registro en uso';
    } else if (exception instanceof Error) {
      this.logger.error(`Unhandled Error [${request.method} ${request.url}]: ${exception.message}`, exception.stack);
      // OWASP A05 / CWE-209: Redact internal stack traces and server internals in production
      if (process.env.NODE_ENV === 'production') {
        message = 'Ha ocurrido un error interno en el servidor.';
      } else {
        message = exception.message;
      }
    }

    response.status(status).send({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }
}
