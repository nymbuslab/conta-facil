# Componentes reutilizáveis entre Início e Extrato

> Área estudada: os componentes que hoje vivem só em `index.tsx` e vão precisar ser movidos, divididos ou duplicados entre o novo Início (dashboard) e o novo Extrato.

## Contrato de entrada

- `FiltrosLancamentos` (`src/components/filtros-lancamentos.tsx:8-12`): props `mes: string`, `busca: string`, `onChange: (parcial: { mes?: string; busca?: string }) => void`. Sem acoplamento a rota — pode ser movido para `Extrato` sem alteração de assinatura.
- `ListaLancamentos` (`src/components/lista-lancamentos.tsx:92-100`): props `receitas: Receita[]`, `despesas: Despesa[]`, `temMaisReceitas?`, `temMaisDespesas?`, `carregandoMais?`, `erroCarregarMais?`, `onCarregarMaisReceitas?`, `onCarregarMaisDespesas?`. Hoje renderiza as duas seções (Receita, Despesa) **empilhadas** (`src/components/lista-lancamentos.tsx:131-162`), não em abas — o brief pede abas superiores `[Receita] [Despesas]`, que é um modo de exibição novo, não suportado pelo componente como está.
- `RegistrarFab` (`src/components/registrar-fab.tsx:8`): sem props, autocontido (estado próprio de aberto/fechado do speed dial, abre `LancamentoModal`).
- `SaldoCard` (`src/components/saldo-card.tsx:6-9`): props `titulo: 'Receita' | 'Despesa' | 'Guardado'`, `valor: number`.
- `SaldoAcumuladoBar` (`src/components/saldo-acumulado-bar.tsx:5`): prop `saldo: number`.
- `Header` (`src/components/header.tsx:4`): sem props; usa `useAuth()` e `formatarMesAno()` (sempre o mês do relógio — ver risco em `tela-inicio-atual.md`).

## Contrato de saída

NÃO DOCUMENTADO — todos renderizam JSX direto, sem valor de retorno relevante além do markup.

## Limites e cotas

`ListaLancamentos` não tem limite de itens próprio — quem decide quantos itens vêm é o chamador (`useLancamentos`, paginação por cursor). `DataTable` (`src/components/data-table.tsx:39`) não tem virtualização — renderiza todas as linhas recebidas; isso nunca foi um problema porque a paginação por cursor já limita a 5 itens por página.

## Erros conhecidos e tratamento

NÃO DOCUMENTADO.

## Riscos para a nossa implementação

- **`ListaLancamentos` precisa de um modo de abas para o Extrato.** O brief fecha em `[Receita] [Despesas]` como abas, não seções empilhadas — ou o componente ganha uma prop de modo de exibição (`variante: 'empilhado' | 'abas'`), ou nasce um componente novo para o Extrato reaproveitando `colunasReceita`/`criarColunasDespesa` e `DataTable` por baixo. Decisão de implementação, não de produto — fica para a F3.
- **`EstadoCarregandoInicio` (`src/components/estado-dados.tsx:32-49`) é desenhada para a composição atual** (barra + 3 cards + linhas de tabela) — ao dividir em duas telas, cada uma precisa do próprio skeleton fiel ao novo layout (mesmo padrão já usado para `EstadoCarregandoCaixinhas`, `estado-dados.tsx:52-59`), não reaproveitar o skeleton atual sem ajuste.
- **Nenhum componente de card "Contas vencendo" ou "Últimos lançamentos" existe hoje.** São dois componentes novos de conteúdo (não de identidade visual — DESIGN.md já cobre `Card`, cor por sinal monetário, "ver mais" como link). Cada um precisa da própria decisão de dado (ver `contrato-lancamentos.md`) antes de ter como ser implementado.
- `RegistrarFab` hoje é renderizado só em `index.tsx`. Migrar para `Extrato` é mover a linha de import/uso, sem mudança no componente.

## Fonte

`src/components/filtros-lancamentos.tsx`, `src/components/lista-lancamentos.tsx`, `src/components/registrar-fab.tsx`, `src/components/saldo-card.tsx`, `src/components/saldo-acumulado-bar.tsx`, `src/components/header.tsx`, `src/components/estado-dados.tsx` — acessado em 2026-10-17.
