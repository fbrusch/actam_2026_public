---
theme: default
title: Sound in real time
info: ACTAM 2026 · Lesson 09
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

<div class="kicker">ACTAM 2026 · Lesson 09</div>
<h1 class="cover-title">Sound<br>in real time</h1>
<div class="cover-meta">callbacks, phase, sources, a mixer and voices</div>

<!--
The companion is the notebook from class, sections 1–8. In the browser, the first cell shows a ▶ audio button: press it once.
-->

---

# Two ways of making sound

| render, then play | live |
|---|---|
| write the code | start a stream |
| run it: a whole wave | it asks for samples, again and again |
| listen | change things while it plays |

The first is a waterfall: design, build, use. The second is a **REPL**: the program runs, and we talk to it.

<!--
The contrast between writing an application and exploring in a notebook. Live coding is the second way, applied to sound.
-->

---
class: dark
---

<div class="chapter"><div class="kicker">The sound card asks</div><h1>A callback</h1></div>

---

# The callback

```python
def callback(outdata, frames, time, status):
    outdata[:, 0] = 0.1 * np.random.uniform(-1, 1, frames)      # noise

out = sd.OutputStream(samplerate=SR, channels=1, callback=callback)
out.start()
out.stop()
```

- We do not call `callback`: the sound card does, whenever it needs samples.
- `frames`: how many it wants now. `outdata`: where to put them.

<NotebookCue section="1" task="Start the noise, then stop it." />

<!--
Inversion of control: we hand a function to the library, the library decides when to call it. The same as an event handler in the browser.
-->

---

# `outdata` is an array

```python
r = np.random.random((2, 3))     # 2 rows, 3 columns
r[:, 0]                          # the first column: all the rows, column 0
r[:, 0] = [10, 20]               # as many values as there are rows
r[:, 0] = [1, 2, 3]              # ValueError
```

- One row per sample, one column per channel: shape `(frames, channels)`.
- **Write into it**: `outdata[:, 0] = ...`. `outdata = ...` only moves a local name, and the sound card never sees it.

<NotebookCue section="1" task="Try the small array, and the ValueError." />

<!--
The return value of the callback is ignored. id(outdata) does not change with outdata[:, 0] = ..., and changes with outdata = ...: two names, one object, as in lab 05.
-->

---

# Say how many channels

```python
sd.OutputStream(callback=callback)       # the device's: often 2 channels
sd.OutputStream(samplerate=SR, channels=1, callback=callback)
```

- With two channels and only column 0 written, column 1 plays whatever was in memory: loud noise.
- Without `samplerate`, the card may run at 44100 while we compute at 48000: everything goes flat.

<NotebookCue section="1" task="Always pass samplerate and channels." />

<!--
The real sounddevice does not clear outdata between calls. The browser stand-in does, so there the mistake is silent.
-->

---
class: dark
---

<div class="chapter"><div class="kicker">Memory</div><h1>Where<br>was I?</h1></div>

---

# A sine, block by block

```python
def sine_callback(outdata, frames, time, status):
    t = np.arange(frames) / SR
    outdata[:, 0] = 0.2 * np.sin(2 * np.pi * 440 * t)
```

<svg viewBox="0 0 720 160" width="720" height="160" role="img" aria-label="A sine drawn over three blocks: at the start of each block it jumps back to the start of its cycle.">
  <line x1="240" y1="20" x2="240" y2="140" stroke="#ccd4cf" stroke-dasharray="4 4"/><line x1="460" y1="20" x2="460" y2="140" stroke="#ccd4cf" stroke-dasharray="4 4"/>
  <path d="M20.0 80.0 L21.0 73.3 L22.0 66.8 L23.0 60.4 L24.0 54.5 L25.0 48.9 L26.0 44.0 L27.0 39.7 L28.0 36.1 L29.0 33.3 L30.0 31.3 L31.0 30.2 L32.0 30.0 L33.0 30.7 L34.0 32.3 L35.0 34.8 L36.0 38.0 L37.0 42.0 L38.0 46.7 L39.0 52.0 L40.0 57.8 L41.0 64.0 L42.0 70.4 L43.0 77.1 L44.0 83.8 L45.0 90.4 L46.0 96.8 L47.0 103.0 L48.0 108.7 L49.0 113.9 L50.0 118.5 L51.0 122.4 L52.0 125.6 L53.0 127.9 L54.0 129.4 L55.0 130.0 L56.0 129.7 L57.0 128.5 L58.0 126.4 L59.0 123.5 L60.0 119.8 L61.0 115.4 L62.0 110.4 L63.0 104.8 L64.0 98.8 L65.0 92.4 L66.0 85.9 L67.0 79.2 L68.0 72.5 L69.0 65.9 L70.0 59.7 L71.0 53.7 L72.0 48.3 L73.0 43.4 L74.0 39.2 L75.0 35.7 L76.0 33.0 L77.0 31.1 L78.0 30.2 L79.0 30.1 L80.0 30.9 L81.0 32.6 L82.0 35.1 L83.0 38.5 L84.0 42.6 L85.0 47.3 L86.0 52.7 L87.0 58.5 L88.0 64.7 L89.0 71.2 L90.0 77.9 L91.0 84.6 L92.0 91.2 L93.0 97.6 L94.0 103.7 L95.0 109.4 L96.0 114.5 L97.0 119.1 L98.0 122.9 L99.0 125.9 L100.0 128.2 L101.0 129.5 L102.0 130.0 L103.0 129.6 L104.0 128.3 L105.0 126.1 L106.0 123.1 L107.0 119.3 L108.0 114.8 L109.0 109.7 L110.0 104.1 L111.0 98.0 L112.0 91.6 L113.0 85.0 L114.0 78.3 L115.0 71.7 L116.0 65.1 L117.0 58.9 L118.0 53.0 L119.0 47.6 L120.0 42.8 L121.0 38.7 L122.0 35.3 L123.0 32.7 L124.0 31.0 L125.0 30.1 L126.0 30.1 L127.0 31.0 L128.0 32.9 L129.0 35.5 L130.0 38.9 L131.0 43.1 L132.0 48.0 L133.0 53.4 L134.0 59.3 L135.0 65.5 L136.0 72.1 L137.0 78.7 L138.0 85.4 L139.0 92.0 L140.0 98.4 L141.0 104.5 L142.0 110.1 L143.0 115.1 L144.0 119.6 L145.0 123.3 L146.0 126.3 L147.0 128.4 L148.0 129.6 L149.0 130.0 L150.0 129.5 L151.0 128.0 L152.0 125.8 L153.0 122.7 L154.0 118.8 L155.0 114.2 L156.0 109.0 L157.0 103.4 L158.0 97.2 L159.0 90.8 L160.0 84.2 L161.0 77.5 L162.0 70.8 L163.0 64.4 L164.0 58.1 L165.0 52.3 L166.0 47.0 L167.0 42.3 L168.0 38.2 L169.0 34.9 L170.0 32.4 L171.0 30.8 L172.0 30.1 L173.0 30.2 L174.0 31.2 L175.0 33.1 L176.0 35.9 L177.0 39.4 L178.0 43.7 L179.0 48.6 L180.0 54.1 L181.0 60.0 L182.0 66.4 L183.0 72.9 L184.0 79.6 L185.0 86.3 L186.0 92.8 L187.0 99.2 L188.0 105.2 L189.0 110.7 L190.0 115.7 L191.0 120.1 L192.0 123.7 L193.0 126.6 L194.0 128.6 L195.0 129.7 L196.0 130.0 L197.0 129.3 L198.0 127.8 L199.0 125.4 L200.0 122.2 L201.0 118.3 L202.0 113.6 L203.0 108.4 L204.0 102.6 L205.0 96.4 L206.0 90.0 L207.0 83.3 L208.0 76.7 L209.0 70.0 L210.0 63.6 L211.0 57.4 L212.0 51.6 L213.0 46.4 L214.0 41.7 L215.0 37.8 L216.0 34.6 L217.0 32.2 L218.0 30.7 L219.0 30.0 L220.0 30.3 L221.0 31.4 L222.0 33.4 L223.0 36.3 L224.0 39.9 L225.0 44.3 L226.0 49.3 L227.0 54.8 L228.0 60.8 L229.0 67.2 L230.0 73.7 L231.0 80.4 L232.0 87.1 L233.0 93.6 L234.0 100.0 L235.0 105.9 L236.0 111.4 L237.0 116.3 L238.0 120.6 L239.0 124.1 L240.0 126.9 M240.0 80.0 L241.0 73.3 L242.0 66.8 L243.0 60.4 L244.0 54.5 L245.0 48.9 L246.0 44.0 L247.0 39.7 L248.0 36.1 L249.0 33.3 L250.0 31.3 L251.0 30.2 L252.0 30.0 L253.0 30.7 L254.0 32.3 L255.0 34.8 L256.0 38.0 L257.0 42.0 L258.0 46.7 L259.0 52.0 L260.0 57.8 L261.0 64.0 L262.0 70.4 L263.0 77.1 L264.0 83.8 L265.0 90.4 L266.0 96.8 L267.0 103.0 L268.0 108.7 L269.0 113.9 L270.0 118.5 L271.0 122.4 L272.0 125.6 L273.0 127.9 L274.0 129.4 L275.0 130.0 L276.0 129.7 L277.0 128.5 L278.0 126.4 L279.0 123.5 L280.0 119.8 L281.0 115.4 L282.0 110.4 L283.0 104.8 L284.0 98.8 L285.0 92.4 L286.0 85.9 L287.0 79.2 L288.0 72.5 L289.0 65.9 L290.0 59.7 L291.0 53.7 L292.0 48.3 L293.0 43.4 L294.0 39.2 L295.0 35.7 L296.0 33.0 L297.0 31.1 L298.0 30.2 L299.0 30.1 L300.0 30.9 L301.0 32.6 L302.0 35.1 L303.0 38.5 L304.0 42.6 L305.0 47.3 L306.0 52.7 L307.0 58.5 L308.0 64.7 L309.0 71.2 L310.0 77.9 L311.0 84.6 L312.0 91.2 L313.0 97.6 L314.0 103.7 L315.0 109.4 L316.0 114.5 L317.0 119.1 L318.0 122.9 L319.0 125.9 L320.0 128.2 L321.0 129.5 L322.0 130.0 L323.0 129.6 L324.0 128.3 L325.0 126.1 L326.0 123.1 L327.0 119.3 L328.0 114.8 L329.0 109.7 L330.0 104.1 L331.0 98.0 L332.0 91.6 L333.0 85.0 L334.0 78.3 L335.0 71.7 L336.0 65.1 L337.0 58.9 L338.0 53.0 L339.0 47.6 L340.0 42.8 L341.0 38.7 L342.0 35.3 L343.0 32.7 L344.0 31.0 L345.0 30.1 L346.0 30.1 L347.0 31.0 L348.0 32.9 L349.0 35.5 L350.0 38.9 L351.0 43.1 L352.0 48.0 L353.0 53.4 L354.0 59.3 L355.0 65.5 L356.0 72.1 L357.0 78.7 L358.0 85.4 L359.0 92.0 L360.0 98.4 L361.0 104.5 L362.0 110.1 L363.0 115.1 L364.0 119.6 L365.0 123.3 L366.0 126.3 L367.0 128.4 L368.0 129.6 L369.0 130.0 L370.0 129.5 L371.0 128.0 L372.0 125.8 L373.0 122.7 L374.0 118.8 L375.0 114.2 L376.0 109.0 L377.0 103.4 L378.0 97.2 L379.0 90.8 L380.0 84.2 L381.0 77.5 L382.0 70.8 L383.0 64.4 L384.0 58.1 L385.0 52.3 L386.0 47.0 L387.0 42.3 L388.0 38.2 L389.0 34.9 L390.0 32.4 L391.0 30.8 L392.0 30.1 L393.0 30.2 L394.0 31.2 L395.0 33.1 L396.0 35.9 L397.0 39.4 L398.0 43.7 L399.0 48.6 L400.0 54.1 L401.0 60.0 L402.0 66.4 L403.0 72.9 L404.0 79.6 L405.0 86.3 L406.0 92.8 L407.0 99.2 L408.0 105.2 L409.0 110.7 L410.0 115.7 L411.0 120.1 L412.0 123.7 L413.0 126.6 L414.0 128.6 L415.0 129.7 L416.0 130.0 L417.0 129.3 L418.0 127.8 L419.0 125.4 L420.0 122.2 L421.0 118.3 L422.0 113.6 L423.0 108.4 L424.0 102.6 L425.0 96.4 L426.0 90.0 L427.0 83.3 L428.0 76.7 L429.0 70.0 L430.0 63.6 L431.0 57.4 L432.0 51.6 L433.0 46.4 L434.0 41.7 L435.0 37.8 L436.0 34.6 L437.0 32.2 L438.0 30.7 L439.0 30.0 L440.0 30.3 L441.0 31.4 L442.0 33.4 L443.0 36.3 L444.0 39.9 L445.0 44.3 L446.0 49.3 L447.0 54.8 L448.0 60.8 L449.0 67.2 L450.0 73.7 L451.0 80.4 L452.0 87.1 L453.0 93.6 L454.0 100.0 L455.0 105.9 L456.0 111.4 L457.0 116.3 L458.0 120.6 L459.0 124.1 L460.0 126.9 M460.0 80.0 L461.0 73.3 L462.0 66.8 L463.0 60.4 L464.0 54.5 L465.0 48.9 L466.0 44.0 L467.0 39.7 L468.0 36.1 L469.0 33.3 L470.0 31.3 L471.0 30.2 L472.0 30.0 L473.0 30.7 L474.0 32.3 L475.0 34.8 L476.0 38.0 L477.0 42.0 L478.0 46.7 L479.0 52.0 L480.0 57.8 L481.0 64.0 L482.0 70.4 L483.0 77.1 L484.0 83.8 L485.0 90.4 L486.0 96.8 L487.0 103.0 L488.0 108.7 L489.0 113.9 L490.0 118.5 L491.0 122.4 L492.0 125.6 L493.0 127.9 L494.0 129.4 L495.0 130.0 L496.0 129.7 L497.0 128.5 L498.0 126.4 L499.0 123.5 L500.0 119.8 L501.0 115.4 L502.0 110.4 L503.0 104.8 L504.0 98.8 L505.0 92.4 L506.0 85.9 L507.0 79.2 L508.0 72.5 L509.0 65.9 L510.0 59.7 L511.0 53.7 L512.0 48.3 L513.0 43.4 L514.0 39.2 L515.0 35.7 L516.0 33.0 L517.0 31.1 L518.0 30.2 L519.0 30.1 L520.0 30.9 L521.0 32.6 L522.0 35.1 L523.0 38.5 L524.0 42.6 L525.0 47.3 L526.0 52.7 L527.0 58.5 L528.0 64.7 L529.0 71.2 L530.0 77.9 L531.0 84.6 L532.0 91.2 L533.0 97.6 L534.0 103.7 L535.0 109.4 L536.0 114.5 L537.0 119.1 L538.0 122.9 L539.0 125.9 L540.0 128.2 L541.0 129.5 L542.0 130.0 L543.0 129.6 L544.0 128.3 L545.0 126.1 L546.0 123.1 L547.0 119.3 L548.0 114.8 L549.0 109.7 L550.0 104.1 L551.0 98.0 L552.0 91.6 L553.0 85.0 L554.0 78.3 L555.0 71.7 L556.0 65.1 L557.0 58.9 L558.0 53.0 L559.0 47.6 L560.0 42.8 L561.0 38.7 L562.0 35.3 L563.0 32.7 L564.0 31.0 L565.0 30.1 L566.0 30.1 L567.0 31.0 L568.0 32.9 L569.0 35.5 L570.0 38.9 L571.0 43.1 L572.0 48.0 L573.0 53.4 L574.0 59.3 L575.0 65.5 L576.0 72.1 L577.0 78.7 L578.0 85.4 L579.0 92.0 L580.0 98.4 L581.0 104.5 L582.0 110.1 L583.0 115.1 L584.0 119.6 L585.0 123.3 L586.0 126.3 L587.0 128.4 L588.0 129.6 L589.0 130.0 L590.0 129.5 L591.0 128.0 L592.0 125.8 L593.0 122.7 L594.0 118.8 L595.0 114.2 L596.0 109.0 L597.0 103.4 L598.0 97.2 L599.0 90.8 L600.0 84.2 L601.0 77.5 L602.0 70.8 L603.0 64.4 L604.0 58.1 L605.0 52.3 L606.0 47.0 L607.0 42.3 L608.0 38.2 L609.0 34.9 L610.0 32.4 L611.0 30.8 L612.0 30.1 L613.0 30.2 L614.0 31.2 L615.0 33.1 L616.0 35.9 L617.0 39.4 L618.0 43.7 L619.0 48.6 L620.0 54.1 L621.0 60.0 L622.0 66.4 L623.0 72.9 L624.0 79.6 L625.0 86.3 L626.0 92.8 L627.0 99.2 L628.0 105.2 L629.0 110.7 L630.0 115.7 L631.0 120.1 L632.0 123.7 L633.0 126.6 L634.0 128.6 L635.0 129.7 L636.0 130.0 L637.0 129.3 L638.0 127.8 L639.0 125.4 L640.0 122.2 L641.0 118.3 L642.0 113.6 L643.0 108.4 L644.0 102.6 L645.0 96.4 L646.0 90.0 L647.0 83.3 L648.0 76.7 L649.0 70.0 L650.0 63.6 L651.0 57.4 L652.0 51.6 L653.0 46.4 L654.0 41.7 L655.0 37.8 L656.0 34.6 L657.0 32.2 L658.0 30.7 L659.0 30.0 L660.0 30.3 L661.0 31.4 L662.0 33.4 L663.0 36.3 L664.0 39.9 L665.0 44.3 L666.0 49.3 L667.0 54.8 L668.0 60.8 L669.0 67.2 L670.0 73.7 L671.0 80.4 L672.0 87.1 L673.0 93.6 L674.0 100.0 L675.0 105.9 L676.0 111.4 L677.0 116.3 L678.0 120.6 L679.0 124.1 L680.0 126.9" fill="none" stroke="#087e83" stroke-width="2"/>
  <circle cx="240" cy="80" r="6" fill="none" stroke="#cb4f38" stroke-width="2"/><circle cx="460" cy="80" r="6" fill="none" stroke="#cb4f38" stroke-width="2"/>
  <text style="font: 14px Menlo, monospace; fill: #53656c" x="90" y="150">block 1</text><text style="font: 14px Menlo, monospace; fill: #53656c" x="310" y="150">block 2</text><text style="font: 14px Menlo, monospace; fill: #53656c" x="530" y="150">block 3</text>
</svg>

Every block starts again from `t = 0`. It buzzes.

<NotebookCue section="2" task="Listen with blocksize=512, then 48000." />

---

# A click that repeats is a note

| blocksize | blocks per second | we hear |
|---|---|---|
| 48000 | 1 | a click every second |
| 4000 | 12 | a machine gun |
| 512 | 94 | a low buzz |
| 256 | 188 | the same buzz, an octave up |

- Below about 10 per second we hear events; above about 20, a pitch.
- Bigger blocks do not fix it: they add **latency**. 48000 samples is a second.

<!--
The buzz is periodic with period 512 samples, so it contains only multiples of 93.75 Hz; 440 is not one of them. With 375 Hz the block holds exactly 4 periods, and there is no click.
-->

---

# A callback with a memory

```python
class Sine:
    def __init__(self, f):
        self.f = f
        self.t = 0.0                         # where we are, in seconds

    def callback(self, outdata, frames, time, status):
        t = self.t + np.arange(frames) / SR
        outdata[:, 0] = 0.2 * np.sin(2 * np.pi * self.f * t)
        self.t += frames / SR
```

Memory between calls is **state**, and state calls for an object. `s.callback` is a method: it carries its `s`.

<NotebookCue section="3" task="Play it: no more buzz." />

---

# Time is not enough

```python
for i in range(20):
    s.f += 5 * i
    await asyncio.sleep(0.5)     # clicks at every change
```

- The phase is `2π · f · t`, with `t` growing forever: change `f`, and the whole past changes with it.
- Remember **where we are in the cycle**, the phase, and move it on by `2π · f · frames / SR` each block.

<NotebookCue section="3" task="Change f with both versions and compare." />

<!--
await asyncio.sleep waits without blocking the sound; it works in a local Jupyter and in the browser. time.sleep would stop the browser's audio too.
-->

---
class: dark
---

<div class="chapter"><div class="kicker">Sources</div><h1>Things that<br>give blocks</h1></div>

---

# Two jobs, split

```python
class Sine:
    ...
    def block(self, frames):             # gives back the next samples
        ...
        return 0.2 * np.sin(phases)

def stream_of(source):                   # plays any source
    def callback(outdata, frames, time, status):
        outdata[:, 0] = source.block(frames)
    return sd.OutputStream(samplerate=SR, channels=1,
                           blocksize=512, callback=callback)
```

<NotebookCue section="4" task="out = stream_of(Sine(440)), then change f." />

<!--
callback is a closure: it remembers the source passed to stream_of. Use the parameter's name: with a global such as s inside, every stream plays s, and there is no error.
-->

---

# A source

Anything with `block(frames)` is a **source**: `stream_of` uses nothing else.

```python
class Square:
    ...
    def block(self, frames):
        ...
        return 0.1 * np.sign(np.sin(phases))   # +1 or -1
```

- Not a class, but a family of classes: a **duck type**, as `len` and `[]` in lab 05.
- Python can give it a name: a `Protocol`.
- In SuperCollider and Csound: *unit generators*.

<NotebookCue section="4" task="Play a square, then change its f." />

<!--
class Source(Protocol): def block(self, frames: int) -> np.ndarray: ... It changes nothing in the classes: Sine is a source without inheriting from anything.
A square from np.sign has odd harmonics above half the sample rate: they fold back (aliasing). On low notes it is the sound of old video game chips.
-->

---

# A mixer

```python
class Mixer:
    def __init__(self, sources):
        self.sources = sources

    def block(self, frames):
        out = np.zeros(frames)
        for source in self.sources:
            out += source.block(frames)
        return out
```

A mixer has `block`: it is a source too, made of sources.

<NotebookCue section="5" task="Mix Sine(400) and Sine(500), then make them beat." />

---

# Who asks whom

<svg viewBox="0 0 760 210" width="760" height="210" role="img" aria-label="The sound card asks the callback for samples, the callback asks the mixer, the mixer asks each source; the samples flow back the other way.">
  <defs>
    <marker id="ask" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#cb4f38"/></marker>
    <marker id="give" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#087e83"/></marker>
  </defs>
  <g fill="none" stroke="#53656c" stroke-width="1.5">
    <rect x="10" y="20" width="120" height="44" rx="4"/>
    <rect x="10" y="146" width="120" height="44" rx="4"/>
    <rect x="230" y="83" width="120" height="44" rx="4"/>
    <rect x="440" y="83" width="120" height="44" rx="4"/>
    <rect x="630" y="83" width="120" height="44" rx="4"/>
  </g>
  <text style="font: 15px Menlo, monospace; fill: #1f2b2f" x="52" y="47">Sine</text>
  <text style="font: 15px Menlo, monospace; fill: #1f2b2f" x="48" y="173">Voice</text>
  <text style="font: 15px Menlo, monospace; fill: #1f2b2f" x="268" y="110">Mixer</text>
  <text style="font: 15px Menlo, monospace; fill: #1f2b2f" x="464" y="110">callback</text>
  <text style="font: 15px Menlo, monospace; fill: #1f2b2f" x="645" y="110">sound card</text>
  <g stroke-width="2">
    <path d="M628 96 L562 96" stroke="#cb4f38" marker-end="url(#ask)"/>
    <path d="M438 96 L352 96" stroke="#cb4f38" marker-end="url(#ask)"/>
    <path d="M228 92 L132 50" stroke="#cb4f38" marker-end="url(#ask)"/>
    <path d="M228 102 L132 160" stroke="#cb4f38" marker-end="url(#ask)"/>
    <path d="M562 114 L628 114" stroke="#087e83" marker-end="url(#give)"/>
    <path d="M352 114 L438 114" stroke="#087e83" marker-end="url(#give)"/>
  </g>
  <text style="font: 13px Menlo, monospace; fill: #cb4f38" x="372" y="76">block(frames)</text>
  <text style="font: 13px Menlo, monospace; fill: #087e83" x="372" y="146">samples</text>
  <text style="font: 13px Menlo, monospace; fill: #cb4f38" x="565" y="76">outdata</text>
</svg>

- The sound card asks the callback, the callback asks the mixer, the mixer asks each source.
- The samples go back the other way. Nobody pushes: everyone is asked.

<NotebookCue section="5" task="Change s1.f while it plays." />

<!--
The pull model: the slowest link, the sound card, sets the pace. A mixer can hold a mixer, so the chain can be as deep as we like.
-->

---
class: dark
---

<div class="chapter"><div class="kicker">Voices</div><h1>Clips,<br>live</h1></div>

---

# From a clip to a source

```python
def render_clip(clip, scale, beat_s=0.5):     # clip -> a whole wave
    sounds = [(onset * beat_s, pluck(scale[data].f))
              for onset, data in clip.events]
    return mix_sounds(sounds)
```

- A wave is an array: no `block`, so not a source.
- We need an **adapter**: a wave in, `block(frames)` out.
- We call it a **voice**, as in a sampler.

<NotebookCue section="6" task="Run the tools, then render the call." />

---

# A voice

```python
class Voice:
    def __init__(self, wave):
        self.wave = wave
        self.i = 0                           # how far we have got

    def block(self, frames):
        out = np.zeros(frames)
        # shorter at the end, then empty
        chunk = self.wave[self.i : self.i + frames]
        out[:len(chunk)] = chunk
        self.i += frames
        return out
```

<NotebookCue section="6" task="Play a voice, then set v.i = 0 and change v.wave." />

<!--
A slice past the end is shorter, not an error: np.arange(10) sliced from 8 to 13 gives 8 and 9; sliced from 20 to 25, nothing.
v.i = 0 is a retrigger: it cuts the note that is playing. Two notes at once need two voices, and so a mixer.
-->

---

# Playing into a mixer

```python
m = Mixer([])
out = stream_of(m)
out.start()                                          # silence

m.sources.append(Voice(pluck(Pitch("A4").f)))        # a note, now
```

- The stream runs, the notebook is the controller: each cell is a gesture.
- The notes end, the voices stay: `len(m.sources)` only grows.
- Enough of them, and the callback cannot finish in time: an **underflow**, a crack.

<NotebookCue section="7" task="Add notes, a chord, then look at len(m.sources)." />

<!--
Underflow: the card asked for a block that was not ready, and played silence. The budget is the length of a block, 512 / 48000 s, about 10.7 ms.
-->

---

# A voice that ends

```python
    @property
    def done(self):
        return self.i >= len(self.wave)

    def block(self, frames):                         # in the mixer
        out = np.zeros(frames)
        for source in list(self.sources):        # a copy
            out += source.block(frames)
            if getattr(source, "done", False):   # no done: plays forever
                self.sources.remove(source)
        return out
```

<NotebookCue section="7" task="Add a chord, wait, and look at len(m.sources) again." />

<!--
list(self.sources) is a copy: removing from the list being looped over skips the next element: hence list(self.sources). done is checked after block, so the last piece of the note still plays.
-->

---

# A chiptune arpeggio

```python
# I, vi, IV, V
chords = [[0, 2, 4, 7], [5, 7, 9, 12], [3, 5, 7, 10], [4, 6, 8, 11]]
for chord in chords * 2:
    for _ in range(4):
        for degree in chord:
            sq.f = a_major[degree].f
            await asyncio.sleep(0.06)
```

- One square wave, sixteen notes a second: we hear chords.
- `[0, 2, 4, 7]`: the triad and the root an octave up. Try `[0, 2, 4, 6]`.

<NotebookCue section="8" task="Play it, then change a chord." />

<!--
Old sound chips had three or four voices and played chords this way. The progression is I–vi–IV–V. Each chord is a degree plus 2, 4 and 7.
-->

---

# What we built

| | |
|---|---|
| `callback(outdata, frames, time, status)` | the sound card asks, we fill |
| `self.phase` | where the oscillator is in its cycle |
| a **source** | anything with `block(frames)` |
| `stream_of(source)` | a stream that plays a source |
| `Mixer` | a source made of sources |
| `Voice` | a wave as a source; `done` when it is over |

---

<div class="kicker">An open question</div>

# Who keeps the time?

```python
for _ in range(16):
    v.i = 0
    await asyncio.sleep(0.5)     # Python's clock, not the sound card's
```

- The rhythm wobbles: two clocks, as in lab 05.
- The way out: a **clock** in beats, and **loops** that start voices exactly on time.

<NotebookCue section="7" task="Try a rhythm with sleep: does it stay in time?" />

<!--
sleep lasts a little more than asked, and a change is heard only at the next block. Errors add up. The fix: count beats inside the source, with the sound card as the clock.
-->
