import { Hono } from 'hono'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { LancamentoBanco, NovoLancamentoBanco } from '@/db/schema'
import { codificarCursor } from '@/lib/paginacao'

import { criarExecutorIdempotencia, type RegistroIdempotencia, type TransacaoIdempotencia } from './idempotencia'
import {
  colunasLancamentoListado,
  criarRotasLancamentos,
  paraLancamentoListado,
  type RepositorioLancamentos,
} from './lancamentos'

/** Sem anotacao de retorno RepositorioLancamentos: editar/excluir ainda nao existem na
 * interface (chegam na sprint-02). Sem a anotacao, o literal infere um tipo mais largo e o
 * TS nao bloqueia por excesso de propriedade; quando a interface for estendida, a forma ja
 * bate e nada aqui precisa mudar. */
function criarRepositorio() {
  return {
    listar: vi.fn().mockResolvedValue({ itens: [], proximoCursor: null }),
    resumo: vi.fn().mockResolvedValue({ receitas: 0, despesas: 0, despesasPagas: 0 }),
    listarParcelamentos: vi.fn().mockResolvedValue({ itens: [], proximoCursor: null }),
    listarVencendo: vi.fn().mockResolvedValue({ itens: [] }),
    listarRecentes: vi.fn().mockResolvedValue({ itens: [] }),
    criarMuitos: vi.fn(async (dados: NovoLancamentoBanco[]): Promise<LancamentoBanco[]> =>
      dados.map((item, indice) => ({
        ...item,
        id: `id-${indice + 1}`,
        dataEmissao: item.dataEmissao ?? null,
        vencimento: item.vencimento ?? null,
        paga: item.paga ?? false,
        pagoEm: item.pagoEm ?? null,
        parcelamentoId: item.parcelamentoId ?? null,
        parcelaAtual: item.parcelaAtual ?? null,
        totalParcelas: item.totalParcelas ?? null,
        criadoEm: item.criadoEm ?? new Date(),
        atualizadoEm: item.atualizadoEm ?? new Date(),
      })),
    ),
    marcarComoPaga: vi.fn().mockResolvedValue({ id: '11111111-1111-1111-1111-111111111111', paga: true }),
    buscarPorId: vi.fn().mockResolvedValue(null),
    estaVinculadoACaixinha: vi.fn().mockResolvedValue(false),
    editar: vi.fn().mockResolvedValue([]),
    excluir: vi.fn().mockResolvedValue({ idsExcluidos: [] }),
  }
}

function criarExecutorMemoria() {
  const registros = new Map<string, RegistroIdempotencia>()
  return criarExecutorIdempotencia({
    async transacionar(callback) {
      const transacao: TransacaoIdempotencia = {
        banco: null,
        bloquear: async () => undefined,
        buscar: async (userId, chave) => registros.get(`${userId}:${chave}`) ?? null,
        salvar: async (registro) => { registros.set(`${registro.userId}:${registro.chave}`, registro) },
      }
      return callback(transacao)
    },
  }, vi.fn())
}

function criarApp(repositorio: RepositorioLancamentos, userId = 'usuario-1', executar = criarExecutorMemoria()) {
  const app = new Hono<{ Variables: { userId: string } }>()
  app.use('*', async (contexto, next) => {
    contexto.set('userId', userId)
    await next()
  })
  app.route('/lancamentos', criarRotasLancamentos(repositorio, executar))
  return app
}

describe('rotas de lancamentos', () => {
  let repositorio: RepositorioLancamentos

  beforeEach(() => {
    repositorio = criarRepositorio()
  })

  it('lista somente com o userId autenticado e a página padrão', async () => {
    const resposta = await criarApp(repositorio).request('/lancamentos')

    expect(resposta.status).toBe(200)
    expect(await resposta.json()).toEqual({ itens: [], proximoCursor: null })
    expect(repositorio.listar).toHaveBeenCalledWith(
      'usuario-1',
      expect.objectContaining({ limite: 5 }),
    )
  })

  it('repassa filtros e o cursor decodificado para o repositório', async () => {
    const cursor = codificarCursor({
      criadoEm: '2026-10-01T00:00:00.000Z',
      id: '11111111-1111-1111-1111-111111111111',
    })
    const resposta = await criarApp(repositorio).request(
      `/lancamentos?tipo=despesa&mes=2026-10&busca=luz&limite=50&cursor=${encodeURIComponent(cursor)}`,
    )

    expect(resposta.status).toBe(200)
    expect(repositorio.listar).toHaveBeenCalledWith('usuario-1', {
      limite: 50,
      tipo: 'despesa',
      mes: '2026-10',
      busca: 'luz',
      cursor: { criadoEm: '2026-10-01T00:00:00.000Z', id: '11111111-1111-1111-1111-111111111111' },
    })
  })

  it('recusa limite fora da faixa permitida', async () => {
    const alto = await criarApp(repositorio).request('/lancamentos?limite=1000')
    const zero = await criarApp(repositorio).request('/lancamentos?limite=0')

    expect(alto.status).toBe(400)
    expect(zero.status).toBe(400)
    expect(repositorio.listar).not.toHaveBeenCalled()
  })

  it('recusa mês e cursor inválidos sem consultar o repositório', async () => {
    const mesInvalido = await criarApp(repositorio).request('/lancamentos?mes=2026-13')
    const cursorInvalido = await criarApp(repositorio).request('/lancamentos?cursor=nao-e-base64')

    expect(mesInvalido.status).toBe(400)
    expect(cursorInvalido.status).toBe(400)
    expect(repositorio.listar).not.toHaveBeenCalled()
  })

  it('resume receitas, despesas e despesas pagas do usuário no mês pedido', async () => {
    vi.mocked(repositorio.resumo).mockResolvedValue({ receitas: 500000, despesas: 120000, despesasPagas: 45000 })

    const resposta = await criarApp(repositorio).request('/lancamentos/resumo?mes=2026-10')

    expect(resposta.status).toBe(200)
    expect(await resposta.json()).toEqual({ receitas: 500000, despesas: 120000, despesasPagas: 45000 })
    expect(repositorio.resumo).toHaveBeenCalledWith('usuario-1', '2026-10')
  })

  it('recusa mês inválido no resumo', async () => {
    const resposta = await criarApp(repositorio).request('/lancamentos/resumo?mes=10-2026')

    expect(resposta.status).toBe(400)
    expect(repositorio.resumo).not.toHaveBeenCalled()
  })

  it('lista as contas vencendo repassando dias e limite ao repositório', async () => {
    const itens = [{ id: 'd1', tipo: 'despesa', descricao: 'Luz', valor: 100 }]
    vi.mocked(repositorio.listarVencendo).mockResolvedValue({ itens: itens as never })

    const resposta = await criarApp(repositorio).request('/lancamentos/vencendo?dias=3&limite=3')

    expect(resposta.status).toBe(200)
    expect(await resposta.json()).toEqual({ itens })
    expect(repositorio.listarVencendo).toHaveBeenCalledWith('usuario-1', { dias: 3, limite: 3 })
  })

  it('usa dias e limite padrao quando omitidos em /lancamentos/vencendo', async () => {
    const resposta = await criarApp(repositorio).request('/lancamentos/vencendo')

    expect(resposta.status).toBe(200)
    expect(repositorio.listarVencendo).toHaveBeenCalledWith('usuario-1', { dias: 3, limite: 3 })
  })

  it('recusa dias nao numerico em /lancamentos/vencendo sem consultar o repositorio', async () => {
    const resposta = await criarApp(repositorio).request('/lancamentos/vencendo?dias=abc')

    expect(resposta.status).toBe(400)
    expect(repositorio.listarVencendo).not.toHaveBeenCalled()
  })

  it('lista os ultimos lancamentos repassando o limite ao repositorio', async () => {
    const itens = [{ id: 'l1', tipo: 'receita', descricao: 'Salario', valor: 500000 }]
    vi.mocked(repositorio.listarRecentes).mockResolvedValue({ itens: itens as never })

    const resposta = await criarApp(repositorio).request('/lancamentos/recentes?limite=5')

    expect(resposta.status).toBe(200)
    expect(await resposta.json()).toEqual({ itens })
    expect(repositorio.listarRecentes).toHaveBeenCalledWith('usuario-1', { limite: 5 })
  })

  it('recusa limite acima do maximo em /lancamentos/recentes sem consultar o repositorio', async () => {
    const resposta = await criarApp(repositorio).request('/lancamentos/recentes?limite=1000')

    expect(resposta.status).toBe(400)
    expect(repositorio.listarRecentes).not.toHaveBeenCalled()
  })

  it('lista os parcelamentos agrupados com cursor', async () => {
    vi.mocked(repositorio.listarParcelamentos).mockResolvedValue({
      itens: [{
        parcelamentoId: '11111111-1111-1111-1111-111111111111',
        descricao: 'Notebook',
        totalParcelas: 3,
        parcelasPagas: 1,
        valorTotal: 9000,
        valorPago: 3000,
      }],
      proximoCursor: 'proxima',
    })

    const resposta = await criarApp(repositorio).request('/lancamentos/parcelamentos?limite=10')

    expect(resposta.status).toBe(200)
    expect(await resposta.json()).toEqual({
      itens: [{
        parcelamentoId: '11111111-1111-1111-1111-111111111111',
        descricao: 'Notebook',
        totalParcelas: 3,
        parcelasPagas: 1,
        valorTotal: 9000,
        valorPago: 3000,
      }],
      proximoCursor: 'proxima',
    })
    expect(repositorio.listarParcelamentos).toHaveBeenCalledWith(
      'usuario-1',
      expect.objectContaining({ limite: 10 }),
    )
  })

  it('multiplica o valor da parcela em N linhas com o mesmo parcelamentoId', async () => {
    const resposta = await criarApp(repositorio).request('/lancamentos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tipo: 'despesa',
        descricao: 'Notebook',
        valor: 3334,
        vencimento: '2026-10-15',
        parcelado: true,
        quantidadeParcelas: 3,
      }),
    })

    expect(resposta.status).toBe(201)
    const [parcelas] = vi.mocked(repositorio.criarMuitos).mock.calls[0]
    expect(parcelas).toHaveLength(3)
    expect(new Set(parcelas.map((parcela) => parcela.parcelamentoId)).size).toBe(1)
    expect(parcelas.map((parcela) => parcela.valor)).toEqual([3334, 3334, 3334])
    expect(parcelas.map((parcela) => parcela.vencimento)).toEqual([
      '2026-10-15',
      '2026-11-15',
      '2026-12-15',
    ])
    expect(parcelas.every((parcela) => parcela.userId === 'usuario-1')).toBe(true)
  })

  it('marca como paga usando id e userId para impedir acesso cruzado', async () => {
    const resposta = await criarApp(repositorio).request(
      '/lancamentos/11111111-1111-1111-1111-111111111111/pagar',
      { method: 'PATCH' },
    )

    expect(resposta.status).toBe(200)
    expect(repositorio.marcarComoPaga).toHaveBeenCalledWith(
      'usuario-1',
      '11111111-1111-1111-1111-111111111111',
    )
  })

  it('recusa id que nao e uuid sem consultar o repositorio', async () => {
    const resposta = await criarApp(repositorio).request('/lancamentos/nao-e-uuid/pagar', {
      method: 'PATCH',
    })

    expect(resposta.status).toBe(404)
    expect(repositorio.marcarComoPaga).not.toHaveBeenCalled()
  })

  it('repete lote parcelado e resposta sem criar novamente', async () => {
    const app = criarApp(repositorio)
    const corpo = {
      tipo: 'despesa', descricao: 'Notebook', valor: 50000, vencimento: '2026-10-11',
      parcelado: true, quantidadeParcelas: 3,
    }
    const init = {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Idempotency-Key': '11111111-1111-4111-8111-111111111111' },
      body: JSON.stringify(corpo),
    }

    const primeira = await app.request('/lancamentos', init)
    const segunda = await app.request('/lancamentos', init)

    expect(primeira.status).toBe(201)
    expect(segunda.status).toBe(201)
    const corpoPrimeira = await primeira.json() as LancamentoBanco[]
    const corpoSegunda = await segunda.json() as LancamentoBanco[]
    expect(corpoSegunda).toEqual(corpoPrimeira)
    expect(corpoPrimeira).toHaveLength(3)
    expect(new Set(corpoPrimeira.map((item) => item.parcelamentoId)).size).toBe(1)
    expect(repositorio.criarMuitos).toHaveBeenCalledTimes(1)
  })

  it('retorna 409 para mesma chave com payload diferente', async () => {
    const app = criarApp(repositorio)
    const chave = '22222222-2222-4222-8222-222222222222'
    const enviar = (valor: number) => app.request('/lancamentos', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Idempotency-Key': chave },
      body: JSON.stringify({ tipo: 'receita', descricao: 'Salário', valor, dataEmissao: '2026-10-11' }),
    })
    expect((await enviar(100)).status).toBe(201)
    expect((await enviar(101)).status).toBe(409)
    expect(repositorio.criarMuitos).toHaveBeenCalledTimes(1)
  })

  it('isola a mesma chave entre usuarios e preserva o caminho sem cabecalho', async () => {
    const executar = criarExecutorMemoria()
    const corpo = JSON.stringify({ tipo: 'receita', descricao: 'Salário', valor: 100, dataEmissao: '2026-10-11' })
    const init = { method: 'POST', headers: { 'Content-Type': 'application/json', 'Idempotency-Key': '33333333-3333-4333-8333-333333333333' }, body: corpo }

    expect((await criarApp(repositorio, 'usuario-1', executar).request('/lancamentos', init)).status).toBe(201)
    expect((await criarApp(repositorio, 'usuario-2', executar).request('/lancamentos', init)).status).toBe(201)
    expect((await criarApp(repositorio).request('/lancamentos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: corpo })).status).toBe(201)
    expect(repositorio.criarMuitos).toHaveBeenCalledTimes(3)
  })
})

describe('PATCH /lancamentos/:id — editar', () => {
  let repositorio: ReturnType<typeof criarRepositorio>
  const despesa = {
    id: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd', tipo: 'despesa' as const, descricao: 'Luz', valor: 100, vencimento: '2026-10-10',
    userId: 'usuario-1', paga: false, pagoEm: null, parcelamentoId: null, parcelaAtual: null,
    totalParcelas: null, dataEmissao: null, criadoEm: new Date(), atualizadoEm: new Date(),
  }
  const corpoValido = { tipo: 'despesa', descricao: 'Luz e água', valor: 150, vencimento: '2026-10-10' }

  beforeEach(() => {
    repositorio = criarRepositorio()
  })

  it('sem Idempotency-Key devolve 400 sem consultar o lancamento', async () => {
    const resposta = await criarApp(repositorio).request('/lancamentos/dddddddd-dddd-4ddd-8ddd-dddddddddddd', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(corpoValido),
    })

    expect(resposta.status).toBe(400)
    expect(repositorio.buscarPorId).not.toHaveBeenCalled()
  })

  it('com a mesma chave e payload diferente devolve 409', async () => {
    vi.mocked(repositorio.buscarPorId).mockResolvedValue(despesa)
    const app = criarApp(repositorio)
    const chave = '44444444-4444-4444-8444-444444444444'
    const enviar = (valor: number) => app.request('/lancamentos/dddddddd-dddd-4ddd-8ddd-dddddddddddd', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json', 'Idempotency-Key': chave },
      body: JSON.stringify({ ...corpoValido, valor }),
    })

    expect((await enviar(150)).status).toBe(200)
    expect((await enviar(151)).status).toBe(409)
    expect(repositorio.editar).toHaveBeenCalledTimes(1)
  })

  it('id inexistente devolve 404', async () => {
    vi.mocked(repositorio.buscarPorId).mockResolvedValue(null)

    const resposta = await criarApp(repositorio).request('/lancamentos/dddddddd-dddd-4ddd-8ddd-dddddddddddd', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Idempotency-Key': '55555555-5555-4555-8555-555555555555' },
      body: JSON.stringify(corpoValido),
    })

    expect(resposta.status).toBe(404)
  })

  it('lancamento vinculado a uma caixinha devolve 409 sem chamar repositorio.editar', async () => {
    vi.mocked(repositorio.buscarPorId).mockResolvedValue(despesa)
    vi.mocked(repositorio.estaVinculadoACaixinha).mockResolvedValue(true)

    const resposta = await criarApp(repositorio).request('/lancamentos/dddddddd-dddd-4ddd-8ddd-dddddddddddd', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Idempotency-Key': '66666666-6666-4666-8666-666666666666' },
      body: JSON.stringify(corpoValido),
    })

    expect(resposta.status).toBe(409)
    expect(repositorio.editar).not.toHaveBeenCalled()
  })
})

describe('DELETE /lancamentos/:id — excluir', () => {
  let repositorio: ReturnType<typeof criarRepositorio>
  const despesa = {
    id: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd', tipo: 'despesa' as const, descricao: 'Luz', valor: 100, vencimento: '2026-10-10',
    userId: 'usuario-1', paga: false, pagoEm: null, parcelamentoId: null, parcelaAtual: null,
    totalParcelas: null, dataEmissao: null, criadoEm: new Date(), atualizadoEm: new Date(),
  }

  beforeEach(() => {
    repositorio = criarRepositorio()
  })

  it('sem Idempotency-Key devolve 400 sem consultar o lancamento', async () => {
    const resposta = await criarApp(repositorio).request('/lancamentos/dddddddd-dddd-4ddd-8ddd-dddddddddddd', { method: 'DELETE' })

    expect(resposta.status).toBe(400)
    expect(repositorio.buscarPorId).not.toHaveBeenCalled()
  })

  it('id inexistente devolve 404', async () => {
    vi.mocked(repositorio.buscarPorId).mockResolvedValue(null)

    const resposta = await criarApp(repositorio).request('/lancamentos/dddddddd-dddd-4ddd-8ddd-dddddddddddd', {
      method: 'DELETE', headers: { 'Idempotency-Key': '77777777-7777-4777-8777-777777777777' },
    })

    expect(resposta.status).toBe(404)
  })

  it('lancamento vinculado a uma caixinha devolve 409 sem chamar repositorio.excluir', async () => {
    vi.mocked(repositorio.buscarPorId).mockResolvedValue(despesa)
    vi.mocked(repositorio.estaVinculadoACaixinha).mockResolvedValue(true)

    const resposta = await criarApp(repositorio).request('/lancamentos/dddddddd-dddd-4ddd-8ddd-dddddddddddd', {
      method: 'DELETE', headers: { 'Idempotency-Key': '88888888-8888-4888-8888-888888888888' },
    })

    expect(resposta.status).toBe(409)
    expect(repositorio.excluir).not.toHaveBeenCalled()
  })

  it('exclusao bem sucedida devolve 200 com os ids excluidos', async () => {
    vi.mocked(repositorio.buscarPorId).mockResolvedValue(despesa)
    vi.mocked(repositorio.excluir).mockResolvedValue({ idsExcluidos: ['dddddddd-dddd-4ddd-8ddd-dddddddddddd'] })

    const resposta = await criarApp(repositorio).request('/lancamentos/dddddddd-dddd-4ddd-8ddd-dddddddddddd', {
      method: 'DELETE', headers: { 'Idempotency-Key': '99999999-9999-4999-8999-999999999999' },
    })

    expect(resposta.status).toBe(200)
    expect(await resposta.json()).toEqual({ idsExcluidos: ['dddddddd-dddd-4ddd-8ddd-dddddddddddd'] })
  })
})

describe('projeção da listagem de lancamentos', () => {
  it('seleciona só as colunas da tela mais criadoEm para o cursor', () => {
    expect(Object.keys(colunasLancamentoListado).sort()).toEqual([
      'criadoEm',
      'dataEmissao',
      'descricao',
      'id',
      'paga',
      'pagoEm',
      'parcelaAtual',
      'parcelamentoId',
      'tipo',
      'totalParcelas',
      'valor',
      'vencimento',
    ])
  })

  it('nunca expõe userId nem os timestamps internos no item da listagem', () => {
    const item = paraLancamentoListado({
      id: '11111111-1111-1111-1111-111111111111',
      tipo: 'despesa',
      descricao: 'Luz',
      valor: 4200,
      dataEmissao: null,
      vencimento: '2026-10-10',
      paga: false,
      pagoEm: null,
      parcelamentoId: null,
      parcelaAtual: null,
      totalParcelas: null,
      criadoEm: new Date('2026-10-10T00:00:00.000Z'),
    })

    expect(item).not.toHaveProperty('userId')
    expect(item).not.toHaveProperty('criadoEm')
    expect(item).not.toHaveProperty('atualizadoEm')
    expect(Object.keys(item).sort()).toEqual([
      'dataEmissao',
      'descricao',
      'id',
      'paga',
      'pagoEm',
      'parcelaAtual',
      'parcelamentoId',
      'tipo',
      'totalParcelas',
      'valor',
      'vencimento',
    ])
  })

  it('devolve a página inteira em uma única consulta, independente do volume', async () => {
    const repositorio = criarRepositorio()
    const itens = Array.from({ length: 15 }, (_, indice) => ({
      id: `id-${indice}`,
      tipo: 'receita' as const,
      descricao: `Receita ${indice}`,
      valor: 100,
      dataEmissao: '2026-10-01',
      vencimento: null,
      paga: false,
      pagoEm: null,
      parcelamentoId: null,
      parcelaAtual: null,
      totalParcelas: null,
    }))
    vi.mocked(repositorio.listar).mockResolvedValue({ itens, proximoCursor: 'proximo' })

    const resposta = await criarApp(repositorio).request('/lancamentos')

    expect(await resposta.json()).toEqual({ itens, proximoCursor: 'proximo' })
    expect(repositorio.listar).toHaveBeenCalledTimes(1)
  })
})

describe('capacidade de teste — repositorio fake de editar/excluir', () => {
  it('criarRepositorio() expoe editar e excluir mockaveis com resolvedValue e rejectedValue proprios', async () => {
    const repositorio = criarRepositorio()
    vi.mocked(repositorio.editar).mockResolvedValue([{ id: 'x', descricao: 'Editado' }])
    vi.mocked(repositorio.excluir).mockRejectedValue(new Error('falha de exclusao'))

    await expect(repositorio.editar('user-1', 'x', {}, 'somente')).resolves.toEqual([
      { id: 'x', descricao: 'Editado' },
    ])
    await expect(repositorio.excluir('user-1', 'x', 'somente')).rejects.toThrow('falha de exclusao')
  })
})
