import { createApp } from 'vue'
import { createPinia } from 'pinia'
import i18next from 'i18next'
import VueI18Next from 'vue-i18next'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import App from './App.vue'
import router from './router'
import { initI18n } from './locales'
import { setupErrorHandler } from './utils/errorHandler'

// 全局样式
import './styles/index.scss'

// 创建应用
const app = createApp(App)

// Pinia状态管理
const pinia = createPinia()
app.use(pinia)

// 路由
app.use(router)

// Element Plus
app.use(ElementPlus)

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// i18n国际化
const i18n = initI18n()
app.use(VueI18Next, { i18n })

// 全局错误处理
setupErrorHandler(app)

// 挂载应用
app.mount('#app')
