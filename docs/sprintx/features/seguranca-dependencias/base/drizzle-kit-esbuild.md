# Drizzle Kit e esbuild

## Contrato de entrada

O projeto usa Drizzle Kit 0.31.11 para `db:generate` e `db:migrate` em `package.json:23-24,62`.

## Contrato de saída

Drizzle Kit 0.31.11 instala diretamente esbuild 0.25.x e, em paralelo, a dependência descontinuada `@esbuild-kit/esm-loader`, que fixa `@esbuild-kit/core-utils` e esbuild 0.18.20.

## Limites e cotas

NÃO DOCUMENTADO pelo pacote se a cadeia descontinuada será removida numa versão estável posterior.

## Erros conhecidos e tratamento

O advisory do esbuild afeta versões até 0.24.2 e descreve leitura indevida de respostas do servidor de desenvolvimento. O npm propõe Drizzle Kit 0.18.1, mas essa versão conflita com o peer atual do Better Auth.

## Riscos para a nossa implementação

Forçar uma versão transitiva de esbuild pode quebrar a CLI de migration. Qualquer override precisa provar geração e aplicação de migration na branch de teste; sem essa prova, o risco residual deve permanecer documentado.

## Fonte

`package.json:23-24,62`, `package-lock.json` e saídas locais de `npm explain`/`npm view` - acessados em 2026-10-11. Advisory: https://github.com/advisories/GHSA-67mh-4wv8-2f99 - acessado em 2026-10-11.
