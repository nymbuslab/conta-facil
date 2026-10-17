# Tela Início atual (a ser dividida)

> Área estudada: a composição exata de `src/routes/index.tsx` hoje, para separar o que fica no dashboard (novo Início) e o que migra para o Extrato.

## Contrato de entrada

`TelaPrincipal` (`src/routes/index.tsx:21-98`) não recebe props — lê direto dos contextos `useLancamentos()` (`receitas`, `despesas`, `saldoReceita`, `saldoDespesa`, `carregando`, `erro`, `recarregar`, `filtros`, `definirFiltros`, `temMaisReceitas`, `temMaisDespesas`, `carregandoMais`, `erroCarregarMais`, `carregarMaisReceitas`, `carregarMaisDespesas`) e `useCaixinhas()` (`caixinhas`, `totalGuardado`, `carregando`, `erro`, `recarregar`).

## Contrato de saída

Composição atual, de cima para baixo (`src/routes/index.tsx:58-97`):
1. `<Header />` — nome do usuário + mês/ano atual (`formatarMesAno()`, sem parâmetro — sempre o mês do relógio, não o `filtros.mes` navegável).
2. `<SaldoAcumuladoBar saldo={saldoAcumulado} />` — "Sobra prevista" (receita − despesa − guardado).
3. Grid de 3 `<SaldoCard>` (Receita / Despesa / Guardado) — os valores vêm de `saldoReceita`/`saldoDespesa` (que SÃO filtrados por `filtros.mes`, via `/lancamentos/resumo?mes=...`) e `totalGuardado` (saldo corrido, não filtra por mês).
4. `<FiltrosLancamentos mes={filtros.mes} busca={filtros.busca} onChange={definirFiltros} />` — navegação de mês (`< Mês atual >`) e busca por descrição.
5. `<ListaLancamentos receitas despesas .../>` — duas seções empilhadas (Receita, depois Despesa), cada uma com sua própria paginação por cursor e botão "Carregar mais".
6. `<RegistrarFab />` — botão flutuante que abre o modal de registrar receita/despesa.

Estados: skeleton (`EstadoCarregandoInicio`) só na primeira carga sem nenhum dado (`semDados`); tela de erro (`EstadoErro`) só quando há erro E nenhum dado ainda; depois da primeira carga, erro/carregando não substituem mais o conteúdo.

## Limites e cotas

Nenhum novo limite — reusa a paginação por cursor existente (5 itens por página, `LIMITE_PADRAO`, ver `contrato-lancamentos.md`).

## Erros conhecidos e tratamento

NÃO DOCUMENTADO — sem achado específico de bug nesta tela além do que já está registrado em `PROGRESSO.md` (nenhum pendente aberto sobre Início no momento desta ingestão).

## Riscos para a nossa implementação

- **`Header` mostra o mês do relógio, não o mês navegado.** `formatarMesAno()` sem argumento (`src/components/header.tsx:13`) sempre mostra o mês atual real, mesmo que o usuário tenha navegado para outro mês via `FiltrosLancamentos`. Hoje isso já é uma pequena inconsistência visual (o título diz "Outubro 2026" enquanto a lista mostra Setembro); separar as telas não piora nem resolve isso — mas o builder não deve copiar esse comportamento para o Extrato sem decidir explicitamente o que o cabeçalho do Extrato deve mostrar quando o usuário navegar de mês.
- **Os 4 cards do dashboard ficam presos ao mês do relógio, ou continuam navegáveis?** Se `FiltrosLancamentos` (e o estado `filtros.mes` que o acompanha) migra inteiro para o Extrato, o Início perde a capacidade de mostrar totais de um mês diferente do atual — hoje essa capacidade existe (`saldoReceita`/`saldoDespesa` respeitam `filtros.mes`). Decisão de produto necessária na F2: o dashboard trava no mês vigente (mais simples, compatível com "olhar rápido") ou mantém algum controle de mês próprio, independente do Extrato.
- **"Contas vencendo" e "Últimos lançamentos" não têm fonte de dados hoje.** `ListaLancamentos` só expõe o que já foi carregado por página (5 receitas + 5 despesas do mês filtrado, ordenado por `criadoEm` ASC — ordem de inserção, não por vencimento nem mesclando tipos). Nenhuma consulta atual devolve "despesas não pagas com vencimento nos próximos N dias" nem "últimos 5 lançamentos (receita+despesa misturados, mais recentes primeiro)" — ver `contrato-lancamentos.md` para o detalhe da API.

## Fonte

`src/routes/index.tsx`, `src/components/header.tsx` — acessado em 2026-10-17.
