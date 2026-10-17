---
expx_schema: 1
expx_tool: sprintx
kind: decisoes
trabalho_id: dashboard-extrato
atualizado_em: 2026-10-17
decisoes:
  - id: D-01
    decisao: Início deixa de registrar lançamento e vira dashboard; Extrato assume registro e consulta
    alternativa_descartada: Manter o registro de lançamento no Início
    motivo: Separar claramente olhar o mês de registrar ou consultar lançamentos
    status: fechada
    bloqueante: false
  - id: D-02
    decisao: Navegação inferior passa a 5 itens (Início, Extrato, Parcelas, Caixinhas, Mais); Perfil sai da barra inferior
    alternativa_descartada: Manter 4 itens, substituindo a posição do Início
    motivo: Reservar espaço para itens futuros sem lotar a barra inferior
    status: fechada
    bloqueante: false
  - id: D-03
    decisao: Nome da nova tela de lançamentos é Extrato, rota src/routes/extrato.tsx
    alternativa_descartada: Lançamentos, Receita, Gastos, Movimentos
    motivo: Extrato cobre receita e despesa sem enviesar para um lado só, termo bancário já familiar
    status: fechada
    bloqueante: false
  - id: D-04
    decisao: Dashboard mantém os 4 cards atuais e adiciona Contas vencendo (até 3 despesas não pagas vencendo em 3 dias, ver mais leva ao Extrato na aba Despesas) e Últimos lançamentos (5 itens, receita e despesa misturados, ver mais leva ao Extrato); sem FAB no dashboard
    alternativa_descartada: Incluir resumo de caixinhas ou de parcelamentos no dashboard
    motivo: Escopo fechado pelo usuário na etapa de design (impeccable shape)
    status: fechada
    bloqueante: false
  - id: D-05
    decisao: Extrato tem busca, navegador de mês, abas Receita e Despesas, e o botão de registrar (FAB)
    alternativa_descartada: Manter as duas listas empilhadas como hoje no Início
    motivo: Layout desenhado explicitamente pelo usuário na etapa de design
    status: fechada
    bloqueante: false
  - id: D-06
    decisao: Contas vencendo é resolvido por endpoint ou parâmetro novo no backend, ordenado por vencimento, filtrando despesas não pagas numa janela de dias
    alternativa_descartada: Calcular no cliente a partir da página já carregada do mês
    motivo: A listagem atual ordena por criadoEm, não garante achar a despesa certa nem cobre vencimento no mês seguinte
    status: fechada
    bloqueante: false
  - id: D-07
    decisao: Últimos lançamentos é resolvido por um novo modo de GET /lancamentos que aceita tipo omitido, mistura receita e despesa, ordena por mais recente, limite 5
    alternativa_descartada: Duas chamadas, uma por tipo, mescladas no cliente
    motivo: Evita chamadas duplicadas e lógica de merge no frontend
    status: fechada
    bloqueante: false
  - id: D-08
    decisao: Dashboard trava sempre no mês vigente, sem navegação de mês própria; a navegação de mês vive só no Extrato
    alternativa_descartada: Dashboard manter um controle de mês próprio, independente do Extrato
    motivo: Simplicidade, o dashboard é para olhar rápido, não para explorar histórico
    status: fechada
    bloqueante: false
  - id: D-09
    decisao: Painel lateral Mais é um componente novo construído sobre @radix-ui/react-dialog, estilizado como gaveta lateral, sem dependência nova
    alternativa_descartada: Biblioteca dedicada de drawer, como vaul
    motivo: Reusa dependência já existente no projeto
    status: fechada
    bloqueante: false
  - id: D-10
    decisao: O menu Mais replica a navegação principal (Início, Extrato, Parcelas, Caixinhas) mais Perfil e Sair, não é só um extra
    alternativa_descartada: Menu com só os itens que não cabem na barra inferior
    motivo: Usuário quer um lugar único para acessar tudo, inclusive itens que já estão na barra inferior
    status: fechada
    bloqueante: false
  - id: D-11
    decisao: Categorias não aparece no menu Mais nesta entrega, só entra quando a funcionalidade existir de fato
    alternativa_descartada: Aparecer desabilitada como em breve
    motivo: Menu só mostra o que funciona hoje
    status: fechada
    bloqueante: false
  - id: D-12
    decisao: Sair no menu lateral executa logout direto, sem precisar passar pela tela Perfil
    alternativa_descartada: Sair como atalho que abre a rota /perfil
    motivo: Acesso rápido ao logout a partir de qualquer tela
    status: fechada
    bloqueante: false
  - id: D-13
    decisao: Perfil dentro do menu lateral é um link que navega para a rota /perfil existente, fechando o painel ao navegar; a rota e sua lógica de logout não são reescritas
    alternativa_descartada: Embutir o conteúdo do perfil direto dentro do painel lateral
    motivo: Evita duplicar a lógica de logout já existente em perfil.tsx
    status: fechada
    bloqueante: false
  - id: D-14
    decisao: As abas Receita e Despesas do Extrato são dois Button alternando a lista exibida, sem novo primitivo de Tabs
    alternativa_descartada: Adicionar @radix-ui/react-tabs como componente reutilizável novo
    motivo: Evita dependência e componente novos só para esta feature
    status: fechada
    bloqueante: false
  - id: D-15
    decisao: Observabilidade dos endpoints novos (Contas vencendo, Últimos lançamentos) segue o mesmo padrão das rotas de lançamento existentes, sem log de negócio novo
    alternativa_descartada: Log ou métrica específica para os dois endpoints novos
    motivo: Consistência com o resto da Function, sem necessidade identificada de observabilidade extra
    status: fechada
    bloqueante: false
  - id: D-16
    decisao: Erro ao buscar Contas vencendo ou Últimos lançamentos segue o mesmo padrão de erro já usado no app, sem travar o resto do dashboard
    alternativa_descartada: Comportamento de erro diferente e específico para esses dois cards
    motivo: Consistência com o padrão de erro do Início e das Caixinhas hoje
    status: fechada
    bloqueante: false
  - id: D-17
    decisao: Esta entrega não cria nenhuma variável de ambiente, segredo ou integração externa nova
    alternativa_descartada: null
    motivo: É uma reestruturação interna de UI mais dois endpoints novos sobre o Postgres já existente
    status: fechada
    bloqueante: false
  - id: D-18
    decisao: Definição de pronto inclui validação visual no navegador (desktop e mobile) das duas telas e validação real em produção com dados reais da conta do usuário, além de build e suíte verdes
    alternativa_descartada: Considerar pronto só com build e suíte verdes
    motivo: Usuário quer confirmar os dois cards novos com dados reais antes de aceitar a entrega
    status: fechada
    bloqueante: false
---

# Decisões — dashboard-extrato

> Uma linha por decisão tomada no planejamento (F2 e, excepcionalmente, F3). Formato fixo. Não apague decisões: uma decisão revertida ganha nova linha que cita a anterior.

## Decisões

```
D-01 | Início deixa de registrar lançamento e vira dashboard; Extrato assume registro e consulta | Manter o registro de lançamento no Início | Separar claramente olhar o mês de registrar ou consultar lançamentos
D-02 | Navegação inferior passa a 5 itens (Início, Extrato, Parcelas, Caixinhas, Mais); Perfil sai da barra inferior | Manter 4 itens, substituindo a posição do Início | Reservar espaço para itens futuros sem lotar a barra inferior
D-03 | Nome da nova tela de lançamentos é Extrato, rota src/routes/extrato.tsx | Lançamentos, Receita, Gastos, Movimentos | Extrato cobre receita e despesa sem enviesar para um lado só, termo bancário já familiar
D-04 | Dashboard mantém os 4 cards atuais e adiciona Contas vencendo (até 3 despesas não pagas vencendo em 3 dias, ver mais leva ao Extrato na aba Despesas) e Últimos lançamentos (5 itens, receita e despesa misturados, ver mais leva ao Extrato); sem FAB no dashboard | Incluir resumo de caixinhas ou de parcelamentos no dashboard | Escopo fechado pelo usuário na etapa de design (impeccable shape)
D-05 | Extrato tem busca, navegador de mês, abas Receita e Despesas, e o botão de registrar (FAB) | Manter as duas listas empilhadas como hoje no Início | Layout desenhado explicitamente pelo usuário na etapa de design
D-06 | Contas vencendo é resolvido por endpoint ou parâmetro novo no backend, ordenado por vencimento, filtrando despesas não pagas numa janela de dias | Calcular no cliente a partir da página já carregada do mês | A listagem atual ordena por criadoEm, não garante achar a despesa certa nem cobre vencimento no mês seguinte
D-07 | Últimos lançamentos é resolvido por um novo modo de GET /lancamentos que aceita tipo omitido, mistura receita e despesa, ordena por mais recente, limite 5 | Duas chamadas, uma por tipo, mescladas no cliente | Evita chamadas duplicadas e lógica de merge no frontend
D-08 | Dashboard trava sempre no mês vigente, sem navegação de mês própria; a navegação de mês vive só no Extrato | Dashboard manter um controle de mês próprio, independente do Extrato | Simplicidade, o dashboard é para olhar rápido, não para explorar histórico
D-09 | Painel lateral Mais é um componente novo construído sobre @radix-ui/react-dialog, estilizado como gaveta lateral, sem dependência nova | Biblioteca dedicada de drawer, como vaul | Reusa dependência já existente no projeto
D-10 | O menu Mais replica a navegação principal (Início, Extrato, Parcelas, Caixinhas) mais Perfil e Sair, não é só um extra | Menu com só os itens que não cabem na barra inferior | Usuário quer um lugar único para acessar tudo, inclusive itens que já estão na barra inferior
D-11 | Categorias não aparece no menu Mais nesta entrega, só entra quando a funcionalidade existir de fato | Aparecer desabilitada como em breve | Menu só mostra o que funciona hoje
D-12 | Sair no menu lateral executa logout direto, sem precisar passar pela tela Perfil | Sair como atalho que abre a rota /perfil | Acesso rápido ao logout a partir de qualquer tela
D-13 | Perfil dentro do menu lateral é um link que navega para a rota /perfil existente, fechando o painel ao navegar; a rota e sua lógica de logout não são reescritas | Embutir o conteúdo do perfil direto dentro do painel lateral | Evita duplicar a lógica de logout já existente em perfil.tsx
D-14 | As abas Receita e Despesas do Extrato são dois Button alternando a lista exibida, sem novo primitivo de Tabs | Adicionar @radix-ui/react-tabs como componente reutilizável novo | Evita dependência e componente novos só para esta feature
D-15 | Observabilidade dos endpoints novos (Contas vencendo, Últimos lançamentos) segue o mesmo padrão das rotas de lançamento existentes, sem log de negócio novo | Log ou métrica específica para os dois endpoints novos | Consistência com o resto da Function, sem necessidade identificada de observabilidade extra
D-16 | Erro ao buscar Contas vencendo ou Últimos lançamentos segue o mesmo padrão de erro já usado no app, sem travar o resto do dashboard | Comportamento de erro diferente e específico para esses dois cards | Consistência com o padrão de erro do Início e das Caixinhas hoje
D-17 | Esta entrega não cria nenhuma variável de ambiente, segredo ou integração externa nova | — | É uma reestruturação interna de UI mais dois endpoints novos sobre o Postgres já existente
D-18 | Definição de pronto inclui validação visual no navegador (desktop e mobile) das duas telas e validação real em produção com dados reais da conta do usuário, além de build e suíte verdes | Considerar pronto só com build e suíte verdes | Usuário quer confirmar os dois cards novos com dados reais antes de aceitar a entrega
```

## Pendências

Nenhuma pendência.
