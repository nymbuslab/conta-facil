# Auditoria — dashboard-extrato

Data: 2026-10-17

Auditoria feita pelo agente `auditor-plano` (acesso só de leitura), em contexto separado de
quem gerou o plano, lendo `ORQUESTRADOR.md`, `00-DECISOES.md` (D-01 a D-18), os 6 arquivos de
`base/` e as 5 sprints (`sprint.md`, `fases.md`, `tasks.md` de cada).

Cobertura das decisões (campo `origem`): todas as D-01 a D-18 que exigem construção aparecem em
pelo menos uma task, exceto D-18 (validação visual/produção), tratada explicitamente como item
da Definição de pronto global (seção 7 do `ORQUESTRADOR.md`) em vez de task — por estar
declarado, não escondido, isso gerou achado MÉDIA, não ALTA. Nenhuma task sem teste, teste
genérico, critério subjetivo, dependência circular, pré-requisito externo não declarado,
decisão humana embutida em task, ou dependência nova sem lockfile.

## Achados

| severidade | arquivo | problema | correção sugerida |
|---|---|---|---|
| MÉDIA | sprint-03/tasks.md (T-03.01), sprint-05/tasks.md (T-05.01) | `paralelizavel: true` na task contradiz a fase (`F-03.1` e `F-05.1` em `fases.md` declaradas `paralelizavel: false`, `paralela_com: []`); não há task parceira real para rodar ao lado. | Alinhar o campo `paralelizavel` da task com o da fase (`false`), ou declarar explicitamente a task parceira. |
| MÉDIA | sprint-02/tasks.md (T-02.05), sprint-02/fases.md | T-02.05 depende só de T-02.02 e altera arquivo diferente (`src/test/lancamentos-setup.ts`) de T-02.03/T-02.04 (`src/functions/api/lancamentos.ts`), mas fica presa ao fim de toda a fase F-02.1 por estrutura de fase, não por dependência real — infla o caminho crítico sem necessidade. | Mover T-02.05 para rodar em paralelo com T-02.03/T-02.04, já que sua única dependência real é T-02.02. |
| MÉDIA | base/tela-inicio-atual.md (risco), sprint-05/tasks.md (T-05.02) | A base registra o risco explícito de que o Header (mês do relógio, não o mês navegado) não deve ser copiado para o Extrato "sem decidir explicitamente"; nenhuma decisão D-NN cobre isso e T-05.02 não testa o que o Header mostra ao navegar de mês no Extrato. | Acrescentar asserção sobre o Header ao teste de T-05.02, ou registrar D-NN aceitando o comportamento atual. |
| MÉDIA | 00-DECISOES.md (D-18), ORQUESTRADOR.md (seção 7) | A Definição de pronto global exige "validação real em produção com dados reais", mas o próprio ORQUESTRADOR admite que depende de deploy manual, "fora do escopo das tasks em si" — nenhuma task cobre isso com teste verificável, e deploy em produção normalmente exige aprovação humana, o que conflita com a regra "não pergunte nada". | Registrar em `00-BLOQUEIOS.md` que essa parte do D-18 é passo humano pós-F6, não critério que a execução autônoma deve fechar. |
| BAIXA | sprint-05/tasks.md (T-05.03) | `teste_funcional` do skeleton é mais genérico ("mostra os blocos do layout novo") que o equivalente T-04.06 ("sem bloco de tabela, com os dois blocos novos"). | Especificar os blocos esperados (busca, mês, abas, N linhas), no mesmo nível de detalhe de T-04.06. |
| BAIXA | base/navegacao-estrutura.md (risco), sprint-03/tasks.md | A decisão de onde mora o estado aberto/fechado do Sheet (BottomNav vs `__root.tsx`) é resolvida implicitamente pelo desenho de T-03.03, sem decisão D-NN formal registrando isso. | Registrar D-NN curta confirmando que o estado do Sheet vive em `BottomNav`. |

VEREDITO: SIM — o plano está pronto para execução autônoma.
