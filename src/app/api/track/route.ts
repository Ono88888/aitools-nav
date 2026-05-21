import { NextRequest, NextResponse } from 'next/server'
import { trackEvent } from '@/lib/analytics'
import { getClientIP } from '@/lib/security'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { type, path, target, userId, metadata } = body
    const ip = getClientIP(req)
    const userAgent = req.headers.get('user-agent') || ''

    // 异步追踪，不阻塞响应
    trackEvent({
      type,
      path,
      target,
      userId,
      ip,
      userAgent,
      metadata
    }).catch(err => console.error('Track error:', err))

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 400 })
  }
}
