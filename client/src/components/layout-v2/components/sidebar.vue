<template>
  <aside class="sidebar-container">
    <div class="sidebar-logo">
      <img :src="Logo" alt="" width="50" />
    </div>

    <el-menu
      :default-active="activeIndex"
      :default-openeds="defaultOpeneds"
      class="ui-menu"
      @select="handleSelect"
    >
      <template v-for="group in menuData" :key="group.key">
        <el-sub-menu v-if="group.children?.length" :index="group.key">
          <template #title>
            <img :src="User" alt="" width="20" />
            <span>{{ group.title }}</span>
          </template>

          <el-menu-item
            v-for="child in group.children"
            :key="`${group.key}-${child.key}`"
            :index="`${group.key}/${child.key}`"
          >
            {{ child.title }}
          </el-menu-item>
        </el-sub-menu>
      </template>
    </el-menu>
  </aside>
</template>

<script setup lang="ts">
import { ref } from "vue";
import Logo from "../assets/logo.svg";
import User from "../assets/user.svg";

type MenuChild = {
  key: string;
  title: string;
};

type MenuGroup = {
  key: string;
  title: string;
  icon: "chat" | "user" | "game" | "command" | "report" | "setting";
  children?: MenuChild[];
};

const menuData: MenuGroup[] = [
  {
    key: "chat-room",
    title: "聊天室管理",
    icon: "chat",
    children: [
      { key: "group", title: "群管理" },
      { key: "message", title: "消息管理" },
      { key: "members", title: "群组/白名单" },
    ],
  },
  // { key: "user", title: "用户管理", icon: "user" },
  // { key: "game", title: "游戏管理", icon: "game" },
  // { key: "command", title: "指令配置", icon: "command" },
  {
    key: "report",
    title: "报表查询",
    icon: "report",
    children: [
      { key: "register", title: "注册记录" },
      { key: "sleep", title: "睡单记录" },
    ],
  },
  {
    key: "setting",
    title: "系统设置",
    icon: "setting",
    children: [
      { key: "account", title: "账号管理" },
      { key: "role", title: "角色管理" },
      { key: "menu", title: "菜单管理" },
      { key: "log", title: "系统日志" },
      { key: "log2", title: "系统日志" },
      { key: "log3", title: "系统日志" },
      { key: "log4", title: "系统日志" },
    ],
  },
];

const activeIndex = ref("chat-room/group");
const defaultOpeneds = ["chat-room", "report"];
// const defaultOpeneds = ["chat-room", "report", "setting"];

function handleSelect(index: string) {
  activeIndex.value = index;
}
</script>

<style lang="scss" scoped>
.sidebar-container {
  width: var(--ui-sidebar-width);
  height: 100vh;
  overflow-y: auto;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-logo {
  padding-top: 47px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ui-menu {
  border-right: none;
  font-size: 13px;
  padding: 0 16px;
  background-color: transparent;

  :deep(.el-sub-menu:first-child .el-sub-menu__title) {
    margin-top: 0;
  }

  :deep(.el-sub-menu__title) {
    margin-top: 8px;
    height: 36px;
    border-radius: 8px;
    padding-left: 10px !important;
    gap: 10px;

    &:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #fff;
    }
  }

  :deep(.el-menu) {
    background-color: transparent;
  }

  :deep(.el-menu-item) {
    color: #666;
    height: 36px;
    margin-top: 8px;
    border-radius: 8px;

    &:hover,
    &.is-active {
      background: rgba(255, 255, 255, 0.1);
      color: #fff;
    }

    img {
      margin-right: 4px;
    }
  }

  :deep(.el-sub-menu .el-sub-menu__icon-arrow) {
    right: 9px;

    svg {
      width: 14px;
      height: 14px;
    }
  }
}
</style>
