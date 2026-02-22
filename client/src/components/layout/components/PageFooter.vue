<template>
  <teleport v-if="isContainerReady" to="#layout-footer">
    <slot v-if="custom" />
    <div v-else class="h-16 w-full bg-white">
      <slot />
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";

withDefaults(
  defineProps<{
    custom?: boolean;
  }>(),
  {
    custom: false,
  },
);

const isContainerReady = ref(false);

onMounted(() => {
  const container = document.querySelector("#layout-footer");
  isContainerReady.value = !!container;
});

onUnmounted(() => {
  const container = document.querySelector("#layout-footer");
  if (container) container.innerHTML = "";
});
</script>

<style scoped></style>
