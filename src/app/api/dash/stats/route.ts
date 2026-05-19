import { NextRequest, NextResponse } from 'next/server'

const N = 'https://api.notion.com/v1'
const TOKEN = process.env.NOTION_API_KEY
const VER = '2022-06-28'

function h() {
  return { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json', 'Notion-Version': VER }
}

async function countDB(dbId: string | undefined, filter?: object): Promise<number | string> {
  if (!TOKEN) return 'NO_KEY'
  if (!dbId) return 'NO_DB'
  try {
    const r = await fetch(`${N}/databases/${dbId}/query`, {
      method: 'POST', headers: h(),
      body: JSON.stringify({ filter, page_size: 100 }),
    })
    const d = await r.json()
    if (d.object === 'error') return `ERR:${d.message}`
    return d.results?.length ?? 0
  } catch (e: any) { return `ERR:${e.message}` }
}

export async function GET(_req: NextRequest) {
  const envStatus = {
    hasNotionKey: !!TOKEN,
    hasUserDb: !!process.env.NOTION_USER_DB_ID,
    hasFavDb: !!process.env.NOTION_FAVORITES_DB_ID,
    hasLearnDb: !!process.env.NOTION_LEARN_DB_ID,
    hasHotkeysDb: !!process.env.NOTION_HOTKEYS_DB_ID,
  }

  const [users, favorites, learnItems, approvedKeywords] = await Promise.all([
    countDB(process.env.NOTION_USER_DB_ID),
    countDB(process.env.NOTION_FAVORITES_DB_ID),
    countDB(process.env.NOTION_LEARN_DB_ID, { property: 'approved', checkbox: { equals: false } }),
    countDB(process.env.NOTION_LEARN_DB_ID, { property: 'approved', checkbox: { equals: true } }),
  ])

  return NextResponse.json({
    todaySearches: '需接入统计服务',
    totalUsers: users,
    totalFavorites: favorites,
    pendingLearn: learnItems,
    approvedKeywords,
    totalTools: 88,
    totalCombos: 36,
    envStatus,  // 前端可以用这个显示哪些环境变量已配置
  })
}
