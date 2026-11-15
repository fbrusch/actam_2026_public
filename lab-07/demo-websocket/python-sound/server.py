"""
Sudio engine lives in Python (the `block(frames)` style from
lab-06, here a `Saw` oscillator through a real one-pole `LowPass`). Every
block of raw PCM samples is pushed to the browser over a WebSocket as binary
frames; the browser just plays back whatever it receives.

Run:  ../../../.venv/bin/python server.py
Then open index.html, click "start", and move the sliders: the frequency
and cutoff changes happen in Python and you hear them, with a bit of
network latency.
"""
import asyncio
import json

import numpy as np
import websockets

SR = 48000
BLOCK = 1024


class Saw:
    """Harmonic-rich on purpose: a pure sine has nothing for a lowpass to remove."""

    def __init__(self, f, amp=0.2):
        self.f = f
        self.amp = amp
        self.phase = 0.0

    def block(self, frames):
        phases = self.phase + 2 * np.pi * self.f * np.arange(frames) / SR
        self.phase = (self.phase + 2 * np.pi * self.f * frames / SR) % (2 * np.pi)
        p = (phases / (2 * np.pi)) % 1
        return self.amp * (2 * p - 1)


class LowPass:
    """A real one-pole lowpass: y[n] = y[n-1] + alpha*(x[n] - y[n-1])."""

    def __init__(self, cutoff_hz=4000.0):
        self.cutoff_hz = cutoff_hz
        self.y_prev = 0.0

    def process(self, x):
        alpha = 1 - np.exp(-2 * np.pi * self.cutoff_hz / SR)
        y = np.empty_like(x)
        y_prev = self.y_prev
        for i in range(len(x)):
            y_prev += alpha * (x[i] - y_prev)
            y[i] = y_prev
        self.y_prev = y_prev
        return y


def cutoff_to_hz(norm):
    return 200 * (8000 / 200) ** norm  # exponential: 0 -> 200 Hz, 1 -> 8000 Hz


async def handler(ws):
    source = Saw(220)
    lowpass = LowPass(cutoff_hz=4000.0)
    playing = asyncio.Event()                    # cleared = paused, no blocks sent
    print("browser connected")

    async def sender():
        block_dt = BLOCK / SR
        while True:
            await playing.wait()                  # block here while stopped
            samples = source.block(BLOCK)
            samples = lowpass.process(samples)    # a real filter on the real signal
            await ws.send(samples.astype(np.float32).tobytes())  # binary frame: raw PCM
            await asyncio.sleep(block_dt)          # pace it like a real audio callback

    async def receiver():
        async for message in ws:                  # control messages FROM the browser
            data = json.loads(message)
            if data.get("cmd") == "start":
                source.phase = 0.0                 # avoid a click from a stale phase
                playing.set()
                print("streaming started")
            elif data.get("cmd") == "stop":
                playing.clear()
                print("streaming stopped")
            if "f" in data:
                source.f = data["f"]
            if "cutoff" in data:
                lowpass.cutoff_hz = cutoff_to_hz(data["cutoff"])

    send_task = asyncio.create_task(sender())
    try:
        await receiver()
    finally:
        send_task.cancel()
        print("browser disconnected")


async def main():
    async with websockets.serve(handler, "localhost", 8766, max_size=None):
        print("listening on ws://localhost:8766 ...")
        await asyncio.Future()


if __name__ == "__main__":
    asyncio.run(main())
