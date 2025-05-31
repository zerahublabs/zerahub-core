import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['**/*.test.ts'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'test/']
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@routes': path.resolve(__dirname, './src/routes'),
      '@models': path.resolve(__dirname, './src/models'),
      '@config': path.resolve(__dirname, './src/config'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@services': path.resolve(__dirname, './src/services'),
      '@middlewares': path.resolve(__dirname, './src/middlewares'),
      '@types': path.resolve(__dirname, './src/types')
    }
  }
}) 