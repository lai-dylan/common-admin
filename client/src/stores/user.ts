import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, LoginParams } from '@/types'
import { login as loginApi } from '@/api/auth'
import { changeLanguage } from '@/locales'

export const useUserStore = defineStore('user', () => {
  // 状态
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref<User | null>(null)
  const language = ref(localStorage.getItem('language') || 'zh')

  // 计算属性
  const isLoggedIn = computed(() => !!token.value)
  const userRole = computed(() => userInfo.value?.role || '')

  // 方法
  async function login(params: LoginParams) {
    try {
      const res = await loginApi(params)
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

  function setLanguage(lang: string) {
    language.value = lang
    changeLanguage(lang)
  }

  function initUser() {
    if (token.value && !userInfo.value) {
      // 可以在这里调用获取用户信息的接口
    }
  }

  return {
    token,
    userInfo,
    language,
    isLoggedIn,
    userRole,
    login,
    logout,
    setLanguage,
    initUser,
  }
})
