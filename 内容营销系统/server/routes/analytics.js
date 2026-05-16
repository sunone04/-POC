import { Router } from 'express'
import { getDB } from '../db/init.js'
import { analyzeContent } from '../services/ai.js'

const router = Router()

router.get('/overview', (req, res) => {
  const db = getDB()

  const totalContent = db.prepare('SELECT COUNT(*) as count FROM content_items').get().count
  const publishedContent = db.prepare("SELECT COUNT(*) as count FROM content_items WHERE status = 'published'").get().count
  const totalViews = db.prepare('SELECT COALESCE(SUM(views), 0) as total FROM content_items').get().total
  const totalLikes = db.prepare('SELECT COALESCE(SUM(likes), 0) as total FROM content_items').get().total
  const totalShares = db.prepare('SELECT COALESCE(SUM(shares), 0) as total FROM content_items').get().total
  const totalComments = db.prepare('SELECT COALESCE(SUM(comments), 0) as total FROM content_items').get().total

  const platformStats = db.prepare(`
    SELECT platform,
      COUNT(*) as count,
      SUM(views) as totalViews,
      SUM(likes) as totalLikes,
      AVG(views) as avgViews,
      AVG(likes) as avgLikes
    FROM content_items WHERE status = 'published'
    GROUP BY platform
  `).all()

  const topContent = db.prepare(`
    SELECT * FROM content_items
    WHERE status = 'published' AND views > 10000
    ORDER BY views DESC LIMIT 5
  `).all()

  const insights = db.prepare(`
    SELECT ai.*, ci.title as content_title, ci.platform
    FROM ai_insights ai
    LEFT JOIN content_items ci ON ai.content_id = ci.id
    ORDER BY ai.created_at DESC LIMIT 10
  `).all()

  const engagementRate = totalViews > 0
    ? ((totalLikes + totalComments + totalShares) / totalViews * 100).toFixed(1)
    : 0

  res.json({
    success: true,
    data: {
      totalContent,
      publishedContent,
      totalViews,
      totalLikes,
      totalShares,
      totalComments,
      engagementRate,
      platformStats,
      topContent,
      insights
    }
  })
})

router.get('/content', (req, res) => {
  const db = getDB()
  const { platform, type, status, sort = 'views', order = 'DESC' } = req.query

  let sql = 'SELECT * FROM content_items WHERE 1=1'
  const params = []

  if (platform) { sql += ' AND platform = ?'; params.push(platform) }
  if (type) { sql += ' AND type = ?'; params.push(type) }
  if (status) { sql += ' AND status = ?'; params.push(status) }

  const allowedSorts = ['views', 'likes', 'shares', 'comments', 'created_at']
  const sortCol = allowedSorts.includes(sort) ? sort : 'views'
  const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC'
  sql += ` ORDER BY ${sortCol} ${sortOrder}`

  const items = db.prepare(sql).all(...params)
  res.json({ success: true, data: items })
})

router.post('/analyze/:id', async (req, res) => {
  try {
    const result = await analyzeContent(parseInt(req.params.id))
    res.json(result)
  } catch (err) {
    res.status(500).json({ success: false, message: '分析失败: ' + err.message })
  }
})

router.post('/insights/:id/deposit', (req, res) => {
  const db = getDB()
  const insight = db.prepare('SELECT * FROM ai_insights WHERE id = ?').get(req.params.id)
  if (!insight) return res.status(404).json({ success: false, message: '洞察不存在' })

  db.prepare('UPDATE ai_insights SET deposited = 1 WHERE id = ?').run(req.params.id)

  if (insight.content_id) {
    const content = db.prepare('SELECT * FROM content_items WHERE id = ?').get(insight.content_id)
    if (content) {
      db.prepare(`
        INSERT INTO knowledge_items (category, title, content, tags, extra)
        VALUES (?, ?, ?, ?, ?)
      `).run(
        '优质文章',
        `[经验沉淀] ${content.title}`,
        insight.insight,
        'AI复盘,经验沉淀',
        JSON.stringify({ source: 'ai_insight', contentId: insight.content_id, platform: content.platform })
      )
    }
  }

  res.json({ success: true, message: '成功经验已沉淀到知识库' })
})

export default router
