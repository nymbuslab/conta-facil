import { spawn } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { createInterface } from 'node:readline'
import { fileURLToPath } from 'node:url'

import { executarAuditoria } from './auditar-dependencias.mjs'

export const BRANCH_GIT_PRODUCAO = 'master'
export const BRANCH_LINK_PRODUCAO = 'production'
export const CHAVE_ORIGENS = 'FUNCTION_ALLOWED_ORIGINS'
export const CHAVE_API_BASE = 'NEON_FUNCTION_API_BASE_URL'
export const CAMINHOS_FUNCTION = ['src/functions/api/', 'neon.ts', 'src/db/']
export const CAMINHOS_MIGRATION = ['drizzle/']
export const MAX_TENTATIVAS_HEALTH = 12
export const ESPERA_HEALTH_MS = 5000

export function lerEstado(conteudo) {
  if (conteudo == null || String(conteudo).trim() === '') return null
  let dados
  try {
    dados = JSON.parse(conteudo)
  } catch {
    return null
  }
  if (!dados || typeof dados.sha !== 'string' || dados.sha.trim() === '') return null
  return { sha: dados.sha.trim() }
}

export function serializarEstado(sha) {
  return `${JSON.stringify({ sha }, null, 2)}\n`
}

export function lerLink(conteudo) {
  let dados
  try {
    dados = JSON.parse(conteudo)
  } catch {
    throw new Error('Arquivo .neon invalido: JSON malformado')
  }
  if (!dados || !dados.orgId || !dados.projectId || !dados.branch) {
    throw new Error('Arquivo .neon invalido: faltam orgId, projectId ou branch')
  }
  return { orgId: dados.orgId, projectId: dados.projectId, branch: dados.branch }
}

export function extrairEnv(conteudo, chave = CHAVE_ORIGENS) {
  const linha = linhas(conteudo).find((item) => item.startsWith(`${chave}=`))
  if (!linha) throw new Error(`${chave} ausente no arquivo de ambiente`)
  const valor = linha.slice(chave.length + 1).trim()
  if (valor === '') throw new Error(`${chave} vazia no arquivo de ambiente`)
  return valor
}

export function classificarMudancas({
  branchAtual,
  linhasStatus = [],
  linhasDiff = [],
  linhasLog = [],
  estadoAusente = false,
  caminhosFunction = CAMINHOS_FUNCTION,
  caminhosMigration = CAMINHOS_MIGRATION,
} = {}) {
  const pertence = (caminho, prefixos) =>
    prefixos.some((prefixo) => (prefixo.endsWith('/') ? caminho.startsWith(prefixo) : caminho === prefixo))
  const arquivos = paraLista(linhasDiff)
  return {
    branchErrada: branchAtual !== BRANCH_GIT_PRODUCAO,
    treeSuja: paraLista(linhasStatus).length > 0,
    commitsAPushar: paraLista(linhasLog).length > 0,
    functionMudou: estadoAusente || arquivos.some((caminho) => pertence(caminho, caminhosFunction)),
    migrationsMudaram: estadoAusente || arquivos.some((caminho) => pertence(caminho, caminhosMigration)),
  }
}

export function avaliarRamo({ functionMudou, commitsAPushar }) {
  const deployFunction = Boolean(functionMudou)
  const push = Boolean(commitsAPushar)
  return { deployFunction, push, healthCheck: deployFunction, nadaAFazer: !deployFunction && !push }
}

export function criarExecutorComando({ cwd = process.cwd() } = {}) {
  return (linhaComando, opcoes = {}) =>
    new Promise((resolve, reject) => {
      const windows = process.platform === 'win32'
      const comando = windows ? process.env.ComSpec ?? 'cmd.exe' : 'sh'
      const argumentos = windows ? ['/d', '/s', '/c', linhaComando] : ['-c', linhaComando]
      const processo = spawn(comando, argumentos, { cwd: opcoes.cwd ?? cwd, env: process.env })
      let stdout = ''
      let stderr = ''
      processo.stdout.on('data', (trecho) => {
        stdout += trecho
      })
      processo.stderr.on('data', (trecho) => {
        stderr += trecho
      })
      processo.on('error', reject)
      processo.on('close', (codigo) => resolve({ codigo, stdout, stderr }))
    })
}

export function criarPerguntaReadline() {
  return (pergunta) =>
    new Promise((resolve) => {
      const rl = createInterface({ input: process.stdin, output: process.stdout })
      rl.question(pergunta, (resposta) => {
        rl.close()
        resolve(/^s(im)?$/i.test(resposta.trim()))
      })
    })
}

function paraLista(valor) {
  if (Array.isArray(valor)) return valor.map((item) => String(item).trim()).filter(Boolean)
  return String(valor ?? '')
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean)
}

function linhas(valor) {
  return String(valor ?? '')
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean)
}

function arquivosDeStatus(linhasStatus) {
  return linhasStatus.map((linha) => linha.replace(/^\S+\s+/, '').trim()).filter(Boolean)
}

function abortar(log, mensagem) {
  log(`ABORTADO: ${mensagem}`)
  return { codigo: 1 }
}

export async function executarDeploy(opcoes = {}) {
  const sim = Boolean(opcoes.sim)
  const executar = opcoes.executar ?? criarExecutorComando()
  const lerArquivo = opcoes.lerArquivo ?? ((caminho) => readFileSync(caminho, 'utf8'))
  const existeArquivo = opcoes.existeArquivo ?? ((caminho) => existsSync(caminho))
  const escreverArquivo = opcoes.escreverArquivo ?? ((caminho, conteudo) => writeFileSync(caminho, conteudo))
  const perguntar = opcoes.perguntar ?? criarPerguntaReadline()
  const buscar = opcoes.buscar ?? ((url) => globalThis.fetch(url))
  const esperar = opcoes.esperar ?? ((ms) => new Promise((resolve) => setTimeout(resolve, ms)))
  const auditar = opcoes.auditar ?? executarAuditoria
  const log = opcoes.log ?? ((...partes) => console.log(...partes))
  const estadoPath = opcoes.estadoPath ?? '.deploy-state.json'
  const neonPath = opcoes.neonPath ?? '.neon'
  const envPath = opcoes.envPath ?? '.env.local'

  const resBranch = await executar('git branch --show-current')
  const branchAtual = resBranch.stdout.trim()

  const resStatus = await executar('git status --porcelain')
  const linhasStatus = paraLista(resStatus.stdout)

  let link
  try {
    link = lerLink(lerArquivo(neonPath))
  } catch (erro) {
    return abortar(log, `Nao consegui ler o link do Neon (${neonPath}): ${erro.message}`)
  }

  const estado = existeArquivo(estadoPath) ? lerEstado(lerArquivo(estadoPath)) : null

  let linhasDiff = []
  let estadoAusente = false
  if (estado?.sha) {
    const resDiff = await executar(`git diff --name-only ${estado.sha} HEAD`)
    linhasDiff = paraLista(resDiff.stdout)
  } else {
    estadoAusente = true
  }

  const resLog = await executar(`git log --format=%H origin/${BRANCH_GIT_PRODUCAO}..HEAD`)
  const linhasLog = resLog.codigo === 0 ? paraLista(resLog.stdout) : ['desconhecido']

  const mudancas = classificarMudancas({ branchAtual, linhasStatus, linhasDiff, linhasLog, estadoAusente })

  if (mudancas.branchErrada) {
    return abortar(log, `Branch atual "${branchAtual || '(detached)'}" nao e ${BRANCH_GIT_PRODUCAO}; troque de branch antes de deployar`)
  }
  if (mudancas.treeSuja) {
    const sujos = arquivosDeStatus(linhasStatus)
    return abortar(log, `Working tree suja (${sujos.join(', ')}); commite ou guarde as mudancas antes do deploy`)
  }
  if (link.branch !== BRANCH_LINK_PRODUCAO) {
    return abortar(log, `Link do Neon aponta para "${link.branch}", esperado ${BRANCH_LINK_PRODUCAO} (rode npx neon link na branch de producao)`)
  }

  const ramo = avaliarRamo(mudancas)

  if (ramo.nadaAFazer) {
    log('Nada a fazer: sem mudanca na Function e sem commits a pushar.')
    return { codigo: 0, ramo, sim }
  }

  try {
    const avaliacao = await auditar()
    log(`Auditoria de dependencias OK: ${avaliacao.contagens.high} alta(s), ${avaliacao.contagens.critical} critica(s), ${avaliacao.contagens.moderate} moderada(s).`)
  } catch (erro) {
    return abortar(log, `Auditoria de dependencias (npm audit) reprovou: ${erro.message}`)
  }

  if (mudancas.migrationsMudaram) {
    log('Migration pendente detectada (arquivos em drizzle/). Aplique em production ANTES de publicar a Function.')
    if (!sim) {
      const confirmado = await perguntar('A migration ja foi aplicada em production? (s/N) ')
      if (!confirmado) {
        return abortar(log, 'Migration pendente nao confirmada; abortando antes de qualquer acao')
      }
    }
  }

  if (ramo.deployFunction && !ramo.push) {
    log('Aviso: nada a pushar; o push do frontend sera pulado.')
  }

  let shaDeploy = null
  if (ramo.deployFunction) {
    try {
      extrairEnv(lerArquivo(envPath), CHAVE_ORIGENS)
    } catch (erro) {
      return abortar(log, `${erro.message}; abortando antes do deploy da Function`)
    }

    if (sim) {
      log(`SIM: npx neon deploy --env ${envPath}`)
    } else {
      const resVersao = await executar('npx neon --version')
      if (resVersao.codigo !== 0) {
        return abortar(log, 'CLI do Neon indisponivel (npx neon --version falhou)')
      }
      const caminhosMudados = linhasDiff.length ? linhasDiff.join(', ') : '(estado ausente: tudo e considerado pendente)'
      log(`Function mudou. Caminhos: ${caminhosMudados}`)
      const confirmado = await perguntar('Executar o deploy da Function agora? (s/N) ')
      if (!confirmado) {
        return abortar(log, 'Deploy da Function nao confirmado; abortando antes do push')
      }
      const resDeploy = await executar(`npx neon deploy --env ${envPath}`)
      if (resDeploy.codigo !== 0) {
        return abortar(log, `npx neon deploy falhou: ${(resDeploy.stderr || resDeploy.stdout).trim() || `codigo ${resDeploy.codigo}`}`)
      }
      const resHead = await executar('git rev-parse HEAD')
      shaDeploy = resHead.stdout.trim()
      escreverArquivo(estadoPath, serializarEstado(shaDeploy))
    }
  }

  if (ramo.healthCheck) {
    if (sim) {
      log('SIM: GET /health da Function apos espera de propagacao')
    } else {
      let base
      try {
        base = extrairEnv(lerArquivo(envPath), CHAVE_API_BASE)
      } catch (erro) {
        return abortar(log, `${erro.message}; nao consigo verificar a Function`)
      }
      const url = `${base.replace(/\/$/, '')}/health`
      let saudavel = false
      for (let tentativa = 1; tentativa <= MAX_TENTATIVAS_HEALTH; tentativa += 1) {
        try {
          const resposta = await buscar(url)
          if (resposta && resposta.status === 200) {
            saudavel = true
            break
          }
        } catch {
          // tenta de novo
        }
        if (tentativa < MAX_TENTATIVAS_HEALTH) await esperar(ESPERA_HEALTH_MS)
      }
      if (!saudavel) {
        return abortar(log, `Health check da Function falhou apos ${MAX_TENTATIVAS_HEALTH} tentativas; push nao sera executado`)
      }
      log('Health check da Function OK.')
    }
  }

  if (ramo.push) {
    if (sim) {
      log('SIM: git push origin master')
    } else {
      const resPush = await executar(`git push origin ${BRANCH_GIT_PRODUCAO}`)
      if (resPush.codigo !== 0) {
        return abortar(log, `git push falhou: ${(resPush.stderr || resPush.stdout).trim() || `codigo ${resPush.codigo}`}`)
      }
      log('Push executado. O build do Cloudflare Pages foi disparado; acompanhe em https://dash.cloudflare.com (projeto conta-facil).')
    }
  }

  if (sim) log('Dry-run concluido sem executar acoes.')
  return { codigo: 0, ramo, sim, shaDeploy }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const sim = process.argv.includes('--sim')
  executarDeploy({ sim })
    .then(({ codigo }) => {
      process.exitCode = codigo ?? 0
    })
    .catch((erro) => {
      console.error(erro instanceof Error ? erro.message : erro)
      process.exitCode = 1
    })
}
