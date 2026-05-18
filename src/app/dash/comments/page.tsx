'use client'
import React, { useEffect, useState } from 'react'

export default function CommentsPage() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all'|'pending'|'starred'>('pending')
  const [msg, setMsg] = useState('')

  useEffect(() => { load() }, [filter])

  async function load() {
    setLoading(true)
    const r = await fetch(`/api/dash/comments?filter=${filter}`).then(r => r.json())
    setItems(r.items || [])
    setLoading(false)
  }

  async function action(id: string, act: string) {
    await fetch('/api/dash/comments', { method: 'PATCH', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ id, action: act }) })
    setMsg(`操作成功`); setTimeout(() => setMsg(''), 1500)
    load()
  }

  const stars = (n: number) => '★'.repeat(n) + '☆'.repeat(5-n)

  return (
    <div style={{ padding: '28px 28px 60px' }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1E293B', marginBottom: 4 }}>💬 用户评论 & 建议</h1>
      <p style={{ fontSize: 12, color: '#94A3B8', marginBottom: 20 }}>用户对工具组合的评分和建议，帮助你改进推荐质量</p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {[['all','全部'],['pending','待处理'],['starred','已标星']].map(([k,l]) => (
          <button key={k} onClick={() => setFilter(k as any)}
            style={{ padding: '6px 16px', borderRadius: 20, border: `1.5px solid ${filter===k?'#D97706':'#CBD5E0'}`, background: filter===k?'#FEF3C7':'#fff', color: filter===k?'#92400E':'#64748B', cursor: 'pointer', fontSize: 12, fontWeight: filter===k?600:400 }}>{l}</button>
        ))}
      </div>

      {msg && <div style={{ padding: '8px 14px', background: '#E1F5EE', color: '#085041', borderRadius: 8, marginBottom: 12, fontSize: 13 }}>{msg}</div>}

      {loading ? <div style={{ padding: 40, textAlign: 'center', color: '#94A3B8' }}>加载中…</div> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {items.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: '#94A3B8', background: '#fff', borderRadius: 14 }}>暂无数据</div>}
          {items.map((item: any) => (
            <div key={item.id} style={{ background: '#fff', borderRadius: 14, padding: '16px 18px', border: '1.5px solid #E2E8F0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 10 }}>
                <div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#1E293B' }}>{item.comboName || '工具组合'}</span>
                    {item.scene && <span style={{ fontSize: 11, background: '#FEF3C7', color: '#92400E', padding: '1px 7px', borderRadius: 4 }}>{item.scene}</span>}
                    {item.rating > 0 && <span style={{ fontSize: 13, color: '#D97706', fontWeight: 600 }}>{stars(item.rating)} {item.rating}.0</span>}
                  </div>
                  <div style={{ fontSize: 11, color: '#94A3B8' }}>用户ID: {item.userId?.slice(0,8)}… · {item.createdAt ? new Date(item.createdAt).toLocaleDateString('zh-CN') : ''}</div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button onClick={() => action(item.id, 'star')} style={{ fontSize: 12, padding: '4px 10px', borderRadius: 6, border: '1px solid #CBD5E0', cursor: 'pointer', background: '#fff' }}>⭐ 标星</button>
                  <button onClick={() => action(item.id, 'dismiss')} style={{ fontSize: 12, padding: '4px 10px', borderRadius: 6, border: '1px solid #FECACA', background: '#FFF5F5', color: '#EF4444', cursor: 'pointer' }}>忽略</button>
                </div>
              </div>
              {item.suggestion && <p style={{ fontSize: 13, color: '#374151', background: '#F8FAFC', borderRadius: 8, padding: '10px 12px', margin: 0, lineHeight: 1.65, borderLeft: '3px solid #D97706' }}>{item.suggestion}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
