<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-header">
        <img src="/favicon.svg" alt="Logo" class="logo" />
        <h1 class="title">Common Admin</h1>
      </div>
      <el-card class="login-card" shadow="hover">
        <h2 class="login-title">欢迎登录</h2>
        <el-form :model="form" size="large" @keyup.enter="onSubmit">
          <el-form-item>
            <el-input v-model="form.username" placeholder="请输入用户名" :prefix-icon="User" />
          </el-form-item>
          <el-form-item>
            <el-input
              v-model="form.password"
              type="password"
              placeholder="请输入密码"
              :prefix-icon="Lock"
              show-password
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :loading="loading" class="login-button" @click="onSubmit">
              登录
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { Lock, User } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const userStore = useUserStore();
const loading = ref(false);
const form = reactive({ username: "admin", password: "123456" });

async function onSubmit() {
  if (loading.value) return;
  loading.value = true;
  try {
    await userStore.login(form);
    ElMessage.success("登录成功");
    await router.push("/");
  } catch (_error) {
    ElMessage.error("登录失败");
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped lang="scss">
.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f0f2f5;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25' viewBox='0 0 1600 800'%3E%3Cg stroke='%23409EFF' stroke-width='66.7' stroke-opacity='0.05' %3E%3Ccircle fill='%23F0F2F5' cx='0' cy='0' r='1800'/%3E%3Ccircle fill='%23eff1f4' cx='0' cy='0' r='1700'/%3E%3Ccircle fill='%23eef0f4' cx='0' cy='0' r='1600'/%3E%3Ccircle fill='%23edeff3' cx='0' cy='0' r='1500'/%3E%3Ccircle fill='%23eceef2' cx='0' cy='0' r='1400'/%3E%3Ccircle fill='%23ebedf1' cx='0' cy='0' r='1300'/%3E%3Ccircle fill='%23eaecf0' cx='0' cy='0' r='1200'/%3E%3Ccircle fill='%23e9ebef' cx='0' cy='0' r='1100'/%3E%3Ccircle fill='%23e8eaee' cx='0' cy='0' r='1000'/%3E%3Ccircle fill='%23e7e9ed' cx='0' cy='0' r='900'/%3E%3Ccircle fill='%23e6e8ec' cx='0' cy='0' r='800'/%3E%3Ccircle fill='%23e5e7eb' cx='0' cy='0' r='700'/%3E%3Ccircle fill='%23e4e6ea' cx='0' cy='0' r='600'/%3E%3Ccircle fill='%23e3e5e9' cx='0' cy='0' r='500'/%3E%3Ccircle fill='%23e2e4e8' cx='0' cy='0' r='400'/%3E%3Ccircle fill='%23e1e3e7' cx='0' cy='0' r='300'/%3E%3Ccircle fill='%23e0e2e6' cx='0' cy='0' r='200'/%3E%3Ccircle fill='%23dfe1e5' cx='0' cy='0' r='100'/%3E%3C/g%3E%3C/svg%3E");
  background-size: cover;
}

.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: fade-in 0.5s ease-in-out;
}

.login-header {
  display: flex;
  align-items: center;
  margin-bottom: 40px;

  .logo {
    width: 48px;
    height: 48px;
    margin-right: 16px;
  }

  .title {
    font-size: 32px;
    font-weight: 600;
    color: #333;
    margin: 0;
  }
}

.login-card {
  width: 420px;
  border-radius: 8px;
  border: none;

  :deep(.el-card__body) {
    padding: 40px;
  }
}

.login-title {
  text-align: center;
  margin: 0 0 30px;
  font-size: 24px;
  color: #303133;
  font-weight: 500;
}

.login-button {
  width: 100%;
  font-size: 16px;
  letter-spacing: 2px;
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
