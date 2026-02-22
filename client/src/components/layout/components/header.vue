<template>
  <header class="header">
    <div class="header-left">
      <el-icon class="collapse-btn" @click="emit('toggle-collapse')">
        <Fold v-if="!isCollapsed" />
        <Expand v-else />
      </el-icon>
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item v-if="parentRouteMeta?.title">{{ parentRouteMeta.title }}</el-breadcrumb-item>
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
          @click="emit('toggle-theme')"
          @keydown.enter.prevent="emit('toggle-theme')"
          @keydown.space.prevent="emit('toggle-theme')"
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
import { ArrowDown, Expand, Fold, Moon, Sunny, SwitchButton } from "@element-plus/icons-vue";

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

function handleUserCommand(command: string | number | object): void {
  if (typeof command === "string") {
    emit("user-command", command);
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
