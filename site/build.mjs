import { access, cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { parseSync } from '@slidev/parser'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')
const publicLayout = await exists(path.join(root, 'lesson-01'))
const introduction = publicLayout
  ? path.join(root, 'introduction', 'content.md')
  : path.join(root, 'introduction', 'publish', 'content.md')
const lesson01 = publicLayout
  ? path.join(root, 'lesson-01')
  : path.join(root, 'lesson_01', 'publish', 'lesson-01')
const lesson02 = publicLayout
  ? path.join(root, 'lesson-02')
  : path.join(root, 'lesson_02', 'publish', 'lesson-02')
const exerciseFolder = publicLayout && await exists(path.join(root, 'lab-01'))
  ? path.join(root, 'lab-01')
  : lesson01
const basePath = process.env.SITE_BASE_PATH || '/'

if (!/^\/(?:[A-Za-z0-9._-]+\/)*$/.test(basePath)) {
  throw new Error(`Invalid SITE_BASE_PATH: ${basePath}`)
}

await rm(dist, { recursive: true, force: true })
await mkdir(dist, { recursive: true })
await cp(path.join(root, 'site', 'index.html'), path.join(dist, 'index.html'))
await writeFile(path.join(dist, '.nojekyll'), '')

if (process.env.SITE_CUSTOM_DOMAIN) {
  if (!/^[a-z0-9.-]+$/i.test(process.env.SITE_CUSTOM_DOMAIN)) {
    throw new Error(`Invalid SITE_CUSTOM_DOMAIN: ${process.env.SITE_CUSTOM_DOMAIN}`)
  }
  await writeFile(path.join(dist, 'CNAME'), `${process.env.SITE_CUSTOM_DOMAIN}\n`)
}

function buildSlides(source, cwd, base, out) {
  execFileSync(
    path.join(root, 'node_modules', '.bin', 'slidev'),
    ['build', source, '--base', base, '--out', out, '--without-notes'],
    { cwd, stdio: 'inherit' },
  )
}

buildSlides(
  path.relative(root, introduction),
  root,
  `${basePath}slides/`,
  path.join(dist, 'slides'),
)

for (const [slug, folder, includeExercise] of [
  ['lesson-01', lesson01, false],
  ['lesson-02', lesson02, false],
]) {
  await mkdir(path.join(dist, slug), { recursive: true })
  await cp(path.join(folder, 'notebook.ipynb'), path.join(dist, slug, 'notebook.ipynb'))
  buildSlides(
    'slides.md',
    folder,
    `${basePath}${slug}/slides/`,
    path.join(dist, slug, 'slides'),
  )
  if (includeExercise) {
    buildSlides(
      'exercise.md',
      folder,
      `${basePath}${slug}/exercise/`,
      path.join(dist, slug, 'exercise'),
    )
  }
}

buildSlides(
  'exercise.md',
  exerciseFolder,
  `${basePath}lesson-01/exercise/`,
  path.join(dist, 'lesson-01', 'exercise'),
)

if (process.env.SITE_ANALYTICS_TOKEN) {
  const token = process.env.SITE_ANALYTICS_TOKEN
  if (!/^[a-f0-9]{32}$/i.test(token)) throw new Error('Invalid SITE_ANALYTICS_TOKEN')
  const snippet = `<script type="module" src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='${JSON.stringify({ token, spa: false })}'></script>`
  const pages = [
    'index.html',
    'slides/index.html',
    'lesson-01/slides/index.html',
    'lesson-01/exercise/index.html',
    'lesson-02/slides/index.html',
  ]
  for (const file of pages) {
    const target = path.join(dist, file)
    const html = await readFile(target, 'utf8')
    if (!html.includes('</body>')) throw new Error(`Missing body closing tag in ${file}`)
    await writeFile(target, html.replace('</body>', `  ${snippet}\n</body>`))
  }
}

const slideRoutes = [
  ['slides', introduction, ''],
  ['lesson-01/slides', lesson01, 'slides.md'],
  ['lesson-02/slides', lesson02, 'slides.md'],
  ['lesson-01/exercise', exerciseFolder, 'exercise.md'],
]
for (const [route, folder, source] of slideRoutes) {
  const count = parseSync(await readFile(source ? path.join(folder, source) : folder, 'utf8')).slides.length
  const indexPage = path.join(dist, route, 'index.html')
  await Promise.all(Array.from({ length: count }, async (_, index) => {
    const slideDir = path.join(dist, route, String(index + 1))
    await mkdir(slideDir, { recursive: true })
    await cp(indexPage, path.join(slideDir, 'index.html'))
  }))
}

async function exists(file) {
  try {
    await access(file)
    return true
  } catch {
    return false
  }
}
