'use client'
import { useState, useEffect, useRef } from 'react'
import WukongLogo from '@/components/WukongLogo'
import Script from 'next/script'

interface Props {
  onClose: () => void
  onSuccess: (user: { email: string; phone: string }) => void
  defaultTab?: 'login' | 'register'
}

declare global { interface Window { turnstile: any } }

type View = 'login' | 'register' | 'forgot' | 'reset'

const accent = '#D97706'

const inp: React.CSSProperties = {
  width: '100%', padding: '10px 12px', fontSize: '14px',
  border: '1px solid #E5E7EB', borderRadius: '10px',
  background: '#F9FAFB', color: '#111827', outline: 'none',
  fontFamily: 'sans-serif', boxSizing: 'border-box',
}

export default function AuthModal({ onClose, onSuccess, defaultTab = 'login' }: Props) {
  const [view,        setView]    = useState<View>(defaultTab)
  const [identifier,  setId]      = useState('')
  const [password,    setPwd]     = useState('')
  const [confirmPwd,  setConfirm] = useState('')
  const [code,        setCode]    = useState('')
  const [loading,     setLoading] = useState(false)
  const [codeSent,    setCodeSent]= useState(false)
  const [countdown,   setCountdown]= useState(0)
  const [error,       setError]   = useState('')
  const [info,        setInfo]    = useState('')
  const [showPwd,     setShowPwd] = useState(false)
  const [captchaToken,setToken]   = useState('')
  const turnstileRef = useRef<HTMLDivElement>(null)
  const widgetId     = useRef<string | null>(null)
  const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

  function resetTurnstile() {
    if (window.turnstile && widgetId.current) { window.turnstile.reset(widgetId.current); setToken('') }
  }
  function switchView(v: View) { setView(v); setError(''); setInfo(''); setCode(''); setConfirm('') }

  // Turnstile
  useEffect(() => {
    if (!SITE_KEY) return
    const t = setInterval(() => {
      if (window.turnstile && turnstileRef.current && !widgetId.current) {
        widgetId.current = window.turnstile.render(turnstileRef.current, {
          sitekey: SITE_KEY,
          callback: (token: string) => setToken(token),
          'error-callback': () => setError('人机验证加载失败，请刷新页面'),
          theme: 'light',
        })
        clearInterval(t)
      }
    }, 500)
    return () => clearInterval(t)
  }, [SITE_KEY, view])

  // 倒计时
  useEffect(() => {
    if (countdown <= 0) return
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  // ── 登录 ──────────────────────────────────────────────────
  async function handleLogin() {
    setError('')
    const id = identifier.trim()
    const isEmail = id.includes('@')
    const isPhone = /^1[3-9]\d{9}$/.test(id)
    if (!isEmail && !isPhone) { setError('请输入有效的邮箱或手机号'); return }
    if (!password) { setError('请输入密码'); return }
    if (SITE_KEY && !captchaToken) { setError('请先完成人机验证'); return }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: id, password, captchaToken })
      })
      const data = await res.json().catch(() => ({ error: '服务器响应异常' }))
      if (!res.ok) {
        // 账号不存在 → 提示跳转注册
        if (data.code === 'USER_NOT_FOUND') {
          setError('')
          setInfo('📭 该账号尚未注册')
          setTimeout(() => { setInfo(''); switchView('register') }, 1200)
          return
        }
        setError(data.error || '登录失败，请重试')
        resetTurnstile()
        return
      }
      localStorage.setItem('wk_user', JSON.stringify(data.user))
      onSuccess(data.user)
    } catch {
      setError('网络请求失败，请稍后重试')
      resetTurnstile()
    } finally {
      setLoading(false)
    }
  }

  // ── 注册 ──────────────────────────────────────────────────
  async function handleRegister() {
    setError('')
    const id = identifier.trim()
    if (!id.includes('@')) { setError('仅支持邮箱注册'); return }
    if (!/^(?=.*[a-zA-Z])(?=.*\d).{8,32}$/.test(password)) {
      setError('密码需8-32位，包含字母和数字'); return
    }
    if (SITE_KEY && !captchaToken) { setError('请先完成人机验证'); return }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: id, password, captchaToken })
      })
      const data = await res.json().catch(() => ({ error: '服务器响应异常' }))
      if (!res.ok) { setError(data.error || '注册失败'); resetTurnstile(); return }
      localStorage.setItem('wk_user', JSON.stringify(data.user))
      onSuccess(data.user)
    } catch {
      setError('网络请求失败，请稍后重试')
      resetTurnstile()
    } finally {
      setLoading(false)
    }
  }

  // ── 发送验证码 ───────────────────────────────────────────
  async function sendCode() {
    const email = identifier.trim()
    if (!email.includes('@')) { setError('请先输入注册时的邮箱'); return }
    setError(''); setLoading(true)
    try {
      const res = await fetch('/api/auth/send-code', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const data = await res.json().catch(() => ({ error: '发送失败' }))
      if (!res.ok) { setError(data.error || '发送失败'); return }
      setCodeSent(true)
      setCountdown(60)
      setInfo('✅ 验证码已发送，请查收邮件（注意检查垃圾箱）')
    } catch {
      setError('发送失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  // ── 重置密码 ─────────────────────────────────────────────
  async function handleReset() {
    setError('')
    if (!code.trim()) { setError('请输入验证码'); return }
    if (!password || !confirmPwd) { setError('请填写新密码'); return }
    if (password !== confirmPwd) { setError('两次密码输入不一致'); return }
    if (!/^(?=.*[a-zA-Z])(?=.*\d).{8,32}$/.test(password)) {
      setError('密码需8-32位，包含字母和数字'); return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: identifier.trim(), code: code.trim(), newPassword: password })
      })
      const data = await res.json().catch(() => ({ error: '重置失败' }))
      if (!res.ok) { setError(data.error || '重置失败'); return }
      setInfo('🎉 密码重置成功，正在登录...')
      localStorage.setItem('wk_user', JSON.stringify(data.user))
      setTimeout(() => onSuccess(data.user), 800)
    } catch {
      setError('请求失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const btnStyle = (disabled: boolean): React.CSSProperties => ({
    width: '100%', padding: '11px', fontSize: '14px', fontWeight: 500,
    border: 'none', borderRadius: '12px', cursor: disabled ? 'not-allowed' : 'pointer',
    background: disabled ? '#E5E7EB' : accent,
    color: disabled ? '#9CA3AF' : '#fff',
    fontFamily: 'sans-serif', transition: 'all .2s',
  })

  // ── 渲染：忘记密码界面 ────────────────────────────────────
  if (view === 'forgot' || view === 'reset') {
    return (
      <div style={{ position:'fixed',inset:0,zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center',padding:'20px' }}>
        <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="lazyOnload" />
        <div style={{ position:'absolute',inset:0,background:'rgba(0,0,0,0.75)',backdropFilter:'blur(4px)' }} onClick={onClose} />
        <div style={{ background:'#fff',borderRadius:'24px',padding:'32px',width:'100%',maxWidth:'420px',position:'relative',zIndex:10,maxHeight:'90vh',overflowY:'auto' }}>

          {/* 标题 */}
          <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'20px' }}>
            <div style={{ display:'flex',alignItems:'center',gap:'10px' }}>
              <WukongLogo size={32} />
              <div>
                <div style={{ fontSize:'11px',color:'#9CA3AF' }}>GoWuKong.co</div>
                <h2 style={{ fontSize:'16px',fontWeight:600,color:'#111827',margin:0 }}>
                  {view === 'forgot' ? '找回密码' : '重置密码'}
                </h2>
              </div>
            </div>
            <button onClick={onClose} style={{ background:'none',border:'none',fontSize:'20px',cursor:'pointer',color:'#9CA3AF' }}>×</button>
          </div>

          {view === 'forgot' ? (
            /* 步骤1：输入邮箱，发验证码 */
            <div style={{ display:'flex',flexDirection:'column',gap:12 }}>
              <p style={{ fontSize:'13px',color:'#6B7280',margin:'0 0 4px' }}>
                输入注册时使用的邮箱，我们将发送验证码。
              </p>
              <div>
                <label style={{ fontSize:'12px',color:'#6B7280',display:'block',marginBottom:'5px' }}>邮箱地址</label>
                <input value={identifier} onChange={e => setId(e.target.value)}
                  placeholder="your@email.com" style={inp} />
              </div>
              <div style={{ display:'flex',gap:8 }}>
                <button onClick={sendCode} disabled={loading || countdown > 0}
                  style={{ ...btnStyle(loading || countdown > 0), flex: 2 }}>
                  {loading ? '发送中...' : countdown > 0 ? `重新发送(${countdown}s)` : codeSent ? '重新发送' : '发送验证码'}
                </button>
                {codeSent && (
                  <button onClick={() => switchView('reset')}
                    style={{ ...btnStyle(false), flex: 1, background:'#1D4ED8' }}>
                    下一步 →
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* 步骤2：输入验证码 + 新密码 */
            <div style={{ display:'flex',flexDirection:'column',gap:12 }}>
              <p style={{ fontSize:'13px',color:'#6B7280',margin:'0 0 4px' }}>
                验证码已发送至 <strong>{identifier}</strong>
              </p>
              <div>
                <label style={{ fontSize:'12px',color:'#6B7280',display:'block',marginBottom:'5px' }}>邮箱验证码</label>
                <input value={code} onChange={e => setCode(e.target.value)}
                  placeholder="请输入6位验证码" maxLength={6}
                  style={{ ...inp, letterSpacing:'4px', fontWeight:600, fontSize:'18px' }} />
              </div>
              <div>
                <label style={{ fontSize:'12px',color:'#6B7280',display:'block',marginBottom:'5px' }}>新密码</label>
                <div style={{ position:'relative' }}>
                  <input type={showPwd ? 'text' : 'password'} value={password} onChange={e => setPwd(e.target.value)}
                    placeholder="8-32位，含字母+数字" style={{ ...inp, paddingRight:'40px' }} />
                  <button onClick={() => setShowPwd(!showPwd)} style={{ position:'absolute',right:'10px',top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'#9CA3AF' }}>
                    {showPwd ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
              <div>
                <label style={{ fontSize:'12px',color:'#6B7280',display:'block',marginBottom:'5px' }}>确认新密码</label>
                <input type="password" value={confirmPwd} onChange={e => setConfirm(e.target.value)}
                  placeholder="再次输入新密码" style={inp} />
              </div>
              {confirmPwd && password !== confirmPwd && (
                <p style={{ fontSize:'12px',color:'#EF4444',margin:0 }}>⚠️ 两次密码不一致</p>
              )}
              <button onClick={handleReset} disabled={loading || !code || !password || !confirmPwd || password !== confirmPwd}
                style={btnStyle(loading || !code || !password || !confirmPwd || password !== confirmPwd)}>
                {loading ? '重置中...' : '确认重置密码'}
              </button>
              <button onClick={() => switchView('forgot')}
                style={{ background:'none',border:'none',color:'#9CA3AF',fontSize:'12px',cursor:'pointer',textDecoration:'underline',padding:0 }}>
                ← 重新发送验证码
              </button>
            </div>
          )}

          {error && <div style={{ marginTop:'10px',padding:'8px 12px',background:'#FEF2F2',borderRadius:'8px',fontSize:'12px',color:'#991B1B' }}>⚠️ {error}</div>}
          {info  && <div style={{ marginTop:'10px',padding:'8px 12px',background:'#F0FDF4',borderRadius:'8px',fontSize:'12px',color:'#14532D' }}>{info}</div>}

          <button onClick={() => switchView('login')}
            style={{ marginTop:'16px',background:'none',border:'none',color:'#9CA3AF',fontSize:'12px',cursor:'pointer',width:'100%',textAlign:'center',textDecoration:'underline' }}>
            返回登录
          </button>
        </div>
      </div>
    )
  }

  // ── 渲染：登录 / 注册 ────────────────────────────────────
  return (
    <div style={{ position:'fixed',inset:0,zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center',padding:'20px' }}>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="lazyOnload" />
      <div style={{ position:'absolute',inset:0,background:'rgba(0,0,0,0.75)',backdropFilter:'blur(4px)' }} onClick={onClose} />

      <div style={{ background:'#fff',borderRadius:'24px',padding:'32px',width:'100%',maxWidth:'420px',maxHeight:'90vh',boxShadow:'0 20px 25px -5px rgba(0,0,0,.1)',position:'relative',zIndex:10,display:'flex',flexDirection:'column',overflowY:'auto' }}>

        {/* 标题 */}
        <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'20px' }}>
          <div style={{ display:'flex',alignItems:'center',gap:'10px' }}>
            <WukongLogo size={36} />
            <div>
              <div style={{ fontSize:'11px',color:'#9CA3AF',marginBottom:'2px' }}>GoWuKong.co</div>
              <h2 style={{ fontSize:'16px',fontWeight:600,color:'#111827',margin:0 }}>
                {view === 'login' ? '登录 GO悟空' : '注册 GO悟空'}
              </h2>
            </div>
          </div>
          <button onClick={onClose} style={{ background:'none',border:'none',fontSize:'20px',cursor:'pointer',color:'#9CA3AF',padding:'4px' }}>×</button>
        </div>

        {/* Tab */}
        <div style={{ display:'flex',background:'#F3F4F6',borderRadius:'10px',padding:'3px',marginBottom:'20px' }}>
          {(['login','register'] as const).map(t => (
            <button key={t} onClick={() => { switchView(t); resetTurnstile() }}
              style={{ flex:1,padding:'7px',fontSize:'13px',fontWeight:500,border:'none',borderRadius:'8px',cursor:'pointer',fontFamily:'sans-serif',background:view===t?'#fff':'transparent',color:view===t?'#111827':'#9CA3AF',boxShadow:view===t?'0 1px 4px rgba(0,0,0,.08)':'none',transition:'all .15s' }}>
              {t === 'login' ? '登录' : '注册'}
            </button>
          ))}
        </div>

        {/* 表单 */}
        <div style={{ display:'flex',flexDirection:'column',gap:12 }}>
          <div>
            <label style={{ fontSize:'12px',color:'#6B7280',display:'block',marginBottom:'5px' }}>
              {view === 'register' ? '邮箱地址' : '邮箱或手机号'}
            </label>
            <input value={identifier} onChange={e => setId(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (view === 'login' ? handleLogin() : handleRegister())}
              placeholder={view === 'register' ? 'your@email.com' : '邮箱 或 11位手机号'}
              style={inp} autoComplete="username" />
          </div>
          <div>
            <label style={{ fontSize:'12px',color:'#6B7280',display:'block',marginBottom:'5px' }}>
              密码{view === 'register' && <span style={{ color:'#9CA3AF' }}>（8-32位，含字母+数字）</span>}
            </label>
            <div style={{ position:'relative' }}>
              <input type={showPwd ? 'text' : 'password'} value={password}
                onChange={e => setPwd(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (view === 'login' ? handleLogin() : handleRegister())}
                placeholder={view === 'register' ? '设置密码（8-32位）' : '请输入密码'}
                style={{ ...inp, paddingRight:'40px' }}
                autoComplete={view === 'login' ? 'current-password' : 'new-password'} />
              <button onClick={() => setShowPwd(!showPwd)}
                style={{ position:'absolute',right:'10px',top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',fontSize:'14px',color:'#9CA3AF' }}>
                {showPwd ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {/* 忘记密码链接（仅登录时显示） */}
          {view === 'login' && (
            <div style={{ textAlign:'right', marginTop:'-4px' }}>
              <button onClick={() => switchView('forgot')}
                style={{ background:'none',border:'none',color:'#9CA3AF',fontSize:'12px',cursor:'pointer',textDecoration:'underline',padding:0,fontFamily:'sans-serif' }}>
                忘记密码？
              </button>
            </div>
          )}

          {/* Turnstile */}
          {SITE_KEY && (
            <div style={{ marginTop:4,minHeight:65,display:'flex',justifyContent:'center' }}>
              <div ref={turnstileRef}></div>
            </div>
          )}
        </div>

        {/* 错误 */}
        {error && (
          <div style={{ marginTop:'10px',padding:'8px 12px',background:'#FAECE7',borderRadius:'8px',fontSize:'12px',color:'#712B13' }}>
            ⚠️ {error}
            {/* 账号不存在时显示去注册按钮 */}
          </div>
        )}
        {info && (
          <div style={{ marginTop:'10px',padding:'8px 12px',background:'#EFF6FF',borderRadius:'8px',fontSize:'12px',color:'#1D4ED8',display:'flex',alignItems:'center',gap:8 }}>
            {info}
            {info.includes('尚未注册') && (
              <button onClick={() => switchView('register')}
                style={{ background:accent,color:'#fff',border:'none',borderRadius:'6px',padding:'3px 10px',fontSize:'11px',cursor:'pointer',whiteSpace:'nowrap' }}>
                立即注册 →
              </button>
            )}
          </div>
        )}

        {/* 提交按钮 */}
        <button onClick={view === 'login' ? handleLogin : handleRegister}
          disabled={loading || (!!SITE_KEY && !captchaToken)}
          style={{ ...btnStyle(loading || (!!SITE_KEY && !captchaToken)), marginTop:'16px' }}>
          {loading ? '处理中...' : view === 'login' ? '登录' : '注册并登录'}
        </button>

        {/* 权益 */}
        <div style={{ marginTop:'14px',padding:'10px 12px',background:'#FFFBF2',borderRadius:'8px',fontSize:'11px',color:'#92400E',lineHeight:1.6 }}>
          🎁 登录后每天可免费查询 <strong>3次</strong>，未登录每天仅1次
        </div>

        <p style={{ marginTop:'12px',fontSize:'11px',color:'#9CA3AF',textAlign:'center',lineHeight:1.5 }}>
          注册即同意<a href="/terms" style={{ color:accent }}>服务条款</a>和<a href="/privacy" style={{ color:accent }}>隐私政策</a>
        </p>
      </div>
    </div>
  )
}
