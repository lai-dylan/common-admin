<template>
  <div class="flex gap-2">
    <UiButton type="primary" disabled> 重置 </UiButton>
    <UiButton type="primary" loading> 查询 </UiButton>
    <UiButton type="primary"> 确认 </UiButton>
    <UiButton type="secondary"> 查询 </UiButton>
    <UiButton type="outline"> 重置 </UiButton>
  </div>
</template>
<script setup lang="ts">
import UiButton from "@/components/common/ui/ui-button.vue";
</script>

<style scoped lang="scss"></style>
