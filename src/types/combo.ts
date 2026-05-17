// ─── 工具组合推荐页类型定义 ────────────────────────────────

/** 网络访问要求 */
export type NetAccess =
  | 'cn'    // 国内直连，无需任何工具
  | 'vpn'   // 需要科学上网（VPN/梯子）
  | 'both'  // 国内外均可访问

/** 上手难度（1-5，1最简单） */
export type Difficulty = 1 | 2 | 3 | 4 | 5

/** 工具流转难度（工具之间数据交接的难易程度） */
export type FlowDifficulty = 'easy' | 'medium' | 'hard'

export interface ComboTool {
  name: string           // 工具名称
  logo: string           // emoji（展示降级用）
  price: string          // 价格标签，如 "免费" "$20/月" "¥99/月"
  priceUSD?: number      // 月费美元数（0=免费，用于成本精确计算）
  priceCNY?: number      // 月费人民币数（0=免费）
  url: string            // 官网/联盟链接
  slug?: string          // 对应工具详情页 slug（可选）
  net: NetAccess         // 网络访问要求
  difficulty: Difficulty // 上手难度 1-5
  tip?: string           // 使用小贴士，如 "免费额度够用" "需要手机号注册"
}

export interface ComboStep {
  phase: string               // 步骤名称，如 "脚本生成"
  conn: 'or' | 'and'          // 工具之间关系：or=任选其一，and=必须全用
  tools: ComboTool[]
  flowNote?: string           // 工具间数据流转说明，如 "复制文本粘贴到下一步"
  flowDifficulty?: FlowDifficulty // 从上一步到本步的流转难度
}

export interface ToolCombo {
  id: string
  name: string           // 组合名称
  tagline: string        // 一句话描述
  isRec: boolean         // 是否编辑推荐
  tier: 'free' | 'mid' | 'pro'
  priceMin: number       // 月成本最低（元）
  priceMax: number       // 月成本最高（元）
  steps: ComboStep[]
  pros: string[]         // 优点标签
  why: string            // 推荐理由
  scenarios: string[]    // 适用场景标签
  bestFor?: string       // 适合人群简述
  overallDifficulty: Difficulty    // 整套方案上手难度（综合评定）
  setupTime?: string     // 初次配置耗时，如 "30分钟" "2小时"
  timePerOutput?: string // 每次产出耗时，如 "30分钟/条"
  netSummary: NetAccess  // 整套方案网络要求（取最严格的）
}

// Notion 数据库原始数据（供 lib/combo-notion.ts 使用）
export interface NotionComboPage {
  id: string
  properties: Record<string, any>
}
