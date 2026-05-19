'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { ALL_TOOLS } from '@/lib/tools-data'
import ToolIcon from '@/components/ToolIcon'

export default function DashToolsPage() {
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('全部')
  const [msg, setMsg] = useState('')

  const cats = ['全部', ...Array.from(new Set(ALL_TOOLS.map(t => t.category)))]
  const filtered = ALL_TOOLS.filter(t => {
    const matchCat = catFilter === '全部' || t.category === catFilter
    const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.slug.includes(search)
    return matchCat && matchSearch
  })

  function copySlug(slug: string) {
    navigator.clipboard.writeText(slug).then(() => { setMsg(`已复制 slug: ${slug}`); setTimeout(() => setMsg(''), 2000) })
  }

  return (
    <div style={{ padding: '28px 28px 60px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1E293B', marginBottom: 4 }}>🔧 工具管理</h1>
          <p style={{ fontSize: 12, color: '#94A3B8' }}>共 {ALL_TOOLS.length} 个工具 · 新增工具需修改 <code style={{ background: '#F1F5F9', padding: '1px 5px', borderRadius: 4 }}>src/lib/tools-data.ts</code></p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <a href="https://github.com/Ono88888/aitools-nav/edit/master/src/lib/tools-data.ts" target="_blank" rel="noopener"
            style={{ padding: '9px 16px', background: '#1E293B', color: '#fff', borderRadius: 10, fontSize: 12, fontWeight: 500, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
            ✏️ 在 GitHub 编辑
          </a>
        </div>
      </div>

      {msg && <div style={{ padding: '8px 14px', background: '#E1F5EE', color: '#085041', borderRadius: 8, marginBottom: 12, fontSize: 13 }}>{msg}</div>}

      {/* 搜索 + 分类筛选 */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索工具名称 / slug..."
          style={{ padding: '8px 12px', fontSize: 13, border: '1.5px solid #CBD5E0', borderRadius: 10, outline: 'none', width: 220, fontFamily: 'sans-serif' }} />
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {cats.map(c => (
            <button key={c} onClick={() => setCatFilter(c)}
              style={{ padding: '5px 12px', borderRadius: 20, border: `1.5px solid ${catFilter === c ? '#D97706' : '#CBD5E0'}`, background: catFilter === c ? '#FEF3C7' : '#fff', color: catFilter === c ? '#92400E' : '#64748B', cursor: 'pointer', fontSize: 11, fontWeight: catFilter === c ? 600 : 400, fontFamily: 'sans-serif' }}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* 工具表格 */}
      <div style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #E2E8F0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F8FAFC' }}>
              {['Logo','工具名','分类','价格','免费版','国内可用','API','评分','操作'].map(h => (
                <th key={h} style={{ padding: '11px 14px', fontSize: 11, fontWeight: 600, color: '#64748B', textAlign: 'left', borderBottom: '1px solid #E2E8F0', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((tool, i) => (
              <tr key={tool.slug} style={{ borderBottom: '1px solid #F1F5F9', background: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                <td style={{ padding: '10px 14px' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    <ToolIcon slug={tool.slug} name={tool.name} size={24} />
                  </div>
                </td>
                <td style={{ padding: '10px 14px' }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#1E293B' }}>{tool.name}</div>
                  <div style={{ fontSize: 10, color: '#94A3B8', fontFamily: 'monospace', cursor: 'pointer' }} onClick={() => copySlug(tool.slug)}>{tool.slug} 📋</div>
                </td>
                <td style={{ padding: '10px 14px', fontSize: 12, color: '#64748B' }}>{tool.category}</td>
                <td style={{ padding: '10px 14px', fontSize: 12, color: '#1E293B' }}>{tool.price}</td>
                <td style={{ padding: '10px 14px', fontSize: 12 }}>
                  <span style={{ color: tool.hasFree ? '#16a34a' : '#dc2626' }}>{tool.hasFree ? '✓' : '✗'}</span>
                </td>
                <td style={{ padding: '10px 14px', fontSize: 12 }}>
                  <span style={{ color: tool.cnAccess ? '#16a34a' : '#dc2626' }}>{tool.cnAccess ? '✓' : '✗'}</span>
                </td>
                <td style={{ padding: '10px 14px', fontSize: 12 }}>
                  <span style={{ color: tool.hasApi ? '#16a34a' : '#dc2626' }}>{tool.hasApi ? '✓' : '✗'}</span>
                </td>
                <td style={{ padding: '10px 14px', fontSize: 12, fontWeight: 600, color: '#D97706' }}>
                  {tool.rating > 0 ? `★ ${tool.rating.toFixed(1)}` : '—'}
                </td>
                <td style={{ padding: '10px 14px' }}>
                  <Link href={`/tools/${tool.slug}/`} target="_blank"
                    style={{ fontSize: 11, padding: '4px 10px', borderRadius: 6, border: '1px solid #CBD5E0', color: '#475569', textDecoration: 'none', background: '#F8FAFC', whiteSpace: 'nowrap' }}>
                    查看详情 →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 新增说明 */}
      <div style={{ marginTop: 20, background: '#F0FDF9', border: '1px solid #6EE7B7', borderRadius: 12, padding: '14px 18px' }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#065F46', margin: '0 0 8px' }}>➕ 如何新增工具</p>
        <p style={{ fontSize: 12, color: '#047857', margin: 0, lineHeight: 1.8 }}>
          1. 点击上方「在 GitHub 编辑」按钮打开 tools-data.ts<br/>
          2. 在 <code style={{ background: '#D1FAE5', padding: '1px 5px', borderRadius: 3 }}>ALL_TOOLS</code> 数组末尾添加新工具对象（参考现有格式）<br/>
          3. 同时在 <code style={{ background: '#D1FAE5', padding: '1px 5px', borderRadius: 3 }}>src/components/ToolIcon.tsx</code> 的 DOMAIN 对象里加入官网域名<br/>
          4. 提交 commit 后 Cloudflare 自动重新部署
        </p>
      </div>
    </div>
  )
}
