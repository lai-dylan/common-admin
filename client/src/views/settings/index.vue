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
    margin-bottom: 20px;
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
