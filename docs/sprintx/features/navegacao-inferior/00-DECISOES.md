---
expx_schema: 1
expx_tool: sprintx
kind: decisoes
trabalho_id: navegacao-inferior
atualizado_em: 2026-10-08
decisoes:
  - id: D-01
    decisao: Escopo desta entrega e o conteudo completo das 4 abas, nao so navegacao com placeholder
    alternativa_descartada: So navegacao funcionando com placeholders, conteudo depois
    motivo: Usuario pediu explicitamente apos ver o prototipo
    status: fechada
    bloqueante: false
  - id: D-02
    decisao: Renomear abas do prototipo Dashboard para Inicio, Extrato para Parcelas, Relatorios para Caixinhas, mantem Perfil
    alternativa_descartada: Manter os nomes originais do prototipo Stitch
    motivo: Pedido explicito do usuario
    status: fechada
    bloqueante: false
  - id: D-03
    decisao: Categorizacao de despesas (Despesas por categoria da referencia) fica fora do escopo desta entrega
    alternativa_descartada: Incluir categoria em cada despesa e secao de barras por categoria
    motivo: Usuario escolheu adiar, campo novo exige definicao propria de categorias
    status: fechada
    bloqueante: false
  - id: D-04
    decisao: Secao Metas (checklist) e cards de onboarding/resumo da referencia ficam fora do escopo
    alternativa_descartada: Replicar a referencia 1 para 1, incluindo Metas e cards de progresso do mes
    motivo: Referencia serviu so para entender a ideia de Parcelas e Caixinhas, nao para copiar a tela inteira
    status: fechada
    bloqueante: false
  - id: D-05
    decisao: Parcelamento e criado via checkbox Parcelado dentro do modal de Despesa ja existente
    alternativa_descartada: Tela ou fluxo de cadastro proprio separado para parcelamento
    motivo: Usuario descreveu assim explicitamente
    status: fechada
    bloqueante: false
  - id: D-06
    decisao: Campo Valor do formulario, quando parcelado, representa o valor total da divida, dividido pela quantidade de parcelas
    alternativa_descartada: Valor por parcela digitado direto pelo usuario
    motivo: Usuario confirmou esse modelo mesmo apos ver a referencia mostrar o oposto
    status: fechada
    bloqueante: false
  - id: D-07
    decisao: Cada parcela gerada vira uma Despesa normal, soma na lista e no card Despesa da tela Inicio
    alternativa_descartada: Parcelas ficam isoladas, fora da lista geral de Despesa
    motivo: Usuario confirmou
    status: fechada
    bloqueante: false
  - id: D-08
    decisao: Vencimento de cada parcela e mensal automatico a partir da data informada, mesmo dia, mais um mes por parcela
    alternativa_descartada: Usuario informar a data de cada parcela manualmente
    motivo: Usuario confirmou
    status: fechada
    bloqueante: false
  - id: D-09
    decisao: Data de emissao e igual para todas as parcelas do grupo, a data da compra original informada no formulario
    alternativa_descartada: Data de emissao tambem incrementa mes a mes junto com o vencimento
    motivo: Inferencia tecnica razoavel sobre o que o usuario descreveu, sem pedido em contrario
    status: fechada
    bloqueante: false
  - id: D-10
    decisao: Card de parcelamento na aba Parcelas mostra descricao, badge X/N, valor total da divida, Pago e Falta em reais, barra de progresso percentual
    alternativa_descartada: Layout da referencia (valor por parcela, sem pago e falta em reais, so periodo de datas)
    motivo: Usuario optou explicitamente por manter o que tinha descrito antes de ver a referencia
    status: fechada
    bloqueante: false
  - id: D-11
    decisao: Pago e Falta sao derivados de um campo novo paga (booleano) em cada Despesa, nao sao calculados pela data de vencimento
    alternativa_descartada: Parcela conta como paga automaticamente quando a data de vencimento ja passou
    motivo: Usuario quer controle manual de pagamento, nao automatico por data
    status: fechada
    bloqueante: false
  - id: D-12
    decisao: Marcar uma despesa como paga acontece na tela Inicio, ao clicar numa linha da lista de Despesa, abrindo popup de confirmacao
    alternativa_descartada: Marcar como paga dentro da propria aba Parcelas
    motivo: Usuario esclareceu que a aba Parcelas e so acompanhamento, sem acao de marcar pago
    status: fechada
    bloqueante: false
  - id: D-13
    decisao: Aba Caixinhas tem conteudo completo nesta entrega, com criar, depositar, resgatar e excluir
    alternativa_descartada: So placeholder nesta entrega, conteudo real depois
    motivo: Usuario pediu conteudo completo das 4 abas
    status: fechada
    bloqueante: false
  - id: D-14
    decisao: Caixinha tem os campos nome, valorGuardado e meta
    alternativa_descartada: So nome e valor guardado, sem meta
    motivo: Usuario escolheu incluir meta, bate com a referencia visual
    status: fechada
    bloqueante: false
  - id: D-15
    decisao: Deposito e resgate em caixinha sao um lancamento separado, que nao vira Despesa nem aparece na lista de Despesa
    alternativa_descartada: Deposito gera uma Despesa comum, com descricao tipo Caixinha Viagem
    motivo: Usuario escolheu manter separado do modelo de Despesa existente
    status: fechada
    bloqueante: false
  - id: D-16
    decisao: saldoAcumulado da tela Inicio passa a ser Receita menos Despesa menos o total guardado em todas as Caixinhas
    alternativa_descartada: saldoAcumulado continua sendo so Receita menos Despesa, Caixinhas aparecem so na propria aba
    motivo: Usuario escolheu descontar, reflete o dinheiro realmente livre
    status: fechada
    bloqueante: false
  - id: D-17
    decisao: Excluir uma caixinha devolve o valor guardado nela ao saldo acumulado geral
    alternativa_descartada: Valor guardado e descartado ao excluir a caixinha
    motivo: Usuario escolheu devolver o valor
    status: fechada
    bloqueante: false
  - id: D-18
    decisao: Tela Inicio ganha um terceiro card Guardado, soma de todas as Caixinhas, ao lado de Receita e Despesa
    alternativa_descartada: Manter so os 2 cards atuais, total guardado so dentro da aba Caixinhas
    motivo: Usuario escolheu adicionar, bate com a referencia visual
    status: fechada
    bloqueante: false
  - id: D-19
    decisao: Tela Perfil mostra nome e email ficticios fixos no codigo, somente leitura, sem avatar, telefone ou edicao
    alternativa_descartada: Incluir mais campos ficticios (avatar, telefone) ou permitir edicao
    motivo: Usuario escolheu nome e email nas perguntas da descoberta; leitura sem edicao foi apresentada no plano aprovado sem objecao
    status: fechada
    bloqueante: false
  - id: D-20
    decisao: LancamentosProvider (e o novo estado de Caixinhas) sobe para o root (__root.tsx) para todas as abas compartilharem o mesmo estado
    alternativa_descartada: Manter o provider dentro da rota index, duplicando ou isolando estado por rota
    motivo: Necessidade tecnica identificada na base da F1 (src/routes/index.tsx:15-18), sem alternativa viavel para compartilhar estado entre abas
    status: fechada
    bloqueante: false
  - id: D-21
    decisao: O FAB Registrar e o padding inferior das telas sao ajustados para nao sobrepor a nova barra de navegacao fixa
    alternativa_descartada: Manter o posicionamento atual do FAB (bottom-6) e do padding (pb-28)
    motivo: Consequencia direta de adicionar um elemento fixo novo na mesma regiao da tela, identificado na base da F1
    status: fechada
    bloqueante: false
  - id: D-22
    decisao: Novas rotas /parcelas, /caixinhas e /perfil sao registradas em src/router.tsx via addChildren, seguindo o padrao ja existente em codigo
    alternativa_descartada: Adotar roteamento baseado em arquivo (plugin novo do TanStack Router)
    motivo: Projeto ja usa rotas declaradas em codigo, manter consistencia com o que existe
    status: fechada
    bloqueante: false
  - id: D-23
    decisao: Barra de navegacao inferior fixa com 4 itens, aba ativa em text-primary, inativas em text-muted-foreground, icones da lib lucide-react ja instalada
    alternativa_descartada: Criar paleta ou iconografia nova so para a navegacao
    motivo: Reaproveita o design system e a lib de icones ja em uso no projeto
    status: fechada
    bloqueante: false
---

# Decisões — navegacao-inferior

> Uma linha por decisão tomada no planejamento (F2 e, excepcionalmente, F3). Formato fixo. Não apague decisões: uma decisão revertida ganha nova linha que cita a anterior.

## Decisões

```
D-01 | Escopo desta entrega é o conteúdo completo das 4 abas, não só navegação com placeholder | Só navegação funcionando com placeholders, conteúdo depois | Usuário pediu explicitamente após ver o protótipo
D-02 | Renomear abas do protótipo: Dashboard → Início, Extrato → Parcelas, Relatórios → Caixinhas, mantém Perfil | Manter os nomes originais do protótipo Stitch | Pedido explícito do usuário
D-03 | Categorização de despesas fica fora do escopo desta entrega | Incluir categoria em cada despesa e seção de barras por categoria | Usuário escolheu adiar, campo novo exige definição própria de categorias
D-04 | Seção Metas (checklist) e cards de onboarding/resumo da referência ficam fora do escopo | Replicar a referência 1 para 1, incluindo Metas e cards de progresso do mês | Referência serviu só para entender a ideia de Parcelas e Caixinhas, não para copiar a tela inteira
D-05 | Parcelamento é criado via checkbox "Parcelado?" dentro do modal de Despesa já existente | Tela ou fluxo de cadastro próprio separado para parcelamento | Usuário descreveu assim explicitamente
D-06 | Campo Valor do formulário, quando parcelado, representa o valor TOTAL da dívida, dividido pela quantidade de parcelas | Valor por parcela digitado direto pelo usuário | Usuário confirmou esse modelo mesmo após ver a referência mostrar o oposto
D-07 | Cada parcela gerada vira uma Despesa normal, soma na lista e no card Despesa da tela Início | Parcelas ficam isoladas, fora da lista geral de Despesa | Usuário confirmou
D-08 | Vencimento de cada parcela é mensal automático a partir da data informada, mesmo dia, +1 mês por parcela | Usuário informar a data de cada parcela manualmente | Usuário confirmou
D-09 | Data de emissão é igual para todas as parcelas do grupo, a data da compra original | Data de emissão também incrementa mês a mês junto com o vencimento | Inferência técnica razoável, sem pedido em contrário
D-10 | Card de parcelamento mostra descrição, badge X/N, valor total da dívida, Pago/Falta em R$, barra de progresso | Layout da referência (valor por parcela, sem Pago/Falta em R$, só período de datas) | Usuário optou por manter o que tinha descrito antes de ver a referência
D-11 | Pago/Falta são derivados de um campo novo `paga` (booleano) em cada Despesa, não da data de vencimento | Parcela conta como paga automaticamente quando a data de vencimento já passou | Usuário quer controle manual de pagamento, não automático por data
D-12 | Marcar uma despesa como paga acontece na tela Início, ao clicar numa linha da lista de Despesa, abrindo popup de confirmação | Marcar como paga dentro da própria aba Parcelas | Usuário esclareceu que a aba Parcelas é só acompanhamento, sem ação de marcar pago
D-13 | Aba Caixinhas tem conteúdo completo nesta entrega: criar, depositar, resgatar e excluir | Só placeholder nesta entrega, conteúdo real depois | Usuário pediu conteúdo completo das 4 abas
D-14 | Caixinha tem os campos nome, valorGuardado e meta | Só nome e valor guardado, sem meta | Usuário escolheu incluir meta, bate com a referência visual
D-15 | Depósito e resgate em caixinha são um lançamento separado, que não vira Despesa nem aparece na lista de Despesa | Depósito gera uma Despesa comum, com descrição tipo "Caixinha: Viagem" | Usuário escolheu manter separado do modelo de Despesa existente
D-16 | saldoAcumulado da tela Início passa a ser Receita − Despesa − total guardado em todas as Caixinhas | saldoAcumulado continua sendo só Receita − Despesa, Caixinhas aparecem só na própria aba | Usuário escolheu descontar, reflete o dinheiro realmente livre
D-17 | Excluir uma caixinha devolve o valor guardado nela ao saldo acumulado geral | Valor guardado é descartado ao excluir a caixinha | Usuário escolheu devolver o valor
D-18 | Tela Início ganha um 3º card "Guardado", soma de todas as Caixinhas, ao lado de Receita e Despesa | Manter só os 2 cards atuais, total guardado só dentro da aba Caixinhas | Usuário escolheu adicionar, bate com a referência visual
D-19 | Tela Perfil mostra nome e e-mail fictícios fixos no código, somente leitura | Incluir mais campos fictícios (avatar, telefone) ou permitir edição | Usuário escolheu nome e e-mail nas perguntas; leitura sem edição foi apresentada no plano aprovado sem objeção
D-20 | LancamentosProvider (e o novo estado de Caixinhas) sobe para o root (`__root.tsx`) para todas as abas compartilharem o mesmo estado | Manter o provider dentro da rota index, duplicando ou isolando estado por rota | Necessidade técnica identificada na base da F1 (`src/routes/index.tsx:15-18`), sem alternativa viável
D-21 | O FAB Registrar e o padding inferior das telas são ajustados para não sobrepor a nova barra de navegação fixa | Manter o posicionamento atual do FAB (`bottom-6`) e do padding (`pb-28`) | Consequência direta de adicionar um elemento fixo novo na mesma região da tela, identificado na base da F1
D-22 | Novas rotas `/parcelas`, `/caixinhas` e `/perfil` são registradas em `src/router.tsx` via `addChildren`, seguindo o padrão já existente | Adotar roteamento baseado em arquivo (plugin novo do TanStack Router) | Projeto já usa rotas declaradas em código, manter consistência
D-23 | Barra de navegação inferior fixa com 4 itens, aba ativa em `text-primary`, inativas em `text-muted-foreground`, ícones da lib `lucide-react` já instalada | Criar paleta ou iconografia nova só para a navegação | Reaproveita o design system e a lib de ícones já em uso no projeto
```

## Pendências

Nenhuma pendência.
