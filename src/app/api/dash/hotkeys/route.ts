import { NextRequest, NextResponse } from 'next/server'

const N = 'https://api.notion.com/v1'
const TOKEN = process.env.NOTION_API_KEY
const DB = process.env.NOTION_HOTKEYS_DB_ID

function getHeaders() {
  return {
    Authorization: `Bearer ${TOKEN}`,
    'Content-Type': 'application/json',
    'Notion-Version': '2022-06-28',
  }
}

function nR(path: string, method = 'GET', body?: object) {
  return fetch(`${N}${path}`, {
    method,
    headers: getHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  }).then(r => r.json())
}

function p2k(p: any) {
  return {
    id: p.id,
    label: p.properties?.label?.title?.[0]?.plain_text ?? '',
    query: p.properties?.query?.rich_text?.[0]?.plain_text ?? '',
    icon: p.properties?.icon?.rich_text?.[0]?.plain_text ?? '🔥',
    clickCount: p.properties?.clickCount?.number ?? 0,
    searchCount: p.properties?.searchCount?.number ?? 0,
    enabled: p.properties?.enabled?.checkbox ?? true,
    order: p.properties?.order?.number ?? 99,
  }
}

export async function GET() {
  // 环境变量检查
  if (!TOKEN) return NextResponse.json({ error: '缺少 NOTION_API_KEY 环境变量', keys: [] }, { status: 500 })
  if (!DB) return NextResponse.json({ error: '缺少 NOTION_HOTKEYS_DB_ID 环境变量', keys: [] }, { status: 500 })

  try {
    const d = await nR(`/databases/${DB}/query`, 'POST', {
      page_size: 50,
      sorts: [{ property: 'order', direction: 'ascending' }],
    })
    if (d.status === 401) return NextResponse.json({ error: 'Notion API Key 无效或已过期', keys: [] }, { status: 500 })
    if (d.status === 404) return NextResponse.json({ error: `数据库 ID "${DB}" 不存在或未授权 Integration 访问`, keys: [] }, { status: 500 })
    if (d.object === 'error') return NextResponse.json({ error: `Notion错误: ${d.message}`, keys: [] }, { status: 500 })
    return NextResponse.json({ keys: (d.results || []).map(p2k) })
  } catch (e: any) {
    return NextResponse.json({ error: `请求失败: ${e.message}`, keys: [] }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  if (!TOKEN || !DB) return NextResponse.json({ error: '环境变量未配置' }, { status: 500 })
  const b = await req.json()
  await nR('/pages', 'POST', {
    parent: { database_id: DB },
    properties: {
      label: { title: [{ text: { content: String(b.label || '') } }] },
      query: { rich_text: [{ text: { content: String(b.query || '') } }] },
      icon: { rich_text: [{ text: { content: String(b.icon || '🔥') } }] },
      enabled: { checkbox: b.enabled !== false },
      order: { number: Number(b.order) || 99 },
      clickCount: { number: 0 },
      searchCount: { number: 0 },
    },
  })
  return NextResponse.json({ created: true })
}

export async function PATCH(req: NextRequest) {
  if (!TOKEN) return NextResponse.json({ error: '环境变量未配置' }, { status: 500 })
  const b = await req.json()
  if (!b.id) return NextResponse.json({ error: '缺少id' }, { status: 400 })
  const props: any = {}
  if (b.label !== undefined) props.label = { title: [{ text: { content: String(b.label) } }] }
  if (b.query !== undefined) props.query = { rich_text: [{ text: { content: String(b.query) } }] }
  if (b.icon !== undefined) props.icon = { rich_text: [{ text: { content: String(b.icon) } }] }
  if (b.enabled !== undefined) props.enabled = { checkbox: !!b.enabled }
  if (b.order !== undefined) props.order = { number: Number(b.order) }
  await nR(`/pages/${b.id}`, 'PATCH', { properties: props })
  return NextResponse.json({ updated: true })
}

export async function DELETE(req: NextRequest) {
  if (!TOKEN) return NextResponse.json({ error: '环境变量未配置' }, { status: 500 })
  const id = new URL(req.url).searchParams.get('id')
  if (!id) return NextResponse.json({ error: '缺少id' }, { status: 400 })
  await nR(`/pages/${id}`, 'PATCH', { archived: true })
  return NextResponse.json({ deleted: true })
}
