import { lancamentos, type LancamentoBanco, type NovoLancamentoBanco } from '../../db/schema.ts'
import { obterBanco } from './db.ts'

export interface DadosReceita {
  userId: string
  valor: number
  dataEmissao: string
}

/** Insere um lancamento de receita direto na tabela, dentro de uma transacao aberta por fora
 * (ou no banco padrao, quando nenhuma for passada). Usado por caixinhas.ts para o deposito
 * "de_fora" (origem-deposito-caixinha) sem acoplar essa rota as rotas de lancamentos.ts. */
export async function criarLancamentoReceita(
  dados: DadosReceita,
  banco?: unknown,
): Promise<LancamentoBanco> {
  const conexao = (banco ?? obterBanco()) as ReturnType<typeof obterBanco>
  const novo: NovoLancamentoBanco = {
    userId: dados.userId,
    tipo: 'receita',
    descricao: 'Depósito em caixinha',
    valor: dados.valor,
    dataEmissao: dados.dataEmissao,
  }
  const [criado] = await conexao.insert(lancamentos).values(novo).returning()
  return criado
}
