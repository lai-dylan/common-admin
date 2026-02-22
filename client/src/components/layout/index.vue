<template>
  <div class="layout-container" :class="{ 'is-collapsed': isCollapsed }">
    <!-- 侧边栏 -->
    <aside class="sidebar" :class="{ 'is-collapsed': isCollapsed }">
      <div class="logo">
        <img src="/favicon.svg" alt="Logo" />
        <span v-show="!isCollapsed" class="title">Admin</span>
      </div>

      <el-menu
        :key="menuKey"
        :default-active="activeMenu"
        :default-openeds="defaultOpeneds"
        :collapse="isCollapsed"
        :collapse-transition="false"
        class="sidebar-menu"
        router
        @select="handleMenuSelect"
      >
        <template v-for="menuRoute in menuRoutes" :key="menuRoute.path">
          <el-menu-item
            v-if="!menuRoute.children || menuRoute.children.length === 1"
            :index="getMenuIndex(menuRoute)"
          >
            <el-icon v-if="menuRoute.meta?.icon">
              <component :is="menuRoute.meta.icon" />
            </el-icon>
            <template #title>{{ menuRoute.meta?.title || "" }}</template>
          </el-menu-item>

          <el-sub-menu v-else :index="getSubMenuIndex(menuRoute)">
            <template #title>
              <el-icon v-if="menuRoute.meta?.icon">
                <component :is="menuRoute.meta.icon" />
              </el-icon>
              <span @click="handleSubMenuTitleClick(menuRoute)">{{
                menuRoute.meta?.title || ""
              }}</span>
            </template>
            <el-menu-item
              v-for="child in menuRoute.children"
              :key="child.path"
              :index="getChildMenuIndex(menuRoute, child)"
            >
              <el-icon v-if="child.meta?.icon">
                <component :is="child.meta.icon" />
              </el-icon>
              <template #title>{{ child.meta?.title || "" }}</template>
            </el-menu-item>
          </el-sub-menu>
        </template>
      </el-menu>
    </aside>

    <!-- 主内容区 -->
    <div class="main-container">
      <!-- 头部 -->
      <header class="header">
        <div class="header-left">
          <el-icon class="collapse-btn" @click="toggleCollapse">
            <Fold v-if="!isCollapsed" />
            <Expand v-else />
          </el-icon>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item v-if="parentRouteMeta?.title">{{
              parentRouteMeta.title
            }}</el-breadcrumb-item>
            <el-breadcrumb-item>{{ currentRouteMeta?.title }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>

        <div class="header-right">
          <el-tooltip :content="isDark ? '切换到浅色主题' : '切换到暗黑主题'" placement="bottom">
            <span
              class="header-icon"
              role="button"
              tabindex="0"
              aria-label="切换主题"
              @click="toggleTheme"
              @keydown.enter.prevent="toggleTheme"
              @keydown.space.prevent="toggleTheme"
            >
              <el-icon>
                <Sunny v-if="isDark" />
                <Moon v-else />
              </el-icon>
            </span>
          </el-tooltip>
          <!-- 用户下拉菜单 -->
          <el-dropdown trigger="click" @command="handleUserCommand">
            <div class="user-info">
              <el-avatar
                :size="32"
                src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png"
              />
              <span class="username">Admin</span>
              <el-icon><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout">
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </header>

      <!-- 页面内容 -->
      <main class="main-content">
        <router-view />
      </main>
    </div>

    <!-- 移动端遮罩 -->
    <div v-if="isMobile && !isCollapsed" class="mask" @click="toggleCollapse"></div>
  </div>
</template>

<script setup lang="ts">
import { useThemeStore } from "@/stores/theme";
import { useUserStore } from "@/stores/user.ts";
import { ArrowDown, Expand, Fold, Moon, Sunny, SwitchButton } from "@element-plus/icons-vue";
import { useWindowSize } from "@vueuse/core";
import { computed, ref, watch } from "vue";
import { type RouteRecordNormalized, type RouteRecordRaw, useRoute, useRouter } from "vue-router";

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

// 获取菜单索引
function getMenuIndex(routeItem: RouteRecordRaw): string {
  if (routeItem.children?.length === 1) {
    return joinPaths(routeItem.path, routeItem.children[0].path);
  }
  return normalizePath(routeItem.path);
}

function getSubMenuIndex(routeItem: RouteRecordRaw): string {
  return normalizePath(routeItem.path);
}

function getChildMenuIndex(parent: RouteRecordRaw, child: RouteRecordRaw): string {
  return joinPaths(parent.path, child.path);
}

function normalizePath(path: string) {
  return path.startsWith("/") ? path : `/${path}`;
}

function joinPaths(parent: string, child: string) {
  const p = normalizePath(parent).replace(/\/+$/, "");
  const c = child.replace(/^\/+/, "");
  return `${p}/${c}`;
}

function getParentNavigatePath(routeItem: RouteRecordRaw): string {
  if (typeof routeItem?.redirect === "string") return routeItem.redirect;
  if (routeItem?.children?.length) return joinPaths(routeItem.path, routeItem.children[0].path);
  return normalizePath(routeItem.path);
}

function handleSubMenuTitleClick(routeItem: RouteRecordRaw) {
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
  height: 100vh;
  overflow: hidden;
}

// 侧边栏
.sidebar {
  width: var(--app-sidebar-width);
  height: 100%;
  background: #304156;
  transition: width var(--app-transition-duration);
  display: flex;
  flex-direction: column;

  &.is-collapsed {
    width: var(--app-sidebar-collapsed-width);
  }

  .logo {
    height: var(--app-header-height);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 0 20px;
    background: #263445;

    img {
      width: 32px;
      height: 32px;
    }

    .title {
      font-size: 18px;
      font-weight: 600;
      color: #fff;
      white-space: nowrap;
    }
  }

  .sidebar-menu {
    flex: 1;
    border-right: none;
    background: transparent;

    :deep(.el-menu-item),
    :deep(.el-sub-menu__title) {
      color: #bfcbd9;

      &:hover {
        background: #263445;
      }
    }

    :deep(.el-menu-item.is-active) {
      color: #409eff;
      background: #1f2d3d;
    }

    :deep(.el-sub-menu.is-active) {
      > .el-sub-menu__title {
        color: #409eff;
      }
    }

    // 二级菜单样式
    :deep(.el-sub-menu) {
      .el-menu {
        background: transparent;
      }

      .el-menu-item {
        background-color: transparent;
        height: 50px;
        line-height: 50px;

        &:hover {
          background-color: #263445;
        }

        &.is-active {
          background-color: #1f2d3d;
          color: #409eff;
        }
      }
    }
  }
}

// 主容器
.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
}

// 头部
.header {
  height: var(--app-header-height);
  background: var(--el-bg-color-overlay);
  box-shadow: var(--app-header-shadow);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  z-index: 10;

  .header-left {
    display: flex;
    align-items: center;
    gap: 16px;

    .collapse-btn {
      font-size: 20px;
      cursor: pointer;
      color: var(--el-text-color-regular);

      &:hover {
        color: var(--el-color-primary);
      }
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 16px;

    .header-icon {
      font-size: 20px;
      cursor: pointer;
      color: var(--el-text-color-regular);
      padding: 8px;

      &:hover {
        color: var(--el-color-primary);
      }
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 4px;

      &:hover {
        background: var(--el-fill-color-light);
      }

      .username {
        font-size: 14px;
        color: var(--el-text-color-regular);
      }
    }
  }
}

// 主内容
.main-content {
  flex: 1;
  overflow: auto;
  background: var(--el-bg-color-page);
  padding: var(--app-page-padding);
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

// 响应式
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    z-index: 100;
    transform: translateX(0);

    &.is-collapsed {
      transform: translateX(-100%);
    }
  }

  .header-right {
    .username {
      display: none;
    }
  }
}
</style>
