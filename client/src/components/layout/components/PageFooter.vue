<template>
  <teleport v-if="isContainerReady" to="#layout-footer">
    <slot />
  </teleport>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";

const isContainerReady = ref(false);

onMounted(() => {
  const container = document.querySelector("#layout-footer");
  isContainerReady.value = !!container;
});

onUnmounted(() => {
  const container = document.querySelector("#layout-footer");
  if (container) {
    container.innerHTML = "";
  }
});
</script>
