# Auditoria — navegacao-inferior

Data: 2026-10-08

## ALTA da rodada anterior

| achado anterior | tratado em | como |
|---|---|---|
| ALTA — T-03.02 (`adicionarDespesa`) com teste de divisão exata (R$1.200/12), que não exercita ajuste de centavos | sprint-03/tasks.md, T-03.02 | Exemplo trocado para R$1.000,00 em 3x; `teste_integracao` agora exige valores exatos 333,33 / 333,33 / 333,34 nessa ordem, com o resto de centavos sempre na última parcela. |

## Achados novos desta rodada

| severidade | arquivo | problema | correção sugerida |
|---|---|---|---|
| MEDIA | sprint-03/sprint.md | O frontmatter e a tabela de fases ainda listavam 4 fases (resquício da estrutura anterior à fusão em `fases.md`/`tasks.md`, que já tinham só 2). | Corrigido nesta rodada: `fases: [F-03.1, F-03.2]` e tabela reduzida às 2 fases reais. |

Nenhum outro achado novo. Verificação ponto a ponto:

- T-02.02: `teste_funcional` exige o texto "Parcelas" no documento. Tratada.
- T-02.03: `depende_de: [T-02.02]`, `paralelizavel: false`. Tratada.
- Nenhuma task em nenhuma das 5 sprints tem `paralelizavel: true` com `depende_de` não vazio (contradição proibida pelo diagrama) — conferido nas 23 tasks.
- T-01.01: `teste_funcional` verifica `test.environment` em vez de duplicar exit code. Tratada.
- T-01.01 e T-04.01: `paralelizavel: false`. Tratada.
- Diagramas Mermaid de todas as 5 sprints batem com os campos das tasks; caminho crítico recalculado do zero em cada sprint bate com a marcação `critico` e com o `caminho_critico` do frontmatter do `ORQUESTRADOR.md` (15 tasks).
- Tabela decisão × tasks refeita via campo `origem`: D-01, D-03, D-04 são exclusões de escopo (sem task, correto); as demais 20 decisões aparecem em pelo menos uma task.
- Base não ignorada; nenhuma dependência circular; nenhum critério subjetivo; nenhuma decisão humana pendente em execução; nenhum pré-requisito externo não declarado; lockfile declarado onde necessário.

VEREDITO: SIM — o plano está pronto para execução autônoma.

## Histórico — rodada 1

| severidade | arquivo | problema | correção sugerida |
|---|---|---|---|
| ALTA | sprint-03/tasks.md | T-03.02 (`adicionarDespesa` gera parcelas): o `teste_funcional` usa um total de R$1.200,00 em 12 parcelas — divisão exata (R$100,00 cada), que não exercita o "ajuste de centavos na última parcela" citado no próprio texto do teste. | Trocar o exemplo por um total que não divide exatamente (ex.: R$1.000,00 em 3x) e afirmar os valores exatos esperados de cada parcela. |
| MEDIA | sprint-02/tasks.md | T-02.02: `teste_funcional` não verifica qual conteúdo aparece, só que não lançou exceção. | Afirmar um texto/elemento mínimo esperado do placeholder. |
| MEDIA | sprint-02/tasks.md, sprint-02/fases.md | T-02.03 marcada paralela mas com dependência oculta das rotas criadas por T-02.02. | Declarar `depende_de: [T-02.02]` em T-02.03. |
| MEDIA | ORQUESTRADOR.md (seção 3), sprint-03/fases.md | Seção 3 prometia paralelismo que o metadado de fases/tasks não autorizava. | Alinhar metadado com o texto, ou corrigir o texto. |
| MEDIA | ORQUESTRADOR.md (seção 3), sprint-04/fases.md | Mesmo padrão em sprint-04. | Mesma correção. |
| BAIXA | sprint-01/tasks.md | T-01.01 com dois testes redundantes (mesma checagem de exit code). | Um dos dois testes inspecionar a config `environment: 'jsdom'`. |
| BAIXA | sprint-01/tasks.md, sprint-04/tasks.md | T-01.01 e T-04.01 com `paralelizavel: true` sem par real na mesma janela. | Ajustar para `false`. |
