<template>
  <div class="p-6">
    <UiButton type="primary" @click="dialogVisible = true">打开编辑公告弹窗</UiButton>

    <UiDialog
      v-model="dialogVisible"
      title="编辑公告"
      width="760"
      @cancel="dialogVisible = false"
      @confirm="handleConfirm"
    >
      <div class="dialog-form">
        <el-form label-position="top">
          <el-form-item label="*公告类型">
            <el-select v-model="form.noticeType" placeholder="请选择公告类型">
              <el-option label="系统公告" value="system" />
              <el-option label="活动公告" value="activity" />
            </el-select>
          </el-form-item>

          <el-form-item label="*发布群">
            <el-input v-model="form.group" placeholder="请输入发布群" />
          </el-form-item>

          <el-form-item label="*发布时长">
            <el-input v-model="form.duration" placeholder="请输入发布时长" />
          </el-form-item>

          <el-form-item label="*选择语种">
            <div class="lang-row">
              <UiButton
                v-for="lang in languages"
                :key="lang.value"
                :type="form.lang === lang.value ? 'outline' : 'secondary'"
                @click="form.lang = lang.value"
              >
                {{ lang.label }}
              </UiButton>
            </div>
          </el-form-item>

          <el-form-item label="*公告标题">
            <el-input v-model="form.title" placeholder="请输入公告标题" maxlength="300" />
          </el-form-item>

          <el-form-item label="*公告内容">
            <el-input
              v-model="form.content"
              type="textarea"
              :rows="5"
              placeholder="请输入公告内容"
              maxlength="300"
              show-word-limit
            />
          </el-form-item>
        </el-form>
      </div>
    </UiDialog>
  </div>
</template>
<script setup lang="ts">
import UiButton from "@/components/common/ui/ui-button.vue";
import UiDialog from "@/components/common/ui/ui-dialog.vue";
import { ElMessage } from "element-plus";
import { reactive, ref } from "vue";

const dialogVisible = ref(false);

const languages = [
  { label: "zh-cn", value: "zh-cn" },
  { label: "us-en", value: "us-en" },
  { label: "vi-vn", value: "vi-vn" },
];

const form = reactive({
  noticeType: "",
  group: "",
  duration: "",
  lang: "zh-cn",
  title: "",
  content: "",
});

function handleConfirm() {
  dialogVisible.value = false;
  ElMessage.success("已确认");
}
</script>

<style scoped lang="scss">
//.dialog-form {
//  :deep(.el-form-item) {
//    margin-bottom: 14px;
//  }
//
//  :deep(.el-form-item__label) {
//    color: rgba(255, 255, 255, 0.6);
//    font-size: 12px;
//    font-weight: 600;
//    line-height: 1.2;
//    margin-bottom: 6px;
//  }
//
//  :deep(.el-input__wrapper),
//  :deep(.el-textarea__inner),
//  :deep(.el-select__wrapper) {
//    background: rgba(255, 255, 255, 0.1);
//    box-shadow: none;
//    border-radius: 8px;
//    border: 1px solid rgba(255, 255, 255, 0.2);
//  }
//
//  :deep(.el-input__inner),
//  :deep(.el-select__placeholder),
//  :deep(.el-textarea__inner) {
//    color: #999;
//    font-size: 12px;
//    font-weight: 600;
//  }
//
//  :deep(.el-input__inner::placeholder),
//  :deep(.el-textarea__inner::placeholder) {
//    color: #999;
//  }
//}

//.lang-row {
//  display: flex;
//  gap: 8px;
//}
</style>
