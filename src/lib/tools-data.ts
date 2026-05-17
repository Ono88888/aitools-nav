// ── 完整AI工具数据库（80+工具，12大分类）────────────────────

export interface PricePlanSimple {
  name: string      // '免费版' | 'Pro版' | 'Team版'
  price: string     // '0' | '$20' | '¥99'
  period: string    // '/月' | '/年' | '一次性'
  features: string[]
  highlight?: boolean
}

export interface TutorialVideo {
  title: string
  url: string
  platform: 'bilibili' | 'youtube'
  duration?: string   // '10分钟'
  level: 'beginner' | 'advanced'
}

export interface Tool {
  slug: string
  name: string
  maker: string
  logo: string
  category: string
  tagline: string
  desc: string
  price: string
  priceDetail: string
  pricePlans?: PricePlanSimple[]   // 结构化定价
  hasFree: boolean
  hasApi: boolean
  cnAccess: boolean
  difficulty?: 1|2|3|4|5          // 上手难度（可选，默认2）
  rating: number
  ratingCount?: number             // 评分人数
  url: string
  affiliateUrl?: string
  tags: string[]
  features: string[]
  pros: string[]
  cons: string[]
  bestFor: string
  tutorials?: TutorialVideo[]      // 入门教程视频
  useCases?: string[]              // 典型使用场景
  compareWith?: string[]           // 常见竞品slug
  updatedAt?: string               // 数据更新时间
}

export const ALL_TOOLS: Tool[] = [

  // ══════════════════════════════════════════════════════
  // 1. AI对话 & 助手
  // ══════════════════════════════════════════════════════
  {
    slug: 'chatgpt', name: 'ChatGPT', maker: 'OpenAI', logo: '💬',
    category: 'AI对话', tagline: '全球最广泛使用的AI助手',
    desc: 'OpenAI 开发的对话式 AI，支持文字、图片、代码、分析等多模态任务，GPT-4o 是目前综合能力最强的模型之一。',
    price: '免费/付费', priceDetail: '免费版有限额；Plus $20/月；Team $30/人/月',
    hasFree: true, hasApi: true, cnAccess: false, rating: 4.8,
    url: 'https://chat.openai.com',
    tags: ['对话', '写作', '代码', '分析', '图像理解'],
    features: ['GPT-4o多模态', '代码解释器', 'DALL-E 3生图', 'Plugins插件生态', '语音对话'],
    pros: ['综合能力顶级', '生态最完善', '插件丰富'],
    cons: ['需要翻墙', '付费较贵', '有速率限制'],
    bestFor: '需要高质量AI辅助的专业用户',
  },
  {
    slug: 'claude', name: 'Claude', maker: 'Anthropic', logo: '🤖',
    category: 'AI对话', tagline: '最擅长长文本理解和写作的AI',
    desc: 'Anthropic 开发，以安全性和长文本处理见长。Claude 3.5 Sonnet 在写作、分析、代码方面表现优异，支持 200K token 超长上下文。',
    price: '免费/付费', priceDetail: '免费版有限额；Pro $20/月；API按量计费',
    hasFree: true, hasApi: true, cnAccess: false, rating: 4.8,
    url: 'https://claude.ai',
    tags: ['写作', '长文本', '代码', '分析', '对话'],
    features: ['200K超长上下文', '优秀的写作能力', 'Artifacts功能', '代码生成', '文件分析'],
    pros: ['写作质量最高', '长文本处理最强', '安全性好'],
    cons: ['需要翻墙', '图像生成需第三方'],
    bestFor: '写作者、研究人员、需要处理长文档的用户',
  },
  {
    slug: 'gemini', name: 'Gemini', maker: 'Google', logo: '✨',
    category: 'AI对话', tagline: 'Google出品，深度整合搜索和生产力工具',
    desc: 'Google 最新 AI 模型，Gemini 1.5 Pro 支持百万级 token 上下文，与 Google 生产力套件深度集成，联网搜索能力强。',
    price: '免费/付费', priceDetail: '免费版；Advanced $19.99/月（含Workspace集成）',
    hasFree: true, hasApi: true, cnAccess: false, rating: 4.5,
    url: 'https://gemini.google.com',
    tags: ['对话', '搜索', '分析', 'Google集成'],
    features: ['百万token上下文', '实时联网搜索', 'Google Workspace集成', '多模态理解', '代码生成'],
    pros: ['联网能力强', 'Google生态集成', '上下文超长'],
    cons: ['需要翻墙', '中文优化不足'],
    bestFor: 'Google生态用户、需要实时信息的场景',
  },
  {
    slug: 'deepseek', name: 'DeepSeek', maker: 'DeepSeek', logo: '🐋',
    category: 'AI对话', tagline: '国产顶级AI，性能媲美GPT-4，完全免费',
    desc: '深度求索开发，DeepSeek-V3 和 R1 在推理、数学、代码领域达到国际顶级水平，国内免费使用，API价格极低。',
    price: '免费', priceDetail: '完全免费；API：输入¥1/百万token（极便宜）',
    hasFree: true, hasApi: true, cnAccess: true, rating: 4.7,
    url: 'https://chat.deepseek.com',
    tags: ['对话', '推理', '代码', '数学', '免费'],
    features: ['强推理能力', '数学/代码顶级', 'API极便宜', '国内直连', '长思考模式'],
    pros: ['完全免费', '推理能力强', '国内可用', 'API极便宜'],
    cons: ['图像生成不支持', '有时响应慢'],
    bestFor: '国内用户的首选免费AI，开发者首选API',
  },
  {
    slug: 'doubao', name: '豆包', maker: '字节跳动', logo: '🫘',
    category: 'AI对话', tagline: '字节出品，中文体验最好的AI助手',
    desc: '字节跳动旗下 AI 产品，支持对话、写作、绘图、语音，中文理解优秀，与抖音生态打通，适合内容创作者。',
    price: '免费', priceDetail: '基础功能完全免费；会员¥19.9/月解锁更多功能',
    hasFree: true, hasApi: false, cnAccess: true, rating: 4.4,
    url: 'https://www.doubao.com',
    tags: ['对话', '写作', '绘图', '语音', '免费'],
    features: ['中文写作优化', 'AI生图', '语音对话', '多角色扮演', '内容创作'],
    pros: ['完全免费', '中文体验好', '国内直连', '功能全面'],
    cons: ['API暂不开放', '专业能力弱于GPT-4'],
    bestFor: '中文内容创作者、普通用户日常使用',
  },
  {
    slug: 'kimi', name: 'Kimi', maker: '月之暗面', logo: '🌙',
    category: 'AI对话', tagline: '超长文本处理专家，支持200万字',
    desc: '月之暗面开发，以超长文本处理著称，支持上传 PDF、Word 等文件，一次处理 200 万字，适合研究和文档分析。',
    price: '免费/付费', priceDetail: '基础免费；Pro ¥99/月解锁更多额度',
    hasFree: true, hasApi: true, cnAccess: true, rating: 4.4,
    url: 'https://kimi.moonshot.cn',
    tags: ['长文本', '文档分析', 'PDF处理', '搜索'],
    features: ['200万字超长上下文', '文档上传分析', '联网搜索', '多文件对比', '智能摘要'],
    pros: ['长文本最强', '文档处理好', '国内直连'],
    cons: ['写作创意性一般', '速度有时慢'],
    bestFor: '需要处理长文档、研究报告的用户',
  },
  {
    slug: 'tongyi', name: '通义千问', maker: '阿里云', logo: '🔶',
    category: 'AI对话', tagline: '阿里出品，全模态AI，企业级可靠',
    desc: '阿里云开发的 AI 大模型，支持文字、图像、音频多模态，与阿里云生态深度整合，提供企业级 API 服务。',
    price: '免费/付费', priceDetail: '基础免费；API按量计费，新用户有免费额度',
    hasFree: true, hasApi: true, cnAccess: true, rating: 4.3,
    url: 'https://tongyi.aliyun.com',
    tags: ['对话', '多模态', '企业', 'API'],
    features: ['多模态理解', '企业级API', '阿里云集成', '长文档处理', '多语言支持'],
    pros: ['企业可靠性高', '国内直连', 'API生态完善'],
    cons: ['创意写作较弱', '界面不如竞品'],
    bestFor: '企业用户、阿里云生态用户',
  },
  {
    slug: 'wenxin', name: '文心一言', maker: '百度', logo: '🔷',
    category: 'AI对话', tagline: '百度AI，国内SEO内容创作首选',
    desc: '百度开发的 AI 大模型，与百度搜索深度整合，擅长中文内容创作和 SEO 优化，百度生态用户优先选择。',
    price: '免费/付费', priceDetail: '基础免费；专业版¥49.9/月',
    hasFree: true, hasApi: true, cnAccess: true, rating: 4.1,
    url: 'https://yiyan.baidu.com',
    tags: ['对话', '写作', '搜索', 'SEO'],
    features: ['百度搜索整合', 'SEO内容优化', '中文写作', '知识图谱', '文档生成'],
    pros: ['国内直连', '百度生态', 'SEO优化好'],
    cons: ['综合能力弱于竞品', '创意性不足'],
    bestFor: '百度生态用户、SEO内容创作',
  },
  {
    slug: 'grok', name: 'Grok', maker: 'xAI', logo: '🚀',
    category: 'AI对话', tagline: '马斯克旗下AI，实时推特数据，无审查',
    desc: 'xAI 开发，与 X（Twitter）深度整合，可实时获取推特信息，风格幽默直接，Grok-2 在创意写作方面表现突出。',
    price: '付费', priceDetail: 'X Premium+ $16/月起',
    hasFree: false, hasApi: true, cnAccess: false, rating: 4.3,
    url: 'https://grok.x.ai',
    tags: ['对话', '实时信息', '创意', 'X整合'],
    features: ['实时推特数据', '无内容审查', '创意写作强', '幽默风格', 'API开放'],
    pros: ['实时信息获取', '创意性强', '无审查限制'],
    cons: ['需要X订阅', '需要翻墙'],
    bestFor: 'X用户、需要实时信息的用户',
  },
  {
    slug: 'zhipu', name: '智谱清言', maker: '智谱AI', logo: '🧠',
    category: 'AI对话', tagline: '清华系AI，学术研究和专业分析强',
    desc: '智谱 AI 开发，GLM-4 模型，学术背景深厚，擅长逻辑推理和专业分析，提供完整 API 服务，价格实惠。',
    price: '免费/付费', priceDetail: '基础免费；API按量计费，价格实惠',
    hasFree: true, hasApi: true, cnAccess: true, rating: 4.2,
    url: 'https://chatglm.cn',
    tags: ['对话', '学术', '分析', 'API'],
    features: ['逻辑推理强', '学术分析', 'API完善', '多轮对话', '代码生成'],
    pros: ['国内直连', 'API价格低', '学术能力强'],
    cons: ['创意写作一般', '知名度较低'],
    bestFor: '学术研究者、需要低价API的开发者',
  },
  {
    slug: 'mistral', name: 'Mistral AI', maker: 'Mistral', logo: '🌬️',
    category: 'AI对话', tagline: '欧洲顶级开源AI，隐私友好',
    desc: '法国 Mistral 开发的开源大模型，Mistral Large 性能媲美 GPT-4，完全开源，隐私保护好，API 价格低。',
    price: '免费/付费', priceDetail: 'API：$2/百万token（便宜）；开源版免费部署',
    hasFree: true, hasApi: true, cnAccess: false, rating: 4.4,
    url: 'https://mistral.ai',
    tags: ['开源', 'API', '隐私', '欧洲'],
    features: ['完全开源', '低价API', '隐私保护', '多语言', '可本地部署'],
    pros: ['开源可控', 'API便宜', '隐私好'],
    cons: ['中文优化不足', '知名度低'],
    bestFor: '开发者、注重隐私的企业用户',
  },

  // ══════════════════════════════════════════════════════
  // 2. AI搜索
  // ══════════════════════════════════════════════════════
  {
    slug: 'perplexity', name: 'Perplexity', maker: 'Perplexity AI', logo: '🔍',
    category: 'AI搜索', tagline: '最好用的AI搜索引擎，实时联网有来源',
    desc: '将 AI 与实时搜索结合，回答问题时显示来源链接，研究效率比传统搜索高 5 倍，Pro 版可选择不同 AI 模型。',
    price: '免费/付费', priceDetail: '免费版每日限量；Pro $20/月无限制',
    hasFree: true, hasApi: true, cnAccess: false, rating: 4.6,
    url: 'https://www.perplexity.ai',
    tags: ['搜索', '研究', '实时信息', '引用来源'],
    features: ['实时联网搜索', '来源引用', '多模型选择', '文件上传分析', '对话式搜索'],
    pros: ['搜索质量最高', '来源可信', '研究效率高'],
    cons: ['需要翻墙', '中文覆盖弱'],
    bestFor: '研究人员、内容创作者、需要实时信息的用户',
  },
  {
    slug: 'metaso', name: '秘塔AI搜索', maker: '秘塔科技', logo: '🔎',
    category: 'AI搜索', tagline: '国内最好的AI搜索，无广告有来源',
    desc: '国内最好的 AI 搜索工具，无广告、有来源引用，支持学术搜索模式，是百度搜索的优质替代品。',
    price: '免费', priceDetail: '完全免费',
    hasFree: true, hasApi: false, cnAccess: true, rating: 4.5,
    url: 'https://metaso.cn',
    tags: ['搜索', '国内', '免费', '无广告'],
    features: ['无广告搜索', '来源引用', '学术模式', '国内直连', '深度搜索'],
    pros: ['完全免费', '国内直连', '无广告', '来源可信'],
    cons: ['英文信息弱于Perplexity'],
    bestFor: '国内用户的Google/百度替代品',
  },
  {
    slug: 'phind', name: 'Phind', maker: 'Phind', logo: '👨‍💻',
    category: 'AI搜索', tagline: '专为开发者设计的AI搜索引擎',
    desc: '专注于技术和代码的 AI 搜索，理解编程问题，搜索结果优先展示技术文档和 GitHub，开发者效率神器。',
    price: '免费/付费', priceDetail: '免费版有限额；Pro $20/月',
    hasFree: true, hasApi: false, cnAccess: false, rating: 4.4,
    url: 'https://www.phind.com',
    tags: ['搜索', '开发', '代码', '技术'],
    features: ['代码搜索优化', 'GitHub整合', '技术文档优先', '多语言代码', '开发者工作流'],
    pros: ['开发者体验最好', '代码理解准确'],
    cons: ['非技术内容弱', '需要翻墙'],
    bestFor: '程序员、技术开发者',
  },
  {
    slug: 'you', name: 'You.com', maker: 'You.com', logo: '🌐',
    category: 'AI搜索', tagline: '可定制AI搜索，隐私保护强',
    desc: '可定制化 AI 搜索引擎，支持多种 AI 模型切换，隐私保护好，有 AI 写作、代码等专项功能。',
    price: '免费/付费', priceDetail: '免费版；Pro $15/月',
    hasFree: true, hasApi: false, cnAccess: false, rating: 4.1,
    url: 'https://you.com',
    tags: ['搜索', '隐私', '定制'],
    features: ['多模型支持', '隐私保护', 'AI写作模式', 'AI代码模式', '搜索定制'],
    pros: ['隐私好', '可定制', '多模型'],
    cons: ['搜索质量弱于Perplexity'],
    bestFor: '注重隐私的用户',
  },

  // ══════════════════════════════════════════════════════
  // 3. AI写作
  // ══════════════════════════════════════════════════════
  {
    slug: 'jasper', name: 'Jasper', maker: 'Jasper AI', logo: '📝',
    category: 'AI写作', tagline: '营销文案专业AI写作平台',
    desc: '专为营销团队设计的 AI 写作平台，支持品牌声音设置，60+ 写作模板，与 SEO 工具集成，适合营销内容批量生产。',
    price: '付费', priceDetail: 'Creator $39/月；Pro $59/月；Business定制',
    hasFree: false, hasApi: false, cnAccess: false, rating: 4.2,
    url: 'https://www.jasper.ai',
    tags: ['营销', '文案', '品牌', 'SEO'],
    features: ['品牌声音定制', '60+写作模板', 'SEO集成', '多语言', '团队协作'],
    pros: ['营销内容专业', '品牌一致性好', '模板丰富'],
    cons: ['价格较贵', '需要翻墙', '通用写作弱'],
    bestFor: '营销团队、品牌内容创作者',
  },
  {
    slug: 'copyai', name: 'Copy.ai', maker: 'Copy.ai', logo: '✍️',
    category: 'AI写作', tagline: '营销文案批量生产，工作流自动化',
    desc: '专注营销文案的 AI 写作工具，90+ 种文案模板，支持工作流自动化，可批量生产广告、邮件、社媒内容。',
    price: '免费/付费', priceDetail: '免费2000字/月；Pro $49/月；Team $249/月',
    hasFree: true, hasApi: false, cnAccess: false, rating: 4.1,
    url: 'https://www.copy.ai',
    tags: ['营销', '文案', '批量', '工作流'],
    features: ['90+文案模板', '工作流自动化', '批量生产', '多平台适配', '多语言'],
    pros: ['批量效率高', '模板丰富', '工作流强'],
    cons: ['需要翻墙', '价格偏高'],
    bestFor: '电商卖家、营销团队、批量内容生产',
  },
  {
    slug: 'grammarly', name: 'Grammarly', maker: 'Grammarly', logo: '📖',
    category: 'AI写作', tagline: '英文写作校对和润色神器',
    desc: '全球最广泛使用的英文写作助手，AI 驱动的语法检查、风格优化、语气调整，浏览器插件随时使用。',
    price: '免费/付费', priceDetail: '免费基础版；Premium $12/月；Business $15/人/月',
    hasFree: true, hasApi: false, cnAccess: false, rating: 4.5,
    url: 'https://www.grammarly.com',
    tags: ['英文', '校对', '润色', '浏览器插件'],
    features: ['实时语法检查', '风格建议', '语气优化', '抄袭检测', '浏览器插件'],
    pros: ['英文校对最强', '随处可用', '免费版够用'],
    cons: ['仅限英文', '中文不支持'],
    bestFor: '英文写作者、外贸从业者',
  },
  {
    slug: 'notion-ai', name: 'Notion AI', maker: 'Notion', logo: '📋',
    category: 'AI写作', tagline: '嵌入Notion的AI写作助手',
    desc: '直接内嵌在 Notion 中的 AI 功能，可在笔记中直接写作、总结、翻译、改写，不需要切换工具。',
    price: '付费', priceDetail: 'Notion AI附加项 $10/人/月（需已有Notion账号）',
    hasFree: false, hasApi: false, cnAccess: false, rating: 4.3,
    url: 'https://www.notion.so/product/ai',
    tags: ['写作', '笔记', '总结', 'Notion'],
    features: ['嵌入式写作', '智能总结', '自动翻译', '内容改写', '数据库联动'],
    pros: ['与Notion无缝集成', '工作流顺畅', '多功能'],
    cons: ['需要Notion订阅', '价格叠加'],
    bestFor: 'Notion重度用户、内容管理者',
  },
  {
    slug: 'xiezuocat', name: '写作猫', maker: '秘塔科技', logo: '🐱',
    category: 'AI写作', tagline: '中文写作校对和AI写作国内首选',
    desc: '秘塔科技旗下中文写作工具，AI 辅助写作、错别字检测、语法校对、降重改写，是中文写作者的得力助手。',
    price: '免费/付费', priceDetail: '基础免费；会员¥98/年',
    hasFree: true, hasApi: false, cnAccess: true, rating: 4.3,
    url: 'https://xiezuocat.com',
    tags: ['中文', '校对', '改写', '降重'],
    features: ['中文语法校对', 'AI写作辅助', '降重改写', '错别字检测', '文风分析'],
    pros: ['中文最专业', '国内直连', '价格实惠'],
    cons: ['英文支持弱'],
    bestFor: '中文内容创作者、学生、媒体从业者',
  },

  // ══════════════════════════════════════════════════════
  // 4. AI编程开发
  // ══════════════════════════════════════════════════════
  {
    slug: 'cursor', name: 'Cursor', maker: 'Anysphere', logo: '⌨️',
    category: 'AI编程', tagline: '目前最强AI编程IDE，独立开发者首选',
    desc: '基于 VS Code 的 AI 编程 IDE，支持整个代码库理解，自然语言写代码，AI 解释和修复 Bug，是目前最好的 AI 编程工具。',
    price: '免费/付费', priceDetail: '免费2周试用；Pro $20/月；Business $40/月',
    hasFree: true, hasApi: false, cnAccess: true, rating: 4.8,
    url: 'https://cursor.sh',
    tags: ['编程', 'IDE', '代码生成', '全栈'],
    features: ['整库代码理解', '自然语言编程', 'Tab补全', 'AI调试', '多语言支持'],
    pros: ['编程体验最好', '代码库理解深', '全语言支持'],
    cons: ['价格偏高', '新用户有学习成本'],
    bestFor: '独立开发者、全栈工程师',
  },
  {
    slug: 'github-copilot', name: 'GitHub Copilot', maker: 'GitHub/Microsoft', logo: '🐙',
    category: 'AI编程', tagline: '微软GitHub出品，企业级AI编程助手',
    desc: '微软和 GitHub 联合开发，深度整合在 GitHub 生态中，支持 VS Code、JetBrains 等主流 IDE，企业采购首选。',
    price: '付费', priceDetail: 'Individual $10/月；Business $19/人/月',
    hasFree: false, hasApi: false, cnAccess: true, rating: 4.5,
    url: 'https://github.com/features/copilot',
    tags: ['编程', 'GitHub', '企业', 'IDE插件'],
    features: ['主流IDE集成', 'GitHub深度整合', '代码审查', '测试生成', '多语言'],
    pros: ['企业信任度高', 'GitHub集成好', '稳定可靠'],
    cons: ['需要付费', '不如Cursor灵活'],
    bestFor: '企业开发团队、GitHub重度用户',
  },
  {
    slug: 'codeium', name: 'Codeium', maker: 'Exafunction', logo: '💚',
    category: 'AI编程', tagline: '免费的AI代码补全，媲美Copilot',
    desc: '完全免费的 AI 代码补全工具，支持 70+ 种编程语言，可集成到 VS Code、JetBrains 等 IDE，个人用户的最佳 Copilot 替代。',
    price: '免费', priceDetail: '个人完全免费；Teams $12/人/月',
    hasFree: true, hasApi: false, cnAccess: true, rating: 4.4,
    url: 'https://codeium.com',
    tags: ['编程', '免费', '代码补全', 'IDE插件'],
    features: ['70+语言支持', '完全免费', '主流IDE集成', '智能补全', '代码解释'],
    pros: ['完全免费', '支持语言多', '质量接近Copilot'],
    cons: ['功能不如Cursor全面'],
    bestFor: '预算有限的开发者、学生',
  },
  {
    slug: 'v0', name: 'v0', maker: 'Vercel', logo: '▲',
    category: 'AI编程', tagline: '文字描述直接生成前端UI代码',
    desc: 'Vercel 出品，输入自然语言描述，直接生成 React/Next.js 前端组件代码，可一键部署，前端开发效率革命。',
    price: '免费/付费', priceDetail: '免费有限额；Pro $20/月',
    hasFree: true, hasApi: false, cnAccess: false, rating: 4.6,
    url: 'https://v0.dev',
    tags: ['前端', 'React', 'UI生成', 'Vercel'],
    features: ['自然语言生成UI', 'React/Tailwind代码', '一键Vercel部署', '组件迭代', '响应式设计'],
    pros: ['前端生成最快', '代码质量高', '一键部署'],
    cons: ['仅限前端', '需要翻墙'],
    bestFor: '前端开发者、全栈独立开发者',
  },
  {
    slug: 'bolt', name: 'Bolt.new', maker: 'StackBlitz', logo: '⚡',
    category: 'AI编程', tagline: '全栈AI开发，浏览器直接运行',
    desc: 'StackBlitz 出品，在浏览器中直接生成、运行、部署全栈应用，支持 React、Vue、Node.js，不需要本地环境。',
    price: '免费/付费', priceDetail: '免费版有限额；Pro $20/月',
    hasFree: true, hasApi: false, cnAccess: false, rating: 4.5,
    url: 'https://bolt.new',
    tags: ['全栈', '浏览器', '快速原型', 'AI开发'],
    features: ['浏览器全栈运行', '全栈应用生成', '即时预览', '一键部署', 'npm支持'],
    pros: ['无需环境配置', '全栈能力强', '速度快'],
    cons: ['复杂项目受限', '需要翻墙'],
    bestFor: '快速原型开发、非技术创始人验证想法',
  },
  {
    slug: 'tongyi-lingma', name: '通义灵码', maker: '阿里云', logo: '🔶',
    category: 'AI编程', tagline: '国内最好的AI编程助手，完全免费',
    desc: '阿里云出品，国内可用的免费 AI 编程助手，支持 VS Code 和 JetBrains，代码补全质量优秀，企业级安全保障。',
    price: '免费', priceDetail: '个人完全免费；企业版定制',
    hasFree: true, hasApi: false, cnAccess: true, rating: 4.3,
    url: 'https://tongyi.aliyun.com/lingma',
    tags: ['编程', '国内', '免费', 'IDE插件'],
    features: ['国内直连', '完全免费', 'VS Code集成', 'JetBrains集成', '中文注释'],
    pros: ['国内可用', '完全免费', '企业级安全'],
    cons: ['能力弱于Cursor'],
    bestFor: '国内开发者首选免费编程助手',
  },
  {
    slug: 'devin', name: 'Devin', maker: 'Cognition AI', logo: '🤖',
    category: 'AI编程', tagline: '全球首个AI软件工程师，自主完成编程任务',
    desc: 'Cognition AI 开发的首个 AI 软件工程师，可自主完成完整编程任务，包括需求分析、代码编写、测试、部署全流程。',
    price: '付费', priceDetail: '$500/月起',
    hasFree: false, hasApi: false, cnAccess: false, rating: 4.0,
    url: 'https://devin.ai',
    tags: ['AI工程师', '自主编程', '全流程'],
    features: ['自主完成任务', '全流程开发', '需求理解', '代码+测试+部署', '自我纠错'],
    pros: ['自主性最强', '全流程自动化'],
    cons: ['价格极贵', '尚在早期'],
    bestFor: '有资金的团队，用于解放工程师',
  },

  // ══════════════════════════════════════════════════════
  // 5. AI图像生成
  // ══════════════════════════════════════════════════════
  {
    slug: 'midjourney', name: 'Midjourney', maker: 'Midjourney', logo: '🎨',
    category: 'AI图像', tagline: '图像质量最高的AI绘画工具',
    desc: '目前图像质量最高、最具艺术感的 AI 绘图工具，Discord 上使用，擅长写实、艺术风格多样，是 AI 绘画的行业标准。',
    price: '付费', priceDetail: 'Basic $10/月；Standard $30/月；Pro $60/月',
    hasFree: false, hasApi: false, cnAccess: false, rating: 4.8,
    url: 'https://www.midjourney.com',
    tags: ['图像', '艺术', '写实', '商业'],
    features: ['顶级图像质量', '多风格支持', 'Vary细节调整', '图生图', '商业授权'],
    pros: ['质量最高', '风格最多', '商业可用'],
    cons: ['需Discord', '需要翻墙', '需付费'],
    bestFor: '专业设计师、商业插图创作者',
  },
  {
    slug: 'stable-diffusion', name: 'Stable Diffusion', maker: 'Stability AI', logo: '🌊',
    category: 'AI图像', tagline: '开源AI绘画，可本地部署无限生图',
    desc: '完全开源的 AI 图像生成模型，可本地部署，支持 LoRA 微调，社区模型丰富，无内容限制，是技术用户的首选。',
    price: '免费', priceDetail: '开源免费，需要本地GPU或云端部署',
    hasFree: true, hasApi: true, cnAccess: true, rating: 4.5,
    url: 'https://stability.ai',
    tags: ['开源', '本地部署', 'LoRA', '无限制'],
    features: ['完全开源', '本地部署', 'LoRA微调', '社区模型库', 'ComfyUI工作流'],
    pros: ['完全免费', '可定制', '无内容限制', '社区活跃'],
    cons: ['需要技术门槛', '本地需要GPU'],
    bestFor: '技术用户、AI绘画深度玩家',
  },
  {
    slug: 'dalle3', name: 'DALL-E 3', maker: 'OpenAI', logo: '🖼️',
    category: 'AI图像', tagline: 'ChatGPT内置，提示词理解最准确',
    desc: 'OpenAI 开发，与 ChatGPT 深度集成，提示词理解最准确，特别擅长文字嵌入图片，可以在聊天中直接生图。',
    price: '付费', priceDetail: '含在ChatGPT Plus $20/月；API按图计费',
    hasFree: false, hasApi: true, cnAccess: false, rating: 4.6,
    url: 'https://openai.com/dall-e-3',
    tags: ['图像', 'ChatGPT', '文字嵌入', '提示词准确'],
    features: ['提示词理解最准', '文字嵌入图片', 'ChatGPT集成', 'API调用', '多种尺寸'],
    pros: ['提示词理解强', '文字处理好', '集成方便'],
    cons: ['需要付费', '风格不如Midjourney多'],
    bestFor: 'ChatGPT Plus用户、需要精准内容图片的场景',
  },
  {
    slug: 'flux', name: 'Flux', maker: 'Black Forest Labs', logo: '⚡',
    category: 'AI图像', tagline: '新一代开源图像生成，超越SD',
    desc: 'Black Forest Labs 开发的新一代图像生成模型，在写实性和文字理解上超越 Stable Diffusion，已成为 SD 最热门替代品。',
    price: '免费/付费', priceDetail: '开源版免费；API $0.003/张起',
    hasFree: true, hasApi: true, cnAccess: true, rating: 4.6,
    url: 'https://blackforestlabs.ai',
    tags: ['开源', '写实', '新一代', 'API'],
    features: ['超强写实性', '文字理解好', '开源可部署', '快速生成', '高分辨率'],
    pros: ['写实最强', '开源免费', '进化快'],
    cons: ['需要技术部署'],
    bestFor: '技术用户、商业写实图像需求',
  },
  {
    slug: 'jimeng', name: '即梦AI', maker: '字节跳动', logo: '🌙',
    category: 'AI图像', tagline: '字节出品，国内免费AI生图首选',
    desc: '字节跳动出品，国内直接访问，免费生图质量优秀，支持图生图、风格迁移，与剪映深度集成，是国内 AI 创作者首选。',
    price: '免费/付费', priceDetail: '基础免费每日有限额；会员解锁更多',
    hasFree: true, hasApi: false, cnAccess: true, rating: 4.4,
    url: 'https://jimeng.jianying.com',
    tags: ['图像', '国内', '免费', '视频'],
    features: ['国内免费生图', '图生图', '风格迁移', 'AI视频生成', '剪映集成'],
    pros: ['国内直连', '免费', '质量好', '视频也支持'],
    cons: ['每日限额', '商业授权不明确'],
    bestFor: '国内AI创作者、自媒体人',
  },
  {
    slug: 'wenxin-yige', name: '文心一格', maker: '百度', logo: '🎭',
    category: 'AI图像', tagline: '百度AI绘画，中文提示词最友好',
    desc: '百度文心大模型驱动的 AI 绘画平台，中文提示词支持最好，国内直连免费，与百度生态整合，适合中文用户。',
    price: '免费/付费', priceDetail: '基础免费有电量限制；会员¥9.9/月',
    hasFree: true, hasApi: false, cnAccess: true, rating: 4.0,
    url: 'https://yige.baidu.com',
    tags: ['图像', '中文', '国内', '免费'],
    features: ['中文提示词优化', '国内直连', '多风格', '创意工坊', '商品图生成'],
    pros: ['中文最友好', '国内直连', '基础免费'],
    cons: ['质量弱于Midjourney', '每日限额'],
    bestFor: '中文用户、初学者',
  },
  {
    slug: 'ideogram', name: 'Ideogram', maker: 'Ideogram AI', logo: '💡',
    category: 'AI图像', tagline: '文字嵌入图片最准确的AI生图工具',
    desc: '专注于文字嵌入图片的 AI 生图工具，在图片中准确渲染文字的能力全球领先，适合 Logo、海报、文字图设计。',
    price: '免费/付费', priceDetail: '免费每日限额；Basic $7/月；Plus $16/月',
    hasFree: true, hasApi: false, cnAccess: false, rating: 4.4,
    url: 'https://ideogram.ai',
    tags: ['图像', '文字', 'Logo', '海报'],
    features: ['文字嵌入最准', 'Logo生成', '海报设计', '多语言文字', '风格多样'],
    pros: ['文字图片最强', '适合商业设计'],
    cons: ['需要翻墙', '综合质量不如MJ'],
    bestFor: 'Logo设计师、海报创作者、社媒内容创作',
  },
  {
    slug: 'leonardo', name: 'Leonardo AI', maker: 'Leonardo.Ai', logo: '🦁',
    category: 'AI图像', tagline: '游戏美术和写实图像专业平台',
    desc: '专注于游戏美术和高质量图像的 AI 平台，支持自定义模型训练，素材生产工具完善，游戏和创意行业广泛使用。',
    price: '免费/付费', priceDetail: '免费150积分/天；Apprentice $10/月；Artisan $24/月',
    hasFree: true, hasApi: true, cnAccess: false, rating: 4.4,
    url: 'https://leonardo.ai',
    tags: ['游戏', '写实', '商业', 'API'],
    features: ['游戏美术优化', '自定义模型训练', '素材批量生产', '图生图', 'API支持'],
    pros: ['游戏美术最专业', '自定义强', 'API支持'],
    cons: ['需要翻墙', '学习成本高'],
    bestFor: '游戏开发者、商业插图师',
  },

  // ══════════════════════════════════════════════════════
  // 6. AI视频生成
  // ══════════════════════════════════════════════════════
  {
    slug: 'runway', name: 'Runway Gen-3', maker: 'Runway', logo: '🎥',
    category: 'AI视频', tagline: '专业级AI视频生成，好莱坞导演在用',
    desc: 'Runway Gen-3 Alpha 是目前最专业的 AI 视频生成工具，画面质量和运动流畅度领先业界，已有好莱坞级别应用案例。',
    price: '付费', priceDetail: 'Standard $15/月；Pro $35/月；Unlimited $95/月',
    hasFree: true, hasApi: true, cnAccess: false, rating: 4.6,
    url: 'https://runwayml.com',
    tags: ['视频', '专业', '文生视频', '图生视频'],
    features: ['Gen-3最高质量', '文生视频', '图生视频', '视频编辑', '运动笔刷'],
    pros: ['视频质量最高', '专业功能多', '好莱坞认可'],
    cons: ['价格贵', '需要翻墙', '速度慢'],
    bestFor: '专业视频创作者、广告公司',
  },
  {
    slug: 'sora', name: 'Sora', maker: 'OpenAI', logo: '🌀',
    category: 'AI视频', tagline: 'OpenAI划时代视频生成，物理世界理解最强',
    desc: 'OpenAI 发布的视频生成模型，对物理世界的理解和长视频生成能力领先，已向 ChatGPT Plus 用户开放。',
    price: '付费', priceDetail: '含在ChatGPT Plus $20/月（有限额）',
    hasFree: false, hasApi: false, cnAccess: false, rating: 4.5,
    url: 'https://sora.com',
    tags: ['视频', 'OpenAI', '物理模拟', '长视频'],
    features: ['物理世界理解', '最长60秒视频', '文生视频', '图生视频', '视频编辑'],
    pros: ['物理模拟最真实', 'OpenAI背书', '视频长度长'],
    cons: ['需要Plus订阅', '需要翻墙', '速度慢'],
    bestFor: '需要高质量AI视频的创作者',
  },
  {
    slug: 'kling', name: '可灵AI', maker: '快手', logo: '🦋',
    category: 'AI视频', tagline: '国内最强AI视频，写实运动流畅',
    desc: '快手出品的 AI 视频生成工具，写实视频质量和运动流畅度在国内领先，支持最长3分钟视频，国内直连免费试用。',
    price: '免费/付费', priceDetail: '基础功能免费试用；会员¥66-399/月',
    hasFree: true, hasApi: false, cnAccess: true, rating: 4.5,
    url: 'https://klingai.kuaishou.com',
    tags: ['视频', '写实', '国内', '长视频'],
    features: ['写实视频强', '最长3分钟', '图生视频', '文生视频', '人物一致性'],
    pros: ['国内直连', '质量好', '视频较长'],
    cons: ['高质量需付费', '速度慢'],
    bestFor: '国内AI视频创作者首选',
  },
  {
    slug: 'vidu', name: 'Vidu', maker: '生数科技', logo: '🎬',
    category: 'AI视频', tagline: '国产AI视频，人物一致性突出',
    desc: '生数科技与清华大学合作开发，在人物一致性和表情细节方面表现突出，支持多镜头、角色保持一致。',
    price: '免费/付费', priceDetail: '基础免费；会员¥99/月',
    hasFree: true, hasApi: false, cnAccess: true, rating: 4.2,
    url: 'https://www.vidu.cn',
    tags: ['视频', '人物', '国内', '一致性'],
    features: ['人物一致性强', '多镜头连贯', '表情细节', '文生视频', '图生视频'],
    pros: ['人物一致性最好', '国内直连'],
    cons: ['质量波动大', '功能尚不完善'],
    bestFor: '需要人物一致性的视频创作者',
  },
  {
    slug: 'heygen', name: 'HeyGen', maker: 'HeyGen', logo: '🎭',
    category: 'AI视频', tagline: 'AI数字人口播，声音克隆视频制作',
    desc: '专注于 AI 数字人视频生成，可克隆真人形象和声音，一键生成多语言口播视频，已有大量企业和 KOL 采用。',
    price: '付费', priceDetail: 'Creator $29/月；Business $89/月',
    hasFree: true, hasApi: false, cnAccess: false, rating: 4.6,
    url: 'https://www.heygen.com',
    tags: ['数字人', '口播', '声音克隆', '多语言'],
    features: ['真人形象克隆', '声音克隆', '多语言翻译', '口型同步', '批量生成'],
    pros: ['数字人最专业', '声音克隆准确', '多语言支持'],
    cons: ['需要付费', '需要翻墙'],
    bestFor: '企业宣传、多语言内容创作者、KOL',
  },
  {
    slug: 'pika', name: 'Pika', maker: 'Pika Labs', logo: '💫',
    category: 'AI视频', tagline: '快速创意视频，修改已有视频神器',
    desc: 'Pika 1.5 在快速生成创意视频和修改已有视频方面表现优秀，Pikaffects 特效功能独特，适合社媒创意内容。',
    price: '免费/付费', priceDetail: '免费500积分/月；Standard $8/月；Pro $28/月',
    hasFree: true, hasApi: false, cnAccess: false, rating: 4.2,
    url: 'https://pika.art',
    tags: ['视频', '创意', '特效', '快速'],
    features: ['快速生成', '视频修改', 'Pikaffects特效', '图生视频', '风格迁移'],
    pros: ['速度快', '特效独特', '价格便宜'],
    cons: ['质量不如Runway', '需要翻墙'],
    bestFor: '社媒创意内容、快速制作短视频特效',
  },

  // ══════════════════════════════════════════════════════
  // 7. AI音频 & 语音
  // ══════════════════════════════════════════════════════
  {
    slug: 'elevenlabs', name: 'ElevenLabs', maker: 'ElevenLabs', logo: '🎙️',
    category: 'AI音频', tagline: '最真实的AI语音克隆和TTS',
    desc: '目前语音克隆效果最好的 AI 工具，可用3秒音频克隆声音，支持30+语言，API完善，大量播客和视频创作者在用。',
    price: '免费/付费', priceDetail: '免费1万字符/月；Starter $5/月；Creator $22/月',
    hasFree: true, hasApi: true, cnAccess: false, rating: 4.7,
    url: 'https://elevenlabs.io',
    tags: ['语音', '克隆', 'TTS', '多语言'],
    features: ['3秒声音克隆', '30+语言支持', '情感语音', 'API完善', '实时语音'],
    pros: ['克隆效果最真实', '多语言支持', 'API强'],
    cons: ['需要翻墙', '免费额度有限'],
    bestFor: '视频配音、播客制作、多语言内容创作',
  },
  {
    slug: 'suno', name: 'Suno', maker: 'Suno AI', logo: '🎵',
    category: 'AI音频', tagline: '文字生成完整歌曲，AI作曲革命',
    desc: '输入歌词或风格描述，直接生成完整歌曲（含人声+音乐），Suno v4 生成的歌曲已接近专业水准，掀起 AI 音乐革命。',
    price: '免费/付费', priceDetail: '免费50积分/天；Pro $8/月；Premier $24/月',
    hasFree: true, hasApi: false, cnAccess: false, rating: 4.5,
    url: 'https://suno.com',
    tags: ['音乐', '歌曲', '作曲', '创作'],
    features: ['完整歌曲生成', '人声+音乐', '风格多样', '歌词自定义', '续写音乐'],
    pros: ['歌曲质量高', '操作简单', '风格丰富'],
    cons: ['需要翻墙', '版权问题复杂'],
    bestFor: '内容创作者配乐、音乐爱好者',
  },
  {
    slug: 'udio', name: 'Udio', maker: 'Udio', logo: '🎶',
    category: 'AI音频', tagline: 'AI音乐生成，Suno最强竞品',
    desc: 'Suno 的主要竞品，在音乐细节和专业性上有独特优势，支持更精细的音乐风格控制，专业音乐人也在使用。',
    price: '免费/付费', priceDetail: '免费100积分/月；Standard $10/月；Pro $30/月',
    hasFree: true, hasApi: false, cnAccess: false, rating: 4.4,
    url: 'https://www.udio.com',
    tags: ['音乐', '专业', '风格控制'],
    features: ['精细风格控制', '专业音质', '多轨编辑', '自定义歌词', '音乐延伸'],
    pros: ['音乐细节好', '专业控制强'],
    cons: ['需要翻墙', '学习成本高'],
    bestFor: '音乐制作人、专业内容创作者',
  },
  {
    slug: 'volcengine-tts', name: '火山引擎TTS', maker: '字节跳动', logo: '🔊',
    category: 'AI音频', tagline: '字节云端TTS，国内最好用的语音合成API',
    desc: '字节跳动火山引擎提供的 TTS API，音色多样，中文效果极好，价格低廉，国内开发者首选语音合成方案。',
    price: '付费', priceDetail: '按字符计费，约¥0.05/千字符，新用户有免费额度',
    hasFree: true, hasApi: true, cnAccess: true, rating: 4.3,
    url: 'https://www.volcengine.com/product/tts',
    tags: ['TTS', 'API', '国内', '中文'],
    features: ['中文效果好', '音色多样', 'API调用', '实时流式', '情感控制'],
    pros: ['国内直连', 'API稳定', '价格低', '中文最好'],
    cons: ['需要注册企业账号'],
    bestFor: '国内开发者、需要TTS API的应用',
  },
  {
    slug: 'iflytek', name: '讯飞听见', maker: '科大讯飞', logo: '🎤',
    category: 'AI音频', tagline: '中文语音转文字最准确，会议记录神器',
    desc: '科大讯飞出品，中文语音识别准确率行业第一，支持实时转写、会议记录、多人分离，是会议和播客记录的首选工具。',
    price: '免费/付费', priceDetail: '基础免费有限额；会员¥9.9/月；API按量计费',
    hasFree: true, hasApi: true, cnAccess: true, rating: 4.5,
    url: 'https://www.iflyrec.com',
    tags: ['语音识别', '转写', '会议', '中文'],
    features: ['中文识别最准', '实时转写', '多人声音分离', '方言支持', '会议纪要'],
    pros: ['中文准确率最高', '国内直连', '方言支持'],
    cons: ['英文支持弱'],
    bestFor: '会议记录、播客转写、内容创作者',
  },
  {
    slug: 'descript', name: 'Descript', maker: 'Descript', logo: '🎧',
    category: 'AI音频', tagline: '音频视频编辑神器，像编辑文档一样剪音频',
    desc: 'Descript 革命性地让用户像编辑文字一样编辑音频/视频，自动转写后，删文字即删对应音频，播客和视频制作效率翻倍。',
    price: '免费/付费', priceDetail: '免费版有限制；Creator $24/月；Business $40/月',
    hasFree: true, hasApi: false, cnAccess: false, rating: 4.5,
    url: 'https://www.descript.com',
    tags: ['音频', '视频', '转写', '播客'],
    features: ['文字即音频编辑', '自动降噪', 'AI转写', '去除口头禅', '声音克隆'],
    pros: ['编辑方式革命性', '降噪效果好', '播客首选'],
    cons: ['需要翻墙', '价格不低'],
    bestFor: '播客制作者、视频内容创作者',
  },

  // ══════════════════════════════════════════════════════
  // 8. AI演示文稿 & 办公
  // ══════════════════════════════════════════════════════
  {
    slug: 'gamma', name: 'Gamma', maker: 'Gamma App', logo: '📊',
    category: 'AI办公', tagline: 'AI一键生成PPT，设计感极强',
    desc: '输入主题或内容，AI 自动生成设计精美的 PPT/文档/网页，设计质量远超传统 PowerPoint，已被百万用户使用。',
    price: '免费/付费', priceDetail: '免费400积分；Plus $8/月；Pro $15/月',
    hasFree: true, hasApi: false, cnAccess: false, rating: 4.6,
    url: 'https://gamma.app',
    tags: ['PPT', '演示', '设计', '一键生成'],
    features: ['AI自动生成PPT', '设计精美', '多主题模板', '在线协作', '多格式导出'],
    pros: ['设计质量高', '操作简单', '速度快'],
    cons: ['需要翻墙', '定制化有限'],
    bestFor: '需要快速制作精美PPT的商务人士',
  },
  {
    slug: 'tome', name: 'Tome', maker: 'Tome', logo: '📖',
    category: 'AI办公', tagline: 'AI叙事型演示文稿，讲故事神器',
    desc: '专注于叙事型演示的 AI 工具，生成的 PPT 更像一个故事，适合投资人路演、产品演示等需要讲故事的场景。',
    price: '免费/付费', priceDetail: '免费版；Pro $20/月',
    hasFree: true, hasApi: false, cnAccess: false, rating: 4.2,
    url: 'https://tome.app',
    tags: ['PPT', '叙事', '路演', '故事'],
    features: ['叙事型设计', 'AI内容生成', '动效丰富', '嵌入媒体', '分享便捷'],
    pros: ['叙事感强', '动效好看'],
    cons: ['需要翻墙', '功能较单一'],
    bestFor: '路演演讲者、产品经理',
  },
  {
    slug: 'aippt', name: 'AiPPT', maker: 'AiPPT', logo: '📑',
    category: 'AI办公', tagline: '国内AI PPT制作，无需翻墙',
    desc: '国内优质 AI PPT 制作工具，上传文档或输入主题即可一键生成，提供丰富模板，无需翻墙，价格实惠。',
    price: '免费/付费', priceDetail: '基础免费；会员¥99/年',
    hasFree: true, hasApi: false, cnAccess: true, rating: 4.1,
    url: 'https://www.aippt.cn',
    tags: ['PPT', '国内', '免费', '模板'],
    features: ['一键生成PPT', '文档转PPT', '丰富模板', '国内直连', 'AI美化'],
    pros: ['国内直连', '价格实惠', '操作简单'],
    cons: ['质量弱于Gamma', '设计感较普通'],
    bestFor: '国内商务用户、学生',
  },
  {
    slug: 'monica', name: 'Monica', maker: 'Monica AI', logo: '🧩',
    category: 'AI办公', tagline: '浏览器AI助手，全网一键AI化',
    desc: '浏览器插件形式的 AI 助手，可在任何网页上直接使用 AI，支持网页总结、翻译、写作、搜索，是效率工具的集大成者。',
    price: '免费/付费', priceDetail: '免费版有限额；Pro $8.3/月',
    hasFree: true, hasApi: false, cnAccess: false, rating: 4.4,
    url: 'https://monica.im',
    tags: ['浏览器插件', '效率', '全能', '翻译'],
    features: ['网页任意位置使用', '一键总结网页', '实时翻译', 'AI写作', '多模型切换'],
    pros: ['随处可用', '功能全面', '多模型'],
    cons: ['需要翻墙', '依赖网络'],
    bestFor: '效率工具爱好者、内容研究者',
  },
  {
    slug: 'wps-ai', name: 'WPS AI', maker: '金山软件', logo: '📄',
    category: 'AI办公', tagline: '国内Office AI，深度集成WPS',
    desc: '金山 WPS 内置的 AI 功能，可在 Word/Excel/PPT 中直接使用 AI 写作、分析、生成，无需翻墙，国内办公首选。',
    price: '免费/付费', priceDetail: 'WPS会员含AI功能，¥35/月',
    hasFree: false, hasApi: false, cnAccess: true, rating: 4.1,
    url: 'https://ai.wps.cn',
    tags: ['Office', '国内', 'Word', 'Excel'],
    features: ['Word/Excel/PPT集成', 'AI写作', '数据分析', '国内直连', '企业协作'],
    pros: ['国内直连', 'Office深度集成', '企业可信'],
    cons: ['需要会员订阅', '功能不如专业AI工具'],
    bestFor: '国内企业用户、Office重度用户',
  },

  // ══════════════════════════════════════════════════════
  // 9. AI数据分析
  // ══════════════════════════════════════════════════════
  {
    slug: 'julius', name: 'Julius AI', maker: 'Julius', logo: '📈',
    category: 'AI数据', tagline: '上传Excel/CSV，AI自动分析出图',
    desc: '数据分析 AI，上传 Excel、CSV、数据库，用自然语言提问即可生成图表、分析报告，不需要会 SQL 或 Python。',
    price: '免费/付费', priceDetail: '免费有限制；Pro $20/月',
    hasFree: true, hasApi: false, cnAccess: false, rating: 4.4,
    url: 'https://julius.ai',
    tags: ['数据分析', 'Excel', '图表', 'SQL'],
    features: ['自然语言分析数据', 'Excel/CSV上传', '自动生成图表', '统计分析', '报告生成'],
    pros: ['无需技术背景', '操作简单', '图表美观'],
    cons: ['需要翻墙', '复杂分析有限'],
    bestFor: '非技术背景的数据分析师、运营人员',
  },
  {
    slug: 'helium10', name: 'Helium 10', maker: 'Helium 10', logo: '🔬',
    category: 'AI数据', tagline: '亚马逊卖家最强选品数据工具',
    desc: '跨境电商卖家必备工具，提供亚马逊关键词研究、竞品分析、选品数据、排名追踪等完整数据服务，AI 辅助决策。',
    price: '付费', priceDetail: 'Starter $29/月；Platinum $79/月；Diamond $229/月',
    hasFree: true, hasApi: false, cnAccess: false, rating: 4.5,
    url: 'https://www.helium10.com',
    tags: ['电商', '亚马逊', '选品', '数据'],
    features: ['关键词研究', '竞品分析', '选品数据', '排名追踪', 'PPC优化'],
    pros: ['数据最全面', '亚马逊专业', '功能完善'],
    cons: ['需要翻墙', '价格不低', '学习成本'],
    bestFor: '亚马逊卖家、跨境电商从业者',
  },
  {
    slug: 'feigua', name: '飞瓜数据', maker: '飞瓜数据', logo: '🍉',
    category: 'AI数据', tagline: '抖音快手数据分析，国内自媒体必备',
    desc: '专注于抖音、快手、小红书的数据分析平台，提供账号分析、爆款追踪、达人榜单、商品选品数据，国内自媒体必备。',
    price: '付费', priceDetail: '基础版¥99/月；专业版¥399/月',
    hasFree: false, hasApi: false, cnAccess: true, rating: 4.4,
    url: 'https://www.feigua.io',
    tags: ['抖音', '数据', '国内', '自媒体'],
    features: ['抖音数据分析', '快手数据', '小红书数据', '爆款追踪', '达人榜单'],
    pros: ['国内直连', '数据全面', '平台专业'],
    cons: ['价格较高', '仅限国内平台'],
    bestFor: '抖音运营者、MCN机构、带货选品',
  },

  // ══════════════════════════════════════════════════════
  // 10. AI Agent & 自动化
  // ══════════════════════════════════════════════════════
  {
    slug: 'manus', name: 'Manus', maker: 'Monica AI', logo: '🖐️',
    category: 'AI Agent', tagline: '首个通用AI Agent，自主完成复杂任务',
    desc: '全球首个通用型 AI Agent，可自主浏览网页、操作软件、处理文件、完成复杂多步骤任务，无需人工干预。',
    price: '付费', priceDetail: '邀请制内测，定价待定',
    hasFree: false, hasApi: false, cnAccess: true, rating: 4.2,
    url: 'https://manus.im',
    tags: ['Agent', '自动化', '通用', '自主'],
    features: ['自主网页浏览', '多步骤任务', '文件处理', '代码执行', '自我纠错'],
    pros: ['通用性最强', '自主完成复杂任务'],
    cons: ['邀请制', '价格未知', '尚在早期'],
    bestFor: '需要自动化复杂任务的高级用户',
  },
  {
    slug: 'coze', name: '扣子（Coze）', maker: '字节跳动', logo: '🤖',
    category: 'AI Agent', tagline: '字节出品AI Bot平台，无代码搭建智能体',
    desc: '字节跳动出品的 AI 应用开发平台，无代码搭建 AI Bot，支持接入各种插件和数据，可发布到豆包、微信等多渠道。',
    price: '免费', priceDetail: '基础功能免费；高级功能付费',
    hasFree: true, hasApi: false, cnAccess: true, rating: 4.3,
    url: 'https://www.coze.cn',
    tags: ['Agent', 'Bot', '无代码', '字节'],
    features: ['无代码搭建Bot', '插件市场', '多渠道发布', '知识库', '工作流'],
    pros: ['国内直连', '免费', '无代码', '发布渠道多'],
    cons: ['功能深度有限', '定制化受限'],
    bestFor: '想搭建AI应用但不会编程的创业者',
  },
  {
    slug: 'dify', name: 'Dify', maker: 'LangGenius', logo: '⚙️',
    category: 'AI Agent', tagline: '开源LLM应用开发平台，企业私有化部署',
    desc: '开源的 LLM 应用开发框架，支持可视化搭建 AI 工作流，可私有化部署，企业级安全，是技术团队构建 AI 应用的首选。',
    price: '免费', priceDetail: '开源免费自部署；云版本按用量付费',
    hasFree: true, hasApi: true, cnAccess: true, rating: 4.5,
    url: 'https://dify.ai',
    tags: ['开源', 'Agent', '企业', '私有化'],
    features: ['可视化工作流', '私有化部署', '多模型支持', '知识库RAG', 'API输出'],
    pros: ['开源可控', '企业安全', '功能完整'],
    cons: ['需要技术部署', '有学习成本'],
    bestFor: '技术团队、需要私有化AI的企业',
  },
  {
    slug: 'fastgpt', name: 'FastGPT', maker: 'FastAI', logo: '⚡',
    category: 'AI Agent', tagline: '知识库问答AI，企业智能客服首选',
    desc: '专注于知识库问答的 AI 平台，上传文档即可构建专属知识库，适合企业客服、内部知识管理、产品问答等场景。',
    price: '免费/付费', priceDetail: '开源免费；云版本按用量计费',
    hasFree: true, hasApi: true, cnAccess: true, rating: 4.3,
    url: 'https://fastgpt.in',
    tags: ['知识库', '客服', '企业', '问答'],
    features: ['知识库问答', '文档上传', 'AI客服', '工作流', 'API输出'],
    pros: ['知识库问答专业', '国内直连', '开源'],
    cons: ['需要部署配置'],
    bestFor: '企业客服、内部知识管理',
  },
  {
    slug: 'zapier', name: 'Zapier AI', maker: 'Zapier', logo: '🔗',
    category: 'AI Agent', tagline: '连接7000+应用的AI自动化平台',
    desc: '连接 7000+ 应用的自动化平台，现已加入 AI 功能，可以让 AI 决策触发不同的自动化流程，是非技术人员的自动化神器。',
    price: '免费/付费', priceDetail: '免费100任务/月；Starter $19.99/月；Professional $49/月',
    hasFree: true, hasApi: false, cnAccess: false, rating: 4.4,
    url: 'https://zapier.com',
    tags: ['自动化', '集成', 'AI决策', '无代码'],
    features: ['7000+应用集成', 'AI决策触发', '无代码自动化', 'Webhook支持', '多步骤工作流'],
    pros: ['集成最多', '无代码易用', 'AI决策智能'],
    cons: ['需要翻墙', '价格随任务量增'],
    bestFor: '非技术人员的工作流自动化',
  },

  // ══════════════════════════════════════════════════════
  // 11. AI视频剪辑
  // ══════════════════════════════════════════════════════
  {
    slug: 'capcut', name: '剪映专业版', maker: '字节跳动', logo: '✂️',
    category: 'AI剪辑', tagline: '字节出品，AI剪辑功能最强最全',
    desc: '字节跳动出品的专业视频剪辑软件，AI 功能极强：自动字幕、一键成片、AI特效、模板丰富，是国内自媒体首选剪辑工具。',
    price: '免费/付费', priceDetail: '基础功能免费；会员¥79.9/月解锁全部AI功能',
    hasFree: true, hasApi: false, cnAccess: true, rating: 4.6,
    url: 'https://www.capcut.cn',
    tags: ['剪辑', 'AI字幕', '一键成片', '模板'],
    features: ['AI自动字幕', '一键成片', 'AI特效', '抠图抠像', '变声变速'],
    pros: ['功能最全面', '免费可用', '更新快', '模板丰富'],
    cons: ['高级AI需付费'],
    bestFor: '国内自媒体创作者首选剪辑工具',
  },
  {
    slug: 'runway-edit', name: 'Runway（剪辑）', maker: 'Runway', logo: '🎬',
    category: 'AI剪辑', tagline: 'AI视频剪辑创意工具，导演级功能',
    desc: 'Runway 除视频生成外还提供专业 AI 视频编辑功能，包括 AI 背景替换、对象消除、风格迁移等导演级工具。',
    price: '付费', priceDetail: '含在Runway订阅中 $15/月起',
    hasFree: true, hasApi: false, cnAccess: false, rating: 4.4,
    url: 'https://runwayml.com',
    tags: ['剪辑', '专业', 'AI特效', '背景替换'],
    features: ['AI背景替换', '对象消除', '风格迁移', '运动追踪', '帧插值'],
    pros: ['专业特效强', '创意功能独特'],
    cons: ['需要翻墙', '价格不低'],
    bestFor: '专业视频制作者、创意广告公司',
  },

  // ══════════════════════════════════════════════════════
  // 12. AI设计工具
  // ══════════════════════════════════════════════════════
  {
    slug: 'canva', name: 'Canva AI', maker: 'Canva', logo: '🖌️',
    category: 'AI设计', tagline: '设计新手神器，AI功能越来越强',
    desc: 'Canva 已集成大量 AI 功能：AI 生图、背景移除、魔法扩图、文字效果、AI 演示生成，设计门槛极低，适合非设计师。',
    price: '免费/付费', priceDetail: '免费版功能丰富；Pro $12.99/月；Teams $14.99/人/月',
    hasFree: true, hasApi: false, cnAccess: false, rating: 4.5,
    url: 'https://www.canva.com',
    tags: ['设计', 'AI生图', '模板', '营销素材'],
    features: ['海量模板', 'AI生图', 'AI背景移除', '魔法扩图', '品牌套件'],
    pros: ['操作最简单', '模板最丰富', '免费可用'],
    cons: ['需要翻墙', '定制化受限'],
    bestFor: '非设计师的营销人员、内容创作者',
  },
  {
    slug: 'adobe-firefly', name: 'Adobe Firefly', maker: 'Adobe', logo: '🔥',
    category: 'AI设计', tagline: 'Adobe出品，商业授权最安全的AI生图',
    desc: 'Adobe 出品的 AI 生图工具，训练数据来自 Adobe Stock 授权图片，商业使用无版权风险，深度整合在 Photoshop 等 CC 应用中。',
    price: '付费', priceDetail: '含在Adobe CC订阅中；独立版 $4.99/月',
    hasFree: true, hasApi: false, cnAccess: false, rating: 4.3,
    url: 'https://firefly.adobe.com',
    tags: ['设计', 'AI生图', '商业授权', 'Photoshop'],
    features: ['商业授权安全', 'Photoshop集成', '生成填充', '文字效果', '风格参考'],
    pros: ['商业授权最安全', 'Adobe生态集成'],
    cons: ['需要Adobe订阅', '质量不如Midjourney'],
    bestFor: '专业设计师、需要商业授权保障的企业',
  },
  {
    slug: 'gaoding', name: '稿定设计', maker: '稿定科技', logo: '📐',
    category: 'AI设计', tagline: '国内设计平台，AI功能快速迭代',
    desc: '国内优质设计平台，提供海量模板，AI 生图、AI 抠图、AI 设计等功能快速更新，价格实惠，国内直连。',
    price: '免费/付费', priceDetail: '基础免费；会员¥49/月',
    hasFree: true, hasApi: false, cnAccess: true, rating: 4.2,
    url: 'https://www.gaoding.com',
    tags: ['设计', '国内', '模板', 'AI生图'],
    features: ['海量中文模板', 'AI生图', 'AI抠图', '视频模板', '品牌设计'],
    pros: ['国内直连', '中文模板多', '价格实惠'],
    cons: ['质量弱于Canva'],
    bestFor: '国内电商商家、内容创作者',
  },
]

// 按分类分组
export function getToolsByCategory(): Record<string, Tool[]> {
  const result: Record<string, Tool[]> = {}
  ALL_TOOLS.forEach(tool => {
    if (!result[tool.category]) result[tool.category] = []
    result[tool.category].push(tool)
  })
  return result
}

// 获取所有分类
export function getAllCategories(): string[] {
  return [...new Set(ALL_TOOLS.map(t => t.category))]
}

// 按 slug 查找
export function getToolBySlug(slug: string): Tool | undefined {
  return ALL_TOOLS.find(t => t.slug === slug)
}

// 搜索工具
export function searchTools(query: string): Tool[] {
  const q = query.toLowerCase()
  return ALL_TOOLS.filter(t =>
    t.name.toLowerCase().includes(q) ||
    t.tagline.toLowerCase().includes(q) ||
    t.tags.some(tag => tag.toLowerCase().includes(q)) ||
    t.category.toLowerCase().includes(q)
  )
}
