<template>
  <div class="layout-container" :class="{ 'is-collapsed': shell.isCollapsed }">
    <Sidebar />
    <Main />

    <!-- 移动端遮罩 -->
    <div
      v-if="shell.isMobile && !shell.isCollapsed"
      class="mask"
      @click="shell.toggleCollapse"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { provideLayoutShell } from "@/components/layout/hooks/use-layout-shell";
import { watch } from "vue";
import Main from "./components/main.vue";
import Sidebar from "./components/sidebar.vue";

const shell = provideLayoutShell();

// 响应式处理
watch(shell.isMobile, (val) => {
  if (val) {
    shell.collapse();
  }
});
</script>

<style lang="scss" scoped>
.layout-container {
  display: flex;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

// 移动端遮罩
.mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 11;
}
</style>
