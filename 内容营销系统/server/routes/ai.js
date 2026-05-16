import { Router } from 'express'
import { generateArticle, generateImagePrompt, generateVideoScript, isAIConfigured } from '../services/ai.js'

const router = Router()

router.post('/generate/article', async (req, res) => {
  try {
    const { prompt, platform, wordCount, tone, useHotTopics, hotTopic } = req.body
    if (!prompt) {
      return res.status(400).json({ success: false, message: '请输入创作要求' })
    }
    const result = await generateArticle({ prompt, platform, wordCount, tone, useHotTopics, hotTopic })
    res.json(result)
  } catch (err) {
    console.error('[API] 文章生成失败:', err.message)
    res.status(500).json({ success: false, message: '文章生成失败: ' + err.message })
  }
})

router.post('/generate/image', async (req, res) => {
  try {
    const { prompt, style, colorScheme, platform } = req.body
    if (!prompt) {
      return res.status(400).json({ success: false, message: '请输入图文创作描述' })
    }
    const result = await generateImagePrompt({ prompt, style, colorScheme, platform })
    res.json(result)
  } catch (err) {
    console.error('[API] 图文生成失败:', err.message)
    res.status(500).json({ success: false, message: '图文生成失败: ' + err.message })
  }
})

router.post('/generate/video', async (req, res) => {
  try {
    const { prompt, videoStyle, duration, platform } = req.body
    if (!prompt) {
      return res.status(400).json({ success: false, message: '请输入视频创作需求' })
    }
    const result = await generateVideoScript({ prompt, videoStyle, duration, platform })
    res.json(result)
  } catch (err) {
    console.error('[API] 视频脚本生成失败:', err.message)
    res.status(500).json({ success: false, message: '视频脚本生成失败: ' + err.message })
  }
})

router.get('/status', (req, res) => {
  res.json({
    aiConfigured: isAIConfigured(),
    model: isAIConfigured() ? process.env.AI_MODEL : '未配置（使用内置模板）',
    apiBase: process.env.AI_API_BASE || ''
  })
})

export default router
