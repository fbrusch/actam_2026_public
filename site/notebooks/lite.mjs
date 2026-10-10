// JupyterLite: run trusted notebooks in the visitor's browser.
//
// JupyterLite is Jupyter compiled to static files: Python runs in the browser
// through Pyodide (WebAssembly). No server, no account. We build it into
// dist/lite/ with the trusted notebooks preloaded, at the same paths they
// have on the site, so lesson-05/notebook.ipynb opens with
//   lite/notebooks/index.html?path=lesson-05/notebook.ipynb
//
// The build runs the `jupyter-lite` command through uvx, with pinned
// versions, so it needs `uv` on the machine that builds the site.
// Set SKIP_LITE=1 to build the site without it: pages then omit "Open in the
// browser".

import { execFileSync } from 'node:child_process'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

const VERSIONS = {
  'jupyterlite-core': '0.8.6',
  'jupyterlite-pyodide-kernel': '0.8.6',
  'jupyter-server': '2.21.1', // needed by `jupyter lite` to add our notebooks
}

// Opened notebooks start the in-browser Python kernel directly.
const PYODIDE_KERNEL = { name: 'python', display_name: 'Python (Pyodide)', language: 'python' }

export const liteEnabled = () => process.env.SKIP_LITE !== '1'

export const liteHref = (root, notebookPath) =>
  `${root}lite/notebooks/index.html?path=${encodeURIComponent(notebookPath)}`

export async function buildLite({ dist, notebooks }) {
  const work = await mkdtemp(path.join(os.tmpdir(), 'actam-lite-'))
  try {
    for (const relative of notebooks) {
      const notebook = JSON.parse(await readFile(path.join(dist, relative), 'utf8'))
      notebook.metadata = { ...notebook.metadata, kernelspec: PYODIDE_KERNEL }
      const target = path.join(work, 'contents', relative)
      await mkdir(path.dirname(target), { recursive: true })
      await writeFile(target, `${JSON.stringify(notebook, null, 1)}\n`)
    }
    const [core, kernel, server] = Object.entries(VERSIONS).map(([name, version]) => `${name}==${version}`)
    execFileSync('uvx', [
      '--from', core, '--with', kernel, '--with', server,
      'jupyter-lite', 'build',
      '--contents', 'contents',
      '--output-dir', path.join(dist, 'lite'),
    ], { cwd: work, stdio: ['ignore', 'ignore', 'inherit'] })
  } finally {
    await rm(work, { recursive: true, force: true })
  }
}
