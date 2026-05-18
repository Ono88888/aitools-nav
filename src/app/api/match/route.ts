import { NextRequest, NextResponse } from 'next/server'
import { getCombos, SCENE_LABELS } from '@/lib/combos-data'
import { ALL_TOOLS } from '@/lib/tools-data'
import { sanitizeInput, rateLimit, getClientIP } from '@/lib/security'
import { getSession } from '@/lib/session'
import { findUserById, updateDailyCount, checkAndResetDaily } from '@/lib/user-store'

const DAILY_LIMIT = { guest: 3, user: 20 }

// ── 场景关键词库（本地第一层，零token）───────────────────────
const SCENE_MAP: Record<string, string[]> = {
  video:      ['短视频','视频','剪辑','口播','vlog','成片','出镜','抖音','快手','tiktok','youtube','b站','bilibili','视频号','拍视频','做视频','剪视频','配音','录制','发布视频','字幕','转场','特效','封面图','脚本','素材','剪片子','做up主','做博主'],
  wechat:     ['公众号','微信','图文','推文','推送','新媒体','写文章','写推文','排版','微信推送','涨粉','公号运营','服务号','订阅号'],
  ecommerce:  ['电商','跨境','亚马逊','ebay','wish','速卖通','shopify','独立站','选品','listing','产品描述','卖货','出海','外贸','竞品分析','评论分析','开店','做亚马逊'],
  dev:        ['开发','编程','写代码','代码','程序','软件','app','网站','网页','小程序','saas','工具','建站','上线','部署','前端','后端','全栈','接口','api','独立开发','程序员','bug','调试'],
  painting:   ['绘画','生图','ai图','画图','作图','图片生成','midjourney','stable diffusion','sd','配图','插画','设计图','海报','banner','封面','素材图','接单','卖图'],
  podcast:    ['播客','podcast','录音','音频节目','有声','电台','访谈节目','做播客'],
  writing:    ['写作','文章','内容创作','文案','写稿','博客','专栏','稿子','软文','种草','自媒体','降重','改写','润色','翻译','故事','小说','剧本'],
  ppt:        ['ppt','演示','汇报','幻灯片','路演','pitch','课件','述职','年终总结','提案','做ppt','制作ppt'],
  music:      ['音乐','歌曲','作曲','配乐','歌词','旋律','suno','udio','ai音乐','创作歌曲','写歌','背景音乐','bgm'],
  knowledge:  ['知识','笔记','整理','学习','文档','总结','研究','归纳','知识库','会议纪要','读文献','pdf阅读','信息管理','脑图','思维导图'],
  livestream: ['直播','带货','主播','话术','直播间','开播','卖货','直播卖货','直播运营','引流话术','抖音直播','快手直播'],
  agent:      ['自动化','工作流','agent','机器人','bot','智能体','自动','无人','批量处理','定时任务','自动发布','自动回复','rpa'],
  legal:      ['法律','合同','协议','法规','诉讼','律师','条款','法务','合规','文件审查','法律文件','法律咨询','起草合同','合同审查','法律翻译','隐私政策','用户协议','股权协议','NDA','知识产权','专利','商标'],
  hr:         ['招聘','简历','面试','JD','岗位描述','人力资源','HR','员工手册','绩效','薪资','offer','入职','离职'],
  finance:    ['财务','报表','预算','记账','账单','发票','税务','利润','现金流','财务分析','财务报告','Excel财务'],
  education:  ['教学','课程','教案','备课','出题','试卷','学生','教育','老师','培训','辅导','作业'],
  medical:    ['医疗','病历','医学','健康','药品','诊断','护理','患者','医院','报告解读'],
  marketing:  ['营销','推广','品牌','广告','投放','ROI','用户增长','增长','私域','裂变','活动策划','运营'],
  research:   ['调研','分析报告','市场分析','竞品','数据分析','报告撰写','行业研究','问卷','访谈'],
  translate:  ['翻译','英文','日文','韩文','多语言','本地化','字幕翻译','文档翻译','口译','双语'],
  design:     ['设计','UI','UX','产品设计','界面','原型','wireframe','figma','logo','品牌设计','视觉'],
  customer:   ['客服','售后','投诉','回复','咨询','服务','支持','FAQ','知识库问答'],
}

// ── 意图规则（加权，比词库优先级高）─────────────────────────
const INTENT_RULES: Array<{ re: RegExp; scenes: string[]; w: number }> = [
  { re: /想(做|当|成为).*(博主|up主|创作者|网红|达人)/,     scenes: ['video','wechat'], w: 5 },
  { re: /想(做|当).*(主播|带货)/,                           scenes: ['livestream','video'], w: 5 },
  { re: /想(做|开).*(店|电商|亚马逊)/,                      scenes: ['ecommerce'], w: 5 },
  { re: /独立(开发|创业)/,                                   scenes: ['dev'], w: 5 },
  { re: /副业|变现|赚钱|增加收入/,                           scenes: ['painting','writing','livestream'], w: 4 },
  { re: /推广|营销|引流|获客/,                               scenes: ['marketing','wechat'], w: 3 },
  { re: /自动(发布|更新|运营|管理)/,                         scenes: ['agent','wechat'], w: 4 },
  { re: /会议(记录|总结|纪要)/,                              scenes: ['knowledge'], w: 5 },
  { re: /读.*(文献|论文|报告)/,                              scenes: ['knowledge','research'], w: 4 },
  { re: /做.*(网站|app|小程序|系统)/,                        scenes: ['dev'], w: 5 },
  { re: /汇报|述职|年终|总结报告/,                           scenes: ['ppt','writing'], w: 4 },
  { re: /投资人|融资|路演/,                                  scenes: ['ppt'], w: 5 },
  { re: /合同|协议|法律|法务|法规/,                          scenes: ['legal'], w: 5 },
  { re: /招聘|简历|面试|hr|人事/i,                           scenes: ['hr'], w: 5 },
  { re: /财务|报表|账单|税务|记账/,                          scenes: ['finance'], w: 5 },
  { re: /教案|备课|出题|教学|课程/,                          scenes: ['education'], w: 5 },
  { re: /翻译|英文|日文|韩文|多语言/,                        scenes: ['translate','writing'], w: 4 },
  { re: /客服|售后|投诉|回复咨询/,                           scenes: ['customer','agent'], w: 4 },
  { re: /设计|ui|ux|界面|原型|figma/i,                       scenes: ['design'], w: 4 },
  { re: /市场.*(调研|分析)|竞品分析|行业报告/,               scenes: ['research','knowledge'], w: 4 },
]

function smartMatch(q: string): { scenes: string[]; confidence: number } {
  const lower = q.toLowerCase().replace(/\s+/g, '')
  const scores: Record<string, number> = {}
  for (const [scene, tags] of Object.entries(SCENE_MAP)) {
    for (const tag of tags) {
      if (lower.includes(tag.toLowerCase())) scores[scene] = (scores[scene] || 0) + 1
    }
  }
  for (const rule of INTENT_RULES) {
    if (rule.re.test(lower)) {
      for (const s of rule.scenes) scores[s] = (scores[s] || 0) + rule.w
    }
  }
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1])
  return { scenes: sorted.slice(0, 2).map(([s]) => s), confidence: Math.min((sorted[0]?.[1] ?? 0) / 4, 1.0) }
}

// ── DeepSeek：极省token，只做场景识别（不生成组合，约10-15 tokens）
async function classifyWithDeepSeek(q: string): Promise<string | null> {
  const key = process.env.DEEPSEEK_API_KEY
  if (!key) return null
  const scenes = Object.keys(SCENE_MAP).join(',')
  try {
    const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: 'deepseek-chat', max_tokens: 10, temperature: 0,
        messages: [
          { role: 'system', content: `从[${scenes}]选1个场景,只输出名称` },
          { role: 'user', content: q.slice(0, 50) },
        ],
      }),
    })
    if (!res.ok) return null
    const data = await res.json()
    const scene = data.choices?.[0]?.message?.content?.trim() ?? ''
    return scene in SCENE_MAP ? scene : null
  } catch { return null }
}

// ── DeepSeek：完整工具组合生成（仅在本地无法匹配时调用，约800-1200 tokens）
async function generateComboWithDeepSeek(q: string, network: string): Promise<any[] | null> {
  const key = process.env.DEEPSEEK_API_KEY
  if (!key) return null

  const netFilter = network === 'cn' ? ALL_TOOLS.filter(t => t.cnAccess)
                  : network === 'intl' ? ALL_TOOLS.filter(t => !t.cnAccess)
                  : ALL_TOOLS
  // 极简工具摘要（每个工具约20 token）
  const catalog = netFilter.map(t => `${t.slug}:${t.name}(${t.price},国内${t.cnAccess?'✓':'✗'})-${t.tagline}`).join('\n')

  try {
    const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: 'deepseek-chat', max_tokens: 1500, temperature: 0.3,
        messages: [
          { role: 'system', content: `你是AI工具顾问。工具库：\n${catalog}\n\n推荐规则：推荐2套方案(免费+付费)，每套3-4步骤。slug必须来自工具库。输出纯JSON(无markdown)：{"scene":"场景名","intent":"需求解读","combos":[{"id":"ai_1","name":"方案名","tagline":"一句话","tier":"free|mid","priceMin":0,"priceMax":0,"overallDifficulty":2,"netSummary":"cn|vpn|both","bestFor":"适合人群","pros":["优点"],"why":"推荐理由","steps":[{"phase":"步骤","conn":"or","tools":[{"slug":"slug","name":"名","logo":"emoji","price":"价格","url":"官网","net":"cn","difficulty":2,"tip":"贴士"}]}],"prompt":"核心Prompt"}]}` },
          { role: 'user', content: `需求：${q.slice(0, 80)}` },
        ],
      }),
    })
    if (!res.ok) return null
    const data = await res.json()
    const raw = data.choices?.[0]?.message?.content?.trim() ?? ''
    const match = raw.match(/\{[\s\S]*\}/)
    if (!match) return null
    const parsed = JSON.parse(match[0])
    return parsed.combos || null
  } catch { return null }
}

// ── 从Notion学习库加载已审核的词条（服务启动时缓存）──────────
let learnedKeywords: Array<{ keywords: string[]; scene: string }> = []
let lastLoadTime = 0
async function loadLearnedKeywords() {
  if (Date.now() - lastLoadTime < 600_000) return // 10分钟缓存
  const notionKey = process.env.NOTION_API_KEY
  const learnDb = process.env.NOTION_LEARN_DB_ID
  if (!notionKey || !learnDb) return
  try {
    const res = await fetch(`https://api.notion.com/v1/databases/${learnDb}/query`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${notionKey}`, 'Content-Type': 'application/json', 'Notion-Version': '2022-06-28' },
      body: JSON.stringify({ filter: { property: 'approved', checkbox: { equals: true } }, page_size: 200 }),
    })
    const data = await res.json()
    learnedKeywords = (data.results || []).map((page: any) => ({
      keywords: (page.properties?.keyword?.title?.[0]?.plain_text ?? '').split(',').filter(Boolean),
      scene: page.properties?.scene?.select?.name ?? '',
    })).filter((r: any) => r.keywords.length > 0 && r.scene)
    lastLoadTime = Date.now()
  } catch {}
}

function matchLearned(q: string): string | null {
  const lower = q.toLowerCase()
  for (const { keywords, scene } of learnedKeywords) {
    if (keywords.some(kw => lower.includes(kw.toLowerCase()))) return scene
  }
  return null
}

// ═════════════════════════════════════════════════════════════
// POST /api/match — 三层推荐：本地词库 → 学习库 → DeepSeek分类 → DeepSeek生成组合
// ═════════════════════════════════════════════════════════════
export async function POST(req: NextRequest) {
  const ip = getClientIP(req)
  const globalLimit = rateLimit({ identifier: ip, type: 'search', max: 30, windowSeconds: 60 })
  if (!globalLimit.allowed) return NextResponse.json({ error: '请求过于频繁' }, { status: 429 })

  const body = await req.json().catch(() => ({}))
  const rawQ = String(body.query ?? '')
  const { safe: query, blocked } = sanitizeInput(rawQ)
  if (blocked || !query) return NextResponse.json({ error: '输入无效' }, { status: 400 })
  if (query.length > 80) return NextResponse.json({ error: '请在80字以内描述需求' }, { status: 400 })

  const network = ['cn', 'intl', 'all'].includes(body.network) ? body.network as string : 'all'

  // 用户身份 & 次数
  const session = await getSession(req)
  if (session?.userId) {
    const user = await findUserById(session.userId).catch(() => null)
    if (user) {
      const { count, date } = await checkAndResetDaily(user)
      if (count >= DAILY_LIMIT.user) return NextResponse.json({ error: `每日限${DAILY_LIMIT.user}次已用完`, dailyLimit: true }, { status: 429 })
      updateDailyCount(user.id, count, date).catch(() => {})
    }
  } else {
    const guestLimit = rateLimit({ identifier: `guest:${ip}`, type: 'search', max: DAILY_LIMIT.guest, windowSeconds: 86400 })
    if (!guestLimit.allowed) return NextResponse.json({ error: '游客每日限3次，登录后可查20次', dailyLimit: true, needLogin: true }, { status: 429 })
  }

  // ── 第1层：本地词库（0 token）───────────────────────────────
  const { scenes: localScenes, confidence } = smartMatch(query)
  if (localScenes.length > 0 && confidence >= 0.4) {
    const combos = localScenes.flatMap(s => getCombos(s))
    return NextResponse.json({
      scenes: localScenes, sceneLabels: localScenes.map(s => SCENE_LABELS[s] ?? s),
      combos, source: 'local', confidence, isLoggedIn: !!session?.userId,
    })
  }

  // ── 第2层：学习库（已审核词条，0 token）────────────────────
  await loadLearnedKeywords()
  const learnedScene = matchLearned(query)
  if (learnedScene) {
    const combos = getCombos(learnedScene)
    // 异步触发hitCount++
    fetch(`${req.nextUrl.origin}/api/learn`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, scene: learnedScene }),
    }).catch(() => {})
    return NextResponse.json({
      scenes: [learnedScene], sceneLabels: [SCENE_LABELS[learnedScene] ?? learnedScene],
      combos, source: 'learned', confidence: 0.9, isLoggedIn: !!session?.userId,
    })
  }

  // ── 第3层：DeepSeek分类（~10 token，约¥0.000008/次）─────────
  const aiScene = await classifyWithDeepSeek(query)
  if (aiScene && aiScene in SCENE_LABELS) {
    const combos = getCombos(aiScene)
    // 触发学习，让这个词条进入学习队列
    fetch(`${req.nextUrl.origin}/api/learn`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, scene: aiScene, source: 'classify' }),
    }).catch(() => {})
    return NextResponse.json({
      scenes: [aiScene], sceneLabels: [SCENE_LABELS[aiScene] ?? aiScene],
      combos, source: 'ai_classify', confidence: 0.7, isLoggedIn: !!session?.userId,
    })
  }

  // ── 第4层：DeepSeek完整生成（~800-1200 token，约¥0.001/次）──
  // 仅当完全无法匹配时才用，成本约0.1分/次
  const aiCombos = await generateComboWithDeepSeek(query, network)
  if (aiCombos && aiCombos.length > 0) {
    // 异步学习
    fetch(`${req.nextUrl.origin}/api/learn`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, source: 'generated', aiGenerated: true }),
    }).catch(() => {})
    return NextResponse.json({
      scenes: ['custom'], sceneLabels: [query.slice(0, 10)],
      combos: aiCombos, source: 'ai_generated', confidence: 0.6, isLoggedIn: !!session?.userId,
    })
  }

  // 最终兜底
  return NextResponse.json({
    scenes: ['writing'], sceneLabels: ['通用写作'],
    combos: getCombos('writing'), source: 'fallback', confidence: 0, isLoggedIn: !!session?.userId,
  })
}
