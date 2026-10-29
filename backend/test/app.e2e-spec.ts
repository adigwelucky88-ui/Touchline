import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types.js';

import { AppModule } from './../src/app.module.js';
import { configureApp } from './../src/setup.js';

// These routes do not touch the database, so the suite runs without Postgres.
describe('API (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    process.env.DATABASE_URL ??= 'postgresql://unused@localhost/unused';
    const moduleFixture: TestingModule = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /v1/health', () => {
    return request(app.getHttpServer()).get('/v1/health').expect(200).expect({ status: 'ok' });
  });

  it('GET /v1/sports lists football with its positions', async () => {
    const response = await request(app.getHttpServer()).get('/v1/sports').expect(200);
    expect(response.body.map((sport: { key: string }) => sport.key)).toEqual(['football']);
    expect(response.body[0].positions).toHaveLength(4);
  });

  it('GET /v1/sports/:key returns 404 for unknown sports', () => {
    return request(app.getHttpServer()).get('/v1/sports/curling').expect(404);
  });
});
