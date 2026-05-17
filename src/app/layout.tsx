import type { Metadata } from 'next'
import './globals.css'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://gowukong.co'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'GO悟空 - Find Best AI Tool Combos', template: '%s | GO悟空' },
  description: 'GO悟空 helps you find the best AI tool combinations for your needs. 60+ AI tools covering video, writing, coding, design and 20+ scenarios.',
  openGraph: { type: 'website', siteName: 'GO悟空 - GoWuKong.co' },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <head>
        <meta name="impact-site-verification" content="d3c3df34-581c-4233-8df7-58236cb5fba5" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/wukong-logo.png" />
      </head>
      <body>
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  )
}
