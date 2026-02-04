import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as loginApi } from '@/api/auth'
// import { changeLanguage } from '@/locales'

export const useUserStore = defineStore('user', () => {
  // 状态
  const token = ref(localStorage.getItem('token') || '')
  const userInfo: any = ref(null)
  const language = ref(localStorage.getItem('language') || 'zh')

  // 计算属性
  const isLoggedIn = computed(() => !!token.value)
  const userRole = computed(() => userInfo.value?.role || '')

  // 方法
  async function login(params: any) {
    try {
      const res: any = await loginApi(params)
      token.value = res.data.token
      userInfo.value = res.data.user
      localStorage.setItem('token', res.data.token)
      return { success: true }
    } catch (error: any) {
      return { success: false, message: error.message || '登录失败' }
    }
  }

  function logout() {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('token')
  }

  return {
    token,
    userInfo,
    language,
    isLoggedIn,
    userRole,
    login,
    logout,
  }
})
