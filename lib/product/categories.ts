export interface Category {
  id: string
  name: string
  nameEn?: string
  slug: string
  parentId: string | null
  templateKey?: string | null
  icon?: string
  sortOrder: number
  isActive: boolean
  isPopular?: boolean
  keywords?: string[]
}

export interface CategoryTreeItem extends Category {
  children: Category[]
}

export interface CategoryBreadcrumb {
  primary: Category
  secondary?: Category
}

/**
 * Omnilink Standard 2-Level Category Taxonomy
 */
export const SEED_CATEGORIES: Category[] = [
  // ----------------------------------------------------
  // Level 1: 服饰鞋包 (apparel-accessories)
  // ----------------------------------------------------
  {
    id: 'cat-apparel',
    name: '服饰鞋包',
    nameEn: 'Apparel & Accessories',
    slug: 'apparel-accessories',
    parentId: null,
    icon: 'Shirt',
    sortOrder: 1,
    isActive: true,
  },
  {
    id: 'cat-apparel-women',
    name: '女装',
    nameEn: "Women's Clothing",
    slug: 'womens-clothing',
    parentId: 'cat-apparel',
    sortOrder: 1,
    isActive: true,
    isPopular: true,
    keywords: ['女装', '连衣裙', '卫衣', '外套', 'T恤', '衬衫', '半身裙', '裤子', '毛衣'],
  },
  {
    id: 'cat-apparel-men',
    name: '男装',
    nameEn: "Men's Clothing",
    slug: 'mens-clothing',
    parentId: 'cat-apparel',
    sortOrder: 2,
    isActive: true,
    isPopular: true,
    keywords: ['男装', '夹克', '西服', '牛仔裤', 'POLO衫', '卫衣', '工装裤', '羽绒服'],
  },
  {
    id: 'cat-apparel-shoes',
    name: '鞋靴',
    nameEn: 'Footwear & Shoes',
    slug: 'shoes',
    parentId: 'cat-apparel',
    templateKey: 'sports-shoes-v1',
    sortOrder: 3,
    isActive: true,
    isPopular: true,
    keywords: ['鞋靴', '皮鞋', '高跟鞋', '马丁靴', '拖鞋', '凉鞋', '雪地靴', '休闲鞋'],
  },
  {
    id: 'cat-apparel-bags',
    name: '箱包',
    nameEn: 'Bags & Luggage',
    slug: 'bags',
    parentId: 'cat-apparel',
    sortOrder: 4,
    isActive: true,
    isPopular: true,
    keywords: ['箱包', '双肩包', '单肩包', '手提包', '行李箱', '斜挎包', '钱包', '卡包'],
  },
  {
    id: 'cat-apparel-underwear',
    name: '内衣家居服',
    nameEn: 'Underwear & Loungewear',
    slug: 'underwear-loungewear',
    parentId: 'cat-apparel',
    sortOrder: 5,
    isActive: true,
    keywords: ['内衣', '文胸', '睡衣', '家居服', '内裤', '保暖内衣', '袜子', '丝袜'],
  },
  {
    id: 'cat-apparel-accessories',
    name: '服饰配饰',
    nameEn: 'Fashion Accessories',
    slug: 'fashion-accessories',
    parentId: 'cat-apparel',
    sortOrder: 6,
    isActive: true,
    keywords: ['配饰', '帽子', '围巾', '皮带', '手套', '领带', '丝巾', '袖扣'],
  },

  // ----------------------------------------------------
  // Level 1: 数码家电 (electronics)
  // ----------------------------------------------------
  {
    id: 'cat-electronics',
    name: '数码家电',
    nameEn: 'Electronics & Appliances',
    slug: 'electronics',
    parentId: null,
    icon: 'Smartphone',
    sortOrder: 2,
    isActive: true,
  },
  {
    id: 'cat-electronics-phones',
    name: '手机数码',
    nameEn: 'Mobile & Digital',
    slug: 'mobile-digital',
    parentId: 'cat-electronics',
    sortOrder: 1,
    isActive: true,
    isPopular: true,
    keywords: ['手机', '平板电脑', '数码相机', '单反', '充电宝', '数据线', '手机壳', '镜头'],
  },
  {
    id: 'cat-electronics-pc',
    name: '电脑办公',
    nameEn: 'Computers & Office',
    slug: 'computers-office',
    parentId: 'cat-electronics',
    sortOrder: 2,
    isActive: true,
    keywords: ['笔记本', '台式机', '显示器', '机械键盘', '鼠标', '打印机', '投影仪', 'NAS'],
  },
  {
    id: 'cat-electronics-audio',
    name: '影音娱乐',
    nameEn: 'Audio & Entertainment',
    slug: 'audio-entertainment',
    parentId: 'cat-electronics',
    templateKey: 'audio-headphones-v1',
    sortOrder: 3,
    isActive: true,
    isPopular: true,
    keywords: ['耳机', '降噪耳机', '蓝牙耳机', '头戴式耳机', '音箱', '回音壁', '麦克风', '声卡', '唱片机'],
  },
  {
    id: 'cat-electronics-wearables',
    name: '智能穿戴',
    nameEn: 'Smart Wearables',
    slug: 'smart-wearables',
    parentId: 'cat-electronics',
    templateKey: 'wearable-smartwatch-v1',
    sortOrder: 4,
    isActive: true,
    isPopular: true,
    keywords: ['智能手表', '智能手环', '智能手环', 'VR眼镜', '智能戒指', '健康监测仪', 'Apple Watch'],
  },
  {
    id: 'cat-electronics-large-appliances',
    name: '大家电',
    nameEn: 'Major Appliances',
    slug: 'major-appliances',
    parentId: 'cat-electronics',
    sortOrder: 5,
    isActive: true,
    keywords: ['冰箱', '洗衣机', '空调', '电视机', '油烟机', '热水器', '洗碗机', '烘干机'],
  },
  {
    id: 'cat-electronics-small-appliances',
    name: '生活小家电',
    nameEn: 'Small Appliances',
    slug: 'small-appliances',
    parentId: 'cat-electronics',
    sortOrder: 6,
    isActive: true,
    isPopular: true,
    keywords: ['空气净化器', '扫地机器人', '吸尘器', '吹风机', '咖啡机', '电饭煲', '养生壶', '电风扇'],
  },

  // ----------------------------------------------------
  // Level 1: 美妆个护 (beauty-personal-care)
  // ----------------------------------------------------
  {
    id: 'cat-beauty',
    name: '美妆个护',
    nameEn: 'Beauty & Personal Care',
    slug: 'beauty-personal-care',
    parentId: null,
    icon: 'Sparkles',
    sortOrder: 3,
    isActive: true,
  },
  {
    id: 'cat-beauty-skincare',
    name: '面部护肤',
    nameEn: 'Facial Skincare',
    slug: 'facial-skincare',
    parentId: 'cat-beauty',
    sortOrder: 1,
    isActive: true,
    isPopular: true,
    keywords: ['护肤', '精华', '面霜', '乳液', '爽肤水', '面膜', '防晒霜', '洁面', '眼霜'],
  },
  {
    id: 'cat-beauty-makeup',
    name: '彩妆香氛',
    nameEn: 'Makeup & Fragrance',
    slug: 'makeup-fragrance',
    parentId: 'cat-beauty',
    sortOrder: 2,
    isActive: true,
    isPopular: true,
    keywords: ['口红', '粉底液', '香水', '眼影', '睫毛膏', '遮瑕', '腮红', '散粉', '气垫'],
  },
  {
    id: 'cat-beauty-haircare',
    name: '个人洗护',
    nameEn: 'Hair & Body Wash',
    slug: 'hair-body-wash',
    parentId: 'cat-beauty',
    sortOrder: 3,
    isActive: true,
    keywords: ['洗发水', '护发素', '沐浴露', '牙膏', '电动牙刷', '洗手液', '发膜', '漱口水'],
  },
  {
    id: 'cat-beauty-bodycare',
    name: '身体护理',
    nameEn: 'Body Care',
    slug: 'body-care',
    parentId: 'cat-beauty',
    sortOrder: 4,
    isActive: true,
    keywords: ['身体乳', '护手霜', '磨砂膏', '精油', '脱毛膏', '止汗露'],
  },
  {
    id: 'cat-beauty-instruments',
    name: '美体美容仪器',
    nameEn: 'Beauty Devices',
    slug: 'beauty-devices',
    parentId: 'cat-beauty',
    sortOrder: 5,
    isActive: true,
    keywords: ['美容仪', '射频仪', '洁面仪', '脱毛仪', '黑头仪', '导入仪'],
  },

  // ----------------------------------------------------
  // Level 1: 运动户外 (sports-outdoors)
  // ----------------------------------------------------
  {
    id: 'cat-sports',
    name: '运动户外',
    nameEn: 'Sports & Outdoors',
    slug: 'sports-outdoors',
    parentId: null,
    icon: 'Compass',
    sortOrder: 4,
    isActive: true,
  },
  {
    id: 'cat-sports-shoes',
    name: '运动鞋',
    nameEn: 'Sports Shoes & Sneakers',
    slug: 'sports-shoes',
    parentId: 'cat-sports',
    templateKey: 'sports-shoes-v1',
    sortOrder: 1,
    isActive: true,
    isPopular: true,
    keywords: ['运动鞋', '跑鞋', '篮球鞋', '训练鞋', '板鞋', '足球鞋', '徒步鞋', '越野跑鞋'],
  },
  {
    id: 'cat-sports-apparel',
    name: '运动服饰',
    nameEn: 'Sportswear & Activewear',
    slug: 'sportswear',
    parentId: 'cat-sports',
    sortOrder: 2,
    isActive: true,
    keywords: ['运动裤', '速干衣', '瑜伽服', '冲锋衣', '运动内衣', '健身服', '防晒衣'],
  },
  {
    id: 'cat-sports-fitness',
    name: '健身器械',
    nameEn: 'Fitness Equipment',
    slug: 'fitness-equipment',
    parentId: 'cat-sports',
    sortOrder: 3,
    isActive: true,
    keywords: ['跑步机', '哑铃', '瑜伽垫', '动感单车', '划船机', '跳绳', '筋膜枪', '杠铃'],
  },
  {
    id: 'cat-sports-camping',
    name: '户外露营',
    nameEn: 'Camping & Hiking',
    slug: 'camping-hiking',
    parentId: 'cat-sports',
    sortOrder: 4,
    isActive: true,
    isPopular: true,
    keywords: ['帐篷', '睡袋', '露营椅', '天幕', '户外折叠桌', '登山杖', '户外水壶', '营地车'],
  },
  {
    id: 'cat-sports-cycling',
    name: '骑行滑雪',
    nameEn: 'Cycling & Skiing',
    slug: 'cycling-skiing',
    parentId: 'cat-sports',
    sortOrder: 5,
    isActive: true,
    keywords: ['公路车', '山地车', '滑板', '头盔', '骑行服', '雪板', '雪镜', '雪服'],
  },

  // ----------------------------------------------------
  // Level 1: 珠宝配饰与眼镜 (jewelry-eyewear)
  // ----------------------------------------------------
  {
    id: 'cat-jewelry-eyewear',
    name: '珠宝配饰与眼镜',
    nameEn: 'Jewelry, Watches & Eyewear',
    slug: 'jewelry-eyewear',
    parentId: null,
    icon: 'Glasses',
    sortOrder: 5,
    isActive: true,
  },
  {
    id: 'cat-eyewear-sunglasses',
    name: '太阳镜',
    nameEn: 'Sunglasses',
    slug: 'sunglasses',
    parentId: 'cat-jewelry-eyewear',
    templateKey: 'eyewear-sunglasses-v1',
    sortOrder: 1,
    isActive: true,
    isPopular: true,
    keywords: ['太阳镜', '墨镜', '偏光镜', '驾驶镜', '防紫外线眼镜', '蛤蟆镜', '复古墨镜'],
  },
  {
    id: 'cat-eyewear-optical',
    name: '光学眼镜与镜框',
    nameEn: 'Optical Glasses & Frames',
    slug: 'optical-glasses',
    parentId: 'cat-jewelry-eyewear',
    templateKey: 'eyewear-optical-v1',
    sortOrder: 2,
    isActive: true,
    isPopular: true,
    keywords: ['光学眼镜', '近视镜', '防蓝光眼镜', '眼镜框', '纯钛眼镜', '老花镜', '配镜'],
  },
  {
    id: 'cat-jewelry-fine',
    name: '黄金珠宝',
    nameEn: 'Fine Jewelry',
    slug: 'fine-jewelry',
    parentId: 'cat-jewelry-eyewear',
    sortOrder: 3,
    isActive: true,
    keywords: ['黄金', '钻石', '翡翠', '珍珠', '手镯', '项链', '戒指', '耳钉', '铂金'],
  },
  {
    id: 'cat-jewelry-fashion',
    name: '时尚饰品',
    nameEn: 'Fashion Jewelry',
    slug: 'fashion-jewelry',
    parentId: 'cat-jewelry-eyewear',
    sortOrder: 4,
    isActive: true,
    keywords: ['银饰', '手链', '发饰', '胸针', '耳环', '情侣对戒', '锁骨链'],
  },
  {
    id: 'cat-jewelry-watches',
    name: '潮流腕表',
    nameEn: 'Watches',
    slug: 'watches',
    parentId: 'cat-jewelry-eyewear',
    sortOrder: 5,
    isActive: true,
    keywords: ['机械表', '石英表', '男士手表', '女士手表', '瑞士表', '潜水表'],
  },

  // ----------------------------------------------------
  // Level 1: 家居家装 (home-living)
  // ----------------------------------------------------
  {
    id: 'cat-home',
    name: '家居家装',
    nameEn: 'Home & Living',
    slug: 'home-living',
    parentId: null,
    icon: 'Home',
    sortOrder: 6,
    isActive: true,
  },
  {
    id: 'cat-home-furniture',
    name: '住宅家具',
    nameEn: 'Furniture',
    slug: 'furniture',
    parentId: 'cat-home',
    sortOrder: 1,
    isActive: true,
    keywords: ['沙发', '床', '餐桌', '人体工学椅', '书架', '衣柜', '电视柜', '茶几'],
  },
  {
    id: 'cat-home-textiles',
    name: '家纺布艺',
    nameEn: 'Home Textiles',
    slug: 'home-textiles',
    parentId: 'cat-home',
    sortOrder: 2,
    isActive: true,
    keywords: ['四件套', '被子', '枕头', '窗帘', '地毯', '毛巾', '坐垫'],
  },
  {
    id: 'cat-home-lighting',
    name: '灯具照明',
    nameEn: 'Lighting',
    slug: 'lighting',
    parentId: 'cat-home',
    sortOrder: 3,
    isActive: true,
    keywords: ['吸顶灯', '台灯', '落地灯', '吊灯', '氛围灯', '智能灯泡', '护眼台灯'],
  },
  {
    id: 'cat-home-kitchen',
    name: '厨房卫浴',
    nameEn: 'Kitchen & Bath',
    slug: 'kitchen-bath',
    parentId: 'cat-home',
    sortOrder: 4,
    isActive: true,
    keywords: ['炒锅', '餐具', '水杯', '保温杯', '刀具', '花洒', '马桶', '毛巾架'],
  },
  {
    id: 'cat-home-daily',
    name: '日用收纳',
    nameEn: 'Storage & Organization',
    slug: 'storage-organization',
    parentId: 'cat-home',
    sortOrder: 5,
    isActive: true,
    keywords: ['收纳盒', '衣架', '纸巾', '垃圾桶', '清洁剂', '香薰', '除湿袋'],
  },

  // ----------------------------------------------------
  // Level 1: 食品生鲜 (food-beverage)
  // ----------------------------------------------------
  {
    id: 'cat-food',
    name: '食品饮料',
    nameEn: 'Food & Beverages',
    slug: 'food-beverages',
    parentId: null,
    icon: 'Coffee',
    sortOrder: 7,
    isActive: true,
  },
  {
    id: 'cat-food-snacks',
    name: '休闲零食',
    nameEn: 'Snacks & Sweets',
    slug: 'snacks',
    parentId: 'cat-food',
    sortOrder: 1,
    isActive: true,
    isPopular: true,
    keywords: ['坚果', '巧克力', '薯片', '肉脯', '饼干', '糖果', '糕点', '膨化食品'],
  },
  {
    id: 'cat-food-drinks',
    name: '咖啡茶饮',
    nameEn: 'Coffee & Tea Drinks',
    slug: 'coffee-tea-drinks',
    parentId: 'cat-food',
    sortOrder: 2,
    isActive: true,
    isPopular: true,
    keywords: ['咖啡豆', '挂耳咖啡', '绿茶', '红茶', '花草茶', '气泡水', '果汁', '燕麦奶'],
  },
  {
    id: 'cat-food-staples',
    name: '粮油调味',
    nameEn: 'Pantry & Condiments',
    slug: 'pantry-condiments',
    parentId: 'cat-food',
    sortOrder: 3,
    isActive: true,
    keywords: ['大米', '面粉', '橄榄油', '酱油', '调味酱', '火锅底料', '方便面'],
  },
  {
    id: 'cat-food-fresh',
    name: '生鲜水果',
    nameEn: 'Fresh Fruit & Meat',
    slug: 'fresh-food',
    parentId: 'cat-food',
    sortOrder: 4,
    isActive: true,
    keywords: ['苹果', '牛排', '三文鱼', '海鲜', '车厘子', '土鸡蛋', '有机蔬菜'],
  },
  {
    id: 'cat-food-health',
    name: '营养保健',
    nameEn: 'Health & Supplements',
    slug: 'health-supplements',
    parentId: 'cat-food',
    sortOrder: 5,
    isActive: true,
    keywords: ['维生素', '蛋白粉', '鱼油', '益生菌', '胶原蛋白', '叶黄素', '燕窝'],
  },

  // ----------------------------------------------------
  // Level 1: 母婴玩具 (mom-baby-toys)
  // ----------------------------------------------------
  {
    id: 'cat-baby',
    name: '母婴玩具',
    nameEn: 'Mom, Baby & Toys',
    slug: 'mom-baby-toys',
    parentId: null,
    icon: 'Baby',
    sortOrder: 8,
    isActive: true,
  },
  {
    id: 'cat-baby-wear',
    name: '婴儿服饰',
    nameEn: 'Baby Clothing',
    slug: 'baby-clothing',
    parentId: 'cat-baby',
    sortOrder: 1,
    isActive: true,
    keywords: ['连体衣', '包屁衣', '婴儿鞋', '口水巾', '婴儿睡袋', '童装'],
  },
  {
    id: 'cat-baby-food',
    name: '奶粉辅食',
    nameEn: 'Baby Formula & Food',
    slug: 'baby-formula-food',
    parentId: 'cat-baby',
    sortOrder: 2,
    isActive: true,
    keywords: ['奶粉', '米粉', '果泥', '磨牙棒', '溶豆', '儿童零食'],
  },
  {
    id: 'cat-baby-gear',
    name: '喂养与出行',
    nameEn: 'Feeding & Strollers',
    slug: 'feeding-strollers',
    parentId: 'cat-baby',
    sortOrder: 3,
    isActive: true,
    keywords: ['奶瓶', '吸奶器', '婴儿车', '安全座椅', '学步车', '消毒锅', '餐椅'],
  },
  {
    id: 'cat-baby-toys',
    name: '玩具乐器',
    nameEn: 'Toys & Hobbies',
    slug: 'toys-hobbies',
    parentId: 'cat-baby',
    sortOrder: 4,
    isActive: true,
    keywords: ['积木', '乐高', '手办', '拼图', '遥控车', '毛绒玩具', '早教机', '盲盒'],
  },

  // ----------------------------------------------------
  // Level 1: 宠物生活 (pet-supplies)
  // ----------------------------------------------------
  {
    id: 'cat-pet',
    name: '宠物生活',
    nameEn: 'Pet Supplies',
    slug: 'pet-supplies',
    parentId: null,
    icon: 'Dog',
    sortOrder: 9,
    isActive: true,
  },
  {
    id: 'cat-pet-food',
    name: '宠物主粮',
    nameEn: 'Pet Food',
    slug: 'pet-food',
    parentId: 'cat-pet',
    sortOrder: 1,
    isActive: true,
    isPopular: true,
    keywords: ['猫粮', '狗粮', '冻干', '主食罐头', '生骨肉', '幼猫粮', '全价粮'],
  },
  {
    id: 'cat-pet-snacks',
    name: '宠物零食',
    nameEn: 'Pet Treats',
    slug: 'pet-treats',
    parentId: 'cat-pet',
    sortOrder: 2,
    isActive: true,
    keywords: ['猫条', '肉干', '磨牙棒', '猫草', '冻干零食', '宠物奶粉'],
  },
  {
    id: 'cat-pet-supplies',
    name: '宠物用品与玩具',
    nameEn: 'Pet Goods & Toys',
    slug: 'pet-goods-toys',
    parentId: 'cat-pet',
    sortOrder: 3,
    isActive: true,
    keywords: ['猫砂', '猫砂盆', '猫爬架', '牵引绳', '宠物窝', '自动喂食器', '饮水机', '逗猫棒'],
  },
  {
    id: 'cat-pet-care',
    name: '宠物清洁医疗',
    nameEn: 'Pet Care & Health',
    slug: 'pet-care-health',
    parentId: 'cat-pet',
    sortOrder: 4,
    isActive: true,
    keywords: ['驱虫药', '宠物沐浴露', '指甲剪', '梳毛器', '耳道清洗液', '化毛膏'],
  },

  // ----------------------------------------------------
  // Level 1: 汽车与五金 (automotive-tools)
  // ----------------------------------------------------
  {
    id: 'cat-auto',
    name: '汽车与五金',
    nameEn: 'Automotive & Hardware',
    slug: 'automotive-hardware',
    parentId: null,
    icon: 'Car',
    sortOrder: 10,
    isActive: true,
  },
  {
    id: 'cat-auto-electronics',
    name: '车载电器',
    nameEn: 'Car Electronics',
    slug: 'car-electronics',
    parentId: 'cat-auto',
    sortOrder: 1,
    isActive: true,
    keywords: ['行车记录仪', '车载充气泵', '车载支架', '胎压监测', '车载蓝牙', '吸尘器'],
  },
  {
    id: 'cat-auto-accessories',
    name: '汽车内饰升级',
    nameEn: 'Car Interior & Care',
    slug: 'car-interior-care',
    parentId: 'cat-auto',
    sortOrder: 2,
    isActive: true,
    keywords: ['脚垫', '坐垫', '车载香薰', '玻璃水', '洗车水枪', '车蜡', '遮阳帘'],
  },
  {
    id: 'cat-auto-tools',
    name: '五金工具',
    nameEn: 'Hardware & Tools',
    slug: 'hardware-tools',
    parentId: 'cat-auto',
    sortOrder: 3,
    isActive: true,
    keywords: ['电钻', '螺丝刀', '工具箱', '测距仪', '万用表', '胶带', '梯子'],
  },
]

/**
 * Returns tree representation of all active categories (Level 1 with children Level 2)
 */
export function getCategoryTree(): CategoryTreeItem[] {
  const rootCategories = SEED_CATEGORIES.filter(
    (c) => c.parentId === null && c.isActive
  ).sort((a, b) => a.sortOrder - b.sortOrder)

  return rootCategories.map((root) => {
    const children = SEED_CATEGORIES.filter(
      (c) => c.parentId === root.id && c.isActive
    ).sort((a, b) => a.sortOrder - b.sortOrder)

    return {
      ...root,
      children,
    }
  })
}

/**
 * Get category by ID
 */
export function getCategoryById(id?: string | null): Category | null {
  if (!id) return null
  return SEED_CATEGORIES.find((c) => c.id === id) || null
}

/**
 * Find category by name or fuzzy synonym
 */
export function findCategoryByName(name?: string | null): Category | null {
  if (!name) return null
  const trimmed = name.trim()
  if (!trimmed) return null

  // 1. Direct name match (Secondary or Primary)
  const exact = SEED_CATEGORIES.find(
    (c) =>
      c.name.toLowerCase() === trimmed.toLowerCase() ||
      c.slug.toLowerCase() === trimmed.toLowerCase() ||
      (c.nameEn && c.nameEn.toLowerCase() === trimmed.toLowerCase())
  )
  if (exact) return exact

  // 2. Keyword match
  const keywordMatch = SEED_CATEGORIES.find((c) =>
    c.keywords?.some((k) => k.toLowerCase() === trimmed.toLowerCase())
  )
  if (keywordMatch) return keywordMatch

  // 3. Substring keyword match
  const subMatch = SEED_CATEGORIES.find((c) =>
    c.keywords?.some((k) => trimmed.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(trimmed.toLowerCase()))
  )
  if (subMatch) return subMatch

  // 4. Fallback: Level 1 name match
  const rootMatch = SEED_CATEGORIES.find((c) =>
    c.name.toLowerCase().includes(trimmed.toLowerCase()) || trimmed.toLowerCase().includes(c.name.toLowerCase())
  )
  return rootMatch || null
}

/**
 * Get category breadcrumb path from an ID or Name
 */
export function getCategoryBreadcrumb(categoryIdOrName?: string | null): CategoryBreadcrumb | null {
  if (!categoryIdOrName) return null
  
  let cat = getCategoryById(categoryIdOrName)
  if (!cat) {
    cat = findCategoryByName(categoryIdOrName)
  }
  if (!cat) return null

  if (cat.parentId) {
    const parent = getCategoryById(cat.parentId)
    if (parent) {
      return {
        primary: parent,
        secondary: cat,
      }
    }
  }

  return {
    primary: cat,
  }
}

/**
 * Get the attribute template key for a category (ID or name)
 */
export function getCategoryTemplateKey(categoryIdOrName?: string | null): string | null {
  if (!categoryIdOrName) return null

  const cat = getCategoryById(categoryIdOrName) || findCategoryByName(categoryIdOrName)
  if (cat?.templateKey) {
    return cat.templateKey
  }

  // Fallback synonyms for legacy templates
  const str = (cat?.name || categoryIdOrName).toLowerCase()
  if (str.includes('太阳镜') || str.includes('墨镜') || str.includes('sunglass')) {
    return 'eyewear-sunglasses-v1'
  }
  if (str.includes('光学眼镜') || str.includes('近视') || str.includes('眼镜框') || str.includes('optical')) {
    return 'eyewear-optical-v1'
  }
  if (str.includes('耳机') || str.includes('audio') || str.includes('headphone') || str.includes('earphone')) {
    return 'audio-headphones-v1'
  }
  if (str.includes('智能手表') || str.includes('智能穿戴') || str.includes('手环') || str.includes('watch')) {
    return 'wearable-smartwatch-v1'
  }
  if (str.includes('运动鞋') || str.includes('跑鞋') || str.includes('球鞋') || str.includes('shoes') || str.includes('sneaker')) {
    return 'sports-shoes-v1'
  }

  return null
}

/**
 * Return popular categories for quick selection
 */
export function getPopularCategories(): Category[] {
  return SEED_CATEGORIES.filter((c) => c.isPopular && c.parentId !== null)
}

/**
 * Search categories across primary names, secondary names, and keywords
 */
export function searchCategories(query: string): Array<{
  category: Category
  parent: Category | null
  matchedKeyword?: string
  displayPath: string
}> {
  const q = query.trim().toLowerCase()
  if (!q) return []

  const results: Array<{
    category: Category
    parent: Category | null
    matchedKeyword?: string
    displayPath: string
  }> = []

  // Check secondary categories first
  const secondaryCategories = SEED_CATEGORIES.filter((c) => c.parentId !== null)

  for (const cat of secondaryCategories) {
    const parent = getCategoryById(cat.parentId)
    const nameMatch = cat.name.toLowerCase().includes(q) || (cat.nameEn && cat.nameEn.toLowerCase().includes(q))
    const matchedKw = cat.keywords?.find((k) => k.toLowerCase().includes(q))
    const parentMatch = parent && (parent.name.toLowerCase().includes(q) || (parent.nameEn && parent.nameEn.toLowerCase().includes(q)))

    if (nameMatch || matchedKw || parentMatch) {
      results.push({
        category: cat,
        parent,
        matchedKeyword: matchedKw,
        displayPath: parent ? `${parent.name} > ${cat.name}` : cat.name,
      })
    }
  }

  return results
}
