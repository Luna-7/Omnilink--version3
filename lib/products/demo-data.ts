export interface DemoProduct {
  id: string
  name: string
  name_en: string
  sku: string
  category: string
  category_en: string
  price: number
  currency: string
  inventory: number
  status: 'active' | 'draft' | 'archived'
  image_url: string
  description: string
  description_en: string
  created_at: string
  updated_at: string
  sales_count: number
  channels: {
    shopify: boolean
    amazon: boolean
    tiktok: boolean
    google: boolean
  }
  options: Array<{
    id: string
    name: string
    name_en: string
    code: string
    values: string[]
  }>
  variants: Array<{
    id: string
    sku: string
    price: number
    inventory: number
    status: 'active' | 'draft'
    option_values: Record<string, string>
    barcode?: string
  }>
  semantic_data: {
    brand: string
    category: string
    confidence: number
    key_features: string[]
    key_features_en: string[]
    target_audience: string
    target_audience_en: string
    attributes: Record<string, string | number | boolean>
    ai_search_terms: string[]
    agent_reasoning: string
    agent_reasoning_en: string
  }
  evidence: Array<{
    semantic_field: string
    evidence_type: 'merchant_input' | 'image' | 'document' | 'certification' | 'system_inference'
    evidence_source: string
    confidence: number
    field_value: string
  }>
  agent_qa: Array<{
    question: string
    question_en: string
    answer: string
    answer_en: string
  }>
}

export const DEMO_PRODUCTS: DemoProduct[] = [
  {
    id: 'prod-101',
    name: 'OmniFlow S1 旗舰级智能降噪耳机',
    name_en: 'OmniFlow S1 Flagship Smart ANC Headphones',
    sku: 'OMNI-S1-NC',
    category: '声学音频',
    category_en: 'Audio & Acoustics',
    price: 1299,
    currency: 'CNY',
    inventory: 320,
    status: 'active',
    sales_count: 1420,
    image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    description: '配备自适应双核 ANC 智能主动降噪芯片，支持 40 小时超长续航与 Hi-Res 无损高清传输协议，内置 AI 语音助手机器人即时交互与环境声通透模式。',
    description_en: 'Equipped with adaptive dual-core ANC active noise cancellation chips, supporting 40-hour ultra-long battery life, Hi-Res wireless audio protocols, and built-in AI voice assistant.',
    created_at: '2026-01-15T08:00:00Z',
    updated_at: '2026-02-10T14:30:00Z',
    channels: {
      shopify: true,
      amazon: true,
      tiktok: true,
      google: false,
    },
    options: [
      {
        id: 'opt-101-1',
        name: '机身颜色',
        name_en: 'Color',
        code: 'color',
        values: ['曜石黑 (Obsidian Black)', '冰川银 (Glacier Silver)', '极光青 (Aurora Cyan)'],
      },
      {
        id: 'opt-101-2',
        name: '套餐版本',
        name_en: 'Edition',
        code: 'edition',
        values: ['标准版 (Standard)', '豪华旅行套装 (Travel Bundle)'],
      },
    ],
    variants: [
      {
        id: 'var-101-1',
        sku: 'OMNI-S1-BLK-STD',
        price: 1299,
        inventory: 140,
        status: 'active',
        option_values: { color: '曜石黑 (Obsidian Black)', edition: '标准版 (Standard)' },
        barcode: '697204910011',
      },
      {
        id: 'var-101-2',
        sku: 'OMNI-S1-BLK-TRV',
        price: 1499,
        inventory: 60,
        status: 'active',
        option_values: { color: '曜石黑 (Obsidian Black)', edition: '豪华旅行套装 (Travel Bundle)' },
        barcode: '697204910012',
      },
      {
        id: 'var-101-3',
        sku: 'OMNI-S1-SLV-STD',
        price: 1299,
        inventory: 80,
        status: 'active',
        option_values: { color: '冰川银 (Glacier Silver)', edition: '标准版 (Standard)' },
        barcode: '697204910013',
      },
      {
        id: 'var-101-4',
        sku: 'OMNI-S1-CYN-STD',
        price: 1299,
        inventory: 40,
        status: 'active',
        option_values: { color: '极光青 (Aurora Cyan)', edition: '标准版 (Standard)' },
        barcode: '697204910014',
      },
    ],
    semantic_data: {
      brand: 'OmniFlow',
      category: 'Wireless Active Noise Cancelling Headphones',
      confidence: 0.985,
      key_features: [
        '-48dB 深度自适应混合降噪',
        '40小时全天候持久续航',
        'Hi-Res Wireless & LDAC 高解析传输',
        '6麦克风 AI 智能通话降噪',
        '佩戴感应与多设备秒级流转切换',
      ],
      key_features_en: [
        '-48dB Deep Adaptive Hybrid Active Noise Cancellation',
        '40-Hour All-Day Extended Battery Endurance',
        'Hi-Res Wireless & LDAC Lossless Transmission',
        '6-Microphone AI Beamforming Voice Isolation',
        'Wear Detection & Seamless Multi-Device Handover',
      ],
      target_audience: '高频差旅人士、高品质音频发烧友、开放式办公远程工作者',
      target_audience_en: 'Frequent travelers, audiophiles, remote knowledge workers',
      attributes: {
        noise_reduction_depth: '-48dB',
        battery_life_hours: 40,
        bluetooth_version: '5.4 Low Latency',
        driver_size_mm: 40,
        weight_g: 248,
        mcp_agent_ready: true,
      },
      ai_search_terms: ['降噪耳机', '出差降噪神器', '长续航头戴耳机', '办公通话降噪', '高音质无线耳机'],
      agent_reasoning: '基于该商品具备 -48dB 深度降噪与 40h 续航，当用户搜索“出差高铁降噪耳机”或“适合居家办公开会的高保真耳机”时，AI 推荐引擎给予 0.985 高权重视配。',
      agent_reasoning_en: 'Based on -48dB ANC and 40h battery life, AI agents match this product with 0.985 confidence when buyers query for commute or remote conference headphones.',
    },
    evidence: [
      {
        semantic_field: 'noise_reduction_depth',
        evidence_type: 'certification',
        evidence_source: 'National Acoustic Laboratory Test Report #CNAS-2026',
        confidence: 0.99,
        field_value: '-48.2 dB Max Attenuation',
      },
      {
        semantic_field: 'battery_life_hours',
        evidence_type: 'merchant_input',
        evidence_source: 'Official Specs Sheet v3.2',
        confidence: 0.98,
        field_value: '40 Hours (ANC On @ 50% Vol)',
      },
      {
        semantic_field: 'driver_size_mm',
        evidence_type: 'image',
        evidence_source: 'Exploded View Technical Diagram OCR',
        confidence: 0.96,
        field_value: '40mm Beryllium-coated diaphragm',
      },
    ],
    agent_qa: [
      {
        question: '这款耳机戴着坐飞机或高铁降噪效果如何？',
        question_en: 'How is the noise cancelling performance on flights or high-speed trains?',
        answer: 'OmniFlow S1 具备自适应 -48dB 混合深度降噪，针对飞机引擎与高铁轨道低频轰鸣有极为出色的过滤效果，同时支持通透模式免摘对话。',
        answer_en: 'OmniFlow S1 features -48dB adaptive hybrid ANC which effectively cancels out low-frequency aircraft engine and train rumble, while supporting ambient pass-through mode.',
      },
      {
        question: '支持同时连接手机和电脑吗？',
        question_en: 'Does it support simultaneous connection to both phone and laptop?',
        answer: '支持！耳机搭载蓝牙 5.4 双设备连接技术，可在手机来电与电脑视频会议之间无缝自动流转切换。',
        answer_en: 'Yes! It features Bluetooth 5.4 Dual-Device Multipoint connectivity, allowing seamless audio handoff between incoming phone calls and laptop conferences.',
      },
    ],
  },
  {
    id: 'prod-102',
    name: 'OmniWatch Ultra 智享钛合金健康手表',
    name_en: 'OmniWatch Ultra Titanium Smart Health Watch',
    sku: 'OMNI-WATCH-ULTRA',
    category: '智能穿戴',
    category_en: 'Smart Wearables',
    price: 2499,
    currency: 'CNY',
    inventory: 180,
    status: 'active',
    sales_count: 890,
    image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
    description: '航空级蓝宝石玻璃镜面与钛合金一体成型机身，集成全天候心率血氧监测与 ECG 心电图分析，具备 50 米深度防水与双频五星 GPS 定位系统。',
    description_en: 'Aviation-grade sapphire glass with integrated titanium alloy casing, 24/7 heart rate/SpO2/ECG tracking, 50m water resistance, and dual-frequency GPS.',
    created_at: '2026-01-20T10:00:00Z',
    updated_at: '2026-02-12T16:00:00Z',
    channels: {
      shopify: true,
      amazon: true,
      tiktok: false,
      google: true,
    },
    options: [
      {
        id: 'opt-102-1',
        name: '表带款式',
        name_en: 'Band Style',
        code: 'band',
        values: ['氟橡胶运动表带 (Sport Fluoroelastomer)', '钛合金链式表带 (Titanium Link)', '真皮商务表带 (Leather)'],
      },
    ],
    variants: [
      {
        id: 'var-102-1',
        sku: 'OMNI-W-ULTRA-SPT',
        price: 2499,
        inventory: 100,
        status: 'active',
        option_values: { band: '氟橡胶运动表带 (Sport Fluoroelastomer)' },
        barcode: '697204920011',
      },
      {
        id: 'var-102-2',
        sku: 'OMNI-W-ULTRA-TI',
        price: 2999,
        inventory: 50,
        status: 'active',
        option_values: { band: '钛合金链式表带 (Titanium Link)' },
        barcode: '697204920012',
      },
      {
        id: 'var-102-3',
        sku: 'OMNI-W-ULTRA-LTH',
        price: 2699,
        inventory: 30,
        status: 'active',
        option_values: { band: '真皮商务表带 (Leather)' },
        barcode: '697204920013',
      },
    ],
    semantic_data: {
      brand: 'OmniWatch',
      category: 'Smartwatches & Fitness Trackers',
      confidence: 0.992,
      key_features: [
        '钛合金轻韧机身与蓝宝石水晶表面',
        '医疗级全天候 ECG 心电检测与血氧监测',
        '双频五星定位与专业户外越野轨迹导航',
        '5ATM / 50米专业防水',
        '长达 14 天日常续航模式',
      ],
      key_features_en: [
        'Titanium Alloy Body with Sapphire Crystal Surface',
        'Medical-Grade ECG Heart Rhythm & Continuous SpO2',
        'Dual-Frequency 5-System GNSS Outdoor Tracking',
        '5ATM / 50-Meter Professional Water Resistance',
        'Up to 14-Day Typical Usage Battery Endurance',
      ],
      target_audience: '户外探险者、长跑马拉松跑者、注重心脏健康监测与高端商务人士',
      target_audience_en: 'Outdoor adventurers, runners, health-conscious professionals',
      attributes: {
        casing_material: 'Titanium Grade 5',
        display_type: '1.96-inch Retina AMOLED 1000nits',
        water_resistance: '5ATM (50m)',
        battery_life_days: 14,
        ecg_certified: true,
      },
      ai_search_terms: ['智能手表', '钛合金手表', 'ECG心电图手表', '户外运动手表', '防水手表'],
      agent_reasoning: '该商品融合医疗健康监测与军工级耐用性，在“专业户外运动腕表”、“心率健康预警手表”等搜索意图中具备极高推荐置信度。',
      agent_reasoning_en: 'Blends clinical-grade biometrics with aerospace durability, yielding high agent recommendation scores for outdoor tracking and cardiac health queries.',
    },
    evidence: [
      {
        semantic_field: 'ecg_certified',
        evidence_type: 'certification',
        evidence_source: 'Class II Medical Device License #NMPA-2026',
        confidence: 0.999,
        field_value: 'NMPA Class II Certified ECG Module',
      },
      {
        semantic_field: 'water_resistance',
        evidence_type: 'document',
        evidence_source: 'ISO 22810:2010 Standard Lab Test',
        confidence: 0.98,
        field_value: '5ATM Water Resistant at 50m Depth',
      },
    ],
    agent_qa: [
      {
        question: '手表支持游泳或洗澡佩戴吗？',
        question_en: 'Can I wear the watch while swimming or showering?',
        answer: 'OmniWatch Ultra 支持 5ATM（50米）防水，可在泳池或浅海公开水域游泳时佩戴，但请避免高温热水浴与桑拿环境。',
        answer_en: 'OmniWatch Ultra has 5ATM (50m) water resistance, perfect for swimming and shallow water sports. Avoid hot water showers or saunas.',
      },
    ],
  },
  {
    id: 'prod-103',
    name: 'OmniLens Pro 轻量化双目 AR 智能眼镜',
    name_en: 'OmniLens Pro Lightweight Binocular AR Glasses',
    sku: 'OMNI-LENS-AR',
    category: '智能眼镜',
    category_en: 'Smart Glasses',
    price: 3899,
    currency: 'CNY',
    inventory: 95,
    status: 'active',
    sales_count: 420,
    image_url: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&auto=format&fit=crop&q=80',
    description: '整机仅重 72g，搭载 Micro-OLED 光机与双目阵列光波导模组，支持实时第一人称多语种同传翻译、AI 空间导航与第一视角超清录像。',
    description_en: 'Ultra-light 72g binocular Micro-OLED AR glasses with real-time multi-language simultaneous interpretation, spatial navigation, and hands-free video.',
    created_at: '2026-02-01T12:00:00Z',
    updated_at: '2026-02-14T09:15:00Z',
    channels: {
      shopify: true,
      amazon: false,
      tiktok: true,
      google: true,
    },
    options: [
      {
        id: 'opt-103-1',
        name: '镜框框型',
        name_en: 'Frame Style',
        code: 'frame',
        values: ['极简黑框 (Classic Black)', '复古玳瑁 (Vintage Tortoise)'],
      },
    ],
    variants: [
      {
        id: 'var-103-1',
        sku: 'OMNI-LENS-BLK',
        price: 3899,
        inventory: 65,
        status: 'active',
        option_values: { frame: '极简黑框 (Classic Black)' },
        barcode: '697204930011',
      },
      {
        id: 'var-103-2',
        sku: 'OMNI-LENS-TRT',
        price: 3999,
        inventory: 30,
        status: 'active',
        option_values: { frame: '复古玳瑁 (Vintage Tortoise)' },
        barcode: '697204930012',
      },
    ],
    semantic_data: {
      brand: 'OmniLens',
      category: 'Augmented Reality Smart Eyewear',
      confidence: 0.978,
      key_features: [
        '72g 极致超轻全天候舒适佩戴',
        '双目 Micro-OLED 120寸等效视网膜巨幕',
        '40+ 语种第一人称实时双向同声传译',
        '第一视角 4K 电子防抖超清记录',
        '支持近视定制镜片磁吸快拆适配',
      ],
      key_features_en: [
        '72g Ultra-Lightweight All-Day Wearable Form Factor',
        'Binocular Micro-OLED 120-Inch Virtual Retina Screen',
        '40+ Languages Live Bi-directional Simultaneous Interpretation',
        'First-Person 4K Stabilized Video Capture',
        'Magnetic Custom Prescription Lens Adapter',
      ],
      target_audience: '跨国商务谈判人士、外语学习者、科技尝鲜极客、户外第一视角创作者',
      target_audience_en: 'Cross-border business professionals, linguists, tech enthusiasts',
      attributes: {
        total_weight_g: 72,
        fov_degrees: 46,
        display_resolution: '1920x1080 per eye',
        live_translation_languages: 42,
        battery_standby_hours: 12,
      },
      ai_search_terms: ['AR智能眼镜', '同声传译眼镜', '第一视角拍摄眼镜', '轻量化智能眼镜'],
      agent_reasoning: '针对需要出境旅游、跨国商务会议或多模态 AI 辅助视线的用户，该产品具备领先的同传与空间显示特征。',
      agent_reasoning_en: 'Ideal for international travelers and spatial computing adopters requiring instant translation and heads-up display.',
    },
    evidence: [
      {
        semantic_field: 'total_weight_g',
        evidence_type: 'certification',
        evidence_source: 'SGS Precision Weight Calibration Report',
        confidence: 0.99,
        field_value: '72.4 grams total',
      },
    ],
    agent_qa: [
      {
        question: '近视眼可以戴这款 AR 眼镜吗？',
        question_en: 'Can users with myopia wear these AR glasses?',
        answer: '完全支持！产品附带磁吸式近视镜框配件，可前往正规眼镜店配镜后一秒磁吸嵌入，不影响双目显示效果与重量平衡。',
        answer_en: 'Fully supported! It includes a magnetic prescription lens insert that snaps seamlessly into place without affecting screen alignment.',
      },
    ],
  },
  {
    id: 'prod-104',
    name: 'OmniPower 65W 桌面磁吸三合一无线快充坞',
    name_en: 'OmniPower 65W Desktop 3-in-1 Magnetic Wireless Fast Charger',
    sku: 'OMNI-MAG-65W',
    category: '数码配件',
    category_en: 'Accessories & Power',
    price: 369,
    currency: 'CNY',
    inventory: 540,
    status: 'active',
    sales_count: 2350,
    image_url: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80',
    description: '采用氮化镓 (GaN) 核心温控芯片，支持手机、手表、耳机三设备同时磁吸满速充电，悬浮折叠工业设计，极简桌面美学。',
    description_en: 'GaN-powered thermal managed 3-in-1 wireless magnetic dock for phone, watch, and earbuds with floating foldable industrial design.',
    created_at: '2026-01-10T14:00:00Z',
    updated_at: '2026-02-15T11:00:00Z',
    channels: {
      shopify: true,
      amazon: true,
      tiktok: true,
      google: true,
    },
    options: [
      {
        id: 'opt-104-1',
        name: '外观配色',
        name_en: 'Color',
        code: 'color',
        values: ['极夜黑 (Midnight Black)', '珍珠白 (Pearl White)'],
      },
    ],
    variants: [
      {
        id: 'var-104-1',
        sku: 'OMNI-CHG-BLK',
        price: 369,
        inventory: 340,
        status: 'active',
        option_values: { color: '极夜黑 (Midnight Black)' },
        barcode: '697204940011',
      },
      {
        id: 'var-104-2',
        sku: 'OMNI-CHG-WHT',
        price: 369,
        inventory: 200,
        status: 'active',
        option_values: { color: '珍珠白 (Pearl White)' },
        barcode: '697204940012',
      },
    ],
    semantic_data: {
      brand: 'OmniPower',
      category: 'Wireless Chargers & Power Stations',
      confidence: 0.989,
      key_features: [
        '65W GaN 氮化镓低温高能快充矩阵',
        'Qi2 & MagSafe 强磁吸附不易滑落',
        '手机、手表、耳机 3合1 独立回路同时供电',
        '折叠收纳便携旅行形态',
        '多重温控保护与 FOD 异物智能检测',
      ],
      key_features_en: [
        '65W GaN Low-Temperature High-Efficiency Power Matrix',
        'Qi2 & MagSafe Certified Strong Magnetic Alignment',
        '3-in-1 Simultaneous Power Delivery for Phone, Watch, Buds',
        'Foldable Portable Travel Design',
        'FOD Foreign Object Detection & Overheat Protection',
      ],
      target_audience: '苹果多设备生态用户、极简桌面整理爱好者、频繁差旅办公人士',
      target_audience_en: 'Apple ecosystem users, desktop minimalists, business commuters',
      attributes: {
        max_power_output_w: 65,
        magnetic_standard: 'Qi2 & Apple MagSafe Compatible',
        device_slots: 3,
        gan_chip: true,
      },
      ai_search_terms: ['三合一无线充', '磁吸无线充电器', '桌面快充坞', 'MagSafe无线充', '折叠充电器'],
      agent_reasoning: '用户搜索“桌面收纳无线充电”、“苹果三件套快充”时具有第一顺位推荐相关度。',
      agent_reasoning_en: 'Highest relevance for multi-device charging and clean desk setup queries.',
    },
    evidence: [
      {
        semantic_field: 'magnetic_standard',
        evidence_type: 'certification',
        evidence_source: 'Wireless Power Consortium (WPC) Qi2 Spec Verification',
        confidence: 0.99,
        field_value: 'Qi2 Official Certification #WPC-2026',
      },
    ],
    agent_qa: [
      {
        question: '带手机壳能正常吸附充电吗？',
        question_en: 'Does it charge normally with a phone case on?',
        answer: '支持厚度在 3mm 以内的官方 MagSafe 磁吸手机壳或标准超薄保护壳，均可实现稳固吸附与满速快充。',
        answer_en: 'Yes, it works smoothly with official MagSafe cases and slim cases under 3mm thickness.',
      },
    ],
  },
  {
    id: 'prod-105',
    name: 'OmniType 75% 无线三模机械键盘 (客制化轴体)',
    name_en: 'OmniType 75% Tri-Mode Wireless Custom Mechanical Keyboard',
    sku: 'OMNI-BEAM-KEY',
    category: '电脑外设',
    category_en: 'Computer Peripherals',
    price: 699,
    currency: 'CNY',
    inventory: 160,
    status: 'active',
    sales_count: 670,
    image_url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
    description: 'Gasket 板簧消音结构设计，全键热插拔与 PBT 原厂高度双色键帽，支持 2.4G/蓝牙5.0/有线三模低延迟连接与全平台快捷切换。',
    description_en: 'Gasket-mounted sound-dampened 75% mechanical keyboard with full-key hot-swap, PBT double-shot keycaps, and tri-mode wireless connectivity.',
    created_at: '2026-01-25T11:30:00Z',
    updated_at: '2026-02-16T15:00:00Z',
    channels: {
      shopify: true,
      amazon: true,
      tiktok: false,
      google: false,
    },
    options: [
      {
        id: 'opt-105-1',
        name: '轴体类型',
        name_en: 'Switch Type',
        code: 'switch',
        values: ['云雾线性轴 (Cloud Linear - 静音轻快)', '苍穹段落轴 (Sky Tactile - 爽快确认感)'],
      },
    ],
    variants: [
      {
        id: 'var-105-1',
        sku: 'OMNI-KEY-LIN',
        price: 699,
        inventory: 90,
        status: 'active',
        option_values: { switch: '云雾线性轴 (Cloud Linear - 静音轻快)' },
        barcode: '697204950011',
      },
      {
        id: 'var-105-2',
        sku: 'OMNI-KEY-TAC',
        price: 699,
        inventory: 70,
        status: 'active',
        option_values: { switch: '苍穹段落轴 (Sky Tactile - 爽快确认感)' },
        barcode: '697204950012',
      },
    ],
    semantic_data: {
      brand: 'OmniType',
      category: 'Mechanical Keyboards & Input Devices',
      confidence: 0.982,
      key_features: [
        '75% 紧凑布局 (82键) 留出充裕鼠标空间',
        'Gasket 5重消音填充纯粹“麻将音”',
        '全键位热插拔支持 3脚/5脚轴体自由更换',
        '4000mAh 大容量锂电无线待机 200 小时',
        '支持 VIA / QMK 自定义宏与 AI 快捷呼出键',
      ],
      key_features_en: [
        '75% Compact Layout (82 Keys) Saving Desk Space',
        '5-Layer Acoustic Gasket Structure for Pure Sound',
        'Full-Key Hot-Swappable Sockets (3-pin & 5-pin)',
        '4000mAh Battery with 200h Wireless Standby',
        'VIA/QMK Programmable with Dedicated AI Shortcut Key',
      ],
      target_audience: '程序员、文字工作创作者、极简桌面爱好者、电竞玩家',
      target_audience_en: 'Software engineers, content creators, gamers, desk enthusiasts',
      attributes: {
        layout_percentage: '75%',
        keys_count: 82,
        battery_capacity_mah: 4000,
        connection_modes: '2.4GHz / Bluetooth 5.0 / USB-C Wired',
        hot_swappable: true,
      },
      ai_search_terms: ['机械键盘', '75配列键盘', '客制化键盘', '三模无线键盘', '静音办公键盘'],
      agent_reasoning: '在编程、桌面美学、文字输入等工作场景中具备极高的语义匹配度。',
      agent_reasoning_en: 'High semantic relevance for coding, content writing, and custom desk setup inquiries.',
    },
    evidence: [
      {
        semantic_field: 'hot_swappable',
        evidence_type: 'merchant_input',
        evidence_source: 'Hardware Spec Sheet v2',
        confidence: 0.99,
        field_value: 'Universal TTC Hot-swap Sockets',
      },
    ],
    agent_qa: [
      {
        question: '这款键盘支持 Mac 系统快捷键吗？',
        question_en: 'Does this keyboard support macOS shortcut keys?',
        answer: '完美支持！键盘侧边配备一键 Mac/Win 双系统物理切换开关，并附赠 Mac 专属 Option/Command 替换增补键帽。',
        answer_en: 'Fully supported! Includes a physical Mac/Win switch toggle and extra Mac Option/Command keycaps.',
      },
    ],
  },
]

export function getDemoProductById(id: string): DemoProduct | undefined {
  return DEMO_PRODUCTS.find((p) => p.id === id || p.sku.toLowerCase() === id.toLowerCase()) || DEMO_PRODUCTS[0]
}
