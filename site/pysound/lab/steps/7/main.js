import { startPython, audio } from '{{SITE}}pysound.js'

const $ = (id) => document.getElementById(id)

const py = await startPython({ button: '#play' })
const library = await (await fetch('{{SITE}}round/band.py')).text()     // the library of lesson 11
py.runPython(library)
py.runPython(PYTHON)
$('play').disabled = $('stop').disabled = false
$('play').onclick = () => py.runPython('out.start()')
$('stop').onclick = () => py.runPython('out.stop()')

// A click does not change the melody: it asks for a change, and the loop makes it at the end of the round.
let asked = null
for (const button of document.querySelectorAll('[data-clip]')) {
  button.onclick = () => {
    const line = `melody.next = ${button.dataset.clip}`
    py.runPython(line)
    asked = button.dataset.clip
    const li = document.createElement('li')
    li.textContent = line
    $('log').append(li)
  }
}

setInterval(() => {
  if (asked && py.runPython('melody.next is None')) { $('plays').textContent = asked; asked = null }
  $('waiting').textContent = asked ? `— next: ${asked}, at the end of the round` : ''
  $('state').textContent = audio.ready ? `${audio.engine} · underflows: ${audio.underflows}` : 'Python is ready'
}, 50)
