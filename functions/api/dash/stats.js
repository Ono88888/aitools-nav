const NOTION = 'https://api.notion.com/v1', VER = '2022-06-28'
function h(env) { return { Authorization:`Bearer ${env.NOTION_API_KEY}`, 'Content-Type':'application/json', 'Notion-Version':VER } }
function cors(res) { const hh=new Headers(res.headers); hh.set('Access-Control-Allow-Origin','*'); return new Response(res.body,{status:res.status,headers:hh}) }
function json(data,status=200){ return cors(new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json'}})) }

async function testNotionDB(token, dbId, name) {
  if (!token) return { name, ok: false, reason: '未配置NOTION_API_KEY' }
  if (!dbId) return { name, ok: false, reason: '未配置环境变量' }
  try {
    const r = await fetch(`${NOTION}/databases/${dbId}/query`, {
      method: 'POST',
      headers: { Authorization:`Bearer ${token}`, 'Content-Type':'application/json', 'Notion-Version':VER },
      body: JSON.stringify({ page_size: 1 })
    })
    const d = await r.json()
    if (d.object === 'error') return { name, ok: false, reason: d.message, count: null }
    return { name, ok: true, reason: 'OK', count: d.results?.length ?? 0 }
  } catch(e) { return { name, ok: false, reason: e.message } }
}

async function testDeepSeek(apiKey) {
  if (!apiKey) return { name: 'DeepSeek API', ok: false, reason: '未配置DEEPSEEK_API_KEY' }
  try {
    const r = await fetch('https://api.deepseek.com/v1/models', {
      headers: { Authorization: `Bearer ${apiKey}` }
    })
    if (r.ok) return { name: 'DeepSeek API', ok: true, reason: '连接正常' }
    return { name: 'DeepSeek API', ok: false, reason: `HTTP ${r.status}` }
  } catch(e) { return { name: 'DeepSeek API', ok: false, reason: e.message } }
}

async function countDB(token, dbId) {
  if (!token || !dbId) return 0
  try {
    const r = await fetch(`${NOTION}/databases/${dbId}/query`, {
      method: 'POST',
      headers: { Authorization:`Bearer ${token}`, 'Content-Type':'application/json', 'Notion-Version':VER },
      body: JSON.stringify({ page_size: 100 })
    })
    const d = await r.json()
    return d.results?.length ?? 0
  } catch { return 0 }
}

export async function onRequest({ request, env }) {
  if (request.method === 'OPTIONS') return cors(new Response(null, { status: 204 }))
  const t = env.NOTION_API_KEY

  // 并行检查所有API状态
  const [
    notionUsers, notionFavs, notionLearnPending, notionLearnApproved,
    dbUserStatus, dbFavStatus, dbLearnStatus, dbHotkeysStatus, dbSubmitStatus,
    deepseekStatus,
  ] = await Promise.all([
    countDB(t, env.NOTION_USER_DB_ID),
    countDB(t, env.NOTION_FAVORITES_DB_ID),
    (() => { if(!t||!env.NOTION_LEARN_DB_ID) return 0; return fetch(`${NOTION}/databases/${env.NOTION_LEARN_DB_ID}/query`,{method:'POST',headers:h(env),body:JSON.stringify({filter:{property:'approved',checkbox:{equals:false}},page_size:100})}).then(r=>r.json()).then(d=>d.results?.length??0).catch(()=>0) })(),
    (() => { if(!t||!env.NOTION_LEARN_DB_ID) return 0; return fetch(`${NOTION}/databases/${env.NOTION_LEARN_DB_ID}/query`,{method:'POST',headers:h(env),body:JSON.stringify({filter:{property:'approved',checkbox:{equals:true}},page_size:100})}).then(r=>r.json()).then(d=>d.results?.length??0).catch(()=>0) })(),
    testNotionDB(t, env.NOTION_USER_DB_ID, '用户表 (wk_users)'),
    testNotionDB(t, env.NOTION_FAVORITES_DB_ID, '收藏表 (wk_favorites)'),
    testNotionDB(t, env.NOTION_LEARN_DB_ID, '学习词库 (wk_learn)'),
    testNotionDB(t, env.NOTION_HOTKEYS_DB_ID, '热搜标签 (wk_hotkeys)'),
    testNotionDB(t, env.NOTION_SUBMISSIONS_DB_ID, '收录申请 (wk_submissions)'),
    testDeepSeek(env.DEEPSEEK_API_KEY),
  ])

  const apiStatus = [
    { name: 'Notion API Key', ok: !!t, reason: t ? '已配置' : '未配置NOTION_API_KEY', type: 'notion' },
    { ...dbUserStatus, type: 'notion' },
    { ...dbFavStatus, type: 'notion' },
    { ...dbLearnStatus, type: 'notion' },
    { ...dbHotkeysStatus, type: 'notion' },
    { ...dbSubmitStatus, type: 'notion' },
    { ...deepseekStatus, type: 'deepseek' },
    { name: 'Google AdSense', ok: !!env.NEXT_PUBLIC_ADSENSE_ID, reason: env.NEXT_PUBLIC_ADSENSE_ID ? `已配置: ${env.NEXT_PUBLIC_ADSENSE_ID}` : '未配置（选填）', type: 'ads', optional: true },
  ]

  return json({
    totalUsers: notionUsers,
    totalFavorites: notionFavs,
    pendingLearn: notionLearnPending,
    approvedKeywords: notionLearnApproved,
    totalTools: 88,
    totalCombos: 36,
    todaySearches: '—',
    apiStatus,
    envStatus: {
      hasNotionKey: !!t,
      hasUserDb: !!env.NOTION_USER_DB_ID,
      hasFavDb: !!env.NOTION_FAVORITES_DB_ID,
      hasLearnDb: !!env.NOTION_LEARN_DB_ID,
      hasHotkeysDb: !!env.NOTION_HOTKEYS_DB_ID,
      hasSubmissionsDb: !!env.NOTION_SUBMISSIONS_DB_ID,
      hasDeepSeek: !!env.DEEPSEEK_API_KEY,
      hasAdsense: !!env.NEXT_PUBLIC_ADSENSE_ID,
    }
  })
}
