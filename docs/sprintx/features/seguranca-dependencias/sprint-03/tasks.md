---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: seguranca-dependencias
sprint_id: sprint-03
atualizado_em: 2026-10-12
tasks:
  - id: T-03.01
    titulo: Testar CSS compilado
    fase: F-03.1
    status: concluida
    objetivo: Garantir que as utilidades criticas de animacao e variantes de estado existem no CSS produzido pelo Vite
    arquivos:
      altera: [src/test/tailwind-config.test.ts]
    teste_integracao: Executa o build programatico do Vite sem gravar artefatos e inspeciona o CSS emitido
    teste_funcional: Exige animate-in animate-out fade zoom slide e variantes data-state usadas pelo Dialog
    criterio_aceite: O teste falha se uma classe critica deixar de ser emitida no CSS final
    origem: [C-01]
    depende_de: []
    paralelizavel: false
    concluida_em: 2026-10-12
    suite: verde
  - id: T-03.02
    titulo: Medir pares visuais
    fase: F-03.1
    status: concluida
    objetivo: Registrar evidencia numerica por par para sustentar a comparacao visual Tailwind 3 e 4
    arquivos:
      altera: [docs/sprintx/features/seguranca-dependencias/VALIDACAO-VISUAL.md]
    teste_integracao: Mede os 16 marcadores entre o commit baseline com DOM e Tailwind 3 originais e a arvore atual com Tailwind 4 apos estabilizar animacoes
    teste_funcional: Registra retangulos cor fundo borda raio fonte familia peso foco teclado overflow e console
    criterio_aceite: Os 16 pares possuem delta maximo de ate 2 px e propriedades computadas equivalentes
    origem: [C-02]
    depende_de: [T-03.01]
    paralelizavel: false
    concluida_em: 2026-10-12
    suite: verde
---

# Tasks - Sprint 03

## T-03.01

```yaml
id: T-03.01
titulo: Testar CSS compilado
objetivo: Garantir que as utilidades críticas existem no CSS produzido pelo Vite
teste_integracao: Build programático do Vite sem escrita e inspeção do CSS emitido
criterio_aceite: O teste falha se uma classe crítica deixar de ser emitida
origem: [C-01]
status: concluida
```

## T-03.02

```yaml
id: T-03.02
titulo: Medir pares visuais
objetivo: Registrar evidência numérica por par para a comparação Tailwind 3 e 4
teste_integracao: Mede 16 marcadores após estabilizar animações
criterio_aceite: Delta de até 2 px e propriedades computadas equivalentes em todos os pares
origem: [C-02]
status: concluida
```
