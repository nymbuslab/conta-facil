# Lacunas

- Pacote cliente de Neon Auth (`@neondatabase/auth` ou `@neondatabase/neon-js`) instalado ou não
  — procurado em `package.json` (deps e devDeps): não encontrado.
- Formato exato de request/resposta HTTP da Neon Data API (PostgREST-compatible) — procurado em
  `.claude/skills/neon/SKILL.md` e `.claude/skills/neon-postgres/SKILL.md`: a skill local só diz
  quando usar a Data API, não documenta o contrato de endpoint.
- Região AWS do projeto Neon `conta-facil` (relevante para confirmar disponibilidade de Object
  Storage/Functions) — não lida de `.env.local` por restrição de não ler valores de env; não
  documentada em `CLAUDE.md` nem em `neon.ts`.
- Uso pretendido do bucket privado `documentos` (que tela ou fluxo vai fazer upload/download) —
  procurado em todas as rotas de `src/routes/` e nos componentes de `src/components/`: nenhuma
  referência a storage, upload ou arquivo encontrada.
- Códigos de erro específicos de upload/download da Neon Object Storage — procurado em
  `.claude/skills/neon-object-storage/SKILL.md`: não detalhado além do caso `PutBucketWebsite`.
- Estratégia de mock de rede/tempo para os testes futuros (login, chamadas à Data API) —
  procurado em `package.json` (devDependencies) e nos testes existentes: nenhuma lib de mock de
  rede (`msw`, `nock`) nem uso de `vi.useFakeTimers` encontrado.
