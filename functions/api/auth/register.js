// Cloudflare Pages Function: /api/auth/register
// Notion wk_users 字段：email(title), phone/passwordHash/salt/createdAt/lastQueryDate/verifyToken(text), dailyCount(number), status(select), verified(checkbox)
const N = 'https://api.notion.com/v1', VER = '2022-06-28'

function cors(res) {
  const h = new Headers(res.headers)
  h.set('Access-Control-Allow-Origin', '*')
  h.set('Access-Control-Allow-Methods', 'POST,OPTIONS')
  h.set('Access-Control-Allow-Headers', 'Content-Type')
  return new Response(res.body, { status: res.status, headers: h })
}
function json(data, status = 200) {
  return cors(new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } }))
}
function nH(env) {
  return { Authorization: `Bearer ${env.NOTION_API_KEY}`, 'Content-Type': 'application/json', 'Notion-Version': VER }
}
async function sha256(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('')
}
async function verifyTurnstile(token, secret, ip) {
  if (!secret) return true
  if (!token) return false
  const fd = new FormData()
  fd.append('secret', secret)
  fd.append('response', token)
  if (ip) fd.append('remoteip', ip)
  const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: fd })
  const d = await r.json()
  return d.success === true
}
async function findUser(env, identifier) {
  const isEmail = identifier.includes('@')
  // email是title字段，phone是rich_text
  const filter = isEmail
    ? { property: 'email', title: { equals: identifier.toLowerCase() } }
    : { property: 'phone', rich_text: { equals: identifier } }
  const d = await fetch(`${N}/databases/${env.NOTION_USER_DB_ID}/query`, {
    method: 'POST', headers: nH(env), body: JSON.stringify({ filter, page_size: 1 })
  }).then(r => r.json())
  return d.results?.[0] ?? null
}
async function createJWT(payload, secret) {
  const h = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const b = btoa(JSON.stringify({ ...payload, exp: Math.floor(Date.now()/1000) + 7*86400 }))
  const data = `${h}.${b}`
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data))
  const s = btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=/g,'')
  return `${data}.${s}`
}

export async function onRequest({ request, env }) {
  if (request.method === 'OPTIONS') return cors(new Response(null, { status: 204 }))
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405)
  if (!env.NOTION_API_KEY || !env.NOTION_USER_DB_ID) return json({ error: '服务器配置错误' }, 500)

  const body = await request.json().catch(() => ({}))
  const identifier = String(body.identifier ?? '').trim()
  const password = String(body.password ?? '').trim()
  const captchaToken = String(body.captchaToken ?? '').trim()

  const ip = request.headers.get('CF-Connecting-IP') || ''
  const isHuman = await verifyTurnstile(captchaToken, env.TURNSTILE_SECRET_KEY, ip)
  if (!isHuman) return json({ error: '人机验证失败，请重试' }, 403)

  const isEmail = identifier.includes('@')
  const isPhone = /^1[3-9]\d{9}$/.test(identifier)
  if (!isEmail && !isPhone) return json({ error: '请输入有效的邮箱或手机号' }, 400)
  if (!/^(?=.*[a-zA-Z])(?=.*\d).{8,32}$/.test(password)) return json({ error: '密码需8-32位，包含字母和数字' }, 400)

  try {
    const existing = await findUser(env, identifier)
    if (existing) return json({ error: '该账号已注册，请直接登录' }, 409)

    const salt = crypto.randomUUID().replace(/-/g,'')
    const passwordHash = await sha256(password + salt)
    // 注意：email 是 title 类型，其余是 rich_text
    const page = await fetch(`${N}/pages`, {
      method: 'POST', headers: nH(env),
      body: JSON.stringify({
        parent: { database_id: env.NOTION_USER_DB_ID },
        properties: {
          email:         { title: [{ text: { content: isEmail ? identifier.toLowerCase() : (isPhone ? identifier : 'user') } }] },
          phone:         { rich_text: [{ text: { content: isPhone ? identifier : '' } }] },
          passwordHash:  { rich_text: [{ text: { content: passwordHash } }] },
          salt:          { rich_text: [{ text: { content: salt } }] },
          createdAt:     { rich_text: [{ text: { content: new Date().toISOString() } }] },
          dailyCount:    { number: 0 },
          lastQueryDate: { rich_text: [{ text: { content: '' } }] },
          status:        { select: { name: 'active' } },
          verified:      { checkbox: false },
          verifyToken:   { rich_text: [{ text: { content: crypto.randomUUID() } }] },
        }
      })
    }).then(r => r.json())

    if (page.object === 'error') return json({ error: `注册失败: ${page.message}` }, 500)

    const userId = page.id
    const secret = env.JWT_SECRET || 'wukong-ai-secret-change-in-production'
    const token = await createJWT({ userId, email: isEmail ? identifier.toLowerCase() : '', phone: isPhone ? identifier : '' }, secret)
    const isProd = !request.url.includes('localhost')
    const flags = `HttpOnly; Path=/; Max-Age=${7*86400}; SameSite=Lax${isProd ? '; Secure' : ''}`

    return cors(new Response(JSON.stringify({
      success: true,
      user: { id: userId, email: isEmail ? identifier.toLowerCase() : '', phone: isPhone ? identifier : '' },
      message: '注册成功'
    }), { status: 200, headers: { 'Content-Type': 'application/json', 'Set-Cookie': `wk_session=${token}; ${flags}` } }))
  } catch (err) {
    return json({ error: `服务器内部错误: ${err.message}` }, 500)
  }
}
