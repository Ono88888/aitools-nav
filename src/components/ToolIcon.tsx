'use client'
import { useState } from 'react'

// 工具官网域名映射（用于 favicon CDN 获取真实 logo）
const DOMAIN: Record<string, string> = {
  chatgpt: 'openai.com', claude: 'claude.ai', gemini: 'gemini.google.com',
  deepseek: 'deepseek.com', doubao: 'doubao.com', kimi: 'kimi.moonshot.cn',
  tongyi: 'tongyi.aliyun.com', wenxin: 'yiyan.baidu.com', grok: 'x.ai',
  zhipu: 'chatglm.cn', mistral: 'mistral.ai', perplexity: 'perplexity.ai',
  metaso: 'metaso.cn', phind: 'phind.com', you: 'you.com',
  jasper: 'jasper.ai', copyai: 'copy.ai', grammarly: 'grammarly.com',
  'notion-ai': 'notion.so', xiezuocat: 'xiezuocat.com', cursor: 'cursor.sh',
  'github-copilot': 'github.com', codeium: 'codeium.com', v0: 'v0.dev',
  bolt: 'bolt.new', 'tongyi-lingma': 'tongyi.aliyun.com', devin: 'devin.ai',
  midjourney: 'midjourney.com', 'stable-diffusion': 'stability.ai',
  dalle3: 'openai.com', flux: 'blackforestlabs.ai', jimeng: 'jimeng.jianying.com',
  'wenxin-yige': 'yige.baidu.com', ideogram: 'ideogram.ai', leonardo: 'leonardo.ai',
  runway: 'runwayml.com', sora: 'openai.com', kling: 'klingai.kuaishou.com',
  vidu: 'vidu.cn', heygen: 'heygen.com', pika: 'pika.art',
  elevenlabs: 'elevenlabs.io', suno: 'suno.com', udio: 'udio.com',
  'volcengine-tts': 'volcengine.com', iflytek: 'iflyrec.com',
  descript: 'descript.com', gamma: 'gamma.app', tome: 'tome.app',
  aippt: 'aippt.cn', monica: 'monica.im', 'wps-ai': 'wps.cn',
  julius: 'julius.ai', helium10: 'helium10.com', feigua: 'feigua.io',
  manus: 'manus.im', coze: 'coze.cn', dify: 'dify.ai',
  fastgpt: 'fastgpt.in', zapier: 'zapier.com', capcut: 'capcut.cn',
  canva: 'canva.com', 'adobe-firefly': 'adobe.com', gaoding: 'gaoding.com',
  obsidian: 'obsidian.md', vercel: 'vercel.com',
  supabase: 'supabase.com', shopify: 'shopify.com', klaviyo: 'klaviyo.com',
  audacity: 'audacityteam.org', 'adobe-audition': 'adobe.com',
  buzzsprout: 'buzzsprout.com', tidio: 'tidio.com', adcreative: 'adcreative.ai',
  comfyui: 'github.com', 'beautiful-ai': 'beautiful.ai',
  'premiere-pro': 'adobe.com', 'davinci-resolve': 'blackmagicdesign.com',
  yixiaoer: 'yixiaoer.cn', xiaoyuzhou: 'xiaoyuzhoufm.com',
  yuque: 'yuque.com', 'meitu-ai': 'meitu.com',
  'tongyi-wanxiang': 'tongyi.aliyun.com', 'markdown-nice': 'mdnice.com',
  lseditor: '135editor.com', etsy: 'etsy.com', github: 'github.com',
}

// 品牌色（降级到字母头像时用）
const COLORS: Record<string, string> = {
  chatgpt: '#10A37F', claude: '#D97706', gemini: '#4285F4', deepseek: '#1E3A5F',
  doubao: '#2D5BE3', kimi: '#1A1A2E', tongyi: '#FF6A00', wenxin: '#2468F2',
  grok: '#000', zhipu: '#6366F1', mistral: '#FF7000', perplexity: '#20B2AA',
  metaso: '#00B894', phind: '#4F46E5', jasper: '#9333EA', copyai: '#0EA5E9',
  grammarly: '#15C39A', 'notion-ai': '#000', xiezuocat: '#FF6B6B', cursor: '#000',
  'github-copilot': '#24292F', codeium: '#09B583', v0: '#000', bolt: '#D97706',
  'tongyi-lingma': '#E55A00', devin: '#5B21B6', midjourney: '#000',
  'stable-diffusion': '#FF4500', dalle3: '#10A37F', flux: '#1E1E2E',
  jimeng: '#1E1B4B', 'wenxin-yige': '#2468F2', ideogram: '#FF3366',
  leonardo: '#C4A44A', runway: '#00D4AA', sora: '#1D4ED8', kling: '#E8005C',
  vidu: '#7C3AED', heygen: '#4F46E5', pika: '#BE185D', elevenlabs: '#FF6B35',
  suno: '#15803D', udio: '#6D28D9', 'volcengine-tts': '#E8005C',
  iflytek: '#1B6FD8', descript: '#9A3412', gamma: '#4338CA', tome: '#111827',
  aippt: '#E53E3E', monica: '#D97706', 'wps-ai': '#C00D0D', julius: '#075985',
  helium10: '#FF5A1F', feigua: '#166534', manus: '#1E293B', coze: '#3730A3',
  dify: '#1E40AF', fastgpt: '#D97706', zapier: '#FF4A00', capcut: '#111827',
  canva: '#00C4CC', 'adobe-firefly': '#FF0000', gaoding: '#5B6CF9',
}

// 本지에 있는 파일 목록（只有这些才用本地路径）
const LOCAL_FILES: Record<string, string> = {
  claude: 'png', codeium: 'ico', coze: 'ico', cursor: 'ico',
  deepseek: 'svg', devin: 'ico', doubao: 'png', elevenlabs: 'png',
  fastgpt: 'ico', flux: 'ico', gaoding: 'ico', 'github-copilot': 'svg',
  grok: 'ico', helium10: 'ico', iflytek: 'ico', kimi: 'ico',
  kling: 'ico', manus: 'ico', metaso: 'ico', 'notion-ai': 'ico',
  'stable-diffusion': 'png', udio: 'ico', vidu: 'png', 'volcengine-tts': 'ico',
  'wenxin-yige': 'ico', wenxin: 'ico', 'wps-ai': 'ico', xiezuocat: 'ico',
  zapier: 'ico', zhipu: 'ico', 'adobe-firefly': 'ico', aippt: 'ico',
  bolt: 'svg', 'canva': 'ico',
}

type Stage = 'local' | 'cdn' | 'letter'

interface Props { slug: string; name: string; emoji?: string; size?: number }

export default function ToolIcon({ slug, name, size = 32 }: Props) {
  const hasLocal = !!LOCAL_FILES[slug]
  const hasDomain = !!DOMAIN[slug]
  const initStage: Stage = hasLocal ? 'local' : hasDomain ? 'cdn' : 'letter'
  const [stage, setStage] = useState<Stage>(initStage)

  const r = Math.round(size * 0.18)

  function nextStage() {
    if (stage === 'local' && hasDomain) setStage('cdn')
    else setStage('letter')
  }

  if (stage === 'local') {
    const ext = LOCAL_FILES[slug]
    return (
      <img
        src={`/logos/${slug}.${ext}`}
        alt={name}
        width={size} height={size}
        onError={nextStage}
        style={{ width: size, height: size, objectFit: 'contain', borderRadius: r, display: 'block' }}
      />
    )
  }

  if (stage === 'cdn') {
    const domain = DOMAIN[slug]
    // 使用 Google favicon 服务，免费无需 key，全球 CDN
    const cdnUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=${size >= 32 ? 64 : 32}`
    return (
      <img
        src={cdnUrl}
        alt={name}
        width={size} height={size}
        onError={nextStage}
        style={{ width: size, height: size, objectFit: 'contain', borderRadius: r, display: 'block' }}
      />
    )
  }

  // 降级：品牌色 + 首字母
  const bg = COLORS[slug] || '#64748B'
  const letter = name.charAt(0).toUpperCase()
  const fs = Math.round(size * 0.42)
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} xmlns="http://www.w3.org/2000/svg">
      <rect width={size} height={size} rx={r} fill={bg} />
      <text x={size / 2} y={size / 2} fontFamily="-apple-system,sans-serif"
        fontSize={fs} fontWeight="700" fill="#fff"
        textAnchor="middle" dominantBaseline="central">{letter}</text>
    </svg>
  )
}
