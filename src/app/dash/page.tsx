'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'

function StatCard({ icon, label, value, sub, color = '#D97706', warn = false }: any) {
  return (
    <div style={{ background: '#fff', borderRadius: 14, padding: '18px 20px', border: `1.5px solid ${warn ? '#FECACA' : '#E2E8F0'}`, flex: '1 1 160px', minWidth: 140 }}>
      <div style={{ fontSize: 26, marginBottom: 6 }}>{icon}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color: warn ? '#DC2626' : color, marginBottom: 2 }}>
        {typeof value === 'string' && value.startsWith('ERR:') ? '⚠️' : value}
      </div>
      <div style={{ fontSize: 12, fontWeight: 500, color: '#374151' }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>{sub}</div>}
      {typeof value === 'string' && value.startsWith('ERR:') && (
        <div style={{ fontSize: 10, color: '#EF4444', marginTop: 3 }}>Notion连接异常</div>
      )}
    </div>
  )
}

function EnvBadge({ label, ok }: { label: string; ok: boolean }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 500, padding: '3px 9px', borderRadius: 20, background: ok ? '#E1F5EE' : '#FFF5F5', color: ok ? '#085041' : '#DC2626', border: `1px solid ${ok ? '#A7F3D0' : '#FECACA'}`, marginRight: 6, marginBottom: 6 }}>
      {ok ? '✓' : '✗'} {label}
    </span>
  )
}

export default function DashHome() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState('')

  async function load() {
    try {
      const d = await fetch('/api/dash/stats').then(r => r.json())
      setStats(d)
      setLastUpdate(new Date().toLocaleTimeString('zh-CN'))
    } catch {}
    setLoading(false)
  }

  useEffect(() => {
    load()
    const t = setInterval(load, 60000) // 每分钟自动刷新
    return () => clearInterval(t)
  }, [])

  const env = stats?.envStatus || {}
  const allEnvOk = env.hasNotionKey && env.hasUserDb && env.hasFavDb && env.hasLearnDb && env.hasHotkeysDb

  const cards = [
    { icon: '🔍', label: '今日搜索', value: stats?.todaySearches ?? '…', color: '#D97706' },
    { icon: '👤', label: '注册用户', value: loading ? '…' : stats?.totalUsers, color: '#3B82F6' },
    { icon: '⭐', label: '收藏总数', value: loading ? '…' : stats?.totalFavorites, color: '#8B5CF6' },
    { icon: '🧠', label: '待审词条', value: loading ? '…' : stats?.pendingLearn, color: '#EF4444', warn: typeof stats?.pendingLearn === 'number' && stats.pendingLearn > 0 },
    { icon: '✅', label: '已学词条', value: loading ? '…' : stats?.approvedKeywords, color: '#10B981' },
    { icon: '🛠️', label: '工具数量', value: stats?.totalTools ?? 88, color: '#F59E0B' },
  ]

  const quickLinks = [
    { href: '/dash/hotkeys', label: '🔥 热搜管理', desc: '编辑首页热门场景标签' },
    { href: '/dash/comments', label: '💬 用户建议', desc: '查看工具组合用户建议' },
    { href: '/dash/learn', label: '🧠 词库审核', desc: '审核AI学习的新关键词' },
    { href: '/dash/tools', label: '🔧 工具管理', desc: '查看88个工具详情' },
    { href: '/dash/combos', label: '🃏 组合管理', desc: '查看36套工具组合' },
    { href: '/dash/logos', label: '🖼️ Logo管理', desc: '查看/更新工具Logo' },
  ]

  return (
    <div style={{ padding: '28px 28px 60px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 8 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1E293B', marginBottom: 2 }}>📊 数据概览</h1>
          <p style={{ fontSize: 12, color: '#94A3B8' }}>GO悟空管理后台 {lastUpdate && `· 最后更新 ${lastUpdate}`}</p>
        </div>
        <button onClick={load} style={{ padding: '8px 16px', background: '#F1F5F9', border: '1px solid #CBD5E0', borderRadius: 10, fontSize: 12, cursor: 'pointer', fontFamily: 'sans-serif', color: '#475569' }}>
          🔄 刷新数据
        </button>
      </div>

      {/* 环境变量状态 */}
      <div style={{ background: allEnvOk ? '#F0FDF9' : '#FFF5F5', border: `1px solid ${allEnvOk ? '#6EE7B7' : '#FECACA'}`, borderRadius: 12, padding: '12px 16px', marginBottom: 20 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: allEnvOk ? '#065F46' : '#DC2626', margin: '0 0 8px' }}>
          {allEnvOk ? '✅ 环境变量已全部配置' : '⚠️ 部分环境变量未配置（Cloudflare Pages → Settings → Environment variables）'}
        </p>
        <div>
          <EnvBadge label="NOTION_API_KEY" ok={env.hasNotionKey} />
          <EnvBadge label="NOTION_USER_DB_ID" ok={env.hasUserDb} />
          <EnvBadge label="NOTION_FAVORITES_DB_ID" ok={env.hasFavDb} />
          <EnvBadge label="NOTION_LEARN_DB_ID" ok={env.hasLearnDb} />
          <EnvBadge label="NOTION_HOTKEYS_DB_ID" ok={env.hasHotkeysDb} />
        </div>
        {!allEnvOk && (
          <p style={{ fontSize: 11, color: '#7F1D1D', margin: '8px 0 0' }}>
            ⚠️ 未配置的变量会导致对应功能无法使用。配置完成后需点击 Cloudflare 的 Retry deployment 重新部署。
          </p>
        )}
      </div>

      {/* 统计卡片 */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 28 }}>
        {cards.map(c => <StatCard key={c.label} {...c} />)}
      </div>

      {/* 快捷入口 */}
      <h2 style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 12 }}>快捷操作</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
        {quickLinks.map(l => (
          <Link key={l.href} href={l.href}
            style={{ display: 'block', padding: '14px 16px', background: '#fff', borderRadius: 12, border: '1.5px solid #E2E8F0', textDecoration: 'none', transition: 'border-color .15s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#D97706'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#E2E8F0'}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#1E293B', marginBottom: 3 }}>{l.label}</div>
            <div style={{ fontSize: 11, color: '#94A3B8' }}>{l.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}
