import Koa from 'koa'
import Router from 'koa-router'
import bodyParser from 'koa-bodyparser'
import cors from '@koa/cors'
import json from 'koa-json'

const app = new Koa()
const router = new Router()

// Mock数据
const users = []
for (let i = 1; i <= 50; i++) {
  users.push({
    id: i,
    username: `user${i}`,
    email: `user${i}@example.com`,
    phone: `13800138${String(i).padStart(4, '0')}`,
    avatar: `https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png`,
    role: ['超级管理员', '管理员', '普通用户'][i % 3],
    roleId: (i % 3) + 1,
    status: i % 4 === 0 ? 0 : 1,
    createdAt: new Date(Date.now() - Math.random() * 10000000000).toLocaleString(),
  })
}

const roles = [
  { id: 1, name: '超级管理员', code: 'admin', description: '拥有所有权限', status: 1, permissions: ['*'], createdAt: '2024-01-01 00:00:00' },
  { id: 2, name: '管理员', code: 'manager', description: '管理大部分功能', status: 1, permissions: ['user:*', 'role:list'], createdAt: '2024-01-05 10:00:00' },
  { id: 3, name: '普通用户', code: 'user', description: '基础用户权限', status: 1, permissions: ['content:list'], createdAt: '2024-01-10 15:30:00' },
  { id: 4, name: '编辑', code: 'editor', description: '内容编辑权限', status: 1, permissions: ['content:list', 'content:add', 'content:edit'], createdAt: '2024-01-12 09:20:00' },
]

const contents = [
  { id: 1, title: 'Vue3 最佳实践指南', category: 'tech', author: '张三', status: 'published', views: 1234, createdAt: '2024-01-10 10:00:00', publishedAt: '2024-01-10 10:30:00' },
  { id: 2, title: 'TypeScript 入门教程', category: 'tech', author: '李四', status: 'published', views: 856, createdAt: '2024-01-08 14:20:00', publishedAt: '2024-01-08 15:00:00' },
  { id: 3, title: '我的周末生活', category: 'life', author: '王五', status: 'draft', views: 0, createdAt: '2024-01-12 09:15:00' },
  { id: 4, title: '产品更新日志 v2.0', category: 'product', author: '赵六', status: 'published', views: 2345, createdAt: '2024-01-05 16:00:00', publishedAt: '2024-01-05 16:30:00' },
  { id: 5, title: 'Vite 构建工具详解', category: 'tech', author: '张三', status: 'archived', views: 567, createdAt: '2023-12-20 11:00:00', publishedAt: '2023-12-20 11:30:00' },
]

// 响应封装
function res(ctx, data = {}, message = 'success') {
  ctx.body = { code: 200, data, message }
}

// 认证接口
router.post('/api/auth/login', (ctx) => {
  const { username, password } = ctx.request.body
  if (username === 'admin' && password === '123456') {
    res(ctx, {
      token: 'mock-token-' + Date.now(),
      user: users[0],
    })
  } else {
    ctx.status = 401
    ctx.body = { code: 401, data: null, message: '用户名或密码错误' }
  }
})

router.post('/api/auth/logout', (ctx) => {
  res(ctx, null, '退出成功')
})

router.post('/api/auth/info', (ctx) => {
  res(ctx, users[0])
})

// 用户接口
router.get('/api/users', (ctx) => {
  const { page = 1, pageSize = 10, keyword, status } = ctx.query
  let filtered = [...users]
  if (keyword) {
    filtered = filtered.filter(u => u.username.includes(keyword) || u.email.includes(keyword))
  }
  if (status !== undefined && status !== '') {
    filtered = filtered.filter(u => u.status === Number(status))
  }
  const total = filtered.length
  const list = filtered.slice((page - 1) * pageSize, page * pageSize)
  res(ctx, { list, total, page: Number(page), pageSize: Number(pageSize) })
})

router.get('/api/users/:id', (ctx) => {
  const user = users.find(u => u.id === Number(ctx.params.id))
  if (user) {
    res(ctx, user)
  } else {
    ctx.status = 404
    ctx.body = { code: 404, data: null, message: '用户不存在' }
  }
})

router.post('/api/users', (ctx) => {
  const newUser = {
    id: Math.max(...users.map(u => u.id)) + 1,
    ...ctx.request.body,
    createdAt: new Date().toLocaleString(),
    avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
  }
  users.unshift(newUser)
  res(ctx, newUser)
})

router.put('/api/users/:id', (ctx) => {
  const index = users.findIndex(u => u.id === Number(ctx.params.id))
  if (index > -1) {
    users[index] = { ...users[index], ...ctx.request.body }
    res(ctx, users[index])
  } else {
    ctx.status = 404
    ctx.body = { code: 404, data: null, message: '用户不存在' }
  }
})

router.delete('/api/users/:id', (ctx) => {
  const index = users.findIndex(u => u.id === Number(ctx.params.id))
  if (index > -1) {
    users.splice(index, 1)
    res(ctx, null, '删除成功')
  } else {
    ctx.status = 404
    ctx.body = { code: 404, data: null, message: '用户不存在' }
  }
})

// 角色接口
router.get('/api/roles', (ctx) => {
  const { page = 1, pageSize = 10, keyword } = ctx.query
  let filtered = [...roles]
  if (keyword) {
    filtered = filtered.filter(r => r.name.includes(keyword) || r.code.includes(keyword))
  }
  const total = filtered.length
  const list = filtered.slice((page - 1) * pageSize, page * pageSize)
  res(ctx, { list, total, page: Number(page), pageSize: Number(pageSize) })
})

router.get('/api/roles/:id', (ctx) => {
  const role = roles.find(r => r.id === Number(ctx.params.id))
  if (role) {
    res(ctx, role)
  } else {
    ctx.status = 404
    ctx.body = { code: 404, data: null, message: '角色不存在' }
  }
})

router.post('/api/roles', (ctx) => {
  const newRole = {
    id: Math.max(...roles.map(r => r.id)) + 1,
    ...ctx.request.body,
    createdAt: new Date().toLocaleString(),
  }
  roles.unshift(newRole)
  res(ctx, newRole)
})

router.put('/api/roles/:id', (ctx) => {
  const index = roles.findIndex(r => r.id === Number(ctx.params.id))
  if (index > -1) {
    roles[index] = { ...roles[index], ...ctx.request.body }
    res(ctx, roles[index])
  } else {
    ctx.status = 404
    ctx.body = { code: 404, data: null, message: '角色不存在' }
  }
})

router.delete('/api/roles/:id', (ctx) => {
  const index = roles.findIndex(r => r.id === Number(ctx.params.id))
  if (index > -1) {
    roles.splice(index, 1)
    res(ctx, null, '删除成功')
  } else {
    ctx.status = 404
    ctx.body = { code: 404, data: null, message: '角色不存在' }
  }
})

router.get('/api/roles/permissions', (ctx) => {
  res(ctx, ['user:list', 'user:add', 'user:edit', 'user:delete', 'role:list', 'role:add', 'role:edit', 'role:delete', 'content:list', 'content:add', 'content:edit', 'content:delete'])
})

// 内容接口
router.get('/api/content', (ctx) => {
  const { page = 1, pageSize = 10, keyword, status, category } = ctx.query
  let filtered = [...contents]
  if (keyword) {
    filtered = filtered.filter(c => c.title.includes(keyword))
  }
  if (status) {
    filtered = filtered.filter(c => c.status === status)
  }
  if (category) {
    filtered = filtered.filter(c => c.category === category)
  }
  const total = filtered.length
  const list = filtered.slice((page - 1) * pageSize, page * pageSize)
  res(ctx, { list, total, page: Number(page), pageSize: Number(pageSize) })
})

router.get('/api/content/:id', (ctx) => {
  const content = contents.find(c => c.id === Number(ctx.params.id))
  if (content) {
    res(ctx, content)
  } else {
    ctx.status = 404
    ctx.body = { code: 404, data: null, message: '内容不存在' }
  }
})

router.post('/api/content', (ctx) => {
  const newContent = {
    id: Math.max(...contents.map(c => c.id)) + 1,
    ...ctx.request.body,
    author: '当前用户',
    views: 0,
    createdAt: new Date().toLocaleString(),
  }
  contents.unshift(newContent)
  res(ctx, newContent)
})

router.put('/api/content/:id', (ctx) => {
  const index = contents.findIndex(c => c.id === Number(ctx.params.id))
  if (index > -1) {
    contents[index] = { ...contents[index], ...ctx.request.body }
    res(ctx, contents[index])
  } else {
    ctx.status = 404
    ctx.body = { code: 404, data: null, message: '内容不存在' }
  }
})

router.delete('/api/content/:id', (ctx) => {
  const index = contents.findIndex(c => c.id === Number(ctx.params.id))
  if (index > -1) {
    contents.splice(index, 1)
    res(ctx, null, '删除成功')
  } else {
    ctx.status = 404
    ctx.body = { code: 404, data: null, message: '内容不存在' }
  }
})

router.post('/api/content/:id/publish', (ctx) => {
  const content = contents.find(c => c.id === Number(ctx.params.id))
  if (content) {
    content.status = 'published'
    content.publishedAt = new Date().toLocaleString()
    res(ctx, content)
  } else {
    ctx.status = 404
    ctx.body = { code: 404, data: null, message: '内容不存在' }
  }
})

router.post('/api/content/:id/archive', (ctx) => {
  const content = contents.find(c => c.id === Number(ctx.params.id))
  if (content) {
    content.status = 'archived'
    res(ctx, content)
  } else {
    ctx.status = 404
    ctx.body = { code: 404, data: null, message: '内容不存在' }
  }
})

// 仪表盘接口
router.get('/api/dashboard/statistics', (ctx) => {
  res(ctx, {
    totalUsers: users.length,
    totalRoles: roles.length,
    totalContent: contents.length,
    todayVisits: Math.floor(Math.random() * 500) + 100,
    userGrowth: Math.floor(Math.random() * 30) - 10,
    contentGrowth: Math.floor(Math.random() * 40) - 5,
  })
})

router.get('/api/dashboard/visit-trend', (ctx) => {
  const days = Number(ctx.query.days) || 7
  const data = []
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    data.push({
      date: date.toISOString().split('T')[0],
      visits: Math.floor(Math.random() * 200) + 50,
    })
  }
  res(ctx, data)
})

router.get('/api/dashboard/activity', (ctx) => {
  res(ctx, [
    { id: 1, action: '新增用户：张三', time: '2024-01-15 10:30:22', user: '管理员' },
    { id: 2, action: '发布文章：《Vue3最佳实践》', time: '2024-01-15 09:15:00', user: '李四' },
    { id: 3, action: '修改角色：管理员', time: '2024-01-14 16:45:33', user: '超级管理员' },
    { id: 4, action: '删除内容：测试文章', time: '2024-01-14 14:20:11', user: '张三' },
  ])
})

// 中间件
app.use(cors())
app.use(bodyParser())
app.use(json())
app.use(router.routes())
app.use(router.allowedMethods())

const PORT = 3000
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})
