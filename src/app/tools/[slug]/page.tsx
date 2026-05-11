import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getAllTools, getToolBySlug } from '@/lib/notion'
import { buildToolSchema, formatDate, scoreColor, scoreTextColor, SITE_URL, toolUrl } from '@/lib/utils'
import type { Tool, PricePlan } from '@/types/tool'

// ── SSG: 构建时生成所有工具页 ────────────────────────────────
export async function generateStaticParams() {
  const tools = await getAllTools()
  return tools.map(t => ({ slug: t.slug }))
}

// ── 动态 Metadata（每页独立 SEO）────────────────────────────
export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  const tool = await getToolBySlug(params.slug)
  if (!tool) return { title: '工具未找到' }

  const pageUrl = `${SITE_URL}/tools/${tool.slug}/`

  return {
    title: tool.seoTitle || `${tool.name} 怎么用？功能、价格、中文使用教程 [2025最新]`,
    description: tool.seoDesc,
    alternates: { canonical: pageUrl },
    openGraph: {
      title: tool.seoTitle,
      description: tool.seoDesc,
      url: pageUrl,
      type: 'article',
      publishedTime: tool.publishedAt,
      modifiedTime: tool.updatedAt,
      images: [{ url: tool.ogImage, width: 1200, height: 630 }],
    },
  }
}

// ── 子组件 ────────────────────────────────────────────────────

function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating)
  const half = rating - full >= 0.5
  return (
    <span aria-label={`评分 ${rating} 分（满分5分）`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < full ? 'text-amber-400' : i === full && half ? 'text-amber-300' : 'text-surface-3'}>
          ★
        </span>
      ))}
    </span>
  )
}

function ScoreBar({ feature, score }: { feature: string; score: number }) {
  return (
    <tr className="border-b border-black/[0.05] last:border-0">
      <td className="py-3 pr-4 text-sm text-ink-2 w-40">{feature}</td>
      <td className="py-3 pr-4">
        <div className="h-1.5 bg-surface-3 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full score-bar-fill ${scoreColor(score)}`}
            style={{ width: `${score * 10}%` }}
          />
        </div>
      </td>
      <td className={`py-3 text-sm font-semibold text-right w-12 ${scoreTextColor(score)}`}>
        {score.toFixed(1)}
      </td>
    </tr>
  )
}

function PriceCard({ plan }: { plan: PricePlan }) {
  return (
    <div className={`relative border rounded-xl p-5 flex flex-col gap-4 bg-white ${
      plan.featured
        ? 'border-brand border-2 shadow-sm'
        : 'border-black/[0.08]'
    }`}>
      {plan.featured && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand text-white text-xs font-semibold px-3 py-0.5 rounded-full whitespace-nowrap">
          最受欢迎
        </div>
      )}
      <div>
        <div className="text-xs font-semibold text-ink-3 uppercase tracking-wider mb-2">{plan.name}</div>
        <div className="text-3xl font-bold text-ink">
          {plan.currency === 'USD' ? '$' : '¥'}{plan.price}
          <span className="text-sm font-normal text-ink-3">{plan.period}</span>
        </div>
      </div>
      <ul className="space-y-2 flex-1">
        {plan.features.map(f => (
          <li key={f} className="flex items-start gap-2 text-sm text-ink-2">
            <span className="text-emerald-500 font-bold mt-0.5 flex-shrink-0">✓</span>
            {f}
          </li>
        ))}
        {plan.notFeatures.map(f => (
          <li key={f} className="flex items-start gap-2 text-sm text-ink-4">
            <span className="flex-shrink-0 mt-0.5">✕</span>
            {f}
          </li>
        ))}
      </ul>
      <a
        href={plan.ctaUrl}
        target="_blank"
        rel="nofollow noopener sponsored"
        className={plan.featured ? 'btn-affiliate justify-center' : 'btn-secondary justify-center text-sm'}
      >
        {plan.cta}
      </a>
    </div>
  )
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="border border-black/[0.07] rounded-xl overflow-hidden group">
      <summary className="flex items-center justify-between gap-3 p-4 bg-surface-2 cursor-pointer hover:bg-surface-3 transition-colors text-sm font-medium text-ink select-none">
        {question}
        <span className="text-ink-3 group-open:rotate-180 transition-transform duration-200 flex-shrink-0">▾</span>
      </summary>
      <div className="p-4 pt-3 text-sm text-ink-2 leading-relaxed">
        {answer}
      </div>
    </details>
  )
}

function SidebarInfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-start gap-2 py-2.5 border-b border-black/[0.05] last:border-0 text-sm">
      <span className="text-ink-3 flex-shrink-0">{label}</span>
      <span className="text-ink font-medium text-right">{value}</span>
    </div>
  )
}

// ── 主页面组件 ─────────────────────────────────────────────────
export default async function ToolPage({ params }: { params: { slug: string } }) {
  const tool = await getToolBySlug(params.slug)
  if (!tool) notFound()

  const schema = buildToolSchema(tool)
  const ratingOutOf5 = tool.rating > 5 ? tool.rating / 2 : tool.rating

  return (
    <>
      {/* ── JSON-LD Schema ── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <div className="max-w-content mx-auto px-4">

        {/* ── 面包屑 ── */}
        <nav aria-label="面包屑" className="py-3 text-xs text-ink-3 flex items-center gap-1.5">
          <Link href="/" className="hover:text-ink transition-colors">首页</Link>
          <span>›</span>
          <Link href="/tools/" className="hover:text-ink transition-colors">AI工具</Link>
          <span>›</span>
          <span className="text-ink-2" aria-current="page">{tool.name}</span>
        </nav>

        {/* ══════════════════════════════════════
            HERO
        ══════════════════════════════════════ */}
        <section className="py-8 border-b border-black/[0.06]">
          {/* 工具 Logo + 名称 */}
          <div className="flex items-start gap-4 mb-5">
            <div className="w-16 h-16 rounded-2xl bg-surface-2 border border-black/[0.07] flex items-center justify-center text-3xl flex-shrink-0">
              {tool.logo}
            </div>
            <div>
              <h1 className="font-serif text-3xl font-semibold text-ink leading-tight">
                {tool.name}
              </h1>
              <p className="text-sm text-ink-3 mt-1">
                由 {tool.maker} 开发 ·{' '}
                <time dateTime={tool.updatedAt}>
                  最后更新：{formatDate(tool.updatedAt)}
                </time>
              </p>
            </div>
          </div>

          {/* 一句话介绍 */}
          <p className="text-lg text-ink-2 leading-relaxed mb-5 max-w-2xl">
            {tool.tagline}
          </p>

          {/* 评分 + 标签 */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            {tool.rating > 0 && (
              <div
                className="flex items-center gap-2"
                itemScope itemType="https://schema.org/AggregateRating"
              >
                <span className="text-lg" itemProp="ratingValue">{ratingOutOf5.toFixed(1)}</span>
                <StarRating rating={ratingOutOf5} />
                <span className="text-sm text-ink-3">
                  (<span itemProp="reviewCount">{tool.reviewCount.toLocaleString()}</span>条评价)
                </span>
                <meta itemProp="bestRating" content="5" />
              </div>
            )}
            <div className="flex flex-wrap gap-1.5">
              {tool.hasFreeVersion && (
                <span className="tool-tag tool-tag-green">✓ 免费可用</span>
              )}
              {tool.hasApi && (
                <span className="tool-tag tool-tag-blue">✓ API开放</span>
              )}
              {tool.tags.map(tag => (
                <span key={tag} className="tool-tag">{tag}</span>
              ))}
            </div>
          </div>

          {/* CTA 按钮 */}
          <div className="flex flex-wrap gap-3">
            <a
              href={tool.affiliateUrl}
              target="_blank"
              rel="nofollow noopener sponsored"
              className="btn-affiliate"
            >
              🚀 免费开始使用
            </a>
            <a href="#price" className="btn-secondary">
              查看价格 ↓
            </a>
          </div>
          <p className="text-xs text-ink-4 mt-2">
            * 上方为联盟链接，点击可能为本站带来佣金，不影响您的价格。
            <Link href="/affiliate-disclosure/" className="underline ml-1">了解更多</Link>
          </p>
        </section>

        {/* ── 快速数据 ── */}
        <section
          aria-label="快速数据"
          className="grid grid-cols-2 sm:grid-cols-4 border-b border-black/[0.06]"
        >
          {[
            { label: '免费版限额', value: tool.freeLimit },
            { label: '最低价格', value: tool.pricingStart },
            { label: '上下文窗口', value: tool.contextWindow },
            { label: '综合评分', value: `${ratingOutOf5.toFixed(1)} / 5` },
          ].map(({ label, value }) => value ? (
            <div key={label} className="py-5 px-4 border-r border-black/[0.06] last:border-r-0">
              <div className="text-[11px] font-medium text-ink-3 uppercase tracking-wider mb-1">{label}</div>
              <div className="text-lg font-semibold text-ink">{value}</div>
            </div>
          ) : null)}
        </section>

        {/* ══════════════════════════════════════
            主体 + 侧边栏
        ══════════════════════════════════════ */}
        <div className="py-8 grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-10">

          {/* ── 主内容 ── */}
          <article className="space-y-0 min-w-0">

            {/* 简介 */}
            {tool.introduction && (
              <section aria-labelledby="intro-heading">
                <h2 id="intro-heading" className="section-heading">什么是 {tool.name}？</h2>
                <div className="text-ink-2 leading-relaxed text-sm prose-p:mb-3">
                  {tool.introduction}
                </div>
              </section>
            )}

            {/* 功能评分 */}
            {tool.scores.length > 0 && (
              <section id="features" aria-labelledby="scores-heading">
                <h2 id="scores-heading" className="section-heading">核心功能评分</h2>
                <table className="w-full" aria-label="功能评分表">
                  <thead className="sr-only">
                    <tr><th>功能</th><th>评分条</th><th>分数</th></tr>
                  </thead>
                  <tbody>
                    {tool.scores.map(s => (
                      <ScoreBar key={s.feature} feature={s.feature} score={s.score} />
                    ))}
                  </tbody>
                </table>
              </section>
            )}

            {/* 使用场景实测 */}
            {tool.scenarios.length > 0 && (
              <section id="scenarios" aria-labelledby="scenarios-heading">
                <h2 id="scenarios-heading" className="section-heading">使用场景实测</h2>
                <div className="space-y-4">
                  {tool.scenarios.map((s, i) => (
                    <div key={i} className="border border-black/[0.07] rounded-xl overflow-hidden">
                      <div className="flex items-center gap-3 p-4 bg-surface-2">
                        <span className="text-xl" aria-hidden="true">{s.icon}</span>
                        <span className="font-semibold text-sm text-ink flex-1">{s.title}</span>
                        <span className={`text-sm font-semibold ${scoreTextColor(s.score)}`}>
                          ⭐ {s.score.toFixed(1)}分
                        </span>
                      </div>
                      <div className="p-4 space-y-3 text-sm text-ink-2 leading-relaxed">
                        <p>{s.description}</p>
                        {s.promptExample && (
                          <div>
                            <div className="text-xs font-semibold text-ink-3 mb-1.5">实测 Prompt：</div>
                            <blockquote className="border-l-2 border-brand pl-3 py-2 bg-surface-2 rounded-r-lg text-sm text-ink-2 italic">
                              {s.promptExample}
                            </blockquote>
                          </div>
                        )}
                        {s.result && <p className="text-ink-3 text-xs">{s.result}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 价格方案 */}
            {tool.pricing.length > 0 && (
              <section id="price" aria-labelledby="price-heading">
                <h2 id="price-heading" className="section-heading">价格方案</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {tool.pricing.map(p => <PriceCard key={p.name} plan={p} />)}
                </div>
                <p className="text-xs text-ink-3 mt-3">
                  * 价格以美元计，受汇率影响，实际人民币费用有所浮动。以官网实时显示为准。
                </p>
              </section>
            )}

            {/* 优缺点 */}
            {(tool.prosAndCons.pros.length > 0 || tool.prosAndCons.cons.length > 0) && (
              <section id="pros-cons" aria-labelledby="pros-cons-heading">
                <h2 id="pros-cons-heading" className="section-heading">优缺点总结</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                    <h3 className="text-sm font-semibold text-emerald-700 mb-3">👍 优点</h3>
                    <ul className="space-y-2">
                      {tool.prosAndCons.pros.map(p => (
                        <li key={p} className="flex items-start gap-2 text-sm text-emerald-800">
                          <span className="text-emerald-500 flex-shrink-0 mt-0.5">✓</span>
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                    <h3 className="text-sm font-semibold text-red-700 mb-3">👎 缺点</h3>
                    <ul className="space-y-2">
                      {tool.prosAndCons.cons.map(c => (
                        <li key={c} className="flex items-start gap-2 text-sm text-red-800">
                          <span className="text-red-400 flex-shrink-0 mt-0.5">✕</span>
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>
            )}

            {/* FAQ */}
            {tool.faq.length > 0 && (
              <section id="faq" aria-labelledby="faq-heading">
                <h2 id="faq-heading" className="section-heading">常见问题</h2>
                <div className="space-y-2">
                  {tool.faq.map(item => (
                    <FaqItem key={item.question} {...item} />
                  ))}
                </div>
              </section>
            )}

            {/* 编辑总结 */}
            {tool.verdict && (
              <section id="verdict" aria-labelledby="verdict-heading">
                <h2 id="verdict-heading" className="section-heading">编辑总结</h2>
                <div className="bg-surface-2 border border-black/[0.06] rounded-xl p-5 text-sm text-ink-2 leading-relaxed">
                  {tool.verdict}
                </div>
              </section>
            )}

            {/* 底部联盟 CTA */}
            <div className="mt-8 p-6 bg-surface-2 border border-black/[0.06] rounded-2xl text-center">
              <p className="text-ink-2 mb-3 text-sm">准备好试试 {tool.name} 了吗？</p>
              <a
                href={tool.affiliateUrl}
                target="_blank"
                rel="nofollow noopener sponsored"
                className="btn-affiliate"
              >
                前往 {tool.name} 官网 →
              </a>
              <p className="text-xs text-ink-4 mt-2">联盟链接 · 点击可能为本站带来佣金</p>
            </div>

            {/* 联盟披露 */}
            <div className="mt-6 p-4 bg-surface-2 rounded-xl border border-black/[0.06]">
              <p className="text-xs text-ink-3 leading-relaxed">
                <strong className="text-ink-2">联盟声明：</strong>
                本页包含联盟推广链接。当您通过本站链接购买产品时，本站可能获得佣金，不影响您的价格，也不影响我们的独立评测。
                所有评分基于实际测试，不受广告主影响。
                <Link href="/affiliate-disclosure/" className="underline ml-1 hover:text-ink-2 transition-colors">
                  查看完整声明 →
                </Link>
              </p>
            </div>

          </article>

          {/* ── 侧边栏 ── */}
          <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start" aria-label="工具信息">

            {/* 工具信息卡 */}
            <div className="info-card">
              <h3 className="text-xs font-semibold text-ink-3 uppercase tracking-wider mb-3">工具信息</h3>
              <SidebarInfoRow label="开发商" value={tool.maker} />
              <SidebarInfoRow label="上线时间" value={tool.launchDate} />
              <SidebarInfoRow
                label="免费版"
                value={<span className={tool.hasFreeVersion ? 'text-emerald-600' : 'text-ink-4'}>
                  {tool.hasFreeVersion ? '✓ 有' : '✕ 无'}
                </span>}
              />
              <SidebarInfoRow label="起步价格" value={tool.pricingStart} />
              <SidebarInfoRow
                label="API 开放"
                value={<span className={tool.hasApi ? 'text-emerald-600' : 'text-ink-4'}>
                  {tool.hasApi ? '✓ 是' : '✕ 否'}
                </span>}
              />
              <SidebarInfoRow label="支持平台" value={tool.platforms.join(' / ')} />
              <SidebarInfoRow
                label="官网"
                value={
                  <a href={tool.websiteUrl} target="_blank" rel="noopener nofollow"
                    className="text-brand hover:underline">
                    访问 ↗
                  </a>
                }
              />
            </div>

            {/* 快速导航 */}
            <div className="info-card">
              <h3 className="text-xs font-semibold text-ink-3 uppercase tracking-wider mb-3">快速导航</h3>
              <nav aria-label="页内导航">
                <ul className="space-y-1">
                  {[
                    { href: '#features', label: '功能评分' },
                    { href: '#scenarios', label: '使用场景实测' },
                    { href: '#price', label: '价格方案' },
                    { href: '#pros-cons', label: '优缺点' },
                    { href: '#faq', label: '常见问题' },
                    { href: '#verdict', label: '编辑总结' },
                  ].map(({ href, label }) => (
                    <li key={href}>
                      <a
                        href={href}
                        className="block text-sm text-ink-3 hover:text-ink hover:bg-surface-2 px-2 py-1.5 rounded-lg transition-colors"
                      >
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>

            {/* 侧边联盟 CTA */}
            <div className="border-2 border-brand/20 bg-blue-50/50 rounded-xl p-4 text-center">
              <p className="text-sm text-ink-2 mb-3">
                🎉 立即免费试用 {tool.name}
              </p>
              <a
                href={tool.affiliateUrl}
                target="_blank"
                rel="nofollow noopener sponsored"
                className="btn-affiliate w-full justify-center text-sm"
              >
                免费开始
              </a>
              <p className="text-[11px] text-ink-4 mt-2">联盟链接</p>
            </div>

            {/* 相似工具 */}
            {tool.similarTools.length > 0 && (
              <div className="info-card">
                <h3 className="text-xs font-semibold text-ink-3 uppercase tracking-wider mb-3">相似工具</h3>
                <div className="space-y-1">
                  {tool.similarTools.map(st => (
                    <Link
                      key={st.slug}
                      href={toolUrl(st.slug)}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-2 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-surface-3 flex items-center justify-center text-base flex-shrink-0">
                        {st.logo}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-ink group-hover:text-brand transition-colors truncate">
                          {st.name}
                        </div>
                        <div className="text-xs text-ink-3">{st.maker} · {st.priceLabel}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

          </aside>
        </div>
      </div>
    </>
  )
}
