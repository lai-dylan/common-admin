export const companies = [
  { id: 1, name: '阿里巴巴', code: 'alibaba', status: 1 },
  { id: 2, name: '腾讯', code: 'tencent', status: 1 },
  { id: 3, name: '百度', code: 'baidu', status: 1 },
  { id: 4, name: '字节跳动', code: 'bytedance', status: 1 },
  { id: 5, name: '美团', code: 'meituan', status: 1 },
  { id: 6, name: '京东', code: 'jd', status: 1 },
  { id: 7, name: '网易', code: 'netease', status: 1 },
  { id: 8, name: '新浪', code: 'sina', status: 0 },
]

export const roles = []
// Generate roles for each company
companies.forEach(company => {
  const companyRoles = [
    { name: '超级管理员', code: 'admin', description: '拥有所有权限', permissions: ['*'] },
    { name: '管理员', code: 'manager', description: '管理大部分功能', permissions: ['user:*', 'role:list'] },
    { name: '普通用户', code: 'user', description: '基础用户权限', permissions: ['report:list'] },
    { name: '分析师', code: 'analyst', description: '运营报表分析权限', permissions: ['report:list', 'report:export'] },
  ]

  companyRoles.forEach((role, index) => {
    roles.push({
      id: roles.length + 1,
      ...role,
      status: 1,
      companyId: company.id,
      companyName: company.name,
      createdAt: new Date(Date.now() - Math.random() * 10000000000).toLocaleString(),
    })
  })
})

export const users = []
for (let i = 1; i <= 50; i++) {
  const companyId = (i % 8) + 1
  const company = companies.find(c => c.id === companyId)
  
  // Find roles for this company
  const companyRoles = roles.filter(r => r.companyId === companyId)
  const randomRole = companyRoles[i % companyRoles.length]

  users.push({
    id: i,
    username: `user${i}`,
    email: `user${i}@example.com`,
    phone: `13800138${String(i).padStart(4, '0')}`,
    avatar: `https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png`,
    role: randomRole.name,
    roleId: randomRole.id,
    companyId,
    companyName: company.name,
    status: i % 4 === 0 ? 0 : 1,
    createdAt: new Date(Date.now() - Math.random() * 10000000000).toLocaleString(),
  })
}

export const reports = []

export const reportTypes = ['销售报表', '财务报表', '运营报表', '客户报表', '产品报表', '市场报表']
export const departments = ['销售部', '财务部', '运营部', '技术部', '市场部', '人力资源部']
export const dataPeriods = ['日度', '周度', '月度', '季度', '年度']
export const relatedSystems = ['CRM系统', 'ERP系统', '财务系统', '供应链系统', '人力资源系统', '数据分析平台']
const owners = ['张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十', '郑十一', '王十二']

function pickOne(list) {
  return list[Math.floor(Math.random() * list.length)]
}

function pickMany(list, min, max) {
  const size = Math.min(list.length, min + Math.floor(Math.random() * (max - min + 1)))
  const pool = [...list]
  const result = []
  while (result.length < size && pool.length) {
    const idx = Math.floor(Math.random() * pool.length)
    result.push(pool[idx])
    pool.splice(idx, 1)
  }
  return result
}

for (let i = 1; i <= 80; i++) {
  const reportType = pickOne(reportTypes)
  const department = pickOne(departments)
  const owner = pickOne(owners)
  const dataPeriod = pickOne(dataPeriods)
  const enabled = Math.random() > 0.2
  const published = Math.random() > 0.35
  const createdDate = new Date(Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 180))
  const updatedDate = new Date(createdDate.getTime() + Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 60))

  reports.push({
    reportId: i,
    reportName: `${reportType}${dataPeriod}分析报表 ${i}`,
    reportType,
    department,
    owner,
    dataPeriod,
    enabled,
    published,
    createdAt: createdDate.toLocaleString(),
    updatedAt: updatedDate.toLocaleString(),
    createdAtISO: createdDate.toISOString(),
    updatedAtISO: updatedDate.toISOString(),
    visits: Math.floor(Math.random() * 50000),
    qualityScore: Math.floor(Math.random() * 10) + 1,
    relatedSystems: pickMany(relatedSystems, 1, 3),
  })
}
