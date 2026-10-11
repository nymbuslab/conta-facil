# Hospedagem do frontend (SPA)

> Substitua todos os marcadores `{{...}}`. Se a fonte não afirma algo, escreva `NÃO DOCUMENTADO` — nunca invente. Todo número vem acompanhado da referência que o afirma.

## Contrato de entrada

NÃO DOCUMENTADO — não há no repositório arquivo de configuração de hospedagem (`vercel.json`, `netlify.toml`, `Dockerfile`, workflow de deploy em `.github/workflows/`) nem menção em `README.md`/`CLAUDE.md` a onde o build de `npm run build` (Vite) é publicado.

## Contrato de saída

NÃO DOCUMENTADO — mesma lacuna acima: não há evidência de qual domínio serve o frontend hoje, nem em `test` nem em produção.

## Limites e cotas

NÃO DOCUMENTADO.

## Erros conhecidos e tratamento

NÃO DOCUMENTADO.

## Riscos para a nossa implementação

- `VITE_NEON_FUNCTION_API_BASE_URL` (env do frontend, citada em `CLAUDE.md` como exposta a partir de `NEON_FUNCTION_API_BASE_URL`) precisa apontar para a URL da Function da branch `production`, e o domínio final do frontend precisa estar em `FUNCTION_ALLOWED_ORIGINS` para o CORS liberar — sem saber onde o frontend é hospedado, não é possível planejar essa variável nem o domínio a autorizar.
- Sem pipeline de deploy conhecido, o rollout do frontend em si (não só do backend Neon) é incerteza aberta: pode ser manual (`npm run build` + upload) ou automático (git push dispara build em algum provedor não documentado aqui).

## Fonte

- Busca por `vercel.json`, `netlify.toml`, `Dockerfile`, `.github/workflows/` na raiz do repositório — nenhum encontrado, acessado em 2026-10-10
- `README.md` e `CLAUDE.md` — acessado em 2026-10-10
