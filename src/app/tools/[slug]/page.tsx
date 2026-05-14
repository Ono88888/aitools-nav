import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { ALL_TOOLS, getToolBySlug } from '@/lib/tools-data'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://gowukong.co'

// ── SSG：构建时生成所有工具页 ────────────────────────────────
export function generateStaticParams() {
  return ALL_TOOLS.map(t => ({ slug: t.slug }))
}

// ── 动态 SEO Metadata ────────────────────────────────────────
export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  const tool = getToolBySlug(params.slug)
  if (!tool) return { title: '工具未找到' }

  const title = `${tool.name} 怎么用？功能评测、价格、中文教程 [2025]`
  const description = `${tool.name} 深度评测：${tool.tagline}。价格：${tool.price}，${tool.hasFree ? '有免费版，' : ''}${tool.cnAccess ? '国内可直接访问。' : '需要翻墙。'}适合${tool.bestFor}。`
  const pageUrl = `${SITE_URL}/tools/${tool.slug}/`

  return {
    title,
    description,
    keywords: [tool.name, ...tool.tags, tool.category, 'AI工具', '使用教程', '评测'].join(','),
    alternates: { canonical: pageUrl },
    openGraph: {
      title,
      description,
      url: pageUrl,
      type: 'article',
      siteName: 'GO悟空 AI导航',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  }
}

// ── FAQ 数据生成 ─────────────────────────────────────────────
function buildFAQ(tool: ReturnType<typeof getToolBySlug>) {
  if (!tool) return []
  return [
    {
      q: `${tool.name} 是免费的吗？`,
      a: tool.hasFree
        ? `${tool.name} 提供免费版本。${tool.priceDetail}`
        : `${tool.name} 是付费产品。${tool.priceDetail}`,
    },
    {
      q: `${tool.name} 国内能用吗？`,
      a: tool.cnAccess
        ? `${tool.name} 在中国大陆可以直接访问使用，无需VPN。`
        : `${tool.name} 在中国大陆需要科学上网（VPN）才能访问。`,
    },
    {
      q: `${tool.name} 有API吗？`,
      a: tool.hasApi
        ? `${tool.name} 提供官方API，开发者可以接入到自己的产品中。`
        : `${tool.name} 目前暂未开放公开API。`,
    },
    {
      q: `${tool.name} 适合什么人用？`,
      a: `${tool.name} 最适合${tool.bestFor}。`,
    },
    {
      q: `${tool.name} 和同类工具相比有什么优势？`,
      a: `${tool.name} 的核心优势：${tool.pros?.join('、') || tool.tagline}。`,
    },
  ]
}

// ── JSON-LD Schema ────────────────────────────────────────────
function buildSchema(tool: ReturnType<typeof getToolBySlug>, faqs: ReturnType<typeof buildFAQ>) {
  if (!tool) return null
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: tool.name,
        description: tool.tagline,
        applicationCategory: 'AIApplication',
        operatingSystem: 'Web',
        offers: {
          '@type': 'Offer',
          price: tool.hasFree ? '0' : undefined,
          priceCurrency: 'USD',
          description: tool.priceDetail,
        },
        aggregateRating: tool.rating > 0 ? {
          '@type': 'AggregateRating',
          ratingValue: tool.rating,
          bestRating: 5,
          ratingCount: 100,
        } : undefined,
        url: tool.url,
      },
      {
        '@type': 'FAQPage',
        mainEntity: faqs.map(f => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'GO悟空', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: '全部工具', item: `${SITE_URL}/tools/` },
          { '@type': 'ListItem', position: 3, name: tool.name, item: `${SITE_URL}/tools/${tool.slug}/` },
        ],
      },
    ],
  }
}

// ── 页面组件 ─────────────────────────────────────────────────
export default function ToolDetailPage({ params }: { params: { slug: string } }) {
  const tool = getToolBySlug(params.slug)
  if (!tool) notFound()

  const faqs = buildFAQ(tool)
  const schema = buildSchema(tool, faqs)

  // 同类推荐（同分类取3个）
  const related = ALL_TOOLS
    .filter(t => t.category === tool.category && t.slug !== tool.slug)
    .slice(0, 3)

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '32px 20px 60px' }}>

        {/* 面包屑 */}
        <nav style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Link href="/" style={{ color: 'var(--color-text-tertiary)', textDecoration: 'none' }}>GO悟空</Link>
          <span>›</span>
          <Link href="/tools/" style={{ color: 'var(--color-text-tertiary)', textDecoration: 'none' }}>工具库</Link>
          <span>›</span>
          <span style={{ color: 'var(--color-text-primary)' }}>{tool.name}</span>
        </nav>

        {/* 工具头部 */}
        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', marginBottom: '28px' }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '18px', background: 'var(--color-background-secondary)', border: '0.5px solid var(--color-border-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', flexShrink: 0 }}>
            {tool.logo}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '6px' }}>
              <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '26px', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>{tool.name}</h1>
              <span style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', background: 'var(--color-background-secondary)', padding: '2px 8px', borderRadius: '6px' }}>{tool.category}</span>
              {tool.rating > 0 && <span style={{ fontSize: '14px', fontWeight: 600, color: '#D97706' }}>★ {tool.rating.toFixed(1)}</span>}
            </div>
            <p style={{ fontSize: '13px', color: 'var(--color-text-tertiary)', marginBottom: '10px' }}>by {tool.maker}</p>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: 0 }}>{tool.tagline}</p>
          </div>
        </div>

        {/* 核心信息栏 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '28px' }}>
          {[
            { label: '价格', value: tool.price, icon: '💰' },
            { label: '免费版', value: tool.hasFree ? '✓ 有' : '✗ 无', icon: '🆓', good: tool.hasFree },
            { label: '国内可用', value: tool.cnAccess ? '✓ 可以' : '✗ 需VPN', icon: '🇨🇳', good: tool.cnAccess },
            { label: 'API', value: tool.hasApi ? '✓ 支持' : '✗ 暂无', icon: '🔌', good: tool.hasApi },
          ].map(item => (
            <div key={item.label} style={{
              padding: '12px', borderRadius: '12px', textAlign: 'center',
              background: 'var(--color-background-secondary)',
              border: '0.5px solid var(--color-border-tertiary)',
            }}>
              <div style={{ fontSize: '18px', marginBottom: '4px' }}>{item.icon}</div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', marginBottom: '3px' }}>{item.label}</div>
              <div style={{ fontSize: '12px', fontWeight: 500, color: item.good === true ? '#085041' : item.good === false ? '#712B13' : 'var(--color-text-primary)' }}>
                {item.value}
              </div>
            </div>
          ))}
        </div>

        {/* 价格详情 */}
        <div style={{ marginBottom: '24px', padding: '16px', background: 'var(--color-background-primary)', border: '0.5px solid var(--color-border-tertiary)', borderRadius: '14px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '8px' }}>💰 价格说明</h2>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.7, margin: 0 }}>{tool.priceDetail}</p>
        </div>

        {/* 优缺点 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
          <div style={{ padding: '16px', background: '#F0FDF9', border: '0.5px solid #A7F3D0', borderRadius: '14px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 600, color: '#065F46', marginBottom: '10px' }}>✓ 优点</h2>
            {tool.pros?.map((p: string) => (
              <div key={p} style={{ fontSize: '13px', color: '#047857', marginBottom: '6px', display: 'flex', gap: '6px' }}>
                <span style={{ flexShrink: 0 }}>•</span><span>{p}</span>
              </div>
            ))}
          </div>
          <div style={{ padding: '16px', background: '#FFF7F7', border: '0.5px solid #FECACA', borderRadius: '14px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 600, color: '#991B1B', marginBottom: '10px' }}>✗ 缺点</h2>
            {tool.cons?.map((c: string) => (
              <div key={c} style={{ fontSize: '13px', color: '#B91C1C', marginBottom: '6px', display: 'flex', gap: '6px' }}>
                <span style={{ flexShrink: 0 }}>•</span><span>{c}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 核心功能 */}
        {tool.features?.length > 0 && (
          <div style={{ marginBottom: '24px', padding: '16px', background: 'var(--color-background-primary)', border: '0.5px solid var(--color-border-tertiary)', borderRadius: '14px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '12px' }}>⚡ 核心功能</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {tool.features.map((f: string) => (
                <span key={f} style={{ fontSize: '12px', padding: '4px 12px', borderRadius: '20px', background: 'var(--color-background-secondary)', border: '0.5px solid var(--color-border-secondary)', color: 'var(--color-text-secondary)' }}>
                  {f}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 标签 */}
        <div style={{ marginBottom: '24px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {tool.tags.map((tag: string) => (
            <span key={tag} style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '4px', background: 'var(--color-background-secondary)', border: '0.5px solid var(--color-border-tertiary)', color: 'var(--color-text-tertiary)' }}>
              #{tag}
            </span>
          ))}
        </div>

        {/* CTA 按钮 */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '36px', flexWrap: 'wrap' }}>
          <a href={tool.url} target="_blank" rel="nofollow noopener"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '12px 24px', background: '#D97706', color: '#fff', borderRadius: '12px', fontSize: '14px', fontWeight: 500, textDecoration: 'none' }}>
            访问 {tool.name} 官网 ↗
          </a>
          <Link href={`/compare/?a=${tool.slug}`}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '12px 20px', background: 'var(--color-background-secondary)', color: 'var(--color-text-secondary)', borderRadius: '12px', fontSize: '14px', textDecoration: 'none', border: '0.5px solid var(--color-border-secondary)' }}>
            与其他工具对比
          </Link>
        </div>

        {/* FAQ */}
        <div style={{ marginBottom: '36px' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '16px' }}>
            常见问题 FAQ
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {faqs.map((faq, i) => (
              <details key={i} style={{ background: 'var(--color-background-primary)', border: '0.5px solid var(--color-border-tertiary)', borderRadius: '12px', overflow: 'hidden' }}>
                <summary style={{ padding: '14px 16px', fontSize: '14px', fontWeight: 500, color: 'var(--color-text-primary)', cursor: 'pointer', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {faq.q}
                  <span style={{ color: 'var(--color-text-tertiary)', flexShrink: 0, marginLeft: '8px' }}>▾</span>
                </summary>
                <div style={{ padding: '0 16px 14px', fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.7, borderTop: '0.5px solid var(--color-border-tertiary)', paddingTop: '12px' }}>
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>

        {/* 相关推荐 */}
        {related.length > 0 && (
          <div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '14px' }}>
              同类 {tool.category} 工具
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {related.map(t => (
                <Link key={t.slug} href={`/tools/${t.slug}/`} style={{
                  display: 'flex', alignItems: 'center', gap: '14px',
                  padding: '12px 16px', background: 'var(--color-background-primary)',
                  border: '0.5px solid var(--color-border-tertiary)', borderRadius: '12px',
                  textDecoration: 'none', transition: 'border-color .15s',
                }}>
                  <span style={{ fontSize: '28px' }}>{t.logo}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-primary)' }}>{t.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>{t.tagline}</div>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 500, color: '#D97706' }}>★ {t.rating.toFixed(1)}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
