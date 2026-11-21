import numpy as np
import sounddevice as sd

SR = 48000
bpm = 100
made = 0                                     # samples made so far
mark = {"beat": 0.0, "at": 0.0}              # the last block: its first beat, and when it will be heard

t = np.arange(round(0.03 * SR)) / SR
click = 0.4 * np.sin(2 * np.pi * 1500 * t) * np.exp(-t / 0.005)


def callback(outdata, frames, time, status):
    global made
    beat = round(60 / bpm * SR)              # samples per beat
    out = np.zeros(frames)
    for k in range(max(0, (made - len(click)) // beat + 1), (made + frames - 1) // beat + 1):
        s = k * beat - made                  # where click k starts, in this block
        a, b = max(s, 0), min(s + len(click), frames)
        out[a:b] += click[a - s:b - s]
    outdata[:, 0] = out
    mark["beat"], mark["at"] = made / beat, time.outputBufferDacTime
    made += frames


def beats():
    """[the beat Python has made, the beat you hear now]"""
    ahead_s = mark["at"] - stream.time      # how far the last block is from the ear
    return [mark["beat"], mark["beat"] - ahead_s * bpm / 60]


# latency: how far ahead Python works. 0.3 s, to see it; try 0.08.
stream = sd.OutputStream(samplerate=SR, blocksize=256, channels=1, latency=0.3, callback=callback)
