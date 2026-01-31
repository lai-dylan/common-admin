import Router from 'koa-router'
import { res } from '../utils/response.js'
import { users } from '../data/mockData.js'

const router = new Router()

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

export default router
