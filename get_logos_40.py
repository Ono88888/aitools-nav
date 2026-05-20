#!/usr/bin/env python3
"""
GO悟空 - 40个失败Logo下载脚本
放到项目根目录运行：python get_logos_40.py
需要：pip install requests
"""
import requests, os, time, sys
from pathlib import Path

OUTPUT = Path(__file__).parent / "public" / "logos"
OUTPUT.mkdir(parents=True, exist_ok=True)

# 只下载之前失败的40个，每个3-5个备用URL
TARGETS = {
    # ── OpenAI系（chatgpt / dalle3 / sora 都是OpenAI logo）──
    "chatgpt": [
        "https://cdn.oaistatic.com/assets/apple-touch-icon-mfilwmqlogp6.png",
        "https://chat.openai.com/apple-touch-icon.png",
        "https://openai.com/apple-touch-icon.png",
        "https://cdn.openai.com/API/docs/images/chatgpt-icon.png",
    ],
    "dalle3": [
        "https://cdn.oaistatic.com/assets/apple-touch-icon-mfilwmqlogp6.png",
        "https://openai.com/apple-touch-icon.png",
    ],
    "sora": [
        "https://sora.com/apple-touch-icon.png",
        "https://cdn.oaistatic.com/assets/apple-touch-icon-mfilwmqlogp6.png",
    ],

    # ── Google系（gemini）────────────────────────────────────
    "gemini": [
        "https://www.gstatic.com/lamda/images/gemini_favicon_f069958c85030456e93de685481c559f160ea06.png",
        "https://ssl.gstatic.com/images/branding/product/2x/googleg_48dp.png",
        "https://www.google.com/images/branding/product/2x/googleg_32dp.png",
    ],

    # ── 阿里系（tongyi / tongyi-lingma / tongyi-wanxiang）────
    "tongyi": [
        "https://img.alicdn.com/imgextra/i4/O1CN01AaAYUJ1t3gg3Cqpkm_!!6000000005846-2-tps-200-200.png",
        "https://img.alicdn.com/imgextra/i2/O1CN01B7vcpk1QGsHBgKfAj_!!6000000001952-2-tps-128-128.png",
        "https://tongyi.aliyun.com/apple-touch-icon.png",
    ],
    "tongyi-lingma": [
        "https://img.alicdn.com/imgextra/i1/O1CN01vHaExf1XIJBC5KMKE_!!6000000002899-2-tps-200-200.png",
        "https://img.alicdn.com/imgextra/i4/O1CN01AaAYUJ1t3gg3Cqpkm_!!6000000005846-2-tps-200-200.png",
    ],
    "tongyi-wanxiang": [
        "https://img.alicdn.com/imgextra/i4/O1CN01AaAYUJ1t3gg3Cqpkm_!!6000000005846-2-tps-200-200.png",
        "https://tongyi.aliyun.com/apple-touch-icon.png",
    ],

    # ── 百度系（wenxin / wenxin-yige）───────────────────────
    "wenxin": [
        "https://nlp-eb.cdn.bcebos.com/static/eb/asset/logo.3b468756.png",
        "https://yiyan.baidu.com/apple-touch-icon.png",
        "https://chat.baidu.com/favicon.ico",
    ],
    "wenxin-yige": [
        "https://yige.baidu.com/apple-touch-icon.png",
        "https://yige.baidu.com/favicon.ico",
    ],

    # ── X/Twitter系（grok）──────────────────────────────────
    "grok": [
        "https://x.ai/favicon.ico",
        "https://grok.com/apple-touch-icon.png",
        "https://grok.com/favicon.ico",
    ],

    # ── 国内AI搜索 ───────────────────────────────────────────
    "metaso": [
        "https://metaso.cn/apple-touch-icon.png",
        "https://metaso.cn/favicon.ico",
    ],
    "phind": [
        "https://www.phind.com/apple-touch-icon.png",
        "https://www.phind.com/favicon.ico",
    ],

    # ── AI写作工具 ───────────────────────────────────────────
    "jasper": [
        "https://www.jasper.ai/apple-touch-icon.png",
        "https://www.jasper.ai/favicon.ico",
        "https://app.jasper.ai/apple-touch-icon.png",
    ],
    "copyai": [
        "https://www.copy.ai/apple-touch-icon.png",
        "https://www.copy.ai/favicon.ico",
        "https://app.copy.ai/favicon.ico",
    ],
    "grammarly": [
        "https://static.grammarly.com/assets/files/efe57d016fce1f3d4e0e3b167e00a78e/apple-icon-120x120.png",
        "https://www.grammarly.com/apple-touch-icon.png",
        "https://www.grammarly.com/favicon.ico",
    ],
    "xiezuocat": [
        "https://xiezuocat.com/apple-touch-icon.png",
        "https://xiezuocat.com/favicon.ico",
    ],

    # ── AI编程 ───────────────────────────────────────────────
    "v0": [
        "https://v0.dev/apple-touch-icon.png",
        "https://v0.dev/favicon.ico",
    ],

    # ── AI绘画 ───────────────────────────────────────────────
    "midjourney": [
        "https://www.midjourney.com/apple-touch-icon.png",
        "https://www.midjourney.com/favicon.ico",
        "https://docs.midjourney.com/favicon.ico",
    ],
    "ideogram": [
        "https://ideogram.ai/assets/image/favicon-192x192.png",
        "https://ideogram.ai/apple-touch-icon.png",
        "https://ideogram.ai/favicon.ico",
    ],
    "leonardo": [
        "https://leonardo.ai/apple-touch-icon.png",
        "https://leonardo.ai/favicon.ico",
        "https://app.leonardo.ai/favicon.ico",
    ],
    "meitu-ai": [
        "https://www.meitu.com/apple-touch-icon.png",
        "https://www.meitu.com/favicon.ico",
    ],

    # ── 视频工具 ─────────────────────────────────────────────
    "runway": [
        "https://runwayml.com/apple-touch-icon.png",
        "https://runwayml.com/favicon.ico",
        "https://runway.com/favicon.ico",
        "https://app.runwayml.com/favicon.ico",
    ],
    "runway-edit": [
        "https://runwayml.com/apple-touch-icon.png",
        "https://runwayml.com/favicon.ico",
    ],
    "kling": [
        "https://klingai.kuaishou.com/favicon.ico",
        "https://klingai.com/favicon.ico",
        "https://www.kuaishou.com/favicon.ico",
    ],
    "descript": [
        "https://www.descript.com/apple-touch-icon.png",
        "https://www.descript.com/favicon.ico",
    ],

    # ── PPT工具 ──────────────────────────────────────────────
    "gamma": [
        "https://gamma.app/apple-touch-icon.png",
        "https://gamma.app/favicon.ico",
        "https://gamma.app/public/gamma-icon.png",
    ],
    "tome": [
        "https://tome.app/apple-touch-icon.png",
        "https://tome.app/favicon.ico",
    ],
    "aippt": [
        "https://www.aippt.cn/favicon.ico",
        "https://www.aippt.cn/apple-touch-icon.png",
        "https://cdn.aippt.cn/favicon.ico",
    ],

    # ── 数据电商 ─────────────────────────────────────────────
    "feigua": [
        "https://www.feigua.io/favicon.ico",
        "https://feigua.io/favicon.ico",
    ],
    "klaviyo": [
        "https://www.klaviyo.com/apple-touch-icon.png",
        "https://www.klaviyo.com/favicon.ico",
    ],
    "adcreative": [
        "https://www.adcreative.ai/apple-icon-192x192.png",
        "https://www.adcreative.ai/favicon.ico",
    ],

    # ── 知识/内容 ─────────────────────────────────────────────
    "yuque": [
        "https://gw.alipayobjects.com/zos/rmsportal/UTjCqGwguUqlytnkjgYN.png",
        "https://mdn.alipayobjects.com/huamei_0prmtq/afts/img/A*0YaTQL7Sf0QAAAAAAAAAAAAADvZ6AQ/original",
        "https://www.yuque.com/apple-touch-icon.png",
        "https://www.yuque.com/favicon.ico",
    ],
    "lseditor": [
        "https://img2.135editor.com/img/editor/default/2024icon.png",
        "https://www.135editor.com/favicon.ico",
    ],
    "markdown-nice": [
        "https://mdnice.com/favicon.ico",
        "https://mdnice.com/apple-touch-icon.png",
    ],
    "yixiaoer": [
        "https://www.yixiaoer.cn/favicon.ico",
        "https://www.yixiaoer.cn/favicon.png",
        "https://www.yixiaoer.cn/apple-touch-icon.png",
    ],
    "xiaoyuzhou": [
        "https://www.xiaoyuzhoufm.com/apple-touch-icon.png",
        "https://www.xiaoyuzhoufm.com/favicon.ico",
        "https://fdfs.xmcdn.com/storages/b16f-audiofreehighqps/CB/B2/GKwRIJIJsM7mAAAViQG0B5nV.png",
    ],

    # ── 开发工具 ─────────────────────────────────────────────
    "supabase": [
        "https://supabase.com/favicon/favicon-196x196.png",
        "https://supabase.com/apple-touch-icon.png",
        "https://supabase.com/favicon.ico",
    ],
    "dify": [
        "https://dify.ai/favicon.ico",
        "https://dify.ai/apple-touch-icon.png",
        "https://cloud.dify.ai/favicon.ico",
    ],

    # ── AI助手 ───────────────────────────────────────────────
    "monica": [
        "https://monica.im/assets/monica-logo-bg-round.png",
        "https://monica.im/apple-touch-icon.png",
        "https://monica.im/favicon.ico",
    ],
    "wps-ai": [
        "https://www.wps.cn/favicon.ico",
        "https://www.wps.cn/apple-touch-icon.png",
        "https://qcloudimg.wps.cn/wps-www-w/favicon.ico",
    ],
}

# ─────────────────────────────────────────────────────────
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept": "image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
    "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
    "Referer": "https://www.google.com/",
}

def ext_from(url, ct):
    ct = ct.lower()
    if "png" in ct or url.endswith(".png"): return "png"
    if "svg" in ct or url.endswith(".svg"): return "svg"
    if "webp" in ct or url.endswith(".webp"): return "webp"
    if "jpg" in ct or "jpeg" in ct: return "jpg"
    return "ico"

session = requests.Session()
session.headers.update(HEADERS)

ok, fail = [], []
total = len(TARGETS)
print(f"下载 {total} 个失败的Logo\n{'='*55}")

for i, (slug, urls) in enumerate(TARGETS.items(), 1):
    # 已存在的跳过
    if any((OUTPUT / f"{slug}.{e}").exists() for e in ("png","ico","webp","jpg","svg")):
        # 检查是否是文字占位（跳过占位，重新下载）
        svg = OUTPUT / f"{slug}.svg"
        if svg.exists() and "<text" not in svg.read_text():
            print(f"[{i:2d}/{total}] {slug:20s} 跳过（已有官方文件）")
            ok.append(slug)
            continue

    print(f"[{i:2d}/{total}] {slug:20s}", end=" ", flush=True)
    done = False
    for url in urls:
        try:
            r = session.get(url, timeout=15, allow_redirects=True)
            if r.status_code == 200 and len(r.content) > 300:
                ext = ext_from(url, r.headers.get("Content-Type",""))
                if ext == "ico" and len(r.content) < 600:
                    continue  # 跳过默认小图标
                out = OUTPUT / f"{slug}.{ext}"
                out.write_bytes(r.content)
                # 删除同名的SVG占位
                svg_placeholder = OUTPUT / f"{slug}.svg"
                if svg_placeholder.exists() and "<text" in svg_placeholder.read_text():
                    svg_placeholder.unlink()
                print(f"✓ {slug}.{ext} ({len(r.content):,}b)")
                ok.append(slug); done = True; break
        except Exception:
            continue
        time.sleep(0.1)
    if not done:
        print(f"✗ 失败")
        fail.append(slug)
    time.sleep(0.3)

print(f"\n{'='*55}")
print(f"✓ 成功: {len(ok)}   ✗ 失败: {len(fail)}")
if fail:
    print(f"\n仍然失败的 ({len(fail)}个):")
    for s in fail: print(f"  {s}")
print("\n完成后执行:")
print("  git add public/logos/")
print('  git commit -m "feat: 补全官方logo"')
print("  git push")
