<template>
  <div class="main-container">
    <Header></Header>
    <Content></Content>
  </div>
</template>

<script setup lang="ts">
import Content from "./content.vue";
import Header from "./header.vue";
</script>

<style scoped lang="scss">
.main-container {
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow: hidden;
}
</style>
