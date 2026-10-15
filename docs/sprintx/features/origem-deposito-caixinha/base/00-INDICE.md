---
expx_schema: 1
expx_tool: sprintx
kind: base_indice
trabalho_id: origem-deposito-caixinha
atualizado_em: 2026-10-15
areas:
  - arquivo: schema-banco.md
    titulo: Schema de banco
    lacunas: 0
  - arquivo: function-caixinhas.md
    titulo: Neon Function de caixinhas
    lacunas: 1
  - arquivo: frontend-caixinhas.md
    titulo: Frontend - contexto, modal e tipos
    lacunas: 3
  - arquivo: calculo-saldo.md
    titulo: Calculo do saldo acumulado
    lacunas: 1
  - arquivo: idempotencia.md
    titulo: Idempotencia de escrita financeira
    lacunas: 0
  - arquivo: lancamentos-receita.md
    titulo: Criacao de lancamento de receita
    lacunas: 1
  - arquivo: padroes-de-teste.md
    titulo: Padroes de teste e migrations
    lacunas: 0
---

# Índice da base — origem-deposito-caixinha

| Arquivo | Área | Resumo |
|---|---|---|
| `schema-banco.md` | Schema de banco | Tabela `caixinhas` só guarda total acumulado; não há histórico de movimentações por depósito |
| `function-caixinhas.md` | Neon Function de caixinhas | Rotas depositar/resgatar/listar; `movimentarSchema` hoje não tem campo de origem do valor |
| `frontend-caixinhas.md` | Frontend - contexto, modal e tipos | Modal único depositar/resgatar; `totalGuardado` sempre reflete todo delta de `valorGuardado` |
| `calculo-saldo.md` | Cálculo do saldo acumulado | `useSaldoAcumulado` sempre desconta `totalGuardado` inteiro do saldo do mês |
| `idempotencia.md` | Idempotência de escrita financeira | Hash cobre o payload inteiro; campo novo no depósito entra automaticamente, sem código extra |
| `lancamentos-receita.md` | Criação de lançamento de receita | Contrato caso a decisão da F2 exija gerar receita vinculada a um depósito "de fora" |
| `padroes-de-teste.md` | Padrões de teste e migrations | Teste de integração real cobre idempotência/concorrência; migration segue numeração sequencial |
