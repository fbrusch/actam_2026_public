// Give every published notebook its own page, and make trusted ones runnable.
//
// Called by site/build.mjs once dist/ holds all the site's files:
//
//   1. find every .ipynb in dist/;
//   2. decide which are trusted, using catalog.mjs (and its sha256 pins);
//   3. build JupyterLite with the trusted notebooks (lite.mjs);
//   4. write a read-only page next to each notebook (view.mjs):
//        lesson-05/notebook.ipynb  ->  lesson-05/notebook/index.html
//
// Links to a notebook should point to its page; the page offers the download.

import { createHash } from 'node:crypto'
import { cp, mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { TRUSTED } from './catalog.mjs'
import { buildLite, liteEnabled, liteHref } from './lite.mjs'
import { prepareViewer, renderNotebookPage } from './view.mjs'

export async function publishNotebooks({ root, dist }) {
  const found = (await findNotebooks(dist)).sort()
  const trusted = await trustedNotebooks(dist, found)
  const runnable = liteEnabled() && trusted.size > 0

  if (runnable) await buildLite({ dist, notebooks: [...trusted.keys()] })
  await copyKatexStyles(root, dist)
  await prepareViewer()

  for (const relative of found) {
    const depth = relative.split('/').length // lesson-05/notebook.ipynb -> page two levels down
    const siteRoot = '../'.repeat(depth)
    const title = trusted.get(relative)?.title ?? defaultTitle(relative)
    const page = renderNotebookPage({
      notebook: JSON.parse(await readFile(path.join(dist, relative), 'utf8')),
      title,
      crumbs: breadcrumb(relative, siteRoot, title),
      root: siteRoot,
      downloadHref: `../${path.posix.basename(relative)}`,
      downloadName: `actam-${relative.replace(/\.ipynb$/, '').replaceAll('/', '-')}.ipynb`,
      openHref: runnable && trusted.has(relative) ? liteHref(siteRoot, relative) : null,
    })
    const pageDir = path.join(dist, relative.replace(/\.ipynb$/, ''))
    await mkdir(pageDir, { recursive: true })
    await writeFile(path.join(pageDir, 'index.html'), page)
  }
  console.log(`Notebook pages: ${found.length} (${runnable ? trusted.size : 0} runnable in the browser)`)
}

async function findNotebooks(dist, folder = '') {
  const found = []
  for (const entry of await readdir(path.join(dist, folder), { withFileTypes: true })) {
    const relative = path.posix.join(folder, entry.name)
    if (entry.isDirectory() && relative !== 'lite') found.push(...await findNotebooks(dist, relative))
    else if (entry.isFile() && entry.name.endsWith('.ipynb')) found.push(relative)
  }
  return found
}

// Catalog entries whose file is published, and unchanged if pinned by sha256.
async function trustedNotebooks(dist, found) {
  const trusted = new Map()
  for (const entry of TRUSTED) {
    if (!found.includes(entry.path)) continue
    if (entry.sha256) {
      const digest = createHash('sha256').update(await readFile(path.join(dist, entry.path))).digest('hex')
      if (digest !== entry.sha256) {
        console.warn(`${entry.path} changed since it was reviewed: published read-only.`)
        continue
      }
    }
    trusted.set(entry.path, entry)
  }
  return trusted
}

// "lesson-04/submissions/notebooks/group-03.ipynb" -> "Group 03"
function defaultTitle(relative) {
  const stem = path.posix.basename(relative, '.ipynb').replace(/[-_]+/g, ' ')
  return stem.charAt(0).toUpperCase() + stem.slice(1)
}

// ACTAM › Lesson 04 › Submissions › Group 03
function breadcrumb(relative, siteRoot, title) {
  const crumbs = [{ label: 'ACTAM', href: siteRoot }]
  const [first, ...rest] = relative.split('/')
  const lesson = first.match(/^lesson-(\d+)$/)
  if (lesson) crumbs.push({ label: `Lesson ${lesson[1]}`, href: `${siteRoot}#${first}` })
  if (rest[0] === 'submissions') crumbs.push({ label: 'Submissions', href: `${siteRoot}${first}/submissions/` })
  crumbs.push({ label: title, href: null })
  return crumbs
}

async function copyKatexStyles(root, dist) {
  const katex = path.join(root, 'node_modules', 'katex', 'dist')
  const target = path.join(dist, 'assets', 'katex')
  await mkdir(target, { recursive: true })
  await cp(path.join(katex, 'katex.min.css'), path.join(target, 'katex.min.css'))
  await cp(path.join(katex, 'fonts'), path.join(target, 'fonts'), { recursive: true })
}
