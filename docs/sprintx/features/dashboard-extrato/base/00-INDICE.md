---
expx_schema: 1
expx_tool: sprintx
kind: base_indice
trabalho_id: dashboard-extrato
atualizado_em: 2026-10-17
areas:
  - arquivo: navegacao-estrutura.md
    titulo: Navegacao e estrutura de rotas
    lacunas: 0
  - arquivo: tela-inicio-atual.md
    titulo: Tela Inicio atual (a ser dividida)
    lacunas: 0
  - arquivo: contrato-lancamentos.md
    titulo: Contrato de lancamentos (Function + contexto React)
    lacunas: 0
  - arquivo: componentes-reutilizaveis.md
    titulo: Componentes reutilizaveis entre Inicio e Extrato
    lacunas: 0
  - arquivo: rota-perfil-atual.md
    titulo: Rota Perfil atual
    lacunas: 0
  - arquivo: design-system-aplicavel.md
    titulo: Design system aplicavel (DESIGN.md)
    lacunas: 0
---

# Índice da base — dashboard-extrato

> Criado na F1 com `areas: []` e atualizado a cada arquivo de base gravado. Uma linha por área estudada.
> A lista `areas:` do frontmatter espelha esta lista: `arquivo` (nome dentro de `base/`, sem diretório), `titulo` e `lacunas` (quantas lacunas daquela área estão em `00-LACUNAS.md`, `0` se nenhuma). Formato em `references/00-schema.md`.

| Arquivo | Área | Resumo |
|---|---|---|
| `navegacao-estrutura.md` | Navegação e rotas | `BottomNav` estático de 4 itens, sem sidebar/drawer existente; roteador por importação explícita em `router.tsx` |
| `tela-inicio-atual.md` | Tela Início atual | Composição exata a dividir entre dashboard e Extrato; cards hoje presos ao `filtros.mes` navegável |
| `contrato-lancamentos.md` | API e contexto de lançamentos | `GET /lancamentos` não ordena por vencimento nem mistura tipos — "Contas vencendo" e "Últimos lançamentos" exigem decisão de backend nova |
| `componentes-reutilizaveis.md` | Componentes a mover/dividir | `FiltrosLancamentos`/`RegistrarFab` migram sem mudança; `ListaLancamentos` precisa de modo abas para o Extrato |
| `rota-perfil-atual.md` | Rota `/perfil` | Lógica de logout própria; teste existente (`perfil.test.tsx`) verifica `BottomNav` nessa rota — quebra com a mudança de nav |
| `design-system-aplicavel.md` | Regras de design já estabelecidas | Sidebar "Mais" e abas são padrões novos, sem registro em `DESIGN.md` ainda |
