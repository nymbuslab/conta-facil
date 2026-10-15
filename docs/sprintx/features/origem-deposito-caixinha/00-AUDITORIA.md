# Auditoria — origem-deposito-caixinha

Data: 2026-10-15

| severidade | arquivo | problema | correção sugerida |
|---|---|---|---|
| MÉDIA | sprint-01/tasks.md | T-01.02 afirma em `teste_integracao`/`criterio_aceite` que "a tabela aparece em information_schema" / "existe na branch test", mas `npm run test:migrate` (`src/test/migration-setup.ts`) só executa `drizzle-kit migrate` e passa/falha pelo código de saída — não há asserção contra `information_schema`, e a task não altera nenhum arquivo para adicionar essa verificação (`arquivos.altera` vazio) | Declarar no `teste_integracao` qual arquivo fará a consulta (ex.: asserção em `src/test/migration-setup.ts`, listado em `arquivos.altera`), ou trocar a evidência por algo que o comando já produz |
| MÉDIA | sprint-03/fases.md, sprint-03/tasks.md | Sequencialidade desnecessária no caminho crítico: T-03.03 (`depende_de: [T-03.02]`) altera `src/state/caixinhas-context.tsx`, arquivo disjunto do que T-03.02 altera (`movimentar-caixinha-modal.tsx`); o teste de T-03.03 só depende do schema de T-03.01, não do modal pronto | Tornar T-03.03 paralelizável com T-03.02 (ambas dependendo só de T-03.01), reduzindo o caminho crítico da sprint |
| MÉDIA | ORQUESTRADOR.md (seção 8), sprint-02/tasks.md | Dependência entre sprints não declarada via `depende_de`: sprint-02 depende da migration da sprint-01, mas T-02.01 tem `depende_de: []` e nenhuma task de sprint-02 cita T-01.02. A rotina de retomada (seção 8) só olha `depende_de`, podendo iniciar sprint-02 antes da migration existir numa retomada fora da ordem estrita de sprints | Declarar `depende_de` cruzando sprints onde há dependência real de dado, ou explicitar na seção 8 que a retomada respeita primeiro a ordem de `sprints:` antes de olhar `depende_de` dentro de cada sprint |
| BAIXA | sprint-02/tasks.md, sprint-03/tasks.md | T-02.01 e T-03.01 têm `paralelizavel: true` embora suas fases (`F-02.1`, `F-03.1`) tenham `paralela_com: []` — campo sem efeito prático | Ajustar para `paralelizavel: false` ou remover a ambiguidade |
| BAIXA | sprint-01/tasks.md | `teste_funcional` de T-01.04 ("useSaldoAcumulado e useCaixinhas leem dados consistentes entre si no mesmo render") é vago; o `criterio_aceite` da mesma task já compensa reusando a asserção existente | Reescrever o `teste_funcional` apontando o valor numérico específico comparado entre os dois hooks |

VEREDITO: SIM — o plano está pronto para execução autônoma.
