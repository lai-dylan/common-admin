<template>
  <div class="main-container">
    <Header
      :is-collapsed="isCollapsed"
      :is-dark="isDark"
      :current-route-meta="currentRouteMeta"
      :parent-route-meta="parentRouteMeta"
      @toggle-collapse="emit('toggle-collapse')"
      @toggle-theme="emit('toggle-theme')"
      @user-command="emit('user-command', $event)"
    />
    <Content />
    <Footer />
  </div>
</template>

<script setup lang="ts">
import Content from "./content.vue";
import Footer from "./footer.vue";
import Header from "./header.vue";

interface RouteMetaLike {
  title?: string;
}

defineProps<{
  isCollapsed: boolean;
  isDark: boolean;
  currentRouteMeta?: RouteMetaLike;
  parentRouteMeta?: RouteMetaLike;
}>();

const emit = defineEmits<{
  (event: "toggle-collapse"): void;
  (event: "toggle-theme"): void;
  (event: "user-command", command: string): void;
}>();
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
