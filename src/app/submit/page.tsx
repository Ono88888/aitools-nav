export const metadata = { title: '提交工具收录' }

export default function SubmitPage() {
  return (
    <div className="max-w-content mx-auto px-4 py-12">
      <div className="max-w-lg">
        <h1 className="font-serif text-3xl font-semibold text-ink mb-2">提交工具收录</h1>
        <p className="text-ink-3 text-sm mb-8">发现了好用的AI工具？告诉我，我会评测后决定是否收录。</p>
        <div className="bg-surface-2 border border-black/[0.07] rounded-xl p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-ink-2 mb-1.5">工具名称 *</label>
            <input type="text" placeholder="如：Cursor AI" className="w-full px-3 py-2 text-sm border border-black/[0.1] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand/30" />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-2 mb-1.5">官网链接 *</label>
            <input type="url" placeholder="https://..." className="w-full px-3 py-2 text-sm border border-black/[0.1] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand/30" />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-2 mb-1.5">推荐理由（可选）</label>
            <textarea rows={3} placeholder="这个工具解决了什么问题？适合什么场景？" className="w-full px-3 py-2 text-sm border border-black/[0.1] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand/30 resize-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-2 mb-1.5">您的邮箱（可选，收录后通知您）</label>
            <input type="email" placeholder="your@email.com" className="w-full px-3 py-2 text-sm border border-black/[0.1] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand/30" />
          </div>
          <a href="mailto:hello@yourdomain.com?subject=工具收录申请" className="btn-affiliate w-full justify-center">
            发送申请
          </a>
          <p className="text-xs text-ink-4 text-center">目前通过邮件接收申请，通常3个工作日内回复</p>
        </div>
      </div>
    </div>
  )
}
