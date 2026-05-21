'use client'
import React, { useEffect, useState } from 'react'

export default function AnalyticsPage() {
  const [data, setData] = useState<any>({ topSearches: [], topClicks: [], recentVisits: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dash/analytics')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div style={{ padding: '28px 28px 60px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1E293B', margin: 0 }}>📊 全站数据分析</h1>
        <span style={{ fontSize: 12, color: '#94A3B8' }}>数据来源：Notion Logs & Learn DB</span>
      </div>

      {data.error && (
        <div style={{ marginBottom: 20, padding: 16, background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 10, color: '#991B1B', fontSize: 14 }}>
          ⚠️ 统计数据加载失败: {data.error}。请检查环境变量配置及 Notion 数据库权限。
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24 }}>
        
        {/* 1. 热门搜索排行 */}
        <div style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #E2E8F0', overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid #E2E8F0', background: '#F8FAFC' }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>🔍 热门搜索 Top 20</span>
          </div>
          <div style={{ maxHeight: 400, overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                {loading ? (
                  <tr><td style={{ padding: 20, textAlign: 'center', color: '#94A3B8' }}>加载中…</td></tr>
                ) : (data.topSearches || []).length === 0 ? (
                  <tr><td style={{ padding: 20, textAlign: 'center', color: '#94A3B8' }}>暂无搜索记录</td></tr>
                ) : data.topSearches.map((item: any, i: number) => (
                  <tr key={i} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '10px 14px', fontSize: 13, fontWeight: 600, color: i < 3 ? '#D97706' : '#94A3B8', width: 30 }}>{i + 1}</td>
                    <td style={{ padding: '10px 14px', fontSize: 13, color: '#1E293B' }}>{item.query}</td>
                    <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#D97706' }}>{item.count}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 2. 热门工具/方案点击 */}
        <div style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #E2E8F0', overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid #E2E8F0', background: '#F8FAFC' }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>🖱️ 热门点击 Top 20</span>
          </div>
          <div style={{ maxHeight: 400, overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                {loading ? (
                  <tr><td style={{ padding: 20, textAlign: 'center', color: '#94A3B8' }}>加载中…</td></tr>
                ) : (data.topClicks || []).length === 0 ? (
                  <tr><td style={{ padding: 20, textAlign: 'center', color: '#94A3B8' }}>暂无点击记录</td></tr>
                ) : data.topClicks.map((item: any, i: number) => (
                  <tr key={i} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '10px 14px', fontSize: 13, fontWeight: 600, color: i < 3 ? '#3B82F6' : '#94A3B8', width: 30 }}>{i + 1}</td>
                    <td style={{ padding: '10px 14px', fontSize: 13, color: '#1E293B' }}>{item.target}</td>
                    <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#3B82F6' }}>{item.count}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. 最近访问动态 */}
        <div style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #E2E8F0', overflow: 'hidden', gridColumn: '1 / -1' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid #E2E8F0', background: '#F8FAFC' }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>🌐 最近访问轨迹</span>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                {['用户', '访问路径', 'IP', '时间'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', fontSize: 12, fontWeight: 600, color: '#64748B', textAlign: 'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} style={{ padding: 20, textAlign: 'center', color: '#94A3B8' }}>加载中…</td></tr>
              ) : (data.recentVisits || []).length === 0 ? (
                <tr><td colSpan={4} style={{ padding: 20, textAlign: 'center', color: '#94A3B8' }}>暂无访问记录</td></tr>
              ) : data.recentVisits.map((item: any, i: number) => (
                <tr key={i} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '10px 14px', fontSize: 13, color: '#1E293B' }}>
                    <span style={{ display: 'inline-block', padding: '2px 6px', background: item.userId === 'Guest' ? '#F1F5F9' : '#E0F2FE', color: item.userId === 'Guest' ? '#64748B' : '#0369A1', borderRadius: 4, fontSize: 11 }}>
                      {item.userId}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: 13, color: '#475569', fontFamily: 'monospace' }}>{item.path}</td>
                  <td style={{ padding: '10px 14px', fontSize: 12, color: '#94A3B8' }}>{item.ip}</td>
                  <td style={{ padding: '10px 14px', fontSize: 12, color: '#94A3B8' }}>{new Date(item.time).toLocaleString('zh-CN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  )
}
