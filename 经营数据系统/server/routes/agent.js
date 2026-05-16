import { Router } from 'express'
import { getDB } from '../db/init.js'

const router = Router()

router.get('/tasks', (req, res) => {
  const db = getDB()
  const { status, limit = 50 } = req.query
  let query = 'SELECT * FROM agent_tasks'
  const params = []
  if (status) { query += ' WHERE status=?'; params.push(status) }
  query += ' ORDER BY created_at DESC LIMIT ?'
  params.push(parseInt(limit))
  const tasks = db.prepare(query).all(...params)
  res.json({ success: true, data: tasks })
})

router.post('/analyze/:eventId', (req, res) => {
  const db = getDB()
  const { eventId } = req.params

  const event = db.prepare('SELECT * FROM anomaly_events WHERE id=?').get(eventId)
  if (!event) return res.status(404).json({ success: false, message: '事件不存在' })

  db.prepare("UPDATE anomaly_events SET status='processing' WHERE id=?").run(eventId)

  const analysisMap = {
    revenue: {
      reasoning: '跨系统归因分析：关联POS销售数据、ERP采购数据、CRM会员数据、企微社群数据。营业额变动主要受客流、客单价、促销力度、天气因素和竞争环境影响。',
      solution: '建议：1) 优化促销策略提升客单价；2) 加强会员精准营销；3) 调整品类结构；4) 关注竞品动态调整差异化策略',
      actions: [
        { type: 'send_notification', target: '运营部-王总监', channel: 'oa', content: '营业额异常波动分析报告' },
        { type: 'create_ticket', system: 'oa', title: '营业额提升方案', priority: 'high' }
      ]
    },
    profit_rate: {
      reasoning: '跨系统归因分析：关联ERP采购成本数据、POS促销折扣数据、CRM会员折扣数据。毛利率变动主要受进货成本、促销力度、品类结构、损耗率影响。',
      solution: '建议：1) 与供应商重新谈判采购价格；2) 优化促销折扣力度；3) 提高高毛利品类占比；4) 降低生鲜损耗率',
      actions: [
        { type: 'send_notification', target: '采购部-张经理', channel: 'oa', content: '毛利率下降预警及成本分析' },
        { type: 'send_notification', target: '运营部-王总监', channel: 'wecom', content: '促销折扣优化建议' },
        { type: 'create_ticket', system: 'oa', title: '毛利率恢复方案', priority: 'critical' }
      ]
    },
    customer_count: {
      reasoning: '跨系统归因分析：关联POS客流数据、企微社群活跃度数据、CRM新客转化数据、外部环境数据。客流量变动主要受天气、周边活动、营销效果、会员活跃度影响。',
      solution: '建议：1) 加大线上引流力度；2) 推出到店专属优惠；3) 优化社群运营提升到店转化；4) 开展异业合作引流',
      actions: [
        { type: 'send_notification', target: '市场部-刘经理', channel: 'wecom', content: '客流下降分析及引流建议' },
        { type: 'create_ticket', system: 'oa', title: '客流提升行动方案', priority: 'high' }
      ]
    },
    inventory_turnover: {
      reasoning: '跨系统归因分析：关联ERP库存数据、POS销售数据、SCM供应链数据。库存周转率低主要受滞销品积压、采购批量过大、季节性商品未及时清仓影响。',
      solution: '建议：1) 清理滞销库存，制定清仓方案；2) 优化采购批量，减少单次采购量；3) 建立季节性商品预警机制；4) 推动库存共享调拨',
      actions: [
        { type: 'send_notification', target: '采购部-张经理', channel: 'oa', content: '库存周转率过低预警' },
        { type: 'send_notification', target: '各门店店长', channel: 'wecom', content: '滞销品清仓计划' },
        { type: 'create_ticket', system: 'oa', title: '库存优化方案', priority: 'high' }
      ]
    }
  }

  const defaultAnalysis = {
    reasoning: `跨系统归因分析：已关联OA审批数据、ERP运营数据、POS销售数据、CRM会员数据。指标${event.metric_name}当前值${event.current_value}，阈值${event.threshold_value}，需要进一步分析根因。`,
    solution: '建议：1) 密切监控指标变化趋势；2) 联系相关部门了解具体情况；3) 制定针对性改善方案',
    actions: [
      { type: 'send_notification', target: '运营部-王总监', channel: 'oa', content: `${event.metric_name}异常预警通知` }
    ]
  }

  const analysis = analysisMap[event.metric_type] || defaultAnalysis

  const taskResult = db.prepare(
    `INSERT INTO agent_tasks (event_id, task_type, status, reasoning, solution, actions, result, created_at, completed_at)
     VALUES (?, 'attribution_analysis', 'completed', ?, ?, ?, '分析完成，已生成解决方案', datetime('now','localtime'), datetime('now','localtime'))`
  ).run(eventId, analysis.reasoning, analysis.solution, JSON.stringify(analysis.actions))

  db.prepare(
    `UPDATE anomaly_events SET status='resolved', agent_analysis=?, agent_solution=?, notified=1, resolved_at=datetime('now','localtime') WHERE id=?`
  ).run(analysis.reasoning, analysis.solution, eventId)

  res.json({
    success: true,
    data: {
      taskId: taskResult.lastInsertRowid,
      reasoning: analysis.reasoning,
      solution: analysis.solution,
      actions: analysis.actions
    }
  })
})

router.get('/events/:eventId/detail', (req, res) => {
  const db = getDB()
  const { eventId } = req.params

  const event = db.prepare('SELECT * FROM anomaly_events WHERE id=?').get(eventId)
  if (!event) return res.status(404).json({ success: false, message: '事件不存在' })

  const tasks = db.prepare('SELECT * FROM agent_tasks WHERE event_id=? ORDER BY created_at DESC').all(eventId)

  const relatedMetrics = db.prepare(
    `SELECT date, value FROM business_metrics WHERE metric_type=? AND store='all' AND category='all' ORDER BY date DESC LIMIT 7`
  ).all(event.metric_type)

  res.json({
    success: true,
    data: { event, tasks, relatedMetrics }
  })
})

router.get('/stats', (req, res) => {
  const db = getDB()
  const totalTasks = db.prepare('SELECT COUNT(*) as cnt FROM agent_tasks').get().cnt
  const completedTasks = db.prepare("SELECT COUNT(*) as cnt FROM agent_tasks WHERE status='completed'").get().cnt
  const runningTasks = db.prepare("SELECT COUNT(*) as cnt FROM agent_tasks WHERE status='running'").get().cnt
  const pendingTasks = db.prepare("SELECT COUNT(*) as cnt FROM agent_tasks WHERE status='pending'").get().cnt
  const notificationsSent = db.prepare('SELECT SUM(notified) as cnt FROM anomaly_events').get().cnt || 0

  res.json({
    success: true,
    data: { totalTasks, completedTasks, runningTasks, pendingTasks, notificationsSent }
  })
})

export default router
