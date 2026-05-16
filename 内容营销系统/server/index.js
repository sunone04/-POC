import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { initDB } from './db/init.js'
import contentRoutes from './routes/content.js'
import taskRoutes from './routes/tasks.js'
import calendarRoutes from './routes/calendar.js'
import knowledgeRoutes from './routes/knowledge.js'
import analyticsRoutes from './routes/analytics.js'
import aiRoutes from './routes/ai.js'
import { startScheduler } from './services/scheduler.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json({ limit: '10mb' }))

app.use('/api/content', contentRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/calendar', calendarRoutes)
app.use('/api/knowledge', knowledgeRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/ai', aiRoutes)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: '亚细亚内容营销系统', version: '1.0.0' })
})

try {
  initDB()
  console.log('[数据库] 初始化完成')
} catch (err) {
  console.error('[数据库] 初始化失败:', err.message)
  process.exit(1)
}

try {
  startScheduler()
  console.log('[调度器] 定时任务已启动')
} catch (err) {
  console.error('[调度器] 启动失败:', err.message)
}

app.listen(PORT, () => {
  console.log('')
  console.log('  ╔══════════════════════════════════════════╗')
  console.log('  ║   亚细亚内容营销系统 - 后端服务已启动     ║')
  console.log(`  ║   http://localhost:${PORT}/api              ║`)
  console.log('  ╚══════════════════════════════════════════╝')
  console.log('')
})
