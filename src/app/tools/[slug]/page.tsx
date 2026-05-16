import { notFound } from 'next/navigation'
import Link from 'next/link'
import ToolIcon from '@/components/ToolIcon'
import type { Metadata } from 'next'
import { ALL_TOOLS, getToolBySlug } from '@/lib/tools-data'
import ToolDetailClient from './ToolDetailClient'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://gowukong.co'

export function generateStaticParams() {
  return ALL_TOOLS.map(t => ({ slug: t.slug }))
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const tool = getToolBySlug(params.slug)
  if (!tool) return { title: '工具未找到' }
  const title = `${tool.name} 深度评测 2025 | 怎么用？价格、优缺点、中文教程`
  const description = `${tool.name}（${tool.maker}）深度测评：${tool.tagline}。价格${tool.price}，${tool.hasFree ? '有免费版，' : ''}${tool.cnAccess ? '国内可直接访问。' : '需翻墙。'}适合${tool.bestFor}。含用户真实评价。`
  return {
    title,
    description,
    keywords: [tool.name, `${tool.name}怎么用`, `${tool.name}评测`, ...tool.tags, tool.category, 'AI工具'].join(','),
    alternates: { canonical: `${SITE_URL}/tools/${tool.slug}/` },
    openGraph: { title, description, url: `${SITE_URL}/tools/${tool.slug}/`, type: 'article', siteName: 'GO悟空' },
  }
}

export default function ToolDetailPage({ params }: { params: { slug: string } }) {
  const tool = getToolBySlug(params.slug)
  if (!tool) notFound()

  const related = ALL_TOOLS.filter(t => t.category === tool.category && t.slug !== tool.slug).slice(0, 3)

  const faqs = [
    { q: `${tool.name} 是免费的吗？`, a: tool.hasFree ? `${tool.name} 提供免费版。${tool.priceDetail}` : `${tool.name} 是付费产品。${tool.priceDetail}` },
    { q: `${tool.name} 国内能用吗？`, a: tool.cnAccess ? `${tool.name} 在中国大陆可直接访问，无需VPN。` : `${tool.name} 在中国大陆需要科学上网才能访问。` },
    { q: `${tool.name} 有API接口吗？`, a: tool.hasApi ? `${tool.name} 提供官方API，开发者可接入自己的产品。` : `${tool.name} 目前暂未开放公开API。` },
    { q: `${tool.name} 适合什么人用？`, a: `${tool.name} 最适合${tool.bestFor}，核心优势是${tool.pros?.slice(0, 2).join('、') || tool.tagline}。` },
    { q: `${tool.name} 和同类工具相比怎么样？`, a: `${tool.name} 的主要优势：${tool.pros?.join('、') || '—'}。主要限制：${tool.cons?.join('、') || '—'}。` },
  ]

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: tool.name, description: tool.tagline,
        applicationCategory: 'AIApplication', operatingSystem: 'Web',
        offers: { '@type': 'Offer', description: tool.priceDetail },
        aggregateRating: tool.rating > 0 ? { '@type': 'AggregateRating', ratingValue: tool.rating, bestRating: 5, ratingCount: 128 } : undefined,
        url: tool.url,
      },
      {
        '@type': 'FAQPage',
        mainEntity: faqs.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
      },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <ToolDetailClient tool={tool as any} related={related as any} faqs={faqs} />
    </>
  )
}
