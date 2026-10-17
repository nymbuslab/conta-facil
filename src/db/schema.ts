import { sql } from 'drizzle-orm'
import {
  boolean,
  check,
  date,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from 'drizzle-orm/pg-core'

export const tipoLancamento = pgEnum('tipo_lancamento', ['receita', 'despesa'])

export const lancamentos = pgTable(
  'lancamentos',
  {
    id: uuid().defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull(),
    tipo: tipoLancamento().notNull(),
    descricao: text().notNull(),
    valor: integer().notNull(),
    dataEmissao: date('data_emissao', { mode: 'string' }),
    vencimento: date({ mode: 'string' }),
    paga: boolean().notNull().default(false),
    pagoEm: date('pago_em', { mode: 'string' }),
    parcelamentoId: uuid('parcelamento_id'),
    parcelaAtual: integer('parcela_atual'),
    totalParcelas: integer('total_parcelas'),
    criadoEm: timestamp('criado_em', { withTimezone: true }).notNull().defaultNow(),
    atualizadoEm: timestamp('atualizado_em', { withTimezone: true }).notNull().defaultNow(),
  },
  (tabela) => [
    index('lancamentos_user_id_idx').on(tabela.userId),
    index('lancamentos_user_criado_id_idx').on(tabela.userId, tabela.criadoEm, tabela.id),
    check('lancamentos_valor_positivo', sql`${tabela.valor} > 0`),
    check(
      'lancamentos_campos_por_tipo',
      sql`(${tabela.tipo} = 'receita' AND ${tabela.dataEmissao} IS NOT NULL AND ${tabela.vencimento} IS NULL) OR (${tabela.tipo} = 'despesa' AND ${tabela.vencimento} IS NOT NULL AND ${tabela.dataEmissao} IS NULL)`,
    ),
  ],
)

export const caixinhas = pgTable(
  'caixinhas',
  {
    id: uuid().defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull(),
    nome: text().notNull(),
    valorGuardado: integer('valor_guardado').notNull().default(0),
    meta: integer().notNull(),
    criadoEm: timestamp('criado_em', { withTimezone: true }).notNull().defaultNow(),
    atualizadoEm: timestamp('atualizado_em', { withTimezone: true }).notNull().defaultNow(),
  },
  (tabela) => [
    index('caixinhas_user_id_idx').on(tabela.userId),
    index('caixinhas_user_criado_id_idx').on(tabela.userId, tabela.criadoEm, tabela.id),
    check('caixinhas_valor_guardado_nao_negativo', sql`${tabela.valorGuardado} >= 0`),
    check('caixinhas_meta_positiva', sql`${tabela.meta} > 0`),
  ],
)

export const tipoMovimentacaoCaixinha = pgEnum('tipo_movimentacao_caixinha', ['deposito', 'resgate'])
export const origemMovimentacaoCaixinha = pgEnum('origem_movimentacao_caixinha', ['saldo_atual', 'de_fora'])

export const caixinhaMovimentacoes = pgTable(
  'caixinha_movimentacoes',
  {
    id: uuid().defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull(),
    caixinhaId: uuid('caixinha_id').notNull(),
    tipo: tipoMovimentacaoCaixinha().notNull(),
    origem: origemMovimentacaoCaixinha(),
    valor: integer().notNull(),
    lancamentoId: uuid('lancamento_id'),
    criadoEm: timestamp('criado_em', { withTimezone: true }).notNull().defaultNow(),
  },
  (tabela) => [
    index('caixinha_movimentacoes_caixinha_id_idx').on(tabela.caixinhaId, tabela.criadoEm),
    index('caixinha_movimentacoes_user_id_idx').on(tabela.userId),
    check('caixinha_movimentacoes_valor_positivo', sql`${tabela.valor} > 0`),
    check(
      'caixinha_movimentacoes_origem_por_tipo',
      sql`(${tabela.tipo} = 'deposito' AND ${tabela.origem} IS NOT NULL) OR (${tabela.tipo} = 'resgate' AND ${tabela.origem} IS NULL)`,
    ),
    check(
      'caixinha_movimentacoes_lancamento_so_de_fora',
      sql`${tabela.lancamentoId} IS NULL OR ${tabela.origem} = 'de_fora'`,
    ),
  ],
)

export const idempotencias = pgTable(
  'idempotencias',
  {
    id: uuid().defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull(),
    chave: uuid().notNull(),
    operacao: text().notNull(),
    hashRequisicao: text('hash_requisicao').notNull(),
    statusResposta: integer('status_resposta').notNull(),
    corpoResposta: jsonb('corpo_resposta').notNull(),
    criadoEm: timestamp('criado_em', { withTimezone: true }).notNull().defaultNow(),
  },
  (tabela) => [
    unique('idempotencias_user_id_chave_unique').on(tabela.userId, tabela.chave),
  ],
)

export type LancamentoBanco = typeof lancamentos.$inferSelect
export type NovoLancamentoBanco = typeof lancamentos.$inferInsert
export type CaixinhaBanco = typeof caixinhas.$inferSelect
export type NovaCaixinhaBanco = typeof caixinhas.$inferInsert
export type CaixinhaMovimentacaoBanco = typeof caixinhaMovimentacoes.$inferSelect
export type NovaCaixinhaMovimentacaoBanco = typeof caixinhaMovimentacoes.$inferInsert
export type IdempotenciaBanco = typeof idempotencias.$inferSelect
