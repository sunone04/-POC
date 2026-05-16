import dayjs from 'dayjs'

export const brandStories = [
  {
    id: 1,
    title: '亚细亚的诞生——中原商战的传奇起点',
    category: '品牌故事',
    content: '1989年5月6日，郑州亚细亚商场在二七广场开业，以"中原之行哪里去——郑州亚细亚"的广告语响彻全国。亚细亚不仅是一家商场，更是一种商业文化的象征，开创了中国现代百货零售的先河。',
    tags: ['品牌历史', '商战传奇'],
    createdAt: '2026-01-15'
  },
  {
    id: 2,
    title: '服务至上——亚细亚的服务理念传承',
    category: '品牌文化',
    content: '亚细亚始终秉承"顾客至上"的服务理念，从最早的迎宾礼仪到如今的智慧服务，每一步都在践行对顾客的承诺。微笑服务、专业导购、无忧退换，这些服务标准已成为亚细亚的品牌基因。',
    tags: ['服务理念', '品牌文化'],
    createdAt: '2026-02-10'
  },
  {
    id: 3,
    title: '焕新出发——新亚细亚的数字化转型之路',
    category: '品牌故事',
    content: '在数字化浪潮中，亚细亚积极拥抱变革，通过AI技术赋能内容营销，实现从传统百货向智慧零售的转型升级。新亚细亚不仅保留了经典的服务温度，更注入了科技的力量。',
    tags: ['数字化转型', 'AI营销'],
    createdAt: '2026-03-20'
  }
]

export const memberBenefits = [
  {
    id: 1,
    title: '银卡会员权益',
    level: '银卡',
    benefits: ['消费积分1倍', '生日双倍积分', '会员专属折扣9.5折', '免费停车2小时'],
    condition: '消费满2000元升级'
  },
  {
    id: 2,
    title: '金卡会员权益',
    level: '金卡',
    benefits: ['消费积分2倍', '生日三倍积分', '会员专属折扣9折', '免费停车4小时', '新品优先体验'],
    condition: '消费满10000元升级'
  },
  {
    id: 3,
    title: '钻石卡会员权益',
    level: '钻石卡',
    benefits: ['消费积分3倍', '生日五倍积分', '会员专属折扣8.5折', '免费停车全天', 'VIP专属导购', '年度感恩礼'],
    condition: '消费满50000元升级'
  }
]

export const qualityArticles = [
  {
    id: 1,
    title: '2026春季穿搭指南：从亚细亚出发的时尚之旅',
    category: '时尚穿搭',
    views: 12580,
    likes: 892,
    shares: 356,
    createdAt: '2026-03-01',
    status: 'published',
    platform: '公众号'
  },
  {
    id: 2,
    title: '母亲节特辑：给妈妈最好的礼物',
    category: '节日营销',
    views: 8920,
    likes: 645,
    shares: 278,
    createdAt: '2026-05-08',
    status: 'published',
    platform: '公众号'
  },
  {
    id: 3,
    title: '亚细亚37周年庆：回忆与新生',
    category: '品牌活动',
    views: 23400,
    likes: 1890,
    shares: 756,
    createdAt: '2026-05-06',
    status: 'published',
    platform: '视频号'
  },
  {
    id: 4,
    title: '夏日清凉好物推荐TOP10',
    category: '好物推荐',
    views: 6780,
    likes: 423,
    shares: 189,
    createdAt: '2026-05-10',
    status: 'published',
    platform: '抖音'
  },
  {
    id: 5,
    title: '会员日专属福利：限时秒杀攻略',
    category: '会员营销',
    views: 15600,
    likes: 1234,
    shares: 567,
    createdAt: '2026-05-15',
    status: 'draft',
    platform: '企微'
  }
]

export const rulesAndPolicies = [
  {
    id: 1,
    title: '退换货政策',
    content: '7天无理由退换货，30天质量问题包退，会员享受延长退换期至15天。',
    category: '售后政策'
  },
  {
    id: 2,
    title: '积分使用规则',
    content: '积分可在全场通用，100积分抵1元，积分有效期为获取之日起12个月。',
    category: '积分规则'
  },
  {
    id: 3,
    title: '促销活动规范',
    content: '所有促销活动需提前7天报备，折扣力度不得低于成本价，活动期间保证库存充足。',
    category: '营销规范'
  },
  {
    id: 4,
    title: '品牌合作条款',
    content: '入驻品牌需提供正品保障，配合商场营销活动，遵守亚细亚品牌形象规范。',
    category: '合作条款'
  }
]

export const scheduledTasks = [
  {
    id: 1,
    name: '每日公众号文章',
    type: '定时',
    platform: '公众号',
    contentType: '文章',
    schedule: '每日 08:00',
    cronExpression: '0 8 * * *',
    status: 'active',
    lastRun: '2026-05-13 08:00:00',
    nextRun: '2026-05-14 08:00:00',
    totalProduced: 156,
    config: {
      useHotTopics: true,
      hotTopicSource: '微博热搜+百度热搜',
      template: '每日推荐',
      wordCount: '800-1200'
    }
  },
  {
    id: 2,
    name: '每日抖音短视频',
    type: '定时',
    platform: '抖音',
    contentType: '视频',
    schedule: '每日 10:00',
    cronExpression: '0 10 * * *',
    status: 'active',
    lastRun: '2026-05-13 10:00:00',
    nextRun: '2026-05-14 10:00:00',
    totalProduced: 142,
    config: {
      useHotTopics: true,
      videoDuration: '15-60秒',
      style: '种草推荐',
      autoPublish: true
    }
  },
  {
    id: 3,
    name: '每日视频号内容',
    type: '定时',
    platform: '视频号',
    contentType: '视频',
    schedule: '每日 12:00',
    cronExpression: '0 12 * * *',
    status: 'active',
    lastRun: '2026-05-13 12:00:00',
    nextRun: '2026-05-14 12:00:00',
    totalProduced: 98,
    config: {
      useHotTopics: true,
      videoDuration: '30-120秒',
      style: '品牌故事',
      autoPublish: false
    }
  },
  {
    id: 4,
    name: '企微社群推送',
    type: '定时',
    platform: '企微',
    contentType: '图文',
    schedule: '每日 18:00',
    cronExpression: '0 18 * * *',
    status: 'active',
    lastRun: '2026-05-13 18:00:00',
    nextRun: '2026-05-14 18:00:00',
    totalProduced: 210,
    config: {
      useHotTopics: false,
      contentFocus: '会员专属优惠',
      pushTarget: '全部社群',
      includeCoupon: true
    }
  },
  {
    id: 5,
    name: '每周品牌故事',
    type: '定时',
    platform: '公众号',
    contentType: '文章',
    schedule: '每周一 09:00',
    cronExpression: '0 9 * * 1',
    status: 'active',
    lastRun: '2026-05-11 09:00:00',
    nextRun: '2026-05-18 09:00:00',
    totalProduced: 24,
    config: {
      useHotTopics: false,
      template: '品牌故事',
      wordCount: '1500-2000',
      includeImages: true
    }
  }
]

export const marketingNodes = [
  { id: 1, name: '元旦', date: '2026-01-01', type: '公历节日', advanceDays: 7, status: 'completed' },
  { id: 2, name: '春节', date: '2026-02-17', type: '农历节日', advanceDays: 14, status: 'completed' },
  { id: 3, name: '情人节', date: '2026-02-14', type: '公历节日', advanceDays: 7, status: 'completed' },
  { id: 4, name: '妇女节', date: '2026-03-08', type: '公历节日', advanceDays: 7, status: 'completed' },
  { id: 5, name: '清明节', date: '2026-04-05', type: '农历节气', advanceDays: 5, status: 'completed' },
  { id: 6, name: '劳动节', date: '2026-05-01', type: '公历节日', advanceDays: 10, status: 'completed' },
  { id: 7, name: '母亲节', date: '2026-05-10', type: '公历节日', advanceDays: 7, status: 'completed' },
  { id: 8, name: '亚细亚店庆日', date: '2026-05-06', type: '店庆日', advanceDays: 14, status: 'completed' },
  { id: 9, name: '会员日', date: '2026-05-15', type: '会员日', advanceDays: 5, status: 'upcoming' },
  { id: 10, name: '儿童节', date: '2026-06-01', type: '公历节日', advanceDays: 7, status: 'upcoming' },
  { id: 11, name: '端午节', date: '2026-06-19', type: '农历节日', advanceDays: 10, status: 'upcoming' },
  { id: 12, name: '父亲节', date: '2026-06-21', type: '公历节日', advanceDays: 7, status: 'upcoming' },
  { id: 13, name: '七夕节', date: '2026-08-20', type: '农历节日', advanceDays: 10, status: 'upcoming' },
  { id: 14, name: '中秋节', date: '2026-09-25', type: '农历节日', advanceDays: 10, status: 'upcoming' },
  { id: 15, name: '国庆节', date: '2026-10-01', type: '公历节日', advanceDays: 14, status: 'upcoming' },
  { id: 16, name: '双十一', date: '2026-11-11', type: '购物节', advanceDays: 14, status: 'upcoming' },
  { id: 17, name: '圣诞节', date: '2026-12-25', type: '公历节日', advanceDays: 10, status: 'upcoming' },
  { id: 18, name: '会员日', date: '2026-06-15', type: '会员日', advanceDays: 5, status: 'upcoming' },
  { id: 19, name: '立夏', date: '2026-05-05', type: '农历节气', advanceDays: 3, status: 'completed' },
  { id: 20, name: '小满', date: '2026-05-21', type: '农历节气', advanceDays: 3, status: 'upcoming' }
]

export const contentItems = [
  {
    id: 1,
    title: '520爱在亚细亚——浪漫好礼推荐',
    type: '文章',
    platform: '公众号',
    status: 'published',
    createdAt: '2026-05-12 08:00',
    publishedAt: '2026-05-12 08:00',
    views: 8560,
    likes: 623,
    comments: 89,
    shares: 234,
    triggerType: '营销节点',
    triggerName: '520'
  },
  {
    id: 2,
    title: '夏日清爽穿搭｜亚细亚时尚指南',
    type: '视频',
    platform: '抖音',
    status: 'published',
    createdAt: '2026-05-13 10:00',
    publishedAt: '2026-05-13 10:15',
    views: 23400,
    likes: 1890,
    comments: 256,
    shares: 567,
    triggerType: '定时',
    triggerName: '每日抖音短视频'
  },
  {
    id: 3,
    title: '会员日预告：超值优惠抢先看',
    type: '图文',
    platform: '企微',
    status: 'scheduled',
    createdAt: '2026-05-12 15:00',
    publishedAt: null,
    views: 0,
    likes: 0,
    comments: 0,
    shares: 0,
    triggerType: '营销节点',
    triggerName: '会员日'
  },
  {
    id: 4,
    title: '亚细亚品牌故事：37年风雨兼程',
    type: '视频',
    platform: '视频号',
    status: 'published',
    createdAt: '2026-05-06 09:00',
    publishedAt: '2026-05-06 09:30',
    views: 45600,
    likes: 3456,
    comments: 567,
    shares: 1234,
    triggerType: '营销节点',
    triggerName: '店庆日'
  },
  {
    id: 5,
    title: '每日好物推荐：居家必备好物',
    type: '文章',
    platform: '公众号',
    status: 'published',
    createdAt: '2026-05-13 08:00',
    publishedAt: '2026-05-13 08:00',
    views: 5670,
    likes: 345,
    comments: 67,
    shares: 123,
    triggerType: '定时',
    triggerName: '每日公众号文章'
  },
  {
    id: 6,
    title: '母亲节特辑——给妈妈最好的爱',
    type: '视频',
    platform: '抖音',
    status: 'published',
    createdAt: '2026-05-09 10:00',
    publishedAt: '2026-05-09 10:10',
    views: 67800,
    likes: 5670,
    comments: 890,
    shares: 2345,
    triggerType: '营销节点',
    triggerName: '母亲节'
  },
  {
    id: 7,
    title: '618年中大促攻略',
    type: '文章',
    platform: '公众号',
    status: 'draft',
    createdAt: '2026-05-13 14:00',
    publishedAt: null,
    views: 0,
    likes: 0,
    comments: 0,
    shares: 0,
    triggerType: '营销节点',
    triggerName: '618'
  }
]

export const platformData = [
  {
    name: '公众号',
    connected: true,
    icon: 'WechatOutlined',
    followers: 125000,
    avgViews: 8500,
    avgLikes: 620,
    publishCount: 156,
    color: '#07c160'
  },
  {
    name: '抖音',
    connected: true,
    icon: 'PlayCircleOutlined',
    followers: 89000,
    avgViews: 23000,
    avgLikes: 1890,
    publishCount: 142,
    color: '#fe2c55'
  },
  {
    name: '视频号',
    connected: true,
    icon: 'VideoCameraOutlined',
    followers: 56000,
    avgViews: 12000,
    avgLikes: 890,
    publishCount: 98,
    color: '#fa9d3b'
  },
  {
    name: '企微',
    connected: true,
    icon: 'TeamOutlined',
    followers: 45000,
    avgViews: 6700,
    avgLikes: 450,
    publishCount: 210,
    color: '#2b7ce9'
  },
  {
    name: '小红书',
    connected: false,
    icon: 'BookOutlined',
    followers: 0,
    avgViews: 0,
    avgLikes: 0,
    publishCount: 0,
    color: '#ff2442'
  }
]

export const analyticsData = {
  contentTrend: [
    { date: '05-07', articles: 3, videos: 2, images: 5, totalViews: 45600 },
    { date: '05-08', articles: 4, videos: 3, images: 6, totalViews: 52300 },
    { date: '05-09', articles: 3, videos: 4, images: 4, totalViews: 78900 },
    { date: '05-10', articles: 2, videos: 2, images: 5, totalViews: 34500 },
    { date: '05-11', articles: 4, videos: 3, images: 7, totalViews: 67800 },
    { date: '05-12', articles: 3, videos: 2, images: 5, totalViews: 51200 },
    { date: '05-13', articles: 4, videos: 3, images: 6, totalViews: 58900 }
  ],
  platformDistribution: [
    { name: '公众号', value: 156 },
    { name: '抖音', value: 142 },
    { name: '视频号', value: 98 },
    { name: '企微', value: 210 }
  ],
  contentTypeDistribution: [
    { name: '文章', value: 180 },
    { name: '视频', value: 240 },
    { name: '图文', value: 286 }
  ],
  topPerformingContent: [
    {
      id: 6,
      title: '母亲节特辑——给妈妈最好的爱',
      platform: '抖音',
      views: 67800,
      engagement: 8.9,
      analysisCompleted: true,
      insights: '情感类内容在节日前1-2天发布效果最佳，视频前3秒需有强情感钩子，背景音乐选择温暖治愈风格可提升完播率35%。'
    },
    {
      id: 4,
      title: '亚细亚品牌故事：37年风雨兼程',
      platform: '视频号',
      views: 45600,
      engagement: 11.5,
      analysisCompleted: true,
      insights: '品牌故事类内容在店庆节点发布效果显著，怀旧元素+新面貌对比叙事可提升分享率，用户评论中"回忆""情怀"关键词出现频率最高。'
    },
    {
      id: 2,
      title: '夏日清爽穿搭｜亚细亚时尚指南',
      platform: '抖音',
      views: 23400,
      engagement: 6.2,
      analysisCompleted: true,
      insights: '穿搭类视频15-30秒最佳，快节奏剪辑+真人试穿效果优于图片轮播，添加购物车链接可提升转化率。'
    }
  ],
  engagementTrend: [
    { date: '05-07', likes: 2340, comments: 456, shares: 789 },
    { date: '05-08', likes: 2670, comments: 523, shares: 890 },
    { date: '05-09', likes: 4560, comments: 890, shares: 1567 },
    { date: '05-10', likes: 1890, comments: 345, shares: 678 },
    { date: '05-11', likes: 3450, comments: 678, shares: 1234 },
    { date: '05-12', likes: 2780, comments: 534, shares: 923 },
    { date: '05-13', likes: 3120, comments: 612, shares: 1056 }
  ]
}

export const hotTopics = [
  { rank: 1, title: '520礼物推荐', heat: 9856234, trend: 'up' },
  { rank: 2, title: '夏日防晒攻略', heat: 8765432, trend: 'up' },
  { rank: 3, title: '618大促预售', heat: 7654321, trend: 'up' },
  { rank: 4, title: '亲子活动好去处', heat: 6543210, trend: 'stable' },
  { rank: 5, title: '国潮新品发布', heat: 5432109, trend: 'down' },
  { rank: 6, title: '露营装备推荐', heat: 4321098, trend: 'up' },
  { rank: 7, title: '家居收纳技巧', heat: 3210987, trend: 'stable' },
  { rank: 8, title: '儿童节礼物清单', heat: 2109876, trend: 'up' }
]

export const aiTemplates = [
  { id: 1, name: '每日推荐', type: '文章', description: '基于行业热点和商品推荐生成每日文章', fields: ['热点话题', '推荐商品', '目标人群'] },
  { id: 2, name: '品牌故事', type: '文章', description: '讲述亚细亚品牌文化故事', fields: ['故事主题', '情感基调', '篇幅'] },
  { id: 3, name: '种草短视频', type: '视频', description: '生成商品种草短视频脚本', fields: ['商品名称', '卖点', '视频时长'] },
  { id: 4, name: '节日营销', type: '图文', description: '节日主题营销内容生成', fields: ['节日名称', '促销力度', '活动形式'] },
  { id: 5, name: '会员专属', type: '图文', description: '会员日/会员专属优惠内容', fields: ['优惠信息', '会员等级', '有效期'] },
  { id: 6, name: '穿搭指南', type: '视频', description: '时尚穿搭推荐视频脚本', fields: ['季节', '风格', '价位'] }
]
