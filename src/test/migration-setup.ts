import { spawn } from 'node:child_process'

import { garantirBranchDeTeste } from './guardar-branch-teste.ts'

garantirBranchDeTeste()

await new Promise<void>((resolve, reject) => {
  const processo = spawn(
    process.execPath,
    ['node_modules/drizzle-kit/bin.cjs', 'migrate'],
    { cwd: process.cwd(), stdio: 'inherit', env: process.env },
  )
  processo.on('error', reject)
  processo.on('close', (codigo) => {
    if (codigo === 0) resolve()
    else reject(new Error(`Migration falhou com codigo ${codigo}`))
  })
})
