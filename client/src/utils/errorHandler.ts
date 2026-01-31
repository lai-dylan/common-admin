import type { App } from 'vue'
import { ElMessage } from 'element-plus'

interface VueApp extends App {
  config: {
    errorHandler?: (err: unknown, instance: unknown, info: string) => void
  }
}

export function setupErrorHandler(app: VueApp) {
  // Vue错误处理
  app.config.errorHandler = (err, instance, info) => {
    console.error('Vue Error:', err)
    console.error('Component:', instance)
    console.error('Error Info:', info)
    ElMessage.error('发生错误，请稍后重试')
  }

  // 全局错误处理
  window.addEventListener('error', (event) => {
    console.error('Global Error:', event.error)
    ElMessage.error('发生错误，请稍后重试')
  })

  // Promise错误处理
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled Promise Rejection:', event.reason)
    ElMessage.error('发生错误，请稍后重试')
  })
}

// 错误边界组件
export const ErrorBoundary = {
  name: 'ErrorBoundary',
  props: {
    fallback: {
      type: Function,
      default: () => (
        <div class="error-boundary">
          <el-empty description="页面发生错误" />
        </div>
      ),
    },
  },
  setup(props: { fallback: Function }, { slots }: any) {
    return () => props.fallback()
  },
}
