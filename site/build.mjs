import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { parseSync } from '@slidev/parser'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')
const lesson = path.join(root, 'lesson-01')
const basePath = process.env.SITE_BASE_PATH || '/'
if (!/^\/(?:[A-Za-z0-9._-]+\/)*$/.test(basePath)) {
  throw new Error(`Invalid SITE_BASE_PATH: ${basePath}`)
}

await rm(dist, { recursive: true, force: true })
await mkdir(dist, { recursive: true })
await cp(path.join(root, 'site/index.html'), path.join(dist, 'index.html'))
await writeFile(path.join(dist, '.nojekyll'), '')
if (process.env.SITE_CUSTOM_DOMAIN) {
  if (!/^[a-z0-9.-]+$/i.test(process.env.SITE_CUSTOM_DOMAIN)) {
    throw new Error(`Invalid SITE_CUSTOM_DOMAIN: ${process.env.SITE_CUSTOM_DOMAIN}`)
  }
  await writeFile(path.join(dist, 'CNAME'), `${process.env.SITE_CUSTOM_DOMAIN}\n`)
}

execFileSync(
  path.join(root, 'node_modules/.bin/slidev'),
  ['build', 'introduction/content.md', '--base', `${basePath}slides/`, '--out', path.join(dist, 'slides'), '--without-notes'],
  { cwd: root, stdio: 'inherit' },
)

await mkdir(path.join(dist, 'lesson-01'), { recursive: true })
await cp(path.join(lesson, 'notebook.ipynb'), path.join(dist, 'lesson-01', 'notebook.ipynb'))
execFileSync(
  path.join(root, 'node_modules/.bin/slidev'),
  ['build', 'slides.md', '--base', `${basePath}lesson-01/slides/`, '--out', path.join(dist, 'lesson-01', 'slides'), '--without-notes'],
  { cwd: lesson, stdio: 'inherit' },
)

// Slidev uses history URLs (/slides/1, /slides/2, ...). Give every slide
// a static entry point so direct links and browser refreshes work too.
const source = await readFile(path.join(root, 'introduction/content.md'), 'utf8')
const slideCount = parseSync(source).slides.length
await Promise.all(Array.from({ length: slideCount }, async (_, index) => {
  const slideDir = path.join(dist, 'slides', String(index + 1))
  await mkdir(slideDir, { recursive: true })
  await cp(path.join(dist, 'slides/index.html'), path.join(slideDir, 'index.html'))
}))

const lessonSource = await readFile(path.join(lesson, 'slides.md'), 'utf8')
const lessonSlideCount = parseSync(lessonSource).slides.length
await Promise.all(Array.from({ length: lessonSlideCount }, async (_, index) => {
  const slideDir = path.join(dist, 'lesson-01', 'slides', String(index + 1))
  await mkdir(slideDir, { recursive: true })
  await cp(path.join(dist, 'lesson-01', 'slides', 'index.html'), path.join(slideDir, 'index.html'))
}))
