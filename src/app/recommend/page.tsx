'use client'

import React, { useEffect, useState, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import WukongLogo from '@/components/WukongLogo'
import ToolIcon from '@/components/ToolIcon'
import { getCombos, matchScene, SCENE_LABELS } from '@/lib/combos-data'
import { trackClick } from '@/components/AnalyticsProvider'

// 工具名 → slug 映射（用于 ToolIcon）
const NAME_TO_SLUG: Record<string, string> = {
  '豆包':'doubao','DeepSeek':'deepseek','Claude 3.5':'claude','Claude API':'claude',
  'ElevenLabs':'elevenlabs','剪映专业版':'capcut','Midjourney':'midjourney',
  'Cursor':'cursor','GitHub Copilot':'github-copilot','Codeium':'codeium',
  'v0':'v0','Bolt.new':'bolt','通义灵码':'tongyi-lingma','Devin':'devin',
  'Gamma':'gamma','AiPPT':'aippt','Suno v4':'suno','Udio':'udio','Udio Pro':'udio',
  'HeyGen':'heygen','Runway Gen-3':'runway','可灵AI':'kling','即梦AI':'jimeng',
  'Kimi':'kimi','Perplexity':'perplexity','秘塔AI搜索':'metaso','Phind':'phind',
  'GPT-4o':'chatgpt','ChatGPT':'chatgpt','Descript':'descript','Grok':'grok',
  '讯飞听见':'iflytek','Notion AI':'notion-ai','写作猫':'xiezuocat',
  'Jasper':'jasper','Stable Diffusion':'stable-diffusion','Dify':'dify',
  '扣子（Coze）':'coze','FastGPT':'fastgpt','Zapier':'zapier','Manus':'manus',
  '飞瓜数据':'feigua','Helium 10':'helium10','火山引擎TTS':'volcengine-tts',
  'Vidu':'vidu','Pika':'pika','Sora':'sora','Tome':'tome','Monica':'monica',
  'Julius AI':'julius','WPS AI':'wps-ai','Adobe Firefly':'adobe-firefly',
  'Canva':'canva','稿定设计':'gaoding','Gemini':'gemini','Grammarly':'grammarly',
  '文心一言':'wenxin','通义千问':'tongyi','智谱清言':'zhipu','Mistral AI':'mistral',
  '135编辑器':'xiezuocat','秀米':'metaso','Markdown Nice':'notion-ai',
  'Copy.ai':'copyai','GitHub Actions':'github-copilot','Vercel':'v0',
  'Supabase':'dify','Buzzsprout':'elevenlabs','Audacity':'descript',
  '小宇宙':'iflytek','Adobe Audition':'descript','Spotify for Podcasters':'suno',
  'Premiere Pro':'capcut','DaVinci Resolve':'capcut','After Effects':'capcut',
  'Photoshop AI':'adobe-firefly','Beautiful.ai':'gamma','Obsidian':'notion-ai',
  'Tidio AI':'fastgpt','AdCreative.ai':'canva','Klaviyo':'zapier','Shopify':'zapier',
}

const TIER_META: Record<string, { label: string; accent: string; tagBg: string; tagColor: string; darkTagBg: string }> = {
  free: { label: '全免费方案', accent: '#1D9E75', tagBg: '#E1F5EE', tagColor: '#085041', darkTagBg: '#085041' },
  mid:  { label: '性价比首选', accent: '#D97706', tagBg: '#FEF3C7', tagColor: '#92400E', darkTagBg: '#633806' },
  pro:  { label: '创意旗舰',   accent: '#7C3AED', tagBg: '#EDE9FE', tagColor: '#4C1D95', darkTagBg: '#3C3489' },
}


const NET_META = {
  cn:   { label: '国内直连', dot: '#22c55e', bg: '#f0fdf4', color: '#166534' },
  vpn:  { label: '需要梯子', dot: '#f59e0b', bg: '#fffbeb', color: '#92400e' },
  both: { label: '均可访问', dot: '#3b82f6', bg: '#eff6ff', color: '#1e40af' },
} as const

const DIFF_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: '极简', color: '#16a34a' },
  2: { label: '简单', color: '#65a30d' },
  3: { label: '中等', color: '#d97706' },
  4: { label: '较难', color: '#ea580c' },
  5: { label: '专业', color: '#dc2626' },
}

function NetBadge({ net }: { net: 'cn'|'vpn'|'both' }) {
  const m = NET_META[net] || NET_META.both
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:3, fontSize:10, fontWeight:500, background:m.bg, color:m.color, padding:'1px 6px', borderRadius:4 }}>
      <span style={{ width:5,height:5,borderRadius:'50%',background:m.dot,display:'inline-block',flexShrink:0 }}/>
      {m.label}
    </span>
  )
}

function DiffDots({ level }: { level: number }) {
  const color = DIFF_LABELS[level]?.color || '#d97706'
  return (
    <span style={{ display:'inline-flex', gap:2 }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ width:6,height:6,borderRadius:'50%',display:'inline-block', background: i<=level ? color : 'var(--color-border-secondary)' }}/>
      ))}
    </span>
  )
}

// ── 场景匹配（从 combos-data.ts 导入）─────────────────────

// ── 加载动效 ─────────────────────────────────────────────
function WukongLoader({ query }: { query: string }) {
  const [step, setStep] = useState(0)
  const steps = [
    '🐒 悟空出发，七十二变搜寻工具...',
    '🌀 金箍棒旋转，扫描 50+ 款 AI...',
    '⚡ 筋斗云飞驰，匹配最佳组合...',
    '✨ 法力无边，方案即将揭晓...',
  ]
  useEffect(() => {
    const t = setInterval(() => setStep(s => (s + 1) % steps.length), 800)
    return () => clearInterval(t)
  }, [])
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '55vh', gap: '28px' }}>
      <div style={{ position: 'relative', width: '110px', height: '110px' }}>
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid transparent', borderTopColor: '#D97706', borderRightColor: '#D97706', animation: 'r1 .9s linear infinite' }} />
        <div style={{ position: 'absolute', inset: '10px', borderRadius: '50%', border: '1.5px solid transparent', borderTopColor: '#F59E0B', borderLeftColor: '#F59E0B', animation: 'r2 .65s linear infinite reverse' }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '44px', animation: 'pulse 1.4s ease-in-out infinite' }}>🐒</div>
        {[0,60,120,180,240,300].map((deg, i) => (
          <div key={i} style={{ position: 'absolute', width: '6px', height: '6px', borderRadius: '50%', background: '#F59E0B', top: '50%', left: '50%', transform: `rotate(${deg}deg) translateY(-50px) translate(-50%,-50%)`, animation: `dot 1.2s ease-in-out ${i*0.2}s infinite` }} />
        ))}
      </div>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '15px', color: 'var(--color-text-primary)', fontWeight: 500, marginBottom: '8px', animation: 'fade .4s ease' }}>
          {steps[step]}
        </p>
        <p style={{ fontSize: '13px', color: 'var(--color-text-tertiary)', maxWidth: '300px', lineHeight: 1.5 }}>
          为「{query.length > 18 ? query.slice(0, 18) + '...' : query}」匹配最佳工具组合
        </p>
      </div>
      <div style={{ width: '180px', height: '3px', background: 'var(--color-background-secondary)', borderRadius: '2px', overflow: 'hidden' }}>
        <div style={{ height: '100%', background: '#D97706', borderRadius: '2px', animation: 'prog 2.4s ease-in-out infinite' }} />
      </div>
      <style>{`
        @keyframes r1{to{transform:rotate(360deg)}}
        @keyframes r2{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.1)}}
        @keyframes dot{0%,100%{opacity:.3;transform:rotate(var(--d,0deg)) translateY(-50px) translate(-50%,-50%) scale(.7)}50%{opacity:1;transform:rotate(var(--d,0deg)) translateY(-50px) translate(-50%,-50%) scale(1.2)}}
        @keyframes prog{0%{width:0;margin-left:0}60%{width:100%;margin-left:0}100%{width:0;margin-left:100%}}
        @keyframes fade{from{opacity:0;transform:translateY(3px)}to{opacity:1;transform:translateY(0)}}
      `}</style>
    </div>
  )
}

// ── 工具标签 ─────────────────────────────────────────────
function ToolChip({ tool, accent }: { tool: any; accent: string }) {
  const slug = NAME_TO_SLUG[tool.name]
  const chipStyle: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--color-background-primary)', border: '0.5px solid var(--color-border-secondary)', borderRadius: '8px', padding: '5px 10px', textDecoration: 'none', transition: 'border-color .15s, transform .1s', cursor: 'pointer' }
  const inner = (
    <>
      <div style={{ width: 20, height: 20, borderRadius: 4, overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {slug
          ? <ToolIcon slug={slug} name={tool.name} size={20} />
          : <span style={{ fontSize: '14px', lineHeight: 1 }}>{tool.logo}</span>
        }
      </div>
      <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text-primary)' }}>{tool.name}</span>
      <span style={{ fontSize: '10px', color: 'var(--color-text-tertiary)' }}>{tool.price}</span>
      <span style={{ fontSize: '10px', color: accent }}>{slug ? '→' : '↗'}</span>
    </>
  )
  if (slug) {
    return (
      <Link href={`/tools/${slug}/`} style={chipStyle}
        onClick={() => trackClick(`tool:${slug}`, { name: tool.name })}
        onMouseEnter={e => { e.currentTarget.style.borderColor = accent; e.currentTarget.style.transform = 'translateY(-1px)' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border-secondary)'; e.currentTarget.style.transform = 'none' }}>
        {inner}
      </Link>
    )
  }
  return (
    <a href={tool.url} target="_blank" rel="nofollow noopener" style={chipStyle}
      onClick={() => trackClick(`external_tool:${tool.name}`, { url: tool.url })}
      onMouseEnter={e => { e.currentTarget.style.borderColor = accent; e.currentTarget.style.transform = 'translateY(-1px)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border-secondary)'; e.currentTarget.style.transform = 'none' }}>
      {inner}
    </a>
  )
}

// ── 方案编号配色 ─────────────────────────────────────────
const PLAN_STYLES = [
  { numBg: '#D97706', numColor: '#fff',    border: (accent: string) => `2px solid ${accent}` },
  { numBg: '#1D6FB8', numColor: '#fff',    border: () => '2px solid #1D6FB8' },
  { numBg: '#6D28D9', numColor: '#fff',    border: () => '2px solid #6D28D9' },
]

// ── 组合卡片 ─────────────────────────────────────────────
function ComboCard({ combo, defaultOpen, index, scene }: { combo: any; defaultOpen: boolean; index: number; scene: string }) {
  const [open, setOpen] = useState(defaultOpen)
  const m = TIER_META[combo.tier] || TIER_META.mid
  const ps = PLAN_STYLES[index] || PLAN_STYLES[2]
  const planLabel = ['方案一', '方案二', '方案三'][index] || `方案${index + 1}`
  const borderStyle = combo.isRec ? `2px solid ${m.accent}` : ps.border(m.accent)

  return (
    <div style={{ background: 'var(--color-background-primary)', border: borderStyle, borderRadius: '16px', overflow: 'visible', position: 'relative' }}>

      {/* 方案编号标签（左上角） */}
      <div style={{
        position: 'absolute', top: '-12px', left: '16px',
        background: ps.numBg, color: ps.numColor,
        fontSize: '11px', fontWeight: 600,
        padding: '2px 10px', borderRadius: '20px',
        zIndex: 2, letterSpacing: '.02em',
        boxShadow: '0 1px 4px rgba(0,0,0,.12)',
      }}>
        {planLabel}
      </div>

      {combo.isRec && (
        <div style={{ position: 'absolute', top: '-1px', right: '20px', background: m.accent, color: '#fff', fontSize: '11px', fontWeight: 500, padding: '4px 14px 7px', borderRadius: '0 0 12px 12px', display: 'flex', alignItems: 'center', gap: '4px', zIndex: 2 }}>
          ⭐ 编辑推荐
        </div>
      )}
      {/* 头部 */}
      <div onClick={() => setOpen(!open)} style={{ padding: '1.5rem 1.2rem 1rem', background: combo.isRec ? (combo.tier === 'mid' ? '#FFFBF2' : combo.tier === 'pro' ? '#F5F3FF' : '#F0FDF9') : 'transparent', borderRadius: open ? '14px 14px 0 0' : '14px', borderBottom: open ? '0.5px solid var(--color-border-tertiary)' : 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '7px', marginBottom: '3px' }}>
            <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-primary)' }}>{combo.name}</span>
            <span style={{ fontSize: '10px', fontWeight: 500, background: m.tagBg, color: m.tagColor, padding: '2px 8px', borderRadius: '4px' }}>{m.label}</span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', margin: '0 0 4px' }}>{combo.tagline}</p>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 2 }}>
            {'netSummary' in combo && <NetBadge net={(combo as any).netSummary} />}
            {'overallDifficulty' in combo && (
              <span style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:10, color:'var(--color-text-tertiary)' }}>
                难度：<DiffDots level={(combo as any).overallDifficulty} />
                <span style={{ color: DIFF_LABELS[(combo as any).overallDifficulty]?.color, fontWeight:500 }}>{DIFF_LABELS[(combo as any).overallDifficulty]?.label}</span>
              </span>
            )}
            {'setupTime' in combo && (combo as any).setupTime && (
              <span style={{ fontSize:10, color:'var(--color-text-tertiary)' }}>⏱ 配置{(combo as any).setupTime}</span>
            )}
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: '16px', fontWeight: 500, color: 'var(--color-text-primary)' }}>
            ¥{combo.priceMin === 0 ? '0' : combo.priceMin}{combo.priceMin !== combo.priceMax ? `–${combo.priceMax}` : ''}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--color-text-tertiary)' }}>/月</div>
        </div>
        <span style={{ color: 'var(--color-text-tertiary)', fontSize: '18px', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s', flexShrink: 0 }}>▾</span>
      </div>
      {/* 内容 */}
      {open && (
        <div style={{ padding: '1rem 1.2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '14px' }}>
            {combo.steps.map((step: any, i: number) => (
              <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                  <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: m.tagBg, border: `0.5px solid ${m.accent}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 600, color: m.tagColor }}>{i + 1}</div>
                  {i < combo.steps.length - 1 && <div style={{ width: '1px', height: '20px', background: 'var(--color-border-tertiary)', margin: '2px 0' }} />}
                </div>
                <div style={{ flex: 1, paddingTop: '1px' }}>
                  <div style={{ fontSize: '10px', fontWeight: 500, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '5px' }}>{step.phase}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px' }}>
                    {step.tools.map((tool: any, j: number) => (
                      <span key={j} style={{ display: 'contents' }}>
                        <ToolChip tool={tool} accent={m.accent} />
                        {j < step.tools.length - 1 && <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>{step.conn === 'or' ? '或' : '+'}</span>}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ background: 'var(--color-background-secondary)', borderRadius: '10px', padding: '.75rem 1rem', marginBottom: '12px' }}>
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: 1.65, margin: 0 }}>
              <strong style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>{combo.isRec ? '⭐ 为什么推荐？' : '👤 适合人群：'}</strong>
              {' '}{combo.why}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              {combo.pros.map((p: string) => (
                <span key={p} style={{ fontSize: '11px', color: 'var(--color-text-secondary)', background: 'var(--color-background-secondary)', border: '0.5px solid var(--color-border-tertiary)', borderRadius: '4px', padding: '2px 8px' }}>{p}</span>
              ))}
            </div>
            <Link href={`/combos/${scene}/${combo.id}/`} 
              onClick={() => trackClick(`combo_detail:${combo.id}`, { scene, name: combo.name })}
              style={{ fontSize: '12px', fontWeight: 500, background: combo.isRec ? m.accent : 'transparent', color: combo.isRec ? '#fff' : m.accent, border: `1px solid ${m.accent}`, borderRadius: '8px', padding: '6px 14px', textDecoration: 'none', whiteSpace: 'nowrap' }}>
              查看完整流程 →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

// ── 价格对比 ─────────────────────────────────────────────
function PriceBars({ combos }: { combos: any[] }) {
  const maxP = Math.max(...combos.map(c => c.priceMax || 1))
  const colors = ['#D97706','#7C3AED','#1D9E75']
  return (
    <div style={{ background: 'var(--color-background-secondary)', border: '0.5px solid var(--color-border-tertiary)', borderRadius: '12px', padding: '1rem 1.25rem', marginTop: '14px' }}>
      <p style={{ fontSize: '13px', fontWeight: 500, marginBottom: '14px', color: 'var(--color-text-primary)' }}>三套方案月成本对比</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {combos.map((c, i) => (
          <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', width: '88px', flexShrink: 0, lineHeight: 1.3 }}>{TIER_META[c.tier]?.label}</span>
            <div style={{ flex: 1, height: '6px', background: 'var(--color-background-primary)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ height: '100%', background: colors[i % 3], borderRadius: '3px', width: `${Math.max(6, (c.priceMax / maxP) * 100)}%`, transition: 'width 1s ease' }} />
            </div>
            <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text-primary)', minWidth: '80px', textAlign: 'right', flexShrink: 0 }}>
              {c.priceMin === 0 && c.priceMax === 0 ? '完全免费' : `¥${c.priceMin}–${c.priceMax}/月`}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── 主页面 ────────────────────────────────────────────────
function RecommendContent() {
  const params = useSearchParams()
  const router = useRouter()
  const query   = params.get('q') || ''
  const network = (params.get('network') || 'all') as 'all' | 'cn' | 'intl'
  const lang    = params.get('lang') || 'zh'
  const [loading, setLoading]         = useState(true)
  const [loadingMsg, setLoadingMsg]   = useState('AI 正在理解你的需求…')
  const [combos, setCombos]           = useState<any[]>([])
  const [sceneLabels, setSceneLabels] = useState<string[]>([])
  const [sceneKey, setSceneKey]       = useState<string>('')
  const [intent, setIntent]           = useState('')
  const [aiMode, setAiMode]           = useState(false) // 是否用了AI推荐
  const [newQ, setNewQ]               = useState(query)
  const timer = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    if (!query) return
    setLoading(true)
    setCombos([])
    setSceneLabels([])
    setIntent('')
    setAiMode(false)

    // ── 加载提示轮播 ────────────────────────────────────
    const msgs = [
      'AI 正在理解你的需求…',
      '分析工具库，匹配最合适的组合…',
      '生成个性化工作流方案…',
      '整理 Prompt 模板和成本估算…',
    ]
    let mi = 0
    setLoadingMsg(msgs[0])
    const msgTimer = setInterval(() => {
      mi = (mi + 1) % msgs.length
      setLoadingMsg(msgs[mi])
    }, 1800)

    // ── 调用 AI 推荐（走 Anthropic API）─────────────────
    async function fetchAI() {
      try {
        const resp = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 4000,
            system: buildSystemPrompt(network),
            messages: [{
              role: 'user',
              content: `用户需求：${query}\n\n请推荐最合适的AI工具组合。只输出纯JSON，不要markdown代码块，不要任何解释。`
            }]
          })
        })
        if (!resp.ok) throw new Error(`${resp.status}`)
        const data = await resp.json()
        const raw = data.content?.[0]?.text || ''
        const match = raw.match(/\{[\s\S]*\}/)
        if (!match) throw new Error('no json')
        const parsed = JSON.parse(match[0])
        clearInterval(msgTimer)
        setAiMode(true)
        setSceneLabels([parsed.scene || query])
        // 尝试从标签匹配 key，如果匹配不到则使用 video 作为兜底
        const matchedKey = Object.entries(SCENE_LABELS).find(([_, label]) => label === parsed.scene)?.[0] || 'video'
        setSceneKey(matchedKey)
        setIntent(parsed.intent || '')
        setCombos(parsed.combos || [])
        setLoading(false)
      } catch {
        // ── 降级到本地关键词匹配 ────────────────────────
        clearInterval(msgTimer)
        const scene = matchScene(query)
        const result = getCombos(scene)
        setAiMode(false)
        setSceneLabels([SCENE_LABELS[scene] ?? scene])
        setSceneKey(scene)
        setCombos(result)
        setLoading(false)
      }
    }

    // 最少展示 1.5s 加载动画
    const start = Date.now()
    fetchAI().then(() => {
      const elapsed = Date.now() - start
      if (elapsed < 1500) {
        timer.current = setTimeout(() => {}, 1500 - elapsed)
      }
    })

    return () => { clearInterval(msgTimer); clearTimeout(timer.current) }
  }, [query, network])

  // ── 构建系统提示词（含工具目录）────────────────────────
  function buildSystemPrompt(net: string): string {
    const { ALL_TOOLS: tools } = require('@/lib/tools-data')
    const filtered = net === 'cn' ? tools.filter((t: any) => t.cnAccess)
                   : net === 'intl' ? tools.filter((t: any) => !t.cnAccess)
                   : tools
    const catalog = filtered.map((t: any) =>
      `[${t.slug}] ${t.name}(${t.category}) - ${t.tagline} | ${t.features.slice(0,3).join('/')} | ${t.price} | 国内:${t.cnAccess?'是':'否'}`
    ).join('\n')
    const netNote = net === 'cn' ? '仅推荐国内直连工具。' : net === 'intl' ? '用户在海外，推荐最佳工具。' : '兼顾国内外，标注清楚网络要求。'

    return `你是GO悟空AI工具顾问，${netNote}根据用户需求从工具库推荐最合适的工具组合。

工具库（${filtered.length}个）：
${catalog}

推荐规则：
1. 深度理解用户需求，不要被字面关键词限制，比如"法律文件修改"要推文档分析/AI写作工具
2. 推荐2-3套方案：免费方案+付费方案（+专业方案）
3. 每套方案3-5个步骤，每步说清楚用什么工具做什么
4. slug必须来自工具库，不得编造
5. 给出可直接使用的核心Prompt模板

输出纯JSON（无markdown代码块）：
{"scene":"场景名(≤8字)","intent":"需求解读(≤40字)","combos":[{"id":"ai_1","name":"方案名","tagline":"一句话","tier":"free|mid|pro","priceMin":0,"priceMax":0,"overallDifficulty":2,"netSummary":"cn|vpn|both","setupTime":"30分钟","timePerOutput":"每次30分钟","bestFor":"适合人群","pros":["优点1","优点2"],"why":"推荐理由(≤80字)","steps":[{"phase":"步骤名","conn":"or|and","flowNote":"如何流转","tools":[{"slug":"工具slug","name":"工具名","logo":"emoji","price":"价格","url":"官网","net":"cn|vpn|both","difficulty":2,"tip":"小贴士"}]}],"prompt":"核心Prompt模板（可直接使用）"}]}`
  }

  function go() {
    const q = newQ.trim()
    if (!q) return
    try {
      const prev: string[] = JSON.parse(localStorage.getItem('wk_recent') || '[]')
      localStorage.setItem('wk_recent', JSON.stringify([q, ...prev.filter(x => x !== q)].slice(0, 5)))
    } catch {}
    router.push(`/recommend?q=${encodeURIComponent(q)}&network=${network}&lang=${lang}`)
  }

  return (
    <div style={{ maxWidth: '740px', margin: '0 auto', padding: '0 20px 60px' }}>
      {/* 顶部导航 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 0', marginBottom: '8px', borderBottom: '0.5px solid var(--color-border-tertiary)' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none', flexShrink: 0 }}>
          <WukongLogo size={28} />
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
            <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-primary)', fontFamily: 'var(--font-serif)' }}>GO悟空</span>
            <span style={{ fontSize: '10px', color: 'var(--color-text-tertiary)' }}>GoWuKong.co</span>
          </div>
        </Link>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: 'var(--color-background-secondary)', border: '0.5px solid var(--color-border-secondary)', borderRadius: '20px', padding: '6px 14px', gap: '8px' }}>
          <input value={newQ} onChange={e => setNewQ(e.target.value)} onKeyDown={e => e.key === 'Enter' && go()} style={{ flex: 1, border: 'none', background: 'transparent', fontSize: '13px', color: 'var(--color-text-primary)', outline: 'none', fontFamily: 'var(--font-sans)' }} />
          <button onClick={go} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', lineHeight: 1 }}>🔍</button>
        </div>
        <Link href="/tools/" style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', textDecoration: 'none', flexShrink: 0 }}>工具库</Link>
      </div>

      {loading ? (
        <div style={{ padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px', animation: 'spin 2s linear infinite', display: 'inline-block' }}>🔮</div>
          <p style={{ fontSize: '15px', fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: '8px' }}>{loadingMsg}</p>
          <p style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>正在调用 AI 为「{query}」生成专属方案</p>
          <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
        </div>
      ) : (
        <>
          <div style={{ padding: '14px 0 10px' }}>
            {/* AI模式 or 本地模式标识 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
              {aiMode
                ? <span style={{ fontSize: '11px', fontWeight: 600, background: '#EDE9FE', color: '#5B21B6', padding: '2px 8px', borderRadius: '20px', border: '1px solid #C4B5FD' }}>✨ AI智能推荐</span>
                : <span style={{ fontSize: '11px', fontWeight: 500, background: '#FEF3C7', color: '#92400E', padding: '2px 8px', borderRadius: '20px', border: '1px solid #FCD34D' }}>📋 关键词匹配</span>
              }
              {sceneLabels.map(l => (
                <span key={l} style={{ fontSize: '11px', fontWeight: 500, background: '#FEF3C7', color: '#92400E', padding: '2px 8px', borderRadius: '4px' }}>{l}</span>
              ))}
            </div>
            {/* 需求解读 */}
            {intent && (
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', background: 'var(--color-background-secondary)', padding: '8px 12px', borderRadius: '8px', marginBottom: 8, borderLeft: '3px solid #D97706', lineHeight: 1.6 }}>
                💡 <strong>需求理解：</strong>{intent}
              </p>
            )}
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              根据「<strong style={{ color: 'var(--color-text-primary)' }}>{query.length > 30 ? query.slice(0, 30) + '...' : query}</strong>」，为你匹配了 <strong style={{ color: '#D97706' }}>{combos.length}</strong> 套 AI 工具组合：
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', marginTop: '8px' }}>
            {combos.map((c, i) => <ComboCard key={c.id} combo={c} defaultOpen={i === 0} index={i} scene={sceneKey} />)}
          </div>
          {combos.length >= 2 && <PriceBars combos={combos} />}
          <div style={{ marginTop: '20px', padding: '.9rem 1rem', textAlign: 'center', background: 'var(--color-background-secondary)', borderRadius: '12px', border: '0.5px solid var(--color-border-tertiary)' }}>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>想看更多工具详情或对比？</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/tools/" style={{ fontSize: '13px', color: '#D97706', fontWeight: 500, textDecoration: 'none' }}>浏览全部工具 →</Link>
              <span style={{ color: 'var(--color-text-tertiary)' }}>·</span>
              <Link href="/compare/" style={{ fontSize: '13px', color: '#D97706', fontWeight: 500, textDecoration: 'none' }}>工具横向对比 →</Link>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default function RecommendPage() {
  return (
    <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', fontSize: '32px' }}>🌀</div>}>
      <RecommendContent />
    </Suspense>
  )
}
