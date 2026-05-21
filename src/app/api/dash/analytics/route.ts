import { NextRequest, NextResponse } from 'next/server'

const N = 'https://api.notion.com/v1'
const TOKEN = process.env.NOTION_API_KEY!
const LEARN_DB = process.env.NOTION_LEARN_DB_ID!
const LOGS_DB = process.env.NOTION_LOGS_DB_ID!

const h = { 
  Authorization: `Bearer ${TOKEN}`, 
  'Content-Type': 'application/json', 
  'Notion-Version': '2022-06-28' 
}

export async function GET(_req: NextRequest) {
  if (!TOKEN) return NextResponse.json({ error: 'No API Key' }, { status: 500 })

  try {
    // 1. 获取搜索词排行 (来自 Learn DB)
    let topSearches = []
    if (LEARN_DB) {
      const d = await fetch(`${N}/databases/${LEARN_DB}/query`, {
        method: 'POST',
        headers: h,
        body: JSON.stringify({ 
          sorts: [{ property: 'hitCount', direction: 'descending' }], 
          page_size: 20 
        })
      }).then(r => r.json())
      topSearches = (d.results || []).map((p: any) => ({
        query: p.properties?.originalQuery?.rich_text?.[0]?.plain_text ?? '',
        scene: p.properties?.scene?.select?.name ?? '',
        count: p.properties?.hitCount?.number ?? 0,
      })).filter((i: any) => i.query)
    }

    // 2. 获取最近点击排行 (来自 Logs DB)
    let topClicks: any[] = []
    let recentVisits: any[] = []
    if (LOGS_DB) {
      const logsData = await fetch(`${N}/databases/${LOGS_DB}/query`, {
        method: 'POST',
        headers: h,
        body: JSON.stringify({ 
          sorts: [{ property: 'Timestamp', direction: 'descending' }], 
          page_size: 100 
        })
      }).then(r => r.json())

      const results = logsData.results || []
      
      // 统计点击（增加空值保护）
      const clickMap = new Map()
      results
        .filter((r: any) => r.properties?.Type?.select?.name === 'click')
        .forEach((r: any) => {
          const target = r.properties?.Target?.rich_text?.[0]?.plain_text || 'Unknown'
          clickMap.set(target, (clickMap.get(target) || 0) + 1)
        })
      topClicks = Array.from(clickMap.entries())
        .map(([target, count]) => ({ target, count }))
        .sort((a, b) => b.count - a.count)

      // 最近访问（增加空值保护）
      recentVisits = results
        .filter((r: any) => r.properties?.Type?.select?.name === 'visit')
        .slice(0, 10)
        .map((r: any) => ({
          path: r.properties?.Path?.rich_text?.[0]?.plain_text || '/',
          userId: r.properties?.UserId?.rich_text?.[0]?.plain_text || 'Guest',
          time: r.properties?.Timestamp?.date?.start || new Date().toISOString(),
          ip: r.properties?.IP?.rich_text?.[0]?.plain_text || ''
        }))
    }

    return NextResponse.json({
      topSearches,
      topClicks,
      recentVisits
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
