import { cp, mkdtemp, rm, unlink } from 'node:fs/promises'
import { execFileSync, spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import os from 'node:os'
import path from 'node:path'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const run = (cmd, args, cwd = root) => execFileSync(cmd, args, { cwd, encoding: 'utf8', stdio: ['inherit', 'pipe', 'inherit'] }).trim()

if (run('git', ['branch', '--show-current']) !== 'main') throw new Error('Publish from main')
if (run('git', ['status', '--porcelain'])) throw new Error('Commit local changes before publishing')
run('git', ['fetch', 'origin', 'main'])
if (run('git', ['rev-parse', 'HEAD']) !== run('git', ['rev-parse', 'origin/main']))
  throw new Error('Push main before publishing')

execFileSync('npm', ['run', 'build:pages'], { cwd: root, stdio: 'inherit' })

const remote = run('git', ['remote', 'get-url', 'origin'])
const branchExists = Boolean(run('git', ['ls-remote', '--heads', 'origin', 'gh-pages']))
const temp = await mkdtemp(path.join(os.tmpdir(), 'actam-pages-'))

try {
  if (branchExists) {
    run('git', ['clone', '--quiet', '--depth', '1', '--branch', 'gh-pages', '--single-branch', remote, temp])
    const tracked = run('git', ['ls-files', '-z'], temp).split('\0').filter(Boolean)
    for (const name of tracked) await unlink(path.join(temp, name))
  } else {
    run('git', ['init', '--quiet', '-b', 'gh-pages', temp])
    run('git', ['remote', 'add', 'origin', remote], temp)
  }

  await cp(path.join(root, 'dist'), temp, { recursive: true })
  run('git', ['add', '-A'], temp)
  const changes = spawnSync('git', ['diff', '--cached', '--quiet'], { cwd: temp })
  if (changes.status === 0) {
    console.log('GitHub Pages is already up to date')
  } else if (changes.status === 1) {
    run('git', ['commit', '-m', `build: publish course site from ${run('git', ['rev-parse', '--short', 'HEAD'])}`], temp)
    run('git', ['push', '-u', 'origin', 'gh-pages'], temp)
    console.log('Published generated files to gh-pages')
  } else {
    throw new Error('Could not compare generated files')
  }
} finally {
  await rm(temp, { recursive: true, force: true })
}
