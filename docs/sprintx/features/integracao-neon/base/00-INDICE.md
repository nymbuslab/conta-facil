---
expx_schema: 1
expx_tool: sprintx
kind: base_indice
trabalho_id: integracao-neon
atualizado_em: 2026-10-10
areas:
  - arquivo: neon-auth.md
    titulo: Neon Auth (Managed Better Auth)
    lacunas: 1
  - arquivo: neon-data-api-e-postgres.md
    titulo: Neon Data API e Lakebase Postgres
    lacunas: 1
  - arquivo: neon-object-storage.md
    titulo: Neon Object Storage (bucket documentos)
    lacunas: 2
  - arquivo: contextos-de-estado-atuais.md
    titulo: Contextos de estado atuais (lancamentos e caixinhas)
    lacunas: 0
  - arquivo: perfil-mock-e-testes.md
    titulo: Perfil mockado e convencoes de teste
    lacunas: 1
---

# Índice da base — integracao-neon

> Criado na F1 com `areas: []` e atualizado a cada arquivo de base gravado. Uma linha por área estudada.
> A lista `areas:` do frontmatter espelha esta lista: `arquivo` (nome dentro de `base/`, sem diretório), `titulo` e `lacunas` (quantas lacunas daquela área estão em `00-LACUNAS.md`, `0` se nenhuma). Formato em `references/00-schema.md`.

| Arquivo | Área | Resumo |
|---|---|---|
| `neon-auth.md` | Neon Auth (Managed Better Auth) | Como ativar login/sessão gerenciados pelo Neon, métodos suportados e limites do plugin fixo. |
| `neon-data-api-e-postgres.md` | Neon Data API e Lakebase Postgres | Como conectar ao Postgres da branch e o risco de a Data API não ser o caminho recomendado para um app novo como o Conta Fácil. |
| `neon-object-storage.md` | Neon Object Storage (bucket documentos) | Bucket privado já declarado em `neon.ts` sem nenhum consumo identificado no código hoje. |
| `contextos-de-estado-atuais.md` | Contextos de estado atuais (lançamentos e caixinhas) | Contrato atual de `LancamentosProvider`/`CaixinhasProvider` que a migração para Neon precisa preservar ou decidir romper. |
| `perfil-mock-e-testes.md` | Perfil mockado e convenções de teste | O que `perfilMock` e `TelaPerfil` fazem hoje, e o padrão de teste (`renderRoute`, `renderHook`) a seguir numa tela de login nova. |
