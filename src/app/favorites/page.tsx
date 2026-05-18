'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import ToolIcon from '@/components/ToolIcon'

// ── 星级 ────────────────────────────────────────────────────
function Stars({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  const [hover, setHover] = useState(0)
  return (
    <span style={{ display: 'inline-flex', gap: 1 }}>
      {[1,2,3,4,5].map(n => (
        <span key={n}
          onClick={() => onChange?.(n)}
          onMouseEnter={() => onChange && setHover(n)}
          onMouseLeave={() => onChange && setHover(0)}
          style={{ fontSize: 20, cursor: onChange ? 'pointer' : 'default', color: n <= (hover || value) ? '#D97706' : '#D1D5DB', lineHeight: 1 }}>★</span>
      ))}
    </span>
  )
}

// ── 工具组合卡片 ────────────────────────────────────────────
function FavCard({ fav, onDelete, onUpdate }: { fav: any; onDelete: () => void; onUpdate: (rating: number, suggestion: string) => void }) {
  const [rating, setRating] = useState(fav.rating || 0)
  const [suggestion, setSuggestion] = useState(fav.suggestion || '')
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const combo = fav.comboData || {}

  async function save() {
    setSaving(true)
    await fetch('/api/favorites', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ favoriteId: fav.id, rating, suggestion }),
    })
    setSaving(false); setSaved(true); setEditing(false)
    onUpdate(rating, suggestion)
    setTimeout(() => setSaved(false), 2000)
  }

  const TIER: Record<string, { label: string; bg: string; color: string }> = {
    free: { label: '全免费', bg: '#E1F5EE', color: '#085041' },
    mid:  { label: '性价比', bg: '#FEF3C7', color: '#92400E' },
    pro:  { label: '专业版', bg: '#EDE9FE', color: '#4C1D95' },
  }
  const t = TIER[combo.tier || 'mid'] || TIER.mid

  return (
    <div style={{ background: 'var(--color-background-primary)', border: '1.5px solid #CBD5E0', borderRadius: '16px', overflow: 'hidden', marginBottom: 16 }}>
      {/* 卡头 */}
      <div style={{ padding: '16px 18px 12px', borderBottom: '1px solid #E2E8F0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '20px', background: t.bg, color: t.color }}>{t.label}</span>
              {fav.scene && <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', background: 'var(--color-background-secondary)', padding: '2px 7px', borderRadius: '4px' }}>{fav.scene}</span>}
            </div>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-primary)', margin: '0 0 4px' }}>{fav.comboName}</h3>
            {combo.tagline && <p style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', margin: 0 }}>{combo.tagline}</p>}
          </div>
          <button onClick={onDelete} style={{ fontSize: '11px', color: '#EF4444', background: 'none', border: '1px solid #FECACA', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer', flexShrink: 0, fontFamily: 'var(--font-sans)' }}>取消收藏</button>
        </div>
      </div>

      {/* 步骤工具预览 */}
      {combo.steps?.length > 0 && (
        <div style={{ padding: '12px 18px', borderBottom: '1px solid #E2E8F0', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {combo.steps.map((step: any, si: number) => (
            step.tools?.map((tool: any, ti: number) => (
              <div key={`${si}-${ti}`} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--color-background-secondary)', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '5px 10px' }}>
                <div style={{ width: 20, height: 20, borderRadius: 4, overflow: 'hidden', flexShrink: 0 }}>
                  <ToolIcon slug={tool.slug || ''} name={tool.name || ''} size={20} />
                </div>
                <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text-primary)' }}>{tool.name}</span>
                <span style={{ fontSize: '10px', color: 'var(--color-text-tertiary)' }}>{tool.price}</span>
              </div>
            ))
          ))}
        </div>
      )}

      {/* 评分 & 建议区 */}
      <div style={{ padding: '14px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
          <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)', flexShrink: 0 }}>我的评分：</span>
          <Stars value={rating} onChange={v => { setRating(v); setEditing(true) }} />
          {rating > 0 && <span style={{ fontSize: '13px', fontWeight: 600, color: '#D97706' }}>{rating}.0</span>}
        </div>
        {(editing || suggestion) && (
          <textarea
            value={suggestion}
            onChange={e => { setSuggestion(e.target.value.slice(0, 300)); setEditing(true) }}
            placeholder="对这套工具组合有什么建议？（最多300字）"
            rows={2}
            style={{ width: '100%', padding: '8px 12px', fontSize: '13px', border: `1.5px solid ${editing ? '#D97706' : '#CBD5E0'}`, borderRadius: '8px', background: 'var(--color-background-primary)', color: 'var(--color-text-primary)', fontFamily: 'var(--font-sans)', resize: 'vertical', outline: 'none', boxSizing: 'border-box', marginBottom: 8 }}
          />
        )}
        {!editing && !suggestion && (
          <button onClick={() => setEditing(true)} style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', background: 'none', border: '1px dashed #CBD5E0', borderRadius: '6px', padding: '4px 12px', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
            ＋ 写点建议
          </button>
        )}
        {editing && (
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={save} disabled={saving} style={{ fontSize: '12px', padding: '6px 16px', borderRadius: '8px', border: 'none', background: '#D97706', color: '#fff', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontWeight: 500 }}>
              {saved ? '✓ 已保存' : saving ? '保存中…' : '保存'}
            </button>
            <button onClick={() => { setEditing(false); setRating(fav.rating || 0); setSuggestion(fav.suggestion || '') }} style={{ fontSize: '12px', padding: '6px 12px', borderRadius: '8px', border: '1px solid #CBD5E0', background: 'none', color: 'var(--color-text-tertiary)', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>取消</button>
          </div>
        )}
        <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', marginTop: 8 }}>
          收藏于 {fav.createdAt ? new Date(fav.createdAt).toLocaleDateString('zh-CN') : '—'}
        </div>
      </div>

      {/* 跳转按钮 */}
      {combo.steps && (
        <div style={{ padding: '0 18px 14px' }}>
          <Link href={`/combos/custom/${fav.comboId}/`} style={{ fontSize: '12px', color: '#D97706', fontWeight: 500, textDecoration: 'none' }}>查看完整工作流 →</Link>
        </div>
      )}
    </div>
  )
}

// ── 主页面 ───────────────────────────────────────────────────
export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(data => {
      if (data?.user) {
        setIsLoggedIn(true)
        fetch('/api/favorites').then(r => r.json()).then(d => {
          setFavorites(d.favorites || [])
          setLoading(false)
        })
      } else {
        setIsLoggedIn(false)
        setLoading(false)
      }
    })
  }, [])

  function deleteFav(id: string) {
    fetch(`/api/favorites?id=${id}`, { method: 'DELETE' }).then(() => {
      setFavorites(prev => prev.filter(f => f.id !== id))
    })
  }

  function updateFav(id: string, rating: number, suggestion: string) {
    setFavorites(prev => prev.map(f => f.id === id ? { ...f, rating, suggestion } : f))
  }

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '24px 20px 80px' }}>
      <nav style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginBottom: 20, display: 'flex', gap: 6 }}>
        <Link href="/" style={{ color: 'var(--color-text-tertiary)', textDecoration: 'none' }}>GO悟空</Link>
        <span>›</span><span style={{ color: 'var(--color-text-primary)' }}>我的收藏</span>
      </nav>

      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 6 }}>⭐ 我的收藏</h1>
      <p style={{ fontSize: '13px', color: 'var(--color-text-tertiary)', marginBottom: 24 }}>收藏喜欢的工具组合，给它们评分和写建议</p>

      {!isLoggedIn && !loading && (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--color-background-secondary)', borderRadius: '16px', border: '1.5px dashed #CBD5E0' }}>
          <div style={{ fontSize: '48px', marginBottom: 12 }}>🔐</div>
          <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', marginBottom: 16 }}>登录后才能收藏工具组合</p>
          <Link href="/" style={{ padding: '10px 24px', background: '#D97706', color: '#fff', borderRadius: '10px', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>去登录</Link>
        </div>
      )}

      {isLoggedIn && loading && (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--color-text-tertiary)' }}>加载中…</div>
      )}

      {isLoggedIn && !loading && favorites.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--color-background-secondary)', borderRadius: '16px', border: '1.5px dashed #CBD5E0' }}>
          <div style={{ fontSize: '48px', marginBottom: 12 }}>📭</div>
          <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', marginBottom: 16 }}>还没有收藏，去搜索工具组合吧</p>
          <Link href="/" style={{ padding: '10px 24px', background: '#D97706', color: '#fff', borderRadius: '10px', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>去搜索推荐</Link>
        </div>
      )}

      {isLoggedIn && favorites.length > 0 && (
        <div>
          <div style={{ fontSize: '13px', color: 'var(--color-text-tertiary)', marginBottom: 16 }}>共 {favorites.length} 个收藏</div>
          {favorites.map(fav => (
            <FavCard key={fav.id} fav={fav}
              onDelete={() => deleteFav(fav.id)}
              onUpdate={(r, s) => updateFav(fav.id, r, s)} />
          ))}
        </div>
      )}
    </div>
  )
}
