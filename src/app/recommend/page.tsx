'use client'

import { useEffect, useState, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import WukongLogo from '@/components/WukongLogo'
import { getCombos, matchScene, SCENE_LABELS } from '@/lib/combos-data'

const TIER_META: Record<string, { label: string; accent: string; tagBg: string; tagColor: string; darkTagBg: string }> = {
  free: { label: '全免费方案', accent: '#1D9E75', tagBg: '#E1F5EE', tagColor: '#085041', darkTagBg: '#085041' },
  mid:  { label: '性价比首选', accent: '#D97706', tagBg: '#FEF3C7', tagColor: '#92400E', darkTagBg: '#633806' },
  pro:  { label: '创意旗舰',   accent: '#7C3AED', tagBg: '#EDE9FE', tagColor: '#4C1D95', darkTagBg: '#3C3489' },
}

const DB_PLACEHOLDER: Record<string, any[]> = {

  // ── 短视频 ──────────────────────────────────────────────
  video: [
    {
      id: 'v1', tier: 'mid', isRec: true,
      name: '豆包 + ElevenLabs + 剪映',
      tagline: '全流程贯通，基本免费，30分钟出一条视频',
      priceMin: 0, priceMax: 99,
      steps: [
        { phase: '脚本生成', conn: 'or', tools: [
          { name: '豆包',     logo: '🫘', price: '免费',    url: 'https://www.doubao.com' },
          { name: 'DeepSeek', logo: '🐋', price: '免费',    url: 'https://chat.deepseek.com' },
        ]},
        { phase: '中转英 + AI配音', conn: 'or', tools: [
          { name: 'ElevenLabs', logo: '🎙️', price: '$5/月',  url: 'https://elevenlabs.io' },
          { name: '火山TTS',    logo: '🔊', price: '按量付', url: 'https://www.volcengine.com/product/tts' },
        ]},
        { phase: '自动剪辑成片', conn: 'and', tools: [
          { name: '剪映专业版', logo: '🎬', price: '免费', url: 'https://www.capcut.cn' },
        ]},
        { phase: '多平台分发', conn: 'or', tools: [
          { name: '蚁小二',   logo: '📱', price: '¥49/月', url: 'https://www.yixiaoer.cn' },
          { name: '万兴播爆', logo: '🚀', price: '¥99/月', url: 'https://virbo.wondershare.cn' },
        ]},
      ],
      pros: ['上手简单', '中文支持好', '基本免费', '全流程打通'],
      why: '豆包/DeepSeek 免费生成中文脚本，ElevenLabs 一键克隆声音并翻译配音，剪映自动对齐字幕。整套流程最短 30 分钟出一条视频，月成本几乎为零。适合刚起步的自媒体人快速验证内容方向。',
    },
    {
      id: 'v2', tier: 'mid', isRec: false,
      name: 'Claude + HeyGen + Premiere',
      tagline: 'AI数字人口播，视频质感专业级',
      priceMin: 200, priceMax: 600,
      steps: [
        { phase: '脚本撰写 + 翻译', conn: 'and', tools: [
          { name: 'Claude 3.5', logo: '🤖', price: '$20/月', url: 'https://claude.ai' },
        ]},
        { phase: 'AI数字人生成', conn: 'and', tools: [
          { name: 'HeyGen', logo: '🎭', price: '$29/月', url: 'https://www.heygen.com' },
        ]},
        { phase: '专业剪辑', conn: 'or', tools: [
          { name: 'Premiere Pro',    logo: '🎞️', price: '¥168/月', url: 'https://www.adobe.com/products/premiere.html' },
          { name: 'DaVinci Resolve', logo: '✂️', price: '免费',    url: 'https://www.blackmagicdesign.com/products/davinciresolve' },
        ]},
        { phase: '数据监测', conn: 'and', tools: [
          { name: '飞瓜数据', logo: '📊', price: '¥199/月', url: 'https://www.feigua.io' },
        ]},
      ],
      pros: ['视频质量高', 'AI数字人口播', '数据驱动', '真人克隆声音'],
      why: '有一定预算、追求视频质量的创作者。HeyGen 可克隆真人形象做无限口播，Claude 保障脚本质量，飞瓜数据分析爆款规律。适合想做 IP 化运营的博主。',
    },
    {
      id: 'v3', tier: 'pro', isRec: false,
      name: 'Midjourney + Runway + GPT-4o',
      tagline: '纯 AI 生成画面，视觉差异化极强',
      priceMin: 800, priceMax: 2000,
      steps: [
        { phase: '图像 + 视频素材', conn: 'and', tools: [
          { name: 'Midjourney',  logo: '🎨', price: '$10/月', url: 'https://www.midjourney.com' },
          { name: 'Runway Gen-3',logo: '🎥', price: '$15/月', url: 'https://runwayml.com' },
        ]},
        { phase: '脚本 + 旁白', conn: 'and', tools: [
          { name: 'GPT-4o',     logo: '💬', price: '$20/月', url: 'https://chat.openai.com' },
          { name: 'ElevenLabs', logo: '🎙️', price: '$22/月', url: 'https://elevenlabs.io' },
        ]},
        { phase: '后期特效合成', conn: 'and', tools: [
          { name: 'After Effects', logo: '✨', price: '¥168/月', url: 'https://www.adobe.com/products/aftereffects.html' },
        ]},
      ],
      pros: ['纯AI画面', '视觉差异化', '无需实拍', '适合科技品牌'],
      why: '做 AI 创意内容、科技媒体或品牌宣传的专业团队。Midjourney + Runway 全程生成画面，视觉效果独特，差异化明显，在同类账号中非常突出。',
    },
  ],

  // ── 公众号 ──────────────────────────────────────────────
  wechat: [
    {
      id: 'w1', tier: 'mid', isRec: true,
      name: 'Claude + 即梦AI + 135编辑器',
      tagline: '写稿配图排版一条龙，月成本不超200',
      priceMin: 20, priceMax: 200,
      steps: [
        { phase: '选题 + 写稿', conn: 'or', tools: [
          { name: 'Claude 3.5', logo: '🤖', price: '$20/月', url: 'https://claude.ai' },
          { name: '豆包',       logo: '🫘', price: '免费',   url: 'https://www.doubao.com' },
        ]},
        { phase: 'AI配图生成', conn: 'or', tools: [
          { name: '即梦AI',     logo: '🌙', price: '免费',   url: 'https://jimeng.jianying.com' },
          { name: 'Midjourney', logo: '🎨', price: '$10/月', url: 'https://www.midjourney.com' },
        ]},
        { phase: '排版 + 发布', conn: 'or', tools: [
          { name: '135编辑器',   logo: '📝', price: '免费', url: 'https://www.135editor.com' },
          { name: 'Markdown Nice',logo: '✍️', price: '免费', url: 'https://mdnice.com' },
        ]},
      ],
      pros: ['写作质量高', 'AI配图美观', '一键排版', '国内可直接用'],
      why: 'Claude 写出来的中文文章自然流畅无 AI 腔，即梦AI 国内直接访问免费生图，135编辑器导入微信后台一键排版。熟练后一篇图文 2 小时搞定，月成本不超 200 元。',
    },
    {
      id: 'w2', tier: 'free', isRec: false,
      name: 'Kimi + 文心一格 + 秀米',
      tagline: '零成本全免费，国内工具全程可用',
      priceMin: 0, priceMax: 0,
      steps: [
        { phase: '写稿 + 润色', conn: 'and', tools: [
          { name: 'Kimi', logo: '🌙', price: '免费', url: 'https://kimi.moonshot.cn' },
        ]},
        { phase: 'AI配图', conn: 'and', tools: [
          { name: '文心一格', logo: '🎨', price: '免费', url: 'https://yige.baidu.com' },
        ]},
        { phase: '排版发布', conn: 'and', tools: [
          { name: '秀米', logo: '✨', price: '免费', url: 'https://xiumi.us' },
        ]},
      ],
      pros: ['完全免费', '无需翻墙', '上手容易', '中文体验好'],
      why: '完全免费，适合刚开始运营公众号、不想花钱试水的创作者。Kimi 长文处理能力强，文心一格国内免费生图，秀米是公众号排版神器，三者联动零成本跑通完整工作流。',
    },
    {
      id: 'w3', tier: 'pro', isRec: false,
      name: 'GPT-4o + DALL-E 3 + Notion AI',
      tagline: '内容质量顶级，适合有调性的品牌号',
      priceMin: 300, priceMax: 600,
      steps: [
        { phase: '选题策划', conn: 'and', tools: [
          { name: 'Perplexity', logo: '🔍', price: '$20/月', url: 'https://www.perplexity.ai' },
        ]},
        { phase: '文章创作', conn: 'and', tools: [
          { name: 'GPT-4o', logo: '💬', price: '$20/月', url: 'https://chat.openai.com' },
        ]},
        { phase: '配图生成', conn: 'and', tools: [
          { name: 'DALL-E 3', logo: '🖼️', price: '含在ChatGPT', url: 'https://chat.openai.com' },
        ]},
        { phase: '内容管理', conn: 'and', tools: [
          { name: 'Notion AI', logo: '📋', price: '$10/月', url: 'https://www.notion.so' },
        ]},
      ],
      pros: ['内容质量顶级', '图文风格统一', '内容管理完善', '适合品牌号'],
      why: '追求内容调性和品牌一致性的公众号。Perplexity 联网找热门选题，GPT-4o 生成高质量内容，DALL-E 3 确保图片风格统一，Notion AI 管理内容日历和团队协作。',
    },
  ],

  // ── 跨境电商 ────────────────────────────────────────────
  ecommerce: [
    {
      id: 'e1', tier: 'mid', isRec: true,
      name: 'DeepSeek + Helium 10 + Tidio',
      tagline: '选品+翻译+客服全自动，ROI极高',
      priceMin: 50, priceMax: 300,
      steps: [
        { phase: '市场选品分析', conn: 'and', tools: [
          { name: 'Helium 10', logo: '🔬', price: '$39/月', url: 'https://www.helium10.com' },
        ]},
        { phase: '产品描述翻译', conn: 'or', tools: [
          { name: 'DeepSeek', logo: '🐋', price: '免费',   url: 'https://chat.deepseek.com' },
          { name: 'ChatGPT',  logo: '💬', price: '$20/月', url: 'https://chat.openai.com' },
        ]},
        { phase: 'AI智能客服', conn: 'and', tools: [
          { name: 'Tidio AI', logo: '🤝', price: '$29/月', url: 'https://www.tidio.com' },
        ]},
        { phase: '广告文案优化', conn: 'and', tools: [
          { name: 'Copy.ai', logo: '✍️', price: '$49/月', url: 'https://www.copy.ai' },
        ]},
      ],
      pros: ['选品数据精准', '翻译质量高', '24小时客服', '成本可控'],
      why: 'Helium 10 是亚马逊卖家必备选品工具，DeepSeek 免费翻译产品描述效果极好，Tidio AI 自动处理 80% 客服问题，Copy.ai 批量生成广告文案。月成本 50-300 元，ROI 极高。',
    },
    {
      id: 'e2', tier: 'free', isRec: false,
      name: 'DeepSeek + 豆包 + 国内免费工具',
      tagline: '全免费国内工具，适合刚起步卖家',
      priceMin: 0, priceMax: 0,
      steps: [
        { phase: '产品分析', conn: 'and', tools: [
          { name: 'DeepSeek', logo: '🐋', price: '免费', url: 'https://chat.deepseek.com' },
        ]},
        { phase: '文案翻译', conn: 'and', tools: [
          { name: '豆包', logo: '🫘', price: '免费', url: 'https://www.doubao.com' },
        ]},
        { phase: '买家评论分析', conn: 'and', tools: [
          { name: 'Kimi', logo: '🌙', price: '免费', url: 'https://kimi.moonshot.cn' },
        ]},
      ],
      pros: ['完全免费', '国内直接用', '中文界面', '上手快'],
      why: '刚起步的跨境卖家，预算有限时的最佳入门方案。DeepSeek 翻译质量媲美 ChatGPT，豆包处理批量文案，Kimi 分析竞品买家评论找痛点。零成本验证选品。',
    },
    {
      id: 'e3', tier: 'pro', isRec: false,
      name: 'ChatGPT + Shopify AI + Klaviyo',
      tagline: '独立站全套自动化，适合成熟卖家',
      priceMin: 500, priceMax: 1500,
      steps: [
        { phase: '内容营销', conn: 'and', tools: [
          { name: 'ChatGPT', logo: '💬', price: '$20/月', url: 'https://chat.openai.com' },
        ]},
        { phase: '独立站建设', conn: 'and', tools: [
          { name: 'Shopify', logo: '🛍️', price: '$39/月', url: 'https://www.shopify.com' },
        ]},
        { phase: '邮件营销自动化', conn: 'and', tools: [
          { name: 'Klaviyo', logo: '📧', price: '$30/月', url: 'https://www.klaviyo.com' },
        ]},
        { phase: '广告投放', conn: 'and', tools: [
          { name: 'AdCreative.ai', logo: '🎯', price: '$29/月', url: 'https://www.adcreative.ai' },
        ]},
      ],
      pros: ['全链路自动化', '邮件营销精准', '广告ROI高', '独立站生态完善'],
      why: '有稳定销量、想做品牌化的成熟跨境卖家。Shopify + Klaviyo 是独立站标配，ChatGPT 批量生产内容，AdCreative.ai 自动生成高转化率广告素材。',
    },
  ],

  // ── 独立开发 ────────────────────────────────────────────
  dev: [
    {
      id: 'd1', tier: 'mid', isRec: true,
      name: 'Cursor + Claude + Vercel',
      tagline: 'AI辅助全栈开发，效率提升3倍',
      priceMin: 40, priceMax: 150,
      steps: [
        { phase: '需求分析 + 架构设计', conn: 'and', tools: [
          { name: 'Claude 3.5', logo: '🤖', price: '$20/月', url: 'https://claude.ai' },
        ]},
        { phase: 'AI辅助编码', conn: 'and', tools: [
          { name: 'Cursor', logo: '⌨️', price: '$20/月', url: 'https://cursor.sh' },
        ]},
        { phase: '代码审查 + 测试', conn: 'or', tools: [
          { name: 'GitHub Copilot', logo: '🐙', price: '$10/月', url: 'https://github.com/features/copilot' },
          { name: 'Codeium',        logo: '💚', price: '免费',   url: 'https://codeium.com' },
        ]},
        { phase: '一键部署上线', conn: 'and', tools: [
          { name: 'Vercel', logo: '▲', price: '免费', url: 'https://vercel.com' },
        ]},
      ],
      pros: ['编码速度提升3倍', '一键部署', '成本极低', '全栈支持'],
      why: 'Cursor 是目前最好用的 AI 编程 IDE，Claude 处理复杂逻辑和架构，Vercel 一键部署。这套组合让独立开发者生产效率提升 3 倍以上，¥150/月出一个 MVP 完全可行。',
    },
    {
      id: 'd2', tier: 'free', isRec: false,
      name: 'VS Code + Codeium + GitHub Actions',
      tagline: '全免费开发工作流，适合学生和业余开发者',
      priceMin: 0, priceMax: 0,
      steps: [
        { phase: 'AI辅助编码', conn: 'and', tools: [
          { name: 'VS Code + Codeium', logo: '💚', price: '免费', url: 'https://codeium.com' },
        ]},
        { phase: '代码托管', conn: 'and', tools: [
          { name: 'GitHub', logo: '🐙', price: '免费', url: 'https://github.com' },
        ]},
        { phase: '自动化部署', conn: 'and', tools: [
          { name: 'GitHub Actions', logo: '⚙️', price: '免费', url: 'https://github.com/features/actions' },
        ]},
      ],
      pros: ['完全免费', '上手门槛低', 'CI/CD自动化', '社区资源丰富'],
      why: '学生、业余开发者或刚入门的独立开发者的最佳起点。Codeium 免费 AI 补全媲美 Copilot，GitHub Actions 自动化 CI/CD，全套免费跑通完整开发流程。',
    },
    {
      id: 'd3', tier: 'pro', isRec: false,
      name: 'Claude + Devin + AWS + Datadog',
      tagline: '全自动化 AI 软件工程师工作流',
      priceMin: 500, priceMax: 2000,
      steps: [
        { phase: '自主编码 Agent', conn: 'and', tools: [
          { name: 'Devin', logo: '🤖', price: '$500/月', url: 'https://devin.ai' },
        ]},
        { phase: '代码审查', conn: 'and', tools: [
          { name: 'Claude 3.5', logo: '🤖', price: '$20/月', url: 'https://claude.ai' },
        ]},
        { phase: '云端部署', conn: 'and', tools: [
          { name: 'AWS', logo: '☁️', price: '按量付费', url: 'https://aws.amazon.com' },
        ]},
        { phase: '监控告警', conn: 'and', tools: [
          { name: 'Datadog', logo: '🐕', price: '$15/月起', url: 'https://www.datadoghq.com' },
        ]},
      ],
      pros: ['AI自主写代码', '企业级部署', '全面监控', '生产环境可用'],
      why: '有融资或稳定收入的产品团队。Devin 是全球首个 AI 软件工程师，可自主完成编程任务，配合 Claude 代码审查和 AWS 企业级部署，实现真正的 AI 驱动开发。',
    },
  ],

  // ── AI绘画 ──────────────────────────────────────────────
  painting: [
    {
      id: 'p1', tier: 'mid', isRec: true,
      name: '即梦AI + Midjourney + Canva',
      tagline: '生图+精修+商业化，月入万元可实现',
      priceMin: 10, priceMax: 100,
      steps: [
        { phase: '快速出图', conn: 'or', tools: [
          { name: '即梦AI',     logo: '🌙', price: '免费',   url: 'https://jimeng.jianying.com' },
          { name: '文心一格',   logo: '🎨', price: '免费',   url: 'https://yige.baidu.com' },
        ]},
        { phase: '高质量精品图', conn: 'and', tools: [
          { name: 'Midjourney', logo: '🎨', price: '$10/月', url: 'https://www.midjourney.com' },
        ]},
        { phase: '后期排版商用', conn: 'and', tools: [
          { name: 'Canva', logo: '🖼️', price: '免费/¥68/月', url: 'https://www.canva.com' },
        ]},
        { phase: '接单变现', conn: 'or', tools: [
          { name: '稿定设计',  logo: '📐', price: '免费', url: 'https://www.gaoding.com' },
          { name: 'Etsy',     logo: '🛒', price: '按单收费', url: 'https://www.etsy.com' },
        ]},
      ],
      pros: ['出图速度快', '商业授权清晰', '变现路径明确', '成本极低'],
      why: '即梦AI 免费出图积累素材，Midjourney 生成高质量商业图，Canva 快速排版做成成品，Etsy 卖给海外客户。这套路径已有大量人实现月入过万，入门门槛低，学习曲线平缓。',
    },
    {
      id: 'p2', tier: 'free', isRec: false,
      name: '完全免费国内AI绘画工具组',
      tagline: '零成本体验AI绘画，适合新手入门',
      priceMin: 0, priceMax: 0,
      steps: [
        { phase: '文生图', conn: 'or', tools: [
          { name: '即梦AI',   logo: '🌙', price: '免费', url: 'https://jimeng.jianying.com' },
          { name: '文心一格', logo: '🎨', price: '免费', url: 'https://yige.baidu.com' },
          { name: '通义万相', logo: '✨', price: '免费', url: 'https://tongyi.aliyun.com/wanxiang' },
        ]},
        { phase: '图片处理', conn: 'and', tools: [
          { name: '美图秀秀AI', logo: '📸', price: '免费', url: 'https://www.meitu.com' },
        ]},
      ],
      pros: ['完全免费', '国内直接访问', '中文提示词', '无需科学上网'],
      why: '刚开始接触 AI 绘画、不确定是否会继续的新手。即梦AI、文心一格、通义万相都是国内免费工具，中文提示词效果好，零门槛体验 AI 绘画的乐趣。',
    },
    {
      id: 'p3', tier: 'pro', isRec: false,
      name: 'Midjourney + Stable Diffusion + ComfyUI',
      tagline: '专业级工作流，支持定制模型和批量出图',
      priceMin: 200, priceMax: 800,
      steps: [
        { phase: '高质量概念图', conn: 'and', tools: [
          { name: 'Midjourney', logo: '🎨', price: '$30/月', url: 'https://www.midjourney.com' },
        ]},
        { phase: '本地定制模型', conn: 'and', tools: [
          { name: 'Stable Diffusion', logo: '🌊', price: '免费开源', url: 'https://stability.ai' },
          { name: 'ComfyUI',          logo: '⚙️', price: '免费',    url: 'https://github.com/comfyanonymous/ComfyUI' },
        ]},
        { phase: '后期修图', conn: 'and', tools: [
          { name: 'Photoshop AI', logo: '🖌️', price: '¥168/月', url: 'https://www.adobe.com/products/photoshop.html' },
        ]},
      ],
      pros: ['完全可控', '支持LoRA微调', '批量出图', '商业价值高'],
      why: '有一定技术基础、想做专业 AI 绘画商业服务的创作者。Midjourney 出高质量概念图，SD + ComfyUI 本地定制风格，Photoshop AI 精修细节。这套工具可以承接专业商业设计订单。',
    },
  ],

  // ── 播客 ────────────────────────────────────────────────
  podcast: [
    {
      id: 'pk1', tier: 'mid', isRec: true,
      name: 'Descript + Claude + Buzzsprout',
      tagline: '录音剪辑字幕一体，发布全平台',
      priceMin: 50, priceMax: 200,
      steps: [
        { phase: '录音 + 降噪', conn: 'and', tools: [
          { name: 'Descript', logo: '🎧', price: '$24/月', url: 'https://www.descript.com' },
        ]},
        { phase: '节目策划 + 脚本', conn: 'and', tools: [
          { name: 'Claude 3.5', logo: '🤖', price: '$20/月', url: 'https://claude.ai' },
        ]},
        { phase: 'AI字幕生成', conn: 'and', tools: [
          { name: 'Descript 转写', logo: '📝', price: '含在上方', url: 'https://www.descript.com' },
        ]},
        { phase: '多平台分发', conn: 'and', tools: [
          { name: 'Buzzsprout', logo: '📡', price: '$12/月', url: 'https://www.buzzsprout.com' },
        ]},
      ],
      pros: ['一体化工作流', '字幕自动生成', '全平台分发', '操作简单'],
      why: 'Descript 是播客制作神器，录音、降噪、转写字幕、剪辑一体化，Claude 帮你策划节目和写脚本，Buzzsprout 自动分发到 Spotify、Apple Podcasts 等 20+ 平台。',
    },
    {
      id: 'pk2', tier: 'free', isRec: false,
      name: 'Audacity + 讯飞听见 + 小宇宙',
      tagline: '全免费国内播客工具，零门槛起步',
      priceMin: 0, priceMax: 0,
      steps: [
        { phase: '录音剪辑', conn: 'and', tools: [
          { name: 'Audacity', logo: '🎵', price: '免费开源', url: 'https://www.audacityteam.org' },
        ]},
        { phase: 'AI转写字幕', conn: 'and', tools: [
          { name: '讯飞听见', logo: '🎤', price: '免费', url: 'https://www.iflyrec.com' },
        ]},
        { phase: '发布到国内平台', conn: 'and', tools: [
          { name: '小宇宙', logo: '🎧', price: '免费', url: 'https://www.xiaoyuzhoufm.com' },
        ]},
      ],
      pros: ['完全免费', '国内平台', '中文字幕准确', '无需翻墙'],
      why: '想在国内做播客的创作者。Audacity 是专业级免费录音软件，讯飞听见中文转写准确率 95%+，小宇宙是国内最大播客平台，流量和社区氛围好。',
    },
    {
      id: 'pk3', tier: 'pro', isRec: false,
      name: 'Adobe Audition + ElevenLabs + Spotify for Podcasters',
      tagline: '专业音频品质，国际化发布',
      priceMin: 200, priceMax: 500,
      steps: [
        { phase: '专业录音混音', conn: 'and', tools: [
          { name: 'Adobe Audition', logo: '🎚️', price: '¥168/月', url: 'https://www.adobe.com/products/audition.html' },
        ]},
        { phase: 'AI语音克隆', conn: 'and', tools: [
          { name: 'ElevenLabs', logo: '🎙️', price: '$22/月', url: 'https://elevenlabs.io' },
        ]},
        { phase: '国际发布', conn: 'and', tools: [
          { name: 'Spotify for Podcasters', logo: '💚', price: '免费', url: 'https://podcasters.spotify.com' },
        ]},
      ],
      pros: ['专业音频质量', 'AI声音克隆', '国际受众', '数据分析完善'],
      why: '想做高质量英文或双语播客、面向国际受众的创作者。Adobe Audition 专业混音，ElevenLabs 克隆你的声音做多语言版本，Spotify for Podcasters 覆盖全球最大播客平台。',
    },
  ],
}

// ── 场景匹配（从 combos-data.ts 导入）─────────────────────

// ── 加载动效 ─────────────────────────────────────────────
function WukongLoader({ query }: { query: string }) {
  const [step, setStep] = useState(0)
  const steps = [
    '🐒 悟空出发，七十二变搜寻工具...',
    '🌀 金箍棒旋转，扫描 50+ 款 AI...',
    '⚡ 筋斗云飞驰，匹配最佳组合...',
    '✨ 法力无边，方案即将揭晓...',
  ]
  useEffect(() => {
    const t = setInterval(() => setStep(s => (s + 1) % steps.length), 800)
    return () => clearInterval(t)
  }, [])
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '55vh', gap: '28px' }}>
      <div style={{ position: 'relative', width: '110px', height: '110px' }}>
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid transparent', borderTopColor: '#D97706', borderRightColor: '#D97706', animation: 'r1 .9s linear infinite' }} />
        <div style={{ position: 'absolute', inset: '10px', borderRadius: '50%', border: '1.5px solid transparent', borderTopColor: '#F59E0B', borderLeftColor: '#F59E0B', animation: 'r2 .65s linear infinite reverse' }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '44px', animation: 'pulse 1.4s ease-in-out infinite' }}>🐒</div>
        {[0,60,120,180,240,300].map((deg, i) => (
          <div key={i} style={{ position: 'absolute', width: '6px', height: '6px', borderRadius: '50%', background: '#F59E0B', top: '50%', left: '50%', transform: `rotate(${deg}deg) translateY(-50px) translate(-50%,-50%)`, animation: `dot 1.2s ease-in-out ${i*0.2}s infinite` }} />
        ))}
      </div>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '15px', color: 'var(--color-text-primary)', fontWeight: 500, marginBottom: '8px', animation: 'fade .4s ease' }}>
          {steps[step]}
        </p>
        <p style={{ fontSize: '13px', color: 'var(--color-text-tertiary)', maxWidth: '300px', lineHeight: 1.5 }}>
          为「{query.length > 18 ? query.slice(0, 18) + '...' : query}」匹配最佳工具组合
        </p>
      </div>
      <div style={{ width: '180px', height: '3px', background: 'var(--color-background-secondary)', borderRadius: '2px', overflow: 'hidden' }}>
        <div style={{ height: '100%', background: '#D97706', borderRadius: '2px', animation: 'prog 2.4s ease-in-out infinite' }} />
      </div>
      <style>{`
        @keyframes r1{to{transform:rotate(360deg)}}
        @keyframes r2{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.1)}}
        @keyframes dot{0%,100%{opacity:.3;transform:rotate(var(--d,0deg)) translateY(-50px) translate(-50%,-50%) scale(.7)}50%{opacity:1;transform:rotate(var(--d,0deg)) translateY(-50px) translate(-50%,-50%) scale(1.2)}}
        @keyframes prog{0%{width:0;margin-left:0}60%{width:100%;margin-left:0}100%{width:0;margin-left:100%}}
        @keyframes fade{from{opacity:0;transform:translateY(3px)}to{opacity:1;transform:translateY(0)}}
      `}</style>
    </div>
  )
}

// ── 工具标签 ─────────────────────────────────────────────
function ToolChip({ tool, accent }: { tool: any; accent: string }) {
  return (
    <a href={tool.url} target="_blank" rel="nofollow noopener"
      style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'var(--color-background-primary)', border: '0.5px solid var(--color-border-secondary)', borderRadius: '8px', padding: '5px 10px', textDecoration: 'none', transition: 'border-color .15s, transform .1s', cursor: 'pointer' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = accent; e.currentTarget.style.transform = 'translateY(-1px)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border-secondary)'; e.currentTarget.style.transform = 'none' }}
    >
      <span style={{ fontSize: '15px', lineHeight: 1 }}>{tool.logo}</span>
      <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text-primary)' }}>{tool.name}</span>
      <span style={{ fontSize: '10px', color: 'var(--color-text-tertiary)' }}>{tool.price}</span>
      <span style={{ fontSize: '10px', color: accent }}>↗</span>
    </a>
  )
}

// ── 方案编号配色 ─────────────────────────────────────────
const PLAN_STYLES = [
  { numBg: '#D97706', numColor: '#fff',    border: (accent: string) => `2px solid ${accent}` },
  { numBg: '#1D6FB8', numColor: '#fff',    border: () => '2px solid #1D6FB8' },
  { numBg: '#6D28D9', numColor: '#fff',    border: () => '2px solid #6D28D9' },
]

// ── 组合卡片 ─────────────────────────────────────────────
function ComboCard({ combo, defaultOpen, index }: { combo: any; defaultOpen: boolean; index: number }) {
  const [open, setOpen] = useState(defaultOpen)
  const m = TIER_META[combo.tier] || TIER_META.mid
  const ps = PLAN_STYLES[index] || PLAN_STYLES[2]
  const planLabel = ['方案一', '方案二', '方案三'][index] || `方案${index + 1}`
  const borderStyle = combo.isRec ? `2px solid ${m.accent}` : ps.border(m.accent)

  return (
    <div style={{ background: 'var(--color-background-primary)', border: borderStyle, borderRadius: '16px', overflow: 'visible', position: 'relative' }}>

      {/* 方案编号标签（左上角） */}
      <div style={{
        position: 'absolute', top: '-12px', left: '16px',
        background: ps.numBg, color: ps.numColor,
        fontSize: '11px', fontWeight: 600,
        padding: '2px 10px', borderRadius: '20px',
        zIndex: 2, letterSpacing: '.02em',
        boxShadow: '0 1px 4px rgba(0,0,0,.12)',
      }}>
        {planLabel}
      </div>

      {combo.isRec && (
        <div style={{ position: 'absolute', top: '-1px', right: '20px', background: m.accent, color: '#fff', fontSize: '11px', fontWeight: 500, padding: '4px 14px 7px', borderRadius: '0 0 12px 12px', display: 'flex', alignItems: 'center', gap: '4px', zIndex: 2 }}>
          ⭐ 编辑推荐
        </div>
      )}
      {/* 头部 */}
      <div onClick={() => setOpen(!open)} style={{ padding: '1.5rem 1.2rem 1rem', background: combo.isRec ? (combo.tier === 'mid' ? '#FFFBF2' : combo.tier === 'pro' ? '#F5F3FF' : '#F0FDF9') : 'transparent', borderRadius: open ? '14px 14px 0 0' : '14px', borderBottom: open ? '0.5px solid var(--color-border-tertiary)' : 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '7px', marginBottom: '3px' }}>
            <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-primary)' }}>{combo.name}</span>
            <span style={{ fontSize: '10px', fontWeight: 500, background: m.tagBg, color: m.tagColor, padding: '2px 8px', borderRadius: '4px' }}>{m.label}</span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', margin: 0 }}>{combo.tagline}</p>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: '16px', fontWeight: 500, color: 'var(--color-text-primary)' }}>
            ¥{combo.priceMin === 0 ? '0' : combo.priceMin}{combo.priceMin !== combo.priceMax ? `–${combo.priceMax}` : ''}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--color-text-tertiary)' }}>/月</div>
        </div>
        <span style={{ color: 'var(--color-text-tertiary)', fontSize: '18px', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s', flexShrink: 0 }}>▾</span>
      </div>
      {/* 内容 */}
      {open && (
        <div style={{ padding: '1rem 1.2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '14px' }}>
            {combo.steps.map((step: any, i: number) => (
              <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                  <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: m.tagBg, border: `0.5px solid ${m.accent}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 600, color: m.tagColor }}>{i + 1}</div>
                  {i < combo.steps.length - 1 && <div style={{ width: '1px', height: '20px', background: 'var(--color-border-tertiary)', margin: '2px 0' }} />}
                </div>
                <div style={{ flex: 1, paddingTop: '1px' }}>
                  <div style={{ fontSize: '10px', fontWeight: 500, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '5px' }}>{step.phase}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px' }}>
                    {step.tools.map((tool: any, j: number) => (
                      <span key={j} style={{ display: 'contents' }}>
                        <ToolChip tool={tool} accent={m.accent} />
                        {j < step.tools.length - 1 && <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>{step.conn === 'or' ? '或' : '+'}</span>}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ background: 'var(--color-background-secondary)', borderRadius: '10px', padding: '.75rem 1rem', marginBottom: '12px' }}>
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: 1.65, margin: 0 }}>
              <strong style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>{combo.isRec ? '⭐ 为什么推荐？' : '👤 适合人群：'}</strong>
              {' '}{combo.why}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              {combo.pros.map((p: string) => (
                <span key={p} style={{ fontSize: '11px', color: 'var(--color-text-secondary)', background: 'var(--color-background-secondary)', border: '0.5px solid var(--color-border-tertiary)', borderRadius: '4px', padding: '2px 8px' }}>{p}</span>
              ))}
            </div>
            <Link href="/tools/" style={{ fontSize: '12px', fontWeight: 500, background: combo.isRec ? m.accent : 'transparent', color: combo.isRec ? '#fff' : m.accent, border: `1px solid ${m.accent}`, borderRadius: '8px', padding: '6px 14px', textDecoration: 'none', whiteSpace: 'nowrap' }}>
              查看工具详情 →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

// ── 价格对比 ─────────────────────────────────────────────
function PriceBars({ combos }: { combos: any[] }) {
  const maxP = Math.max(...combos.map(c => c.priceMax || 1))
  const colors = ['#D97706','#7C3AED','#1D9E75']
  return (
    <div style={{ background: 'var(--color-background-secondary)', border: '0.5px solid var(--color-border-tertiary)', borderRadius: '12px', padding: '1rem 1.25rem', marginTop: '14px' }}>
      <p style={{ fontSize: '13px', fontWeight: 500, marginBottom: '14px', color: 'var(--color-text-primary)' }}>三套方案月成本对比</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {combos.map((c, i) => (
          <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', width: '88px', flexShrink: 0, lineHeight: 1.3 }}>{TIER_META[c.tier]?.label}</span>
            <div style={{ flex: 1, height: '6px', background: 'var(--color-background-primary)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ height: '100%', background: colors[i % 3], borderRadius: '3px', width: `${Math.max(6, (c.priceMax / maxP) * 100)}%`, transition: 'width 1s ease' }} />
            </div>
            <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text-primary)', minWidth: '80px', textAlign: 'right', flexShrink: 0 }}>
              {c.priceMin === 0 && c.priceMax === 0 ? '完全免费' : `¥${c.priceMin}–${c.priceMax}/月`}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── 主页面 ────────────────────────────────────────────────
function RecommendContent() {
  const params = useSearchParams()
  const router = useRouter()
  const query = params.get('q') || ''
  const [loading, setLoading]         = useState(true)
  const [combos, setCombos]           = useState<any[]>([])
  const [sceneLabels, setSceneLabels] = useState<string[]>([])
  const [newQ, setNewQ]               = useState(query)
  const timer = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    if (!query) return
    setLoading(true)
    setCombos([])
    setSceneLabels([])

    const MIN_MS = 2000
    const start = Date.now()

    fetch('/api/match', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    })
      .then(r => r.json())
      .then(data => {
        const delay = Math.max(0, MIN_MS - (Date.now() - start))
        timer.current = setTimeout(() => {
          setCombos(data.combos ?? [])
          setSceneLabels(data.sceneLabels ?? [])
          setLoading(false)
        }, delay)
      })
      .catch(() => {
        const delay = Math.max(0, MIN_MS - (Date.now() - start))
        timer.current = setTimeout(() => {
          setCombos(getCombos(matchScene(query)))
          setLoading(false)
        }, delay)
      })

    return () => clearTimeout(timer.current)
  }, [query])

  function go() {
    const q = newQ.trim()
    if (!q) return
    try {
      const prev: string[] = JSON.parse(localStorage.getItem('wk_recent') || '[]')
      localStorage.setItem('wk_recent', JSON.stringify([q, ...prev.filter(x => x !== q)].slice(0, 5)))
    } catch {}
    router.push(`/recommend?q=${encodeURIComponent(q)}`)
  }

  return (
    <div style={{ maxWidth: '740px', margin: '0 auto', padding: '0 20px 60px' }}>
      {/* 顶部导航 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 0', marginBottom: '8px', borderBottom: '0.5px solid var(--color-border-tertiary)' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none', flexShrink: 0 }}>
          <WukongLogo size={28} />
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
            <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-primary)', fontFamily: 'var(--font-serif)' }}>GO悟空</span>
            <span style={{ fontSize: '10px', color: 'var(--color-text-tertiary)' }}>GoWuKong.co</span>
          </div>
        </Link>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: 'var(--color-background-secondary)', border: '0.5px solid var(--color-border-secondary)', borderRadius: '20px', padding: '6px 14px', gap: '8px' }}>
          <input value={newQ} onChange={e => setNewQ(e.target.value)} onKeyDown={e => e.key === 'Enter' && go()} style={{ flex: 1, border: 'none', background: 'transparent', fontSize: '13px', color: 'var(--color-text-primary)', outline: 'none', fontFamily: 'var(--font-sans)' }} />
          <button onClick={go} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', lineHeight: 1 }}>🔍</button>
        </div>
        <Link href="/tools/" style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', textDecoration: 'none', flexShrink: 0 }}>工具库</Link>
      </div>

      {loading ? <WukongLoader query={query} /> : (
        <>
          <div style={{ padding: '14px 0 10px' }}>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              根据「<strong style={{ color: 'var(--color-text-primary)' }}>{query.length > 30 ? query.slice(0, 30) + '...' : query}</strong>」识别为
              {sceneLabels.length > 0 && (
                <span style={{ display: 'inline-flex', gap: '4px', margin: '0 4px' }}>
                  {sceneLabels.map(l => (
                    <span key={l} style={{ fontSize: '11px', fontWeight: 500, background: '#FEF3C7', color: '#92400E', padding: '1px 7px', borderRadius: '4px' }}>{l}</span>
                  ))}
                </span>
              )}
              场景，为你匹配了 {combos.length} 套 AI 工具组合：
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', marginTop: '8px' }}>
            {combos.map((c, i) => <ComboCard key={c.id} combo={c} defaultOpen={i === 0} index={i} />)}
          </div>
          {combos.length >= 2 && <PriceBars combos={combos} />}
          <div style={{ marginTop: '20px', padding: '.9rem 1rem', textAlign: 'center', background: 'var(--color-background-secondary)', borderRadius: '12px', border: '0.5px solid var(--color-border-tertiary)' }}>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>想看更多工具详情或对比？</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/tools/" style={{ fontSize: '13px', color: '#D97706', fontWeight: 500, textDecoration: 'none' }}>浏览全部工具 →</Link>
              <span style={{ color: 'var(--color-text-tertiary)' }}>·</span>
              <Link href="/compare/" style={{ fontSize: '13px', color: '#D97706', fontWeight: 500, textDecoration: 'none' }}>工具横向对比 →</Link>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default function RecommendPage() {
  return (
    <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', fontSize: '32px' }}>🌀</div>}>
      <RecommendContent />
    </Suspense>
  )
}
