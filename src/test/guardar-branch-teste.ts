const PADRAO_BRANCH_DE_TESTE = /^test(-[A-Za-z0-9_-]+)?$/

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
