// ─── 工具组合推荐页类型定义 ────────────────────────────────

export interface ComboTool {
  name: string          // 工具名称
  logo: string          // emoji
  price: string         // 价格标签，如 "免费" "$20/月"
  slug?: string         // 对应工具详情页 slug（可选）
  affiliateUrl?: string // 联盟链接（可选）
}

export interface ComboStep {
  phase: string         // 步骤名称，如 "脚本生成"
  tools: ComboTool[]    // 该步骤可选工具
  connector?: 'or' | 'and' // 工具之间关系
}

export interface ToolCombo {
  id: string
  name: string          // 组合名称
  tagline: string       // 一句话描述
  isRecommended: boolean
  tier: 'free' | 'mid' | 'pro'
  tierLabel: string     // "性价比首选" | "专业进阶" | "创意旗舰"
  monthlyMin: number    // 月成本最低（元）
  monthlyMax: number    // 月成本最高（元）
  steps: ComboStep[]
  whyRecommend: string  // 推荐理由
  pros: string[]        // 优点标签
  bestFor: string       // 适合人群
  scenarios: string[]   // 适用场景标签
}

// Notion 数据库原始数据（供 lib/combo-notion.ts 使用）
export interface NotionComboPage {
  id: string
  properties: Record<string, any>
}
