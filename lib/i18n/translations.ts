export type Language = 'zh' | 'en'

export interface TranslationSchema {
  nav: {
    customerService: string
    dashboard: string
    products: string
    provenance: string
    capabilities: string
    network: string
    ai: string
    agentApi: string
    knowledge: string
    storefront: string
    store: string
    plugins: string
    account: string
    settings: string
    logout: string
    welcomeUser: string
    welcomeSubtitle: string
    moduleOverview: string
    activeModule: string
    searchPlaceholder: string
    notifications: string
    messages: string
    switchLang: string
  }
  dashboard: {
    spentThisMonth: string
    newClients: string
    earnings: string
    activity: string
    balance: string
    onTrack: string
    monthly: string
    saves: string
    totalExpense: string
    profitIncrease: string
    projects: string
    followers: string
    following: string
    availableCards: string
    availableCardsDesc: string
    addNewCard: string
    transfers: string
    today: string
    keepSafe: string
    keepSafeDesc: string
    updateSecurity: string
  }
  products: {
    totalCatalog: string
    aiReady: string
    actions: string
    smartImport: string
    catalogTitle: string
    catalogDesc: string
    addProduct: string
    units: string
    searchPlaceholder: string
    noProducts: string
    noProductsDesc: string
  }
  agentApi: {
    agentStatus: string
    bridgeReady: string
    availableEndpoints: string
    activeRest: string
    authentication: string
    authMethod: string
    dataEndpoints: string
    dataEndpointsDesc: string
    v1Ready: string
    copy: string
    copied: string
    endpointExplain: string
    queryParams: string
    semanticQuery: string
    semanticQueryDesc: string
    aiReadySchemas: string
    aiReadySchemasDesc: string
    bridgeHub: string
    bridgeHubDesc: string
    rateLimit: string
    latencyTarget: string
    generateKey: string
  }
  knowledge: {
    semanticMemory: string
    knowledgeHub: string
    vectorEmbeddings: string
    activeNodes: string
    readiness: string
    coverage: string
    coverageDesc: string
    knowledgeNodes: string
    brandIdentity: string
    companyProfile: string
    productSpecs: string
    faqGuidance: string
    aftersalePolicy: string
    shippingRules: string
    emptyContextDesc: string
    addKnowledgeNode: string
    recommendedActions: string
  }
  storefront: {
    liveStorefront: string
    multiThemeEnabled: string
    themeEngine: string
    modernClean: string
    storeConsole: string
    publishReady: string
    sections: string
    sectionsDesc: string
    navBar: string
    heroBanner: string
    productGrid: string
    footerPolicies: string
    visualDesigner: string
    visualDesignerDesc: string
    configureInStore: string
    themeProperties: string
    globalStyling: string
    primaryAccent: string
    cornerRadius: string
  }
  store: {
    storeConsole: string
    publicationState: string
    livePublished: string
    draftUnreleased: string
    publicUrl: string
    chooseTemplate: string
    chooseTemplateDesc: string
    publishingControls: string
    publishingControlsDesc: string
    storeOnline: string
    visitStorefront: string
    draftNotice: string
    publishStore: string
    updatePublication: string
    publishing: string
  }
  plugins: {
    installedExtensions: string
    active: string
    marketplaceCatalog: string
    plugins: string
    extensionEngine: string
    edgeRuntime: string
    all: string
    activated: string
    available: string
    enabled: string
    enable: string
  }
  account: {
    accountStatus: string
    activeVerified: string
    assignedStore: string
    securityKey: string
    oauthAuth: string
    accountDetails: string
    accountDetailsDesc: string
    emailAddress: string
    uniqueUserId: string
    registrationDate: string
    mfaNotice: string
    storePermissions: string
    storePermissionsDesc: string
    storeOwner: string
    authorized: string
    agentAccess: string
    fullRestRead: string
    changePassword: string
  }
  settings: {
    storeEntity: string
    industryCategory: string
    configuration: string
    productionMode: string
    storeProfile: string
    storeProfileDesc: string
    storeDisplayName: string
    storeSlug: string
    industrySector: string
    syncNotice: string
    systemPreferences: string
    systemPreferencesDesc: string
    currencySymbol: string
    imageWatermarking: string
    enabledState: string
    savePreferences: string
  }
  common: {
    loading: string
    save: string
    cancel: string
    delete: string
    edit: string
    view: string
  }
}

export const translations: Record<Language, TranslationSchema> = {
  zh: {
    nav: {
      customerService: 'AI',
      dashboard: '概览',
      products: '商品',
      provenance: '来源',
      capabilities: '能力',
      network: '网络',
      ai: 'AI',
      agentApi: '网络与接口',
      knowledge: '知识库',
      storefront: '网页设计',
      store: '店铺控制台',
      plugins: '能力中心',
      account: '账户信息',
      settings: '全局设置',
      logout: '退出登录',
      welcomeUser: '欢迎，{name}！',
      welcomeSubtitle: '今日 AI 语义节点与 Agent 对接状态概览',
      moduleOverview: '管理与配置您的服务与参数',
      activeModule: '当前模块',
      searchPlaceholder: '全局搜索或输入指令…',
      notifications: '系统通知',
      messages: '站内消息',
      switchLang: '切换为英文',
    },
    dashboard: {
      spentThisMonth: '本月支出',
      newClients: '新增客户 / Agent',
      earnings: '本月收益',
      activity: '活跃度 / 流量',
      balance: '资金与结算平衡',
      onTrack: '平稳运行',
      monthly: '按月统计',
      saves: '留存率',
      totalExpense: '总投入与运营支出',
      profitIncrease: '净利润比上月增长 34%',
      projects: '项目',
      followers: '关注者',
      following: '已关注',
      availableCards: '钱包可用虚拟卡 与智能限额',
      availableCardsDesc: '便捷管理数字化结算卡，支持智能限额配置、即时语义支付与安全 Agent 商务交易。',
      addNewCard: '添加新卡片',
      transfers: '近期交易流水',
      today: '今天',
      keepSafe: '安全守护与防护',
      keepSafeDesc: '定期更新双重验证与操作密钥',
      updateSecurity: '更新安全凭据',
    },
    products: {
      totalCatalog: '商品目录总数',
      aiReady: 'AI 语义就绪节点',
      actions: '快捷操作',
      smartImport: '智能表格导入',
      catalogTitle: '商品与 AI 语义节点库',
      catalogDesc: '管理商品基础信息、语义标签，生成标准 Agent 消费数据',
      addProduct: '新建商品',
      units: '件',
      searchPlaceholder: '按商品名称或分类搜索…',
      noProducts: '暂无商品数据',
      noProductsDesc: '导入表格或添加第一个商品，开启 AI 语义节点构建。',
    },
    agentApi: {
      agentStatus: 'Agent 连通状态',
      bridgeReady: '桥接网关就绪',
      availableEndpoints: '可用服务接口',
      activeRest: '1 个活跃 REST',
      authentication: '鉴权与安全通道',
      authMethod: 'Bearer Token / API 密钥',
      dataEndpoints: '数据接口端点',
      dataEndpointsDesc: '外部 AI Agent 获取结构化商品语义与实时库存的接入端点',
      v1Ready: 'v1.0 就绪',
      copy: '复制',
      copied: '已复制',
      endpointExplain: '返回所有验证就绪商品的标准 JSON-LD 结构化语义模型。',
      queryParams: '支持查询参数',
      semanticQuery: '语义即时检索',
      semanticQueryDesc: '自主 Agent 可实时查询库存、定价与规整参数，用于导购决策。',
      aiReadySchemas: '严格结构化规范',
      aiReadySchemasDesc: '零幻觉保证：数据格式严格契合 OpenAgent 与 OpenAPI 标准契约。',
      bridgeHub: 'Agent 网关控制中心',
      bridgeHubDesc: '将外部 LLM Agent（ChatGPT、Claude、自主 Multi-Agent 系统）直接接入您的商品知识库。',
      rateLimit: '速率限制',
      latencyTarget: '响应延迟目标',
      generateKey: '生成新 API 密钥',
    },
    knowledge: {
      semanticMemory: '语义知识中枢',
      knowledgeHub: 'AI 知识库',
      vectorEmbeddings: '向量化嵌入节点',
      activeNodes: '个活跃节点',
      readiness: '知识就绪度',
      coverage: '语义覆盖率',
      coverageDesc: '面向 AI Agent 的商品与政策知识覆盖比例',
      knowledgeNodes: '知识分类节点',
      brandIdentity: '品牌形象与定位',
      companyProfile: '企业背景资料',
      productSpecs: '商品参数标准',
      faqGuidance: '常见问答与指引',
      aftersalePolicy: '售后与保障政策',
      shippingRules: '物流履约规则',
      emptyContextDesc: '为该分类补充关键信息与规章政策，让 AI 导购与 Agent 能够精准应答顾客咨询。',
      addKnowledgeNode: '添加知识条目',
      recommendedActions: '推荐补充项',
    },
    storefront: {
      liveStorefront: '在线商城状态',
      multiThemeEnabled: '多主题引擎已启用',
      themeEngine: '当前应用主题',
      modernClean: '现代极简风格',
      storeConsole: '店铺管理中心',
      publishReady: '发布就绪',
      sections: '页面模块结构',
      sectionsDesc: '可拖拽拼装的商城布局组件',
      navBar: '全局导航栏',
      heroBanner: 'Hero 视觉焦点区',
      productGrid: '商品陈列网格',
      footerPolicies: '页脚与政策栏',
      visualDesigner: '可视化所见即所得设计器',
      visualDesignerDesc: '实时设计与预览您的独立站商城。切换配色主题、调整排版字体，轻松编排商品展示模块。',
      configureInStore: '前往店铺控制台发布',
      themeProperties: '全局样式规则',
      globalStyling: '配色与视觉规范',
      primaryAccent: '主品牌高亮色',
      cornerRadius: '全局圆角弧度',
    },
    store: {
      storeConsole: '店铺控制台',
      publicationState: '全网发布状态',
      livePublished: '已全网正式上线',
      draftUnreleased: '草稿模式 / 待发布',
      publicUrl: '公开访问路径',
      chooseTemplate: '选择店铺装修模板',
      chooseTemplateDesc: '选择最契合您品牌格调与商品陈列方式的模板方案',
      publishingControls: '发布与分发控制',
      publishingControlsDesc: '一键将当前选定模板与商品语义节点同步至生产环境。',
      storeOnline: '独立商城正在平稳运行中',
      visitStorefront: '访问在线商城',
      draftNotice: '当前商城处于草稿预览阶段。点击下方按钮即可一键全网发布。',
      publishStore: '发布独立站商城',
      updatePublication: '更新在线版本',
      publishing: '正在发布中…',
    },
    plugins: {
      installedExtensions: '已启用插件',
      active: '个活跃中',
      marketplaceCatalog: '插件应用生态',
      plugins: '款可用插件',
      extensionEngine: '扩展执行引擎',
      edgeRuntime: 'Edge Runtime v2',
      all: '全部插件',
      activated: '已激活',
      available: '未启用',
      enabled: '已启用',
      enable: '启用插件',
    },
    account: {
      accountStatus: '账户状态',
      activeVerified: '正常运行 & 已认证',
      assignedStore: '所属店铺',
      securityKey: '安全凭据',
      oauthAuth: 'OAuth 2.0 鉴权',
      accountDetails: '账户凭证与资料',
      accountDetailsDesc: '商户所有者凭证与 Supabase 鉴权配置',
      emailAddress: '登录邮箱',
      uniqueUserId: '商户唯一 ID (UUID)',
      registrationDate: '注册时间',
      mfaNotice: '多因素身份验证 (MFA) 由 Supabase Auth 安全引擎提供保护。',
      storePermissions: '店铺管理权限',
      storePermissionsDesc: '您拥有最高所有者权限，可修改商品、构建 AI 语义节点及生成 API 密钥。',
      storeOwner: '店铺所有者',
      authorized: '已授权',
      agentAccess: 'Agent 访问权限',
      fullRestRead: '完整 REST / 只读查询',
      changePassword: '修改登录密码',
    },
    settings: {
      storeEntity: '店铺主体',
      industryCategory: '行业分类',
      configuration: '运行模式',
      productionMode: '生产模式',
      storeProfile: '店铺档案与标识',
      storeProfileDesc: '在平台注册的核心店铺元数据',
      storeDisplayName: '店铺对外显示名称',
      storeSlug: '命名空间 / 唯一标识',
      industrySector: '行业类别',
      syncNotice: '配置将自动同步至您的商户主数据库与 Agent 节点。',
      systemPreferences: '系统偏好设置',
      systemPreferencesDesc: '管理货币单位、图片动态防盗水印及数据导出规则。',
      currencySymbol: '结算货币符号',
      imageWatermarking: '商品图防盗水印',
      enabledState: '已开启',
      savePreferences: '保存偏好设置',
    },
    common: {
      loading: '加载中…',
      save: '保存',
      cancel: '取消',
      delete: '删除',
      edit: '编辑',
      view: '查看',
    },
  },
  en: {
    nav: {
      customerService: 'AI',
      dashboard: 'Overview',
      products: 'Products',
      provenance: 'Provenance',
      capabilities: 'Capabilities',
      network: 'Network',
      ai: 'AI',
      agentApi: 'Agent API',
      knowledge: 'Knowledge',
      storefront: 'Storefront',
      store: 'Store Console',
      plugins: 'Capabilities',
      account: 'Account',
      settings: 'Settings',
      logout: 'Log Out',
      welcomeUser: 'Hello, {name}!',
      welcomeSubtitle: 'Explore information and activity about your AI agent network',
      moduleOverview: 'Manage and configure your parameters and services',
      activeModule: 'Active Module',
      searchPlaceholder: 'Search anything or prompt…',
      notifications: 'Notifications',
      messages: 'Messages',
      switchLang: 'Switch to Chinese',
    },
    dashboard: {
      spentThisMonth: 'Spent this month',
      newClients: 'New clients',
      earnings: 'Earnings',
      activity: 'Activity',
      balance: 'Balance',
      onTrack: 'On track',
      monthly: 'Monthly',
      saves: 'Saves',
      totalExpense: 'Total Expense',
      profitIncrease: 'Profit is 34% More than last Month',
      projects: 'Projects',
      followers: 'Followers',
      following: 'Following',
      availableCards: 'Available Credit Card in Wallet',
      availableCardsDesc: 'Manage your digital cards seamlessly. Access instant semantic payments, tokenized smart limits, and secure agent commerce.',
      addNewCard: 'Add New Card',
      transfers: 'Your Transfers',
      today: 'Today',
      keepSafe: 'Keep you safe!',
      keepSafeDesc: 'Update your security password',
      updateSecurity: 'Update Your Security',
    },
    products: {
      totalCatalog: 'Total Catalog',
      aiReady: 'AI-Ready Nodes',
      actions: 'Quick Actions',
      smartImport: 'Smart Import',
      catalogTitle: 'Product Catalog & AI Nodes',
      catalogDesc: 'Manage product specs and generate structured semantic datasets for Agents',
      addProduct: 'Add Product',
      units: 'Units',
      searchPlaceholder: 'Search products by name or category…',
      noProducts: 'No products in catalog yet',
      noProductsDesc: 'Import your spreadsheet or add your first product to begin building AI-ready semantic nodes.',
    },
    agentApi: {
      agentStatus: 'Agent Status',
      bridgeReady: 'Bridge Ready',
      availableEndpoints: 'Available Endpoints',
      activeRest: '1 Active REST',
      authentication: 'Authentication',
      authMethod: 'Bearer Token / Key',
      dataEndpoints: 'Data Endpoints',
      dataEndpointsDesc: 'Structured endpoints for external AI Agents to query your store semantic catalog',
      v1Ready: 'v1.0 Ready',
      copy: 'Copy',
      copied: 'Copied',
      endpointExplain: 'Returns standard JSON-LD structured semantic models of all verified products.',
      queryParams: 'Query params',
      semanticQuery: 'Semantic Query',
      semanticQueryDesc: 'Autonomous agents can query real-time stock, pricing, and structured specs for customer guidance.',
      aiReadySchemas: 'AI Ready Schemas',
      aiReadySchemasDesc: 'Zero hallucinations: response formats strictly match OpenAgent and OpenAPI schemas.',
      bridgeHub: 'Agent Bridge Hub',
      bridgeHubDesc: 'Connect external LLM agents (ChatGPT, Claude, Custom Multi-Agent Systems) directly to your product knowledge.',
      rateLimit: 'Rate Limit',
      latencyTarget: 'Latency Target',
      generateKey: 'Generate API Key',
    },
    knowledge: {
      semanticMemory: 'Semantic Memory',
      knowledgeHub: 'AI Knowledge Hub',
      vectorEmbeddings: 'Vector Embeddings',
      activeNodes: 'Active Nodes',
      readiness: 'Readiness',
      coverage: 'Coverage',
      coverageDesc: 'Semantic knowledge coverage for AI',
      knowledgeNodes: 'Knowledge Nodes',
      brandIdentity: 'Brand Identity',
      companyProfile: 'Company Profile',
      productSpecs: 'Product Specs',
      faqGuidance: 'FAQ & Guidance',
      aftersalePolicy: 'After-sale Policy',
      shippingRules: 'Shipping Rules',
      emptyContextDesc: 'Add key information and policy details for this category so your AI Assistant and Agents can provide authoritative answers to customer inquiries.',
      addKnowledgeNode: 'Add Knowledge Node',
      recommendedActions: 'Recommended Actions',
    },
    storefront: {
      liveStorefront: 'Live Storefront',
      multiThemeEnabled: 'Multi-theme Enabled',
      themeEngine: 'Theme Engine',
      modernClean: 'Modern Clean',
      storeConsole: 'Store Console',
      publishReady: 'Publish Ready',
      sections: 'Sections',
      sectionsDesc: 'Draggable layout components',
      navBar: 'Navigation Bar',
      heroBanner: 'Hero Banner & CTA',
      productGrid: 'Product Grid Catalog',
      footerPolicies: 'Footer & Policies',
      visualDesigner: 'Visual Drag & Drop Designer',
      visualDesignerDesc: 'Design and preview your custom storefront in real time. Switch themes, adjust typography, and rearrange modular product blocks effortlessly.',
      configureInStore: 'Configure in Store Console',
      themeProperties: 'Theme Properties',
      globalStyling: 'Global styling rules',
      primaryAccent: 'Primary Accent',
      cornerRadius: 'Corner Radius',
    },
    store: {
      storeConsole: 'Store Console',
      publicationState: 'Publication State',
      livePublished: 'Live Published',
      draftUnreleased: 'Draft / Unreleased',
      publicUrl: 'Public URL',
      chooseTemplate: 'Choose Store Template',
      chooseTemplateDesc: 'Select the layout and visual presentation for your online presence',
      publishingControls: 'Publishing Controls',
      publishingControlsDesc: 'Deploy your selected template and product catalog to the live storefront URL.',
      storeOnline: 'Store is currently online',
      visitStorefront: 'Visit storefront',
      draftNotice: 'Your storefront is currently in draft mode. Click the button below to publish it live to the web.',
      publishStore: 'Publish Store',
      updatePublication: 'Update Publication',
      publishing: 'Publishing…',
    },
    plugins: {
      installedExtensions: 'Installed Extensions',
      active: 'Active',
      marketplaceCatalog: 'Marketplace Catalog',
      plugins: 'Plugins',
      extensionEngine: 'Extension Engine',
      edgeRuntime: 'Edge Run Time v2',
      all: 'All',
      activated: 'Activated',
      available: 'Available',
      enabled: 'Enabled',
      enable: 'Enable',
    },
    account: {
      accountStatus: 'Account Status',
      activeVerified: 'Active & Verified',
      assignedStore: 'Assigned Store',
      securityKey: 'Security Key',
      oauthAuth: 'OAuth 2.0 Auth',
      accountDetails: 'Account Details',
      accountDetailsDesc: 'Merchant user credentials and authentication profile',
      emailAddress: 'Email Address',
      uniqueUserId: 'Unique User ID (UUID)',
      registrationDate: 'Registration Date',
      mfaNotice: 'Multi-Factor Authentication (MFA) is managed through Supabase Security.',
      storePermissions: 'Store Permissions',
      storePermissionsDesc: 'You have full administrative owner access to modify products, publish AI nodes, and generate API keys.',
      storeOwner: 'Store Owner',
      authorized: 'Authorized',
      agentAccess: 'Agent Access',
      fullRestRead: 'Full REST/Read',
      changePassword: 'Change Password',
    },
    settings: {
      storeEntity: 'Store Entity',
      industryCategory: 'Industry Category',
      configuration: 'Configuration',
      productionMode: 'Production Mode',
      storeProfile: 'Store Profile & Identity',
      storeProfileDesc: 'Core parameters registered with Omnilink',
      storeDisplayName: 'Store Display Name',
      storeSlug: 'Store Slug / Namespace',
      industrySector: 'Industry Sector',
      syncNotice: 'Settings are synchronized with your active store database.',
      systemPreferences: 'System Preferences',
      systemPreferencesDesc: 'Control localized currency formatting, watermark stamping, and data export schedules.',
      currencySymbol: 'Currency Symbol',
      imageWatermarking: 'Image Watermarking',
      enabledState: 'Enabled',
      savePreferences: 'Save Preferences',
    },
    common: {
      loading: 'Loading…',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      view: 'View',
    },
  },
}
