---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: seguranca-dependencias
sprint_id: sprint-02
atualizado_em: 2026-10-11
tasks:
  - id: T-02.01
    titulo: Migrar Tailwind para v4
    fase: F-02.1
    status: concluida
    objetivo: Substituir a configuracao v3 pelo plugin Vite e tema CSS-first preservando o design e as animacoes existentes
    arquivos:
      cria: [src/test/tailwind-config.test.ts]
      altera: [package.json, package-lock.json, vite.config.ts, components.json, src/index.css, tailwind.config.ts, postcss.config.js]
    teste_integracao: Executa npm run build e o teste de configuracao que exige plugin Vite import CSS-first tw-animate-css e ausencia das diretivas e do plugin de animacao v3
    teste_funcional: Confere nominalmente border input ring background foreground e os pares primary secondary destructive muted accent popover card success warning info em root e dark alem de duas fontes tres raios quatro animacoes e todas as utilidades usadas pelo Dialog
    criterio_aceite: Build passa e o teste confirma 25 mapeamentos de cor em root e dark duas fontes tres raios quatro animacoes com keyframes e as utilidades animate-in animate-out fade zoom e slide usadas pelo Dialog
    origem: [D-01, D-02]
    depende_de: []
    paralelizavel: false
    concluida_em: 2026-10-11
    suite: verde
  - id: T-02.02
    titulo: Resolver arvore auditavel
    fase: F-02.2
    status: concluida
    objetivo: Atualizar dependencias compativeis e registrar alertas residuais sem force ou downgrade
    arquivos:
      cria: [docs/sprintx/features/seguranca-dependencias/RISCO-RESIDUAL.md]
      altera: [package.json, package-lock.json]
    teste_integracao: Executa npm audit --json de forma independente npm run audit:security e npm ls drizzle-kit esbuild sem usar force override ou downgrade
    teste_funcional: Confere zero alertas altos e criticos e exige pacote advisory impacto exposicao e justificativa para cada moderado residual
    criterio_aceite: O audit direto e o verificador confirmam zero alto ou critico e RISCO-RESIDUAL.md cobre todo moderado restante
    origem: [D-03, D-04]
    depende_de: [T-02.01]
    paralelizavel: false
    concluida_em: 2026-10-11
    suite: verde
  - id: T-02.03
    titulo: Validar interface existente
    fase: F-02.2
    status: concluida
    objetivo: Provar que a migracao de build nao alterou os fluxos e a aparencia principal
    arquivos:
      cria: [docs/sprintx/features/seguranca-dependencias/evidencias/tailwind-v4/]
      altera: [docs/sprintx/features/seguranca-dependencias/VALIDACAO-VISUAL.md]
    teste_integracao: Executa npm run lint npm run test -- --run e npm run build e confirma zero erro no console do navegador
    teste_funcional: Repete os 16 casos v3 com os mesmos marcadores dados foco Tab ShiftTab Esc e overflow em 390x844 e 1440x900 e grava imagens v4 persistentes
    criterio_aceite: VALIDACAO-VISUAL.md registra 16 pares v3 e v4; para cada marcador compara retangulo com tolerancia maxima de 2 px, exige igualdade de cor fundo borda raio tamanho de fonte e alvo de foco, zero overflow horizontal e imagens em evidencias/tailwind-v4
    origem: [D-01, D-02, D-03]
    depende_de: [T-02.02]
    paralelizavel: false
    concluida_em: 2026-10-11
    suite: verde
---

# Tasks - Sprint 02

## T-02.01

```yaml
id: T-02.01
titulo: Migrar Tailwind para v4
objetivo: Substituir a configuração v3 pelo plugin Vite e tema CSS-first preservando o design e as animações existentes
arquivos:
  cria: [src/test/tailwind-config.test.ts]
  altera: [package.json, package-lock.json, vite.config.ts, components.json, src/index.css, tailwind.config.ts, postcss.config.js]
teste_integracao: Executa build e teste de plugin Vite import CSS-first tw-animate-css e ausência das diretivas e do plugin de animação v3
teste_funcional: Confere nominalmente cinco cores simples dez pares em root e dark duas fontes três raios quatro animações e as utilidades animate-in animate-out fade zoom e slide usadas pelo Dialog
criterio_aceite: Build passa e o teste confirma 25 mapeamentos em root e dark duas fontes três raios quatro animações e as utilidades do Dialog
origem: [D-01, D-02]
depende_de: []
paralelizavel: false
status: concluida
```

## T-02.02

```yaml
id: T-02.02
titulo: Resolver arvore auditavel
objetivo: Atualizar dependências compatíveis e registrar alertas residuais sem force ou downgrade
arquivos:
  cria: [docs/sprintx/features/seguranca-dependencias/RISCO-RESIDUAL.md]
  altera: [package.json, package-lock.json]
teste_integracao: Executa audit direto verificador e npm ls sem force override ou downgrade
teste_funcional: Confere zero alto ou crítico e relatório estruturado para cada moderado
criterio_aceite: Audit direto e verificador confirmam zero alto ou crítico e o relatório cobre os moderados
origem: [D-03, D-04]
depende_de: [T-02.01]
paralelizavel: false
status: concluida
```

## T-02.03

```yaml
id: T-02.03
titulo: Validar interface existente
objetivo: Provar que a migração de build não alterou fluxos e aparência
arquivos:
  cria: [docs/sprintx/features/seguranca-dependencias/evidencias/tailwind-v4/]
  altera: [docs/sprintx/features/seguranca-dependencias/VALIDACAO-VISUAL.md]
teste_integracao: Executa lint Vitest em modo run build e confirma zero erro no console
teste_funcional: Repete os 16 casos com mesmos marcadores dados foco teclado e overflow em dois viewports
criterio_aceite: VALIDACAO-VISUAL.md registra 16 pares v3 e v4 com retângulos dos marcadores dentro de 2 px, cores fundo borda raio fonte e foco iguais, zero overflow horizontal e imagens persistentes
origem: [D-01, D-02, D-03]
depende_de: [T-02.02]
paralelizavel: false
status: concluida
```
