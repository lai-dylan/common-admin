# 通用后台管理系统

一个功能完整的通用后台管理系统前端项目，基于 Vue3 + Vite + TypeScript 构建。

## 📁 项目结构

```
common-admin/
├── client/                 # 前端项目 (Vue3 + Vite + TS)
│   ├── src/
│   │   ├── api/           # API 接口定义
│   │   ├── assets/        # 静态资源
│   │   ├── components/    # 公共组件
│   │   ├── locales/       # 多语言文件
│   │   ├── router/        # 路由配置
│   │   ├── stores/        # Pinia 状态管理
│   │   ├── styles/        # 全局样式
│   │   ├── types/         # TypeScript 类型
│   │   ├── utils/         # 工具函数
│   │   └── views/         # 页面组件
│   └── ...
├── server/                 # 后端项目 (Koa Mock)
│   └── app.js             # 服务入口
└── README.md
```

## 🚀 快速开始

### 前端

```bash
# 进入前端目录
cd client

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 后端

```bash
# 进入后端目录
cd server

# 安装依赖
npm install

# 启动后端服务
npm run dev
```

### 访问项目

- 前端: http://localhost:5173
- 后端: http://localhost:3000

## 🔐 登录账号

- 用户名: `admin`
- 密码: `123456`

## ✨ 功能特性

### 已实现功能

- ✅ 用户管理 - 用户的增删改查
- ✅ 角色权限 - 角色管理和权限配置
- ✅ 内容管理 - 内容的发布和编辑
- ✅ 数据统计 - 仪表盘和数据展示
- ✅ 系统设置 - 基本/安全/通知设置
- ✅ 多语言 - 中文和英文支持
- ✅ 响应式布局 - 完美适配移动端
- ✅ 路由守卫 - 登录验证
- ✅ 错误处理 - 全局错误捕获

### 技术栈

- **Vue 3** - 渐进式 JavaScript 框架
- **Vite** - 下一代前端构建工具
- **TypeScript** - JavaScript 的超集
- **Pinia** - Vue 状态管理
- **Vue Router** - Vue.js 官方路由
- **Element Plus** - Vue 3 UI 组件库
- **i18next** - 国际化框架
- **Ky** - 轻量级 HTTP 客户端
- **Koa** - Node.js Web 框架

## 📱 响应式设计

项目支持三个断点的响应式布局：

- **桌面端 (>1200px)**: 完整侧边栏导航
- **平板端 (768-1200px)**: 可折叠侧边栏
- **移动端 (<768px)**: 抽屉式菜单

## 🌐 多语言

支持中文和英文切换，可在头部工具栏进行语言切换。

## 📦 开发规范

### 代码风格

- 使用 Composition API
- 组件名使用 PascalCase
- 文件名使用 kebab-case
- 样式使用 SCSS BEM 命名

### Git 提交规范

- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式
- `refactor`: 重构
- `test`: 测试
- `chore`: 构建/工具

## 📄 许可证

MIT License
