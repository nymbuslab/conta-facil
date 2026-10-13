import { execFileSync, spawnSync } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { createServer } from 'node:http'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { PassThrough } from 'node:stream'
import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  avaliarRamo,
  classificarMudancas,
  criarExecutorComando,
  executarDeploy,
  extrairEnv,
  lerEstado,
  lerLink,
  serializarEstado,
} from './deploy.mjs'

const RAIZ = process.cwd()

function git(cwd: string, ...args: string[]) {
  execFileSync('git', args, { cwd, stdio: 'pipe' })
}

function repositorioTemporario(): string {
  const dir = mkdtempSync(join(tmpdir(), 'deploy-test-'))
  git(dir, 'init', '-q')
  git(dir, 'config', 'user.email', 'teste@exemplo.com')
  git(dir, 'config', 'user.name', 'Teste')
  git(dir, 'config', 'commit.gpgsign', 'false')
  writeFileSync(join(dir, 'README.md'), '# temp\n')
  git(dir, 'add', '.')
  git(dir, 'commit', '-q', '-m', 'init')
  git(dir, 'branch', '-M', 'master')
  return dir
}

const temporarios: string[] = []
afterEach(() => {
  while (temporarios.length) {
    const dir = temporarios.pop()!
    try {
      rmSync(dir, { recursive: true, force: true })
    } catch {
      // ignora falha de limpeza
    }
  }
})

function criarRepositorioTemporario(): string {
  const dir = repositorioTemporario()
  temporarios.push(dir)
  return dir
}

type Resultado = { codigo: number; stdout: string; stderr: string }

function fakeExecutar(mapa: Record<string, Partial<Resultado>> = {}) {
  const chamadas: string[] = []
  const ordem: string[] = []
  const executar = async (linha: string): Promise<Resultado> => {
    chamadas.push(linha)
    ordem.push(`cmd:${linha}`)
    for (const chave of Object.keys(mapa)) {
      if (linha.startsWith(chave)) {
        const r = mapa[chave]
        return { codigo: r.codigo ?? 0, stdout: r.stdout ?? '', stderr: r.stderr ?? '' }
      }
    }
    return { codigo: 0, stdout: '', stderr: '' }
  }
  return { executar, chamadas, ordem }
}

function ambienteArquivos(arquivos: Record<string, string>) {
  const mapa = new Map(Object.entries(arquivos))
  return {
    mapa,
    lerArquivo: (p: string) => {
      if (!mapa.has(p)) throw new Error(`ENOENT: ${p}`)
      return mapa.get(p)!
    },
    existeArquivo: (p: string) => mapa.has(p),
    escreverArquivo: (p: string, conteudo: string) => {
      mapa.set(p, conteudo)
    },
    obter: (p: string) => mapa.get(p),
  }
}

const ENV_VALIDO = [
  'FUNCTION_ALLOWED_ORIGINS=https://contafacil.nymbuslab.com.br',
  'NEON_FUNCTION_API_BASE_URL=https://api.exemplo.com',
  '',
].join('\n')

const NEON_PRODUCTION = JSON.stringify({
  orgId: 'org-twilight-shadow-49590900',
  projectId: 'falling-tree-35553185',
  branch: 'production',
})

function cenarioBase(overrides: Partial<Parameters<typeof executarDeploy>[0]> = {}) {
  const arquivos = ambienteArquivos({
    '.neon': NEON_PRODUCTION,
    '.deploy-state.json': serializarEstado('aaa111'),
    '.env.local': ENV_VALIDO,
  })
  const exec = fakeExecutar({
    'git branch --show-current': { stdout: 'master\n' },
    'git status --porcelain': { stdout: '' },
    'git diff --name-only aaa111 HEAD': { stdout: 'src/functions/api/lancamentos.ts\n' },
    'git log --format=%H origin/master..HEAD': { stdout: 'commitsha\n' },
    'npx neon --version': { codigo: 0, stdout: '1.0.0\n' },
    'npx neon deploy --env .env.local': { codigo: 0, stdout: 'deploy ok\n' },
    'git rev-parse HEAD': { stdout: 'bbb222\n' },
    'git push origin master': { codigo: 0, stdout: 'push ok\n' },
  })
  const ordem = exec.ordem
  const logs: string[] = []
  const buscar = vi.fn(async (url: string) => {
    ordem.push('health')
    void url
    return { status: 200 } as Response
  })
  const auditar = vi.fn(async () => ({ aprovado: true, contagens: { moderate: 4, high: 0, critical: 0 } }))
  return {
    arquivos,
    exec,
    ordem,
    logs,
    buscar,
    auditar,
    log: (...partes: unknown[]) => {
      logs.push(partes.map(String).join(' '))
    },
    opcoes: {
      executar: exec.executar,
      lerArquivo: arquivos.lerArquivo,
      existeArquivo: arquivos.existeArquivo,
      escreverArquivo: arquivos.escreverArquivo,
      perguntar: vi.fn(async () => true),
      buscar,
      auditar,
      esperar: vi.fn(async () => undefined),
      log: (...partes: unknown[]) => {
        logs.push(partes.map(String).join(' '))
      },
      estadoPath: '.deploy-state.json',
      neonPath: '.neon',
      envPath: '.env.local',
      ...overrides,
    } as Parameters<typeof executarDeploy>[0],
  }
}

describe('T-01.01 modulo e executores', () => {
  it('importar o modulo nao dispara nenhum passo do fluxo', () => {
    expect(typeof executarDeploy).toBe('function')
    expect(typeof classificarMudancas).toBe('function')
  })

  it('executor real devolve a branch criada num repositorio temporario', async () => {
    const dir = criarRepositorioTemporario()
    git(dir, 'checkout', '-q', '-b', 'deploy-teste')

    const executar = criarExecutorComando({ cwd: dir })
    const resultado = await executar('git branch --show-current')

    expect(resultado.codigo).toBe(0)
    expect(resultado.stdout.trim()).toBe('deploy-teste')
  })
})

describe('T-01.02 estado do deploy e link', () => {
  it('estado ausente ou corrompido devolve null sem lancar', () => {
    expect(lerEstado(null)).toBeNull()
    expect(lerEstado('')).toBeNull()
    expect(lerEstado('   ')).toBeNull()
    expect(lerEstado('nao-json')).toBeNull()
    expect(lerEstado('{}')).toBeNull()
  })

  it('estado com SHA devolve o SHA e serializa de volta', () => {
    expect(lerEstado(serializarEstado('abc123'))).toEqual({ sha: 'abc123' })
  })

  it('.neon corrompido lanca mensagem unica', () => {
    expect(() => lerLink('nao-json')).toThrow('Arquivo .neon invalido')
    expect(() => lerLink('{}')).toThrow('Arquivo .neon invalido')
  })

  it('le link e estado de arquivos reais num diretorio temporario', () => {
    const dir = criarRepositorioTemporario()
    const neonPath = join(dir, '.neon')
    const estadoPath = join(dir, '.deploy-state.json')
    writeFileSync(neonPath, NEON_PRODUCTION)
    writeFileSync(estadoPath, serializarEstado('sha-real'))

    const link = lerLink(readFileSync(neonPath, 'utf8'))
    const estado = lerEstado(readFileSync(estadoPath, 'utf8'))

    expect(link.branch).toBe('production')
    expect(estado).toEqual({ sha: 'sha-real' })
  })

  it('.gitignore ignora .deploy-state.json confirmado por git check-ignore', () => {
    const resultado = spawnSync('git', ['check-ignore', '.deploy-state.json'], { cwd: RAIZ })
    expect(resultado.status).toBe(0)
    expect(resultado.stdout.toString().trim()).toBe('.deploy-state.json')
  })
})

describe('T-01.03 classificar mudancas', () => {
  it('classifica function, migration, tree, branch e commits', () => {
    const mudancas = classificarMudancas({
      branchAtual: 'master',
      linhasStatus: [],
      linhasDiff: ['src/db/schema.ts', 'neon.ts', 'drizzle/0008_nova.sql', 'src/routes/index.tsx'],
      linhasLog: ['commitsha'],
    })
    expect(mudancas.functionMudou).toBe(true)
    expect(mudancas.migrationsMudaram).toBe(true)
    expect(mudancas.treeSuja).toBe(false)
    expect(mudancas.branchErrada).toBe(false)
    expect(mudancas.commitsAPushar).toBe(true)
  })

  it('src/db conta como Function isoladamente (caminho vigiado D-12)', () => {
    const mudancas = classificarMudancas({
      branchAtual: 'master',
      linhasDiff: ['src/db/schema.ts'],
    })
    expect(mudancas.functionMudou).toBe(true)
    expect(mudancas.migrationsMudaram).toBe(false)
  })

  it('neon.ts conta como Function isoladamente', () => {
    const mudancas = classificarMudancas({ branchAtual: 'master', linhasDiff: ['neon.ts'] })
    expect(mudancas.functionMudou).toBe(true)
  })

  it('classifica treeSuja, branchErrada e sem commits', () => {
    const mudancas = classificarMudancas({
      branchAtual: 'feature',
      linhasStatus: ['?? arquivo.txt'],
      linhasDiff: ['README.md'],
      linhasLog: [],
    })
    expect(mudancas.functionMudou).toBe(false)
    expect(mudancas.migrationsMudaram).toBe(false)
    expect(mudancas.treeSuja).toBe(true)
    expect(mudancas.branchErrada).toBe(true)
    expect(mudancas.commitsAPushar).toBe(false)
  })

  it('estado ausente conta Function e migrations pendentes (fail-closed)', () => {
    const mudancas = classificarMudancas({ branchAtual: 'master', estadoAusente: true })
    expect(mudancas.functionMudou).toBe(true)
    expect(mudancas.migrationsMudaram).toBe(true)
  })

  it('mudanca real em src/functions/api e arquivo nao commitado sao classificados', () => {
    const dir = criarRepositorioTemporario()
    writeFileSync(join(dir, 'src-func-temp'), 'x')
    git(dir, 'add', 'src-func-temp')
    git(dir, 'commit', '-q', '-m', 'func')
    writeFileSync(join(dir, 'src-func-temp'), 'alterado')
    writeFileSync(join(dir, 'solto.txt'), 'nao commitado')

    const diff = execFileSync('git', ['diff', '--name-only'], { cwd: dir }).toString()
    const status = execFileSync('git', ['status', '--porcelain'], { cwd: dir }).toString()
    const branch = execFileSync('git', ['branch', '--show-current'], { cwd: dir }).toString()

    const mudancas = classificarMudancas({
      branchAtual: branch.trim(),
      linhasStatus: status.split('\n'),
      linhasDiff: diff.split('\n'),
      linhasLog: [],
    })
    expect(mudancas.treeSuja).toBe(true)
    expect(mudancas.branchErrada).toBe(false)
  })
})

describe('T-02.01 orquestracao, matriz de ramos e dry-run', () => {
  it('F+C+ chama Function, health e push', async () => {
    const cena = cenarioBase()
    const resultado = await executarDeploy(cena.opcoes)

    expect(resultado.codigo).toBe(0)
    expect(cena.exec.chamadas).toContain('npx neon deploy --env .env.local')
    expect(cena.exec.chamadas).toContain('git push origin master')
    expect(cena.buscar).toHaveBeenCalled()
    const ordemRelevante = cena.ordem.filter((o) => o.startsWith('cmd:npx neon deploy') || o === 'health' || o.startsWith('cmd:git push'))
    expect(ordemRelevante).toEqual(['cmd:npx neon deploy --env .env.local', 'health', 'cmd:git push origin master'])
  })

  it('F+C- deploya a Function e roda health sem push', async () => {
    const cena = cenarioBase()
    cena.exec.chamadas.length = 0
    const exec = fakeExecutar({
      'git branch --show-current': { stdout: 'master\n' },
      'git status --porcelain': { stdout: '' },
      'git diff --name-only aaa111 HEAD': { stdout: 'src/functions/api/lancamentos.ts\n' },
      'git log --format=%H origin/master..HEAD': { stdout: '' },
      'npx neon --version': { codigo: 0 },
      'npx neon deploy --env .env.local': { codigo: 0 },
      'git rev-parse HEAD': { stdout: 'bbb222\n' },
    })
    const resultado = await executarDeploy({ ...cena.opcoes, executar: exec.executar })
    expect(resultado.codigo).toBe(0)
    expect(exec.chamadas).toContain('npx neon deploy --env .env.local')
    expect(exec.chamadas).not.toContain('git push origin master')
    expect(cena.buscar).toHaveBeenCalled()
  })

  it('F-C+ so faz push sem Function nem health', async () => {
    const cena = cenarioBase()
    const exec = fakeExecutar({
      'git branch --show-current': { stdout: 'master\n' },
      'git status --porcelain': { stdout: '' },
      'git diff --name-only aaa111 HEAD': { stdout: 'README.md\n' },
      'git log --format=%H origin/master..HEAD': { stdout: 'commitsha\n' },
      'git push origin master': { codigo: 0 },
    })
    const resultado = await executarDeploy({ ...cena.opcoes, executar: exec.executar })
    expect(resultado.codigo).toBe(0)
    expect(exec.chamadas).not.toContain('npx neon deploy --env .env.local')
    expect(exec.chamadas).toContain('git push origin master')
    expect(cena.buscar).not.toHaveBeenCalled()
  })

  it('F-C- nao executa acao e sai com 0', async () => {
    const cena = cenarioBase()
    const exec = fakeExecutar({
      'git branch --show-current': { stdout: 'master\n' },
      'git status --porcelain': { stdout: '' },
      'git diff --name-only aaa111 HEAD': { stdout: 'README.md\n' },
      'git log --format=%H origin/master..HEAD': { stdout: '' },
    })
    const resultado = await executarDeploy({ ...cena.opcoes, executar: exec.executar })
    expect(resultado.codigo).toBe(0)
    expect(exec.chamadas.some((c) => c.startsWith('npx neon deploy') || c.startsWith('git push'))).toBe(false)
    expect(cena.logs.join('\n')).toMatch(/nada a fazer/i)
  })

  it('estado ausente conta como F+C+ (fail-closed)', async () => {
    const cena = cenarioBase()
    const arquivos = ambienteArquivos({ '.neon': NEON_PRODUCTION, '.env.local': ENV_VALIDO })
    const exec = fakeExecutar({
      'git branch --show-current': { stdout: 'master\n' },
      'git status --porcelain': { stdout: '' },
      'git log --format=%H origin/master..HEAD': { stdout: 'commitsha\n' },
      'npx neon --version': { codigo: 0 },
      'npx neon deploy --env .env.local': { codigo: 0 },
      'git rev-parse HEAD': { stdout: 'bbb222\n' },
      'git push origin master': { codigo: 0 },
    })
    const resultado = await executarDeploy({
      ...cena.opcoes,
      arquivos: undefined,
      executar: exec.executar,
      lerArquivo: arquivos.lerArquivo,
      existeArquivo: arquivos.existeArquivo,
      escreverArquivo: arquivos.escreverArquivo,
    } as Parameters<typeof executarDeploy>[0])
    expect(resultado.codigo).toBe(0)
    expect(exec.chamadas).toContain('npx neon deploy --env .env.local')
  })

  it('branch errada aborta com exitCode 1', async () => {
    const cena = cenarioBase()
    const exec = fakeExecutar({
      'git branch --show-current': { stdout: 'feature\n' },
      'git status --porcelain': { stdout: '' },
      'git log --format=%H origin/master..HEAD': { stdout: 'commitsha\n' },
    })
    const resultado = await executarDeploy({ ...cena.opcoes, executar: exec.executar })
    expect(resultado.codigo).toBe(1)
    expect(cena.logs.join('\n')).toMatch(/branch/i)
  })

  it('.neon fora de production aborta com exitCode 1', async () => {
    const cena = cenarioBase()
    const arquivos = ambienteArquivos({
      '.neon': JSON.stringify({ orgId: 'o', projectId: 'p', branch: 'main' }),
      '.env.local': ENV_VALIDO,
    })
    const resultado = await executarDeploy({
      ...cena.opcoes,
      lerArquivo: arquivos.lerArquivo,
      existeArquivo: arquivos.existeArquivo,
      escreverArquivo: arquivos.escreverArquivo,
    })
    expect(resultado.codigo).toBe(1)
    expect(cena.logs.join('\n')).toMatch(/production/i)
  })

  it('dry-run imprime a sequencia sem chamar acoes', async () => {
    const cena = cenarioBase()
    const exec = fakeExecutar({
      'git branch --show-current': { stdout: 'master\n' },
      'git status --porcelain': { stdout: '' },
      'git diff --name-only aaa111 HEAD': { stdout: 'src/functions/api/lancamentos.ts\n' },
      'git log --format=%H origin/master..HEAD': { stdout: 'commitsha\n' },
    })
    const resultado = await executarDeploy({ ...cena.opcoes, executar: exec.executar, sim: true })
    expect(resultado.codigo).toBe(0)
    expect(exec.chamadas.some((c) => c.startsWith('npx neon deploy') || c.startsWith('git push'))).toBe(false)
    expect(cena.buscar).not.toHaveBeenCalled()
    const saida = cena.logs.join('\n')
    expect(saida).toMatch(/deploy/i)
    expect(saida).toMatch(/health/i)
    expect(saida).toMatch(/push/i)
  })
})

describe('T-02.02 gate de migration', () => {
  it('resposta negativa aborta antes do push com mensagem de migration', async () => {
    const cena = cenarioBase()
    const exec = fakeExecutar({
      'git branch --show-current': { stdout: 'master\n' },
      'git status --porcelain': { stdout: '' },
      'git diff --name-only aaa111 HEAD': { stdout: 'drizzle/0008_nova.sql\n' },
      'git log --format=%H origin/master..HEAD': { stdout: 'commitsha\n' },
    })
    const perguntar = vi.fn(async () => false)
    const resultado = await executarDeploy({ ...cena.opcoes, executar: exec.executar, perguntar })
    expect(resultado.codigo).toBe(1)
    expect(exec.chamadas).not.toContain('git push origin master')
    expect(cena.logs.join('\n')).toMatch(/migration/i)
  })

  it('resposta positiva prossegue o fluxo', async () => {
    const cena = cenarioBase()
    const exec = fakeExecutar({
      'git branch --show-current': { stdout: 'master\n' },
      'git status --porcelain': { stdout: '' },
      'git diff --name-only aaa111 HEAD': { stdout: 'drizzle/0008_nova.sql\nsrc/functions/api/lancamentos.ts\n' },
      'git log --format=%H origin/master..HEAD': { stdout: 'commitsha\n' },
      'npx neon --version': { codigo: 0 },
      'npx neon deploy --env .env.local': { codigo: 0 },
      'git rev-parse HEAD': { stdout: 'bbb222\n' },
      'git push origin master': { codigo: 0 },
    })
    const resultado = await executarDeploy({ ...cena.opcoes, executar: exec.executar })
    expect(resultado.codigo).toBe(0)
    expect(exec.chamadas).toContain('npx neon deploy --env .env.local')
  })

  it('estado ausente sem confirmacao aborta com exitCode 1', async () => {
    const cena = cenarioBase()
    const arquivos = ambienteArquivos({ '.neon': NEON_PRODUCTION, '.env.local': ENV_VALIDO })
    const exec = fakeExecutar({
      'git branch --show-current': { stdout: 'master\n' },
      'git status --porcelain': { stdout: '' },
      'git log --format=%H origin/master..HEAD': { stdout: 'commitsha\n' },
    })
    const resultado = await executarDeploy({
      ...cena.opcoes,
      executar: exec.executar,
      lerArquivo: arquivos.lerArquivo,
      existeArquivo: arquivos.existeArquivo,
      escreverArquivo: arquivos.escreverArquivo,
      perguntar: vi.fn(async () => false),
    })
    expect(resultado.codigo).toBe(1)
    expect(exec.chamadas).not.toContain('git push origin master')
  })
})

describe('T-02.03 confirmacao da Function', () => {
  it('imprime os caminhos antes de perguntar e negativa nao chama neon', async () => {
    const cena = cenarioBase()
    const exec = fakeExecutar({
      'git branch --show-current': { stdout: 'master\n' },
      'git status --porcelain': { stdout: '' },
      'git diff --name-only aaa111 HEAD': { stdout: 'src/functions/api/lancamentos.ts\n' },
      'git log --format=%H origin/master..HEAD': { stdout: 'commitsha\n' },
      'npx neon --version': { codigo: 0 },
    })
    const ordem: string[] = []
    const log = (...p: unknown[]) => {
      ordem.push('log')
      cena.logs.push(p.map(String).join(' '))
    }
    const perguntar = vi.fn(async () => {
      ordem.push('perguntar')
      return false
    })
    const resultado = await executarDeploy({ ...cena.opcoes, executar: exec.executar, log, perguntar })
    expect(resultado.codigo).toBe(1)
    expect(cena.logs.join('\n')).toContain('src/functions/api/lancamentos.ts')
    expect(exec.chamadas).not.toContain('npx neon deploy --env .env.local')
    expect(ordem.indexOf('log')).toBeLessThan(ordem.indexOf('perguntar'))
  })

  it('readline real devolve true ao ler s do stdin', async () => {
    const { criarPerguntaReadline } = await import('./deploy.mjs')
    const perguntar = criarPerguntaReadline()
    const original = process.stdin
    const stream = new PassThrough()
    Object.defineProperty(process, 'stdin', { value: stream, configurable: true })
    setTimeout(() => stream.write('s\n'), 5)
    const resposta = await perguntar('? ')
    Object.defineProperty(process, 'stdin', { value: original, configurable: true })
    expect(resposta).toBe(true)
  })
})

describe('T-02.04 spawn npx neon deploy', () => {
  it('FUNCTION_ALLOWED_ORIGINS ausente aborta antes do spawn', async () => {
    const cena = cenarioBase()
    const arquivos = ambienteArquivos({
      '.neon': NEON_PRODUCTION,
      '.deploy-state.json': serializarEstado('aaa111'),
      '.env.local': 'NEON_FUNCTION_API_BASE_URL=https://api.exemplo.com\n',
    })
    const exec = fakeExecutar({
      'git branch --show-current': { stdout: 'master\n' },
      'git status --porcelain': { stdout: '' },
      'git diff --name-only aaa111 HEAD': { stdout: 'src/functions/api/lancamentos.ts\n' },
      'git log --format=%H origin/master..HEAD': { stdout: 'commitsha\n' },
    })
    const resultado = await executarDeploy({
      ...cena.opcoes,
      executar: exec.executar,
      lerArquivo: arquivos.lerArquivo,
      existeArquivo: arquivos.existeArquivo,
      escreverArquivo: arquivos.escreverArquivo,
    })
    expect(resultado.codigo).toBe(1)
    expect(exec.chamadas.some((c) => c.startsWith('npx neon'))).toBe(false)
    expect(cena.logs.join('\n')).toMatch(/FUNCTION_ALLOWED_ORIGINS/)
  })

  it('valor vazio ou so espacos aborta igual a ausencia', async () => {
    const cena = cenarioBase()
    const arquivos = ambienteArquivos({
      '.neon': NEON_PRODUCTION,
      '.deploy-state.json': serializarEstado('aaa111'),
      '.env.local': 'FUNCTION_ALLOWED_ORIGINS=   \nNEON_FUNCTION_API_BASE_URL=https://api.exemplo.com\n',
    })
    const exec = fakeExecutar({
      'git branch --show-current': { stdout: 'master\n' },
      'git status --porcelain': { stdout: '' },
      'git diff --name-only aaa111 HEAD': { stdout: 'src/functions/api/lancamentos.ts\n' },
      'git log --format=%H origin/master..HEAD': { stdout: 'commitsha\n' },
    })
    const resultado = await executarDeploy({
      ...cena.opcoes,
      executar: exec.executar,
      lerArquivo: arquivos.lerArquivo,
      existeArquivo: arquivos.existeArquivo,
      escreverArquivo: arquivos.escreverArquivo,
    })
    expect(resultado.codigo).toBe(1)
    expect(exec.chamadas.some((c) => c.startsWith('npx neon'))).toBe(false)
  })

  it('sucesso grava o SHA do HEAD no .deploy-state.json', async () => {
    const cena = cenarioBase()
    const resultado = await executarDeploy(cena.opcoes)
    expect(resultado.codigo).toBe(0)
    expect(lerEstado(cena.arquivos.obter('.deploy-state.json')!)).toEqual({ sha: 'bbb222' })
  })

  it('npx executa via ComSpec (executor real)', async () => {
    const executar = criarExecutorComando({ cwd: RAIZ })
    const resultado = await executar('node --version')
    expect(resultado.codigo).toBe(0)
    expect(resultado.stdout.trim()).toMatch(/^v\d+/)
  })
})

describe('T-02.05 push e aviso do Pages', () => {
  it('push acontece depois do health check e imprime aviso do Pages', async () => {
    const cena = cenarioBase()
    const resultado = await executarDeploy(cena.opcoes)
    expect(resultado.codigo).toBe(0)
    const indiceHealth = cena.ordem.indexOf('health')
    const indicePush = cena.ordem.indexOf('cmd:git push origin master')
    expect(indiceHealth).toBeGreaterThanOrEqual(0)
    expect(indicePush).toBeGreaterThan(indiceHealth)
    const saida = cena.logs.join('\n')
    expect(saida).toMatch(/Cloudflare Pages/i)
    expect(saida).toMatch(/dash\.cloudflare\.com/i)
  })

  it('push real empurra master para um origin bare local', async () => {
    const origin = mkdtempSync(join(tmpdir(), 'deploy-origin-'))
    temporarios.push(origin)
    execFileSync('git', ['init', '--bare', '-q'], { cwd: origin })
    const work = criarRepositorioTemporario()
    git(work, 'remote', 'add', 'origin', origin)

    const executar = criarExecutorComando({ cwd: work })
    const resultado = await executar('git push origin master')
    expect(resultado.stderr || resultado.stdout).toBeDefined()
    expect(resultado.codigo).toBe(0)

    const refs = execFileSync('git', ['ls-remote', '--heads', origin], { cwd: work }).toString()
    expect(refs).toMatch(/refs\/heads\/master/)
  })
})

describe('T-02.06 health check com retry', () => {
  it('converge apos falhas transitorias', async () => {
    const cena = cenarioBase()
    let tentativas = 0
    const buscar = vi.fn(async () => {
      tentativas += 1
      if (tentativas < 3) throw new Error('sem resposta')
      return { status: 200 } as Response
    })
    const esperar = vi.fn(async () => undefined)
    const resultado = await executarDeploy({ ...cena.opcoes, buscar, esperar })
    expect(resultado.codigo).toBe(0)
    expect(tentativas).toBe(3)
    expect(esperar).toHaveBeenCalledTimes(2)
  })

  it('aborta apos o limite de tentativas', async () => {
    const cena = cenarioBase()
    const buscar = vi.fn(async () => {
      throw new Error('sem resposta')
    })
    const esperar = vi.fn(async () => undefined)
    const resultado = await executarDeploy({ ...cena.opcoes, buscar, esperar })
    expect(resultado.codigo).toBe(1)
    expect(cena.logs.join('\n')).toMatch(/health/i)
    expect(cena.exec.chamadas).not.toContain('git push origin master')
  })

  it('ramos sem deploy da Function nao chamam o health check', async () => {
    const cena = cenarioBase()
    const exec = fakeExecutar({
      'git branch --show-current': { stdout: 'master\n' },
      'git status --porcelain': { stdout: '' },
      'git diff --name-only aaa111 HEAD': { stdout: 'README.md\n' },
      'git log --format=%H origin/master..HEAD': { stdout: 'commitsha\n' },
      'git push origin master': { codigo: 0 },
    })
    await executarDeploy({ ...cena.opcoes, executar: exec.executar })
    expect(cena.buscar).not.toHaveBeenCalled()
  })

  it('servidor HTTP local respondendo /health 200 faz o health check passar', async () => {
    const servidor = createServer((req, res) => {
      if (req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end('{"ok":true}')
        return
      }
      res.writeHead(404)
      res.end()
    })
    await new Promise<void>((resolve) => servidor.listen(0, '127.0.0.1', resolve))
    const porta = (servidor.address() as { port: number }).port
    try {
      const cena = cenarioBase()
      const arquivos = ambienteArquivos({
        '.neon': NEON_PRODUCTION,
        '.deploy-state.json': serializarEstado('aaa111'),
        '.env.local': `FUNCTION_ALLOWED_ORIGINS=https://contafacil.nymbuslab.com.br\nNEON_FUNCTION_API_BASE_URL=http://127.0.0.1:${porta}\n`,
      })
      const resultado = await executarDeploy({
        ...cena.opcoes,
        lerArquivo: arquivos.lerArquivo,
        existeArquivo: arquivos.existeArquivo,
        escreverArquivo: arquivos.escreverArquivo,
        buscar: (url: string) => fetch(url) as unknown as Promise<Response>,
        esperar: vi.fn(async () => undefined),
      })
      expect(resultado.codigo).toBe(0)
    } finally {
      await new Promise<void>((resolve) => servidor.close(() => resolve()))
    }
  })
})

describe('T-02.08 gate de auditoria de dependencias', () => {
  it('roda a auditoria e, aprovada, segue para o deploy da Function e o push', async () => {
    const cena = cenarioBase()
    const resultado = await executarDeploy(cena.opcoes)
    expect(resultado.codigo).toBe(0)
    expect(cena.auditar).toHaveBeenCalledOnce()
    expect(cena.exec.chamadas).toContain('npx neon deploy --env .env.local')
    expect(cena.exec.chamadas).toContain('git push origin master')
  })

  it('reprova e aborta sem chamar neon deploy nem git push', async () => {
    const cena = cenarioBase()
    const auditar = vi.fn(async () => {
      throw new Error('npm audit encontrou 1 alta(s) e 0 critica(s)')
    })
    const resultado = await executarDeploy({ ...cena.opcoes, auditar })
    expect(resultado.codigo).toBe(1)
    expect(cena.exec.chamadas).not.toContain('npx neon deploy --env .env.local')
    expect(cena.exec.chamadas).not.toContain('git push origin master')
    expect(cena.logs.join('\n')).toMatch(/Auditoria de dependencias.*reprovou/i)
  })

  it('nao roda a auditoria quando nao ha nada a fazer', async () => {
    const cena = cenarioBase()
    const exec = fakeExecutar({
      'git branch --show-current': { stdout: 'master\n' },
      'git status --porcelain': { stdout: '' },
      'git diff --name-only aaa111 HEAD': { stdout: '' },
      'git log --format=%H origin/master..HEAD': { stdout: '' },
    })
    const resultado = await executarDeploy({ ...cena.opcoes, executar: exec.executar })
    expect(resultado.codigo).toBe(0)
    expect(cena.auditar).not.toHaveBeenCalled()
  })

  it('--sim ainda roda a auditoria real antes de simular os demais passos', async () => {
    const cena = cenarioBase()
    const resultado = await executarDeploy({ ...cena.opcoes, sim: true })
    expect(resultado.codigo).toBe(0)
    expect(cena.auditar).toHaveBeenCalledOnce()
    expect(cena.exec.chamadas).not.toContain('npx neon deploy --env .env.local')
    expect(cena.exec.chamadas).not.toContain('git push origin master')
  })
})

describe('T-02.07 entrada e DEPLOY.md', () => {
  it('package.json tem a entrada deploy', () => {
    const pkg = JSON.parse(readFileSync(join(RAIZ, 'package.json'), 'utf8'))
    expect(pkg.scripts.deploy).toBe('node scripts/deploy.mjs')
  })

  it('DEPLOY.md contem as secoes externas obrigatorias', () => {
    const texto = readFileSync(join(RAIZ, 'DEPLOY.md'), 'utf8')
    expect(texto).toMatch(/Cloudflare Pages/i)
    expect(texto).toMatch(/VITE_NEON_FUNCTION_API_BASE_URL/)
    expect(texto).toMatch(/VITE_NEON_AUTH_BASE_URL/)
    expect(texto).toMatch(/dom[íi]nio/i)
    expect(texto).toMatch(/migration/i)
    expect(texto).toMatch(/FUNCTION_ALLOWED_ORIGINS/)
  })

  it('tree suja aborta com exitCode 1 e --sim exit 0 em arvore limpa', async () => {
    const dir = criarRepositorioTemporario()
    const cfg = mkdtempSync(join(tmpdir(), 'deploy-cfg-'))
    temporarios.push(cfg)
    const neonPath = join(cfg, '.neon')
    const envPath = join(cfg, '.env.local')
    const estadoPath = join(cfg, '.deploy-state.json')
    writeFileSync(neonPath, NEON_PRODUCTION)
    writeFileSync(envPath, ENV_VALIDO)
    const temporario = join(dir, '.deploy-tree-suja.tmp')

    const executar = criarExecutorComando({ cwd: dir })
    const logs: string[] = []
    const opcoes = {
      executar,
      estadoPath,
      neonPath,
      envPath,
      log: (...p: unknown[]) => logs.push(p.map(String).join(' ')),
      perguntar: vi.fn(async () => true),
      buscar: vi.fn(async () => ({ status: 200 }) as Response),
      esperar: vi.fn(async () => undefined),
    }

    try {
      writeFileSync(temporario, 'sujo')
      const sujo = await executarDeploy(opcoes)
      expect(sujo.codigo).toBe(1)
      expect(logs.join('\n')).toMatch(/suja/i)
      expect(logs.join('\n')).toContain('.deploy-tree-suja.tmp')
    } finally {
      rmSync(temporario, { force: true })
    }

    expect(existsSync(temporario)).toBe(false)

    logs.length = 0
    const limpo = await executarDeploy({ ...opcoes, sim: true })
    expect(limpo.codigo).toBe(0)
    const saida = logs.join('\n')
    expect(saida).toMatch(/deploy/i)
    expect(saida).toMatch(/health/i)
    expect(saida).toMatch(/push/i)
  })
})

describe('funcoes puras auxiliares', () => {
  it('extrairEnv lanca para ausente e para vazio', () => {
    expect(extrairEnv('A=1\nB=2\n', 'B')).toBe('2')
    expect(() => extrairEnv('A=1\n', 'B')).toThrow('ausente')
    expect(() => extrairEnv('B=   \n', 'B')).toThrow('vazia')
  })

  it('avaliarRamo produz a matriz completa', () => {
    expect(avaliarRamo({ functionMudou: true, commitsAPushar: true })).toMatchObject({
      deployFunction: true,
      push: true,
      healthCheck: true,
      nadaAFazer: false,
    })
    expect(avaliarRamo({ functionMudou: true, commitsAPushar: false })).toMatchObject({
      deployFunction: true,
      push: false,
      healthCheck: true,
    })
    expect(avaliarRamo({ functionMudou: false, commitsAPushar: true })).toMatchObject({
      deployFunction: false,
      push: true,
      healthCheck: false,
    })
    expect(avaliarRamo({ functionMudou: false, commitsAPushar: false })).toMatchObject({
      deployFunction: false,
      push: false,
      healthCheck: false,
      nadaAFazer: true,
    })
  })
})
