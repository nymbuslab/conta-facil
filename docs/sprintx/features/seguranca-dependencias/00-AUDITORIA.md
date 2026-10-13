# Auditoria - seguranca-dependencias

Data: 2026-10-11

## Achados ALTOS anteriores

| achado anterior | tratado em | como |
|---|---|---|
| Matriz de auditoria incompleta | `sprint-01/tasks.md`, T-01.01 | Cobre relatório limpo, somente moderado, alto, crítico, erro de rede e JSON inválido, sempre com falha fechada. |
| Tokens e animações não eram provados nominalmente | `sprint-02/tasks.md`, T-02.01 | Nomeia 25 mapeamentos de cor, duas fontes, três raios, quatro animações e respectivos keyframes. |
| Baseline e golden path visual subjetivos | `sprint-01/tasks.md`, T-01.02 e `sprint-02/tasks.md`, T-02.03 | Define 16 estados por versão, dois viewports, marcadores, dados determinísticos, foco, teclado, overflow e imagens persistentes. |
| Utilitários do Dialog não estavam cobertos | `base/migracao-tailwind-v4.md` e `sprint-02/tasks.md`, T-02.01 | Remove `tailwindcss-animate`, adota `tw-animate-css` e verifica os utilitários animate, fade, zoom e slide usados pelo Dialog. |
| Paridade visual não tinha regra mensurável | `sprint-02/tasks.md`, T-02.03 | Compara retângulos com tolerância máxima de 2 px e exige igualdade das propriedades visuais e de foco. |

| severidade | arquivo | problema | correção sugerida |
|---|---|---|---|
| BAIXA | `sprint-01/tasks.md`, T-01.02 | A fixture visual pode acumular conta e dados descartáveis na branch de teste. | Usar identificador único e remover os dados financeiros ao final quando o fluxo permitir. |
| BAIXA | `ORQUESTRADOR.md` | A definição de pronto resume a prova como `npm run test`, embora a ferramenta use modo run. | Executar e registrar explicitamente `npm run test -- --run`. |

Revisão dos testes: T-01.01 sólido; T-01.02 sólido; T-02.01 sólido; T-02.02 sólido; T-02.03 sólido.

VEREDITO: SIM - o plano está pronto para execução autônoma.
