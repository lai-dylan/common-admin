import ky from "ky";
import type {ApiResponse} from "@/types";
const baseURL = import.meta.env.VITE_API_BASE_URL;
import router from "@/router";

// 创建Ky实例
const http = ky.create({
  prefixUrl: baseURL,
  timeout: 10000,
  hooks: {
    beforeRequest: [
      (request) => {
        const token = localStorage.getItem("token");
        if (token) {
          request.headers.set("Authorization", `Bearer ${token}`);
        }
      },
    ],
    afterResponse: [
      async (_request, _options, response) => {
        if (response.status === 401) {
          localStorage.removeItem("token");
          // 使用动态导入避免循环依赖
          // const router = await import("@/router").then(m => m.default);
          await router.push("/login");
        }
      },
    ],
  },
});

// 封装请求方法
export const get = <T>(url: string, params?: Record<string, any>) =>
  http.get(url, {searchParams: params}).json<ApiResponse<T>>();

export const post = <T>(url: string, data?: any) =>
  http.post(url, {json: data}).json<ApiResponse<T>>();

export const put = <T>(url: string, data?: any) =>
  http.put(url, {json: data}).json<ApiResponse<T>>();

export const del = <T>(url: string, params?: Record<string, any>) =>
  http.delete(url, {searchParams: params}).json<ApiResponse<T>>();

export default http;
