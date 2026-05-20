const N = 'https://api.notion.com/v1', VER = '2022-06-28'
function h(env) { return { Authorization:`Bearer ${env.NOTION_API_KEY}`, 'Content-Type':'application/json', 'Notion-Version':VER } }
function cors(res) { const hh=new Headers(res.headers); hh.set('Access-Control-Allow-Origin','*'); return new Response(res.body,{status:res.status,headers:hh}) }
function json(data,status=200){ return cors(new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json'}})) }

function pageToUser(p) {
  const pr = p.properties
  return {
    id: p.id,
    email: pr?.email?.title?.[0]?.plain_text ?? pr?.email?.email ?? '',
    phone: pr?.phone?.rich_text?.[0]?.plain_text ?? pr?.phone?.phone_number ?? '',
    createdAt: pr?.createdAt?.rich_text?.[0]?.plain_text ?? p.created_time ?? '',
    lastActive: pr?.lastQueryDate?.rich_text?.[0]?.plain_text ?? '',
    dailyCount: pr?.dailyCount?.number ?? 0,
    status: pr?.status?.select?.name ?? 'active',
    topTags: (pr?.topTags?.multi_select ?? []).map(t => t.name).slice(0,3),
  }
}

export async function onRequest({request, env}) {
  if(request.method==='OPTIONS') return cors(new Response(null,{status:204}))
  const DB = env.NOTION_USER_DB_ID
  if(!env.NOTION_API_KEY) return json({error:'缺少NOTION_API_KEY',users:[]},500)
  if(!DB) return json({error:'缺少NOTION_USER_DB_ID',users:[]},500)

  if(request.method==='GET'){
    const url=new URL(request.url)
    const filter_str=url.searchParams.get('filter')||'all'
    const body = {
      sorts:[{property:'createdAt',direction:'descending'}],
      page_size: 100,
    }
    if(filter_str !== 'all') {
      body.filter = { property:'status', select:{ equals: filter_str } }
    }
    const d=await fetch(`${N}/databases/${DB}/query`,{method:'POST',headers:h(env),body:JSON.stringify(body)}).then(r=>r.json())
    if(d.object==='error') return json({error:`Notion: ${d.message}`,users:[]},500)
    return json({users:(d.results||[]).map(pageToUser)})
  }

  if(request.method==='PATCH'){
    const b=await request.json()
    if(!b.id) return json({error:'缺少id'},400)
    await fetch(`${N}/pages/${b.id}`,{method:'PATCH',headers:h(env),body:JSON.stringify({properties:{status:{select:{name:b.status}}}})})
    return json({updated:true})
  }

  return json({error:'Method not allowed'},405)
}
