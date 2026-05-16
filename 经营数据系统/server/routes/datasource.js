import { Router } from 'express'
import { getDB } from '../db/init.js'

const router = Router()

router.get('/', (req, res) => {
  const db = getDB()
  const sources = db.prepare('SELECT * FROM data_sources ORDER BY created_at DESC').all()
  res.json({ success: true, data: sources })
})

router.post('/', (req, res) => {
  const db = getDB()
  const { name, type, config, sync_interval } = req.body
  const result = db.prepare(
    'INSERT INTO data_sources (name, type, status, config, sync_interval) VALUES (?, ?, ?, ?, ?)'
  ).run(name, type, 'disconnected', JSON.stringify(config || {}), sync_interval || 300)
  res.json({ success: true, data: { id: result.lastInsertRowid } })
})

router.put('/:id', (req, res) => {
  const db = getDB()
  const { id } = req.params
  const { name, type, status, config, sync_interval } = req.body
  db.prepare(
    `UPDATE data_sources SET name=COALESCE(?,name), type=COALESCE(?,type), status=COALESCE(?,status),
     config=COALESCE(?,config), sync_interval=COALESCE(?,sync_interval),
     updated_at=datetime('now','localtime') WHERE id=?`
  ).run(name, type, status, config ? JSON.stringify(config) : null, sync_interval, id)
  res.json({ success: true })
})

router.delete('/:id', (req, res) => {
  const db = getDB()
  db.prepare('DELETE FROM data_sources WHERE id=?').run(req.params.id)
  res.json({ success: true })
})

router.post('/:id/connect', (req, res) => {
  const db = getDB()
  const { id } = req.params
  db.prepare(
    `UPDATE data_sources SET status='connected', last_sync=datetime('now','localtime'),
     updated_at=datetime('now','localtime') WHERE id=?`
  ).run(id)
  res.json({ success: true, message: '数据源连接成功' })
})

router.post('/:id/disconnect', (req, res) => {
  const db = getDB()
  const { id } = req.params
  db.prepare(
    `UPDATE data_sources SET status='disconnected', updated_at=datetime('now','localtime') WHERE id=?`
  ).run(id)
  res.json({ success: true, message: '数据源已断开' })
})

router.post('/:id/sync', (req, res) => {
  const db = getDB()
  const { id } = req.params
  db.prepare(
    `UPDATE data_sources SET last_sync=datetime('now','localtime'),
     updated_at=datetime('now','localtime') WHERE id=?`
  ).run(id)
  res.json({ success: true, message: '数据同步完成', syncTime: new Date().toISOString() })
})

router.get('/status', (req, res) => {
  const db = getDB()
  const total = db.prepare('SELECT COUNT(*) as cnt FROM data_sources').get().cnt
  const connected = db.prepare("SELECT COUNT(*) as cnt FROM data_sources WHERE status='connected'").get().cnt
  const types = db.prepare('SELECT type, COUNT(*) as cnt FROM data_sources GROUP BY type').all()
  res.json({
    success: true,
    data: { total, connected, disconnected: total - connected, types }
  })
})

export default router
