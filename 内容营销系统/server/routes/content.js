import { Router } from 'express'
import { getDB } from '../db/init.js'

const router = Router()

router.get('/', (req, res) => {
  const db = getDB()
  const items = db.prepare('SELECT * FROM content_items ORDER BY created_at DESC').all()
  res.json({ success: true, data: items })
})

router.get('/:id', (req, res) => {
  const db = getDB()
  const item = db.prepare('SELECT * FROM content_items WHERE id = ?').get(req.params.id)
  if (!item) return res.status(404).json({ success: false, message: '内容不存在' })
  res.json({ success: true, data: item })
})

router.post('/', (req, res) => {
  const db = getDB()
  const { title, type, platform, status, content, trigger_type, trigger_name } = req.body
  if (!title || !type || !platform) {
    return res.status(400).json({ success: false, message: '缺少必填字段' })
  }
  const result = db.prepare(`
    INSERT INTO content_items (title, type, platform, status, content, trigger_type, trigger_name)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(title, type, platform, status || 'draft', content || '', trigger_type || '', trigger_name || '')
  res.json({ success: true, id: result.lastInsertRowid })
})

router.put('/:id', (req, res) => {
  const db = getDB()
  const { title, type, platform, status, content, views, likes, comments, shares } = req.body
  const existing = db.prepare('SELECT * FROM content_items WHERE id = ?').get(req.params.id)
  if (!existing) return res.status(404).json({ success: false, message: '内容不存在' })

  db.prepare(`
    UPDATE content_items SET
      title = ?, type = ?, platform = ?, status = ?, content = ?,
      views = ?, likes = ?, comments = ?, shares = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
    title || existing.title,
    type || existing.type,
    platform || existing.platform,
    status || existing.status,
    content !== undefined ? content : existing.content,
    views !== undefined ? views : existing.views,
    likes !== undefined ? likes : existing.likes,
    comments !== undefined ? comments : existing.comments,
    shares !== undefined ? shares : existing.shares,
    req.params.id
  )
  res.json({ success: true })
})

router.delete('/:id', (req, res) => {
  const db = getDB()
  db.prepare('DELETE FROM content_items WHERE id = ?').run(req.params.id)
  res.json({ success: true })
})

export default router
