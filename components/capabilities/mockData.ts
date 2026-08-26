import type {
  PluginItem,
  AgentItem,
  PersonItem,
  OrganizationItem,
} from './types'

export const ROTATING_PLACEHOLDERS = [
  '找一个美国商业摄影师',
  '寻找欧洲货代',
  '帮我做一个销售 Agent',
  '找一个 Shopify 数据工具',
  '找团队搭建独立站',
  '寻找 TikTok 营销服务',
]

export const ROTATING_PLACEHOLDERS_EN = [
  'Find a commercial photographer in the US',
  'Find European freight forwarding partners',
  'Build a sales agent for outreach',
  'Find a Shopify data sync tool',
  'Hire a team to build an e-commerce storefront',
  'Find TikTok growth marketing specialists',
]

// ==========================================
// 1. PLUGINS DATA
// ==========================================
export const INITIAL_PLUGINS: PluginItem[] = [
  {
    id: 'plugin-translator',
    name: 'Product Translator',
    nameZh: '商品多语言翻译器',
    description: 'Automatically translate product titles, specs, and SEO copy into 40+ languages.',
    descriptionZh: '自动将商品内容转换为多语言版本，覆盖标题、描述、规格与本地化 SEO。',
    tags: ['Commerce', 'Language'],
    tagsZh: ['商业', '多语言'],
    features: ['Title Localization', 'Specification Sync', 'Multilingual SEO', 'HTML Tag Preservation'],
    featuresZh: ['商品标题本地化', '规格参数精准对照', '多语言 SEO 标签', '保留富文本格式'],
    category: 'Commerce',
    categoryZh: '商业',
    developer: 'Omnilink Labs',
    usesCount: '12.4K',
    rating: 5,
    isAdded: false,
    iconType: 'translate',
  },
  {
    id: 'plugin-seo',
    name: 'SEO Analyzer',
    nameZh: 'SEO 表现与结构化分析器',
    description: 'Deep audit of product search performance, JSON-LD schemas, and keyword ranking.',
    descriptionZh: '分析商品页面的搜索表现、JSON-LD 结构化内容与搜索引擎收录权重。',
    tags: ['Marketing', 'SEO'],
    tagsZh: ['营销', 'SEO'],
    features: ['Schema Markup Audit', 'Snippet Preview', 'Keyword Density', 'Competitor Gap Analysis'],
    featuresZh: ['Schema 结构标记审查', 'SERP 摘要预览', '关键词密度检测', '竞品排名差距分析'],
    category: 'Marketing',
    categoryZh: '营销',
    developer: 'Omnilink Labs',
    usesCount: '18.2K',
    rating: 5,
    isAdded: true,
    iconType: 'seo',
  },
  {
    id: 'plugin-analytics',
    name: 'Analytics Connector',
    nameZh: '全渠道数据连接器',
    description: 'Seamlessly bridge store traffic and funnel events to Google Analytics 4, Mixpanel, and PostHog.',
    descriptionZh: '连接 GA4、Mixpanel、PostHog 等外部主流分析平台，实时回传转化漏斗。',
    tags: ['Analytics', 'Integration'],
    tagsZh: ['分析', '集成'],
    features: ['Event Stream Relay', 'Attribution Tracking', 'Cart Abandonment Signals', 'Server-side Logging'],
    featuresZh: ['全量事件流中继', '多触点归因追踪', '加购流失意图信号', '服务端无损上报'],
    category: 'Analytics',
    categoryZh: '分析',
    developer: 'Omnilink Labs',
    usesCount: '9.8K',
    rating: 5,
    isAdded: true,
    iconType: 'analytics',
  },
  {
    id: 'plugin-image-opt',
    name: 'Image Optimizer',
    nameZh: '商品图像智能优化器',
    description: 'Automated WebP/AVIF lossless compression, smart aspect ratio padding, and visual CDN routing.',
    descriptionZh: '自动压缩、转换与优化商品图片，自适应高分辨率屏幕与秒级 CDN 分发。',
    tags: ['Media', 'Performance'],
    tagsZh: ['媒体', '性能'],
    features: ['WebP/AVIF Conversion', 'Smart Background Padding', 'EXIF Scrubbing', 'Edge Caching'],
    featuresZh: ['WebP/AVIF 极致压缩', '智能白底居中扩图', '隐私 EXIF 清除', '全球边缘分发缓存'],
    category: 'Design',
    categoryZh: '设计',
    developer: 'Omnilink Labs',
    usesCount: '24.1K',
    rating: 5,
    isAdded: true,
    iconType: 'image',
  },
  {
    id: 'plugin-shipping',
    name: 'Shipping Calculator',
    nameZh: '全球物流与运费算价器',
    description: 'Dynamic cross-border freight rate engine and live customs duty estimation.',
    descriptionZh: '连接全球物流专线与运费计算服务，实时计算清关关税与尾程派送资费。',
    tags: ['Logistics', 'Commerce'],
    tagsZh: ['物流', '商业'],
    features: ['Real-time Carrier Rates', 'Volumetric Weight Logic', 'Duty & Tax Calc', 'Zone Routing'],
    featuresZh: ['实时专线运价查询', '材积重智能折算', '关税增值税预估', '多分区路由匹配'],
    category: 'Logistics',
    categoryZh: '物流',
    developer: 'Omnilink Labs',
    usesCount: '7.3K',
    rating: 5,
    isAdded: false,
    iconType: 'shipping',
  },
  {
    id: 'plugin-crm',
    name: 'CRM Connector',
    nameZh: 'CRM 客户数据连接器',
    description: 'Bi-directional sync between Omnilink merchant database, HubSpot, Salesforce, and Klaviyo.',
    descriptionZh: '连接 CRM 和客户生命周期数据，打通商机线索、会员标签与自动化营销触发。',
    tags: ['Sales', 'Integration'],
    tagsZh: ['销售', '集成'],
    features: ['Contact Sync', 'Purchase History Tags', 'Webhook Automation', 'Custom Field Mapper'],
    featuresZh: ['客户档案双向同步', '复购行为自动打标', 'Webhook 事件触发', '自定义字段映射'],
    category: 'Data',
    categoryZh: '数据',
    developer: 'Omnilink Labs',
    usesCount: '11.5K',
    rating: 5,
    isAdded: false,
    iconType: 'crm',
  },
]

// ==========================================
// 2. AGENTS DATA
// ==========================================
export const INITIAL_AGENTS: AgentItem[] = [
  {
    id: 'agent-product',
    name: 'Product Agent',
    nameZh: '商品全维质检 Agent',
    taskType: '商品数据分析与治理',
    taskTypeZh: '商品数据分析与治理',
    description: 'Audits catalog integrity, normalizes specs, rewrites SEO titles, and catches pricing flaws.',
    descriptionZh: '分析、整理和优化商品数据，发现属性缺漏、规格冲突与潜在违规词。',
    canPerform: [
      '检查商品完整度与属性完整率',
      '分析规格参数与变体一致性',
      '重构高转化与高收录商品标题',
      '实时发现定价异常与缺货隐患',
    ],
    canPerformZh: [
      '检查商品完整度与属性完整率',
      '分析规格参数与变体一致性',
      '重构高转化与高收录商品标题',
      '实时发现定价异常与缺货隐患',
    ],
    category: 'Commerce',
    categoryZh: '商业',
    createdBy: 'Omnilink Core',
    usesCount: '14.5K',
    isAdded: false,
    agentAvatar: 'PA',
    colorTheme: '#024AD8',
  },
  {
    id: 'agent-marketing',
    name: 'Marketing Agent',
    nameZh: '品牌全域营销 Agent',
    taskType: '增长与内容运营',
    taskTypeZh: '增长与内容运营',
    description: 'Constructs seasonal campaign calendars, analyzes channel ROAS, and writes viral copy.',
    descriptionZh: '帮助品牌完成端到端营销工作，统筹排期、投放归因与多触点创意生成。',
    canPerform: [
      '自动生成周度/月度社媒内容计划',
      '深度分析多渠道广告营销数据与 ROAS',
      '一键创建全渠道营销 Campaign 结构',
      '基于竞品动态提出精准增长建议',
    ],
    canPerformZh: [
      '自动生成周度/月度社媒内容计划',
      '深度分析多渠道广告营销数据与 ROAS',
      '一键创建全渠道营销 Campaign 结构',
      '基于竞品动态提出精准增长建议',
    ],
    category: 'Marketing',
    categoryZh: '营销',
    createdBy: 'Omnilink Growth',
    usesCount: '8.2K',
    isAdded: true,
    agentAvatar: 'MA',
    colorTheme: '#6366F1',
  },
  {
    id: 'agent-sales',
    name: 'Sales Agent',
    nameZh: 'B2B 销售与商机跟进 Agent',
    taskType: '线索孵化与转化推动',
    taskTypeZh: '线索孵化与转化推动',
    description: 'Qualifies incoming inquiries, builds custom quotation proposals, and drafts targeted follow-ups.',
    descriptionZh: '处理潜在客户与销售转化任务，分析买家意向、分级商机并拟定个性化跟进策略。',
    canPerform: [
      '基于买家行为深度分析客户采购画像',
      '自动整理高净值询盘线索并评分',
      '智能生成专业针对性的跟进邮件与方案',
      '多维度销售机会分析与流失预警',
    ],
    canPerformZh: [
      '基于买家行为深度分析客户采购画像',
      '自动整理高净值询盘线索并评分',
      '智能生成专业针对性的跟进邮件与方案',
      '多维度销售机会分析与流失预警',
    ],
    category: 'Sales',
    categoryZh: '销售',
    createdBy: 'Omnilink Revenue',
    usesCount: '6.9K',
    isAdded: false,
    agentAvatar: 'SA',
    colorTheme: '#059669',
  },
  {
    id: 'agent-research',
    name: 'Research Agent',
    nameZh: '深度市场与竞品研究 Agent',
    taskType: '复杂情报检索与洞察',
    taskTypeZh: '复杂情报检索与洞察',
    description: 'Executes rigorous web searches, cross-references supplier data, and outputs structured intelligence memos.',
    descriptionZh: '完成复杂的全球商业信息与竞品研究，自动比对参数、提炼核心结论并生成研报。',
    canPerform: [
      '多源网络与行业数据库高精检索',
      '结构化整理竞品功能矩阵与价格曲线',
      '多维度优劣势横向对比分析',
      '自动提炼核心结论并输出决策研报',
    ],
    canPerformZh: [
      '多源网络与行业数据库高精检索',
      '结构化整理竞品功能矩阵与价格曲线',
      '多维度优劣势横向对比分析',
      '自动提炼核心结论并输出决策研报',
    ],
    category: 'Research',
    categoryZh: '研究',
    createdBy: 'Omnilink Intelligence',
    usesCount: '19.3K',
    isAdded: false,
    agentAvatar: 'RA',
    colorTheme: '#D97706',
  },
  {
    id: 'agent-support',
    name: 'Support Agent',
    nameZh: '客户支持与知识推理 Agent',
    taskType: '全天候智能问答与服务',
    taskTypeZh: '全天候智能问答与服务',
    description: 'Retrieves verified merchant knowledge, resolves complex warranty queries, and crafts empathetic answers.',
    descriptionZh: '处理客户支持与售后咨询任务，精准检索知识库并生成合规友善的拟真解答。',
    canPerform: [
      '毫秒级检索多级知识库与技术文档',
      '精准解答高频 FAQ 与使用指导',
      '合规判断售后退换货与保修资格',
      '依据品牌语气生成自然温和的客服回复',
    ],
    canPerformZh: [
      '毫秒级检索多级知识库与技术文档',
      '精准解答高频 FAQ 与使用指导',
      '合规判断售后退换货与保修资格',
      '依据品牌语气生成自然温和的客服回复',
    ],
    category: 'Support',
    categoryZh: '客服',
    createdBy: 'Omnilink Care',
    usesCount: '21.0K',
    isAdded: true,
    agentAvatar: 'SU',
    colorTheme: '#7C3AED',
  },
  {
    id: 'agent-commerce-ops',
    name: 'Commerce Operator',
    nameZh: '店铺自动化运营 Agent',
    taskType: '全流程店铺运营监控',
    taskTypeZh: '全流程店铺运营监控',
    description: 'Tracks pending shipments, monitors low stock alerts, detects abnormal order spikes, and recommends actions.',
    descriptionZh: '协助处理日常商店运营，全面巡检订单履约、仓储库存与营收波动，生成即时行动建议。',
    canPerform: [
      '实时巡检上架商品与规格有效性',
      '全流程跟踪订单履约与支付状态',
      '智能预测安全库存与补货水位',
      '发现数据异常并生成当日运营决策建议',
    ],
    canPerformZh: [
      '实时巡检上架商品与规格有效性',
      '全流程跟踪订单履约与支付状态',
      '智能预测安全库存与补货水位',
      '发现数据异常并生成当日运营决策建议',
    ],
    category: 'Operations',
    categoryZh: '运营',
    createdBy: 'Omnilink Ops',
    usesCount: '15.8K',
    isAdded: false,
    agentAvatar: 'CO',
    colorTheme: '#0284C7',
  },
]

// ==========================================
// 3. PEOPLE DATA (Professional Identity Network)
// ==========================================
export const INITIAL_PEOPLE: PersonItem[] = [
  {
    id: 'person-mina-chen',
    name: 'Mina Chen',
    role: 'Commercial Photographer',
    roleZh: '商业静物与产品摄影师',
    skills: ['Product Photography', 'Brand Photography', 'Art Direction', 'High-end Retouching'],
    skillsZh: ['商业静物摄影', '品牌视觉大片', '视觉艺术指导', '高端后期精修'],
    rating: 4.9,
    projectsCount: 128,
    location: 'Los Angeles, USA',
    locationZh: '洛杉矶 · 美国',
    category: 'Photography',
    categoryZh: '摄影',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80',
    bio: '10+ years specializing in consumer hardware, luxury audio, and tactile lifestyle goods. Featured in Dezeen and Wallpaper*.',
    bioZh: '10 年消费电子、高端声学硬件与奢华生活方式产品拍摄经验，曾多次主导知名 DTC 品牌出海大片。',
    verified: true,
    recentWork: [
      { title: 'Omnilink Hi-Fi Acoustics Launch', client: 'Omnilink Global', year: '2026' },
      { title: 'Nordic Minimalist Watch Series', client: 'Vanguard Time', year: '2025' },
    ],
  },
  {
    id: 'person-alex-wang',
    name: 'Alex Wang',
    role: 'Growth Consultant',
    roleZh: '出海独立站增长顾问',
    skills: ['Growth Strategy', 'TikTok Marketing', 'Paid Media', 'Conversion Optimization'],
    skillsZh: ['出海增长策略', 'TikTok 矩阵营销', '付费流投放', '独立站转化漏斗优化'],
    rating: 4.8,
    projectsCount: 64,
    location: 'Singapore',
    locationZh: '新加坡',
    category: 'Marketing',
    categoryZh: '营销',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80',
    bio: 'Ex-ByteDance lead growth strategist. Helped 30+ cross-border brands scale from $0 to $10M ARR on Shopify and TikTok Shop.',
    bioZh: '前字节跳动海外增长策略主管，累计辅导 30 余家跨境出海品牌完成从 0 到千万级美金年营收突破。',
    verified: true,
    recentWork: [
      { title: 'Scale to $5M GMV in 90 Days', client: 'Lumina Tech', year: '2026' },
      { title: 'TikTok Creator Affiliate Program', client: 'Glow Lifestyle', year: '2025' },
    ],
  },
  {
    id: 'person-sophia-liu',
    name: 'Sophia Liu',
    role: 'Brand Designer',
    roleZh: '资深品牌视觉设计师',
    skills: ['Brand Identity', 'Visual Systems', 'Packaging', 'Design Systems'],
    skillsZh: ['品牌全案识别', '视觉系统规范', '产品包装工程', '设计系统构建'],
    rating: 4.9,
    projectsCount: 93,
    location: 'New York, USA',
    locationZh: '纽约 · 美国',
    category: 'Design',
    categoryZh: '设计',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&auto=format&fit=crop&q=80',
    bio: 'Rhode Island School of Design alumnus. Creating distinctive brand voices and modular packaging systems for modern consumer brands.',
    bioZh: '罗德岛设计学院硕士，专注为现代消费品与科技品牌打造具备国际审美与辨识度的全案视觉系统。',
    verified: true,
    recentWork: [
      { title: 'Global Identity & Eco-packaging', client: 'Aetheria Earth', year: '2026' },
      { title: 'DTC Flagship UI System', client: 'Velox Mobility', year: '2025' },
    ],
  },
  {
    id: 'person-daniel-kim',
    name: 'Daniel Kim',
    role: 'B2B Sales Consultant',
    roleZh: 'B2B 大客户销售与拓客顾问',
    skills: ['Lead Generation', 'Outbound Sales', 'CRM Architecture', 'Enterprise Negotiation'],
    skillsZh: ['精准潜客挖掘', '海外 Outbound 获客', 'CRM 流程架构', '大客户采购谈判'],
    rating: 4.7,
    projectsCount: 42,
    location: 'Seoul / San Francisco',
    locationZh: '首尔 / 旧金山',
    category: 'Sales',
    categoryZh: '销售',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&auto=format&fit=crop&q=80',
    bio: 'Veteran enterprise sales director bridging Asian manufacturing powerhouses with North American retail distributor networks.',
    bioZh: '12 年跨境大宗供应链与 B2B 拓展经验，助力优质智造厂商直连北美前十百货零售分销网络。',
    verified: true,
    recentWork: [
      { title: 'Distributor Contract ($12M)', client: 'Pacific SmartTech', year: '2026' },
      { title: 'Global Wholesale Outreach Playbook', client: 'OmniAudio Corp', year: '2025' },
    ],
  },
  {
    id: 'person-emma-zhao',
    name: 'Emma Zhao',
    role: 'Frontend Developer',
    roleZh: '全栈与现代前端架构师',
    skills: ['Next.js', 'React', 'E-commerce Architecture', 'Headless Commerce'],
    skillsZh: ['Next.js App Router', 'React 19', '独立站架构设计', 'Headless 电商工程'],
    rating: 4.9,
    projectsCount: 77,
    location: 'Vancouver, Canada',
    locationZh: '温哥华 · 加拿大',
    category: 'Development',
    categoryZh: '开发',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=160&auto=format&fit=crop&q=80',
    bio: 'Architecting ultra-fast, responsive headless e-commerce storefronts with 100/100 Core Web Vitals performance scores.',
    bioZh: '专注打造极致性能的 Next.js 与 Headless 出海独立站，实现 100 分 Google Core Web Vitals 与丝滑微交互。',
    verified: true,
    recentWork: [
      { title: 'Sub-second Headless Storefront', client: 'Monolith Goods', year: '2026' },
      { title: 'Interactive 3D Configurator', client: 'Aero Furniture', year: '2025' },
    ],
  },
  {
    id: 'person-noah-garcia',
    name: 'Noah Garcia',
    role: 'International Logistics Specialist',
    roleZh: '国际跨境供应链与关务专家',
    skills: ['Freight Forwarding', 'Customs Compliance', 'Global Fulfillment', 'Cold Chain'],
    skillsZh: ['欧美空海专线', '进出口关务合规', '海外仓履约体系', '特殊品类温控转运'],
    rating: 4.8,
    projectsCount: 51,
    location: 'Rotterdam, Netherlands',
    locationZh: '鹿特丹 · 荷兰',
    category: 'Logistics',
    categoryZh: '物流',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=160&auto=format&fit=crop&q=80',
    bio: 'Specialist in EU tax compliance (IOSS), bonded warehousing, and cross-border transit time minimization for DTC exporters.',
    bioZh: '精通欧盟 IOSS 关税合规、保税仓中转与跨境干线时效优化，累计统筹数万柜次国际物流平稳清关。',
    verified: true,
    recentWork: [
      { title: 'EU 48h Pan-Regional Fulfillment', client: 'Zenith Retail Europe', year: '2026' },
      { title: 'Automated Customs API Bridge', client: 'SilkRoad Express', year: '2025' },
    ],
  },
]

// ==========================================
// 4. ORGANIZATIONS DATA (Teams & Companies)
// ==========================================
export const INITIAL_ORGANIZATIONS: OrganizationItem[] = [
  {
    id: 'org-northstar',
    name: 'Northstar Studio',
    type: 'Creative Studio',
    typeZh: '创意设计与品牌工作室',
    skills: ['Brand Design', 'Photography', 'Campaign', 'Video Production'],
    skillsZh: ['全案品牌设计', '商业大片拍摄', '全球 Campaign 创意', 'TVC 与三维视频'],
    teamSize: '12 members',
    teamSizeZh: '12 位全职专家',
    projectCount: 128,
    serviceScope: 'North America & Europe',
    serviceScopeZh: '北美、欧洲及全球主要枢纽',
    category: 'Design',
    categoryZh: '设计',
    logo: 'NS',
    about: 'Full-cycle brand storytelling studio delivering award-winning digital campaigns and high-production visual assets for scaling consumer brands.',
    aboutZh: '全案品牌创意工作室，拥有专属影视棚与资深美术团队，为成长型科技与生活方式品牌提供全链路视觉资产交付。',
    featuredCase: [
      { title: 'Redefining Smart Living Visual Campaign', impact: '28M Impressions', category: 'Creative' },
      { title: 'Global Brand Identity & Packaging Relaunch', impact: '3.4x Conversion', category: 'Branding' },
    ],
  },
  {
    id: 'org-growth-lab',
    name: 'Growth Lab',
    type: 'Marketing Agency',
    typeZh: '全域数字营销与增长机构',
    skills: ['Performance Marketing', 'Social Media', 'SEO & SEM', 'Content Marketing'],
    skillsZh: ['效果广告投放', '社媒内容运营', '全球 SEO 矩阵', 'KOL 达人分发'],
    teamSize: '24 members',
    teamSizeZh: '24 位增长专家',
    projectCount: 412,
    serviceScope: 'Global (US, EU, APAC)',
    serviceScopeZh: '全球核心市场 (美/欧/亚太)',
    category: 'Marketing',
    categoryZh: '营销',
    logo: 'GL',
    about: 'Data-driven performance agency managing over $40M in annual ad spend across Google, Meta, TikTok, and Amazon Ads.',
    aboutZh: '数据驱动型全球效果营销机构，年管理广告预算超 4000 万美元，精通海外主流渠道漏斗优化与爆品打造。',
    featuredCase: [
      { title: 'Black Friday Global Scale Campaign', impact: '$14.2M GMV', category: 'Performance' },
      { title: 'TikTok Viral Influencer Seeding', impact: '140M Views', category: 'Social' },
    ],
  },
  {
    id: 'org-global-freight',
    name: 'Global Freight Network',
    type: 'Logistics',
    typeZh: '全球跨境综合物流集团',
    skills: ['International Freight', 'Customs Clearance', 'Warehouse Network', 'Last-mile Fulfillment'],
    skillsZh: ['国际海运/空运专线', '双清关与关税代缴', '全球海外仓群', '本地化尾程派送'],
    teamSize: '150+ specialists',
    teamSizeZh: '150+ 驻场物流团队',
    projectCount: 860,
    serviceScope: '28 countries',
    serviceScopeZh: '覆盖全球 28 个核心贸易国',
    category: 'Logistics',
    categoryZh: '物流',
    logo: 'GF',
    about: 'End-to-end supply chain infrastructure with 1.2M sq.ft of bonded warehousing across Los Angeles, Hamburg, and Tokyo.',
    aboutZh: '端到端全球供应链基础设施，在洛杉矶、汉堡、东京等地拥有超 120 万平方英尺自营保税与海外仓网络。',
    featuredCase: [
      { title: 'US Coast-to-Coast 2-Day Delivery Network', impact: '99.4% On-time', category: 'Fulfillment' },
      { title: 'Pan-European Cross-Dock Logistics', impact: '-22% Freight Cost', category: 'Supply Chain' },
    ],
  },
  {
    id: 'org-atlas-dev',
    name: 'Atlas Development',
    type: 'Development Studio',
    typeZh: '数字化电商研发实验室',
    skills: ['Web Development', 'E-commerce Architecture', 'AI Integration', 'Automation Pipelines'],
    skillsZh: ['企业级独立站定制', '微服务电商架构', '私有化 AI 集成', '自动化业务流水线'],
    teamSize: '18 members',
    teamSizeZh: '18 位资深工程师',
    projectCount: 203,
    serviceScope: 'Global Remote',
    serviceScopeZh: '全球远程交付',
    category: 'Development',
    categoryZh: '开发',
    logo: 'AD',
    about: 'Engineering precision e-commerce systems with modern Next.js, Headless Shopify, Stripe Connect, and custom AI agent toolings.',
    aboutZh: '致力于构建高可用、易扩展的现代出海电商系统，提供全套 Next.js 独立站、支付通道与 AI Agent 工具集成。',
    featuredCase: [
      { title: 'Enterprise Omnichannel Platform Rewrite', impact: '0.4s Avg Latency', category: 'Engineering' },
      { title: 'Automated Product Ingestion Pipeline', impact: '50K SKUs / hr', category: 'Automation' },
    ],
  },
  {
    id: 'org-eastbridge',
    name: 'Eastbridge Consulting',
    type: 'Business Consulting',
    typeZh: '出海战略与商业咨询公司',
    skills: ['Market Entry', 'Corporate Strategy', 'Cross-border Operations', 'B2B Partner Matching'],
    skillsZh: ['海外市场准入评估', '全链商业战略定位', '跨境本地化运营', 'B2B 优质渠道对接'],
    teamSize: '14 consultants',
    teamSizeZh: '14 位前顶级咨询顾问',
    projectCount: 95,
    serviceScope: 'US, UK, Japan, Germany',
    serviceScopeZh: '美、英、日、德及东南亚',
    category: 'Consulting',
    categoryZh: '咨询',
    logo: 'EB',
    about: 'Former McKinsey and BCG partners advising Asian manufacturers on brand premiumization and overseas direct-to-consumer expansion.',
    aboutZh: '由前麦肯锡与波士顿咨询合伙人组建，专注助力中国及亚洲制造业龙头企业完成海外品牌高端化转型。',
    featuredCase: [
      { title: 'North American Hardware Retail Expansion', impact: 'Top 3 US Retailers', category: 'Strategy' },
      { title: 'EU Regulatory Compliance & Entity Setup', impact: '100% Audit Passed', category: 'Compliance' },
    ],
  },
  {
    id: 'org-lens-house',
    name: 'Lens House',
    type: 'Photography Studio',
    typeZh: '高端商业影像制作工坊',
    skills: ['Commercial Photography', 'Product Photography', 'Post Production', '3D Visual Rendering'],
    skillsZh: ['商业静物大片', '3C 数码棚拍', '好莱坞级后期精修', '3D 逼真材质渲染'],
    teamSize: '9 photographers',
    teamSizeZh: '9 位签约首席摄影师',
    projectCount: 310,
    serviceScope: 'San Francisco & Shenzhen Studios',
    serviceScopeZh: '旧金山 & 深圳自营双影像中心',
    category: 'Photography',
    categoryZh: '摄影',
    logo: 'LH',
    about: 'Specialized optical studio crafting crisp visual assets for consumer electronics, acoustic devices, and industrial design products.',
    aboutZh: '专注于 3C 数码、高端声学与工业设计产品的专业光学摄影棚，已服务 100+ 全球出海旗舰品牌。',
    featuredCase: [
      { title: 'Acoustic Flagship 8K Macro Campaign', impact: 'Red Dot Best of Best', category: 'Production' },
      { title: '3D Hyper-real Product Video', impact: '2.8x DTC Conversion', category: 'CGI' },
    ],
  },
]

// ==========================================
// 5. SMART SEARCH MATCHER / QUERY PRESETS
// ==========================================
export function getCrossCategorySearchRecommendations(query: string) {
  const q = query.trim().toLowerCase()
  if (!q) {
    return {
      people: INITIAL_PEOPLE.slice(0, 2),
      organizations: INITIAL_ORGANIZATIONS.slice(0, 2),
      agents: INITIAL_AGENTS.slice(0, 2),
      plugins: INITIAL_PLUGINS.slice(0, 2),
    }
  }

  const people = INITIAL_PEOPLE.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.role.toLowerCase().includes(q) ||
      p.roleZh.includes(q) ||
      p.skills.some((s) => s.toLowerCase().includes(q)) ||
      p.skillsZh.some((s) => s.includes(q)) ||
      p.categoryZh.includes(q) ||
      (q.includes('摄影') && p.categoryZh === '摄影') ||
      (q.includes('拍照') && p.categoryZh === '摄影') ||
      (q.includes('开发') && p.categoryZh === '开发') ||
      (q.includes('设计') && p.categoryZh === '设计') ||
      (q.includes('营销') && p.categoryZh === '营销') ||
      (q.includes('货代') && p.categoryZh === '物流') ||
      (q.includes('物流') && p.categoryZh === '物流')
  )

  const organizations = INITIAL_ORGANIZATIONS.filter(
    (o) =>
      o.name.toLowerCase().includes(q) ||
      o.type.toLowerCase().includes(q) ||
      o.typeZh.includes(q) ||
      o.skills.some((s) => s.toLowerCase().includes(q)) ||
      o.skillsZh.some((s) => s.includes(q)) ||
      o.categoryZh.includes(q) ||
      (q.includes('摄影') && (o.categoryZh === '摄影' || o.name.includes('Lens'))) ||
      (q.includes('货代') && o.categoryZh === '物流') ||
      (q.includes('物流') && o.categoryZh === '物流') ||
      (q.includes('团队') && o.categoryZh === '开发') ||
      (q.includes('建站') && (o.categoryZh === '开发' || o.categoryZh === '设计'))
  )

  const agents = INITIAL_AGENTS.filter(
    (a) =>
      a.name.toLowerCase().includes(q) ||
      a.nameZh.includes(q) ||
      a.taskType.toLowerCase().includes(q) ||
      a.taskTypeZh.includes(q) ||
      a.canPerform.some((c) => c.toLowerCase().includes(q)) ||
      a.canPerformZh.some((c) => c.includes(q)) ||
      (q.includes('销售') && a.id === 'agent-sales') ||
      (q.includes('运营') && a.id === 'agent-commerce-ops') ||
      (q.includes('客服') && a.id === 'agent-support') ||
      (q.includes('营销') && a.id === 'agent-marketing') ||
      (q.includes('商品') && a.id === 'agent-product') ||
      (q.includes('研究') && a.id === 'agent-research') ||
      (q.includes('摄影') && a.id === 'agent-product')
  )

  const plugins = INITIAL_PLUGINS.filter(
    (pl) =>
      pl.name.toLowerCase().includes(q) ||
      pl.nameZh.includes(q) ||
      pl.description.toLowerCase().includes(q) ||
      pl.descriptionZh.includes(q) ||
      pl.tags.some((t) => t.toLowerCase().includes(q)) ||
      pl.tagsZh.some((t) => t.includes(q)) ||
      (q.includes('图') && pl.id === 'plugin-image-opt') ||
      (q.includes('摄影') && pl.id === 'plugin-image-opt') ||
      (q.includes('物流') && pl.id === 'plugin-shipping') ||
      (q.includes('货代') && pl.id === 'plugin-shipping') ||
      (q.includes('数据') && (pl.id === 'plugin-analytics' || pl.id === 'plugin-crm')) ||
      (q.includes('shopify') && (pl.id === 'plugin-analytics' || pl.id === 'plugin-translator')) ||
      (q.includes('翻译') && pl.id === 'plugin-translator')
  )

  return {
    people: people.length > 0 ? people : INITIAL_PEOPLE.slice(0, 1),
    organizations: organizations.length > 0 ? organizations : INITIAL_ORGANIZATIONS.slice(0, 1),
    agents: agents.length > 0 ? agents : INITIAL_AGENTS.slice(0, 1),
    plugins: plugins.length > 0 ? plugins : INITIAL_PLUGINS.slice(0, 1),
  }
}
