import pg from 'pg'

const PADRAO_BRANCH_DE_TESTE = /^test(-[A-Za-z0-9_-]+)?$/

/** Endpoint (compute) real da branch Neon `test` deste projeto, obtido via `list_branch_computes`.
 * Atualizar se a branch de teste for recriada ou tiver o compute trocado. */
export const ENDPOINT_TESTE_PERMITIDO = 'ep-bold-thunder-b4np13yy'

const CONSULTA_ENDPOINT = "select current_setting('neon.endpoint_id', true) as endpoint_id"

type PoolConsultavel = { query: (sql: string) => Promise<{ rows: Array<{ endpoint_id?: string }> }> }

/**
 * Recusa rodar testes de integracao fora de uma branch Neon de teste. NEON_BRANCH e injetado
 * pelo Neon (CLI local via `neon dev`/`neon env pull`, ou a Function implantada) com o nome
 * real da branch — sem essa checagem, uma env mal configurada executaria cadastro de usuario,
 * escrita e delete reais contra qualquer branch, inclusive production.
 *
 * O padrao aceito (`test` ou `test-*`) e fixo e NUNCA configuravel por variavel de ambiente:
 * um guard que comparasse contra um "nome esperado" vindo do proprio ambiente nao protegeria
 * nada se esse ambiente apontar para production com um NEON_TEST_BRANCH=production a mais.
 */
export function garantirBranchDeTeste() {
  const branchAtual = process.env.NEON_BRANCH

  if (!branchAtual || !PADRAO_BRANCH_DE_TESTE.test(branchAtual)) {
    throw new Error(
      `Recusando rodar teste de integracao: NEON_BRANCH e '${branchAtual ?? 'ausente'}', esperado 'test' ou 'test-*'. ` +
        'Rode via `neon dev`/`neon env pull --branch test` para injetar a branch correta.',
    )
  }
}

/**
 * Confirma, na conexao real ja aberta (nao no texto de NEON_BRANCH), que o Postgres respondendo
 * e de fato o compute da branch de teste. `NEON_BRANCH` e so uma string de ambiente; se
 * `.env.test.local` estiver incoerente (ex.: DATABASE_URL_UNPOOLED apontando para outra branch
 * enquanto NEON_BRANCH ainda diz 'test'), garantirBranchDeTeste() sozinha nao pega isso.
 * `current_setting('neon.endpoint_id', true)` vem do proprio servidor conectado.
 */
export async function confirmarIdentidadeConexao(
  opcoes: { pool?: PoolConsultavel; databaseUrl?: string } = {},
) {
  const endpointId = opcoes.pool
    ? await consultarEndpoint(opcoes.pool)
    : await consultarComNovaConexao(
      opcoes.databaseUrl ?? process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL,
    )

  if (endpointId !== ENDPOINT_TESTE_PERMITIDO) {
    throw new Error(
      `Recusando rodar teste de integracao: a conexao real aponta para o endpoint '${endpointId ?? 'desconhecido'}', ` +
        `esperado '${ENDPOINT_TESTE_PERMITIDO}' (branch de teste). NEON_BRANCH pode estar incoerente ` +
        'com DATABASE_URL_UNPOOLED/.env.test.local.',
    )
  }
}

async function consultarEndpoint(pool: PoolConsultavel) {
  const { rows } = await pool.query(CONSULTA_ENDPOINT)
  return rows[0]?.endpoint_id
}

async function consultarComNovaConexao(databaseUrl: string | undefined) {
  if (!databaseUrl) {
    throw new Error('DATABASE_URL_UNPOOLED ou DATABASE_URL precisa estar definida para confirmar a identidade da conexao')
  }
  const pool = new pg.Pool({ connectionString: databaseUrl })
  try {
    return await consultarEndpoint(pool)
  } finally {
    await pool.end()
  }
}
