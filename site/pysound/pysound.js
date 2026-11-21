// pysound: Python in a web page, with sound through sounddevice.
//
//   import { startPython } from 'https://actam.bruschi.dev/pysound/pysound.js'
//   const py = await startPython({ button: '#audio' })
//   await py.runPythonAsync(`import sounddevice as sd ...`)
//
// startPython loads Pyodide and numpy and installs a stand-in for sounddevice:
// the page plays the blocks in an AudioWorklet and, every few milliseconds,
// asks Python to fill the queue by calling the stream's callback.
// Browsers start audio only after a click: on `button` if given, else on the
// first click or key press anywhere in the page.

const PYODIDE = 'https://cdn.jsdelivr.net/pyodide/v314.0.6/full/pyodide.mjs'

const WORKLET = `
class Player extends AudioWorkletProcessor {
  constructor() {
    super();
    this.queue = []; this.offset = 0; this.channels = 1; this.played = 0; this.underflows = 0; this.active = false; this.tick = 0;
    this.port.onmessage = (e) => {
      const m = e.data;
      if (m.type === 'block') this.queue.push(m.data);
      else if (m.type === 'start') { this.queue = []; this.offset = 0; this.channels = m.channels; this.active = true; }
      else if (m.type === 'stop') { this.queue = []; this.offset = 0; this.active = false; }
      else if (m.type === 'end') this.active = false;
    };
  }
  process(inputs, outputs) {
    const out = outputs[0], n = out[0].length, ch = this.channels;
    let starved = false;
    for (let i = 0; i < n; i++) {
      if (!this.queue.length) { for (const c of out) c[i] = 0; if (this.active) starved = true; continue; }
      const b = this.queue[0];
      for (let c = 0; c < out.length; c++) out[c][i] = b[this.offset * ch + Math.min(c, ch - 1)];
      this.offset++; this.played++;
      if (this.offset * ch >= b.length) { this.queue.shift(); this.offset = 0; }
    }
    if (starved && this.played > 0) this.underflows++;
    if (++this.tick % 2 === 0) this.port.postMessage({ played: this.played, underflows: this.underflows });
    return true;
  }
}
registerProcessor('pysound-player', Player);`

// The page's side of the sound card. sounddevice.py finds it as js.pysoundAudio.
export const audio = {
  ready: false, engine: '', played: 0, underflows: 0, rate: 48000,
  context: null, player: null, last: null,
  onplayed: null,                      // set by sounddevice.py: fills the queue

  start(rate, channels) {
    this.last = { type: 'start', rate, channels }
    if (this.context && this.context.sampleRate !== rate) { this.rate = rate; this.reopen(); return }
    this.rate = rate
    this.send(this.last)
  },
  stop() { this.last = null; this.send({ type: 'stop' }) },
  end() { this.last = null; this.send({ type: 'end' }) },
  post(block) {
    const data = block instanceof Float32Array ? block : new Float32Array(block)
    this.send({ type: 'block', data }, [data.buffer])
  },
  send(m, transfer = []) { if (this.player) this.player.post(m, transfer) },

  report(m) {
    this.played = m.played
    this.underflows = m.underflows
    if (this.onplayed) {
      try { this.onplayed() } catch (error) { console.error(error) }
    }
  },

  async worklet() {
    const url = URL.createObjectURL(new Blob([WORKLET], { type: 'application/javascript' }))
    const late = new Promise((_, reject) => setTimeout(() => reject(new Error('worklet did not load')), 2000))
    await Promise.race([this.context.audioWorklet.addModule(url), late])
    const node = new AudioWorkletNode(this.context, 'pysound-player', { outputChannelCount: [2] })
    node.connect(this.context.destination)
    node.port.onmessage = (e) => this.report(e.data)
    return { post: (m, transfer) => node.port.postMessage(m, transfer), node }
  },

  // The same queue on the main thread, for browsers without AudioWorklet.
  script() {
    const node = this.context.createScriptProcessor(1024, 0, 2)
    let queue = [], offset = 0, channels = 1, played = 0, underflows = 0, active = false
    node.onaudioprocess = (e) => {
      const out = [e.outputBuffer.getChannelData(0), e.outputBuffer.getChannelData(1)], n = out[0].length
      let starved = false
      for (let i = 0; i < n; i++) {
        if (!queue.length) { out[0][i] = out[1][i] = 0; if (active) starved = true; continue }
        const b = queue[0]
        for (let c = 0; c < 2; c++) out[c][i] = b[offset * channels + Math.min(c, channels - 1)]
        offset++; played++
        if (offset * channels >= b.length) { queue.shift(); offset = 0 }
      }
      if (starved && played > 0) underflows++
      this.report({ played, underflows })
    }
    node.connect(this.context.destination)
    return { post: (m) => {
      if (m.type === 'block') queue.push(m.data)
      else if (m.type === 'start') { queue = []; offset = 0; channels = m.channels; active = true }
      else if (m.type === 'stop') { queue = []; offset = 0; active = false }
      else if (m.type === 'end') active = false
    }, node }
  },

  // Start the audio; call it from a click.
  async unlock() {
    if (this.ready) return
    this.context = new AudioContext({ sampleRate: this.rate, latencyHint: 'interactive' })
    await this.context.resume()
    try { this.player = await this.worklet(); this.engine = 'AudioWorklet' }
    catch { this.player = this.script(); this.engine = 'ScriptProcessor' }
    this.played = 0; this.underflows = 0
    if (this.last) this.send(this.last)
    this.ready = true
  },

  async reopen() {
    if (!this.ready) return
    this.ready = false
    if (this.player) this.player.node.disconnect()
    await this.context.close()
    this.player = null
    await this.unlock()
  },
}

// Load Pyodide, the packages and sounddevice; returns the Pyodide instance.
export async function startPython({ button = null, packages = ['numpy'], pyodide = PYODIDE } = {}) {
  globalThis.pysoundAudio = audio
  const target = typeof button === 'string' ? document.querySelector(button) : button
  if (target) {
    target.addEventListener('click', () => audio.unlock())
  } else {
    const once = () => { audio.unlock(); removeEventListener('pointerdown', once); removeEventListener('keydown', once) }
    addEventListener('pointerdown', once)
    addEventListener('keydown', once)
  }
  const { loadPyodide } = await import(pyodide)
  const py = await loadPyodide()
  if (packages.length) await py.loadPackage(packages)
  const source = await (await fetch(new URL('sounddevice.py', import.meta.url))).text()
  py.FS.writeFile('/home/pyodide/sounddevice.py', source)
  return py
}
