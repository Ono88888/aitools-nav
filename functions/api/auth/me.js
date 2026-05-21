// Cloudflare Pages Function: /api/auth/me
function cors(res) {
  const h = new Headers(res.headers)
  h.set('Access-Control-Allow-Origin', '*')
  h.set('Access-Control-Allow-Methods', 'GET,OPTIONS')
  h.set('Access-Control-Allow-Headers', 'Content-Type')
  return new Response(res.body, { status: res.status, headers: h })
}
function json(data, status = 200) {
  return cors(new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } }))
}

async function verifyJWT(token, secret) {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const [header, body, sig] = parts
    const data = `${header}.${body}`
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify'])
    const sigBuf = Uint8Array.from(atob(sig.replace(/-/g,'+').replace(/_/g,'/')), c => c.charCodeAt(0))
    const valid = await crypto.subtle.verify('HMAC', key, sigBuf, new TextEncoder().encode(data))
    if (!valid) return null
    const payload = JSON.parse(atob(body))
    if (payload.exp && payload.exp < Math.floor(Date.now()/1000)) return null
    return payload
  } catch { return null }
}

export async function onRequest({ request, env }) {
  if (request.method === 'OPTIONS') return cors(new Response(null, { status: 204 }))

  const cookie = request.headers.get('Cookie') || ''
  const match = cookie.match(/wk_session=([^;]+)/)
  if (!match) return json({ user: null }, 200)

  const secret = env.JWT_SECRET || 'wukong-ai-secret-change-in-production'
  const payload = await verifyJWT(match[1], secret)
  if (!payload) return json({ user: null }, 200)

  return json({ user: { id: payload.userId, email: payload.email, phone: payload.phone } })
}
