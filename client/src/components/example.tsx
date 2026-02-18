import { defineComponent, ref } from "vue";

export default defineComponent({
  name: "ExampleWidget",
  setup() {
    const count = ref(0);
    const name = ref("Tailwind CSS + TSX");

    return () => (
      <div class="min-h-screen bg-gray-100 p-8">
        <div class="mx-auto max-w-2xl">
          {/* 标题卡片 */}
          <div class="mb-6 rounded-xl bg-white p-6 shadow-lg">
            <h1 class="mb-2 text-3xl font-bold text-gray-800">{name.value}</h1>
            <p class="text-gray-600">这是一个使用 TSX 和 Tailwind CSS 的示例组件</p>
          </div>

          {/* 功能演示卡片 */}
          <div class="mb-6 rounded-xl bg-white p-6 shadow-lg">
            <h2 class="mb-4 text-xl font-semibold text-gray-700">交互演示</h2>

            <div class="mb-4 flex items-center gap-4">
              <button
                onClick={() => count.value--}
                class="rounded-lg bg-red-500 px-4 py-2 text-white transition-colors duration-200 hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={count.value <= 0}
              >
                减少
              </button>

              <span class="min-w-[60px] text-center font-mono text-2xl font-bold text-blue-600">
                {count.value}
              </span>

              <button
                onClick={() => count.value++}
                class="rounded-lg bg-green-500 px-4 py-2 text-white transition-colors duration-200 hover:bg-green-600"
              >
                增加
              </button>
            </div>

            <button
              onClick={() => (count.value = 0)}
              class="text-sm text-gray-500 underline hover:text-gray-700"
            >
              重置计数器
            </button>
          </div>

          {/* 状态展示卡片 */}
          <div class="rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white shadow-lg">
            <h2 class="mb-3 text-xl font-semibold">当前状态</h2>
            <div class="grid grid-cols-2 gap-4">
              <div class="rounded-lg bg-white/20 p-3">
                <p class="text-sm opacity-80">计数器值</p>
                <p class="text-2xl font-bold">{count.value}</p>
              </div>
              <div class="rounded-lg bg-white/20 p-3">
                <p class="text-sm opacity-80">状态</p>
                <p class="text-lg font-semibold">
                  {count.value === 0 ? "🟡 归零" : count.value > 0 ? "🟢 正数" : "🔴 负数"}
                </p>
              </div>
            </div>
          </div>

          {/* Tailwind 颜色演示 */}
          <div class="mt-6 rounded-xl bg-white p-6 shadow-lg">
            <h2 class="mb-4 text-xl font-semibold text-gray-700">Tailwind 颜色系统</h2>
            <div class="flex flex-wrap gap-2">
              {[
                "bg-red-500",
                "bg-orange-500",
                "bg-yellow-500",
                "bg-green-500",
                "bg-blue-500",
                "bg-indigo-500",
                "bg-purple-500",
                "bg-pink-500",
              ].map((color) => (
                <div key={color} class={`h-12 w-12 ${color} rounded-lg shadow`} title={color} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  },
});
