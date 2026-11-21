---
theme: default
title: Python in a web page
info: ACTAM 2026 · Lesson 12
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

<div class="kicker">ACTAM 2026 · Lesson 12</div>
<h1 class="cover-title">Python in<br>a web page</h1>
<div class="cover-meta">a virtual machine, an adapter, controls</div>

<!--
The companion is the lab: seven small pages, each one a step, with the code to edit and the page running next to it. The last step leads to the whole band of lesson 11 on a board.
-->

---

# So far: Python on the computer

<div class="columns">
<div>

- Our code calls `sounddevice`.
- `sounddevice` calls PortAudio, PortAudio the operating system, the system the sound card.
- CPython itself is a program: instructions for **this** processor, x86 or ARM.

</div>
<div>
<div class="stack-title">a notebook</div>
<div class="stack">
  <div class="hot">our code <small>callback, Loop, Band</small></div>
  <div>CPython + numpy + sounddevice</div>
  <div>PortAudio</div>
  <div>operating system <small>macOS, Windows, Linux</small></div>
  <div>processor, sound card</div>
</div>
</div>
</div>

---
class: dark
---

<div class="chapter"><div class="kicker">Virtual machines</div><h1>A machine inside<br>the browser</h1></div>

---

# A processor made of software

- A program is instructions for a processor. To run it on another machine: translate it, or **imitate the machine**.
- A **virtual machine** is a processor made of software: it has its own instructions, and a real program executes them.
- We have met one already: CPython turns our code into *bytecode*, and executes it.

| virtual machine | runs | on |
|---|---|---|
| CPython | Python bytecode | the processor |
| JVM | Java bytecode | the processor |
| **WebAssembly** | wasm instructions | **every browser** |

---

# WebAssembly

- Instructions for a simple, imaginary processor: numbers, memory, jumps. Every browser executes them, almost as fast as native code.
- Compilers for C, C++, Rust can produce them. CPython is written in C: it can be compiled to WebAssembly.
- A **sandbox**: no files, no devices. Only what the page gives it.

<div class="answer">The browser offers a processor's interface: a program for that processor runs in any browser.</div>

---

# Pyodide

<div class="columns">
<div>

- CPython compiled to WebAssembly, with packages already built for it: numpy, scipy, matplotlib…
- And a **bridge** to JavaScript: values and functions cross in both directions.
- The same Python. Only the machine underneath has changed.

```python
platform.machine()       # 'wasm32'
```

</div>
<div>
<div class="stack-title">a web page</div>
<div class="stack">
  <div class="hot">our code</div>
  <div>CPython + numpy <small>Pyodide</small></div>
  <div class="alien">WebAssembly <small>the virtual processor</small></div>
  <div>browser <small>JavaScript, Web APIs</small></div>
  <div>operating system</div>
  <div>processor, sound card</div>
</div>
</div>
</div>

<LabCue step="1" task="Load Pyodide and run a text of Python. Which machine does it say it is?" />

---
class: dark
---

<div class="chapter"><div class="kicker">An adapter</div><h1>No sound card<br>in there</h1></div>

---

# What is missing

<div class="columns">
<div>

- In the sandbox there is no PortAudio and no operating system to ask: `import sounddevice` fails.
- The browser does have sound, with an interface of its own: the **Web Audio API**, in JavaScript.
- An **AudioWorklet** is code that runs on the audio thread and fills 128 samples at a time.

</div>
<div>
<div class="stack-title">a web page</div>
<div class="stack">
  <div class="hot">our code <small>callback</small></div>
  <div>CPython + numpy</div>
  <div class="gap">sounddevice?</div>
  <div class="alien">WebAssembly</div>
  <div>browser <small>Web Audio</small></div>
</div>
</div>
</div>

---

# An adapter

- Our code expects an interface: `OutputStream`, a callback, `outdata`. We give it **the same interface**, built on what is there.
- An operating system does the same with a **driver**: one interface for all programs, and a driver that speaks to that card.
- Also called a *shim*; on the web, a missing interface rebuilt from others is a *polyfill*.

<div class="flow">
  <div class="hot">callback<small>our code, unchanged</small></div><b>⇄</b>
  <div>sounddevice.py<small>the adapter</small></div><b>⇄</b>
  <div>AudioWorklet<small>Web Audio</small></div><b>→</b>
  <div>speakers</div>
</div>

<div class="answer">Python does not know it is in a browser: it sees the interface it knows.</div>

---

# The adapter, roughly

1. The AudioWorklet plays blocks from a queue, in order.
2. Every few milliseconds it tells Python how much it has played.
3. Python calls the callback until the queue is about 80 ms ahead.
4. A block that is not there in time: silence, and an **underflow**, as with a real card.

```python
import sounddevice as sd             # the adapter, with the same name

stream = sd.OutputStream(samplerate=48000, blocksize=256,
                         channels=1, callback=callback)
stream.start()
```

<!--
The details are in pysound.js and sounddevice.py, on the site: about 150 lines of JavaScript and 150 of Python. The point is the shape: the page is the sound card, and it asks Python for blocks.
-->

---
class: dark
---

<div class="chapter"><div class="kicker">Architecture</div><h1>Python, driven<br>by JavaScript</h1></div>

---

# One page, two languages

<div class="flow">
  <div>HTML<small>buttons, sliders, keys</small></div><b>→</b>
  <div>JavaScript<small>events: click, input, keydown</small></div><b>⇄</b>
  <div class="hot">Python<small>Pyodide, in the same page</small></div><b>⇄</b>
  <div>Web Audio</div>
</div>

| from JavaScript | what it does |
|---|---|
| `py.runPython("2 ** 100")` | runs a text of Python, returns the value of the last line |
| `py.globals.get("shout")` | a Python name, as a JavaScript value |
| `py.globals.set("f", 440)` | sets a Python variable |

From Python, `import js` gives the page: `js.document.getElementById("out")`.

---
class: code-sm
---

# Values that cross

```js
py.runPython("1 + 1")              // 2: a number
py.runPython("2 ** 100")           // a BigInt: too big for a JavaScript number
py.runPython("'fra' + ' martino'") // a string

const shout = py.globals.get("shout")
shout("fra martino", 3)            // a Python function, called from JavaScript

const list = py.globals.get("notes")(10)
list.toJs()                        // a list stays in Python: a proxy; toJs() copies it
```

- Numbers and strings are converted. Lists, dicts, functions stay in Python, and JavaScript holds a **proxy**.

<LabCue step="2" task="Evaluate expressions, call shout and notes, let Python write in the page." />

---

# The lab

<LabFrame :step="2" :height="430" />

---
class: dark
---

<div class="chapter"><div class="kicker">Sound and controls</div><h1>A sine,<br>sliders, keys</h1></div>

---
class: code-sm
---

# A sine on a button

```js
import { startPython } from 'https://actam.bruschi.dev/pysound/pysound.js'

const py = await startPython({ button: '#play' })   // Pyodide, numpy, sounddevice
py.runPython(PYTHON)                                // defines callback and stream

play.onclick = () => py.runPython('stream.start()')
stop.onclick = () => py.runPython('stream.stop()')
```

- The Python is the callback of lesson 09, unchanged.
- A browser starts sound only after a click: `button` is where that first click happens.

<LabCue step="3" task="Play and stop. Then a callback that is too slow: watch the underflows." />

---
class: code-sm
---

# A slider sets a variable

```js
f.addEventListener('input', () => py.globals.set('f', Number(f.value)))
```

```python
def callback(outdata, frames, time, status):
    global phase
    phases = phase + 2 * np.pi * f * np.arange(frames) / SR     # f, read at every block
    outdata[:, 0] = volume * np.sin(phases)
    phase = (phase + 2 * np.pi * f * frames / SR) % (2 * np.pi)
```

- The callback reads `f` at the next block: the change is heard a block, and the queue, later.
- The phase goes on from where it was: no click when the frequency changes.

<LabCue step="4" task="Move the sliders. Then break the phase and listen." />

---

# Keys call functions

```js
const noteOn = py.globals.get('note_on')
const noteOff = py.globals.get('note_off')

key.onpointerdown = () => noteOn(60)       // runs note_on(60), in Python
key.onpointerup = () => noteOff()
```

- A Python function, held by JavaScript, called at every event.
- In Python, `note_on` only sets `f` and `gate`; the callback follows them with an envelope.

<LabCue step="5" task="Play with the keys and the keyboard. Then a saw." />

---

# Two clocks

- Python works **ahead** of the ear: the queue holds what has been made and not yet heard.
- The callback knows when its block will be heard: `time.outputBufferDacTime`. The stream knows what is heard now: `stream.time`.
- The page must show what is heard, not what Python has made.

```python
ahead_s = mark["at"] - stream.time          # the last block, from the ear
heard = mark["beat"] - ahead_s * bpm / 60   # the beat heard now
```

<LabCue step="6" task="Two lights: Python makes the click, you hear it. How far apart?" />

---

# A click is a request

- The library of lesson 11, in the page. A button runs `melody.next = climb`.
- The click does not change the melody: it **asks**. The loop changes at the end of its round.
- So a click is always in time: the clock decides when, not the hand.

<div class="flow">
  <div>click<small>any moment</small></div><b>→</b>
  <div class="hot">melody.next = climb<small>a line of Python</small></div><b>→</b>
  <div>end of the round<small>the clock</small></div><b>→</b>
  <div>climb</div>
</div>

<LabCue step="7" task="Ask for parts at any moment: where do they start?" />

---

# The whole band

- Voices of the round, parts and ways to turn them, drums in steps, tempo and key.
- Every control writes **a line of Python** and runs it. The lines go in a log: the log is the score of what was played, and it runs in a notebook too.

<LabFrame page="round/" :height="290" />

---
class: code-sm
---

# In any page

```html
<button id="audio">audio</button>
<script type="module">
import { startPython } from 'https://actam.bruschi.dev/pysound/pysound.js'

const py = await startPython({ button: '#audio' })
await py.runPythonAsync(`
import numpy as np
import sounddevice as sd
phase = 0
def callback(outdata, frames, time, status):
    global phase
    n = phase + np.arange(frames)
    outdata[:, 0] = 0.2 * np.sin(2 * np.pi * 440 * n / 48000)
    phase += frames
sd.OutputStream(samplerate=48000, blocksize=256, channels=1, callback=callback).start()
`)
</script>
```

---

# Again, by hand

- The lab is a path already written. The **step editor** is the same page, to write in: `main.py`, `main.js`, `style.css`, `page.html`.
- **+ step** copies the step and goes on from it. The new lines are marked; *show removed lines* shows what went.
- The steps stay in the browser. **export** gives one `.json`; **save to folder** writes a folder per step, to keep with the code.
- **⤓ download** gives the page as one HTML file, which opens with a double click. **CodePen ↗** opens the same page on CodePen.

<LabCue page="editor/" label="Step editor" task="Start from an empty page, or from a copy of the lab." />

---

# To try

- **A coda.** A button that plays the ending once: `Once(ending, played(bell, 1), clock)`.
- **Tap tempo.** Measure the time between clicks in JavaScript, set `clock.bpm`.
- **A MIDI keyboard.** The Web MIDI API gives note numbers: call `note_on` with them.
- **A performance as data.** Keep each line of the log with its beat, and play the log again.
- **Your instrument.** One of your sources from lesson 09, with its own controls, in a page.
