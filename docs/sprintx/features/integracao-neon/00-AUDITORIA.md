# Auditoria — integracao-neon

2026-10-10 (rodada 2)

## ALTA da rodada anterior

| achado anterior | tratado em | como |
|---|---|---|
| ALTA — T-01.01 e T-01.02 escreviam `package.json` em paralelo (`paralelizavel: true` sem dependência) | sprint-01/tasks.md | T-01.02 agora tem `depende_de: [T-01.01]` e `paralelizavel: false`, com nota explicando o motivo. Resolvido. |
| ALTA — Tasks de UI (T-02.02, T-02.03, T-04.04) sem portão de design; ORQUESTRADOR não citava a exceção | sprint-02/tasks.md, sprint-04/tasks.md, ORQUESTRADOR.md §6.1 | T-02.02 e T-02.03 ganharam nota "Portão de design" exigindo protótipo Stitch + aprovação antes do código de interface; T-04.04 idem. ORQUESTRADOR §6 regra 1 agora cita a exceção explicitamente. Resolvido. |

Nenhum ALTA da rodada 1 permanece sem tratamento.

## Tabela de achados (rodada 2)

| severidade | arquivo | problema | correção sugerida |
|---|---|---|---|
| MÉDIA | sprint-01/tasks.md (T-01.02) | `criterio_aceite` exige seis pacotes; `teste_funcional` (smoke de import) só cobre cinco — falta `pg`. | Acrescentar `pg` ao smoke test de import em `teste_funcional`. |
| MÉDIA | sprint-01/tasks.md (T-01.04) | `criterio_aceite` inclui a checagem de região via `neon status`, mas nenhum teste declarado captura essa evidência. | Nomear a evidência (arquivo/saída lida pelo teste) ou mover a checagem de região para um passo de setup não testável automaticamente. |
| MÉDIA | sprint-02/sprint.md / base/neon-auth.md | O risco "projeto sem IP Allow nem Private Networking" é citado na prosa, mas nenhuma task de sprint-02 verifica essa condição antes de prosseguir. | Acrescentar a T-02.01 um passo de verificação dessa condição, análogo ao feito para a região em T-01.04. |

## Veredito

VEREDITO: SIM — o plano está pronto para execução autônoma.

Os três achados MÉDIA desta rodada são residuais de granularidade de teste/evidência — a
suíte real pega `pg` quebrado ou a condição de IP Allow faltando como falha natural, só não há
prova declarada antecipadamente. Não bloqueiam a execução; ficam registrados para a F6 observar
e, se quiser, fechar como melhoria pontual.

---

Auditoria feita pelo agente `auditor-plano`, com acesso somente de leitura. Nenhum arquivo do
plano foi alterado durante esta rodada.

## Histórico de rodadas

- Rodada 1 (2026-10-10): 2 ALTA, 3 MÉDIA, 1 BAIXA. VEREDITO: NÃO. Plano voltou para a F3.
- Rodada 2 (2026-10-10): 0 ALTA (as 2 da rodada 1 resolvidas), 3 MÉDIA novas (residuais de
  evidência de teste). VEREDITO: SIM.
