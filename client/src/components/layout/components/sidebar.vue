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
</template>

<script setup lang="ts">
import { useLayoutShell } from "@/components/layout/hooks/use-layout-shell";
import { computed } from "vue";
import type { RouteRecordNormalized, RouteRecordRaw } from "vue-router";
import { useRoute, useRouter } from "vue-router";

type MenuRoute = RouteRecordRaw | RouteRecordNormalized;

const { isCollapsed, collapseOnMobile } = useLayoutShell();
const route = useRoute();
const router = useRouter();

function getLayoutRoute(): RouteRecordNormalized | undefined {
  return router.getRoutes().find((record) => record.name === "Layout");
}

const menuRoutes = computed(() => {
  const layoutRoute = getLayoutRoute();
  return layoutRoute?.children?.filter((child) => Boolean(child.meta?.title)) ?? [];
});

const activeMenu = computed(() => route.path);

const defaultOpeneds = computed(() => {
  const layoutRoute = getLayoutRoute();
  const openedMenus: string[] = [];
  layoutRoute?.children?.forEach((child) => {
    if (child.children && child.children.length > 0) {
      openedMenus.push("/" + child.path);
    }
  });
  return openedMenus;
});

const menuKey = computed(() => defaultOpeneds.value.join("|") || "root");

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

function getParentNavigatePath(routeItem: MenuRoute): string {
  if (typeof routeItem?.redirect === "string") return routeItem.redirect;
  if (routeItem?.children?.length) return joinPaths(routeItem.path, routeItem.children[0].path);
  return normalizePath(routeItem.path);
}

function handleMenuSelect() {
  collapseOnMobile();
}

function handleSubMenuTitleClick(routeItem: MenuRoute) {
  const target = getParentNavigatePath(routeItem);
  if (route.path !== target) void router.push(target);
}
</script>

<style lang="scss" scoped>
.sidebar {
  width: var(--app-sidebar-width);
  height: 100%;
  background: var(--app-sidebar-bg-color);
  transition: all var(--app-transition-duration) ease;
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
      background: #374350;
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

@media (max-width: 640px) {
  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    z-index: 100;
    transform: translateX(0);
    transition: transform var(--app-transition-duration) ease;

    &.is-collapsed {
      transform: translateX(-100%);
    }
  }
}
</style>
