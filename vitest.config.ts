import crypto from 'crypto'
import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config'

// Polyfill crypto.hash for Node < 21 (required by @vitejs/plugin-vue)
if (typeof (crypto as any).hash !== 'function') {
  ;(crypto as any).hash = (algorithm: string, data: string, outputEncoding: string) => {
    return crypto.createHash(algorithm).update(data).digest(outputEncoding as any)
  }
}

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'happy-dom',
      globals: true,
      root: '.',
      include: ['src/**/__tests__/**/*.test.ts'],
      setupFiles: ['src/__tests__/setup.ts'],
      coverage: {
        provider: 'v8',
        include: ['src/**/*.{ts,vue}'],
        exclude: ['src/main.ts', 'src/**/__tests__/**', 'src/types/**', 'src/i18n/*.json'],
      },
    },
  }),
)
