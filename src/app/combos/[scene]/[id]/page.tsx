'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { getCombos, SCENE_LABELS } from '@/lib/combos-data'
import ToolIcon from '@/components/ToolIcon'

const DEMO_VIDEOS: Record<string, { url: string; platform: 'youtube' | 'bilibili' }> = {
  '豆包':        { url: 'https://search.bilibili.com/all?keyword=豆包AI教程', platform: 'bilibili' },
  'DeepSeek':   { url: 'https://search.bilibili.com/all?keyword=DeepSeek教程', platform: 'bilibili' },
  'Claude 3.5': { url: 'https://www.youtube.com/results?search_query=claude+ai+tutorial', platform: 'youtube' },
  'ElevenLabs': { url: 'https://www.youtube.com/results?search_query=elevenlabs+tutorial', platform: 'youtube' },
  '剪映专业版': { url: 'https://search.bilibili.com/all?keyword=剪映AI教程', platform: 'bilibili' },
  'Midjourney': { url: 'https://www.youtube.com/results?search_query=midjourney+tutorial+2025', platform: 'youtube' },
  'Cursor':     { url: 'https://www.youtube.com/results?search_query=cursor+ai+coding+tutorial', platform: 'youtube' },
  'Gamma':      { url: 'https://www.youtube.com/results?search_query=gamma+app+presentation+tutorial', platform: 'youtube' },
  'Suno v4':    { url: 'https://www.youtube.com/results?search_query=suno+ai+music+tutorial', platform: 'youtube' },
  'HeyGen':     { url: 'https://www.youtube.com/results?search_query=heygen+avatar+tutorial', platform: 'youtube' },
  'Runway Gen-3':{ url: 'https://www.youtube.com/results?search_query=runway+gen3+tutorial', platform: 'youtube' },
  '可灵AI':     { url: 'https://search.bilibili.com/all?keyword=可灵AI教程', platform: 'bilibili' },
  '即梦AI':     { url: 'https://search.bilibili.com/all?keyword=即梦AI教程', platform: 'bilibili' },
  'Kimi':       { url: 'https://search.bilibili.com/all?keyword=Kimi使用技巧', platform: 'bilibili' },
  'Descript':   { url: 'https://www.youtube.com/results?search_query=descript+podcast+editing+tutorial', platform: 'youtube' },
}

const SLUG_MAP: Record<string, string> = {
  '豆包':'doubao','DeepSeek':'deepseek','Claude 3.5':'claude','Claude API':'claude',
  'ElevenLabs':'elevenlabs','剪映专业版':'capcut','Midjourney':'midjourney',
  'Cursor':'cursor','GitHub Copilot':'github-copilot','Codeium':'codeium',
  'v0':'v0','Bolt.new':'bolt','通义灵码':'tongyi-lingma',
  'Gamma':'gamma','AiPPT':'aippt','Suno v4':'suno','Udio':'udio','Udio Pro':'udio',
  'HeyGen':'heygen','Runway Gen-3':'runway','可灵AI':'kling','即梦AI':'jimeng',
  'Kimi':'kimi','Perplexity':'perplexity','秘塔AI搜索':'metaso',
  'GPT-4o':'chatgpt','ChatGPT':'chatgpt','Descript':'descript',
  '讯飞听见':'iflytek','Notion AI':'notion-ai','写作猫':'xiezuocat',
  'Jasper':'jasper','Stable Diffusion':'stable-diffusion','Dify':'dify',
  '扣子（Coze）':'coze','FastGPT':'fastgpt','Zapier':'zapier',
  '飞瓜数据':'feigua','Helium 10':'helium10','火山引擎TTS':'volcengine-tts',
  'Vidu':'vidu','Pika':'pika','Sora':'sora','Grok':'grok',
  'Adobe Audition':'adobe-firefly','Adobe Firefly':'adobe-firefly',
  'Canva':'canva','稿定设计':'gaoding','WPS AI':'wps-ai',
}

const TIER = {
  free: { bg:'#E1F5EE', border:'#1D9E75', label:'全免费方案', textColor:'#085041' },
  mid:  { bg:'#FEF3C7', border:'#D97706', label:'性价比首选', textColor:'#92400E' },
  pro:  { bg:'#EDE9FE', border:'#7C3AED', label:'创意旗舰',   textColor:'#4C1D95' },
}

export default function ComboDetailPage() {
  const params = useParams()
  const scene = params.scene as string
  const id    = params.id as string
  const combos = getCombos(scene)
  const combo  = combos.find(c => c.id === id)
  if (!combo) return <div style={{ padding: '60px', textAlign: 'center', color: 'var(--color-text-tertiary)' }}>方案未找到</div>

  const tier = TIER[combo.tier as keyof typeof TIER] || TIER.mid
  const sceneLabel = SCENE_LABELS[scene] || scene
  const totalTools = combo.steps.flatMap((s: any) => s.tools).length

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

      {/* 标题卡 */}
      <div style={{ padding: '24px', borderRadius: '18px', marginBottom: '24px', background: tier.bg, border: `1.5px solid ${tier.border}` }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: tier.textColor, background: 'white', padding: '2px 10px', borderRadius: '20px', border: `1px solid ${tier.border}` }}>{tier.label}</span>
          <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', background: 'white', padding: '2px 10px', borderRadius: '20px' }}>🎯 {sceneLabel}</span>
        </div>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', fontWeight: 600, color: 'var(--color-text-primary)', margin: '0 0 8px' }}>{combo.name}</h1>
        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.65, margin: '0 0 16px' }}>{combo.tagline}</p>
        <div style={{ display: 'flex', gap: '20px' }}>
          {[
            { label: '月预算', value: combo.priceMin === 0 && combo.priceMax === 0 ? '免费' : `¥${combo.priceMin}${combo.priceMax > 0 ? `–${combo.priceMax}` : '+'}` },
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

      {/* 广告位 A */}
      <div id="ad-combo-top" style={{ marginBottom: '20px', minHeight: '60px', padding: '10px', background: 'var(--color-background-secondary)', border: '1px dashed var(--color-border-secondary)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: 'var(--color-text-tertiary)' }}>
        {/* Google AdSense 代码放这里 */}
        广告位 · AdSense / 联盟推广
      </div>

      {/* 推荐理由 */}
      <div style={{ marginBottom: '24px', padding: '16px 20px', background: 'var(--color-background-primary)', border: '0.5px solid var(--color-border-tertiary)', borderRadius: '14px' }}>
        <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '8px' }}>⭐ 为什么推荐这套组合？</h2>
        <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.8, margin: '0 0 10px' }}>{combo.why}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {combo.pros.map((p: string) => (
            <span key={p} style={{ fontSize: '12px', padding: '3px 10px', borderRadius: '20px', background: '#E1F5EE', color: '#085041', border: '0.5px solid #A7F3D0' }}>✓ {p}</span>
          ))}
        </div>
      </div>

      {/* 流程步骤 */}
      <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '16px' }}>📋 完整操作流程</h2>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {combo.steps.map((step: any, idx: number) => (
          <div key={idx} style={{ display: 'flex', gap: '0', marginBottom: idx < combo.steps.length - 1 ? '0' : '0' }}>
            {/* 步骤线 */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '44px', flexShrink: 0 }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: tier.border, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, flexShrink: 0, zIndex: 1 }}>{idx + 1}</div>
              {idx < combo.steps.length - 1 && <div style={{ flex: 1, width: '2px', background: `${tier.border}40`, minHeight: '20px' }} />}
            </div>

            {/* 步骤内容 */}
            <div style={{ flex: 1, paddingLeft: '12px', paddingBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', marginTop: '4px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>{step.phase}</h3>
                {step.conn === 'or' && (
                  <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', background: 'var(--color-background-secondary)', padding: '1px 8px', borderRadius: '4px' }}>任选其一</span>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {step.tools.map((tool: any, ti: number) => {
                  const slug = SLUG_MAP[tool.name]
                  const demo = DEMO_VIDEOS[tool.name]
                  return (
                    <div key={ti} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', background: 'var(--color-background-primary)', border: '0.5px solid var(--color-border-tertiary)', borderRadius: '12px' }}>
                      {/* Logo */}
                      <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--color-background-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                        {slug ? <ToolIcon slug={slug} name={tool.name} size={28} /> : <span style={{ fontSize: '20px' }}>{tool.logo}</span>}
                      </div>

                      {/* 信息 */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-primary)' }}>{tool.name}</span>
                          <span style={{ fontSize: '11px', color: '#085041', background: '#E1F5EE', padding: '1px 7px', borderRadius: '4px', fontWeight: 500 }}>{tool.price}</span>
                        </div>
                      </div>

                      {/* 按钮组 */}
                      <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                        {demo && (
                          <a href={demo.url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '11px', fontWeight: 500, padding: '4px 8px', borderRadius: '6px', textDecoration: 'none', border: '0.5px solid var(--color-border-secondary)', background: demo.platform === 'youtube' ? '#FFF5F5' : '#FFF0F5', color: demo.platform === 'youtube' ? '#CC0000' : '#E0366F' }}>
                            ▶ {demo.platform === 'youtube' ? 'YouTube' : 'B站'}教程
                          </a>
                        )}
                        {slug && (
                          <Link href={`/tools/${slug}/`} style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '6px', textDecoration: 'none', border: '0.5px solid var(--color-border-secondary)', color: 'var(--color-text-secondary)', background: 'var(--color-background-secondary)' }}>
                            详情
                          </Link>
                        )}
                        <a href={tool.url} target="_blank" rel="nofollow noopener" style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '6px', textDecoration: 'none', border: `0.5px solid ${tier.border}`, color: tier.border, background: tier.bg, fontWeight: 500 }}>
                          官网 ↗
                        </a>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 广告位 B */}
      <div id="ad-combo-mid" style={{ margin: '8px 0 24px', minHeight: '90px', padding: '10px', background: 'var(--color-background-secondary)', border: '1px dashed var(--color-border-secondary)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: 'var(--color-text-tertiary)' }}>
        {/* Google AdSense 代码放这里 */}
        广告位 · 工具联盟推广 (300×90)
      </div>

      {/* 同场景其他方案 */}
      {combos.filter((c: any) => c.id !== id).length > 0 && (
        <div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '12px' }}>同场景其他方案</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {combos.filter((c: any) => c.id !== id).map((c: any) => {
              const ct = TIER[c.tier as keyof typeof TIER] || TIER.mid
              return (
                <Link key={c.id} href={`/combos/${scene}/${c.id}/`} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'var(--color-background-primary)', border: '0.5px solid var(--color-border-tertiary)', borderRadius: '12px', textDecoration: 'none' }}>
                  <span style={{ fontSize: '11px', fontWeight: 500, color: ct.textColor, background: ct.bg, padding: '2px 8px', borderRadius: '10px', flexShrink: 0 }}>{ct.label}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text-primary)' }}>{c.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.tagline}</div>
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
