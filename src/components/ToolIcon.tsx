'use client'
import { useState } from 'react'

// 工具官网域名（用于浏览器端 Google Favicon CDN 兜底）
const DOMAIN: Record<string, string> = {
  chatgpt:'openai.com', claude:'claude.ai', gemini:'google.com',
  deepseek:'deepseek.com', doubao:'doubao.com', kimi:'moonshot.cn',
  tongyi:'aliyun.com', wenxin:'baidu.com', grok:'x.ai',
  zhipu:'zhipuai.cn', mistral:'mistral.ai', perplexity:'perplexity.ai',
  metaso:'metaso.cn', phind:'phind.com', you:'you.com',
  jasper:'jasper.ai', copyai:'copy.ai', grammarly:'grammarly.com',
  'notion-ai':'notion.so', xiezuocat:'xiezuocat.com',
  cursor:'cursor.com', 'github-copilot':'github.com', codeium:'codeium.com',
  v0:'v0.dev', bolt:'bolt.new', 'tongyi-lingma':'aliyun.com',
  devin:'devin.ai', midjourney:'midjourney.com', 'stable-diffusion':'stability.ai',
  dalle3:'openai.com', flux:'blackforestlabs.ai', jimeng:'jianying.com',
  'wenxin-yige':'baidu.com', ideogram:'ideogram.ai', leonardo:'leonardo.ai',
  runway:'runwayml.com', sora:'openai.com', kling:'kuaishou.com',
  vidu:'vidu.cn', heygen:'heygen.com', pika:'pika.art',
  elevenlabs:'elevenlabs.io', suno:'suno.com', udio:'udio.com',
  'volcengine-tts':'volcengine.com', iflytek:'iflytek.com',
  descript:'descript.com', gamma:'gamma.app', tome:'tome.app',
  aippt:'aippt.cn', monica:'monica.im', 'wps-ai':'wps.cn',
  julius:'julius.ai', helium10:'helium10.com', feigua:'feigua.io',
  manus:'manus.im', coze:'coze.cn', dify:'dify.ai',
  fastgpt:'fastgpt.in', zapier:'zapier.com', capcut:'capcut.com',
  canva:'canva.com', 'adobe-firefly':'adobe.com', gaoding:'gaoding.com',
  obsidian:'obsidian.md', vercel:'vercel.com', supabase:'supabase.com',
  shopify:'shopify.com', klaviyo:'klaviyo.com', audacity:'audacityteam.org',
  'adobe-audition':'adobe.com', buzzsprout:'buzzsprout.com',
  tidio:'tidio.com', adcreative:'adcreative.ai', comfyui:'github.com',
  'beautiful-ai':'beautiful.ai', 'premiere-pro':'adobe.com',
  'davinci-resolve':'blackmagicdesign.com', yixiaoer:'yixiaoer.cn',
  xiaoyuzhou:'xiaoyuzhoufm.com', yuque:'yuque.com', 'meitu-ai':'meitu.com',
  'tongyi-wanxiang':'aliyun.com', 'markdown-nice':'mdnice.com',
  lseditor:'135editor.com', etsy:'etsy.com', github:'github.com',
  'runway-edit':'runwayml.com',
}

// 品牌色兜底（最后一层）
const BRAND: Record<string, [string, string, string]> = {
  chatgpt:['#10A37F','#fff','GPT'], claude:['#CC7722','#fff','C'],
  gemini:['#1A73E8','#fff','G'], deepseek:['#4D6BFE','#fff','DS'],
  doubao:['#1664FF','#fff','豆'], kimi:['#1C1C1E','#fff','K'],
  tongyi:['#FF6A00','#fff','通'], wenxin:['#2F54EB','#fff','文'],
  grok:['#000','#fff','Gk'], zhipu:['#6554C0','#fff','智'],
  mistral:['#FF7000','#fff','Mi'], perplexity:['#20B2AA','#fff','Px'],
  metaso:['#00C853','#fff','秘'], phind:['#5865F2','#fff','Ph'],
  you:['#F43F5E','#fff','Y'], jasper:['#7C3AED','#fff','Js'],
  copyai:['#0EA5E9','#fff','Ca'], grammarly:['#15C39A','#fff','Gr'],
  'notion-ai':['#000','#fff','N'], xiezuocat:['#FF4B4B','#fff','写'],
  cursor:['#000','#fff','Cu'], 'github-copilot':['#24292F','#fff','Co'],
  codeium:['#09B583','#fff','Cd'], v0:['#000','#fff','v0'],
  bolt:['#FBBF24','#000','⚡'], 'tongyi-lingma':['#FF6A00','#fff','灵'],
  devin:['#7C3AED','#fff','Dv'], midjourney:['#000','#fff','MJ'],
  'stable-diffusion':['#C2410C','#fff','SD'], dalle3:['#10A37F','#fff','D3'],
  flux:['#1E1B4B','#fff','Fx'], jimeng:['#8B5CF6','#fff','即'],
  'wenxin-yige':['#2F54EB','#fff','一'], ideogram:['#E11D48','#fff','Io'],
  leonardo:['#B45309','#fff','Le'], runway:['#00D4AA','#111','RW'],
  sora:['#1D4ED8','#fff','So'], kling:['#E8005C','#fff','可'],
  vidu:['#7C3AED','#fff','Vi'], heygen:['#4F46E5','#fff','Hg'],
  pika:['#BE185D','#fff','Pk'], elevenlabs:['#FF4500','#fff','11'],
  suno:['#15803D','#fff','Su'], udio:['#6D28D9','#fff','Ud'],
  'volcengine-tts':['#E8005C','#fff','火'], iflytek:['#1B6FD8','#fff','讯'],
  descript:['#9A3412','#fff','De'], gamma:['#6366F1','#fff','Gm'],
  tome:['#111827','#fff','To'], aippt:['#E53E3E','#fff','AI'],
  monica:['#D97706','#fff','Mo'], 'wps-ai':['#C00D0D','#fff','WP'],
  julius:['#075985','#fff','Ju'], helium10:['#FF5A1F','#fff','H₁₀'],
  feigua:['#166534','#fff','飞'], manus:['#1E293B','#fff','Mn'],
  coze:['#3730A3','#fff','扣'], dify:['#2563EB','#fff','Df'],
  fastgpt:['#D97706','#fff','FG'], zapier:['#FF4A00','#fff','Za'],
  capcut:['#000','#fff','剪'], canva:['#00C4CC','#fff','Cv'],
  'adobe-firefly':['#FF0000','#fff','Ff'], gaoding:['#5B6CF9','#fff','稿'],
  obsidian:['#7C3AED','#fff','Ob'], vercel:['#000','#fff','▲'],
  supabase:['#3ECF8E','#111','Sb'], shopify:['#96BF48','#fff','Sh'],
  klaviyo:['#161616','#fff','Kl'], audacity:['#0000CC','#fff','Au'],
  'adobe-audition':['#00005B','#fff','Aa'], buzzsprout:['#F59E0B','#fff','Bz'],
  tidio:['#0A84FF','#fff','Ti'], adcreative:['#6366F1','#fff','Ad'],
  comfyui:['#1F2937','#fff','CF'], 'beautiful-ai':['#7C3AED','#fff','Ba'],
  'premiere-pro':['#9999FF','#fff','Pr'], 'davinci-resolve':['#E50000','#fff','DR'],
  yixiaoer:['#F59E0B','#fff','蚁'], xiaoyuzhou:['#1C1C1E','#fff','宇'],
  yuque:['#00B96B','#fff','语'], 'meitu-ai':['#FF3E6C','#fff','美'],
  'tongyi-wanxiang':['#FF6A00','#fff','万'], 'markdown-nice':['#0EA5E9','#fff','Md'],
  lseditor:['#E53E3E','#fff','135'], etsy:['#F56400','#fff','Et'],
  github:['#24292F','#fff','GH'], 'runway-edit':['#00D4AA','#111','RE'],
}

// 本地文件的实际格式（下载脚本会生成各种格式）
// 浏览器会依次尝试 png > svg > ico
const LOCAL_EXTS = ['png', 'svg', 'ico', 'webp']

type Stage = 'local' | 'cdn' | 'brand'

interface Props { slug: string; name: string; size?: number }

export default function ToolIcon({ slug, name, size = 32 }: Props) {
  const [stage, setStage] = useState<Stage>('local')
  const [extIdx, setExtIdx] = useState(0)

  const r = Math.round(size * 0.22)

  function handleError() {
    if (stage === 'local') {
      if (extIdx + 1 < LOCAL_EXTS.length) {
        // 还有其他扩展名可以尝试
        setExtIdx(i => i + 1)
      } else if (DOMAIN[slug]) {
        // 所有本地格式都失败，去CDN
        setStage('cdn')
      } else {
        setStage('brand')
      }
    } else if (stage === 'cdn') {
      setStage('brand')
    }
  }

  // 第1层：本地文件
  if (stage === 'local') {
    const ext = LOCAL_EXTS[extIdx]
    return (
      <img src={`/logos/${slug}.${ext}`} alt={name}
        width={size} height={size}
        style={{ width: size, height: size, objectFit: 'contain', display: 'block', borderRadius: r }}
        onError={handleError} />
    )
  }

  // 第2层：浏览器端 Google Favicon CDN（用户浏览器访问，不受服务器限制）
  if (stage === 'cdn' && DOMAIN[slug]) {
    const sz = size >= 32 ? 64 : 32
    return (
      <img src={`https://www.google.com/s2/favicons?domain=${DOMAIN[slug]}&sz=${sz}`}
        alt={name} width={size} height={size}
        style={{ width: size, height: size, objectFit: 'contain', display: 'block', borderRadius: r }}
        onError={handleError} />
    )
  }

  // 第3层：品牌色内联SVG
  const b = BRAND[slug]
  const bg = b?.[0] ?? '#64748B'
  const fg = b?.[1] ?? '#fff'
  const label = b?.[2] ?? name.slice(0,2).toUpperCase()
  const fs = label.length <= 1 ? size*0.42 : label.length <= 2 ? size*0.33 : size*0.24
  const darkBg = (() => {
    const h = bg.replace('#','')
    try {
      const r2=Math.max(0,Math.round(parseInt(h.slice(0,2),16)*0.82))
      const g2=Math.max(0,Math.round(parseInt(h.slice(2,4),16)*0.82))
      const b2=Math.max(0,Math.round(parseInt(h.slice(4,6),16)*0.82))
      return `#${r2.toString(16).padStart(2,'0')}${g2.toString(16).padStart(2,'0')}${b2.toString(16).padStart(2,'0')}`
    } catch { return bg }
  })()
  const gid = `g${slug.replace(/[^a-zA-Z0-9]/g,'')}`
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={gid} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={bg} />
          <stop offset="100%" stopColor={darkBg} />
        </linearGradient>
      </defs>
      <rect width={size} height={size} rx={r} fill={`url(#${gid})`} />
      <text x={size/2} y={size/2} fontFamily="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"
        fontSize={fs} fontWeight={800} fill={fg}
        textAnchor="middle" dominantBaseline="central">{label}</text>
    </svg>
  )
}
