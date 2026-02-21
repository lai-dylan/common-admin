import * as ElementPlusIconsVue from "@element-plus/icons-vue";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import "element-plus/theme-chalk/dark/css-vars.css";
import { createApp } from "vue";

import App from "./App.vue";
import router from "./router";
// import {setupErrorHandler, VueApp} from "./utils/errorHandler";

import "@/components/common/ui/styles/index.css";
import "./styles/index.scss";
import "./styles/tailwind.css";

import { useThemeStore } from "@/stores/theme";
import { createPinia } from "pinia";

const app = createApp(App);

const pinia = createPinia();
app.use(pinia);
useThemeStore(pinia).initTheme();

// 路由
app.use(router);

// Element Plus
app.use(ElementPlus);

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

// 全局错误处理
// setupErrorHandler(app as VueApp)

// 挂载应用
app.mount("#app");
