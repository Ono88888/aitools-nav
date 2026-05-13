import { NextRequest, NextResponse } from 'next/server'
import { getCombos, SCENE_LABELS } from '@/lib/combos-data'
import { sanitizeInput, rateLimit, getClientIP } from '@/lib/security'
import { getSession } from '@/lib/session'
import { findUserById, updateDailyCount, checkAndResetDaily } from '@/lib/user-store'

// ── 每日免费次数配置 ──────────────────────────────────────────
const DAILY_LIMIT = {
  guest: 1,          // 未登录游客：每天1次（按IP）
  user:  3,          // 已登录用户：每天3次
}

// ── 完整本地关键词库（同前，此处省略重复贴出，从上一个route.ts复制）──
const SCENE_MAP: Record<string, string[]> = {
  video:      ['短视频','视频','剪辑','口播','vlog','成片','出镜','抖音','快手','tiktok','youtube','b站','bilibili','视频号','拍视频','做视频','剪视频','配音','录制','发布视频','字幕','转场','特效','封面图','脚本','素材','拍片子','剪片子','做up主','做博主'],
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
}

const INTENT_RULES: Array<{ re: RegExp; scenes: string[]; w: number }> = [
  { re: /想(做|当|成为).*(博主|up主|创作者|网红|达人)/, scenes: ['video','wechat'], w: 5 },
  { re: /想(做|当).*(主播|带货)/,                         scenes: ['livestream','video'], w: 5 },
  { re: /想(做|开).*(店|电商|亚马逊)/,                    scenes: ['ecommerce'], w: 5 },
  { re: /独立(开发|创业)/,                                 scenes: ['dev'], w: 5 },
  { re: /副业|变现|赚钱|增加收入/,                         scenes: ['painting','writing','livestream'], w: 4 },
  { re: /推广|营销|引流|获客/,                             scenes: ['writing','wechat','ecommerce'], w: 3 },
  { re: /自动(发布|更新|运营|管理)/,                       scenes: ['agent','wechat'], w: 4 },
  { re: /批量(生成|处理|发布)/,                            scenes: ['agent','writing'], w: 4 },
  { re: /会议(记录|总结|纪要)/,                            scenes: ['knowledge'], w: 5 },
  { re: /读.*(文献|论文|报告)/,                            scenes: ['knowledge'], w: 4 },
  { re: /做.*(网站|app|小程序|系统)/,                      scenes: ['dev'], w: 5 },
  { re: /汇报|述职|年终|总结报告/,                         scenes: ['ppt','writing'], w: 4 },
  { re: /投资人|融资|路演/,                                scenes: ['ppt'], w: 5 },
  { re: /出海|海外|国际(市场|用户)/,                       scenes: ['ecommerce','video'], w: 4 },
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
  return {
    scenes: sorted.slice(0, 2).map(([s]) => s),
    confidence: Math.min((sorted[0]?.[1] ?? 0) / 5, 1.0),
  }
}

async function deepseekFallback(q: string): Promise<string[]> {
  const key = process.env.DEEPSEEK_API_KEY
  if (!key) return []
  const sceneKeys = Object.keys(SCENE_MAP).join(',')
  try {
    const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: 'deepseek-chat', max_tokens: 15, temperature: 0, stream: false,
        messages: [
          { role: 'system', content: `从[${sceneKeys}]选1-2个最匹配场景,逗号分隔,只输出名称` },
          { role: 'user',   content: q.slice(0, 60) },
        ],
      }),
    })
    if (!res.ok) return []
    const data = await res.json()
    const raw = data.choices?.[0]?.message?.content?.trim() ?? ''
    return raw.split(/[,，\s]+/).map((s: string) => s.trim()).filter((s: string) => s in SCENE_MAP).slice(0, 2)
  } catch { return [] }
}

// ══════════════════════════════════════════════════════════════
// POST /api/match
// ══════════════════════════════════════════════════════════════
export async function POST(req: NextRequest) {
  const ip = getClientIP(req)

  // ── 1. 全局限流：每IP每分钟最多10次（防机器人）────────────────
  const globalLimit = rateLimit({ identifier: ip, type: 'search', max: 10, windowSeconds: 60 })
  if (!globalLimit.allowed) {
    return NextResponse.json(
      { error: '请求过于频繁，请稍后再试', retryAfter: globalLimit.resetAt },
      { status: 429 }
    )
  }

  // ── 2. 解析请求体 ─────────────────────────────────────────────
  const body = await req.json().catch(() => ({}))
  const rawQuery = String(body.query ?? '')

  // ── 3. 输入消毒 ───────────────────────────────────────────────
  const { safe: query, blocked } = sanitizeInput(rawQuery)
  if (blocked) {
    return NextResponse.json({ error: '输入包含非法内容' }, { status: 400 })
  }
  if (!query) {
    return NextResponse.json({ error: '请输入搜索内容' }, { status: 400 })
  }
  // 50字限制（前端也限制，这里双重保障）
  if (query.length > 50) {
    return NextResponse.json({ error: '请在50字以内描述需求' }, { status: 400 })
  }

  // ── 4. 用户身份 & 每日次数检查 ────────────────────────────────
  const session = await getSession(req)
  let dailyRemaining = DAILY_LIMIT.guest

  if (session?.userId) {
    // 已登录用户：按userId限制每日次数
    const user = await findUserById(session.userId).catch(() => null)
    if (user) {
      const { count, date } = await checkAndResetDaily(user)
      if (count >= DAILY_LIMIT.user) {
        return NextResponse.json(
          { error: `每日免费查询次数（${DAILY_LIMIT.user}次）已用完，明天再来`, dailyLimit: true },
          { status: 429 }
        )
      }
      // 异步更新次数（不阻塞响应）
      updateDailyCount(user.id, count, date).catch(console.error)
      dailyRemaining = DAILY_LIMIT.user - count - 1
    }
  } else {
    // 游客：按IP限制，每天1次
    const guestLimit = rateLimit({
      identifier: `guest:${ip}`,
      type: 'search',
      max: DAILY_LIMIT.guest,
      windowSeconds: 86400,  // 24小时窗口
    })
    if (!guestLimit.allowed) {
      return NextResponse.json(
        { error: '游客每日限查1次，注册后每天可查3次', dailyLimit: true, needLogin: true },
        { status: 429 }
      )
    }
    dailyRemaining = 0
  }

  // ── 5. 核心匹配逻辑 ───────────────────────────────────────────
  const { scenes: localScenes, confidence } = smartMatch(query)
  let scenes = localScenes
  let source = 'local'

  // 本地低置信度 → DeepSeek兜底
  if (scenes.length === 0 || confidence < 0.4) {
    const aiScenes = await deepseekFallback(query)
    if (aiScenes.length > 0) {
      scenes = aiScenes
      source = 'deepseek'
    }
  }

  // 兜底
  if (scenes.length === 0) {
    scenes = ['video']
    source = 'fallback'
  }

  // ── 6. 触发自学习（异步，不阻塞）────────────────────────────
  if (source === 'fallback' || (source === 'deepseek' && confidence < 0.2)) {
    fetch(`${req.nextUrl.origin}/api/learn`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    }).catch(() => {}) // 静默失败
  }

  // ── 7. 拼装结果 ───────────────────────────────────────────────
  const combos = scenes.flatMap(s => getCombos(s))
  const sceneLabels = scenes.map(s => SCENE_LABELS[s] ?? s)

  return NextResponse.json({
    scenes, sceneLabels, combos, source, confidence,
    dailyRemaining,                    // 剩余次数告知前端
    isLoggedIn: !!session?.userId,
  })
}
