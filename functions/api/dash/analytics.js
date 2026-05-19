const N = 'https://api.notion.com/v1', VER = '2022-06-28'
function h(env) { return { Authorization:`Bearer ${env.NOTION_API_KEY}`, 'Content-Type':'application/json', 'Notion-Version':VER } }
function cors(res) { const hh=new Headers(res.headers); hh.set('Access-Control-Allow-Origin','*'); return new Response(res.body,{status:res.status,headers:hh}) }
function json(data,status=200){ return cors(new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json'}})) }

export async function onRequest({request,env}) {
  if(request.method==='OPTIONS') return cors(new Response(null,{status:204}))
  const DB = env.NOTION_LEARN_DB_ID
  if(!DB) return json({topSearches:[]})
  const d=await fetch(`${N}/databases/${DB}/query`,{method:'POST',headers:h(env),body:JSON.stringify({sorts:[{property:'hitCount',direction:'descending'}],page_size:50})}).then(r=>r.json())
  const topSearches=(d.results||[]).map(p=>({query:p.properties?.originalQuery?.rich_text?.[0]?.plain_text??'',scene:p.properties?.scene?.select?.name??'',count:p.properties?.hitCount?.number??1,lastAt:''})).filter(i=>i.query)
  return json({topSearches})
}
