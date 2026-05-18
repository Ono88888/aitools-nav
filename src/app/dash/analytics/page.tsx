'use client'
import React, { useEffect, useState } from 'react'

export default function AnalyticsPage() {
  const [data, setData] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dash/analytics').then(r => r.json()).then(d => { setData(d); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  function Row({ rank, item }: { rank: number; item: any }) {
    const max = data.topSearches?.[0]?.count || 1
    return (
      <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
        <td style={{ padding: '10px 14px', fontSize: 13, fontWeight: 600, color: rank <= 3 ? '#D97706' : '#94A3B8', width: 40 }}>#{rank}</td>
        <td style={{ padding: '10px 14px', fontSize: 13, color: '#1E293B', fontWeight: 500 }}>{item.query}</td>
        <td style={{ padding: '10px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 120, height: 6, background: '#F1F5F9', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: '#D97706', borderRadius: 3, width: `${(item.count/max)*100}%` }} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#D97706' }}>{item.count}</span>
          </div>
        </td>
        <td style={{ padding: '10px 14px', fontSize: 11, color: '#94A3B8' }}>{item.scene}</td>
        <td style={{ padding: '10px 14px', fontSize: 11, color: '#94A3B8' }}>{item.lastAt ? new Date(item.lastAt).toLocaleDateString('zh-CN') : ''}</td>
      </tr>
    )
  }

  return (
    <div style={{ padding: '28px 28px 60px' }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1E293B', marginBottom: 20 }}>📈 搜索热度排行</h1>

      {/* 热词表格 */}
      <div style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #E2E8F0', overflow: 'hidden' }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>🔍 热门搜索词 Top 50</span>
          <span style={{ fontSize: 12, color: '#94A3B8' }}>数据来自 Notion 学习库</span>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F8FAFC' }}>
              {['排名','搜索词','搜索次数','识别场景','最近时间'].map(h => (
                <th key={h} style={{ padding: '11px 14px', fontSize: 12, fontWeight: 600, color: '#64748B', textAlign: 'left', borderBottom: '1px solid #E2E8F0' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ padding: 40, textAlign: 'center', color: '#94A3B8' }}>加载中…</td></tr>
            ) : (data.topSearches || []).map((item: any, i: number) => <Row key={item.query} rank={i+1} item={item} />)}
          </tbody>
        </table>
      </div>
    </div>
  )
}
