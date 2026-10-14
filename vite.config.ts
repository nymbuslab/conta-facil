/// <reference types="vitest/config" />
import { writeFileSync } from 'node:fs'
import path from 'node:path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv, type Plugin } from 'vite'

import { montarCabecalhosProducao } from './scripts/gerar-headers-producao.mjs'

/** Gera dist/_headers (padrao Cloudflare Pages) so no build de produção: a CSP precisa da
 * origem real da Function e do Neon Auth, que variam por ambiente e só existem no momento do
 * build — nunca em public/_headers estático. */
function headersDeProducao(authBaseUrl: string | undefined, functionBaseUrl: string | undefined): Plugin {
  return {
    name: 'headers-de-producao',
    apply: 'build',
    closeBundle() {
      writeFileSync(
        path.resolve(import.meta.dirname, 'dist/_headers'),
        montarCabecalhosProducao({ authBaseUrl, functionBaseUrl }),
      )
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const authBaseUrl = env.VITE_NEON_AUTH_BASE_URL ?? env.NEON_AUTH_BASE_URL
  const functionBaseUrl = env.VITE_NEON_FUNCTION_API_BASE_URL ?? env.NEON_FUNCTION_API_BASE_URL

  return {
    define: {
      'import.meta.env.VITE_NEON_AUTH_BASE_URL': JSON.stringify(authBaseUrl),
      'import.meta.env.VITE_NEON_FUNCTION_API_BASE_URL': JSON.stringify(functionBaseUrl),
    },
    plugins: [react(), tailwindcss(), headersDeProducao(authBaseUrl, functionBaseUrl)],
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
