<script setup>
const homeHref = import.meta.env.BASE_URL.replace(/(?:lesson-04\/)?slides\/$/, '') || '/'
</script>

<template>
  <a class="course-home" :href="homeHref" aria-label="Return to the ACTAM course home">ACTAM home</a>
</template>
