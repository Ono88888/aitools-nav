'use client'
import React, { useState, useRef } from 'react'
import Link from 'next/link'
import { COMBOS_DB, SCENE_LABELS } from '@/lib/combos-data'
import { ALL_TOOLS } from '@/lib/tools-data'
import type { ToolCombo } from '@/types/combo'

function downloadFile(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

function genCombosTS(db: Record<string, ToolCombo[]>): string {
  return `// ── 工具组合数据库 ── 由 GO悟空后台 生成 ── ${new Date().toLocaleString('zh-CN')}
import type { ToolCombo } from '@/types/combo'

export const COMBOS_DB: Record<string, ToolCombo[]> = ${JSON.stringify(db, null, 2)}

export function matchScene(q: string): string {
  const lower = q.toLowerCase().replace(/\\s+/g,'')
  const MAP: Record<string,string[]> = {
    video:['短视频','视频','剪辑','抖音'],wechat:['公众号','微信','图文'],
    ecommerce:['电商','跨境','亚马逊'],dev:['开发','编程','代码'],
    painting:['绘画','生图','画图'],podcast:['播客','录音'],writing:['写作','文章','文案'],
    ppt:['ppt','演示','汇报'],music:['音乐','歌曲'],knowledge:['知识','笔记','学习'],
    livestream:['直播','带货'],agent:['自动化','agent'],
  }
  for(const [scene,tags] of Object.entries(MAP)){ if(tags.some(t=>lower.includes(t))) return scene }
  return 'video'
}
export function getCombos(scene: string): ToolCombo[] { return COMBOS_DB[scene] || COMBOS_DB.video || [] }
export const SCENE_LABELS: Record<string,string> = ${JSON.stringify(
    Object.fromEntries(Object.keys(db).map(k => [k, SCENE_LABELS[k] || k]))
  )}
`
}

// ── 工具选择器（拖拽/点选组合工具）────────────────────────
function ToolPicker({ selected, onChange }: { selected: string[]; onChange: (slugs: string[]) => void }) {
  const [search, setSearch] = useState('')
  const [cat, setCat] = useState('全部')
  const cats = ['全部', ...Array.from(new Set(ALL_TOOLS.map(t => t.category)))]
  const filtered = ALL_TOOLS.filter(t =>
    (cat === '全部' || t.category === cat) &&
    (!search || t.name.toLowerCase().includes(search.toLowerCase()) || t.slug.includes(search.toLowerCase()))
  )

  function toggle(slug: string) {
    if (selected.includes(slug)) onChange(selected.filter(s => s !== slug))
    else onChange([...selected, slug])
  }

  function moveUp(idx: number) {
    if (idx === 0) return
    const arr = [...selected]; [arr[idx-1], arr[idx]] = [arr[idx], arr[idx-1]]; onChange(arr)
  }
  function moveDown(idx: number) {
    if (idx === selected.length - 1) return
    const arr = [...selected]; [arr[idx], arr[idx+1]] = [arr[idx+1], arr[idx]]; onChange(arr)
  }

  return (
    <div>
      {/* 已选工具（可排序） */}
      {selected.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: '#374151', fontWeight: 600, marginBottom: 6 }}>已选工具组合（可拖动排序）：</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {selected.map((slug, idx) => {
              const tool = ALL_TOOLS.find(t => t.slug === slug)
              if (!tool) return null
              return (
                <div key={slug} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px', background: '#FEF3C7', border: '1.5px solid #D97706', borderRadius: 10 }}>
                  <span style={{ fontSize: 18 }}>{tool.logo}</span>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#1E293B' }}>{tool.name}</span>
                    <span style={{ fontSize: 11, color: '#94A3B8', marginLeft: 6 }}>{tool.category}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 3 }}>
                    <button onClick={() => moveUp(idx)} style={{ padding: '2px 6px', border: '1px solid #CBD5E0', borderRadius: 5, background: '#fff', cursor: 'pointer', fontSize: 11 }}>↑</button>
                    <button onClick={() => moveDown(idx)} style={{ padding: '2px 6px', border: '1px solid #CBD5E0', borderRadius: 5, background: '#fff', cursor: 'pointer', fontSize: 11 }}>↓</button>
                    <button onClick={() => toggle(slug)} style={{ padding: '2px 6px', border: '1px solid #FECACA', borderRadius: 5, background: '#FFF5F5', color: '#EF4444', cursor: 'pointer', fontSize: 11 }}>✕</button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 工具搜索和选择 */}
      <div style={{ fontSize: 11, color: '#374151', fontWeight: 600, marginBottom: 6 }}>从工具库选择（点击添加）：</div>
      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索工具名..."
        style={{ width: '100%', padding: '7px 10px', fontSize: 12, border: '1.5px solid #CBD5E0', borderRadius: 8, outline: 'none', fontFamily: 'sans-serif', marginBottom: 8, boxSizing: 'border-box', background: '#fff' }} />
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 8 }}>
        {cats.slice(0, 6).map(c => (
          <button key={c} onClick={() => setCat(c)}
            style={{ fontSize: 10, padding: '3px 8px', borderRadius: 12, border: `1px solid ${cat===c?'#D97706':'#CBD5E0'}`, background: cat===c?'#FEF3C7':'#fff', color: cat===c?'#92400E':'#64748B', cursor: 'pointer', fontFamily: 'sans-serif' }}>
            {c}
          </button>
        ))}
      </div>
      <div style={{ maxHeight: 180, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 3, border: '1px solid #E2E8F0', borderRadius: 10, padding: 8, background: '#F8FAFC' }}>
        {filtered.slice(0, 30).map(tool => {
          const isSel = selected.includes(tool.slug)
          return (
            <div key={tool.slug} onClick={() => toggle(tool.slug)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 8, cursor: 'pointer', background: isSel ? '#E1F5EE' : '#fff', border: `1px solid ${isSel ? '#A7F3D0' : '#E2E8F0'}`, transition: 'all .1s' }}>
              <span style={{ fontSize: 16 }}>{tool.logo}</span>
              <span style={{ fontSize: 12, fontWeight: 500, color: '#1E293B', flex: 1 }}>{tool.name}</span>
              <span style={{ fontSize: 10, color: '#94A3B8' }}>{tool.price}</span>
              {isSel && <span style={{ fontSize: 11, color: '#16a34a', fontWeight: 600 }}>✓</span>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── 组合编辑器 ────────────────────────────────────────────
const EMPTY_COMBO = (): Partial<ToolCombo> => ({
  id: `c${Date.now()}`, name: '', tagline: '', tier: 'mid', isRec: false,
  priceMin: 0, priceMax: 0, overallDifficulty: 2, netSummary: 'both',
  setupTime: '', timePerOutput: '', bestFor: '', pros: [], why: '',
  steps: [], scenarios: [],
})

function ComboEditor({ combo, scene, allScenes, onSave, onClose, isNew }: {
  combo: Partial<ToolCombo>; scene: string; allScenes: string[];
  onSave: (c: ToolCombo, scene: string) => void; onClose: () => void; isNew: boolean
}) {
  const [form, setForm] = useState({ ...EMPTY_COMBO(), ...combo })
  const [toolScene, setToolScene] = useState(scene)
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>(
    (combo.steps || []).flatMap(s => s.tools?.map((t: any) => t.slug || '') || []).filter(Boolean)
  )
  const [prosInput, setProsInput] = useState((combo.pros || []).join('、'))

  const inp: React.CSSProperties = { width: '100%', padding: '8px 11px', fontSize: 13, border: '1.5px solid #CBD5E0', borderRadius: 8, outline: 'none', fontFamily: 'sans-serif', boxSizing: 'border-box', background: '#fff', color: '#1E293B' }
  const lbl: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4, display: 'block', marginTop: 12 }

  function buildStepsFromSlugs(slugs: string[]): ToolCombo['steps'] {
    return slugs.map((slug, i) => {
      const tool = ALL_TOOLS.find(t => t.slug === slug)
      return {
        phase: `步骤${i + 1}：${tool?.name || slug}`,
        conn: 'and' as const,
        tools: [{
          name: tool?.name || slug,
          logo: tool?.logo || '🤖',
          price: tool?.price || '免费',
          url: tool?.url || '',
          net: (tool?.cnAccess ? 'cn' : 'vpn') as any,
          difficulty: (tool?.difficulty || 2) as any,
          slug,
          tip: '',
        }],
      }
    })
  }

  function save() {
    if (!form.name?.trim()) { alert('请填写方案名称'); return }
    if (selectedSlugs.length === 0) { alert('请至少选择一个工具'); return }
    const steps = buildStepsFromSlugs(selectedSlugs)
    const prosArr = prosInput.split(/[,，、]/).map(s => s.trim()).filter(Boolean)
    const result: ToolCombo = {
      ...EMPTY_COMBO(),
      ...form,
      id: (form.id || `c${Date.now()}`),  // 确保id永远是string
      name: form.name!,
      tagline: form.tagline || '',
      tier: form.tier as any || 'mid',
      isRec: form.isRec || false,
      priceMin: form.priceMin || 0,
      priceMax: form.priceMax || 0,
      overallDifficulty: form.overallDifficulty as any || 2,
      netSummary: form.netSummary as any || 'both',
      steps,
      pros: prosArr,
      why: form.why || '',
      scenarios: (form.scenarios as string[]) || [],
      bestFor: form.bestFor || '',
      setupTime: form.setupTime || '',
      timePerOutput: form.timePerOutput || '',
    }
    onSave(result, toolScene)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: '#fff', borderRadius: 18, width: 'min(96vw, 760px)', maxHeight: '92vh', overflow: 'auto', padding: '24px 28px', boxShadow: '0 16px 60px rgba(0,0,0,0.25)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1E293B', margin: 0 }}>{isNew ? '➕ 新建工具组合' : '✏️ 编辑工具组合'}</h2>
          <button onClick={onClose} style={{ background: '#F1F5F9', border: 'none', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontSize: 13, color: '#64748B' }}>✕ 关闭</button>
        </div>

        {/* 所属场景 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={lbl}>所属场景 <span style={{ color: '#EF4444' }}>*</span></label>
            <select value={toolScene} onChange={e => setToolScene(e.target.value)} style={inp}>
              {allScenes.map(s => <option key={s} value={s}>{SCENE_LABELS[s] || s}</option>)}
              <option value="__new__">+ 新建场景</option>
            </select>
          </div>
          <div>
            <label style={lbl}>方案类型</label>
            <select value={form.tier || 'mid'} onChange={e => setForm(p => ({ ...p, tier: e.target.value as any }))} style={inp}>
              <option value="free">🟢 全免费方案</option>
              <option value="mid">🟡 性价比首选</option>
              <option value="pro">🟣 专业旗舰</option>
            </select>
          </div>
          <div>
            <label style={lbl}>方案名称 <span style={{ color: '#EF4444' }}>*</span></label>
            <input value={form.name || ''} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="如：豆包 + 剪映 + 即梦AI" style={inp} />
          </div>
          <div>
            <label style={lbl}>一句话描述</label>
            <input value={form.tagline || ''} onChange={e => setForm(p => ({ ...p, tagline: e.target.value }))} placeholder="30分钟出一条视频，基本免费" style={inp} />
          </div>
          <div>
            <label style={lbl}>适合人群</label>
            <input value={form.bestFor || ''} onChange={e => setForm(p => ({ ...p, bestFor: e.target.value }))} placeholder="自媒体新手 / 宝妈" style={inp} />
          </div>
          <div>
            <label style={lbl}>网络要求</label>
            <select value={form.netSummary || 'both'} onChange={e => setForm(p => ({ ...p, netSummary: e.target.value as any }))} style={inp}>
              <option value="cn">🇨🇳 国内直连</option>
              <option value="vpn">🔒 需要梯子</option>
              <option value="both">🌐 均可访问</option>
            </select>
          </div>
          <div>
            <label style={lbl}>月费最低（元）</label>
            <input type="number" value={form.priceMin || 0} onChange={e => setForm(p => ({ ...p, priceMin: Number(e.target.value) }))} style={inp} />
          </div>
          <div>
            <label style={lbl}>月费最高（元）</label>
            <input type="number" value={form.priceMax || 0} onChange={e => setForm(p => ({ ...p, priceMax: Number(e.target.value) }))} style={inp} />
          </div>
          <div>
            <label style={lbl}>整体难度 (1-5)</label>
            <input type="number" min={1} max={5} value={form.overallDifficulty || 2} onChange={e => setForm(p => ({ ...p, overallDifficulty: Number(e.target.value) as any }))} style={inp} />
          </div>
          <div>
            <label style={lbl}>初次配置时间</label>
            <input value={form.setupTime || ''} onChange={e => setForm(p => ({ ...p, setupTime: e.target.value }))} placeholder="如：1小时" style={inp} />
          </div>
        </div>

        <label style={lbl}>推荐理由（80字以内）</label>
        <textarea value={form.why || ''} onChange={e => setForm(p => ({ ...p, why: e.target.value }))} rows={2} style={{ ...inp, resize: 'vertical' }} placeholder="说明为什么推荐这套组合，适合什么场景..." />

        <label style={lbl}>优点标签（逗号分隔）</label>
        <input value={prosInput} onChange={e => setProsInput(e.target.value)} placeholder="如：上手简单、基本免费、全流程打通" style={inp} />

        {/* 工具选择器 */}
        <label style={{ ...lbl, marginTop: 18 }}>🔧 选择工具并排列组合 <span style={{ color: '#EF4444' }}>*</span>
          <span style={{ fontSize: 11, fontWeight: 400, color: '#94A3B8', marginLeft: 6 }}>({selectedSlugs.length} 个工具已选)</span>
        </label>
        <ToolPicker selected={selectedSlugs} onChange={setSelectedSlugs} />

        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', marginTop: 16, padding: '10px', background: '#F8FAFC', borderRadius: 10, border: '1px solid #E2E8F0' }}>
          <input type="checkbox" checked={form.isRec || false} onChange={e => setForm(p => ({ ...p, isRec: e.target.checked }))} />
          <span>⭐ 设为编辑推荐（在场景列表中优先展示）</span>
        </label>

        <div style={{ marginTop: 20, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '10px 20px', background: '#F1F5F9', border: 'none', borderRadius: 10, fontSize: 13, cursor: 'pointer', color: '#64748B', fontFamily: 'sans-serif' }}>取消</button>
          <button onClick={save} style={{ padding: '10px 28px', background: '#D97706', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#fff', fontFamily: 'sans-serif' }}>
            ✓ {isNew ? '创建组合' : '保存修改'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── 主页面 ────────────────────────────────────────────────
export default function DashCombosPage() {
  const [db, setDb] = useState<Record<string, ToolCombo[]>>(() => JSON.parse(JSON.stringify(COMBOS_DB)))
  const [sceneFilter, setSceneFilter] = useState('全部')
  const [tierFilter, setTierFilter] = useState('全部')
  const [editing, setEditing] = useState<{ combo: Partial<ToolCombo>; scene: string; isNew: boolean } | null>(null)
  const [msg, setMsg] = useState('')
  const [isDirty, setIsDirty] = useState(false)
  const [showGuide, setShowGuide] = useState(false)
  const [newSceneName, setNewSceneName] = useState('')
  const [showNewScene, setShowNewScene] = useState(false)

  const allScenes = Object.keys(db)
  const allCombos = Object.entries(db).flatMap(([scene, combos]) => combos.map(c => ({ ...c, scene })))
  const filtered = allCombos.filter(c =>
    (sceneFilter === '全部' || c.scene === sceneFilter) &&
    (tierFilter === '全部' || c.tier === tierFilter)
  )

  const TIER_STYLE: Record<string, { bg: string; color: string; label: string }> = {
    free: { bg: '#E1F5EE', color: '#085041', label: '全免费' },
    mid:  { bg: '#FEF3C7', color: '#92400E', label: '性价比' },
    pro:  { bg: '#EDE9FE', color: '#4C1D95', label: '专业版' },
  }

  function saveCombo(updated: ToolCombo, scene: string) {
    // 处理新场景
    const targetScene = scene === '__new__' ? (newSceneName || 'custom') : scene
    setDb(prev => {
      const sceneArr = prev[targetScene] || []
      const idx = sceneArr.findIndex(c => c.id === updated.id)
      return {
        ...prev,
        [targetScene]: idx >= 0
          ? sceneArr.map(c => c.id === updated.id ? updated : c)
          : [...sceneArr, updated],
      }
    })
    setEditing(null); setIsDirty(true)
    setMsg(`✓ "${updated.name}" 已${editing?.isNew ? '创建' : '保存'}`); setTimeout(() => setMsg(''), 3000)
  }

  function deleteCombo(id: string, name: string, scene: string) {
    if (!confirm(`确定删除「${name}」？`)) return
    setDb(prev => ({ ...prev, [scene]: prev[scene].filter(c => c.id !== id) }))
    setIsDirty(true); setMsg(`已删除 "${name}"`); setTimeout(() => setMsg(''), 2000)
  }

  function toggleRec(id: string, scene: string) {
    setDb(prev => ({ ...prev, [scene]: prev[scene].map(c => c.id === id ? { ...c, isRec: !c.isRec } : c) }))
    setIsDirty(true)
  }

  function addScene() {
    if (!newSceneName.trim()) return
    const key = newSceneName.toLowerCase().replace(/\s+/g, '_')
    if (!db[key]) setDb(prev => ({ ...prev, [key]: [] }))
    setShowNewScene(false); setNewSceneName(''); setIsDirty(true)
    setMsg(`场景 "${key}" 已创建`); setTimeout(() => setMsg(''), 2000)
  }

  return (
    <div style={{ padding: '28px 28px 60px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1E293B', marginBottom: 4 }}>🃏 工具组合管理</h1>
          <p style={{ fontSize: 12, color: '#94A3B8' }}>共 {allCombos.length} 套组合 · {allScenes.length} 个场景 · {isDirty ? <span style={{ color: '#D97706', fontWeight: 600 }}>有未部署的修改</span> : '与线上一致'}</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={() => setShowNewScene(true)}
            style={{ padding: '8px 14px', background: '#EFF6FF', border: '1.5px solid #BFDBFE', borderRadius: 10, fontSize: 12, fontWeight: 500, cursor: 'pointer', color: '#1D4ED8', fontFamily: 'sans-serif' }}>
            ＋ 新增场景
          </button>
          <button onClick={() => setEditing({ combo: { ...EMPTY_COMBO() }, scene: allScenes[0] || 'video', isNew: true })}
            style={{ padding: '8px 16px', background: '#D97706', border: 'none', borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: 'pointer', color: '#fff', fontFamily: 'sans-serif' }}>
            ＋ 新建组合
          </button>
          {isDirty && (
            <button onClick={() => { downloadFile(genCombosTS(db), 'combos-data.ts'); setShowGuide(true) }}
              style={{ padding: '8px 16px', background: '#1E293B', border: 'none', borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: 'pointer', color: '#fff', fontFamily: 'sans-serif' }}>
              ⬇ 下载并部署
            </button>
          )}
        </div>
      </div>

      {msg && <div style={{ padding: '10px 14px', background: '#E1F5EE', color: '#085041', borderRadius: 10, marginBottom: 14, fontSize: 13, border: '1px solid #A7F3D0' }}>{msg}</div>}

      {/* 新增场景弹窗 */}
      {showNewScene && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={e => e.target === e.currentTarget && setShowNewScene(false)}>
          <div style={{ background: '#fff', borderRadius: 16, padding: '24px', width: 380 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1E293B', marginBottom: 16 }}>新增场景</h3>
            <input value={newSceneName} onChange={e => setNewSceneName(e.target.value)} onKeyDown={e => e.key === 'Enter' && addScene()}
              placeholder="场景名称，如：律师法务" style={{ width: '100%', padding: '9px 12px', fontSize: 13, border: '1.5px solid #CBD5E0', borderRadius: 10, outline: 'none', fontFamily: 'sans-serif', boxSizing: 'border-box', marginBottom: 14 }} />
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setShowNewScene(false)} style={{ flex: 1, padding: '9px', background: '#F1F5F9', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontFamily: 'sans-serif', color: '#64748B' }}>取消</button>
              <button onClick={addScene} style={{ flex: 2, padding: '9px', background: '#D97706', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'sans-serif', color: '#fff' }}>创建场景</button>
            </div>
          </div>
        </div>
      )}

      {/* 部署指引 */}
      {showGuide && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={e => e.target === e.currentTarget && setShowGuide(false)}>
          <div style={{ background: '#fff', borderRadius: 18, padding: '28px 32px', width: 'min(90vw, 520px)' }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1E293B', marginBottom: 18 }}>📋 部署步骤</h3>
            {['combos-data.ts 已下载到电脑', '复制到：G:\\Claude code\\aitools-nav\\src\\lib\\combos-data.ts', '运行 npm run build 验证', 'git add . && git commit -m "update: 工具组合更新" && git push', 'Cloudflare 自动部署，1-3分钟生效 ✓'].map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#D97706', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{i+1}</div>
                <p style={{ fontSize: 13, color: '#374151', margin: 0, lineHeight: 1.6 }}>{s}</p>
              </div>
            ))}
            <button onClick={() => { setShowGuide(false); setIsDirty(false) }} style={{ width: '100%', padding: '10px', background: '#D97706', border: 'none', borderRadius: 10, color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', marginTop: 8, fontFamily: 'sans-serif' }}>
              我已了解
            </button>
          </div>
        </div>
      )}

      {/* 场景筛选 */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: '#64748B', flexShrink: 0 }}>场景：</span>
        {['全部', ...allScenes].map(s => (
          <button key={s} onClick={() => setSceneFilter(s)}
            style={{ padding: '4px 11px', borderRadius: 20, border: `1.5px solid ${sceneFilter===s?'#D97706':'#CBD5E0'}`, background: sceneFilter===s?'#FEF3C7':'#fff', color: sceneFilter===s?'#92400E':'#64748B', cursor: 'pointer', fontSize: 11, fontFamily: 'sans-serif' }}>
            {s === '全部' ? '全部' : (SCENE_LABELS[s] || s)}
            {s !== '全部' && <span style={{ marginLeft: 4, fontSize: 10, color: '#94A3B8' }}>({db[s]?.length || 0})</span>}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 18, flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: '#64748B', flexShrink: 0 }}>类型：</span>
        {['全部','free','mid','pro'].map(t => (
          <button key={t} onClick={() => setTierFilter(t)}
            style={{ padding: '4px 11px', borderRadius: 20, border: `1.5px solid ${tierFilter===t?'#D97706':'#CBD5E0'}`, background: tierFilter===t?'#FEF3C7':'#fff', color: tierFilter===t?'#92400E':'#64748B', cursor: 'pointer', fontSize: 11, fontFamily: 'sans-serif' }}>
            {t === '全部' ? '全部' : TIER_STYLE[t]?.label}
          </button>
        ))}
      </div>

      {/* 组合列表 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#94A3B8', background: '#fff', borderRadius: 14, border: '1.5px dashed #E2E8F0' }}>
            {sceneFilter === '全部' ? '暂无工具组合' : `「${SCENE_LABELS[sceneFilter] || sceneFilter}」场景下还没有组合，`}
            <button onClick={() => setEditing({ combo: { ...EMPTY_COMBO() }, scene: sceneFilter === '全部' ? allScenes[0] : sceneFilter, isNew: true })}
              style={{ color: '#D97706', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>点击新建 →</button>
          </div>
        )}
        {filtered.map(combo => {
          const ts = TIER_STYLE[combo.tier] || TIER_STYLE.mid
          const toolCount = combo.steps?.flatMap(s => s.tools || []).length || 0
          return (
            <div key={combo.id} style={{ background: '#fff', border: '1.5px solid #E2E8F0', borderRadius: 14, padding: '14px 18px', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap', marginBottom: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: ts.bg, color: ts.color }}>{ts.label}</span>
                  <span style={{ fontSize: 11, background: '#F1F5F9', color: '#475569', padding: '2px 7px', borderRadius: 4 }}>{SCENE_LABELS[combo.scene] || combo.scene}</span>
                  {combo.isRec && <span style={{ fontSize: 11, background: '#FFF0E6', color: '#C2410C', padding: '2px 7px', borderRadius: 4 }}>⭐ 推荐</span>}
                  <span style={{ fontSize: 10, color: '#94A3B8', fontFamily: 'monospace' }}>ID: {combo.id}</span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#1E293B', marginBottom: 3 }}>{combo.name}</div>
                <div style={{ fontSize: 12, color: '#64748B', marginBottom: 6 }}>{combo.tagline}</div>
                <div style={{ display: 'flex', gap: 10, fontSize: 11, color: '#94A3B8', flexWrap: 'wrap' }}>
                  <span>💰 ¥{combo.priceMin}–{combo.priceMax}/月</span>
                  <span>📊 难度 {combo.overallDifficulty}/5</span>
                  <span>🔧 {toolCount} 个工具</span>
                  <span>🌐 {combo.netSummary === 'cn' ? '国内直连' : combo.netSummary === 'vpn' ? '需梯子' : '均可'}</span>
                  {combo.bestFor && <span>👤 {combo.bestFor}</span>}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 5, flexShrink: 0, flexDirection: 'column', alignItems: 'flex-end' }}>
                <div style={{ display: 'flex', gap: 5 }}>
                  <button onClick={() => setEditing({ combo, scene: combo.scene, isNew: false })}
                    style={{ fontSize: 11, padding: '5px 10px', borderRadius: 6, border: '1px solid #CBD5E0', background: '#fff', cursor: 'pointer', fontFamily: 'sans-serif', color: '#475569' }}>✏️ 编辑</button>
                  <button onClick={() => toggleRec(combo.id, combo.scene)}
                    style={{ fontSize: 11, padding: '5px 10px', borderRadius: 6, border: `1px solid ${combo.isRec?'#FCD34D':'#CBD5E0'}`, background: combo.isRec?'#FEF3C7':'#fff', cursor: 'pointer', fontFamily: 'sans-serif', color: combo.isRec?'#92400E':'#94A3B8' }}>
                    {combo.isRec ? '⭐ 取消推荐' : '☆ 推荐'}
                  </button>
                  <button onClick={() => deleteCombo(combo.id, combo.name, combo.scene)}
                    style={{ fontSize: 11, padding: '5px 8px', borderRadius: 6, border: '1px solid #FECACA', background: '#FFF5F5', color: '#EF4444', cursor: 'pointer', fontFamily: 'sans-serif' }}>🗑</button>
                </div>
                <Link href={`/combos/${combo.scene}/${combo.id}/`} target="_blank"
                  style={{ fontSize: 11, color: '#94A3B8', textDecoration: 'none' }}>预览 ↗</Link>
              </div>
            </div>
          )
        })}
      </div>

      {editing && (
        <ComboEditor
          combo={editing.combo} scene={editing.scene}
          allScenes={allScenes} isNew={editing.isNew}
          onSave={saveCombo} onClose={() => setEditing(null)} />
      )}
    </div>
  )
}
