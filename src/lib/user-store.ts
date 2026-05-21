// ── src/lib/user-store.ts ────────────────────────────────────
// 用户存储：以 Notion 数据库作为用户表
// 字段：id, email, phone, passwordHash, createdAt, dailyCount, lastQueryDate, status

import { generateToken } from './security'

const NOTION_API = 'https://api.notion.com/v1'
const TOKEN = process.env.NOTION_API_KEY!
const USER_DB = process.env.NOTION_USER_DB_ID!   // 需新建用户数据库

if (!TOKEN || !USER_DB) {
  console.error('CRITICAL: NOTION_API_KEY or NOTION_USER_DB_ID is missing in environment variables.')
}

// ── Notion请求封装 ────────────────────────────────────────────
async function notionRequest(path: string, method = 'GET', body?: object) {
  const res = await fetch(`${NOTION_API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Notion API ${res.status}: ${err}`)
  }
  return res.json()
}

// ── 类型定义 ──────────────────────────────────────────────────
export interface UserRecord {
  id: string
  email: string
  phone: string
  passwordHash: string
  salt: string
  createdAt: string
  dailyCount: number
  lastQueryDate: string   // YYYY-MM-DD
  status: 'active' | 'banned'
  verifyToken: string
  verified: boolean
}

// ── 密码哈希（Web Crypto API，Edge Runtime兼容）────────────────
export async function hashPassword(password: string, salt?: string): Promise<{ hash: string; salt: string }> {
  const s = salt ?? generateToken(16)
  const encoder = new TextEncoder()
  const data = encoder.encode(password + s)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  return { hash, salt: s }
}

export async function verifyPassword(password: string, hash: string, salt: string): Promise<boolean> {
  const { hash: newHash } = await hashPassword(password, salt)
  return newHash === hash
}

// ── 今天日期 ──────────────────────────────────────────────────
function today(): string {
  return new Date().toISOString().slice(0, 10)
}

// ── 查找用户（按邮箱或手机）─────────────────────────────────────
export async function findUser(identifier: string): Promise<UserRecord | null> {
  const isEmail = identifier.includes('@')
  const filter = isEmail
    ? { property: 'email', rich_text: { equals: identifier.toLowerCase() } }
    : { property: 'phone', rich_text: { equals: identifier } }

  const data = await notionRequest(`/databases/${USER_DB}/query`, 'POST', { filter })
  const page = data.results?.[0]
  if (!page) return null
  return pageToUser(page)
}

// ── 按ID查找用户 ──────────────────────────────────────────────
export async function findUserById(id: string): Promise<UserRecord | null> {
  try {
    const page = await notionRequest(`/pages/${id}`)
    return pageToUser(page)
  } catch {
    return null
  }
}

// ── 创建用户 ──────────────────────────────────────────────────
export async function createUser(params: {
  email?: string
  phone?: string
  password: string
}): Promise<UserRecord> {
  const { hash, salt } = await hashPassword(params.password)
  const verifyToken = generateToken(32)

  const page = await notionRequest('/pages', 'POST', {
    parent: { database_id: USER_DB },
    properties: {
      // name字段作为标题，显示邮箱或手机
      name:          { title: [{ text: { content: params.email || params.phone || 'user' } }] },
      email:         { rich_text: [{ text: { content: (params.email || '').toLowerCase() } }] },
      phone:         { rich_text: [{ text: { content: params.phone || '' } }] },
      passwordHash:  { rich_text: [{ text: { content: hash } }] },
      salt:          { rich_text: [{ text: { content: salt } }] },
      createdAt:     { rich_text: [{ text: { content: new Date().toISOString() } }] },
      dailyCount:    { number: 0 },
      lastQueryDate: { rich_text: [{ text: { content: '' } }] },
      status:        { select: { name: 'active' } },
      verifyToken:   { rich_text: [{ text: { content: verifyToken } }] },
      verified:      { checkbox: false },
    },
  })

  return pageToUser(page)
}

// ── 更新每日查询次数 ───────────────────────────────────────────
export async function updateDailyCount(userId: string, currentCount: number, date: string): Promise<void> {
  await notionRequest(`/pages/${userId}`, 'PATCH', {
    properties: {
      dailyCount:    { number: currentCount + 1 },
      lastQueryDate: { rich_text: [{ text: { content: date } }] },
    },
  })
}

// ── 重置每日次数（新的一天自动重置）──────────────────────────────
export async function checkAndResetDaily(user: UserRecord): Promise<{ count: number; date: string }> {
  const todayStr = today()
  if (user.lastQueryDate !== todayStr) {
    // 新的一天，重置计数
    await notionRequest(`/pages/${user.id}`, 'PATCH', {
      properties: {
        dailyCount:    { number: 0 },
        lastQueryDate: { rich_text: [{ text: { content: todayStr } }] },
      },
    })
    return { count: 0, date: todayStr }
  }
  return { count: user.dailyCount, date: todayStr }
}

// ── Notion页面 → UserRecord ────────────────────────────────────
function pageToUser(page: any): UserRecord {
  const p = page.properties ?? {}
  const getText = (key: string) => p[key]?.rich_text?.[0]?.text?.content ?? ''
  return {
    id:            page.id,
    email:         getText('email'),
    phone:         getText('phone'),
    passwordHash:  getText('passwordHash'),
    salt:          getText('salt'),
    createdAt:     getText('createdAt'),
    dailyCount:    p['dailyCount']?.number ?? 0,
    lastQueryDate: getText('lastQueryDate'),
    status:        p['status']?.select?.name ?? 'active',
    verifyToken:   getText('verifyToken'),
    verified:      p['verified']?.checkbox ?? false,
  }
}
