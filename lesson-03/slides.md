---
theme: default
title: Small instruments, connected
info: ACTAM 2026 · Lesson 03
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

<div class="kicker">ACTAM 2026 · Lesson 03</div>
<h1 class="cover-title">Small instruments<br>connected</h1>
<div class="cover-meta">Noise envelopes and a small percussion kit</div>

<!--
Keep the notebook open and run cells in order. Snippets share notebook state. The synthesis functions return lists. Playback is only a renderer.
-->

---

# Last time, we named a recipe

A function gave us a note and lists of notes became a melody.

We also tried a short burst of noise.

What would make that burst behave more like a percussion hit?

<!--
If the optional noise workshop was skipped, use notebook section 1 as a self-contained introduction.
-->

---

# A second of noise

```python
from random import random

SR = 48_000
long_noise = [0.15 * (2 * random() - 1)
              for _ in range(SR)]
play(long_noise)
```

`random()` gives values from 0 up to, but excluding, 1.

We shift and scale them around zero.

<NotebookCue section="1" task="Run the setup cell first. Listen at low volume." />

<!--
Run notebook setup first, including play. Begin at low volume. No need to explain the renderer again. The standard-library generator replaces the earlier toy generator.
-->

---

# A much shorter sound

```python
n = round(0.05 * SR)
burst = long_noise[:n]
play(burst)
```

Fifty milliseconds, using the beginning of the same recording.

What happens at the end?

<NotebookCue section="1" task="Continue in the companion notebook." />

<!--
Listen to both durations. The same stored noise makes duration the only changed variable.
-->

---

<div class="kicker">Your turn · 01</div>

# The ending of a hit

Describe the difference between a burst that stops and a vibration that dies away.

Could multiplication make a sound gradually quieter?

<NotebookCue section="1" task="Try in the notebook before discussing the answer." />

<!--
Allow 2 minutes. Invite students to propose a sequence of gain values before revealing the envelope.
-->

---

# A falling gain

```python
linear = [1 - i / (n - 1) for i in range(n)]
hat_linear = [burst[i] * linear[i] for i in range(n)]
```

The gain starts at **1** and ends at **0**.

The noise and its envelope contain the same number of samples.

<NotebookCue section="2" task="Continue in the companion notebook." />

<!--
Here n is 2400, so the denominator is nonzero. The reusable function later handles tiny buffers. Show the three notebook plots: source, gain, result.
-->

---

# An exponential envelope

A linear envelope loses the same amount in equal time intervals.

An exponential loses the same **fraction of its current gain**.

$$e(t)=\exp(-t/\tau)$$

At time $\tau$, the gain is about **0.368**.

<!--
Tau is a time constant in seconds. Larger tau means slower decay. Show the notebook comparison plot rather than treating the envelope itself as an audio signal.
-->

---

# Why this curve?

A simple model makes the rate of decay proportional to the current amplitude.

$$\frac{de}{dt}=-\frac{1}{\tau}e,\qquad e(0)=1$$

Its solution is $e(t)=\exp(-t/\tau)$.

<p class="small">Some idealised damped oscillators have this amplitude envelope. Real percussion has more complex vibration modes.</p>

<!--
The notebook includes a finite-time-step interpretation. This is a useful sound-design model, not a complete physical simulation.
-->

---

# Time, measured in samples

```python
from math import exp

tau = 0.012
exponential = [exp(-(i / SR) / tau) for i in range(n)]
hat_exponential = [burst[i] * exponential[i]
                   for i in range(n)]
```

`i / SR` is time in seconds. `tau` is in seconds too.

<NotebookCue section="2" task="Continue in the companion notebook." />

<!--
The raw recipe exp(-i * rate) matches when rate = 1 / (SR * tau). Keep this bridge in discussion if useful.
-->

---

<div class="kicker">Your turn · 02</div>

# Duration and decay

Keep the same noise and try `tau = 0.005`, `0.012` and `0.04`.

Which sound loses amplitude fastest?

Does the envelope reach zero? Would a longer buffer always sound longer?

<NotebookCue section="2" task="Try in the notebook before discussing the answer." />

<!--
Allow 3 minutes. Smallest tau decays fastest. The exponential remains positive at finite time. Extending far beyond several time constants adds a very quiet tail.
-->

---
class: dark
---

<div class="chapter"><div class="kicker">Reusable connections</div><h1>A source.<br>An envelope.<br>A multiplication.</h1></div>

<!--
Introduce VCA as a relationship between two sample lists.
-->

---

# Pairs of corresponding values

```python
samples = [0.2, -0.4, 0.6]
gains = [1.0, 0.5, 0.0]

list(zip(samples, gains))
# [(0.2, 1.0), (-0.4, 0.5), (0.6, 0.0)]
```

`zip` pairs first with first, second with second, and so on.

<!--
Connect tuples to the pitch/duration pairs from lesson02.
-->

---

# Unpacking each pair

```python
[x * gain for x, gain in zip(samples, gains)]
# [0.2, -0.2, 0.0]
```

The names `x` and `gain` receive the two values of each pair.

This gives us sample-by-sample multiplication.

<!--
Ask students to explain the negative middle sample. A positive gain preserves its sign.
-->

---

# A shorter list ends zip

```python
list(zip([1, 2, 3], [10, 20]))
# [(1, 10), (2, 20)]
```

That could silently shorten a sound.

Our VCA will require equal lengths.

<!--
Matching lengths is necessary but does not guarantee matching sample rates. A plain list carries no sample-rate metadata.
-->

---

# Our digital VCA

```python
def vca(wave, signal):
    if len(wave) != len(signal):
        raise ValueError("Use equal-length signals.")
    return [x * gain for x, gain in zip(wave, signal)]
```

A voltage-controlled amplifier changes gain with a control signal.

Here, both signals are lists of numbers.

<NotebookCue section="3" task="Continue in the companion notebook." />

<!--
Explain if, != and raise briefly. The hardware name is an analogy: there is no physical control voltage here.
-->

---

# Named sources and envelopes

```python
source = noise(duration=0.08)
shape = envelope_exp(duration=0.08, tau=0.012)
shaped = vca(source, shape)
play(shaped)
```

The source and the shape can change independently.

<NotebookCue section="3" task="Run the noise and envelope definitions, then connect them." />

<!--
Run the noise, envelope_lin and envelope_exp definitions in notebook section 3 before this example. All use SR by default.
-->

---

<div class="kicker">Your turn · 03</div>

# One source, two shapes

Make one noise buffer lasting 0.2 seconds.

Shape that same buffer with a linear envelope and an exponential envelope.

Then try an envelope of the wrong length. What does the error tell you?

<NotebookCue section="3" task="Try in the notebook before discussing the answer." />

<!--
Allow 4 minutes. Reuse source so randomness does not confound the comparison. Correct the duration after reading the error.
-->

---

# Closed and open hats

| Candidate | Duration | Decay time |
| --- | --- | --- |
| Closed | 0.06 s | 0.010 s |
| Open | 0.30 s | 0.070 s |

What if the closed candidate lasts 0.30 seconds but keeps its fast decay?

<NotebookCue section="4" task="Continue in the companion notebook." />

<!--
Listen in notebook section 4. Most audible energy remains near the start. These are simple noise approximations of complex cymbal sounds.
-->

---
class: dark
---

<div class="chapter"><div class="kicker">The kick</div><h1>What if frequency<br>were a signal too?</h1></div>

<!--
Transition from amplitude control to frequency control.
-->

---

# A clock inside the oscillator

**Phase** tells us where we are in one cycle.

Below 0.5, output the negative half of a square wave. From 0.5 onwards, output the positive half.

$$\text{phase increment}=\frac{f}{SR}$$

At 4 Hz and 16 samples per second, each step is **¼ cycle**.

<!--
The old repeated-period recipe rounded period length. A phase accumulator allows frequency to change at every sample. The toy sample rate is for inspection, not audio playback.
-->

---

# A tiny oscillator

```python
phase = 0.0
toy_wave = []
for _ in range(12):
    toy_wave.append(-1 if phase < 0.5 else 1)
    phase = (phase + 4 / 16) % 1
```

Generate a sample, then advance the clock.

`% 1` wraps the phase back into one cycle.

<NotebookCue section="5" task="Continue in the companion notebook." />

<!--
Explain the conditional expression. Expected output repeats [-1, -1, 1, 1]. Use the notebook phases list to inspect the clock.
-->

---

# An audible fixed frequency

```python
phase = 0.0
wave = []
for _ in range(round(0.2 * SR)):
    wave.append(-0.15 if phase < 0.5 else 0.15)
    phase = (phase + 120 / SR) % 1
play(wave)
```

What needs to change to accept a different frequency at each step?

<NotebookCue section="5" task="Continue in the companion notebook." />

<!--
Run the fixed-frequency notebook example. The phase persists between samples.
-->

---

# A list controls the oscillator

```python
def square_wave_f(f, sample_rate=SR, amplitude=0.15):
    phase = 0.0
    wave = []
    for frequency in f:
        if not 0 < frequency < sample_rate / 2:
            raise ValueError("Frequency out of range.")
        wave.append(-amplitude if phase < 0.5 else amplitude)
        phase = (phase + frequency / sample_rate) % 1
    return wave
```

<!--
One output sample per frequency value. The list length sets duration, so a separate duration argument is unnecessary. This is the complete algorithm, with a shorter error message for projection.
-->

---

# VCO: frequency controls an oscillator

A **VCO** is a voltage-controlled oscillator. Our digital version reads a list of frequencies.

A **VCF** is a voltage-controlled filter.

<p class="small">The naive square wave still has high harmonics that can alias. The phase method removes the fixed integer-period restriction, not aliasing.</p>

<!--
Keep the distinction light. Do not imply that checking the fundamental below Nyquist band-limits a square wave.
-->

---

<div class="kicker">Your turn · 04</div>

# Following the phase

Change the toy example from 4 Hz to 2 Hz.

Compare audible frequency lists at 120 Hz and 240 Hz.

Why must `phase = 0.0` stay outside the loop?

<NotebookCue section="5" task="Try in the notebook before discussing the answer." />

<!--
Allow 3 minutes. Toy increment becomes 1/8. Doubling frequency doubles increment. Resetting phase each iteration would keep returning the same initial sample.
-->

---

# An envelope becomes a frequency

$$f_i=f_{end}+(f_{start}-f_{end})e_i$$

```python
pitch_shape = envelope_exp(duration=0.25, tau=0.025)
pitch = [45 + (180 - 45) * value for value in pitch_shape]
body = square_wave_f(pitch)
```

Frequency starts at **180 Hz** and approaches **45 Hz**.

<NotebookCue section="6" task="Continue in the companion notebook." />

<!--
Show the pitch plot and listen to the body before applying amplitude decay. The positive floor avoids falling to zero frequency.
-->

---

# The kick has two envelopes

```python
amplitude_shape = envelope_exp(duration=0.25, tau=0.060)
kick_candidate = vca(body, amplitude_shape)
play(kick_candidate)
```

The pitch envelope controls how frequency falls.

The amplitude envelope controls how the sound dies away.

<NotebookCue section="6" task="Continue in the companion notebook." />

<!--
Use the pitch/body values from the preceding example. The two envelopes have equal durations but different time constants.
-->

---

<div class="kicker">Your turn · 05</div>

# Two controls to hear

Keep pitch unchanged and make the amplitude decay faster.

Restore it, then make the pitch fall more slowly.

Which change alters the tail? Which makes the downward pitch movement easier to hear?

<NotebookCue section="6" task="Try in the notebook before discussing the answer." />

<!--
Allow 4 minutes. Keep duration fixed. Rebuild all affected lists after changing parameters.
-->

---

# A name for the kick recipe

```python
kick_raw(duration=0.25, start_hz=180, end_hz=45,
         pitch_tau=0.025, amp_tau=0.060)
```

The function builds a pitch trajectory, runs the oscillator and applies an amplitude envelope.

Each generator receives the same sample rate.

<NotebookCue section="6" task="Read and run the complete kick_raw definition." />

<!--
Read and run the complete kick_raw definition in notebook section 6. The final kick adds an edge fade later.
-->

---

# The snare has a body and wires

A pitched component gives us a short body.

A noisy component suggests the snare wires.

The body falls from about **300 Hz** towards **180 Hz**. The noise decays more slowly.

<NotebookCue section="7" task="Build snare_body and snare_noise. Listen to each separately." />

<!--
Run notebook section 7, listening to snare_body and snare_noise separately. Pitch tau .010, body amplitude tau .025, noise tau .055.
-->

---

# Together, or one after another?

```python
a = [0.1, 0.2, 0.3]
b = [0.4, 0.5, 0.6]

a + b
# [0.1, 0.2, 0.3, 0.4, 0.5, 0.6]

[x + y for x, y in zip(a, b)]
# [0.5, 0.7, 0.9]  (approximately)
```

List addition sequences sounds. Sample addition mixes them.

<!--
Floating-point results can have additional decimal digits. Ask students to compare output lengths.
-->

---

# A mixer with two gains

```python
def mix(a, b, ga=1.0, gb=1.0):
    if len(a) != len(b):
        raise ValueError("Use equal-length signals.")
    return [ga * x + gb * y for x, y in zip(a, b)]

snare_candidate = mix(snare_body, snare_noise, 1.0, 0.5)
```

If one input is shorter, pad it with silence first.

<NotebookCue section="8" task="Continue in the companion notebook." />

<!--
Use the notebook components. Mixer and VCA assume equal sample rates as well as equal lengths.
-->

---

# Room for the sum

Both inputs stay within ±0.15.

With gains of 1 and 0.5, the sum stays within **±0.225**.

```python
max(abs(value) for value in snare_candidate)
```

Moderate gains leave room within the playback range of −1 to +1.

<!--
The bound follows the triangle inequality. Actual peak can be lower. Keep automatic normalisation disabled so gain comparisons remain meaningful.
-->

---

<div class="kicker">Your turn · 06</div>

# The balance of a snare

Reuse the stored body and noise.

Try noise gains of 0, 0.5 and 1. Then lengthen the noise decay.

Compare concatenating the two components with mixing them. What happens to duration?

<NotebookCue section="8" task="Try in the notebook before discussing the answer." />

<!--
Allow 4 minutes. Two .2-second components concatenate to .4 seconds and mix to .2 seconds. Zero noise gain leaves only the body.
-->

---

# The edges of the buffer

An exponential tail remains positive. A noise burst can also begin at a nonzero sample.

Abrupt boundaries can click.

A brief fade at each edge brings the first and last samples to zero.

<NotebookCue section="9" task="Read and run the edge_fade helper." />

<!--
Notebook section 9 provides edge_fade. Treat it as a provided utility initially. Default attack is 1 ms and release 5 ms. Very short buffers may never reach full gain.
-->

---

# Four instruments, the same tools

| Instrument | Source | Main controls |
| --- | --- | --- |
| Closed hat | Noise | Short, fast decay |
| Open hat | Noise | Longer, slower decay |
| Kick | Oscillator | Falling pitch and amplitude |
| Snare | Oscillator + noise | Separate decays and mixer gains |

Each function returns a list of samples.

<NotebookCue section="9" task="Run all four instrument definitions before playing the kit." />

<!--
Read and run all four final instrument definitions in notebook section 9. They use edge_fade. Amplitude is a scale control, not equal perceived loudness.
-->

---

# A kit we can play

```python
closed = closed_hat()
opened = open_hat()
bass = kick()
snare_hit = snare()

play(closed + silence() + opened + silence()
     + bass + silence() + snare_hit)
```

Fresh calls generate fresh noise. Stored lists keep the same samples.

<NotebookCue section="9" task="Continue in the companion notebook." />

<!--
Click to listen. Compare the reusable names with the raw recipes from the beginning of the lesson.
-->

---

<div class="kicker">Your turn · 07</div>

# A musical conversation

Make a short call and response.

Use a kick and hat together, then answer with a snare.

Keep each rhythmic slot the same total length. Change one envelope to give the answer a different character.

<NotebookCue section="10" task="Try in the notebook before discussing the answer." />

<!--
Allow 6–8 minutes before revealing the worked example. Students can begin with concatenation and silence. Pad shorter sounds before mixing.
-->

---

# Two hits in one slot

```python
hat_layer = closed + [0.0] * (len(bass) - len(closed))
combined_hit = mix(bass, hat_layer)

slot_samples = round(0.5 * SR)
first_slot = combined_hit + [0.0] * (
    slot_samples - len(combined_hit))
```

The kick and hat start together. The slot lasts **0.5 seconds**.

<NotebookCue section="10" task="Continue in the companion notebook." />

<!--
The default bass is longer than closed and both fit the slot. Negative list repetition does not trim oversized hits. State these assumptions if students changed durations.
-->

---

# A rhythmic answer

```python
second_slot = snare_hit + [0.0] * (
    slot_samples - len(snare_hit))
rhythm = (first_slot + second_slot) * 2
play(rhythm)
```

Two half-second slots, repeated twice: **2 seconds**.

Repeating a stored slot repeats exactly the same noise.

<NotebookCue section="10" task="Continue in the companion notebook." />

<!--
Keep the general sequencer for a later lesson. The current point is the distinction between mixing and concatenation.
-->

---
class: dark
---

<div class="chapter"><h1>One representation.<br>Different roles.</h1><p class="lead">A list can describe sound, gain or frequency.<br>The connection gives the numbers their meaning.</p></div>

<!--
Multiplication shapes amplitude. Mapping an envelope to hertz controls pitch. Elementwise addition mixes. Concatenation sequences.
-->

---

# One sound worth keeping

Save one instrument, one rhythm and a sketch of their connections.

Which control made the biggest difference to your sound?

The notebook keeps the full recipes and worked examples.

<NotebookCue section="1–10" task="Continue in the companion notebook." />

<!--
Close with students' versions. Ask them to restart the kernel and run their notebook in order.
-->
