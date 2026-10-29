import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule, type OpenAPIObject } from '@nestjs/swagger';

/** Shared by main.ts, the e2e tests and the OpenAPI export script so all three match. */
export function configureApp(app: INestApplication): void {
  app.setGlobalPrefix('v1');
  const origins = process.env.CORS_ORIGINS?.split(',').map((origin) => origin.trim()).filter(Boolean);
  app.enableCors({ origin: origins?.length ? origins : false });
}

export function buildOpenApi(app: INestApplication): OpenAPIObject {
  const config = new DocumentBuilder()
    .setTitle('Touchline API')
    .setDescription('Career video platform API. Generated clients live in packages/api-client.')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();
  // "AthletesController.list" → "athletesList", which becomes the generated client's function name.
  return SwaggerModule.createDocument(app, config, {
    operationIdFactory: (controllerKey, methodKey) =>
      controllerKey.replace(/Controller$/, '').replace(/^./, (c) => c.toLowerCase()) +
      methodKey.replace(/^./, (c) => c.toUpperCase()),
  });
}
