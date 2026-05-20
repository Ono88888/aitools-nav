'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function SiteHeader() {
  const [lang, setLang] = useState('zh')
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('wk_lang')
      if (saved === 'en' || saved === 'zh') setLang(saved)
    } catch {}
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'wk_lang' && (e.newValue === 'zh' || e.newValue === 'en')) setLang(e.newValue)
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const nav = lang === 'zh'
    ? [{ href: '/tools/', label: '全部工具' }, { href: '/compare/', label: '工具对比' }, { href: '/weekly/', label: 'AI周报' }]
    : [{ href: '/tools/', label: 'All Tools' }, { href: '/compare/', label: 'Compare' }, { href: '/weekly/', label: 'Weekly' }]

  function toggleLang() {
    const next = lang === 'zh' ? 'en' : 'zh'
    setLang(next)
    try { localStorage.setItem('wk_lang', next); window.dispatchEvent(new StorageEvent('storage', { key: 'wk_lang', newValue: next })) } catch {}
  }

  return (
    <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur-sm border-b border-black/[0.06]">
      <div className="max-w-content mx-auto px-4 h-14 flex items-center justify-between gap-2">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity flex-shrink-0 min-w-0">
          <img src="/wukong-logo.png" alt="GO悟空" width={26} height={26} style={{ objectFit: 'contain', flexShrink: 0 }} />
          <div className="flex flex-col leading-tight min-w-0">
            <span className="font-serif text-sm font-semibold text-ink whitespace-nowrap">GO悟空</span>
            <span className="text-[10px] text-ink-3 hidden sm:block whitespace-nowrap">GoWuKong.co</span>
          </div>
        </Link>

        {/* 桌面导航 — 768px 以上显示 */}
        <nav className="hidden md:flex items-center gap-0.5 flex-1 justify-center">
          {nav.map(item => (
            <Link key={item.href} href={item.href}
              className="text-sm text-ink-2 hover:text-ink px-3 py-1.5 rounded-lg hover:bg-surface-2 transition-colors whitespace-nowrap">
              {item.label}
            </Link>
          ))}
        </nav>

        {/* 右侧按钮组 */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* 语言切换 — 手机端隐藏，通过汉堡菜单操作 */}
          <button onClick={toggleLang}
            className="text-xs font-medium text-ink-3 hover:text-ink px-2 py-1 rounded-md hover:bg-surface-2 transition-colors hidden sm:block">
            {lang === 'zh' ? 'EN' : '中'}
          </button>
          {/* 登录按钮 — 手机端缩短为图标样式 */}
          <Link href="/auth/login/"
            className="text-sm font-medium px-3 py-1.5 rounded-lg border border-brand text-brand hover:bg-brand hover:text-white transition-colors whitespace-nowrap"
            style={{ fontSize: '12px', padding: '5px 10px' }}>
            <span className="hidden sm:inline">登录</span>
            <span className="sm:hidden">登录</span>
          </Link>
          {/* 移动端汉堡菜单按钮 — md 以下显示 */}
          <button onClick={() => setMenuOpen(v => !v)}
            className="md:hidden p-1.5 rounded-lg hover:bg-surface-2 transition-colors flex-shrink-0"
            aria-label="菜单">
            <div style={{ width: 18, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ display: 'block', height: 2, background: '#374151', borderRadius: 1, transition: 'all .2s', transform: menuOpen ? 'translateY(6px) rotate(45deg)' : 'none' }} />
              <span style={{ display: 'block', height: 2, background: '#374151', borderRadius: 1, transition: 'all .2s', opacity: menuOpen ? 0 : 1 }} />
              <span style={{ display: 'block', height: 2, background: '#374151', borderRadius: 1, transition: 'all .2s', transform: menuOpen ? 'translateY(-6px) rotate(-45deg)' : 'none' }} />
            </div>
          </button>
        </div>
      </div>

      {/* 移动端展开菜单 */}
      {menuOpen && (
        <div className="md:hidden border-t border-black/[0.06] bg-surface/98">
          <nav className="max-w-content mx-auto px-4 py-3 flex flex-col gap-1">
            {nav.map(item => (
              <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)}
                className="text-sm text-ink-2 hover:text-ink px-3 py-2.5 rounded-lg hover:bg-surface-2 transition-colors">
                {item.label}
              </Link>
            ))}
            <button onClick={() => { toggleLang(); setMenuOpen(false) }}
              className="text-sm text-ink-3 hover:text-ink px-3 py-2.5 rounded-lg hover:bg-surface-2 transition-colors text-left">
              {lang === 'zh' ? '切换到 English' : '切换到中文'}
            </button>
          </nav>
        </div>
      )}
    </header>
  )
}
