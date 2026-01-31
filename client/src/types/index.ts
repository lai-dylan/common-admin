// 用户相关类型
export interface User {
  id: number
  username: string
  email: string
  phone: string
  avatar: string
  role: string
  roleId: number
  status: 0 | 1
  createdAt: string
}

export interface LoginParams {
  username: string
  password: string
  remember?: boolean
}

export interface LoginResult {
  token: string
  user: User
}

// 角色相关类型
export interface Role {
  id: number
  name: string
  code: string
  description: string
  status: 0 | 1
  permissions: string[]
  createdAt: string
}

export interface RoleParams {
  name: string
  code: string
  description: string
  permissions: string[]
  status: 0 | 1
}

// 内容相关类型
export interface Content {
  id: number
  title: string
  category: string
  author: string
  status: 'draft' | 'published' | 'archived'
  views: number
  createdAt: string
  publishedAt?: string
}

// 统计相关类型
export interface Statistics {
  totalUsers: number
  totalRoles: number
  totalContent: number
  todayVisits: number
  userGrowth: number
  contentGrowth: number
}

// 分页相关类型
export interface PaginationParams {
  page: number
  pageSize: number
}

export interface PaginationResult<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

// 通用响应类型
export interface ApiResponse<T> {
  code: number
  data: T
  message: string
}

// 菜单类型
export interface MenuItem {
  path: string
  name: string
  meta: {
    title: string
    icon?: string
    children?: MenuItem[]
  }
}

// 表格排序类型
export interface SortParams {
  prop: string
  order: 'asc' | 'desc'
}

// 过滤表单类型
export interface FilterForm {
  keyword?: string
  status?: string
  dateRange?: [string, string]
}
