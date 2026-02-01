# 项目整体规划
## 技术与结构
- 前端：Vue3 + Vite + TS + Pinia + Element Plus + ESLint + Prettier
- 数据层：@tanstack/vue-query 管理请求与缓存，ky 作为 HTTP 客户端
- 国际化：i18next（含语言探测与动态资源加载）
- 其他库：date-fns、vueuse、lodash-es
- 后端：Koa + koa-router + koa-bodyparser + @koa/cors，纯 Mock JSON
- 项目布局：
    - 根目录：README、.gitignore、.editorconfig、（可选）工作区 package.json
    - frontend/：前端工程
    - server/：Koa Mock 服务

# 前端实现
## 初始化与基础配置
- 使用 Vite 官方模板（Vue + TS）初始化
- 配置 ESLint（@antfu/eslint-config 或 eslint-plugin-vue + @typescript-eslint）与 Prettier 统一代码风格
- 新增 .env.development / .env.test / .env.production，定义 VITE_API_BASE_URL、VITE_APP_NAME 等
- 配置别名与 tsconfig paths（@/ 指向 src）

## 路由与权限
- 使用 vue-router，路由按布局拆分：
    - /login：独立登录页
    - /：主布局（侧边菜单 + 顶部工具栏 + 内容区）
- 路由 meta 存放权限标识与菜单信息（标题、图标、层级）
- 登录后根据后端返回的角色/权限过滤可访问路由，生成两级嵌套菜单
- 全局路由守卫：
    - 校验 token 与权限
    - 根据环境与配置控制跳转逻辑

## 状态管理（Pinia）
- authStore：token、用户信息、角色/权限、登录/登出动作
- appStore：语言、主题、侧边栏折叠、移动端断点
- permissionStore：基于路由与权限生成菜单树与按钮权限
- 指令 v-permission 控制按钮/区域显示

## 网络层（ky + 拦截器）
- 封装 apiClient：
    - baseURL 读取 VITE_API_BASE_URL
    - 请求拦截附加 token
    - 响应统一错误处理（ElMessage、错误上报钩子）
- API 模块划分：auth、menu、items 等

## 数据获取与加载状态（vue-query）
- 注册 VueQueryPlugin 与 QueryClient，设置默认重试、缓存与错误处理策略
- 通用 useApiQuery/useApiMutation 封装，自动处理 isLoading、error、刷新等
- 路由切换与请求显示 NProgress，列表页使用 Skeleton/空状态与分页

## 国际化（i18next）
- 初始化 i18next：
    - 使用 i18next-browser-languagedetector 自动探测
    - 使用 i18next-http-backend 动态加载多语言资源
- 提供 useI18n 钩子（包装 t、语言切换、资源加载状态）
- 顶部栏添加语言切换（中文/英文为例），文案抽取为资源文件

## 错误捕获与边界
- app.config.errorHandler 全局错误捕获 + 友好提示 + 可扩展上报
- 自定义 ErrorBoundary 组件，包裹主要内容区
- ky 拦截器与 vue-query onError 联动，统一反馈

## UI 与响应式
- 使用 Element Plus 搭建布局：侧边菜单（ElMenu）+ 顶部栏 + 主内容
- 两级菜单渲染：支持折叠、选中高亮、面包屑
- 列表页模板：
    - 顶部过滤表单（提交/重置）
    - 下方数据表格（分页、排序、选择）
- 移动端适配：
    - 断点检测（vueuse useBreakpoints）
    - 小屏侧边菜单改为 Drawer，表格与表单栅格调整

## 质量与规范
- ESLint + Prettier + TypeScript 严格模式
- 提供 Git hooks（可选：husky + lint-staged）在提交前格式化与校验

# 环境与配置
- Vite 模式区分：development / test / production
- 不同环境的 API 基址、日志级别、vue-query 缓存策略等差异化
- .env.* 注入前缀 VITE_

# Koa Mock 后端
## 初始化与中间件
- Koa 基础工程：koa、koa-router、koa-bodyparser、@koa/cors
- 统一响应格式：{ code, message, data }
- 错误处理中间件：捕获异常并返回 JSON

## 路由设计（示例）
- POST /auth/login：返回 token 与用户基本信息、角色/权限
- GET /auth/profile：返回当前用户信息
- GET /menu：返回两级菜单树（含权限）
- GET /items：分页列表（支持过滤参数）
- POST /items：新增（模拟）
- PUT /items/:id：更新（模拟）
- DELETE /items/:id：删除（模拟）

## 配置与运行
- .env（PORT、CORS 白名单）
- 启动脚本：dev、prod
- 与前端跨域联调（CORS）

# Git 与工作流
- 初始化 Git 仓库，配置 .gitignore（node_modules、dist、logs 等）
- 可选工作区脚本：在根目录提供统一脚本运行前后端（dev:all、build:all）

# Skills 计划（待你确认后创建）
- 前端构建与脚手架：一键生成与初始化项目结构
- 质量保障：ESLint/Prettier 配置器、Commit 规范（可选）
- 国际化助手：i18next 资源管理与切换
- 接口模拟助手：Koa 路由模板快速新增
- 文档与资产：README 生成器、Changelog 生成（可选）

# 交付与验证
- 本地同时启动前后端，联调登录与列表页
- 验证：权限控制、菜单嵌套、过滤表单、加载状态、国际化切换、错误边界
- 输出完整 README，说明开发/测试/生产环境配置与运行方式

请确认上述方案，确认后我将开始初始化并实现所有模块（含 Skills 创建）。