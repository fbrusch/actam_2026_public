import { loadPyodide } from 'https://cdn.jsdelivr.net/pyodide/v314.0.6/full/pyodide.mjs'

const $ = (id) => document.getElementById(id)
const out = $('out')

const py = await loadPyodide()
py.runPython(PYTHON)                     // defines shout, notes and write
out.textContent = 'Python is ready'

// What came back, and what it became in JavaScript.
function show(value) {
  const kind = value && value.toJs ? `a PyProxy of a Python ${value.type}` : `a JavaScript ${typeof value}`
  out.textContent = `${String(value)}\n\n→ ${kind}`
}

// 1. A text of Python in, a value out: numbers and strings arrive as JavaScript values.
$('evaluate').onclick = () => {
  try { show(py.runPython($('expr').value)) }
  catch (error) { out.textContent = error.message }
}

// 2. A Python function, called like a JavaScript function.
const shout = py.globals.get('shout')
$('shout').onclick = () => show(shout($('word').value, 3))

// 3. A list stays in Python: JavaScript gets a proxy, and toJs() makes a copy as an array.
const notes = py.globals.get('notes')
$('notes').onclick = () => {
  const list = notes(10)
  out.textContent = `${String(list)}\n\n→ toJs(): ${JSON.stringify(list.toJs())}`
  list.destroy()
}

// 4. Python changes the page, through the js module.
const write = py.globals.get('write')
$('write').onclick = () => write($('word').value)
