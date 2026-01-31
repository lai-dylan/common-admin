<template>
  <div class="dashboard-page">
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stat-cards">
      <el-col :xs="12" :sm="12" :md="6" v-for="stat in stats" :key="stat.label">
        <div class="stat-card" :class="stat.color">
          <div class="stat-icon">
            <el-icon :size="28"><component :is="stat.icon" /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stat.value }}</div>
            <div class="stat-label">{{ $t(stat.label) }}</div>
            <div class="stat-trend" :class="{ up: stat.growth > 0, down: stat.growth < 0 }">
              <el-icon v-if="stat.growth > 0"><ArrowUp /></el-icon>
              <el-icon v-else><ArrowDown /></el-icon>
              {{ Math.abs(stat.growth) }}%
            </div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="chart-section">
      <el-col :xs="24" :sm="24" :md="16">
        <div class="card chart-card">
          <div class="card-header">
            <h3>{{ $t('dashboard.visitTrend') }}</h3>
            <el-radio-group v-model="trendDays" size="small">
              <el-radio-button label="7">7天</el-radio-button>
              <el-radio-button label="14">14天</el-radio-button>
              <el-radio-button label="30">30天</el-radio-button>
            </el-radio-group>
          </div>
          <div class="chart-container">
            <div v-for="item in visitTrend" :key="item.date" class="chart-bar">
              <div class="bar" :style="{ height: `${item.percent}%` }"></div>
              <div class="date">{{ formatDate(item.date) }}</div>
            </div>
          </div>
        </div>
      </el-col>

      <el-col :xs="24" :sm="24" :md="8">
        <div class="card quick-actions">
          <div class="card-header">
            <h3>{{ $t('dashboard.quickActions') }}</h3>
          </div>
          <div class="action-list">
            <div class="action-item" @click="handleAction('addUser')">
              <el-icon><UserAdd /></el-icon>
              <span>{{ $t('user.addUser') }}</span>
            </div>
            <div class="action-item" @click="handleAction('addContent')">
              <el-icon><Document /></el-icon>
              <span>{{ $t('content.addContent') }}</span>
            </div>
            <div class="action-item" @click="handleAction('addRole')">
              <el-icon><Lock /></el-icon>
              <span>{{ $t('role.addRole') }}</span>
            </div>
            <div class="action-item" @click="handleAction('settings')">
              <el-icon><Setting /></el-icon>
              <span>{{ $t('settings.title') }}</span>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 最近活动 -->
    <div class="card recent-activity">
      <div class="card-header">
        <h3>{{ $t('dashboard.recentActivity') }}</h3>
        <el-button text type="primary" @click="loadActivities">
          {{ $t('common.refresh') }}
        </el-button>
      </div>
      <el-table :data="activities" style="width: 100%">
        <el-table-column prop="time" :label="$t('content.publishTime')" width="180" />
        <el-table-column prop="user" :label="$t('content.author')" width="120" />
        <el-table-column prop="action" :label="$t('role.description')" />
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { format, subDays } from 'date-fns'

const router = useRouter()

// 统计数据
const stats = ref([
  { label: 'dashboard.totalUsers', value: '1,234', icon: 'User', color: 'blue', growth: 12 },
  { label: 'dashboard.totalRoles', value: '8', icon: 'Lock', color: 'green', growth: 5 },
  { label: 'dashboard.totalContent', value: '3,456', icon: 'Document', color: 'purple', growth: 23 },
  { label: 'dashboard.todayVisits', value: '567', icon: 'View', color: 'orange', growth: -3 },
])

// 趋势数据
const trendDays = ref('7')
const visitTrend = ref<{ date: string; percent: number }[]>([])

// 最近活动
const activities = ref([
  { time: '2024-01-15 10:30:22', user: '张三', action: '新增用户：张三' },
  { time: '2024-01-15 09:15:00', user: '李四', action: '发布文章：《Vue3最佳实践》' },
  { time: '2024-01-14 16:45:33', user: '王五', action: '修改角色：管理员' },
  { time: '2024-01-14 14:20:11', user: '张三', action: '删除内容：测试文章' },
])

// 格式化日期
function formatDate(date: string) {
  return format(new Date(date), 'MM-dd')
}

// 生成趋势数据
function generateTrendData(days: number) {
  const data = []
  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(new Date(), i)
    const value = Math.floor(Math.random() * 80) + 20
    data.push({
      date: date.toISOString(),
      percent: value,
    })
  }
  visitTrend.value = data
}

// 加载活动
function loadActivities() {
  // 模拟刷新
  activities.value = activities.value.map(a => ({
    ...a,
    time: new Date().toLocaleString(),
  }))
}

// 处理快捷操作
function handleAction(action: string) {
  switch (action) {
    case 'addUser':
      router.push('/users')
      break
    case 'addContent':
      router.push('/content')
      break
    case 'addRole':
      router.push('/roles')
      break
    case 'settings':
      router.push('/settings')
      break
  }
}

onMounted(() => {
  generateTrendData(7)
})
</script>

<style lang="scss" scoped>
.dashboard-page {
  .stat-cards {
    margin-bottom: 20px;
  }

  .stat-card {
    background: #fff;
    border-radius: 8px;
    padding: 20px;
    display: flex;
    align-items: center;
    gap: 16px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

    .stat-icon {
      width: 56px;
      height: 56px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
    }

    &.blue .stat-icon {
      background: linear-gradient(135deg, #409eff, #67c23a);
    }

    &.green .stat-icon {
      background: linear-gradient(135deg, #67c23a, #e6a23c);
    }

    &.purple .stat-icon {
      background: linear-gradient(135deg, #909399, #409eff);
    }

    &.orange .stat-icon {
      background: linear-gradient(135deg, #e6a23c, #f56c6c);
    }

    .stat-value {
      font-size: 24px;
      font-weight: 600;
      color: #303133;
    }

    .stat-label {
      font-size: 14px;
      color: #909399;
      margin: 4px 0;
    }

    .stat-trend {
      font-size: 12px;
      display: flex;
      align-items: center;
      gap: 4px;

      &.up {
        color: #67c23a;
      }

      &.down {
        color: #f56c6c;
      }
    }
  }

  .chart-section {
    margin-bottom: 20px;
  }

  .card {
    background: #fff;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;

      h3 {
        font-size: 16px;
        font-weight: 600;
        color: #303133;
      }
    }
  }

  .chart-card {
    .chart-container {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      height: 200px;
      gap: 8px;

      .chart-bar {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        height: 100%;

        .bar {
          width: 100%;
          max-width: 40px;
          background: linear-gradient(to top, #409eff, #67c23a);
          border-radius: 4px 4px 0 0;
          transition: height 0.3s;
        }

        .date {
          margin-top: 8px;
          font-size: 12px;
          color: #909399;
        }
      }
    }
  }

  .quick-actions {
    .action-list {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;

      .action-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        padding: 20px;
        background: #f5f7fa;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s;

        &:hover {
          background: #409eff;
          color: #fff;
        }

        .el-icon {
          font-size: 24px;
        }

        span {
          font-size: 13px;
        }
      }
    }
  }

  .recent-activity {
    margin-bottom: 20px;
  }
}

@media (max-width: 768px) {
  .stat-card {
    padding: 16px;

    .stat-icon {
      width: 48px;
      height: 48px;
    }

    .stat-value {
      font-size: 20px;
    }
  }
}
</style>
