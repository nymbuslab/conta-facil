# Testes de integração

## Contrato de entrada

Os scripts `test:integration:lancamentos` e `test:integration:caixinhas` usam `.env.test.local` e a proteção `garantirBranchDeTeste()` antes de escrever no Neon, conforme `package.json:16-17` e `src/test/*-setup.ts`.

## Contrato de saída

Os testes atuais comprovam isolamento por usuário, criação de lançamentos, depósito, resgate inválido e valor persistido no banco.

## Limites e cotas

Cada script cria dois usuários reais de teste em paralelo em `src/test/lancamentos-setup.ts:37` e `src/test/caixinhas-setup.ts:36`.

## Erros conhecidos e tratamento

Os testes ainda não repetem a mesma escrita com a mesma chave nem disparam requisições concorrentes idênticas.

## Riscos para a nossa implementação

Testar apenas mocks de rota não prova a restrição única, o bloqueio concorrente ou o rollback da transação. A branch Neon de teste precisa receber a migration antes dos casos reais.

## Fonte

`package.json:13-20`, `src/test/lancamentos-setup.ts` e `src/test/caixinhas-setup.ts` - acessados em 2026-10-11.
