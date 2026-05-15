'use client'
import { useState } from 'react'

// 每个工具的本地图标扩展名（已下载到 public/logos/）
// 优先 .png，其次 .ico，其次 .svg
const EXT: Record<string, string> = {
  chatgpt:'png', claude:'ico', gemini:'png', deepseek:'svg', doubao:'png',
  kimi:'ico', tongyi:'png', wenxin:'ico', grok:'ico', zhipu:'ico', mistral:'png',
  perplexity:'png', metaso:'ico', phind:'png', jasper:'png', copyai:'png',
  grammarly:'png', 'notion-ai':'ico', xiezuocat:'ico', cursor:'ico',
  'github-copilot':'svg', codeium:'ico', v0:'ico', bolt:'ico', 'tongyi-lingma':'png',
  devin:'ico', midjourney:'png', 'stable-diffusion':'ico', dalle3:'png', flux:'ico',
  jimeng:'png', 'wenxin-yige':'ico', ideogram:'png', leonardo:'png',
  runway:'png', sora:'png', kling:'ico', vidu:'ico', heygen:'png', pika:'png',
  elevenlabs:'png', suno:'ico', udio:'ico', 'volcengine-tts':'ico', iflytek:'ico',
  descript:'png', gamma:'png', tome:'png', aippt:'ico', monica:'png', 'wps-ai':'ico',
  julius:'png', helium10:'ico', feigua:'png', manus:'ico', coze:'png', dify:'png',
  fastgpt:'ico', zapier:'ico', capcut:'png', canva:'ico', 'adobe-firefly':'ico',
  gaoding:'ico',
}

interface Props { slug: string; name: string; size?: number }

export default function ToolIcon({ slug, name, size = 32 }: Props) {
  const ext = EXT[slug] || 'png'
  const [failed, setFailed] = useState(false)
  const r = Math.round(size * 0.18)

  if (!failed) {
    return (
      <img
        src={`/logos/${slug}.${ext}`}
        alt={name}
        width={size}
        height={size}
        onError={() => setFailed(true)}
        style={{ width:size, height:size, objectFit:'contain', borderRadius:r, display:'block' }}
      />
    )
  }

  // 降级：品牌色+字母
  const COLORS: Record<string,string> = {
    chatgpt:'#10A37F',claude:'#D97706',gemini:'#4285F4',deepseek:'#1E3A5F',
    doubao:'#2D5BE3',kimi:'#1A1A2E',tongyi:'#FF6A00',wenxin:'#2468F2',
    grok:'#000',zhipu:'#6366F1',mistral:'#FF7000',perplexity:'#20B2AA',
    metaso:'#00B894',phind:'#4F46E5',jasper:'#9333EA',copyai:'#0EA5E9',
    grammarly:'#15C39A','notion-ai':'#000',xiezuocat:'#FF6B6B',cursor:'#000',
    'github-copilot':'#24292F',codeium:'#09B583',v0:'#000',bolt:'#D97706',
    'tongyi-lingma':'#E55A00',devin:'#5B21B6',midjourney:'#000','stable-diffusion':'#FF4500',
    dalle3:'#10A37F',flux:'#1E1E2E',jimeng:'#1E1B4B','wenxin-yige':'#2468F2',
    ideogram:'#FF3366',leonardo:'#C4A44A',runway:'#00D4AA',sora:'#1D4ED8',
    kling:'#E8005C',vidu:'#7C3AED',heygen:'#4F46E5',pika:'#BE185D',
    elevenlabs:'#FF6B35',suno:'#15803D',udio:'#6D28D9','volcengine-tts':'#E8005C',
    iflytek:'#1B6FD8',descript:'#9A3412',gamma:'#4338CA',tome:'#111827',
    aippt:'#E53E3E',monica:'#D97706','wps-ai':'#C00D0D',julius:'#075985',
    helium10:'#FF5A1F',feigua:'#166534',manus:'#1E293B',coze:'#3730A3',
    dify:'#1E40AF',fastgpt:'#D97706',zapier:'#FF4A00',capcut:'#111827',
    canva:'#00C4CC','adobe-firefly':'#FF0000',gaoding:'#5B6CF9',
  }
  const bg = COLORS[slug] || '#64748B'
  const letter = name.charAt(0).toUpperCase()
  const fs = Math.round(size * 0.42)
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} xmlns="http://www.w3.org/2000/svg">
      <rect width={size} height={size} rx={r} fill={bg}/>
      <text x={size/2} y={size/2} fontFamily="-apple-system,sans-serif"
        fontSize={fs} fontWeight="700" fill="#fff"
        textAnchor="middle" dominantBaseline="central">{letter}</text>
    </svg>
  )
}
