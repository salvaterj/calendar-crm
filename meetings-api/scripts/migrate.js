import '../src/loadEnv.js'
import { readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { pool } from '../src/db.js'

const migrationsDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'migrations')

async function run() {
  const files = readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort()
  for (const file of files) {
    console.log(`Aplicando ${file}...`)
    const sql = readFileSync(path.join(migrationsDir, file), 'utf8')
    await pool.query(sql)
  }
  console.log('Migrations aplicadas com sucesso.')
  await pool.end()
}

run().catch((err) => {
  console.error('Falha ao rodar migrations:', err)
  process.exit(1)
})
