import cron from 'node-cron'
import { getDB } from '../db/init.js'
import { generateArticle, generateVideoScript, isAIConfigured } from './ai.js'

const activeJobs = new Map()

export function startScheduler() {
  const db = getDB()
  const tasks = db.prepare("SELECT * FROM scheduled_tasks WHERE status = 'active'").all()

  for (const task of tasks) {
    scheduleTask(task)
  }

  console.log(`[调度器] 已加载 ${tasks.length} 个定时任务`)
}

export function scheduleTask(task) {
  if (activeJobs.has(task.id)) {
    activeJobs.get(task.id).stop()
    activeJobs.delete(task.id)
  }

  if (task.status !== 'active') return

  const isValid = cron.validate(task.cron_expression)
  if (!isValid) {
    console.error(`[调度器] 任务"${task.name}"的cron表达式无效: ${task.cron_expression}`)
    return
  }

  const job = cron.schedule(task.cron_expression, async () => {
    await executeTask(task)
  }, {
    scheduled: true,
    timezone: 'Asia/Shanghai'
  })

  activeJobs.set(task.id, job)
  console.log(`[调度器] 任务"${task.name}"已调度: ${task.cron_expression}`)
}

export function unscheduleTask(taskId) {
  if (activeJobs.has(taskId)) {
    activeJobs.get(taskId).stop()
    activeJobs.delete(taskId)
  }
}

async function executeTask(task) {
  console.log(`[调度器] 执行任务: ${task.name}`)

  const db = getDB()
  const config = JSON.parse(task.config || '{}')

  try {
    let result
    let prompt = buildPrompt(task, config)

    if (task.content_type === '文章') {
      result = await generateArticle({
        prompt,
        platform: task.platform,
        wordCount: config.wordCount || '800-1200',
        tone: '专业温暖',
        useHotTopics: config.useHotTopics || false,
        hotTopic: ''
      })
    } else if (task.content_type === '视频') {
      result = await generateVideoScript({
        prompt,
        videoStyle: config.style || '种草推荐',
        duration: parseInt(config.videoDuration) || 30,
        platform: task.platform
      })
    } else {
      result = await generateArticle({
        prompt,
        platform: task.platform,
        wordCount: '300-500',
        tone: '亲切家常',
        useHotTopics: config.useHotTopics || false,
        hotTopic: ''
      })
    }

    db.prepare(`
      UPDATE scheduled_tasks
      SET last_run = CURRENT_TIMESTAMP, total_produced = total_produced + 1, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(task.id)

    console.log(`[调度器] 任务"${task.name}"执行完成, 来源: ${result.source}`)
  } catch (err) {
    console.error(`[调度器] 任务"${task.name}"执行失败:`, err.message)
  }
}

function buildPrompt(task, config) {
  let prompt = `定时任务"${task.name}"自动触发`

  if (config.contentFocus) {
    prompt += `，内容重点：${config.contentFocus}`
  }
  if (config.template) {
    prompt += `，使用${config.template}模板`
  }
  if (config.style) {
    prompt += `，风格：${config.style}`
  }

  const db = getDB()
  const today = new Date().toISOString().slice(0, 10)
  const upcoming = db.prepare(
    "SELECT name, date, type FROM marketing_nodes WHERE date >= ? AND status = 'upcoming' ORDER BY date LIMIT 1"
  ).get(today)

  if (upcoming) {
    const daysLeft = Math.ceil((new Date(upcoming.date) - new Date()) / (1000 * 60 * 60 * 24))
    if (daysLeft <= upcoming.advance_days) {
      prompt += `。注意：即将到来的营销节点"${upcoming.name}"(${upcoming.date})，请结合此节点进行创作`
    }
  }

  return prompt
}

export function getActiveJobCount() {
  return activeJobs.size
}

export function getTaskStatus(taskId) {
  return activeJobs.has(taskId) ? 'running' : 'stopped'
}
