/// <reference types="vitest/config" />
import path from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    define: {
      'import.meta.env.VITE_NEON_AUTH_BASE_URL': JSON.stringify(
        env.VITE_NEON_AUTH_BASE_URL ?? env.NEON_AUTH_BASE_URL,
      ),
      'import.meta.env.VITE_NEON_FUNCTION_API_BASE_URL': JSON.stringify(
        env.VITE_NEON_FUNCTION_API_BASE_URL ?? env.NEON_FUNCTION_API_BASE_URL,
      ),
    },
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, './src'),
      },
    },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/test/setup.ts'],
    },
  }
})
