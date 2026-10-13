import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'
import { build } from 'vite'

type SaidaBuild = {
  output: Array<{
    type: 'asset' | 'chunk'
    fileName: string
    source?: string | Uint8Array
  }>
}

const raiz = resolve(import.meta.dirname, '../..')
const ler = (arquivo: string) => readFileSync(resolve(raiz, arquivo), 'utf8')

describe('configuracao Tailwind 4', () => {
  it('usa o plugin Vite, CSS-first e tw-animate-css', () => {
    expect(ler('vite.config.ts')).toContain("from '@tailwindcss/vite'")
    expect(ler('src/index.css')).toContain('@import "tailwindcss";')
    expect(ler('src/index.css')).toContain('@import "tw-animate-css";')
    expect(ler('src/index.css')).not.toMatch(/@tailwind (base|components|utilities)/)
    expect(ler('package.json')).not.toContain('tailwindcss-animate')
  })

  it('mapeia todos os tokens semanticos, fontes, raios e animacoes', () => {
    const css = ler('src/index.css')
    const blocoTheme = css.slice(css.indexOf('@theme inline'), css.indexOf('@layer base'))
    const cores = [
      'border', 'input', 'ring', 'background', 'foreground',
      'primary', 'primary-foreground', 'secondary', 'secondary-foreground',
      'destructive', 'destructive-foreground', 'muted', 'muted-foreground',
      'accent', 'accent-foreground', 'popover', 'popover-foreground',
      'card', 'card-foreground', 'success', 'success-foreground',
      'warning', 'warning-foreground', 'info', 'info-foreground',
    ]
    for (const cor of cores) {
      expect(blocoTheme).toContain(`--color-${cor}: hsl(var(--${cor}));`)
    }
    for (const token of [
      '--font-sans: Inter, system-ui, sans-serif;',
      '--font-display: Geist, Inter, system-ui, sans-serif;',
      '--radius-lg: var(--radius);',
      '--radius-md: calc(var(--radius) - 2px);',
      '--radius-sm: calc(var(--radius) - 4px);',
      '--animate-accordion-down: accordion-down 0.2s ease-out;',
      '--animate-accordion-up: accordion-up 0.2s ease-out;',
      '--animate-fade-in: fade-in 0.2s ease-out;',
      '--animate-speed-dial-in: speed-dial-in 0.15s ease-out;',
    ]) {
      expect(blocoTheme).toContain(token)
    }
    for (const animacao of ['accordion-down', 'accordion-up', 'fade-in', 'speed-dial-in']) {
      expect(css).toContain(`@keyframes ${animacao}`)
    }

    const blocoRoot = css.match(/:root\s*\{([\s\S]*?)\n\s*\}/)?.[1] ?? ''
    const blocoDark = css.match(/\.dark\s*\{([\s\S]*?)\n\s*\}/)?.[1] ?? ''
    const valoresTema = {
      root: {
        background: '214 30% 96%', foreground: '220 47% 11%', card: '0 0% 100%',
        'card-foreground': '220 47% 11%', popover: '0 0% 100%', 'popover-foreground': '220 47% 11%',
        primary: '222 100% 55%', 'primary-foreground': '214 30% 96%', secondary: '214 25% 91%',
        'secondary-foreground': '220 47% 11%', muted: '214 25% 93%', 'muted-foreground': '215 19% 45%',
        accent: '222 100% 55%', 'accent-foreground': '214 30% 96%', destructive: '0 72% 51%',
        'destructive-foreground': '210 40% 98%', success: '175 77% 32%', 'success-foreground': '210 40% 98%',
        warning: '244 58% 51%', 'warning-foreground': '210 40% 98%', info: '215 19% 45%',
        'info-foreground': '210 40% 98%', border: '215 20% 82%', input: '215 20% 82%', ring: '222 100% 55%',
      },
      dark: {
        background: '220 47% 9%', foreground: '214 30% 96%', card: '220 40% 12%',
        'card-foreground': '214 30% 96%', popover: '220 40% 12%', 'popover-foreground': '214 30% 96%',
        primary: '222 100% 60%', 'primary-foreground': '220 47% 9%', secondary: '220 30% 18%',
        'secondary-foreground': '214 30% 96%', muted: '220 30% 16%', 'muted-foreground': '215 19% 65%',
        accent: '222 100% 60%', 'accent-foreground': '220 47% 9%', destructive: '0 72% 55%',
        'destructive-foreground': '210 40% 98%', success: '175 70% 40%', 'success-foreground': '210 40% 98%',
        warning: '244 58% 62%', 'warning-foreground': '210 40% 98%', info: '215 19% 65%',
        'info-foreground': '220 47% 9%', border: '220 25% 22%', input: '220 25% 22%', ring: '222 100% 60%',
      },
    }
    for (const [token, valor] of Object.entries(valoresTema.root)) {
      expect(blocoRoot).toContain(`--${token}: ${valor};`)
    }
    for (const [token, valor] of Object.entries(valoresTema.dark)) {
      expect(blocoDark).toContain(`--${token}: ${valor};`)
    }
    expect(blocoTheme).toContain('@theme inline')
  })

  it('gera no CSS final todas as utilities usadas pelos Dialogs', async () => {
    const resultado = await build({
      configFile: resolve(raiz, 'vite.config.ts'),
      logLevel: 'silent',
      build: { write: false },
    }) as unknown as SaidaBuild
    const css = resultado.output.find(
      (item) => item.type === 'asset' && item.fileName.endsWith('.css'),
    )
    expect(css).toBeDefined()
    const compilado = String(css?.source)

    for (const utility of [
      '.animate-in',
      '.animate-out',
      '.fade-in-0',
      '.fade-out-0',
      '.zoom-in-95',
      '.zoom-out-95',
      'slide-in-from-left-1\\/2',
      'slide-out-to-left-1\\/2',
      'slide-in-from-top-\\[48\\%\\]',
      'slide-out-to-top-\\[48\\%\\]',
    ]) {
      expect(compilado).toContain(utility)
    }
    expect(compilado).toContain('data-\\[state\\=open\\]\\:animate-in')
    expect(compilado).toContain('data-\\[state\\=closed\\]\\:animate-out')
  })
})
