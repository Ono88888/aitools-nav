#!/usr/bin/env node
/**
 * 运行方式：
 * 1. 把这个文件放到项目根目录
 * 2. node download-logos.js
 * 3. 完成后 public/logos/ 里就有所有真实图标
 */

const https = require('https')
const http = require('http')
const fs = require('fs')
const path = require('path')

const OUT_DIR = path.join(__dirname, 'public', 'logos')
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true })

// 工具 slug → favicon 直链（按可靠性排序，优先用CDN/静态资源）
const LOGOS = {
  // AI对话
  'chatgpt':         'https://cdn.oaistatic.com/assets/favicon-o20kmmos.png',
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
  // AI搜索
  'perplexity':      'https://www.perplexity.ai/favicon.svg',
  'metaso':          'https://metaso.cn/favicon.ico',
  'phind':           'https://www.phind.com/images/favicon.png',
  // AI写作
  'jasper':          'https://www.jasper.ai/favicon.ico',
  'copyai':          'https://www.copy.ai/favicon.ico',
  'grammarly':       'https://static.grammarly.com/assets/files/cb6ba12e3453def5b8afefc0a11dbfb0/favicon.ico',
  'notion-ai':       'https://www.notion.so/front-static/favicon.ico',
  'xiezuocat':       'https://xiezuocat.com/favicon.ico',
  // AI编程
  'cursor':          'https://www.cursor.com/favicon.ico',
  'github-copilot':  'https://github.githubassets.com/favicons/favicon.svg',
  'codeium':         'https://codeium.com/favicon.ico',
  'v0':              'https://v0.dev/favicon.ico',
  'bolt':            'https://bolt.new/favicon.svg',
  'tongyi-lingma':   'https://img.alicdn.com/imgextra/i1/O1CN01MoIDpb1iMjBbhZFTB_!!6000000004398-2-tps-200-200.png',
  'devin':           'https://devin.ai/favicon.ico',
  // AI图像
  'midjourney':      'https://www.midjourney.com/favicon.ico',
  'stable-diffusion':'https://stability.ai/favicon.ico',
  'dalle3':          'https://cdn.oaistatic.com/assets/favicon-o20kmmos.png',
  'flux':            'https://blackforestlabs.ai/favicon.ico',
  'jimeng':          'https://lf-effect-material-infra.capcut.com/obj/effect-material-infra/jimeng/web/logo/favicon.ico',
  'wenxin-yige':     'https://nlp-eb.cdn.bcebos.com/logo/favicon.ico',
  'ideogram':        'https://ideogram.ai/favicon.ico',
  'leonardo':        'https://app.leonardo.ai/favicon.ico',
  // AI视频
  'runway':          'https://runwayml.com/favicon.ico',
  'sora':            'https://cdn.oaistatic.com/assets/favicon-o20kmmos.png',
  'kling':           'https://klingai.kuaishou.com/favicon.ico',
  'vidu':            'https://www.vidu.cn/favicon.ico',
  'heygen':          'https://www.heygen.com/favicon.ico',
  'pika':            'https://pika.art/favicon.ico',
  // AI音频
  'elevenlabs':      'https://elevenlabs.io/favicon.ico',
  'suno':            'https://suno.com/favicon.ico',
  'udio':            'https://www.udio.com/favicon.ico',
  'volcengine-tts':  'https://www.volcengine.com/favicon.ico',
  'iflytek':         'https://www.iflyrec.com/favicon.ico',
  'descript':        'https://www.descript.com/favicon.ico',
  // AI办公
  'gamma':           'https://gamma.app/favicon.ico',
  'tome':            'https://tome.app/favicon.ico',
  'aippt':           'https://www.aippt.cn/favicon.ico',
  'monica':          'https://monica.im/favicon.ico',
  'wps-ai':          'https://www.wps.cn/favicon.ico',
  // AI数据
  'julius':          'https://julius.ai/favicon.ico',
  'helium10':        'https://www.helium10.com/favicon.ico',
  'feigua':          'https://www.feigua.io/favicon.ico',
  // AI Agent
  'manus':           'https://manus.im/favicon.ico',
  'coze':            'https://lf-coze-web-cdn.coze.cn/obj/coze-web-cn/obric/coze/favicon.1970.ico',
  'dify':            'https://dify.ai/favicon.ico',
  'fastgpt':         'https://fastgpt.in/favicon.ico',
  'zapier':          'https://zapier.com/favicon.ico',
  // AI剪辑
  'capcut':          'https://lf16-capcut.faceulv.com/obj/capcutpackage/packages/16614/capcutweb-favicon-1687243993.ico',
  // AI设计
  'canva':           'https://static.canva.com/web/images/favicon.ico',
  'adobe-firefly':   'https://www.adobe.com/favicon.ico',
  'gaoding':         'https://www.gaoding.com/favicon.ico',
}

function download(url, dest) {
  return new Promise((resolve) => {
    const ext = url.split('.').pop().split('?')[0]
    const outPath = dest + '.' + (ext.length < 5 ? ext : 'ico')
    const client = url.startsWith('https') ? https : http
    
    const req = client.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/120' },
      timeout: 8000,
    }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        download(res.headers.location, dest).then(resolve)
        return
      }
      if (res.statusCode !== 200) { resolve({ ok: false, status: res.statusCode }); return }
      
      const chunks = []
      res.on('data', c => chunks.push(c))
      res.on('end', () => {
        const buf = Buffer.concat(chunks)
        if (buf.length < 50) { resolve({ ok: false, reason: 'too small' }); return }
        fs.writeFileSync(outPath, buf)
        resolve({ ok: true, path: outPath, size: buf.length })
      })
    })
    req.on('error', (e) => resolve({ ok: false, reason: e.message }))
    req.on('timeout', () => { req.destroy(); resolve({ ok: false, reason: 'timeout' }) })
  })
}

async function main() {
  console.log(`\n下载 ${Object.keys(LOGOS).length} 个工具 Logo...\n`)
  const ok = [], fail = []
  
  for (const [slug, url] of Object.entries(LOGOS)) {
    const dest = path.join(OUT_DIR, slug)
    // 已存在真实图片就跳过（非SVG占位符）
    const existing = ['.ico','.png','.svg','.jpg','.webp']
      .map(e => dest + e)
      .find(p => fs.existsSync(p) && fs.statSync(p).size > 500)
    if (existing) { ok.push(slug + '(cached)'); continue }
    
    process.stdout.write(`  ${slug.padEnd(20)} ... `)
    const result = await download(url, dest)
    if (result.ok) {
      console.log(`✅ ${Math.round(result.size/1024)}KB`)
      ok.push(slug)
    } else {
      console.log(`❌ ${result.status || result.reason}`)
      fail.push(slug)
    }
    await new Promise(r => setTimeout(r, 100))
  }
  
  console.log(`\n✅ 成功: ${ok.length}  ❌ 失败: ${fail.length}`)
  if (fail.length > 0) console.log('失败列表:', fail.join(', '))
  console.log('\n完成！现在运行 git add public/logos && git push')
}

main()
