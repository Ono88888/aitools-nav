import { NextRequest, NextResponse } from 'next/server'
import { getSession, destroySession } from '@/lib/session'

// GET /api/auth/me — 获取当前登录用户信息
export async function GET(req: NextRequest) {
  const session = await getSession(req)
  if (!session) {
    return NextResponse.json({ user: null }, { status: 200 })
  }
  return NextResponse.json({ user: session })
}

// DELETE /api/auth/me — 退出登录
export async function DELETE(req: NextRequest) {
  const res = NextResponse.json({ success: true })
  destroySession(res)
  return res
}
