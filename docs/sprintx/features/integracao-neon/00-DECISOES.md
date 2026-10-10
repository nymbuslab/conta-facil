---
expx_schema: 1
expx_tool: sprintx
kind: decisoes
trabalho_id: integracao-neon
atualizado_em: 2026-10-10
decisoes:
  - id: D-01
    decisao: Escopo cobre login/cadastro reais e persistencia completa de lancamentos e caixinhas nesta entrega
    alternativa_descartada: So login real, mantendo lancamentos e caixinhas em mock por mais um ciclo
    motivo: Usuario pediu o escopo maior de uma vez
    status: fechada
    bloqueante: false
  - id: D-02
    decisao: Camada de API via Neon Functions, Postgres nunca exposto direto ao browser
    alternativa_descartada: Data API direto do browser, decisao antiga registrada no CLAUDE.md
    motivo: Segue a recomendacao oficial do Neon para app novo sem backend proprio, evitando depender de RLS bem configurada no cliente
    status: fechada
    bloqueante: false
  - id: D-03
    decisao: Bucket documentos fica declarado em neon.ts, sem uso nesta feature
    alternativa_descartada: Remover o bucket do neon.ts
    motivo: Reservado para um uso futuro ainda nao construido, por exemplo comprovante de pagamento anexado a uma despesa
    status: fechada
    bloqueante: false
  - id: D-04
    decisao: Id gerado no banco (uuid) e valores monetarios em integer (centavos) no schema Postgres
    alternativa_descartada: Manter id gerado no cliente e valores em number (reais), como hoje
    motivo: Padrao mais seguro para dinheiro, evita colisao de id gerado no cliente e erro de ponto flutuante
    status: fechada
    bloqueante: false
  - id: D-05
    decisao: Sem log ou auditoria customizado nesta entrega, alem do que o schema neon_auth ja guarda
    alternativa_descartada: Tabela de auditoria propria de acesso
    motivo: Fora do escopo minimo pedido pelo usuario
    status: fechada
    bloqueante: false
  - id: D-06
    decisao: Falha de rede ou Postgres indisponivel mostra tela de erro com opcao de tentar novamente
    alternativa_descartada: Degradar para os dados em memoria (useState) temporariamente
    motivo: Usuario preferiu nao mascarar falha real com dado desatualizado ou perdido ao recarregar
    status: fechada
    bloqueante: false
  - id: D-07
    decisao: Pacote cliente de autenticacao e o @neondatabase/auth
    alternativa_descartada: "@neondatabase/neon-js (SDK combinado)"
    motivo: So autenticacao e necessaria agora; pacote isolado e menor
    status: fechada
    bloqueante: false
  - id: D-08
    decisao: Testes automatizados rodam contra uma branch Neon real, nao contra mock de HTTP
    alternativa_descartada: msw mockando as chamadas de rede
    motivo: Usuario preferiu fidelidade real de Postgres e Auth nos testes
    status: fechada
    bloqueante: false
  - id: D-09
    decisao: Branch de teste fixa, resetada a partir da branch principal antes da suite rodar
    alternativa_descartada: Branch efemera criada e descartada a cada execucao de teste
    motivo: Mais simples e rapido do que provisionar e descartar branch em toda rodada
    status: fechada
    bloqueante: false
  - id: D-10
    decisao: Cada lancamento e caixinha pertence a um usuario (user_id), usuario so ve os proprios dados
    alternativa_descartada: Dados globais e compartilhados entre qualquer usuario autenticado
    motivo: Comportamento esperado de um app de controle financeiro pessoal com login real
    status: fechada
    bloqueante: false
  - id: D-11
    decisao: Entrega considerada pronta quando o perfil mockado for substituido pela conta real e Inicio, Parcelas e Caixinhas lerem e escreverem no Postgres, sobrevivendo a reload
    alternativa_descartada: Considerar pronto so com o login funcionando
    motivo: Criterio de aceite explicito do usuario
    status: fechada
    bloqueante: false
---

# Decisões — integracao-neon

> Uma linha por decisão tomada no planejamento (F2 e, excepcionalmente, F3). Formato fixo. Não apague decisões: uma decisão revertida ganha nova linha que cita a anterior.

## Decisões

```
D-01 | Escopo cobre login/cadastro reais e persistência completa de lançamentos e caixinhas nesta entrega | Só login real, mantendo lançamentos e caixinhas em mock por mais um ciclo | Usuário pediu o escopo maior de uma vez
D-02 | Camada de API via Neon Functions, Postgres nunca exposto direto ao browser | Data API direto do browser, decisão antiga registrada no CLAUDE.md | Segue a recomendação oficial do Neon para app novo sem backend próprio, evitando depender de RLS bem configurada no cliente
D-03 | Bucket `documentos` fica declarado em `neon.ts`, sem uso nesta feature | Remover o bucket do `neon.ts` | Reservado para um uso futuro ainda não construído, por exemplo comprovante de pagamento anexado a uma despesa
D-04 | Id gerado no banco (uuid) e valores monetários em `integer` (centavos) no schema Postgres | Manter id gerado no cliente e valores em `number` (reais), como hoje | Padrão mais seguro para dinheiro, evita colisão de id gerado no cliente e erro de ponto flutuante
D-05 | Sem log ou auditoria customizado nesta entrega, além do que o schema `neon_auth` já guarda | Tabela de auditoria própria de acesso | Fora do escopo mínimo pedido pelo usuário
D-06 | Falha de rede ou Postgres indisponível mostra tela de erro com opção de tentar novamente | Degradar para os dados em memória (`useState`) temporariamente | Usuário preferiu não mascarar falha real com dado desatualizado ou perdido ao recarregar
D-07 | Pacote cliente de autenticação é o `@neondatabase/auth` | `@neondatabase/neon-js` (SDK combinado) | Só autenticação é necessária agora; pacote isolado e menor
D-08 | Testes automatizados rodam contra uma branch Neon real, não contra mock de HTTP | `msw` mockando as chamadas de rede | Usuário preferiu fidelidade real de Postgres e Auth nos testes
D-09 | Branch de teste fixa, resetada a partir da branch principal antes da suite rodar | Branch efêmera criada e descartada a cada execução de teste | Mais simples e rápido do que provisionar e descartar branch em toda rodada
D-10 | Cada lançamento e caixinha pertence a um usuário (`user_id`), usuário só vê os próprios dados | Dados globais e compartilhados entre qualquer usuário autenticado | Comportamento esperado de um app de controle financeiro pessoal com login real
D-11 | Entrega considerada pronta quando o perfil mockado for substituído pela conta real e Início, Parcelas e Caixinhas lerem e escreverem no Postgres, sobrevivendo a reload | Considerar pronto só com o login funcionando | Critério de aceite explícito do usuário
```

## Pendências

Nenhuma pendência.
