<template>
  <div class="settings-page">
    <ui-tabs v-model="activeMenu" class="settings-tabs">
      <ui-tab-pane label="基本设置" name="basic">
        <template #label>
          <span class="custom-tabs-label">
            <el-icon><calendar /></el-icon>
            <span>基本设置</span>
          </span>
        </template>
      </ui-tab-pane>
      <ui-tab-pane label="安全设置" name="security" />
      <ui-tab-pane label="通知设置" name="notification" />
    </ui-tabs>

    <!-- 基本设置 -->
    <ui-card v-show="activeMenu === 'basic'" class="settings-content">
      <template #header>
        <h3>基本设置</h3>
      </template>
      <el-form :model="basicForm" label-width="120px">
        <el-form-item label="站点名称">
          <el-input v-model="basicForm.siteName" placeholder="请输入站点名称" />
        </el-form-item>
        <el-form-item label="站点描述">
          <el-input
            v-model="basicForm.siteDescription"
            type="textarea"
            :rows="3"
            placeholder="请输入站点描述"
          />
        </el-form-item>
        <el-form-item label="联系邮箱">
          <el-input v-model="basicForm.contactEmail" placeholder="请输入联系邮箱" />
        </el-form-item>
        <el-form-item label="每页条数">
          <el-input-number v-model="basicForm.itemsPerPage" :min="5" :max="100" :step="5" />
        </el-form-item>
        <el-form-item label="会话超时">
          <el-input-number
            v-model="basicForm.sessionTimeoutMinutes"
            :min="5"
            :max="240"
            :step="5"
          />
          <span class="form-tip">分钟</span>
        </el-form-item>
        <el-form-item label="维护模式">
          <el-switch v-model="basicForm.maintenanceMode" />
        </el-form-item>
        <el-form-item label="开放注册">
          <el-switch v-model="basicForm.enableRegistration" />
        </el-form-item>
        <el-form-item label="默认主题">
          <el-select v-model="basicForm.defaultTheme" style="width: 220px">
            <el-option label="跟随系统" value="system" />
            <el-option label="浅色" value="light" />
            <el-option label="深色" value="dark" />
          </el-select>
        </el-form-item>
        <el-form-item label="默认语言">
          <el-select v-model="basicForm.defaultLanguage" style="width: 220px">
            <el-option label="简体中文" value="zh-CN" />
            <el-option label="English" value="en-US" />
          </el-select>
        </el-form-item>
        <el-form-item label="默认角色">
          <el-select v-model="basicForm.defaultRole" style="width: 220px">
            <el-option label="管理员" value="admin" />
            <el-option label="编辑" value="editor" />
            <el-option label="访客" value="viewer" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="saveBasicSettings">保存</el-button>
          <el-button @click="resetBasicSettings">恢复默认</el-button>
        </el-form-item>
      </el-form>
    </ui-card>

    <!-- 安全设置 -->
    <el-card v-show="activeMenu === 'security'" class="settings-content">
      <template #header>
        <h3>安全设置</h3>
      </template>
      <el-form :model="securityForm" label-width="140px">
        <el-form-item label="密码策略">
          <el-radio-group v-model="securityForm.passwordPolicy">
            <el-radio value="simple">简单</el-radio>
            <el-radio value="normal">普通</el-radio>
            <el-radio value="strong">强</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="登录限制">
          <el-input-number v-model="securityForm.loginLimit" :min="1" :max="10" />
          <span class="form-tip">次</span>
        </el-form-item>
        <el-form-item label="登录失败锁定">
          <el-switch v-model="securityForm.lockOnFail" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="saveSecuritySettings">保存</el-button>
          <el-button @click="resetSecuritySettings">恢复默认</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 通知设置 -->
    <el-card v-show="activeMenu === 'notification'" class="settings-content">
      <template #header>
        <h3>通知设置</h3>
      </template>
      <el-form :model="notificationForm" label-width="140px">
        <el-form-item label="邮件通知">
          <el-switch v-model="notificationForm.emailNotification" />
        </el-form-item>
        <el-form-item label="短信通知">
          <el-switch v-model="notificationForm.smsNotification" />
        </el-form-item>
        <el-form-item label="新用户注册通知">
          <el-switch v-model="notificationForm.newUserNotify" />
        </el-form-item>
        <el-form-item label="内容审核通知">
          <el-switch v-model="notificationForm.contentNotify" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="saveNotificationSettings">保存</el-button>
          <el-button @click="resetNotificationSettings">恢复默认</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import {
  mockBasicSettings,
  mockNotificationSettings,
  mockSecuritySettings,
  type BasicSettings,
  type NotificationSettings,
  type SecuritySettings,
} from "@/mock/settings";
import { Calendar } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { reactive, ref } from "vue";

const activeMenu = ref("basic");

const basicForm = reactive<BasicSettings>({
  ...mockBasicSettings,
});

const securityForm = reactive<SecuritySettings>({
  ...mockSecuritySettings,
});

const notificationForm = reactive<NotificationSettings>({
  ...mockNotificationSettings,
});

function saveBasicSettings() {
  ElMessage.success("保存成功");
}

function resetBasicSettings() {
  Object.assign(basicForm, mockBasicSettings);
  ElMessage.success("已恢复默认");
}

function saveSecuritySettings() {
  ElMessage.success("保存成功");
}

function resetSecuritySettings() {
  ElMessage.success("已恢复默认");
}

function saveNotificationSettings() {
  ElMessage.success("保存成功");
}

function resetNotificationSettings() {
  ElMessage.success("已恢复默认");
}
</script>

<style lang="scss" scoped>
.settings-page {
  .settings-tabs {
    margin-bottom: 10px;
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
</style>
