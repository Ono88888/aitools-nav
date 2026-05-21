import { NextRequest, NextResponse } from 'next/server'
import { sanitizeInput, rateLimit, getClientIP, verifyTurnstile } from '@/lib/security'
import { findUser, verifyPassword } from '@/lib/user-store'
import { createSession } from '@/lib/session'

export async function POST(req: NextRequest) {
  // 1. 限流：每IP每小时最多登录20次（防暴力破解）
  const ip = getClientIP(req)
  const limit = rateLimit({ identifier: ip, type: 'login', max: 20, windowSeconds: 3600 })
  if (!limit.allowed) {
    return NextResponse.json(
      { error: '登录尝试过多，请1小时后再试' },
      { status: 429 }
    )
  }

  const body = await req.json().catch(() => ({}))
  const rawId  = String(body.identifier ?? '').trim()
  const rawPwd = String(body.password   ?? '').trim()
  const captchaToken = String(body.captchaToken ?? '').trim()

  // 2. 人机验证
  const isHuman = await verifyTurnstile(captchaToken, ip)
  if (!isHuman) {
    return NextResponse.json({ error: '人机验证失败，请重试' }, { status: 403 })
  }

  const { safe: identifier, blocked } = sanitizeInput(rawId)
  if (blocked || !identifier || !rawPwd) {
    return NextResponse.json({ error: '请输入账号和密码' }, { status: 400 })
  }

  // 3. 查找用户（统一错误信息，防止账号枚举攻击）
  const user = await findUser(identifier)
  if (!user) {
    // 故意延迟，防止timing attack
    await new Promise(r => setTimeout(r, 300))
    return NextResponse.json({ error: '账号或密码错误' }, { status: 401 })
  }

  // 4. 验证密码
  const ok = await verifyPassword(rawPwd, user.passwordHash, user.salt)
  if (!ok) {
    await new Promise(r => setTimeout(r, 300))
    return NextResponse.json({ error: '账号或密码错误' }, { status: 401 })
  }

  // 5. 检查封禁状态
  if (user.status === 'banned') {
    return NextResponse.json({ error: '该账号已被封禁，请联系客服' }, { status: 403 })
  }

  // 6. 写入session cookie
  const res = NextResponse.json({
    success: true,
    user: { id: user.id, email: user.email, phone: user.phone },
  })
  await createSession(res, { userId: user.id, email: user.email, phone: user.phone })

  return res
}
