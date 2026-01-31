<template>
  <div class="error-page">
    <div class="error-content">
      <h1>404</h1>
      <p>{{ $t('error.description') }}</p>
      <el-button type="primary" @click="goHome">{{ $t('error.backHome') }}</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function goHome() {
  router.push('/')
}
</script>

<style lang="scss" scoped>
.error-page {
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

  .error-content {
    text-align: center;
    color: #fff;

    h1 {
      font-size: 120px;
      font-weight: 700;
      margin: 0;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
    }

    p {
      font-size: 18px;
      margin: 20px 0 40px;
      opacity: 0.9;
    }
  }
}
</style>
