# Lacunas — editar-excluir-lancamentos

- `schema-lancamentos.md` (Limites e cotas): nenhum limite documentado de tamanho de
  `descricao` ou teto de `valor` além do check `valor > 0` — procurado em `src/db/schema.ts`
  inteiro e nos schemas zod de `src/types/lancamento.ts` e `src/functions/api/lancamentos.ts`.
- `caixinha-movimentacoes-risco.md` (Limites e cotas): nenhum limite documentado para
  quantidade de movimentações por caixinha — procurado em `src/functions/api/caixinhas.ts`.
- `parcelamento-estrutura.md` (Erros conhecidos e tratamento): não existe hoje nenhuma rota
  que edite ou exclua uma parcela isolada, então não há erro documentado pra esse cenário —
  procurado em `src/functions/api/lancamentos.ts` inteiro.
- `testes-e-idempotencia.md` (Limites e cotas): nenhum TTL explícito no código para registros
  de idempotência — procurado em `src/functions/api/idempotencia.ts`; `CLAUDE.md` cita
  retenção de 90 dias via script de manutenção, mas isso é limpeza manual, não TTL do dado em
  si.
