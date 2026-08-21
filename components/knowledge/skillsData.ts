export interface AiSkillItem {
  id: string
  name: string
  category: 'recommended' | 'industry' | 'community'
  categoryLabel: string
  description: string
  author: string
  icon: string
  badge?: string
  systemPromptModifier: string
  inputsNeeded?: string
  isProOnly?: boolean
  downloads?: number
}

export const AI_SKILLS_LIBRARY: AiSkillItem[] = [
  {
    id: 'skill-compliance',
    name: '合规审查',
    category: 'recommended',
    categoryLabel: '推荐技能',
    description: '深度校验产品描述与资料是否符合欧美法规（GPSR、CE、FCC、FDA、电池指令等），定位潜在下架风险。',
    author: 'Omnilink 官方',
    icon: 'Scale',
    badge: '官方认证',
    systemPromptModifier: '作为资深跨境法务与合规专家，对所选知识库文档执行严格的法规合规条款对照与风险评级。',
    isProOnly: false,
    downloads: 1420,
  },
  {
    id: 'skill-competitor',
    name: '竞品分析',
    category: 'recommended',
    categoryLabel: '推荐技能',
    description: '对比竞品拆解、物料成本(BOM)、核心性能参数与定价策略，输出 SWOT 与差异化竞争研报。',
    author: 'Omnilink 官方',
    icon: 'Crosshair',
    badge: '高频使用',
    systemPromptModifier: '作为商业分析师，横向对比我司方案与竞品的核心参数、BOM物料成本结构及市场差异化优势。',
    isProOnly: false,
    downloads: 2180,
  },
  {
    id: 'skill-copywriting',
    name: '文案生成',
    category: 'recommended',
    categoryLabel: '推荐技能',
    description: '提炼产品卖点与技术参数，生成符合欧美本土化语言习惯的高转化独立站文案与社媒营销内容。',
    author: 'Omnilink 官方',
    icon: 'Sparkles',
    badge: '官方认证',
    systemPromptModifier: '作为欧美本土化营销专家，将知识库中的硬核研发参数转化为高转化率的产品卖点与传播文案。',
    isProOnly: false,
    downloads: 3890,
  },
  {
    id: 'skill-ecommerce-copy',
    name: '电商文案',
    category: 'industry',
    categoryLabel: '行业技能',
    description: '针对亚马逊 Listing、Shopify 详情页的 5 点描述 (Bullet Points) 与 A+ 页面架构设计。',
    author: 'CrossBorder Lab',
    icon: 'ShoppingBag',
    systemPromptModifier: '生成符合海外电商平台算法推荐与用户阅读习惯的 5 点描述和详情页架构。',
    isProOnly: false,
    downloads: 1840,
  },
  {
    id: 'skill-supply-chain',
    name: '供应链优化',
    category: 'industry',
    categoryLabel: '行业技能',
    description: '评估物料采购交期、供应商阶梯报价与关税清关风险，输出采购降本策略。',
    author: 'SCM Pro',
    icon: 'Truck',
    systemPromptModifier: '从采购成本、阶梯单价、MOQ与海运周期维度分析供应链可行性并给出优化建议。',
    isProOnly: true,
    downloads: 920,
  },
  {
    id: 'skill-patent-search',
    name: '专利查重',
    category: 'industry',
    categoryLabel: '行业技能',
    description: '检索全球发明/外观专利，分析权利要求书覆盖范围，规避海外侵权诉讼。',
    author: 'IP Global',
    icon: 'ShieldCheck',
    systemPromptModifier: '对照知识库中的研发结构与公开专利数据库进行权利要求比对，提示潜在侵权风险。',
    isProOnly: true,
    downloads: 780,
  },
  {
    id: 'skill-community-seo',
    name: '海外 SEO 关键词挖掘',
    category: 'community',
    categoryLabel: '社区技能',
    description: '分析 Google 搜索意图与长尾买家词，生成关键词布局矩阵与元标签 (Meta Tags)。',
    author: 'GrowthHacker_Tom',
    icon: 'TrendingUp',
    systemPromptModifier: '提取知识库的核心特征词并映射为高意图海外搜索关键词与 SEO 优化结构。',
    isProOnly: false,
    downloads: 1250,
  },
  {
    id: 'skill-community-voc',
    name: '差评 VOC 归因分析',
    category: 'community',
    categoryLabel: '社区技能',
    description: '将用户真实差评反馈与研发规格交叉比对，定位质量痛点与迭代路线。',
    author: 'DataSense_AI',
    icon: 'Bot',
    systemPromptModifier: '对知识库中的反馈与规格进行 VOC 用户心声归因分析，列出改善优先级。',
    isProOnly: false,
    downloads: 1610,
  },
]
