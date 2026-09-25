import 'reflect-metadata';
import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import express from 'express';
import { join } from 'path';

import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { PrismaService } from './prisma/prisma.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  const config = app.get(ConfigService);

  // ---- Security hardening ----
  app.use(helmet());
  app.use(compression());
  app.use(cookieParser());
  app.use('/uploads', express.static(join(process.cwd(), 'uploads')));
  app.enableCors({
    origin: config.get<string>('CLIENT_URL') ?? 'http://localhost:3000',
    credentials: true,
  });

  // ---- Global validation: strips unknown properties, rejects bad payloads ----
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // ---- Never leak stack traces; always respond in a consistent shape ----
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  app.setGlobalPrefix('', { exclude: [] });

  // ---- Graceful Prisma shutdown ----
  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);

  // ---- Swagger / OpenAPI docs at /api/docs ----
  const swaggerConfig = new DocumentBuilder()
    .setTitle('SAZU FCS API')
    .setDescription(
      'REST API for the SAZU FCS (Fellowship of Christian Students) platform: ' +
        'auth, content management, giving/payments, and receipts.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = config.get<string>('PORT') ?? 4000;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`SAZU FCS API running on http://localhost:${port}`);
  // eslint-disable-next-line no-console
  console.log(`API docs available at http://localhost:${port}/api/docs`);
}

bootstrap();
