---
expx_schema: 1
expx_tool: sprintx
kind: fechamento
trabalho_id: navegacao-inferior
titulo: Navegacao inferior com Parcelas Caixinhas e Perfil
tipo_trabalho: feature
fechado_em: 2026-10-08
modulo_afetado: [raiz, components, routes, state, types, hooks, lib, test]
arquivos_alterados: [vite.config.ts, package.json, package-lock.json, src/test/setup.ts, src/test/test-utils.tsx, src/components/header.test.tsx, src/test/render-route.tsx, src/routes/__root.test.tsx, src/routes/__root.tsx, src/routes/index.tsx, src/router.tsx, src/routes/parcelas.tsx, src/routes/caixinhas.tsx, src/routes/perfil.tsx, src/routes/parcelas.test.tsx, src/components/bottom-nav.tsx, src/components/bottom-nav.test.tsx, src/routes/perfil.test.tsx, src/components/registrar-fab.test.tsx, src/components/registrar-fab.tsx, src/types/lancamento.test.ts, src/types/lancamento.ts, src/lib/mock-data.ts, src/lib/datas.ts, src/state/lancamentos-context.test.tsx, src/state/lancamentos-context.tsx, src/components/ui/checkbox.tsx, src/components/lancamento-modal.test.tsx, src/components/lancamento-modal.tsx, src/components/confirmar-pagamento-dialog.tsx, src/components/lista-lancamentos.test.tsx, src/components/lista-lancamentos.tsx, src/components/data-table.tsx, src/components/parcela-card.tsx, src/components/parcela-card.test.tsx, src/lib/parcelamento.ts, src/types/caixinha.ts, src/types/caixinha.test.ts, src/state/caixinhas-context.tsx, src/state/caixinhas-context.test.tsx, src/hooks/use-saldo-acumulado.ts, src/hooks/use-saldo-acumulado.test.tsx, src/components/caixinha-card.tsx, src/components/caixinha-card.test.tsx, src/components/nova-caixinha-modal.tsx, src/components/nova-caixinha-modal.test.tsx, src/components/movimentar-caixinha-modal.tsx, src/components/movimentar-caixinha-modal.test.tsx, src/routes/caixinhas.test.tsx, src/components/saldo-card.test.tsx, src/routes/index.test.tsx, src/components/saldo-card.tsx, src/lib/perfil-mock.ts]
palavras_chave: [navegacao, bottom-nav, parcelamento, caixinhas, perfil, despesa-paga, saldo-acumulado]
resumo: O Conta Facil ganhou navegacao inferior com 4 abas (Inicio, Parcelas, Caixinhas, Perfil); despesas podem ser parceladas e marcadas como pagas; caixinhas com meta descontam do saldo acumulado.
decisao_principal: "D-16: saldoAcumulado da tela Inicio passa a ser Receita menos Despesa menos o total guardado em todas as Caixinhas"
risco_residual: lancamentos-context.tsx ainda expoe um campo saldoAcumulado interno pre-existente (Receita menos Despesa, sem Caixinhas) nao usado pela UI, que ficou sem limpeza por ser divida tecnica anterior a esta feature e fora do que qualquer decisao pediu.
testes_adicionados: 49
---

# Fechamento — navegacao-inferior

> Registro do que este trabalho entregou, em que módulo e em que arquivos. É o que torna a
> feature encontrável depois: por arquivo, por módulo e por palavra-chave.
> Os três campos de indexação são cópia fiel do `ORQUESTRADOR.md` no momento do fechamento.

## O que foi entregue

O Conta Fácil ganhou uma barra de navegação inferior fixa com quatro abas — Início, Parcelas,
Caixinhas e Perfil. Despesas agora podem ser parceladas (checkbox "Parcelado?" no modal, geração
automática de N despesas mensais com ajuste de centavos) e marcadas como pagas direto na lista da
Início, com o progresso de cada parcelamento visível na aba Parcelas. A aba Caixinhas permite
criar reservas com meta, depositar, resgatar e excluir, e o saldo acumulado da Início passa a
descontar o total guardado nelas. A aba Perfil mostra nome e e-mail fictícios, somente leitura. O
projeto também ganhou, pela primeira vez, um harness de teste (Vitest + Testing Library) — eram
zero testes antes desta feature.

## Decisão principal

D-16: `saldoAcumulado` da tela Início passa a ser Receita − Despesa − total guardado em todas as
Caixinhas, em vez de só Receita − Despesa — é o que torna as Caixinhas uma reserva de verdade, não
só um registro paralelo sem efeito no saldo exibido.

## Risco residual

`src/state/lancamentos-context.tsx` ainda expõe um campo `saldoAcumulado` interno
(`saldoReceita - saldoDespesa`, sem descontar Caixinhas) que já existia antes desta feature e não
foi tocado por nenhuma task — o valor correto é calculado à parte pelo hook `useSaldoAcumulado`,
que é o que a tela Início de fato renderiza. Nenhuma tela usa o campo antigo hoje, mas ele
continua no contrato de saída do contexto; limpá-lo é dívida técnica fora do escopo desta entrega.

## Onde isto mexeu

- **Módulos:** raiz, components, routes, state, types, hooks, lib, test
- **Arquivos:** 51 arquivos (ver `arquivos_alterados` no frontmatter e no `ORQUESTRADOR.md`) —
  inclui a configuração de teste do projeto (antes inexistente), as novas rotas/telas, os dois
  novos contextos de estado (parcelamento e Caixinhas) e os ajustes na tela Início.
- **Testes adicionados:** 49
