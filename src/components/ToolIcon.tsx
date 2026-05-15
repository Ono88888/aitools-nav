'use client'
import { useState } from 'react'

const FAVICON_MAP: Record<string, string> = {
  'chatgpt':       'https://openai.com/favicon.ico',
  'claude':        'https://claude.ai/favicon.ico',
  'gemini':        'https://www.gstatic.com/lamda/images/gemini_favicon_f069958c85030456e93de685481c559f160ea06.svg',
  'deepseek':      'https://chat.deepseek.com/favicon.svg',
  'doubao':        'https://lf-flow-web-cdn.doubao.com/obj/flow-doubao/doubao/web/logo-icon.png',
  'kimi':          'https://statics.moonshot.cn/kimi-chat/favicon.ico',
  'tongyi':        'https://img.alicdn.com/imgextra/i1/O1CN01MoIDpb1iMjBbhZFTB_!!6000000004398-2-tps-200-200.png',
  'notion-ai':     'https://www.notion.so/front-static/favicon.ico',
  'cursor':        'https://www.cursor.com/favicon.ico',
  'github-copilot':'https://github.githubassets.com/favicons/favicon.svg',
  'midjourney':    'https://www.midjourney.com/favicon.ico',
  'runway':        'https://runwayml.com/favicon.ico',
  'heygen':        'https://www.heygen.com/favicon.ico',
  'elevenlabs':    'https://elevenlabs.io/favicon.ico',
  'suno':          'https://suno.com/favicon.ico',
  'gamma':         'https://gamma.app/favicon.ico',
  'canva':         'https://static.canva.com/web/images/favicon.ico',
  'zapier':        'https://zapier.com/favicon.ico',
  'grammarly':     'https://static.grammarly.com/assets/files/cb6ba12e3453def5b8afefc0a11dbfb0/favicon.ico',
  'perplexity':    'https://www.perplexity.ai/favicon.svg',
  'dify':          'https://dify.ai/favicon.ico',
  'helium10':      'https://www.helium10.com/favicon.ico',
}

interface Props { slug: string; emoji?: string; name: string; size?: number }

export default function ToolIcon({ slug, emoji, name, size = 32 }: Props) {
  const favicon = FAVICON_MAP[slug]
  const [state, setState] = useState<'favicon'|'local'|'emoji'>(favicon ? 'favicon' : 'local')
  const localSvg = `/logos/${slug}.svg`
  const s = { width: size, height: size, objectFit: 'contain' as const, borderRadius: 6, display: 'block' }

  if (state === 'favicon' && favicon)
    return <img src={favicon} alt={name} width={size} height={size} onError={() => setState('local')} style={s} />
  if (state !== 'emoji')
    return <img src={localSvg} alt={name} width={size} height={size} onError={() => setState('emoji')} style={s} />
  return <span style={{ fontSize: size * 0.7, lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: size, height: size }}>{emoji || '🔧'}</span>
}
