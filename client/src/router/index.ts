import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录', public: true },
  },
  {
    path: '/',
    name: 'Layout',
    component: () => import('@/components/layout/index.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '数据统计', icon: 'Odometer' },
      },
      {
        path: 'user',
        name: 'UserManage',
        redirect: '/user/all',
        meta: { title: '用户管理', icon: 'User' },
        children: [
          {
            path: 'all',
            name: 'AllUsers',
            component: () => import('@/views/user/AllUser.vue'),
            meta: { title: '全部用户', icon: 'User' },
          },
          {
            path: 'role',
            name: 'UserRole',
            component: () => import('@/views/user/RolePermission.vue'),
            meta: { title: '角色权限', icon: 'Lock' },
          },
        ],
      },
      {
        path: 'content',
        name: 'Content',
        component: () => import('@/views/content/index.vue'),
        meta: { title: '内容管理', icon: 'Document' },
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/views/settings/index.vue'),
        meta: { title: '系统设置', icon: 'Setting' },
      },
      {
        path: 'components',
        name: 'Components',
        meta: { title: '组件示例', icon: 'Grid' },
        redirect: '/components/common-table',
        children: [
          {
            path: 'common-table',
            name: 'CommonTableDemo',
            component: () => import('@/views/components/CommonTableDemo.vue'),
            meta: { title: '通用表格', icon: 'Grid' },
          },
        ],
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue'),
    meta: { title: '页面不存在', public: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 路由守卫
router.beforeEach((to, _from, next) => {
  const userStore = useUserStore()
  const isLoggedIn = userStore.token

  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title}`
  }

  // 公开页面直接放行
  if (to.meta.public) {
    next()
    return
  }

  // 未登录跳转到登录页
  if (!isLoggedIn) {
    next({ name: 'Login'})
    return
  }

  next()
})

export default router
