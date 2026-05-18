'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'

function StatCard({ icon, label, value, sub, color = '#D97706' }: any) {
  return (
    <div style={{ background: '#fff', borderRadius: 14, padding: '20px 22px', border: '1.5px solid #E2E8F0', flex: '1 1 180px' }}>
      <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
      <div style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 3 }}>{sub}</div>}
    </div>
  )
}

export default function DashHome() {
  const [stats, setStats] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dash/stats').then(r => r.json()).then(d => { setStats(d); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const cards = [
    { icon: '🔍', label: '今日搜索', value: loading ? '…' : (stats.todaySearches ?? '-'), color: '#D97706' },
    { icon: '👤', label: '注册用户', value: loading ? '…' : (stats.totalUsers ?? '-'), color: '#3B82F6' },
    { icon: '⭐', label: '收藏总数', value: loading ? '…' : (stats.totalFavorites ?? '-'), color: '#8B5CF6' },
    { icon: '💬', label: '待审评论', value: loading ? '…' : (stats.pendingComments ?? '-'), color: '#EF4444' },
    { icon: '🧠', label: '学习词条', value: loading ? '…' : (stats.learnedKeywords ?? '-'), color: '#10B981' },
    { icon: '🛠️', label: '工具总数', value: loading ? '…' : (stats.totalTools ?? '-'), color: '#F59E0B' },
  ]

  const quickLinks = [
    { href: '/dash/hotkeys', label: '🔥 管理热搜', desc: '编辑首页热门场景标签' },
    { href: '/dash/comments', label: '💬 处理建议', desc: '查看用户对工具组合的建议' },
    { href: '/dash/learn', label: '🧠 审核词库', desc: '审核AI学习的新关键词' },
    { href: '/dash/tools', label: '🔧 添加工具', desc: '新增工具到工具库' },
    { href: '/dash/combos', label: '🃏 管理组合', desc: '编辑工具组合卡片' },
    { href: '/dash/logos', label: '🖼️ 更新Logo', desc: '上传工具Logo图片' },
  ]

  return (
    <div style={{ padding: '28px 28px 60px' }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1E293B', marginBottom: 4 }}>数据概览</h1>
      <p style={{ fontSize: 13, color: '#64748B', marginBottom: 24 }}>GO悟空管理后台 — 最后更新 {new Date().toLocaleTimeString('zh-CN')}</p>

      {/* 统计卡片 */}
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 28 }}>
        {cards.map(c => <StatCard key={c.label} {...c} />)}
      </div>

      {/* 快捷入口 */}
      <h2 style={{ fontSize: 15, fontWeight: 600, color: '#374151', marginBottom: 14 }}>快捷操作</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
        {quickLinks.map(l => (
          <Link key={l.href} href={l.href} style={{ display: 'block', padding: '16px 18px', background: '#fff', borderRadius: 12, border: '1.5px solid #E2E8F0', textDecoration: 'none', transition: 'border-color .15s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#D97706'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#E2E8F0'}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#1E293B', marginBottom: 4 }}>{l.label}</div>
            <div style={{ fontSize: 12, color: '#94A3B8' }}>{l.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}
