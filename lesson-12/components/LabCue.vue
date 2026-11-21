<script setup lang="ts">
const props = defineProps<{ step?: number; page?: string; label?: string; task: string }>()
const home = import.meta.env.BASE_URL.replace(/(?:lesson-12\/)?slides\/$/, '') || '/'
const href = props.page ? `${home}pysound/${props.page}` : `${home}pysound/lab/?step=${props.step}`
</script>

<template>
  <div class="notebook-cue"><a :href="href" target="_blank"><strong>{{ label ?? `Lab · ${step}` }}</strong></a>{{ task }}</div>
</template>
