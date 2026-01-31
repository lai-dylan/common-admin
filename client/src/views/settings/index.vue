<template>
  <div class="settings-page">
    <div class="page-header">
      <h2 class="page-title">{{ $t('settings.title') }}</h2>
    </div>

    <el-row :gutter="20">
      <el-col :xs="24" :md="8">
        <el-card class="settings-menu">
          <el-menu :default-active="activeMenu" @select="handleMenuSelect">
            <el-menu-item index="basic">
              <el-icon><Setting /></el-icon>
              <span>{{ $t('settings.basicSettings') }}</span>
            </el-menu-item>
            <el-menu-item index="security">
              <el-icon><Lock /></el-icon>
              <span>{{ $t('settings.securitySettings') }}</span>
            </el-menu-item>
            <el-menu-item index="notification">
              <el-icon><Bell /></el-icon>
              <span>{{ $t('settings.notificationSettings') }}</span>
            </el-menu-item>
          </el-menu>
        </el-card>
      </el-col>

      <el-col :xs="24" :md="16">
        <!-- 基本设置 -->
        <el-card v-show="activeMenu === 'basic'" class="settings-content">
          <template #header>
            <h3>{{ $t('settings.basicSettings') }}</h3>
          </template>
          <el-form :model="basicForm" label-width="120px">
            <el-form-item :label="$t('settings.siteName')">
              <el-input v-model="basicForm.siteName" placeholder="请输入站点名称" />
            </el-form-item>
            <el-form-item :label="$t('settings.siteDescription')">
              <el-input v-model="basicForm.siteDescription" type="textarea" :rows="3" placeholder="请输入站点描述" />
            </el-form-item>
            <el-form-item :label="$t('settings.contactEmail')">
              <el-input v-model="basicForm.contactEmail" placeholder="请输入联系邮箱" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveBasicSettings">{{ $t('common.save') }}</el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 安全设置 -->
        <el-card v-show="activeMenu === 'security'" class="settings-content">
          <template #header>
            <h3>{{ $t('settings.securitySettings') }}</h3>
          </template>
          <el-form :model="securityForm" label-width="140px">
            <el-form-item :label="$t('settings.passwordPolicy')">
              <el-radio-group v-model="securityForm.passwordPolicy">
                <el-radio label="simple">简单</el-radio>
                <el-radio label="normal">普通</el-radio>
                <el-radio label="strong">强</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item :label="$t('settings.loginLimit')">
              <el-input-number v-model="securityForm.loginLimit" :min="1" :max="10" />
              <span class="form-tip">次</span>
            </el-form-item>
            <el-form-item label="登录失败锁定">
              <el-switch v-model="securityForm.lockOnFail" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveSecuritySettings">{{ $t('common.save') }}</el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 通知设置 -->
        <el-card v-show="activeMenu === 'notification'" class="settings-content">
          <template #header>
            <h3>{{ $t('settings.notificationSettings') }}</h3>
          </template>
          <el-form :model="notificationForm" label-width="140px">
            <el-form-item :label="$t('settings.emailNotification')">
              <el-switch v-model="notificationForm.emailNotification" />
            </el-form-item>
            <el-form-item :label="$t('settings.smsNotification')">
              <el-switch v-model="notificationForm.smsNotification" />
            </el-form-item>
            <el-form-item label="新用户注册通知">
              <el-switch v-model="notificationForm.newUserNotify" />
            </el-form-item>
            <el-form-item label="内容审核通知">
              <el-switch v-model="notificationForm.contentNotify" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveNotificationSettings">{{ $t('common.save') }}</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useI18n } from 'vue-i18next'
import { ElMessage } from 'element-plus'

const { t } = useI18n()

const activeMenu = ref('basic')

const basicForm = reactive({
  siteName: '通用后台管理系统',
  siteDescription: '一个功能强大的后台管理系统',
  contactEmail: 'admin@example.com',
})

const securityForm = reactive({
  passwordPolicy: 'normal',
  loginLimit: 5,
  lockOnFail: true,
})

const notificationForm = reactive({
  emailNotification: true,
  smsNotification: false,
  newUserNotify: true,
  contentNotify: true,
})

function handleMenuSelect(index: string) {
  activeMenu.value = index
}

function saveBasicSettings() {
  localStorage.setItem('siteSettings', JSON.stringify(basicForm))
  ElMessage.success(t('common.success'))
}

function saveSecuritySettings() {
  localStorage.setItem('securitySettings', JSON.stringify(securityForm))
  ElMessage.success(t('common.success'))
}

function saveNotificationSettings() {
  localStorage.setItem('notificationSettings', JSON.stringify(notificationForm))
  ElMessage.success(t('common.success'))
}
</script>

<style lang="scss" scoped>
.settings-page {
  .settings-menu {
    margin-bottom: 20px;

    .el-menu {
      border-right: none;
    }
  }

  .settings-content {
    h3 {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
      margin: 0;
    }

    .form-tip {
      margin-left: 8px;
      color: #909399;
    }
  }
}

@media (max-width: 768px) {
  .el-col {
    margin-bottom: 20px;
  }
}
</style>
