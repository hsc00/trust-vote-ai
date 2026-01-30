import { defineConfig, mergeConfig } from 'vite';
import { defineConfig as defineVitestConfig } from 'vitest/config';
import swc from 'unplugin-swc';
import path from 'node:path';

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
      },
    },
  }),
);
