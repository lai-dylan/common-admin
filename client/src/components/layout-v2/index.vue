<template>
  <div class="layout-container">
    <Sidebar />
    <Main />
  </div>
</template>

<script setup lang="ts">
import Main from "./components/main.vue";
import Sidebar from "./components/sidebar.vue";
</script>

<style lang="scss" scoped>
.layout-container {
  display: flex;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}
</style>
