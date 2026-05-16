import { Router } from 'express'
import { getDB } from '../db/init.js'
import { scheduleTask, unscheduleTask } from '../services/scheduler.js'

const router = Router()

router.get('/', (req, res) => {
  const db = getDB()
  const tasks = db.prepare('SELECT * FROM scheduled_tasks ORDER BY created_at DESC').all()
  res.json({ success: true, data: tasks })
})

router.get('/:id', (req, res) => {
  const db = getDB()
  const task = db.prepare('SELECT * FROM scheduled_tasks WHERE id = ?').get(req.params.id)
  if (!task) return res.status(404).json({ success: false, message: '任务不存在' })
  res.json({ success: true, data: task })
})

router.post('/', (req, res) => {
  const db = getDB()
  const { name, platform, content_type, schedule, cron_expression, config } = req.body
  if (!name || !platform || !content_type || !cron_expression) {
    return res.status(400).json({ success: false, message: '缺少必填字段' })
  }
  const result = db.prepare(`
    INSERT INTO scheduled_tasks (name, platform, content_type, schedule, cron_expression, status, config)
    VALUES (?, ?, ?, ?, ?, 'active', ?)
  `).run(name, platform, content_type, schedule || '', cron_expression, JSON.stringify(config || {}))

  const task = db.prepare('SELECT * FROM scheduled_tasks WHERE id = ?').get(result.lastInsertRowid)
  scheduleTask(task)

  res.json({ success: true, id: result.lastInsertRowid })
})

router.put('/:id', (req, res) => {
  const db = getDB()
  const { name, platform, content_type, schedule, cron_expression, status, config } = req.body
  const existing = db.prepare('SELECT * FROM scheduled_tasks WHERE id = ?').get(req.params.id)
  if (!existing) return res.status(404).json({ success: false, message: '任务不存在' })

  const newStatus = status !== undefined ? status : existing.status

  db.prepare(`
    UPDATE scheduled_tasks SET
      name = ?, platform = ?, content_type = ?, schedule = ?,
      cron_expression = ?, status = ?, config = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
    name || existing.name,
    platform || existing.platform,
    content_type || existing.content_type,
    schedule || existing.schedule,
    cron_expression || existing.cron_expression,
    newStatus,
    config ? JSON.stringify(config) : existing.config,
    req.params.id
  )

  if (newStatus === 'active') {
    const task = db.prepare('SELECT * FROM scheduled_tasks WHERE id = ?').get(req.params.id)
    scheduleTask(task)
  } else {
    unscheduleTask(parseInt(req.params.id))
  }

  res.json({ success: true })
})

router.delete('/:id', (req, res) => {
  unscheduleTask(parseInt(req.params.id))
  const db = getDB()
  db.prepare('DELETE FROM scheduled_tasks WHERE id = ?').run(req.params.id)
  res.json({ success: true })
})

router.post('/:id/run', async (req, res) => {
  const db = getDB()
  const task = db.prepare('SELECT * FROM scheduled_tasks WHERE id = ?').get(req.params.id)
  if (!task) return res.status(404).json({ success: false, message: '任务不存在' })

  const { generateArticle, generateVideoScript } = await import('../services/ai.js')
  const config = JSON.parse(task.config || '{}')
  let prompt = `手动触发任务"${task.name}"`

  try {
    let result
    if (task.content_type === '文章') {
      result = await generateArticle({ prompt, platform: task.platform, wordCount: config.wordCount || '800-1200', tone: '专业温暖', useHotTopics: config.useHotTopics || false })
    } else if (task.content_type === '视频') {
      result = await generateVideoScript({ prompt, videoStyle: config.style || '种草推荐', duration: 30, platform: task.platform })
    } else {
      result = await generateArticle({ prompt, platform: task.platform, wordCount: '300-500', tone: '亲切家常', useHotTopics: config.useHotTopics || false })
    }

    db.prepare(`
      UPDATE scheduled_tasks SET last_run = CURRENT_TIMESTAMP, total_produced = total_produced + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `).run(req.params.id)

    res.json({ success: true, message: '任务执行完成', result })
  } catch (err) {
    res.status(500).json({ success: false, message: '任务执行失败: ' + err.message })
  }
})

export default router
