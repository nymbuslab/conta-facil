---
expx_schema: 1
expx_tool: sprintx
kind: sprint
trabalho_id: seguranca-dependencias
sprint_id: sprint-02
titulo: Correcao e validacao da arvore
status: concluido
criterio_saida: Build lint testes e validacao visual passam sem vulnerabilidade alta ou critica
fases: [F-02.1, F-02.2]
riscos: [Tailwind 4 pode alterar CSS sem erro de compilacao, Drizzle Kit pode manter alerta moderado transitivo]
atualizado_em: 2026-10-11
---

# Sprint 02 - Correção e validação da árvore

## Objetivo

Migrar o Tailwind para a linha segura, atualizar somente dependências compatíveis e provar que a aplicação preserva comportamento e visual.

## Fases

| Fase | Título | Roda em paralelo com |
|---|---|---|
| F-02.1 | Migração Tailwind | nenhuma |
| F-02.2 | Auditoria e validação | nenhuma |

## Critério de saída

Build, lint, testes e validação visual passam sem vulnerabilidade alta ou crítica.

## Riscos conhecidos

- Tailwind 4 pode alterar CSS sem erro de compilação.
- Drizzle Kit pode manter alerta moderado transitivo sem correção compatível.
