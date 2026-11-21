import numpy as np
import sounddevice as sd

SR = 48000
phase = 0                                    # samples played so far


def callback(outdata, frames, time, status):
    global phase
    n = phase + np.arange(frames)
    outdata[:, 0] = 0.2 * np.sin(2 * np.pi * 440 * n / SR)
    phase += frames


stream = sd.OutputStream(samplerate=SR, blocksize=256, channels=1, callback=callback)
