<template>
  <header class="header-container">
    <div class="header-title">IM聊天后台管理</div>

    <div class="header-actions cursor-pointer text-xs">toggle</div>
  </header>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss">
.header-container {
  width: 100%;
  height: 70px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 20px 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-title {
  color: #fff;
  font-size: 16px;
  line-height: 22px;
}

.header-actions {
  display: flex;
  align-items: flex-end;
}
</style>
