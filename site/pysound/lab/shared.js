// What the lab and the editor share: the diff of lines, the code editor, putting a page together,
// downloading it, opening it on CodePen.

export const SITE = new URL('../', import.meta.url).href     // where pysound.js is, here
export const PUBLIC = 'https://actam.bruschi.dev/pysound/'   // the same, on the course site

// --- Lines: a longest common subsequence, then the lines that are the same, added, removed ---
export function diffOps(text, old) {
  const a = text.split('\n'), b = old.split('\n')
  const L = Array.from({ length: a.length + 1 }, () => new Uint32Array(b.length + 1))
  for (let i = a.length - 1; i >= 0; i--)
    for (let j = b.length - 1; j >= 0; j--)
      L[i][j] = a[i] === b[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1])
  const ops = []
  let i = 0, j = 0
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) { ops.push({ type: 'same', line: a[i] }); i++; j++ }
    else if (L[i][j + 1] >= L[i + 1][j]) { ops.push({ type: 'del', line: b[j] }); j++ }
    else { ops.push({ type: 'add', line: a[i] }); i++ }
  }
  for (; i < a.length; i++) ops.push({ type: 'add', line: a[i] })
  for (; j < b.length; j++) ops.push({ type: 'del', line: b[j] })
  return ops
}
const blank = (line) => line.trim() === ''
export function changes(text, old) {          // which lines of text are new, and how many lines went
  if (old === undefined) return { fresh: text.split('\n').map(() => false), added: 0, removed: 0 }
  const fresh = [], ops = diffOps(text, old)
  let removed = 0
  for (const o of ops) {
    if (o.type === 'del') { if (!blank(o.line)) removed++ }
    else fresh.push(o.type === 'add' && !blank(o.line))
  }
  return { fresh, added: fresh.filter(Boolean).length, removed }
}

// --- The editor: a textarea over a <pre> that marks the lines; tabs for the files ---
export function codeEditor({ tabs, textarea, marks, onRun = () => {}, onChange = () => {}, showRemoved = false }) {
  let files = {}, before = null, current = null, view = false
  const box = textarea.parentElement
  for (const b of tabs.querySelectorAll('[data-file]')) b.dataset.label = b.textContent

  function sync() { if (current) files[current] = textarea.value }
  function line(text, cls) {
    const div = document.createElement('div')
    div.textContent = text || ' '
    if (cls) div.className = cls
    return div
  }
  function paint() {
    const text = textarea.value, old = before?.[current]
    const viewing = view && old !== undefined
    box.classList.toggle('view', viewing)
    if (viewing) {
      marks.replaceChildren(...diffOps(text, old).map((o) =>
        line(o.line, o.type === 'add' && !blank(o.line) ? 'new' : o.type === 'del' && !blank(o.line) ? 'del' : '')))
    } else {
      const { fresh } = changes(text, old)
      marks.replaceChildren(...text.split('\n').map((t, i) => line(t, fresh[i] ? 'new' : '')))
      marks.scrollTop = textarea.scrollTop
      marks.scrollLeft = textarea.scrollLeft
    }
    for (const b of tabs.querySelectorAll('[data-file]')) {
      const k = b.dataset.file
      const { added, removed } = changes(k === current ? text : files[k] ?? '', before?.[k])
      const n = showRemoved ? [added && `+${added}`, removed && `−${removed}`].filter(Boolean).join(' ') : added || ''
      b.innerHTML = ''
      b.append(b.dataset.label)
      if (n) { const sup = document.createElement('sup'); sup.textContent = n; b.append(sup) }
      b.classList.toggle('current', k === current)
    }
  }
  function show(k) {
    sync()
    current = k
    textarea.value = files[k] ?? ''
    textarea.scrollTop = 0
    marks.scrollTop = 0
    paint()
  }

  tabs.addEventListener('click', (e) => { const b = e.target.closest('[data-file]'); if (b) show(b.dataset.file) })
  textarea.addEventListener('input', () => { sync(); paint(); onChange(current) })
  textarea.addEventListener('scroll', () => { if (!view) { marks.scrollTop = textarea.scrollTop; marks.scrollLeft = textarea.scrollLeft } })
  textarea.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); onRun() }
    else if (e.key === 'Tab' && !e.shiftKey && !e.metaKey && !e.ctrlKey && !e.altKey) {
      e.preventDefault()
      textarea.setRangeText(current === 'py' ? '    ' : '  ', textarea.selectionStart, textarea.selectionEnd, 'end')
      sync(); paint(); onChange(current)
    }
  })

  return {
    load(newFiles, newBefore, focus) {          // the files of a step, and the ones to compare with
      files = { ...newFiles }
      before = newBefore ? { ...newBefore } : null
      current = null
      show(focus in files ? focus : Object.keys(files)[0])
    },
    compare(newBefore) { before = newBefore ? { ...newBefore } : null; paint() },
    setView(v) { view = v; paint() },
    files() { sync(); return { ...files } },
    get current() { return current },
  }
}

// --- The page, put together ---
// page.html is the whole document. Its <link href="style.css"> becomes style.css itself, and its
// <script src="main.js"> becomes main.js itself, inline, after `const PYTHON = <main.py>`.
function pythonLiteral(text) {          // a template literal when possible: easier to read
  return /[`\\]|\$\{/.test(text) ? JSON.stringify(text) : '`' + text + '`'
}
const MAIN = /<script\b[^>]*\bsrc=["']main\.js["'][^>]*>\s*<\/script>/
const STYLE = /<link\b[^>]*\bhref=["']style\.css["'][^>]*>/
const noClose = (t) => t.replaceAll('</scr' + 'ipt', '<\\/scr' + 'ipt')

export function compose(f, { swap = (t) => t, extraCss = '' } = {}) {
  const script = `const PYTHON = ${pythonLiteral(swap(f.py ?? ''))}\n\n${swap(f.js ?? '')}`
  const inline = '<script type="module">\n' + noClose(script) + '\n</scr' + 'ipt>'
  const css = f.css ?? ''
  let html = swap(f.html ?? '')
  const head = (s) => { html = html.includes('</head>') ? html.replace('</head>', () => s + '\n</head>') : s + '\n' + html }
  if (STYLE.test(html)) html = html.replace(STYLE, () => `<style>\n${css.replace(/\s+$/, '')}\n</style>`)
  else if (css.trim()) head(`<style>\n${css}\n</style>`)
  if (extraCss) head(`<style>${extraCss}</style>`)
  html = MAIN.test(html) ? html.replace(MAIN, () => inline)
       : html.includes('</body>') ? html.replace('</body>', () => inline + '\n</body>') : html + '\n' + inline
  return { html, script }
}

export function downloadText(name, text, type = 'text/html') {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([text], { type }))
  a.download = name
  document.body.append(a); a.click(); a.remove()
  setTimeout(() => URL.revokeObjectURL(a.href), 1000)
}

export function openPen(title, f, swap = (t) => t) {    // CodePen wants the head, the style and the body apart
  const doc = new DOMParser().parseFromString(swap(f.html ?? ''), 'text/html')
  doc.querySelector('link[href="style.css"]')?.remove()
  const styles = [...doc.querySelectorAll('style')].map((e) => { e.remove(); return e.textContent.replace(/^\n|\s+$/g, '').replace(/^    /gm, '') })
  const css = [f.css ?? '', ...styles].filter((s) => s.trim()).join('\n')
  doc.querySelector('script[src="main.js"]')?.remove()
  const head = [...doc.head.children].filter((e) => !/^(META|TITLE)$/.test(e.tagName)).map((e) => e.outerHTML).join('\n')
  const body = doc.body.innerHTML.trim().replace(/^  /gm, '')
  const data = { title, head, css, js: '',
    html: `${body}\n\n<script type="module">\n${compose(f, { swap }).script}\n</scr` + `ipt>` }
  const form = document.createElement('form')
  form.action = 'https://codepen.io/pen/define'
  form.method = 'POST'
  form.target = '_blank'
  const input = document.createElement('input')
  input.type = 'hidden'; input.name = 'data'; input.value = JSON.stringify(data)
  form.append(input); document.body.append(form); form.submit(); form.remove()
}
