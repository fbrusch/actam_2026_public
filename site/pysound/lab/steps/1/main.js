import { loadPyodide } from 'https://cdn.jsdelivr.net/pyodide/v314.0.6/full/pyodide.mjs'

const run = document.getElementById('run')
const out = document.getElementById('out')

const py = await loadPyodide()           // CPython compiled to WebAssembly: a few seconds the first time
out.textContent = 'Python is ready'
run.disabled = false

run.onclick = () => {
  const result = py.runPython(PYTHON)    // PYTHON is the text of the Python tab
  out.textContent = result               // the value of its last line
}
