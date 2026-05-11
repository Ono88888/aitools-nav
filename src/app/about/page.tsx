import { SITE_NAME } from '@/lib/utils'

export const metadata = { title: '关于本站' }

export default function AboutPage() {
  return (
    <div className="max-w-content mx-auto px-4 py-12">
      <div className="max-w-xl">
        <h1 className="font-serif text-3xl font-semibold text-ink mb-6">关于 {SITE_NAME}</h1>
        <div className="space-y-4 text-ink-2 text-sm leading-relaxed">
          <p>
            {SITE_NAME} 是一个独立运营的AI工具评测导航站。我自己在日常工作中重度使用各类AI工具，
            发现市面上的工具介绍大多是翻译官网文案，缺乏真实的中文用户视角。
          </p>
          <p>
            所以我开始记录自己的使用体验，测试每个工具的真实能力，写下对中文用户最有价值的判断。
          </p>
          <h2 className="font-serif text-lg font-semibold text-ink pt-4">评测原则</h2>
          <ul className="space-y-2">
            {['每个工具都经过实际使用，不搬运官网介绍', '评分基于具体使用场景，不是综合印象分',
              '会明确标注哪些是付费功能、哪些有使用限制', '价格信息定期更新，以官网实时显示为准'].map(p => (
              <li key={p} className="flex items-start gap-2">
                <span className="text-emerald-500 flex-shrink-0 mt-0.5">✓</span>{p}
              </li>
            ))}
          </ul>
          <h2 className="font-serif text-lg font-semibold text-ink pt-4">联系方式</h2>
          <p>有工具想推荐收录，或发现评测有误，欢迎通过邮件联系：<a href="mailto:hello@yourdomain.com" className="text-brand hover:underline">hello@yourdomain.com</a></p>
        </div>
      </div>
    </div>
  )
}
