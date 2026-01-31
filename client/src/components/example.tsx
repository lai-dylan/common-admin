import { defineComponent, ref } from 'vue'

export default defineComponent({
  name: 'Example',
  setup() {
    const count = ref(0)
    const name = ref('Tailwind CSS + TSX')

    return () => (
      <div class="min-h-screen bg-gray-100 p-8">
        <div class="max-w-2xl mx-auto">
          {/* 标题卡片 */}
          <div class="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h1 class="text-3xl font-bold text-gray-800 mb-2">
              {name.value}
            </h1>
            <p class="text-gray-600">
              这是一个使用 TSX 和 Tailwind CSS 的示例组件
            </p>
          </div>

          {/* 功能演示卡片 */}
          <div class="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 class="text-xl font-semibold text-gray-700 mb-4">
              交互演示
            </h2>
            
            <div class="flex items-center gap-4 mb-4">
              <button
                onClick={() => count.value--}
                class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={count.value <= 0}
              >
                减少
              </button>
              
              <span class="text-2xl font-mono font-bold text-blue-600 min-w-[60px] text-center">
                {count.value}
              </span>
              
              <button
                onClick={() => count.value++}
                class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200"
              >
                增加
              </button>
            </div>

            <button
              onClick={() => count.value = 0}
              class="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              重置计数器
            </button>
          </div>

          {/* 状态展示卡片 */}
          <div class="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <h2 class="text-xl font-semibold mb-3">
              当前状态
            </h2>
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-white/20 rounded-lg p-3">
                <p class="text-sm opacity-80">计数器值</p>
                <p class="text-2xl font-bold">{count.value}</p>
              </div>
              <div class="bg-white/20 rounded-lg p-3">
                <p class="text-sm opacity-80">状态</p>
                <p class="text-lg font-semibold">
                  {count.value === 0 ? '🟡 归零' : count.value > 0 ? '🟢 正数' : '🔴 负数'}
                </p>
              </div>
            </div>
          </div>

          {/* Tailwind 颜色演示 */}
          <div class="mt-6 bg-white rounded-xl shadow-lg p-6">
            <h2 class="text-xl font-semibold text-gray-700 mb-4">
              Tailwind 颜色系统
            </h2>
            <div class="flex flex-wrap gap-2">
              {['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-blue-500', 'bg-indigo-500', 'bg-purple-500', 'bg-pink-500'].map(color => (
                <div key={color} class={`w-12 h-12 ${color} rounded-lg shadow`} title={color} />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }
})
