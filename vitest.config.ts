import { defineConfig, mergeConfig } from 'vite';
import { defineConfig as defineVitestConfig } from 'vitest/config';
import swc from 'unplugin-swc';
import path from 'node:path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, 'packages/backend/.env') });

export default mergeConfig(
  defineConfig({
    plugins: [swc.vite()],
  }),
  defineVitestConfig({
    test: {
      globals: false,
      environment: 'node',
      include: ['src/**/*.spec.ts', 'packages/*/src/**/*.spec.ts'],
      coverage: {
        provider: 'v8',
        reporter: ['lcov', 'text'],
        reportsDirectory: path.resolve(__dirname, './coverage'),
        include: ['src/**/*.ts', 'packages/*/src/**/*.ts'],
        exclude: [
          '**/*.spec.ts',
          'node_modules/**',
          '**/dist/**',
          '**/*.module.ts',
          '**/main.ts',
          '**/index.ts',
          '**/drizzle/**',
          '**/*.dto.ts',
          '**/*.entity.ts',
        ],
        thresholds: {
          lines: 100,
          functions: 100,
          branches: 100,
          statements: 100,
        },
      },
    },
  }),
);
