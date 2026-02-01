<template>
  <div class="profile-page">
    <el-card class="profile-card">
      <template #header>
        <div class="card-header">
          <span>个人信息</span>
        </div>
      </template>

      <el-descriptions :column="1" border>
        <el-descriptions-item label="用户名">
          {{ userStore.userInfo?.username || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="邮箱">
          {{ userStore.userInfo?.email || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="角色">
          {{ userStore.userInfo?.role || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">
          {{ userStore.userInfo?.createdAt || '-' }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
</script>

<style lang="scss" scoped>
.profile-page {
  .profile-card {
    max-width: 600px;
    margin: 0 auto;

    .card-header {
      font-size: 18px;
      font-weight: 600;
    }
  }
}
</style>
