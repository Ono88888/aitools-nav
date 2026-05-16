'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { ALL_TOOLS } from '@/lib/tools-data'
import ToolIcon from '@/components/ToolIcon'

// ── 工具官网域名映射（用于获取真实favicon）─────────────────────
const DOMAIN_MAP: Record<string, string> = {
  'chatgpt': 'openai.com',
  'claude': 'claude.ai',
  'gemini': 'gemini.google.com',
  'deepseek': 'deepseek.com',
  'doubao': 'doubao.com',
  'kimi': 'kimi.moonshot.cn',
  'tongyi': 'tongyi.aliyun.com',
  'wenxin': 'yiyan.baidu.com',
  'grok': 'x.ai',
  'zhipu': 'chatglm.cn',
  'mistral': 'mistral.ai',
  'perplexity': 'perplexity.ai',
  'metaso': 'metaso.cn',
  'phind': 'phind.com',
  'jasper': 'jasper.ai',
  'copyai': 'copy.ai',
  'grammarly': 'grammarly.com',
  'notion-ai': 'notion.so',
  'xiezuocat': 'xiezuocat.com',
  'cursor': 'cursor.sh',
  'github-copilot': 'github.com',
  'codeium': 'codeium.com',
  'v0': 'v0.dev',
  'bolt': 'bolt.new',
  'tongyi-lingma': 'tongyi.aliyun.com',
  'devin': 'devin.ai',
  'midjourney': 'midjourney.com',
  'stable-diffusion': 'stability.ai',
  'dalle3': 'openai.com',
  'flux': 'blackforestlabs.ai',
  'jimeng': 'jimeng.jianying.com',
  'wenxin-yige': 'yige.baidu.com',
  'ideogram': 'ideogram.ai',
  'leonardo': 'leonardo.ai',
  'runway': 'runwayml.com',
  'sora': 'openai.com',
  'kling': 'klingai.kuaishou.com',
  'vidu': 'vidu.cn',
  'heygen': 'heygen.com',
  'pika': 'pika.art',
  'elevenlabs': 'elevenlabs.io',
  'suno': 'suno.com',
  'udio': 'udio.com',
  'volcengine-tts': 'volcengine.com',
  'iflytek': 'iflyrec.com',
  'descript': 'descript.com',
  'gamma': 'gamma.app',
  'tome': 'tome.app',
  'aippt': 'aippt.cn',
  'monica': 'monica.im',
  'wps-ai': 'wps.cn',
  'julius': 'julius.ai',
  'helium10': 'helium10.com',
  'feigua': 'feigua.io',
  'manus': 'manus.im',
  'coze': 'coze.cn',
  'dify': 'dify.ai',
  'fastgpt': 'fastgpt.in',
  'zapier': 'zapier.com',
  'capcut': 'capcut.cn',
  'canva': 'canva.com',
  'adobe-firefly': 'adobe.com',
  'gaoding': 'gaoding.com',
}


// ── 分类列表 ─────────────────────────────────────────────────
const ALL_CATS = ['全部', ...Array.from(new Set(ALL_TOOLS.map(t => t.category))).sort()]

type SortKey = 'rating' | 'name' | 'category'

export default function ToolsPage() {
  const [activeCat, setActiveCat] = useState('全部')
  const [sortBy, setSortBy]       = useState<SortKey>('rating')
  const [search, setSearch]       = useState('')

  const filtered = useMemo(() => {
    let list = ALL_TOOLS

    // 分类筛选
    if (activeCat !== '全部') {
      list = list.filter(t => t.category === activeCat)
    }

    // 搜索筛选
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(t =>
        t.name.toLowerCase().includes(q) ||
        t.tagline.toLowerCase().includes(q) ||
        t.tags.some(tag => tag.toLowerCase().includes(q))
      )
    }

    // 排序
    if (sortBy === 'rating') {
      list = [...list].sort((a, b) => b.rating - a.rating)
    } else if (sortBy === 'name') {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name))
    } else if (sortBy === 'category') {
      list = [...list].sort((a, b) => a.category.localeCompare(b.category))
    }

    return list
  }, [activeCat, sortBy, search])

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: '32px 20px 60px' }}>

      {/* 头部 */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '6px' }}>
          全部 AI 工具
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--color-text-tertiary)' }}>
          共收录 <strong style={{ color: 'var(--color-text-secondary)' }}>{filtered.length}</strong> / {ALL_TOOLS.length} 个工具
        </p>
      </div>

      {/* 搜索 + 排序 */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="搜索工具名称或功能..."
          style={{
            flex: 1, minWidth: '200px', padding: '8px 14px',
            fontSize: '13px', border: '1px solid var(--color-border-secondary)',
            borderRadius: '10px', background: 'var(--color-background-primary)',
            color: 'var(--color-text-primary)', outline: 'none',
            fontFamily: 'var(--font-sans)',
          }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', flexShrink: 0 }}>排序：</span>
          {([
            { key: 'rating', label: '⭐ 评分' },
            { key: 'name',   label: 'A-Z 名称' },
          ] as { key: SortKey; label: string }[]).map(s => (
            <button key={s.key} onClick={() => setSortBy(s.key)} style={{
              fontSize: '12px', fontWeight: sortBy === s.key ? 500 : 400,
              padding: '6px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer',
              background: sortBy === s.key ? '#D97706' : 'var(--color-background-secondary)',
              color: sortBy === s.key ? '#fff' : 'var(--color-text-secondary)',
              fontFamily: 'var(--font-sans)', transition: 'all .15s',
            }}>{s.label}</button>
          ))}
        </div>
      </div>

      {/* 分类标签 */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
        {ALL_CATS.map(cat => (
          <button key={cat} onClick={() => setActiveCat(cat)} style={{
            fontSize: '13px', fontWeight: activeCat === cat ? 500 : 400,
            padding: '6px 14px', borderRadius: '20px', cursor: 'pointer',
            border: activeCat === cat ? '2px solid #D97706' : '1px solid var(--color-border-secondary)',
            background: activeCat === cat ? '#D97706' : 'var(--color-background-primary)',
            color: activeCat === cat ? '#fff' : 'var(--color-text-secondary)',
            fontFamily: 'var(--font-sans)', transition: 'all .15s',
          }}>{cat}</button>
        ))}
      </div>

      {/* 工具列表 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--color-text-tertiary)', fontSize: '14px' }}>
            没有找到相关工具，试试其他关键词
          </div>
        ) : filtered.map(tool => (
          <a key={tool.slug} href={tool.url} target="_blank" rel="nofollow noopener"
            style={{
              display: 'flex', alignItems: 'center', gap: '14px',
              padding: '14px 16px',
              background: 'var(--color-background-primary)',
              border: '0.5px solid var(--color-border-tertiary)',
              borderRadius: '14px', textDecoration: 'none',
              transition: 'border-color .15s, transform .1s',
              cursor: 'pointer',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = '#D97706'
              e.currentTarget.style.transform = 'translateY(-1px)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--color-border-tertiary)'
              e.currentTarget.style.transform = 'none'
            }}
          >
            {/* Logo */}
            <div style={{
              width: '48px', height: '48px', borderRadius: '12px',
              background: 'var(--color-background-secondary)',
              border: '0.5px solid var(--color-border-tertiary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, overflow: 'hidden',
            }}>
              <ToolIcon slug={tool.slug} name={tool.name} size={32} />
            </div>

            {/* 内容 */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-primary)' }}>{tool.name}</span>
                <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', background: 'var(--color-background-secondary)', padding: '1px 7px', borderRadius: '4px' }}>{tool.category}</span>
                {tool.hasFree && (
                  <span style={{ fontSize: '10px', fontWeight: 500, color: '#085041', background: '#E1F5EE', padding: '1px 7px', borderRadius: '4px' }}>免费</span>
                )}
                {tool.cnAccess && (
                  <span style={{ fontSize: '10px', fontWeight: 500, color: '#3C3489', background: '#EEEDFE', padding: '1px 7px', borderRadius: '4px' }}>国内可用</span>
                )}
              </div>
              <p style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', margin: 0, lineHeight: 1.5 }}>{tool.tagline}</p>
            </div>

            {/* 评分 + 箭头 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
              {tool.rating > 0 && (
                <span style={{ fontSize: '12px', fontWeight: 500, color: '#D97706' }}>★ {tool.rating.toFixed(1)}</span>
              )}
              <span style={{ fontSize: '16px', color: 'var(--color-text-tertiary)' }}>↗</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
