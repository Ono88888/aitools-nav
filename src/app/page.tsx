import Link from 'next/link'
import { getAllTools } from '@/lib/notion'
import { toolUrl } from '@/lib/utils'
import type { Tool } from '@/types/tool'

// SSG: 构建时执行，无运行时 Notion 请求
export const dynamic = 'force-static'
export const revalidate = false

function ToolCard({ tool }: { tool: Tool }) {
  return (
    <Link
      href={toolUrl(tool.slug)}
      className="group block bg-white border border-black/[0.07] rounded-xl p-5 hover:border-brand/40 hover:shadow-sm transition-all duration-200"
    >
      {/* Logo + 名称 */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-11 h-11 rounded-xl bg-surface-2 flex items-center justify-center text-2xl flex-shrink-0 border border-black/[0.06]">
          {tool.logo}
        </div>
        <div className="min-w-0">
          <h2 className="font-semibold text-ink text-sm leading-snug group-hover:text-brand transition-colors truncate">
            {tool.name}
          </h2>
          <p className="text-xs text-ink-3 mt-0.5">{tool.maker}</p>
        </div>
        {/* 评分角标 */}
        {tool.rating > 0 && (
          <span className="ml-auto text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded-md flex-shrink-0">
            ★ {tool.rating.toFixed(1)}
          </span>
        )}
      </div>

      {/* 简介 */}
      <p className="text-xs text-ink-2 leading-relaxed line-clamp-2 mb-3">
        {tool.tagline}
      </p>

      {/* 标签 */}
      <div className="flex flex-wrap gap-1.5">
        {tool.hasFreeVersion && (
          <span className="tool-tag tool-tag-green">免费可用</span>
        )}
        {tool.tags.slice(0, 2).map(tag => (
          <span key={tag} className="tool-tag">{tag}</span>
        ))}
      </div>
    </Link>
  )
}

export default async function HomePage() {
  const tools = await getAllTools()

  // 按分类分组
  const byCategory = tools.reduce<Record<string, Tool[]>>((acc, tool) => {
    const cat = tool.category[0] ?? '其他'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(tool)
    return acc
  }, {})

  const categories = Object.keys(byCategory)

  return (
    <div className="max-w-content mx-auto px-4 py-8">

      {/* Hero */}
      <div className="text-center py-12 mb-8">
        <h1 className="font-serif text-4xl font-semibold text-ink mb-4 leading-tight">
          发现最好用的 AI 工具
        </h1>
        <p className="text-ink-2 text-lg max-w-xl mx-auto leading-relaxed">
          深度测评 · 真实评分 · 中文用户视角<br />
          <span className="text-ink-3 text-base">每个工具都经过实际使用，不只是搬运官网介绍</span>
        </p>
      </div>

      {/* 分类工具列表 */}
      {categories.length === 0 ? (
        // 开发环境占位（Notion 未配置时显示）
        <div className="text-center py-20 text-ink-3">
          <p className="text-lg mb-2">暂无工具数据</p>
          <p className="text-sm">请先配置 .env.local 中的 Notion API 密钥</p>
        </div>
      ) : (
        <div className="space-y-10">
          {categories.map(cat => (
            <section key={cat} aria-labelledby={`cat-${cat}`}>
              <div className="flex items-center justify-between mb-4">
                <h2 id={`cat-${cat}`} className="font-serif text-lg font-semibold text-ink">
                  {cat}
                </h2>
                <span className="text-xs text-ink-3">{byCategory[cat].length} 个工具</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {byCategory[cat].map(tool => (
                  <ToolCard key={tool.slug} tool={tool} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* CTA 底部 */}
      <div className="mt-16 text-center py-10 bg-surface-2 rounded-2xl border border-black/[0.06]">
        <p className="text-ink-2 mb-3">没找到你要找的工具？</p>
        <Link
          href="/submit/"
          className="btn-secondary text-sm"
        >
          提交工具收录申请 →
        </Link>
      </div>
    </div>
  )
}
