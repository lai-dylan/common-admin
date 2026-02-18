import { login as loginApi } from "@/api/auth";
import { defineStore } from "pinia";
import { computed, ref } from "vue";

export const useUserStore = defineStore("user", () => {
  const token = ref(localStorage.getItem("token") || "");
  const userInfo = ref<Record<string, unknown> | null>(null);
  const language = ref(localStorage.getItem("language") || "zh");

  const isLoggedIn = computed(() => !!token.value);
  const userRole = computed(() => {
    const role = userInfo.value?.role;
    return typeof role === "string" ? role : "";
  });

  async function login(params: { username: string; password: string }) {
    try {
      const res = await loginApi(params);
      token.value = res.data.token;
      userInfo.value = res.data.user;
      localStorage.setItem("token", res.data.token);
      return { success: true };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "登录失败";
      return { success: false, message };
    }
  }

  function logout() {
    token.value = "";
    userInfo.value = null;
    localStorage.removeItem("token");
  }

  return {
    token,
    userInfo,
    language,
    isLoggedIn,
    userRole,
    login,
    logout,
  };
});
