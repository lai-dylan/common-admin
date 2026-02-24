<template>
  <div class="content-container">
    <router-view></router-view>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss">
.content-container {
  width: 100%;
  flex: 1;
  padding: var(--ui-content-padding);
}
</style>
