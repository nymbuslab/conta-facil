# Auditoria — editar-excluir-lancamentos

2026-10-17

| severidade | arquivo | problema | correção sugerida |
|---|---|---|---|
| MÉDIA | sprint-02/tasks.md | T-02.01 (`buscarPorId`): o `teste_integracao` só cobre "id inexistente → null" e "id existente do usuário → linha"; não cobre "id existente de outro usuário → null". Uma implementação que ignore o filtro por `userId` (vazamento entre contas) passaria como descrito. | Acrescentar um caso com id existente pertencente a outro usuário, afirmando que `buscarPorId` devolve `null`, não a linha. |
| MÉDIA | sprint-02/tasks.md | T-02.03 (`repositorio.editar`, alcance 'futuras'): o cenário descrito só prova que a parcela 1, já **paga**, é preservada. Não prova que uma parcela anterior **não paga** também seria preservada — uma implementação que filtre por "não paga" em vez de `parcelaAtual >= atual` passaria sem diferença no cenário atual. | Acrescentar uma parcela anterior não paga ao cenário e afirmar que ela permanece inalterada ao editar com alcance 'futuras'. |
| MÉDIA | sprint-02/tasks.md | T-02.05 (`repositorio.excluir`): mesmo gap de T-02.03, do lado da exclusão — falta uma parcela anterior não paga no cenário pra isolar o filtro por índice do filtro por status de pagamento. Além disso, o `teste_integracao` para `alcance: 'somente'` não fixa se a linha excluída está no meio ou no fim do grupo; uma implementação que só corrija `totalParcelas` quando a excluída é a última passaria como descrito — é exatamente o risco que `base/parcelamento-estrutura.md` já registrava. | Fixar um cenário de 3 parcelas, excluir a 2ª (do meio) com `alcance: 'somente'`, e exigir `totalParcelas: 2` nas remanescentes; e incluir parcela anterior não paga no cenário de `alcance: 'futuras'`. |
| MÉDIA | sprint-03/tasks.md | T-03.02 (`AcoesLancamentoDialog`, ação "Marcar como paga"): `teste_funcional` diz "dispara a mesma confirmação... preservando o comportamento existente", sem nomear o que é verificado — uma implementação que mostre algum diálogo de confirmação sem de fato chamar `marcarComoPaga` passaria. | Afirmar explicitamente que a ação chama `marcarComoPaga` do contexto, não apenas "comportamento preservado". |
| MÉDIA | sprint-04/fases.md, sprint-04/tasks.md | T-04.03 (`depende_de: [T-04.02]`) está encadeada no caminho crítico sem dependência real de arquivo: T-04.03 só altera `src/routes/parcelas.test.tsx`, enquanto T-04.02 altera `extrato-lista.tsx`/`lista-lancamentos.tsx` — nenhum arquivo em comum. A nota em `fases.md` justifica só o encadeamento T-04.01→T-04.02, não o de T-04.03. | Reavaliar: se a única dependência real de T-04.03 é o fluxo de editar/excluir já integrado (resultado de T-04.01), declarar `depende_de: [T-04.01]` e marcar paralelizável com T-04.02 — ou justificar por escrito por que precisa esperar por T-04.02. |
| BAIXA | base/00-LACUNAS.md | As 4 lacunas registradas (limite de tamanho de campo, limite de movimentações por caixinha, erro de parcela isolada, TTL de idempotência) não têm registro de "avaliado e não bloqueia esta feature" em nenhum lugar — ficam sujeitas a reabertura numa reauditoria futura sem esse contexto. | Opcional: uma frase em `00-DECISOES.md` registrando que as lacunas foram avaliadas e não bloqueiam esta feature. |

## Verificações sem achado

- **D-04 (bloqueio de receita vinculada a caixinha) coberto nas duas camadas**: backend (T-02.01 `estaVinculadoACaixinha`; T-02.04/T-02.06 devolvem 409 "sem chamar repositorio.editar/excluir") e frontend (T-03.06 exibe o 409 no diálogo sem fechar). O frontend reage ao 409 em vez de bloquear proativamente antes do clique, porque a listagem de lançamentos não expõe o vínculo com caixinha — consistente com a decisão D-04 ("com aviso no diálogo") e com a definição de pronto do `ORQUESTRADOR.md`.
- **Cobertura de decisões**: as 10 decisões (D-01 a D-10) aparecem na `origem` de pelo menos uma task; nenhuma ALTA por decisão órfã. D-09 (sem auditoria) é decisão de exclusão de escopo e não exige task, por regra do método. T-01.01/T-01.02 usam `[capacidade-teste]`, válido para sprint-01.
- **Dependências**: sem ciclo, direto ou transitivo, em nenhuma sprint.
- **Paralelismo declarado**: só T-01.01/T-01.02 (sprint-01), arquivos diferentes e sem dependência mútua — paralelismo real, não falso.
- **Nenhuma task** exige decisão humana em tempo de execução.
- **Nenhum pré-requisito externo não declarado**: sem segredo novo, sem migration nova (a coluna `pago_em` já existe e já está aplicada em `production`/`test` de uma sessão anterior a este plano).
- **Nenhum `criterio_aceite` subjetivo**: todos são condições binárias (status HTTP, chamada de função mockada, presença de campo).
- **Granularidade adequada**: todos os pares de teste cabem em uma frase cada.

VEREDITO: SIM — o plano está pronto para execução autônoma.

As cinco MÉDIAs acima não bloqueiam a F6: são lembretes pra quando a task escrever o teste de verdade (TDD), escrever a versão mais forte descrita na correção sugerida, não a descrição mais fraca do `tasks.md`.
