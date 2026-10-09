---
expx_schema: 1
expx_tool: sprintx
kind: convergencia
trabalho_id: navegacao-inferior
atualizado_em: 2026-10-08
rodada: 1
voltas_maximas: 2
resultado: convergido
decisoes_conferidas: 20
achados: []
---

# Convergência — navegacao-inferior

## Rodada 1 (2026-10-08)

Conferidas as 20 decisões fechadas que exigem código (D-02, D-05 a D-23, exceto D-01/D-03/D-04,
que são exclusões de escopo sem código associado) contra o código em `src/routes/`,
`src/components/`, `src/state/`, `src/types/`, `src/hooks/` e `src/lib/`. Reconferidos os
23 critérios de aceite das tasks `concluida` das sprints 01 a 05, lendo o código de verdade,
não o status registrado.

Suíte rodada nesta conferência: `npm run test -- --run` → 21 arquivos, 49 testes, 0 falhas.
`npm run lint` → só warnings (nenhum erro). `npm run build` → build concluído sem erro.

Pontos de maior risco verificados com atenção, todos corretos:
- D-06 (`src/state/lancamentos-context.tsx`, `gerarParcelas`): valor total dividido em centavos
  por `Math.floor`, resto somado exatamente à última parcela.
- D-11/D-12: campo `paga: boolean` em `Despesa`; marcar como paga só existe na tela Início
  (clique na linha → `ConfirmarPagamentoDialog` → `marcarComoPaga`); a aba Parcelas é somente
  leitura (`agruparParcelamentos`), sem nenhuma ação de pagamento.
- D-15/D-16: depósito/resgate isolados em `caixinhas-context.tsx`, nunca criam `Despesa`;
  `useSaldoAcumulado` calcula `saldoReceita - saldoDespesa - totalGuardado` e é o valor
  renderizado na tela Início.
- D-17: `excluirCaixinha` apenas remove a caixinha do array; `totalGuardado` (derivado via
  `useMemo`) cai automaticamente, devolvendo o valor ao saldo sem lógica explícita adicional.
- D-19: `src/routes/perfil.tsx` é somente leitura — nenhum `<input>`, `<form>` ou ação de salvar.
- D-20/D-21: providers no `__root.tsx`; `RegistrarFab` em `bottom-20` (antes `bottom-6`);
  containers de rota com `pb-36` (antes `pb-28`), sem sobreposição com o `BottomNav` fixo.

Nenhum achado nesta rodada.

Observação registrada sem abrir achado: `lancamentos-context.tsx` mantém um campo interno
`saldoAcumulado` (`saldoReceita - saldoDespesa`, sem descontar Caixinhas) que já existia antes
desta feature (ver `base/dominio-lancamentos-e-conceito-parcelas.md`) e não foi tocado por
nenhuma task desta entrega. O valor correto por D-16 é calculado separadamente pelo hook
`useSaldoAcumulado`, que é o que a tela Início de fato usa. Por ser dívida técnica anterior ao
escopo desta feature, não vira achado aqui.
