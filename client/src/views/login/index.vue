<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <img src="/favicon.svg" alt="Logo" class="logo" />
        <h1>通用后台管理系统</h1>
      </div>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        class="login-form"
        @keyup.enter="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="form.username"
            placeholder="请输入用户名"
            prefix-icon="User"
            size="large"
            clearable
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="form.password"
            placeholder="请输入密码"
            prefix-icon="Lock"
            type="password"
            size="large"
            show-password
          />
        </el-form-item>

        <el-form-item>
          <div class="login-options">
            <el-checkbox v-model="form.remember">
              记住密码
            </el-checkbox>
            <el-link type="primary">忘记密码？</el-link>
          </div>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            class="login-btn"
            :loading="loading"
            @click.prevent="handleLogin"
          >
            {{ loading ? '登录中...' : '登录' }}
          </el-button>
        </el-form-item>
      </el-form>

      <div class="login-footer">
        <span>演示账号: admin / 123456</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const formRef = ref<FormInstance>()
const loading = ref(false)

const form = reactive({
  username: '',
  password: '',
  remember: false,
})

const rules: FormRules = {
  username: [
    { required: true, message: '用户名不能为空', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '密码不能为空', trigger: 'blur' },
  ],
}

async function handleLogin() {
  if (!formRef.value) return

  // 添加阻止事件冒泡
  const isValid = await formRef.value.validate().catch(() => false)
  if (!isValid) return

  loading.value = true

  try {
    const result = await userStore.login({
      username: form.username,
      password: form.password
    })
    if (result.success) {
      ElMessage.success('登录成功')
      await router.push("/")
    } else {
      // 明确显示错误消息
      ElMessage.error(result.message || '用户名或密码错误')
    }
  } catch (error: any) {
    // 捕获未处理的错误
    console.error('Login error:', error)
    ElMessage.error(error.message || '网络错误，请稍后重试')
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.login-container {
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-box {
  width: 400px;
  padding: 40px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;

  .logo {
    width: 60px;
    height: 60px;
    margin-bottom: 10px;
  }

  h1 {
    font-size: 24px;
    font-weight: 600;
    color: #333;
  }
}

.login-form {
  .login-options {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .login-btn {
    width: 100%;
  }
}

.login-footer {
  text-align: center;
  margin-top: 20px;
  font-size: 12px;
  color: #999;
}

// 响应式
@media (max-width: 480px) {
  .login-box {
    width: 90%;
    padding: 30px 20px;
  }
}
</style>
