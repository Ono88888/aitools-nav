'use client'
import React, { useState } from 'react'
import ToolIcon from '@/components/ToolIcon'
import { ALL_TOOLS } from '@/lib/tools-data'

export default function LogosPage() {
  const [search, setSearch] = useState('')
  const [uploaded, setUploaded] = useState<Record<string, boolean>>({})

  const filtered = ALL_TOOLS.filter(t =>
    !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.slug.includes(search)
  )

  return (
    <div style={{ padding: '28px 28px 60px' }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1E293B', marginBottom: 4 }}>🖼️ Logo 管理</h1>
      <p style={{ fontSize: 12, color: '#94A3B8', marginBottom: 20 }}>
        管理工具 Logo 图片。Logo 存放在 <code style={{ background: '#F1F5F9', padding: '1px 6px', borderRadius: 4 }}>public/logos/</code> 目录，
        文件名格式为 <code style={{ background: '#F1F5F9', padding: '1px 6px', borderRadius: 4 }}>slug.png</code>（或 .svg/.ico）
      </p>

      {/* 上传说明 */}
      <div style={{ background: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: 12, padding: '14px 18px', marginBottom: 20 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#92400E', margin: '0 0 6px' }}>📋 上传方式</p>
        <p style={{ fontSize: 12, color: '#78350F', margin: 0, lineHeight: 1.7 }}>
          1. 准备 PNG/SVG/ICO 格式的工具 Logo（建议 64×64px 以上）<br/>
          2. 文件名改为 <strong>工具slug.png</strong>，例如：chatgpt.png、claude.png<br/>
          3. 上传到 GitHub 仓库的 <strong>public/logos/</strong> 目录<br/>
          4. 推送后 Cloudflare 自动重新部署即可生效
        </p>
      </div>

      <input
        value={search} onChange={e => setSearch(e.target.value)}
        placeholder="搜索工具名称或 slug..."
        style={{ width: '100%', maxWidth: 300, padding: '8px 12px', fontSize: 13, border: '1.5px solid #CBD5E0', borderRadius: 10, outline: 'none', marginBottom: 16, boxSizing: 'border-box', fontFamily: 'sans-serif' }}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
        {filtered.map(tool => (
          <div key={tool.slug} style={{ background: '#fff', border: '1.5px solid #E2E8F0', borderRadius: 12, padding: '14px 10px', textAlign: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px', overflow: 'hidden' }}>
              <ToolIcon slug={tool.slug} name={tool.name} size={36} />
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#1E293B', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tool.name}</div>
            <div style={{ fontSize: 10, color: '#94A3B8', fontFamily: 'monospace' }}>{tool.slug}</div>
          </div>
        ))}
      </div>

      <p style={{ fontSize: 12, color: '#94A3B8', marginTop: 20 }}>共 {filtered.length} 个工具 · Logo 自动降级：本地文件 → Google Favicon CDN → 品牌色首字母</p>
    </div>
  )
}
