'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AuthModal from '@/components/AuthModal'
import WukongLogo from '@/components/WukongLogo'

const MAX_CHARS = 50

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

// ── 搜索建议词（本地预设，0网络请求）────────────────────────
const SUGGESTIONS: Record<string, string> = {
  '直播': '我想做直播带货，需要AI话术生成、虚拟主播和选品工具',
  '视频': '做自媒体短视频，需要自动写脚本、AI配音、自动剪辑成片',
  '公众号': '运营公众号，需要AI写文章、自动配图、一键排版发布',
  '电商': '做跨境电商，需要产品描述翻译、AI客服、数据选品',
  '代码': '独立开发产品，需要AI写代码、自动测试、快速部署上线',
  '绘画': '用AI绘画接单变现，需要高质量生图和商业授权工具',
  'PPT': '做商务PPT演示，需要AI一键生成设计精美的幻灯片',
  '音乐': '用AI创作音乐歌曲，需要自动作曲配音工具',
  '播客': '做播客节目，需要录音降噪、AI转写字幕、多平台发布',
  '写作': '用AI辅助写文章，需要长文生成、改写润色工具',
}

// 防刷间隔：两次搜索最少间隔5秒
const SEARCH_COOLDOWN_MS = 5000

export default function HomePage() {
  const [query, setQuery]           = useState('')
  const [focused, setFocused]       = useState(false)
  const [loading, setLoading]       = useState(false)
  const [recent, setRecent]         = useState<string[]>([])
  const [suggestion, setSuggestion] = useState('')
  const [user, setUser]             = useState<{ email: string; phone: string } | null>(null)
  const [showAuth, setShowAuth]     = useState(false)
  const [authTab, setAuthTab]       = useState<'login'|'register'>('login')
  const [cooldown, setCooldown]     = useState(0)   // 剩余冷却秒数
  const [dailyMsg, setDailyMsg]     = useState('')  // 次数提示
  const lastSearchRef               = useRef<number>(0)
  const cooldownTimer               = useRef<ReturnType<typeof setInterval>>()
  const router = useRouter()
  const chars = query.length
  const nearLimit = chars > MAX_CHARS * 0.8

  // 获取登录状态
  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (d.user) setUser(d.user)
    }).catch(() => {})
  }, [])

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('wk_recent') || '[]')
      setRecent(saved.slice(0, 3))
    } catch {}
  }, [])

  useEffect(() => {
    if (!query.trim()) { setSuggestion(''); return }
    const match = Object.entries(SUGGESTIONS).find(([k]) => query.includes(k))
    setSuggestion(match ? match[1] : '')
  }, [query])

  // 冷却倒计时
  function startCooldown() {
    const end = Date.now() + SEARCH_COOLDOWN_MS
    lastSearchRef.current = Date.now()
    clearInterval(cooldownTimer.current)
    cooldownTimer.current = setInterval(() => {
      const remaining = Math.ceil((end - Date.now()) / 1000)
      if (remaining <= 0) {
        setCooldown(0)
        clearInterval(cooldownTimer.current)
      } else {
        setCooldown(remaining)
      }
    }, 200)
  }

  function handleSearch() {
    const q = query.trim()
    if (!q || loading) return
    // 冷却检查
    if (cooldown > 0) return
    if (Date.now() - lastSearchRef.current < SEARCH_COOLDOWN_MS) return
    try {
      const prev: string[] = JSON.parse(localStorage.getItem('wk_recent') || '[]')
      localStorage.setItem('wk_recent', JSON.stringify([q, ...prev.filter(x => x !== q)].slice(0, 5)))
    } catch {}
    setLoading(true)
    startCooldown()
    router.push(`/recommend?q=${encodeURIComponent(q)}`)
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSearch() }
    if (e.key === 'Tab' && suggestion) { e.preventDefault(); setQuery(suggestion); setSuggestion('') }
  }

  function handleLogout() {
    fetch('/api/auth/me', { method: 'DELETE' }).then(() => setUser(null))
  }

  const canSearch = query.trim().length > 0 && chars <= MAX_CHARS && !loading && cooldown === 0

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--color-background-tertiary)' }}>

      {/* ── 顶部导航 ── */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 24px', background: 'var(--color-background-tertiary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <WukongLogo size={32} />
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
            <span style={{ fontSize: '15px', fontWeight: 500, color: 'var(--color-text-primary)', fontFamily: 'var(--font-serif)', letterSpacing: '.01em' }}>GO悟空</span>
            <span style={{ fontSize: '10px', color: 'var(--color-text-tertiary)', letterSpacing: '.02em' }}>GoWuKong.co</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
          {[
            { href: '/tools/',    label: '全部工具' },
            { href: '/categories/', label: '分类' },
            { href: '/compare/',  label: '工具对比' },
          ].map(item => (
            <Link key={item.href} href={item.href} style={{ fontSize: '13px', color: 'var(--color-text-secondary)', padding: '6px 12px', borderRadius: '8px', textDecoration: 'none' }}>{item.label}</Link>
          ))}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '4px' }}>
              <span style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                👤 {user.email || user.phone}
              </span>
              <button onClick={handleLogout} style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', background: 'none', border: '0.5px solid var(--color-border-tertiary)', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
                退出
              </button>
            </div>
          ) : (
            <button onClick={() => { setAuthTab('login'); setShowAuth(true) }} style={{ marginLeft: '4px', fontSize: '13px', color: '#D97706', background: '#FFFBF2', border: '1px solid #D97706', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontWeight: 500 }}>
              登录
            </button>
          )}
        </div>
      </nav>

      {/* ── 主体 ── */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 20px 80px' }}>

        {/* 悟空 Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ marginBottom: '18px', display: 'inline-block', animation: 'wkFloat 3.5s ease-in-out infinite' }}>
            <WukongLogo size={80} />
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(26px,5vw,40px)', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '10px', letterSpacing: '-.02em', lineHeight: 1.2 }}>
            GO悟空 AI 导航
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
            告诉我你想做什么，我帮你找到最佳 AI 工具组合
          </p>
        </div>

        {/* ── 搜索框 ── */}
        <div style={{ width: '100%', maxWidth: '680px', marginBottom: '20px' }}>
          <div style={{
            background: 'var(--color-background-primary)',
            border: focused ? '2px solid #D97706' : '1.5px solid #AAAAAA',
            borderRadius: '20px',
            padding: '16px 18px 12px',
            transition: 'border-color .2s, box-shadow .2s',
            boxShadow: focused ? '0 0 0 4px rgba(217,119,6,.1)' : 'none',
          }}>
            <textarea
              value={query}
              onChange={e => { if (e.target.value.length <= MAX_CHARS + 5) setQuery(e.target.value) }}
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
                    : cooldown > 0
                      ? <>⏳ 请等待 {cooldown}s</>
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

          {/* ── 智能建议词（本地匹配，0延迟）── */}
          {suggestion && suggestion !== query.trim() && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              marginTop: '8px', padding: '8px 14px',
              background: 'var(--color-background-secondary)',
              border: '0.5px solid var(--color-border-tertiary)',
              borderRadius: '10px', cursor: 'pointer',
            }}
              onClick={() => { setQuery(suggestion); setSuggestion('') }}
            >
              <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', flexShrink: 0 }}>💡 你是否想做：</span>
              <span style={{ fontSize: '12px', color: '#D97706', flex: 1, lineHeight: 1.5 }}>{suggestion}</span>
              <span style={{ fontSize: '10px', color: 'var(--color-text-tertiary)', flexShrink: 0 }}>点击填入 / Tab</span>
            </div>
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
        © 2025 GO悟空 · gowukong.co ·{' '}
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

      {/* 次数提示 */}
      {dailyMsg && (
        <div style={{ position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)', background: '#1a1a1a', color: '#fff', fontSize: '13px', padding: '10px 20px', borderRadius: '20px', zIndex: 100, display: 'flex', alignItems: 'center', gap: '10px' }}>
          {dailyMsg}
          <button onClick={() => { setDailyMsg(''); setAuthTab('register'); setShowAuth(true) }} style={{ background: '#D97706', color: '#fff', border: 'none', borderRadius: '6px', padding: '4px 10px', fontSize: '12px', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontWeight: 500 }}>
            注册
          </button>
        </div>
      )}

      {/* 登录/注册弹窗 */}
      {showAuth && (
        <AuthModal
          defaultTab={authTab}
          onClose={() => setShowAuth(false)}
          onSuccess={u => { setUser(u); setShowAuth(false) }}
        />
      )}

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
