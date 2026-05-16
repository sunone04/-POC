import { Router } from 'express'
import { getDB } from '../db/init.js'

const router = Router()

router.get('/', (req, res) => {
  const db = getDB()
  const { category, search } = req.query
  let items

  if (search) {
    items = db.prepare(
      'SELECT * FROM knowledge_items WHERE title LIKE ? OR content LIKE ? ORDER BY created_at DESC'
    ).all(`%${search}%`, `%${search}%`)
  } else if (category) {
    items = db.prepare(
      'SELECT * FROM knowledge_items WHERE category = ? ORDER BY created_at DESC'
    ).all(category)
  } else {
    items = db.prepare('SELECT * FROM knowledge_items ORDER BY created_at DESC').all()
  }

  const result = items.map(item => ({
    ...item,
    tags: item.tags ? item.tags.split(',') : [],
    extra: JSON.parse(item.extra || '{}')
  }))

  res.json({ success: true, data: result })
})

router.get('/categories', (req, res) => {
  const db = getDB()
  const categories = db.prepare(
    'SELECT category, COUNT(*) as count FROM knowledge_items GROUP BY category'
  ).all()
  res.json({ success: true, data: categories })
})

router.get('/:id', (req, res) => {
  const db = getDB()
  const item = db.prepare('SELECT * FROM knowledge_items WHERE id = ?').get(req.params.id)
  if (!item) return res.status(404).json({ success: false, message: '条目不存在' })
  res.json({
    success: true,
    data: {
      ...item,
      tags: item.tags ? item.tags.split(',') : [],
      extra: JSON.parse(item.extra || '{}')
    }
  })
})

router.post('/', (req, res) => {
  const db = getDB()
  const { category, title, content, tags, extra } = req.body
  if (!category || !title || !content) {
    return res.status(400).json({ success: false, message: '缺少必填字段' })
  }
  const result = db.prepare(`
    INSERT INTO knowledge_items (category, title, content, tags, extra)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    category,
    title,
    content,
    Array.isArray(tags) ? tags.join(',') : (tags || ''),
    JSON.stringify(extra || {})
  )
  res.json({ success: true, id: result.lastInsertRowid })
})

router.put('/:id', (req, res) => {
  const db = getDB()
  const { category, title, content, tags, extra } = req.body
  const existing = db.prepare('SELECT * FROM knowledge_items WHERE id = ?').get(req.params.id)
  if (!existing) return res.status(404).json({ success: false, message: '条目不存在' })

  db.prepare(`
    UPDATE knowledge_items SET
      category = ?, title = ?, content = ?, tags = ?, extra = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
    category || existing.category,
    title || existing.title,
    content || existing.content,
    tags ? (Array.isArray(tags) ? tags.join(',') : tags) : existing.tags,
    extra ? JSON.stringify(extra) : existing.extra,
    req.params.id
  )
  res.json({ success: true })
})

router.delete('/:id', (req, res) => {
  const db = getDB()
  db.prepare('DELETE FROM knowledge_items WHERE id = ?').run(req.params.id)
  res.json({ success: true })
})

export default router
