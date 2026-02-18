import { http } from "./request";

interface ApiResponse<T> {
  code: number;
  data: T;
  message: string;
}

export interface LoginUser {
  id: number;
  username: string;
  role: string;
  [key: string]: unknown;
}

export interface LoginResponseData {
  token: string;
  user: LoginUser;
}

export async function login(payload: { username: string; password: string }) {
  const res = await http
    .post("auth/login", { json: payload })
    .json<ApiResponse<LoginResponseData>>();
  return res;
}

export async function logout() {
  await http
    .post("auth/logout")
    .json()
    .catch(() => {});
}
