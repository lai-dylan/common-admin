import Router from 'koa-router'
import { res } from '../utils/response.js'
import { users, roles, contents } from '../data/mockData.js'

const router = new Router()

router.get('/api/dashboard/statistics', async (ctx) => {
  await new Promise(resolve => setTimeout(resolve, 500))
  res(ctx, {
    totalUsers: users.length,
    totalRoles: roles.length,
    totalContent: contents.length,
    todayVisits: Math.floor(Math.random() * 500) + 100,
    userGrowth: Math.floor(Math.random() * 30) - 10,
    contentGrowth: Math.floor(Math.random() * 40) - 5,
  })
})

router.get('/api/dashboard/visit-trend', async (ctx) => {
  await new Promise(resolve => setTimeout(resolve, 500))
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

router.get('/api/dashboard/activity', async (ctx) => {
  await new Promise(resolve => setTimeout(resolve, 500))
  res(ctx, [
    { id: 1, action: '新增用户：张三', time: '2024-01-15 10:30:22', user: '管理员' },
    { id: 2, action: '发布文章：《Vue3最佳实践》', time: '2024-01-15 09:15:00', user: '李四' },
    { id: 3, action: '修改角色：管理员', time: '2024-01-14 16:45:33', user: '超级管理员' },
    { id: 4, action: '删除内容：测试文章', time: '2024-01-14 14:20:11', user: '张三' },
  ])
})

export default router
