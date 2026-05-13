// ── 完整工具组合数据库（12大场景 × 3套方案 = 36套组合）──────

export interface ComboTool {
  name: string; logo: string; price: string; url: string
}
export interface ComboStep {
  phase: string; conn: 'or' | 'and'; tools: ComboTool[]
}
export interface ToolCombo {
  id: string; name: string; tagline: string
  tier: 'free' | 'mid' | 'pro'; isRec: boolean
  priceMin: number; priceMax: number
  steps: ComboStep[]; pros: string[]; why: string
  scenarios: string[]
}

const t = (name: string, logo: string, price: string, url: string): ComboTool =>
  ({ name, logo, price, url })

export const COMBOS_DB: Record<string, ToolCombo[]> = {

  // ══════════════════════════════════════════════════════
  // 短视频创作（video）
  // ══════════════════════════════════════════════════════
  video: [
    {
      id: 'v1', tier: 'mid', isRec: true,
      name: '豆包 + ElevenLabs + 剪映',
      tagline: '全流程贯通，30分钟出一条视频，基本免费',
      priceMin: 0, priceMax: 99,
      scenarios: ['短视频', '口播', '自媒体', '中英配音'],
      steps: [
        { phase: '脚本生成', conn: 'or', tools: [
          t('豆包', '🫘', '免费', 'https://www.doubao.com'),
          t('DeepSeek', '🐋', '免费', 'https://chat.deepseek.com'),
        ]},
        { phase: '中转英 + AI配音', conn: 'or', tools: [
          t('ElevenLabs', '🎙️', '$5/月', 'https://elevenlabs.io'),
          t('火山TTS', '🔊', '按量付费', 'https://www.volcengine.com/product/tts'),
        ]},
        { phase: '自动剪辑成片', conn: 'and', tools: [
          t('剪映专业版', '✂️', '免费', 'https://www.capcut.cn'),
        ]},
        { phase: '多平台分发', conn: 'or', tools: [
          t('蚁小二', '📱', '¥49/月', 'https://www.yixiaoer.cn'),
          t('万兴播爆', '🚀', '¥99/月', 'https://virbo.wondershare.cn'),
        ]},
      ],
      pros: ['上手简单', '基本免费', '全流程打通', '中文支持好'],
      why: '豆包/DeepSeek 免费生成中文脚本，ElevenLabs 一键克隆声音并翻译英文配音，剪映自动对齐字幕。整套流程最短 30 分钟出一条视频，月成本几乎为零，是刚起步自媒体人的最佳入门方案。',
    },
    {
      id: 'v2', tier: 'mid', isRec: false,
      name: 'Claude + HeyGen + Premiere',
      tagline: 'AI数字人口播，视频专业感更强',
      priceMin: 200, priceMax: 600,
      scenarios: ['数字人', '口播', '品牌', '多语言'],
      steps: [
        { phase: '脚本 + 翻译', conn: 'and', tools: [
          t('Claude 3.5', '🤖', '$20/月', 'https://claude.ai'),
        ]},
        { phase: 'AI数字人生成', conn: 'and', tools: [
          t('HeyGen', '🎭', '$29/月', 'https://www.heygen.com'),
        ]},
        { phase: '专业剪辑', conn: 'or', tools: [
          t('Premiere Pro', '🎞️', '¥168/月', 'https://www.adobe.com/products/premiere.html'),
          t('DaVinci Resolve', '✂️', '免费', 'https://www.blackmagicdesign.com/products/davinciresolve'),
        ]},
        { phase: '数据监测', conn: 'and', tools: [
          t('飞瓜数据', '📊', '¥199/月', 'https://www.feigua.io'),
        ]},
      ],
      pros: ['视频质感专业', 'AI数字人口播', '数据驱动', '真人声音克隆'],
      why: '适合有预算、追求高质量内容的创作者。HeyGen 可克隆真人形象做无限口播视频，Claude 保障脚本质量，飞瓜数据分析爆款规律。适合想做 IP 化运营的博主，有明确的变现路径。',
    },
    {
      id: 'v3', tier: 'pro', isRec: false,
      name: 'Midjourney + Runway + GPT-4o',
      tagline: '纯AI生成画面，视觉差异化极强',
      priceMin: 800, priceMax: 2000,
      scenarios: ['AI创意', '品牌宣传', '科技媒体', '无实拍'],
      steps: [
        { phase: 'AI图像素材', conn: 'and', tools: [
          t('Midjourney', '🎨', '$30/月', 'https://www.midjourney.com'),
        ]},
        { phase: 'AI视频生成', conn: 'or', tools: [
          t('Runway Gen-3', '🎥', '$35/月', 'https://runwayml.com'),
          t('可灵AI', '🦋', '¥399/月', 'https://klingai.kuaishou.com'),
        ]},
        { phase: '脚本 + 旁白', conn: 'and', tools: [
          t('GPT-4o', '💬', '$20/月', 'https://chat.openai.com'),
          t('ElevenLabs', '🎙️', '$22/月', 'https://elevenlabs.io'),
        ]},
        { phase: '后期合成', conn: 'and', tools: [
          t('After Effects', '✨', '¥168/月', 'https://www.adobe.com/products/aftereffects.html'),
        ]},
      ],
      pros: ['纯AI画面', '视觉差异化极强', '无需实拍', '科技感强'],
      why: '适合做 AI 创意内容、科技媒体、品牌宣传的专业团队。Midjourney 生成概念图，Runway/可灵 转化为视频，全程无需摄像机，视觉效果独特，在同类账号中辨识度极高。',
    },
  ],

  // ══════════════════════════════════════════════════════
  // 公众号运营（wechat）
  // ══════════════════════════════════════════════════════
  wechat: [
    {
      id: 'w1', tier: 'mid', isRec: true,
      name: 'Claude + 即梦AI + 135编辑器',
      tagline: '写稿配图排版一条龙，月成本不超200',
      priceMin: 20, priceMax: 200,
      scenarios: ['公众号', '文章', '图文', '排版'],
      steps: [
        { phase: '选题 + 写稿', conn: 'or', tools: [
          t('Claude 3.5', '🤖', '$20/月', 'https://claude.ai'),
          t('豆包', '🫘', '免费', 'https://www.doubao.com'),
        ]},
        { phase: 'AI配图生成', conn: 'or', tools: [
          t('即梦AI', '🌙', '免费', 'https://jimeng.jianying.com'),
          t('Midjourney', '🎨', '$10/月', 'https://www.midjourney.com'),
        ]},
        { phase: '排版 + 发布', conn: 'or', tools: [
          t('135编辑器', '📝', '免费', 'https://www.135editor.com'),
          t('Markdown Nice', '✍️', '免费', 'https://mdnice.com'),
        ]},
      ],
      pros: ['写作质量高', 'AI配图美观', '一键排版', '成本可控'],
      why: 'Claude 写的中文文章自然流畅无 AI 腔，即梦 AI 国内免费生图，135编辑器直接导入微信后台一键排版。熟练后一篇图文 2 小时搞定，月成本 20-200 元，是公众号运营的最优性价比方案。',
    },
    {
      id: 'w2', tier: 'free', isRec: false,
      name: 'Kimi + 文心一格 + 秀米',
      tagline: '零成本全免费，国内工具全程可用',
      priceMin: 0, priceMax: 0,
      scenarios: ['公众号', '免费', '新手', '国内'],
      steps: [
        { phase: '写稿 + 润色', conn: 'and', tools: [
          t('Kimi', '🌙', '免费', 'https://kimi.moonshot.cn'),
        ]},
        { phase: 'AI配图', conn: 'and', tools: [
          t('文心一格', '🎨', '免费', 'https://yige.baidu.com'),
        ]},
        { phase: '排版发布', conn: 'and', tools: [
          t('秀米', '✨', '免费', 'https://xiumi.us'),
        ]},
      ],
      pros: ['完全免费', '无需翻墙', '中文体验好', '上手简单'],
      why: '刚开始运营公众号、不想花钱试水的创作者的最佳起点。Kimi 长文处理能力强，文心一格国内免费生图，秀米是公众号排版神器，三者联动零成本跑通完整工作流。',
    },
    {
      id: 'w3', tier: 'pro', isRec: false,
      name: 'GPT-4o + DALL-E 3 + Notion AI',
      tagline: '内容质量顶级，适合有调性的品牌号',
      priceMin: 300, priceMax: 600,
      scenarios: ['品牌', '高质量', '内容管理', '团队协作'],
      steps: [
        { phase: '选题策划', conn: 'and', tools: [
          t('Perplexity', '🔍', '$20/月', 'https://www.perplexity.ai'),
        ]},
        { phase: '文章创作', conn: 'and', tools: [
          t('GPT-4o', '💬', '$20/月', 'https://chat.openai.com'),
        ]},
        { phase: '配图生成', conn: 'and', tools: [
          t('DALL-E 3', '🖼️', '含在ChatGPT', 'https://chat.openai.com'),
        ]},
        { phase: '内容管理', conn: 'and', tools: [
          t('Notion AI', '📋', '$10/月', 'https://www.notion.so'),
        ]},
      ],
      pros: ['内容质量顶级', '图文风格统一', '内容管理完善', '适合品牌号'],
      why: '追求内容调性和品牌一致性的公众号。Perplexity 联网找热门选题，GPT-4o 生成高质量内容，DALL-E 3 确保图片风格统一，Notion AI 管理内容日历和团队协作。',
    },
  ],

  // ══════════════════════════════════════════════════════
  // 跨境电商（ecommerce）
  // ══════════════════════════════════════════════════════
  ecommerce: [
    {
      id: 'e1', tier: 'mid', isRec: true,
      name: 'DeepSeek + Helium 10 + Tidio',
      tagline: '选品+翻译+客服全自动，ROI极高',
      priceMin: 50, priceMax: 300,
      scenarios: ['亚马逊', '选品', '翻译', '客服'],
      steps: [
        { phase: '市场选品分析', conn: 'and', tools: [
          t('Helium 10', '🔬', '$39/月', 'https://www.helium10.com'),
        ]},
        { phase: '产品描述翻译', conn: 'or', tools: [
          t('DeepSeek', '🐋', '免费', 'https://chat.deepseek.com'),
          t('ChatGPT', '💬', '$20/月', 'https://chat.openai.com'),
        ]},
        { phase: 'AI智能客服', conn: 'and', tools: [
          t('Tidio AI', '🤝', '$29/月', 'https://www.tidio.com'),
        ]},
        { phase: '广告文案', conn: 'and', tools: [
          t('Copy.ai', '✍️', '$49/月', 'https://www.copy.ai'),
        ]},
      ],
      pros: ['选品数据精准', '翻译质量高', '24小时客服', 'ROI高'],
      why: 'Helium 10 是亚马逊卖家必备选品工具，DeepSeek 免费翻译产品描述效果极好媲美 ChatGPT，Tidio AI 自动处理 80% 客服问题，Copy.ai 批量生成广告文案。月成本 50-300 元，ROI 极高。',
    },
    {
      id: 'e2', tier: 'free', isRec: false,
      name: 'DeepSeek + 豆包 + 国内免费工具',
      tagline: '零成本入门，适合刚起步的跨境卖家',
      priceMin: 0, priceMax: 0,
      scenarios: ['入门', '免费', '翻译', '文案'],
      steps: [
        { phase: '产品分析 + 文案', conn: 'and', tools: [
          t('DeepSeek', '🐋', '免费', 'https://chat.deepseek.com'),
        ]},
        { phase: '批量翻译', conn: 'and', tools: [
          t('豆包', '🫘', '免费', 'https://www.doubao.com'),
        ]},
        { phase: '竞品评论分析', conn: 'and', tools: [
          t('Kimi', '🌙', '免费', 'https://kimi.moonshot.cn'),
        ]},
      ],
      pros: ['完全免费', '国内直接用', '无需注册', '上手快'],
      why: '预算有限的跨境新手最佳入门方案。DeepSeek 翻译质量媲美 ChatGPT，豆包处理批量文案，Kimi 分析竞品买家评论找用户痛点。零成本验证选品，找到方向再升级工具。',
    },
    {
      id: 'e3', tier: 'pro', isRec: false,
      name: 'ChatGPT + Shopify + Klaviyo',
      tagline: '独立站全套AI自动化，成熟卖家升级方案',
      priceMin: 500, priceMax: 1500,
      scenarios: ['独立站', '邮件营销', '广告', '品牌化'],
      steps: [
        { phase: '内容营销', conn: 'and', tools: [
          t('ChatGPT', '💬', '$20/月', 'https://chat.openai.com'),
        ]},
        { phase: '独立站建设', conn: 'and', tools: [
          t('Shopify', '🛍️', '$39/月', 'https://www.shopify.com'),
        ]},
        { phase: '邮件营销自动化', conn: 'and', tools: [
          t('Klaviyo', '📧', '$30/月', 'https://www.klaviyo.com'),
        ]},
        { phase: '广告素材', conn: 'and', tools: [
          t('AdCreative.ai', '🎯', '$29/月', 'https://www.adcreative.ai'),
        ]},
      ],
      pros: ['全链路自动化', '邮件营销精准', '广告ROI高', '品牌化完善'],
      why: '有稳定销量、想做品牌化的成熟跨境卖家。Shopify + Klaviyo 是独立站标配，ChatGPT 批量生产内容，AdCreative.ai 自动生成高转化率广告素材，整套可实现高度自动化运营。',
    },
  ],

  // ══════════════════════════════════════════════════════
  // 独立开发（dev）
  // ══════════════════════════════════════════════════════
  dev: [
    {
      id: 'd1', tier: 'mid', isRec: true,
      name: 'Cursor + Claude + Vercel',
      tagline: 'AI辅助全栈开发，效率提升3倍',
      priceMin: 40, priceMax: 150,
      scenarios: ['全栈开发', 'MVP', 'SaaS', '独立开发'],
      steps: [
        { phase: '需求分析 + 架构', conn: 'and', tools: [
          t('Claude 3.5', '🤖', '$20/月', 'https://claude.ai'),
        ]},
        { phase: 'AI辅助编码', conn: 'and', tools: [
          t('Cursor', '⌨️', '$20/月', 'https://cursor.sh'),
        ]},
        { phase: '代码审查 + 测试', conn: 'or', tools: [
          t('GitHub Copilot', '🐙', '$10/月', 'https://github.com/features/copilot'),
          t('Codeium', '💚', '免费', 'https://codeium.com'),
        ]},
        { phase: '一键部署上线', conn: 'and', tools: [
          t('Vercel', '▲', '免费', 'https://vercel.com'),
        ]},
      ],
      pros: ['编码速度提升3倍', '一键部署', '成本极低', '全栈覆盖'],
      why: 'Cursor 是目前最好的 AI 编程 IDE，Claude 处理复杂逻辑和架构设计，Vercel 一键部署。这套组合让独立开发者生产效率提升 3 倍，¥150/月可以跑通一个 MVP，是性价比最高的独立开发方案。',
    },
    {
      id: 'd2', tier: 'free', isRec: false,
      name: 'VS Code + Codeium + GitHub',
      tagline: '全免费开发工作流，学生和业余开发者首选',
      priceMin: 0, priceMax: 0,
      scenarios: ['学习', '开源', '免费', '基础开发'],
      steps: [
        { phase: 'AI辅助编码', conn: 'and', tools: [
          t('VS Code + Codeium', '💚', '免费', 'https://codeium.com'),
        ]},
        { phase: '代码托管', conn: 'and', tools: [
          t('GitHub', '🐙', '免费', 'https://github.com'),
        ]},
        { phase: '自动化部署', conn: 'and', tools: [
          t('GitHub Actions', '⚙️', '免费', 'https://github.com/features/actions'),
          t('Vercel', '▲', '免费', 'https://vercel.com'),
        ]},
      ],
      pros: ['完全免费', '上手门槛低', 'CI/CD自动化', '社区资源丰富'],
      why: '学生、业余开发者或刚入门的独立开发者最佳起点。Codeium 免费 AI 补全媲美 Copilot，GitHub Actions 自动化 CI/CD，全套免费跑通完整开发流程，适合先学习再升级。',
    },
    {
      id: 'd3', tier: 'pro', isRec: false,
      name: 'Bolt.new + Claude + Supabase',
      tagline: '无需本地环境，浏览器全栈开发快速上线',
      priceMin: 50, priceMax: 200,
      scenarios: ['快速原型', '无环境', '全栈', '非技术创始人'],
      steps: [
        { phase: '全栈应用生成', conn: 'and', tools: [
          t('Bolt.new', '⚡', '$20/月', 'https://bolt.new'),
        ]},
        { phase: '复杂逻辑辅助', conn: 'and', tools: [
          t('Claude 3.5', '🤖', '$20/月', 'https://claude.ai'),
        ]},
        { phase: '数据库 + 后端', conn: 'and', tools: [
          t('Supabase', '🗄️', '免费起', 'https://supabase.com'),
        ]},
        { phase: '部署', conn: 'and', tools: [
          t('Vercel', '▲', '免费', 'https://vercel.com'),
        ]},
      ],
      pros: ['无需本地环境', '全栈能力', '快速验证想法', '非技术可上手'],
      why: '非技术创始人验证想法的最快路径。Bolt.new 在浏览器里生成完整应用代码，Claude 处理复杂业务逻辑，Supabase 提供免费数据库，Vercel 一键部署。一个周末可以上线一个 MVP。',
    },
  ],

  // ══════════════════════════════════════════════════════
  // AI绘画变现（painting）
  // ══════════════════════════════════════════════════════
  painting: [
    {
      id: 'p1', tier: 'mid', isRec: true,
      name: '即梦AI + Midjourney + Canva',
      tagline: '生图精修商用一条龙，月入过万可实现',
      priceMin: 10, priceMax: 100,
      scenarios: ['绘画', '变现', '商业', '设计'],
      steps: [
        { phase: '快速批量出图', conn: 'or', tools: [
          t('即梦AI', '🌙', '免费', 'https://jimeng.jianying.com'),
          t('文心一格', '🎨', '免费', 'https://yige.baidu.com'),
        ]},
        { phase: '高质量商业图', conn: 'and', tools: [
          t('Midjourney', '🎨', '$10/月', 'https://www.midjourney.com'),
        ]},
        { phase: '后期排版商用', conn: 'and', tools: [
          t('Canva', '🖌️', '免费/¥68/月', 'https://www.canva.com'),
        ]},
        { phase: '接单平台', conn: 'or', tools: [
          t('稿定设计', '📐', '免费', 'https://www.gaoding.com'),
          t('Etsy', '🛒', '按单收费', 'https://www.etsy.com'),
        ]},
      ],
      pros: ['出图速度快', '商业授权清晰', '变现路径明确', '成本极低'],
      why: '即梦 AI 免费积累素材，Midjourney 生成高质量商业图，Canva 快速排版做成成品，Etsy 卖给海外客户。已有大量人用这套工具实现月入过万，入门门槛低，学习曲线平缓。',
    },
    {
      id: 'p2', tier: 'free', isRec: false,
      name: '国内免费AI绘画工具组',
      tagline: '零成本体验AI绘画，新手入门首选',
      priceMin: 0, priceMax: 0,
      scenarios: ['入门', '免费', '国内', '个人'],
      steps: [
        { phase: '文生图', conn: 'or', tools: [
          t('即梦AI', '🌙', '免费', 'https://jimeng.jianying.com'),
          t('文心一格', '🎨', '免费', 'https://yige.baidu.com'),
          t('通义万相', '✨', '免费', 'https://tongyi.aliyun.com/wanxiang'),
        ]},
        { phase: '图片处理', conn: 'and', tools: [
          t('美图秀秀AI', '📸', '免费', 'https://www.meitu.com'),
        ]},
      ],
      pros: ['完全免费', '国内直连', '中文提示词', '无需科学上网'],
      why: '刚开始接触 AI 绘画、不确定是否继续的新手。即梦 AI、文心一格、通义万相都是国内免费工具，中文提示词效果好，零门槛体验 AI 绘画乐趣，找到感觉后再升级 Midjourney。',
    },
    {
      id: 'p3', tier: 'pro', isRec: false,
      name: 'Midjourney + Stable Diffusion + Photoshop AI',
      tagline: '专业级工作流，支持定制模型和批量商业出图',
      priceMin: 200, priceMax: 800,
      scenarios: ['专业', '定制模型', '批量', '商业服务'],
      steps: [
        { phase: '高质量概念图', conn: 'and', tools: [
          t('Midjourney', '🎨', '$30/月', 'https://www.midjourney.com'),
        ]},
        { phase: '本地定制 + 批量', conn: 'and', tools: [
          t('Stable Diffusion', '🌊', '免费开源', 'https://stability.ai'),
          t('ComfyUI', '⚙️', '免费', 'https://github.com/comfyanonymous/ComfyUI'),
        ]},
        { phase: '专业后期', conn: 'and', tools: [
          t('Photoshop AI', '🖌️', '¥168/月', 'https://www.adobe.com/products/photoshop.html'),
        ]},
      ],
      pros: ['完全可控', '支持LoRA微调', '批量商业出图', '专业服务'],
      why: '有技术基础、想做专业 AI 绘画商业服务的创作者。Midjourney 出高质量概念图，SD + ComfyUI 本地定制风格实现批量出图，Photoshop AI 精修细节。这套可以承接专业商业订单。',
    },
  ],

  // ══════════════════════════════════════════════════════
  // 播客制作（podcast）
  // ══════════════════════════════════════════════════════
  podcast: [
    {
      id: 'pk1', tier: 'mid', isRec: true,
      name: 'Descript + Claude + Buzzsprout',
      tagline: '录音剪辑字幕一体化，全平台自动分发',
      priceMin: 50, priceMax: 200,
      scenarios: ['播客', '录音', '字幕', '分发'],
      steps: [
        { phase: '节目策划 + 脚本', conn: 'and', tools: [
          t('Claude 3.5', '🤖', '$20/月', 'https://claude.ai'),
        ]},
        { phase: '录音 + 降噪 + 剪辑', conn: 'and', tools: [
          t('Descript', '🎧', '$24/月', 'https://www.descript.com'),
        ]},
        { phase: 'AI转写字幕', conn: 'and', tools: [
          t('Descript转写', '📝', '含在上方', 'https://www.descript.com'),
        ]},
        { phase: '多平台分发', conn: 'or', tools: [
          t('Buzzsprout', '📡', '$12/月', 'https://www.buzzsprout.com'),
          t('小宇宙', '🎧', '免费', 'https://www.xiaoyuzhoufm.com'),
        ]},
      ],
      pros: ['一体化工作流', '自动字幕', '全平台分发', '操作简单'],
      why: 'Descript 是播客制作神器，录音、降噪、转写字幕、剪辑一体化，Claude 策划节目和写脚本，Buzzsprout 自动分发到 Spotify、Apple Podcasts 等 20+ 平台，是效率最高的播客制作方案。',
    },
    {
      id: 'pk2', tier: 'free', isRec: false,
      name: 'Audacity + 讯飞听见 + 小宇宙',
      tagline: '全免费国内播客工具，零门槛起步',
      priceMin: 0, priceMax: 0,
      scenarios: ['国内', '免费', '中文播客', '新手'],
      steps: [
        { phase: '录音 + 剪辑', conn: 'and', tools: [
          t('Audacity', '🎵', '免费开源', 'https://www.audacityteam.org'),
        ]},
        { phase: 'AI转写字幕', conn: 'and', tools: [
          t('讯飞听见', '🎤', '免费有限额', 'https://www.iflyrec.com'),
        ]},
        { phase: '国内平台发布', conn: 'and', tools: [
          t('小宇宙', '🎧', '免费', 'https://www.xiaoyuzhoufm.com'),
        ]},
      ],
      pros: ['完全免费', '国内平台', '中文转写准', '无需翻墙'],
      why: '想做国内播客的创作者。Audacity 是专业级免费录音软件，讯飞听见中文转写准确率 95%+，小宇宙是国内最大播客平台，流量和社区氛围好，零成本起步测试内容方向。',
    },
    {
      id: 'pk3', tier: 'pro', isRec: false,
      name: 'Adobe Audition + ElevenLabs + Spotify',
      tagline: '专业音质国际发布，做双语播客首选',
      priceMin: 200, priceMax: 500,
      scenarios: ['专业', '国际', '双语', '品牌播客'],
      steps: [
        { phase: '专业录音混音', conn: 'and', tools: [
          t('Adobe Audition', '🎚️', '¥168/月', 'https://www.adobe.com/products/audition.html'),
        ]},
        { phase: 'AI语音克隆翻译', conn: 'and', tools: [
          t('ElevenLabs', '🎙️', '$22/月', 'https://elevenlabs.io'),
        ]},
        { phase: '国际平台发布', conn: 'and', tools: [
          t('Spotify for Podcasters', '💚', '免费', 'https://podcasters.spotify.com'),
          t('Apple Podcasts', '🎵', '免费', 'https://podcasters.apple.com'),
        ]},
      ],
      pros: ['专业音质', 'AI声音克隆', '国际受众', '双语内容'],
      why: '做高质量英文或双语播客、面向国际受众的创作者。Adobe Audition 专业混音，ElevenLabs 克隆你的声音做多语言版本，同步发布到 Spotify、Apple Podcasts 覆盖全球最大播客平台。',
    },
  ],

  // ══════════════════════════════════════════════════════
  // AI写作变现（writing）
  // ══════════════════════════════════════════════════════
  writing: [
    {
      id: 'wr1', tier: 'mid', isRec: true,
      name: 'Claude + 写作猫 + 秘塔AI搜索',
      tagline: 'AI辅助高质量写作，产量提升5倍',
      priceMin: 20, priceMax: 200,
      scenarios: ['写作', '内容', '自媒体', '新媒体'],
      steps: [
        { phase: '选题 + 素材收集', conn: 'and', tools: [
          t('秘塔AI搜索', '🔎', '免费', 'https://metaso.cn'),
        ]},
        { phase: '初稿生成', conn: 'or', tools: [
          t('Claude 3.5', '🤖', '$20/月', 'https://claude.ai'),
          t('豆包', '🫘', '免费', 'https://www.doubao.com'),
        ]},
        { phase: '校对 + 优化', conn: 'and', tools: [
          t('写作猫', '🐱', '¥98/年', 'https://xiezuocat.com'),
        ]},
        { phase: '分发变现', conn: 'or', tools: [
          t('公众号', '📱', '免费', 'https://mp.weixin.qq.com'),
          t('百家号', '🔷', '免费', 'https://baijiahao.baidu.com'),
        ]},
      ],
      pros: ['写作质量高', '产量提升5倍', '校对专业', '成本低'],
      why: '秘塔搜索无广告找素材，Claude 生成高质量初稿，写作猫专业中文校对和降重，发布到多平台获得流量变现。这套工具让单人写作产量提升 5 倍，是自由撰稿人和新媒体的最优方案。',
    },
    {
      id: 'wr2', tier: 'free', isRec: false,
      name: 'DeepSeek + Kimi + 免费平台',
      tagline: '零成本AI写作，学习写作的最佳起点',
      priceMin: 0, priceMax: 0,
      scenarios: ['免费', '新手', '学习', '个人'],
      steps: [
        { phase: '内容研究', conn: 'and', tools: [
          t('Kimi', '🌙', '免费', 'https://kimi.moonshot.cn'),
        ]},
        { phase: '写作生成', conn: 'and', tools: [
          t('DeepSeek', '🐋', '免费', 'https://chat.deepseek.com'),
        ]},
        { phase: '发布平台', conn: 'or', tools: [
          t('微信公众号', '📱', '免费', 'https://mp.weixin.qq.com'),
          t('知乎', '🔵', '免费', 'https://www.zhihu.com'),
          t('小红书', '📕', '免费', 'https://www.xiaohongshu.com'),
        ]},
      ],
      pros: ['完全免费', '国内直连', '无学习门槛', '平台流量大'],
      why: '刚开始学习 AI 辅助写作、零预算的新手。Kimi 研究资料，DeepSeek 写初稿，免费发布到微信、知乎、小红书，先建立内容感觉，找到方向后再投入付费工具。',
    },
    {
      id: 'wr3', tier: 'pro', isRec: false,
      name: 'GPT-4o + Jasper + Grammarly',
      tagline: '英文写作专业级，适合出海内容',
      priceMin: 100, priceMax: 400,
      scenarios: ['英文', '出海', '营销', 'SEO'],
      steps: [
        { phase: '内容策略', conn: 'and', tools: [
          t('Perplexity', '🔍', '$20/月', 'https://www.perplexity.ai'),
        ]},
        { phase: '英文写作', conn: 'or', tools: [
          t('GPT-4o', '💬', '$20/月', 'https://chat.openai.com'),
          t('Jasper', '📝', '$39/月', 'https://www.jasper.ai'),
        ]},
        { phase: '英文校对优化', conn: 'and', tools: [
          t('Grammarly', '📖', '$12/月', 'https://www.grammarly.com'),
        ]},
      ],
      pros: ['英文质量专业', 'SEO友好', '营销转化高', '出海必备'],
      why: '做英文内容、出海营销的创作者。Perplexity 研究英文市场，GPT-4o/Jasper 生成专业英文内容，Grammarly 确保语法无误，整套可以产出媲美母语者水平的英文营销内容。',
    },
  ],

  // ══════════════════════════════════════════════════════
  // PPT制作（ppt）
  // ══════════════════════════════════════════════════════
  ppt: [
    {
      id: 'pp1', tier: 'mid', isRec: true,
      name: 'Gamma + Claude + Canva',
      tagline: '一键生成设计精美PPT，30分钟搞定',
      priceMin: 8, priceMax: 50,
      scenarios: ['PPT', '演示', '商务', '快速制作'],
      steps: [
        { phase: '内容规划', conn: 'and', tools: [
          t('Claude 3.5', '🤖', '$20/月', 'https://claude.ai'),
        ]},
        { phase: 'AI生成PPT', conn: 'and', tools: [
          t('Gamma', '📊', '$8/月', 'https://gamma.app'),
        ]},
        { phase: '配图补充', conn: 'and', tools: [
          t('Canva', '🖌️', '免费', 'https://www.canva.com'),
        ]},
      ],
      pros: ['设计感极强', '30分钟搞定', '操作简单', '多格式导出'],
      why: 'Claude 先规划内容结构，Gamma AI 自动生成设计精美的 PPT，Canva 补充配图素材。30 分钟可以做出比手工做一天还好看的 PPT，适合所有需要快速出稿的商务场景。',
    },
    {
      id: 'pp2', tier: 'free', isRec: false,
      name: 'AiPPT + WPS AI',
      tagline: '国内全免费PPT制作，无需翻墙',
      priceMin: 0, priceMax: 35,
      scenarios: ['PPT', '国内', '免费', '学生'],
      steps: [
        { phase: 'AI生成PPT', conn: 'or', tools: [
          t('AiPPT', '📑', '免费起', 'https://www.aippt.cn'),
          t('WPS AI', '📄', '¥35/月', 'https://ai.wps.cn'),
        ]},
        { phase: '内容润色', conn: 'and', tools: [
          t('豆包', '🫘', '免费', 'https://www.doubao.com'),
        ]},
      ],
      pros: ['国内直连', '基本免费', '操作简单', '中文模板多'],
      why: '国内用户无法访问 Gamma 时的最佳替代。AiPPT 基础免费，WPS AI 深度整合 Office，豆包润色内容，整套国内直连，价格实惠，适合学生和基础商务场景。',
    },
    {
      id: 'pp3', tier: 'pro', isRec: false,
      name: 'Tome + Beautiful.ai + Midjourney',
      tagline: '投资人级别演示，讲故事视觉俱佳',
      priceMin: 50, priceMax: 200,
      scenarios: ['路演', '投资人', '品牌', '故事'],
      steps: [
        { phase: '叙事型PPT生成', conn: 'or', tools: [
          t('Tome', '📖', '$20/月', 'https://tome.app'),
          t('Beautiful.ai', '💎', '$12/月', 'https://www.beautiful.ai'),
        ]},
        { phase: '高质量图片', conn: 'and', tools: [
          t('Midjourney', '🎨', '$10/月', 'https://www.midjourney.com'),
        ]},
        { phase: '内容打磨', conn: 'and', tools: [
          t('Claude 3.5', '🤖', '$20/月', 'https://claude.ai'),
        ]},
      ],
      pros: ['叙事感强', '视觉冲击大', '投资人喜欢', '动效丰富'],
      why: '做融资路演、品牌演示的创业者。Tome 生成叙事型演示，Midjourney 提供震撼的视觉素材，Claude 打磨每一页的叙述逻辑。这套工具产出的 PPT 能让投资人眼前一亮。',
    },
  ],

  // ══════════════════════════════════════════════════════
  // AI音乐创作（music）
  // ══════════════════════════════════════════════════════
  music: [
    {
      id: 'mu1', tier: 'mid', isRec: true,
      name: 'Suno + ElevenLabs + 剪映',
      tagline: '从歌词到带配乐视频，全流程AI音乐创作',
      priceMin: 13, priceMax: 50,
      scenarios: ['音乐', '歌曲', '配乐', '视频'],
      steps: [
        { phase: '生成完整歌曲', conn: 'or', tools: [
          t('Suno v4', '🎵', '$8/月', 'https://suno.com'),
          t('Udio', '🎶', '$10/月', 'https://www.udio.com'),
        ]},
        { phase: '声音克隆演唱', conn: 'and', tools: [
          t('ElevenLabs', '🎙️', '$5/月', 'https://elevenlabs.io'),
        ]},
        { phase: '制作音乐MV', conn: 'and', tools: [
          t('剪映专业版', '✂️', '免费', 'https://www.capcut.cn'),
        ]},
      ],
      pros: ['30分钟出完整歌曲', '声音可定制', '可做MV', '成本极低'],
      why: 'Suno/Udio 生成带人声的完整歌曲，ElevenLabs 替换成你的声音，剪映制作成 MV 发布到抖音。整个流程一个人 30 分钟完成，月成本不超 50 元，AI 音乐变现新赛道。',
    },
    {
      id: 'mu2', tier: 'free', isRec: false,
      name: 'Suno免费版 + 即梦AI',
      tagline: '完全免费体验AI音乐创作',
      priceMin: 0, priceMax: 0,
      scenarios: ['音乐', '免费', '体验', '新手'],
      steps: [
        { phase: '生成歌曲', conn: 'and', tools: [
          t('Suno免费版', '🎵', '免费50积分/天', 'https://suno.com'),
        ]},
        { phase: 'MV配图', conn: 'and', tools: [
          t('即梦AI', '🌙', '免费', 'https://jimeng.jianying.com'),
        ]},
      ],
      pros: ['完全免费', '无需技术', '快速出成果', '趣味强'],
      why: '对 AI 音乐感兴趣但不想付费的用户。Suno 免费版每天 50 积分可以生成几首歌，即梦 AI 配上 MV 画面，可以分享到社媒感受 AI 音乐的乐趣，找到兴趣后再升级付费。',
    },
    {
      id: 'mu3', tier: 'pro', isRec: false,
      name: 'Udio Pro + Runway + Adobe Audition',
      tagline: '专业AI音乐制作，用于商业项目',
      priceMin: 200, priceMax: 600,
      scenarios: ['专业', '商业', '广告配乐', '游戏音乐'],
      steps: [
        { phase: '专业音乐生成', conn: 'and', tools: [
          t('Udio Pro', '🎶', '$30/月', 'https://www.udio.com'),
        ]},
        { phase: 'AI视频生成', conn: 'and', tools: [
          t('Runway Gen-3', '🎥', '$35/月', 'https://runwayml.com'),
        ]},
        { phase: '专业混音后期', conn: 'and', tools: [
          t('Adobe Audition', '🎚️', '¥168/月', 'https://www.adobe.com/products/audition.html'),
        ]},
      ],
      pros: ['音质专业', '商业可授权', '视觉内容完整', '专业控制'],
      why: '需要为商业项目制作 AI 音乐的专业人士。Udio Pro 提供精细风格控制和专业音质，Runway 生成对应视觉内容，Adobe Audition 专业混音，整套可用于广告、游戏、品牌配乐。',
    },
  ],

  // ══════════════════════════════════════════════════════
  // 知识管理（knowledge）
  // ══════════════════════════════════════════════════════
  knowledge: [
    {
      id: 'kn1', tier: 'mid', isRec: true,
      name: 'Notion AI + Kimi + 秘塔搜索',
      tagline: 'AI辅助个人知识管理，学习效率倍增',
      priceMin: 20, priceMax: 100,
      scenarios: ['知识管理', '学习', '笔记', '研究'],
      steps: [
        { phase: '信息收集研究', conn: 'and', tools: [
          t('秘塔AI搜索', '🔎', '免费', 'https://metaso.cn'),
        ]},
        { phase: '长文档处理', conn: 'and', tools: [
          t('Kimi', '🌙', '免费', 'https://kimi.moonshot.cn'),
        ]},
        { phase: '知识库整理', conn: 'and', tools: [
          t('Notion AI', '📋', '$10/月', 'https://www.notion.so'),
        ]},
      ],
      pros: ['信息组织高效', '长文档处理强', '知识可检索', '协作方便'],
      why: '秘塔搜索无广告找资料，Kimi 处理超长 PDF 和报告，Notion AI 整理成可检索的知识库。这套工具让个人学习效率提升 3-5 倍，是研究者、学生、知识工作者的最优方案。',
    },
    {
      id: 'kn2', tier: 'free', isRec: false,
      name: 'Kimi + DeepSeek + 语雀',
      tagline: '全免费知识管理，国内工具全程可用',
      priceMin: 0, priceMax: 0,
      scenarios: ['免费', '国内', '笔记', '学习'],
      steps: [
        { phase: 'AI阅读总结', conn: 'and', tools: [
          t('Kimi', '🌙', '免费', 'https://kimi.moonshot.cn'),
        ]},
        { phase: 'AI问答分析', conn: 'and', tools: [
          t('DeepSeek', '🐋', '免费', 'https://chat.deepseek.com'),
        ]},
        { phase: '知识整理存储', conn: 'and', tools: [
          t('语雀', '🦆', '免费', 'https://www.yuque.com'),
        ]},
      ],
      pros: ['完全免费', '国内直连', '中文支持好', '无学习成本'],
      why: '国内用户零成本搭建个人知识管理系统。Kimi 阅读和总结长文档，DeepSeek 深度分析问题，语雀整理笔记（阿里旗下免费协作文档），全套国内直连，无需翻墙。',
    },
    {
      id: 'kn3', tier: 'pro', isRec: false,
      name: 'Dify + Claude + Obsidian',
      tagline: '打造私有AI知识库，企业级知识管理',
      priceMin: 50, priceMax: 300,
      scenarios: ['企业', '私有化', '知识库', 'RAG'],
      steps: [
        { phase: '私有知识库搭建', conn: 'and', tools: [
          t('Dify', '⚙️', '免费自部署', 'https://dify.ai'),
        ]},
        { phase: 'AI问答引擎', conn: 'and', tools: [
          t('Claude API', '🤖', 'API按量', 'https://claude.ai'),
        ]},
        { phase: '个人笔记管理', conn: 'and', tools: [
          t('Obsidian', '💎', '免费', 'https://obsidian.md'),
        ]},
      ],
      pros: ['数据私有安全', '知识问答精准', '双链笔记', '可扩展'],
      why: '需要私有化 AI 知识库的团队或重度知识工作者。Dify 部署私有知识库问答系统，Claude API 提供最强 AI 能力，Obsidian 管理个人双链笔记，三者结合打造终极知识管理系统。',
    },
  ],

  // ══════════════════════════════════════════════════════
  // 直播带货（livestream）
  // ══════════════════════════════════════════════════════
  livestream: [
    {
      id: 'ls1', tier: 'mid', isRec: true,
      name: '豆包 + 飞瓜数据 + 剪映',
      tagline: 'AI话术+数据选品+视频素材，直播效率翻倍',
      priceMin: 100, priceMax: 400,
      scenarios: ['直播', '带货', '选品', '话术'],
      steps: [
        { phase: '选品数据分析', conn: 'and', tools: [
          t('飞瓜数据', '🍉', '¥99/月', 'https://www.feigua.io'),
        ]},
        { phase: 'AI直播话术生成', conn: 'and', tools: [
          t('豆包', '🫘', '免费', 'https://www.doubao.com'),
        ]},
        { phase: '预热短视频制作', conn: 'and', tools: [
          t('剪映专业版', '✂️', '免费', 'https://www.capcut.cn'),
        ]},
        { phase: '直播数据复盘', conn: 'and', tools: [
          t('飞瓜数据', '🍉', '含在上方', 'https://www.feigua.io'),
        ]},
      ],
      pros: ['选品有数据支撑', 'AI话术专业', '预热视频高效', '数据驱动复盘'],
      why: '飞瓜数据找到当前爆款选品，豆包生成专业直播话术和商品卖点，剪映快速制作预热短视频拉流量，直播结束后飞瓜复盘数据。数据+AI话术让带货转化率显著提升。',
    },
    {
      id: 'ls2', tier: 'free', isRec: false,
      name: 'DeepSeek + 豆包 + 剪映',
      tagline: '零成本AI辅助直播，新主播入门方案',
      priceMin: 0, priceMax: 0,
      scenarios: ['免费', '新手', '直播', '话术'],
      steps: [
        { phase: 'AI话术生成', conn: 'or', tools: [
          t('DeepSeek', '🐋', '免费', 'https://chat.deepseek.com'),
          t('豆包', '🫘', '免费', 'https://www.doubao.com'),
        ]},
        { phase: '短视频预热', conn: 'and', tools: [
          t('剪映专业版', '✂️', '免费', 'https://www.capcut.cn'),
        ]},
      ],
      pros: ['完全免费', '话术有质量', '预热视频好做', '零门槛'],
      why: '刚开始做直播带货、没有预算的新主播。DeepSeek/豆包 生成专业商品话术和互动话术，剪映做预热短视频，零成本试水找到适合自己的直播风格后再投入数据工具。',
    },
    {
      id: 'ls3', tier: 'pro', isRec: false,
      name: 'HeyGen + 可灵AI + 飞瓜数据',
      tagline: 'AI虚拟主播+数据选品，7×24小时无人直播',
      priceMin: 500, priceMax: 1500,
      scenarios: ['AI主播', '无人直播', '规模化', '品牌'],
      steps: [
        { phase: '数据选品', conn: 'and', tools: [
          t('飞瓜数据', '🍉', '¥399/月', 'https://www.feigua.io'),
        ]},
        { phase: 'AI虚拟主播生成', conn: 'and', tools: [
          t('HeyGen', '🎭', '$89/月', 'https://www.heygen.com'),
        ]},
        { phase: '直播背景视频素材', conn: 'and', tools: [
          t('可灵AI', '🦋', '¥399/月', 'https://klingai.kuaishou.com'),
        ]},
      ],
      pros: ['7x24无人直播', '规模化复制', '无需真人出镜', '数据精准'],
      why: '有资金规模化运营的直播团队。HeyGen 克隆真人主播形象实现 AI 虚拟主播，可灵 AI 生成直播背景视频素材，飞瓜数据精准选品，整套可以实现多账号、多商品、24 小时无人直播。',
    },
  ],

  // ══════════════════════════════════════════════════════
  // AI Agent自动化（agent）
  // ══════════════════════════════════════════════════════
  agent: [
    {
      id: 'ag1', tier: 'mid', isRec: true,
      name: '扣子 + Zapier + Claude',
      tagline: '无代码搭建AI自动化工作流，效率革命',
      priceMin: 20, priceMax: 100,
      scenarios: ['自动化', '工作流', '无代码', 'Bot'],
      steps: [
        { phase: '搭建AI Bot', conn: 'and', tools: [
          t('扣子（Coze）', '🤖', '免费', 'https://www.coze.cn'),
        ]},
        { phase: '应用集成自动化', conn: 'and', tools: [
          t('Zapier', '🔗', '$20/月', 'https://zapier.com'),
        ]},
        { phase: 'AI决策引擎', conn: 'and', tools: [
          t('Claude API', '🤖', 'API按量', 'https://claude.ai'),
        ]},
      ],
      pros: ['无代码搭建', '7000+应用集成', 'AI智能决策', '效率大幅提升'],
      why: '无代码搭建 AI 工作流的最快方案。扣子搭建 AI Bot，Zapier 连接 7000+ 应用实现自动化触发，Claude API 提供 AI 决策能力，三者组合可以自动化 80% 的重复性工作。',
    },
    {
      id: 'ag2', tier: 'free', isRec: false,
      name: '扣子 + 豆包',
      tagline: '完全免费搭建AI机器人，国内直连',
      priceMin: 0, priceMax: 0,
      scenarios: ['免费', '国内', 'Bot', '聊天机器人'],
      steps: [
        { phase: '搭建Bot', conn: 'and', tools: [
          t('扣子（Coze）', '🤖', '免费', 'https://www.coze.cn'),
        ]},
        { phase: '发布渠道', conn: 'or', tools: [
          t('豆包', '🫘', '免费', 'https://www.doubao.com'),
          t('飞书', '📱', '免费', 'https://www.feishu.cn'),
        ]},
      ],
      pros: ['完全免费', '国内直连', '发布渠道多', '无代码'],
      why: '想体验 AI Agent 但不想付费的用户。扣子完全免费搭建 AI Bot，发布到豆包、飞书等字节系平台，零成本体验 AI 自动化，找到有价值的使用场景后再升级付费工具。',
    },
    {
      id: 'ag3', tier: 'pro', isRec: false,
      name: 'Dify + Claude + Supabase + Vercel',
      tagline: '私有化部署AI Agent平台，企业级方案',
      priceMin: 100, priceMax: 500,
      scenarios: ['企业', '私有化', '定制', 'Agent平台'],
      steps: [
        { phase: 'AI工作流平台', conn: 'and', tools: [
          t('Dify', '⚙️', '免费自部署', 'https://dify.ai'),
        ]},
        { phase: 'AI引擎', conn: 'and', tools: [
          t('Claude API', '🤖', 'API按量', 'https://claude.ai'),
          t('DeepSeek API', '🐋', 'API极便宜', 'https://platform.deepseek.com'),
        ]},
        { phase: '数据存储', conn: 'and', tools: [
          t('Supabase', '🗄️', '免费起', 'https://supabase.com'),
        ]},
        { phase: '前端部署', conn: 'and', tools: [
          t('Vercel', '▲', '免费', 'https://vercel.com'),
        ]},
      ],
      pros: ['数据私有安全', '完全可定制', '成本可控', '企业级稳定'],
      why: '需要私有化 AI Agent 平台的技术团队。Dify 提供完整的 LLM 应用开发框架，Claude/DeepSeek API 提供 AI 能力，Supabase 存储数据，Vercel 部署前端，整套可以构建任何 AI 应用。',
    },
  ],
}

// ── 场景关键词匹配 ────────────────────────────────────────
export function matchScene(q: string): string {
  const lower = q.toLowerCase()
  if (/视频|剪辑|口播|短片|tiktok|抖音|youtube|vlog|成片/.test(lower)) return 'video'
  if (/公众号|写文章|写稿|图文|微信推文/.test(lower)) return 'wechat'
  if (/电商|亚马逊|跨境|选品|shopify|独立站|listing/.test(lower)) return 'ecommerce'
  if (/开发|写代码|编程|上线|app|网站|程序|软件|saas/.test(lower)) return 'dev'
  if (/绘画|生图|ai图|画图|midjourney|配图|插画|设计图/.test(lower)) return 'painting'
  if (/播客|podcast|录音|音频/.test(lower)) return 'podcast'
  if (/写作|文章|内容创作|自媒体|博客|专栏/.test(lower)) return 'writing'
  if (/ppt|演示|幻灯片|汇报|路演|pitch/.test(lower)) return 'ppt'
  if (/音乐|歌曲|作曲|配乐|歌词/.test(lower)) return 'music'
  if (/知识|学习|笔记|研究|整理|知识库/.test(lower)) return 'knowledge'
  if (/直播|带货|主播|话术|卖货/.test(lower)) return 'livestream'
  if (/agent|自动化|机器人|bot|工作流/.test(lower)) return 'agent'
  return 'video'
}

export function getCombos(scene: string): ToolCombo[] {
  return COMBOS_DB[scene] || COMBOS_DB.video
}

export const SCENE_LABELS: Record<string, string> = {
  video: '短视频创作', wechat: '公众号运营', ecommerce: '跨境电商',
  dev: '独立开发', painting: 'AI绘画变现', podcast: '播客制作',
  writing: 'AI写作', ppt: 'PPT制作', music: 'AI音乐',
  knowledge: '知识管理', livestream: '直播带货', agent: 'AI自动化',
}
