'use client'
import React, { useEffect, useState } from 'react'

export default function LearnPage() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const r = await fetch('/api/dash/learn').then(r => r.json())
    setItems(r.items || [])
    setLoading(false)
  }

  async function approve(id: string) {
    await fetch('/api/dash/learn', { method: 'PATCH', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ id, approved: true }) })
    setMsg('已审核通过，词条将在10分钟内生效'); setTimeout(() => setMsg(''), 3000)
    load()
  }

  async function reject(id: string) {
    await fetch(`/api/dash/learn?id=${id}`, { method: 'DELETE' })
    setMsg('已删除'); setTimeout(() => setMsg(''), 1500)
    load()
  }

  const SCENE_COLOR: Record<string,string> = { video:'#EFF6FF', wechat:'#F0FDF9', ecommerce:'#FFFBEB', dev:'#EDE9FE', legal:'#FFF5F5', writing:'#F0FDF4' }

  return (
    <div style={{ padding: '28px 28px 60px' }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1E293B', marginBottom: 4 }}>🧠 AI 学习词库审核</h1>
      <p style={{ fontSize: 12, color: '#94A3B8', marginBottom: 20 }}>用户搜索命中的新词条，审核通过后自动纳入本地词库，下次无需调用API</p>

      {msg && <div style={{ padding: '8px 14px', background: '#E1F5EE', color: '#085041', borderRadius: 8, marginBottom: 12, fontSize: 13 }}>{msg}</div>}

      <div style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #E2E8F0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F8FAFC' }}>
              {['原始搜索词','识别场景','提取关键词','来源','命中次数','操作'].map(h => (
                <th key={h} style={{ padding: '11px 14px', fontSize: 12, fontWeight: 600, color: '#64748B', textAlign: 'left', borderBottom: '1px solid #E2E8F0' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: '#94A3B8' }}>加载中…</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: '#94A3B8' }}>暂无待审核词条</td></tr>
            ) : items.map((item: any, i: number) => (
              <tr key={item.id} style={{ borderBottom: '1px solid #F1F5F9', background: i%2===0?'#fff':'#FAFAFA' }}>
                <td style={{ padding: '10px 14px', fontSize: 13, color: '#1E293B', maxWidth: 200 }}>{item.originalQuery}</td>
                <td style={{ padding: '10px 14px' }}>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 4, background: SCENE_COLOR[item.scene] || '#F1F5F9', color: '#374151' }}>{item.scene}</span>
                </td>
                <td style={{ padding: '10px 14px', fontSize: 12, color: '#3B82F6' }}>{item.keywords}</td>
                <td style={{ padding: '10px 14px', fontSize: 11, color: '#94A3B8' }}>{item.source}</td>
                <td style={{ padding: '10px 14px', fontSize: 14, fontWeight: 700, color: '#D97706' }}>{item.hitCount || 1}</td>
                <td style={{ padding: '10px 14px', display: 'flex', gap: 6 }}>
                  <button onClick={() => approve(item.id)} style={{ fontSize: 12, padding: '4px 12px', borderRadius: 6, border: 'none', background: '#E1F5EE', color: '#085041', cursor: 'pointer', fontWeight: 600 }}>✓ 通过</button>
                  <button onClick={() => reject(item.id)} style={{ fontSize: 12, padding: '4px 10px', borderRadius: 6, border: '1px solid #FECACA', background: '#FFF5F5', color: '#EF4444', cursor: 'pointer' }}>✗ 删除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
