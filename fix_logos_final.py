#!/usr/bin/env python3
import requests
import time
from pathlib import Path

# --- 核心配置 ---
# 强制使用 socks5h 确保 DNS 解析也走代理，解决 OpenAI 等域名解析问题
PROXIES = {
    'http': 'socks5h://127.0.0.1:10808',
    'https': 'socks5h://127.0.0.1:10808'
}

OUTPUT_DIR = Path(__file__).parent / "public" / "logos"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# 针对你失败的 28 个工具，整理出的精准官方域名映射
REMAINING_TOOLS = {
    "chatgpt": "openai.com",
    "dalle3": "openai.com",
    "sora": "openai.com",
    "tongyi": "aliyun.com",
    "tongyi-lingma": "tongyi.aliyun.com",
    "tongyi-wanxiang": "tongyi.aliyun.com",
    "wenxin-yige": "yige.baidu.com",
    "metaso": "metaso.cn",
    "phind": "phind.com",
    "jasper": "jasper.ai",
    "grammarly": "grammarly.com",
    "xiezuocat": "xiezuocat.com",
    "midjourney": "midjourney.com",
    "ideogram": "ideogram.ai",
    "runway-edit": "runwayml.com",
    "descript": "descript.com",
    "gamma": "gamma.app",
    "tome": "tome.app",
    "aippt": "aippt.cn",
    "feigua": "feigua.io",
    "klaviyo": "klaviyo.com",
    "adcreative": "adcreative.ai",
    "yuque": "yuque.com",
    "lseditor": "135editor.com",
    "markdown-nice": "mdnice.com",
    "yixiaoer": "yixiaoer.cn",
    "monica": "monica.im",
    "wps-ai": "wps.cn"
}

def get_logo(slug, domain):
    # 采用高成功率的聚合源：unavatar(首选), duckduckgo(备选), google(保底)
    api_sources = [
        f"https://unavatar.io/{domain}?fallback=false",
        f"https://icons.duckduckgo.com/ip3/{domain}.ico",
        f"https://www.google.com/s2/favicons?domain={domain}&sz=128"
    ]
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }

    for url in api_sources:
        try:
            print(f"  -> 尝试源: {url[:50]}...", end="", flush=True)
            # 关键：proxies=PROXIES
            r = requests.get(url, headers=headers, proxies=PROXIES, timeout=12)
            
            # 校验：状态码200且内容大小合理（排除掉返回的“小像素占位图”）
            if r.status_code == 200 and len(r.content) > 800:
                # 识别扩展名
                ctype = r.headers.get("Content-Type", "").lower()
                ext = "png"
                if "x-icon" in ctype or url.endswith(".ico"): ext = "ico"
                elif "svg" in ctype: ext = "svg"
                
                save_path = OUTPUT_DIR / f"{slug}.{ext}"
                save_path.write_bytes(r.content)
                print(f" ✓ 成功 ({len(r.content)}b)")
                return True
            else:
                print(" ✗ 跳过")
        except Exception:
            print(" ✗ 报错")
    return False

# --- 开始执行 ---
print(f"🚀 开始补全 28 个 Logo (代理端口: 10808)")
print(f"保存路径: {OUTPUT_DIR}")
print("="*60)

success = 0
for i, (slug, domain) in enumerate(REMAINING_TOOLS.items(), 1):
    print(f"[{i}/28] 正在处理: {slug} ({domain})")
    if get_logo(slug, domain):
        success += 1
    time.sleep(0.5) # 适当停顿

print("\n" + "="*60)
print(f"✅ 任务完成！成功补齐: {success} / 28")
print("提示：如果仍有极个别失败，可能是该域名彻底屏蔽了外部获取，建议从 1Panel 后台手动上传。")