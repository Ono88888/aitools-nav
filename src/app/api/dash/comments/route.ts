import { NextRequest, NextResponse } from 'next/server'
const N='https://api.notion.com/v1', T=process.env.NOTION_API_KEY!, DB=process.env.NOTION_FAVORITES_DB_ID!
const h = { Authorization:`Bearer ${T}`, 'Content-Type':'application/json', 'Notion-Version':'2022-06-28' }
const nR = (path: string, method='GET', body?: object) => fetch(`${N}${path}`, { method, headers:h, body:body?JSON.stringify(body):undefined }).then(r=>r.json())

export async function GET(req: NextRequest) {
  if(!DB) return NextResponse.json({items:[]})
  const f=req.nextUrl.searchParams.get('filter')
  const filter:any = f==='pending' ? {and:[{property:'suggestion',rich_text:{is_not_empty:true}}]} : f==='starred' ? {property:'starred',checkbox:{equals:true}} : {property:'suggestion',rich_text:{is_not_empty:true}}
  const d=await nR(`/databases/${DB}/query`,'POST',{filter,sorts:[{property:'createdAt',direction:'descending'}],page_size:50})
  return NextResponse.json({items:(d.results||[]).map((p:any)=>({id:p.id,comboName:p.properties?.comboName?.title?.[0]?.plain_text??'',scene:p.properties?.scene?.select?.name??'',rating:p.properties?.rating?.number??0,suggestion:p.properties?.suggestion?.rich_text?.[0]?.plain_text??'',userId:p.properties?.userId?.rich_text?.[0]?.plain_text??'',createdAt:p.properties?.createdAt?.date?.start??''}))})
}
export async function PATCH(req: NextRequest) { const b=await req.json(); const props:any={}; if(b.action==='star') props.starred={checkbox:true}; if(b.action==='dismiss') props.dismissed={checkbox:true}; await nR(`/pages/${b.id}`,'PATCH',{properties:props}); return NextResponse.json({updated:true}) }
