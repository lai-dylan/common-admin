import Router from 'koa-router'
import { res } from '../utils/response.js'
import { contents } from '../data/mockData.js'

const router = new Router()

router.get('/api/content', (ctx) => {
  const { page = 1, pageSize = 30, keyword, status, category, author, dateStart, dateEnd } = ctx.query
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
  if (author) {
    filtered = filtered.filter(c => String(c.author).includes(String(author)))
  }
  if (dateStart || dateEnd) {
    const start = dateStart ? new Date(String(dateStart)).getTime() : undefined
    const end = dateEnd ? new Date(String(dateEnd)).getTime() : undefined
    filtered = filtered.filter(c => {
      const t = new Date(c.createdAt).getTime()
      if (start && t < start) return false
      if (end && t > end) return false
      return true
    })
  }
  const total = filtered.length
  const p = Number(page)
  const ps = Number(pageSize)
  const list = filtered.slice((p - 1) * ps, p * ps)
  res(ctx, { list, total, page: p, pageSize: ps })
})

router.post('/api/content/search', (ctx) => {
  const { page = 1, pageSize = 30, keyword, status, category, author, dateStart, dateEnd } = ctx.request.body || {}
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
  if (author) {
    filtered = filtered.filter(c => String(c.author).includes(String(author)))
  }
  if (dateStart || dateEnd) {
    const start = dateStart ? new Date(String(dateStart)).getTime() : undefined
    const end = dateEnd ? new Date(String(dateEnd)).getTime() : undefined
    filtered = filtered.filter(c => {
      const t = new Date(c.createdAt).getTime()
      if (start && t < start) return false
      if (end && t > end) return false
      return true
    })
  }
  const total = filtered.length
  const p = Number(page)
  const ps = Number(pageSize)
  const list = filtered.slice((p - 1) * ps, p * ps)
  res(ctx, { list, total, page: p, pageSize: ps })
})

router.get('/api/content/categories', async (ctx) => {
  await new Promise(resolve => setTimeout(resolve, 2000))
  const labelMap = {
    tech: '技术文章',
    life: '生活随笔',
    product: '产品动态',
  }
  const values = Array.from(new Set(contents.map(c => c.category)))
  const options = values.map(v => ({ label: labelMap[v] || String(v), value: v }))
  res(ctx, options)
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
