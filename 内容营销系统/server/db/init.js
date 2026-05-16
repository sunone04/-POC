import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'yaxiya.db')

let db

export function getDB() {
  if (!db) {
    db = new Database(DB_PATH)
    db.pragma('journal_mode = WAL')
    db.pragma('foreign_keys = ON')
  }
  return db
}

export function initDB() {
  const db = getDB()

  db.exec(`
    CREATE TABLE IF NOT EXISTS knowledge_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      tags TEXT DEFAULT '',
      extra TEXT DEFAULT '{}',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS scheduled_tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      platform TEXT NOT NULL,
      content_type TEXT NOT NULL,
      schedule TEXT NOT NULL,
      cron_expression TEXT NOT NULL,
      status TEXT DEFAULT 'active',
      config TEXT DEFAULT '{}',
      last_run DATETIME,
      total_produced INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS marketing_nodes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      date TEXT NOT NULL,
      type TEXT NOT NULL,
      advance_days INTEGER DEFAULT 7,
      status TEXT DEFAULT 'upcoming',
      auto_prepare INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS content_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      type TEXT NOT NULL,
      platform TEXT NOT NULL,
      status TEXT DEFAULT 'draft',
      content TEXT DEFAULT '',
      trigger_type TEXT DEFAULT '',
      trigger_name TEXT DEFAULT '',
      views INTEGER DEFAULT 0,
      likes INTEGER DEFAULT 0,
      comments INTEGER DEFAULT 0,
      shares INTEGER DEFAULT 0,
      published_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS ai_insights (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content_id INTEGER,
      insight TEXT NOT NULL,
      deposited INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (content_id) REFERENCES content_items(id)
    );
  `)

  seedData(db)
}

function seedData(db) {
  const count = db.prepare('SELECT COUNT(*) as c FROM knowledge_items').get()
  if (count.c > 0) return

  const insertKnowledge = db.prepare(`
    INSERT INTO knowledge_items (category, title, content, tags, extra) VALUES (?, ?, ?, ?, ?)
  `)

  const knowledgeSeeds = [
    ['品牌故事', '亚细亚的诞生——中原商战的传奇起点', '1989年5月6日，郑州亚细亚商场在二七广场开业，以"中原之行哪里去——郑州亚细亚"的广告语响彻全国。亚细亚不仅是一家商场，更是一种商业文化的象征，开创了中国现代百货零售的先河。', '品牌历史,商战传奇', '{}'],
    ['品牌故事', '服务至上——亚细亚的服务理念传承', '亚细亚始终秉承"顾客至上"的服务理念，从最早的迎宾礼仪到如今的智慧服务，每一步都在践行对顾客的承诺。微笑服务、专业导购、无忧退换，这些服务标准已成为亚细亚的品牌基因。', '服务理念,品牌文化', '{}'],
    ['品牌故事', '焕新出发——新亚细亚的数字化转型之路', '在数字化浪潮中，亚细亚积极拥抱变革，通过AI技术赋能内容营销，实现从传统百货向智慧零售的转型升级。新亚细亚不仅保留了经典的服务温度，更注入了科技的力量。', '数字化转型,AI营销', '{}'],
    ['会员权益', '银卡会员权益', '消费积分1倍、生日双倍积分、会员专属折扣9.5折、免费停车2小时', '', '{"level":"银卡","benefits":["消费积分1倍","生日双倍积分","会员专属折扣9.5折","免费停车2小时"],"condition":"消费满2000元升级"}'],
    ['会员权益', '金卡会员权益', '消费积分2倍、生日三倍积分、会员专属折扣9折、免费停车4小时、新品优先体验', '', '{"level":"金卡","benefits":["消费积分2倍","生日三倍积分","会员专属折扣9折","免费停车4小时","新品优先体验"],"condition":"消费满10000元升级"}'],
    ['会员权益', '钻石卡会员权益', '消费积分3倍、生日五倍积分、会员专属折扣8.5折、免费停车全天、VIP专属导购、年度感恩礼', '', '{"level":"钻石卡","benefits":["消费积分3倍","生日五倍积分","会员专属折扣8.5折","免费停车全天","VIP专属导购","年度感恩礼"],"condition":"消费满50000元升级"}'],
    ['规则条款', '退换货政策', '7天无理由退换货，30天质量问题包退，会员享受延长退换期至15天。', '', '{"category":"售后政策"}'],
    ['规则条款', '积分使用规则', '积分可在全场通用，100积分抵1元，积分有效期为获取之日起12个月。', '', '{"category":"积分规则"}'],
    ['规则条款', '促销活动规范', '所有促销活动需提前7天报备，折扣力度不得低于成本价，活动期间保证库存充足。', '', '{"category":"营销规范"}'],
    ['规则条款', '品牌合作条款', '入驻品牌需提供正品保障，配合商场营销活动，遵守亚细亚品牌形象规范。', '', '{"category":"合作条款"}']
  ]

  const insertKnowledgeBatch = db.transaction((items) => {
    for (const item of items) {
      insertKnowledge.run(...item)
    }
  })
  insertKnowledgeBatch(knowledgeSeeds)

  const insertTask = db.prepare(`
    INSERT INTO scheduled_tasks (name, platform, content_type, schedule, cron_expression, status, config, total_produced) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const taskSeeds = [
    ['每日公众号文章', '公众号', '文章', '每日 08:00', '0 8 * * *', 'active', '{"useHotTopics":true,"hotTopicSource":"微博热搜+百度热搜","template":"每日推荐","wordCount":"800-1200"}', 156],
    ['每日抖音短视频', '抖音', '视频', '每日 10:00', '0 10 * * *', 'active', '{"useHotTopics":true,"videoDuration":"15-60秒","style":"种草推荐","autoPublish":true}', 142],
    ['每日视频号内容', '视频号', '视频', '每日 12:00', '0 12 * * *', 'active', '{"useHotTopics":true,"videoDuration":"30-120秒","style":"品牌故事","autoPublish":false}', 98],
    ['企微社群推送', '企微', '图文', '每日 18:00', '0 18 * * *', 'active', '{"useHotTopics":false,"contentFocus":"会员专属优惠","pushTarget":"全部社群","includeCoupon":true}', 210],
    ['每周品牌故事', '公众号', '文章', '每周一 09:00', '0 9 * * 1', 'active', '{"useHotTopics":false,"template":"品牌故事","wordCount":"1500-2000","includeImages":true}', 24]
  ]

  const insertTaskBatch = db.transaction((items) => {
    for (const item of items) {
      insertTask.run(...item)
    }
  })
  insertTaskBatch(taskSeeds)

  const insertNode = db.prepare(`
    INSERT INTO marketing_nodes (name, date, type, advance_days, status, auto_prepare) VALUES (?, ?, ?, ?, ?, ?)
  `)

  const nodeSeeds = [
    ['元旦', '2026-01-01', '公历节日', 7, 'completed', 1],
    ['春节', '2026-02-17', '农历节日', 14, 'completed', 1],
    ['情人节', '2026-02-14', '公历节日', 7, 'completed', 1],
    ['妇女节', '2026-03-08', '公历节日', 7, 'completed', 1],
    ['清明节', '2026-04-05', '农历节气', 5, 'completed', 1],
    ['劳动节', '2026-05-01', '公历节日', 10, 'completed', 1],
    ['母亲节', '2026-05-10', '公历节日', 7, 'completed', 1],
    ['亚细亚店庆日', '2026-05-06', '店庆日', 14, 'completed', 1],
    ['会员日', '2026-05-15', '会员日', 5, 'upcoming', 1],
    ['儿童节', '2026-06-01', '公历节日', 7, 'upcoming', 1],
    ['端午节', '2026-06-19', '农历节日', 10, 'upcoming', 1],
    ['父亲节', '2026-06-21', '公历节日', 7, 'upcoming', 1],
    ['七夕节', '2026-08-20', '农历节日', 10, 'upcoming', 1],
    ['中秋节', '2026-09-25', '农历节日', 10, 'upcoming', 1],
    ['国庆节', '2026-10-01', '公历节日', 14, 'upcoming', 1],
    ['双十一', '2026-11-11', '购物节', 14, 'upcoming', 1],
    ['圣诞节', '2026-12-25', '公历节日', 10, 'upcoming', 1],
    ['会员日', '2026-06-15', '会员日', 5, 'upcoming', 1],
    ['立夏', '2026-05-05', '农历节气', 3, 'completed', 1],
    ['小满', '2026-05-21', '农历节气', 3, 'upcoming', 1]
  ]

  const insertNodeBatch = db.transaction((items) => {
    for (const item of items) {
      insertNode.run(...item)
    }
  })
  insertNodeBatch(nodeSeeds)

  const insertContent = db.prepare(`
    INSERT INTO content_items (title, type, platform, status, content, trigger_type, trigger_name, views, likes, comments, shares, published_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const contentSeeds = [
    ['520爱在亚细亚——浪漫好礼推荐', '文章', '公众号', 'published', '', '营销节点', '520', 8560, 623, 89, 234, '2026-05-12 08:00', '2026-05-12 08:00'],
    ['夏日清爽穿搭｜亚细亚时尚指南', '视频', '抖音', 'published', '', '定时', '每日抖音短视频', 23400, 1890, 256, 567, '2026-05-13 10:15', '2026-05-13 10:00'],
    ['会员日预告：超值优惠抢先看', '图文', '企微', 'scheduled', '', '营销节点', '会员日', 0, 0, 0, 0, null, '2026-05-12 15:00'],
    ['亚细亚品牌故事：37年风雨兼程', '视频', '视频号', 'published', '', '营销节点', '店庆日', 45600, 3456, 567, 1234, '2026-05-06 09:30', '2026-05-06 09:00'],
    ['每日好物推荐：居家必备好物', '文章', '公众号', 'published', '', '定时', '每日公众号文章', 5670, 345, 67, 123, '2026-05-13 08:00', '2026-05-13 08:00'],
    ['母亲节特辑——给妈妈最好的爱', '视频', '抖音', 'published', '', '营销节点', '母亲节', 67800, 5670, 890, 2345, '2026-05-09 10:10', '2026-05-09 10:00'],
    ['618年中大促攻略', '文章', '公众号', 'draft', '', '营销节点', '618', 0, 0, 0, 0, null, '2026-05-13 14:00']
  ]

  const insertContentBatch = db.transaction((items) => {
    for (const item of items) {
      insertContent.run(...item)
    }
  })
  insertContentBatch(contentSeeds)

  const insertInsight = db.prepare(`
    INSERT INTO ai_insights (content_id, insight, deposited) VALUES (?, ?, ?)
  `)

  const insightSeeds = [
    [6, '情感类内容在节日前1-2天发布效果最佳，视频前3秒需有强情感钩子，背景音乐选择温暖治愈风格可提升完播率35%。', 1],
    [4, '品牌故事类内容在店庆节点发布效果显著，怀旧元素+新面貌对比叙事可提升分享率，用户评论中"回忆""情怀"关键词出现频率最高。', 1],
    [2, '穿搭类视频15-30秒最佳，快节奏剪辑+真人试穿效果优于图片轮播，添加购物车链接可提升转化率。', 0]
  ]

  const insertInsightBatch = db.transaction((items) => {
    for (const item of items) {
      insertInsight.run(...item)
    }
  })
  insertInsightBatch(insightSeeds)

  console.log('[数据库] 种子数据已加载')
}
