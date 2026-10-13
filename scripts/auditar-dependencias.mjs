import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'

export function avaliarRelatorioAudit(conteudo) {
  let relatorio
  try {
    relatorio = JSON.parse(conteudo)
  } catch {
    throw new Error('JSON invalido retornado por npm audit')
  }

  const vulnerabilidades = relatorio?.metadata?.vulnerabilities
  if (!vulnerabilidades || typeof vulnerabilidades !== 'object') {
    throw new Error('Relatorio npm audit sem contagens de vulnerabilidades')
  }

  const contagens = {
    moderate: Number(vulnerabilidades.moderate ?? 0),
    high: Number(vulnerabilidades.high ?? 0),
    critical: Number(vulnerabilidades.critical ?? 0),
  }
  return { aprovado: contagens.high === 0 && contagens.critical === 0, contagens }
}

function executarNpmAudit() {
  return new Promise((resolve, reject) => {
    const windows = process.platform === 'win32'
    const comando = windows ? process.env.ComSpec ?? 'cmd.exe' : 'npm'
    const argumentos = windows ? ['/d', '/s', '/c', 'npm audit --json'] : ['audit', '--json']
    const processo = spawn(comando, argumentos, {
      cwd: process.cwd(),
    })
    let stdout = ''
    let stderr = ''
    processo.stdout.on('data', (trecho) => { stdout += trecho })
    processo.stderr.on('data', (trecho) => { stderr += trecho })
    processo.on('error', reject)
    processo.on('close', (codigo) => resolve({ codigo, stdout, stderr }))
  })
}

export async function executarAuditoria(executar = executarNpmAudit) {
  const resultado = await executar()
  if (!resultado.stdout.trim()) {
    throw new Error(`npm audit falhou sem relatorio JSON: ${resultado.stderr.trim() || `codigo ${resultado.codigo}`}`)
  }
  const avaliacao = avaliarRelatorioAudit(resultado.stdout)
  if (!avaliacao.aprovado) {
    throw new Error(
      `npm audit encontrou ${avaliacao.contagens.high} alta(s) e ${avaliacao.contagens.critical} critica(s)`,
    )
  }
  return avaliacao
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  executarAuditoria()
    .then(({ contagens }) => {
      console.log(
        `Auditoria aprovada: ${contagens.high} alta(s), ${contagens.critical} critica(s), ${contagens.moderate} moderada(s)`,
      )
    })
    .catch((erro) => {
      console.error(erro instanceof Error ? erro.message : erro)
      process.exitCode = 1
    })
}
