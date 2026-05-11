import Link from 'next/link'
import { getAllTools } from '@/lib/notion'
import { toolUrl } from '@/lib/utils'
import type { Tool } from '@/types/tool'

export const dynamic = 'force-static'

export const metadata = {
  title: '全部AI工具',
  description: '精选AI工具完整列表，涵盖写作、编程、设计、办公效率等分类，每个工具均经过实际测评。',
}

function ToolCard({ tool }: { tool: Tool }) {
  const rating = tool.rating > 5 ? tool.rating / 2 : tool.rating
  return (
    <Link href={toolUrl(tool.slug)}
      className="group flex gap-4 p-4 bg-white border border-black/[0.07] rounded-xl hover:border-brand/40 hover:shadow-sm transition-all">
      <div className="w-12 h-12 rounded-xl bg-surface-2 flex items-center justify-center text-2xl flex-shrink-0 border border-black/[0.06]">
        {tool.logo || '🔧'}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h2 className="font-semibold text-ink text-sm group-hover:text-brand transition-colors">{tool.name}</h2>
          {rating > 0 && (
            <span className="text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded flex-shrink-0">
              ★ {rating.toFixed(1)}
            </span>
          )}
        </div>
        <p className="text-xs text-ink-3 mb-2">{tool.maker}</p>
        <p className="text-xs text-ink-2 leading-relaxed line-clamp-2 mb-2">{tool.tagline}</p>
        <div className="flex flex-wrap gap-1">
          {tool.hasFreeVersion && <span className="tool-tag tool-tag-green">免费可用</span>}
          {tool.tags.slice(0, 2).map(t => <span key={t} className="tool-tag">{t}</span>)}
        </div>
      </div>
    </Link>
  )
}

export default async function ToolsPage() {
  const tools = await getAllTools()
  const categories = Array.from(new Set(tools.flatMap(t => t.category))).filter(Boolean)

  return (
    <div className="max-w-content mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-semibold text-ink mb-2">全部 AI 工具</h1>
        <p className="text-ink-3 text-sm">共收录 {tools.length} 个工具，持续更新中</p>
      </div>

      {/* 分类筛选 */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <span className="tool-tag bg-ink text-white border-transparent">全部</span>
          {categories.map(cat => (
            <span key={cat} className="tool-tag cursor-pointer hover:bg-surface-3 transition-colors">{cat}</span>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-3">
        {tools.map(tool => <ToolCard key={tool.slug} tool={tool} />)}
      </div>
    </div>
  )
}
