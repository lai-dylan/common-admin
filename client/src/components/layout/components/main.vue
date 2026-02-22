<template>
  <div class="main-container">
    <Header />
    <Content />
    <!--    子页面可以使用PageFooter将内容teleport到此节点-->
    <footer id="layout-footer" />
  </div>
</template>

<script setup lang="ts">
import Content from "./content.vue";
import Header from "./header.vue";
</script>

<style lang="scss" scoped>
.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
}
</style>
