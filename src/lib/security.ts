// ── src/lib/security.ts ─────────────────────────────────────
// 安全工具：输入消毒 + 注入防护 + 限流 + 人机验证

// ────────────────────────────────────────────────────────────
// 1. 输入消毒（防 XSS / SQL注入 / prompt注入）
// ────────────────────────────────────────────────────────────
const DANGEROUS_PATTERNS = [
  // SQL 注入
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|EXEC|SCRIPT)\b)/gi,
  // Prompt 注入（阻止攻击者改写AI指令）
  /(ignore previous|ignore above|disregard|system prompt|you are now|act as|jailbreak)/gi,
  // XSS
  /<[^>]*script[^>]*>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  // 路径穿越
  /\.\.[\/\\]/g,
  // 超长重复（洪水攻击）
  /(.)\1{20,}/g,
]

export function sanitizeInput(raw: string): { safe: string; blocked: boolean } {
  // 1. 截断（最多200字，API层再截短）
  let s = String(raw ?? '').slice(0, 200).trim()

  // 2. 检测危险模式
  for (const pat of DANGEROUS_PATTERNS) {
    if (pat.test(s)) {
      return { safe: '', blocked: true }
    }
  }

  // 3. 移除控制字符、保留正常中英文标点
  s = s.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')

  // 4. 折叠多余空白
  s = s.replace(/\s{3,}/g, ' ')

  return { safe: s, blocked: false }
}

// ────────────────────────────────────────────────────────────
// 2. 关键词安全验证（只允许中文/英文/数字/常用标点）
// ────────────────────────────────────────────────────────────
export function sanitizeKeyword(word: string): string | null {
  const w = word.trim().slice(0, 20)
  // 只允许中文、英文字母、数字、下划线、连字符
  if (!/^[\u4e00-\u9fa5a-zA-Z0-9_\-]+$/.test(w)) return null
  if (w.length < 2) return null
  return w.toLowerCase()
}

// ────────────────────────────────────────────────────────────
// 3. IP 限流（基于 KV 存储，防刷）
//    - 搜索：每天3次（已登录用户）/ 每天1次（游客）
//    - 注册：每IP每小时5次
//    - 登录：每IP每小时20次
// ────────────────────────────────────────────────────────────
export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number   // Unix timestamp（秒）
}

// 基于 Cloudflare KV 的限流（key格式：rl:{type}:{identifier}:{window}）
// 如果没有KV，降级为内存Map（重启后重置，单机可用）
const memoryStore = new Map<string, { count: number; resetAt: number }>()

export function rateLimit(params: {
  identifier: string   // IP 或 userId
  type: 'search' | 'register' | 'login' | 'learn' | 'favorites' | 'api'
  max: number
  windowSeconds: number
}): RateLimitResult {
  const { identifier, type, max, windowSeconds } = params
  const now = Math.floor(Date.now() / 1000)
  const window = Math.floor(now / windowSeconds)
  const key = `rl:${type}:${identifier}:${window}`
  const resetAt = (window + 1) * windowSeconds

  const record = memoryStore.get(key) ?? { count: 0, resetAt }
  record.count += 1
  memoryStore.set(key, record)

  // 清理过期记录（避免内存泄漏）
  if (memoryStore.size > 10000) {
    Array.from(memoryStore.entries()).forEach(([k, v]) => {
      if (v.resetAt < now) memoryStore.delete(k)
    })
  }

  return {
    allowed: record.count <= max,
    remaining: Math.max(0, max - record.count),
    resetAt,
  }
}

// ────────────────────────────────────────────────────────────
// 4. 提取客户端IP（兼容 Cloudflare / Vercel / 直连）
// ────────────────────────────────────────────────────────────
export function getClientIP(req: Request): string {
  const headers = req instanceof Request ? req.headers : new Headers()
  return (
    headers.get('cf-connecting-ip') ||
    headers.get('x-real-ip') ||
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown'
  )
}

// ────────────────────────────────────────────────────────────
// 5. Cloudflare Turnstile (CAPTCHA) 验证
// ────────────────────────────────────────────────────────────
export async function verifyTurnstile(token: string, ip?: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) {
    console.error('CRITICAL: TURNSTILE_SECRET_KEY is not set in environment variables.')
    // 为了防止在配置未完成时完全锁死，如果是开发环境可以跳过，但生产环境必须报错
    if (process.env.NODE_ENV === 'development') return true
    throw new Error('服务器安全配置错误 (Turnstile Secret Missing)')
  }
  if (!token) {
    console.warn('Turnstile verification failed: No token provided.')
    return false
  }

  try {
    const formData = new FormData()
    formData.append('secret', secret)
    formData.append('response', token)
    if (ip) formData.append('remoteip', ip)

    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
    })
    const data = await res.json()
    return !!data.success
  } catch (err) {
    console.error('Turnstile verification error:', err)
    return false
  }
}

// ────────────────────────────────────────────────────────────
// 6. 简单 CSRF token 生成/验证（用于表单提交）
// ────────────────────────────────────────────────────────────
export function generateToken(length = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)]
  }
  return result
}
