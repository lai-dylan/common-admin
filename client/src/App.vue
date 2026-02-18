<template>
  <el-config-provider :empty-values="[0, null, undefined]">
    <router-view />
  </el-config-provider>
</template>

<script setup lang="ts">
// import { useI18n } from 'vue-i18next'
// import en from 'element-plus/dist/locale/en.mjs'
// import zhCn from 'element-plus/dist/locale/zh-cn.mjs'

// const { locale } = useI18n()

// const elementLocale = computed(() => {
//   return locale.value === 'en' ? en : zhCn
// })
</script>

<style lang="scss">
#app {
  width: 100%;
  height: 100vh;
}
</style>
