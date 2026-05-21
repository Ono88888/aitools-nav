'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'

function StatCard({ icon, label, value, color = '#D97706' }: any) {
  return (
    <div style={{ background: '#fff', borderRadius: 14, padding: '18px 20px', border: '1.5px solid #E2E8F0', flex: '1 1 140px', minWidth: 130 }}>
      <div style={{ fontSize: 26, marginBottom: 6 }}>{icon}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
      <div style={{ fontSize: 12, fontWeight: 500, color: '#374151' }}>{label}</div>
    </div>
  )
}

function APIStatusRow({ item }: { item: any }) {
  const TYPE_ICON: Record<string,string> = { notion: '📋', deepseek: '🐋', ads: '📢' }
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', background: item.ok ? '#F0FDF9' : (item.optional ? '#FFFBEB' : '#FFF5F5'), border: `1px solid ${item.ok ? '#A7F3D0' : (item.optional ? '#FCD34D' : '#FECACA')}`, borderRadius: 10, marginBottom: 6 }}>
      <span style={{ fontSize: 16 }}>{TYPE_ICON[item.type] || '🔌'}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#1E293B' }}>{item.name}</div>
        <div style={{ fontSize: 11, color: '#64748B', marginTop: 1 }}>{item.reason}</div>
      </div>
      <span style={{ fontSize: 12, fontWeight: 700, color: item.ok ? '#16a34a' : (item.optional ? '#D97706' : '#DC2626'), flexShrink: 0, padding: '3px 10px', borderRadius: 20, background: item.ok ? '#E1F5EE' : (item.optional ? '#FEF3C7' : '#FFF5F5') }}>
        {item.ok ? '✓ 正常' : (item.optional ? '~ 未配置' : '✗ 异常')}
      </span>
    </div>
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
    } catch(e) { console.error(e) }
    setLoading(false)
  }

  useEffect(() => { load(); const t = setInterval(load, 60000); return () => clearInterval(t) }, [])

  const apiList: any[] = stats?.apiStatus || []
  const allOk = apiList.filter(a => !a.optional).every(a => a.ok)
  const errorCount = apiList.filter(a => !a.optional && !a.ok).length

  const cards = [
    { icon: '👤', label: '注册用户', value: loading ? '…' : stats?.totalUsers, color: '#3B82F6' },
    { icon: '🖱️', label: '总点击量', value: loading ? '…' : stats?.totalClicks, color: '#F59E0B' },
    { icon: '👁️', label: '今日访问', value: loading ? '…' : stats?.todaySearches, color: '#10B981' },
    { icon: '⭐', label: '收藏总数', value: loading ? '…' : stats?.totalFavorites, color: '#8B5CF6' },
    { icon: '🧠', label: '待审词条', value: loading ? '…' : stats?.pendingLearn, color: '#EF4444' },
    { icon: '🛠️', label: '工具总数', value: 88, color: '#F59E0B' },
  ]

  const quickLinks = [
    { href: '/dash/hotkeys', label: '🔥 热搜管理', desc: '编辑首页热门场景标签' },
    { href: '/dash/submissions', label: '📬 收录申请', desc: '审核用户提交的工具' },
    { href: '/dash/comments', label: '💬 用户建议', desc: '查看工具组合用户建议' },
    { href: '/dash/learn', label: '🧠 词库审核', desc: '审核AI学习的新关键词' },
    { href: '/dash/tools', label: '🔧 工具管理', desc: '增删改查88个工具' },
    { href: '/dash/combos', label: '🃏 组合管理', desc: '可视化管理36套组合' },
    { href: '/dash/logos', label: '🖼️ Logo管理', desc: '编辑工具Logo图片' },
    { href: '/dash/analytics', label: '📈 搜索排行', desc: '热门搜索词统计' },
  ]

  return (
    <div style={{ padding: '28px 28px 60px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 8 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1E293B', marginBottom: 2 }}>📊 数据概览</h1>
          <p style={{ fontSize: 12, color: '#94A3B8' }}>GO悟空管理后台 {lastUpdate && `· 最后更新 ${lastUpdate}`}</p>
        </div>
        <button onClick={load} style={{ padding: '8px 16px', background: '#F1F5F9', border: '1px solid #CBD5E0', borderRadius: 10, fontSize: 12, cursor: 'pointer', fontFamily: 'sans-serif', color: '#475569' }}>🔄 刷新</button>
      </div>

      {/* API状态总览 */}
      <div style={{ background: allOk ? '#F0FDF9' : '#FFF5F5', border: `1.5px solid ${allOk ? '#6EE7B7' : '#FECACA'}`, borderRadius: 14, padding: '16px 20px', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: allOk ? '#065F46' : '#DC2626', margin: 0 }}>
            {loading ? '⏳ 检测中…' : allOk ? '✅ 所有 API 连接正常' : `⚠️ ${errorCount} 个 API 连接异常`}
          </p>
          {!allOk && !loading && (
            <p style={{ fontSize: 11, color: '#7F1D1D', margin: 0 }}>请检查 Cloudflare 环境变量配置，修改后点击 Retry deployment 重新部署</p>
          )}
        </div>
        {loading ? (
          <div style={{ color: '#94A3B8', fontSize: 13 }}>正在检测各API状态…</div>
        ) : (
          <div>
            {/* Notion区 */}
            <p style={{ fontSize: 11, fontWeight: 700, color: '#64748B', marginBottom: 6, marginTop: 0 }}>📋 Notion 数据库</p>
            {apiList.filter(a => a.type === 'notion').map((item, i) => <APIStatusRow key={i} item={item} />)}
            {/* DeepSeek区 */}
            <p style={{ fontSize: 11, fontWeight: 700, color: '#64748B', margin: '12px 0 6px' }}>🤖 AI 推荐 API</p>
            {apiList.filter(a => a.type === 'deepseek').map((item, i) => <APIStatusRow key={i} item={item} />)}
            {/* 广告区 */}
            <p style={{ fontSize: 11, fontWeight: 700, color: '#64748B', margin: '12px 0 6px' }}>📢 广告 API（可选）</p>
            {apiList.filter(a => a.type === 'ads').map((item, i) => <APIStatusRow key={i} item={item} />)}
          </div>
        )}
      </div>

      {/* 数据统计 */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
        {cards.map(c => <StatCard key={c.label} {...c} />)}
      </div>

      {/* 快捷入口 */}
      <h2 style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 12 }}>快捷操作</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 10 }}>
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
