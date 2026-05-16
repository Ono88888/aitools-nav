import type { Metadata } from 'next'
import Link from 'next/link'
import './globals.css'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://gowukong.co'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'GO悟空 - 找到最佳AI工具组合', template: '%s | GO悟空' },
  description: '告诉我你想做什么，GO悟空帮你找到最佳AI工具组合。精选60+AI工具，覆盖短视频、写作、编程、绘画等20+场景。',
  openGraph: { type: 'website', locale: 'zh_CN', siteName: 'GO悟空' },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/wukong-logo.png" />
        <meta name="impact-site-verification" content="d3c3df34-581c-4233-8df7-58236cb5fba5" />
      </head>
      <body>
        {/* ── 全局导航（首页会在自身内容里覆盖这个） ── */}
        <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur-sm border-b border-black/[0.06]">
          <div className="max-w-content mx-auto px-4 h-14 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <img src="/wukong-logo.png" alt="GO悟空" width={32} height={32} style={{ objectFit: 'contain' }} />
              <div className="flex flex-col leading-tight">
                <span className="font-serif text-sm font-semibold text-ink">GO悟空</span>
                <span className="text-[10px] text-ink-3">GoWuKong.co</span>
              </div>
            </Link>
            <nav className="flex items-center gap-1" aria-label="主导航">
              <Link href="/tools/" className="text-sm text-ink-2 hover:text-ink px-3 py-1.5 rounded-lg hover:bg-surface-2 transition-colors">全部工具</Link>
              <Link href="/compare/" className="text-sm text-ink-2 hover:text-ink px-3 py-1.5 rounded-lg hover:bg-surface-2 transition-colors">工具对比</Link>
              <Link href="/weekly/" className="text-sm text-ink-2 hover:text-ink px-3 py-1.5 rounded-lg hover:bg-surface-2 transition-colors">AI周报</Link>
            </nav>
          </div>
        </header>

        <main>{children}</main>

        <footer className="mt-16 border-t border-black/[0.06] bg-surface-2">
          <div className="max-w-content mx-auto px-4 py-10">
            <div className="flex flex-col md:flex-row justify-between gap-6">
              <div>
                <div className="font-serif text-base font-semibold text-ink mb-2">GO悟空 AI导航</div>
                <p className="text-sm text-ink-3 max-w-xs leading-relaxed">
                  告诉我你想做什么，我帮你找到最佳AI工具组合。独立运营，评分基于实测。
                </p>
                <p className="text-xs text-ink-4 mt-2">GoWuKong.co</p>
              </div>
              <div className="flex gap-12 text-sm text-ink-3">
                <div className="flex flex-col gap-2">
                  <span className="font-medium text-ink-2 text-xs uppercase tracking-wide">工具</span>
                  <Link href="/tools/" className="hover:text-ink transition-colors">全部工具</Link>
                  <Link href="/compare/" className="hover:text-ink transition-colors">工具对比</Link>
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
              <span>© {new Date().getFullYear()} GO悟空 GoWuKong.co. 保留所有权利。</span>
              <Link href="/affiliate-disclosure/" className="underline hover:text-ink-2 transition-colors">联盟声明</Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
