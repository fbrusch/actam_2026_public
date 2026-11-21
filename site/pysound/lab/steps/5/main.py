import numpy as np
import sounddevice as sd

SR = 48000
f = 440.0
gate = False                                 # is a key down?
level = 0.0                                  # the envelope, now
phase = 0.0


def note_on(midi):
    global f, gate
    f = 440 * 2 ** ((midi - 69) / 12)
    gate = True


def note_off():
    global gate
    gate = False


def callback(outdata, frames, time, status):
    global phase, level
    n = np.arange(1, frames + 1)
    target, tau = (0.2, 0.01) if gate else (0.0, 0.15)      # up in 10 ms, down in 150
    env = target + (level - target) * np.exp(-n / (tau * SR))
    level = env[-1]
    phases = phase + 2 * np.pi * f * n / SR
    phase = phases[-1] % (2 * np.pi)
    outdata[:, 0] = env * np.sin(phases)


stream = sd.OutputStream(samplerate=SR, blocksize=256, channels=1, callback=callback)
stream.start()
