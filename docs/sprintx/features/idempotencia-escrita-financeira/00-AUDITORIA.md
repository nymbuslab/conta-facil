# Auditoria - idempotencia-escrita-financeira

Data: 2026-10-11

## Achados ALTOS anteriores

| achado anterior | tratado em | como |
|---|---|---|
| Isolamento da chave entre usuários não era provado | `sprint-02/tasks.md`, T-02.01 | Testa a mesma chave para dois usuários e conflito apenas dentro do mesmo usuário. |
| Rollback após reserva não era testado | `sprint-02/tasks.md`, T-02.02 e T-02.07 | Provoca falha, prova ausência de chave e efeito, e repete com sucesso no Postgres real. |
| Conflito entre operações não era coberto | `sprint-02/tasks.md`, T-02.02 a T-02.04 | Testa a mesma chave em depósito, resgate e lançamento com operação ou payload diferentes. |
| Compatibilidade sem cabeçalho não era testada | `sprint-02/tasks.md`, T-02.03 e T-02.04 | Mantém casos explícitos sem `Idempotency-Key` para os três endpoints. |
| Matriz de retry estava incompleta | `sprint-02/tasks.md`, T-02.05 | Cobre rede, 502, 503, 504, erros não retentáveis, duas tentativas e estabilidade da chave. |
| Observabilidade segura não tinha prova | `sprint-02/tasks.md`, T-02.02 e T-02.05 | Limita logs a evento, operação, resultado e replay e testa a ausência de payload e dados financeiros. |
| Migration não tinha trava antes do DDL | `ORQUESTRADOR.md` e `sprint-02/tasks.md`, T-02.01 | Usa executor que carrega `.env.test.local` e chama `garantirBranchDeTeste()` antes do Drizzle. |

| severidade | arquivo | problema | correção sugerida |
|---|---|---|---|
| BAIXA | `sprint-02/tasks.md` | Backend e cliente permanecem serializados apesar de parte do trabalho poder convergir depois. | Aceitar a ordem conservadora nesta entrega e reavaliar paralelismo em trabalhos futuros. |

Revisão dos testes: as oito tasks foram consideradas sólidas e discriminam duplicidade, conflito, rollback, retry e vazamento em logs.

VEREDITO: SIM - o plano está pronto para execução autônoma.
