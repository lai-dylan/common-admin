import Router from 'koa-router'
import { res } from '../utils/response.js'
import { roles } from '../data/mockData.js'

const router = new Router()

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

export default router
