"""sounddevice for the browser: a stand-in with the same interface, for JupyterLite.

In a local Jupyter, `pip install sounddevice` and this file is not used.
In the browser, Python runs in a web worker and cannot reach the sound card.
So the roles are turned around: a background task calls your callback a little
ahead of time, about 150 ms, and sends each block to the page, where an
AudioWorklet plays them in order. If the blocks do not arrive in time, the
worklet plays silence and reports an underflow, as a real sound card would.

    import sounddevice as sd

    def callback(outdata, frames, time, status):
        outdata[:, 0] = ...                  # frames new samples

    stream = sd.OutputStream(samplerate=48000, blocksize=512, channels=1, callback=callback)
    stream.start()
    ...
    stream.stop()

Browsers only start audio after a click: press the button that appears when
this module is imported.
"""
import asyncio
import json
import uuid
from types import SimpleNamespace

import numpy as np
import js
from pyodide.ffi import create_proxy, to_js
from IPython.display import HTML, display

_ID = uuid.uuid4().hex[:8]
_CHANNEL = js.BroadcastChannel.new(f"actam-audio-{_ID}")
_page = {"played": 0, "underflows": 0, "ready": False}
_streams = []


def _on_message(event):
    message = event.data.to_py() if hasattr(event.data, "to_py") else event.data
    if message.get("type") == "played":
        _page["played"] = int(message["frames"])
        _page["underflows"] = int(message["underflows"])
    elif message.get("type") == "ready":
        _page["ready"] = True


_listener = create_proxy(_on_message)
_CHANNEL.onmessage = _listener


def _post(message):
    _CHANNEL.postMessage(to_js(message, dict_converter=js.Object.fromEntries))


class CallbackFlags:
    """What went wrong since the last block; like sounddevice's."""

    def __init__(self, output_underflow=False):
        self.output_underflow = output_underflow

    def __bool__(self):
        return self.output_underflow

    def __repr__(self):
        return "output underflow" if self.output_underflow else ""


class OutputStream:
    def __init__(self, samplerate=48000, blocksize=512, channels=1, callback=None,
                 dtype="float32", latency=0.15, **kwargs):
        if callback is None:
            raise TypeError("OutputStream needs a callback(outdata, frames, time, status).")
        self.samplerate = int(samplerate)
        self.blocksize = int(blocksize) or 512
        self.channels = int(channels)
        self.callback = callback
        self.latency = float(latency) if isinstance(latency, (int, float)) else 0.15
        self.active = False
        self._task = None
        self._produced = 0
        self._start_played = 0
        self._underflows = 0

    @property
    def time(self):
        """Seconds of sound played since start, by the page's clock."""
        return (_page["played"] - self._start_played) / self.samplerate

    def start(self):
        if self.active:
            return
        for other in list(_streams):
            other.stop()
        _post({"type": "start", "rate": self.samplerate, "channels": self.channels})
        self._produced = 0
        self._start_played = _page["played"]
        self._underflows = _page["underflows"]
        self.active = True
        _streams.append(self)
        self._task = asyncio.ensure_future(self._pump())

    def stop(self):
        self.active = False
        if self in _streams:
            _streams.remove(self)
            _post({"type": "stop"})

    close = abort = stop

    def __enter__(self):
        self.start()
        return self

    def __exit__(self, *exc):
        self.stop()

    async def _pump(self):
        block_s = self.blocksize / self.samplerate
        while self.active and not _page["ready"]:     # the button has not been pressed yet
            await asyncio.sleep(0.05)
        self._start_played = _page["played"]
        while self.active:
            played = _page["played"] - self._start_played
            while self.active and self._produced - played < self.latency * self.samplerate:
                outdata = np.zeros((self.blocksize, self.channels), dtype=np.float32)
                status = CallbackFlags(_page["underflows"] > self._underflows)
                self._underflows = _page["underflows"]
                info = SimpleNamespace(currentTime=played / self.samplerate,
                                       outputBufferDacTime=self._produced / self.samplerate)
                try:
                    self.callback(outdata, self.blocksize, info, status)
                except Exception:
                    self.active = False
                    _post({"type": "stop"})
                    raise
                block = np.clip(outdata, -1, 1).astype(np.float32).reshape(-1)
                data = js.Float32Array.new(to_js(block.tobytes()).buffer)
                _CHANNEL.postMessage(to_js({"type": "block", "data": data}, dict_converter=js.Object.fromEntries))
                self._produced += self.blocksize
            await asyncio.sleep(block_s / 2)
        if self in _streams:                 # the callback ended the stream: let the queue play out
            _streams.remove(self)
            _post({"type": "end"})


def play(data, samplerate=48000):
    """Play an array once, like sounddevice.play."""
    data = np.asarray(data, dtype=np.float32)
    if data.ndim == 1:
        data = data[:, None]
    position = [0]

    def callback(outdata, frames, time, status):
        chunk = data[position[0]:position[0] + frames]
        outdata[:len(chunk)] = chunk
        position[0] += frames
        if position[0] >= len(data):
            stream.active = False

    stream = OutputStream(samplerate=samplerate, channels=data.shape[1], callback=callback)
    stream.start()
    return stream


def stop():
    for stream in list(_streams):
        stream.stop()


_WORKLET = """
class Player extends AudioWorkletProcessor {
  constructor() {
    super();
    this.queue = []; this.offset = 0; this.channels = 1;
    this.played = 0; this.underflows = 0; this.active = false; this.tick = 0;
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
    if (++this.tick % 4 === 0) this.port.postMessage({ type: 'played', frames: this.played, underflows: this.underflows });
    return true;
  }
}
registerProcessor('actam-player', Player);
"""

_PANEL = """
<div id="actam-audio-ID" style="font-family: ui-monospace, Menlo, monospace; font-size: 13px; display: flex; gap: 12px; align-items: center;">
  <button style="font: inherit; padding: 6px 12px; border: 1px solid #087e83; background: #087e83; color: #fff; cursor: pointer;">&#9654; audio</button>
  <span class="state">audio off: press the button</span>
</div>
<script>
(() => {
  const root = document.getElementById('actam-audio-ID');
  const button = root.querySelector('button'), state = root.querySelector('.state');
  const channel = new BroadcastChannel('actam-audio-ID');
  let context = null, player = null, engine = '', rate = 48000, received = 0;
  const report = (m) => {
    channel.postMessage(m);
    state.textContent = 'audio on (' + engine + ') · ' + (m.frames / context.sampleRate).toFixed(1) + ' s played · underflows: ' + m.underflows;
  };
  // The same queue logic as the worklet, on the main thread: the fallback.
  function scriptPlayer() {
    const node = context.createScriptProcessor(1024, 0, 2);
    let queue = [], offset = 0, channels = 1, played = 0, underflows = 0, active = false, tick = 0;
    node.onaudioprocess = (e) => {
      const out = [e.outputBuffer.getChannelData(0), e.outputBuffer.getChannelData(1)], n = out[0].length;
      let starved = false;
      for (let i = 0; i < n; i++) {
        if (!queue.length) { out[0][i] = out[1][i] = 0; if (active) starved = true; continue; }
        const b = queue[0];
        for (let c = 0; c < 2; c++) out[c][i] = b[offset * channels + Math.min(c, channels - 1)];
        offset++; played++;
        if (offset * channels >= b.length) { queue.shift(); offset = 0; }
      }
      if (starved && played > 0) underflows++;
      if (++tick % 2 === 0) report({ type: 'played', frames: played, underflows });
    };
    node.connect(context.destination);
    return { post(m) {
      if (m.type === 'block') queue.push(m.data);
      else if (m.type === 'start') { queue = []; offset = 0; channels = m.channels; active = true; }
      else if (m.type === 'stop') { queue = []; offset = 0; active = false; }
      else if (m.type === 'end') active = false;
    } };
  }
  async function workletPlayer() {
    const url = URL.createObjectURL(new Blob([WORKLET], { type: 'application/javascript' }));
    const loaded = context.audioWorklet.addModule(url);
    const late = new Promise((_, reject) => setTimeout(() => reject(new Error('worklet did not load')), 2000));
    await Promise.race([loaded, late]);
    const node = new AudioWorkletNode(context, 'actam-player', { outputChannelCount: [2] });
    node.connect(context.destination);
    node.port.onmessage = (e) => report(e.data);
    return { post(m) { node.port.postMessage(m, m.data ? [m.data.buffer] : []); } };
  }
  async function open(r) {
    if (context && context.sampleRate === r) return;
    if (context) await context.close();
    context = new AudioContext({ sampleRate: r, latencyHint: 'interactive' });
    try { player = await workletPlayer(); engine = 'AudioWorklet'; }
    catch (error) { player = scriptPlayer(); engine = 'ScriptProcessor'; }
  }
  let lastStart = null, pending = [];
  button.onclick = async () => {
    try {
      await open(rate); await context.resume();
      if (lastStart) player.post(lastStart);
      for (const m of pending) player.post(m);
      pending = [];
      channel.postMessage({ type: 'ready' });
      button.disabled = true; button.textContent = 'audio on'; state.textContent = 'audio on (' + engine + ')';
    } catch (error) { state.textContent = 'audio failed: ' + error; }
  };
  channel.onmessage = async (e) => {
    const m = e.data; received++;
    if (m.type === 'start') { rate = m.rate; lastStart = m; if (context) await open(rate); }
    if (m.type === 'stop') lastStart = null;
    if (m.type === 'played' || m.type === 'ready') return;
    if (player) player.post(m); else if (m.type === 'block') pending.push(m);
  };
  window['actamAudio_ID'] = { get context() { return context; }, get received() { return received; }, get engine() { return engine; } };
})();
</script>
"""

display(HTML(_PANEL.replace("ID", _ID).replace("WORKLET", json.dumps(_WORKLET))))
