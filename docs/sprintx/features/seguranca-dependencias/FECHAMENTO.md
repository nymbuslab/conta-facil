---
expx_schema: 1
expx_tool: sprintx
kind: fechamento
trabalho_id: seguranca-dependencias
titulo: Seguranca de dependencias
tipo_trabalho: feature
fechado_em: 2026-10-12
modulo_afetado: [raiz, scripts, test, ui, docs]
arquivos_alterados: [package.json, package-lock.json, vite.config.ts, components.json, src/index.css, src/components/ui/form.tsx, src/test/tailwind-config.test.ts, scripts/auditar-dependencias.mjs, scripts/auditar-dependencias.test.ts]
palavras_chave: [npm-audit, tailwind, vite, drizzle-kit, esbuild, seguranca]
resumo: A arvore npm ficou sem alertas altos ou criticos, com portao automatizado fail-closed, Tailwind 4 migrado e equivalencia visual comprovada em 16 pares.
decisao_principal: D-03 — nao usar force, override transitivo ou downgrade incompativel apenas para zerar alertas de ferramenta de desenvolvimento.
risco_residual: Quatro alertas moderados permanecem na cadeia de desenvolvimento do Drizzle Kit; origem, impacto e justificativa estao em RISCO-RESIDUAL.md.
testes_adicionados: 6
---

# Fechamento — seguranca-dependencias

## O que foi entregue

A auditoria agora falha fechada se o registro npm não responder e bloqueia qualquer alerta alto ou crítico. A árvore ficou em `0 alta`, `0 crítica` e `4 moderadas`. O Tailwind migrou da v3 para a v4 com plugin Vite, tema CSS-first e `tw-animate-css`; PostCSS, Autoprefixer e o plugin legado foram removidos.

A equivalência visual foi conferida em login, início, parcelas, caixinhas e quatro diálogos, em mobile e desktop. Depois de rejeitar uma primeira correção que deslocava formulários, a implementação final reproduziu exatamente o baseline real do commit `1ee45a9`: 16 pares com delta de `0 px`, fingerprints iguais, sem overflow e com teclado preservado.

## Decisão principal

D-03: não aplicar `npm audit fix --force`, override transitivo ou downgrade incompatível apenas para eliminar alertas de uma ferramenta de desenvolvimento. O risco residual conhecido é menor que o risco de quebrar geração e aplicação de migrations.

## Risco residual

Quatro alertas moderados permanecem na cadeia `drizzle-kit -> @esbuild-kit -> esbuild`. Eles afetam a CLI de desenvolvimento, não o bundle do navegador, e não possuem correção compatível comprovada nesta árvore. O relatório completo e o comando de acompanhamento estão em `RISCO-RESIDUAL.md`.

Como endurecimento posterior, a fixture visual pode remover o usuário e os dados descartáveis que cria na branch de teste.
