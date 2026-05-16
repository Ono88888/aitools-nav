'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import ToolIcon from '@/components/ToolIcon'

function AdSlot({ id, style }: { id: string; style?: React.CSSProperties }) {
  return (
    <div id={id} style={{
      background: 'var(--color-background-secondary)',
      border: '1px dashed var(--color-border-secondary)',
      borderRadius: '12px', padding: '16px', textAlign: 'center',
      color: 'var(--color-text-tertiary)', fontSize: '11px',
      minHeight: '60px', display: 'flex', alignItems: 'center',
      justifyContent: 'center', ...style,
    }}>
      <span>广告位 · Ad Slot</span>
    </div>
  )
}

function StarRating({ value, onChange, size = 24 }: {
  value: number; onChange?: (v: number) => void; size?: number
}) {
  const [hover, setHover] = useState(0)
  return (
    <div style={{ display: 'flex', gap: '2px' }}>
      {[1,2,3,4,5].map(n => (
        <span key={n}
          onClick={() => onChange?.(n)}
          onMouseEnter={() => onChange && setHover(n)}
          onMouseLeave={() => onChange && setHover(0)}
          style={{ fontSize: size, cursor: onChange ? 'pointer' : 'default', color: n <= (hover || value) ? '#D97706' : '#D1D5DB', transition: 'color .1s', lineHeight: 1 }}>
          ★
        </span>
      ))}
    </div>
  )
}

interface Comment { id: number; name: string; text: string; rating: number; date: string; helpful: number }

function CommentSection({ slug, toolName }: { slug: string; toolName: string }) {
  const [comments, setComments] = useState<Comment[]>([])
  const [name, setName] = useState('')
  const [text, setText] = useState('')
  const [rating, setRating] = useState(5)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(`wk_comments_${slug}`) || '[]')
      setComments(saved)
    } catch {}
  }, [slug])

  const userAvg = comments.length > 0
    ? comments.reduce((s, c) => s + c.rating, 0) / comments.length : 0

  function submit() {
    if (!text.trim() || text.length < 10) return
    setSubmitting(true)
    const c: Comment = {
      id: Date.now(), name: name.trim() || '匿名用户',
      text: text.trim(), rating,
      date: new Date().toLocaleDateString('zh-CN'), helpful: 0,
    }
    const updated = [c, ...comments]
    try { localStorage.setItem(`wk_comments_${slug}`, JSON.stringify(updated.slice(0, 100))) } catch {}
    setComments(updated)
    setText(''); setName(''); setRating(5)
    setSubmitting(false); setDone(true)
    setTimeout(() => setDone(false), 3000)
  }

  function markHelpful(id: number) {
    const updated = comments.map(c => c.id === id ? { ...c, helpful: c.helpful + 1 } : c)
    setComments(updated)
    try { localStorage.setItem(`wk_comments_${slug}`, JSON.stringify(updated)) } catch {}
  }

  const inp: React.CSSProperties = {
    width: '100%', padding: '9px 12px', fontSize: '13px',
    border: '1px solid var(--color-border-secondary)',
    borderRadius: '10px', background: 'var(--color-background-primary)',
    color: 'var(--color-text-primary)', outline: 'none',
    fontFamily: 'var(--font-sans)', boxSizing: 'border-box',
  }

  return (
    <div style={{ marginTop: '40px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>
          用户评价
          {comments.length > 0 && <span style={{ fontSize: '14px', fontWeight: 400, color: 'var(--color-text-tertiary)', marginLeft: '8px' }}>（{comments.length} 条）</span>}
        </h2>
        {userAvg > 0 && (
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '22px', fontWeight: 700, color: '#D97706' }}>★ {userAvg.toFixed(1)}</div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>本站用户评分</div>
          </div>
        )}
      </div>

      <div style={{ background: 'var(--color-background-secondary)', borderRadius: '14px', padding: '18px', marginBottom: '20px', border: '0.5px solid var(--color-border-tertiary)' }}>
        <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: '14px' }}>
          📝 写下你的真实体验
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="你的昵称（留空显示匿名）" style={inp} maxLength={20} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)', flexShrink: 0 }}>打分：</span>
            <StarRating value={rating} onChange={setRating} size={28} />
            <span style={{ fontSize: '13px', color: '#D97706', fontWeight: 600 }}>{rating}.0 / 5.0</span>
          </div>
          <textarea
            value={text}
            onChange={e => { if (e.target.value.length <= 500) setText(e.target.value) }}
            placeholder={`说说你使用 ${toolName} 的真实体验，至少10个字...`}
            rows={3} maxLength={500}
            style={{ ...inp, resize: 'vertical', minHeight: '80px' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: text.length < 10 ? '#EF4444' : 'var(--color-text-tertiary)' }}>
              {text.length}/500{text.length < 10 && text.length > 0 ? '（至少10字）' : ''}
            </span>
            <button onClick={submit} disabled={text.length < 10 || submitting}
              style={{ padding: '8px 22px', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 500, cursor: text.length >= 10 ? 'pointer' : 'not-allowed', background: text.length >= 10 ? '#D97706' : 'var(--color-background-primary)', color: text.length >= 10 ? '#fff' : 'var(--color-text-tertiary)', fontFamily: 'var(--font-sans)', transition: 'all .15s' }}>
              {done ? '✓ 已发布' : submitting ? '发布中...' : '发布评价'}
            </button>
          </div>
        </div>
      </div>

      {comments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-tertiary)', fontSize: '14px', background: 'var(--color-background-secondary)', borderRadius: '14px' }}>
          还没有评价，成为第一个评价 {toolName} 的用户 🎉
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {comments.map(c => (
            <div key={c.id} style={{ padding: '16px', background: 'var(--color-background-primary)', border: '0.5px solid var(--color-border-tertiary)', borderRadius: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#D97706', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, flexShrink: 0 }}>
                    {c.name[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text-primary)' }}>{c.name}</div>
                    <StarRating value={c.rating} size={14} />
                  </div>
                </div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', flexShrink: 0 }}>{c.date}</span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.7, margin: '0 0 10px' }}>{c.text}</p>
              <button onClick={() => markHelpful(c.id)} style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', background: 'none', border: '0.5px solid var(--color-border-tertiary)', borderRadius: '6px', padding: '3px 10px', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
                👍 有用 {c.helpful > 0 && `(${c.helpful})`}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function ToolDetailClient({ tool, related, faqs }: {
  tool: any; related: any[]; faqs: { q: string; a: string }[]
}) {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '28px 20px 80px' }}>

      <nav style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '5px' }}>
        <Link href="/" style={{ color: 'var(--color-text-tertiary)', textDecoration: 'none' }}>GO悟空</Link>
        <span>›</span>
        <Link href="/tools/" style={{ color: 'var(--color-text-tertiary)', textDecoration: 'none' }}>工具库</Link>
        <span>›</span>
        <span style={{ color: 'var(--color-text-primary)' }}>{tool.name}</span>
      </nav>

      <div style={{ display: 'flex', gap: '18px', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div style={{ width: '72px', height: '72px', borderRadius: '18px', background: 'var(--color-background-secondary)', border: '0.5px solid var(--color-border-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
          <ToolIcon slug={tool.slug} emoji={tool.logo} name={tool.name} size={44} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '5px' }}>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '26px', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>{tool.name}</h1>
            <span style={{ fontSize: '11px', padding: '2px 9px', borderRadius: '6px', background: 'var(--color-background-secondary)', color: 'var(--color-text-tertiary)' }}>{tool.category}</span>
            {tool.rating > 0 && <span style={{ fontSize: '15px', fontWeight: 700, color: '#D97706' }}>★ {tool.rating.toFixed(1)}</span>}
          </div>
          <p style={{ fontSize: '13px', color: 'var(--color-text-tertiary)', marginBottom: '8px' }}>by {tool.maker}</p>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.65, margin: 0 }}>{tool.tagline}</p>
        </div>
      </div>

      <AdSlot id="ad-tool-top" style={{ marginBottom: '20px' }} />

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
            <div style={{ fontSize: '12px', fontWeight: 500, color: item.ok === true ? '#085041' : item.ok === false ? '#991B1B' : 'var(--color-text-primary)' }}>
              {item.value}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: '18px', padding: '16px', background: 'var(--color-background-primary)', border: '0.5px solid var(--color-border-tertiary)', borderRadius: '14px' }}>
        <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '8px' }}>💰 价格说明</h2>
        <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.7, margin: 0 }}>{tool.priceDetail}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '18px' }}>
        <div style={{ padding: '16px', background: '#F0FDF9', border: '0.5px solid #A7F3D0', borderRadius: '14px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 600, color: '#065F46', marginBottom: '10px' }}>✓ 优点</h2>
          {tool.pros?.map((p: string) => (
            <div key={p} style={{ fontSize: '13px', color: '#047857', marginBottom: '6px', display: 'flex', gap: '6px' }}>
              <span style={{ flexShrink: 0 }}>•</span><span>{p}</span>
            </div>
          ))}
        </div>
        <div style={{ padding: '16px', background: '#FFF7F7', border: '0.5px solid #FECACA', borderRadius: '14px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 600, color: '#991B1B', marginBottom: '10px' }}>✗ 缺点</h2>
          {tool.cons?.map((c: string) => (
            <div key={c} style={{ fontSize: '13px', color: '#B91C1C', marginBottom: '6px', display: 'flex', gap: '6px' }}>
              <span style={{ flexShrink: 0 }}>•</span><span>{c}</span>
            </div>
          ))}
        </div>
      </div>

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

      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', padding: '20px', background: '#FFFBF2', border: '1px solid #FDE68A', borderRadius: '16px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: '14px', fontWeight: 500, color: '#92400E', margin: '0 0 4px' }}>准备好了？前往 {tool.name} 官网</p>
          <p style={{ fontSize: '12px', color: '#B45309', margin: 0 }}>将在新标签页打开 · 与本站无关联</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <a href={tool.url} target="_blank" rel="nofollow noopener"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 22px', background: '#D97706', color: '#fff', borderRadius: '12px', fontSize: '14px', fontWeight: 500, textDecoration: 'none' }}>
            访问官网 ↗
          </a>
          <Link href={`/compare/?a=${tool.slug}`}
            style={{ display: 'inline-flex', alignItems: 'center', padding: '10px 16px', background: 'var(--color-background-primary)', color: 'var(--color-text-secondary)', borderRadius: '12px', fontSize: '13px', textDecoration: 'none', border: '0.5px solid var(--color-border-secondary)' }}>
            与其他工具对比
          </Link>
        </div>
      </div>

      <AdSlot id="ad-tool-mid" style={{ marginBottom: '24px' }} />

      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '14px' }}>常见问题 FAQ</h2>
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

      {related.length > 0 && (
        <div style={{ marginBottom: '28px' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '12px' }}>
            同类 {tool.category} 工具推荐
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {related.map(t => (
              <Link key={t.slug} href={`/tools/${t.slug}/`} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 16px', background: 'var(--color-background-primary)', border: '0.5px solid var(--color-border-tertiary)', borderRadius: '12px', textDecoration: 'none' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--color-background-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                  <ToolIcon slug={t.slug} emoji={t.logo} name={t.name} size={28} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-primary)' }}>{t.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>{t.tagline}</div>
                </div>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#D97706', flexShrink: 0 }}>★ {t.rating.toFixed(1)}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <AdSlot id="ad-tool-bottom" style={{ marginBottom: '28px' }} />
      <CommentSection slug={tool.slug} toolName={tool.name} />
    </div>
  )
}
