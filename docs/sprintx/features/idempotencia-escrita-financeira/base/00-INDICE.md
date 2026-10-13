---
expx_schema: 1
expx_tool: sprintx
kind: base_indice
trabalho_id: idempotencia-escrita-financeira
atualizado_em: 2026-10-11
areas:
  - arquivo: fluxo-lancamentos.md
    titulo: Fluxo de lancamentos
    lacunas: 0
  - arquivo: fluxo-caixinhas.md
    titulo: Fluxo de caixinhas
    lacunas: 0
  - arquivo: cliente-http.md
    titulo: Cliente HTTP
    lacunas: 1
  - arquivo: persistencia-transacoes.md
    titulo: Persistencia e transacoes
    lacunas: 2
  - arquivo: testes-integracao.md
    titulo: Testes de integracao
    lacunas: 0
---

# Índice da base - idempotencia-escrita-financeira

| Arquivo | Área | Resumo |
|---|---|---|
| `fluxo-lancamentos.md` | Fluxo de lançamentos | Contrato atual de criação simples e parcelada |
| `fluxo-caixinhas.md` | Fluxo de caixinhas | Atualizações atômicas atuais de depósito e resgate |
| `cliente-http.md` | Cliente HTTP | Cabeçalhos, erros e ausência de repetição segura |
| `persistencia-transacoes.md` | Persistência e transações | Schema, unicidade e concorrência no Postgres/Drizzle |
| `testes-integracao.md` | Testes de integração | Harness real protegido pela branch Neon de teste |
