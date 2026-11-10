---
theme: default
title: Time in beats
info: ACTAM 2026 · Lesson 10
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

<div class="kicker">ACTAM 2026 · Lesson 10</div>
<h1 class="cover-title">Time<br>in beats</h1>
<div class="cover-meta">a clock, a metronome, clips that loop</div>

<!--
The companion is lesson 10's notebook. Its tools cell has the clips, the scales and the instruments; the sources come from lesson 09.
-->

---

# Sources, so far

| | |
|---|---|
| a **source** | anything with `block(frames)` |
| `stream_of(source)` | a stream that plays a source, clipped to [-1, 1] |
| `Mixer` | a source made of sources; drops the ones that are `done` |
| `Voice` | a wave as a source |
| `Sine` | an oscillator that keeps its phase |

<NotebookCue section="1" task="Run the setup, the tools and the sources." />

---

# One stream, always on

```python
m = Mixer([])
out = stream_of(m)
out.start()                                      # silence, for now

for degree in [0, 2, 4, 7]:                      # a chord
    m.sources.append(Voice(pluck(a_minor[degree].f)))

m.sources.append(Sine(220))                      # never done
m.sources.clear()
```

- One stream for the whole lesson: we only change what is in the mixer.

<NotebookCue section="1" task="Start the stream, play a chord, then clear." />

---
class: dark
---

<div class="chapter"><div class="kicker">Two clocks</div><h1>Who keeps<br>the time?</h1></div>

---

# A rhythm with `sleep`

```python
tick = pluck(Pitch("A5").f, dur_s=0.05)

for _ in range(32):
    m.sources.append(Voice(tick))
    await asyncio.sleep(0.125)
```

- `sleep` waits *at least* 0.125 s, by Python's clock: 125 to 126 ms.
- The errors add up: after 31 ticks, about 30 ms late.
- And a voice is heard only from the next block.

<NotebookCue section="2" task="Measure the gaps with time.perf_counter." />

<!--
Two clocks again: Python's and the sound card's. The card asks for exactly 48000 samples a second; Python wakes up when it can.
-->

---

# Two voices, two cells

```python
ticks1 = mix_sounds([(0.5 * i, tick) for i in range(64)])
ticks2 = mix_sounds([(0.5 * i, pluck(Pitch("C4").f, dur_s=0.05))
                     for i in range(64)])

m.sources.append(Voice(ticks1))
m.sources.append(Voice(ticks2))                  # a moment later
```

- Each voice is in time with itself, not with the other.
- The second starts when its cell runs, anywhere inside a beat: same tempo, out of step.

<NotebookCue section="2" task="Start one, then the other: are they together?" />

---

# A time we share

- The sound card asks for exactly 48000 samples a second: it is a clock.
- A source can count time itself: each block lasts `frames / SR` seconds.
- Music counts in **beats**, not in seconds.

<div class="answer">A block lasts <code>frames / SR / beat_s</code> beats.</div>

---
class: dark
---

<div class="chapter"><div class="kicker">Beats</div><h1>A clock<br>and a metronome</h1></div>

---

# A clock

```python
class Clock:
    def __init__(self, bpm=120):
        self.bpm = bpm

    @property
    def beat_s(self):                            # seconds in a beat
        return 60 / self.bpm

clock = Clock(110)
clock.beat_s                                     # 0.545...
```

- A shared, named number. Every source we give it follows its tempo.

<NotebookCue section="3" task="Make a clock, then change clock.bpm." />

---

# Counting

```python
class Beats:
    def __init__(self, clock):
        self.clock = clock
        self.position = 0.0                      # in beats

    def block(self, frames):
        self.position += frames / SR / self.clock.beat_s
        return np.zeros(frames)                  # silent
```

- A source that only counts where it is. `b.position` grows while it plays.

<NotebookCue section="3" task="Add a Beats to the mixer, and read b.position." />

---

# Noticing a beat

```python
    def block(self, frames):
        end = self.position + frames / SR / self.clock.beat_s
        if int(end) > int(self.position):        # a beat in [position, end)
            self.count += 1
        self.position = end
        return np.zeros(frames)
```

- `int(2.97), int(3.01)` is `(2,3)`: the integer part changed, beat 3 is in this block.

<NotebookCue section="3" task="Compare b.count and b.position." />

---
class: code-sm
---

# A click on each beat

```python
class Metronome:
    def __init__(self, sound, clock):
        self.sound = sound
        self.clock = clock
        self.position = 0.0
        self.voice = Voice(np.zeros(0))          # nothing to play yet

    def block(self, frames):
        end = self.position + frames / SR / self.clock.beat_s
        if int(end) > int(self.position):
            self.voice = Voice(self.sound)       # a new click
        self.position = end
        return self.voice.block(frames)
```

<NotebookCue section="3" task="Play it, then try clock.bpm = 90, and 280." />

<!--
One voice: a new click replaces the last one. With a sound longer than a beat, the old one is cut off.
-->

---
class: code-sm
---

# Sounds that overlap

```python
    def __init__(self, sound, clock):
        ...
        self.voices = Mixer([])                  # its own mixer

    def block(self, frames):
        end = self.position + frames / SR / self.clock.beat_s
        if int(end) > int(self.position):
            self.voices.sources.append(Voice(self.sound))
        self.position = end
        return self.voices.block(frames)
```

- `long_pluck = pluck(440, dur_s=4, tau=0.8)`: with one voice each beat cuts it off; with a mixer the notes ring on, one over the other.

<NotebookCue section="3" task="A long sound, with one voice and with a mixer." />

---

# The click is not on the beat

<div class="fig" data-fig="zoom">
<svg viewBox="0 0 760 145" width="760" height="145" role="img" aria-label="Beat 3 at 110 bpm falls inside a block of 512 samples; the click starts at the start of that block, 4.4 ms early.">
  <line x1="20.0" y1="40.0" x2="20.0" y2="110.0" stroke="#ccd4cf" stroke-width="1"/>
  <line x1="164.0" y1="40.0" x2="164.0" y2="110.0" stroke="#ccd4cf" stroke-width="1"/>
  <line x1="308.0" y1="40.0" x2="308.0" y2="110.0" stroke="#ccd4cf" stroke-width="1"/>
  <line x1="452.0" y1="40.0" x2="452.0" y2="110.0" stroke="#ccd4cf" stroke-width="1"/>
  <line x1="596.0" y1="40.0" x2="596.0" y2="110.0" stroke="#ccd4cf" stroke-width="1"/>
  <line x1="740.0" y1="40.0" x2="740.0" y2="110.0" stroke="#ccd4cf" stroke-width="1"/>
  <text style="font: 12px Menlo, monospace; fill: #53656c" x="92.0" y="132.0" text-anchor="middle">block at 77312</text>
  <text style="font: 12px Menlo, monospace; fill: #53656c" x="236.0" y="132.0" text-anchor="middle">block at 77824</text>
  <text style="font: 12px Menlo, monospace; fill: #53656c" x="380.0" y="132.0" text-anchor="middle">block at 78336</text>
  <text style="font: 12px Menlo, monospace; fill: #53656c" x="524.0" y="132.0" text-anchor="middle">block at 78848</text>
  <text style="font: 12px Menlo, monospace; fill: #53656c" x="668.0" y="132.0" text-anchor="middle">block at 79360</text>
  <line x1="20.0" y1="110.0" x2="740.0" y2="110.0" stroke="#53656c" stroke-width="1"/>
  <line x1="308.0" y1="30.0" x2="308.0" y2="110.0" stroke="#087e83" stroke-width="3"/>
  <text style="font: 14px Menlo, monospace; fill: #087e83" x="302.0" y="24.0" text-anchor="end">the click</text>
  <line x1="366.9" y1="30.0" x2="366.9" y2="110.0" stroke="#cb4f38" stroke-width="2" stroke-dasharray="5 4"/>
  <text style="font: 14px Menlo, monospace; fill: #cb4f38" x="372.9" y="24.0" text-anchor="start">beat 3: sample 78545</text>
  <line x1="308.0" y1="75.0" x2="366.9" y2="75.0" stroke="#1f2b2f" stroke-width="1.5"/>
  <line x1="308.0" y1="69.0" x2="308.0" y2="81.0" stroke="#1f2b2f" stroke-width="1.5"/>
  <line x1="366.9" y1="69.0" x2="366.9" y2="81.0" stroke="#1f2b2f" stroke-width="1.5"/>
  <text style="font: 14px Menlo, monospace; fill: #1f2b2f" x="337.5" y="66.0" text-anchor="middle">4.4 ms</text>
</svg>
</div>

- We know that a beat is *somewhere* in this block, and the voice starts at the start of the block.
- So each click is early, by up to one block: 512 / 48000 s, about 10.7 ms.

<NotebookCue section="3" task="Print, for each beat, how early its click is." />

---

# Early, beat after beat

<div class="fig" data-fig="saw512">
<svg viewBox="0 0 760 200" width="760" height="200" role="img" aria-label="How early the click is on each beat, at 110 bpm with blocks of 512: it grows beat after beat, up to 10.7 ms, then falls back to zero.">
  <line x1="70.0" y1="166.0" x2="740.0" y2="166.0" stroke="#53656c" stroke-width="1"/>
  <line x1="70.0" y1="24.0" x2="740.0" y2="24.0" stroke="#ccd4cf" stroke-width="1" stroke-dasharray="4 4"/>
  <text style="font: 12px Menlo, monospace; fill: #53656c" x="62.0" y="28.0" text-anchor="end">10.7</text>
  <text style="font: 12px Menlo, monospace; fill: #53656c" x="62.0" y="170.0" text-anchor="end">0</text>
  <text style="font: 12px Menlo, monospace; fill: #53656c" x="740.0" y="16.0" text-anchor="end">one block: 10.7 ms</text>
  <text style="font: 12px Menlo, monospace; fill: #53656c" x="62.0" y="14.0" text-anchor="end">ms early</text>
  <text style="font: 12px Menlo, monospace; fill: #53656c" x="70.0" y="186.0" text-anchor="middle">0</text>
  <text style="font: 12px Menlo, monospace; fill: #53656c" x="181.7" y="186.0" text-anchor="middle">4</text>
  <text style="font: 12px Menlo, monospace; fill: #53656c" x="293.3" y="186.0" text-anchor="middle">8</text>
  <text style="font: 12px Menlo, monospace; fill: #53656c" x="405.0" y="186.0" text-anchor="middle">12</text>
  <text style="font: 12px Menlo, monospace; fill: #53656c" x="516.7" y="186.0" text-anchor="middle">16</text>
  <text style="font: 12px Menlo, monospace; fill: #53656c" x="628.3" y="186.0" text-anchor="middle">20</text>
  <text style="font: 12px Menlo, monospace; fill: #53656c" x="740.0" y="186.0" text-anchor="middle">24</text>
  <line x1="70.0" y1="166.0" x2="70.0" y2="166.0" stroke="#087e83" stroke-width="2"/>
  <circle cx="70.0" cy="166.0" r="4" fill="#087e83" stroke="#f7f4ec" stroke-width="2"/>
  <line x1="97.9" y1="166.0" x2="97.9" y2="146.6" stroke="#087e83" stroke-width="2"/>
  <circle cx="97.9" cy="146.6" r="4" fill="#087e83" stroke="#f7f4ec" stroke-width="2"/>
  <line x1="125.8" y1="166.0" x2="125.8" y2="127.3" stroke="#087e83" stroke-width="2"/>
  <circle cx="125.8" cy="127.3" r="4" fill="#087e83" stroke="#f7f4ec" stroke-width="2"/>
  <line x1="153.8" y1="166.0" x2="153.8" y2="107.9" stroke="#087e83" stroke-width="2"/>
  <circle cx="153.8" cy="107.9" r="4" fill="#087e83" stroke="#f7f4ec" stroke-width="2"/>
  <line x1="181.7" y1="166.0" x2="181.7" y2="88.5" stroke="#087e83" stroke-width="2"/>
  <circle cx="181.7" cy="88.5" r="4" fill="#087e83" stroke="#f7f4ec" stroke-width="2"/>
  <line x1="209.6" y1="166.0" x2="209.6" y2="69.2" stroke="#087e83" stroke-width="2"/>
  <circle cx="209.6" cy="69.2" r="4" fill="#087e83" stroke="#f7f4ec" stroke-width="2"/>
  <line x1="237.5" y1="166.0" x2="237.5" y2="49.8" stroke="#087e83" stroke-width="2"/>
  <circle cx="237.5" cy="49.8" r="4" fill="#087e83" stroke="#f7f4ec" stroke-width="2"/>
  <line x1="265.4" y1="166.0" x2="265.4" y2="30.5" stroke="#087e83" stroke-width="2"/>
  <circle cx="265.4" cy="30.5" r="4" fill="#087e83" stroke="#f7f4ec" stroke-width="2"/>
  <line x1="293.3" y1="166.0" x2="293.3" y2="153.1" stroke="#087e83" stroke-width="2"/>
  <circle cx="293.3" cy="153.1" r="4" fill="#087e83" stroke="#f7f4ec" stroke-width="2"/>
  <line x1="321.2" y1="166.0" x2="321.2" y2="133.7" stroke="#087e83" stroke-width="2"/>
  <circle cx="321.2" cy="133.7" r="4" fill="#087e83" stroke="#f7f4ec" stroke-width="2"/>
  <line x1="349.2" y1="166.0" x2="349.2" y2="114.4" stroke="#087e83" stroke-width="2"/>
  <circle cx="349.2" cy="114.4" r="4" fill="#087e83" stroke="#f7f4ec" stroke-width="2"/>
  <line x1="377.1" y1="166.0" x2="377.1" y2="95.0" stroke="#087e83" stroke-width="2"/>
  <circle cx="377.1" cy="95.0" r="4" fill="#087e83" stroke="#f7f4ec" stroke-width="2"/>
  <line x1="405.0" y1="166.0" x2="405.0" y2="75.6" stroke="#087e83" stroke-width="2"/>
  <circle cx="405.0" cy="75.6" r="4" fill="#087e83" stroke="#f7f4ec" stroke-width="2"/>
  <line x1="432.9" y1="166.0" x2="432.9" y2="56.3" stroke="#087e83" stroke-width="2"/>
  <circle cx="432.9" cy="56.3" r="4" fill="#087e83" stroke="#f7f4ec" stroke-width="2"/>
  <line x1="460.8" y1="166.0" x2="460.8" y2="36.9" stroke="#087e83" stroke-width="2"/>
  <circle cx="460.8" cy="36.9" r="4" fill="#087e83" stroke="#f7f4ec" stroke-width="2"/>
  <line x1="488.8" y1="166.0" x2="488.8" y2="159.5" stroke="#087e83" stroke-width="2"/>
  <circle cx="488.8" cy="159.5" r="4" fill="#087e83" stroke="#f7f4ec" stroke-width="2"/>
  <line x1="516.7" y1="166.0" x2="516.7" y2="140.2" stroke="#087e83" stroke-width="2"/>
  <circle cx="516.7" cy="140.2" r="4" fill="#087e83" stroke="#f7f4ec" stroke-width="2"/>
  <line x1="544.6" y1="166.0" x2="544.6" y2="120.8" stroke="#087e83" stroke-width="2"/>
  <circle cx="544.6" cy="120.8" r="4" fill="#087e83" stroke="#f7f4ec" stroke-width="2"/>
  <line x1="572.5" y1="166.0" x2="572.5" y2="101.5" stroke="#087e83" stroke-width="2"/>
  <circle cx="572.5" cy="101.5" r="4" fill="#087e83" stroke="#f7f4ec" stroke-width="2"/>
  <line x1="600.4" y1="166.0" x2="600.4" y2="82.1" stroke="#087e83" stroke-width="2"/>
  <circle cx="600.4" cy="82.1" r="4" fill="#087e83" stroke="#f7f4ec" stroke-width="2"/>
  <line x1="628.3" y1="166.0" x2="628.3" y2="62.7" stroke="#087e83" stroke-width="2"/>
  <circle cx="628.3" cy="62.7" r="4" fill="#087e83" stroke="#f7f4ec" stroke-width="2"/>
  <line x1="656.2" y1="166.0" x2="656.2" y2="43.4" stroke="#087e83" stroke-width="2"/>
  <circle cx="656.2" cy="43.4" r="4" fill="#087e83" stroke="#f7f4ec" stroke-width="2"/>
  <line x1="684.2" y1="166.0" x2="684.2" y2="166.0" stroke="#087e83" stroke-width="2"/>
  <circle cx="684.2" cy="166.0" r="4" fill="#087e83" stroke="#f7f4ec" stroke-width="2"/>
  <line x1="712.1" y1="166.0" x2="712.1" y2="146.6" stroke="#087e83" stroke-width="2"/>
  <circle cx="712.1" cy="146.6" r="4" fill="#087e83" stroke="#f7f4ec" stroke-width="2"/>
  <line x1="740.0" y1="166.0" x2="740.0" y2="127.3" stroke="#087e83" stroke-width="2"/>
  <circle cx="740.0" cy="127.3" r="4" fill="#087e83" stroke="#f7f4ec" stroke-width="2"/>
</svg>
</div>

- A beat is 26182 samples at 110 bpm: 51 blocks and 70 samples. Each beat lands 70 samples, 1.5 ms, further into its block.
- A saw-tooth, below 10.7 ms: hard to hear. With bigger blocks it is not.

<!--
The rhythm is still steady on average: the error does not add up, it wraps. Beat 0 is exact, at sample 0.
-->

---
class: dark
---

<div class="chapter"><div class="kicker">Clips</div><h1>Clips<br>in time</h1></div>

---
class: code-sm
---

# A clip, once

```python
class Once:
    def __init__(self, clip, clock):
        self.clip = clip
        self.clock = clock
        self.position = 0.0
        self.voices = Mixer([])

    def block(self, frames):
        end = self.position + frames / SR / self.clock.beat_s
        for onset, data in self.clip.events:
            if self.position <= onset < end:     # this onset is in this block
                self.voices.sources.append(Voice(plucked(data)))
        self.position = end
        return self.voices.block(frames)
```

<NotebookCue section="4" task="m.sources.append(Once(fm, clock))" />

<!--
plucked(degree) is pluck(a_minor[degree].f, dur_s=0.8): it turns the data of an event into a wave.
-->

---

# Around again

```python
        self.position = end % self.clip.length   # back to the start
```

<div class="fig" data-fig="loop_end">
<svg viewBox="0 0 760 145" width="760" height="145" role="img" aria-label="A clip of 8 beats on a time line in beats. One block starts before the end of the clip and ends after it, so it holds the last part of this round and the first note of the next, which is lost.">
  <line x1="20.0" y1="110.0" x2="740.0" y2="110.0" stroke="#53656c" stroke-width="1"/>
  <line x1="20.0" y1="105.0" x2="20.0" y2="115.0" stroke="#53656c" stroke-width="1"/>
  <text style="font: 12px Menlo, monospace; fill: #53656c" x="20.0" y="134.0" text-anchor="middle">0</text>
  <line x1="85.5" y1="105.0" x2="85.5" y2="115.0" stroke="#53656c" stroke-width="1"/>
  <text style="font: 12px Menlo, monospace; fill: #53656c" x="85.5" y="134.0" text-anchor="middle">1</text>
  <line x1="150.9" y1="105.0" x2="150.9" y2="115.0" stroke="#53656c" stroke-width="1"/>
  <text style="font: 12px Menlo, monospace; fill: #53656c" x="150.9" y="134.0" text-anchor="middle">2</text>
  <line x1="216.4" y1="105.0" x2="216.4" y2="115.0" stroke="#53656c" stroke-width="1"/>
  <text style="font: 12px Menlo, monospace; fill: #53656c" x="216.4" y="134.0" text-anchor="middle">3</text>
  <line x1="281.8" y1="105.0" x2="281.8" y2="115.0" stroke="#53656c" stroke-width="1"/>
  <text style="font: 12px Menlo, monospace; fill: #53656c" x="281.8" y="134.0" text-anchor="middle">4</text>
  <line x1="347.3" y1="105.0" x2="347.3" y2="115.0" stroke="#53656c" stroke-width="1"/>
  <text style="font: 12px Menlo, monospace; fill: #53656c" x="347.3" y="134.0" text-anchor="middle">5</text>
  <line x1="412.7" y1="105.0" x2="412.7" y2="115.0" stroke="#53656c" stroke-width="1"/>
  <text style="font: 12px Menlo, monospace; fill: #53656c" x="412.7" y="134.0" text-anchor="middle">6</text>
  <line x1="478.2" y1="105.0" x2="478.2" y2="115.0" stroke="#53656c" stroke-width="1"/>
  <text style="font: 12px Menlo, monospace; fill: #53656c" x="478.2" y="134.0" text-anchor="middle">7</text>
  <line x1="543.6" y1="105.0" x2="543.6" y2="115.0" stroke="#53656c" stroke-width="1"/>
  <text style="font: 12px Menlo, monospace; fill: #53656c" x="543.6" y="134.0" text-anchor="middle">0</text>
  <line x1="609.1" y1="105.0" x2="609.1" y2="115.0" stroke="#53656c" stroke-width="1"/>
  <text style="font: 12px Menlo, monospace; fill: #53656c" x="609.1" y="134.0" text-anchor="middle">1</text>
  <line x1="674.5" y1="105.0" x2="674.5" y2="115.0" stroke="#53656c" stroke-width="1"/>
  <text style="font: 12px Menlo, monospace; fill: #53656c" x="674.5" y="134.0" text-anchor="middle">2</text>
  <line x1="740.0" y1="105.0" x2="740.0" y2="115.0" stroke="#53656c" stroke-width="1"/>
  <text style="font: 12px Menlo, monospace; fill: #53656c" x="740.0" y="134.0" text-anchor="middle">3</text>
  <line x1="543.6" y1="30.0" x2="543.6" y2="120.0" stroke="#cb4f38" stroke-width="2" stroke-dasharray="5 4"/>
  <text style="font: 13px Menlo, monospace; fill: #cb4f38" x="543.6" y="22.0" text-anchor="middle">L: the clip starts again</text>
  <circle cx="20.0" cy="110" r="5" fill="#1f2b2f"/>
  <circle cx="85.5" cy="110" r="5" fill="#1f2b2f"/>
  <circle cx="150.9" cy="110" r="5" fill="#1f2b2f"/>
  <circle cx="216.4" cy="110" r="5" fill="#1f2b2f"/>
  <circle cx="281.8" cy="110" r="5" fill="#1f2b2f"/>
  <circle cx="412.7" cy="110" r="5" fill="#1f2b2f"/>
  <circle cx="609.1" cy="110" r="5" fill="#1f2b2f"/>
  <circle cx="674.5" cy="110" r="5" fill="#1f2b2f"/>
  <circle cx="543.6" cy="110" r="6" fill="#f7f4ec" stroke="#cb4f38" stroke-width="2"/>
  <rect x="497.8" y="70" width="91.6" height="24" fill="#087e83" fill-opacity="0.15" stroke="#087e83"/>
  <text style="font: 13px Menlo, monospace; fill: #087e83" x="489.8" y="87.0" text-anchor="end">one block</text>
  <text style="font: 12px Menlo, monospace; fill: #1f2b2f" x="537.6" y="58.0" text-anchor="end">[position, L)</text>
  <text style="font: 12px Menlo, monospace; fill: #1f2b2f" x="549.6" y="58.0" text-anchor="start">[0, end − L)</text>
</svg>
</div>

- From the second round, the first note is missing.
- The block that holds the end of the clip also holds the start of the next round, and `end` is past `L`.

<NotebookCue section="5" task="Loop two bars, and listen to the first note." />

---

# Back to zero

```python
        if end > self.clip.length:
            self.position = 0.0                  # start the clip again
        else:
            self.position = end
```

- The first note is back: the next block starts from 0, and 0 is in it.
- But the part of the block past `L` is thrown away. Each round lasts a little longer than the clip, by up to a block.
- The loop slowly falls behind the clock, and behind any other loop.

<NotebookCue section="5" task="Loop call, and listen to the first note." />

<!--
At 512 samples a round is late by at most 10.7 ms, and it adds up round after round. The exact way, onset + L, is in the last chapter.
-->

---
class: dark
---

<div class="chapter"><div class="kicker">Live</div><h1>Change it<br>while it plays</h1></div>

---

# Values and identities

```python
l = Loop(call, clock)
m.sources.append(l)

l.clip = climb                                   # now, mid-phrase
l.clip = bells
l.clip |= climb                                  # bells and climb, together
clock.bpm = 90
```

- `call`, `climb`, `bells` are **values**: `|` makes a new clip, and they stay the same.
- `l` and `clock` are **identities**: the same thing, whose value changes in time.

<NotebookCue section="7" task="Change l.clip and clock.bpm while it plays." />

<!--
l.clip |= climb is l.clip = l.clip | climb: a new value in the same place. Rich Hickey's distinction, as in Clojure's atoms.
-->

---

# At the end of the loop

```python
        if end > self.clip.length:
            self.position = 0.0
            if self.next is not None:            # a clip is waiting
                self.clip = self.next
                self.next = None
```

```python
l.next = climb                                   # waits for the end
l.next = bells
l.next = ending
```

- `l.clip = ...` changes now. `l.next = ...` waits for the end of the round.

<NotebookCue section="8" task="Queue climb, bells and ending while call plays." />

<!--
Without "is not None", the first round ends with self.clip = None: the callback raises AttributeError and the stream goes silent. l.clip = None is an off switch for the same reason.
-->

---
class: table-sm
---

# What we built

| | |
|---|---|
| `Clock` | how long a beat lasts; the tempo every source shares |
| `position` | where a source is, in beats |
| `int(end) > int(position)` | a beat falls in this block |
| `Metronome` | a sound on each beat, in a mixer of its own |
| `Once`, `Loop` | a clip in time, once or around again |
| `l.clip = ...` | change what plays, now |
| `l.next = ...` | change it at the end of the round |

---
class: dark
---

<div class="chapter"><div class="kicker">Further</div><h1>Exactly<br>on time</h1></div>

---

# Nothing thrown away

```python
    def block(self, frames):
        end = self.position + frames / SR / self.clock.beat_s
        L = self.clip.length
        for onset, data in self.clip.events:
            for o in (onset, onset + L):         # this round, and the next
                if self.position <= o < end:
                    self.voices.sources.append(Voice(plucked(data)))
        self.position = end % L
        return self.voices.block(frames)
```

- `onset + L` is where the same note falls in the next round, in the same block.
- The position keeps the rest of the block: the loop keeps the clock's time.

<NotebookCue section="5" task="Loop it again, next to a metronome." />

---

# With blocks of 4096

<div class="fig" data-fig="saw4096">
<svg viewBox="0 0 760 230" width="760" height="230" role="img" aria-label="How early the click is on each beat, at 110 bpm with blocks of 4096: it grows beat after beat, up to 85.3 ms, then falls back to zero.">
  <line x1="70.0" y1="196.0" x2="740.0" y2="196.0" stroke="#53656c" stroke-width="1"/>
  <line x1="70.0" y1="24.0" x2="740.0" y2="24.0" stroke="#ccd4cf" stroke-width="1" stroke-dasharray="4 4"/>
  <text style="font: 12px Menlo, monospace; fill: #53656c" x="62.0" y="28.0" text-anchor="end">85.3</text>
  <text style="font: 12px Menlo, monospace; fill: #53656c" x="62.0" y="200.0" text-anchor="end">0</text>
  <text style="font: 12px Menlo, monospace; fill: #53656c" x="740.0" y="16.0" text-anchor="end">one block: 85.3 ms</text>
  <text style="font: 12px Menlo, monospace; fill: #53656c" x="62.0" y="14.0" text-anchor="end">ms early</text>
  <text style="font: 12px Menlo, monospace; fill: #53656c" x="70.0" y="216.0" text-anchor="middle">0</text>
  <text style="font: 12px Menlo, monospace; fill: #53656c" x="293.3" y="216.0" text-anchor="middle">4</text>
  <text style="font: 12px Menlo, monospace; fill: #53656c" x="516.7" y="216.0" text-anchor="middle">8</text>
  <text style="font: 12px Menlo, monospace; fill: #53656c" x="740.0" y="216.0" text-anchor="middle">12</text>
  <line x1="70.0" y1="196.0" x2="70.0" y2="196.0" stroke="#087e83" stroke-width="2"/>
  <circle cx="70.0" cy="196.0" r="4" fill="#087e83" stroke="#f7f4ec" stroke-width="2"/>
  <line x1="125.8" y1="196.0" x2="125.8" y2="128.6" stroke="#087e83" stroke-width="2"/>
  <circle cx="125.8" cy="128.6" r="4" fill="#087e83" stroke="#f7f4ec" stroke-width="2"/>
  <line x1="181.7" y1="196.0" x2="181.7" y2="61.1" stroke="#087e83" stroke-width="2"/>
  <circle cx="181.7" cy="61.1" r="4" fill="#087e83" stroke="#f7f4ec" stroke-width="2"/>
  <line x1="237.5" y1="196.0" x2="237.5" y2="165.7" stroke="#087e83" stroke-width="2"/>
  <circle cx="237.5" cy="165.7" r="4" fill="#087e83" stroke="#f7f4ec" stroke-width="2"/>
  <line x1="293.3" y1="196.0" x2="293.3" y2="98.3" stroke="#087e83" stroke-width="2"/>
  <circle cx="293.3" cy="98.3" r="4" fill="#087e83" stroke="#f7f4ec" stroke-width="2"/>
  <line x1="349.2" y1="196.0" x2="349.2" y2="30.8" stroke="#087e83" stroke-width="2"/>
  <circle cx="349.2" cy="30.8" r="4" fill="#087e83" stroke="#f7f4ec" stroke-width="2"/>
  <line x1="405.0" y1="196.0" x2="405.0" y2="135.4" stroke="#087e83" stroke-width="2"/>
  <circle cx="405.0" cy="135.4" r="4" fill="#087e83" stroke="#f7f4ec" stroke-width="2"/>
  <line x1="460.8" y1="196.0" x2="460.8" y2="68.0" stroke="#087e83" stroke-width="2"/>
  <circle cx="460.8" cy="68.0" r="4" fill="#087e83" stroke="#f7f4ec" stroke-width="2"/>
  <line x1="516.7" y1="196.0" x2="516.7" y2="172.5" stroke="#087e83" stroke-width="2"/>
  <circle cx="516.7" cy="172.5" r="4" fill="#087e83" stroke="#f7f4ec" stroke-width="2"/>
  <line x1="572.5" y1="196.0" x2="572.5" y2="105.1" stroke="#087e83" stroke-width="2"/>
  <circle cx="572.5" cy="105.1" r="4" fill="#087e83" stroke="#f7f4ec" stroke-width="2"/>
  <line x1="628.3" y1="196.0" x2="628.3" y2="37.7" stroke="#087e83" stroke-width="2"/>
  <circle cx="628.3" cy="37.7" r="4" fill="#087e83" stroke="#f7f4ec" stroke-width="2"/>
  <line x1="684.2" y1="196.0" x2="684.2" y2="142.2" stroke="#087e83" stroke-width="2"/>
  <circle cx="684.2" cy="142.2" r="4" fill="#087e83" stroke="#f7f4ec" stroke-width="2"/>
  <line x1="740.0" y1="196.0" x2="740.0" y2="74.8" stroke="#087e83" stroke-width="2"/>
  <circle cx="740.0" cy="74.8" r="4" fill="#087e83" stroke="#f7f4ec" stroke-width="2"/>
</svg>
</div>

- `stream_of(m, blocksize=4096)`: up to 85 ms early, a different amount on each note. The notes stumble.

<NotebookCue section="6" task="Restart the stream with 4096 and loop fm." />

---

# A voice that waits

```python
for o in (onset, onset + L):
    if self.position <= o < end:
        # samples from the start of the block to the onset
        delay = round((o - self.position) * self.clock.beat_s * SR)
        wave = np.concatenate([np.zeros(delay), plucked(data)])
        self.voices.sources.append(Voice(wave))
```

- A voice that waits is a voice whose wave starts with silence.
- Every note now starts on its exact sample, with any blocksize.

<NotebookCue section="6" task="Loop fm with 4096 again, then go back to 512." />

<!--
o - position is in beats; times beat_s, in seconds; times SR, in samples. The same delay would fix the metronome.
-->

---
class: code-sm
---

# One method for both parts

```python
    def trigger(self, start, stop, shift):       # onsets in [start, stop)
        for onset, data in self.clip.events:
            if start <= onset < stop:
                delay = round((onset - start + shift) * self.clock.beat_s * SR)
                wave = np.concatenate([np.zeros(delay), plucked(data)])
                self.voices.sources.append(Voice(wave))
```

- `shift`: how many beats of the block have gone by when the part starts.
- The first part has `shift = 0`; the second, `L - position`.

<NotebookCue section="6" task="Compare with start_voices in the notebook." />

---
class: code-sm
---

# The block, in two parts

```python
    def block(self, frames):
        end = self.position + frames / SR / self.clock.beat_s
        L = self.clip.length
        if end < L:
            self.trigger(self.position, end, 0)
            self.position = end
        else:
            self.trigger(self.position, L, 0)    # the end of this round
            if self.next is not None:
                self.clip, self.next = self.next, None
            self.trigger(0, end - L, L - self.position)   # the next round
            self.position = end - L
        return self.voices.block(frames)
```

<!--
Now the second part reads the new clip, so a clip from next starts on its first note, not one round later. Easy slips here: round() around the whole product, not only the beats; next checked with "is not None"; every call passing its shift.
-->

---

# Drums

```python
def kick(dur_s=0.3):
    t = np.arange(round(dur_s * SR)) / SR
    f = 45 + 135 * np.exp(-t / 0.03)             # the pitch falls fast
    return 0.5 * np.sin(2 * np.pi * np.cumsum(f) / SR) * decay(dur_s, 0.07)

kit = {"k": kick(), "s": snare(), "h": hat()}

m.sources = [Metronome(kick(), clock)]
```

- A kick is a sine whose pitch falls; a snare, a tone and noise; a hat, a short click of noise.

<NotebookCue section="9" task="Play each sound of the kit, then a metronome with the kick." />

<!--
np.cumsum(f) / SR is the phase of a sine whose frequency changes: the sum of the frequencies so far, as self.phase did block by block.
-->

---

<div class="kicker">An open question</div>

# Loops that are not clips

```python
kicks = Steps("x...x...x...x...", "k")
m.sources = [Loop(kicks, drum, clock), melody]
kicks.toggle(2)
```

- `Loop` only reads `.events` and `.length`.
- Anything that has them can loop: a row of steps, as in the drum machine, whose events change when we toggle a step.
- With drums, `plucked` becomes a parameter: `Loop(clip, instrument, clock)`.

<NotebookCue section="9" task="Build Steps, and toggle steps while it plays." />
