---
theme: default
title: Music as data
info: ACTAM 2026 · Lesson 07
layout: default
class: dark
colorSchema: light
fonts:
  sans: Arial
  mono: Menlo
  provider: none
drawings:
  persist: false
transition: none
---

<div class="kicker">ACTAM 2026 · Lesson 07</div>
<h1 class="cover-title">Music<br>as data</h1>
<div class="cover-meta">clips, operators, scales and a canon</div>

<!--
Use the companion notebook in order: sections 1–11. It follows the lesson of 19 October 2026. The exercise "For next time" (fm + 7) opens lesson 08.
-->

---

# Today

1. From notes to sounds, the long way.
2. A **clip**, with *then*, *again* and *together*.
3. Melodies in **degrees**: the scale decides the notes.
4. A canon in one line.

<NotebookCue section="1" task="Run the setup cell: last time's tools." />

<!--
The setup cell repeats lesson 06: play, pluck, mix_sounds, note_names and Pitch, with from dataclasses import dataclass. One change: freq() is now f, a property.
-->

---

# A property

```python
    @property
    def f(self):                 # the frequency in Hz
        return 440 * 2 ** ((self.midi - 69) / 12)

p = Pitch("A4")
p.f              # 440.0, no parentheses
(p + 1).f        # A#4
```

- A line with `@` is a **decorator**: it changes the function right after it.
- `@property` reads a method like an attribute: Python calls it for us.

<NotebookCue section="1" task="Make a pitch and read its f." />

<!--
It suits methods that only read the object: a pitch has exactly one frequency. Only notation: f is still computed at every call. To compute it once, __init__ could store it.
-->

---
class: dark
---

<div class="chapter"><div class="kicker">Clips</div><h1>Melodies<br>as data</h1></div>

---

# From notes to sounds

```python
call_notes = [(1, 0), (1, 2), (1, 4), (1, 0)]          # (beats, semitones)
call_pitches = [(beats, root + semitones)
                for beats, semitones in call_notes]
call_sounds = [(beats, pluck(pitch.f))
               for beats, pitch in call_pitches]
```

One step at a time: semitones, then pitches, then waves.

The step still missing: `mix_sounds` wants **onsets**, not durations.

<NotebookCue section="2" task="Turn the first bar into pitches, then waves." />

<!--
Durations to onsets means a running sum: 0, 1, 2, 3. It can be done, but it gets worse with every new idea: repeat a phrase, play two voices, start a voice later. So we change approach.
-->

---

# What we would like to write

```python
clip = note(0) >> note(2) >> note(4) >> note(0)
play_clip(clip)
```

- `note(0)`: one note, the root, one beat long.
- `>>` reads as *then*.
- The result is a **clip**, as in a sequencer or a DAW.

First the wish, then we work backwards to make it true.

<NotebookCue section="3" task="Read the wish." />

---

# Events and clips

| | when | what |
|---|---|---|
| a sound | `onset_s`, in seconds | a wave |
| an **event** | `onset`, in beats | some data: for now a pitch |

```python
(4.5, Pitch("A#4"))      # an A#4, on beat 4.5
```

A **clip** is a set of events and a length, in beats.

<NotebookCue section="4" task="Read the two definitions." />

<!--
An event is a sound one step more abstract: it says when and what, and leaves the wave for later.
-->

---

# A dataclass

```python
@dataclass
class ComplexNumber:
    real: float
    imag: float

@dataclass
class Clip:
    events: list      # (onset, data): onset in beats
    length: float     # in beats: where the next clip starts
```

`@dataclass` writes `__init__`, `__repr__` and `__eq__` from the fields.

<NotebookCue section="4" task="Make a complex number, then a clip with two events." />

<!--
The type after the colon documents the field; Python does not check it. Clip([(0, Pitch("A4")), (1, Pitch("B4"))], 2): why 2? The events do not say how long the clip is; the length is a choice, and it says where the next clip starts.
-->

---

# Playing a clip

```python
def play_clip(clip, beat_s=0.5):
    sounds = [(onset * beat_s, pluck(pitch.f))
              for onset, pitch in clip.events]
    return play(mix_sounds(sounds))

def note(semitones, length=1, root=Pitch("A4")):
    return Clip([(0, root + semitones)], length)
```

- `beat_s`: one beat, in seconds. The tempo.
- A note is a clip with a single event, at time 0.

<NotebookCue section="4" task="Play the clip, then play note(0)." />

---

# Then: `>>`

<svg viewBox="0 0 760 200" width="760" height="200" role="img" aria-label="Two piano rolls: the events of a and b put together sound at the same time; in a >> b the events of b move later by the length of a.">
  <g>
    <text style="font: 14px Menlo, monospace; fill: #53656c" x="20" y="20">a.events + b.events</text>
    <text style="font: 14px Menlo, monospace; fill: #53656c" x="400" y="20">a &gt;&gt; b</text>
  </g>
  <g stroke="#ccd4cf">
    <line x1="20" y1="150" x2="140" y2="150"/><line x1="20" y1="40" x2="20" y2="150"/><line x1="80" y1="40" x2="80" y2="150"/><line x1="140" y1="40" x2="140" y2="150"/>
    <line x1="400" y1="150" x2="640" y2="150"/><line x1="400" y1="40" x2="400" y2="150"/><line x1="460" y1="40" x2="460" y2="150"/><line x1="520" y1="40" x2="520" y2="150"/><line x1="580" y1="40" x2="580" y2="150"/><line x1="640" y1="40" x2="640" y2="150"/>
  </g>
  <g fill="#087e83">
    <rect x="22" y="126" width="54" height="20"/><rect x="82" y="102" width="54" height="20"/>
    <rect x="402" y="126" width="54" height="20"/><rect x="462" y="102" width="54" height="20"/>
  </g>
  <g fill="#cb4f38">
    <rect x="22" y="78" width="54" height="20"/><rect x="82" y="54" width="54" height="20"/>
    <rect x="522" y="78" width="54" height="20"/><rect x="582" y="54" width="54" height="20"/>
  </g>
  <g>
    <text style="font: 14px Menlo, monospace; fill: #53656c" x="20" y="172">0</text><text style="font: 14px Menlo, monospace; fill: #53656c" x="76" y="172">1</text><text style="font: 14px Menlo, monospace; fill: #53656c" x="136" y="172">2</text>
    <text style="font: 14px Menlo, monospace; fill: #53656c" x="400" y="172">0</text><text style="font: 14px Menlo, monospace; fill: #53656c" x="456" y="172">1</text><text style="font: 14px Menlo, monospace; fill: #53656c" x="516" y="172">2</text><text style="font: 14px Menlo, monospace; fill: #53656c" x="576" y="172">3</text><text style="font: 14px Menlo, monospace; fill: #53656c" x="636" y="172">4</text>
    <text style="font: 14px Menlo, monospace; fill: #087e83" x="160" y="140">a</text><text style="font: 14px Menlo, monospace; fill: #cb4f38" x="160" y="92">b</text>
    <text style="font: 14px Menlo, monospace; fill: #53656c" x="405" y="194">a.length</text>
  </g>
  <path d="M402 182 L518 182" stroke="#53656c" stroke-width="1.5"/>
</svg>

The events of `b` move later by the length of `a`; the lengths add up.

<NotebookCue section="5" task="Try the two lists of events together, and listen." />

<!--
The blackboard drawing of the lesson. Putting the two lists together makes the notes sound at the same time: remember it, it will be |. In a >> b, b starts where a ends.
-->

---

# Then: `>>`, in code

```python
    def __rshift__(self, other):          # then
        moved = [(onset + self.length, data)
                 for onset, data in other.events]
        return Clip(self.events + moved, self.length + other.length)

call = note(0) >> note(2) >> note(4) >> note(0)
play_clip(call, beat_s=0.25)
```

`a >> b` calls `a.__rshift__(b)`. For numbers it shifts bits; for clips, it is ours.

<NotebookCue section="5" task="Add >> to Clip, then play the wish." />

<!--
a and b were made with the old class: they must be made again. One short method, and the wish of section 3 works.
-->

---

# Again: `*`

```python
    def __mul__(self, times):             # again
        out = Clip([], 0)
        for _ in range(times):
            out = out >> self
        return out

play_clip(call * 2)
```

Start from an empty clip, add `self` after it, `times` times.

<NotebookCue section="6" task="Try call * 2, then add __mul__." />

<!--
Small methods, a few lines each, and a way of writing music emerges: a small language of our own, closer to the music than lists and loops.
-->

---
class: dark
---

<div class="chapter"><div class="kicker">Scales</div><h1>The scale<br>reads the melody</h1></div>

---

# Degrees, not semitones

*Fra Martino* in minor? With semitones we rewrite the notes. With **degrees**, only the scale changes.

```python
scale = Scale([2, 2, 1, 2, 2, 2, 1], Pitch("A4"))     # steps, root
scale[0]      # A4
scale[1]      # B4
scale[2]      # C#5
```

Mahler made this tune a funeral march: in minor, much slower.

<NotebookCue section="7" task="Read the wish." />

<!--
Steps are the distances in semitones between neighbouring notes. Degrees count from 0: the first, second, third note of the scale. Mahler: First Symphony, third movement.
-->

---

# Accumulate the steps

```python
class Scale:
    def __init__(self, steps, root):
        self.root = root
        self.distances = []
        distance = 0
        for step in steps:
            self.distances.append(distance)
            distance += step
```

`[2, 2, 1, 2, 2, 2, 1]` becomes `[0, 2, 4, 5, 7, 9, 11]`: A, B, C#, D, E, F#, G#.

<NotebookCue section="7" task="Build the scale and print its distances." />

<!--
Each distance is the previous one plus a step. The same pattern as the onsets: a running sum.
-->

---

# Square brackets

```python
    def __getitem__(self, degree):
        return self.root + self.distances[degree]

a_major = Scale([2, 2, 1, 2, 2, 2, 1], Pitch("A4"))
assert a_major[2] == Pitch("C#5")
```

Without it: `'Scale' object is not subscriptable`.

`s[2]` calls `s.__getitem__(2)`; the `+` of `Pitch` does the rest.

<NotebookCue section="7" task="Try s[2], then add __getitem__." />

---

# Data, not pitches

```python
def note(data, length=1):
    return Clip([(0, data)], length)

def play_clip(clip, scale, beat_s=0.5):
    sounds = [(onset * beat_s, pluck(scale[data].f))
              for onset, data in clip.events]
    return play(mix_sounds(sounds))
```

The clip never looks inside the data: whoever plays it decides.

Like a sequencer: it sends values in time, the module decides what they mean.

<NotebookCue section="8" task="Play call in A major, then in A minor." />

<!--
The choice of pitches was only in note. Now the data are plain numbers, read as degrees by play_clip: degree, pitch, frequency, wave. Minor: steps 2, 1, 2, 2, 1, 2, 2. A sequencer's values could be a pitch, a volume, anything.
-->

---

<div class="kicker">Your turn · 01</div>

# Another scale

Play `call` in A Mixolydian: steps 2, 2, 1, 2, 2, 1, 2.

Then in a scale of your own. The steps must add up to 12.

<NotebookCue section="8" task="Make the scale and play call." />

<!--
Allow 4 minutes. Fra Martino sounds the same in major and Mixolydian: call never reaches the seventh. The scale matters only for the degrees the melody uses. Steps adding up to 12 bring the scale back to the root, one octave up.
-->

---

# The whole song

```python
climb = note(2) >> note(3) >> note(4, 2)
bells = (note(4, 0.5) >> note(5, 0.5) >> note(4, 0.5) >> note(3, 0.5)
         >> note(2) >> note(0))
fm = call * 2 >> climb * 2 >> bells * 2

cadence = note(0) >> note(-3) >> note(0, 2)      # E5, not E4
```

A negative index counts from the end: `distances[-3]` is degree 4, same octave.

<NotebookCue section="9" task="Play fm, then the cadence: does it go down?" />

<!--
The cadence goes down to the fifth below the root: degree 4, one octave lower, -3 counting down from 0. The scale does not know about octaves yet: next time. For now the song ends with the bells.
-->

---
class: dark
---

<div class="chapter"><div class="kicker">Canon</div><h1>Two voices,<br>one melody</h1></div>

---

# Together: `|`

```python
    def __or__(self, other):              # together
        return Clip(self.events + other.events,
                    max(self.length, other.length))

play_clip(climb | bells, a_major)
```

The first try at `>>`: the two lists of events together. The length is the longer one.

<NotebookCue section="10" task="Add | to Clip; play climb and bells together." />

---

# A rest, and a canon

```python
def rest(length):
    return Clip([], length)          # no events, only a length

canon = fm | (rest(8) >> fm)
play_clip(canon, a_major)
```

The second voice enters after 8 beats, two bars.

`>>` comes before `|`: the parentheses are only for safety.

<NotebookCue section="10" task="Play the canon with Clip([], 8), then with rest(8)." />

---

<div class="kicker">Your turn · 02</div>

# Three voices, and Mahler

Add a third voice that enters after 16 beats.

Then make it a funeral march: in minor, much slower.

<NotebookCue section="10" task="Write the canon, then change scale and beat_s." />

<!--
Allow 5 minutes. canon3 = fm | rest(8) >> fm | rest(16) >> fm, then play_clip(canon3, a_minor, beat_s=0.8).
-->

---

# What we built

| expression | meaning |
|---|---|
| `note(d, length)`, `rest(length)` | a clip with one event, with none |
| `a >> b`, `a \| b` | then, together |
| `a * 2` | twice |
| `scale[d]` | the pitch of degree `d` |

- An event is `(onset, data)`; a clip is events and a length.
- The clip stores data; playing decides what they mean.

<NotebookCue section="11" task="Restart the notebook and run it in order." />

<!--
@property and @dataclass: two decorators. The steps accumulated into distances, and __getitem__ for square brackets. With a few small operators, a small language for music.
-->

---

<div class="kicker">For next time</div>

# Higher

```python
fm + 7        # TypeError, for now
```

- Write `__add__` for `Clip`: same onsets, same length, every data plus a number.
- Then play `fm + 7` in A major. What happens, and why?
- The cadence and its `-3` are the same problem.

Next time: *Fra Martino* becomes an ambient piece.

<NotebookCue section="11" task="Try fm + 7." />

<!--
fm + 7 asks for degrees 7 to 12: IndexError, distances has 7 entries. Lesson 08 fixes it with // and %, and the cadence with it.
-->
