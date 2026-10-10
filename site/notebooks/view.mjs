// The notebook page component: one .ipynb in, one static HTML page out.
//
// The page shows the notebook as it is written: markdown cells (with
// formulas) and code cells (highlighted). It never runs anything and never
// shows outputs. A bar at the top offers "Download .ipynb" and, for trusted
// notebooks only, "Open in the browser".
//
// The same component renders our notebooks and students' ones, so it treats
// every notebook as untrusted text:
// - in untrusted notebooks raw HTML in markdown is shown as text
//   (markdown-it with html: false); javascript: links are always refused;
// - images are dropped from untrusted notebooks, so a page cannot load
//   anything from elsewhere;
// - formulas go through KaTeX with `trust: false`;
// - the page carries a Content-Security-Policy that forbids every script,
//   so even HTML in a trusted notebook cannot run code.
//
// markdown-it, shiki and KaTeX come with Slidev, already a dependency.

import MarkdownIt from 'markdown-it'
import katex from 'katex'
import { createHighlighter } from 'shiki'

const THEME = 'github-light'
let highlighter

// Load the syntax highlighter once, before rendering any page.
export async function prepareViewer() {
  highlighter ??= await createHighlighter({ themes: [THEME], langs: ['python'] })
}

const escapeHtml = (text) => String(text)
  .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;').replaceAll("'", '&#39;')

function highlight(code, lang = 'python') {
  if (lang === 'python' || lang === 'py' || lang === '') {
    return highlighter.codeToHtml(code, { lang: 'python', theme: THEME })
  }
  return `<pre class="plain"><code>${escapeHtml(code)}</code></pre>`
}

function markdownRenderer({ trusted }) {
  const md = new MarkdownIt({
    html: trusted, // our own notebooks use a little HTML, e.g. <details>
    linkify: true,
    highlight: (code, lang) => highlight(code, (lang || '').trim().toLowerCase()),
  })
  if (!trusted) md.disable('image')
  return md
}

// Formulas: $…$ and $$…$$ outside code. Each formula is swapped for a plain
// placeholder before markdown runs, then replaced by KaTeX's HTML after.
const MATH = /\$\$([\s\S]+?)\$\$|\$(?![\s$])([^$\n]+?)(?<!\s)\$/g
const CODE = /(```[\s\S]*?```|`[^`\n]*`)/

function renderMarkdown(md, text) {
  const formulas = []
  const protectedText = text.split(CODE).map((part, i) => i % 2 ? part : part.replace(MATH, (_, block, inline) => {
    formulas.push(katex.renderToString(block ?? inline, {
      displayMode: block !== undefined, throwOnError: false, trust: false,
      strict: 'ignore', maxExpand: 1000, maxSize: 10, output: 'html',
    }))
    return `MATHPLACEHOLDER${formulas.length - 1}X`
  })).join('')
  return md.render(protectedText).replace(/MATHPLACEHOLDER(\d+)X/g, (text, i) => formulas[Number(i)] ?? text)
}

const source = (cell) => Array.isArray(cell.source) ? cell.source.join('') : String(cell.source ?? '')

export function renderNotebookPage({ notebook, title, crumbs, root, downloadHref, downloadName, openHref }) {
  const trusted = Boolean(openHref)
  const md = markdownRenderer({ trusted })
  const cells = (notebook.cells ?? []).map((cell) => {
    const text = source(cell)
    if (!text.trim()) return ''
    if (cell.cell_type === 'code') return `<section class="cell code">${highlight(text)}</section>`
    if (cell.cell_type === 'markdown') return `<section class="cell markdown">${renderMarkdown(md, text)}</section>`
    return `<section class="cell raw"><pre class="plain"><code>${escapeHtml(text)}</code></pre></section>`
  }).join('\n')

  const trail = crumbs.map(({ label, href }, i) => i === crumbs.length - 1
    ? `<li><span aria-current="page">${escapeHtml(label)}</span></li>`
    : `<li><a href="${escapeHtml(href)}">${escapeHtml(label)}</a></li>`).join('')

  const open = trusted
    ? `<a class="button primary" href="${escapeHtml(openHref)}">Open in the browser</a>`
    : ''
  const note = trusted
    ? '<p class="hint">“Open in the browser” runs the notebook on your computer with JupyterLite: no installation, no account. Your changes stay in that browser: download the notebook to keep them.</p>'
    : '<p class="hint">This notebook comes from outside the course materials: it is shown here to read, not to run.</p>'

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data:; base-uri 'none'; form-action 'none'">
  <meta name="theme-color" content="#f7f5ef">
  <title>${escapeHtml(crumbs.slice(1).map((c) => c.label).join(' · '))} · ACTAM</title>
  <link rel="stylesheet" href="${root}assets/katex/katex.min.css">
  <style>${STYLE}</style>
</head>
<body>
<main>
  <nav class="crumbs" aria-label="Breadcrumb"><ol>${trail}</ol></nav>
  <h1>${escapeHtml(title)}</h1>
  <div class="bar">
    <a class="button" href="${escapeHtml(downloadHref)}" download="${escapeHtml(downloadName)}">Download .ipynb</a>
    ${open}
  </div>
  ${note}
  <article class="notebook">
${cells}
  </article>
</main>
</body>
</html>
`
}

const STYLE = `
:root { color-scheme: light; color: #182f3a; background: #f7f5ef; font-family: system-ui, -apple-system, "Segoe UI", sans-serif; }
* { box-sizing: border-box; }
body { margin: 0; background: #f7f5ef; }
main { max-width: 900px; margin: auto; padding: 40px 24px 80px; }
.crumbs ol { display: flex; flex-wrap: wrap; gap: 0 .6em; margin: 0; padding: 0; list-style: none; font: .8rem ui-monospace, Menlo, monospace; letter-spacing: .12em; text-transform: uppercase; color: #42666a; }
.crumbs li + li::before { content: '›'; margin-right: .6em; }
.crumbs a { color: inherit; text-decoration: none; }
.crumbs a:hover { text-decoration: underline; }
h1 { font: 700 clamp(2rem, 6vw, 3.4rem)/1.08 ui-monospace, Menlo, monospace; letter-spacing: -.05em; margin: 22px 0 18px; }
.bar { display: flex; flex-wrap: wrap; gap: 10px; }
.button { font: .9rem ui-monospace, Menlo, monospace; padding: 9px 14px; border: 1px solid #087e83; color: #087e83; text-decoration: none; background: #fff; }
.button.primary { background: #087e83; color: #fff; }
.button:focus-visible { outline: 3px solid #cb4f38; outline-offset: 3px; }
.hint { color: #42666a; font-size: .85rem; line-height: 1.5; margin: 12px 0 28px; max-width: 640px; }
.cell { margin: 0 0 14px; }
.markdown { line-height: 1.65; }
.markdown h1, .markdown h2, .markdown h3 { font-family: ui-monospace, Menlo, monospace; letter-spacing: -.02em; line-height: 1.2; margin: 1.6em 0 .5em; }
.markdown h1 { font-size: 1.8rem; } .markdown h2 { font-size: 1.4rem; } .markdown h3 { font-size: 1.1rem; }
.markdown code { font: .88em ui-monospace, Menlo, monospace; background: #e5ece6; color: #0b5f63; padding: 1px 4px; }
.markdown pre code { background: none; color: inherit; padding: 0; }
.markdown table { border-collapse: collapse; margin: 12px 0; }
.markdown th, .markdown td { border: 1px solid #ccd4cf; padding: 5px 10px; text-align: left; }
.markdown img { max-width: 100%; }
.markdown a { color: #087e83; }
.markdown details { margin: 12px 0; }
.markdown summary { cursor: pointer; color: #087e83; }
.markdown blockquote { margin: 0; padding-left: 14px; border-left: 3px solid #087e83; color: #42666a; }
pre { margin: 0; padding: 14px 16px; overflow-x: auto; font: .82rem/1.55 ui-monospace, Menlo, monospace; border: 1px solid #d5ddd8; }
pre.shiki { background: #fbfcfa !important; }
pre.plain { background: #fbfcfa; }
.code pre { border-left: 3px solid #087e83; }
.katex-display { overflow-x: auto; overflow-y: hidden; }
@media (max-width: 620px) { main { padding: 28px 16px 60px; } }
`
