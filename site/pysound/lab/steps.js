// The steps of the lab: each one is a small page, in three files (page.html, main.js, main.py).
export const steps = [
  {
    title: 'Python in the page',
    focus: 'js',
    text: 'Pyodide is CPython compiled to WebAssembly: the browser runs it like any program. <code>loadPyodide()</code> loads it; <code>runPython(text)</code> runs a text of Python and returns the value of its last line.',
    try: ['Change the Python, then run: <code>sum(range(101))</code>, <code>"ciao" * 3</code>.', 'What do <code>platform.system()</code> and <code>platform.machine()</code> say? Which machine is that?'],
  },
  {
    title: 'JavaScript and Python',
    focus: 'js',
    text: 'Values cross between the two languages. Numbers and strings become JavaScript values; a list, a dict or a function stays in Python, and JavaScript holds a <em>proxy</em> to it. <code>py.globals.get(name)</code> gives a Python name to JavaScript; the <code>js</code> module gives the page to Python.',
    try: ['Evaluate <code>2 ** 100</code>, then <code>2 ** 10</code>: why two different JavaScript types?', 'Write a Python function <code>scale(root)</code> that returns the names of a major scale, and a button that shows it.'],
  },
  {
    title: 'A sine',
    focus: 'py',
    text: 'The same <code>OutputStream</code> and callback as in lesson 09. <code>startPython</code> loads Pyodide, numpy and our <code>sounddevice</code>: an adapter with the same interface, which plays the blocks through Web Audio. The page asks the callback for blocks, a little ahead of time.',
    try: ['Play two sines at once: 440 and 660 Hz.', 'What happens with <code>blocksize=4096</code>? And with a callback that takes too long (a loop that counts to a million)? Watch the underflows.'],
  },
  {
    title: 'Sliders',
    focus: 'js',
    text: 'A slider sets a Python variable with <code>py.globals.set</code>; the callback reads it at every block. The phase goes on from where it was, so a change of frequency does not click.',
    try: ['Add a slider for a second sine, a fifth above or detuned by a few Hz.', 'Replace <code>phase = (...)</code> with a phase computed from the samples played (as in step 3), then move the slider: what do you hear?'],
  },
  {
    title: 'Keys',
    focus: 'js',
    text: 'JavaScript calls Python functions as if they were its own: <code>noteOn(60)</code> runs <code>note_on(60)</code>. The callback follows <code>gate</code> with an envelope: up in 10 ms, down in 150.',
    try: ['A saw instead of a sine: <code>2 * (phases / (2 * np.pi) % 1) - 1</code>.', 'Two keys at once: keep a set of the keys that are down, and play the last one.'],
  },
  {
    title: 'Latency',
    focus: 'py',
    text: 'Python works ahead of the ear: here 0.3 s. The callback notes when its block will be heard (<code>time.outputBufferDacTime</code>, as in sounddevice); the page compares it with <code>stream.time</code>. Two clocks: what Python has made, and what you hear.',
    try: ['Set <code>latency=0.08</code>: how far apart are the lights now?', 'A slider for <code>bpm</code>: why does the beat jump when you move it? (Count in beats, not in samples.)'],
  },
  {
    title: 'Parts on request',
    focus: 'js',
    text: 'The library of lesson 11, in the page. A button runs <code>melody.next = …</code>: it asks for a change, and the loop makes it at the end of its round. Click whenever you like: the change is always in time.',
    try: ['A button that plays the ending once, as a coda: <code>m.sources.append(Once(ending, played(bell, 1), clock))</code>.', 'A tempo slider: <code>clock.bpm = …</code>.', 'Keep the log with the beat of each line: can you play the performance again?'],
  },
]
