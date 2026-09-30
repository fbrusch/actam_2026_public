---
theme: default
title: From sounds to a rhythmic language
info: ACTAM 2026 · Lesson 04
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

<div class="kicker">ACTAM 2026 · Lesson 04</div>
<h1 class="cover-title">From sounds to<br>a rhythmic language</h1>
<div class="cover-meta">Patterns, instruments and tracks</div>

<!--
Use the companion notebook in order. Run its setup and kit before the first audio example. The core route covers sections 1–11. Optional slides follow the closing exercise.
-->

---

# A kit, waiting for a rhythm

Last time, we built a kick, a snare and two hats.

Each function returns a list of samples.

How could we describe a whole rhythm without writing every hit by hand?

<NotebookCue section="1" task="Run the kit and player definitions." />

<!--
Listen to snare(noise_gain=0) and snare(noise_gain=1) if a quick recall helps. Keep playback volume low. The notebook supplies all the instrument definitions.
-->

---

# A sound and its slot

A **slot** reserves time for a hit or a rest.

A short sound gets silence at the end. A long sound gets cut.

Every slot must contain the requested number of samples.

<!--
This simple scheduler does not preserve overlapping tails. Cutting a waveform can introduce an abrupt boundary. Keep these limits explicit when students listen to open hats.
-->

---

# Fitting a list

```python
def fit(wave, n_samples):
    padding = max(0, n_samples - len(wave))
    return wave[:n_samples] + [0] * padding

fit([1, 2, 3], 5)   # [1, 2, 3, 0, 0]
fit([1, 2, 3], 2)   # [1, 2]
fit([], 4)          # [0, 0, 0, 0]
```

The result is a new list of exactly `n_samples` values.

<NotebookCue section="2" task="Run fit and inspect the three examples." />

<!--
Assume a nonnegative integer n_samples. Recall slicing, list concatenation and repetition. max keeps the padding explicitly nonnegative.
-->

---

<div class="kicker">Your turn · 01</div>

# How long is silence?

Predict `fit([1, 2, 3], 0)`.

What is the difference between `[]` and `fit([], 4)`?

Which one occupies time when we join it to a sound?

<NotebookCue section="2" task="Predict the lists before running the examples." />

<!--
Allow 2 minutes. The first expression returns []. Empty lists occupy no sample periods. Four zero samples occupy four sample periods.
-->

---

# Tempo sets the duration

Here, one beat is a quarter note.

```python
bpm = 100
quarter_s = 60 / bpm       # 0.6 seconds
eighth_s = quarter_s / 2  # 0.3 seconds
step_s = quarter_s / 4    # 0.15 seconds
step_samples = round(step_s * SR)
```

At 48,000 Hz, this sixteenth-note step contains **7,200 samples**.

<NotebookCue section="3" task="Calculate the durations and sample count." />

<!--
A step describes one symbol's duration. It need not be a beat. Repeating rounded steps can introduce a small timing error. Use one shared smallest step across tracks.
-->

---

# Repeating a stored hit

```python
one_hat = fit(closed_hat(), round(quarter_s * SR))
four_hats = one_hat * 4
play(four_hats)
```

The instrument runs once.

List repetition copies the same hit and its following silence.

<NotebookCue section="3" task="Listen to the four evenly spaced hats." />

---

<div class="kicker">Your turn · 02</div>

# A fresh hit each time

```python
fresh_hats = []
for i in range(4):
    fresh_hats = fresh_hats + fit(
        closed_hat(), round(quarter_s * SR))
```

The timing stays the same. What changes in the samples?

<NotebookCue section="3" task="Compare stored repetition with four instrument calls." />

<!--
Allow 2–3 minutes. Each call generates fresh noise. Students should locate the instrument call inside the loop. Repetition of a stored buffer preserves the original noise exactly.
-->

---

# A kick part and a hat part

```python
quarter_samples = round(quarter_s * SR)
eighth_samples = round(eighth_s * SR)

kick_slot = fit(kick(), quarter_samples)
rest_slot = fit([], quarter_samples)
kicks = kick_slot + rest_slot + kick_slot + rest_slot
hats = fit(closed_hat(), eighth_samples) * 8
```

Both parts last four beats: **2.4 seconds** at 100 BPM.

<NotebookCue section="4" task="Build both parts and compare their lengths." />

<!--
These subdivisions align exactly at this tempo and sample rate. Separately rounded subdivisions need not align at every tempo.
-->

---

# After each other, or together?

```python
len(kicks + hats)         # 230400
len(mix(kicks, hats))     # 115200

play(mix(kicks, hats, ga=1.0, gb=0.7))
```

List `+` places the parts one after another.

`mix` adds simultaneous samples. Its gains set the balance.

<NotebookCue section="4" task="Move the second kick to beat four, then lower the hats." />

<!--
Lengths use SR=48000 and bpm=100. The existing mix requires equal lengths. Ask which change affects timing and which affects amplitude.
-->

---

# Joining a list of slots

```python
parts = [kick(), [], kick(), []]
slots = [fit(part, quarter_samples) for part in parts]
wave = sum(slots, [])
play(wave)
```

Recall `sum(parts, [])` from lesson 02: start with an empty list and concatenate each part.

<NotebookCue section="5" task="Inspect sum([[1, 2], [], [3]], []) before playing." />

<!--
Without the second argument sum starts from 0, which cannot be added to a list. This shortcut copies data repeatedly and is intended for short teaching examples.
-->

---
class: dark
---

<div class="chapter"><div class="kicker">Functions as values</div><h1>A recipe we can<br>pass around</h1></div>

<!--
Move from storing generated samples to storing the function that can generate them. This bridge is explicit because the published lesson03 notebook did not develop function-valued arguments.
-->

---

# A function and its result

| Expression | What it gives us |
| --- | --- |
| `kick` | The function |
| `kick()` | A list of samples |

```python
instrument = kick
wave = instrument(sample_rate=SR)
```

Assignment gives the function another name. Parentheses call it.

<NotebookCue section="6" task="Assign an instrument, then generate a sound." />

---

# A parameter can receive a function

```python
def make_hit(instrument, sample_rate=SR):
    return instrument(sample_rate=sample_rate)

play(make_hit(closed_hat))
```

Inside `make_hit`, `instrument` refers to the function we supplied.

Our instruments accept `sample_rate` and return samples at that rate.

<NotebookCue section="6" task="Trace the function name from the call into the helper." />

---

<div class="kicker">Your turn · 03</div>

# Where does the call happen?

Replace `closed_hat` with `snare`.

Point to the parentheses that generate the samples.

What would `make_hit(kick())` pass to the helper?

<NotebookCue section="6" task="Explain the difference before trying it." />

<!--
Allow 3 minutes. make_hit(kick()) first generates a list, then tries to call that list. The receiving helper needs a function, so pass kick. This deliberate error belongs in a separate scratch cell.
-->

---

# A language with two symbols

```text
x . x .
hit rest hit rest
```

We write the actual pattern as `"x.x."`, with no spaces.

Each character describes one step. The instrument and step duration remain separate choices.

<NotebookCue section="7" task="Compare the notation with a rhythm you have already made." />

<!--
The spaces in the display separate labels visually. They are not valid pattern characters. Quotes delimit the Python string and are not part of its contents.
-->

---

# A string is a sequence of characters

```python
pattern = "x.x."
len(pattern)         # 4
pattern * 2          # "x.x.x.x."

for symbol in pattern:
    print(symbol)
```

The loop visits one character at a time, in order.

<NotebookCue section="7" task="Count steps separately from hits." />

---

# Giving each symbol a meaning

```python
def read_pattern(pattern):
    steps = []
    for symbol in pattern:
        if symbol == "x":
            steps.append(1)
        elif symbol == ".":
            steps.append(0)
        else:
            raise ValueError("Use only x and .")
    return steps
```

<NotebookCue section="7" task="Run the reader before generating any audio." />

<!--
Explain elif as otherwise, if. == compares values while = assigns them. The shorter error message preserves the notebook's contract. Unknown symbols must not silently become rests.
-->

---

<div class="kicker">Your turn · 04</div>

# Reading without sound

Predict `read_pattern(".xx...")`.

How many decisions will it return? How many are hits?

Try `read_pattern("x X.")` in a scratch cell, then correct it.

<NotebookCue section="7" task="Also predict the result for an empty string." />

<!--
Allow 3 minutes. Expected [0, 1, 1, 0, 0, 0]. Both a space and uppercase X are invalid in this version. Empty input returns []. Validation completes before rendering begins.
-->

---

# Decisions become samples

For each decision, the renderer creates a hit or a rest.

It fits the result into one slot, then joins the slots.

The same pattern can use a different instrument or a different step duration.

<!--
Separate the reader's job from the renderer's job before showing the code. The instrument function is called only for a hit.
-->

---

# The pattern renderer

```python
def render_pattern(pattern, instrument, step_s, sample_rate=SR):
    n = round(step_s * sample_rate)
    steps = read_pattern(pattern)
    slots = []
    for hit in steps:
        if hit == 1:
            wave = instrument(sample_rate=sample_rate)
        else:
            wave = []
        slots.append(fit(wave, n))
    return sum(slots, [])
```

<NotebookCue section="8" task="Run the definition and follow one hit and one rest." />

<!--
Assume a positive sample rate and step duration yielding at least one sample. This code matches the notebook. Slots truncate tails rather than overlapping them. read_pattern validates the full text before the loop generates sound.
-->

---

# Three choices in one call

```python
play(render_pattern("x.x.x.x.", closed_hat, eighth_s))
```

| Argument | Controls |
| --- | --- |
| `"x.x.x.x."` | Hit and rest positions |
| `closed_hat` | The sound recipe |
| `eighth_s` | The duration of each character |

<NotebookCue section="8" task="Change one argument at a time." />

---

<div class="kicker">Your turn · 05</div>

# One pattern, several interpretations

Keep the pattern and switch instrument. Then halve `step_s`.

Predict the sample count before checking `len(wave)`:

```python
wave = render_pattern("x...x...", kick, step_s)
```

<NotebookCue section="8" task="Explain which change affects length and which affects timbre." />

<!--
Allow 4 minutes. Length is len(pattern) * round(step_s * sample_rate). Instrument changes do not change this length because every slot is fitted. At the current defaults this example has 57600 samples. Empty input yields [] and should not be sent to the player.
-->

---

# One sample rate throughout

```python
rate = 24000
wave = render_pattern("x.x.", closed_hat, step_s,
                      sample_rate=rate)
play(wave, sample_rate=rate)
```

Synthesis, slot lengths and playback all use the same rate.

A plain list of samples does not store its sample rate.

<NotebookCue section="8" task="Render and play the pattern at 24,000 Hz." />

---
class: dark
---

<div class="chapter"><div class="kicker">Several parts together</div><h1>A rhythm becomes<br>track data</h1></div>

---

# A mixer for a list of tracks

```python
def mix_tracks(waves):
    if len(waves) == 0:
        return []
    longest = max([len(wave) for wave in waves])
    result = [0] * longest
    for wave in waves:
        result = mix(result, fit(wave, longest))
    return result
```

Shorter tracks get silence at the end.

<NotebookCue section="9" task="Try mix_tracks([[1, 2], [10], []])." />

<!--
Expected [11, 2]. Keep the old mix function: snare still uses its independent gain controls. Python resolves that global name when snare runs, so replacing mix would change the instrument's behaviour too.
-->

---

# Three patterns, one grid

```python
kicks = render_pattern("x...x...x...x...", kick, step_s)
snares = render_pattern("....x.......x...", snare, step_s)
hats = render_pattern("x.x.x.x.x.x.x.x.", closed_hat, step_s)

play(mix_tracks([kicks, snares, hats]))
```

All tracks begin together and share the same step duration.

<NotebookCue section="9" task="Listen, then shorten the hat pattern." />

<!--
The hats stop early and padding fills the remainder. They do not repeat. The sixteen steps describe four quarter-note beats at the current sixteenth-note resolution.
-->

---

# Balance after rendering

```python
quieter_hats = [0.5 * sample for sample in hats]
play(mix_tracks([kicks, snares, quieter_hats]))
```

Scaling changes the samples while preserving their positions.

Adding tracks can exceed the playback range of −1 to +1. Moderate gains leave room for the sum.

<NotebookCue section="9" task="Change the hat gain without changing its pattern." />

<!--
The notebook player does not automatically normalise. Gains remain audible as changes of level. Sample amplitude is not a direct measure of perceived loudness.
-->

---

# A track is a tuple

```python
kick_track = ("x...x...x...x...", kick, step_s)

pattern, instrument, step_s = kick_track
```

The tuple groups the pattern, the function and the step duration.

Unpacking gives each value a name again.

<NotebookCue section="10" task="Create the kick, snare and hat track tuples." />

---

# Rendering track data

```python
def render_track(track, sample_rate=SR):
    pattern, instrument, step_s = track
    return render_pattern(pattern, instrument, step_s,
                          sample_rate=sample_rate)

def render_tracks(tracks, sample_rate=SR):
    waves = [render_track(track, sample_rate=sample_rate)
             for track in tracks]
    return mix_tracks(waves)
```

<NotebookCue section="10" task="Run the helpers, then play(render_tracks(tracks))." />

<!--
The notebook defines tracks = [kick_track, snare_track, hat_track]. Each helper passes sample_rate onward. Different track lengths remain valid because mix_tracks pads to the longest.
-->

---

<div class="kicker">Your turn · 06</div>

# A two-bar piece

Write one bar on 16 sixteenth-note steps, then a second bar with one change.

Include a rest and two instruments starting together.

Exchange the track data with a neighbour. Can they explain the rhythm before hearing it?

<NotebookCue section="10" task="Render the piece, then try 24,000 Hz for synthesis and playback." />

<!--
Allow 6–8 minutes. Concatenate the two pattern strings per track. Keep pattern data separate from rendering calls. The musical description need not change with the sample rate.
-->

---

# Accents need another meaning

We want ordinary hits, stronger hits and rests.

| Symbol | Sample gain |
| --- | --- |
| `x` | 0.5 |
| `X` | 1.0 |
| `.` | 0.0 |

What should the reader return now? Where should the renderer use it?

<NotebookCue section="11" task="Propose the changes before opening the worked example." />

<!--
Allow students to suggest returning gains before revealing read_accents. These are relative sample gains, not a perceptual loudness model. Keep the original two-symbol reader available.
-->

---

# Reading gains

```python
read_accents("X.x.")
# [1.0, 0.0, 0.5, 0.0]
```

The new reader recognises `x`, `X` and `.`.

It returns gains and reports an error for every other symbol.

<NotebookCue section="11" task="Read and run the complete read_accents definition." />

<!--
The definition remains in the notebook to avoid repeating the entire conditional structure. Run it before using the function on this slide.
-->

---

# Applying each gain

```python
for gain in gains:
    if gain > 0:
        hit = instrument(sample_rate=sample_rate)
        wave = [gain * sample for sample in hit]
    else:
        wave = []
    slots.append(fit(wave, n))
```

This loop replaces the hit/rest loop inside the renderer.

<NotebookCue section="11" task="Run the full render_accents definition, then listen." />

<!--
This is an excerpt, not a standalone cell. The full function defines n, gains and slots, then returns sum(slots, []). Ordinary hits use half gain, accents use full gain, rests do not call the instrument.
-->

---

<div class="kicker">Your turn · 07</div>

# Phrasing with accents

Make a quiet snare ghost note before a stronger hit.

Keep the hit positions and change only their gains. How does the phrase change?

Adapt the track renderer to use `render_accents`, giving it a new name.

<NotebookCue section="11" task="Keep both rendering versions available for comparison." />

<!--
Allow 5 minutes. A worked render_accent_tracks appears in optional listening challenge 7. Use deliberate function names: callers of a global function name use its latest definition.
-->

---
class: dark
---

<div class="chapter"><h1>Text describes.<br>Functions interpret.<br>Samples make sound.</h1></div>

<!--
The representation remains a list of samples. Concatenation places sounds in time, multiplication changes gain and mixing adds simultaneous signals. The pattern language organises these familiar operations.
-->

---

# One rhythm worth keeping

Save your track data and an accented variation.

Explain where the text becomes decisions and where those decisions become samples.

Restart the notebook and run it in order so somebody else can hear your piece.

<NotebookCue section="1–11" task="Keep the rhythm, its variation and your explanation together." />

<!--
End the main route here. The following slides are optional extensions and listening practice, matching the notebook appendices.
-->

---
class: dark
---

<div class="chapter"><div class="kicker">Optional extensions</div><h1>Other ways to<br>interpret a pattern</h1></div>

---

# A dictionary selects an instrument

```python
kit = {"k": kick, "s": snare, "h": closed_hat}
instrument = kit["k"]
play(instrument(sample_rate=SR))
```

A dictionary associates **keys** with values.

Here, the value found under `"k"` is a function.

<NotebookCue section="Optional A" task="Compare lookup by key with lookup by list position." />

---

# One string, several instruments

```python
kit = {"k": kick, "s": snare,
       "h": closed_hat, "o": open_hat}
play(render_kit("k.h.s.h.k.h.s.o.", kit, step_s))
```

The reader checks every symbol before looking it up in the kit.

This string places instruments in successive slots. Separate tracks can place them together.

<NotebookCue section="Optional A" task="Run render_kit first, then change the dictionary values." />

<!--
The notebook explains dictionary membership and reserves . for silence. Every other symbol must be a key. Named wrappers such as soft_snare keep the sample-rate contract visible.
-->

---

# Two uses of an asterisk

```python
def mix_many(*waves):  # collect positional arguments
    ...

padded = [[1, 2], [10, 20], [100, 200]]
list(zip(*padded))     # expand the list into arguments
# [(1, 10, 100), (2, 20, 200)]
```

Each tuple contains simultaneous values from the tracks.

<NotebookCue section="Optional B" task="Read the complete mix_many and compare it with mix_tracks." />

<!--
The ellipsis marks an omitted body, not the implementation. Explain argument collection and expansion separately from list repetition. Numerical sum on each tuple mixes samples. sum(slots, []) concatenates lists.
-->

---

# Listening laboratory

Listen to a challenge before revealing its recipe.

Find the pulse and subdivision, then mark each instrument's attacks on a grid.

Write the patterns and compare your reconstruction with the audio.

<NotebookCue section="Optional C" task="Begin with challenges 1–3, then choose a harder example." />

<!--
Challenges 1–5 use sixteenths, 6 uses thirds of a beat, 7 adds accents, 8 spans two bars and 9 uses thirty-seconds. Hide source cells for listening where supported. They remain in the downloadable notebook. The separate course listening pages can also support this activity.
-->

---

# Swing changes the step lengths

```python
s = round(60 / 90 / 4 * SR)
long = round(1.3 * s)
short = 2 * s - long
step_lengths = [long, short] * 8
```

Each pair keeps the duration of two equal steps.

How could `zip` pair each hit/rest decision with its own slot length?

<NotebookCue section="Optional C · 10" task="Compare equal steps with the worked timed renderer." />

<!--
The pattern's meaning is unchanged. The renderer now accepts integer slot lengths and checks that there is one per decision. Use the same lengths across tracks. Challenge 10 provides render_timed_pattern and render_timed_tracks. This ratio is a chosen timing model rather than a complete model of groove.
-->
