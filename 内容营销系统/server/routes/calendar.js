import { Router } from 'express'
import { getDB } from '../db/init.js'

const router = Router()

router.get('/', (req, res) => {
  const db = getDB()
  const nodes = db.prepare('SELECT * FROM marketing_nodes ORDER BY date').all()
  res.json({ success: true, data: nodes })
})

router.get('/upcoming', (req, res) => {
  const db = getDB()
  const today = new Date().toISOString().slice(0, 10)
  const nodes = db.prepare(
    "SELECT * FROM marketing_nodes WHERE date >= ? AND status = 'upcoming' ORDER BY date"
  ).all(today)
  res.json({ success: true, data: nodes })
})

router.get('/nearest', (req, res) => {
  const db = getDB()
  const today = new Date().toISOString().slice(0, 10)
  const node = db.prepare(
    "SELECT * FROM marketing_nodes WHERE date >= ? AND status = 'upcoming' ORDER BY date LIMIT 1"
  ).get(today)
  res.json({ success: true, data: node })
})

router.post('/', (req, res) => {
  const db = getDB()
  const { name, date, type, advance_days, auto_prepare } = req.body
  if (!name || !date || !type) {
    return res.status(400).json({ success: false, message: '缺少必填字段' })
  }
  const result = db.prepare(`
    INSERT INTO marketing_nodes (name, date, type, advance_days, status, auto_prepare)
    VALUES (?, ?, ?, ?, 'upcoming', ?)
  `).run(name, date, type, advance_days || 7, auto_prepare !== undefined ? (auto_prepare ? 1 : 0) : 1)
  res.json({ success: true, id: result.lastInsertRowid })
})

router.put('/:id', (req, res) => {
  const db = getDB()
  const { name, date, type, advance_days, status, auto_prepare } = req.body
  const existing = db.prepare('SELECT * FROM marketing_nodes WHERE id = ?').get(req.params.id)
  if (!existing) return res.status(404).json({ success: false, message: '节点不存在' })

  db.prepare(`
    UPDATE marketing_nodes SET
      name = ?, date = ?, type = ?, advance_days = ?, status = ?, auto_prepare = ?
    WHERE id = ?
  `).run(
    name || existing.name,
    date || existing.date,
    type || existing.type,
    advance_days !== undefined ? advance_days : existing.advance_days,
    status || existing.status,
    auto_prepare !== undefined ? (auto_prepare ? 1 : 0) : existing.auto_prepare,
    req.params.id
  )
  res.json({ success: true })
})

router.delete('/:id', (req, res) => {
  const db = getDB()
  db.prepare('DELETE FROM marketing_nodes WHERE id = ?').run(req.params.id)
  res.json({ success: true })
})

export default router
