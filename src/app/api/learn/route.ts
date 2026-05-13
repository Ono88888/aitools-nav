import { NextRequest, NextResponse } from 'next/server'
import { sanitizeInput, sanitizeKeyword, rateLimit, getClientIP } from '@/lib/security'

// Notion 词汇学习数据库（独立表，不污染工具库）
const NOTION_API   = 'https://api.notion.com/v1'
const LEARN_DB     = process.env.NOTION_LEARN_DB_ID!
const NOTION_TOKEN = process.env.NOTION_API_KEY!
const DS_KEY       = process.env.DEEPSEEK_API_KEY!

// 所有合法场景（防止AI返回非法场景名）
const VALID_SCENES = new Set([
  'video','wechat','ecommerce','dev','painting',
  'podcast','writing','ppt','music','knowledge',
  'livestream','agent',
])

// ── 让DeepSeek分析未命中的词汇，返回场景+关键词（极省token）──
async function analyzeWithDeepSeek(query: string): Promise<{
  scene: string
  keywords: string[]
} | null> {
  if (!DS_KEY) return null

  const validList = [...VALID_SCENES].join(',')

  try {
    const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${DS_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        max_tokens: 60,   // 只需要场景+几个词，60token足够
        temperature: 0,
        messages: [
          {
            role: 'system',
            // 极简system：告诉它返回格式，不废话
            content: `从[${validList}]选1个场景,提取2-4个核心关键词。JSON格式:{"scene":"xxx","keywords":["词1","词2"]}，只输出JSON`,
          },
          {
            role: 'user',
            content: query.slice(0, 60), // 截断，省token
          },
        ],
      }),
    })

    if (!res.ok) return null
    const data = await res.json()
    const raw = data.choices?.[0]?.message?.content?.trim() ?? ''

    // 安全解析：只接受合法JSON格式
    const parsed = JSON.parse(raw.replace(/```json?|```/g, '').trim())
    if (!parsed?.scene || !Array.isArray(parsed?.keywords)) return null
    if (!VALID_SCENES.has(parsed.scene)) return null

    // 过滤关键词：每个词必须通过安全验证
    const safeKeywords = (parsed.keywords as string[])
      .map(sanitizeKeyword)
      .filter((w): w is string => w !== null)
      .slice(0, 4)

    if (safeKeywords.length === 0) return null
    return { scene: parsed.scene, keywords: safeKeywords }

  } catch {
    return null
  }
}

// ── 写入Notion学习库 ──────────────────────────────────────────
async function saveToLearnDB(params: {
  originalQuery: string
  scene: string
  keywords: string[]
  source: string
}): Promise<void> {
  await fetch(`${NOTION_API}/pages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${NOTION_TOKEN}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28',
    },
    body: JSON.stringify({
      parent: { database_id: LEARN_DB },
      properties: {
        // 标题：存关键词列表
        keyword:       { title: [{ text: { content: params.keywords.join(',') } }] },
        scene:         { select: { name: params.scene } },
        originalQuery: { rich_text: [{ text: { content: params.originalQuery.slice(0, 100) } }] },
        source:        { select: { name: params.source } },
        createdAt:     { rich_text: [{ text: { content: new Date().toISOString() } }] },
        approved:      { checkbox: false },  // 人工审核标志
        hitCount:      { number: 1 },
      },
    }),
  })
}

// ── 检查是否已存在该关键词（防重复）──────────────────────────
async function keywordExists(keyword: string): Promise<boolean> {
  const res = await fetch(`${NOTION_API}/databases/${LEARN_DB}/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${NOTION_TOKEN}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28',
    },
    body: JSON.stringify({
      filter: { property: 'keyword', title: { contains: keyword } },
      page_size: 1,
    }),
  })
  const data = await res.json()
  return (data.results?.length ?? 0) > 0
}

// ══════════════════════════════════════════════════════════════
// POST /api/learn
// 当主搜索 source='fallback' 时，前端自动调用此接口学习词汇
// ══════════════════════════════════════════════════════════════
export async function POST(req: NextRequest) {
  // 1. 限流：每个IP每小时最多学习10条（防刷）
  const ip = getClientIP(req)
  const limit = rateLimit({ identifier: ip, type: 'learn', max: 10, windowSeconds: 3600 })
  if (!limit.allowed) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 })
  }

  // 2. 解析和消毒输入
  const body = await req.json().catch(() => ({}))
  const rawQuery = String(body.query ?? '')
  const { safe: query, blocked } = sanitizeInput(rawQuery)

  if (blocked || !query) {
    return NextResponse.json({ error: 'invalid_input' }, { status: 400 })
  }

  // 3. 调用DeepSeek分析（~60token，约¥0.00006/次）
  const result = await analyzeWithDeepSeek(query)
  if (!result) {
    return NextResponse.json({ learned: false, reason: 'ai_failed' })
  }

  // 4. 检查去重（已存在的词不重复写入）
  const firstKeyword = result.keywords[0]
  if (await keywordExists(firstKeyword)) {
    return NextResponse.json({ learned: false, reason: 'duplicate' })
  }

  // 5. 写入Notion学习库（待人工审核）
  await saveToLearnDB({
    originalQuery: query,
    scene: result.scene,
    keywords: result.keywords,
    source: 'auto',
  })

  return NextResponse.json({
    learned: true,
    scene: result.scene,
    keywords: result.keywords,
    note: '词汇已进入待审核队列，审核通过后生效',
  })
}
