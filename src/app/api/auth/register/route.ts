import { NextRequest, NextResponse } from 'next/server'
import { sanitizeInput, rateLimit, getClientIP } from '@/lib/security'
import { findUser, createUser } from '@/lib/user-store'
import { createSession } from '@/lib/session'

// 邮箱格式验证
const EMAIL_RE = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/
// 手机号（中国大陆11位）
const PHONE_RE = /^1[3-9]\d{9}$/
// 密码：8-32位，必须含字母+数字
const PWD_RE = /^(?=.*[a-zA-Z])(?=.*\d).{8,32}$/

export async function POST(req: NextRequest) {
  // 1. 限流：每IP每小时最多注册5次
  const ip = getClientIP(req)
  const limit = rateLimit({ identifier: ip, type: 'register', max: 5, windowSeconds: 3600 })
  if (!limit.allowed) {
    return NextResponse.json(
      { error: '注册太频繁，请1小时后再试' },
      { status: 429 }
    )
  }

  // 2. 解析请求体
  const body = await req.json().catch(() => ({}))
  const rawIdentifier = String(body.identifier ?? '').trim()   // 邮箱或手机
  const rawPassword   = String(body.password   ?? '').trim()

  // 3. 输入消毒
  const { safe: identifier, blocked } = sanitizeInput(rawIdentifier)
  if (blocked || !identifier) {
    return NextResponse.json({ error: '输入包含非法字符' }, { status: 400 })
  }

  // 4. 格式验证
  const isEmail = identifier.includes('@')
  const isPhone = PHONE_RE.test(identifier)

  if (!isEmail && !isPhone) {
    return NextResponse.json({ error: '请输入有效的邮箱或手机号' }, { status: 400 })
  }
  if (isEmail && !EMAIL_RE.test(identifier)) {
    return NextResponse.json({ error: '邮箱格式不正确' }, { status: 400 })
  }
  if (!PWD_RE.test(rawPassword)) {
    return NextResponse.json({ error: '密码需8-32位，包含字母和数字' }, { status: 400 })
  }

  // 5. 检查是否已注册
  const existing = await findUser(identifier)
  if (existing) {
    return NextResponse.json({ error: '该账号已注册，请直接登录' }, { status: 409 })
  }

  // 6. 创建用户
  const user = await createUser({
    email: isEmail ? identifier : undefined,
    phone: isPhone ? identifier : undefined,
    password: rawPassword,
  })

  // 7. 自动登录（写入session cookie）
  const res = NextResponse.json({
    success: true,
    user: { id: user.id, email: user.email, phone: user.phone },
    message: '注册成功',
  })
  await createSession(res, { userId: user.id, email: user.email, phone: user.phone })

  return res
}
