import type { Tool } from '@/types/tool'

// ── CSS 类名合并 ─────────────────────────────────────────────
export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

// ── 格式化日期（中文显示）──────────────────────────────────────
export function formatDate(iso: string): string {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('zh-CN', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}

// ── 站点 URL ─────────────────────────────────────────────────
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com'
export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'AI工具导航'

// ── 生成工具页 URL ─────────────────────────────────────────────
export function toolUrl(slug: string): string {
  return `/tools/${slug}/`
}

// ── 生成完整 Schema.org JSON-LD ──────────────────────────────
export function buildToolSchema(tool: Tool) {
  const pageUrl = `${SITE_URL}/tools/${tool.slug}/`

  const softwareApp = {
    '@type': 'SoftwareApplication',
    name: tool.name,
    description: tool.tagline,
    applicationCategory: 'ProductivityApplication',
    operatingSystem: tool.platforms.join(', '),
    offers: tool.pricing.map(p => ({
      '@type': 'Offer',
      name: p.name,
      price: p.price,
      priceCurrency: p.currency,
      description: p.features[0] ?? '',
    })),
    ...(tool.rating > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: tool.rating.toFixed(1),
        reviewCount: tool.reviewCount,
        bestRating: '5',
        worstRating: '1',
      },
    }),
    url: tool.websiteUrl,
  }

  const article = {
    '@type': 'Article',
    headline: tool.seoTitle,
    description: tool.seoDesc,
    datePublished: tool.publishedAt,
    dateModified: tool.updatedAt,
    author: {
      '@type': 'Person',
      name: SITE_NAME,
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
    },
    image: { '@type': 'ImageObject', url: `${SITE_URL}${tool.ogImage}` },
    mainEntityOfPage: { '@type': 'WebPage', '@id': pageUrl },
  }

  const faqPage = tool.faq.length > 0 ? {
    '@type': 'FAQPage',
    mainEntity: tool.faq.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  } : null

  const breadcrumb = {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: '首页', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'AI工具', item: `${SITE_URL}/tools/` },
      { '@type': 'ListItem', position: 3, name: tool.name, item: pageUrl },
    ],
  }

  return {
    '@context': 'https://schema.org',
    '@graph': [softwareApp, article, ...(faqPage ? [faqPage] : []), breadcrumb],
  }
}

// ── 评分条颜色 ────────────────────────────────────────────────
export function scoreColor(score: number): string {
  if (score >= 8.5) return 'bg-emerald-500'
  if (score >= 7) return 'bg-amber-400'
  return 'bg-slate-400'
}

export function scoreTextColor(score: number): string {
  if (score >= 8.5) return 'text-emerald-600'
  if (score >= 7) return 'text-amber-600'
  return 'text-slate-400'
}
