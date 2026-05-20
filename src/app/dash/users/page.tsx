'use client'
import React, { useEffect, useState } from 'react'

interface User {
  id: string
  email: string
  phone: string
  createdAt: string
  lastActive: string
  dailyCount: number
  totalSearches: number
  status: 'active' | 'banned'
  topTags: string[]  // 最多3个常用标签
}

function Badge({ label, color = '#64748B', bg = '#F1F5F9' }: { label: string; color?: string; bg?: string }) {
  return <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: bg, color, fontWeight: 500, whiteSpace: 'nowrap' }}>{label}</span>
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all'|'active'|'banned'>('all')
  const [msg, setMsg] = useState('')

  useEffect(() => { load() }, [filter])

  async function load() {
    setLoading(true); setError('')
    try {
      const r = await fetch(`/api/dash/users?filter=${filter}`).then(r => r.json())
      if (r.error) { setError(r.error); setLoading(false); return }
      setUsers(r.users || [])
    } catch(e: any) { setError(e.message) }
    setLoading(false)
  }

  async function banUser(id: string, ban: boolean) {
    await fetch('/api/dash/users', { method: 'PATCH', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ id, status: ban ? 'banned' : 'active' }) })
    setMsg(ban ? '已封禁用户' : '已恢复用户')
    setTimeout(() => setMsg(''), 2000)
    load()
  }

  const filtered = users.filter(u =>
    !search || u.email?.toLowerCase().includes(search.toLowerCase()) || u.phone?.includes(search)
  )

  const STATUS_BADGE = { active: { bg: '#E1F5EE', color: '#085041' }, banned: { bg: '#FFF5F5', color: '#991B1B' } }
  const TAG_COLORS = ['#EFF6FF|#1D4ED8', '#FEF3C7|#92400E', '#F0FDF9|#065F46']

  return (
    <div style={{ padding: '28px 28px 60px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1E293B', marginBottom: 4 }}>👤 用户管理</h1>
          <p style={{ fontSize: 12, color: '#94A3B8' }}>共 {users.length} 名注册用户</p>
        </div>
        <button onClick={load} style={{ padding: '8px 16px', background: '#F1F5F9', border: '1px solid #CBD5E0', borderRadius: 10, fontSize: 12, cursor: 'pointer', fontFamily: 'sans-serif', color: '#475569' }}>🔄 刷新</button>
      </div>

      {/* 统计卡片 */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { label: '总用户数', value: users.length, color: '#3B82F6' },
          { label: '活跃用户', value: users.filter(u => u.status === 'active').length, color: '#10B981' },
          { label: '已封禁', value: users.filter(u => u.status === 'banned').length, color: '#EF4444' },
          { label: '今日搜索', value: users.reduce((s, u) => s + (u.dailyCount || 0), 0), color: '#D97706' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', border: '1.5px solid #E2E8F0', borderRadius: 12, padding: '14px 20px', flex: '1 1 120px' }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 11, color: '#64748B' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* 搜索 + 筛选 */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索邮箱或手机号..."
          style={{ padding: '8px 12px', fontSize: 13, border: '1.5px solid #CBD5E0', borderRadius: 10, outline: 'none', width: 240, fontFamily: 'sans-serif', background: '#fff', color: '#1E293B' }} />
        {(['all','active','banned'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: '5px 14px', borderRadius: 20, border: `1.5px solid ${filter===f?'#D97706':'#CBD5E0'}`, background: filter===f?'#FEF3C7':'#fff', color: filter===f?'#92400E':'#64748B', cursor: 'pointer', fontSize: 12, fontFamily: 'sans-serif', fontWeight: filter===f?600:400 }}>
            {f === 'all' ? '全部' : f === 'active' ? '活跃' : '已封禁'}
          </button>
        ))}
      </div>

      {msg && <div style={{ padding: '8px 14px', background: '#E1F5EE', color: '#085041', borderRadius: 8, marginBottom: 12, fontSize: 13 }}>{msg}</div>}

      {/* 错误提示 */}
      {error && (
        <div style={{ padding: '14px 18px', background: '#FFF5F5', border: '1px solid #FECACA', borderRadius: 10, marginBottom: 16 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#DC2626', margin: '0 0 4px' }}>❌ 加载失败</p>
          <p style={{ fontSize: 12, color: '#7F1D1D', margin: 0 }}>{error}</p>
          <p style={{ fontSize: 11, color: '#94A3B8', margin: '8px 0 0' }}>请确认已在 Cloudflare 配置 NOTION_USER_DB_ID 环境变量，并且 Integration 已授权访问该数据库</p>
        </div>
      )}

      {/* 用户表格 */}
      <div style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #E2E8F0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F8FAFC' }}>
              {['邮箱/手机', '注册时间', '今日搜索', '状态', '常用标签（Top 3）', '操作'].map(h => (
                <th key={h} style={{ padding: '11px 14px', fontSize: 11, fontWeight: 600, color: '#64748B', textAlign: 'left', borderBottom: '1px solid #E2E8F0', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: '#94A3B8' }}>加载中…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: '#94A3B8' }}>暂无用户数据</td></tr>
            ) : filtered.map((user, i) => {
              const sb = STATUS_BADGE[user.status] || STATUS_BADGE.active
              return (
                <tr key={user.id} style={{ borderBottom: '1px solid #F1F5F9', background: i%2===0?'#fff':'#FAFAFA' }}>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#1E293B' }}>{user.email || user.phone || '—'}</div>
                    {user.email && user.phone && <div style={{ fontSize: 11, color: '#94A3B8' }}>{user.phone}</div>}
                    <div style={{ fontSize: 10, color: '#CBD5E0', fontFamily: 'monospace' }}>{user.id.slice(0,8)}…</div>
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: 12, color: '#64748B', whiteSpace: 'nowrap' }}>
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString('zh-CN') : '—'}
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: 13, fontWeight: 600, color: user.dailyCount > 0 ? '#D97706' : '#CBD5E0', textAlign: 'center' }}>
                    {user.dailyCount || 0}
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <Badge label={user.status === 'active' ? '活跃' : '已封禁'} bg={sb.bg} color={sb.color} />
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {(user.topTags || []).slice(0,3).map((tag, ti) => {
                        const [tbg, tc] = TAG_COLORS[ti]?.split('|') || ['#F1F5F9','#64748B']
                        return <Badge key={tag} label={tag} bg={tbg} color={tc} />
                      })}
                      {(!user.topTags || user.topTags.length === 0) && <span style={{ fontSize: 11, color: '#CBD5E0' }}>暂无数据</span>}
                    </div>
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <button onClick={() => banUser(user.id, user.status === 'active')}
                      style={{ fontSize: 11, padding: '4px 10px', borderRadius: 6, border: `1px solid ${user.status === 'active' ? '#FECACA' : '#A7F3D0'}`, background: user.status === 'active' ? '#FFF5F5' : '#E1F5EE', color: user.status === 'active' ? '#EF4444' : '#085041', cursor: 'pointer', fontFamily: 'sans-serif', whiteSpace: 'nowrap' }}>
                      {user.status === 'active' ? '封禁' : '恢复'}
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <p style={{ fontSize: 11, color: '#94A3B8', marginTop: 12 }}>
        注：常用标签来源于用户搜索记录，停留时长功能需接入前端埋点系统后才能统计（当前版本暂不支持）
      </p>
    </div>
  )
}
