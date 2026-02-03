import Router from 'koa-router'
import { res } from '../utils/response.js'
import { users } from '../data/mockData.js'

const router = new Router()

router.get('/api/users', async (ctx) => {
  await new Promise(resolve => setTimeout(resolve, 500))
  const { page = 1, pageSize = 10, keyword, status, roleId, dateStart, dateEnd } = ctx.query
  let filtered = [...users]
  if (keyword) {
    const kw = keyword.toLowerCase()
    filtered = filtered.filter(u => 
      u.username.toLowerCase().includes(kw) || 
      u.email.toLowerCase().includes(kw) ||
      u.phone.includes(kw)
    )
  }
  if (status !== undefined && status !== '') {
    filtered = filtered.filter(u => u.status === Number(status))
  }
  if (roleId !== undefined && roleId !== '') {
    filtered = filtered.filter(u => u.roleId === Number(roleId))
  }
  if (dateStart || dateEnd) {
    const start = dateStart ? new Date(String(dateStart)).getTime() : undefined
    const end = dateEnd ? new Date(String(dateEnd)).getTime() : undefined
    filtered = filtered.filter(u => {
      const t = new Date(u.createdAt).getTime()
      if (start && t < start) return false
      if (end && t > end) return false
      return true
    })
  }
  const total = filtered.length
  const list = filtered.slice((page - 1) * pageSize, page * pageSize)
  res(ctx, { list, total, page: Number(page), pageSize: Number(pageSize) })
})

router.get('/api/users/:id', async (ctx) => {
  await new Promise(resolve => setTimeout(resolve, 500))
  const user = users.find(u => u.id === Number(ctx.params.id))
  if (user) {
    res(ctx, user)
  } else {
    ctx.status = 404
    ctx.body = { code: 404, data: null, message: '用户不存在' }
  }
})

router.post('/api/users', async (ctx) => {
  await new Promise(resolve => setTimeout(resolve, 500))
  const newUser = {
    id: Math.max(...users.map(u => u.id)) + 1,
    ...ctx.request.body,
    createdAt: new Date().toLocaleString(),
    avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
  }
  users.unshift(newUser)
  res(ctx, newUser)
})

router.put('/api/users/:id', async (ctx) => {
  await new Promise(resolve => setTimeout(resolve, 500))
  const index = users.findIndex(u => u.id === Number(ctx.params.id))
  if (index > -1) {
    users[index] = { ...users[index], ...ctx.request.body }
    res(ctx, users[index])
  } else {
    ctx.status = 404
    ctx.body = { code: 404, data: null, message: '用户不存在' }
  }
})

router.delete('/api/users/:id', async (ctx) => {
  await new Promise(resolve => setTimeout(resolve, 500))
  const index = users.findIndex(u => u.id === Number(ctx.params.id))
  if (index > -1) {
    users.splice(index, 1)
    res(ctx, null, '删除成功')
  } else {
    ctx.status = 404
    ctx.body = { code: 404, data: null, message: '用户不存在' }
  }
})

router.post('/api/users/batch-delete', async (ctx) => {
  await new Promise(resolve => setTimeout(resolve, 500))
  const { ids } = ctx.request.body
  if (Array.isArray(ids)) {
    let count = 0
    ids.forEach(id => {
      const index = users.findIndex(u => u.id === Number(id))
      if (index > -1) {
        users.splice(index, 1)
        count++
      }
    })
    res(ctx, { count }, `成功删除 ${count} 个用户`)
  } else {
    ctx.status = 400
    ctx.body = { code: 400, data: null, message: '参数错误' }
  }
})

export default router
