'use client'

import Link from 'next/link'
import ToolIcon from '@/components/ToolIcon'
import type { ToolCombo, NetAccess, Difficulty, FlowDifficulty } from '@/types/combo'

// ── 工具视频教程映射 ─────────────────────────────────────
const DEMO_VIDEOS: Record<string, { url: string; platform: 'youtube' | 'bilibili' }> = {
  '豆包':        { url: 'https://search.bilibili.com/all?keyword=豆包AI教程', platform: 'bilibili' },
  'DeepSeek':   { url: 'https://search.bilibili.com/all?keyword=DeepSeek教程', platform: 'bilibili' },
  'Claude':     { url: 'https://www.youtube.com/results?search_query=claude+ai+tutorial', platform: 'youtube' },
  'ElevenLabs': { url: 'https://www.youtube.com/results?search_query=elevenlabs+tutorial', platform: 'youtube' },
  '剪映专业版': { url: 'https://search.bilibili.com/all?keyword=剪映AI教程', platform: 'bilibili' },
  'Midjourney': { url: 'https://www.youtube.com/results?search_query=midjourney+tutorial+2025', platform: 'youtube' },
  'Cursor':     { url: 'https://www.youtube.com/results?search_query=cursor+ai+coding+tutorial', platform: 'youtube' },
  'Gamma':      { url: 'https://www.youtube.com/results?search_query=gamma+app+presentation+tutorial', platform: 'youtube' },
  'Suno':       { url: 'https://www.youtube.com/results?search_query=suno+ai+music+tutorial', platform: 'youtube' },
  'HeyGen':     { url: 'https://www.youtube.com/results?search_query=heygen+avatar+tutorial', platform: 'youtube' },
  'Runway':     { url: 'https://www.youtube.com/results?search_query=runway+gen3+tutorial', platform: 'youtube' },
  '可灵AI':     { url: 'https://search.bilibili.com/all?keyword=可灵AI教程', platform: 'bilibili' },
  '即梦AI':     { url: 'https://search.bilibili.com/all?keyword=即梦AI教程', platform: 'bilibili' },
  'Kimi':       { url: 'https://search.bilibili.com/all?keyword=Kimi使用技巧', platform: 'bilibili' },
  'Descript':   { url: 'https://www.youtube.com/results?search_query=descript+podcast+editing+tutorial', platform: 'youtube' },
  'Notion AI':  { url: 'https://www.youtube.com/results?search_query=notion+ai+tutorial', platform: 'youtube' },
  'Stable Diffusion': { url: 'https://search.bilibili.com/all?keyword=Stable+Diffusion教程', platform: 'bilibili' },
  'ChatGPT':    { url: 'https://www.youtube.com/results?search_query=chatgpt+tutorial+2025', platform: 'youtube' },
  'Bolt.new':   { url: 'https://www.youtube.com/results?search_query=bolt+new+tutorial', platform: 'youtube' },
}

// ── Tier 样式 ────────────────────────────────────────────
const TIER = {
  free: { bg: '#E1F5EE', border: '#1D9E75', label: '全免费方案', textColor: '#085041' },
  mid:  { bg: '#FEF3C7', border: '#D97706', label: '性价比首选', textColor: '#92400E' },
  pro:  { bg: '#EDE9FE', border: '#7C3AED', label: '创意旗舰',   textColor: '#4C1D95' },
}

// ── 网络标签 ────────────────────────────────────────────
const NET_META: Record<NetAccess, { label: string; dot: string; bg: string; color: string; desc: string }> = {
  cn:   { label: '国内直连', dot: '#22c55e', bg: '#f0fdf4', color: '#166534', desc: '无需任何代理，国内直接访问' },
  vpn:  { label: '需要梯子', dot: '#f59e0b', bg: '#fffbeb', color: '#92400e', desc: '需要科学上网工具才能访问' },
  both: { label: '均可访问', dot: '#3b82f6', bg: '#eff6ff', color: '#1e40af', desc: '国内外均可正常访问' },
}

// ── 难度标签 ─────────────────────────────────────────────
const DIFF_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: '极简', color: '#16a34a' },
  2: { label: '简单', color: '#65a30d' },
  3: { label: '中等', color: '#d97706' },
  4: { label: '较难', color: '#ea580c' },
  5: { label: '专业', color: '#dc2626' },
}

// ── 流转难度标签 ─────────────────────────────────────────
const FLOW_LABELS: Record<FlowDifficulty, { label: string; color: string; icon: string }> = {
  easy:   { label: '复制粘贴', color: '#16a34a', icon: '📋' },
  medium: { label: '导入导出', color: '#d97706', icon: '📁' },
  hard:   { label: '需要配置', color: '#dc2626',  icon: '⚙️' },
}

// ── 难度小点 ────────────────────────────────────────────
function DiffDots({ level, size = 8 }: { level: number; size?: number }) {
  const color = DIFF_LABELS[level]?.color || '#d97706'
  return (
    <span style={{ display: 'inline-flex', gap: 3, alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} style={{
          width: size, height: size, borderRadius: '50%', display: 'inline-block',
          background: i <= level ? color : 'var(--color-border-secondary)',
          flexShrink: 0,
        }} />
      ))}
    </span>
  )
}

// ── 网络小圆点 ──────────────────────────────────────────
function NetDot({ net }: { net: NetAccess }) {
  const m = NET_META[net]
  return (
    <span title={m.desc} style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      fontSize: 11, fontWeight: 500,
      background: m.bg, color: m.color,
      padding: '2px 7px', borderRadius: 4,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: m.dot, display: 'inline-block', flexShrink: 0 }} />
      {m.label}
    </span>
  )
}

interface Props {
  combo: ToolCombo
  scene: string
  sceneLabel: string
  allCombos: ToolCombo[]
}

export default function ComboDetailClient({ combo, scene, sceneLabel, allCombos }: Props) {
  const tier = TIER[combo.tier] || TIER.mid
  const totalTools = combo.steps.flatMap(s => s.tools).length
  const overallNet = NET_META[combo.netSummary]
  const overallDiff = DIFF_LABELS[combo.overallDifficulty]

  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '28px 20px 80px' }}>

      {/* 面包屑 */}
      <nav style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginBottom: '20px', display: 'flex', gap: '6px', alignItems: 'center' }}>
        <Link href="/" style={{ color: 'var(--color-text-tertiary)', textDecoration: 'none' }}>GO悟空</Link>
        <span>›</span>
        <Link href={`/recommend?q=${encodeURIComponent(sceneLabel)}`} style={{ color: 'var(--color-text-tertiary)', textDecoration: 'none' }}>{sceneLabel}</Link>
        <span>›</span>
        <span style={{ color: 'var(--color-text-primary)' }}>{combo.name}</span>
      </nav>

      {/* 头部卡片 */}
      <div style={{ padding: '24px', borderRadius: '18px', marginBottom: '20px', background: tier.bg, border: `1.5px solid ${tier.border}` }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: tier.textColor, background: 'white', padding: '2px 10px', borderRadius: '20px', border: `1px solid ${tier.border}` }}>{tier.label}</span>
          <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', background: 'white', padding: '2px 10px', borderRadius: '20px' }}>🎯 {sceneLabel}</span>
        </div>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', fontWeight: 600, color: 'var(--color-text-primary)', margin: '0 0 8px' }}>{combo.name}</h1>
        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.65, margin: '0 0 16px' }}>{combo.tagline}</p>

        {/* 核心指标 */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          {[
            { label: '月预算', value: combo.priceMin === 0 && combo.priceMax === 0 ? '完全免费' : `¥${combo.priceMin}${combo.priceMax > 0 ? `–${combo.priceMax}` : '+'}` },
            { label: '步骤数', value: `${combo.steps.length} 步` },
            { label: '工具数', value: `${totalTools} 个` },
          ].map(item => (
            <div key={item.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: 700, color: tier.border }}>{item.value}</div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 概览信息栏 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px', marginBottom: '20px' }}>
        {[
          {
            icon: '🌐', label: '网络要求',
            value: <NetDot net={combo.netSummary} />,
          },
          {
            icon: '📊', label: '上手难度',
            value: (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <DiffDots level={combo.overallDifficulty} />
                <span style={{ fontSize: 12, fontWeight: 500, color: overallDiff?.color }}>{overallDiff?.label}</span>
              </span>
            ),
          },
          combo.setupTime ? { icon: '⏱️', label: '初次配置', value: <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)' }}>{combo.setupTime}</span> } : null,
          combo.timePerOutput ? { icon: '⚡', label: '产出效率', value: <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-primary)' }}>{combo.timePerOutput}</span> } : null,
          combo.bestFor ? { icon: '👤', label: '适合人群', value: <span style={{ fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>{combo.bestFor}</span> } : null,
        ].filter(Boolean).map((item, i) => (
          <div key={i} style={{ background: 'var(--color-background-primary)', border: '0.5px solid var(--color-border-tertiary)', borderRadius: '10px', padding: '10px 12px' }}>
            <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', marginBottom: '5px' }}>{item!.icon} {item!.label}</div>
            <div>{item!.value}</div>
          </div>
        ))}
      </div>

      {/* 广告位 */}
      <div style={{ marginBottom: '20px', minHeight: '60px', padding: '10px', background: 'var(--color-background-secondary)', border: '1px dashed var(--color-border-secondary)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: 'var(--color-text-tertiary)' }}>
        广告位 · AdSense
      </div>

      {/* 推荐理由 */}
      <div style={{ marginBottom: '24px', padding: '16px 20px', background: 'var(--color-background-primary)', border: '0.5px solid var(--color-border-tertiary)', borderRadius: '14px' }}>
        <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '8px' }}>⭐ 为什么推荐这套组合？</h2>
        <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.8, margin: '0 0 10px' }}>{combo.why}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {combo.pros.map(p => (
            <span key={p} style={{ fontSize: '12px', padding: '3px 10px', borderRadius: '20px', background: '#E1F5EE', color: '#085041', border: '0.5px solid #A7F3D0' }}>✓ {p}</span>
          ))}
        </div>
      </div>

      {/* 完整流程 */}
      <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '16px' }}>📋 完整操作流程</h2>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {combo.steps.map((step, idx) => (
          <div key={idx} style={{ display: 'flex' }}>
            {/* 左侧连接线 */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '44px', flexShrink: 0 }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: tier.border, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, flexShrink: 0 }}>{idx + 1}</div>
              {idx < combo.steps.length - 1 && <div style={{ flex: 1, width: '2px', background: `${tier.border}40`, minHeight: '20px' }} />}
            </div>

            {/* 右侧内容 */}
            <div style={{ flex: 1, paddingLeft: '12px', paddingBottom: '24px' }}>
              {/* 步骤标题行 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>{step.phase}</h3>
                {step.conn === 'or' && <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', background: 'var(--color-background-secondary)', padding: '1px 8px', borderRadius: '4px' }}>任选其一</span>}
                {/* 流转难度标签 */}
                {idx > 0 && step.flowDifficulty && (
                  <span style={{ fontSize: '10px', color: FLOW_LABELS[step.flowDifficulty].color, background: 'var(--color-background-secondary)', padding: '1px 7px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: 3 }}>
                    {FLOW_LABELS[step.flowDifficulty].icon} {FLOW_LABELS[step.flowDifficulty].label}
                  </span>
                )}
              </div>

              {/* 流转说明 */}
              {idx > 0 && step.flowNote && (
                <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', background: 'var(--color-background-secondary)', padding: '5px 10px', borderRadius: '6px', marginBottom: '8px', borderLeft: `2px solid ${tier.border}40` }}>
                  上一步 → {step.flowNote}
                </div>
              )}

              {/* 工具卡片 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {step.tools.map((tool, ti) => {
                  const slug = tool.slug
                  const demo = DEMO_VIDEOS[tool.name]
                  const diff = DIFF_LABELS[tool.difficulty]
                  return (
                    <div key={ti} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px 14px', background: 'var(--color-background-primary)', border: '0.5px solid var(--color-border-tertiary)', borderRadius: '12px' }}>
                      {/* 工具图标 */}
                      <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--color-background-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                        {slug ? <ToolIcon slug={slug} name={tool.name} size={28} /> : <span style={{ fontSize: '20px' }}>{tool.logo}</span>}
                      </div>

                      {/* 工具信息 */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        {/* 工具名 + 价格 + 网络 */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '4px' }}>
                          <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-primary)' }}>{tool.name}</span>
                          <span style={{ fontSize: '11px', color: '#085041', background: '#E1F5EE', padding: '1px 7px', borderRadius: '4px', fontWeight: 500 }}>{tool.price}</span>
                          <NetDot net={tool.net} />
                        </div>
                        {/* 难度 + 小贴士 */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--color-text-tertiary)' }}>
                            上手：<DiffDots level={tool.difficulty} size={6} />
                            <span style={{ color: diff?.color, fontWeight: 500 }}>{diff?.label}</span>
                          </span>
                          {tool.tip && (
                            <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', lineHeight: 1.4 }}>💡 {tool.tip}</span>
                          )}
                        </div>
                      </div>

                      {/* 操作按钮 */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flexShrink: 0, alignItems: 'flex-end' }}>
                        {demo && (
                          <a href={demo.url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '11px', fontWeight: 500, padding: '4px 8px', borderRadius: '6px', textDecoration: 'none', border: '0.5px solid var(--color-border-secondary)', background: demo.platform === 'youtube' ? '#FFF5F5' : '#FFF0F5', color: demo.platform === 'youtube' ? '#CC0000' : '#E0366F', whiteSpace: 'nowrap' }}>
                            ▶ {demo.platform === 'youtube' ? 'YouTube' : 'B站'}教程
                          </a>
                        )}
                        <div style={{ display: 'flex', gap: '5px' }}>
                          {slug && (
                            <Link href={`/tools/${slug}/`} style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '6px', textDecoration: 'none', border: '0.5px solid var(--color-border-secondary)', color: 'var(--color-text-secondary)', background: 'var(--color-background-secondary)', whiteSpace: 'nowrap' }}>
                              详情
                            </Link>
                          )}
                          <a href={tool.url} target="_blank" rel="nofollow noopener" style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '6px', textDecoration: 'none', border: `0.5px solid ${tier.border}`, color: tier.border, background: tier.bg, fontWeight: 500, whiteSpace: 'nowrap' }}>
                            官网 ↗
                          </a>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 网络要求图例说明 */}
      <div style={{ margin: '0 0 24px', padding: '12px 16px', background: 'var(--color-background-secondary)', borderRadius: '10px', border: '0.5px solid var(--color-border-tertiary)' }}>
        <p style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: '8px' }}>🌐 工具访问说明</p>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          {(Object.entries(NET_META) as [NetAccess, typeof NET_META[NetAccess]][]).map(([key, m]) => (
            <span key={key} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--color-text-secondary)' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: m.dot, display: 'inline-block' }} />
              <strong style={{ color: m.color }}>{m.label}</strong>：{m.desc}
            </span>
          ))}
        </div>
      </div>

      {/* 广告位 */}
      <div style={{ margin: '8px 0 24px', minHeight: '60px', padding: '10px', background: 'var(--color-background-secondary)', border: '1px dashed var(--color-border-secondary)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: 'var(--color-text-tertiary)' }}>
        广告位 · 联盟推广
      </div>

      {/* 同场景其他方案 */}
      {allCombos.filter(c => c.id !== combo.id).length > 0 && (
        <div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '12px' }}>同场景其他方案</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {allCombos.filter(c => c.id !== combo.id).map(c => {
              const ct = TIER[c.tier] || TIER.mid
              return (
                <Link key={c.id} href={`/combos/${scene}/${c.id}/`} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'var(--color-background-primary)', border: '0.5px solid var(--color-border-tertiary)', borderRadius: '12px', textDecoration: 'none' }}>
                  <span style={{ fontSize: '11px', fontWeight: 500, color: ct.textColor, background: ct.bg, padding: '2px 8px', borderRadius: '10px', flexShrink: 0 }}>{ct.label}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text-primary)' }}>{c.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                      <span style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{c.tagline}</span>
                      <NetDot net={c.netSummary} />
                    </div>
                  </div>
                  <span style={{ color: 'var(--color-text-tertiary)', flexShrink: 0 }}>→</span>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
