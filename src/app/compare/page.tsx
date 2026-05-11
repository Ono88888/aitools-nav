import Link from 'next/link'
import { getAllTools } from '@/lib/notion'
import { toolUrl } from '@/lib/utils'

export const dynamic = 'force-static'
export const metadata = {
  title: '工具横向对比',
  description: '主流AI工具深度横向对比：ChatGPT vs Claude，Midjourney vs Stable Diffusion等。',
}

// 预设的热门对比组合
const COMPARE_PAIRS = [
  { a: 'claude-ai', b: 'chatgpt', label: 'Claude vs ChatGPT', desc: '两大顶级AI对话助手全面横测' },
  { a: 'midjourney', b: 'stable-diffusion', label: 'Midjourney vs Stable Diffusion', desc: 'AI绘图工具终极对比' },
  { a: 'notion-ai', b: 'chatgpt', label: 'Notion AI vs ChatGPT', desc: '办公写作AI谁更好用' },
]

export default async function ComparePage() {
  const tools = await getAllTools()
  const toolMap = Object.fromEntries(tools.map(t => [t.slug, t]))

  return (
    <div className="max-w-content mx-auto px-4 py-8">
      <h1 className="font-serif text-3xl font-semibold text-ink mb-2">工具横向对比</h1>
      <p className="text-ink-3 text-sm mb-8">帮你在同类工具中做出最佳选择</p>

      {/* 热门对比 */}
      <div className="mb-10">
        <h2 className="font-serif text-lg font-semibold text-ink mb-4">热门对比</h2>
        <div className="flex flex-col gap-3">
          {COMPARE_PAIRS.map(pair => {
            const toolA = toolMap[pair.a]
            const toolB = toolMap[pair.b]
            return (
              <div key={pair.label} className="flex items-center gap-4 p-4 bg-white border border-black/[0.07] rounded-xl">
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-2xl">{toolA?.logo || '🔧'}</span>
                  <span className="font-medium text-sm text-ink">{toolA?.name || pair.a}</span>
                  <span className="text-ink-3 text-xs px-2">VS</span>
                  <span className="text-2xl">{toolB?.logo || '🔧'}</span>
                  <span className="font-medium text-sm text-ink">{toolB?.name || pair.b}</span>
                </div>
                <Link
                  href={`/compare/${pair.a}-vs-${pair.b}/`}
                  className="text-xs text-brand hover:underline flex-shrink-0"
                >
                  查看对比 →
                </Link>
              </div>
            )
          })}
        </div>
      </div>

      {/* 全部工具列表（可自行选择对比） */}
      <div>
        <h2 className="font-serif text-lg font-semibold text-ink mb-4">所有工具（共 {tools.length} 个）</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {tools.map(tool => (
            <Link key={tool.slug} href={toolUrl(tool.slug)}
              className="flex items-center gap-3 p-3 bg-white border border-black/[0.07] rounded-lg hover:border-brand/40 transition-colors group">
              <span className="text-xl">{tool.logo || '🔧'}</span>
              <div className="min-w-0">
                <div className="text-sm font-medium text-ink group-hover:text-brand transition-colors truncate">{tool.name}</div>
                <div className="text-xs text-ink-3 truncate">{tool.maker}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
