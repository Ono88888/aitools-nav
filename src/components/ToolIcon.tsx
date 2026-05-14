'use client'
import { useState } from 'react'

// ── 各工具官方 favicon 直链 ──────────────────────────────────
const FAVICON_MAP: Record<string, string> = {
  'chatgpt':         'https://openai.com/favicon.ico',
  'claude':          'https://claude.ai/favicon.ico',
  'gemini':          'https://www.gstatic.com/lamda/images/gemini_favicon_f069958c85030456e93de685481c559f160ea06.svg',
  'deepseek':        'https://chat.deepseek.com/favicon.svg',
  'doubao':          'https://lf-flow-web-cdn.doubao.com/obj/flow-doubao/doubao/web/logo-icon.png',
  'kimi':            'https://statics.moonshot.cn/kimi-chat/favicon.ico',
  'tongyi':          'https://img.alicdn.com/imgextra/i1/O1CN01MoIDpb1iMjBbhZFTB_!!6000000004398-2-tps-200-200.png',
  'wenxin':          'https://nlp-eb.cdn.bcebos.com/logo/favicon.ico',
  'grok':            'https://x.ai/favicon.ico',
  'zhipu':           'https://chatglm.cn/favicon.ico',
  'mistral':         'https://mistral.ai/favicon.ico',
  'perplexity':      'https://www.perplexity.ai/favicon.svg',
  'metaso':          'https://metaso.cn/favicon.ico',
  'phind':           'https://www.phind.com/images/favicon.png',
  'jasper':          'https://www.jasper.ai/favicon.ico',
  'copyai':          'https://www.copy.ai/favicon.ico',
  'grammarly':       'https://static.grammarly.com/assets/files/cb6ba12e3453def5b8afefc0a11dbfb0/favicon.ico',
  'notion-ai':       'https://www.notion.so/front-static/favicon.ico',
  'xiezuocat':       'https://xiezuocat.com/favicon.ico',
  'cursor':          'https://www.cursor.com/favicon.ico',
  'github-copilot':  'https://github.githubassets.com/favicons/favicon.svg',
  'codeium':         'https://codeium.com/favicon.ico',
  'v0':              'https://v0.dev/favicon.ico',
  'bolt':            'https://bolt.new/favicon.svg',
  'tongyi-lingma':   'https://img.alicdn.com/imgextra/i1/O1CN01MoIDpb1iMjBbhZFTB_!!6000000004398-2-tps-200-200.png',
  'devin':           'https://devin.ai/favicon.ico',
  'midjourney':      'https://www.midjourney.com/favicon.ico',
  'stable-diffusion':'https://stability.ai/favicon.ico',
  'dalle3':          'https://openai.com/favicon.ico',
  'flux':            'https://blackforestlabs.ai/favicon.ico',
  'jimeng':          'https://lf-effect-material-infra.capcut.com/obj/effect-material-infra/jimeng/web/logo/favicon.ico',
  'wenxin-yige':     'https://nlp-eb.cdn.bcebos.com/logo/favicon.ico',
  'ideogram':        'https://ideogram.ai/favicon.ico',
  'leonardo':        'https://app.leonardo.ai/favicon.ico',
  'runway':          'https://runwayml.com/favicon.ico',
  'sora':            'https://openai.com/favicon.ico',
  'kling':           'https://klingai.kuaishou.com/favicon.ico',
  'vidu':            'https://www.vidu.cn/favicon.ico',
  'heygen':          'https://www.heygen.com/favicon.ico',
  'pika':            'https://pika.art/favicon.ico',
  'elevenlabs':      'https://elevenlabs.io/favicon.ico',
  'suno':            'https://suno.com/favicon.ico',
  'udio':            'https://www.udio.com/favicon.ico',
  'volcengine-tts':  'https://www.volcengine.com/favicon.ico',
  'iflytek':         'https://www.iflyrec.com/favicon.ico',
  'descript':        'https://www.descript.com/favicon.ico',
  'gamma':           'https://gamma.app/favicon.ico',
  'tome':            'https://tome.app/favicon.ico',
  'aippt':           'https://www.aippt.cn/favicon.ico',
  'monica':          'https://monica.im/favicon.ico',
  'wps-ai':          'https://www.wps.cn/favicon.ico',
  'julius':          'https://julius.ai/favicon.ico',
  'helium10':        'https://www.helium10.com/favicon.ico',
  'feigua':          'https://www.feigua.io/favicon.ico',
  'manus':           'https://manus.im/favicon.ico',
  'coze':            'https://lf-coze-web-cdn.coze.cn/obj/coze-web-cn/obric/coze/favicon.1970.ico',
  'dify':            'https://dify.ai/favicon.ico',
  'fastgpt':         'https://fastgpt.in/favicon.ico',
  'zapier':          'https://zapier.com/favicon.ico',
  'capcut':          'https://lf16-capcut.faceulv.com/obj/capcutpackage/packages/16614/capcutweb-favicon-1687243993.ico',
  'canva':           'https://static.canva.com/web/images/favicon.ico',
  'adobe-firefly':   'https://www.adobe.com/favicon.ico',
  'gaoding':         'https://www.gaoding.com/favicon.ico',
}

interface Props {
  slug: string
  emoji?: string
  name: string
  size?: number
}

export default function ToolIcon({ slug, emoji, name, size = 32 }: Props) {
  const [failed, setFailed] = useState(false)
  const favicon = FAVICON_MAP[slug]

  // 直链失败 → DuckDuckGo favicon API 兜底
  const [useDDG, setUseDDG] = useState(false)
  const domain = favicon ? new URL(favicon).hostname : null

  if (!failed && favicon) {
    const src = useDDG && domain
      ? `https://icons.duckduckgo.com/ip3/${domain}.ico`
      : favicon
    return (
      <img
        src={src}
        alt={name}
        width={size}
        height={size}
        onError={() => {
          if (!useDDG) setUseDDG(true)
          else setFailed(true)
        }}
        style={{ width: size, height: size, objectFit: 'contain', borderRadius: '6px' }}
      />
    )
  }
  // 最终降级：emoji
  return (
    <span style={{ fontSize: size * 0.75, lineHeight: 1, display: 'block', textAlign: 'center' }}>
      {emoji || '🔧'}
    </span>
  )
}
