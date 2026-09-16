---
theme: default
title: Python as a conversation
info: ACTAM 2026 · Lesson 01
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

<div class="kicker">ACTAM 2026 · Lesson 01</div>

<h1 class="cover-title">Python as<br>a conversation</h1>

<!--
<p class="lead">A few expressions.<br>A list of numbers.<br>Something we can hear.</p>
-->

<div class="cover-meta">Expressions, lists and our first sounds</div>

<!--
Keep the reference notebook open for experiments. Code snippets build on earlier slides, just like notebook cells.
-->

---

# Opening a notebook

**Already installed:** open a terminal in your lesson folder and run `jupyter notebook`.

**Windows, macOS or Linux:** install [Python](https://www.python.org/downloads/), then run this inside a virtual environment:

```sh
python -m pip install notebook
python -m notebook
```

With **Anaconda or Miniconda**, use `conda install notebook`, then `jupyter notebook`.

**Browser only:** open [colab.research.google.com](https://colab.research.google.com), sign in and create a notebook or upload an `.ipynb` file. No local installation needed.

<!--
Official installation guide: https://jupyter.org/install
Colab: https://research.google.com/colaboratory/faq.html
Python environments: https://docs.python.org/3/library/venv.html
If needed, create a virtual environment first:
Windows: py -m venv .venv, then .venv\Scripts\activate.bat in Command Prompt.
macOS/Linux: python3 -m venv .venv, then source .venv/bin/activate.
Debian/Ubuntu may require sudo apt install python3-venv python3-pip first.
Use an existing Conda environment if available. Keep the server terminal running.
-->

---

# OK, so what is Python?

Imagine an interlocutor we can ask to do things.

Our requests use a precise language that the Python interpreter can execute.

What could we ask it to do?

<!--
Preserve the conversational opening. Python follows language rules and does not infer our intentions. Ask for a small calculation as a first request.
-->

---

# A conversation with Python

We can write a whole program and run it.

We can also give one small instruction, inspect the result and decide what to try next.

The next request can depend on the previous answer.

<!--
Use the original letter-versus-conversation analogy. This way of working helps us explore without knowing every step in advance.
-->

---

# Read, Evaluate, Print, Loop

| Step | What happens |
| --- | --- |
| Read | Receive an input |
| Evaluate | Work out its value |
| Print | Display the result |
| Loop | Wait for the next input |

A notebook saves this interaction in cells, alongside text and plots.

<!--
A notebook is not exactly a terminal REPL. A cell may contain multiple statements, and the final expression normally supplies the automatically displayed value.
-->

---

# Our first expressions

```python
1
1 + 1
2 ** 3
2 ** 1000
```

Each expression has a value.

`**` means exponentiation. Try these in separate notebook cells.

The first three results are `1`, `2` and `8`. The last is a very large integer.

<!--
Notebook section 1. Let students see the large integer. Python integers can grow, subject to available resources.
-->

---

# Order matters

```python
(1 + 2) * 3
```

```python
1 + 2 * 3
```

What will each expression evaluate to?

The results are **9** and **7**. Multiplication comes before addition, unless parentheses change the grouping.

<!--
Answers: 9 and 7. Ask for predictions before running them. Multiplication takes precedence over addition; parentheses change grouping.
-->

---

# Giving values names

```python
a = 1
b = 2
a + b
```

`=` assigns a value to a name.

```python
a = a + 10
a + b
```

What happens if we run the second cell again?

It gives **13**, then **23**. The notebook remembers the new value of `a`.

<!--
Notebook section 2. First result: 3. Second result: 13, then 23 on rerun. Explain that cells share state. Restart and run in order to reproduce the lesson.
-->

---

<div class="kicker">Your turn · 01</div>

# What will Python remember?

```python
a = 3
b = a + 2
a = 10
```

1. Predict the values of `a`, `b` and `a + b`.
2. Run the code and check your prediction.
3. Run only `b = a + 2` again. What changes, and why?

<NotebookCue section="2" task="Try this in a new cell. Explain the result to your neighbour." />

<!--
Answers: a=10, b=5, a+b=15. Rerunning b=a+2 gives b=12 and a+b=22. Assignment stores the evaluated value; it does not keep a live equation. Allow 2 minutes before discussing.
-->

---

# A series of temperatures

```python
t_0 = 20.0
t_1 = 21.5
t_2 = 20.3
```

This works when we know which name to write.

What if the position comes from a calculation?

<!--
Notebook section 3. Names with numerical suffixes do not create an indexable collection. We need a list.
-->

---

# Lists and positions

```python
t = [20.1, 20.3, 20.5, 100.0]
t[0]       # 20.1
t[1 + 1]   # 20.5
```

Positions start at zero. The index can be an expression.

```python
index = (2 ** 1234) % len(t)
t[index]
```

<!--
Explain len and remainder. Using len(t) keeps the index within this nonempty list. Mention t[-1] and explain IndexError with t[4] verbally.
-->

---

# An average temperature

```python
(t[0] + t[1] + t[2] + t[3]) / 4
```

```python
sum(t) / len(t)
```

Both give **40.225**. The second also works if the nonempty list changes length.

But what about that reading of `100.0`?

<!--
The average is 40.225. Separate correctness of the computation from interpretation of the measurements. An empty list would cause division by zero.
-->

---

# Function calls

```python
sum(t)
len(t)
print('Average:', sum(t) / len(t))
```

A call asks a function to perform an operation.

Arguments go inside parentheses. They can be expressions too.

<!--
Notebook section 4. Explain return values versus displaying text. print returns None. Different functions take different arguments.
-->

---

# What does adding lists mean?

```python
[1, 2, 3] + [10, 20, 30]
```

Make a prediction, then run it.

```python
# Result
[1, 2, 3, 10, 20, 30]
```

For Python lists, `+` concatenates.

<!--
Notebook section 5. Pause before students inspect the result. Numerical arrays have different operator rules; call these objects lists consistently.
-->

---

# Repeating a pattern

```python
[1, 2, 3] * 2
```

```python
[0] * 10 + [1] * 10
```

How would you repeat the whole second pattern three times?

```python
([0] * 10 + [1] * 10) * 3
```

Parentheses make the whole pattern the unit we repeat.

<NotebookCue section="1–5" task="Try expressions, names and list operations." />

<!--
Answer: ([0] * 10 + [1] * 10) * 3. Parentheses choose what gets repeated. This is the bridge from lists to periodic signals.
-->

---

<div class="kicker">Your turn · 02</div>

# A pattern made of lists

Build a list containing **five zeros, five ones, then five zeros**.

1. Repeat the whole pattern three times using `+` and `*`.
2. Predict its length before calling `len`.
3. Retrieve the first value equal to one by its index.

Where do the parentheses belong?

<NotebookCue section="5" task="Write the expression, then inspect the result." />

<!--
Solution: pattern = ([0] * 5 + [1] * 5 + [0] * 5) * 3. Length 45. The first one has index 5: pattern[5]. Allow 3 minutes. Distinguish index 5 from the fifth element.
-->

---

# What does the dot mean?

```python
from matplotlib import pyplot as plt
plt.plot([0, 1, 0])
```

`plt` names the module we imported. The dot looks up its `plot` attribute, which is a function.

`plt.plot` retrieves the function. Adding `(...)` calls it.

The parentheses do the same job as in `sum(t)`.

---

# An operation on a particular list

```python
notes = [440, 550]
notes.append(660)
notes                 # [440, 550, 660]
```

`append` is a **method** of this list. Calling it changes the list itself.

It returns `None`, so we inspect `notes` to see the result.

<p class="small">The dot looks up an attribute. Parentheses call it if it is callable. Some attributes simply hold data.</p>

---

# Shall we draw it?

```python
from matplotlib import pyplot as plt

step = [0] * 10 + [1] * 10
plt.plot(step * 10)
plt.xlabel('Sample index')
plt.ylabel('Value')
plt.show()
```

The horizontal positions come from the list indices.

<NotebookCue section="6" task="Plot one pattern, then repeat it." />

<!--
Live demo: notebook section 6. Show the single step first, then the repeated pattern. The connecting lines help us see discrete samples. Explain the import and the plt alias.
-->

---

<div class="kicker">Your turn · 03</div>

# A list that changes

```python
values = [0, 1, 0]
result = values.append(1)
```

1. Predict `values` and `result`, then inspect both.
2. Plot `values` with `plt.plot(values)`.
3. Explain the roles of the dot and parentheses in each call.

<NotebookCue section="6" task="Use print(result) to make the return value visible." />

<!--
Answers: values is [0,1,0,1]; result is None. append mutates the list and returns None. plt.plot is a module function; values.append is a bound list method. The dot retrieves an attribute; parentheses call it. Allow 3 minutes.
-->

---

# A pattern we can see

<WavePlot shape="square" :samples="60" :cycles="3" :height="260" title="Three square wave periods with twenty samples per period" />

Each dot is one value. Its horizontal position is its **index**.

The connecting lines help us see the shape. This list has no time scale yet.

---
class: dark
---

<div class="chapter">
<div class="kicker">Sound as data</div>
<h1>Could this list<br>be a sound?</h1>
<p class="lead">We have numbers in an order.<br>Now we need to give them a meaning in time.</p>
</div>

---

# What are we representing?

Sound in air involves pressure changing over time. A microphone converts those changes into an electrical signal.

We can measure the signal at regularly spaced instants and store the measurements as numbers.

Each measurement is a **sample**. Together, they describe how a signal changes.

<p class="small">We can also calculate samples directly. That is what we will do when we synthesize a waveform.</p>

---

# A sample is a value at an instant

<WavePlot :samples="25" :cycles="2" :reference="true" :height="255" title="A continuous sine curve with twenty-five sampled values" />

The grey curve is an example signal. The dots are the values we keep.

A sample is an amplitude value, rather than a little recording with its own duration.

<!-- Reference: https://www.dspguide.com/ch3.htm -->

---

# The sample rate gives us a clock

At **48,000 samples per second**, adjacent samples are about **20.83 microseconds** apart.

$$t_k = \frac{k}{SR}$$

| Index $k$ | Time at $SR = 48{,}000$ |
| --- | --- |
| 0 | 0 seconds |
| 480 | 0.01 seconds |
| 48,000 | 1 second |

<p class="small">The sample rate belongs to the interpretation of the list. The list itself only stores values.</p>

---

# How long is a list of samples?

For a mono signal with $N$ samples:

$$\text{duration} = \frac{N}{SR}$$

```python
SR = 48_000
samples = [0.0] * 24_000
len(samples) / SR           # 0.5 seconds
```

Every value is zero, so this represents half a second of silence.

<p class="small">The final sample starts at (N − 1) / SR. The buffer occupies N / SR seconds.</p>

---

<div class="kicker">Your turn · 04</div>

# Giving samples a time scale

A mono recording contains **96,000 samples** at **48,000 samples per second**.

1. How long does it last?
2. At what time does the sample with index `24_000` occur?
3. If we play the same list at 24,000 samples per second, how long does it last now?

Write the units alongside your calculations.

<NotebookCue section="7 and 11" task="Calculate first, then check with Python." />

<!--
Answers: 2 seconds; 0.5 seconds; 4 seconds. Duration is N/SR and sample time is k/SR. The data does not change when its playback time scale changes. Allow 2 minutes.
-->

---

# What do the numbers mean?

Our floating-point examples use values around zero, within **−1 to +1**.

Zero is the signal's centre. Positive and negative values describe deviations on either side.

Multiplying every sample by `0.15` scales its amplitude. For the same waveform and playback settings, this usually sounds quieter.

<p class="small">These values are relative signal levels, not pressure in pascals or a direct measurement of perceived loudness.</p>

---

# Sampling and numerical precision

**Sampling** chooses instants in time. The sample rate sets their spacing.

**Quantization** chooses among representable amplitude values. Finite precision means rounding.

For example, 16-bit PCM has $2^{16} = 65{,}536$ possible values per sample. Our calculations use floating-point numbers.

<p class="small">Increasing the sample rate and increasing the bit depth change different aspects of the representation.</p>

<!-- Reference: https://www.dspguide.com/ch3/1.htm -->

---

# Listening to the numbers

Playback uses the sample rate to schedule the values. Audio hardware converts the digital signal into an analogue signal that drives a speaker.

The speaker produces pressure variations we can hear.

A waveform plot shows the data. Its straight connecting lines are a drawing convention, not a complete model of reconstruction.

<p class="small">All examples here are mono: one sequence of values. Stereo uses two channels with the same time base.</p>

---

# Could this list be a sound?

The values can describe a sequence of audio samples.

We also need the **sample rate**: how many samples to play each second.

```python
SR = 48_000
amplitude = 0.15
```

Start with a low listening volume.

<!--
Notebook section 7. Underscores in a number are only for readability. The sample rate gives a time interpretation to an otherwise untimed list.
-->

---

# Our first square wave

```python
from IPython.display import Audio

square_period = [-amplitude] * 10 + [amplitude] * 10
square = square_period * 2400
Audio(square, rate=SR, normalize=False)
```

20 samples per period. 48,000 samples altogether.

Click the notebook player to listen to one second of sound.

<!--
The waveform is centred around zero. normalize=False preserves the chosen amplitude. These Python snippets run in the notebook, not inside Slidev.
Reference: https://ipython.readthedocs.io/en/stable/api/generated/IPython.display.html#IPython.display.Audio
-->

---

<div class="kicker">Your turn · 05</div>

# A lower sound, the same duration

Our square wave has **20 samples per period**, repeated **2,400 times**, at **48,000 samples per second**.

1. Predict its frequency and total duration.
2. Make the pitch one octave lower, keeping the duration unchanged.
3. Make a sound twice as long, keeping the original pitch.

<NotebookCue section="7" task="Change the lists and repetition counts, then listen." />

<!--
Answers: 2,400 Hz and 1 second. Lower octave: 40 samples per period, 1,200 repetitions (20 negative and 20 positive samples). Twice as long at original pitch: 20 samples per period, 4,800 repetitions. Allow 4 minutes. The next slide discusses the controls after students try.
-->

---

# Pitch and duration

What happens if we double the samples in each period?

What happens if we only double the number of repetitions?

At a fixed sample rate, a longer period lowers the frequency. More repetitions make a longer sound.

If the repeat count stays fixed, doubling the period also doubles the duration.

<NotebookCue section="7" task="Change the period length, then change the repeat count." />

<!--
At fixed sample rate, doubling period length halves frequency. If repetitions are unchanged it also doubles duration. Doubling repetitions alone doubles duration and preserves frequency.
-->

---

# A siren with two pitches

```python
low_period = [-amplitude] * 60 + [amplitude] * 60
high_period = [-amplitude] * 40 + [amplitude] * 40

low_note = low_period * 200
high_note = high_period * 300
siren = (low_note + high_note) * 3
Audio(siren, rate=SR, normalize=False)
```

Each note lasts half a second. The pitches are 400 Hz and 600 Hz.

<NotebookCue section="8" task="Build the siren and change its alternation speed." />

<!--
Notebook section 8. Frequencies are 400 and 600 Hz. Reduce both repeat counts proportionally to speed the alternation without changing pitch.
-->

---

<div class="kicker">Your turn · 06</div>

# A faster siren

Use the two notes from the previous slide.

1. Make each note last a quarter of a second, keeping both pitches.
2. Keep the whole siren three seconds long.
3. Explain which repetition counts you changed and why.

<NotebookCue section="8" task="Build the new siren, then compare it with the original." />

<!--
Solution: low_note = low_period * 100; high_note = high_period * 150; siren = (low_note + high_note) * 6. Each note has 12,000 samples. A pair is 0.5 seconds, repeated six times. Period lengths stay 120 and 80. Allow 4 minutes.
-->

---

# Another shape

```python
ramp = [0.0, 0.1, 0.2, 0.3, 0.4,
        0.5, 0.6, 0.7, 0.8, 0.9]
plt.plot(ramp * 3)
plt.show()
```

The ramp rises, then jumps back down when it repeats.

That gives a **sawtooth**. A triangle also needs a descending slope.

<!--
Live demo: notebook section 9. Inspect the period boundary in the plot. Compare the abrupt reset with the descending slope needed for a triangle.
-->

---

# A recipe for samples

Writing hundreds of values by hand would get boring.

```python
list(range(5))
# [0, 1, 2, 3, 4]
```

```python
n = 20
ramp = [x / n for x in range(n)]
```

For each `x`, calculate `x / n` and collect the results.

<!--
Notebook section 10. range excludes the endpoint. Explain the list comprehension by calculating its first three values aloud.
Reference: https://docs.python.org/3/tutorial/datastructures.html#list-comprehensions
-->

---

# A longer sawtooth period

```python
n = 300
saw_period = [
    amplitude * (2 * x / n - 1)
    for x in range(n)
]
saw = saw_period * 160
Audio(saw, rate=SR, normalize=False)
```

One number now controls the period length.

<NotebookCue section="9–10" task="Replace a literal list with a recipe." />

<!--
Explain the mapping: x/n rises from zero towards one, multiplying by two and subtracting one centres it approximately around zero, then amplitude scales it.
-->

---

# Samples, time and frequency

A period contains $n$ samples. We play $SR$ samples per second.

$$T = \frac{n}{SR} \qquad f = \frac{SR}{n}$$

For 300 samples at 48,000 samples per second:

$$T = 0.00625\text{ s} \qquad f = 160\text{ Hz}$$

<!--
Notebook section 11. Distinguish period duration from the full sound duration. The full 48,000-sample sawtooth lasts one second.
-->

---

# What if we want 440 Hz?

```python
SR / 440
# 109.0909... samples per period
```

A list needs an integer number of samples.

```python
n = round(SR / 440)
SR / n
# 440.3669... Hz
```

Repeating 109 samples gives a small tuning error.

<p class="small">This limit comes from repeating a fixed integer-length period. Other oscillator recipes can represent 440 Hz without this restriction.</p>

<!--
Avoid implying that digital audio cannot produce 440 Hz. This is a limitation of our fixed integer-period construction. A phase-based oscillator is a future extension.
-->

---

# A real triangle

```python
half_n = 150
up = [-amplitude + 2 * amplitude * x / half_n
      for x in range(half_n)]
down = [amplitude - 2 * amplitude * x / half_n
        for x in range(half_n)]
triangle_period = up + down
triangle = triangle_period * 160
```

300 samples per period again. How will the timbre change?

<!--
Live demo: notebook section 12. Show the overlaid plots and play sawtooth then triangle at the same frequency. Equal peak amplitude is not equal perceived loudness. The simple waveforms can alias; more careful synthesis comes later.
-->

---

# Same period, different shapes

<div class="columns">
<div>
<h2>Sawtooth</h2>
<WavePlot shape="saw" :samples="90" :cycles="3" :height="250" :dots="false" title="Three sawtooth periods" />
</div>
<div>
<h2>Triangle</h2>
<WavePlot shape="triangle" :samples="90" :cycles="3" :height="250" :dots="false" title="Three triangle periods" />
</div>
</div>

The same period gives the same fundamental frequency. The shape changes the balance of harmonics and contributes to **timbre**.

<NotebookCue section="12" task="Compare the plots, then listen to both waveforms." />

---

<div class="kicker">Your turn · 07</div>

# Same pitch, another timbre

Build a triangle with **600 samples per period**, at **48,000 samples per second**.

1. How many samples belong to each slope?
2. Predict its frequency and make one second of sound.
3. Compare it with a sawtooth at the same frequency and peak amplitude.

Describe what changes in the sound and what stays the same.

<NotebookCue section="10–12" task="Generate both shapes, plot a few periods and listen." />

<!--
Answers: 300 samples per slope; 80 Hz; 80 repetitions. Set half_n=300 for the triangle and n=600 for the sawtooth. Use the same amplitude. Timbre changes; the fundamental frequency and duration stay the same. Equal peak amplitude need not mean equal perceived loudness. Allow 5 minutes.
-->

---

# How much can samples capture?

To reconstruct a signal ideally, it must be band-limited: all its frequency components must lie **below half the sample rate**.

At 48,000 samples per second, that boundary is 24,000 Hz.

Higher components can appear as lower frequencies: **aliasing**. Sharp waveform transitions introduce high harmonics, so our simple recipes can alias.

<p class="small">Recording systems filter before sampling. Better synthesis recipes control the harmonics they generate.</p>

<!-- Reference: https://www.dspguide.com/ch3/2.htm -->

---

# OK, what changes if we…?

<SampleLab />

<p class="small">Start at low volume. Longer periods lower pitch. More repeats extend duration. Halving the sample rate halves pitch and doubles duration.</p>

<!-- Default state: 120 samples per period, 48,000 samples/s, 400 repetitions. Frequency 400 Hz, duration 1 second. Graph shows two periods. Reference: https://developer.mozilla.org/en-US/docs/Web/API/AudioBuffer -->

---

# Three controls, three calculations

| What changes? | Frequency $SR/n$ | Duration $nr/SR$ |
| --- | --- | --- |
| Double period length $n$ | Halves | Doubles |
| Double repetitions $r$ | Unchanged | Doubles |
| Halve sample rate $SR$ | Halves | Doubles |

Each row changes one quantity while keeping the others fixed.

<p class="small">For the lab's initial values: n = 120, r = 400, SR = 48,000. That gives 400 Hz and one second.</p>

---

# An A major arpeggio

A4, C♯5, E5, then optionally A5.

In twelve-tone equal temperament, $s$ semitones multiply frequency by $2^{s/12}$.

```python
offsets = [0, 4, 7, 12]
frequencies = [440 * 2 ** (s / 12) for s in offsets]
period_lengths = [round(SR / f) for f in frequencies]
```

The offsets describe the major triad and its octave ending.

<!--
Notebook section 13. Give students time before opening the worked example. They can use one explicit recipe per note without introducing nested comprehensions or function definitions.
-->

---

<div class="kicker">Your turn · 08</div>

# An arpeggio of your own

Use the frequencies from the previous slide to build **A4, C♯5, E5, A5**.

1. Make each note last approximately half a second.
2. Concatenate the notes and listen.
3. Make it descend, then change the ascending version to A minor.

Keep the sample rate and amplitude the same for every note.

<NotebookCue section="13" task="Try your recipe before opening the worked example." />

<!--
Allow 6–8 minutes. Each n is round(SR/f); repeats = round(0.5*SR/n). Concatenate in reverse note order for the descent. Minor offsets: [0,3,7,12]. The notebook has the complete worked example. The next slide offers a scaffold if needed.
-->

---

# Building each note

```python
duration = 0.5
n = period_lengths[0]
period = [amplitude * (2 * x / n - 1)
          for x in range(n)]
note = period * round(duration * SR / n)
```

Repeat for the other periods, then concatenate the notes.

The notebook contains a complete worked example for comparison.

<NotebookCue section="13" task="Build four notes, concatenate them and listen." />

<!--
The reference notebook contains the complete worked solution. Change offset 4 to 3 for minor. Rounding introduces small frequency and duration differences. Mention fades as a later solution to clicks at boundaries.
-->

---

# Further experiments

- Make the siren alternate twice as fast, keeping its pitches.
- Make a lower triangle tone.
- Play the arpeggio downwards.
- Play the same samples at half the sample rate.

Predict what will change before you listen.

Discuss which quantity you changed and which quantities you held fixed.

<!--
For the last experiment, both frequency and playback speed halve, so duration doubles. Use the notebook exercise notes after students have tried their own solutions.
-->

---
layout: default
class: dark
---

<div class="chapter">

# What shall we ask Python next?

We can calculate a value, describe a sequence, draw it and listen to it.

Make a prediction. Try a small experiment. Let the result guide the next request.

</div>

---

# Reading and experimenting

The companion notebook, **Python as a conversation**, contains the complete runnable examples and worked exercises.

- [Python: numbers and lists](https://docs.python.org/3/tutorial/introduction.html)
- [Python: list comprehensions](https://docs.python.org/3/tutorial/datastructures.html#list-comprehensions)
- [Digital signal processing: sampling and quantization](https://www.dspguide.com/ch3.htm)
- [IPython: audio playback](https://ipython.readthedocs.io/en/stable/api/generated/IPython.display.html#IPython.display.Audio)

<p class="small">Python snippets build on the earlier definitions. Run them in the notebook. The interactive sample lab works directly in these slides.</p>

<!--
Return to the opening conversation metaphor. Natural next topics include defining reusable functions and controlling an oscillator with frequency and duration directly.
-->
