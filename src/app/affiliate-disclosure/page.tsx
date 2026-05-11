import { SITE_NAME, SITE_URL } from '@/lib/utils'

export const metadata = { title: '联盟推广声明' }

export default function AffiliateDisclosurePage() {
  return (
    <div className="max-w-content mx-auto px-4 py-12">
      <div className="max-w-xl">
        <h1 className="font-serif text-3xl font-semibold text-ink mb-2">联盟推广声明</h1>
        <p className="text-ink-3 text-xs mb-8">最后更新：2025年5月</p>
        <div className="space-y-4 text-ink-2 text-sm leading-relaxed">
          <p>
            {SITE_NAME}（{SITE_URL}）参与了部分AI工具的联盟推广计划。
            这意味着当您通过本站的链接购买产品或服务时，本站可能会获得一定比例的佣金。
          </p>
          <h2 className="font-serif text-base font-semibold text-ink pt-2">对您的影响</h2>
          <ul className="space-y-2">
            {[
              '联盟链接不会增加您的购买价格，您支付的金额与直接访问官网完全相同',
              '佣金由服务商支付，不由您承担',
              '本站会在包含联盟链接的页面明确标注「联盟链接」字样',
            ].map(p => <li key={p} className="flex items-start gap-2"><span className="text-brand flex-shrink-0">•</span>{p}</li>)}
          </ul>
          <h2 className="font-serif text-base font-semibold text-ink pt-2">评测独立性</h2>
          <p>
            联盟关系不影响本站的评测结果和评分。本站收录或推荐某个工具，
            是基于其对中文用户的实际价值，而非是否有联盟佣金。
            部分评分较高的工具并没有联盟计划，部分有联盟计划的工具评分并不高。
          </p>
          <h2 className="font-serif text-base font-semibold text-ink pt-2">哪些链接是联盟链接</h2>
          <p>
            所有联盟链接均标注有 <code className="bg-surface-2 px-1.5 py-0.5 rounded text-xs">rel="sponsored"</code> 属性，
            并在页面显眼位置注明「联盟链接」。
          </p>
        </div>
      </div>
    </div>
  )
}
