'use client'

import { useEffect, useState, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import WukongLogo from '@/components/WukongLogo'
import ToolIcon from '@/components/ToolIcon'
import { getCombos, matchScene, SCENE_LABELS } from '@/lib/combos-data'

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
  return (
    <a href={tool.url} target="_blank" rel="nofollow noopener"
      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--color-background-primary)', border: '0.5px solid var(--color-border-secondary)', borderRadius: '8px', padding: '5px 10px', textDecoration: 'none', transition: 'border-color .15s, transform .1s', cursor: 'pointer' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = accent; e.currentTarget.style.transform = 'translateY(-1px)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border-secondary)'; e.currentTarget.style.transform = 'none' }}
    >
      <div style={{ width: 20, height: 20, borderRadius: 4, overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {slug
          ? <ToolIcon slug={slug} name={tool.name} size={20} />
          : <span style={{ fontSize: '14px', lineHeight: 1 }}>{tool.logo}</span>
        }
      </div>
      <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text-primary)' }}>{tool.name}</span>
      <span style={{ fontSize: '10px', color: 'var(--color-text-tertiary)' }}>{tool.price}</span>
      <span style={{ fontSize: '10px', color: accent }}>↗</span>
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
          <p style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', margin: 0 }}>{combo.tagline}</p>
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
            <Link href={`/combos/${scene}/${combo.id}/`} style={{ fontSize: '12px', fontWeight: 500, background: combo.isRec ? m.accent : 'transparent', color: combo.isRec ? '#fff' : m.accent, border: `1px solid ${m.accent}`, borderRadius: '8px', padding: '6px 14px', textDecoration: 'none', whiteSpace: 'nowrap' }}>
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
  const network = params.get('network') || 'all'  // all | cn | intl
  const lang    = params.get('lang') || 'zh'
  const [loading, setLoading]         = useState(true)
  const [combos, setCombos]           = useState<any[]>([])
  const [sceneLabels, setSceneLabels] = useState<string[]>([])
  const [newQ, setNewQ]               = useState(query)
  const timer = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    if (!query) return
    setLoading(true)
    setCombos([])
    setSceneLabels([])

    // 本地直接匹配（output:export 静态模式，无需API调用）
    const MIN_MS = 2000
    const start = Date.now()
    const scene = matchScene(query)
    let result = getCombos(scene)

    // 按网络环境过滤工具步骤
    const CN_DOMAINS = ['doubao.com','deepseek.com','kimi.moonshot.cn','yiyan.baidu.com',
      'tongyi.aliyun.com','chatglm.cn','metaso.cn','jimeng.jianying.com','yige.baidu.com',
      'capcut.cn','wps.cn','aippt.cn','coze.cn','feigua.io','xiezuocat.com',
      'volcengine.com','iflyrec.com','klingai.kuaishou.com','vidu.cn','gaoding.com','wanxiang']
    const CN_ONLY = ['doubao.com','kimi.moonshot.cn','yiyan.baidu.com','capcut.cn',
      'aippt.cn','coze.cn','feigua.io','xiezuocat.com','klingai.kuaishou.com','vidu.cn','gaoding.com']

    if (network === 'cn') {
      result = result.map((combo: any) => ({
        ...combo,
        steps: combo.steps.map((step: any) => ({
          ...step,
          tools: step.tools.filter((tool: any) => CN_DOMAINS.some(d => tool.url?.includes(d))),
        })).filter((step: any) => step.tools.length > 0),
      })).filter((combo: any) => combo.steps.length > 0)
    } else if (network === 'intl') {
      result = result.map((combo: any) => ({
        ...combo,
        steps: combo.steps.map((step: any) => ({
          ...step,
          tools: step.tools.filter((tool: any) => !CN_ONLY.some(d => tool.url?.includes(d))),
        })).filter((step: any) => step.tools.length > 0),
      })).filter((combo: any) => combo.steps.length > 0)
    }

    const labels = [SCENE_LABELS[scene] ?? scene]

    const elapsed = Date.now() - start
    const delay = Math.max(0, MIN_MS - elapsed)
    timer.current = setTimeout(() => {
      setCombos(result)
      setSceneLabels(labels)
      setLoading(false)
    }, delay)

    return () => clearTimeout(timer.current)
  }, [query, network])

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

      {loading ? <WukongLoader query={query} /> : (
        <>
          <div style={{ padding: '14px 0 10px' }}>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              根据「<strong style={{ color: 'var(--color-text-primary)' }}>{query.length > 30 ? query.slice(0, 30) + '...' : query}</strong>」识别为
              {sceneLabels.length > 0 && (
                <span style={{ display: 'inline-flex', gap: '4px', margin: '0 4px' }}>
                  {sceneLabels.map(l => (
                    <span key={l} style={{ fontSize: '11px', fontWeight: 500, background: '#FEF3C7', color: '#92400E', padding: '1px 7px', borderRadius: '4px' }}>{l}</span>
                  ))}
                </span>
              )}
              场景，为你匹配了 {combos.length} 套 AI 工具组合：
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', marginTop: '8px' }}>
            {combos.map((c, i) => <ComboCard key={c.id} combo={c} defaultOpen={i === 0} index={i} scene={matchScene(query)} />)}
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
