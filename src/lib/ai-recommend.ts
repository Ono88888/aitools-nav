// ── AI 驱动推荐引擎 ──────────────────────────────────────────
// 调用 Claude API，基于用户自然语言需求动态推荐工具组合
// 替代原来的关键词硬匹配，真正理解用户意图

import { ALL_TOOLS } from './tools-data'

// ── 精简工具摘要（减少 token 消耗）────────────────────────────
function buildToolCatalog(networkFilter: 'all' | 'cn' | 'intl'): string {
  const tools = ALL_TOOLS.filter(t => {
    if (networkFilter === 'cn') return t.cnAccess
    if (networkFilter === 'intl') return !t.cnAccess
    return true
  })

  return tools.map(t =>
    `[${t.slug}] ${t.name}(${t.category}) - ${t.tagline} | 功能:${t.features.slice(0,3).join('/')} | 价格:${t.price} | 国内:${t.cnAccess?'✓':'✗'}`
  ).join('\n')
}

// ── 系统提示词 ───────────────────────────────────────────────
function buildSystemPrompt(catalog: string, network: string): string {
  const netNote = network === 'cn' ? '用户在中国大陆，只推荐国内直连的工具。' :
                  network === 'intl' ? '用户在海外，可以推荐所有工具。' :
                  '兼顾国内外工具，优先推荐国内可用的，在必须时才推荐需要梯子的工具。'

  return `你是一个专业的AI工具顾问，帮助用户找到最适合他们需求的AI工具组合。${netNote}

## 工具库（共${ALL_TOOLS.length}个工具）：
${catalog}

## 推荐规则：
1. 仔细理解用户的真实需求和职业背景，不要做字面匹配
2. 推荐1-3套完整工作流方案（免费/付费/专业），每套3-5个步骤
3. 每个步骤说明为什么用这个工具，以及如何从上一步流转到下一步
4. 必须从工具库的slug列表中选择工具，不要编造不存在的工具
5. 给出核心Prompt模板，让用户拿来就能用

## 输出格式（严格JSON，不要有其他文字）：
{
  "scene": "识别到的场景名称（10字以内）",
  "intent": "用户真实需求解读（30字以内）",
  "combos": [
    {
      "id": "ai_1",
      "name": "方案名称",
      "tagline": "一句话描述",
      "tier": "free|mid|pro",
      "priceMin": 0,
      "priceMax": 0,
      "overallDifficulty": 2,
      "netSummary": "cn|vpn|both",
      "setupTime": "预计配置时间",
      "timePerOutput": "每次产出效率",
      "bestFor": "适合人群",
      "pros": ["优点1", "优点2"],
      "why": "推荐这套组合的理由（80字以内）",
      "steps": [
        {
          "phase": "步骤名称",
          "conn": "or|and",
          "flowNote": "如何从上一步流转（简短说明）",
          "tools": [
            {
              "slug": "工具slug（必须来自工具库）",
              "name": "工具名",
              "logo": "emoji",
              "price": "价格",
              "url": "官网",
              "net": "cn|vpn|both",
              "difficulty": 1,
              "tip": "使用小贴士"
            }
          ]
        }
      ],
      "prompt": "这套方案的核心Prompt模板（用户可以直接复制使用）"
    }
  ]
}`
}

// ── 主推荐函数 ────────────────────────────────────────────────
export interface AIRecommendResult {
  scene: string
  intent: string
  combos: any[]
  fromCache?: boolean
  error?: string
}

// 简单的内存缓存（同一 query 不重复调用 API）
const cache = new Map<string, AIRecommendResult>()

export async function getAIRecommendation(
  query: string,
  network: 'all' | 'cn' | 'intl' = 'all'
): Promise<AIRecommendResult> {
  const cacheKey = `${query}:${network}`
  if (cache.has(cacheKey)) return { ...cache.get(cacheKey)!, fromCache: true }

  const catalog = buildToolCatalog(network)
  const systemPrompt = buildSystemPrompt(catalog, network)

  try {
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        system: systemPrompt,
        messages: [{
          role: 'user',
          content: `用户需求：${query}\n\n请根据上述需求，从工具库中推荐最合适的AI工具组合。输出纯JSON，不要markdown代码块。`
        }]
      })
    })

    if (!resp.ok) throw new Error(`API error: ${resp.status}`)

    const data = await resp.json()
    const raw = data.content?.[0]?.text || ''

    // 提取 JSON（防止 AI 包了 markdown）
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON in response')

    const result: AIRecommendResult = JSON.parse(jsonMatch[0])
    cache.set(cacheKey, result)
    return result

  } catch (err: any) {
    // 降级：使用本地关键词匹配
    return {
      scene: '通用场景',
      intent: query,
      combos: [],
      error: err.message || 'AI推荐失败，使用本地匹配'
    }
  }
}
