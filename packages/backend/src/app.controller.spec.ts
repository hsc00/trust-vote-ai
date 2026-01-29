import { Test, TestingModule } from '@nestjs/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { AppController } from './app.controller';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
    }).compile();

    appController = module.get<AppController>(AppController);
  });

  describe('health', () => {
    it('should return status "ok"', () => {
      const result = appController.getHealth();
      expect(result.status).toBe('ok');
      expect(result).toHaveProperty('timestamp');
    });
  });
});
