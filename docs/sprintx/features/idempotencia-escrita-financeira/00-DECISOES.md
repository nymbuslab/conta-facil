---
expx_schema: 1
expx_tool: sprintx
kind: decisoes
trabalho_id: idempotencia-escrita-financeira
atualizado_em: 2026-10-11
decisoes:
  - id: D-01
    decisao: Proteger criacao de lancamentos e movimentos de caixinha com Idempotency-Key
    alternativa_descartada: Deduplicar por igualdade dos dados financeiros
    motivo: Operacoes legitimas podem ter os mesmos valores e descricoes
    status: fechada
    bloqueante: false
  - id: D-02
    decisao: Manter a chave opcional no backend durante a transicao e envia-la sempre pelo frontend novo
    alternativa_descartada: Tornar o cabecalho obrigatorio no primeiro deploy do backend
    motivo: Evita interromper o frontend antigo entre os dois passos de deploy
    status: fechada
    bloqueante: false
  - id: D-03
    decisao: Reservar a chave e executar a mutacao financeira na mesma transacao curta
    alternativa_descartada: Consultar a chave antes e gravar o resultado depois em operacoes separadas
    motivo: A transacao com unicidade evita corrida entre requisicoes concorrentes
    status: fechada
    bloqueante: false
  - id: D-04
    decisao: Rejeitar com status 409 a mesma chave usada com operacao ou payload diferente
    alternativa_descartada: Retornar silenciosamente o primeiro resultado
    motivo: Reuso incorreto da chave deve ser visivel sem repetir a mutacao
    status: fechada
    bloqueante: false
  - id: D-05
    decisao: Manter registros de idempotencia sem expiracao nesta versao
    alternativa_descartada: Criar limpeza periodica agora
    motivo: O volume e baixo e a limpeza adicionaria infraestrutura fora do escopo
    status: fechada
    bloqueante: false
  - id: D-06
    decisao: Repetir automaticamente uma vez apenas falhas de rede ou status 502 503 e 504 com a mesma chave
    alternativa_descartada: Repetir qualquer erro ou gerar nova chave
    motivo: Apenas falhas transitorias devem ser repetidas sem risco de duplicacao
    status: fechada
    bloqueante: false
  - id: D-07
    decisao: Registrar somente metadados tecnicos sem payload nem valor financeiro
    alternativa_descartada: Registrar corpo completo das requisicoes
    motivo: Observabilidade nao deve ampliar exposicao de dados financeiros
    status: fechada
    bloqueante: false
  - id: D-08
    decisao: Validar migration e fluxos apenas na branch Neon de teste nesta entrega
    alternativa_descartada: Aplicar migration e deploy em producao no mesmo ciclo
    motivo: Producao exige autorizacao especifica e plano de rollout separado
    status: fechada
    bloqueante: false
---

# Decisões - idempotencia-escrita-financeira

## Decisões

```
D-01 | Proteger criação de lançamentos e movimentos de caixinha com Idempotency-Key | Deduplicar por igualdade dos dados financeiros | Operações legítimas podem ter os mesmos valores e descrições
D-02 | Manter a chave opcional no backend durante a transição e enviá-la sempre pelo frontend novo | Tornar o cabeçalho obrigatório no primeiro deploy | Evita interromper o frontend antigo
D-03 | Reservar a chave e executar a mutação na mesma transação curta | Consultar e gravar em operações separadas | A transação com unicidade evita corrida
D-04 | Rejeitar com 409 a mesma chave usada com operação ou payload diferente | Retornar silenciosamente o primeiro resultado | Reuso incorreto deve ser visível
D-05 | Manter registros sem expiração nesta versão | Criar limpeza periódica agora | O volume é baixo e limpeza adicionaria infraestrutura
D-06 | Repetir uma vez apenas falha de rede ou 502, 503 e 504 usando a mesma chave | Repetir qualquer erro ou gerar nova chave | Apenas falhas transitórias devem ser repetidas
D-07 | Registrar somente metadados sem payload nem valor financeiro | Registrar corpos completos | Observabilidade não deve ampliar exposição
D-08 | Validar migration e fluxos somente na branch Neon de teste nesta entrega | Alterar produção no mesmo ciclo | Produção exige autorização específica
```

## Pendências

Nenhuma pendência.
