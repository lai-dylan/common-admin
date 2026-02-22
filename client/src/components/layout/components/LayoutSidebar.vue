<template>
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
      @select="emit('menu-select')"
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
            <span @click="emit('sub-menu-title-click', menuRoute)">{{
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
</template>

<script setup lang="ts">
import type { RouteRecordNormalized, RouteRecordRaw } from "vue-router";

type MenuRoute = RouteRecordRaw | RouteRecordNormalized;

defineProps<{
  isCollapsed: boolean;
  menuKey: string;
  activeMenu: string;
  defaultOpeneds: string[];
  menuRoutes: MenuRoute[];
}>();

const emit = defineEmits<{
  (event: "menu-select"): void;
  (event: "sub-menu-title-click", routeItem: MenuRoute): void;
}>();

function normalizePath(path: string): string {
  return path.startsWith("/") ? path : `/${path}`;
}

function joinPaths(parent: string, child: string): string {
  const p = normalizePath(parent).replace(/\/+$/, "");
  const c = child.replace(/^\/+/, "");
  return `${p}/${c}`;
}

function getMenuIndex(routeItem: MenuRoute): string {
  if (routeItem.children?.length === 1) {
    return joinPaths(routeItem.path, routeItem.children[0].path);
  }
  return normalizePath(routeItem.path);
}

function getSubMenuIndex(routeItem: MenuRoute): string {
  return normalizePath(routeItem.path);
}

function getChildMenuIndex(parent: MenuRoute, child: MenuRoute): string {
  return joinPaths(parent.path, child.path);
}
</script>

<style lang="scss" scoped>
.sidebar {
  width: var(--app-sidebar-width);
  height: 100%;
  background: var(--app-sidebar-bg-color);
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
    background: #123253;

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

@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    z-index: 100;
    transform: translateX(0);
    transition: transform 0.3s ease;

    &.is-collapsed {
      transform: translateX(-100%);
    }
  }
}
</style>
