---
expx_schema: 1
expx_tool: sprintx
kind: decisoes
trabalho_id: proxy-reverso-neon-auth
atualizado_em: 2026-10-17
decisoes:
  - id: D-01
    decisao: Proxy generico cobrindo qualquer path sob /auth/*, ja preparado para login social futuro
    alternativa_descartada: Proxy restrito so aos endpoints de email/senha hoje usados
    motivo: Fluxo OAuth usa multiplos paths/callback que o proxy precisa repassar sem lista fixa
    status: fechada
    bloqueante: false
  - id: D-02
    decisao: Rota do proxy e /auth/*
    alternativa_descartada: /api/auth/*
    motivo: Nao colide com nenhuma rota existente do TanStack Router e e mais curta
    status: fechada
    bloqueante: false
  - id: D-03
    decisao: Proxy ativo em production e na branch test (Preview)
    alternativa_descartada: So production
    motivo: Permite validar o golden path completo, inclusive inspecionar o cookie real, antes de ir a producao
    status: fechada
    bloqueante: false
  - id: D-04
    decisao: Falha do proxy ou do Neon Auth upstream mantem a tela de erro ja existente (sem fallback direto ao host original)
    alternativa_descartada: Fallback automatico direto ao host do Neon Auth em caso de falha do proxy
    motivo: Fallback reintroduziria o problema original de cookie de terceiros
    status: fechada
    bloqueante: false
  - id: D-05
    decisao: Verificacao do atributo Domain do Set-Cookie feita durante a implementacao, logando com a conta de teste do pentest contra a branch test
    alternativa_descartada: Usuario verificar manualmente antes de seguir o plano
    motivo: Mesmo padrao de validacao ja usado no projeto (Playwright/DevTools contra branch test)
    status: fechada
    bloqueante: false
---

# Decisões — proxy-reverso-neon-auth

> Uma linha por decisão tomada no planejamento (F2 e, excepcionalmente, F3). Formato fixo. Não apague decisões: uma decisão revertida ganha nova linha que cita a anterior.

## Decisões

```
D-01 | Proxy generico cobrindo qualquer path sob /auth/*, ja preparado para login social futuro | Proxy restrito so aos endpoints de email/senha hoje usados | Fluxo OAuth usa multiplos paths/callback que o proxy precisa repassar sem lista fixa
D-02 | Rota do proxy e /auth/* | /api/auth/* | Nao colide com nenhuma rota existente do TanStack Router e e mais curta
D-03 | Proxy ativo em production e na branch test (Preview) | So production | Permite validar o golden path completo, inclusive inspecionar o cookie real, antes de ir a producao
D-04 | Falha do proxy ou do Neon Auth upstream mantem a tela de erro ja existente (sem fallback direto ao host original) | Fallback automatico direto ao host do Neon Auth em caso de falha do proxy | Fallback reintroduziria o problema original de cookie de terceiros
D-05 | Verificacao do atributo Domain do Set-Cookie feita durante a implementacao, logando com a conta de teste do pentest contra a branch test | Usuario verificar manualmente antes de seguir o plano | Mesmo padrao de validacao ja usado no projeto (Playwright/DevTools contra branch test)
```

## Pendências

Nenhuma pendência.
