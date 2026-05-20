'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/dash', label: '📊 概览', exact: true },
  { href: '/dash/analytics', label: '📈 流量统计' },
  { href: '/dash/hotkeys', label: '🔥 热搜管理' },
  { href: '/dash/submissions', label: '📬 收录申请' },
  { href: '/dash/combos', label: '🃏 工具组合' },
  { href: '/dash/tools', label: '🔧 工具管理' },
  { href: '/dash/comments', label: '💬 评论建议' },
  { href: '/dash/learn', label: '🧠 学习词库' },
  { href: '/dash/logos', label: '🖼️ Logo管理' },
]

export default function DashLayout({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState<boolean | null>(null)
  const [pwd, setPwd] = useState('')
  const [err, setErr] = useState('')
  const pathname = usePathname()

  // 有效密码列表：
  // 1. 构建时注入的环境变量（如果有的话）
  // 2. 硬编码备用密码（防止环境变量未注入时无法登录）
  const VALID_PWDS = [
    process.env.NEXT_PUBLIC_DASH_PWD,   // Cloudflare / .env.local 里设置的
    'wukong2025admin',                   // 硬编码备用，部署后务必改掉
  ].filter(Boolean) as string[]

  useEffect(() => {
    const saved = sessionStorage.getItem('dash_auth')
    setAuthed(saved === 'ok')
  }, [])

  function login() {
    if (VALID_PWDS.includes(pwd)) {
      sessionStorage.setItem('dash_auth', 'ok')
      setAuthed(true)
      setErr('')
    } else {
      setErr(`密码错误（当前有效密码数：${VALID_PWDS.length}）`)
    }
  }

  if (authed === null) return <div style={{ padding: 40, textAlign: 'center', color: '#64748B' }}>验证中…</div>

  if (!authed) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC' }}>
      <div style={{ background: '#fff', padding: 32, borderRadius: 16, boxShadow: '0 4px 24px #00000014', width: 320 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1E293B', marginBottom: 6 }}>🔐 管理后台</h1>
        <p style={{ fontSize: 13, color: '#94A3B8', marginBottom: 20 }}>dash.gowukong.co</p>
        <input type="password" value={pwd} onChange={e => setPwd(e.target.value)} onKeyDown={e => e.key === 'Enter' && login()}
          placeholder="管理员密码" style={{ width: '100%', padding: '10px 12px', fontSize: 14, border: '1.5px solid #CBD5E0', borderRadius: 10, outline: 'none', boxSizing: 'border-box', marginBottom: 10, fontFamily: 'sans-serif' }} />
        {err && <p style={{ fontSize: 12, color: '#EF4444', marginBottom: 8 }}>{err}</p>}
        <button onClick={login} style={{ width: '100%', padding: '10px', background: '#D97706', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>进入后台</button>
      </div>
    </div>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F1F5F9' }}>
      {/* 侧边栏 */}
      <nav style={{ width: 200, background: '#1E293B', flexShrink: 0, padding: '20px 0', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '0 16px 20px', borderBottom: '1px solid #334155' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#F8FAFC' }}>🐒 悟空后台</div>
          <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>dash.gowukong.co</div>
        </div>
        <div style={{ padding: '12px 0', flex: 1 }}>
          {NAV.map(n => {
            const active = n.exact ? pathname === n.href : pathname.startsWith(n.href)
            return (
              <Link key={n.href} href={n.href} style={{ display: 'block', padding: '9px 16px', fontSize: 13, fontWeight: active ? 600 : 400, color: active ? '#FEF3C7' : '#CBD5E0', background: active ? '#D97706' : 'transparent', textDecoration: 'none', transition: 'all .15s', borderLeft: active ? '3px solid #FEF3C7' : '3px solid transparent' }}>
                {n.label}
              </Link>
            )
          })}
        </div>
        <div style={{ padding: '12px 16px', borderTop: '1px solid #334155' }}>
          <Link href="/" style={{ fontSize: 12, color: '#94A3B8', textDecoration: 'none' }}>← 返回前台</Link>
        </div>
      </nav>
      {/* 主内容 */}
      <main style={{ flex: 1, overflow: 'auto' }}>{children}</main>
    </div>
  )
}
