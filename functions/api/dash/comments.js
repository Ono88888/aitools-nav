const N = 'https://api.notion.com/v1', VER = '2022-06-28'
function h(env) { return { Authorization:`Bearer ${env.NOTION_API_KEY}`, 'Content-Type':'application/json', 'Notion-Version':VER } }
function cors(res) { const hh=new Headers(res.headers); hh.set('Access-Control-Allow-Origin','*'); return new Response(res.body,{status:res.status,headers:hh}) }
function json(data,status=200){ return cors(new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json'}})) }

export async function onRequest({request,env}) {
  if(request.method==='OPTIONS') return cors(new Response(null,{status:204}))
  const DB = env.NOTION_FAVORITES_DB_ID
  if(!env.NOTION_API_KEY) return json({error:'缺少NOTION_API_KEY',items:[]},500)

  if(request.method==='GET'){
    const url=new URL(request.url)
    const f=url.searchParams.get('filter')
    const filter=f==='starred'?{property:'starred',checkbox:{equals:true}}:{property:'suggestion',rich_text:{is_not_empty:true}}
    const d=await fetch(`${N}/databases/${DB}/query`,{method:'POST',headers:h(env),body:JSON.stringify({filter,sorts:[{property:'createdAt',direction:'descending'}],page_size:50})}).then(r=>r.json())
    return json({items:(d.results||[]).map(p=>({id:p.id,comboName:p.properties?.comboName?.title?.[0]?.plain_text??'',scene:p.properties?.scene?.select?.name??'',rating:p.properties?.rating?.number??0,suggestion:p.properties?.suggestion?.rich_text?.[0]?.plain_text??'',userId:p.properties?.userId?.rich_text?.[0]?.plain_text??'',createdAt:p.properties?.createdAt?.date?.start??''}))})
  }
  if(request.method==='PATCH'){
    const b=await request.json()
    const props={}
    if(b.action==='star') props.starred={checkbox:true}
    if(b.action==='dismiss') props.dismissed={checkbox:true}
    await fetch(`${N}/pages/${b.id}`,{method:'PATCH',headers:h(env),body:JSON.stringify({properties:props})})
    return json({updated:true})
  }
  return json({error:'Method not allowed'},405)
}
