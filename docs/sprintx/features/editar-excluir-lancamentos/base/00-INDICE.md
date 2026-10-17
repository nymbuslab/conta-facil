---
expx_schema: 1
expx_tool: sprintx
kind: base_indice
trabalho_id: editar-excluir-lancamentos
atualizado_em: 2026-10-17
areas:
  - arquivo: schema-lancamentos.md
    titulo: Schema da tabela lancamentos
    lacunas: 1
  - arquivo: backend-rotas-lancamentos.md
    titulo: Backend - rotas e repositorio de lancamentos
    lacunas: 0
  - arquivo: caixinha-movimentacoes-risco.md
    titulo: Vinculo caixinha_movimentacoes e lancamentos
    lacunas: 1
  - arquivo: parcelamento-estrutura.md
    titulo: Estrutura de parcelamento
    lacunas: 1
  - arquivo: frontend-lancamentos-context.md
    titulo: Frontend - LancamentosProvider
    lacunas: 0
  - arquivo: ui-extrato-dialogos.md
    titulo: UI do Extrato - ponto de integracao
    lacunas: 0
  - arquivo: testes-e-idempotencia.md
    titulo: Convencoes de teste e idempotencia
    lacunas: 1
  - arquivo: design-system-acoes.md
    titulo: Convencoes de design para dialogo e acao destrutiva
    lacunas: 0
---

# Índice da base — editar-excluir-lancamentos

> Criado na F1 com `areas: []` e atualizado a cada arquivo de base gravado. Uma linha por área estudada.
> A lista `areas:` do frontmatter espelha esta lista: `arquivo` (nome dentro de `base/`, sem diretório), `titulo` e `lacunas` (quantas lacunas daquela área estão em `00-LACUNAS.md`, `0` se nenhuma). Formato em `references/00-schema.md`.

| Arquivo | Área | Resumo |
|---|---|---|
| `schema-lancamentos.md` | Schema da tabela `lancamentos` | Colunas, constraints, ausência de FK reais no banco |
| `backend-rotas-lancamentos.md` | Backend — rotas e repositório | Rotas hoje existentes; não há PATCH/DELETE de edição/exclusão |
| `caixinha-movimentacoes-risco.md` | Vínculo caixinha × lançamento | Receita de depósito "de fora" amarrada a uma caixinha, sem FK |
| `parcelamento-estrutura.md` | Estrutura de parcelamento | Grupo por `parcelamentoId`, `totalParcelas` copiado por linha |
| `frontend-lancamentos-context.md` | Frontend — `LancamentosProvider` | Mutações existentes, padrão otimista de `marcarComoPaga`/`excluirCaixinha` |
| `ui-extrato-dialogos.md` | UI do Extrato | `ConfirmarPagamentoDialog`, `LancamentoModal`, `DataTable`, onde a feature se encaixa |
| `testes-e-idempotencia.md` | Convenções de teste e idempotência | `executarComIdempotencia`, `garantirBranchDeTeste` |
| `design-system-acoes.md` | Convenções de design já fechadas | Botão destrutivo, regra de cor por sinal, margem de modal |
