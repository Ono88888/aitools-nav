import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="max-w-content mx-auto px-4 py-24 text-center">
      <div className="text-6xl mb-6">🔍</div>
      <h1 className="font-serif text-3xl font-semibold text-ink mb-3">页面未找到</h1>
      <p className="text-ink-3 mb-8">这个工具页面不存在，或者已经被移除了。</p>
      <div className="flex gap-3 justify-center">
        <Link href="/" className="btn-affiliate">回到首页</Link>
        <Link href="/tools/" className="btn-secondary">浏览全部工具</Link>
      </div>
    </div>
  )
}
