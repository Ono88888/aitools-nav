'use client'
import React, { useState, useRef } from 'react'
import Link from 'next/link'
import ToolIcon from '@/components/ToolIcon'
import { ALL_TOOLS } from '@/lib/tools-data'

// ── 默认空工具模板 ────────────────────────────────────────
const EMPTY_TOOL = {
  slug: '', name: '', maker: '', logo: '🤖', category: 'AI对话',
  tagline: '', desc: '', price: '免费', priceDetail: '免费使用',
  hasFree: true, hasApi: false, cnAccess: true, difficulty: 2, rating: 4.0, ratingCount: 0,
  url: '', affiliateUrl: '',
  tags: [] as string[], features: [] as string[], pros: [] as string[], cons: [] as string[],
  bestFor: '', useCases: [] as string[], compareWith: [] as string[],
}

const CATEGORIES = ['AI对话', 'AI搜索', 'AI编程', 'AI绘画', '视频工具', '音频工具', 'PPT工具', '电商工具', '知识管理', '内容工具', '开发工具', '自动化']
const NET_OPTS = [{ v: true, l: '🇨🇳 国内直连' }, { v: false, l: '🔒 需要梯子' }]

// ── 生成 tools-data.ts 文件内容 ──────────────────────────
function generateToolsDataTS(tools: typeof ALL_TOOLS): string {
  const toolsJson = tools.map(t => `  {
    slug: ${JSON.stringify(t.slug)}, name: ${JSON.stringify(t.name)}, maker: ${JSON.stringify(t.maker)}, logo: ${JSON.stringify(t.logo)},
    category: ${JSON.stringify(t.category)}, tagline: ${JSON.stringify(t.tagline)},
    desc: ${JSON.stringify(t.desc)},
    price: ${JSON.stringify(t.price)}, priceDetail: ${JSON.stringify(t.priceDetail)},
    hasFree: ${t.hasFree}, hasApi: ${t.hasApi}, cnAccess: ${t.cnAccess}, difficulty: ${t.difficulty ?? 2}, rating: ${t.rating}, ratingCount: ${t.ratingCount ?? 0},
    url: ${JSON.stringify(t.url || '')},${t.affiliateUrl ? `\n    affiliateUrl: ${JSON.stringify(t.affiliateUrl)},` : ''}
    tags: ${JSON.stringify(t.tags || [])},
    features: ${JSON.stringify(t.features || [])},
    pros: ${JSON.stringify(t.pros || [])},
    cons: ${JSON.stringify(t.cons || [])},
    bestFor: ${JSON.stringify(t.bestFor || '')},${(t as any).useCases?.length ? `\n    useCases: ${JSON.stringify((t as any).useCases)},` : ''}${(t as any).compareWith?.length ? `\n    compareWith: ${JSON.stringify((t as any).compareWith)},` : ''}
  }`).join(',\n')

  return `// ── 完整AI工具数据库 ── 由 GO悟空后台 自动生成 ──────────────────────────
// 最后更新: ${new Date().toLocaleString('zh-CN')}

export interface PricePlanSimple {
  name: string; price: string; period: string; features: string[]; highlight?: boolean
}
export interface TutorialVideo {
  title: string; url: string; platform: 'bilibili' | 'youtube'; duration?: string; level: 'beginner' | 'advanced'
}
export interface Tool {
  slug: string; name: string; maker: string; logo: string; category: string; tagline: string; desc: string
  price: string; priceDetail: string; pricePlans?: PricePlanSimple[]
  hasFree: boolean; hasApi: boolean; cnAccess: boolean; difficulty?: 1|2|3|4|5
  rating: number; ratingCount?: number; url: string; affiliateUrl?: string
  tags: string[]; features: string[]; pros: string[]; cons: string[]; bestFor: string
  tutorials?: TutorialVideo[]; useCases?: string[]; compareWith?: string[]
}

export const ALL_TOOLS: Tool[] = [
${toolsJson}
]

export function getAllCategories(): string[] {
  return [...new Set(ALL_TOOLS.map(t => t.category))]
}
export function getToolBySlug(slug: string): Tool | undefined {
  return ALL_TOOLS.find(t => t.slug === slug)
}
export function searchTools(query: string): Tool[] {
  const q = query.toLowerCase()
  return ALL_TOOLS.filter(t =>
    t.name.toLowerCase().includes(q) || t.tagline.toLowerCase().includes(q) ||
    t.tags.some(tag => tag.toLowerCase().includes(q)) || t.category.toLowerCase().includes(q)
  )
}
`
}

function downloadFile(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

// ── 工具编辑弹窗 ─────────────────────────────────────────
function ToolEditor({ tool, onSave, onClose }: { tool: any; onSave: (t: any) => void; onClose: () => void }) {
  const [form, setForm] = useState({ ...EMPTY_TOOL, ...tool })
  const [tagInput, setTagInput] = useState('')
  const [featInput, setFeatInput] = useState('')
  const [proInput, setProInput] = useState('')
  const [conInput, setConInput] = useState('')

  const F = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((p: any) => ({ ...p, [field]: e.target.value }))
  const FB = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p: any) => ({ ...p, [field]: e.target.checked }))
  const FN = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p: any) => ({ ...p, [field]: Number(e.target.value) }))

  function addTag(field: string, val: string, setVal: (s: string) => void) {
    if (!val.trim()) return
    setForm((p: any) => ({ ...p, [field]: [...(p[field] || []), val.trim()] }))
    setVal('')
  }
  function removeTag(field: string, idx: number) {
    setForm((p: any) => ({ ...p, [field]: (p[field] || []).filter((_: any, i: number) => i !== idx) }))
  }

  const inp: React.CSSProperties = { width: '100%', padding: '8px 11px', fontSize: 13, border: '1.5px solid #CBD5E0', borderRadius: 8, outline: 'none', fontFamily: 'sans-serif', boxSizing: 'border-box', background: '#fff', color: '#1E293B' }
  const label: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4, display: 'block' }

  function TagsInput({ field, value, placeholder, inputVal, setInputVal }: any) {
    return (
      <div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 6 }}>
          {(value || []).map((v: string, i: number) => (
            <span key={i} style={{ fontSize: 11, padding: '2px 8px', background: '#EFF6FF', color: '#1D4ED8', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 4 }}>
              {v}
              <button onClick={() => removeTag(field, i)} style={{ background: 'none', border: 'none', color: '#93C5FD', cursor: 'pointer', padding: 0, fontSize: 12, lineHeight: 1 }}>×</button>
            </span>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <input value={inputVal} onChange={e => setInputVal(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag(field, inputVal, setInputVal))}
            placeholder={placeholder} style={{ ...inp, flex: 1 }} />
          <button onClick={() => addTag(field, inputVal, setInputVal)} style={{ padding: '7px 12px', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 8, cursor: 'pointer', fontSize: 12, color: '#1D4ED8', fontFamily: 'sans-serif', whiteSpace: 'nowrap' }}>+ 添加</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: '#fff', borderRadius: 18, width: 'min(92vw, 680px)', maxHeight: '90vh', overflow: 'auto', padding: '24px 28px', boxShadow: '0 16px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1E293B', margin: 0 }}>{tool.slug ? `编辑：${tool.name}` : '新增工具'}</h2>
          <button onClick={onClose} style={{ background: '#F1F5F9', border: 'none', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: 13, color: '#64748B' }}>✕ 关闭</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {/* 基本信息 */}
          <div>
            <label style={label}>Slug（唯一标识）<span style={{ color: '#EF4444' }}>*</span></label>
            <input value={form.slug} onChange={F('slug')} placeholder="如：chatgpt" style={inp} />
          </div>
          <div>
            <label style={label}>工具名称 <span style={{ color: '#EF4444' }}>*</span></label>
            <input value={form.name} onChange={F('name')} placeholder="如：ChatGPT" style={inp} />
          </div>
          <div>
            <label style={label}>开发商</label>
            <input value={form.maker} onChange={F('maker')} placeholder="如：OpenAI" style={inp} />
          </div>
          <div>
            <label style={label}>图标 Emoji</label>
            <input value={form.logo} onChange={F('logo')} placeholder="💬" style={{ ...inp, fontSize: 20 }} />
          </div>
          <div>
            <label style={label}>分类</label>
            <select value={form.category} onChange={F('category')} style={inp}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={label}>网络访问</label>
            <select value={form.cnAccess ? 'true' : 'false'} onChange={e => setForm((p: any) => ({ ...p, cnAccess: e.target.value === 'true' }))} style={inp}>
              {NET_OPTS.map(o => <option key={String(o.v)} value={String(o.v)}>{o.l}</option>)}
            </select>
          </div>
        </div>

        <div style={{ marginTop: 14 }}>
          <label style={label}>一句话描述</label>
          <input value={form.tagline} onChange={F('tagline')} placeholder="最好用的AI助手，支持多模态" style={inp} />
        </div>
        <div style={{ marginTop: 14 }}>
          <label style={label}>详细介绍</label>
          <textarea value={form.desc} onChange={F('desc')} rows={3} placeholder="工具的详细介绍..." style={{ ...inp, resize: 'vertical' }} />
        </div>
        <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div>
            <label style={label}>价格标签</label>
            <input value={form.price} onChange={F('price')} placeholder="免费 / $20/月 / ¥99/月" style={inp} />
          </div>
          <div>
            <label style={label}>官网 URL</label>
            <input value={form.url} onChange={F('url')} placeholder="https://..." style={inp} />
          </div>
          <div>
            <label style={label}>价格详情</label>
            <input value={form.priceDetail} onChange={F('priceDetail')} placeholder="免费版基础功能，Pro版$20/月" style={inp} />
          </div>
          <div>
            <label style={label}>联盟链接（可选）</label>
            <input value={form.affiliateUrl || ''} onChange={F('affiliateUrl')} placeholder="https://..." style={inp} />
          </div>
        </div>

        <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer', padding: '8px', background: '#F8FAFC', borderRadius: 8, border: '1px solid #E2E8F0' }}>
            <input type="checkbox" checked={form.hasFree} onChange={FB('hasFree')} /> 有免费版
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer', padding: '8px', background: '#F8FAFC', borderRadius: 8, border: '1px solid #E2E8F0' }}>
            <input type="checkbox" checked={form.hasApi} onChange={FB('hasApi')} /> 支持API
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <label style={label}>评分</label>
            <input type="number" min={0} max={5} step={0.1} value={form.rating} onChange={FN('rating')} style={inp} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <label style={label}>难度(1-5)</label>
            <input type="number" min={1} max={5} value={form.difficulty} onChange={FN('difficulty')} style={inp} />
          </div>
        </div>

        <div style={{ marginTop: 14 }}>
          <label style={label}>适合人群</label>
          <input value={form.bestFor} onChange={F('bestFor')} placeholder="如：程序员、自媒体创作者" style={inp} />
        </div>

        <div style={{ marginTop: 14 }}>
          <label style={label}>标签（回车添加）</label>
          <TagsInput field="tags" value={form.tags} placeholder="如：免费、国内可用" inputVal={tagInput} setInputVal={setTagInput} />
        </div>
        <div style={{ marginTop: 14 }}>
          <label style={label}>核心功能（回车添加）</label>
          <TagsInput field="features" value={form.features} placeholder="如：多模态对话" inputVal={featInput} setInputVal={setFeatInput} />
        </div>
        <div style={{ marginTop: 14 }}>
          <label style={label}>核心优势（回车添加）</label>
          <TagsInput field="pros" value={form.pros} placeholder="如：完全免费" inputVal={proInput} setInputVal={setProInput} />
        </div>
        <div style={{ marginTop: 14 }}>
          <label style={label}>主要限制（回车添加）</label>
          <TagsInput field="cons" value={form.cons} placeholder="如：需要梯子" inputVal={conInput} setInputVal={setConInput} />
        </div>

        <div style={{ marginTop: 20, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '10px 20px', background: '#F1F5F9', border: 'none', borderRadius: 10, fontSize: 13, cursor: 'pointer', color: '#64748B', fontFamily: 'sans-serif' }}>取消</button>
          <button onClick={() => { if (!form.slug || !form.name) { alert('slug 和名称不能为空'); return }; onSave(form) }}
            style={{ padding: '10px 24px', background: '#D97706', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#fff', fontFamily: 'sans-serif' }}>
            ✓ 保存
          </button>
        </div>
      </div>
    </div>
  )
}

// ── 主页面 ────────────────────────────────────────────────
export default function DashToolsPage() {
  const [tools, setTools] = useState<any[]>(() => JSON.parse(JSON.stringify(ALL_TOOLS)))
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('全部')
  const [editing, setEditing] = useState<any | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [msg, setMsg] = useState('')
  const [showGuide, setShowGuide] = useState(false)
  const [isDirty, setIsDirty] = useState(false)

  const cats = ['全部', ...Array.from(new Set(tools.map(t => t.category)))]
  const filtered = tools.filter(t =>
    (catFilter === '全部' || t.category === catFilter) &&
    (!search || t.name.toLowerCase().includes(search.toLowerCase()) || t.slug.includes(search.toLowerCase()))
  )

  function saveEdit(updated: any) {
    const idx = tools.findIndex(t => t.slug === updated.slug)
    if (idx >= 0) setTools(prev => prev.map(t => t.slug === updated.slug ? updated : t))
    else setTools(prev => [...prev, updated])
    setEditing(null); setShowAdd(false); setIsDirty(true)
    setMsg(`✓ "${updated.name}" 已保存（未部署）`); setTimeout(() => setMsg(''), 3000)
  }

  function deleteTool(slug: string, name: string) {
    if (!confirm(`确定删除「${name}」？此操作下载文件后才真正生效。`)) return
    setTools(prev => prev.filter(t => t.slug !== slug))
    setIsDirty(true); setMsg(`已标记删除 "${name}"`); setTimeout(() => setMsg(''), 3000)
  }

  function handleDownload() {
    const content = generateToolsDataTS(tools)
    downloadFile(content, 'tools-data.ts')
    setShowGuide(true)
  }

  return (
    <div style={{ padding: '28px 28px 60px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1E293B', marginBottom: 4 }}>🔧 工具管理</h1>
          <p style={{ fontSize: 12, color: '#94A3B8' }}>共 {tools.length} 个工具 · {isDirty ? <span style={{ color: '#D97706', fontWeight: 600 }}>有未保存的修改</span> : '与线上版本一致'}</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={() => setShowAdd(true)} style={{ padding: '9px 18px', background: '#D97706', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'sans-serif' }}>
            ＋ 新增工具
          </button>
          {isDirty && (
            <button onClick={handleDownload} style={{ padding: '9px 18px', background: '#1E293B', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'sans-serif' }}>
              ⬇ 下载文件 & 部署指引
            </button>
          )}
        </div>
      </div>

      {msg && <div style={{ padding: '10px 14px', background: '#E1F5EE', color: '#085041', borderRadius: 10, marginBottom: 14, fontSize: 13, border: '1px solid #A7F3D0' }}>{msg}</div>}

      {/* 部署指引弹窗 */}
      {showGuide && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={e => e.target === e.currentTarget && setShowGuide(false)}>
          <div style={{ background: '#fff', borderRadius: 18, padding: '28px 32px', width: 'min(90vw, 540px)', boxShadow: '0 16px 60px rgba(0,0,0,0.2)' }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1E293B', marginBottom: 20 }}>📋 部署步骤</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { n: 1, text: '文件已下载到你电脑，找到 tools-data.ts' },
                { n: 2, text: '将文件复制到本地项目：G:\\Claude code\\aitools-nav\\src\\lib\\tools-data.ts（覆盖原文件）' },
                { n: 3, text: '在 VSCode 终端运行：npm run build（验证构建）' },
                { n: 4, text: '推送到 GitHub：git add . && git commit -m "update: 工具数据更新" && git push' },
                { n: 5, text: 'Cloudflare 自动部署，1-3分钟后生效 ✓' },
              ].map(s => (
                <div key={s.n} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#D97706', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{s.n}</div>
                  <p style={{ fontSize: 13, color: '#374151', margin: 0, lineHeight: 1.6 }}>{s.text}</p>
                </div>
              ))}
            </div>
            <button onClick={() => { setShowGuide(false); setIsDirty(false) }} style={{ marginTop: 20, width: '100%', padding: '10px', background: '#D97706', border: 'none', borderRadius: 10, color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'sans-serif' }}>
              我已了解，关闭
            </button>
          </div>
        </div>
      )}

      {/* 搜索 + 筛选 */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索工具名 / slug..."
          style={{ padding: '8px 12px', fontSize: 13, border: '1.5px solid #CBD5E0', borderRadius: 10, outline: 'none', width: 220, fontFamily: 'sans-serif', background: '#fff', color: '#1E293B' }} />
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          {cats.map(c => (
            <button key={c} onClick={() => setCatFilter(c)}
              style={{ padding: '5px 11px', borderRadius: 20, border: `1.5px solid ${catFilter === c ? '#D97706' : '#CBD5E0'}`, background: catFilter === c ? '#FEF3C7' : '#fff', color: catFilter === c ? '#92400E' : '#64748B', cursor: 'pointer', fontSize: 11, fontFamily: 'sans-serif' }}>
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
              {['Logo', '工具名 / Slug', '分类', '价格', '免费', '国内', 'API', '评分', '操作'].map(h => (
                <th key={h} style={{ padding: '10px 12px', fontSize: 11, fontWeight: 600, color: '#64748B', textAlign: 'left', borderBottom: '1px solid #E2E8F0', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((tool, i) => (
              <tr key={tool.slug} style={{ borderBottom: '1px solid #F1F5F9', background: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                <td style={{ padding: '8px 12px' }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    <ToolIcon slug={tool.slug} name={tool.name} size={22} />
                  </div>
                </td>
                <td style={{ padding: '8px 12px' }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#1E293B' }}>{tool.name}</div>
                  <div style={{ fontSize: 10, color: '#94A3B8', fontFamily: 'monospace' }}>{tool.slug}</div>
                </td>
                <td style={{ padding: '8px 12px', fontSize: 12, color: '#64748B' }}>{tool.category}</td>
                <td style={{ padding: '8px 12px', fontSize: 12, color: '#1E293B', whiteSpace: 'nowrap' }}>{tool.price}</td>
                <td style={{ padding: '8px 12px', fontSize: 13, color: tool.hasFree ? '#16a34a' : '#dc2626', fontWeight: 600 }}>{tool.hasFree ? '✓' : '✗'}</td>
                <td style={{ padding: '8px 12px', fontSize: 13, color: tool.cnAccess ? '#16a34a' : '#dc2626', fontWeight: 600 }}>{tool.cnAccess ? '✓' : '✗'}</td>
                <td style={{ padding: '8px 12px', fontSize: 13, color: tool.hasApi ? '#16a34a' : '#dc2626', fontWeight: 600 }}>{tool.hasApi ? '✓' : '✗'}</td>
                <td style={{ padding: '8px 12px', fontSize: 12, fontWeight: 600, color: '#D97706' }}>{tool.rating > 0 ? `★${tool.rating.toFixed(1)}` : '—'}</td>
                <td style={{ padding: '8px 12px' }}>
                  <div style={{ display: 'flex', gap: 5 }}>
                    <button onClick={() => setEditing(tool)} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 6, border: '1px solid #CBD5E0', background: '#fff', cursor: 'pointer', fontFamily: 'sans-serif', color: '#475569' }}>✏️ 编辑</button>
                    <button onClick={() => deleteTool(tool.slug, tool.name)} style={{ fontSize: 11, padding: '4px 8px', borderRadius: 6, border: '1px solid #FECACA', background: '#FFF5F5', color: '#EF4444', cursor: 'pointer', fontFamily: 'sans-serif' }}>🗑</button>
                    <Link href={`/tools/${tool.slug}/`} target="_blank" style={{ fontSize: 11, padding: '4px 8px', borderRadius: 6, border: '1px solid #E2E8F0', background: '#F8FAFC', color: '#64748B', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>↗</Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(editing || showAdd) && (
        <ToolEditor tool={editing || EMPTY_TOOL} onSave={saveEdit} onClose={() => { setEditing(null); setShowAdd(false) }} />
      )}
    </div>
  )
}
