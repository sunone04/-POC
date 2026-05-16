import Database from 'better-sqlite3'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const DB_DIR = join(__dirname)
if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true })

const DB_PATH = process.env.DB_PATH || join(DB_DIR, 'yaxiya_business.db')

let db

export function initDB() {
  db = new Database(DB_PATH)
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')

  db.exec(`
    CREATE TABLE IF NOT EXISTS data_sources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      status TEXT DEFAULT 'disconnected',
      config TEXT DEFAULT '{}',
      last_sync TEXT,
      sync_interval INTEGER DEFAULT 300,
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      updated_at TEXT DEFAULT (datetime('now', 'localtime'))
    );

    CREATE TABLE IF NOT EXISTS business_metrics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      metric_type TEXT NOT NULL,
      metric_name TEXT NOT NULL,
      value REAL NOT NULL,
      unit TEXT DEFAULT '',
      store TEXT DEFAULT 'all',
      category TEXT DEFAULT 'all',
      created_at TEXT DEFAULT (datetime('now', 'localtime'))
    );

    CREATE TABLE IF NOT EXISTS anomaly_rules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      metric_type TEXT NOT NULL,
      condition_type TEXT NOT NULL,
      threshold REAL NOT NULL,
      comparison TEXT DEFAULT 'lt',
      severity TEXT DEFAULT 'warning',
      enabled INTEGER DEFAULT 1,
      notify_channels TEXT DEFAULT '[]',
      created_at TEXT DEFAULT (datetime('now', 'localtime'))
    );

    CREATE TABLE IF NOT EXISTS anomaly_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      rule_id INTEGER,
      rule_name TEXT NOT NULL,
      metric_type TEXT NOT NULL,
      metric_name TEXT NOT NULL,
      current_value REAL NOT NULL,
      threshold_value REAL NOT NULL,
      severity TEXT DEFAULT 'warning',
      status TEXT DEFAULT 'pending',
      agent_analysis TEXT,
      agent_solution TEXT,
      notified INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      resolved_at TEXT
    );

    CREATE TABLE IF NOT EXISTS agent_tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id INTEGER,
      task_type TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      reasoning TEXT,
      solution TEXT,
      actions TEXT DEFAULT '[]',
      result TEXT,
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      completed_at TEXT
    );

    CREATE TABLE IF NOT EXISTS chat_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      context TEXT DEFAULT '{}',
      created_at TEXT DEFAULT (datetime('now', 'localtime'))
    );

    CREATE TABLE IF NOT EXISTS reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      report_type TEXT NOT NULL,
      period_start TEXT NOT NULL,
      period_end TEXT NOT NULL,
      content TEXT NOT NULL,
      summary TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now', 'localtime'))
    );
  `)

  seedData()
  return db
}

function seedData() {
  const dsCount = db.prepare('SELECT COUNT(*) as cnt FROM data_sources').get().cnt
  if (dsCount > 0) return

  const insertDS = db.prepare(`INSERT INTO data_sources (name, type, status, last_sync, config) VALUES (?, ?, ?, ?, ?)`)

  const dataSources = [
    ['企业OA系统', 'oa', 'connected', '2026-05-14 09:30:00', '{"url":"https://oa.yaxiya.com","syncTables":["employees","departments","approvals"]}'],
    ['企业微信', 'wecom', 'connected', '2026-05-14 09:25:00', '{"corpId":"ww1234567890","syncTables":["messages","contacts","groups"]}'],
    ['收银系统(POS)', 'pos', 'connected', '2026-05-14 09:20:00', '{"url":"https://pos.yaxiya.com","syncTables":["transactions","products","inventory"]}'],
    ['ERP系统', 'erp', 'connected', '2026-05-14 08:00:00', '{"url":"https://erp.yaxiya.com","syncTables":["purchase","finance","warehouse"]}'],
    ['会员管理系统', 'crm', 'connected', '2026-05-14 09:15:00', '{"url":"https://crm.yaxiya.com","syncTables":["members","points","coupons"]}'],
    ['供应链系统', 'scm', 'disconnected', null, '{"url":"https://scm.yaxiya.com","syncTables":["suppliers","orders","logistics"]}'],
    ['人力资源系统', 'hr', 'disconnected', null, '{"url":"https://hr.yaxiya.com","syncTables":["attendance","salary","training"]}']
  ]

  const insertDSRun = db.transaction((items) => {
    for (const item of items) insertDS.run(...item)
  })
  insertDSRun(dataSources)

  const insertMetric = db.prepare(`INSERT INTO business_metrics (date, metric_type, metric_name, value, unit, store, category) VALUES (?, ?, ?, ?, ?, ?, ?)`)

  const today = '2026-05-14'
  const metrics = []

  const stores = ['亚细亚总店', '城南分店', '城北分店', '东区旗舰店']
  const categories = ['食品', '百货', '服装', '家电', '生鲜']

  for (let d = 43; d >= 0; d--) {
    const day = 14 - d
    let date
    if (day > 0) {
      date = `2026-05-${String(day).padStart(2, '0')}`
    } else {
      const aprilDay = 30 + day
      date = `2026-04-${String(aprilDay).padStart(2, '0')}`
    }
    const dayFactor = d === 0 ? 1 : (1 - d * 0.005 + (Math.random() - 0.5) * 0.03)
    const weekendBoost = (new Date(date).getDay() === 0 || new Date(date).getDay() === 6) ? 1.3 : 1.0

    metrics.push([date, 'revenue', '营业额', Math.round(850000 * dayFactor * weekendBoost), '元', 'all', 'all'])
    metrics.push([date, 'profit', '毛利润', Math.round(170000 * dayFactor * weekendBoost), '元', 'all', 'all'])
    metrics.push([date, 'profit_rate', '毛利率', 20 + (Math.random() - 0.5) * 3, '%', 'all', 'all'])
    metrics.push([date, 'customer_count', '客流量', Math.round(12000 * dayFactor * weekendBoost), '人', 'all', 'all'])
    metrics.push([date, 'avg_transaction', '客单价', Math.round(70 * (1 + (Math.random() - 0.5) * 0.1)), '元', 'all', 'all'])
    metrics.push([date, 'online_revenue', '线上营收', Math.round(180000 * dayFactor * weekendBoost), '元', 'all', 'all'])
    metrics.push([date, 'member_revenue', '会员营收占比', 35 + (Math.random() - 0.5) * 5, '%', 'all', 'all'])
    metrics.push([date, 'inventory_turnover', '库存周转率', 5.2 + (Math.random() - 0.5) * 0.5, '次', 'all', 'all'])
    metrics.push([date, 'return_rate', '退货率', 2.1 + (Math.random() - 0.5) * 0.8, '%', 'all', 'all'])

    for (const store of stores) {
      metrics.push([date, 'revenue', '营业额', Math.round(850000 / 4 * dayFactor * weekendBoost * (0.9 + Math.random() * 0.2)), '元', store, 'all'])
    }

    for (const cat of categories) {
      const catFactor = cat === '生鲜' ? 1.4 : cat === '食品' ? 1.2 : cat === '服装' ? 0.8 : cat === '家电' ? 0.6 : 1.0
      metrics.push([date, 'revenue', '营业额', Math.round(850000 / 5 * catFactor * dayFactor * weekendBoost), '元', 'all', cat])
    }
  }

  const insertMetricRun = db.transaction((items) => {
    for (const item of items) insertMetric.run(...item)
  })
  insertMetricRun(metrics)

  const insertRule = db.prepare(`INSERT INTO anomaly_rules (name, metric_type, condition_type, threshold, comparison, severity, notify_channels) VALUES (?, ?, ?, ?, ?, ?, ?)`)
  const rules = [
    ['日营业额下降预警', 'revenue', 'day_over_day', 15, 'lt', 'warning', '["oa","wecom"]'],
    ['毛利率低于阈值', 'profit_rate', 'absolute', 18, 'lt', 'critical', '["oa","wecom"]'],
    ['客流量大幅下降', 'customer_count', 'week_over_week', 20, 'lt', 'warning', '["wecom"]'],
    ['退货率异常升高', 'return_rate', 'absolute', 4, 'gt', 'warning', '["oa"]'],
    ['库存周转率过低', 'inventory_turnover', 'absolute', 4, 'lt', 'critical', '["oa","wecom"]'],
    ['线上营收占比下降', 'online_revenue', 'day_over_day', 10, 'lt', 'info', '["wecom"]']
  ]
  const insertRuleRun = db.transaction((items) => {
    for (const item of items) insertRule.run(...item)
  })
  insertRuleRun(rules)

  const insertEvent = db.prepare(`INSERT INTO anomaly_events (rule_id, rule_name, metric_type, metric_name, current_value, threshold_value, severity, status, agent_analysis, agent_solution, notified, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
  const events = [
    [2, '毛利率低于阈值', 'profit_rate', '毛利率', 17.2, 18, 'critical', 'resolved', '经跨系统归因分析，毛利率下降主要原因为：1) 生鲜品类因天气原因进货成本上升8.5%；2) 百货品类促销折扣力度过大，平均折扣率从7.5折降至6.2折；3) 供应商本季度调价未及时同步到零售定价系统', '建议措施：1) 调整生鲜品类售价，涨幅3-5%覆盖成本上升；2) 优化百货促销策略，将折扣力度回调至7折以上；3) 启动供应商价格联动机制，自动同步调价到零售端；4) 已向采购部负责人发送调价建议工单', 1, '2026-05-13 10:15:00'],
    [1, '日营业额下降预警', 'revenue', '营业额', -12.5, 15, 'warning', 'resolved', '营业额环比下降12.5%，归因分析：1) 城南分店周边道路施工导致客流减少约25%；2) 竞品新店开业分流部分客群；3) 线上渠道订单量正常，线下客流为主要下降因素', '建议措施：1) 城南分店增加社区配送服务覆盖范围；2) 推出"到店专享"活动吸引客流；3) 加强会员精准营销推送；4) 已向城南分店店长发送详细分析报告', 1, '2026-05-12 14:30:00'],
    [3, '客流量大幅下降', 'customer_count', '客流量', -18.3, 20, 'warning', 'processing', '正在进行跨系统归因分析...', '分析中...', 0, '2026-05-14 08:45:00'],
    [5, '库存周转率过低', 'inventory_turnover', '库存周转率', 3.8, 4, 'critical', 'pending', null, null, 0, '2026-05-14 09:00:00']
  ]
  const insertEventRun = db.transaction((items) => {
    for (const item of items) insertEvent.run(...item)
  })
  insertEventRun(events)

  const insertTask = db.prepare(`INSERT INTO agent_tasks (event_id, task_type, status, reasoning, solution, actions, result, created_at, completed_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
  const tasks = [
    [1, 'attribution_analysis', 'completed', '跨系统数据关联分析完成：ERP采购数据+POS销售数据+CRM会员数据联合分析', '已生成解决方案并推送', '[{"type":"send_notification","target":"采购部-张经理","channel":"oa","content":"生鲜品类成本上升预警"},{"type":"create_ticket","system":"oa","title":"供应商价格联动机制优化","priority":"high"}]', '已向2位负责人发送通知，创建1个工单', '2026-05-13 10:16:00', '2026-05-13 10:18:00'],
    [2, 'attribution_analysis', 'completed', '跨系统数据关联分析完成：POS客流数据+企微社群数据+外部环境数据联合分析', '已生成解决方案并推送', '[{"type":"send_notification","target":"城南分店-李店长","channel":"wecom","content":"客流下降分析报告"},{"type":"create_ticket","system":"oa","title":"城南分店引流方案","priority":"medium"}]', '已向1位负责人发送通知，创建1个工单', '2026-05-12 14:31:00', '2026-05-12 14:35:00'],
    [3, 'attribution_analysis', 'running', '正在关联POS系统客流数据与企微社群活跃度数据...', null, '[]', null, '2026-05-14 08:46:00', null],
    [4, 'attribution_analysis', 'pending', null, null, '[]', null, '2026-05-14 09:01:00', null]
  ]
  const insertTaskRun = db.transaction((items) => {
    for (const item of items) insertTask.run(...item)
  })
  insertTaskRun(tasks)

  const insertReport = db.prepare(`INSERT INTO reports (report_type, period_start, period_end, content, summary) VALUES (?, ?, ?, ?, ?)`)
  const reports = [
    ['daily', '2026-05-14', '2026-05-14', JSON.stringify({
      revenue: 832500, profit: 166500, profitRate: 20.0, customerCount: 11850,
      avgTransaction: 70.3, onlineRevenue: 175600, memberRevenueRatio: 36.2,
      topStore: '亚细亚总店', topCategory: '生鲜',
      alerts: ['库存周转率低于阈值', '客流量周同比下降18.3%']
    }), '今日经营总体平稳，营业额83.25万，毛利率20.0%，需关注库存周转率偏低及客流量下降趋势'],
    ['daily', '2026-05-13', '2026-05-13', JSON.stringify({
      revenue: 856200, profit: 147300, profitRate: 17.2, customerCount: 12300,
      avgTransaction: 69.6, onlineRevenue: 178900, memberRevenueRatio: 35.8,
      topStore: '亚细亚总店', topCategory: '食品',
      alerts: ['毛利率低于18%阈值']
    }), '营业额85.62万但毛利率仅17.2%，低于安全线，生鲜成本上升和百货促销过度是主因'],
    ['weekly', '2026-05-08', '2026-05-14', JSON.stringify({
      totalRevenue: 5835000, avgDailyRevenue: 833571, totalProfit: 1108650,
      avgProfitRate: 19.0, totalCustomers: 84200, avgDailyCustomers: 12029,
      revenueTrend: -2.3, customerTrend: -5.1, topStore: '亚细亚总店',
      highlights: ['周末客流提升30%', '线上渠道增长12%', '生鲜品类表现突出']
    }), '本周营业额583.5万，环比微降2.3%，客流量下降5.1%需关注，线上渠道增长良好'],
    ['monthly', '2026-04-01', '2026-04-30', JSON.stringify({
      totalRevenue: 24500000, avgDailyRevenue: 816667, totalProfit: 4900000,
      avgProfitRate: 20.0, totalCustomers: 360000, avgDailyCustomers: 12000,
      revenueTrend: 3.5, customerTrend: 1.2, topStore: '亚细亚总店',
      highlights: ['4月店庆活动拉动营收增长', '会员体系优化效果显著', '新增会员3200人']
    }), '4月营业额2450万，同比增长3.5%，店庆活动效果显著，会员体系持续优化']
  ]
  const insertReportRun = db.transaction((items) => {
    for (const item of items) insertReport.run(...item)
  })
  insertReportRun(reports)
}

export function getDB() {
  if (!db) initDB()
  return db
}
