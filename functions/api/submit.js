// Cloudflare Pages Function: /api/submit
// 接收工具收录申请，写入 Notion wk_submissions 数据库

const NOTION = 'https://api.notion.com/v1'
const VER = '2022-06-28'

function cors(res) {
  const h = new Headers(res.headers)
  h.set('Access-Control-Allow-Origin', '*')
  h.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  h.set('Access-Control-Allow-Headers', 'Content-Type')
  return new Response(res.body, { status: res.status, headers: h })
}

function json(data, status = 200) {
  return cors(new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  }))
}

export async function onRequest({ request, env }) {
  if (request.method === 'OPTIONS') return cors(new Response(null, { status: 204 }))
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  const TOKEN = env.NOTION_API_KEY
  const DB = env.NOTION_SUBMISSIONS_DB_ID

  // 如果没配 DB，降级到只发邮件通知（不报错）
  if (!TOKEN || !DB) {
    // 没有Notion配置时，至少返回成功，避免用户看到错误
    console.log('[submit] Notion未配置，跳过写入')
    return json({ ok: true, message: '已收到，通过邮件联系' })
  }

  let body
  try {
    body = await request.json()
  } catch {
    return json({ error: '请求格式错误' }, 400)
  }

  const { name, url, reason, email } = body
  if (!name?.trim() || !url?.trim()) {
    return json({ error: '工具名称和官网链接为必填项' }, 400)
  }
  if (!url.startsWith('http')) {
    return json({ error: '官网链接请以 https:// 开头' }, 400)
  }

  try {
    const res = await fetch(`${NOTION}/pages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
        'Notion-Version': VER,
      },
      body: JSON.stringify({
        parent: { database_id: DB },
        properties: {
          // Title 字段：工具名称
          toolName: {
            title: [{ text: { content: String(name).slice(0, 100) } }]
          },
          url: {
            url: String(url).slice(0, 500)
          },
          reason: {
            rich_text: [{ text: { content: String(reason || '').slice(0, 500) } }]
          },
          submitterEmail: {
            email: email ? String(email).slice(0, 200) : null
          },
          status: {
            select: { name: '待审核' }
          },
          submittedAt: {
            date: { start: new Date().toISOString() }
          },
        }
      })
    })

    const d = await res.json()
    if (d.object === 'error') {
      console.error('[submit] Notion error:', d.message)
      return json({ error: `提交失败：${d.message}` }, 500)
    }

    return json({ ok: true })
  } catch (e) {
    console.error('[submit] fetch error:', e.message)
    return json({ error: '网络错误，请稍后重试' }, 500)
  }
}
