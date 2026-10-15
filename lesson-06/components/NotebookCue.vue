<script setup lang="ts">
defineProps<{ section: string; task: string }>()
</script>

<template>
  <div class="notebook-cue"><strong>Notebook · {{ section }}</strong>{{ task }}</div>
</template>
