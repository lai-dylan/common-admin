<template>
  <div class="layout-container" :class="{ 'is-collapsed': isCollapsed }">
    <LayoutSidebar
      :is-collapsed="isCollapsed"
      :menu-key="menuKey"
      :active-menu="activeMenu"
      :default-openeds="defaultOpeneds"
      :menu-routes="menuRoutes"
      @menu-select="handleMenuSelect"
      @sub-menu-title-click="handleSubMenuTitleClick"
    />

    <LayoutMain
      :is-collapsed="isCollapsed"
      :is-dark="isDark"
      :current-route-meta="currentRouteMeta"
      :parent-route-meta="parentRouteMeta"
      @toggle-collapse="toggleCollapse"
      @toggle-theme="toggleTheme"
      @user-command="handleUserCommand"
    />

    <!-- 移动端遮罩 -->
    <div v-if="isMobile && !isCollapsed" class="mask" @click="toggleCollapse"></div>
  </div>
</template>

<script setup lang="ts">
import { useThemeStore } from "@/stores/theme";
import { useUserStore } from "@/stores/user.ts";
import { useWindowSize } from "@vueuse/core";
import { computed, ref, watch } from "vue";
import { type RouteRecordNormalized, type RouteRecordRaw, useRoute, useRouter } from "vue-router";
import LayoutMain from "./components/LayoutMain.vue";
import LayoutSidebar from "./components/LayoutSidebar.vue";

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const themeStore = useThemeStore();

const { width } = useWindowSize();
const isMobile = computed(() => width.value < 768);
const isCollapsed = ref(false);
const isDark = computed(() => themeStore.theme === "dark");

function getLayoutRoute(): RouteRecordNormalized | undefined {
  return router.getRoutes().find((record) => record.name === "Layout");
}

// 菜单路由
const menuRoutes = computed(() => {
  const layoutRoute = getLayoutRoute();
  return layoutRoute?.children?.filter((child) => Boolean(child.meta?.title)) ?? [];
});

// 当前激活菜单
const activeMenu = computed(() => route.path);

// 始终展开有二级菜单的父级菜单
const defaultOpeneds = computed(() => {
  const layoutRoute = getLayoutRoute();
  const openedMenus: string[] = [];

  // 找出所有有 children 的路由并展开
  layoutRoute?.children?.forEach((child) => {
    if (child.children && child.children.length > 0) {
      openedMenus.push("/" + child.path);
    }
  });

  return openedMenus;
});

const menuKey = computed(() => defaultOpeneds.value.join("|") || "root");

// 当前路由元信息
const currentRouteMeta = computed(() => route.meta);

// 父级路由元信息（用于面包屑）
const parentRouteMeta = computed(() => {
  const layoutRoute = getLayoutRoute();
  const parentPath = "/" + route.path.split("/").filter(Boolean).slice(0, -1).join("/");
  return layoutRoute?.children?.find((child) => child.path === parentPath.slice(1))?.meta;
});

// 切换侧边栏
function toggleCollapse() {
  isCollapsed.value = !isCollapsed.value;
}

function toggleTheme() {
  themeStore.toggleTheme();
}

function normalizePath(path: string) {
  return path.startsWith("/") ? path : `/${path}`;
}

function joinPaths(parent: string, child: string) {
  const p = normalizePath(parent).replace(/\/+$/, "");
  const c = child.replace(/^\/+/, "");
  return `${p}/${c}`;
}

function getParentNavigatePath(routeItem: RouteRecordRaw | RouteRecordNormalized): string {
  if (typeof routeItem?.redirect === "string") return routeItem.redirect;
  if (routeItem?.children?.length) return joinPaths(routeItem.path, routeItem.children[0].path);
  return normalizePath(routeItem.path);
}

function handleSubMenuTitleClick(routeItem: RouteRecordRaw | RouteRecordNormalized) {
  const target = getParentNavigatePath(routeItem);
  if (route.path !== target) void router.push(target);
}

// 处理菜单选择
function handleMenuSelect() {
  if (isMobile.value) {
    isCollapsed.value = true;
  }
}

// 处理用户命令
function handleUserCommand(command: string) {
  switch (command) {
    case "logout":
      userStore.logout();
      void router.push("/login");
      break;
  }
}

// 响应式处理
watch(isMobile, (val) => {
  if (val) {
    isCollapsed.value = true;
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
  z-index: 9;
}
</style>
