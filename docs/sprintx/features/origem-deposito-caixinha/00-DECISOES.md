---
expx_schema: 1
expx_tool: sprintx
kind: decisoes
trabalho_id: origem-deposito-caixinha
atualizado_em: 2026-10-15
decisoes:
  - id: D-01
    decisao: Deposito de fora tambem gera lancamento de receita vinculado
    alternativa_descartada: So nao descontar do saldo, sem gerar lancamento
    motivo: Manter o historico financeiro completo e rastreavel, padrao confirmado no YNAB
    status: fechada
    bloqueante: false
  - id: D-02
    decisao: Origem escolhida por deposito individual, nao por caixinha inteira
    alternativa_descartada: Marcar a caixinha inteira como alimentada de fora
    motivo: Flexibilidade por movimento, aceitando o custo de uma tabela nova de movimentacoes
    status: fechada
    bloqueante: false
  - id: D-03
    decisao: Resgate sempre soma de volta ao saldo do mes, independente da origem do deposito
    alternativa_descartada: Resgate so soma se o deposito original era saldo atual
    motivo: Matematica verificada e simetrica nos dois casos, sem exigir o resgate saber a origem
    status: fechada
    bloqueante: false
  - id: D-04
    decisao: Caixinhas existentes continuam contando como saldo atual, sem reclassificacao
    alternativa_descartada: Pedir para o usuario reclassificar o saldo ja guardado
    motivo: Preserva o comportamento atual sem exigir acao do usuario na migracao
    status: fechada
    bloqueante: false
  - id: D-05
    decisao: Resgate tambem grava linha de auditoria na tabela de movimentacoes, com origem nula
    alternativa_descartada: So deposito grava linha de movimentacao
    motivo: Fecha o historico completo de entradas e saidas a custo quase zero
    status: fechada
    bloqueante: false
  - id: D-06
    decisao: Campo de origem no formulario de deposito nasce pre-marcado em saldo atual
    alternativa_descartada: Sem marcacao, obriga escolher toda vez
    motivo: Mantem o comportamento de hoje por padrao se a pessoa nao notar o campo novo
    status: fechada
    bloqueante: false
  - id: D-07
    decisao: Campo origem opcional no backend com default saldo_atual por um ciclo de rollout
    alternativa_descartada: Campo obrigatorio desde o primeiro deploy
    motivo: Mesmo padrao ja usado no rollout da chave de idempotencia, tolera deploy dessincronizado
    status: fechada
    bloqueante: false
---

# Decisões — origem-deposito-caixinha

> Uma linha por decisão tomada no planejamento (F2 e, excepcionalmente, F3). Formato fixo. Não apague decisões: uma decisão revertida ganha nova linha que cita a anterior.

## Decisões

```
D-01 | Depósito "de fora" também gera lançamento de receita vinculado | Só não descontar do saldo, sem gerar lançamento | Manter o histórico financeiro completo e rastreável, padrão confirmado no YNAB
D-02 | Origem escolhida por depósito individual, não por caixinha inteira | Marcar a caixinha inteira como alimentada de fora | Flexibilidade por movimento, aceitando o custo de uma tabela nova de movimentações
D-03 | Resgate sempre soma de volta ao saldo do mês, independente da origem do depósito | Resgate só soma se o depósito original era saldo atual | Matemática verificada e simétrica nos dois casos (ver base/calculo-saldo.md), sem exigir o resgate saber a origem
D-04 | Caixinhas existentes continuam contando como saldo atual, sem reclassificação | Pedir para o usuário reclassificar o saldo já guardado | Preserva o comportamento atual sem exigir ação do usuário na migração
D-05 | Resgate também grava linha de auditoria na tabela de movimentações, com origem nula | Só depósito grava linha de movimentação | Fecha o histórico completo de entradas e saídas a custo quase zero (um insert a mais na mesma transação)
D-06 | Campo de origem no formulário de depósito nasce pré-marcado em "saldo atual" | Sem marcação, obriga escolher toda vez | Mantém o comportamento de hoje por padrão se a pessoa não notar o campo novo
D-07 | Campo `origem` opcional no backend com default `saldo_atual` por um ciclo de rollout | Campo obrigatório desde o primeiro deploy | Mesmo padrão já usado no rollout da `Idempotency-Key` neste projeto, tolera frontend novo rodando contra Function ainda não implantada
```

## Pendências

Nenhuma pendência.
