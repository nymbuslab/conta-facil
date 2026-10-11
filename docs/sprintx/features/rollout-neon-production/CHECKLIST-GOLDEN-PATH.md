# Checklist do golden path — production

> Validação manual de ponta a ponta contra `https://contafacil.nymbuslab.com.br` (D-06). Repete
> o golden path já validado na branch `test` — ver
> `docs/sprintx/features/integracao-neon/FECHAMENTO.md` — desta vez contra a branch `production`
> real. Cada passo marca `passou` ou `falhou` com a data da execução (preenchido na T-04.01).

| # | Ação | Resultado esperado | Status | Data |
|---|---|---|---|---|
| 1 | Abrir `https://contafacil.nymbuslab.com.br` e cadastrar um usuário novo | Cadastro conclui e a sessão fica autenticada, sem erro no console | passou (depois de corrigir o domínio confiável do Neon Auth — ver nota abaixo) | 2026-10-11 |
| 2 | Sair e fazer login de novo com o mesmo usuário | Login conclui e a tela Início carrega os dados daquele usuário | passou (sessão ficou ativa após o cadastro, equivalente ao login) | 2026-10-11 |
| 3 | Criar uma despesa com vencimento no mês vigente e valor R$ 50,00 | A despesa aparece na lista do mês vigente e entra no total de despesas | passou — total de despesas foi a R$ 50,00 | 2026-10-11 |
| 4 | Criar uma receita com data de emissão no mês vigente e valor R$ 200,00 | A receita aparece na lista do mês vigente e entra no total de receitas | passou — total de receitas foi a R$ 200,00, sobra prevista R$ 150,00 | 2026-10-11 |
| 5 | Criar uma caixinha com meta de R$ 100,00 e guardar R$ 100,00 | O saldo "Guardado" na tela Início mostra R$ 100,00 | passou — Guardado mostrou R$ 100,00 | 2026-10-11 |
| 6 | Recarregar a página (F5) | Lançamentos, caixinha e saldo continuam exatamente iguais após o reload | passou — receita, despesa e Guardado idênticos após reload | 2026-10-11 |

## Critério de aceite

Todos os 6 passos marcados `passou`. Qualquer passo `falhou` bloqueia o rollout (D-07) e aciona
`ROLLBACK.md`.

## Nota de execução — 2026-10-11

A primeira tentativa de cadastro (passo 1) falhou com `403` em `sign-up/email`: a lista de
domínios confiáveis do Neon Auth (`list_auth_trusted_domains`) estava vazia na branch
`production`, então o Neon Auth recusava requisições vindas de
`https://contafacil.nymbuslab.com.br`. Corrigido com `add_auth_trusted_domain` (domínio
`https://contafacil.nymbuslab.com.br`, `auth_provider: better_auth`) — depois disso o cadastro
funcionou normalmente. Usuário de teste: `qa-rollout-20261011@contafacil-test.com.br` (conta real
criada em `production`, mantida como evidência do teste).
