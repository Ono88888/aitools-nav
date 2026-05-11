/**
 * lib/notion.ts
 * ─────────────────────────────────────────────────────────────
 * 封装所有 Notion API 调用。
 * 构建时被 getStaticProps / generateStaticParams 调用，
 * 运行时无需 Notion 连接（已静态化）。
 */

import { Client } from '@notionhq/client'
import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints'
import type { Tool, ToolScore, PricePlan, Scenario, FaqItem, SimilarTool } from '@/types/tool'

// ── Notion 客户端（仅服务端/构建时可用）───────────────────────
const notion = new Client({
  auth: process.env.NOTION_API_KEY,
})

const DATABASE_ID = process.env.NOTION_DATABASE_ID!

// ── 辅助：安全读取 Notion 属性 ───────────────────────────────
function getProp(page: PageObjectResponse, key: string) {
  return (page.properties as Record<string, any>)[key]
}

function getText(page: PageObjectResponse, key: string): string {
  const p = getProp(page, key)
  if (!p) return ''
  if (p.type === 'title') return p.title?.[0]?.plain_text ?? ''
  if (p.type === 'rich_text') return p.rich_text?.[0]?.plain_text ?? ''
  return ''
}

function getNumber(page: PageObjectResponse, key: string): number {
  return getProp(page, key)?.number ?? 0
}

function getCheckbox(page: PageObjectResponse, key: string): boolean {
  return getProp(page, key)?.checkbox ?? false
}

function getSelect(page: PageObjectResponse, key: string): string {
  return getProp(page, key)?.select?.name ?? ''
}

function getMultiSelect(page: PageObjectResponse, key: string): string[] {
  return getProp(page, key)?.multi_select?.map((s: any) => s.name) ?? []
}

function getUrl(page: PageObjectResponse, key: string): string {
  return getProp(page, key)?.url ?? ''
}

function getDate(page: PageObjectResponse, key: string): string {
  return getProp(page, key)?.date?.start ?? ''
}

// ── JSON 字段解析（Notion rich_text 存 JSON 字符串）──────────
function parseJson<T>(page: PageObjectResponse, key: string, fallback: T): T {
  try {
    const raw = getText(page, key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

// ── 将 Notion Page 转换为 Tool 对象 ──────────────────────────
function pageToTool(page: PageObjectResponse): Tool {
  return {
    slug:           getText(page, 'slug'),
    name:           getText(page, 'name'),
    maker:          getText(page, 'maker'),
    logo:           getText(page, 'logo'),
    tagline:        getText(page, 'tagline'),
    tags:           getMultiSelect(page, 'tags'),
    websiteUrl:     getUrl(page, 'websiteUrl'),
    affiliateUrl:   getUrl(page, 'affiliateUrl') || getUrl(page, 'websiteUrl'),
    category:       getMultiSelect(page, 'category'),
    status:         getSelect(page, 'status') as Tool['status'],

    seoTitle:       getText(page, 'seoTitle'),
    seoDesc:        getText(page, 'seoDesc'),
    ogImage:        getText(page, 'ogImage') || '/og/default.jpg',

    freeLimit:      getText(page, 'freeLimit'),
    pricingStart:   getText(page, 'pricingStart'),
    contextWindow:  getText(page, 'contextWindow'),
    rating:         getNumber(page, 'rating'),
    reviewCount:    getNumber(page, 'reviewCount'),

    launchDate:     getText(page, 'launchDate'),
    hasFreeVersion: getCheckbox(page, 'hasFreeVersion'),
    hasApi:         getCheckbox(page, 'hasApi'),
    platforms:      getMultiSelect(page, 'platforms'),

    introduction:   getText(page, 'introduction'),
    scores:         parseJson<ToolScore[]>(page, 'scores', []),
    pricing:        parseJson<PricePlan[]>(page, 'pricing', []),
    scenarios:      parseJson<Scenario[]>(page, 'scenarios', []),
    competitors:    getMultiSelect(page, 'competitors'),
    faq:            parseJson<FaqItem[]>(page, 'faq', []),
    verdict:        getText(page, 'verdict'),
    prosAndCons:    parseJson(page, 'prosAndCons', { pros: [], cons: [] }),
    similarTools:   parseJson<SimilarTool[]>(page, 'similarTools', []),

    publishedAt:    getDate(page, 'publishedAt'),
    updatedAt:      page.last_edited_time,
  }
}

// ── 公开 API ─────────────────────────────────────────────────

/**
 * 获取所有已发布工具（用于 generateStaticParams + 首页列表）
 */
export async function getAllTools(): Promise<Tool[]> {
  const results: PageObjectResponse[] = []
  let cursor: string | undefined

  // 自动分页，Notion 每次最多返回 100 条
  while (true) {
    const res = await notion.databases.query({
      database_id: DATABASE_ID,
      filter: {
        property: 'status',
        status: { equals: 'published' },
      },
      sorts: [{ timestamp: 'last_edited_time', direction: 'descending' }],
      page_size: 100,
      ...(cursor ? { start_cursor: cursor } : {}),
    })

    results.push(...(res.results as PageObjectResponse[]))
    if (!res.has_more) break
    cursor = res.next_cursor ?? undefined
  }

  return results.map(pageToTool).filter(t => t.slug)
}

/**
 * 按 slug 获取单个工具（用于工具详情页 generateStaticParams）
 */
export async function getToolBySlug(slug: string): Promise<Tool | null> {
  const res = await notion.databases.query({
    database_id: DATABASE_ID,
    filter: {
      and: [
        { property: 'slug', rich_text: { equals: slug } },
        { property: 'status', status: { equals: 'published' } },
      ],
    },
    page_size: 1,
  })

  const page = res.results[0] as PageObjectResponse | undefined
  return page ? pageToTool(page) : null
}

/**
 * 按 slug 列表批量获取工具（用于竞品对比、相似工具）
 */
export async function getToolsBySlugs(slugs: string[]): Promise<Tool[]> {
  if (!slugs.length) return []

  const res = await notion.databases.query({
    database_id: DATABASE_ID,
    filter: {
      or: slugs.map(slug => ({
        property: 'slug',
        rich_text: { equals: slug },
      })),
    },
  })

  return (res.results as PageObjectResponse[]).map(pageToTool)
}

/**
 * 按分类获取工具（用于分类页）
 */
export async function getToolsByCategory(category: string): Promise<Tool[]> {
  const res = await notion.databases.query({
    database_id: DATABASE_ID,
    filter: {
      and: [
        { property: 'category', multi_select: { contains: category } },
        { property: 'status', status: { equals: 'published' } },
      ],
    },
    sorts: [{ property: 'rating', direction: 'descending' }],
  })

  return (res.results as PageObjectResponse[]).map(pageToTool)
}
