---
expx_schema: 1
expx_tool: sprintx
kind: decisoes
trabalho_id: editar-excluir-lancamentos
atualizado_em: 2026-10-17
decisoes:
  - id: D-01
    decisao: escopo cobre receita e despesa
    alternativa_descartada: so despesa por agora
    motivo: usuario pediu mesma logica nos dois tipos, reaproveitando os schemas de formulario ja existentes
    status: fechada
    bloqueante: false
  - id: D-02
    decisao: despesa ja paga pode ser editada e excluida, com aviso no dialogo
    alternativa_descartada: bloquear edicao/exclusao de despesa paga
    motivo: usuario escolheu permitir, avisando que a mudanca afeta o card Total Pago
    status: fechada
    bloqueante: false
  - id: D-03
    decisao: editar ou excluir uma parcela pergunta se aplica so aquela parcela ou todas as futuras
    alternativa_descartada: aplicar sempre so a parcela clicada
    motivo: usuario quer o mesmo padrao de apps de assinatura/calendario
    status: fechada
    bloqueante: false
  - id: D-04
    decisao: receita vinda de deposito de fora em caixinha fica bloqueada para editar/excluir, com aviso no dialogo
    alternativa_descartada: permitir e propagar a mudanca para a caixinha
    motivo: evita desincronizar o saldo guardado sem construir a logica de reversao agora
    status: fechada
    bloqueante: false
  - id: D-05
    decisao: campos editaveis sao os mesmos do formulario de criacao (descricao, valor, e data de entrada ou vencimento)
    alternativa_descartada: so descricao e valor, data fixa
    motivo: usuario quer paridade completa com o formulario de criar
    status: fechada
    bloqueante: false
  - id: D-06
    decisao: um dialogo so com menu de acoes (marcar como paga, editar, excluir) abre ao clicar na linha e troca de conteudo conforme a acao escolhida
    alternativa_descartada: dialogos separados por acao, cada um com gatilho proprio
    motivo: reaproveita o clique na linha ja existente e evita poluir o card com mais de um elemento visual
    status: fechada
    bloqueante: false
  - id: D-07
    decisao: exclusao se confirma com botao vermelho que nomeia a consequencia (acao nao pode ser desfeita)
    alternativa_descartada: exigir digitar a descricao ou a palavra excluir
    motivo: segue a regra ja fechada do projeto (regras-design) sem adicionar friccao extra num app de uso diario
    status: fechada
    bloqueante: false
  - id: D-08
    decisao: editar e excluir usam o mesmo padrao de idempotencia do POST de criacao (executarComIdempotencia)
    alternativa_descartada: sem idempotencia, igual ao PATCH /pagar hoje
    motivo: protege contra retry de rede duplicar ou corromper uma edicao
    status: fechada
    bloqueante: false
  - id: D-09
    decisao: auditoria/historico de edicao fica fora de escopo desta feature
    alternativa_descartada: registrar quem editou o que e quando
    motivo: app de uso pessoal, sem historico de edicao em nenhum lugar do sistema hoje
    status: fechada
    bloqueante: false
  - id: D-10
    decisao: definicao de pronto inclui a tela Parcelas refletindo edicao/exclusao de parcela
    alternativa_descartada: so o Extrato, sem conferir a tela Parcelas
    motivo: parcela editada/excluida muda os agregados que a tela Parcelas mostra (parcelasPagas, valorTotal, valorPago)
    status: fechada
    bloqueante: false
---

# Decisões — editar-excluir-lancamentos

> Uma linha por decisão tomada no planejamento (F2 e, excepcionalmente, F3). Formato fixo. Não apague decisões: uma decisão revertida ganha nova linha que cita a anterior.

## Decisões

```
D-01 | Escopo cobre receita e despesa | Só despesa por agora | Usuário pediu mesma lógica nos dois tipos, reaproveitando os schemas de formulário já existentes
D-02 | Despesa já paga pode ser editada e excluída, com aviso no diálogo | Bloquear edição/exclusão de despesa paga | Usuário escolheu permitir, avisando que a mudança afeta o card Total Pago
D-03 | Editar ou excluir uma parcela pergunta se aplica só aquela parcela ou todas as futuras | Aplicar sempre só a parcela clicada | Usuário quer o mesmo padrão de apps de assinatura/calendário
D-04 | Receita vinda de depósito "de fora" em caixinha fica bloqueada para editar/excluir, com aviso no diálogo | Permitir e propagar a mudança para a caixinha | Evita desincronizar o saldo guardado sem construir a lógica de reversão agora
D-05 | Campos editáveis são os mesmos do formulário de criação (descrição, valor, e data de entrada ou vencimento) | Só descrição e valor, data fixa | Usuário quer paridade completa com o formulário de criar
D-06 | Um diálogo só, com menu de ações (marcar como paga, editar, excluir), abre ao clicar na linha e troca de conteúdo conforme a ação escolhida | Diálogos separados por ação, cada um com gatilho próprio | Reaproveita o clique na linha já existente e evita poluir o card com mais de um elemento visual
D-07 | Exclusão se confirma com botão vermelho que nomeia a consequência ("essa ação não pode ser desfeita") | Exigir digitar a descrição ou a palavra "excluir" | Segue a regra já fechada do projeto (regras-design) sem adicionar fricção extra num app de uso diário
D-08 | Editar e excluir usam o mesmo padrão de idempotência do POST de criação (executarComIdempotencia) | Sem idempotência, igual ao PATCH /pagar hoje | Protege contra retry de rede duplicar ou corromper uma edição
D-09 | Auditoria/histórico de edição fica fora de escopo desta feature | Registrar quem editou o quê e quando | App de uso pessoal, sem histórico de edição em nenhum lugar do sistema hoje
D-10 | Definição de pronto inclui a tela Parcelas refletindo edição/exclusão de parcela | Só o Extrato, sem conferir a tela Parcelas | Parcela editada/excluída muda os agregados que a tela Parcelas mostra (parcelasPagas, valorTotal, valorPago)
```

## Pendências

Nenhuma pendência.
