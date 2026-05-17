'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import ToolIcon from '@/components/ToolIcon'
import { ALL_TOOLS } from '@/lib/tools-data'

// ── 广告位 ───────────────────────────────────────────────
function AdSlot({ id, style }: { id: string; style?: React.CSSProperties }) {
  return (
    <div id={id} style={{ background: 'var(--color-background-secondary)', border: '1px dashed var(--color-border-secondary)', borderRadius: '12px', padding: '16px', textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: '11px', minHeight: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', ...style }}>
      <span>广告位 · Ad Slot</span>
    </div>
  )
}

// ── 星级组件 ─────────────────────────────────────────────
function StarRating({ value, onChange, size = 24 }: { value: number; onChange?: (v: number) => void; size?: number }) {
  const [hover, setHover] = useState(0)
  return (
    <div style={{ display: 'flex', gap: '2px' }}>
      {[1, 2, 3, 4, 5].map(n => (
        <span key={n}
          onClick={() => onChange?.(n)}
          onMouseEnter={() => onChange && setHover(n)}
          onMouseLeave={() => onChange && setHover(0)}
          style={{ fontSize: size, cursor: onChange ? 'pointer' : 'default', color: n <= (hover || value) ? '#D97706' : '#D1D5DB', transition: 'color .1s', lineHeight: 1 }}>★</span>
      ))}
    </div>
  )
}

// ── 难度显示 ─────────────────────────────────────────────
const DIFF: Record<number, { label: string; color: string }> = {
  1: { label: '极简上手', color: '#16a34a' },
  2: { label: '新手友好', color: '#65a30d' },
  3: { label: '中等难度', color: '#d97706' },
  4: { label: '需要基础', color: '#ea580c' },
  5: { label: '专业级别', color: '#dc2626' },
}

// ── 评论系统 ─────────────────────────────────────────────
interface Comment { id: number; name: string; text: string; rating: number; date: string; helpful: number; useCase?: string }

function CommentSection({ slug, toolName }: { slug: string; toolName: string }) {
  const [comments, setComments] = useState<Comment[]>([])
  const [name, setName] = useState('')
  const [text, setText] = useState('')
  const [rating, setRating] = useState(5)
  const [useCase, setUseCase] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [sortBy, setSortBy] = useState<'latest' | 'helpful' | 'rating'>('latest')

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(`wk_comments_${slug}`) || '[]')
      setComments(saved)
    } catch {}
  }, [slug])

  const userAvg = comments.length > 0 ? comments.reduce((s, c) => s + c.rating, 0) / comments.length : 0

  const ratingDist = [5, 4, 3, 2, 1].map(r => ({
    star: r,
    count: comments.filter(c => c.rating === r).length,
    pct: comments.length > 0 ? (comments.filter(c => c.rating === r).length / comments.length) * 100 : 0,
  }))

  const sorted = [...comments].sort((a, b) => {
    if (sortBy === 'helpful') return b.helpful - a.helpful
    if (sortBy === 'rating') return b.rating - a.rating
    return b.id - a.id
  })

  function submit() {
    if (!text.trim() || text.length < 10) return
    setSubmitting(true)
    const c: Comment = { id: Date.now(), name: name.trim() || '匿名用户', text: text.trim(), rating, date: new Date().toLocaleDateString('zh-CN'), helpful: 0, useCase: useCase.trim() }
    const updated = [c, ...comments]
    try { localStorage.setItem(`wk_comments_${slug}`, JSON.stringify(updated.slice(0, 100))) } catch {}
    setComments(updated)
    setText(''); setName(''); setRating(5); setUseCase('')
    setSubmitting(false); setDone(true)
    setTimeout(() => setDone(false), 3000)
  }

  function markHelpful(id: number) {
    const updated = comments.map(c => c.id === id ? { ...c, helpful: c.helpful + 1 } : c)
    setComments(updated)
    try { localStorage.setItem(`wk_comments_${slug}`, JSON.stringify(updated)) } catch {}
  }

  const inp: React.CSSProperties = { width: '100%', padding: '9px 12px', fontSize: '13px', border: '1px solid var(--color-border-secondary)', borderRadius: '10px', background: 'var(--color-background-primary)', color: 'var(--color-text-primary)', outline: 'none', fontFamily: 'var(--font-sans)', boxSizing: 'border-box' }

  return (
    <section style={{ marginTop: '40px' }}>
      <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '20px' }}>
        用户评价
        {comments.length > 0 && <span style={{ fontSize: '14px', fontWeight: 400, color: 'var(--color-text-tertiary)', marginLeft: '8px' }}>（{comments.length} 条）</span>}
      </h2>

      {/* 评分总览 */}
      {comments.length > 0 && (
        <div style={{ display: 'flex', gap: '24px', padding: '20px', background: 'var(--color-background-secondary)', borderRadius: '14px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'center', minWidth: '80px' }}>
            <div style={{ fontSize: '44px', fontWeight: 700, color: '#D97706', lineHeight: 1 }}>{userAvg.toFixed(1)}</div>
            <StarRating value={Math.round(userAvg)} size={16} />
            <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', marginTop: '4px' }}>{comments.length} 人评分</div>
          </div>
          <div style={{ flex: 1, minWidth: '160px' }}>
            {ratingDist.map(r => (
              <div key={r.star} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', width: '16px', flexShrink: 0 }}>{r.star}★</span>
                <div style={{ flex: 1, height: '6px', background: 'var(--color-background-primary)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: '#D97706', borderRadius: '3px', width: `${r.pct}%`, transition: 'width 0.6s ease' }} />
                </div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', width: '24px', textAlign: 'right', flexShrink: 0 }}>{r.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 写评价 */}
      <div style={{ background: 'var(--color-background-secondary)', borderRadius: '14px', padding: '18px', marginBottom: '20px', border: '0.5px solid var(--color-border-tertiary)' }}>
        <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: '14px' }}>📝 分享你的真实使用体验</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="昵称（留空=匿名）" style={{ ...inp, flex: 1 }} maxLength={20} />
            <input value={useCase} onChange={e => setUseCase(e.target.value)} placeholder="你的使用场景（选填）" style={{ ...inp, flex: 2 }} maxLength={30} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)', flexShrink: 0 }}>打分：</span>
            <StarRating value={rating} onChange={setRating} size={28} />
            <span style={{ fontSize: '13px', color: '#D97706', fontWeight: 600 }}>{rating}.0 / 5.0</span>
          </div>
          <textarea
            value={text}
            onChange={e => { if (e.target.value.length <= 500) setText(e.target.value) }}
            placeholder={`说说你使用 ${toolName} 的真实体验，至少10个字…`}
            rows={3} maxLength={500}
            style={{ ...inp, resize: 'vertical', minHeight: '80px' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: text.length < 10 ? '#EF4444' : 'var(--color-text-tertiary)' }}>
              {text.length}/500{text.length < 10 && text.length > 0 ? '（至少10字）' : ''}
            </span>
            <button onClick={submit} disabled={text.length < 10 || submitting}
              style={{ padding: '8px 22px', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 500, cursor: text.length >= 10 ? 'pointer' : 'not-allowed', background: text.length >= 10 ? '#D97706' : 'var(--color-background-primary)', color: text.length >= 10 ? '#fff' : 'var(--color-text-tertiary)', fontFamily: 'var(--font-sans)', transition: 'all .15s' }}>
              {done ? '✓ 已发布' : submitting ? '发布中…' : '发布评价'}
            </button>
          </div>
        </div>
      </div>

      {/* 排序 */}
      {comments.length > 0 && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          {(['latest', 'helpful', 'rating'] as const).map(s => (
            <button key={s} onClick={() => setSortBy(s)} style={{ fontSize: '12px', padding: '4px 12px', borderRadius: '20px', border: `0.5px solid ${sortBy === s ? '#D97706' : 'var(--color-border-secondary)'}`, background: sortBy === s ? '#FEF3C7' : 'transparent', color: sortBy === s ? '#D97706' : 'var(--color-text-tertiary)', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
              {s === 'latest' ? '最新' : s === 'helpful' ? '最有帮助' : '评分最高'}
            </button>
          ))}
        </div>
      )}

      {/* 评论列表 */}
      {comments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-tertiary)', fontSize: '14px', background: 'var(--color-background-secondary)', borderRadius: '14px' }}>
          还没有评价，成为第一个评价 {toolName} 的用户 🎉
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {sorted.map(c => (
            <div key={c.id} style={{ padding: '16px', background: 'var(--color-background-primary)', border: '0.5px solid var(--color-border-tertiary)', borderRadius: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#D97706', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, flexShrink: 0 }}>
                    {c.name[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text-primary)' }}>{c.name}</span>
                      {c.useCase && <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', background: 'var(--color-background-secondary)', padding: '1px 7px', borderRadius: '4px' }}>{c.useCase}</span>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                      <StarRating value={c.rating} size={12} />
                      <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>{c.date}</span>
                    </div>
                  </div>
                </div>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.65, margin: '0 0 10px' }}>{c.text}</p>
              <button onClick={() => markHelpful(c.id)} style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', background: 'none', border: '0.5px solid var(--color-border-tertiary)', borderRadius: '6px', padding: '3px 10px', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
                👍 有用 {c.helpful > 0 && `(${c.helpful})`}
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

// ── 视频教程卡片 ─────────────────────────────────────────
function TutorialCard({ video }: { video: any }) {
  const isBili = video.platform === 'bilibili'
  return (
    <a href={video.url} target="_blank" rel="noopener noreferrer"
      style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', background: 'var(--color-background-primary)', border: '0.5px solid var(--color-border-tertiary)', borderRadius: '12px', textDecoration: 'none', transition: 'border-color .15s' }}
      onMouseEnter={e => e.currentTarget.style.borderColor = '#D97706'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-border-tertiary)'}
    >
      <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: isBili ? '#FFF0F5' : '#FFF5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '18px' }}>
        {isBili ? '📺' : '▶'}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{video.title}</div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', fontWeight: 500, color: isBili ? '#E0366F' : '#CC0000' }}>{isBili ? 'B站' : 'YouTube'}</span>
          {video.duration && <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>约{video.duration}</span>}
          <span style={{ fontSize: '11px', padding: '1px 6px', borderRadius: '4px', background: video.level === 'beginner' ? '#E1F5EE' : '#FEF3C7', color: video.level === 'beginner' ? '#085041' : '#92400E' }}>
            {video.level === 'beginner' ? '新手入门' : '进阶技巧'}
          </span>
        </div>
      </div>
      <span style={{ color: 'var(--color-text-tertiary)', flexShrink: 0, fontSize: '14px' }}>↗</span>
    </a>
  )
}

// ── 工具对比浮层 ─────────────────────────────────────────
function CompareDrawer({ tool, onClose }: { tool: any; onClose: () => void }) {
  const [selected, setSelected] = useState<string[]>([tool.slug])
  const candidates = ALL_TOOLS.filter(t => t.category === tool.category && t.slug !== tool.slug).slice(0, 8)
  const compareTools = ALL_TOOLS.filter(t => selected.includes(t.slug))

  const metrics = [
    { label: '免费版', key: (t: any) => t.hasFree ? '✓ 有' : '✗ 无', color: (t: any) => t.hasFree ? '#16a34a' : '#dc2626' },
    { label: '国内直连', key: (t: any) => t.cnAccess ? '✓ 是' : '✗ 需VPN', color: (t: any) => t.cnAccess ? '#16a34a' : '#dc2626' },
    { label: 'API支持', key: (t: any) => t.hasApi ? '✓ 支持' : '✗ 无', color: (t: any) => t.hasApi ? '#16a34a' : '#dc2626' },
    { label: '上手难度', key: (t: any) => DIFF[t.difficulty || 2]?.label || '中等', color: () => 'var(--color-text-primary)' },
    { label: '起步价格', key: (t: any) => t.price, color: () => 'var(--color-text-primary)' },
    { label: '编辑评分', key: (t: any) => `★ ${(t.rating || 0).toFixed(1)}`, color: () => '#D97706' },
  ]

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'flex-end' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ width: '100%', maxHeight: '80vh', background: 'var(--color-background-primary)', borderRadius: '20px 20px 0 0', overflow: 'auto', padding: '24px 20px 40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>工具对比</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--color-text-tertiary)' }}>✕</button>
        </div>
        {/* 选择对比工具 */}
        <div style={{ marginBottom: '16px' }}>
          <p style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginBottom: '8px' }}>选择要对比的工具（最多3个）：</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {candidates.map(c => {
              const sel = selected.includes(c.slug)
              return (
                <button key={c.slug}
                  onClick={() => {
                    if (sel) { setSelected(prev => prev.filter(s => s !== c.slug)) }
                    else if (selected.length < 3) { setSelected(prev => [...prev, c.slug]) }
                  }}
                  style={{ fontSize: '12px', padding: '4px 12px', borderRadius: '20px', border: `0.5px solid ${sel ? '#D97706' : 'var(--color-border-secondary)'}`, background: sel ? '#FEF3C7' : 'transparent', color: sel ? '#D97706' : 'var(--color-text-secondary)', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
                  {c.name}
                </button>
              )
            })}
          </div>
        </div>
        {/* 对比表 */}
        {compareTools.length > 0 && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 4px', minWidth: '300px' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', fontSize: '11px', color: 'var(--color-text-tertiary)', padding: '4px 8px', fontWeight: 500 }}>维度</th>
                  {compareTools.map(t => (
                    <th key={t.slug} style={{ textAlign: 'center', fontSize: '12px', fontWeight: 600, color: t.slug === tool.slug ? '#D97706' : 'var(--color-text-primary)', padding: '4px 8px' }}>
                      {t.name}{t.slug === tool.slug ? ' 🔍' : ''}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {metrics.map(m => (
                  <tr key={m.label} style={{ background: 'var(--color-background-secondary)' }}>
                    <td style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', padding: '8px 8px', borderRadius: '6px 0 0 6px', fontWeight: 500 }}>{m.label}</td>
                    {compareTools.map(t => (
                      <td key={t.slug} style={{ fontSize: '12px', fontWeight: 500, color: m.color(t), textAlign: 'center', padding: '8px 8px', borderRadius: compareTools.indexOf(t) === compareTools.length - 1 ? '0 6px 6px 0' : '0' }}>
                        {m.key(t)}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr>
                  <td style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', padding: '8px 8px', fontWeight: 500 }}>查看详情</td>
                  {compareTools.map(t => (
                    <td key={t.slug} style={{ textAlign: 'center', padding: '8px 8px' }}>
                      <Link href={`/tools/${t.slug}/`} style={{ fontSize: '11px', color: '#D97706', textDecoration: 'none', fontWeight: 500 }}>
                        {t.slug === tool.slug ? '当前页' : '去看看 →'}
                      </Link>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

// ── 主组件 ───────────────────────────────────────────────
interface Props { tool: any; related: any[]; faqs: { q: string; a: string }[] }

export default function ToolDetailClient({ tool, related, faqs }: Props) {
  const [showCompare, setShowCompare] = useState(false)
  const diff = DIFF[tool.difficulty || 2]

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '0 20px 80px' }}>

      {/* 面包屑 */}
      <nav style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', padding: '14px 0 16px', display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
        <Link href="/" style={{ color: 'var(--color-text-tertiary)', textDecoration: 'none' }}>GO悟空</Link>
        <span>›</span>
        <Link href="/tools/" style={{ color: 'var(--color-text-tertiary)', textDecoration: 'none' }}>工具库</Link>
        <span>›</span>
        <Link href={`/tools/?cat=${encodeURIComponent(tool.category)}`} style={{ color: 'var(--color-text-tertiary)', textDecoration: 'none' }}>{tool.category}</Link>
        <span>›</span>
        <span style={{ color: 'var(--color-text-primary)' }}>{tool.name}</span>
      </nav>

      {/* ── Hero区 ── */}
      <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'var(--color-background-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden', border: '0.5px solid var(--color-border-tertiary)' }}>
          <ToolIcon slug={tool.slug} emoji={tool.logo} name={tool.name} size={48} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>{tool.name}</h1>
            <span style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', background: 'var(--color-background-secondary)', padding: '2px 8px', borderRadius: '4px' }}>{tool.maker}</span>
            {tool.cnAccess ? (
              <span style={{ fontSize: '11px', background: '#E1F5EE', color: '#085041', padding: '2px 8px', borderRadius: '4px', fontWeight: 500 }}>🇨🇳 国内直连</span>
            ) : (
              <span style={{ fontSize: '11px', background: '#FFF3CD', color: '#92400E', padding: '2px 8px', borderRadius: '4px', fontWeight: 500 }}>🔒 需要梯子</span>
            )}
          </div>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: '0 0 8px' }}>{tool.tagline}</p>
          {/* 评分 + 难度 */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
            {tool.rating > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <StarRating value={Math.round(tool.rating)} size={14} />
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#D97706' }}>{tool.rating.toFixed(1)}</span>
                {tool.ratingCount && <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>({tool.ratingCount})</span>}
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>上手难度：</span>
              <span style={{ fontSize: '11px', fontWeight: 600, color: diff?.color }}>{diff?.label}</span>
              <div style={{ display: 'flex', gap: '2px' }}>
                {[1,2,3,4,5].map(i => <span key={i} style={{ width: 5, height: 5, borderRadius: '50%', display: 'inline-block', background: i <= (tool.difficulty || 2) ? diff?.color : 'var(--color-border-secondary)' }} />)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 快捷操作按钮组 ── */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <a href={tool.affiliateUrl || tool.url} target="_blank" rel="nofollow noopener"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 20px', background: '#D97706', color: '#fff', borderRadius: '10px', fontSize: '14px', fontWeight: 500, textDecoration: 'none' }}>
          访问官网 ↗
        </a>
        <button onClick={() => setShowCompare(true)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 16px', background: 'var(--color-background-primary)', color: 'var(--color-text-secondary)', borderRadius: '10px', fontSize: '13px', border: '0.5px solid var(--color-border-secondary)', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
          ⚖️ 与同类对比
        </button>
        {tool.hasApi && (
          <a href={`${tool.url}/api`} target="_blank" rel="nofollow noopener"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 14px', background: 'var(--color-background-secondary)', color: 'var(--color-text-secondary)', borderRadius: '10px', fontSize: '12px', border: '0.5px solid var(--color-border-secondary)', textDecoration: 'none' }}>
            🔌 API文档
          </a>
        )}
      </div>

      <AdSlot id="ad-tool-top" style={{ marginBottom: '20px' }} />

      {/* ── 核心指标卡 ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '20px' }}>
        {[
          { icon: '💰', label: '价格', value: tool.price, ok: undefined },
          { icon: '🆓', label: '免费版', value: tool.hasFree ? '✓ 有' : '✗ 无', ok: tool.hasFree },
          { icon: '🇨🇳', label: '国内可用', value: tool.cnAccess ? '✓ 是' : '✗ 需VPN', ok: tool.cnAccess },
          { icon: '🔌', label: 'API', value: tool.hasApi ? '✓ 支持' : '✗ 暂无', ok: tool.hasApi },
        ].map(item => (
          <div key={item.label} style={{ padding: '12px 8px', borderRadius: '12px', textAlign: 'center', background: 'var(--color-background-secondary)', border: '0.5px solid var(--color-border-tertiary)' }}>
            <div style={{ fontSize: '20px', marginBottom: '4px' }}>{item.icon}</div>
            <div style={{ fontSize: '10px', color: 'var(--color-text-tertiary)', marginBottom: '3px' }}>{item.label}</div>
            <div style={{ fontSize: '12px', fontWeight: 500, color: item.ok === true ? '#085041' : item.ok === false ? '#991B1B' : 'var(--color-text-primary)' }}>{item.value}</div>
          </div>
        ))}
      </div>

      {/* ── 工具简介 ── */}
      <div style={{ marginBottom: '18px', padding: '16px 20px', background: 'var(--color-background-primary)', border: '0.5px solid var(--color-border-tertiary)', borderRadius: '14px' }}>
        <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '8px' }}>📖 工具介绍</h2>
        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.75, margin: 0 }}>{tool.desc}</p>
      </div>

      {/* ── 价格方案（结构化） ── */}
      {tool.pricePlans && tool.pricePlans.length > 0 ? (
        <div style={{ marginBottom: '18px' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '12px' }}>💰 价格方案</h2>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(tool.pricePlans.length, 3)}, 1fr)`, gap: '10px' }}>
            {tool.pricePlans.map((plan: any) => (
              <div key={plan.name} style={{ padding: '16px', borderRadius: '14px', border: plan.highlight ? '2px solid #D97706' : '0.5px solid var(--color-border-tertiary)', background: plan.highlight ? '#FFFBF2' : 'var(--color-background-primary)', position: 'relative' }}>
                {plan.highlight && <div style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', background: '#D97706', color: '#fff', fontSize: '10px', fontWeight: 600, padding: '2px 10px', borderRadius: '10px', whiteSpace: 'nowrap' }}>推荐方案</div>}
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '4px' }}>{plan.name}</div>
                <div style={{ marginBottom: '10px' }}>
                  <span style={{ fontSize: '22px', fontWeight: 700, color: plan.highlight ? '#D97706' : 'var(--color-text-primary)' }}>{plan.price}</span>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>{plan.period}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  {plan.features.map((f: string) => (
                    <div key={f} style={{ fontSize: '12px', color: 'var(--color-text-secondary)', display: 'flex', gap: '5px' }}>
                      <span style={{ color: plan.highlight ? '#D97706' : '#16a34a', flexShrink: 0 }}>✓</span>
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ marginBottom: '18px', padding: '16px', background: 'var(--color-background-primary)', border: '0.5px solid var(--color-border-tertiary)', borderRadius: '14px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '8px' }}>💰 价格说明</h2>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.7, margin: 0 }}>{tool.priceDetail}</p>
        </div>
      )}

      {/* ── 优缺点 ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '18px' }}>
        <div style={{ padding: '16px', background: '#F0FDF9', border: '0.5px solid #A7F3D0', borderRadius: '14px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 600, color: '#065F46', marginBottom: '10px' }}>✓ 核心优势</h2>
          {tool.pros?.map((p: string) => (
            <div key={p} style={{ fontSize: '13px', color: '#047857', marginBottom: '7px', display: 'flex', gap: '6px', lineHeight: 1.5 }}>
              <span style={{ flexShrink: 0 }}>•</span><span>{p}</span>
            </div>
          ))}
        </div>
        <div style={{ padding: '16px', background: '#FFF7F7', border: '0.5px solid #FECACA', borderRadius: '14px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 600, color: '#991B1B', marginBottom: '10px' }}>✗ 主要限制</h2>
          {tool.cons?.map((c: string) => (
            <div key={c} style={{ fontSize: '13px', color: '#B91C1C', marginBottom: '7px', display: 'flex', gap: '6px', lineHeight: 1.5 }}>
              <span style={{ flexShrink: 0 }}>•</span><span>{c}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── 核心功能 ── */}
      {tool.features?.length > 0 && (
        <div style={{ marginBottom: '18px', padding: '16px', background: 'var(--color-background-primary)', border: '0.5px solid var(--color-border-tertiary)', borderRadius: '14px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '12px' }}>⚡ 核心功能</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {tool.features.map((f: string) => (
              <span key={f} style={{ fontSize: '12px', padding: '4px 12px', borderRadius: '20px', background: 'var(--color-background-secondary)', border: '0.5px solid var(--color-border-secondary)', color: 'var(--color-text-secondary)' }}>{f}</span>
            ))}
          </div>
        </div>
      )}

      {/* ── 适合场景 ── */}
      {tool.useCases?.length > 0 && (
        <div style={{ marginBottom: '18px', padding: '16px', background: 'var(--color-background-primary)', border: '0.5px solid var(--color-border-tertiary)', borderRadius: '14px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '10px' }}>🎯 典型使用场景</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {tool.useCases.map((u: string) => (
              <span key={u} style={{ fontSize: '12px', padding: '5px 14px', borderRadius: '20px', background: '#EFF6FF', border: '0.5px solid #BFDBFE', color: '#1E40AF', fontWeight: 500 }}>{u}</span>
            ))}
          </div>
          {tool.bestFor && <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '10px', marginBottom: 0, lineHeight: 1.6 }}>👤 最适合：{tool.bestFor}</p>}
        </div>
      )}

      {/* ── 新手教程视频 ── */}
      {tool.tutorials?.length > 0 && (
        <div style={{ marginBottom: '18px' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '12px' }}>🎬 小白入门教程</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {tool.tutorials.map((v: any, i: number) => <TutorialCard key={i} video={v} />)}
          </div>
        </div>
      )}

      <AdSlot id="ad-tool-mid" style={{ marginBottom: '20px' }} />

      {/* ── FAQ ── */}
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '14px' }}>❓ 常见问题</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {faqs.map((faq, i) => (
            <details key={i} style={{ background: 'var(--color-background-primary)', border: '0.5px solid var(--color-border-tertiary)', borderRadius: '12px', overflow: 'hidden' }}>
              <summary style={{ padding: '14px 16px', fontSize: '14px', fontWeight: 500, color: 'var(--color-text-primary)', cursor: 'pointer', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {faq.q} <span style={{ color: 'var(--color-text-tertiary)', marginLeft: '8px', flexShrink: 0 }}>▾</span>
              </summary>
              <div style={{ padding: '12px 16px 14px', fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.7, borderTop: '0.5px solid var(--color-border-tertiary)' }}>
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </div>

      {/* ── 相关工具 ── */}
      {related.length > 0 && (
        <div style={{ marginBottom: '28px' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '12px' }}>同类 {tool.category} 工具</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {related.map((t: any) => (
              <Link key={t.slug} href={`/tools/${t.slug}/`}
                style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 16px', background: 'var(--color-background-primary)', border: '0.5px solid var(--color-border-tertiary)', borderRadius: '12px', textDecoration: 'none', transition: 'border-color .15s' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = '#D97706')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--color-border-tertiary)')}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--color-background-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                  <ToolIcon slug={t.slug} emoji={t.logo} name={t.name} size={28} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-primary)' }}>{t.name}</span>
                    {t.cnAccess && <span style={{ fontSize: '10px', background: '#E1F5EE', color: '#085041', padding: '1px 5px', borderRadius: '3px' }}>国内可用</span>}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.tagline}</div>
                </div>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#D97706', flexShrink: 0 }}>★ {(t.rating || 0).toFixed(1)}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <AdSlot id="ad-tool-bottom" style={{ marginBottom: '28px' }} />

      {/* ── 用户评论 ── */}
      <CommentSection slug={tool.slug} toolName={tool.name} />

      {/* ── 对比浮层 ── */}
      {showCompare && <CompareDrawer tool={tool} onClose={() => setShowCompare(false)} />}
    </div>
  )
}
