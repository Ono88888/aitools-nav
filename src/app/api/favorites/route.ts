import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { rateLimit, getClientIP } from '@/lib/security'

const NOTION_API = 'https://api.notion.com/v1'
const TOKEN = process.env.NOTION_API_KEY!
const FAV_DB = process.env.NOTION_FAVORITES_DB_ID!

async function notionReq(path: string, method = 'GET', body?: object) {
  const res = await fetch(`${NOTION_API}${path}`, {
    method,
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json', 'Notion-Version': '2022-06-28' },
    body: body ? JSON.stringify(body) : undefined,
  })
  return res.json()
}

// GET /api/favorites — 获取当前用户收藏列表
export async function GET(req: NextRequest) {
  const session = await getSession(req)
  if (!session?.userId) return NextResponse.json({ error: '请先登录' }, { status: 401 })

  const data = await notionReq(`/databases/${FAV_DB}/query`, 'POST', {
    filter: { property: 'userId', rich_text: { equals: session.userId } },
    sorts: [{ property: 'createdAt', direction: 'descending' }],
    page_size: 50,
  })

  const favorites = (data.results || []).map((p: any) => ({
    id: p.id,
    comboId: p.properties?.comboId?.rich_text?.[0]?.plain_text ?? '',
    comboName: p.properties?.comboName?.title?.[0]?.plain_text ?? '',
    scene: p.properties?.scene?.select?.name ?? '',
    rating: p.properties?.rating?.number ?? 0,
    suggestion: p.properties?.suggestion?.rich_text?.[0]?.plain_text ?? '',
    comboData: (() => { try { return JSON.parse(p.properties?.comboData?.rich_text?.[0]?.plain_text ?? '{}') } catch { return {} } })(),
    createdAt: p.properties?.createdAt?.date?.start ?? '',
  }))

  return NextResponse.json({ favorites })
}

// POST /api/favorites — 收藏一个工具组合
export async function POST(req: NextRequest) {
  const session = await getSession(req)
  if (!session?.userId) return NextResponse.json({ error: '请先登录' }, { status: 401 })

  const ip = getClientIP(req)
  const limit = rateLimit({ identifier: ip, type: 'favorites', max: 30, windowSeconds: 3600 })
  if (!limit.allowed) return NextResponse.json({ error: '操作过于频繁' }, { status: 429 })

  const body = await req.json().catch(() => ({}))
  const { comboId, comboName, scene, comboData } = body
  if (!comboId || !comboName) return NextResponse.json({ error: '参数缺失' }, { status: 400 })

  // 检查是否已收藏
  const existing = await notionReq(`/databases/${FAV_DB}/query`, 'POST', {
    filter: { and: [
      { property: 'userId', rich_text: { equals: session.userId } },
      { property: 'comboId', rich_text: { equals: String(comboId) } },
    ]},
    page_size: 1,
  })
  if ((existing.results?.length ?? 0) > 0) {
    return NextResponse.json({ error: '已收藏', alreadySaved: true }, { status: 409 })
  }

  await notionReq('/pages', 'POST', {
    parent: { database_id: FAV_DB },
    properties: {
      comboName:  { title: [{ text: { content: String(comboName).slice(0, 100) } }] },
      comboId:    { rich_text: [{ text: { content: String(comboId) } }] },
      userId:     { rich_text: [{ text: { content: session.userId } }] },
      scene:      { select: { name: String(scene || 'custom').slice(0, 30) } },
      rating:     { number: 0 },
      suggestion: { rich_text: [{ text: { content: '' } }] },
      comboData:  { rich_text: [{ text: { content: JSON.stringify(comboData || {}).slice(0, 2000) } }] },
      createdAt:  { date: { start: new Date().toISOString() } },
    },
  })

  return NextResponse.json({ saved: true })
}

// PATCH /api/favorites — 更新评分和建议
export async function PATCH(req: NextRequest) {
  const session = await getSession(req)
  if (!session?.userId) return NextResponse.json({ error: '请先登录' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const { favoriteId, rating, suggestion } = body
  if (!favoriteId) return NextResponse.json({ error: '缺少favoriteId' }, { status: 400 })

  // 验证归属（防止越权）
  const page = await notionReq(`/pages/${favoriteId}`)
  const owner = page.properties?.userId?.rich_text?.[0]?.plain_text
  if (owner !== session.userId) return NextResponse.json({ error: '无权操作' }, { status: 403 })

  const updates: any = {}
  if (typeof rating === 'number' && rating >= 0 && rating <= 5) updates.rating = { number: rating }
  if (typeof suggestion === 'string') updates.suggestion = { rich_text: [{ text: { content: suggestion.slice(0, 500) } }] }

  await notionReq(`/pages/${favoriteId}`, 'PATCH', { properties: updates })
  return NextResponse.json({ updated: true })
}

// DELETE /api/favorites — 取消收藏
export async function DELETE(req: NextRequest) {
  const session = await getSession(req)
  if (!session?.userId) return NextResponse.json({ error: '请先登录' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const favoriteId = searchParams.get('id')
  if (!favoriteId) return NextResponse.json({ error: '缺少id' }, { status: 400 })

  const page = await notionReq(`/pages/${favoriteId}`)
  const owner = page.properties?.userId?.rich_text?.[0]?.plain_text
  if (owner !== session.userId) return NextResponse.json({ error: '无权操作' }, { status: 403 })

  await notionReq(`/pages/${favoriteId}`, 'PATCH', { archived: true })
  return NextResponse.json({ deleted: true })
}
