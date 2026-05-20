'use client'
import { useState } from 'react'
import WukongLogo from '@/components/WukongLogo'

interface Props {
  onClose: () => void
  onSuccess: (user: { email: string; phone: string }) => void
  defaultTab?: 'login' | 'register'
}

export default function AuthModal({ onClose, onSuccess, defaultTab = 'login' }: Props) {
  const [tab, setTab]             = useState<'login' | 'register'>(defaultTab)
  const [identifier, setId]       = useState('')
  const [password, setPwd]        = useState('')
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [showPwd, setShowPwd]     = useState(false)

  async function submit() {
    setError('')
    if (!identifier.trim() || !password.trim()) { setError('请填写完整信息'); return }
    // 基础格式验证
    const isEmail = identifier.includes('@')
    const isPhone = /^1[3-9]\d{9}$/.test(identifier.trim())
    if (!isEmail && !isPhone) { setError('请输入有效的邮箱或手机号'); return }
    if (password.length < 8) { setError('密码至少8位'); return }

    setLoading(true)
    try {
      // 模拟注册/登录（前端演示版，后端功能即将上线）
      await new Promise(r => setTimeout(r, 800))
      const user = {
        email: isEmail ? identifier.trim() : '',
        phone: isPhone ? identifier.trim() : '',
      }
      // 保存到localStorage
      localStorage.setItem('wk_user', JSON.stringify(user))
      onSuccess(user)
    } catch {
      setError('操作失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  // 样式变量
  const accent = '#D97706'
  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 12px', fontSize: '14px',
    border: '1px solid #E5E7EB',
    borderRadius: '10px', background: '#F9FAFB',
    color: '#111827', outline: 'none',
    fontFamily: 'var(--font-sans)', boxSizing: 'border-box',
  }

  return (
    <div style={{
      position: 'fixed', inset: 0,
      zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px',
    }}>
      {/* 背景遮罩 */}
      <div 
        style={{
          position: 'absolute', inset: 0,
          backgroundColor: 'rgba(0,0,0,0.75)', // 稍微加深一点
          backdropFilter: 'blur(4px)',
        }}
        onClick={onClose}
      />

      {/* 弹窗主体 */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '24px',
        padding: '32px',
        width: '100%', maxWidth: '420px',
        maxHeight: '90vh',
        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
        position: 'relative',
        zIndex: 10,
        display: 'flex', flexDirection: 'column',
        overflowY: 'auto',
      }}>
        {/* 标题 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <WukongLogo size={36} />
            <div>
              <div style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '2px' }}>GoWuKong.co</div>
              <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', margin: 0 }}>
                {tab === 'login' ? '登录 GO悟空' : '注册 GO悟空'}
              </h2>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#9CA3AF', lineHeight: 1, padding: '4px' }}>×</button>
        </div>

        {/* Tab切换 */}
        <div style={{ display: 'flex', background: '#F3F4F6', borderRadius: '10px', padding: '3px', marginBottom: '20px' }}>
          {(['login','register'] as const).map(t => (
            <button key={t} onClick={() => { setTab(t); setError('') }} style={{
              flex: 1, padding: '7px', fontSize: '13px', fontWeight: 500,
              border: 'none', borderRadius: '8px', cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
              background: tab === t ? '#FFFFFF' : 'transparent',
              color: tab === t ? '#111827' : '#9CA3AF',
              boxShadow: tab === t ? '0 1px 4px rgba(0,0,0,.08)' : 'none',
              transition: 'all .15s',
            }}>
              {t === 'login' ? '登录' : '注册'}
            </button>
          ))}
        </div>

        {/* 表单 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '12px', color: '#6B7280', display: 'block', marginBottom: '5px' }}>
              邮箱或手机号
            </label>
            <input
              value={identifier} onChange={e => setId(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submit()}
              placeholder="请输入邮箱或11位手机号"
              style={inputStyle}
              autoComplete="username"
            />
          </div>
          <div>
            <label style={{ fontSize: '12px', color: '#6B7280', display: 'block', marginBottom: '5px' }}>
              密码{tab === 'register' && <span style={{ color: 'var(--color-text-tertiary)' }}>（8-32位，含字母+数字）</span>}
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPwd ? 'text' : 'password'}
                value={password} onChange={e => setPwd(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && submit()}
                placeholder={tab === 'register' ? '设置密码（8-32位）' : '请输入密码'}
                style={{ ...inputStyle, paddingRight: '40px' }}
                autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
              />
              <button onClick={() => setShowPwd(!showPwd)} style={{
                position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: '#9CA3AF',
              }}>
                {showPwd ? '🙈' : '👁️'}
              </button>
            </div>
          </div>
        </div>

        {/* 错误提示 */}
        {error && (
          <div style={{ marginTop: '10px', padding: '8px 12px', background: '#FAECE7', borderRadius: '8px', fontSize: '12px', color: '#712B13' }}>
            ⚠️ {error}
          </div>
        )}

        {/* 提交按钮 */}
        <button onClick={submit} disabled={loading} style={{
          width: '100%', marginTop: '16px', padding: '12px',
          background: loading ? 'var(--color-background-secondary)' : accent,
          color: loading ? 'var(--color-text-tertiary)' : '#fff',
          border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 500,
          cursor: loading ? 'default' : 'pointer', fontFamily: 'var(--font-sans)',
          transition: 'all .2s',
        }}>
          {loading ? '处理中...' : (tab === 'login' ? '登录' : '注册并登录')}
        </button>

        {/* 权益说明 */}
        <div style={{ marginTop: '14px', padding: '10px 12px', background: '#FFFBF2', borderRadius: '8px', fontSize: '11px', color: '#92400E', lineHeight: 1.6 }}>
          🎁 登录后每天可免费查询 <strong>3次</strong>，未登录每天仅1次
        </div>

        {/* 隐私声明 */}
        <p style={{ marginTop: '12px', fontSize: '11px', color: '#9CA3AF', textAlign: 'center', lineHeight: 1.5 }}>
          注册即同意<a href="/terms" style={{ color: accent }}>服务条款</a>和<a href="/privacy" style={{ color: accent }}>隐私政策</a>
        </p>
      </div>
    </div>
  )
}
