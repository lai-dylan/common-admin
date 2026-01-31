import Router from 'koa-router'
import { res } from '../utils/response.js'
import { contents } from '../data/mockData.js'

const router = new Router()

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

export default router
