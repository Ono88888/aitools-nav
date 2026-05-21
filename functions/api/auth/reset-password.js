// Cloudflare Pages Function: /api/auth/reset-password
// 验证验证码 + 重置密码
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

async function findUserByEmail(env, email) {
  const d = await fetch(`${N}/databases/${env.NOTION_USER_DB_ID}/query`, {
    method: 'POST', headers: nH(env),
    body: JSON.stringify({ filter: { property: 'email', title: { equals: email.toLowerCase() } }, page_size: 1 })
  }).then(r => r.json())
  const page = d.results?.[0]
  if (!page) return null
  const p = page.properties
  const gt = k => p[k]?.rich_text?.[0]?.text?.content ?? ''
  return { id: page.id, verifyToken: gt('verifyToken'), salt: gt('salt') }
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

  const { email, code, newPassword } = await request.json().catch(() => ({}))

  if (!email || !code || !newPassword) return json({ error: '参数不完整' }, 400)
  if (!/^(?=.*[a-zA-Z])(?=.*\d).{8,32}$/.test(newPassword))
    return json({ error: '密码需8-32位，包含字母和数字' }, 400)

  const user = await findUserByEmail(env, email.trim())
  if (!user) return json({ error: '该邮箱未注册' }, 404)

  // 验证验证码: verifyToken格式为 "code:过期时间戳"
  const [storedCode, expStr] = (user.verifyToken || '').split(':')
  const exp = parseInt(expStr || '0')

  if (storedCode !== String(code).trim()) return json({ error: '验证码错误' }, 400)
  if (Date.now() > exp) return json({ error: '验证码已过期，请重新发送' }, 400)

  // 更新密码
  const newSalt = crypto.randomUUID().replace(/-/g,'')
  const newHash = await sha256(newPassword + newSalt)

  await fetch(`${N}/pages/${user.id}`, {
    method: 'PATCH', headers: nH(env),
    body: JSON.stringify({
      properties: {
        passwordHash: { rich_text: [{ text: { content: newHash } }] },
        salt:         { rich_text: [{ text: { content: newSalt } }] },
        verifyToken:  { rich_text: [{ text: { content: '' } }] }, // 清除验证码
      }
    })
  })

  // 自动登录
  const secret = env.JWT_SECRET || 'wukong-ai-secret-change-in-production'
  const token = await createJWT({ userId: user.id, email: email.trim().toLowerCase(), phone: '' }, secret)
  const isProd = !request.url.includes('localhost')
  const flags = `HttpOnly; Path=/; Max-Age=${7*86400}; SameSite=Lax${isProd ? '; Secure' : ''}`

  return cors(new Response(JSON.stringify({
    success: true,
    message: '密码重置成功，已自动登录',
    user: { id: user.id, email: email.trim().toLowerCase(), phone: '' }
  }), { status: 200, headers: { 'Content-Type': 'application/json', 'Set-Cookie': `wk_session=${token}; ${flags}` } }))
}
