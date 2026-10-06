import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import fastifyCookie from '@fastify/cookie';
import fastifyHelmet from '@fastify/helmet';
import fastifyRateLimit from '@fastify/rate-limit';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      bodyLimit: 10 * 1024 * 1024, // 10MB payload limit (DoS mitigation)
    })
  );

  const configService = app.get(ConfigService);
  const isProduction = configService.get<string>('NODE_ENV') === 'production';
  const jwtSecret = configService.get<string>('JWT_SECRET', 'super-secret');

  // OWASP A02: Cryptographic Failures warning
  if (isProduction && (jwtSecret === 'super-secret' || jwtSecret.includes('change-in-production'))) {
    console.warn('⚠️ [OWASP A02 ALERTA]: JWT_SECRET utiliza una clave por defecto insegura. Configure una clave criptográfica robusta en producción.');
  }
  
  // OWASP A05: Security Misconfiguration - Security Headers via Helmet
  await app.register(fastifyHelmet, {
    contentSecurityPolicy: isProduction ? {
      directives: {
        defaultSrc: [`'self'`],
        styleSrc: [`'self'`, `'unsafe-inline'`],
        imgSrc: [`'self'`, 'data:', 'validator.swagger.io'],
        scriptSrc: [`'self'`],
      },
    } : false,
    crossOriginEmbedderPolicy: false,
  });

  // OWASP A04/A07: Insecure Design & Brute Force Protection - Rate Limiting
  await app.register(fastifyRateLimit, {
    max: 300, // Max 300 requests per minute per IP
    timeWindow: '1 minute',
    errorResponseBuilder: () => ({
      statusCode: 429,
      error: 'Too Many Requests',
      message: 'Demasiadas solicitudes. Por favor espere antes de reintentar (OWASP Rate Limiting).',
    }),
  });

  // Register fastify cookie
  await app.register(fastifyCookie, {
    secret: jwtSecret,
  });

  // OWASP A05: Security Misconfiguration - Strict CORS
  const frontendUrl = configService.get<string>('FRONTEND_URL', 'http://localhost:5173');
  const allowedOrigins = [
    frontendUrl,
    'http://localhost:5173',
    'http://127.0.0.1:5173',
  ];

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Bloqueado por política CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
  });

  // OWASP A03 / API3: Injection & Mass Assignment Prevention - Strict Validation Pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true, // Reject unexpected fields (Mass Assignment prevention)
    transformOptions: { enableImplicitConversion: true },
  }));

  // Set global prefix
  app.setGlobalPrefix('api');

  // OWASP API9: Restrict Swagger documentation in production
  const port = configService.get<number>('API_PORT', 4000);
  if (!isProduction) {
    const config = new DocumentBuilder()
      .setTitle('Ferretería ERP API')
      .setDescription('Documentación de la API del Sistema de Gestión de Ferretería')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
    console.log(`Swagger documentation: http://localhost:${port}/api/docs`);
  }

  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on: http://localhost:${port}/api`);
}
bootstrap();
