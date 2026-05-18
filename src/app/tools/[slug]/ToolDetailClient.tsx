'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import ToolIcon from '@/components/ToolIcon'
import { ALL_TOOLS } from '@/lib/tools-data'

// ── 广告位 ───────────────────────────────────────────────
function AdSlot({ id, style }: { id: string; style?: React.CSSProperties }) {
  return (
    <div id={id} style={{ background: 'var(--color-background-secondary)', border: '1px dashed var(--color-border-secondary)', borderRadius: '12px', padding: '16px', textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: '11px', minHeight: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', ...style }}>
      广告位 · Ad Slot
    </div>
  )
}

// ── 星级 ────────────────────────────────────────────────
function StarRating({ value, onChange, size = 20 }: { value: number; onChange?: (v: number) => void; size?: number }) {
  const [hover, setHover] = useState(0)
  return (
    <span style={{ display: 'inline-flex', gap: 1 }}>
      {[1,2,3,4,5].map(n => (
        <span key={n}
          onClick={() => onChange?.(n)}
          onMouseEnter={() => onChange && setHover(n)}
          onMouseLeave={() => onChange && setHover(0)}
          style={{ fontSize: size, lineHeight: 1, cursor: onChange ? 'pointer' : 'default', color: n <= (hover || value) ? '#D97706' : '#D1D5DB', transition: 'color .1s' }}>★</span>
      ))}
    </span>
  )
}

// ── 难度 ────────────────────────────────────────────────
const DIFF: Record<number, { label: string; color: string }> = {
  1: { label: '极简上手', color: '#16a34a' },
  2: { label: '新手友好', color: '#65a30d' },
  3: { label: '中等难度', color: '#d97706' },
  4: { label: '需要基础', color: '#ea580c' },
  5: { label: '专业级别', color: '#dc2626' },
}
function DiffDots({ level }: { level: number }) {
  const color = DIFF[level]?.color || '#d97706'
  return (
    <span style={{ display: 'inline-flex', gap: 3 }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ width: 7, height: 7, borderRadius: '50%', display: 'inline-block', background: i <= level ? color : '#D1D5DB' }} />
      ))}
    </span>
  )
}

// ─────────────────────────────────────────────────────────
// ── 评论系统（修复边框）────────────────────────────────
// ─────────────────────────────────────────────────────────
interface Comment { id: number; name: string; text: string; rating: number; date: string; helpful: number; useCase?: string }

function CommentSection({ slug, toolName }: { slug: string; toolName: string }) {
  const [comments, setComments] = useState<Comment[]>([])
  const [name, setName] = useState('')
  const [text, setText] = useState('')
  const [rating, setRating] = useState(5)
  const [useCase, setUseCase] = useState('')
  const [done, setDone] = useState(false)
  const [sortBy, setSortBy] = useState<'latest'|'helpful'|'rating'>('latest')
  const [focusedField, setFocusedField] = useState<string | null>(null)

  useEffect(() => {
    try { setComments(JSON.parse(localStorage.getItem(`wk_comments_${slug}`) || '[]')) } catch {}
  }, [slug])

  const avg = comments.length ? comments.reduce((s, c) => s + c.rating, 0) / comments.length : 0
  const dist = [5,4,3,2,1].map(r => ({ star: r, count: comments.filter(c => c.rating === r).length, pct: comments.length ? comments.filter(c => c.rating === r).length / comments.length * 100 : 0 }))
  const sorted = [...comments].sort((a, b) => sortBy === 'helpful' ? b.helpful - a.helpful : sortBy === 'rating' ? b.rating - a.rating : b.id - a.id)

  function submit() {
    if (text.trim().length < 10) return
    const c: Comment = { id: Date.now(), name: name.trim() || '匿名用户', text: text.trim(), rating, date: new Date().toLocaleDateString('zh-CN'), helpful: 0, useCase: useCase.trim() }
    const updated = [c, ...comments]
    try { localStorage.setItem(`wk_comments_${slug}`, JSON.stringify(updated.slice(0, 100))) } catch {}
    setComments(updated); setText(''); setName(''); setRating(5); setUseCase('')
    setDone(true); setTimeout(() => setDone(false), 3000)
  }

  function markHelpful(id: number) {
    const updated = comments.map(c => c.id === id ? { ...c, helpful: c.helpful + 1 } : c)
    setComments(updated)
    try { localStorage.setItem(`wk_comments_${slug}`, JSON.stringify(updated)) } catch {}
  }

  // 输入框样式：有明显边框，聚焦时变色
  const baseInp: React.CSSProperties = {
    width: '100%', padding: '9px 12px', fontSize: '13px', borderRadius: '10px',
    background: 'var(--color-background-primary)',
    color: 'var(--color-text-primary)', fontFamily: 'var(--font-sans)',
    boxSizing: 'border-box', outline: 'none', transition: 'border-color .15s',
  }
  const inp = (field: string): React.CSSProperties => ({
    ...baseInp,
    border: focusedField === field ? '1.5px solid #D97706' : '1.5px solid #CBD5E0',
  })

  return (
    <section style={{ marginTop: '40px' }}>
      <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '20px' }}>
        用户评价 {comments.length > 0 && <span style={{ fontSize: '14px', fontWeight: 400, color: 'var(--color-text-tertiary)' }}>({comments.length}条)</span>}
      </h2>

      {/* 评分总览 */}
      {comments.length > 0 && (
        <div style={{ display: 'flex', gap: '24px', padding: '20px', background: 'var(--color-background-secondary)', borderRadius: '14px', marginBottom: '16px', flexWrap: 'wrap', border: '1px solid #E2E8F0' }}>
          <div style={{ textAlign: 'center', minWidth: '70px' }}>
            <div style={{ fontSize: '42px', fontWeight: 700, color: '#D97706', lineHeight: 1 }}>{avg.toFixed(1)}</div>
            <StarRating value={Math.round(avg)} size={14} />
            <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', marginTop: 4 }}>{comments.length}人评分</div>
          </div>
          <div style={{ flex: 1, minWidth: '140px' }}>
            {dist.map(r => (
              <div key={r.star} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', width: 16, flexShrink: 0 }}>{r.star}★</span>
                <div style={{ flex: 1, height: 6, background: '#E2E8F0', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: '#D97706', borderRadius: 3, width: `${r.pct}%`, transition: 'width .6s' }} />
                </div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', width: 20, textAlign: 'right', flexShrink: 0 }}>{r.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─ 写评价表单 ─ */}
      <div style={{ background: 'var(--color-background-primary)', borderRadius: '14px', padding: '18px', marginBottom: '16px', border: '1.5px solid #CBD5E0' }}>
        <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)', margin: '0 0 14px' }}>📝 分享你的真实使用体验</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <input value={name} onChange={e => setName(e.target.value)}
              onFocus={() => setFocusedField('name')} onBlur={() => setFocusedField(null)}
              placeholder="昵称（留空=匿名）" style={{ ...inp('name'), flex: 1 }} maxLength={20} />
            <input value={useCase} onChange={e => setUseCase(e.target.value)}
              onFocus={() => setFocusedField('usecase')} onBlur={() => setFocusedField(null)}
              placeholder="你的使用场景（选填）" style={{ ...inp('usecase'), flex: 2 }} maxLength={30} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)', flexShrink: 0 }}>评分：</span>
            <StarRating value={rating} onChange={setRating} size={28} />
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#D97706' }}>{rating}.0</span>
          </div>
          <textarea value={text} onChange={e => e.target.value.length <= 500 && setText(e.target.value)}
            onFocus={() => setFocusedField('text')} onBlur={() => setFocusedField(null)}
            placeholder={`说说你使用 ${toolName} 的真实体验，至少10个字…`}
            rows={3} style={{ ...inp('text'), resize: 'vertical', minHeight: '80px' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: text.length > 0 && text.length < 10 ? '#EF4444' : 'var(--color-text-tertiary)' }}>
              {text.length}/500{text.length > 0 && text.length < 10 ? ' (至少10字)' : ''}
            </span>
            <button onClick={submit} disabled={text.length < 10} style={{ padding: '8px 22px', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 500, cursor: text.length >= 10 ? 'pointer' : 'not-allowed', background: text.length >= 10 ? '#D97706' : '#E2E8F0', color: text.length >= 10 ? '#fff' : '#94A3B8', fontFamily: 'var(--font-sans)', transition: 'all .15s' }}>
              {done ? '✓ 已发布' : '发布评价'}
            </button>
          </div>
        </div>
      </div>

      {/* 排序 */}
      {comments.length > 0 && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          {(['latest','helpful','rating'] as const).map(s => (
            <button key={s} onClick={() => setSortBy(s)} style={{ fontSize: '12px', padding: '4px 12px', borderRadius: '20px', border: `1.5px solid ${sortBy === s ? '#D97706' : '#CBD5E0'}`, background: sortBy === s ? '#FEF3C7' : 'transparent', color: sortBy === s ? '#D97706' : 'var(--color-text-tertiary)', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
              {s === 'latest' ? '最新' : s === 'helpful' ? '最有帮助' : '评分最高'}
            </button>
          ))}
        </div>
      )}

      {/* 评论列表 */}
      {comments.length === 0
        ? <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-tertiary)', fontSize: '14px', background: 'var(--color-background-secondary)', borderRadius: '14px', border: '1.5px solid #CBD5E0' }}>还没有评价，成为第一个评价 {toolName} 的用户 🎉</div>
        : <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {sorted.map(c => (
              <div key={c.id} style={{ padding: '16px', background: 'var(--color-background-primary)', border: '1.5px solid #CBD5E0', borderRadius: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#D97706', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, flexShrink: 0 }}>{c.name[0]?.toUpperCase()}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text-primary)' }}>{c.name}</span>
                      {c.useCase && <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', background: 'var(--color-background-secondary)', padding: '1px 7px', borderRadius: '4px', border: '1px solid #E2E8F0' }}>{c.useCase}</span>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                      <StarRating value={c.rating} size={12} />
                      <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>{c.date}</span>
                    </div>
                  </div>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.65, margin: '0 0 10px' }}>{c.text}</p>
                <button onClick={() => markHelpful(c.id)} style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', background: 'none', border: '1px solid #CBD5E0', borderRadius: '6px', padding: '3px 10px', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
                  👍 有用 {c.helpful > 0 && `(${c.helpful})`}
                </button>
              </div>
            ))}
          </div>
      }
    </section>
  )
}

// ─────────────────────────────────────────────────────────
// ── 工具对比（全页面，非浮层）────────────────────────────
// ─────────────────────────────────────────────────────────
// 所有对比维度
const COMPARE_METRICS = [
  { key: 'price',       label: '起步价格',  icon: '💰', render: (t: any) => t.price, highlight: () => false },
  { key: 'hasFree',     label: '免费版',    icon: '🆓', render: (t: any) => t.hasFree ? '✓ 有' : '✗ 无',        highlight: (t: any) => t.hasFree },
  { key: 'cnAccess',    label: '国内直连',  icon: '🇨🇳', render: (t: any) => t.cnAccess ? '✓ 是' : '✗ 需VPN',  highlight: (t: any) => t.cnAccess },
  { key: 'hasApi',      label: 'API支持',  icon: '🔌', render: (t: any) => t.hasApi ? '✓ 支持' : '✗ 暂无',      highlight: (t: any) => t.hasApi },
  { key: 'difficulty',  label: '上手难度',  icon: '📊', render: (t: any) => {
      const d = DIFF[t.difficulty || 2]; return d?.label || '中等'
    }, highlight: (t: any) => (t.difficulty || 2) <= 2 },
  { key: 'rating',      label: '综合评分',  icon: '⭐', render: (t: any) => t.rating > 0 ? `★ ${t.rating.toFixed(1)}` : '暂无', highlight: (t: any) => t.rating >= 4.5 },
  { key: 'pros',        label: '核心优势',  icon: '✅', render: (t: any) => (t.pros || []).slice(0,2).join('、') || '—', highlight: () => false },
  { key: 'cons',        label: '主要限制',  icon: '⚠️', render: (t: any) => (t.cons || []).slice(0,2).join('、') || '—', highlight: () => false },
  { key: 'bestFor',     label: '最适合',   icon: '👤', render: (t: any) => t.bestFor || '—', highlight: () => false },
  { key: 'category',    label: '工具分类',  icon: '🏷️', render: (t: any) => t.category || '—', highlight: () => false },
]

function ComparePanel({ tool, onClose }: { tool: any; onClose: () => void }) {
  const sameCat = ALL_TOOLS.filter(t => t.category === tool.category && t.slug !== tool.slug)
  const others  = ALL_TOOLS.filter(t => t.category !== tool.category && t.slug !== tool.slug)
  const [selected, setSelected] = useState<string[]>([])
  const [search, setSearch] = useState('')

  const candidates = search.trim()
    ? ALL_TOOLS.filter(t => t.slug !== tool.slug && (t.name.includes(search) || t.category.includes(search)))
    : sameCat

  function toggle(slug: string) {
    setSelected(prev => prev.includes(slug) ? prev.filter(s => s !== slug) : prev.length < 3 ? [...prev, slug] : prev)
  }

  const compareList = [tool, ...ALL_TOOLS.filter(t => selected.includes(t.slug))]

  const colW = `${Math.floor(100 / compareList.length)}%`

  // 每列背景色
  const colBg = (idx: number) => idx === 0 ? '#FFFBF2' : 'var(--color-background-primary)'
  const colBorder = (idx: number) => idx === 0 ? '2px solid #D97706' : '1.5px solid #CBD5E0'

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', flexDirection: 'column', background: 'var(--color-background-primary)', overflow: 'hidden' }}>

      {/* 顶部栏 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1.5px solid #CBD5E0', background: 'var(--color-background-primary)', flexShrink: 0, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>⚖️ 工具对比</h2>
          <p style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', margin: '2px 0 0' }}>以 <strong style={{ color: '#D97706' }}>{tool.name}</strong> 为基准，最多再选3个同类工具</p>
        </div>
        <button onClick={onClose} style={{ padding: '8px 16px', border: '1.5px solid #CBD5E0', borderRadius: '10px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', background: 'none', fontFamily: 'var(--font-sans)', color: 'var(--color-text-primary)' }}>✕ 关闭</button>
      </div>

      <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>

        {/* 选工具区 */}
        <div style={{ padding: '16px 20px', borderBottom: '1.5px solid #E2E8F0', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="搜索工具名称或分类…" style={{ padding: '7px 12px', fontSize: '12px', border: '1.5px solid #CBD5E0', borderRadius: '8px', background: 'var(--color-background-primary)', color: 'var(--color-text-primary)', fontFamily: 'var(--font-sans)', outline: 'none', width: 200, flexShrink: 0 }} />
            <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>已选 {selected.length}/3 个</span>
            {selected.length > 0 && <button onClick={() => setSelected([])} style={{ fontSize: '11px', color: '#EF4444', background: 'none', border: '1px solid #FECACA', borderRadius: '6px', padding: '3px 8px', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>清空选择</button>}
          </div>

          {/* 快捷分类标签 */}
          {!search && (
            <div style={{ marginBottom: 8 }}>
              <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', marginRight: 6 }}>同类：</span>
              {sameCat.slice(0, 8).map(t => {
                const sel = selected.includes(t.slug)
                return (
                  <button key={t.slug} onClick={() => toggle(t.slug)}
                    style={{ marginRight: 6, marginBottom: 6, fontSize: '12px', padding: '4px 12px', borderRadius: '20px', border: `1.5px solid ${sel ? '#D97706' : '#CBD5E0'}`, background: sel ? '#FEF3C7' : 'var(--color-background-secondary)', color: sel ? '#92400E' : 'var(--color-text-secondary)', cursor: selected.length >= 3 && !sel ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-sans)', opacity: selected.length >= 3 && !sel ? 0.5 : 1 }}>
                    {sel ? '✓ ' : ''}{t.name}
                  </button>
                )
              })}
            </div>
          )}

          {/* 搜索结果 */}
          {search && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {candidates.slice(0, 12).map(t => {
                const sel = selected.includes(t.slug)
                return (
                  <button key={t.slug} onClick={() => toggle(t.slug)}
                    style={{ fontSize: '12px', padding: '4px 12px', borderRadius: '20px', border: `1.5px solid ${sel ? '#D97706' : '#CBD5E0'}`, background: sel ? '#FEF3C7' : 'var(--color-background-secondary)', color: sel ? '#92400E' : 'var(--color-text-secondary)', cursor: selected.length >= 3 && !sel ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-sans)', opacity: selected.length >= 3 && !sel ? 0.5 : 1 }}>
                    {sel ? '✓ ' : ''}{t.name} <span style={{ color: 'var(--color-text-tertiary)', fontSize: '10px' }}>{t.category}</span>
                  </button>
                )
              })}
              {candidates.length === 0 && <span style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>未找到工具</span>}
            </div>
          )}
        </div>

        {/* ─ 对比表格 ─ */}
        {compareList.length === 1
          ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, color: 'var(--color-text-tertiary)' }}>
              <div style={{ fontSize: '48px' }}>⚖️</div>
              <p style={{ fontSize: '15px' }}>请从上方选择 1-3 个工具开始对比</p>
            </div>
          )
          : (
            <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>

              {/* 工具头部名片 */}
              <div style={{ display: 'grid', gridTemplateColumns: `140px repeat(${compareList.length}, 1fr)`, gap: '8px', marginBottom: '12px', position: 'sticky', top: 0, background: 'var(--color-background-primary)', zIndex: 10, paddingBottom: 8, borderBottom: '1.5px solid #E2E8F0' }}>
                <div />
                {compareList.map((t, idx) => (
                  <div key={t.slug} style={{ background: colBg(idx), border: colBorder(idx), borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
                    <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'var(--color-background-secondary)', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px', overflow: 'hidden' }}>
                      <ToolIcon slug={t.slug} name={t.name} size={28} />
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: idx === 0 ? '#D97706' : 'var(--color-text-primary)', marginBottom: 2 }}>{t.name}</div>
                    <div style={{ fontSize: '10px', color: 'var(--color-text-tertiary)' }}>{t.maker}</div>
                    {idx === 0 && <div style={{ fontSize: '10px', color: '#D97706', marginTop: 4, fontWeight: 600 }}>📌 当前工具</div>}
                    {idx > 0 && (
                      <button onClick={() => toggle(t.slug)} style={{ marginTop: 6, fontSize: '10px', color: '#EF4444', background: 'none', border: '1px solid #FECACA', borderRadius: '4px', padding: '2px 6px', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>移除</button>
                    )}
                  </div>
                ))}
              </div>

              {/* 维度行 */}
              {COMPARE_METRICS.map((m, mi) => (
                <div key={m.key} style={{ display: 'grid', gridTemplateColumns: `140px repeat(${compareList.length}, 1fr)`, gap: '8px', marginBottom: '6px', alignItems: 'stretch' }}>
                  {/* 维度标签 */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 8px', background: 'var(--color-background-secondary)', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                    <span style={{ fontSize: '14px' }}>{m.icon}</span>
                    <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text-secondary)' }}>{m.label}</span>
                  </div>
                  {/* 各工具数值 */}
                  {compareList.map((t, idx) => {
                    const val = m.render(t)
                    const good = m.highlight(t)
                    const isBool = m.key === 'hasFree' || m.key === 'cnAccess' || m.key === 'hasApi'
                    const isTrue = isBool && (t[m.key as keyof typeof t] === true)
                    const isFalse = isBool && (t[m.key as keyof typeof t] === false)
                    return (
                      <div key={t.slug} style={{ padding: '10px 12px', background: colBg(idx), border: colBorder(idx), borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{
                          fontSize: m.key === 'pros' || m.key === 'cons' || m.key === 'bestFor' ? '11px' : '13px',
                          fontWeight: m.key === 'rating' || m.key === 'price' ? 600 : 400,
                          color: isTrue ? '#16a34a' : isFalse ? '#dc2626' : good ? '#D97706' : 'var(--color-text-primary)',
                          textAlign: 'center', lineHeight: 1.5, wordBreak: 'break-all',
                        }}>{val}</span>
                      </div>
                    )
                  })}
                </div>
              ))}

              {/* 跳转按钮行 */}
              <div style={{ display: 'grid', gridTemplateColumns: `140px repeat(${compareList.length}, 1fr)`, gap: '8px', marginTop: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', padding: '8px', fontSize: '11px', color: 'var(--color-text-tertiary)' }}>查看详情</div>
                {compareList.map((t, idx) => (
                  <div key={t.slug} style={{ display: 'flex', gap: 6, flexDirection: 'column' }}>
                    <Link href={`/tools/${t.slug}/`} onClick={onClose} style={{ display: 'block', textAlign: 'center', fontSize: '12px', fontWeight: 500, padding: '8px', borderRadius: '8px', textDecoration: 'none', background: idx === 0 ? '#FEF3C7' : 'var(--color-background-secondary)', color: idx === 0 ? '#92400E' : 'var(--color-text-secondary)', border: `1.5px solid ${idx === 0 ? '#D97706' : '#CBD5E0'}` }}>
                      {idx === 0 ? '当前页面' : `→ ${t.name}`}
                    </Link>
                    <a href={t.affiliateUrl || t.url} target="_blank" rel="nofollow noopener" style={{ display: 'block', textAlign: 'center', fontSize: '11px', padding: '6px', borderRadius: '8px', textDecoration: 'none', background: '#D97706', color: '#fff' }}>
                      访问官网 ↗
                    </a>
                  </div>
                ))}
              </div>

            </div>
          )
        }
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// ── 教程视频卡 ───────────────────────────────────────────
// ─────────────────────────────────────────────────────────
function TutorialCard({ video }: { video: any }) {
  const isBili = video.platform === 'bilibili'
  return (
    <a href={video.url} target="_blank" rel="noopener noreferrer"
      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'var(--color-background-primary)', border: '1.5px solid #CBD5E0', borderRadius: '12px', textDecoration: 'none', transition: 'border-color .15s' }}
      onMouseEnter={e => e.currentTarget.style.borderColor = '#D97706'}
      onMouseLeave={e => e.currentTarget.style.borderColor = '#CBD5E0'}
    >
      <div style={{ width: 36, height: 36, borderRadius: '8px', background: isBili ? '#FFF0F5' : '#FFF5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 18 }}>
        {isBili ? '📺' : '▶'}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{video.title}</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: '11px', fontWeight: 500, color: isBili ? '#E0366F' : '#CC0000' }}>{isBili ? 'B站' : 'YouTube'}</span>
          {video.duration && <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>约{video.duration}</span>}
          <span style={{ fontSize: '11px', padding: '1px 6px', borderRadius: '4px', background: video.level === 'beginner' ? '#E1F5EE' : '#FEF3C7', color: video.level === 'beginner' ? '#085041' : '#92400E' }}>
            {video.level === 'beginner' ? '新手入门' : '进阶技巧'}
          </span>
        </div>
      </div>
      <span style={{ color: 'var(--color-text-tertiary)', flexShrink: 0 }}>↗</span>
    </a>
  )
}

// ─────────────────────────────────────────────────────────
// ── 主组件 ───────────────────────────────────────────────
// ─────────────────────────────────────────────────────────
interface Props { tool: any; related: any[]; faqs: { q: string; a: string }[] }

export default function ToolDetailClient({ tool, related, faqs }: Props) {
  const [showCompare, setShowCompare] = useState(false)
  const diff = DIFF[tool.difficulty || 2]

  // 锁定滚动
  useEffect(() => {
    if (showCompare) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [showCompare])

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '0 20px 80px' }}>

      {/* 面包屑 */}
      <nav style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', padding: '14px 0 16px', display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
        <Link href="/" style={{ color: 'var(--color-text-tertiary)', textDecoration: 'none' }}>GO悟空</Link>
        <span>›</span>
        <Link href="/tools/" style={{ color: 'var(--color-text-tertiary)', textDecoration: 'none' }}>工具库</Link>
        <span>›</span>
        <Link href={`/tools/?cat=${encodeURIComponent(tool.category)}`} style={{ color: 'var(--color-text-tertiary)', textDecoration: 'none' }}>{tool.category}</Link>
        <span>›</span>
        <span style={{ color: 'var(--color-text-primary)' }}>{tool.name}</span>
      </nav>

      {/* Hero */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 20 }}>
        <div style={{ width: 64, height: 64, borderRadius: '16px', background: 'var(--color-background-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden', border: '1.5px solid #CBD5E0' }}>
          <ToolIcon slug={tool.slug} name={tool.name} size={46} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>{tool.name}</h1>
            <span style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', background: 'var(--color-background-secondary)', padding: '2px 8px', borderRadius: '4px', border: '1px solid #E2E8F0' }}>{tool.maker}</span>
            {tool.cnAccess
              ? <span style={{ fontSize: '11px', background: '#E1F5EE', color: '#085041', padding: '2px 8px', borderRadius: '4px', fontWeight: 500, border: '1px solid #A7F3D0' }}>🇨🇳 国内直连</span>
              : <span style={{ fontSize: '11px', background: '#FFF3CD', color: '#92400E', padding: '2px 8px', borderRadius: '4px', fontWeight: 500, border: '1px solid #FCD34D' }}>🔒 需要梯子</span>
            }
          </div>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: '0 0 8px' }}>{tool.tagline}</p>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            {tool.rating > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <StarRating value={Math.round(tool.rating)} size={14} />
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#D97706' }}>{tool.rating.toFixed(1)}</span>
                {tool.ratingCount && <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>({tool.ratingCount})</span>}
              </div>
            )}
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '11px' }}>
              <span style={{ color: 'var(--color-text-tertiary)' }}>上手难度：</span>
              <DiffDots level={tool.difficulty || 2} />
              <span style={{ color: diff?.color, fontWeight: 600 }}>{diff?.label}</span>
            </span>
          </div>
        </div>
      </div>

      {/* 操作按钮 */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        <a href={tool.affiliateUrl || tool.url} target="_blank" rel="nofollow noopener"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 20px', background: '#D97706', color: '#fff', borderRadius: '10px', fontSize: '14px', fontWeight: 500, textDecoration: 'none' }}>
          访问官网 ↗
        </a>
        <button onClick={() => setShowCompare(true)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 16px', background: 'var(--color-background-primary)', color: 'var(--color-text-secondary)', borderRadius: '10px', fontSize: '13px', border: '1.5px solid #CBD5E0', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontWeight: 500 }}>
          ⚖️ 与同类对比
        </button>
        {tool.hasApi && (
          <a href={`${tool.affiliateUrl || tool.url}`} target="_blank" rel="nofollow noopener"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 14px', background: 'var(--color-background-secondary)', color: 'var(--color-text-secondary)', borderRadius: '10px', fontSize: '12px', border: '1.5px solid #CBD5E0', textDecoration: 'none', fontWeight: 500 }}>
            🔌 API文档
          </a>
        )}
      </div>

      <AdSlot id="ad-top" style={{ marginBottom: 20 }} />

      {/* 核心指标卡 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 20 }}>
        {[
          { icon: '💰', label: '价格',    value: tool.price },
          { icon: '🆓', label: '免费版',  value: tool.hasFree ? '✓ 有' : '✗ 无',        ok: tool.hasFree },
          { icon: '🇨🇳', label: '国内可用', value: tool.cnAccess ? '✓ 是' : '✗ 需VPN', ok: tool.cnAccess },
          { icon: '🔌', label: 'API',     value: tool.hasApi ? '✓ 支持' : '✗ 暂无',      ok: tool.hasApi },
        ].map(item => (
          <div key={item.label} style={{ padding: '12px 8px', borderRadius: '12px', textAlign: 'center', background: 'var(--color-background-secondary)', border: '1.5px solid #CBD5E0' }}>
            <div style={{ fontSize: '20px', marginBottom: 4 }}>{item.icon}</div>
            <div style={{ fontSize: '10px', color: 'var(--color-text-tertiary)', marginBottom: 3 }}>{item.label}</div>
            <div style={{ fontSize: '12px', fontWeight: 500, color: (item as any).ok === true ? '#085041' : (item as any).ok === false ? '#991B1B' : 'var(--color-text-primary)' }}>{item.value}</div>
          </div>
        ))}
      </div>

      {/* 工具介绍 */}
      <div style={{ marginBottom: 16, padding: '16px 20px', background: 'var(--color-background-primary)', border: '1.5px solid #CBD5E0', borderRadius: '14px' }}>
        <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 8 }}>📖 工具介绍</h2>
        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.75, margin: 0 }}>{tool.desc}</p>
      </div>

      {/* 价格方案 */}
      {tool.pricePlans?.length > 0 ? (
        <div style={{ marginBottom: 16 }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 12 }}>💰 价格方案</h2>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(tool.pricePlans.length, 3)},1fr)`, gap: 10 }}>
            {tool.pricePlans.map((plan: any) => (
              <div key={plan.name} style={{ padding: '16px', borderRadius: '14px', border: plan.highlight ? '2px solid #D97706' : '1.5px solid #CBD5E0', background: plan.highlight ? '#FFFBF2' : 'var(--color-background-primary)', position: 'relative' }}>
                {plan.highlight && <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', background: '#D97706', color: '#fff', fontSize: '10px', fontWeight: 600, padding: '2px 10px', borderRadius: '10px', whiteSpace: 'nowrap' }}>推荐方案</div>}
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 4 }}>{plan.name}</div>
                <div style={{ marginBottom: 10 }}>
                  <span style={{ fontSize: '22px', fontWeight: 700, color: plan.highlight ? '#D97706' : 'var(--color-text-primary)' }}>{plan.price}</span>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>{plan.period}</span>
                </div>
                {plan.features.map((f: string) => (
                  <div key={f} style={{ fontSize: '12px', color: 'var(--color-text-secondary)', display: 'flex', gap: 5, marginBottom: 5 }}>
                    <span style={{ color: plan.highlight ? '#D97706' : '#16a34a', flexShrink: 0 }}>✓</span><span>{f}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ marginBottom: 16, padding: '16px', background: 'var(--color-background-primary)', border: '1.5px solid #CBD5E0', borderRadius: '14px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 8 }}>💰 价格说明</h2>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.7, margin: 0 }}>{tool.priceDetail}</p>
        </div>
      )}

      {/* 优缺点 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        <div style={{ padding: '16px', background: '#F0FDF9', border: '1.5px solid #6EE7B7', borderRadius: '14px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 600, color: '#065F46', marginBottom: 10 }}>✓ 核心优势</h2>
          {tool.pros?.map((p: string) => <div key={p} style={{ fontSize: '13px', color: '#047857', marginBottom: 7, display: 'flex', gap: 6, lineHeight: 1.5 }}><span style={{ flexShrink: 0 }}>•</span><span>{p}</span></div>)}
        </div>
        <div style={{ padding: '16px', background: '#FFF7F7', border: '1.5px solid #FCA5A5', borderRadius: '14px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 600, color: '#991B1B', marginBottom: 10 }}>✗ 主要限制</h2>
          {tool.cons?.map((c: string) => <div key={c} style={{ fontSize: '13px', color: '#B91C1C', marginBottom: 7, display: 'flex', gap: 6, lineHeight: 1.5 }}><span style={{ flexShrink: 0 }}>•</span><span>{c}</span></div>)}
        </div>
      </div>

      {/* 核心功能 */}
      {tool.features?.length > 0 && (
        <div style={{ marginBottom: 16, padding: '16px', background: 'var(--color-background-primary)', border: '1.5px solid #CBD5E0', borderRadius: '14px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 12 }}>⚡ 核心功能</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {tool.features.map((f: string) => <span key={f} style={{ fontSize: '12px', padding: '4px 12px', borderRadius: '20px', background: 'var(--color-background-secondary)', border: '1px solid #CBD5E0', color: 'var(--color-text-secondary)' }}>{f}</span>)}
          </div>
        </div>
      )}

      {/* 使用场景 */}
      {tool.useCases?.length > 0 && (
        <div style={{ marginBottom: 16, padding: '16px', background: 'var(--color-background-primary)', border: '1.5px solid #CBD5E0', borderRadius: '14px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 10 }}>🎯 典型使用场景</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
            {tool.useCases.map((u: string) => <span key={u} style={{ fontSize: '12px', padding: '5px 14px', borderRadius: '20px', background: '#EFF6FF', border: '1px solid #BFDBFE', color: '#1E40AF', fontWeight: 500 }}>{u}</span>)}
          </div>
          {tool.bestFor && <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.6 }}>👤 最适合：{tool.bestFor}</p>}
        </div>
      )}

      {/* 教程视频 */}
      {tool.tutorials?.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 12 }}>🎬 小白入门教程</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {tool.tutorials.map((v: any, i: number) => <TutorialCard key={i} video={v} />)}
          </div>
        </div>
      )}

      <AdSlot id="ad-mid" style={{ marginBottom: 20 }} />

      {/* FAQ */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 14 }}>❓ 常见问题</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {faqs.map((faq, i) => (
            <details key={i} style={{ background: 'var(--color-background-primary)', border: '1.5px solid #CBD5E0', borderRadius: '12px', overflow: 'hidden' }}>
              <summary style={{ padding: '14px 16px', fontSize: '14px', fontWeight: 500, color: 'var(--color-text-primary)', cursor: 'pointer', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {faq.q}<span style={{ color: 'var(--color-text-tertiary)', marginLeft: 8, flexShrink: 0 }}>▾</span>
              </summary>
              <div style={{ padding: '12px 16px 14px', fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.7, borderTop: '1px solid #E2E8F0' }}>{faq.a}</div>
            </details>
          ))}
        </div>
      </div>

      {/* 同类工具 */}
      {related.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 12 }}>同类 {tool.category} 工具</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {related.map((t: any) => (
              <Link key={t.slug} href={`/tools/${t.slug}/`}
                style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', background: 'var(--color-background-primary)', border: '1.5px solid #CBD5E0', borderRadius: '12px', textDecoration: 'none', transition: 'border-color .15s' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = '#D97706')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = '#CBD5E0')}>
                <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'var(--color-background-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden', border: '1px solid #E2E8F0' }}>
                  <ToolIcon slug={t.slug} name={t.name} size={28} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-primary)' }}>{t.name}</span>
                    {t.cnAccess && <span style={{ fontSize: '10px', background: '#E1F5EE', color: '#085041', padding: '1px 5px', borderRadius: '3px' }}>国内可用</span>}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.tagline}</div>
                </div>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#D97706', flexShrink: 0 }}>★ {(t.rating||0).toFixed(1)}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <AdSlot id="ad-bottom" style={{ marginBottom: 28 }} />

      {/* 评论 */}
      <CommentSection slug={tool.slug} toolName={tool.name} />

      {/* 对比全屏 */}
      {showCompare && <ComparePanel tool={tool} onClose={() => setShowCompare(false)} />}
    </div>
  )
}
