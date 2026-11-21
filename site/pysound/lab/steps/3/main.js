import { startPython, audio } from '{{SITE}}pysound.js'

const $ = (id) => document.getElementById(id)

// Pyodide, numpy, and our sounddevice. Browsers start sound only after a click: the first one on #play.
const py = await startPython({ button: '#play' })
py.runPython(PYTHON)
$('play').disabled = $('stop').disabled = false

$('play').onclick = () => py.runPython('stream.start()')
$('stop').onclick = () => py.runPython('stream.stop()')

setInterval(() => {
  $('state').textContent = audio.ready
    ? `${audio.engine} · ${(audio.played / audio.rate).toFixed(1)} s played · underflows: ${audio.underflows}`
    : 'Python is ready'
}, 250)
