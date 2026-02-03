import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());

  const port = process.env.PORT || 3000;

  await app.listen(port, '0.0.0.0');

  console.log(`\nEnvironment: ${process.env.NODE_ENV || 'dev'}`);
  console.log(`\nTrustVote AI Backend is active`);
  console.log(`URL: http://localhost:${port}`);
}

await bootstrap();
