# Risco residual da árvore npm

Data da verificação: 2026-10-11.

O `npm audit --json` termina com zero vulnerabilidades altas ou críticas e quatro moderadas. As quatro entradas representam uma única cadeia transitiva usada por ferramenta de desenvolvimento:

| Pacote | Advisory/origem | Exposição no projeto | Correção indicada pelo npm | Decisão |
|---|---|---|---|---|
| `esbuild@0.18.20` | GHSA-67mh-4wv8-2f99 | Vem de `@esbuild-kit/core-utils`; afeta o servidor de desenvolvimento antigo do esbuild. Não entra no bundle da aplicação nem roda em produção. | Downgrade de `drizzle-kit` para 0.18.1 | Não aplicar: é incompatível com o peer `drizzle-kit >=0.31.4` trazido pelo Better Auth e perderia correções/recursos atuais. |
| `@esbuild-kit/core-utils@3.3.2` | Herda o advisory do esbuild | Dependência transitiva do loader legado do Drizzle Kit, executada apenas em comandos de desenvolvimento/migration. | Mesmo downgrade | Aceitar temporariamente e monitorar atualização do Drizzle Kit. |
| `@esbuild-kit/esm-loader@2.6.5` | Herda `core-utils` | Dependência transitiva do `drizzle-kit@0.31.11`; não é importada pelo frontend ou pela Function. | Mesmo downgrade | Aceitar temporariamente e monitorar atualização do Drizzle Kit. |
| `drizzle-kit@0.31.11` | Cadeia transitiva acima | Dependência direta de desenvolvimento para gerar/aplicar migrations. | Downgrade para 0.18.1 | Não usar `--force`, override transitivo ou downgrade incompatível. |

Mitigações: comandos do Drizzle Kit não são expostos à internet, migrations exigem conexão autorizada e o runner desta entrega recusa qualquer branch Neon que não seja `test` ou `test-*`. O risco deve ser revisto quando o Drizzle Kit remover o loader legado ou quando o advisory oferecer correção compatível.
