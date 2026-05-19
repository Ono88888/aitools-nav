'use client'
import React, { useEffect, useState } from 'react'

interface HotKey { id: string; label: string; query: string; icon: string; clickCount: number; searchCount: number; enabled: boolean; order: number }

export default function HotkeysPage() {
  const [keys, setKeys] = useState<HotKey[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState<HotKey | null>(null)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    setError('')
    try {
      const r = await fetch('/api/dash/hotkeys').then(r => r.json())
      if (r.error) { setError(r.error); setLoading(false); return }
      setKeys(r.keys || [])
    } catch(e: any) {
      setError('网络请求失败: ' + e.message)
    }
    setLoading(false)
  }

  async function save(key: HotKey) {
    setSaving(true)
    await fetch('/api/dash/hotkeys', { method: editing?.id === 'new' ? 'POST' : 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(key) })
    setSaving(false); setEditing(null)
    setMsg('保存成功'); setTimeout(() => setMsg(''), 2000)
    load()
  }

  async function del(id: string) {
    if (!confirm('确认删除？')) return
    await fetch(`/api/dash/hotkeys?id=${id}`, { method: 'DELETE' })
    setMsg('已删除'); setTimeout(() => setMsg(''), 2000)
    load()
  }

  const inp: React.CSSProperties = { width: '100%', padding: '8px 11px', fontSize: 13, border: '1.5px solid #CBD5E0', borderRadius: 8, outline: 'none', fontFamily: 'sans-serif', boxSizing: 'border-box' }

  return (
    <div style={{ padding: '28px 28px 60px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1E293B', marginBottom: 2 }}>🔥 热搜标签管理</h1>
          <p style={{ fontSize: 12, color: '#94A3B8' }}>管理首页热门场景按钮，查看点击和搜索次数</p>
        </div>
        <button onClick={() => setEditing({ id: 'new', label: '', query: '', icon: '🔥', clickCount: 0, searchCount: 0, enabled: true, order: 0 })}
          style={{ padding: '9px 18px', background: '#D97706', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          ＋ 新增标签
        </button>
      </div>

      {msg && <div style={{ padding: '10px 14px', background: '#E1F5EE', color: '#085041', borderRadius: 8, marginBottom: 14, fontSize: 13 }}>{msg}</div>}

      {/* 表格 */}
      <div style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #E2E8F0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F8FAFC' }}>
              {['排序','图标','标签名','查询词','点击数↓','搜索数','状态','操作'].map(h => (
                <th key={h} style={{ padding: '11px 14px', fontSize: 12, fontWeight: 600, color: '#64748B', textAlign: 'left', borderBottom: '1px solid #E2E8F0' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ padding: 40, textAlign: 'center', color: '#94A3B8' }}>加载中…</td></tr>
            ) : error ? (
              <tr><td colSpan={8} style={{ padding: 30 }}>
                <div style={{ background: '#FFF5F5', border: '1px solid #FECACA', borderRadius: 10, padding: '16px 18px' }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#DC2626', margin: '0 0 6px' }}>❌ 加载失败</p>
                  <p style={{ fontSize: 13, color: '#7F1D1D', margin: '0 0 10px' }}>{error}</p>
                  <p style={{ fontSize: 12, color: '#94A3B8', margin: 0 }}>
                    请检查：<br/>
                    1. Cloudflare Pages 环境变量里是否已设置 <code>NOTION_API_KEY</code><br/>
                    2. 环境变量里是否已设置 <code>NOTION_HOTKEYS_DB_ID</code><br/>
                    3. Notion Integration 是否已授权访问该数据库<br/>
                    4. 设置环境变量后需要重新部署（Retry deployment）
                  </p>
                </div>
              </td></tr>
            ) : keys.sort((a,b) => b.clickCount - a.clickCount).map((k, i) => (
              <tr key={k.id} style={{ borderBottom: '1px solid #F1F5F9', background: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                <td style={{ padding: '10px 14px', fontSize: 13, color: '#64748B' }}>{k.order}</td>
                <td style={{ padding: '10px 14px', fontSize: 20 }}>{k.icon}</td>
                <td style={{ padding: '10px 14px', fontSize: 13, fontWeight: 500, color: '#1E293B' }}>{k.label}</td>
                <td style={{ padding: '10px 14px', fontSize: 12, color: '#64748B' }}>{k.query}</td>
                <td style={{ padding: '10px 14px', fontSize: 14, fontWeight: 700, color: '#D97706' }}>{k.clickCount.toLocaleString()}</td>
                <td style={{ padding: '10px 14px', fontSize: 14, fontWeight: 600, color: '#3B82F6' }}>{k.searchCount.toLocaleString()}</td>
                <td style={{ padding: '10px 14px' }}>
                  <span style={{ fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 20, background: k.enabled ? '#E1F5EE' : '#FEE2E2', color: k.enabled ? '#085041' : '#991B1B' }}>{k.enabled ? '展示' : '隐藏'}</span>
                </td>
                <td style={{ padding: '10px 14px', display: 'flex', gap: 6 }}>
                  <button onClick={() => setEditing(k)} style={{ fontSize: 12, padding: '4px 10px', borderRadius: 6, border: '1px solid #CBD5E0', background: '#fff', cursor: 'pointer' }}>编辑</button>
                  <button onClick={() => del(k.id)} style={{ fontSize: 12, padding: '4px 10px', borderRadius: 6, border: '1px solid #FECACA', background: '#FFF5F5', color: '#EF4444', cursor: 'pointer' }}>删除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 编辑弹窗 */}
      {editing && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={e => e.target === e.currentTarget && setEditing(null)}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 24, width: 420, boxShadow: '0 8px 40px #00000020' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1E293B', marginBottom: 18 }}>{editing.id === 'new' ? '新增热搜标签' : '编辑热搜标签'}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <input value={editing.icon} onChange={e => setEditing({...editing, icon: e.target.value})} placeholder="图标emoji" style={{ ...inp, width: 80 }} />
                <input value={editing.label} onChange={e => setEditing({...editing, label: e.target.value})} placeholder="标签名（如：短视频创作）" style={{ ...inp, flex: 1 }} />
              </div>
              <input value={editing.query} onChange={e => setEditing({...editing, query: e.target.value})} placeholder="查询词（如：做短视频）" style={inp} />
              <input type="number" value={editing.order} onChange={e => setEditing({...editing, order: Number(e.target.value)})} placeholder="排序权重（数字越小越靠前）" style={inp} />
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#374151', cursor: 'pointer' }}>
                <input type="checkbox" checked={editing.enabled} onChange={e => setEditing({...editing, enabled: e.target.checked})} />
                在首页展示
              </label>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
              <button onClick={() => save(editing)} disabled={!editing.label || !editing.query || saving}
                style={{ flex: 1, padding: '10px', background: '#D97706', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                {saving ? '保存中…' : '保存'}
              </button>
              <button onClick={() => setEditing(null)} style={{ padding: '10px 18px', background: '#F1F5F9', color: '#64748B', border: 'none', borderRadius: 10, fontSize: 13, cursor: 'pointer' }}>取消</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
