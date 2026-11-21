import { startPython, audio } from '{{SITE}}pysound.js'

const $ = (id) => document.getElementById(id)

const py = await startPython({ button: '#play' })
py.runPython(PYTHON)
$('play').disabled = $('stop').disabled = false

$('play').onclick = () => py.runPython('stream.start()')
$('stop').onclick = () => py.runPython('stream.stop()')

// A slider sets a Python variable; the callback reads it at the next block.
for (const name of ['f', 'volume']) {
  $(name).addEventListener('input', () => {
    py.globals.set(name, Number($(name).value))
    $(name + 'Out').textContent = $(name).value
  })
}

setInterval(() => {
  $('state').textContent = audio.ready
    ? `${audio.engine} · ${(audio.played / audio.rate).toFixed(1)} s played · underflows: ${audio.underflows}`
    : 'Python is ready'
}, 250)
