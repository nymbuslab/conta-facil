import { getTableConfig } from 'drizzle-orm/pg-core'
import { describe, expect, it } from 'vitest'

import { caixinhaMovimentacoes, caixinhas, idempotencias, lancamentos } from './schema'

function colunasDa(tabela: typeof lancamentos | typeof caixinhas) {
  return new Map(getTableConfig(tabela).columns.map((coluna) => [coluna.name, coluna]))
}

describe('schema de idempotencia', () => {
  it('persiste operacao hash status e resposta com unicidade por usuario e chave', () => {
    const configuracao = getTableConfig(idempotencias)
    const colunas = new Map(configuracao.columns.map((coluna) => [coluna.name, coluna]))

    expect([...colunas.keys()]).toEqual(expect.arrayContaining([
      'id', 'user_id', 'chave', 'operacao', 'hash_requisicao',
      'status_resposta', 'corpo_resposta', 'criado_em',
    ]))
    for (const nome of ['user_id', 'chave', 'operacao', 'hash_requisicao', 'status_resposta', 'corpo_resposta']) {
      expect(colunas.get(nome)?.notNull).toBe(true)
    }
    const unicas = configuracao.uniqueConstraints.map((restricao) =>
      restricao.columns.map((coluna) => coluna.name),
    )
    expect(unicas).toContainEqual(['user_id', 'chave'])
  })
})

describe('schema financeiro', () => {
  it.each([
    ['lancamentos', lancamentos],
    ['caixinhas', caixinhas],
  ] as const)('%s usa uuid do banco, user_id obrigatorio e valores em centavos', (_, tabela) => {
    const colunas = colunasDa(tabela)

    expect(colunas.get('id')).toMatchObject({ notNull: true, hasDefault: true })
    expect(colunas.get('id')?.getSQLType()).toBe('uuid')
    expect(colunas.get('user_id')).toMatchObject({ notNull: true })
    expect(colunas.get('user_id')?.getSQLType()).toBe('uuid')

    const colunaValor = colunas.get(tabela === lancamentos ? 'valor' : 'valor_guardado')
    expect(colunaValor).toMatchObject({ notNull: true })
    expect(colunaValor?.getSQLType()).toBe('integer')
  })

  it('guarda os campos necessarios para receitas, despesas e parcelamento', () => {
    const colunas = colunasDa(lancamentos)

    expect([...colunas.keys()]).toEqual(
      expect.arrayContaining([
        'tipo',
        'descricao',
        'valor',
        'data_emissao',
        'vencimento',
        'paga',
        'parcelamento_id',
        'parcela_atual',
        'total_parcelas',
      ]),
    )
  })

  it('guarda meta e saldo atual da caixinha em integer', () => {
    const colunas = colunasDa(caixinhas)

    expect(colunas.get('meta')?.getSQLType()).toBe('integer')
    expect(colunas.get('valor_guardado')).toMatchObject({ notNull: true, hasDefault: true })
  })
})

describe('schema de movimentacoes de caixinha', () => {
  it('guarda tipo, origem opcional e o lancamento vinculado quando houver', () => {
    const configuracao = getTableConfig(caixinhaMovimentacoes)
    const colunas = new Map(configuracao.columns.map((coluna) => [coluna.name, coluna]))

    expect([...colunas.keys()]).toEqual(expect.arrayContaining([
      'id', 'user_id', 'caixinha_id', 'tipo', 'origem', 'valor', 'lancamento_id', 'criado_em',
    ]))
    expect(colunas.get('tipo')).toMatchObject({ notNull: true })
    expect(colunas.get('origem')).toMatchObject({ notNull: false })
    expect(colunas.get('lancamento_id')).toMatchObject({ notNull: false })
    expect(colunas.get('valor')).toMatchObject({ notNull: true })
    expect(colunas.get('valor')?.getSQLType()).toBe('integer')
  })

  it('declara os tres checks que amarram origem ao tipo e o lancamento a origem de_fora', () => {
    const configuracao = getTableConfig(caixinhaMovimentacoes)
    const nomes = configuracao.checks.map((check) => check.name)

    expect(nomes).toEqual(expect.arrayContaining([
      'caixinha_movimentacoes_valor_positivo',
      'caixinha_movimentacoes_origem_por_tipo',
      'caixinha_movimentacoes_lancamento_so_de_fora',
    ]))
  })
})
