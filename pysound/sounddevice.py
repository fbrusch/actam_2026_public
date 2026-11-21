"""sounddevice for a web page: the same interface, played by the page's audio.

Python runs in Pyodide, in the page, and cannot reach the sound card. So
pysound.js plays the blocks in an AudioWorklet and, each time it has played a
few milliseconds, asks Python for more: your callback is called then, as many
times as needed to stay `latency` seconds (0.08 by default) ahead. If the
blocks do not arrive in time, the page plays silence and counts an underflow,
as a real sound card would.

    import sounddevice as sd

    def callback(outdata, frames, time, status):
        outdata[:, 0] = ...                  # frames new samples

    stream = sd.OutputStream(samplerate=48000, blocksize=256, channels=1, callback=callback)
    stream.start()
    ...
    stream.stop()
"""
import traceback
from types import SimpleNamespace

import numpy as np
import js
from pyodide.ffi import create_proxy, to_js

_out = js.pysoundAudio
_streams = []


class CallbackFlags:
    """What went wrong since the last block; like sounddevice's."""

    def __init__(self, output_underflow=False):
        self.output_underflow = output_underflow

    def __bool__(self):
        return self.output_underflow

    def __repr__(self):
        return "output underflow" if self.output_underflow else ""


class OutputStream:
    def __init__(self, samplerate=48000, blocksize=256, channels=1, callback=None,
                 dtype="float32", latency=0.08, **kwargs):
        if callback is None:
            raise TypeError("OutputStream needs a callback(outdata, frames, time, status).")
        self.samplerate = int(samplerate)
        self.blocksize = int(blocksize) or 256
        self.channels = int(channels)
        self.callback = callback
        self.latency = float(latency) if isinstance(latency, (int, float)) else 0.08
        self.active = False
        self._start = None
        self._produced = 0
        self._underflows = 0

    @property
    def time(self):
        """Seconds of sound played since start, by the page's audio clock."""
        return 0.0 if self._start is None else (_out.played - self._start) / self.samplerate

    def start(self):
        if self.active:
            return
        for other in list(_streams):
            other.stop()
        self._start = None
        self._produced = 0
        self.active = True
        _streams.append(self)
        _out.start(self.samplerate, self.channels)

    def stop(self):
        self.active = False
        if self in _streams:
            _streams.remove(self)
            _out.stop()

    close = abort = stop

    def __enter__(self):
        self.start()
        return self

    def __exit__(self, *exc):
        self.stop()

    def _fill(self):
        if self._start is None:                       # the first report since start
            self._start = _out.played
            self._underflows = _out.underflows
        played = _out.played - self._start
        while self.active and self._produced - played < self.latency * self.samplerate:
            outdata = np.zeros((self.blocksize, self.channels), dtype=np.float32)
            status = CallbackFlags(_out.underflows > self._underflows)
            self._underflows = _out.underflows
            info = SimpleNamespace(currentTime=played / self.samplerate,
                                   outputBufferDacTime=self._produced / self.samplerate)
            self.callback(outdata, self.blocksize, info, status)
            block = np.clip(outdata, -1, 1).astype(np.float32).reshape(-1)
            _out.post(to_js(block))
            self._produced += self.blocksize


def _on_played():
    """Called by the page each time it has played a few milliseconds."""
    for stream in list(_streams):
        try:
            stream._fill()
        except Exception:
            stream.stop()
            traceback.print_exc()                    # shows in the browser console
            continue
        if not stream.active and stream in _streams:  # the callback ended it: let the queue play out
            _streams.remove(stream)
            _out.end()


_listener = create_proxy(_on_played)
_out.onplayed = _listener


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
