const NOTION = 'https://api.notion.com/v1'
const NOTION_VERSION = '2022-06-28'

function cors(res) {
  const h = new Headers(res.headers)
  h.set('Access-Control-Allow-Origin', '*')
  return new Response(res.body, { status: res.status, headers: h })
}
function json(data, status = 200) {
  return cors(new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } }))
}

async function countDB(token, dbId, filter) {
  if (!token || !dbId) return 0
  try {
    const r = await fetch(`${NOTION}/databases/${dbId}/query`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', 'Notion-Version': NOTION_VERSION },
      body: JSON.stringify({ filter, page_size: 100 }),
    })
    const d = await r.json()
    if (d.object === 'error') return `ERR`
    return d.results?.length ?? 0
  } catch { return 0 }
}

export async function onRequest({ request, env }) {
  if (request.method === 'OPTIONS') return cors(new Response(null, { status: 204 }))

  const t = env.NOTION_API_KEY
  const envStatus = {
    hasNotionKey: !!t,
    hasUserDb: !!env.NOTION_USER_DB_ID,
    hasFavDb: !!env.NOTION_FAVORITES_DB_ID,
    hasLearnDb: !!env.NOTION_LEARN_DB_ID,
    hasHotkeysDb: !!env.NOTION_HOTKEYS_DB_ID,
  }

  const [users, favorites, pendingLearn, approvedKeywords] = await Promise.all([
    countDB(t, env.NOTION_USER_DB_ID),
    countDB(t, env.NOTION_FAVORITES_DB_ID),
    countDB(t, env.NOTION_LEARN_DB_ID, { property: 'approved', checkbox: { equals: false } }),
    countDB(t, env.NOTION_LEARN_DB_ID, { property: 'approved', checkbox: { equals: true } }),
  ])

  return json({ todaySearches: '接入中', totalUsers: users, totalFavorites: favorites, pendingLearn, approvedKeywords, totalTools: 88, totalCombos: 36, envStatus })
}
