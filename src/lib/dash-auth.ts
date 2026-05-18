import { NextRequest } from 'next/server'
// 后台API简单鉴权：检查请求头里的token或session中的admin标记
// 真实场景建议用更强的方式，这里用简单的密钥验证
export function isDashRequest(req: NextRequest): boolean {
  const token = req.headers.get('x-dash-token')
  const validToken = process.env.DASH_SECRET_TOKEN
  if (validToken && token === validToken) return true
  // 也接受同域请求（同源调用）
  const origin = req.headers.get('origin') || req.headers.get('referer') || ''
  return origin.includes('gowukong.co') || origin.includes('localhost')
}
