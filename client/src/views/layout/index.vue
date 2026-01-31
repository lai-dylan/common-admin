<template>
  <div class="layout-container" :class="{ 'is-collapsed': isCollapsed }">
    <!-- 侧边栏 -->
    <aside class="sidebar" :class="{ 'is-collapsed': isCollapsed }">
      <div class="logo">
        <img src="/favicon.svg" alt="Logo" />
        <span v-show="!isCollapsed" class="title">Admin</span>
      </div>

      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapsed"
        :collapse-transition="false"
        class="sidebar-menu"
        router
        @select="handleMenuSelect"
      >
        <template v-for="route in menuRoutes" :key="route.path">
          <el-menu-item
            v-if="!route.children || route.children.length === 1"
            :index="getMenuIndex(route)"
          >
            <el-icon v-if="route.meta?.icon">
              <component :is="route.meta.icon" />
            </el-icon>
            <template #title>{{ $t(route.meta?.title || '') }}</template>
          </el-menu-item>

          <el-sub-menu
            v-else
            :index="route.path"
          >
            <template #title>
              <el-icon v-if="route.meta?.icon">
                <component :is="route.meta.icon" />
              </el-icon>
              <span>{{ $t(route.meta?.title || '') }}</span>
            </template>
            <el-menu-item
              v-for="child in route.children"
              :key="child.path"
              :index="`${route.path}/${child.path}`"
            >
              <el-icon v-if="child.meta?.icon">
                <component :is="child.meta.icon" />
              </el-icon>
              <template #title>{{ $t(child.meta?.title || '') }}</template>
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
            <el-breadcrumb-item>{{ currentRouteMeta?.title }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>

        <div class="header-right">
          <!-- 语言切换 -->
          <el-dropdown trigger="click" @command="handleLanguageChange">
            <div class="header-icon">
              <el-icon><Language /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="zh" :disabled="currentLang === 'zh'">
                  中文
                </el-dropdown-item>
                <el-dropdown-item command="en" :disabled="currentLang === 'en'">
                  English
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>

          <!-- 用户下拉菜单 -->
          <el-dropdown trigger="click" @command="handleUserCommand">
            <div class="user-info">
              <el-avatar :size="32" src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png" />
              <span class="username">Admin</span>
              <el-icon><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <el-icon><User /></el-icon>
                  {{ $t('layout.personalInfo') }}
                </el-dropdown-item>
                <el-dropdown-item divided command="logout">
                  <el-icon><SwitchButton /></el-icon>
                  {{ $t('layout.logout') }}
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
    <div v-if="isMobile && !isCollapsed" class="mask" @click="toggleCollapse" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18next'
import { useUserStore } from '@/stores/user'
import { changeLanguage, getCurrentLanguage } from '@/locales'
import { useWindowSize } from '@vueuse/core'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const userStore = useUserStore()

const { width } = useWindowSize()
const isMobile = computed(() => width.value < 768)
const isCollapsed = ref(false)

// 菜单路由
const menuRoutes = computed(() => {
  const layouts = router.getRoutes().find(r => r.name === 'Layout')
  return layouts?.children?.filter(c => c.meta?.title) || []
})

// 当前激活菜单
const activeMenu = computed(() => route.path)

// 当前路由元信息
const currentRouteMeta = computed(() => route.meta)

// 当前语言
const currentLang = computed(() => getCurrentLanguage())

// 切换侧边栏
function toggleCollapse() {
  isCollapsed.value = !isCollapsed.value
}

// 获取菜单索引
function getMenuIndex(routeItem: any) {
  if (routeItem.children?.length === 1) {
    return `/${routeItem.path}/${routeItem.children[0].path}`
  }
  return `/${routeItem.path}`
}

// 处理菜单选择
function handleMenuSelect() {
  if (isMobile.value) {
    isCollapsed.value = true
  }
}

// 切换语言
function handleLanguageChange(lang: string) {
  changeLanguage(lang)
  window.location.reload()
}

// 处理用户命令
function handleUserCommand(command: string) {
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'logout':
      userStore.logout()
      router.push('/login')
      break
  }
}

// 响应式处理
watch(isMobile, (val) => {
  if (val) {
    isCollapsed.value = true
  }
})
</script>

<style lang="scss" scoped>
.layout-container {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

// 侧边栏
.sidebar {
  width: $sidebar-width;
  height: 100%;
  background: #304156;
  transition: width 0.3s;
  display: flex;
  flex-direction: column;

  &.is-collapsed {
    width: $sidebar-collapsed-width;
  }

  .logo {
    height: $header-height;
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
  height: $header-height;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
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
      color: #606266;

      &:hover {
        color: #409eff;
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
      color: #606266;
      padding: 8px;

      &:hover {
        color: #409eff;
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
        background: #f5f7fa;
      }

      .username {
        font-size: 14px;
        color: #606266;
      }
    }
  }
}

// 主内容
.main-content {
  flex: 1;
  overflow: auto;
  background: $bg-color-base;
  padding: $page-padding;
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
