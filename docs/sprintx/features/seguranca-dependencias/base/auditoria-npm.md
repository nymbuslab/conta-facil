# Auditoria npm

## Contrato de entrada

`npm audit --json` recebe a árvore descrita por `package.json` e `package-lock.json`. O projeto declara Tailwind 3.4.17 e Drizzle Kit 0.31.11 em `package.json:62-66`.

## Contrato de saída

A execução de 2026-10-11 retornou 11 vulnerabilidades: 5 altas e 6 moderadas. As altas chegam ao projeto pela árvore do Tailwind; as moderadas restantes incluem a cadeia Drizzle Kit, `@esbuild-kit/esm-loader`, `@esbuild-kit/core-utils` e esbuild.

## Limites e cotas

O npm informa que correções fora da faixa SemVer exigem `--force`; a documentação não garante ausência de quebra nesse modo.

## Erros conhecidos e tratamento

O relatório recomenda Tailwind 4.3.3 para os alertas altos e Drizzle Kit 0.18.1 para a cadeia moderada. O segundo caminho é um downgrade incompatível com o peer `drizzle-kit >=0.31.4` presente na árvore do Better Auth.

## Riscos para a nossa implementação

Executar `npm audit fix --force` mistura uma migração visual de versão principal com downgrade da ferramenta de migrations. A correção precisa ser manual e validada por área.

## Fonte

`package.json:49-66`, `package-lock.json` e saída local de `npm audit --json` - acessados em 2026-10-11. Documentação oficial: https://docs.npmjs.com/cli/v7/commands/npm-audit/ - acessada em 2026-10-11.
