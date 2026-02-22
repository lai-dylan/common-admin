<template>
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
</template>

<script setup lang="ts">
import { useLayoutShell } from "@/components/layout/hooks/use-layout-shell";
import { useThemeStore } from "@/stores/theme";
import { useUserStore } from "@/stores/user";
import { ArrowDown, Expand, Fold, Moon, Sunny, SwitchButton } from "@element-plus/icons-vue";
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";

type RouteMetaLike = {
  title?: string;
};

const { isCollapsed, toggleCollapse } = useLayoutShell();

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const themeStore = useThemeStore();

const isDark = computed(() => themeStore.theme === "dark");
const currentRouteMeta = computed(() => route.meta as RouteMetaLike);

const parentRouteMeta = computed(() => {
  const layoutRoute = router.getRoutes().find((record) => record.name === "Layout");
  const parentPath = "/" + route.path.split("/").filter(Boolean).slice(0, -1).join("/");
  return layoutRoute?.children?.find((child) => child.path === parentPath.slice(1))?.meta as
    | RouteMetaLike
    | undefined;
});

function toggleTheme() {
  themeStore.toggleTheme();
}

function handleUserCommand(command: string | number | object): void {
  if (typeof command === "string") {
    if (command === "logout") {
      userStore.logout();
      void router.push("/login");
    }
  }
}
</script>

<style lang="scss" scoped>
.header {
  height: var(--app-header-height);
  background: var(--app-header-bg-color);
  box-shadow: var(--app-header-shadow);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--app-header-padding);
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

@media (max-width: 768px) {
  .header-right {
    .username {
      display: none;
    }
  }
}
</style>
