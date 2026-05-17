'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function SiteFooter() {
  const [lang, setLang] = useState('zh')

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

  const zh = lang === 'zh'

  return (
    <footer className="mt-16 border-t border-black/[0.06] bg-surface-2">
      <div className="max-w-content mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row justify-between gap-6">
          <div>
            <div className="font-serif text-base font-semibold text-ink mb-2">GO悟空 AI Nav</div>
            <p className="text-sm text-ink-3 max-w-xs leading-relaxed">
              {zh
                ? '告诉我你想做什么，我帮你找到最佳AI工具组合。独立运营，评分基于实测。'
                : 'Tell me what you want to do, I\'ll find the best AI tool combo. Independent, ratings based on real tests.'}
            </p>
            <p className="text-xs text-ink-4 mt-2">GoWuKong.co</p>
          </div>
          <div className="flex gap-12 text-sm text-ink-3">
            <div className="flex flex-col gap-2">
              <span className="font-medium text-ink-2 text-xs uppercase tracking-wide">{zh ? '工具' : 'Tools'}</span>
              <Link href="/tools/" className="hover:text-ink transition-colors">{zh ? '全部工具' : 'All Tools'}</Link>
              <Link href="/compare/" className="hover:text-ink transition-colors">{zh ? '工具对比' : 'Compare'}</Link>
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-medium text-ink-2 text-xs uppercase tracking-wide">{zh ? '关于' : 'About'}</span>
              <Link href="/about/" className="hover:text-ink transition-colors">{zh ? '关于本站' : 'About'}</Link>
              <Link href="/affiliate-disclosure/" className="hover:text-ink transition-colors">{zh ? '联盟声明' : 'Affiliate'}</Link>
              <Link href="/submit/" className="hover:text-ink transition-colors">{zh ? '提交工具' : 'Submit Tool'}</Link>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-black/[0.06] flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-ink-4">
          <span>© {new Date().getFullYear()} GO悟空 GoWuKong.co. {zh ? '保留所有权利。' : 'All rights reserved.'}</span>
          <Link href="/affiliate-disclosure/" className="underline hover:text-ink-2 transition-colors">
            {zh ? '联盟声明' : 'Affiliate Disclosure'}
          </Link>
        </div>
      </div>
    </footer>
  )
}
