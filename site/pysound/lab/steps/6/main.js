import { startPython, audio } from '{{SITE}}pysound.js'

const $ = (id) => document.getElementById(id)

const py = await startPython({ button: '#play' })
py.runPython(PYTHON)
$('play').disabled = $('stop').disabled = false
$('state').textContent = 'Python is ready'
$('play').onclick = () => py.runPython('stream.start()')
$('stop').onclick = () => py.runPython('stream.stop()')

// Python to the page: at every frame of the screen, ask Python where things are.
const beats = py.globals.get('beats')
const last = { made: -1, heard: -1 }
function frame() {
  requestAnimationFrame(frame)
  if (!audio.ready) return
  const result = beats()
  const [made, heard] = result.toJs()
  result.destroy()
  for (const [name, beat] of [['made', made], ['heard', heard]]) {
    const b = Math.floor(beat)
    if (b !== last[name] && b >= 0) {                     // a new beat: flash
      last[name] = b
      $(name).classList.add('on')
      setTimeout(() => $(name).classList.remove('on'), 90)
    }
    $(name + 'Beat').textContent = beat.toFixed(2)
  }
  $('state').textContent = `${audio.engine} · underflows: ${audio.underflows}`
}
requestAnimationFrame(frame)
