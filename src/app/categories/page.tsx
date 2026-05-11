import Link from 'next/link'
import { getAllTools } from '@/lib/notion'

export const dynamic = 'force-static'
export const metadata = {
  title: '工具分类',
  description: '按分类浏览AI工具：写作助手、编程工具、图像生成、办公效率等。',
}

const CATEGORY_ICONS: Record<string, string> = {
  'AI对话': '💬', '写作助手': '✍️', '编程工具': '💻', '图像生成': '🎨',
  '视频工具': '🎬', '音频工具': '🎵', '办公效率': '📊', '搜索工具': '🔍',
  '教育学习': '📚', '数据分析': '📈', '其他': '🔧',
}

export default async function CategoriesPage() {
  const tools = await getAllTools()
  const categoryMap: Record<string, number> = {}
  tools.forEach(t => {
    const cat = t.category[0] || '其他'
    categoryMap[cat] = (categoryMap[cat] || 0) + 1
  })
  const categories = Object.entries(categoryMap).sort((a, b) => b[1] - a[1])

  return (
    <div className="max-w-content mx-auto px-4 py-8">
      <h1 className="font-serif text-3xl font-semibold text-ink mb-2">工具分类</h1>
      <p className="text-ink-3 text-sm mb-8">按使用场景找到最合适的AI工具</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {categories.map(([cat, count]) => (
          <Link key={cat} href={`/tools/?category=${encodeURIComponent(cat)}`}
            className="group p-5 bg-white border border-black/[0.07] rounded-xl hover:border-brand/40 hover:shadow-sm transition-all">
            <div className="text-3xl mb-3">{CATEGORY_ICONS[cat] || '🔧'}</div>
            <div className="font-semibold text-ink text-sm group-hover:text-brand transition-colors mb-1">{cat}</div>
            <div className="text-xs text-ink-3">{count} 个工具</div>
          </Link>
        ))}
      </div>
    </div>
  )
}
