---
theme: default
title: What does + mean?
info: ACTAM 2026 · Lesson 06
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

<div class="kicker">ACTAM 2026 · Lesson 06</div>
<h1 class="cover-title">What does<br>+ mean?</h1>
<div class="cover-meta">numpy for sound, classes, operators and pitches</div>

<!--
Use the companion notebook in order: sections 1–7.
-->

---

# Today

1. numpy for sound: a note in one line.
2. numpy changes what `+` means. How is that possible?
3. Our own types: **classes**, and our own operators.
4. A `Pitch` that knows it is a note.
5. Scales from intervals, and what we would like to write next.

<NotebookCue section="1" task="Run the setup cell." />

<!--
numpy is fast because its operations are written in C, behind a Python interface: a common pattern. Today the other side of numpy: it gives operators a new meaning.
-->

---
class: dark
---

<div class="chapter"><div class="kicker">numpy for sound</div><h1>A note<br>in one line</h1></div>

---

# One operation, every element

```python
a = np.arange(10)
a / 10                        # [0. 0.1 0.2 ... 0.9]

t = np.arange(SR) / SR        # the time of every sample, in seconds
wave = np.sin(2 * np.pi * 440 * t)
```

`np.sin` computes the sine of every element: a sine at the time of every sample.

<NotebookCue section="2" task="Plot np.sin(t), then 2πt, then listen to 440 Hz." />

<!--
np.sin(t) alone has a period of 2π seconds: less than one period in the plot. 2πt gives 1 Hz, inaudible. 440 periods per second fill the plot with a block: listen instead.
-->

---

# An envelope is a multiplication

```python
env = np.exp(-t / 0.3)
sound = env * wave                       # lesson 05's vca

def pluck(f, dur_s=1.0, tau=0.3, amplitude=0.25):
    t = np.arange(round(dur_s * SR)) / SR
    env = np.exp(-t / tau)
    wave = np.sin(2 * np.pi * f * t)
    return amplitude * env * wave
```

A name ending in `_s` is in **seconds**.

<NotebookCue section="2" task="Define play and pluck, and listen." />

<!--
array * array multiplies sample by sample; number * array multiplies every sample: a gain.
-->

---

# Sounds in time

A **sound** is `(onset_s, wave)`. In lesson 05 these were *events*: that word will get a musical meaning next time.

```python
def mix_sounds(sounds):
    dur_s = max([onset_s + len(wave) / SR for onset_s, wave in sounds])
    out = np.zeros(round(dur_s * SR))
    for onset_s, wave in sounds:
        onset = round(onset_s * SR)
        out[onset:onset + len(wave)] += wave
    return out
```

<NotebookCue section="2" task="Mix two plucks, 0.25 s apart." />

<!--
Three steps: where the last sound ends; silence of that length; each wave added into its slice. onset_s in seconds, onset in samples.
-->

---

<div class="kicker">Your turn · 01</div>

# A major scale

Play a major scale from A4 (440 Hz), one note every 0.25 s.

Steps in semitones: `[0, 2, 4, 5, 7, 9, 11, 12]`.

<NotebookCue section="2" task="Build the sounds and mix them." />

<!--
Allow 5 minutes. One comprehension over range(len(scale)): onset i * 0.25, frequency 440 * 2 ** (scale[i] / 12).
-->

---
class: dark
---

<div class="chapter"><div class="kicker">Abstraction</div><h1>Same sign,<br>different meaning</h1></div>

---

# Lists and arrays

```python
a = [1, 2, 3, 4]                     x = np.array(a)
b = [10, 20, 30, 40]                 y = np.array(b)
a + b    # [1, 2, 3, 4, 10, ...]     x + y    # [11 22 33 44]
a * b    # TypeError                 x * y    # [10 40 90 160]
```

On lists, `+` joins. On arrays, `+` and `*` work element by element.

Who decides? The **type** of the value: `type(a)`, `type(x)`.

<NotebookCue section="3" task="Try + and * on both, then print the types." />

<!--
np.array(a) is a constructor: a function that makes a new value of a type.
-->

---

# An operator is a method call

```python
type(3).__add__(10, 20)     # 30
(3).__add__(2)              # 5: what 3 + 2 means
dir(3)                      # all the methods of an int
```

`a + b` is short for `a.__add__(b)`: Python asks the value on the **left**.

`__add__` is `+`, `__mul__` is `*`, `__sub__` is `-`, `__eq__` is `==`.

If we make our own type, we choose what `+` means.

<NotebookCue section="3" task="Call __add__ directly." />

<!--
The double underscores mark special methods: Python calls them for us. Nobody writes (3).__add__(2) in practice; it only shows the mechanism.
-->

---

# A class

```python
class MyInt:
    def __init__(self, n):
        self.number = n
    def print(self):
        print(self.number)

x = MyInt(2)
x.print()
```

- `MyInt(2)` makes an **object** and calls `__init__`; `self.number` is an **attribute**.
- A function inside a class is a **method**: `x.print()` passes `x` as `self`.

<NotebookCue section="4" task="Make a MyInt and print it." />

<!--
No declaration of number is needed: __init__ creates the attribute. type(x) is __main__.MyInt.
-->

---

# Our own +

```python
class MyInt:
    def __init__(self, n):
        self.number = n

    def __add__(self, other):
        return MyInt(self.number + other.number)

y = MyInt(3) + MyInt(4)      # MyInt(3).__add__(MyInt(4))
```

`self` is the left operand, `other` the right one.

Return `MyInt(self.number * other.number)` and `+` multiplies: the author decides.

<NotebookCue section="4" task="Add two MyInt, then change what + does." />

<!--
@dataclass, a shorter way to write classes that store data, comes next time.
-->

---

# A wave

```python
class Wave:
    def __init__(self, samples):
        self.samples = list(samples)
    def peak(self):
        return max([abs(s) for s in self.samples])
    def __add__(self, other):          # pad the shorter, then mix
        n = max(len(self.samples), len(other.samples))
        a = self.samples + [0] * (n - len(self.samples))
        b = other.samples + [0] * (n - len(other.samples))
        return Wave([x + y for x, y in zip(a, b)])
    def __repr__(self):
        return "Wave" + str(self.samples)
```

<NotebookCue section="4" task="Add two waves of different lengths." />

<!--
zip alone would stop at the shorter list and lose the end of the longer. __repr__ is what Python shows when it prints the object; without it, <__main__.Wave object at 0x...>.
-->

---

# Multiply by a number, refuse the rest

```python
    def __mul__(self, other):
        if isinstance(other, (int, float)):
            return Wave([other * x for x in self.samples])
        return NotImplemented

(Wave([1, 2, 3]) + Wave([3, 4, 5, 6, 7])) * 0.25
Wave([1, 2, 3]) * Wave([4, 5])     # TypeError
```

`isinstance` asks the type. `NotImplemented` says "this case is not defined".

<NotebookCue section="4" task="Multiply by a number, then by a wave." />

<!--
With NotImplemented Python raises a TypeError with its own message. w * 2 works, 2 * w does not: Python asks the int first, then w.__rmul__, which we have not written.
-->

---

<div class="kicker">Your turn · 02</div>

# Multiplying two waves

`env * wave` multiplied sample by sample: modulation.

Make `Wave * Wave` multiply sample by sample, and keep `Wave * number` as a gain.

<NotebookCue section="4" task="Extend __mul__ and test both cases." />

<!--
Allow 5 minutes. A second isinstance(other, Wave) branch with zip(self.samples, other.samples): the result is as long as the shorter wave.
-->

---
class: dark
---

<div class="chapter"><div class="kicker">Pitches</div><h1>A number that<br>knows it is a note</h1></div>

---

# MIDI numbers, two kinds of values

C4 (middle C) is 60, **A4 is 69, 440 Hz**, one step is one semitone.

| operation | result | calendar |
|---|---|---|
| pitch + interval | pitch | date + 3 days → date |
| pitch − pitch | interval | date − date → days |
| pitch + pitch | meaningless | "today + tomorrow" |

An interval stays a number. A pitch becomes an object that allows only what makes sense.

<NotebookCue section="5" task="Read the table." />

<!--
f = 440 · 2^((m − 69)/12). The calendar analogy usually lands immediately.
-->

---

# A pitch class

```python
class Pitch:
    def __init__(self, midi):
        self.midi = midi
    def freq(self):
        return 440 * 2 ** ((self.midi - 69) / 12)
    def __add__(self, semitones):
        if isinstance(semitones, Pitch):
            raise TypeError("Add semitones, not a pitch.")
        return Pitch(self.midi + semitones)
    def __repr__(self):
        return note_names[self.midi % 12] + str(self.midi // 12 - 1)
```

<NotebookCue section="5" task="Make A4, add 2, try A4 + B4." />

<!--
note_names lists the twelve names from "C" to "B", defined above the class in the notebook. % 12 is the position in the octave, // 12 counts octaves; MIDI numbers octaves from −1, hence − 1: 69 is A4. The notebook wraps A4 + B4 in try/except so that Run All does not stop.
-->

---

# Pitches from names

```python
name = "A#4"
name[:-1]                      # 'A#': all but the last character
name[-1]                       # '4': the octave
note_names.index("A#")         # 10

class Pitch:
    def __init__(self, value):
        if isinstance(value, str):     # a name like "C4"
            value = 12 * (int(value[-1]) + 1) + note_names.index(value[:-1])
        self.midi = value
```

`Pitch(69)` and `Pitch("A4")` are the same note.

<NotebookCue section="5" task="Parse a name, then complete the class." />

<!--
Names handle octaves 0–9 and sharps only. The notebook's final class also has __sub__ (pitch − pitch is an interval, pitch − number a lower pitch) and __eq__.
-->

---

<div class="kicker">Your turn · 03</div>

# Equal or the same?

Comment out `__eq__`, run the class again, and try:

```python
Pitch("A4") == Pitch(69)
```

What does `==` compare without `__eq__`?

<NotebookCue section="5" task="Remove __eq__, test, then put it back." />

<!--
Allow 3 minutes. Without __eq__, == asks whether both names point to the same object: two objects with the same midi are not the same object, so False. With __eq__ we decide that equal notes are equal pitches. Make sure everyone puts it back: next lesson relies on it.
-->

---
class: dark
---

<div class="chapter"><div class="kicker">Scales</div><h1>A tonic<br>and intervals</h1></div>

---

# Scales from intervals

```python
major_intervals = [0, 2, 4, 5, 7, 9, 11, 12]
[Pitch("G4") + i for i in major_intervals]
# [G4, A4, B4, C5, D5, E5, F#5, G5]

g_major = [(i * 0.25, pluck((Pitch("G4") + major_intervals[i]).freq()))
           for i in range(len(major_intervals))]
play(mix_sounds(g_major + g_sharp_major))
```

Joined lists of sounds play together: each sound keeps its onset.

<NotebookCue section="6" task="Name the notes, then listen to one scale and to two." />

<!--
G major has one sharp, F#: the names confirm it. g_major + g_sharp_major joins two lists (list +), and mix_sounds puts each sound at its onset: two scales at once.
-->

---

<div class="kicker">Your turn · 04</div>

# Up and down

Play G melodic minor going up, then coming down.

`minor_melodic_intervals = [0, 2, 3, 5, 7, 9, 11, 12]`

`intervals[::-1]` is the list reversed. Do not repeat the top note.

<NotebookCue section="6" task="Build the intervals, then the sounds." />

<!--
Allow 4 minutes. up_down = intervals + intervals[::-1][1:]. Classically the melodic minor comes down as natural minor; here the point is the list.
-->

---

# What we would like to write

```python
Note(Pitch("A4"), 2) >> Note(Pitch("B4"))     # then
Note(Pitch("A4")) & Note(Pitch("C#5"))        # together: a chord
```

A type for notes, a type for sequences, and the meaning of `>>` and `&`.

Next time, with a small ambient piece of long drones.

<NotebookCue section="7" task="Read the wish." />

---

# What we built

- numpy applies arithmetic to every element: a note in one line, a mixer with one slice.
- `a + b` is `a.__add__(b)`: the type of `a` decides.
- A class makes a type: `__init__` and `self` for data, methods for behaviour, special methods for operators and `print`.
- Allow the operations that make sense; refuse the others: pitch + interval, not pitch + pitch.

<NotebookCue section="7" task="Restart the notebook and run it in order." />
