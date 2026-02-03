import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './app.module';
import { beforeEach, describe, expect, it } from 'vitest';

describe('AppModule', () => {
  let appModule: AppModule;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    appModule = moduleFixture.get<AppModule>(AppModule);
  });

  it('should be defined', () => {
    expect(appModule).toBeDefined();
  });
});
