const N = 'https://api.notion.com/v1', VER = '2022-06-28'
function h(env) { return { Authorization:`Bearer ${env.NOTION_API_KEY}`, 'Content-Type':'application/json', 'Notion-Version':VER } }
function cors(res) { const hh=new Headers(res.headers); hh.set('Access-Control-Allow-Origin','*'); hh.set('Access-Control-Allow-Methods','GET,POST,PATCH,DELETE,OPTIONS'); hh.set('Access-Control-Allow-Headers','Content-Type,Authorization'); return new Response(res.body,{status:res.status,headers:hh}) }
function json(data,status=200){ return cors(new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json'}})) }

export async function onRequest({request,env}) {
  if(request.method==='OPTIONS') return cors(new Response(null,{status:204}))
  const DB = env.NOTION_FAVORITES_DB_ID
  if(!env.NOTION_API_KEY||!DB) return json({error:'环境变量未配置'},500)

  if(request.method==='GET'){
    // 从cookie读userId（简化版，实际需JWT）
    const cookie = request.headers.get('cookie')||''
    const userId = cookie.match(/wk_uid=([^;]+)/)?.[1]
    if(!userId) return json({error:'未登录',favorites:[]},401)
    const d=await fetch(`${N}/databases/${DB}/query`,{method:'POST',headers:h(env),body:JSON.stringify({filter:{property:'userId',rich_text:{equals:userId}},sorts:[{property:'createdAt',direction:'descending'}],page_size:50})}).then(r=>r.json())
    const favorites=(d.results||[]).map(p=>({id:p.id,comboId:p.properties?.comboId?.rich_text?.[0]?.plain_text??'',comboName:p.properties?.comboName?.title?.[0]?.plain_text??'',scene:p.properties?.scene?.select?.name??'',rating:p.properties?.rating?.number??0,suggestion:p.properties?.suggestion?.rich_text?.[0]?.plain_text??'',comboData:(()=>{try{return JSON.parse(p.properties?.comboData?.rich_text?.[0]?.plain_text??'{}')}catch{return {}}})(),createdAt:p.properties?.createdAt?.date?.start??''}))
    return json({favorites})
  }

  if(request.method==='POST'){
    const cookie = request.headers.get('cookie')||''
    const userId = cookie.match(/wk_uid=([^;]+)/)?.[1]
    if(!userId) return json({error:'未登录'},401)
    const b=await request.json()
    const existing=await fetch(`${N}/databases/${DB}/query`,{method:'POST',headers:h(env),body:JSON.stringify({filter:{and:[{property:'userId',rich_text:{equals:userId}},{property:'comboId',rich_text:{equals:String(b.comboId)}}]},page_size:1})}).then(r=>r.json())
    if(existing.results?.length>0) return json({error:'已收藏',alreadySaved:true},409)
    await fetch(`${N}/pages`,{method:'POST',headers:h(env),body:JSON.stringify({parent:{database_id:DB},properties:{comboName:{title:[{text:{content:String(b.comboName||'').slice(0,100)}}]},comboId:{rich_text:[{text:{content:String(b.comboId)}}]},userId:{rich_text:[{text:{content:userId}}]},scene:{select:{name:String(b.scene||'custom').slice(0,30)}},rating:{number:0},suggestion:{rich_text:[{text:{content:''}}]},comboData:{rich_text:[{text:{content:JSON.stringify(b.comboData||{}).slice(0,2000)}}]},createdAt:{date:{start:new Date().toISOString()}}}})})
    return json({saved:true})
  }

  if(request.method==='PATCH'){
    const b=await request.json()
    const props={}
    if(typeof b.rating==='number') props.rating={number:b.rating}
    if(typeof b.suggestion==='string') props.suggestion={rich_text:[{text:{content:b.suggestion.slice(0,500)}}]}
    await fetch(`${N}/pages/${b.favoriteId}`,{method:'PATCH',headers:h(env),body:JSON.stringify({properties:props})})
    return json({updated:true})
  }

  if(request.method==='DELETE'){
    const id=new URL(request.url).searchParams.get('id')
    await fetch(`${N}/pages/${id}`,{method:'PATCH',headers:h(env),body:JSON.stringify({archived:true})})
    return json({deleted:true})
  }

  return json({error:'Method not allowed'},405)
}
