const N = 'https://api.notion.com/v1', VER = '2022-06-28'
function h(env) { return { Authorization:`Bearer ${env.NOTION_API_KEY}`, 'Content-Type':'application/json', 'Notion-Version':VER } }
function cors(res) { const hh=new Headers(res.headers); hh.set('Access-Control-Allow-Origin','*'); return new Response(res.body,{status:res.status,headers:hh}) }
function json(data,status=200){ return cors(new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json'}})) }

export async function onRequest({request,env}) {
  if(request.method==='OPTIONS') return cors(new Response(null,{status:204}))
  const DB = env.NOTION_LEARN_DB_ID
  if(!env.NOTION_API_KEY) return json({error:'缺少NOTION_API_KEY',items:[]},500)
  if(!DB) return json({error:'缺少NOTION_LEARN_DB_ID',items:[]},500)

  if(request.method==='GET'){
    const d=await fetch(`${N}/databases/${DB}/query`,{method:'POST',headers:h(env),body:JSON.stringify({filter:{property:'approved',checkbox:{equals:false}},sorts:[{property:'hitCount',direction:'descending'}],page_size:100})}).then(r=>r.json())
    return json({items:(d.results||[]).map(p=>({id:p.id,keywords:p.properties?.keyword?.title?.[0]?.plain_text??'',scene:p.properties?.scene?.select?.name??'',originalQuery:p.properties?.originalQuery?.rich_text?.[0]?.plain_text??'',source:p.properties?.source?.select?.name??'',hitCount:p.properties?.hitCount?.number??1}))})
  }
  if(request.method==='PATCH'){
    const b=await request.json()
    await fetch(`${N}/pages/${b.id}`,{method:'PATCH',headers:h(env),body:JSON.stringify({properties:{approved:{checkbox:!!b.approved}}})})
    return json({updated:true})
  }
  if(request.method==='DELETE'){
    const id=new URL(request.url).searchParams.get('id')
    await fetch(`${N}/pages/${id}`,{method:'PATCH',headers:h(env),body:JSON.stringify({archived:true})})
    return json({deleted:true})
  }
  return json({error:'Method not allowed'},405)
}
