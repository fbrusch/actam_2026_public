<script setup lang="ts">
import { computed } from 'vue'
import { sample, type Shape } from '../lib/signals'

const props = withDefaults(defineProps<{
  shape?: Shape
  samples?: number
  cycles?: number
  height?: number
  amplitude?: number
  reference?: boolean
  dots?: boolean
  quantize?: number
  values?: number[]
  rate?: number
  title?: string
}>(), { shape: 'sine', samples: 24, cycles: 2, height: 235, amplitude: 1,
  reference: false, dots: true, quantize: 0, rate: 0,
  title: 'Sample values plotted against their positions' })

const width = 820
const left = 60
const right = 796
const top = 30
const bottom = computed(() => props.height - 49)
const mid = computed(() => (top + bottom.value) / 2)
const y = (v: number) => mid.value - v * (bottom.value - top) / 2
const values = computed(() => props.values ?? Array.from({ length: props.samples }, (_, i) => {
  const v = props.amplitude * sample(props.shape, i * props.cycles / props.samples)
  return props.quantize ? Math.round(v * props.quantize) / props.quantize : v
}))
const count = computed(() => values.value.length)
const x = (i: number) => left + i / Math.max(1, count.value - 1) * (right - left)
const path = computed(() => values.value.map((v, i) => `${i ? 'L' : 'M'}${x(i)},${y(v)}`).join(' '))
const smooth = computed(() => Array.from({ length: 500 }, (_, i) => {
  const index = i / 499 * (count.value - 1)
  return `${i ? 'L' : 'M'}${x(index)},${y(props.amplitude * sample(props.shape, index * props.cycles / count.value))}`
}).join(' '))
const ticks = computed(() => [...new Set([0, Math.round((count.value - 1) / 2), count.value - 1])])
const label = (i: number) => props.rate ? (1000 * i / props.rate).toFixed(2) : String(i)
</script>

<template>
  <svg class="signal-plot" :viewBox="`0 0 ${width} ${height}`" role="img" :aria-label="title">
    <title>{{ title }}</title>
    <text :x="left" y="17">Amplitude</text>
    <g v-for="v in [-1, 0, 1]" :key="v">
      <line :x1="left" :x2="right" :y1="y(v)" :y2="y(v)" :class="v === 0 ? 'axis' : 'guide'" />
      <text x="45" :y="y(v) + 5" text-anchor="end">{{ v }}</text>
    </g>
    <path v-if="reference" :d="smooth" class="reference" />
    <path v-if="!reference" :d="path" class="trace" />
    <g v-if="dots">
      <g v-for="(v, i) in values" :key="i">
        <line :x1="x(i)" :x2="x(i)" :y1="mid" :y2="y(v)" class="stem" />
        <circle :cx="x(i)" :cy="y(v)" :r="count > 80 ? 2 : 4" class="sample" />
      </g>
    </g>
    <g v-for="i in ticks" :key="i">
      <text :x="x(i)" :y="bottom + 23" text-anchor="middle">{{ label(i) }}</text>
    </g>
    <text :x="(left + right) / 2" :y="height - 3" text-anchor="middle">{{ rate ? 'Time (milliseconds)' : 'Sample index' }}</text>
  </svg>
</template>
