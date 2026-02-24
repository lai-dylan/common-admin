import { useUserStore } from "@/stores/user";
import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/login/index.vue"),
    meta: { title: "登录", public: true },
  },
  {
    path: "/",
    name: "Layout",
    component: () => import("@/components/layout-v2/index.vue"),
    redirect: "/a",
    children: [
      {
        path: "a",
        name: "a",
        component: () => import("@/views/a/index.vue"),
        meta: { title: "页面a", icon: "Setting" },
      },
    ],
  },
  // {
  //   path: "/",
  //   name: "Layout",
  //   component: () => import("@/components/layout/index.vue"),
  //   redirect: "/settings",
  //   children: [
  //     {
  //       path: "settings",
  //       name: "Settings",
  //       component: () => import("@/views/settings/index.vue"),
  //       meta: { title: "系统设置", icon: "Setting" },
  //     },
  //     {
  //       path: "reports",
  //       name: "Reports",
  //       component: () => import("@/views/reports/index.vue"),
  //       meta: { title: "报表管理", icon: "Document" },
  //     },
  //   ],
  // },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    redirect: "/login",
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, _from, next) => {
  const userStore = useUserStore();
  const isLoggedIn = !!userStore.token;

  if (to.meta.title) document.title = `${to.meta.title}`;
  if (to.meta.public) return next();
  if (!isLoggedIn) return next({ name: "Login" });
  next();
});

export default router;
