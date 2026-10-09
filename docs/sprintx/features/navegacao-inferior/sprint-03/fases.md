---
expx_schema: 1
expx_tool: sprintx
kind: fases
trabalho_id: navegacao-inferior
sprint_id: sprint-03
atualizado_em: 2026-10-08
fases:
  - id: F-03.1
    titulo: Modelo de dados e estado
    status: concluido
    criterio_saida: Tipos e schema aceitam parcelamento, adicionarDespesa gera as parcelas, e marcarComoPaga altera o campo paga
    paralelizavel: false
    paralela_com: []
    tasks: [T-03.01, T-03.02, T-03.03]
  - id: F-03.2
    titulo: Formulario, pagamento e aba Parcelas
    status: concluido
    criterio_saida: Checkbox Parcelado funciona, marcar como paga funciona a partir da Inicio, e a aba Parcelas mostra os cards de progresso
    paralelizavel: false
    paralela_com: []
    tasks: [T-03.04, T-03.05, T-03.06]
---

# Fases — Sprint 03

```mermaid
%% Grafo de tasks — sprint-03 — gerado pela sprintx a partir de tasks.md
flowchart LR
  subgraph fase_03_1["F-03.1 — Modelo de dados e estado"]
    T_03_01["T-03.01<br/>Estender tipos e schema…"]
    T_03_02["T-03.02<br/>Gerar parcelas no…"]
    T_03_03["T-03.03<br/>Implementar…"]
  end
  subgraph fase_03_2["F-03.2 — Formulario, pagamento e aba Parcelas"]
    T_03_04["T-03.04<br/>Checkbox Parcelado no…"]
    T_03_05["T-03.05<br/>Popup de confirmar…"]
    T_03_06["T-03.06<br/>Cards de parcelamento"]
  end

  T_03_01 --> T_03_02
  T_03_02 --> T_03_03
  T_03_01 --> T_03_04
  T_03_02 --> T_03_04
  T_03_03 --> T_03_05
  T_03_02 --> T_03_06
  T_03_03 --> T_03_06

  classDef concluida fill:#d4f4dd,stroke:#2e7d32,color:#1b3d20
  classDef andamento fill:#fff3cd,stroke:#b8860b,color:#4a3800
  classDef bloqueada fill:#f8d7da,stroke:#c62828,color:#4a1d1f
  classDef pendente  fill:#eceff1,stroke:#78909c,color:#263238
  classDef critico   stroke-width:3px

  class T_03_01 concluida
  class T_03_02 concluida
  class T_03_03 concluida
  class T_03_04 concluida
  class T_03_05 concluida
  class T_03_06 concluida
  class T_03_01,T_03_02,T_03_03,T_03_05 critico
```

---

## F-03.1 — Modelo de dados e estado

**Objetivo:** Estender `Despesa` e o schema do formulário com os campos de parcelamento, gerar as parcelas no estado e implementar a marcação de pagamento.

**Tasks que a compõem:** T-03.01, T-03.02, T-03.03

**Critério de saída:** `adicionarDespesa` com `parcelado: true` gera as N despesas mensais corretas, e `marcarComoPaga` altera o campo `paga` da despesa certa.

**Roda em paralelo com:** nenhuma

---

## F-03.2 — Formulário, pagamento e aba Parcelas

**Objetivo:** Construir, em paralelo (nenhuma das três depende da outra, só da F-03.1 já concluída, e tocam arquivos distintos), o checkbox de parcelamento no formulário, o popup de marcar como paga, e os cards da aba Parcelas.

**Tasks que a compõem:** T-03.04, T-03.05, T-03.06

**Critério de saída:** Submeter o formulário parcelado gera as despesas corretas; clicar numa despesa na Início e confirmar chama `marcarComoPaga`; a rota `/parcelas` mostra um card por grupo de parcelamento com Pago/Falta e progresso.

**Roda em paralelo com:** nenhuma
