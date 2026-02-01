import type { AppConfig } from 'vue'
// import type { App, VNode, h } from 'vue'
import { ElMessage } from 'element-plus'
// import { ElEmpty } from 'element-plus'

export interface VueApp {
  config: AppConfig & {
    errorHandler?: (err: unknown, instance: unknown, info: string) => void
  }
}

export function setupErrorHandler(app: VueApp) {
  // Vue错误处理
  app.config.errorHandler = (err, instance, info) => {
    console.error('Vue Error:', err)
    console.error('Component:', instance)
    console.error('Error Info:', info)
    ElMessage.error('发生错误，请稍后重试1')
  }

  // 全局错误处理
  window.addEventListener('error', (event) => {
    console.error('Global Error:', event.error)
    ElMessage.error('发生错误，请稍后重试2')
  })

  // Promise错误处理
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled Promise Rejection:', event.reason)
    ElMessage.error('发生错误，请稍后重试3')
  })
}

// 错误边界组件
// export const ErrorBoundary = {
//   name: 'ErrorBoundary',
//   props: {
//     fallback: {
//       type: Function as unknown as () => () => VNode,
//       default: () => () => h('div', { class: 'error-boundary' }, [
//         h(ElEmpty, { description: '页面发生错误' })
//       ])
//     }
//   },
//   setup(props: { fallback: () => () => VNode }) {
//     return () => props.fallback()
//   }
// }
