import Router from 'koa-router'
import { res } from '../utils/response.js'
import { users } from '../data/mockData.js'

const router = new Router()

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

export default router
