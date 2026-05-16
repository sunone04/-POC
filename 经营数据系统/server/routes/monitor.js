import { Router } from 'express'
import { getDB } from '../db/init.js'

const router = Router()

router.get('/rules', (req, res) => {
  const db = getDB()
  const rules = db.prepare('SELECT * FROM anomaly_rules ORDER BY created_at DESC').all()
  res.json({ success: true, data: rules })
})

router.post('/rules', (req, res) => {
  const db = getDB()
  const { name, metric_type, condition_type, threshold, comparison, severity, notify_channels } = req.body
  const result = db.prepare(
    'INSERT INTO anomaly_rules (name, metric_type, condition_type, threshold, comparison, severity, notify_channels) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(name, metric_type, condition_type, threshold, comparison || 'lt', severity || 'warning', JSON.stringify(notify_channels || []))
  res.json({ success: true, data: { id: result.lastInsertRowid } })
})

router.put('/rules/:id', (req, res) => {
  const db = getDB()
  const { id } = req.params
  const { name, metric_type, condition_type, threshold, comparison, severity, enabled, notify_channels } = req.body
  db.prepare(
    `UPDATE anomaly_rules SET name=COALESCE(?,name), metric_type=COALESCE(?,metric_type),
     condition_type=COALESCE(?,condition_type), threshold=COALESCE(?,threshold),
     comparison=COALESCE(?,comparison), severity=COALESCE(?,severity),
     enabled=COALESCE(?,enabled), notify_channels=COALESCE(?,notify_channels) WHERE id=?`
  ).run(name, metric_type, condition_type, threshold, comparison, severity, enabled,
    notify_channels ? JSON.stringify(notify_channels) : null, id)
  res.json({ success: true })
})

router.delete('/rules/:id', (req, res) => {
  const db = getDB()
  db.prepare('DELETE FROM anomaly_rules WHERE id=?').run(req.params.id)
  res.json({ success: true })
})

router.get('/events', (req, res) => {
  const db = getDB()
  const { status, severity, limit = 50 } = req.query
  let query = 'SELECT * FROM anomaly_events'
  const params = []
  const conditions = []
  if (status) { conditions.push('status=?'); params.push(status) }
  if (severity) { conditions.push('severity=?'); params.push(severity) }
  if (conditions.length) query += ' WHERE ' + conditions.join(' AND ')
  query += ' ORDER BY created_at DESC LIMIT ?'
  params.push(parseInt(limit))
  const events = db.prepare(query).all(...params)
  res.json({ success: true, data: events })
})

router.put('/events/:id/resolve', (req, res) => {
  const db = getDB()
  const { id } = req.params
  db.prepare(
    `UPDATE anomaly_events SET status='resolved', resolved_at=datetime('now','localtime') WHERE id=?`
  ).run(id)
  res.json({ success: true })
})

router.get('/stats', (req, res) => {
  const db = getDB()
  const total = db.prepare('SELECT COUNT(*) as cnt FROM anomaly_events').get().cnt
  const pending = db.prepare("SELECT COUNT(*) as cnt FROM anomaly_events WHERE status='pending'").get().cnt
  const processing = db.prepare("SELECT COUNT(*) as cnt FROM anomaly_events WHERE status='processing'").get().cnt
  const resolved = db.prepare("SELECT COUNT(*) as cnt FROM anomaly_events WHERE status='resolved'").get().cnt
  const critical = db.prepare("SELECT COUNT(*) as cnt FROM anomaly_events WHERE severity='critical' AND status!='resolved'").get().cnt
  const rulesCount = db.prepare('SELECT COUNT(*) as cnt FROM anomaly_rules').get().cnt
  const enabledRules = db.prepare('SELECT COUNT(*) as cnt FROM anomaly_rules WHERE enabled=1').get().cnt

  res.json({
    success: true,
    data: { total, pending, processing, resolved, critical, rulesCount, enabledRules }
  })
})

router.post('/check', (req, res) => {
  const db = getDB()

  const rules = db.prepare('SELECT * FROM anomaly_rules WHERE enabled=1').all()
  const todayMetrics = db.prepare(
    "SELECT metric_type, value FROM business_metrics WHERE date='2026-05-14' AND store='all' AND category='all'"
  ).all()
  const metricMap = {}
  todayMetrics.forEach(m => { metricMap[m.metric_type] = m.value })

  const newEvents = []

  for (const rule of rules) {
    const value = metricMap[rule.metric_type]
    if (value === undefined) continue

    let triggered = false
    if (rule.condition_type === 'absolute') {
      triggered = rule.comparison === 'lt' ? value < rule.threshold : value > rule.threshold
    } else if (rule.condition_type === 'day_over_day') {
      const yesterday = db.prepare(
        "SELECT value FROM business_metrics WHERE date='2026-05-13' AND metric_type=? AND store='all' AND category='all'"
      ).get(rule.metric_type)
      if (yesterday) {
        const change = ((value - yesterday.value) / yesterday.value) * 100
        triggered = rule.comparison === 'lt' ? change < -rule.threshold : change > rule.threshold
      }
    }

    const existing = db.prepare(
      "SELECT id FROM anomaly_events WHERE rule_id=? AND status IN ('pending','processing') LIMIT 1"
    ).get(rule.id)

    if (triggered && !existing) {
      const result = db.prepare(
        `INSERT INTO anomaly_events (rule_id, rule_name, metric_type, metric_name, current_value, threshold_value, severity, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', datetime('now','localtime'))`
      ).run(rule.id, rule.name, rule.metric_type, rule.name, value, rule.threshold, rule.severity)
      newEvents.push({ id: result.lastInsertRowid, rule_name: rule.name, current_value: value })
    }
  }

  res.json({ success: true, data: { checked: rules.length, newEvents } })
})

export default router
