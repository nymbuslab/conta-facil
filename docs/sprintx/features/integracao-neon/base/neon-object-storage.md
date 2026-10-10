# Neon Object Storage (bucket `documentos`)

## Contrato de entrada

- Declarado em `neon.ts:6-8`: bucket `documentos` com `access: "private"` — exige credencial em
  toda operação (sem leitura anônima).
- Credenciais injetadas como variáveis padrão AWS: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`,
  `AWS_ENDPOINT_URL_S3`, `AWS_REGION` — já confirmadas por nome em `.env.local` e no `CLAUDE.md`.
  — Fonte: `.claude/skills/neon-object-storage/SKILL.md:109-116`.
- SDK recomendado: `files-sdk` com adapter `neon` (`files-sdk/neon`), que resolve endpoint/região
  das mesmas env vars — só o nome do bucket precisa ser passado no código.
  — Fonte: `.claude/skills/neon-object-storage/SKILL.md:120-149`.

## Contrato de saída

- `files.upload(key, body, opts)`, `files.download(key)`, `files.url(key, { expiresIn })`
  (URL presignada), `files.exists()`, `files.list({ prefix })`, `files.copy()`, `files.delete()`.
  — Fonte: `.claude/skills/neon-object-storage/SKILL.md:138-148`.

## Limites e cotas

- Addressing obrigatoriamente path-style (`forcePathStyle: true` se usar o AWS SDK puro em vez
  do `files-sdk`).
  — Fonte: `.claude/skills/neon-object-storage/SKILL.md:155-163`.
- Disponível só nas regiões `aws-us-east-2`, `aws-us-east-1`, `aws-eu-central-1`,
  `aws-ap-southeast-1` — NÃO DOCUMENTADO qual região o projeto Neon `conta-facil` usa (não lido
  do `.env.local`, só confirmados os nomes das chaves).

## Erros conhecidos e tratamento

- NÃO DOCUMENTADO na skill local: códigos de erro específicos de upload/download. `PutBucketWebsite`
  retorna `501 Not Implemented` — bucket privado não serve como hospedagem de site.
  — Fonte: `.claude/skills/neon-object-storage/SKILL.md:63`.

## Riscos para a nossa implementação

- Nenhuma tela ou fluxo do Conta Fácil hoje lê ou grava arquivo algum — o bucket `documentos`
  está declarado em `neon.ts` mas **não tem nenhum consumo identificado no código ou nas
  decisões registradas**. Pode ser escopo futuro (ex.: comprovante de pagamento anexado a uma
  despesa) ou pode ser configuração herdada de um boilerplate — isso precisa ser perguntado na
  F2, não assumido.
- Nenhum pacote de storage (`files-sdk`, `@aws-sdk/client-s3`) está instalado no `package.json`.

## Fonte

`.claude/skills/neon-object-storage/SKILL.md` (local ao projeto) — acessado em 2026-10-10.
`neon.ts`, `CLAUDE.md` (raiz do projeto) — acessado em 2026-10-10.
