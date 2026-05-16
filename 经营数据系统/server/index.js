import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { initDB } from './db/init.js'
import datasourceRoutes from './routes/datasource.js'
import overviewRoutes from './routes/overview.js'
import monitorRoutes from './routes/monitor.js'
import agentRoutes from './routes/agent.js'
import chatRoutes from './routes/chat.js'

const app = express()
const PORT = process.env.PORT || 3003

app.use(cors())
app.use(express.json({ limit: '10mb' }))

app.use('/api/datasource', datasourceRoutes)
app.use('/api/overview', overviewRoutes)
app.use('/api/monitor', monitorRoutes)
app.use('/api/agent', agentRoutes)
app.use('/api/chat', chatRoutes)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: '亚细亚经营数据分析系统', version: '1.0.0' })
})

try {
  initDB()
  console.log('[数据库] 初始化完成')
} catch (err) {
  console.error('[数据库] 初始化失败:', err.message)
  process.exit(1)
}

app.listen(PORT, () => {
  console.log('')
  console.log('  ╔══════════════════════════════════════════════╗')
  console.log('  ║   亚细亚经营数据分析系统 - 后端服务已启动     ║')
  console.log(`  ║   http://localhost:${PORT}/api                   ║`)
  console.log('  ╚══════════════════════════════════════════════╝')
  console.log('')
})
