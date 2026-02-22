<template>
  <main class="main-content">
    <router-view />
  </main>
</template>

<style lang="scss" scoped>
.main-content {
  flex: 1;
  overflow: auto;
  background: var(--el-bg-color-page);
  padding: var(--app-page-padding);
}
</style>
