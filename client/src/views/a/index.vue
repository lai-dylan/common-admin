<template>
  <div class="flex gap-2">
    <UiButton type="primary" disabled> 重置 </UiButton>
    <UiButton type="primary">
      <template #icon-left>
        <el-icon><Plus /></el-icon> </template
      >查询
    </UiButton>
    <UiButton type="primary"> 确认 </UiButton>
    <UiButton type="secondary" class="bg-red-500!"> 查询 </UiButton>
    <UiButton type="outline"> 重置 </UiButton>
  </div>
</template>
<script setup lang="ts">
import UiButton from "@/components/common/ui/ui-button.vue";
import { Plus } from "@element-plus/icons-vue";
</script>

<style scoped lang="scss"></style>
