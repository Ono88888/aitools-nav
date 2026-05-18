import { NextRequest, NextResponse } from 'next/server'
const N='https://api.notion.com/v1', T=process.env.NOTION_API_KEY!, DB=process.env.NOTION_LEARN_DB_ID!
const h = { Authorization:`Bearer ${T}`, 'Content-Type':'application/json', 'Notion-Version':'2022-06-28' }

export async function GET(_req: NextRequest) {
  if(!DB) return NextResponse.json({topSearches:[]})
  try {
    const d=await fetch(`${N}/databases/${DB}/query`,{method:'POST',headers:h,body:JSON.stringify({sorts:[{property:'hitCount',direction:'descending'}],page_size:50})}).then(r=>r.json())
    const topSearches=(d.results||[]).map((p:any)=>({query:p.properties?.originalQuery?.rich_text?.[0]?.plain_text??'',scene:p.properties?.scene?.select?.name??'',count:p.properties?.hitCount?.number??1,lastAt:p.properties?.createdAt?.rich_text?.[0]?.plain_text??''})).filter((i:any)=>i.query)
    return NextResponse.json({topSearches})
  } catch { return NextResponse.json({topSearches:[]}) }
}
