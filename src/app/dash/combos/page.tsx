'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { COMBOS_DB, SCENE_LABELS } from '@/lib/combos-data'

export default function DashCombosPage() {
  const [sceneFilter, setSceneFilter] = useState('全部')
  const [tierFilter, setTierFilter] = useState('全部')

  const scenes = ['全部', ...Object.keys(SCENE_LABELS)]
  const tiers = ['全部', 'free', 'mid', 'pro']
  const tierLabel: Record<string, string> = { free: '全免费', mid: '性价比', pro: '专业版' }

  const allCombos = Object.entries(COMBOS_DB).flatMap(([scene, combos]) =>
    combos.map(c => ({ ...c, scene }))
  )

  const filtered = allCombos.filter(c => {
    const matchScene = sceneFilter === '全部' || c.scene === sceneFilter
    const matchTier = tierFilter === '全部' || c.tier === tierFilter
    return matchScene && matchTier
  })

  const TIER_STYLE: Record<string, { bg: string; color: string }> = {
    free: { bg: '#E1F5EE', color: '#085041' },
    mid:  { bg: '#FEF3C7', color: '#92400E' },
    pro:  { bg: '#EDE9FE', color: '#4C1D95' },
  }

  return (
    <div style={{ padding: '28px 28px 60px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1E293B', marginBottom: 4 }}>🃏 工具组合管理</h1>
          <p style={{ fontSize: 12, color: '#94A3B8' }}>共 {allCombos.length} 套工具组合 · {Object.keys(COMBOS_DB).length} 个场景 · 修改需编辑 <code style={{ background: '#F1F5F9', padding: '1px 5px', borderRadius: 4 }}>src/lib/combos-data.ts</code></p>
        </div>
        <a href="https://github.com/Ono88888/aitools-nav/edit/master/src/lib/combos-data.ts" target="_blank" rel="noopener"
          style={{ padding: '9px 16px', background: '#1E293B', color: '#fff', borderRadius: 10, fontSize: 12, fontWeight: 500, textDecoration: 'none' }}>
          ✏️ 在 GitHub 编辑
        </a>
      </div>

      {/* 统计卡片 */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { label: '总组合数', value: allCombos.length, color: '#D97706' },
          { label: '场景数', value: Object.keys(COMBOS_DB).length, color: '#3B82F6' },
          { label: '全免费方案', value: allCombos.filter(c => c.tier === 'free').length, color: '#10B981' },
          { label: '编辑推荐', value: allCombos.filter(c => c.isRec).length, color: '#8B5CF6' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', border: '1.5px solid #E2E8F0', borderRadius: 12, padding: '14px 20px', flex: '1 1 120px', minWidth: 120 }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: '#64748B' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* 筛选 */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: '#64748B' }}>场景：</span>
        {scenes.map(s => (
          <button key={s} onClick={() => setSceneFilter(s)}
            style={{ padding: '4px 12px', borderRadius: 20, border: `1.5px solid ${sceneFilter === s ? '#D97706' : '#CBD5E0'}`, background: sceneFilter === s ? '#FEF3C7' : '#fff', color: sceneFilter === s ? '#92400E' : '#64748B', cursor: 'pointer', fontSize: 11, fontFamily: 'sans-serif' }}>
            {s === '全部' ? '全部' : (SCENE_LABELS[s] || s)}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: '#64748B' }}>类型：</span>
        {tiers.map(t => (
          <button key={t} onClick={() => setTierFilter(t)}
            style={{ padding: '4px 12px', borderRadius: 20, border: `1.5px solid ${tierFilter === t ? '#D97706' : '#CBD5E0'}`, background: tierFilter === t ? '#FEF3C7' : '#fff', color: tierFilter === t ? '#92400E' : '#64748B', cursor: 'pointer', fontSize: 11, fontFamily: 'sans-serif' }}>
            {t === '全部' ? '全部' : tierLabel[t]}
          </button>
        ))}
      </div>

      {/* 组合列表 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.map(combo => {
          const ts = TIER_STYLE[combo.tier] || TIER_STYLE.mid
          return (
            <div key={combo.id} style={{ background: '#fff', border: '1.5px solid #E2E8F0', borderRadius: 14, padding: '14px 18px', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: ts.bg, color: ts.color }}>{tierLabel[combo.tier]}</span>
                  <span style={{ fontSize: 11, background: '#F1F5F9', color: '#475569', padding: '2px 7px', borderRadius: 4 }}>{SCENE_LABELS[combo.scene] || combo.scene}</span>
                  {combo.isRec && <span style={{ fontSize: 11, background: '#FFF0E6', color: '#C2410C', padding: '2px 7px', borderRadius: 4 }}>⭐ 推荐</span>}
                  <span style={{ fontSize: 11, color: '#94A3B8', fontFamily: 'monospace' }}>ID: {combo.id}</span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#1E293B', marginBottom: 3 }}>{combo.name}</div>
                <div style={{ fontSize: 12, color: '#64748B', marginBottom: 8 }}>{combo.tagline}</div>
                <div style={{ display: 'flex', gap: 10, fontSize: 11, color: '#94A3B8', flexWrap: 'wrap' }}>
                  <span>💰 ¥{combo.priceMin}–{combo.priceMax}/月</span>
                  <span>📊 难度 {combo.overallDifficulty}/5</span>
                  <span>🔧 {combo.steps.length} 步骤</span>
                  <span>🌐 {combo.netSummary === 'cn' ? '国内直连' : combo.netSummary === 'vpn' ? '需要梯子' : '均可访问'}</span>
                </div>
              </div>
              <Link href={`/combos/${combo.scene}/${combo.id}/`} target="_blank"
                style={{ fontSize: 12, padding: '7px 14px', borderRadius: 8, border: '1.5px solid #CBD5E0', color: '#475569', textDecoration: 'none', background: '#F8FAFC', whiteSpace: 'nowrap', flexShrink: 0 }}>
                预览 →
              </Link>
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: 40, color: '#94A3B8' }}>没有匹配的工具组合</div>
      )}
    </div>
  )
}
