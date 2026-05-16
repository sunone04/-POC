import { Router } from 'express'
import { getDB } from '../db/init.js'

const router = Router()

router.get('/history', (req, res) => {
  const db = getDB()
  const { limit = 50 } = req.query
  const messages = db.prepare(
    'SELECT * FROM chat_messages ORDER BY created_at DESC LIMIT ?'
  ).all(parseInt(limit))
  res.json({ success: true, data: messages.reverse() })
})

router.post('/send', async (req, res) => {
  const db = getDB()
  const { message } = req.body
  if (!message) return res.status(400).json({ success: false, message: '消息不能为空' })

  db.prepare(
    'INSERT INTO chat_messages (role, content, context) VALUES (?, ?, ?)'
  ).run('user', message, '{}')

  const recentMessages = db.prepare(
    'SELECT role, content FROM chat_messages ORDER BY created_at DESC LIMIT 10'
  ).all().reverse()

  const todayMetrics = db.prepare(
    "SELECT metric_type, metric_name, value, unit FROM business_metrics WHERE date='2026-05-14' AND store='all' AND category='all'"
  ).all()

  const activeAlerts = db.prepare(
    "SELECT rule_name, current_value, threshold_value, severity FROM anomaly_events WHERE status IN ('pending','processing')"
  ).all()

  const recentReports = db.prepare(
    'SELECT report_type, summary FROM reports ORDER BY created_at DESC LIMIT 3'
  ).all()

  const contextInfo = {
    todayMetrics: todayMetrics.reduce((acc, m) => { acc[m.metric_type] = { value: m.value, unit: m.unit }; return acc }, {}),
    activeAlerts,
    recentReports: recentReports.map(r => ({ type: r.report_type, summary: r.summary }))
  }

  let aiReply = ''

  const msg = message.toLowerCase()

  if (msg.includes('营业额') || msg.includes('营收') || msg.includes('销售')) {
    const revenue = todayMetrics.find(m => m.metric_type === 'revenue')
    const online = todayMetrics.find(m => m.metric_type === 'online_revenue')
    aiReply = `今日营业额为${revenue ? (revenue.value / 10000).toFixed(1) + '万元' : '暂无数据'}，其中线上营收${online ? (online.value / 10000).toFixed(1) + '万元' : '暂无数据'}。` +
      (activeAlerts.length > 0 ? `\n\n当前有${activeAlerts.length}个活跃预警需要关注：${activeAlerts.map(a => a.rule_name).join('、')}。` : '') +
      `\n\n从近期趋势看，整体经营保持稳定，建议持续关注毛利率和客流变化。`
  } else if (msg.includes('利润') || msg.includes('毛利率')) {
    const profit = todayMetrics.find(m => m.metric_type === 'profit')
    const profitRate = todayMetrics.find(m => m.metric_type === 'profit_rate')
    aiReply = `今日毛利润为${profit ? (profit.value / 10000).toFixed(1) + '万元' : '暂无数据'}，毛利率${profitRate ? profitRate.value + '%' : '暂无数据'}。` +
      `\n\n毛利率安全线为18%，当前${profitRate && profitRate.value >= 18 ? '处于安全范围' : '低于安全线，需要关注'}。` +
      `\n\n影响毛利率的主要因素包括：进货成本、促销折扣力度、品类结构。建议定期与供应商议价，优化促销策略。`
  } else if (msg.includes('客流') || msg.includes('顾客') || msg.includes('人流量')) {
    const customers = todayMetrics.find(m => m.metric_type === 'customer_count')
    const avgTrans = todayMetrics.find(m => m.metric_type === 'avg_transaction')
    aiReply = `今日客流量为${customers ? customers.value.toLocaleString() + '人' : '暂无数据'}，客单价${avgTrans ? avgTrans.value + '元' : '暂无数据'}。` +
      `\n\n客流量的变化受多种因素影响：天气、周边活动、营销推广效果、会员活跃度等。` +
      `\n\n建议通过企微社群精准推送、到店专属优惠等方式提升客流转化。`
  } else if (msg.includes('预警') || msg.includes('异常') || msg.includes('风险')) {
    if (activeAlerts.length > 0) {
      aiReply = `当前有${activeAlerts.length}个活跃预警：\n\n` +
        activeAlerts.map((a, i) => `${i + 1}. ${a.rule_name}：当前值${a.current_value}，阈值${a.threshold_value}，级别${a.severity === 'critical' ? '严重' : '警告'}`).join('\n') +
        `\n\nAgent归因推理层正在对这些异常进行跨系统分析，将自动给出解决方案并通知相关负责人。`
    } else {
      aiReply = '当前没有活跃的异常预警，各项经营指标均在正常范围内。系统会持续7×24小时监控，一旦发现异常会自动触发归因分析。'
    }
  } else if (msg.includes('报告') || msg.includes('日报') || msg.includes('周报') || msg.includes('月报')) {
    aiReply = recentReports.length > 0
      ? `最近的经营报告：\n\n` + recentReports.map(r => `📊 ${r.type === 'daily' ? '日报' : r.type === 'weekly' ? '周报' : '月报'}：${r.summary}`).join('\n\n')
      : '暂无报告数据。您可以在经营总览模块生成日报、周报或月报。'
  } else if (msg.includes('库存')) {
    const turnover = todayMetrics.find(m => m.metric_type === 'inventory_turnover')
    aiReply = `当前库存周转率为${turnover ? turnover.value + '次' : '暂无数据'}，${turnover && turnover.value < 4 ? '低于安全阈值4次，需要关注库存积压问题' : '处于正常范围'}。` +
      `\n\n建议定期清理滞销品，优化采购批量，建立季节性商品预警机制。`
  } else if (msg.includes('会员')) {
    const memberRatio = todayMetrics.find(m => m.metric_type === 'member_revenue_ratio')
    aiReply = `当前会员营收占比为${memberRatio ? memberRatio.value + '%' : '暂无数据'}。` +
      `\n\n会员体系是零售企业的重要竞争力，建议：1) 持续优化会员权益；2) 加强会员精准营销；3) 提升会员复购率和客单价。`
  } else if (msg.includes('建议') || msg.includes('怎么办') || msg.includes('如何')) {
    aiReply = `基于当前经营数据分析，我有以下建议：\n\n` +
      `1. **毛利率管理**：持续监控进货成本和促销折扣，确保毛利率维持在18%以上\n` +
      `2. **客流提升**：通过企微社群精准推送、到店专属优惠提升客流\n` +
      `3. **库存优化**：加快滞销品清仓，优化采购批量\n` +
      `4. **会员运营**：提升会员活跃度和复购率，目标会员营收占比40%+\n` +
      `5. **线上渠道**：继续加大线上投入，提升线上营收占比\n\n` +
      `需要我对某个方面进行更深入的分析吗？`
  } else {
    aiReply = `您好！我是亚细亚经营数据分析助手，可以帮您分析经营数据、解答经营相关问题。\n\n` +
      `当前经营概况：\n` +
      todayMetrics.map(m => `- ${m.metric_name}：${m.metric_type === 'profit_rate' || m.metric_type === 'member_revenue_ratio' || m.metric_type === 'return_rate' ? m.value + m.unit : m.value >= 10000 ? (m.value / 10000).toFixed(1) + '万' + m.unit : m.value.toLocaleString() + m.unit}`).join('\n') +
      `\n\n您可以问我关于营业额、利润、客流、库存、会员等方面的问题，也可以让我给出经营建议。`
  }

  db.prepare(
    'INSERT INTO chat_messages (role, content, context) VALUES (?, ?, ?)'
  ).run('assistant', aiReply, JSON.stringify(contextInfo))

  res.json({ success: true, data: { reply: aiReply, context: contextInfo } })
})

router.delete('/history', (req, res) => {
  const db = getDB()
  db.prepare('DELETE FROM chat_messages').run()
  res.json({ success: true, message: '对话历史已清除' })
})

export default router
