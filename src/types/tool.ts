// ─── 工具收录页的完整数据结构 ──────────────────────────────
// 与 Notion 数据库字段一一对应

export interface ToolScore {
  feature: string   // 功能维度，如"中文写作"
  score: number     // 0-10
  color: 'green' | 'blue' | 'amber' | 'red'
}

export interface PricePlan {
  name: string            // "免费版" | "Pro版" | "Team版"
  price: string           // "0" | "20" | "30"
  currency: string        // "USD" | "CNY"
  period: string          // "/月" | "/年" | "/人/月"
  features: string[]      // 包含的功能列表
  notFeatures: string[]   // 不包含的（显示✕）
  cta: string             // 按钮文字
  ctaUrl: string          // 联盟链接
  featured: boolean       // 是否高亮推荐
}

export interface Scenario {
  icon: string       // emoji
  title: string      // "场景一：中文写作"
  score: number      // 9.4
  description: string
  promptExample: string
  result: string
}

export interface CompetitorRow {
  feature: string
  values: Record<string, string | 'yes' | 'no' | 'partial'>
}

export interface FaqItem {
  question: string
  answer: string
}

export interface SimilarTool {
  name: string
  slug: string
  logo: string   // emoji 或图片路径
  maker: string
  priceLabel: string
}

// ─── 主数据结构（单个工具页） ───────────────────────────────
export interface Tool {
  // ── 基础信息（Notion 数据库属性）
  slug: string           // URL slug，如 "claude-ai"
  name: string           // 工具全称，如 "Claude AI"
  maker: string          // 开发商
  logo: string           // emoji 或图片 URL
  tagline: string        // 一句话介绍（80字以内）
  tags: string[]         // ["免费可用", "支持中文", "API可用"]
  websiteUrl: string     // 官网链接（非联盟）
  affiliateUrl: string   // 联盟链接（rel=sponsored）
  category: string[]     // ["AI对话", "写作助手"]
  status: 'published' | 'draft' | 'archived'

  // ── SEO 字段
  seoTitle: string       // <title> 标签，60字符以内
  seoDesc: string        // meta description，155字符以内
  ogImage: string        // OG图片路径

  // ── 快速数据
  freeLimit: string      // "约30次/天"
  pricingStart: string   // "$20/月"
  contextWindow: string  // "200K Token"
  rating: number         // 4.7
  reviewCount: number    // 1284

  // ── 工具信息侧边栏
  launchDate: string     // "2023年3月"
  hasFreeVersion: boolean
  hasApi: boolean
  platforms: string[]    // ["Web", "iOS", "Android"]

  // ── 内容区块（Notion 长文本字段）
  introduction: string   // 工具简介段落（Markdown）
  scores: ToolScore[]
  pricing: PricePlan[]
  scenarios: Scenario[]
  competitors: string[]  // 竞争对手 slug 列表，用于生成对比表
  faq: FaqItem[]
  verdict: string        // 编辑总结（Markdown）
  prosAndCons: {
    pros: string[]
    cons: string[]
  }

  // ── 相似工具（侧边栏）
  similarTools: SimilarTool[]

  // ── 时间戳
  publishedAt: string    // ISO 8601
  updatedAt: string
}

// ─── Notion API 原始属性类型（内部用）──────────────────────
export type NotionPropertyType =
  | { type: 'title'; title: Array<{ plain_text: string }> }
  | { type: 'rich_text'; rich_text: Array<{ plain_text: string }> }
  | { type: 'number'; number: number | null }
  | { type: 'select'; select: { name: string } | null }
  | { type: 'multi_select'; multi_select: Array<{ name: string }> }
  | { type: 'checkbox'; checkbox: boolean }
  | { type: 'url'; url: string | null }
  | { type: 'date'; date: { start: string } | null }
  | { type: 'status'; status: { name: string } | null }
