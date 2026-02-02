export const users = []

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

export const roles = [
  { id: 1, name: '超级管理员', code: 'admin', description: '拥有所有权限', status: 1, permissions: ['*'], createdAt: '2024-01-01 00:00:00' },
  { id: 2, name: '管理员', code: 'manager', description: '管理大部分功能', status: 1, permissions: ['user:*', 'role:list'], createdAt: '2024-01-05 10:00:00' },
  { id: 3, name: '普通用户', code: 'user', description: '基础用户权限', status: 1, permissions: ['content:list'], createdAt: '2024-01-10 15:30:00' },
  { id: 4, name: '编辑', code: 'editor', description: '内容编辑权限', status: 1, permissions: ['content:list', 'content:add', 'content:edit'], createdAt: '2024-01-12 09:20:00' },
]

export const contents = [
  { id: 1, title: 'Vue3 最佳实践指南', category: 'tech', author: '张三', status: 'published', views: 1234, createdAt: '2024-01-10 10:00:00', publishedAt: '2024-01-10 10:30:00' },
  { id: 2, title: 'TypeScript 入门教程', category: 'tech', author: '李四', status: 'published', views: 856, createdAt: '2024-01-08 14:20:00', publishedAt: '2024-01-08 15:00:00' },
  { id: 3, title: '我的周末生活', category: 'life', author: '王五', status: 'draft', views: 0, createdAt: '2024-01-12 09:15:00' },
  { id: 4, title: '产品更新日志 v2.0', category: 'product', author: '赵六', status: 'published', views: 2345, createdAt: '2024-01-05 16:00:00', publishedAt: '2024-01-05 16:30:00' },
  { id: 5, title: 'Vite 构建工具详解', category: 'tech', author: '张三', status: 'archived', views: 567, createdAt: '2023-12-20 11:00:00', publishedAt: '2023-12-20 11:30:00' },
]

const moreAuthors = ['张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十']
const categories = ['tech', 'life', 'product']
const statuses = ['draft', 'published', 'archived']
for (let i = 6; i <= 60; i++) {
  const cat = categories[i % categories.length]
  const author = moreAuthors[i % moreAuthors.length]
  const status = statuses[i % statuses.length]
  const created = new Date(Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 90)).toLocaleString()
  contents.push({
    id: i,
    title: `${cat === 'tech' ? '技术' : cat === 'life' ? '生活' : '产品'}内容 ${i}`,
    category: cat,
    author,
    status,
    views: Math.floor(Math.random() * 5000),
    createdAt: created,
    publishedAt: status === 'published' ? created : undefined,
  })
}
