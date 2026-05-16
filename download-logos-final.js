#!/usr/bin/env node
/**
 * GO悟空 - 官方Logo下载脚本（最终版）
 * 
 * 使用方法：
 * 1. 开启VPN/梯子（全局模式）
 * 2. node download-logos-final.js
 * 
 * 或者指定代理端口（Clash默认7890，v2ray默认1080）：
 * set HTTPS_PROXY=http://127.0.0.1:7890 && node download-logos-final.js
 */

const https = require('https')
const http = require('http')
const fs = require('fs')
const path = require('path')

const OUT = path.join(__dirname, 'public', 'logos')
fs.mkdirSync(OUT, { recursive: true })

// 先清空目录
for (const f of fs.readdirSync(OUT)) {
  fs.unlinkSync(path.join(OUT, f))
}
console.log('✅ 已清空 public/logos/\n')

// 65个工具的官方favicon
const LOGOS = {
  // AI对话
  'chatgpt':          'https://openai.com/favicon.ico',
  'claude':           'https://claude.ai/favicon.ico',
  'gemini':           'https://www.google.com/s2/favicons?domain=gemini.google.com&sz=64',
  'deepseek':         'https://chat.deepseek.com/favicon.svg',
  'doubao':           'https://lf-flow-web-cdn.doubao.com/obj/flow-doubao/doubao/web/logo-icon.png',
  'kimi':             'https://statics.moonshot.cn/kimi-chat/favicon.ico',
  'tongyi':           'https://www.google.com/s2/favicons?domain=tongyi.aliyun.com&sz=64',
  'wenxin':           'https://nlp-eb.cdn.bcebos.com/logo/favicon.ico',
  'grok':             'https://x.ai/favicon.ico',
  'zhipu':            'https://chatglm.cn/favicon.ico',
  'mistral':          'https://mistral.ai/favicon.ico',
  // AI搜索
  'perplexity':       'https://www.perplexity.ai/favicon.svg',
  'metaso':           'https://metaso.cn/favicon.ico',
  'phind':            'https://www.phind.com/images/favicon.png',
  'you':              'https://you.com/favicon.ico',
  // AI写作
  'jasper':           'https://www.jasper.ai/favicon.ico',
  'copyai':           'https://www.copy.ai/favicon.ico',
  'grammarly':        'https://static.grammarly.com/assets/files/cb6ba12e3453def5b8afefc0a11dbfb0/favicon.ico',
  'notion-ai':        'https://www.notion.so/front-static/favicon.ico',
  'xiezuocat':        'https://xiezuocat.com/favicon.ico',
  // AI编程
  'cursor':           'https://www.cursor.com/favicon.ico',
  'github-copilot':   'https://github.com/favicon.ico',
  'codeium':          'https://codeium.com/favicon.ico',
  'v0':               'https://v0.dev/favicon.ico',
  'bolt':             'https://bolt.new/favicon.svg',
  'tongyi-lingma':    'https://www.google.com/s2/favicons?domain=tongyi.aliyun.com&sz=64',
  'devin':            'https://devin.ai/favicon.ico',
  // AI图像
  'midjourney':       'https://www.midjourney.com/favicon.ico',
  'stable-diffusion': 'https://stability.ai/favicon.ico',
  'dalle3':           'https://openai.com/favicon.ico',
  'flux':             'https://blackforestlabs.ai/favicon.ico',
  'jimeng':           'https://www.google.com/s2/favicons?domain=jimeng.jianying.com&sz=64',
  'wenxin-yige':      'https://nlp-eb.cdn.bcebos.com/logo/favicon.ico',
  'ideogram':         'https://ideogram.ai/favicon.ico',
  'leonardo':         'https://app.leonardo.ai/favicon.ico',
  // AI视频
  'runway':           'https://runwayml.com/favicon.ico',
  'runway-edit':      'https://runwayml.com/favicon.ico',
  'sora':             'https://sora.com/favicon.ico',
  'kling':            'https://klingai.kuaishou.com/favicon.ico',
  'vidu':             'https://www.vidu.cn/favicon.ico',
  'heygen':           'https://www.heygen.com/favicon.ico',
  'pika':             'https://pika.art/favicon.ico',
  // AI音频
  'elevenlabs':       'https://elevenlabs.io/favicon.ico',
  'suno':             'https://suno.com/favicon.ico',
  'udio':             'https://www.udio.com/favicon.ico',
  'volcengine-tts':   'https://www.volcengine.com/favicon.ico',
  'iflytek':          'https://www.iflyrec.com/favicon.ico',
  'descript':         'https://www.descript.com/favicon.ico',
  // AI办公
  'gamma':            'https://gamma.app/favicon.ico',
  'tome':             'https://tome.app/favicon.ico',
  'aippt':            'https://www.aippt.cn/favicon.ico',
  'monica':           'https://monica.im/favicon.ico',
  'wps-ai':           'https://www.wps.cn/favicon.ico',
  // AI数据
  'julius':           'https://julius.ai/favicon.ico',
  'helium10':         'https://www.helium10.com/favicon.ico',
  'feigua':           'https://www.feigua.io/favicon.ico',
  // AI Agent
  'manus':            'https://manus.im/favicon.ico',
  'coze':             'https://www.coze.com/favicon.ico',
  'dify':             'https://dify.ai/favicon.ico',
  'fastgpt':          'https://fastgpt.in/favicon.ico',
  'zapier':           'https://zapier.com/favicon.ico',
  // AI剪辑
  'capcut':           'https://www.capcut.com/favicon.ico',
  // AI设计
  'canva':            'https://www.canva.com/favicon.ico',
  'adobe-firefly':    'https://www.adobe.com/favicon.ico',
  'gaoding':          'https://www.gaoding.com/favicon.ico',
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
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
      },
      timeout: 15000,
    }, res => {
      if ([301,302,303,307,308].includes(res.statusCode)) {
        const loc = res.headers.location
        const next = loc?.startsWith('http') ? loc : (loc ? new URL(loc, url).href : null)
        return next ? dl(next, slug, hop+1).then(resolve)
                    : resolve({ ok:false, reason:'bad redirect' })
      }
      if (res.statusCode !== 200) {
        resolve({ ok:false, status: res.statusCode }); return
      }
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
  const entries = Object.entries(LOGOS)
  console.log(`📥 开始下载 ${entries.length} 个官方Logo...\n`)
  console.log('💡 提示：如遇大量timeout/403，请开启VPN全局模式后重试\n')

  const ok = [], fail = []
  for (const [slug, url] of entries) {
    process.stdout.write(`  ${slug.padEnd(22)} `)
    const r = await dl(url, slug)
    if (r.ok) {
      console.log(`✅ ${r.ext.toUpperCase().padEnd(4)} ${r.size}KB`)
      ok.push(slug)
    } else {
      console.log(`❌ ${r.status || r.reason}`)
      fail.push(slug)
    }
    await new Promise(r => setTimeout(r, 150))
  }

  console.log(`\n${'─'.repeat(40)}`)
  console.log(`✅ 成功: ${ok.length}/${entries.length}`)
  console.log(`❌ 失败: ${fail.length}`)
  if (fail.length > 0) {
    console.log(`\n失败的工具: ${fail.join(', ')}`)
    console.log('\n💡 这些工具需要VPN才能下载，请：')
    console.log('   1. 开启VPN全局模式')
    console.log('   2. 重新运行此脚本（会跳过已下载的）')
  }
  console.log('\n下一步：')
  console.log('git add public/logos')
  console.log('git commit -m "feat: official logos"')
  console.log('git push')
}

main().catch(console.error)
