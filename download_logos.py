#!/usr/bin/env python3
"""
GO悟空 - 官方Logo批量下载脚本
在你的本地电脑运行：python download_logos.py
会自动下载到 public/logos/ 目录（与此脚本同级）
需要：pip install requests Pillow
"""

import requests
import os
import time
import io
from pathlib import Path

# 输出目录 - 脚本放在项目根目录时自动找到public/logos
SCRIPT_DIR = Path(__file__).parent
OUTPUT_DIR = SCRIPT_DIR / "public" / "logos"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# 工具 -> 直接下载URL（优先用官方CDN/静态资源，避免Cloudflare拦截）
# 格式: slug -> [尝试URL列表]
TOOLS = {
    # ── AI对话 ──────────────────────────────────────────
    "chatgpt":       ["https://cdn.oaistatic.com/assets/favicon-o20kmmos.png",
                      "https://chat.openai.com/favicon.ico"],
    "claude":        ["https://claude.ai/favicon.ico",
                      "https://www.anthropic.com/favicon.ico"],
    "gemini":        ["https://www.gstatic.com/lamda/images/gemini_favicon_f069958c85030456e93de685481c559f160ea06.png",
                      "https://gemini.google.com/favicon.ico"],
    "deepseek":      ["https://chat.deepseek.com/favicon.ico",
                      "https://www.deepseek.com/favicon.ico"],
    "doubao":        ["https://lf-flow-web-cdn.doubao.com/obj/flow-doubao/doubao/web/logo-icon.png",
                      "https://www.doubao.com/favicon.ico"],
    "kimi":          ["https://statics.moonshot.cn/kimi-chat/favicon.ico",
                      "https://kimi.moonshot.cn/favicon.ico"],
    "tongyi":        ["https://img.alicdn.com/imgextra/i2/O1CN01B7vcpk1QGsHBgKfAj_!!6000000001952-2-tps-128-128.png",
                      "https://tongyi.aliyun.com/favicon.ico"],
    "wenxin":        ["https://nlp-eb.cdn.bcebos.com/static/eb/asset/logo.3b468756.png",
                      "https://yiyan.baidu.com/favicon.ico"],
    "grok":          ["https://x.ai/favicon.ico"],
    "zhipu":         ["https://chatglm.cn/favicon.ico",
                      "https://www.zhipuai.cn/favicon.ico"],
    "mistral":       ["https://mistral.ai/favicon.ico"],
    "perplexity":    ["https://www.perplexity.ai/favicon.ico"],
    "metaso":        ["https://metaso.cn/favicon.ico"],
    "phind":         ["https://www.phind.com/favicon.ico"],
    "you":           ["https://you.com/favicon.ico"],

    # ── AI写作 ──────────────────────────────────────────
    "jasper":        ["https://assets-global.website-files.com/60e5f2de011b86acebc30db7/favicon.ico",
                      "https://www.jasper.ai/favicon.ico"],
    "copyai":        ["https://framerusercontent.com/images/icon.png",
                      "https://www.copy.ai/favicon.ico"],
    "grammarly":     ["https://static.grammarly.com/assets/files/cb6c7b2e5c7b8c7b8c7b8c7b/favicon.ico",
                      "https://www.grammarly.com/favicon.ico"],
    "notion-ai":     ["https://www.notion.so/front-static/favicon.ico",
                      "https://notion.so/favicon.ico"],
    "xiezuocat":     ["https://xiezuocat.com/favicon.ico"],

    # ── AI编程 ──────────────────────────────────────────
    "cursor":        ["https://www.cursor.com/favicon.ico",
                      "https://cursor.sh/favicon.ico"],
    "github-copilot":["https://github.githubassets.com/favicons/favicon.png",
                      "https://github.com/favicon.ico"],
    "codeium":       ["https://codeium.com/favicon.ico"],
    "v0":            ["https://v0.dev/favicon.ico"],
    "bolt":          ["https://bolt.new/favicon.ico"],
    "tongyi-lingma": ["https://img.alicdn.com/imgextra/i1/O1CN01dKuFCd1WH48cMWFgF_!!6000000002762-2-tps-128-128.png"],
    "devin":         ["https://preview.devin.ai/favicon.ico",
                      "https://devin.ai/favicon.ico"],
    "github":        ["https://github.githubassets.com/favicons/favicon.png"],

    # ── AI绘画 ──────────────────────────────────────────
    "midjourney":    ["https://www.midjourney.com/favicon.ico"],
    "stable-diffusion": ["https://stability.ai/favicon.ico"],
    "dalle3":        ["https://cdn.oaistatic.com/assets/favicon-o20kmmos.png"],
    "flux":          ["https://blackforestlabs.ai/favicon.ico"],
    "jimeng":        ["https://lf-flow-web-cdn.doubao.com/obj/flow-doubao/jimeng/web/favicon.ico",
                      "https://jimeng.jianying.com/favicon.ico"],
    "wenxin-yige":   ["https://yige.baidu.com/favicon.ico"],
    "ideogram":      ["https://ideogram.ai/favicon.ico"],
    "leonardo":      ["https://leonardo.ai/favicon.ico"],
    "comfyui":       ["https://github.githubassets.com/favicons/favicon.png"],  # 开源项目用GitHub图标
    "meitu-ai":      ["https://www.meitu.com/favicon.ico"],
    "tongyi-wanxiang": ["https://tongyi.aliyun.com/favicon.ico"],

    # ── 视频工具 ────────────────────────────────────────
    "runway":        ["https://runwayml.com/favicon.ico",
                      "https://runway.com/favicon.ico"],
    "runway-edit":   ["https://runwayml.com/favicon.ico"],
    "sora":          ["https://cdn.oaistatic.com/assets/favicon-o20kmmos.png"],
    "kling":         ["https://klingai.kuaishou.com/favicon.ico",
                      "https://kling.kuaishou.com/favicon.ico"],
    "vidu":          ["https://www.vidu.cn/favicon.ico",
                      "https://vidu.studio/favicon.ico"],
    "heygen":        ["https://www.heygen.com/favicon.ico"],
    "pika":          ["https://pika.art/favicon.ico"],
    "capcut":        ["https://lf-scm-cn.feishucdn.com/obj/capcut-official-cn/7301093264025960478.ico",
                      "https://www.capcut.cn/favicon.ico"],
    "descript":      ["https://www.descript.com/favicon.ico"],

    # ── 音频工具 ────────────────────────────────────────
    "elevenlabs":    ["https://elevenlabs.io/favicon.ico"],
    "suno":          ["https://suno.com/favicon.ico"],
    "udio":          ["https://www.udio.com/favicon.ico"],
    "volcengine-tts":["https://lf-cdn-tos.bytescm.com/obj/static/vestack-developer/static/favicon/favicon.ico",
                      "https://www.volcengine.com/favicon.ico"],
    "iflytek":       ["https://www.iflyrec.com/favicon.ico",
                      "https://www.xfyun.cn/favicon.ico"],
    "audacity":      ["https://www.audacityteam.org/favicon.ico"],
    "adobe-audition":["https://www.adobe.com/favicon.ico"],
    "buzzsprout":    ["https://www.buzzsprout.com/favicon.ico"],
    "xiaoyuzhou":    ["https://www.xiaoyuzhoufm.com/favicon.ico"],

    # ── PPT工具 ─────────────────────────────────────────
    "gamma":         ["https://gamma.app/favicon.ico"],
    "tome":          ["https://tome.app/favicon.ico"],
    "aippt":         ["https://www.aippt.cn/favicon.ico"],
    "beautiful-ai":  ["https://www.beautiful.ai/favicon.ico"],
    "premiere-pro":  ["https://www.adobe.com/favicon.ico"],

    # ── 电商工具 ────────────────────────────────────────
    "helium10":      ["https://www.helium10.com/favicon.ico"],
    "feigua":        ["https://www.feigua.io/favicon.ico"],
    "shopify":       ["https://cdn.shopify.com/static/shopify-favicon.png",
                      "https://www.shopify.com/favicon.ico"],
    "klaviyo":       ["https://www.klaviyo.com/favicon.ico"],
    "tidio":         ["https://www.tidio.com/favicon.ico"],
    "adcreative":    ["https://www.adcreative.ai/favicon.ico"],
    "etsy":          ["https://www.etsy.com/favicon.ico"],

    # ── 知识管理 ────────────────────────────────────────
    "obsidian":      ["https://obsidian.md/favicon.ico"],
    "yuque":         ["https://mdn.alipayobjects.com/huamei_0prmtq/afts/img/A*0YaTQL7Sf0QAAAAAAAAAAAAADvZ6AQ/original",
                      "https://www.yuque.com/favicon.ico"],

    # ── 内容工具 ────────────────────────────────────────
    "canva":         ["https://static.canva.com/web/images/favicon.ico",
                      "https://www.canva.com/favicon.ico"],
    "adobe-firefly": ["https://www.adobe.com/favicon.ico"],
    "gaoding":       ["https://www.gaoding.com/favicon.ico"],
    "lseditor":      ["https://www.135editor.com/favicon.ico"],
    "markdown-nice": ["https://mdnice.com/favicon.ico"],
    "yixiaoer":      ["https://www.yixiaoer.cn/favicon.ico"],

    # ── 开发工具 ────────────────────────────────────────
    "vercel":        ["https://assets.vercel.com/image/upload/front/favicon/vercel/favicon.ico",
                      "https://vercel.com/favicon.ico"],
    "supabase":      ["https://supabase.com/favicon.ico"],

    # ── 自动化 ──────────────────────────────────────────
    "zapier":        ["https://cdn.zappy.app/favicon.ico",
                      "https://zapier.com/favicon.ico"],
    "coze":          ["https://lf-coze-web-cdn.coze.cn/obj/coze-web-cn/obric/coze/favicon.1970.ico",
                      "https://www.coze.cn/favicon.ico"],
    "dify":          ["https://dify.ai/favicon.ico"],
    "fastgpt":       ["https://fastgpt.in/favicon.ico"],
    "manus":         ["https://manus.im/favicon.ico"],

    # ── 其他 ────────────────────────────────────────────
    "monica":        ["https://monica.im/favicon.ico"],
    "wps-ai":        ["https://qcloudimg.wps.cn/wps-www-w/favicon.ico",
                      "https://www.wps.cn/favicon.ico"],
    "julius":        ["https://julius.ai/favicon.ico"],
    "jasper":        ["https://www.jasper.ai/favicon.ico"],
    "grammarly":     ["https://www.grammarly.com/favicon.ico"],
    "phind":         ["https://www.phind.com/favicon.ico"],
    "you":           ["https://you.com/favicon.ico"],
    "perplexity":    ["https://www.perplexity.ai/favicon.ico"],
    "davinci-resolve": ["https://www.blackmagicdesign.com/favicon.ico"],
    "sora":          ["https://sora.com/favicon.ico",
                      "https://cdn.oaistatic.com/assets/favicon-o20kmmos.png"],
}

headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
    'Referer': 'https://www.google.com/',
}

ok = []; fail = []

print(f"开始下载 {len(TOOLS)} 个工具Logo...")
print(f"输出目录: {OUTPUT_DIR}")
print("=" * 50)

for slug, urls in TOOLS.items():
    downloaded = False
    for url in urls:
        try:
            resp = requests.get(url, headers=headers, timeout=10, allow_redirects=True)
            if resp.status_code == 200 and len(resp.content) > 200:
                # 判断格式
                content_type = resp.headers.get('Content-Type', '').lower()
                ext = 'ico'
                if 'png' in content_type or url.endswith('.png'):
                    ext = 'png'
                elif 'svg' in content_type or url.endswith('.svg'):
                    ext = 'svg'
                elif 'webp' in content_type:
                    ext = 'webp'

                out_path = OUTPUT_DIR / f"{slug}.{ext}"
                out_path.write_bytes(resp.content)
                print(f"✓ {slug}.{ext} ({len(resp.content)}b) <- {url[:60]}")
                ok.append(slug)
                downloaded = True
                break
        except Exception as e:
            continue

    if not downloaded:
        print(f"✗ {slug} - 所有URL均失败")
        fail.append(slug)

    time.sleep(0.2)  # 限速，避免被封

print("\n" + "=" * 50)
print(f"✓ 成功下载: {len(ok)} 个")
print(f"✗ 失败: {len(fail)} 个")
if fail:
    print(f"失败列表: {fail}")
print(f"\n文件保存在: {OUTPUT_DIR}")
print("\n下一步: git add public/logos/ && git commit -m 'feat: 官方logo批量下载' && git push")
