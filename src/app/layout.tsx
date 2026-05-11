import type { Metadata } from 'next'
import Link from 'next/link'
import './globals.css'
import { SITE_NAME, SITE_URL } from '@/lib/utils'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME} - 发现最好用的AI工具`, template: `%s | ${SITE_NAME}` },
  description: '精选AI工具深度评测，帮你找到最适合的AI助手、写作工具、编程工具和办公提效工具。',
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    siteName: SITE_NAME,
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <head>
        {/* Google Fonts — 预连接减少延迟 */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {/* ── 全局导航 ── */}
        <header className="sticky top-0 z-50 bg-surface/95 backdrop-blur-sm border-b border-black/[0.06]">
          <div className="max-w-content mx-auto px-4 h-14 flex items-center justify-between">
            <Link href="/" className="font-serif text-lg font-semibold text-ink hover:text-brand transition-colors">
              {SITE_NAME}
            </Link>
            <nav className="flex items-center gap-1" aria-label="主导航">
              <Link href="/tools/" className="text-sm text-ink-2 hover:text-ink px-3 py-1.5 rounded-lg hover:bg-surface-2 transition-colors">
                全部工具
              </Link>
              <Link href="/categories/" className="text-sm text-ink-2 hover:text-ink px-3 py-1.5 rounded-lg hover:bg-surface-2 transition-colors">
                分类
              </Link>
              <Link href="/compare/" className="text-sm text-ink-2 hover:text-ink px-3 py-1.5 rounded-lg hover:bg-surface-2 transition-colors">
                工具对比
              </Link>
              <Link href="/weekly/" className="text-sm text-ink-2 hover:text-ink px-3 py-1.5 rounded-lg hover:bg-surface-2 transition-colors">
                AI周报
              </Link>
            </nav>
          </div>
        </header>

        {/* ── 页面内容 ── */}
        <main>{children}</main>

        {/* ── 全局页脚 ── */}
        <footer className="mt-20 border-t border-black/[0.06] bg-surface-2">
          <div className="max-w-content mx-auto px-4 py-10">
            <div className="flex flex-col md:flex-row justify-between gap-6">
              <div>
                <div className="font-serif text-base font-semibold text-ink mb-2">{SITE_NAME}</div>
                <p className="text-sm text-ink-3 max-w-xs leading-relaxed">
                  精选AI工具深度评测，独立运营，评分基于实测，不受广告主影响。
                </p>
              </div>
              <div className="flex gap-12 text-sm text-ink-3">
                <div className="flex flex-col gap-2">
                  <span className="font-medium text-ink-2 text-xs uppercase tracking-wide">工具</span>
                  <Link href="/tools/" className="hover:text-ink transition-colors">全部工具</Link>
                  <Link href="/categories/" className="hover:text-ink transition-colors">分类浏览</Link>
                  <Link href="/compare/" className="hover:text-ink transition-colors">横向对比</Link>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="font-medium text-ink-2 text-xs uppercase tracking-wide">关于</span>
                  <Link href="/about/" className="hover:text-ink transition-colors">关于本站</Link>
                  <Link href="/affiliate-disclosure/" className="hover:text-ink transition-colors">联盟声明</Link>
                  <Link href="/submit/" className="hover:text-ink transition-colors">提交工具</Link>
                </div>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-black/[0.06] flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-ink-4">
              <span>© {new Date().getFullYear()} {SITE_NAME}. 保留所有权利。</span>
              <span>
                本站含联盟链接 ·{' '}
                <Link href="/affiliate-disclosure/" className="underline hover:text-ink-2 transition-colors">
                  了解详情
                </Link>
              </span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
