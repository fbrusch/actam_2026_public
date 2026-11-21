<script setup lang="ts">
import { ref } from 'vue'
const props = withDefaults(defineProps<{ step: number; height?: number; page?: string }>(), { height: 400, page: '' })
// The course site's root, from the slides' base (…/lesson-12/slides/).
const home = import.meta.env.BASE_URL.replace(/(?:lesson-12\/)?slides\/$/, '') || '/'
const src = props.page ? `${home}pysound/${props.page}` : `${home}pysound/lab/?step=${props.step}&embed=1`
const open = ref(false)
</script>

<template>
  <div class="lab-frame" :style="{ height: height + 'px' }">
    <iframe v-if="open" :src="src" allow="autoplay" title="the lab" />
    <button v-else @click="open = true">
      <span>▶ open {{ page ? 'the page' : 'step ' + step + ' of the lab' }} here</span>
      <small>{{ src }}</small>
    </button>
  </div>
</template>
