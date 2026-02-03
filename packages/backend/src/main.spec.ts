import { NestFactory } from '@nestjs/core';
import { vi, describe, it, expect, beforeEach, afterEach, Mock } from 'vitest';
import { INestApplication, Type } from '@nestjs/common';

vi.mock('@nestjs/core', () => ({
  NestFactory: {
    create: vi.fn(),
  },
}));

vi.mock('dotenv', () => ({
  config: vi.fn(),
}));

describe('Main Bootstrap', () => {
  let mockApp: { listen: Mock };

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();

    mockApp = {
      listen: vi.fn().mockResolvedValue(undefined),
    };

    vi.mocked(NestFactory.create).mockResolvedValue(mockApp as unknown as INestApplication);
  });

  afterEach(() => {
    vi.stubEnv('PORT', '');
    vi.stubEnv('NODE_ENV', '');
  });

  it('should initialize the application with default port 3000', async () => {
    vi.stubEnv('PORT', '');

    await import('./main');

    const calls = vi.mocked(NestFactory.create).mock.calls;
    expect(calls.length).toBeGreaterThan(0);

    const [appModule, adapter] = calls[0];

    const moduleName = (appModule as Type<unknown>).name;
    expect(moduleName).toBe('AppModule');

    expect(adapter.constructor.name).toBe('FastifyAdapter');
    expect(mockApp.listen).toHaveBeenCalledWith(3000, '0.0.0.0');
  });

  it('should use the port from process.env when available', async () => {
    const customPort = '4000';
    vi.stubEnv('PORT', customPort);

    await import('./main');

    const [appModule, adapter] = vi.mocked(NestFactory.create).mock.calls[0];

    const moduleName = (appModule as Type<unknown>).name;
    expect(moduleName).toBe('AppModule');

    expect(adapter.constructor.name).toBe('FastifyAdapter');
    expect(mockApp.listen).toHaveBeenCalledWith(customPort, '0.0.0.0');
  });
});
