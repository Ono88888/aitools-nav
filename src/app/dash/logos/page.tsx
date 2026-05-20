'use client'
import React, { useState, useRef } from 'react'
import { ALL_TOOLS } from '@/lib/tools-data'

// ── 工具Logo展示和管理 ───────────────────────────────────
// Logo优先级：1.上传的本地文件 2.URL链接 3.Google Favicon 4.品牌色首字母

interface LogoEntry {
  slug: string
  name: string
  category: string
  localFile: string | null     // public/logos/下的文件名
  customUrl: string            // 自定义URL
  logo: string                 // emoji备用
}

function LogoPreview({ slug, name, customUrl, size = 48 }: { slug: string; name: string; customUrl?: string; size?: number }) {
  const [src, setSrc] = useState(() => {
    if (customUrl) return customUrl
    return `https://www.google.com/s2/favicons?domain=${slug}.com&sz=64`
  })
  const [failed, setFailed] = useState(false)

  if (failed) {
    const colors: Record<string, string> = {
      chatgpt:'#10A37F', claude:'#D97706', gemini:'#4285F4', deepseek:'#1E3A5F',
      doubao:'#2D5BE3', kimi:'#1A1A2E', midjourney:'#000', cursor:'#000',
    }
    const bg = colors[slug] || '#64748B'
    return (
      <div style={{ width: size, height: size, borderRadius: size * 0.2, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: size * 0.4, flexShrink: 0 }}>
        {name[0]?.toUpperCase()}
      </div>
    )
  }

  return (
    <img src={src} alt={name} width={size} height={size}
      style={{ width: size, height: size, objectFit: 'contain', borderRadius: size * 0.2 }}
      onError={() => setFailed(true)} />
  )
}

function LogoEditor({ tool, onClose, onSave }: { tool: LogoEntry; onClose: () => void; onSave: (slug: string, url: string, file?: File) => void }) {
  const [urlInput, setUrlInput] = useState(tool.customUrl || '')
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [tab, setTab] = useState<'url' | 'upload'>('url')
  const fileRef = useRef<HTMLInputElement>(null)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  function save() {
    const file = fileRef.current?.files?.[0]
    if (tab === 'upload' && file) {
      onSave(tool.slug, '', file)
    } else {
      onSave(tool.slug, urlInput)
    }
    onClose()
  }

  const inp: React.CSSProperties = { width: '100%', padding: '9px 12px', fontSize: 13, border: '1.5px solid #CBD5E0', borderRadius: 10, outline: 'none', fontFamily: 'sans-serif', boxSizing: 'border-box', background: '#fff', color: '#1E293B' }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: '#fff', borderRadius: 18, padding: '24px 28px', width: 'min(92vw, 500px)', boxShadow: '0 16px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1E293B', margin: 0 }}>编辑 Logo：{tool.name}</h3>
          <button onClick={onClose} style={{ background: '#F1F5F9', border: 'none', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: 13, color: '#64748B' }}>✕</button>
        </div>

        {/* 当前Logo预览 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px', background: '#F8FAFC', borderRadius: 12, marginBottom: 18 }}>
          <LogoPreview slug={tool.slug} name={tool.name} customUrl={preview || urlInput || tool.customUrl} size={56} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#1E293B' }}>{tool.name}</div>
            <div style={{ fontSize: 11, color: '#94A3B8', fontFamily: 'monospace' }}>{tool.slug}</div>
            <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>{tool.category}</div>
          </div>
        </div>

        {/* Tab 切换 */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
          {[{ k: 'url', l: '🔗 URL链接' }, { k: 'upload', l: '📁 上传文件' }].map(({ k, l }) => (
            <button key={k} onClick={() => setTab(k as any)}
              style={{ flex: 1, padding: '8px', borderRadius: 10, border: `1.5px solid ${tab === k ? '#D97706' : '#CBD5E0'}`, background: tab === k ? '#FEF3C7' : '#fff', color: tab === k ? '#92400E' : '#64748B', cursor: 'pointer', fontSize: 12, fontWeight: tab === k ? 600 : 400, fontFamily: 'sans-serif' }}>
              {l}
            </button>
          ))}
        </div>

        {tab === 'url' ? (
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6, display: 'block' }}>Logo 图片 URL</label>
            <input value={urlInput} onChange={e => setUrlInput(e.target.value)} placeholder="https://example.com/logo.png" style={inp} />
            <p style={{ fontSize: 11, color: '#94A3B8', marginTop: 6 }}>支持任意图片URL，建议使用工具官网的高清Logo图片</p>
          </div>
        ) : (
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6, display: 'block' }}>上传 Logo 文件</label>
            <div style={{ border: '2px dashed #CBD5E0', borderRadius: 12, padding: '24px', textAlign: 'center', cursor: 'pointer', background: '#F8FAFC' }}
              onClick={() => fileRef.current?.click()}>
              {preview ? (
                <img src={preview} alt="预览" style={{ width: 64, height: 64, objectFit: 'contain', borderRadius: 12, margin: '0 auto', display: 'block' }} />
              ) : (
                <>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>📁</div>
                  <div style={{ fontSize: 13, color: '#64748B' }}>点击选择 PNG/SVG/ICO 文件</div>
                  <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 4 }}>建议 64×64px 以上，文件将自动命名为 {tool.slug}.png</div>
                </>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*,.svg,.ico" onChange={handleFile} style={{ display: 'none' }} />

            {preview && (
              <div style={{ marginTop: 12, padding: '10px 14px', background: '#FEF3C7', borderRadius: 8, border: '1px solid #FCD34D' }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#92400E', margin: '0 0 6px' }}>📋 上传步骤</p>
                <p style={{ fontSize: 11, color: '#78350F', margin: 0, lineHeight: 1.7 }}>
                  1. 点击「保存」记录Logo设置<br/>
                  2. 将文件手动复制到：<code style={{ background: '#FEF9C3', padding: '1px 4px', borderRadius: 3 }}>public/logos/{tool.slug}.png</code><br/>
                  3. git commit 推送后 Cloudflare 自动部署生效
                </p>
              </div>
            )}
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '10px', background: '#F1F5F9', border: 'none', borderRadius: 10, fontSize: 13, cursor: 'pointer', color: '#64748B', fontFamily: 'sans-serif' }}>取消</button>
          <button onClick={save} style={{ flex: 2, padding: '10px', background: '#D97706', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#fff', fontFamily: 'sans-serif' }}>✓ 保存</button>
        </div>
      </div>
    </div>
  )
}

export default function LogosPage() {
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('全部')
  const [editing, setEditing] = useState<LogoEntry | null>(null)
  const [logoUrls, setLogoUrls] = useState<Record<string, string>>({})
  const [msg, setMsg] = useState('')

  // 从localStorage读取自定义logo URL
  React.useEffect(() => {
    try { setLogoUrls(JSON.parse(localStorage.getItem('wk_logo_urls') || '{}')) } catch {}
  }, [])

  const cats = ['全部', ...Array.from(new Set(ALL_TOOLS.map(t => t.category)))]
  const filtered = ALL_TOOLS.filter(t =>
    (catFilter === '全部' || t.category === catFilter) &&
    (!search || t.name.toLowerCase().includes(search.toLowerCase()) || t.slug.includes(search.toLowerCase()))
  )

  function saveLogoUrl(slug: string, url: string, file?: File) {
    if (url) {
      const updated = { ...logoUrls, [slug]: url }
      setLogoUrls(updated)
      localStorage.setItem('wk_logo_urls', JSON.stringify(updated))
      setMsg(`✓ ${slug} 的 Logo URL 已保存`)
    } else if (file) {
      setMsg(`✓ 文件已选择。请手动复制到 public/logos/${slug}.${file.name.split('.').pop()}`)
    }
    setTimeout(() => setMsg(''), 4000)
  }

  function clearLogoUrl(slug: string) {
    const updated = { ...logoUrls }
    delete updated[slug]
    setLogoUrls(updated)
    localStorage.setItem('wk_logo_urls', JSON.stringify(updated))
    setMsg(`已清除 ${slug} 的自定义 Logo`)
    setTimeout(() => setMsg(''), 2000)
  }

  return (
    <div style={{ padding: '28px 28px 60px' }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1E293B', marginBottom: 4 }}>🖼️ Logo 管理</h1>
      <p style={{ fontSize: 12, color: '#94A3B8', marginBottom: 16 }}>为每个工具设置 Logo。点击工具卡片进入编辑，支持URL链接或文件上传。</p>

      {msg && <div style={{ padding: '10px 14px', background: '#E1F5EE', color: '#085041', borderRadius: 10, marginBottom: 14, fontSize: 13, border: '1px solid #A7F3D0' }}>{msg}</div>}

      {/* Logo优先级说明 */}
      <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 12, padding: '12px 16px', marginBottom: 20 }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: '#1D4ED8', margin: '0 0 4px' }}>📐 Logo 显示优先级</p>
        <p style={{ fontSize: 11, color: '#1E40AF', margin: 0, lineHeight: 1.7 }}>
          1️⃣ <strong>本地文件</strong>（public/logos/slug.png）→ 2️⃣ <strong>自定义URL</strong>（在此页面设置）→ 3️⃣ <strong>Google Favicon</strong>（自动抓取官网Logo）→ 4️⃣ <strong>品牌色首字母</strong>（兜底）
        </p>
      </div>

      {/* 搜索和筛选 */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索工具名称或 slug..."
          style={{ padding: '8px 12px', fontSize: 13, border: '1.5px solid #CBD5E0', borderRadius: 10, outline: 'none', width: 220, fontFamily: 'sans-serif', background: '#fff', color: '#1E293B' }} />
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          {cats.slice(0, 8).map(c => (
            <button key={c} onClick={() => setCatFilter(c)}
              style={{ padding: '4px 10px', borderRadius: 20, border: `1.5px solid ${catFilter === c ? '#D97706' : '#CBD5E0'}`, background: catFilter === c ? '#FEF3C7' : '#fff', color: catFilter === c ? '#92400E' : '#64748B', cursor: 'pointer', fontSize: 11, fontFamily: 'sans-serif' }}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* 工具Logo网格 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 12 }}>
        {filtered.map(tool => {
          const hasCustom = !!logoUrls[tool.slug]
          return (
            <div key={tool.slug} style={{ background: '#fff', border: `1.5px solid ${hasCustom ? '#D97706' : '#E2E8F0'}`, borderRadius: 14, padding: '14px 10px 10px', textAlign: 'center', cursor: 'pointer', transition: 'border-color .15s, transform .1s', position: 'relative' }}
              onClick={() => setEditing({ slug: tool.slug, name: tool.name, category: tool.category, localFile: null, customUrl: logoUrls[tool.slug] || '', logo: tool.logo })}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#D97706'; e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = hasCustom ? '#D97706' : '#E2E8F0'; e.currentTarget.style.transform = 'none' }}>

              {hasCustom && (
                <div style={{ position: 'absolute', top: 6, right: 6, width: 16, height: 16, borderRadius: '50%', background: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 9, color: '#fff', fontWeight: 700 }}>✓</span>
                </div>
              )}

              <div style={{ width: 48, height: 48, borderRadius: 12, background: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px', overflow: 'hidden' }}>
                <LogoPreview slug={tool.slug} name={tool.name} customUrl={logoUrls[tool.slug]} size={40} />
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#1E293B', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tool.name}</div>
              <div style={{ fontSize: 10, color: '#94A3B8', fontFamily: 'monospace', marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tool.slug}</div>

              <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 20, background: '#EFF6FF', color: '#1D4ED8' }}>✏️ 编辑</span>
                {hasCustom && (
                  <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 20, background: '#FFF5F5', color: '#EF4444', cursor: 'pointer' }}
                    onClick={e => { e.stopPropagation(); clearLogoUrl(tool.slug) }}>✕ 清除</span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <p style={{ fontSize: 11, color: '#94A3B8', marginTop: 20, textAlign: 'center' }}>
        共 {filtered.length} 个工具 · 橙色边框表示已设置自定义Logo · 点击任意工具卡片可编辑Logo
      </p>

      {editing && <LogoEditor tool={editing} onClose={() => setEditing(null)} onSave={saveLogoUrl} />}
    </div>
  )
}
