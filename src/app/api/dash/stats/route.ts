import { NextRequest, NextResponse } from 'next/server'
const NOTION = 'https://api.notion.com/v1'
const TOKEN = process.env.NOTION_API_KEY!
const VER = '2022-06-28'
const h = { Authorization:`Bearer ${TOKEN}`, 'Content-Type':'application/json', 'Notion-Version': VER }

async function countDB(dbId: string | undefined, filter?: object): Promise<number> {
  if (!dbId) return 0
  try {
    const r = await fetch(`${NOTION}/databases/${dbId}/query`, { method:'POST', headers:h, body: JSON.stringify({ filter, page_size: 1 }) })
    const d = await r.json()
    return d.results?.length ?? 0
  } catch { return 0 }
}

export async function GET(_req: NextRequest) {
  const [users, favorites, learnItems] = await Promise.all([
    countDB(process.env.NOTION_USER_DB_ID),
    countDB(process.env.NOTION_FAVORITES_DB_ID),
    countDB(process.env.NOTION_LEARN_DB_ID, { property:'approved', checkbox:{ equals:false } }),
  ])
  return NextResponse.json({ todaySearches: '—', totalUsers: users, totalFavorites: favorites, pendingComments: '—', learnedKeywords: learnItems, totalTools: 87 })
}
