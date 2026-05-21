// Cloudflare Pages Function: /api/auth/login
// Notion wk_users: email(title), phone/passwordHash/salt(rich_text), status(select)
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
  // email是title类型！phone是rich_text
  const filter = isEmail
    ? { property: 'email', title: { equals: identifier.toLowerCase() } }
    : { property: 'phone', rich_text: { equals: identifier } }
  const d = await fetch(`${N}/databases/${env.NOTION_USER_DB_ID}/query`, {
    method: 'POST', headers: nH(env), body: JSON.stringify({ filter, page_size: 1 })
  }).then(r => r.json())
  const page = d.results?.[0]
  if (!page) return null
  const p = page.properties
  const gt = k => p[k]?.rich_text?.[0]?.text?.content ?? p[k]?.title?.[0]?.text?.content ?? ''
  return {
    id: page.id,
    email: p.email?.title?.[0]?.text?.content ?? '',
    phone: gt('phone'),
    passwordHash: gt('passwordHash'),
    salt: gt('salt'),
    status: p.status?.select?.name ?? 'active',
  }
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
  if (!env.NOTION_API_KEY || !env.NOTION_USER_DB_ID) return json({ error: '服务器配置错误（Notion 密钥缺失）' }, 500)

  const body = await request.json().catch(() => ({}))
  const identifier = String(body.identifier ?? '').trim()
  const password = String(body.password ?? '').trim()
  const captchaToken = String(body.captchaToken ?? '').trim()

  if (!identifier || !password) return json({ error: '请输入账号和密码' }, 400)

  const ip = request.headers.get('CF-Connecting-IP') || ''
  const isHuman = await verifyTurnstile(captchaToken, env.TURNSTILE_SECRET_KEY, ip)
  if (!isHuman) return json({ error: '人机验证失败，请重试' }, 403)

  try {
    const user = await findUser(env, identifier)
    if (!user) {
      await new Promise(r => setTimeout(r, 300))
      return json({ error: '账号或密码错误' }, 401)
    }
    const hash = await sha256(password + user.salt)
    if (hash !== user.passwordHash) {
      await new Promise(r => setTimeout(r, 300))
      return json({ error: '账号或密码错误' }, 401)
    }
    if (user.status === 'banned') return json({ error: '该账号已被封禁，请联系客服' }, 403)

    const secret = env.JWT_SECRET || 'wukong-ai-secret-change-in-production'
    const token = await createJWT({ userId: user.id, email: user.email, phone: user.phone }, secret)
    const isProd = !request.url.includes('localhost')
    const flags = `HttpOnly; Path=/; Max-Age=${7*86400}; SameSite=Lax${isProd ? '; Secure' : ''}`

    return cors(new Response(JSON.stringify({
      success: true,
      user: { id: user.id, email: user.email, phone: user.phone }
    }), { status: 200, headers: { 'Content-Type': 'application/json', 'Set-Cookie': `wk_session=${token}; ${flags}` } }))
  } catch (err) {
    return json({ error: `服务器内部错误: ${err.message}` }, 500)
  }
}
