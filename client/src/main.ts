import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import App from './App.vue'
import router from './router'
// import {setupErrorHandler, VueApp} from "./utils/errorHandler";

// 全局样式
import './styles/tailwind.css'
import './styles/index.scss'

// 创建应用
const app = createApp(App)

// Pinia状态管理
import { createPinia } from 'pinia'
import { useThemeStore } from '@/stores/theme'
const pinia = createPinia()
app.use(pinia)
useThemeStore(pinia).initTheme()

// 路由
app.use(router)

// Element Plus
app.use(ElementPlus)

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 全局错误处理
// setupErrorHandler(app as VueApp)

// 挂载应用
app.mount('#app')
