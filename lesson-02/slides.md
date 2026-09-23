---
theme: default
title: From samples to a musical language
info: ACTAM 2026 · Lesson 02
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

<div class="kicker">ACTAM 2026 · Lesson 02</div>
<h1 class="cover-title">From samples to<br>a musical language</h1>
<div class="cover-meta">Functions · melodies · a first percussion instrument</div>

<!--
Keep the notebook open. This deck follows its main lesson, then a separate noise workshop. Code snippets share notebook state.
-->

---

# Last time, a list became a sound

We calculated samples, drew them and listened.

We changed a period to change pitch, and repeated it to make a longer sound.

What would make it easier to build a whole melody?

<!--
Invite students to recall list concatenation and repetition. The destination is a small musical vocabulary, motivated by a familiar tune.
-->

---

# Pick up the thread

```python
from IPython.display import Audio

sample_rate = 48_000
square = ([-0.15] * 100 + [0.15] * 100) * 100
Audio(square, rate=sample_rate, normalize=False)
```

What is the frequency? How long does the sound last?

<NotebookCue section="1" task="Count first, then listen. Start at low volume." />

<!--
Ask for predictions before the next slide. Audio is just the current renderer; the data is a list of samples.
-->

---

# Two lengths, two questions

A period contains **200 samples**. The whole sound contains **20,000**.

$$f = \frac{SR}{N_{period}} = 240\text{ Hz}$$

$$duration = \frac{N_{total}}{SR} \approx 0.417\text{ s}$$

Which length would you change to lower the pitch?

<!--
At fixed sample rate, increasing period length lowers pitch. Changing total length alone changes duration. Revisit the distinction if needed.
-->

---

# Ask for musical dimensions

```python
amplitude = 0.15
duration = 0.5
f = 440
```

We want to choose how high, how long and how strong.

How do these choices become a list of samples?

<!--
Pitch is related to frequency; amplitude is not a direct measure of perceived loudness. Keep the distinction light here.
-->

---

# From frequency to half a period

$$h = \frac{SR}{2f}$$

```python
half_period = round(sample_rate / (2 * f))
period = [-amplitude] * half_period + [amplitude] * half_period
```

Our list needs an integer number of samples per half-period.

<!--
For A4 at 48 kHz this gives 55 samples per half-period. This is the same fixed-period approximation discussed in lesson01.
-->

---

# How close is our A?

| Recipe | Samples per period | Actual frequency |
| --- | --- | --- |
| Truncate half-period with `int` | 108 | 444.44 Hz |
| Round half-period with `round` | 110 | 436.36 Hz |

The requested frequency is **440 Hz**.

<p class="small">This approximation belongs to our repeated-period recipe. Other oscillator recipes can represent 440 Hz without this restriction.</p>

<!--
Rounding is closer here but not exact. Do not introduce a phase oscillator now; retain the simple recipe and acknowledge its limit.
-->

---

# Give the sound its duration

```python
sample_count = round(duration * sample_rate)
repeats = (sample_count + len(period) - 1) // len(period)
wave = (period * repeats)[:sample_count]
```

Make enough whole periods, then keep the requested samples.

`//` is floor division. `[:sample_count]` takes the start of the list.

<!--
Walk through a tiny example: target 10 samples, period length 4. (10+4-1)//4 is 3; repeat to length 12 and slice to 10. Final period may be incomplete.
-->

---

<div class="kicker">Your turn · 01</div>

# Three independent controls

1. Make the sound twice as long, keeping its pitch.
2. Restore the duration and make it quieter.
3. Request a pitch one octave higher.

Which calculations change in each case?

<NotebookCue section="2" task="Modify the recipe, check the length and listen." />

<!--
Allow 3 minutes. Double duration, reduce amplitude, double f. Restore the original values before continuing.
-->

---

# Three notes

In twelve-tone equal temperament, an offset of $n$ semitones multiplies frequency by $2^{n/12}$.

```python
440                    # A
440 * 2 ** (2 / 12)     # B
440 * 2 ** (4 / 12)     # C♯
```

Use our recipe once for each frequency.

<NotebookCue section="3" task="Run the three repeated blocks and listen." />

<!--
Show the duplicated code in the notebook. Its size is deliberate: students should experience the repetition before seeing def.
-->

---

<div class="kicker">Your turn · 02</div>

# Does this sound familiar?

Sing or hum what comes next.

Can you add the next note using a list we already have?

```python
Audio(wave1 + wave2 + wave3, rate=sample_rate,
      normalize=False)
```

<NotebookCue section="3" task="Try the continuation before revealing the tune." />

<!--
Allow a pause for recognition. Three notes are ambiguous; accept other musical associations. Returning to A helps evoke Fra Martino.
-->

---

# Fra Martino!

A–B–C♯–A. Then the same phrase again.

```python
opening = wave1 + wave2 + wave3 + wave1
Audio(opening * 2, rate=sample_rate, normalize=False)
```

How much code would we need to finish the tune?

<!--
Also known as Frère Jacques. Ask students to look at the repeated recipe, not just the final concatenation.
-->

---

# What are we repeating?

Each block constructs a period, calculates a length and builds a list.

Only the musical choices change.

Could we give the whole recipe a name?

<!--
Invite a copy-and-paste error example: changing f but forgetting another field. Move from inconvenience to readability and naming.
-->

---
class: dark
---

<div class="chapter"><div class="kicker">An abstraction we need</div><h1>Define the recipe.<br>Ask for a note.</h1></div>

<!--
The function hides the construction at each call, while keeping the computation inspectable.
-->

---

# Our first function

```python
def square_wave(f=440, duration=0.5, amplitude=0.15,
                sample_rate=48_000):
    half_period = round(sample_rate / (2 * f))
    period = [-amplitude] * half_period + [amplitude] * half_period
    sample_count = round(duration * sample_rate)
    repeats = (sample_count + len(period) - 1) // len(period)
    return (period * repeats)[:sample_count]
```

The result is a list of samples.

<!--
Notebook section 4. Frequency must be positive and below half the sample rate; sample rate positive, duration nonnegative, amplitude 0–1. The teaching function does not validate inputs.
-->

---

# Reading the definition

```python
def square_wave(f=440, duration=0.5, amplitude=0.15,
                sample_rate=48_000):
    # The indented body calculates the samples.
    ...
```

`def` introduces the name and **parameters**.

The colon and indentation group the body. `return` gives back a value.

<!--
This is a syntax excerpt, not a replacement function: use the full definition in the notebook. Defaults allow calls to omit arguments.
-->

---

# A definition and a call

```python
note = square_wave()
len(note)                 # 24000

short_a = square_wave(f=440, duration=0.25)
long_b = square_wave(f=440 * 2 ** (2 / 12), duration=0.75)
```

Defining a function makes the recipe available.

Calling it runs that recipe with the chosen arguments.

<NotebookCue section="4" task="Run the definition, then make two different notes." />

<!--
Audio can render short_a + long_b. Focus on the returned list, not renderer mechanics.
-->

---

<div class="kicker">Your turn · 03</div>

# A value and a recipe

1. Make a quiet, one-second note.
2. Make another pitch and concatenate the two notes.
3. Change `f` in the notebook. Does the stored `note` change? Does `square_wave()` use that `f`?

<NotebookCue section="4" task="Predict first. Explain your answer to a neighbour." />

<!--
Allow 4 minutes. Existing lists do not change. The default is 440; pass f=f to use the notebook variable. Local names such as period belong to each function call.
-->

---

# Now read it as music

```python
opening = (
    square_wave(f=440)
    + square_wave(f=440 * 2 ** (2 / 12))
    + square_wave(f=440 * 2 ** (4 / 12))
    + square_wave(f=440)
)
```

A, B, C♯, A. Each note uses the same recipe.

<NotebookCue section="5" task="Compare this with the copied blocks." />

<!--
The win is both less repetition and a more meaningful vocabulary.
-->

---

# The pitches can become data

```python
offsets = [0, 2, 4, 0]
waves = [square_wave(f=440 * 2 ** (n / 12))
         for n in offsets]
```

`waves` is a list of lists: one sample list per note.

```python
opening = waves[0] + waves[1] + waves[2] + waves[3]
```

<!--
Comprehensions are familiar from lesson01. Distinguish four note lists from the many sample values within each note.
-->

---

# Join the notes

```python
opening = sum(waves, [])
```

This combines `[] + waves[0] + waves[1] + ...`.

Without `[]`, `sum` starts at `0`: a number cannot be added to a list.

<p class="small">List addition sequences sounds. It does not mix them into a chord.</p>

<!--
General reduction is optional in the notebook. Do not spend the main lesson generalising it. Repeated list copying is acceptable here, but not a good construction for long recordings.
-->

---

# One expression, a whole phrase

```python
opening = sum(
    [square_wave(f=440 * 2 ** (n / 12))
     for n in [0, 2, 4, 0]],
    [],
)
```

We describe the notes, generate their samples and join them.

<NotebookCue section="5" task="Change the offsets and listen to your new phrase." />

<!--
Keep the earlier two-step version available; compactness is optional, understanding is the goal.
-->

---

<div class="kicker">Your turn · 04</div>

# Finish Fra Martino

1. Continue the melody one phrase at a time.
2. Find the notes that need different durations.
3. Listen to two equal notes touching. How could you separate them?

Keep your first attempt before opening the worked solution.

<NotebookCue section="6" task="Start with pitches; then add rhythm and breathing space." />

<!--
Allow 8–10 minutes before scaffolding. The first two C♯ notes at the phrase boundary are a useful articulation trigger. Use singing to discover rhythm.
-->

---

# Silence is data too

```python
def silence(duration=0.5, sample_rate=48_000):
    return [0.0] * round(duration * sample_rate)
```

```python
separated = (
    square_wave(f=440, duration=0.45) + silence(0.05)
    + square_wave(f=440, duration=0.45) + silence(0.05)
)
```

Two half-second slots, each with sound and silence.

<!--
Compare joined and separated in notebook section 6. Keep total duration fixed; simply appending pauses to full notes would slow the phrase.
-->

---

# A pause inside the beat

<div class="slot"><span class="sounding">Sound · 0.45 s</span><span class="gap">0.05 s</span></div>

The slot still lasts **0.5 seconds**.

`gate = 0.9` gives 90% of that time to sound and 10% to silence.

<p class="small">Short gaps separate notes. Fades at the edges are a later refinement for clicks.</p>

<!--
The bar represents time allocation, not waveform amplitude. gate ranges from zero to one.
-->

---

# A note has a pitch and a length

```python
phrase_1 = [(0, 1), (2, 1), (4, 1), (0, 1)]
phrase_2 = [(4, 1), (5, 1), (7, 2)]
```

Each pair is `(semitone_offset, beats)`.

A pair written with parentheses is a **tuple**. Access its values with `event[0]` and `event[1]`.

<!--
Worked solution starts here. Do not introduce tuple unpacking at the same time. Explain (7,2): E, held for two beats relative to A.
-->

---

# Keep the tune; choose a tempo

```python
beat = 0.5
phrase_3 = [(7, 0.5), (9, 0.5), (7, 0.5),
            (5, 0.5), (4, 1), (0, 1)]
phrase_4 = [(0, 1), (-5, 1), (0, 2)]
melody = phrase_1 * 2 + phrase_2 * 2 + phrase_3 * 2 + phrase_4 * 2
```

The melody has **32 beats**. At half a second per beat, it lasts **16 seconds**.

<!--
Each phrase is four beats, repeated twice. Negative five semitones supplies the E below the root.
-->

---

# Name another musical idea

```python
articulated_note(semitones=4, beats=1, beat=0.5, gate=0.9)
```

This function converts a pitch offset to a frequency, divides a rhythmic slot into sound and silence, and returns their samples.

<NotebookCue section="6" task="Read and run the articulated_note definition." />

<!--
Use the complete function in the notebook. Walk through slot_samples, sound_samples and gap_samples; calculate total slot once to avoid separate rounding drift. The displayed call assumes that definition has been run.
-->

---

# Let the melody use our instrument

```python
song = sum(
    [articulated_note(semitones=event[0],
                      beats=event[1], beat=beat)
     for event in melody],
    [],
)
Audio(song, rate=sample_rate, normalize=False)
```

The data describes the tune. The function constructs the sound.

<!--
Listen to the full worked solution only after students have attempted the tune.
-->

---

<div class="kicker">Your turn · 05</div>

# Make an interpretation

1. Change `beat`, then rebuild `song`.
2. Compare different `gate` values.
3. Transpose by passing a different `root`.
4. Change one phrase for a neighbour to recognise.

<NotebookCue section="6" task="Save a version you can explain." />

<!--
Allow 5 minutes. gate and root are passed to articulated_note in the comprehension. Reassigning beat alone does not rebuild the stored song.
-->

---
class: dark
---

<div class="chapter"><div class="kicker">Second workshop · optional continuation</div><h1>Can we make<br>a percussion sound?</h1></div>

<!--
This is a clean stopping point if the melody filled the session. The next block introduces stateful loops; it can move to a later lesson.
-->

---

# A tiny machine with a memory

```python
x = 1
x = (5 * x + 1) % 16
print(x)
```

Then run only the update again:

```python
x = (5 * x + 1) % 16
print(x)
```

Predict the next value before each run.

<!--
Notebook section 7. First outputs 6, then 15, then 12. % means remainder. Re-running the initial assignment resets the sequence.
-->

---

# Collect the successive states

```python
states = []
x = 1
for _ in range(32):
    x = (5 * x + 1) % 16
    states.append(x)
```

The indented block repeats. Each update uses the previous state.

`_` names a loop value we do not need. `append` grows the list.

<!--
Contrast with computing each sample directly from its index in a comprehension. The state evolves across iterations.
-->

---

<div class="kicker">Your turn · 06</div>

# Follow the state

1. Explain the first two iterations.
2. Compare `states[:16]` and `states[16:]`.
3. Change the starting `x`, then restore it. What repeats?

<NotebookCue section="7" task="Inspect the list before listening to a larger generator." />

<!--
Allow 3 minutes. Same initial state gives same sequence. The small generator repeats after 16 updates.
-->

---

# More states, a range around zero

```python
noise_samples = []
x = 0
for _ in range(sample_rate):
    x = (5 * x + 1) % 65_536
    value = 0.15 * (2 * x / 65_535 - 1)
    noise_samples.append(value)
```

Integer states become sample values between −0.15 and +0.15.

<NotebookCue section="7" task="Plot the first 100 samples, then listen." />

<!--
Retain normalize=False. A centred range does not guarantee an exactly zero mean for each excerpt.
-->

---

# Irregular does not mean independent

The rule is deterministic: the same state gives the same next state.

It has a finite set of states and eventually repeats.

Our toy **pseudorandom generator** makes a useful experiment. It is not a model of ideal white noise.

<!--
Use the notebook plot as the visual example. Avoid claims of statistically independent samples or cryptographic randomness.
-->

---

# Turn the experiment into a function

```python
def noise(duration=1, amplitude=0.15, seed=0,
          sample_rate=48_000):
    wave = []
    x = seed
    for _ in range(round(sample_rate * duration)):
        x = (5 * x + 1) % 65_536
        wave.append(amplitude * (2 * x / 65_535 - 1))
    return wave
```

Each call starts again from its seed.

<!--
Notebook section 8. Identical seeds and amplitudes give identical sequences, and shorter calls are prefixes of longer ones.
-->

---

# A burst, a gap, a pulse

```python
hit = noise(duration=0.05)
pulse = hit + silence(0.20)
Audio(pulse * 8, rate=sample_rate, normalize=False)
```

Every repeated hit is exactly the same sample data.

What would make it sound more like a decaying percussion hit?

<!--
Two seconds total: eight quarter-second slots. Listen before suggesting the envelope.
-->

---

# Optional · Let the hit decay

```python
samples = noise(duration=0.08)
denominator = max(1, len(samples) - 1)
decaying_hit = [
    samples[n] * (1 - n / denominator)
    for n in range(len(samples))
]
```

An **envelope** changes the gain over time.

<NotebookCue section="8" task="Compare the raw burst and the percussion function." />

<!--
The gain falls linearly from one to zero for multi-sample hits. max protects the denominator for tiny buffers. Show the plotted burst in the notebook.
-->

---

<div class="kicker">Your turn · 07</div>

# A rhythmic answer

Build a short response to Fra Martino with hits and silence.

1. Keep the rhythmic slots the same total length.
2. Compare raw and decaying hits.
3. Try different seeds, then repeat one favourite hit.

<NotebookCue section="8" task="Listen to the melody followed by your rhythm." />

<!--
Allow 5 minutes. Concatenation sequences buffers; simultaneous accompaniment requires sample-by-sample mixing, left for later.
-->

---
class: dark
---

<div class="chapter"><h1>What can we<br>say now?</h1><p class="lead">A note. A phrase. A pause. A percussion hit.<br>Names for computations we can combine.</p></div>

<!--
Return to the course theme: abstractions extend a language. All these functions share a sample-list representation.
-->

---

# Keep experimenting

Save your melody, one rhythmic experiment, and a sentence about what each function lets you stop repeating.

The companion notebook contains the complete recipes, worked melody, and optional reduction and envelope discussions.

<NotebookCue section="1–8" task="Restart the kernel and run your version in order." />

<!--
Close with students' artifacts. The future renderer may change, while their functions continue returning sample data.
-->
