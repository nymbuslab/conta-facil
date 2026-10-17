# Contrato de lançamentos (Function + contexto React)

> Área estudada: a API `GET /lancamentos` e `GET /lancamentos/resumo` e o contexto `useLancamentos()`, para avaliar se já suportam os dados que "Contas vencendo" e "Últimos lançamentos" do dashboard precisam.

## Contrato de entrada

`GET /lancamentos` (`src/functions/api/lancamentos.ts:348-363`) aceita query params validados por `filtrosLancamentosSchema` (`lancamentos.ts:44-50`): `limite` (1 a `LIMITE_MAXIMO`, padrão `LIMITE_PADRAO = 5`, `src/lib/paginacao.ts:5`), `cursor` (string opaca), `tipo` (`'receita' | 'despesa'`, opcional — omitido devolve só um tipo por chamada, a Function não mistura tipos numa única resposta), `mes` (`AAAA-MM`, opcional) e `busca` (string, opcional).

`GET /lancamentos/resumo` (`lancamentos.ts:365-371`) aceita só `mes` (opcional); devolve a soma total de receitas e despesas daquele mês (ou de todos os tempos, se `mes` for omitido) — não devolve contagem nem lista de itens.

Não existe parâmetro de "janela de vencimento" (ex.: "vencendo nos próximos N dias") em nenhuma rota. Não existe parâmetro para pedir receitas e despesas juntas numa única página ordenada.

## Contrato de saída

`repositorio.listar` (`lancamentos.ts:142-157`) ordena sempre por `asc(lancamentos.criadoEm), asc(lancamentos.id)` — ordem de inserção crescente, nunca por `vencimento` nem `dataEmissao`, e nunca descendente. Cada chamada devolve só um `tipo` por vez (o filtro `tipo` determina a condição WHERE; sem `tipo`, a condição de mês casa os dois, mas a ordenação e a paginação continuam tratando tudo como uma lista única sem discriminar tipo no item — ver `condicoesDeFiltro`, `lancamentos.ts:257-268` — na prática o frontend (`useLancamentos`) sempre chama com `tipo` explícito, nunca omitido, para montar `receitas`/`despesas` como arrays separados).

`LancamentoListado` (`lancamentos.ts:86-97`) tem `vencimento: string | null` e `dataEmissao: string | null` — suficiente para calcular "vencendo em N dias" no cliente, mas só dentro da página já carregada (5 itens por padrão), não como filtro de servidor.

## Limites e cotas

`LIMITE_PADRAO = 5` e `LIMITE_MAXIMO = 100` (`src/lib/paginacao.ts:5-6`). Paginação por cursor keyset (`criadoEm`, `id`), unidirecional (sempre avançando, sem "página anterior").

## Erros conhecidos e tratamento

`400` para parâmetros inválidos (`mes` fora do formato `AAAA-MM`, `cursor` que não decodifica). `401`/`403` tratados pelo `auth-middleware` (fora do escopo desta rota). Nenhum erro específico de "nenhum resultado" — lista vazia é `200` com `itens: []`.

## Riscos para a nossa implementação

- **"Contas vencendo" (3 despesas mais próximas do vencimento, não pagas, em até 3 dias) não tem endpoint.** A API não ordena por `vencimento` nem filtra por janela de dias. Implementar isso exige ou (a) uma query nova no repositório (ex.: `WHERE tipo='despesa' AND paga=false AND vencimento BETWEEN hoje AND hoje+3 ORDER BY vencimento ASC LIMIT 3`), ou (b) buscar no cliente e filtrar em memória — inviável, porque a despesa vencendo pode não estar entre os 5 itens mais antigos carregados do mês (a lista é ordenada por `criadoEm`, não por `vencimento`, e pode nem ser do mês vigente se o vencimento cair no mês seguinte). **Decisão de arquitetura necessária na F2/F3**: novo endpoint ou novo parâmetro de ordenação/filtro na Function.
- **"Últimos lançamentos" (5 mais recentes, misturando receita e despesa) também não tem endpoint.** Hoje cada chamada de `GET /lancamentos` devolve só um `tipo`. Misturar os dois numa lista só, ordenada por mais recente, com 5 itens, exige ou duas chamadas + merge no cliente (ordenar por `criadoEm` desc client-side, pegar os 5 primeiros) ou um novo modo da rota que aceita `tipo` omitido com ordenação desc. **Decisão de arquitetura necessária na F2/F3.**
- **Nenhuma das duas listas do dashboard pode reusar a paginação por cursor como está** (ela é sempre ascendente/forward, pensada para "carregar mais" numa lista já aberta, não para "os N mais recentes/mais urgentes" num resumo). Isso é trabalho de backend novo (migration de índice se a ordenação por `vencimento` precisar de performance — ver índices existentes em `drizzle/0002_paginacao_indices.sql`, que cobrem `(user_id, criado_em, id)`, não `(user_id, vencimento)`).

## Fonte

`src/functions/api/lancamentos.ts`, `src/lib/paginacao.ts:5`, `src/state/lancamentos-context.tsx` — acessado em 2026-10-17.
