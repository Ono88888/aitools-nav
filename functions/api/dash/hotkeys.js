// Cloudflare Pages Function
// 路径：functions/api/dash/hotkeys.js → 自动映射为 /api/dash/hotkeys

const NOTION = 'https://api.notion.com/v1'
const NOTION_VERSION = '2022-06-28'

function getHeaders(env) {
  return {
    'Authorization': `Bearer ${env.NOTION_API_KEY}`,
    'Content-Type': 'application/json',
    'Notion-Version': NOTION_VERSION,
  }
}

function p2k(page) {
  const p = page.properties
  return {
    id: page.id,
    label: p?.label?.title?.[0]?.plain_text ?? '',
    query: p?.query?.rich_text?.[0]?.plain_text ?? '',
    icon: p?.icon?.rich_text?.[0]?.plain_text ?? '🔥',
    clickCount: p?.clickCount?.number ?? 0,
    searchCount: p?.searchCount?.number ?? 0,
    enabled: p?.enabled?.checkbox ?? true,
    order: p?.order?.number ?? 99,
  }
}

function cors(response) {
  const headers = new Headers(response.headers)
  headers.set('Access-Control-Allow-Origin', '*')
  headers.set('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS')
  headers.set('Access-Control-Allow-Headers', 'Content-Type')
  return new Response(response.body, { status: response.status, headers })
}

function json(data, status = 200) {
  return cors(new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  }))
}

export async function onRequest({ request, env }) {
  // OPTIONS 预检
  if (request.method === 'OPTIONS') {
    return cors(new Response(null, { status: 204 }))
  }

  const TOKEN = env.NOTION_API_KEY
  const DB = env.NOTION_HOTKEYS_DB_ID

  if (!TOKEN) return json({ error: '缺少 NOTION_API_KEY', keys: [] }, 500)
  if (!DB) return json({ error: '缺少 NOTION_HOTKEYS_DB_ID', keys: [] }, 500)

  const h = getHeaders(env)

  // GET - 读取热搜列表
  if (request.method === 'GET') {
    try {
      const res = await fetch(`${NOTION}/databases/${DB}/query`, {
        method: 'POST', headers: h,
        body: JSON.stringify({ page_size: 50, sorts: [{ property: 'order', direction: 'ascending' }] })
      })
      const d = await res.json()
      if (d.object === 'error') return json({ error: `Notion: ${d.message}`, keys: [] }, 500)
      const raw = (d.results || []).map(p2k)
    // 按label去重，保留第一条
    const seen = new Set()
    const keys = raw.filter(k => { if(seen.has(k.label)) return false; seen.add(k.label); return true })
    return json({ keys })
    } catch (e) {
      return json({ error: `请求失败: ${e.message}`, keys: [] }, 500)
    }
  }

  // POST - 新增
  if (request.method === 'POST') {
    const b = await request.json()
    await fetch(`${NOTION}/pages`, {
      method: 'POST', headers: h,
      body: JSON.stringify({
        parent: { database_id: DB },
        properties: {
          label: { title: [{ text: { content: String(b.label || '') } }] },
          query: { rich_text: [{ text: { content: String(b.query || '') } }] },
          icon: { rich_text: [{ text: { content: String(b.icon || '🔥') } }] },
          enabled: { checkbox: b.enabled !== false },
          order: { number: Number(b.order) || 99 },
          clickCount: { number: 0 },
          searchCount: { number: 0 },
        }
      })
    })
    return json({ created: true })
  }

  // PATCH - 更新
  if (request.method === 'PATCH') {
    const b = await request.json()
    if (!b.id) return json({ error: '缺少id' }, 400)
    const props = {}
    if (b.label !== undefined) props.label = { title: [{ text: { content: String(b.label) } }] }
    if (b.query !== undefined) props.query = { rich_text: [{ text: { content: String(b.query) } }] }
    if (b.icon !== undefined) props.icon = { rich_text: [{ text: { content: String(b.icon) } }] }
    if (b.enabled !== undefined) props.enabled = { checkbox: !!b.enabled }
    if (b.order !== undefined) props.order = { number: Number(b.order) }
    await fetch(`${NOTION}/pages/${b.id}`, { method: 'PATCH', headers: h, body: JSON.stringify({ properties: props }) })
    return json({ updated: true })
  }

  // DELETE - 删除
  if (request.method === 'DELETE') {
    const url = new URL(request.url)
    const id = url.searchParams.get('id')
    if (!id) return json({ error: '缺少id' }, 400)
    await fetch(`${NOTION}/pages/${id}`, { method: 'PATCH', headers: h, body: JSON.stringify({ archived: true }) })
    return json({ deleted: true })
  }

  return json({ error: 'Method not allowed' }, 405)
}
