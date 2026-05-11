# AI工具导航站 - 完整搭建指南

## 快速启动（5步）

```bash
# 1. 安装依赖
npm install

# 2. 复制环境变量模板
cp .env.local.example .env.local
# 然后编辑 .env.local，填入 Notion API Key 和数据库 ID

# 3. 本地开发
npm run dev
# 打开 http://localhost:3000

# 4. 构建静态文件
npm run build

# 5. 预览构建结果
npx serve out
```

---

## Notion 数据库字段配置

在 Notion 中创建数据库，字段名称和类型必须严格按照以下配置：

### 基础信息字段

| 字段名 | Notion 类型 | 说明 | 示例值 |
|--------|------------|------|--------|
| `name` | Title | 工具全称 | Claude AI |
| `slug` | Text | URL路径（小写英文+连字符） | claude-ai |
| `maker` | Text | 开发商 | Anthropic |
| `logo` | Text | Emoji 或图片URL | 🤖 |
| `tagline` | Text | 一句话介绍（80字以内） | Anthropic出品的对话AI... |
| `tags` | Multi-select | 特性标签 | 免费可用, 支持中文, API可用 |
| `websiteUrl` | URL | 官网链接 | https://claude.ai |
| `affiliateUrl` | URL | 联盟推广链接 | https://claude.ai?ref=xxx |
| `category` | Multi-select | 工具分类 | AI对话, 写作助手 |
| `status` | Status | 发布状态 | published / draft |

### SEO 字段

| 字段名 | Notion 类型 | 说明 |
|--------|------------|------|
| `seoTitle` | Text | 页面标题（60字符以内） |
| `seoDesc` | Text | Meta描述（155字符以内） |
| `ogImage` | Text | OG图片路径（如 /og/claude-ai.jpg） |

### 快速数据字段

| 字段名 | Notion 类型 | 示例值 |
|--------|------------|--------|
| `freeLimit` | Text | 约30次/天 |
| `pricingStart` | Text | $20/月 |
| `contextWindow` | Text | 200K Token |
| `rating` | Number | 4.7 |
| `reviewCount` | Number | 1284 |

### 工具详情字段

| 字段名 | Notion 类型 | 说明 |
|--------|------------|------|
| `launchDate` | Text | 上线时间，如 2023年3月 |
| `hasFreeVersion` | Checkbox | 是否有免费版 |
| `hasApi` | Checkbox | 是否开放API |
| `platforms` | Multi-select | Web, iOS, Android |
| `publishedAt` | Date | 首次发布日期 |

### 内容区块字段（存 JSON 字符串）

| 字段名 | Notion 类型 | 说明 |
|--------|------------|------|
| `introduction` | Text | 工具简介段落 |
| `verdict` | Text | 编辑总结段落 |
| `scores` | Text | 功能评分数组（JSON） |
| `pricing` | Text | 价格方案数组（JSON） |
| `scenarios` | Text | 使用场景数组（JSON） |
| `faq` | Text | FAQ数组（JSON） |
| `prosAndCons` | Text | 优缺点（JSON） |
| `similarTools` | Text | 相似工具（JSON） |
| `competitors` | Multi-select | 竞品工具的 slug |

---

## JSON 字段格式示例

### scores 字段
```json
[
  {"feature": "中文写作", "score": 9.4, "color": "green"},
  {"feature": "代码生成", "score": 9.1, "color": "green"},
  {"feature": "长文档分析", "score": 9.5, "color": "green"},
  {"feature": "联网搜索", "score": 7.0, "color": "amber"}
]
```

### pricing 字段
```json
[
  {
    "name": "免费版",
    "price": "0",
    "currency": "USD",
    "period": "/月",
    "features": ["Claude 3.5 Haiku", "约30次/天对话", "支持文件上传"],
    "notFeatures": ["Claude 3.5 Sonnet", "Projects功能"],
    "cta": "免费注册",
    "ctaUrl": "https://claude.ai",
    "featured": false
  },
  {
    "name": "Pro版",
    "price": "20",
    "currency": "USD",
    "period": "/月",
    "features": ["Claude 3.5 Sonnet完整访问", "5倍免费版使用量", "Projects长期记忆"],
    "notFeatures": ["团队协作功能"],
    "cta": "升级Pro · $20/月",
    "ctaUrl": "https://claude.ai/upgrade",
    "featured": true
  }
]
```

### faq 字段
```json
[
  {
    "question": "Claude AI 免费版够用吗？",
    "answer": "免费版每天约有30次对话限制，日常写作够用；高频使用建议Pro版。"
  },
  {
    "question": "Claude AI 国内能用吗？",
    "answer": "官网需要科学上网，API可通过国内代理获取。"
  }
]
```

### prosAndCons 字段
```json
{
  "pros": ["中文写作质量顶级", "200K超长上下文", "代码能力强"],
  "cons": ["不支持图像生成", "国内访问需翻墙", "联网搜索不如ChatGPT"]
}
```

### similarTools 字段
```json
[
  {"name": "ChatGPT", "slug": "chatgpt", "logo": "💬", "maker": "OpenAI", "priceLabel": "$20/月"},
  {"name": "Gemini", "slug": "gemini", "logo": "✨", "maker": "Google", "priceLabel": "免费"}
]
```

---

## Cloudflare Pages 部署步骤

1. 将项目推送到 GitHub
   ```bash
   git init && git add . && git commit -m "init"
   git remote add origin https://github.com/你的用户名/aitools-nav.git
   git push -u origin main
   ```

2. 登录 Cloudflare → Workers & Pages → Create application → Pages → Connect to Git

3. 选择你的 GitHub 仓库，填写构建配置：
   - Framework preset: `Next.js (Static HTML Export)`
   - Build command: `npm run build && npx next-sitemap`
   - Build output directory: `out`
   - Node.js version: `20`

4. 设置环境变量（Settings → Environment variables）：
   - `NOTION_API_KEY` = `secret_xxxx`
   - `NOTION_DATABASE_ID` = `xxxx`
   - `NEXT_PUBLIC_SITE_URL` = `https://yourdomain.com`
   - `NEXT_PUBLIC_SITE_NAME` = `AI工具导航`

5. 在域名设置中绑定你的自定义域名

---

## 日常内容更新流程

1. 在 Notion 数据库中新增一行，填写所有字段
2. 将 `status` 设置为 `published`
3. 在 Cloudflare Pages → Deployments → 点击 "Retry deployment" 触发重新构建
   （或配置 GitHub Action 定时触发：每天凌晨 2 点自动重新构建）

---

## 可选：GitHub Action 每日自动构建

创建 `.github/workflows/daily-build.yml`：
```yaml
name: Daily rebuild
on:
  schedule:
    - cron: '0 18 * * *'  # 北京时间凌晨2点（UTC 18:00）
  workflow_dispatch:

jobs:
  trigger-cf-build:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Cloudflare Pages build
        run: |
          curl -X POST "${{ secrets.CF_DEPLOY_HOOK_URL }}"
```

在 Cloudflare Pages → Settings → Build hooks 中创建 Deploy Hook URL，
然后存入 GitHub Secrets 中的 `CF_DEPLOY_HOOK_URL`。
