# Lacunas — rollout-neon-production

> Procurado e não encontrado nas fontes disponíveis (código do projeto, `CLAUDE.md`, skills locais do Neon). Cada linha diz onde foi procurado.

- ~~Existência e estado de uma branch Neon chamada `production`~~ — RESOLVIDA por consulta direta ao Neon (F2): a branch `production` já existe, é `default` e `primary`, com Auth e Object Storage provisionados, mas sem schema de negócio nem Function. Ver `deploy-e-promocao-neon.md`.
- ~~Onde o frontend é hospedado~~ — RESOLVIDA na entrevista (F2): Cloudflare, domínio `contafacil.nymbuslab.com.br`. Produto exato do Cloudflare (Pages vs. Workers) ainda em confirmação com o usuário.
- ~~Domínio de produção para `FUNCTION_ALLOWED_ORIGINS`~~ — RESOLVIDA na entrevista (F2): `contafacil.nymbuslab.com.br` (protocolo e eventuais subdomínios extras a confirmar).
- Plano Neon do projeto (afeta a janela de "Instant Restore"/rollback por snapshot) — procurado em `neon.ts`, `CLAUDE.md`, skills locais do Neon; nenhum documenta o plano contratado.
- Resultado dos achados do `npm audit` pendentes (item P1 do `PROGRESSO.md`) — não foi rodado nesta ingestão porque é tarefa de leitura/decisão separada, registrada como pendência própria no `PROGRESSO.md`, não como parte desta feature.
