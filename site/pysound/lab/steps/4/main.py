import numpy as np
import sounddevice as sd

SR = 48000
f = 440.0                                    # set by the sliders
volume = 0.2
phase = 0.0                                  # in radians: it goes on smoothly when f changes


def callback(outdata, frames, time, status):
    global phase
    phases = phase + 2 * np.pi * f * np.arange(frames) / SR
    outdata[:, 0] = volume * np.sin(phases)
    phase = (phase + 2 * np.pi * f * frames / SR) % (2 * np.pi)


stream = sd.OutputStream(samplerate=SR, blocksize=256, channels=1, callback=callback)
