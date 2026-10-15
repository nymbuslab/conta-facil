# Lacunas

- `src/lib/api-client.ts` (`mensagemErroApi`, `postIdempotente`) não foi lido integralmente —
  citado por referência em `frontend-caixinhas.md`, mas o comportamento exato de mapeamento de
  erro não foi verificado nesta ingestão.
- `src/lib/formatters.ts` (`parseValorMonetario`) não foi lido — citado por referência.
- `src/functions/api/index.ts` (montagem das rotas, prefixo real de `/caixinhas` e
  `/lancamentos`) não foi lido — assumido pelo padrão das outras Functions do projeto, não
  confirmado linha a linha.
- `src/functions/api/lancamentos.ts` além dos trechos de criação de receita (erros, demais
  rotas) não foi lido integralmente.
- Comportamento de `src/routes/caixinhas.tsx` e `src/routes/index.tsx` (onde o saldo e a lista de
  caixinhas aparecem na tela) não foi lido — só confirmado que consomem os hooks/contextos
  documentados, via `grep`.
- Nenhuma fonte externa (Mobills, Organizze) documenta oficialmente o comportamento de "caixinha
  desconta ou não o saldo" — a pesquisa de mercado desta sessão achou só o padrão do YNAB
  documentado oficialmente; Mobills/Organizze ficaram em `NÃO DOCUMENTADO` nesse ponto específico
  (ver relatório de pesquisa já compartilhado com o usuário nesta conversa, não persistido em
  arquivo).
