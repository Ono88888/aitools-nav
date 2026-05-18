import { NextRequest, NextResponse } from 'next/server'
const N='https://api.notion.com/v1', T=process.env.NOTION_API_KEY!, DB=process.env.NOTION_LEARN_DB_ID!
const h = { Authorization:`Bearer ${T}`, 'Content-Type':'application/json', 'Notion-Version':'2022-06-28' }
const nR = (path: string, method='GET', body?: object) => fetch(`${N}${path}`, { method, headers:h, body:body?JSON.stringify(body):undefined }).then(r=>r.json())

export async function GET() { if(!DB) return NextResponse.json({items:[]}); const d=await nR(`/databases/${DB}/query`,'POST',{filter:{property:'approved',checkbox:{equals:false}},sorts:[{property:'hitCount',direction:'descending'}],page_size:100}); return NextResponse.json({items:(d.results||[]).map((p:any)=>({id:p.id,keywords:p.properties?.keyword?.title?.[0]?.plain_text??'',scene:p.properties?.scene?.select?.name??'',originalQuery:p.properties?.originalQuery?.rich_text?.[0]?.plain_text??'',source:p.properties?.source?.select?.name??'',hitCount:p.properties?.hitCount?.number??1}))}) }
export async function PATCH(req: NextRequest) { const b=await req.json(); if(!b.id) return NextResponse.json({error:'缺少id'},{status:400}); await nR(`/pages/${b.id}`,'PATCH',{properties:{approved:{checkbox:!!b.approved}}}); return NextResponse.json({updated:true}) }
export async function DELETE(req: NextRequest) { const id=new URL(req.url).searchParams.get('id'); if(!id) return NextResponse.json({error:'缺少id'},{status:400}); await nR(`/pages/${id}`,'PATCH',{archived:true}); return NextResponse.json({deleted:true}) }
