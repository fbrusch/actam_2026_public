import numpy as np
import sounddevice as sd

SR = 48000

# What the page changes: the sliders call set_param, the keys note_on and note_off.
params = {"wave": "saw", "cutoff": 1200.0, "release": 0.3, "volume": 0.3}
voice = {"freq": 220.0, "gate": False}


def set_param(name, value):
    params[name] = value


def note_on(midi):
    voice["freq"] = 440 * 2 ** ((midi - 69) / 12)
    voice["gate"] = True


def note_off():
    voice["gate"] = False


def oscillator(phase, wave):
    if wave == "sine":
        return np.sin(2 * np.pi * phase)
    if wave == "square":
        return np.where(phase < 0.5, 1.0, -1.0)
    return 2 * phase - 1                                  # saw


phase, env, low = 0.0, 0.0, 0.0


def callback(outdata, frames, time, status):
    global phase, env, low
    n = np.arange(1, frames + 1)

    p = (phase + voice["freq"] * n / SR) % 1.0           # the oscillator
    phase = p[-1]
    x = oscillator(p, params["wave"])

    target = 1.0 if voice["gate"] else 0.0                # the envelope: 5 ms up, `release` down
    tau = 0.005 if voice["gate"] else max(params["release"], 0.005) / 4
    e = target + (env - target) * np.exp(-n / (tau * SR))
    env = e[-1]

    a = 1 - np.exp(-2 * np.pi * params["cutoff"] / SR)   # a low-pass filter, one sample at a time
    y = np.empty(frames)
    for i in range(frames):
        low += a * (x[i] - low)
        y[i] = low

    outdata[:, 0] = params["volume"] * e * y


stream = sd.OutputStream(samplerate=SR, blocksize=256, channels=1, callback=callback)
stream.start()
