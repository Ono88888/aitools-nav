export const dynamic = 'force-static'
export const metadata = {
  title: 'AI周报 - 每周AI工具动态',
  description: '每周精选AI工具更新、新品发布、价格变动，帮你掌握AI领域最新动态。',
}

// 示例周报数据（后续可接入 Notion 独立数据库）
const ISSUES = [
  {
    issue: 1,
    date: '2025年5月第2周',
    title: 'Claude 3.5 升级、GPT-4o 降价、Midjourney v7 发布',
    highlights: [
      'Anthropic 发布 Claude 3.5 Sonnet 更新版，代码能力大幅提升',
      'OpenAI 下调 GPT-4o API 价格，输入 token 降价 50%',
      'Midjourney v7 开始内测，支持更精细的风格控制',
      'Google Gemini 1.5 Pro 上下文窗口扩展至 200 万 token',
    ],
    toolsUpdated: ['claude-ai', 'chatgpt', 'midjourney'],
  },
]

export default function WeeklyPage() {
  return (
    <div className="max-w-content mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-semibold text-ink mb-2">AI 周报</h1>
        <p className="text-ink-3 text-sm mb-6">每周一发布，追踪AI工具最新动态</p>

        {/* 订阅入口 */}
        <div className="bg-surface-2 border border-black/[0.07] rounded-xl p-5 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div>
            <div className="font-medium text-ink text-sm mb-1">订阅周报，不错过任何更新</div>
            <div className="text-xs text-ink-3">每周一封，可随时退订</div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 sm:w-48 px-3 py-2 text-sm border border-black/[0.1] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand/30"
            />
            <button className="btn-affiliate text-sm whitespace-nowrap">订阅</button>
          </div>
        </div>
      </div>

      {/* 周报列表 */}
      <div className="space-y-6">
        {ISSUES.map(issue => (
          <article key={issue.issue} className="bg-white border border-black/[0.07] rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-semibold bg-surface-2 text-ink-3 px-2.5 py-1 rounded-full">
                第 {issue.issue} 期
              </span>
              <span className="text-xs text-ink-3">{issue.date}</span>
            </div>
            <h2 className="font-serif text-lg font-semibold text-ink mb-4">{issue.title}</h2>
            <ul className="space-y-2 mb-4">
              {issue.highlights.map((h, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-ink-2">
                  <span className="text-brand mt-0.5 flex-shrink-0">•</span>
                  {h}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </div>
  )
}
