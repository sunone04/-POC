import { Router } from 'express'
import { getDB } from '../db/init.js'

const router = Router()

const AVG_METRICS = ['profit_rate', 'member_revenue_ratio', 'return_rate', 'inventory_turnover', 'avg_transaction']

function getDateRange(period) {
  const today = '2026-05-14'
  const ranges = {
    daily: { start: today, end: today, prevStart: '2026-05-13', prevEnd: '2026-05-13', label: '今日', prevLabel: '昨日' },
    weekly: { start: '2026-05-08', end: today, prevStart: '2026-05-01', prevEnd: '2026-05-07', label: '本周', prevLabel: '上周' },
    monthly: { start: '2026-05-01', end: today, prevStart: '2026-04-01', prevEnd: '2026-04-14', label: '本月', prevLabel: '上月同期' }
  }
  return ranges[period] || ranges.daily
}

function aggregateMetrics(rows) {
  const result = {}
  rows.forEach(m => {
    if (!result[m.metric_type]) {
      result[m.metric_type] = { metric_type: m.metric_type, metric_name: m.metric_name, value: 0, unit: m.unit, isAvg: false }
    }
    const isAvg = AVG_METRICS.includes(m.metric_type)
    result[m.metric_type].isAvg = isAvg
    result[m.metric_type].unit = m.unit
    result[m.metric_type].metric_name = m.metric_name
    if (isAvg) {
      result[m.metric_type].value = (result[m.metric_type].value || 0) + m.value
      result[m.metric_type].count = (result[m.metric_type].count || 0) + 1
    } else {
      result[m.metric_type].value += m.value
    }
  })
  Object.values(result).forEach(r => {
    if (r.isAvg && r.count) {
      r.value = parseFloat((r.value / r.count).toFixed(1))
    } else if (!r.isAvg) {
      r.value = Math.round(r.value)
    }
  })
  return result
}

router.get('/dashboard', (req, res) => {
  const db = getDB()
  const period = req.query.period || 'daily'
  const range = getDateRange(period)

  let currentMetrics, prevMetrics, trendMetrics, categoryMetrics

  if (period === 'daily') {
    currentMetrics = db.prepare(
      "SELECT metric_type, metric_name, value, unit FROM business_metrics WHERE date=? AND store='all' AND category='all'"
    ).all(range.start)

    prevMetrics = db.prepare(
      "SELECT metric_type, metric_name, value, unit FROM business_metrics WHERE date=? AND store='all' AND category='all'"
    ).all(range.prevStart)

    trendMetrics = db.prepare(
      "SELECT date, metric_type, value FROM business_metrics WHERE date>='2026-05-01' AND date<=? AND store='all' AND category='all' ORDER BY date"
    ).all(range.end)

    categoryMetrics = db.prepare(
      "SELECT category, value FROM business_metrics WHERE date=? AND metric_type='revenue' AND store='all' AND category!='all' ORDER BY value DESC"
    ).all(range.start)
  } else {
    const currentRows = db.prepare(
      "SELECT metric_type, metric_name, value, unit FROM business_metrics WHERE date>=? AND date<=? AND store='all' AND category='all'"
    ).all(range.start, range.end)

    const prevRows = db.prepare(
      "SELECT metric_type, metric_name, value, unit FROM business_metrics WHERE date>=? AND date<=? AND store='all' AND category='all'"
    ).all(range.prevStart, range.prevEnd)

    currentMetrics = Object.values(aggregateMetrics(currentRows))
    prevMetrics = Object.values(aggregateMetrics(prevRows))

    trendMetrics = db.prepare(
      "SELECT date, metric_type, value FROM business_metrics WHERE date>='2026-05-01' AND date<=? AND store='all' AND category='all' ORDER BY date"
    ).all(range.end)

    const catRows = db.prepare(
      "SELECT category, SUM(value) as value FROM business_metrics WHERE date>=? AND date<=? AND metric_type='revenue' AND store='all' AND category!='all' GROUP BY category ORDER BY value DESC"
    ).all(range.start, range.end)
    categoryMetrics = catRows.map(r => ({ category: r.category, value: Math.round(r.value) }))
  }

  const activeAlerts = db.prepare(
    "SELECT COUNT(*) as cnt FROM anomaly_events WHERE status IN ('pending','processing')"
  ).get().cnt

  const metricMap = {}
  currentMetrics.forEach(m => { metricMap[m.metric_type] = { ...m } })
  const prevMap = {}
  prevMetrics.forEach(m => { prevMap[m.metric_type] = m.value })

  const trendData = {}
  trendMetrics.forEach(m => {
    if (!trendData[m.date]) trendData[m.date] = {}
    trendData[m.date][m.metric_type] = m.value
  })

  res.json({
    success: true,
    data: {
      today: metricMap,
      yesterday: prevMap,
      trends: trendData,
      categoryBreakdown: categoryMetrics,
      activeAlerts,
      period,
      periodLabel: range.label,
      prevLabel: range.prevLabel,
      dateRange: { start: range.start, end: range.end }
    }
  })
})

router.get('/trend', (req, res) => {
  const db = getDB()
  const { metric_type = 'revenue', days = 14 } = req.query

  const data = db.prepare(
    `SELECT date, value FROM business_metrics WHERE metric_type=? AND store='all' AND category='all' ORDER BY date DESC LIMIT ?`
  ).all(metric_type, parseInt(days))

  res.json({ success: true, data: data.reverse() })
})

router.get('/store', (req, res) => {
  const db = getDB()
  const { date = '2026-05-14' } = req.query

  const data = db.prepare(
    "SELECT store, value FROM business_metrics WHERE date=? AND metric_type='revenue' AND store!='all' AND category='all' ORDER BY value DESC"
  ).all(date)

  res.json({ success: true, data })
})

router.get('/category', (req, res) => {
  const db = getDB()
  const { date = '2026-05-14' } = req.query

  const data = db.prepare(
    "SELECT category, value FROM business_metrics WHERE date=? AND metric_type='revenue' AND store='all' AND category!='all' ORDER BY value DESC"
  ).all(date)

  res.json({ success: true, data })
})

router.get('/reports', (req, res) => {
  const db = getDB()
  const { type } = req.query
  let query = 'SELECT * FROM reports'
  const params = []
  if (type) {
    query += ' WHERE report_type=?'
    params.push(type)
  }
  query += ' ORDER BY created_at DESC LIMIT 20'
  const reports = db.prepare(query).all(...params)
  res.json({ success: true, data: reports.map(r => ({ ...r, content: JSON.parse(r.content) })) })
})

router.get('/calendar', (req, res) => {
  const db = getDB()
  const { year, month } = req.query
  const y = parseInt(year) || 2026
  const m = parseInt(month) || 5
  const startDate = `${y}-${String(m).padStart(2, '0')}-01`
  const endDate = m === 12 ? `${y + 1}-01-01` : `${y}-${String(m + 1).padStart(2, '0')}-01`

  const metrics = db.prepare(
    `SELECT date, metric_type, value FROM business_metrics
     WHERE date>=? AND date<? AND store='all' AND category='all'
     ORDER BY date`
  ).all(startDate, endDate)

  const events = db.prepare(
    `SELECT date(created_at) as date, severity, COUNT(*) as count FROM anomaly_events
     WHERE date(created_at)>=? AND date(created_at)<?
     GROUP BY date(created_at), severity`
  ).all(startDate, endDate)

  const calendarData = {}
  metrics.forEach(m => {
    if (!calendarData[m.date]) calendarData[m.date] = {}
    calendarData[m.date][m.metric_type] = m.value
  })

  const eventData = {}
  events.forEach(e => {
    if (!eventData[e.date]) eventData[e.date] = {}
    eventData[e.date][e.severity] = e.count
  })

  res.json({ success: true, data: { metrics: calendarData, events: eventData } })
})

router.post('/reports/generate', (req, res) => {
  const db = getDB()
  const { report_type, period_start, period_end } = req.body

  const metrics = db.prepare(
    `SELECT metric_type, metric_name, AVG(value) as avg_value, SUM(value) as sum_value
     FROM business_metrics WHERE date>=? AND date<=? AND store='all' AND category='all'
     GROUP BY metric_type`
  ).all(period_start, period_end)

  const content = {}
  metrics.forEach(m => {
    content[m.metric_type] = AVG_METRICS.includes(m.metric_type)
      ? parseFloat(m.avg_value.toFixed(1))
      : Math.round(m.sum_value)
  })

  const summary = `${report_type === 'daily' ? '日' : report_type === 'weekly' ? '周' : '月'}报已生成，期间${period_start}至${period_end}，营业额${(content.revenue / 10000).toFixed(1)}万，毛利率${content.profit_rate || '-'}%`

  db.prepare(
    'INSERT INTO reports (report_type, period_start, period_end, content, summary) VALUES (?, ?, ?, ?, ?)'
  ).run(report_type, period_start, period_end, JSON.stringify(content), summary)

  res.json({ success: true, message: '报告生成成功' })
})

export default router
