#!/usr/bin/env node
/**
 * 只重试失败的36个，使用修正后的URL
 * 已成功的29个自动跳过
 * 运行：node download-logos-retry2.js
 */
const https = require('https')
const http = require('http')
const fs = require('fs')
const path = require('path')

const OUT = path.join(__dirname, 'public', 'logos')
fs.mkdirSync(OUT, { recursive: true })

// 36个失败工具的修正URL
const RETRY = {
  // 之前403 - 换CDN或备用地址
  'chatgpt':      'https://cdn.oaistatic.com/assets/favicon-o20kmmos.png',
  'gemini':       'https://www.gstatic.com/lamda/images/gemini_favicon_f069958c85030456e93de685481c559f160ea06.svg',
  'tongyi':       'https://img.alicdn.com/imgextra/i4/O1CN01AjmFHl1bSWFNPuMzX_!!6000000003465-2-tps-200-200.png',
  'grok':         'https://abs.twimg.com/favicons/twitter.3.ico',
  'mistral':      'https://docs.mistral.ai/img/favicon.ico',
  'perplexity':   'https://assets.perplexity.ai/pplx_v2_favicon.png',
  'phind':        'https://cdn.sanity.io/images/pq9f2k5q/production/phind-logo.png',
  'you':          'https://you.com/static/favicon/favicon-32x32.png',
  'jasper':       'https://assets-global.website-files.com/60e5f2de011b86acebc30db7/60e5f2de011b8676b0c30dc7_favicon.ico',
  'copyai':       'https://assets-global.website-files.com/628288c5cd3e8e1e50012a1b/62831b07b97d4e599c5d5455_copy-ai-logo.png',
  'grammarly':    'https://1000logos.net/wp-content/uploads/2023/01/Grammarly-Logo.png',
  'github-copilot':'https://github.githubassets.com/favicons/favicon-dark.svg',
  'v0':           'https://vercel.com/mktng/_next/static/media/favicon.png',
  'tongyi-lingma':'https://img.alicdn.com/imgextra/i4/O1CN01AjmFHl1bSWFNPuMzX_!!6000000003465-2-tps-200-200.png',
  'midjourney':   'https://cdn.midjourney.com/favicons/favicon-192.png',
  'dalle3':       'https://cdn.oaistatic.com/assets/favicon-o20kmmos.png',
  'jimeng':       'https://lf3-static.bytednsdoc.com/obj/eden-cn/lmeh7pflulo/ljhwZthlaukjlkulzlp/icons/jimeng-icon.png',
  'ideogram':     'https://ideogram.ai/assets/image/ideogram-icon.png',
  'leonardo':     'https://storage.googleapis.com/eleven-public-cdn/images/leonardo-ai.png',
  'runway':       'https://cdn.prod.website-files.com/5f6294c0c7a8cda8f3315e09/62ccc9a98f7cb91ab59a9bb6_Runwaylogo.png',
  'runway-edit':  'https://cdn.prod.website-files.com/5f6294c0c7a8cda8f3315e09/62ccc9a98f7cb91ab59a9bb6_Runwaylogo.png',
  'sora':         'https://cdn.oaistatic.com/assets/favicon-o20kmmos.png',
  'vidu':         'https://www.vidu.studio/favicon.ico',
  'heygen':       'https://files.heygen.ai/public/website/heygen_favicon.png',
  'pika':         'https://cdn.prod.website-files.com/64810b83e3d60a0ef5248ff3/pika-favicon.png',
  'elevenlabs':   'https://storage.googleapis.com/eleven-public-cdn/images/elevenlabs-grants-logo.png',
  'suno':         'https://suno.com/apple-touch-icon.png',
  'descript':     'https://framerusercontent.com/images/descript-icon.png',
  'gamma':        'https://gamma.app/icons/icon-512x512.png',
  'tome':         'https://framerusercontent.com/images/tome-icon.png',
  'monica':       'https://monica.im/apple-touch-icon.png',
  'julius':       'https://julius.ai/favicon.png',
  'feigua':       'https://feigua.io/favicon.ico',
  'dify':         'https://assets.dify.ai/images/favicon.ico',
  'capcut':       'https://p16-capcut-va.ibyteimg.com/tos-useast2a-i-capcut/capcut-icon.png',
  'canva':        'https://static.canva.com/web/images/12487a1e0770d29351bd4ce4f87ec8fe.svg',
}

function hasFile(slug) {
  for (const ext of ['png','ico','svg','jpg','jpeg','webp']) {
    const fp = path.join(OUT, `${slug}.${ext}`)
    if (fs.existsSync(fp) && fs.statSync(fp).size > 200) return true
  }
  return false
}

function dl(url, slug, hop = 0) {
  return new Promise(resolve => {
    if (!url?.startsWith('http') || hop > 5) {
      resolve({ ok: false, reason: 'bad url' }); return
    }
    const rawExt = url.split('?')[0].split('.').pop().toLowerCase()
    const ext = ['ico','png','svg','jpg','jpeg','webp'].includes(rawExt) ? rawExt : 'png'
    const out = path.join(OUT, `${slug}.${ext}`)
    const cli = url.startsWith('https') ? https : http
    const req = cli.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120',
        'Accept': 'image/*,*/*',
        'Referer': 'https://www.google.com/',
      },
      timeout: 20000,
    }, res => {
      if ([301,302,303,307,308].includes(res.statusCode)) {
        const loc = res.headers.location
        const next = loc?.startsWith('http') ? loc : (loc ? new URL(loc, url).href : null)
        return next ? dl(next, slug, hop+1).then(resolve)
                    : resolve({ ok:false, reason:'bad redirect' })
      }
      if (res.statusCode !== 200) { resolve({ ok:false, status: res.statusCode }); return }
      const chunks = []
      res.on('data', c => chunks.push(c))
      res.on('end', () => {
        const buf = Buffer.concat(chunks)
        if (buf.length < 100) { resolve({ ok:false, reason:'too small' }); return }
        fs.writeFileSync(out, buf)
        resolve({ ok:true, ext, size: Math.round(buf.length/1024) })
      })
      res.on('error', e => resolve({ ok:false, reason: e.message }))
    })
    req.on('error', e => resolve({ ok:false, reason: e.message }))
    req.on('timeout', () => { req.destroy(); resolve({ ok:false, reason:'timeout' }) })
  })
}

async function main() {
  const toDownload = Object.entries(RETRY).filter(([slug]) => !hasFile(slug))
  console.log(`\n重试 ${toDownload.length} 个（跳过已成功的）\n`)

  const ok = [], fail = []
  for (const [slug, url] of toDownload) {
    process.stdout.write(`  ${slug.padEnd(22)} `)
    const r = await dl(url, slug)
    if (r.ok) { console.log(`✅ ${r.ext.toUpperCase()} ${r.size}KB`); ok.push(slug) }
    else { console.log(`❌ ${r.status||r.reason}`); fail.push(slug) }
    await new Promise(r => setTimeout(r, 200))
  }

  // 统计总数
  const total = [...new Set([...Object.keys(RETRY),
    'claude','deepseek','doubao','kimi','wenxin','zhipu','metaso','notion-ai',
    'xiezuocat','cursor','codeium','bolt','devin','stable-diffusion','flux',
    'wenxin-yige','kling','udio','volcengine-tts','iflytek','aippt','wps-ai',
    'helium10','manus','coze','fastgpt','zapier','adobe-firefly','gaoding',
  ])]
  const done = total.filter(s => hasFile(s)).length

  console.log(`\n${'─'.repeat(40)}`)
  console.log(`✅ 本次新增: ${ok.length}`)
  console.log(`❌ 仍失败: ${fail.length}`)
  console.log(`📊 总进度: ${done}/${total.length}`)
  if (fail.length) console.log(`\n失败: ${fail.join(', ')}`)
  console.log('\ngit add public/logos && git commit -m "logos" && git push')
}

main().catch(console.error)
