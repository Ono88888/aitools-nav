// Cloudflare Pages Function: /api/dash/submissions
const NOTION = 'https://api.notion.com/v1', VER = '2022-06-28'
function h(env) { return { Authorization:`Bearer ${env.NOTION_API_KEY}`, 'Content-Type':'application/json', 'Notion-Version':VER } }
function cors(res) { const hh=new Headers(res.headers); hh.set('Access-Control-Allow-Origin','*'); return new Response(res.body,{status:res.status,headers:hh}) }
function json(data,status=200){ return cors(new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json'}})) }

function pageToItem(p) {
  return {
    id: p.id,
    toolName: p.properties?.toolName?.title?.[0]?.plain_text ?? '',
    url: p.properties?.url?.url ?? '',
    reason: p.properties?.reason?.rich_text?.[0]?.plain_text ?? '',
    submitterEmail: p.properties?.submitterEmail?.email ?? '',
    status: p.properties?.status?.select?.name ?? '待审核',
    submittedAt: p.properties?.submittedAt?.date?.start ?? '',
  }
}

export async function onRequest({request, env}) {
  if(request.method==='OPTIONS') return cors(new Response(null,{status:204}))
  const DB = env.NOTION_SUBMISSIONS_DB_ID
  if(!env.NOTION_API_KEY) return json({error:'缺少NOTION_API_KEY',items:[]},500)
  if(!DB) return json({error:'缺少NOTION_SUBMISSIONS_DB_ID，请先在Cloudflare创建该数据库并配置此环境变量',items:[]},500)

  if(request.method==='GET'){
    const url=new URL(request.url)
    const filter_str=url.searchParams.get('filter')||'待审核'
    const filter = filter_str==='全部' ? undefined : { property:'status', select:{ equals: filter_str } }
    const body_obj = { sorts:[{property:'submittedAt',direction:'descending'}], page_size:100 }
    if(filter) body_obj.filter = filter
    const d=await fetch(`${NOTION}/databases/${DB}/query`,{method:'POST',headers:h(env),body:JSON.stringify(body_obj)}).then(r=>r.json())
    if(d.object==='error') return json({error:`Notion: ${d.message}`,items:[]},500)
    return json({items:(d.results||[]).map(pageToItem)})
  }

  if(request.method==='PATCH'){
    const b=await request.json()
    if(!b.id) return json({error:'缺少id'},400)
    await fetch(`${NOTION}/pages/${b.id}`,{method:'PATCH',headers:h(env),body:JSON.stringify({properties:{status:{select:{name:b.status}}}})})
    return json({updated:true})
  }

  return json({error:'Method not allowed'},405)
}
