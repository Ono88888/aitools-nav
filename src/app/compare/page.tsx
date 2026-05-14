'use client'

import { useState, useMemo } from 'react'
import { ALL_TOOLS } from '@/lib/tools-data'

// ── 预设热门对比组合 ─────────────────────────────────────────
const HOT_PAIRS = [
  { a: 'chatgpt',    b: 'claude',    label: 'ChatGPT vs Claude' },
  { a: 'deepseek',   b: 'chatgpt',   label: 'DeepSeek vs ChatGPT' },
  { a: 'midjourney', b: 'jimeng',    label: 'Midjourney vs 即梦AI' },
  { a: 'cursor',     b: 'github-copilot', label: 'Cursor vs GitHub Copilot' },
  { a: 'kling',      b: 'runway',    label: '可灵AI vs Runway' },
  { a: 'elevenlabs', b: 'volcengine-tts', label: 'ElevenLabs vs 火山TTS' },
  { a: 'gamma',      b: 'aippt',     label: 'Gamma vs AiPPT' },
  { a: 'perplexity', b: 'metaso',    label: 'Perplexity vs 秘塔搜索' },
]

// ── 对比维度定义 ────────────────────────────────────────────
const COMPARE_DIMS = [
  { key: 'category',   label: '分类',       icon: '📂' },
  { key: 'maker',      label: '开发商',     icon: '🏢' },
  { key: 'price',      label: '定价',       icon: '💰' },
  { key: 'priceDetail',label: '价格详情',   icon: '🏷️' },
  { key: 'rating',     label: '综合评分',   icon: '⭐' },
  { key: 'hasFree',    label: '有免费版',   icon: '🆓' },
  { key: 'hasApi',     label: '提供API',    icon: '🔌' },
  { key: 'cnAccess',   label: '国内可用',   icon: '🇨🇳' },
  { key: 'bestFor',    label: '最适合',     icon: '🎯' },
  { key: 'tagline',    label: '核心特点',   icon: '✨' },
]

const toolMap = Object.fromEntries(ALL_TOOLS.map(t => [t.slug, t]))

// ── 单个工具值渲染 ──────────────────────────────────────────
function renderValue(tool: any, key: string) {
  const val = tool[key]
  if (key === 'rating') return (
    <span style={{ fontWeight: 600, color: '#D97706', fontSize: '16px' }}>★ {Number(val).toFixed(1)}</span>
  )
  if (key === 'hasFree' || key === 'hasApi' || key === 'cnAccess') return (
    <span style={{
      fontSize: '13px', fontWeight: 500,
      color: val ? '#085041' : '#712B13',
      background: val ? '#E1F5EE' : '#FAECE7',
      padding: '2px 10px', borderRadius: '20px',
    }}>{val ? '✓ 是' : '✗ 否'}</span>
  )
  if (key === 'price') return (
    <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text-primary)' }}>{val}</span>
  )
  return <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>{val || '—'}</span>
}

// ── 胜负判断 ────────────────────────────────────────────────
function getWinner(toolA: any, toolB: any, key: string): 'a' | 'b' | 'tie' {
  if (key === 'rating') return toolA.rating > toolB.rating ? 'a' : toolA.rating < toolB.rating ? 'b' : 'tie'
  if (key === 'hasFree' || key === 'hasApi' || key === 'cnAccess') {
    if (toolA[key] && !toolB[key]) return 'a'
    if (!toolA[key] && toolB[key]) return 'b'
  }
  return 'tie'
}

export default function ComparePage() {
  const [slugA, setSlugA] = useState('chatgpt')
  const [slugB, setSlugB] = useState('claude')
  const [search, setSearch] = useState('')

  const toolA = toolMap[slugA]
  const toolB = toolMap[slugB]

  const filteredTools = useMemo(() => {
    const q = search.toLowerCase()
    return ALL_TOOLS.filter(t =>
      !q || t.name.toLowerCase().includes(q) || t.category.toLowerCase().includes(q)
    ).slice(0, 30)
  }, [search])

  // 总评分
  const scoreA = COMPARE_DIMS.filter(d => ['hasFree','hasApi','cnAccess'].includes(d.key))
    .reduce((s, d) => s + (toolA?.[d.key] ? 1 : 0), 0) + (toolA?.rating || 0)
  const scoreB = COMPARE_DIMS.filter(d => ['hasFree','hasApi','cnAccess'].includes(d.key))
    .reduce((s, d) => s + (toolB?.[d.key] ? 1 : 0), 0) + (toolB?.rating || 0)

  const selectStyle = (active: boolean): React.CSSProperties => ({
    flex: 1, padding: '10px 14px', fontSize: '14px', fontWeight: active ? 500 : 400,
    border: active ? '2px solid #D97706' : '1px solid var(--color-border-secondary)',
    borderRadius: '12px', background: active ? '#FFFBF2' : 'var(--color-background-primary)',
    color: 'var(--color-text-primary)', cursor: 'pointer', textAlign: 'left' as const,
    fontFamily: 'var(--font-sans)',
  })

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: '32px 20px 60px' }}>

      {/* 标题 */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '6px' }}>
          AI 工具横向对比
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--color-text-tertiary)' }}>选择两个工具，一键生成详细对比报告</p>
      </div>

      {/* 热门对比 */}
      <div style={{ marginBottom: '28px' }}>
        <p style={{ fontSize: '11px', fontWeight: 500, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '10px' }}>🔥 热门对比</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {HOT_PAIRS.map(p => (
            <button key={p.label} onClick={() => { setSlugA(p.a); setSlugB(p.b) }} style={{
              fontSize: '12px', padding: '5px 12px', borderRadius: '20px', cursor: 'pointer',
              border: slugA === p.a && slugB === p.b ? '1.5px solid #D97706' : '0.5px solid var(--color-border-secondary)',
              background: slugA === p.a && slugB === p.b ? '#FFFBF2' : 'var(--color-background-primary)',
              color: slugA === p.a && slugB === p.b ? '#D97706' : 'var(--color-text-secondary)',
              fontFamily: 'var(--font-sans)', fontWeight: slugA === p.a && slugB === p.b ? 500 : 400,
              transition: 'all .15s',
            }}>{p.label}</button>
          ))}
        </div>
      </div>

      {/* 选择工具 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '12px', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <p style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', marginBottom: '6px', fontWeight: 500 }}>工具 A</p>
          <select value={slugA} onChange={e => setSlugA(e.target.value)} style={selectStyle(true)}>
            {ALL_TOOLS.map(t => <option key={t.slug} value={t.slug}>{t.name}</option>)}
          </select>
        </div>
        <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-text-tertiary)', textAlign: 'center', marginTop: '20px' }}>VS</div>
        <div>
          <p style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', marginBottom: '6px', fontWeight: 500 }}>工具 B</p>
          <select value={slugB} onChange={e => setSlugB(e.target.value)} style={selectStyle(false)}>
            {ALL_TOOLS.map(t => <option key={t.slug} value={t.slug}>{t.name}</option>)}
          </select>
        </div>
      </div>

      {/* 对比头部卡片 */}
      {toolA && toolB && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '4px' }}>
            {[{ tool: toolA, score: scoreA, winner: scoreA >= scoreB }, { tool: toolB, score: scoreB, winner: scoreB > scoreA }].map(({ tool, score, winner }, i) => (
              <div key={i} style={{
                padding: '20px', borderRadius: '16px', textAlign: 'center',
                border: winner ? '2px solid #D97706' : '0.5px solid var(--color-border-tertiary)',
                background: winner ? '#FFFBF2' : 'var(--color-background-primary)',
                position: 'relative',
              }}>
                {winner && <div style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', background: '#D97706', color: '#fff', fontSize: '10px', fontWeight: 600, padding: '2px 10px', borderRadius: '20px' }}>推荐选择</div>}
                <div style={{ fontSize: '36px', marginBottom: '8px' }}>{tool.logo}</div>
                <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '4px' }}>{tool.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginBottom: '12px' }}>{tool.maker}</div>
                <div style={{ fontSize: '22px', fontWeight: 700, color: '#D97706' }}>★ {tool.rating.toFixed(1)}</div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', marginTop: '4px' }}>{tool.price}</div>
                <a href={tool.url} target="_blank" rel="nofollow noopener" style={{
                  display: 'inline-block', marginTop: '12px', padding: '6px 16px',
                  background: winner ? '#D97706' : 'var(--color-background-secondary)',
                  color: winner ? '#fff' : 'var(--color-text-secondary)',
                  borderRadius: '8px', fontSize: '12px', fontWeight: 500, textDecoration: 'none',
                }}>访问官网 ↗</a>
              </div>
            ))}
          </div>

          {/* 详细对比表 */}
          <div style={{ background: 'var(--color-background-primary)', border: '0.5px solid var(--color-border-tertiary)', borderRadius: '16px', overflow: 'hidden', marginTop: '20px' }}>
            {/* 表头 */}
            <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr 1fr', background: 'var(--color-background-secondary)', padding: '12px 16px', borderBottom: '0.5px solid var(--color-border-tertiary)' }}>
              <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text-tertiary)' }}>对比维度</span>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#D97706', textAlign: 'center' }}>{toolA.name}</span>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)', textAlign: 'center' }}>{toolB.name}</span>
            </div>
            {COMPARE_DIMS.map((dim, i) => {
              const winner = getWinner(toolA, toolB, dim.key)
              return (
                <div key={dim.key} style={{
                  display: 'grid', gridTemplateColumns: '160px 1fr 1fr',
                  padding: '12px 16px', alignItems: 'center',
                  borderBottom: i < COMPARE_DIMS.length - 1 ? '0.5px solid var(--color-border-tertiary)' : 'none',
                  background: i % 2 === 0 ? 'transparent' : 'var(--color-background-secondary)',
                }}>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span>{dim.icon}</span>{dim.label}
                  </span>
                  <div style={{
                    textAlign: 'center', padding: '4px 8px',
                    borderRadius: '8px',
                    background: winner === 'a' ? 'rgba(217,119,6,.08)' : 'transparent',
                  }}>
                    {renderValue(toolA, dim.key)}
                  </div>
                  <div style={{
                    textAlign: 'center', padding: '4px 8px',
                    borderRadius: '8px',
                    background: winner === 'b' ? 'rgba(217,119,6,.08)' : 'transparent',
                  }}>
                    {renderValue(toolB, dim.key)}
                  </div>
                </div>
              )
            })}
          </div>

          {/* 优缺点总结 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '16px' }}>
            {[toolA, toolB].map((tool, i) => (
              <div key={i} style={{ padding: '16px', background: 'var(--color-background-primary)', border: '0.5px solid var(--color-border-tertiary)', borderRadius: '14px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '10px' }}>
                  {tool.logo} {tool.name} 小结
                </h3>
                <div style={{ marginBottom: '8px' }}>
                  <p style={{ fontSize: '11px', fontWeight: 500, color: '#085041', marginBottom: '5px' }}>✓ 优点</p>
                  {(tool.pros || []).map((p: string) => (
                    <p key={p} style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '3px' }}>• {p}</p>
                  ))}
                </div>
                <div>
                  <p style={{ fontSize: '11px', fontWeight: 500, color: '#712B13', marginBottom: '5px' }}>✗ 缺点</p>
                  {(tool.cons || []).map((c: string) => (
                    <p key={c} style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '3px' }}>• {c}</p>
                  ))}
                </div>
                <p style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', marginTop: '10px', paddingTop: '8px', borderTop: '0.5px solid var(--color-border-tertiary)' }}>
                  🎯 {tool.bestFor}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
