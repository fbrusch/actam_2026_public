import { startPython, audio } from '{{SITE}}pysound.js'

const $ = (id) => document.getElementById(id)

const py = await startPython({ button: '#play' })
py.runPython(PYTHON)
$('play').disabled = false

// Python functions, called from JavaScript as if they were JavaScript functions.
const noteOn = py.globals.get('note_on')
const noteOff = py.globals.get('note_off')

const names = ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C']
const midis = [60, 62, 64, 65, 67, 69, 71, 72]
const letters = 'asdfghjk'
midis.forEach((midi, i) => {
  const key = document.createElement('button')
  key.textContent = names[i]
  key.onpointerdown = () => noteOn(midi)
  key.onpointerup = key.onpointerleave = () => noteOff()
  $('keys').append(key)
})
addEventListener('keydown', (e) => {
  const i = letters.indexOf(e.key)
  if (i >= 0 && !e.repeat) noteOn(midis[i])
})
addEventListener('keyup', (e) => { if (letters.includes(e.key)) noteOff() })

setInterval(() => {
  $('state').textContent = audio.ready ? `${audio.engine} · underflows: ${audio.underflows}` : 'Python is ready'
}, 250)
