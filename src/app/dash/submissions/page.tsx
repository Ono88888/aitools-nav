'use client'
import React, { useEffect, useState } from 'react'

interface Submission {
  id: string
  toolName: string
  url: string
  reason: string
  submitterEmail: string
  status: '待审核' | '已收录' | '已拒绝'
  submittedAt: string
}

export default function SubmissionsPage() {
  const [items, setItems] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'全部' | '待审核' | '已收录' | '已拒绝'>('待审核')
  const [msg, setMsg] = useState('')

  useEffect(() => { load() }, [filter])

  async function load() {
    setLoading(true)
    const r = await fetch(`/api/dash/submissions?filter=${filter}`).then(r => r.json())
    setItems(r.items || [])
    setLoading(false)
  }

  async function updateStatus(id: string, status: string) {
    await fetch('/api/dash/submissions', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    setMsg(`已标记为：${status}`)
    setTimeout(() => setMsg(''), 2000)
    load()
  }

  const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
    '待审核': { bg: '#FEF3C7', color: '#92400E' },
    '已收录': { bg: '#E1F5EE', color: '#085041' },
    '已拒绝': { bg: '#FFF5F5', color: '#991B1B' },
  }

  return (
    <div style={{ padding: '28px 28px 60px' }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1E293B', marginBottom: 4 }}>📬 工具收录申请</h1>
      <p style={{ fontSize: 12, color: '#94A3B8', marginBottom: 20 }}>用户通过「提交工具」页面提交的收录申请</p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {(['待审核', '已收录', '已拒绝', '全部'] as const).map(s => (
          <button key={s} onClick={() => setFilter(s)}
            style={{ padding: '5px 14px', borderRadius: 20, border: `1.5px solid ${filter === s ? '#D97706' : '#CBD5E0'}`, background: filter === s ? '#FEF3C7' : '#fff', color: filter === s ? '#92400E' : '#64748B', cursor: 'pointer', fontSize: 12, fontFamily: 'sans-serif', fontWeight: filter === s ? 600 : 400 }}>
            {s}
          </button>
        ))}
      </div>

      {msg && <div style={{ padding: '8px 14px', background: '#E1F5EE', color: '#085041', borderRadius: 8, marginBottom: 12, fontSize: 13 }}>{msg}</div>}

      <div style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #E2E8F0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F8FAFC' }}>
              {['工具名称', '官网链接', '推荐理由', '提交者邮箱', '提交时间', '状态', '操作'].map(h => (
                <th key={h} style={{ padding: '11px 14px', fontSize: 11, fontWeight: 600, color: '#64748B', textAlign: 'left', borderBottom: '1px solid #E2E8F0', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: '#94A3B8' }}>加载中…</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: '#94A3B8' }}>暂无数据</td></tr>
            ) : items.map((item, i) => {
              const ss = STATUS_STYLE[item.status] || STATUS_STYLE['待审核']
              return (
                <tr key={item.id} style={{ borderBottom: '1px solid #F1F5F9', background: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                  <td style={{ padding: '10px 14px', fontSize: 13, fontWeight: 500, color: '#1E293B' }}>{item.toolName}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <a href={item.url} target="_blank" rel="noopener" style={{ fontSize: 12, color: '#3B82F6', textDecoration: 'none', maxWidth: 200, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.url}</a>
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: 12, color: '#64748B', maxWidth: 200 }}>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.reason || '—'}</div>
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: 12, color: '#64748B' }}>{item.submitterEmail || '—'}</td>
                  <td style={{ padding: '10px 14px', fontSize: 11, color: '#94A3B8', whiteSpace: 'nowrap' }}>
                    {item.submittedAt ? new Date(item.submittedAt).toLocaleDateString('zh-CN') : '—'}
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 20, background: ss.bg, color: ss.color }}>{item.status}</span>
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ display: 'flex', gap: 5, flexWrap: 'nowrap' }}>
                      {item.status !== '已收录' && (
                        <button onClick={() => updateStatus(item.id, '已收录')}
                          style={{ fontSize: 11, padding: '4px 8px', borderRadius: 6, border: 'none', background: '#E1F5EE', color: '#085041', cursor: 'pointer', fontFamily: 'sans-serif', whiteSpace: 'nowrap' }}>✓ 收录</button>
                      )}
                      {item.status !== '已拒绝' && (
                        <button onClick={() => updateStatus(item.id, '已拒绝')}
                          style={{ fontSize: 11, padding: '4px 8px', borderRadius: 6, border: 'none', background: '#FFF5F5', color: '#EF4444', cursor: 'pointer', fontFamily: 'sans-serif', whiteSpace: 'nowrap' }}>✗ 拒绝</button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
