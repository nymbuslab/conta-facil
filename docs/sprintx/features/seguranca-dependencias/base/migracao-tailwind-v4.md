# Migração Tailwind v4

## Contrato de entrada

O projeto usa diretivas `@tailwind` e `@apply` em `src/index.css:1-3,89-93`, tema em `tailwind.config.ts` e plugin PostCSS em `postcss.config.js:2`. O Vite carrega apenas React em `vite.config.ts:19`.

## Contrato de saída

A migração oficial para Vite usa `@tailwindcss/vite`, `@import "tailwindcss"` e configuração CSS-first. Os tokens existentes precisam ser mapeados com `@theme inline` para preservar utilitários como `bg-primary` e `text-foreground`.

O `tailwindcss-animate` usado atualmente pelo shadcn foi descontinuado para projetos novos. A migração deve removê-lo, instalar `tw-animate-css`, importar `@import "tw-animate-css"` no CSS principal e verificar no CSS compilado todas as classes de animação já usadas por `src/components/ui/dialog.tsx`.

## Limites e cotas

Tailwind 4 requer Safari 16.4+, Chrome 111+ e Firefox 128+, segundo o guia oficial de upgrade.

## Erros conhecidos e tratamento

As diretivas `@tailwind` foram removidas. Para Vite, a documentação recomenda o plugin dedicado em vez do plugin PostCSS. O tema atual usa valores HSL sem wrapper; na arquitetura v4 eles precisam virar valores CSS completos antes do mapeamento.

## Riscos para a nossa implementação

A migração pode alterar cores, raios, fontes, animações e classes arbitrárias sem erro de build. Além de testes, exige comparação visual mobile e desktop. As utilidades `animate-in`, `animate-out`, `fade-*`, `zoom-*` e `slide-*` do diálogo precisam continuar presentes via `tw-animate-css`.

## Fonte

`src/index.css:1-97`, `src/components/ui/dialog.tsx`, `tailwind.config.ts`, `postcss.config.js`, `vite.config.ts:19` - acessados em 2026-10-11. Guias oficiais: https://tailwindcss.com/docs/upgrade-guide e https://ui.shadcn.com/docs/tailwind-v4 - acessados em 2026-10-11.
