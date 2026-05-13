'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const MAX_CHARS = 200

// 热门标签（按搜索量排序，带热度标识）
const HOT_TAGS = [
  { label: '短视频创作', icon: '🎬', hot: true,  value: '做自媒体短视频，需要自动写脚本、AI配音、自动剪辑成片，中文转英文口播' },
  { label: '公众号运营', icon: '📱', hot: true,  value: '运营公众号，需要AI写文章、自动配图、一键排版发布到微信' },
  { label: '跨境电商',   icon: '🛒', hot: true,  value: '做跨境电商，需要产品描述翻译、AI客服自动回复、数据分析选品' },
  { label: 'AI绘画变现', icon: '🎨', hot: false, value: '用AI绘画接单变现，需要高质量生图、批量出图、商业授权的工具' },
  { label: '独立开发',   icon: '💻', hot: false, value: '独立开发产品，需要AI写代码、自动生成文档、快速部署上线' },
  { label: '播客制作',   icon: '🎙️', hot: false, value: '做播客节目，需要录音降噪、AI转写字幕、自动剪辑和分发到各平台' },
  { label: 'AI写作',     icon: '✍️', hot: false, value: '用AI辅助写作，需要长文生成、改写润色、查重降重工具' },
  { label: '直播带货',   icon: '📡', hot: false, value: '做直播带货，需要AI话术生成、虚拟主播、数据分析工具' },
]

// 最近搜索（模拟，实际可存 localStorage）
const RECENT_EXAMPLES = [
  '做TikTok英文短视频，需要AI配音和字幕',
  '帮我搭建个人知识库，AI整理笔记',
  '做微信社群运营，内容自动生成和发布',
]

export default function HomePage() {
  const [query, setQuery]     = useState('')
  const [focused, setFocused] = useState(false)
  const [loading, setLoading] = useState(false)
  const [recent, setRecent]   = useState<string[]>([])
  const router = useRouter()
  const chars = query.length
  const nearLimit = chars > MAX_CHARS * 0.8

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('wk_recent') || '[]')
      setRecent(saved.slice(0, 3))
    } catch {}
  }, [])

  function handleSearch() {
    const q = query.trim()
    if (!q || loading) return
    // 保存最近搜索
    try {
      const prev: string[] = JSON.parse(localStorage.getItem('wk_recent') || '[]')
      const next = [q, ...prev.filter(x => x !== q)].slice(0, 5)
      localStorage.setItem('wk_recent', JSON.stringify(next))
    } catch {}
    setLoading(true)
    router.push(`/recommend?q=${encodeURIComponent(q)}`)
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSearch() }
  }

  const canSearch = query.trim().length > 0 && chars <= MAX_CHARS && !loading

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--color-background-tertiary)' }}>

      {/* ── 顶部导航 ── */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 24px', background: 'var(--color-background-tertiary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '22px' }}>🐒</span>
          <span style={{ fontSize: '15px', fontWeight: 500, color: 'var(--color-text-primary)', fontFamily: 'var(--font-serif)', letterSpacing: '.01em' }}>悟空AI</span>
        </div>
        <div style={{ display: 'flex', gap: '2px' }}>
          {[
            { href: '/tools/',    label: '全部工具' },
            { href: '/categories/', label: '分类' },
            { href: '/compare/',  label: '工具对比' },
            { href: '/weekly/',   label: 'AI周报' },
          ].map(item => (
            <Link key={item.href} href={item.href} style={{ fontSize: '13px', color: 'var(--color-text-secondary)', padding: '6px 12px', borderRadius: '8px', textDecoration: 'none' }}>{item.label}</Link>
          ))}
        </div>
      </nav>

      {/* ── 主体 ── */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 20px 80px' }}>

        {/* 悟空 Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ fontSize: '80px', lineHeight: 1, marginBottom: '18px', display: 'inline-block', animation: 'wkFloat 3.5s ease-in-out infinite' }}>🐒</div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(26px,5vw,40px)', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '10px', letterSpacing: '-.02em', lineHeight: 1.2 }}>
            悟空 AI 导航
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
            告诉我你想做什么，我帮你找到最佳 AI 工具组合
          </p>
        </div>

        {/* ── 搜索框 ── */}
        <div style={{ width: '100%', maxWidth: '680px', marginBottom: '20px' }}>
          <div style={{
            background: 'var(--color-background-primary)',
            border: focused ? '2px solid #D97706' : '1.5px solid var(--color-border-secondary)',
            borderRadius: '20px',
            padding: '16px 18px 12px',
            transition: 'border-color .2s, box-shadow .2s',
            boxShadow: focused ? '0 0 0 4px rgba(217,119,6,.1)' : 'none',
          }}>
            <textarea
              value={query}
              onChange={e => { if (e.target.value.length <= MAX_CHARS + 10) setQuery(e.target.value) }}
              onKeyDown={handleKey}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="例如：我想做自媒体短视频，需要自动写脚本、AI配音、剪辑成片，中文转英文口播..."
              rows={3}
              autoFocus
              style={{
                width: '100%', border: 'none', background: 'transparent',
                resize: 'none', fontSize: '15px', lineHeight: '1.65',
                color: 'var(--color-text-primary)', outline: 'none',
                fontFamily: 'var(--font-sans)',
              }}
            />
            {/* 底部工具栏 */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px', paddingTop: '8px', borderTop: '0.5px solid var(--color-border-tertiary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '12px', color: nearLimit ? (chars > MAX_CHARS ? '#E24B4A' : '#D97706') : 'var(--color-text-tertiary)', fontVariantNumeric: 'tabular-nums', transition: 'color .2s' }}>
                  {chars} / {MAX_CHARS}
                </span>
                {chars > 0 && (
                  <button onClick={() => setQuery('')} style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', background: 'none', border: 'none', cursor: 'pointer', padding: '0', fontFamily: 'var(--font-sans)' }}>
                    清空
                  </button>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>Enter 发送</span>
                <button
                  onClick={handleSearch}
                  disabled={!canSearch}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    background: canSearch ? '#D97706' : 'var(--color-background-secondary)',
                    color: canSearch ? '#fff' : 'var(--color-text-tertiary)',
                    border: 'none', borderRadius: '12px',
                    padding: '8px 22px', fontSize: '14px', fontWeight: 500,
                    cursor: canSearch ? 'pointer' : 'default',
                    transition: 'all .2s', fontFamily: 'var(--font-sans)',
                  }}
                >
                  {loading
                    ? <><span style={{ animation: 'wkSpin .6s linear infinite', display: 'inline-block' }}>🌀</span>&nbsp;寻找中...</>
                    : <>🔥 悟空帮你找</>
                  }
                </button>
              </div>
            </div>
          </div>
          {chars > MAX_CHARS && (
            <p style={{ fontSize: '12px', color: '#E24B4A', marginTop: '6px', paddingLeft: '4px' }}>
              超出字数限制 {chars - MAX_CHARS} 字，请精简描述
            </p>
          )}
        </div>

        {/* ── 热门场景标签 ── */}
        <div style={{ width: '100%', maxWidth: '680px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
            <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '.06em' }}>🔥 热门场景</span>
            <div style={{ flex: 1, height: '0.5px', background: 'var(--color-border-tertiary)' }} />
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {HOT_TAGS.map((tag, i) => (
              <button
                key={tag.label}
                onClick={() => { setQuery(tag.value); setFocused(true) }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '5px',
                  fontSize: '13px',
                  color: query === tag.value ? '#D97706' : 'var(--color-text-secondary)',
                  background: query === tag.value ? '#FEF3C7' : 'var(--color-background-primary)',
                  border: query === tag.value ? '1.5px solid #D97706' : '0.5px solid var(--color-border-secondary)',
                  borderRadius: '20px', padding: '6px 14px',
                  cursor: 'pointer', fontFamily: 'var(--font-sans)',
                  transition: 'all .15s',
                  position: 'relative',
                }}
                onMouseEnter={e => {
                  if (query !== tag.value) {
                    e.currentTarget.style.borderColor = '#D97706'
                    e.currentTarget.style.color = '#D97706'
                    e.currentTarget.style.background = '#FFFBF2'
                  }
                }}
                onMouseLeave={e => {
                  if (query !== tag.value) {
                    e.currentTarget.style.borderColor = 'var(--color-border-secondary)'
                    e.currentTarget.style.color = 'var(--color-text-secondary)'
                    e.currentTarget.style.background = 'var(--color-background-primary)'
                  }
                }}
              >
                <span style={{ fontSize: '14px' }}>{tag.icon}</span>
                {tag.label}
                {tag.hot && i < 3 && (
                  <span style={{ fontSize: '9px', fontWeight: 600, background: '#FEE2E2', color: '#991B1B', padding: '1px 4px', borderRadius: '4px', marginLeft: '1px' }}>HOT</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── 最近搜索 ── */}
        {recent.length > 0 && (
          <div style={{ width: '100%', maxWidth: '680px', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '.06em' }}>🕐 最近搜索</span>
              <div style={{ flex: 1, height: '0.5px', background: 'var(--color-border-tertiary)' }} />
              <button onClick={() => { localStorage.removeItem('wk_recent'); setRecent([]) }} style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>清除</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {recent.map(r => (
                <button key={r} onClick={() => { setQuery(r); setFocused(true) }} style={{
                  textAlign: 'left', fontSize: '13px', color: 'var(--color-text-secondary)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  padding: '5px 8px', borderRadius: '6px',
                  fontFamily: 'var(--font-sans)', transition: 'background .15s',
                  display: 'flex', alignItems: 'center', gap: '8px',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--color-background-secondary)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  <span style={{ color: 'var(--color-text-tertiary)', flexShrink: 0 }}>↺</span>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── 统计数字 ── */}
        <div style={{ display: 'flex', gap: '28px', marginTop: '24px' }}>
          {[
            { num: '50+',  label: 'AI 工具' },
            { num: '20+',  label: '使用场景' },
            { num: '30+',  label: '工具组合' },
            { num: '100%', label: '免费使用' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: 500, color: 'var(--color-text-primary)', lineHeight: 1.2 }}>{s.num}</div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', marginTop: '2px' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </main>

      {/* ── 页脚 ── */}
      <footer style={{ textAlign: 'center', padding: '16px', fontSize: '12px', color: 'var(--color-text-tertiary)', borderTop: '0.5px solid var(--color-border-tertiary)', background: 'var(--color-background-tertiary)' }}>
        © 2025 悟空AI导航 · gowukong.co ·{' '}
        {[
          { href: '/affiliate-disclosure/', label: '联盟声明' },
          { href: '/about/', label: '关于' },
          { href: '/tools/', label: '工具库' },
          { href: '/submit/', label: '提交工具' },
        ].map((l, i) => (
          <span key={l.href}>
            {i > 0 && ' · '}
            <Link href={l.href} style={{ color: 'var(--color-text-tertiary)', textDecoration: 'none' }}>{l.label}</Link>
          </span>
        ))}
      </footer>

      <style>{`
        @keyframes wkFloat {
          0%,100% { transform: translateY(0) rotate(0deg); }
          30% { transform: translateY(-12px) rotate(-4deg); }
          70% { transform: translateY(-7px) rotate(4deg); }
        }
        @keyframes wkSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        nav a:hover { background: var(--color-background-secondary); }
      `}</style>
    </div>
  )
}
