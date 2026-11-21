# The library of lesson 11, for a web page: the same classes, with two changes.
# - `played` keeps the wave of each pitch: a bell is computed once, not at every note.
# - `stream_of` remembers when the last block will be heard, so the page can show
#   where the music is now, not where Python is (a little ahead).
import json
import math

import numpy as np
import sounddevice as sd

SR = 48000


# --- Tools: pitches, clips, keys ---

note_names = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]


class Pitch:
    def __init__(self, value):
        if isinstance(value, str):           # a name like "C4": the octave last, the note before
            value = 12 * (int(value[-1]) + 1) + note_names.index(value[:-1])
        self.midi = value

    @property
    def f(self):                             # the frequency in Hz
        return 440 * 2 ** ((self.midi - 69) / 12)

    def __add__(self, semitones):
        return Pitch(self.midi + semitones)

    def __repr__(self):
        return note_names[self.midi % 12] + str(self.midi // 12 - 1)


class Clip:
    def __init__(self, events, length):
        self.events = events                 # (onset, data): onset in beats
        self.length = length                 # in beats: where the next clip starts

    def __rshift__(self, other):             # then
        moved = [(onset + self.length, data) for onset, data in other.events]
        return Clip(self.events + moved, self.length + other.length)

    def __mul__(self, times):                # again
        out = Clip([], 0)
        for _ in range(times):
            out = out >> self
        return out

    def __add__(self, n):                    # up n degrees
        return Clip([(onset, data + n) for onset, data in self.events], self.length)

    def __sub__(self, n):                    # down n degrees
        return self + (-n)

    def __or__(self, other):                 # together
        return Clip(self.events + other.events, max(self.length, other.length))

    def __repr__(self):
        return f"Clip({len(self.events)} notes, {self.length} beats)"


def note(data, length=1):
    return Clip([(0, data)], length)


def rest(length):
    return Clip([], length)


class Scale:
    def __init__(self, steps, root):
        self.root = root
        self.distances = []
        distance = 0
        for step in steps:
            self.distances.append(distance)
            distance += step

    def __getitem__(self, degree):
        octave = degree // len(self.distances)
        step = degree % len(self.distances)
        return self.root + (12 * octave) + self.distances[step]


minor = [2, 1, 2, 2, 1, 2, 2]
major = [2, 2, 1, 2, 2, 2, 1]
hijaz = [1, 3, 1, 2, 1, 2, 2]                # a minor second, then an augmented one
whole_tone = [2, 2, 2, 2, 2, 2]              # six notes, all the same distance

key = Scale(minor, Pitch("D3"))


# --- The tune, and ways to turn a clip into another clip ---

call = note(0) >> note(1) >> note(2) >> note(0)
climb = note(2) >> note(3) >> note(4, 2)
bells = note(4, 0.5) >> note(5, 0.5) >> note(4, 0.5) >> note(3, 0.5) >> note(2) >> note(0)
ending = note(0) >> note(-3) >> note(0, 2)
fm = call * 2 >> climb * 2 >> bells * 2 >> ending * 2


def durations(clip):
    onsets = [onset for onset, _ in clip.events] + [clip.length]
    return [b - a for a, b in zip(onsets, onsets[1:])]


def backwards(clip):
    events = sorted(clip.events)
    durs = durations(Clip(events, clip.length))
    return Clip([(clip.length - onset - d, data) for (onset, data), d in zip(events, durs)], clip.length)


def upside_down(clip):
    return Clip([(onset, -data) for onset, data in clip.events], clip.length)


def faster(clip, k):
    return Clip([(onset / k, data) for onset, data in clip.events], clip.length / k)


# --- Sources ---

class Voice:
    def __init__(self, wave, delay=0):
        self.wave = np.concatenate([np.zeros(delay), wave])     # wait delay samples, then play
        self.i = 0

    def block(self, frames):
        out = np.zeros(frames)
        chunk = self.wave[self.i : self.i + frames]
        out[:len(chunk)] = chunk
        self.i += frames
        return out

    @property
    def done(self):
        return self.i >= len(self.wave)


class Mixer:
    def __init__(self, sources):
        self.sources = sources

    def block(self, frames):
        out = np.zeros(frames)
        for source in list(self.sources):
            out += source.block(frames)
            if getattr(source, "done", False):
                self.sources.remove(source)
        return out


# --- Instruments: a frequency in, a wave out. Drums: a name in. ---

rng = np.random.default_rng(808)


def time_axis(dur_s):
    return np.arange(round(dur_s * SR)) / SR


def decay(dur_s, tau):
    return np.exp(-time_axis(dur_s) / tau)


def pluck(f, dur_s=1.0, tau=0.3, amplitude=0.25):
    t = time_axis(dur_s)
    return amplitude * np.exp(-t / tau) * np.sin(2 * np.pi * f * t)


def kick(dur_s=0.3):
    t = time_axis(dur_s)
    f = 45 + 135 * np.exp(-t / 0.03)                 # the pitch falls fast
    return 0.5 * np.sin(2 * np.pi * np.cumsum(f) / SR) * decay(dur_s, 0.07)


def snare(dur_s=0.2):
    t = time_axis(dur_s)
    tone = 0.5 * np.sin(2 * np.pi * 190 * t) * decay(dur_s, 0.03)
    noise = 0.7 * rng.uniform(-1, 1, len(t)) * decay(dur_s, 0.05)
    return 0.25 * (tone + noise)


def hat(dur_s=0.05):
    return 0.12 * np.diff(rng.uniform(-1, 1, round(dur_s * SR)), prepend=0) * decay(dur_s, 0.008)


kit = {"k": kick(), "s": snare(), "h": hat()}


def drum(name):
    return kit[name]


def timpani(f, dur_s=2.5):
    t = time_axis(dur_s)
    pitch = f * (1 + 0.04 * np.exp(-t / 0.05))          # the skin is tighter at the hit
    body = np.sin(2 * np.pi * np.cumsum(pitch) / SR) * np.exp(-t / 0.7)
    hit = rng.uniform(-1, 1, len(t)) * np.exp(-t / 0.01)
    return 0.3 * body + 0.05 * hit


def bass(f, dur_s=1.5, tau=0.6, amp=0.25):
    t = time_axis(dur_s)
    wave = sum(np.sin(2 * np.pi * k * f * t) / k * np.exp(-t * k / tau) for k in range(1, 8))
    return amp * wave                                    # high harmonics die first: a plucked string


def reed(f, dur_s=1.2, attack=0.06):
    t = time_axis(dur_s)
    wave = sum(np.sin(2 * np.pi * k * f * t) / k for k in [1, 3, 5, 7])       # odd harmonics: hollow
    env = np.minimum(1, t / attack) * np.minimum(1, (dur_s - t) / 0.2)
    return 0.08 * wave * env


def bell(f, dur_s=3.0, amp=0.1):
    t = time_axis(dur_s)
    partials = [(1, 1.0, 1.5), (2.76, 0.5, 0.8), (5.40, 0.25, 0.4), (8.93, 0.12, 0.2)]   # (ratio, amp, decay)
    return amp * sum(a * np.sin(2 * np.pi * r * f * t) * np.exp(-t / d) for r, a, d in partials)


def played(instrument, octave=0, **options):
    """A sound for Loop: a degree of the key, now, played by an instrument (options go to it)."""
    waves = {}                                           # one wave per pitch, computed the first time

    def sound(degree):
        pitch = key[degree + octave * len(key.distances)]
        if pitch.midi not in waves:
            waves[pitch.midi] = instrument(pitch.f, **options)
        return waves[pitch.midi]
    return sound


# --- A clock, a band that moves it, loops that read it ---

class Clock:
    def __init__(self, bpm=120):
        self.bpm = bpm
        self.beat = 0.0                      # where the block being played starts, in beats
        self.end = 0.0                       # where it ends

    @property
    def beat_s(self):
        return 60 / self.bpm

    def tick(self, frames):                  # one block more
        self.beat = self.end
        self.end = self.beat + frames / SR / self.beat_s


class Band(Mixer):
    """A mixer that keeps time: before each block, it moves its clock on."""
    def __init__(self, clock, sources=None):
        super().__init__(sources if sources is not None else [])
        self.clock = clock

    def block(self, frames):
        self.clock.tick(frames)
        return super().block(frames)


class Loop:
    def __init__(self, clip, sound, clock, start=None, bar=4):
        self.clip = clip
        self.sound = sound
        self.clock = clock
        self.next = None
        if start is None:                    # by default, at the start of the next bar
            start = math.ceil(clock.end / bar) * bar
        self.start = start                   # the beat of the clock where round 0 starts
        self.voices = Mixer([])

    def start_voices(self, a, b):
        """Start every note that falls in [a, b), in beats of the clock, each one exactly in its place."""
        length = self.clip.length
        for onset, data in self.clip.events:
            k = max(0, math.ceil((a - self.start - onset) / length))     # the first round not before a
            t = self.start + onset + k * length
            while t < b:
                delay = round((t - self.clock.beat) * self.clock.beat_s * SR)     # from the start of the block
                self.voices.sources.append(Voice(self.sound(data), delay))
                t += length

    def block(self, frames):
        a, b = self.clock.beat, self.clock.end
        if self.next is not None:
            if a < self.start:               # not started yet: change at once
                self.clip, self.next = self.next, None
            else:
                edge = self.start + math.ceil((a - self.start) / self.clip.length) * self.clip.length
                if edge < b:                 # a round ends inside this block
                    self.start_voices(a, edge)
                    self.clip, self.next, self.start = self.next, None, edge
                    a = edge
        self.start_voices(a, b)
        return self.voices.block(frames)


class Once(Loop):
    """Only round 0. Done when it is over and its last sound has rung out."""
    def start_voices(self, a, b):
        for onset, data in self.clip.events:
            t = self.start + onset
            if a <= t < b:
                self.voices.sources.append(Voice(self.sound(data), round((t - self.clock.beat) * self.clock.beat_s * SR)))

    @property
    def done(self):
        return self.clock.beat >= self.start + self.clip.length and not self.voices.sources


class Steps:
    def __init__(self, text, name, step=0.25):
        self.steps = [symbol == "x" for symbol in text]
        self.name = name
        self.step = step                     # in beats: 0.25 is a sixteenth

    @property
    def events(self):
        return [(i * self.step, self.name) for i, on in enumerate(self.steps) if on]

    @property
    def length(self):
        return len(self.steps) * self.step

    def toggle(self, i):
        self.steps[i] = not self.steps[i]

    def __repr__(self):
        return "".join("x" if on else "." for on in self.steps)


# --- The stream, and where the music is now ---

heard = {"beat": 0.0, "at": 0.0, "stream": None, "clock": None}


def stream_of(band, blocksize=512, latency=0.15):
    """The band on the sound card. Each block notes its first beat and when it will be heard."""
    def callback(outdata, frames, time, status):
        outdata[:, 0] = np.clip(band.block(frames), -1, 1)
        heard["beat"], heard["at"] = band.clock.beat, time.outputBufferDacTime
    stream = sd.OutputStream(samplerate=SR, channels=1, blocksize=blocksize, latency=latency, callback=callback)
    heard["stream"], heard["clock"] = stream, band.clock
    return stream


def heard_beat():
    """The beat being heard now: the last block's first beat, minus how far ahead it is."""
    if heard["stream"] is None:
        return 0.0
    ahead_s = heard["at"] - heard["stream"].time
    return heard["beat"] - ahead_s / heard["clock"].beat_s


def enter(sound, clip=None):
    """Another voice of the round: the tune from its start, 8 beats after the last voice that entered
    (or later, on the same grid of 8, if that moment is past)."""
    tunes = [s for s in m.sources if isinstance(s, Loop) and not isinstance(s.clip, Steps)]
    if not tunes:
        loop = Loop(clip or fm, sound, clock, bar=8)
    else:
        last = max(s.start for s in tunes)
        k = max(1, math.ceil((clock.end - last) / 8))
        loop = Loop(clip or fm, sound, clock, start=last + 8 * k)
    m.sources.append(loop)
    return loop


def snapshot(names):
    """What the page draws, as JSON: the beat heard now, and each voice by name."""
    voices = []
    for name in names.split(","):
        loop = globals().get(name)
        if not isinstance(loop, Loop) or loop not in m.sources:
            continue
        voices.append({
            "name": name,
            "start": loop.start,
            "length": loop.clip.length,
            "events": [[float(onset), float(data)] for onset, data in loop.clip.events],
            "next": loop.next is not None,
        })
    return json.dumps({"beat": heard_beat(), "bpm": clock.bpm, "voices": voices,
                       "steps": {name: repr(globals()[name]) for name in ("kicks", "snares", "hats")}})
