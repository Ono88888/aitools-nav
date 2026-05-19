'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { COMBOS_DB, SCENE_LABELS } from '@/lib/combos-data'
import type { ToolCombo } from '@/types/combo'

// ── 生成 combos-data.ts 的简化版本 ───────────────────────
function generateCombosDataTS(db: Record<string, ToolCombo[]>): string {
  function serializeCombo(c: ToolCombo): string {
    return `    {
      id: ${JSON.stringify(c.id)}, tier: ${JSON.stringify(c.tier)}, isRec: ${c.isRec},
      name: ${JSON.stringify(c.name)},
      tagline: ${JSON.stringify(c.tagline)},
      priceMin: ${c.priceMin}, priceMax: ${c.priceMax},
      overallDifficulty: ${c.overallDifficulty},
      netSummary: ${JSON.stringify(c.netSummary)},
      setupTime: ${JSON.stringify(c.setupTime || '')},
      timePerOutput: ${JSON.stringify(c.timePerOutput || '')},
      bestFor: ${JSON.stringify(c.bestFor || '')},
      scenarios: ${JSON.stringify(c.scenarios || [])},
      steps: ${JSON.stringify(c.steps, null, 8).replace(/^/gm, '      ').trim()},
      pros: ${JSON.stringify(c.pros || [])},
      why: ${JSON.stringify(c.why || '')},
    }`
  }

  const scenes = Object.entries(db).map(([scene, combos]) => `
  // ${SCENE_LABELS[scene] || scene}
  ${JSON.stringify(scene)}: [
${combos.map(serializeCombo).join(',\n')}
  ]`).join(',\n')

  return `// ── 工具组合数据库 ── 由 GO悟空后台 自动生成 ────────────────
// 最后更新: ${new Date().toLocaleString('zh-CN')}
import type { ComboTool, ComboStep, ToolCombo, NetAccess, Difficulty } from '@/types/combo'

export const COMBOS_DB: Record<string, ToolCombo[]> = {${scenes}
}

export function matchScene(q: string): string {
  const lower = q.toLowerCase().replace(/\\s+/g,'')
  const SCENE_MAP: Record<string,string[]> = {
    video:['短视频','视频','剪辑','口播','抖音','快手'],
    wechat:['公众号','微信','图文','推文'],
    ecommerce:['电商','跨境','亚马逊','shopify'],
    dev:['开发','编程','写代码','程序'],
    painting:['绘画','生图','画图'],
    podcast:['播客','录音','音频'],
    writing:['写作','文章','文案'],
    ppt:['ppt','演示','汇报'],
    music:['音乐','歌曲','作曲'],
    knowledge:['知识','笔记','学习'],
    livestream:['直播','带货','主播'],
    agent:['自动化','agent','机器人'],
  }
  for(const [scene,tags] of Object.entries(SCENE_MAP)){
    if(tags.some(t=>lower.includes(t))) return scene
  }
  return 'video'
}

export function getCombos(scene: string): ToolCombo[] {
  return COMBOS_DB[scene] || COMBOS_DB.video || []
}

export const SCENE_LABELS: Record<string,string> = {
  video:'短视频创作', wechat:'公众号运营', ecommerce:'跨境电商',
  dev:'独立开发', painting:'AI绘画变现', podcast:'播客制作',
  writing:'AI写作', ppt:'PPT制作', music:'AI音乐',
  knowledge:'知识管理', livestream:'直播带货', agent:'AI自动化',
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

// ── 组合编辑弹窗 ─────────────────────────────────────────
function ComboEditor({ combo, scene, onSave, onClose }: { combo: ToolCombo; scene: string; onSave: (c: ToolCombo) => void; onClose: () => void }) {
  const [form, setForm] = useState<ToolCombo>({ ...combo })
  const inp: React.CSSProperties = { width: '100%', padding: '8px 11px', fontSize: 13, border: '1.5px solid #CBD5E0', borderRadius: 8, outline: 'none', fontFamily: 'sans-serif', boxSizing: 'border-box', background: '#fff', color: '#1E293B' }
  const lbl: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4, display: 'block', marginTop: 12 }

  function F(field: keyof ToolCombo) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(p => ({ ...p, [field]: e.target.value as any }))
  }
  function FN(field: keyof ToolCombo) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(p => ({ ...p, [field]: Number(e.target.value) as any }))
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: '#fff', borderRadius: 18, width: 'min(92vw, 700px)', maxHeight: '90vh', overflow: 'auto', padding: '24px 28px', boxShadow: '0 16px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1E293B', margin: 0 }}>编辑工具组合</h2>
          <button onClick={onClose} style={{ background: '#F1F5F9', border: 'none', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: 13, color: '#64748B' }}>✕</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={lbl}>组合名称</label>
            <input value={form.name} onChange={F('name')} style={inp} />
          </div>
          <div>
            <label style={lbl}>一句话描述</label>
            <input value={form.tagline} onChange={F('tagline')} style={inp} />
          </div>
          <div>
            <label style={lbl}>适合人群</label>
            <input value={form.bestFor || ''} onChange={F('bestFor')} style={inp} />
          </div>
          <div>
            <label style={lbl}>方案类型</label>
            <select value={form.tier} onChange={F('tier')} style={inp}>
              <option value="free">全免费方案</option>
              <option value="mid">性价比首选</option>
              <option value="pro">专业旗舰</option>
            </select>
          </div>
          <div>
            <label style={lbl}>月费最低（元）</label>
            <input type="number" value={form.priceMin} onChange={FN('priceMin')} style={inp} />
          </div>
          <div>
            <label style={lbl}>月费最高（元）</label>
            <input type="number" value={form.priceMax} onChange={FN('priceMax')} style={inp} />
          </div>
          <div>
            <label style={lbl}>整体难度 (1-5)</label>
            <input type="number" min={1} max={5} value={form.overallDifficulty} onChange={FN('overallDifficulty')} style={inp} />
          </div>
          <div>
            <label style={lbl}>网络要求</label>
            <select value={form.netSummary} onChange={F('netSummary')} style={inp}>
              <option value="cn">国内直连</option>
              <option value="vpn">需要梯子</option>
              <option value="both">均可访问</option>
            </select>
          </div>
          <div>
            <label style={lbl}>初次配置时间</label>
            <input value={form.setupTime || ''} onChange={F('setupTime')} placeholder="如：30分钟" style={inp} />
          </div>
          <div>
            <label style={lbl}>每次产出效率</label>
            <input value={form.timePerOutput || ''} onChange={F('timePerOutput')} placeholder="如：约30分钟/条" style={inp} />
          </div>
        </div>

        <label style={lbl}>推荐理由</label>
        <textarea value={form.why} onChange={F('why')} rows={3} style={{ ...inp, resize: 'vertical' }} />

        <label style={lbl}>优点标签（逗号分隔）</label>
        <input value={form.pros.join('、')} onChange={e => setForm(p => ({ ...p, pros: e.target.value.split(/[,，、]/).map(s => s.trim()).filter(Boolean) }))} style={inp} placeholder="上手简单、基本免费、全流程打通" />

        <div style={{ marginTop: 18, background: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: 10, padding: '12px 16px' }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: '#92400E', margin: '0 0 6px' }}>⚠️ 步骤编辑说明</p>
          <p style={{ fontSize: 12, color: '#78350F', margin: 0, lineHeight: 1.7 }}>
            工具步骤的详细编辑（添加工具、修改工具链接等）请下载文件后在 VSCode 中直接编辑 combos-data.ts 的对应组合。
            当前页面支持修改组合的基本信息（名称、价格、难度、推荐理由等）。
          </p>
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', marginTop: 14, padding: '10px', background: '#F8FAFC', borderRadius: 8, border: '1px solid #E2E8F0' }}>
          <input type="checkbox" checked={form.isRec} onChange={e => setForm(p => ({ ...p, isRec: e.target.checked }))} />
          <span>设为编辑推荐（首页优先展示）</span>
        </label>

        <div style={{ marginTop: 20, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '10px 20px', background: '#F1F5F9', border: 'none', borderRadius: 10, fontSize: 13, cursor: 'pointer', color: '#64748B', fontFamily: 'sans-serif' }}>取消</button>
          <button onClick={() => onSave(form)} style={{ padding: '10px 24px', background: '#D97706', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#fff', fontFamily: 'sans-serif' }}>✓ 保存</button>
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
  const [editing, setEditing] = useState<{ combo: ToolCombo; scene: string } | null>(null)
  const [msg, setMsg] = useState('')
  const [showGuide, setShowGuide] = useState(false)
  const [isDirty, setIsDirty] = useState(false)

  const scenes = ['全部', ...Object.keys(db)]
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
    setDb(prev => ({
      ...prev,
      [scene]: prev[scene].map(c => c.id === updated.id ? updated : c),
    }))
    setEditing(null); setIsDirty(true)
    setMsg(`✓ "${updated.name}" 已保存`); setTimeout(() => setMsg(''), 3000)
  }

  function deleteCombo(id: string, name: string, scene: string) {
    if (!confirm(`确定删除「${name}」？`)) return
    setDb(prev => ({ ...prev, [scene]: prev[scene].filter(c => c.id !== id) }))
    setIsDirty(true); setMsg(`已删除 "${name}"`); setTimeout(() => setMsg(''), 3000)
  }

  function toggleRec(id: string, scene: string) {
    setDb(prev => ({
      ...prev,
      [scene]: prev[scene].map(c => c.id === id ? { ...c, isRec: !c.isRec } : c),
    }))
    setIsDirty(true)
  }

  function handleDownload() {
    downloadFile(generateCombosDataTS(db), 'combos-data.ts')
    setShowGuide(true)
  }

  return (
    <div style={{ padding: '28px 28px 60px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1E293B', marginBottom: 4 }}>🃏 工具组合管理</h1>
          <p style={{ fontSize: 12, color: '#94A3B8' }}>共 {allCombos.length} 套 · {isDirty ? <span style={{ color: '#D97706', fontWeight: 600 }}>有未保存的修改</span> : '与线上版本一致'}</p>
        </div>
        {isDirty && (
          <button onClick={handleDownload} style={{ padding: '9px 18px', background: '#1E293B', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'sans-serif' }}>
            ⬇ 下载文件 & 部署指引
          </button>
        )}
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
                { n: 1, text: 'combos-data.ts 已下载到你的电脑' },
                { n: 2, text: '将文件复制到：G:\\Claude code\\aitools-nav\\src\\lib\\combos-data.ts（覆盖原文件）' },
                { n: 3, text: '运行 npm run build 验证构建无误' },
                { n: 4, text: 'git add . && git commit -m "update: 工具组合更新" && git push' },
                { n: 5, text: 'Cloudflare 自动部署，约1-3分钟后生效 ✓' },
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

      {/* 筛选 */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: '#64748B' }}>场景：</span>
        {scenes.map(s => (
          <button key={s} onClick={() => setSceneFilter(s)}
            style={{ padding: '4px 11px', borderRadius: 20, border: `1.5px solid ${sceneFilter === s ? '#D97706' : '#CBD5E0'}`, background: sceneFilter === s ? '#FEF3C7' : '#fff', color: sceneFilter === s ? '#92400E' : '#64748B', cursor: 'pointer', fontSize: 11, fontFamily: 'sans-serif' }}>
            {s === '全部' ? '全部' : (SCENE_LABELS[s] || s)}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: '#64748B' }}>类型：</span>
        {['全部', 'free', 'mid', 'pro'].map(t => (
          <button key={t} onClick={() => setTierFilter(t)}
            style={{ padding: '4px 11px', borderRadius: 20, border: `1.5px solid ${tierFilter === t ? '#D97706' : '#CBD5E0'}`, background: tierFilter === t ? '#FEF3C7' : '#fff', color: tierFilter === t ? '#92400E' : '#64748B', cursor: 'pointer', fontSize: 11, fontFamily: 'sans-serif' }}>
            {t === '全部' ? '全部' : TIER_STYLE[t]?.label || t}
          </button>
        ))}
      </div>

      {/* 组合列表 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.map(combo => {
          const ts = TIER_STYLE[combo.tier] || TIER_STYLE.mid
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
                  <span>🌐 {combo.netSummary === 'cn' ? '国内直连' : combo.netSummary === 'vpn' ? '需要梯子' : '均可'}</span>
                  <span>👤 {combo.bestFor}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0, flexDirection: 'column', alignItems: 'flex-end' }}>
                <div style={{ display: 'flex', gap: 5 }}>
                  <button onClick={() => setEditing({ combo, scene: combo.scene })}
                    style={{ fontSize: 11, padding: '5px 10px', borderRadius: 6, border: '1px solid #CBD5E0', background: '#fff', cursor: 'pointer', fontFamily: 'sans-serif', color: '#475569' }}>✏️ 编辑</button>
                  <button onClick={() => toggleRec(combo.id, combo.scene)}
                    style={{ fontSize: 11, padding: '5px 10px', borderRadius: 6, border: `1px solid ${combo.isRec ? '#FCD34D' : '#CBD5E0'}`, background: combo.isRec ? '#FEF3C7' : '#fff', cursor: 'pointer', fontFamily: 'sans-serif', color: combo.isRec ? '#92400E' : '#94A3B8' }}>
                    {combo.isRec ? '⭐ 取消推荐' : '☆ 设为推荐'}
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
        <ComboEditor combo={editing.combo} scene={editing.scene} onSave={c => saveCombo(c, editing.scene)} onClose={() => setEditing(null)} />
      )}
    </div>
  )
}
