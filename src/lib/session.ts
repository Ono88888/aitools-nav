// ── src/lib/session.ts ───────────────────────────────────────
// 基于 JWT + Cookie 的无状态 Session（Edge Runtime 兼容）

import { NextRequest, NextResponse } from 'next/server'

const SECRET = process.env.JWT_SECRET ?? 'wukong-ai-secret-change-in-production'
const COOKIE_NAME = 'wk_session'
const EXPIRES_DAYS = 7

// ── 简易JWT（不依赖外部库，Edge Runtime兼容）─────────────────
async function sign(payload: object): Promise<string> {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const body = btoa(JSON.stringify({ ...payload, iat: Math.floor(Date.now() / 1000) }))
  const data = `${header}.${body}`

  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(SECRET),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data))
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')

  return `${data}.${sigB64}`
}

async function verify(token: string): Promise<any | null> {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const [header, body, sig] = parts
    const data = `${header}.${body}`

    const key = await crypto.subtle.importKey(
      'raw', new TextEncoder().encode(SECRET),
      { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']
    )
    const sigBuf = Uint8Array.from(atob(sig.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0))
    const valid = await crypto.subtle.verify('HMAC', key, sigBuf, new TextEncoder().encode(data))
    if (!valid) return null

    const payload = JSON.parse(atob(body))
    // 检查过期
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null
    return payload
  } catch {
    return null
  }
}

// ── 对外接口 ─────────────────────────────────────────────────
export interface SessionPayload {
  userId: string
  email: string
  phone: string
}

// 创建session cookie
export async function createSession(res: NextResponse, payload: SessionPayload): Promise<void> {
  const exp = Math.floor(Date.now() / 1000) + EXPIRES_DAYS * 86400
  const token = await sign({ ...payload, exp })

  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,                        // JS无法读取，防XSS
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: EXPIRES_DAYS * 86400,
    path: '/',
  })
}

// 销毁session
export function destroySession(res: NextResponse): void {
  res.cookies.set(COOKIE_NAME, '', { maxAge: 0, path: '/' })
}

// 从请求读取session
export async function getSession(req: NextRequest): Promise<SessionPayload | null> {
  const token = req.cookies.get(COOKIE_NAME)?.value
  if (!token) return null
  return verify(token)
}
