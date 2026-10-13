---
expx_schema: 1
expx_tool: sprintx
kind: decisoes
trabalho_id: seguranca-dependencias
atualizado_em: 2026-10-11
decisoes:
  - id: D-01
    decisao: Adotar os requisitos de navegador do Tailwind 4
    alternativa_descartada: Permanecer no Tailwind 3 para suportar navegadores antigos
    motivo: O projeto aceita Safari 16.4 ou superior, Chrome 111 ou superior e Firefox 128 ou superior
    status: fechada
    bloqueante: false
  - id: D-02
    decisao: Migrar a integracao do Tailwind para o plugin oficial do Vite e preservar os tokens atuais
    alternativa_descartada: Manter a configuracao PostCSS do Tailwind 3
    motivo: E o caminho oficial do Tailwind 4 para projetos Vite e reduz risco de configuracao duplicada
    status: fechada
    bloqueante: false
  - id: D-03
    decisao: Nao usar npm audit fix com force nem downgrade incompativel do Drizzle Kit
    alternativa_descartada: Eliminar alertas a qualquer custo com versoes incompativeis
    motivo: Build e migrations funcionais tem prioridade sobre zerar um alerta de ferramenta de desenvolvimento
    status: fechada
    bloqueante: false
  - id: D-04
    decisao: Documentar alerta moderado residual quando nao houver correcao compativel comprovada
    alternativa_descartada: Aplicar override transitivo sem prova da CLI de migration
    motivo: O risco residual e preferivel a quebrar a geracao ou aplicacao de migrations
    status: fechada
    bloqueante: false
---

# Decisões - seguranca-dependencias

## Decisões

```
D-01 | Adotar os requisitos de navegador do Tailwind 4 | Permanecer no Tailwind 3 para suportar navegadores antigos | O projeto aceita Safari 16.4+, Chrome 111+ e Firefox 128+
D-02 | Migrar a integração do Tailwind para o plugin oficial do Vite e preservar os tokens atuais | Manter a configuração PostCSS do Tailwind 3 | É o caminho oficial para projetos Vite e reduz configuração duplicada
D-03 | Não usar npm audit fix com force nem downgrade incompatível do Drizzle Kit | Eliminar alertas a qualquer custo | Build e migrations funcionais têm prioridade
D-04 | Documentar alerta moderado residual quando não houver correção compatível comprovada | Aplicar override transitivo sem prova | O risco residual é preferível a quebrar migrations
```

## Pendências

Nenhuma pendência.
