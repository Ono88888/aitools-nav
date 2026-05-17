'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function SiteHeader() {
  const [lang, setLang] = useState('zh')

  useEffect(() => {
    try {
      const saved = localStorage.getItem('wk_lang')
      if (saved === 'en' || saved === 'zh') setLang(saved)
    } catch {}
    // 监听语言切换事件
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'wk_lang' && (e.newValue === 'zh' || e.newValue === 'en')) {
        setLang(e.newValue)
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const nav = lang === 'zh'
    ? [{ href: '/tools/', label: '全部工具' }, { href: '/compare/', label: '工具对比' }, { href: '/weekly/', label: 'AI周报' }]
    : [{ href: '/tools/', label: 'All Tools' }, { href: '/compare/', label: 'Compare' }, { href: '/weekly/', label: 'Weekly' }]

  return (
    <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur-sm border-b border-black/[0.06]">
      <div className="max-w-content mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <img src="/wukong-logo.png" alt="GO悟空" width={32} height={32} style={{ objectFit: 'contain' }} />
          <div className="flex flex-col leading-tight">
            <span className="font-serif text-sm font-semibold text-ink">GO悟空</span>
            <span className="text-[10px] text-ink-3">GoWuKong.co</span>
          </div>
        </Link>
        <nav className="flex items-center gap-1">
          {nav.map(item => (
            <Link key={item.href} href={item.href}
              className="text-sm text-ink-2 hover:text-ink px-3 py-1.5 rounded-lg hover:bg-surface-2 transition-colors">
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
