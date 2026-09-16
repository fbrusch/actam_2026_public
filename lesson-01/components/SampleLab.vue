<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { periodSamples, type Shape } from '../lib/signals'

const n = ref(120)
const rate = ref(48000)
const repeats = ref(400)
const shape = ref<Shape>('sine')
const playing = ref(false)
const error = ref('')
const frequency = computed(() => rate.value / n.value)
const duration = computed(() => n.value * repeats.value / rate.value)
const plot = computed(() => { const p = periodSamples(shape.value, n.value, 0.8); return p.concat(p) })
let context: AudioContext | undefined
let source: AudioBufferSourceNode | undefined
let disposed = false

function stop() {
  if (source) { source.onended = null; source.stop(); source.disconnect(); source = undefined }
  playing.value = false
}

async function play() {
  if (playing.value) { stop(); return }
  error.value = ''
  playing.value = true
  try {
    context ??= new AudioContext()
    await context.resume()
    if (disposed || !playing.value) return
    const samples = periodSamples(shape.value, n.value, 0.12)
    const length = n.value * repeats.value
    const buffer = context.createBuffer(1, length, rate.value)
    const channel = buffer.getChannelData(0)
    const fade = Math.min(Math.round(rate.value * 0.008), Math.floor(length / 2))
    for (let i = 0; i < length; i++) {
      const envelope = Math.min(1, i / fade, (length - 1 - i) / fade)
      channel[i] = samples[i % samples.length] * envelope
    }
    source = context.createBufferSource()
    source.buffer = buffer
    source.connect(context.destination)
    source.onended = () => { source?.disconnect(); source = undefined; playing.value = false }
    source.start()
  } catch {
    stop()
    error.value = 'Audio is unavailable here. The graph and calculations still work.'
  }
}

onBeforeUnmount(() => { disposed = true; stop(); void context?.close() })
</script>

<template>
  <div>
    <div class="lab-controls">
      <label>Waveform <select v-model="shape" aria-label="Waveform" @change="stop"><option value="sine">Sine</option><option value="square">Square</option><option value="saw">Sawtooth</option><option value="triangle">Triangle</option></select></label>
      <label>Sample rate <select v-model.number="rate" aria-label="Sample rate" @change="stop"><option :value="48000">48,000 Hz</option><option :value="24000">24,000 Hz</option></select></label>
      <button type="button" :aria-pressed="playing" @click="play">{{ playing ? 'Stop' : 'Play sound' }}</button>
    </div>
    <div class="lab-controls">
      <label>Period <input v-model.number="n" aria-label="Samples per period" type="range" min="40" max="600" step="2" @input="stop" />{{ n }} samples</label>
      <label>Repeats <input v-model.number="repeats" aria-label="Number of repetitions" type="range" min="40" max="400" step="20" @input="stop" />{{ repeats }}</label>
    </div>
    <WavePlot :values="plot" :height="160" :dots="false" :rate="rate" title="Two periods of the selected waveform, plotted against time" />
    <div class="lab-readout" aria-live="polite">f = {{ frequency.toFixed(1) }} Hz · duration = {{ duration.toFixed(2) }} s</div>
    <div class="small">Two periods shown. Playback uses all repeats, low gain and short fades.</div>
    <div v-if="error" class="lab-error" role="alert">{{ error }}</div>
  </div>
</template>
