import OpenAI from 'openai'
import { getDB } from '../db/init.js'

let openaiClient = null

function getClient() {
  if (!openaiClient) {
    const apiKey = process.env.AI_API_KEY
    if (!apiKey || apiKey === 'your-api-key-here') {
      return null
    }
    openaiClient = new OpenAI({
      apiKey,
      baseURL: process.env.AI_API_BASE || 'https://dashscope.aliyuncs.com/compatible-mode/v1'
    })
  }
  return openaiClient
}

function getKnowledgeContext(category) {
  const db = getDB()
  let items
  if (category) {
    items = db.prepare('SELECT title, content, tags FROM knowledge_items WHERE category = ? LIMIT 5').all(category)
  } else {
    items = db.prepare('SELECT title, content, category, tags FROM knowledge_items LIMIT 10').all()
  }
  return items.map(item => `【${item.category}】${item.title}：${item.content}`).join('\n')
}

function getUpcomingNodes() {
  const db = getDB()
  const today = new Date().toISOString().slice(0, 10)
  return db.prepare(
    "SELECT name, date, type FROM marketing_nodes WHERE date >= ? AND status = 'upcoming' ORDER BY date LIMIT 3"
  ).all(today)
}

function getRecentHotContent() {
  const db = getDB()
  return db.prepare(
    'SELECT title, platform, views, likes FROM content_items WHERE views > 10000 ORDER BY views DESC LIMIT 3'
  ).all()
}

const BRAND_IDENTITY = `## 品牌核心身份
- 品牌名：亚细亚（YAXIYA）
- 定位：郑州地标性百货商场，中原地区品质生活方式引领者
- 历史传承：1989年5月6日开业，"中原之行哪里去——郑州亚细亚"响彻全国，开创中国现代百货零售先河
- 品牌精神：温暖、专业、可信赖，像老朋友一样陪伴郑州人的日常生活
- 核心客群：25-55岁注重生活品质的城市中产家庭，重视服务和口碑，习惯线下体验+线上了解
- 品牌调性：不是高高在上的奢侈品，也不是廉价折扣店，而是"懂生活、有品位、接地气"的邻家好商场
- Slogan参考："亚细亚，懂你的生活美学" / "品质生活，从亚细亚开始"`

const VOICE_GUIDELINES = `## 文案语感规范
### 必须做到
- 像跟朋友聊天一样自然，不说"尊敬的顾客"这种官话
- 用"你"而不是"您"，拉近距离感
- 适当使用emoji但不过度，每段1-2个点缀即可
- 具体描述商品/活动细节，避免空泛的"超值""震撼"等大词
- 结尾要有明确的行动指引（来店/扫码/关注/留言）
- 涉及会员权益、退换政策等信息必须与知识库一致，不可编造

### 绝对禁止
- 禁止使用"重磅""史诗级""炸裂"等夸张网络用语
- 禁止虚假宣传或夸大优惠力度
- 禁止出现其他商场/竞品名称
- 禁止使用"史上最低""永久有效"等绝对化用语
- 禁止编造不存在的商品、价格或活动`

const PLATFORM_RULES = {
  '公众号': `## 公众号文章规范
- 标题：15字以内，用数字或疑问句制造好奇，如"3件入夏必买单品，第2件我回购了3次"
- 开头：前3行必须抓住注意力，可用场景痛点或生活洞察切入
- 正文：分段短句为主，每段不超过4行；善用小标题和序号
- 配图提示：每300-500字标注[配图建议：xxx]
- 结尾：引导互动（留言/点赞/转发），附门店信息
- 字数控制在800-1500字，信息密度要高，避免注水`,

  '抖音': `## 抖音短视频脚本规范
- 前3秒必须有强钩子（悬念/冲突/反转/视觉冲击）
- 节奏快，每5-8秒一个信息点或画面切换
- 台词口语化，像跟闺蜜聊天推荐好物
- 必须有明确的种草点（价格/品质/独特性）
- 结尾3秒：行动号召+品牌露出
- 配乐选择：优先热门BGM，风格与内容匹配
- 时长：种草类15-30秒，探店类30-60秒，品牌故事类60-90秒`,

  '视频号': `## 视频号内容规范
- 受众偏成熟稳重，内容要有"质感"和"温度"
- 开头用生活场景或情感共鸣切入，不要太跳脱
- 语速适中，吐字清晰，避免网络用语
- 画面要精致，注重光影和构图
- 适合：品牌故事、生活方式、品质推荐类内容
- 时长：30-120秒，节奏比抖音慢但信息量不少`,

  '企微': `## 企微社群推送规范
- 标题：简短有力，8字以内，如"今日秒杀""会员专属"
- 正文：100-300字，信息直给，不绕弯子
- 必须包含：优惠内容+时间+参与方式
- 语气：像群里的热心邻居分享好物，亲切但不啰嗦
- 配图：1-3张商品图或活动海报
- 频次：每天不超过2条，避免打扰
- 可适当@所有人，但要有价值才@`
}

function buildSystemPrompt(platform, contentType) {
  const knowledgeContext = getKnowledgeContext()
  const upcomingNodes = getUpcomingNodes()
  const nodesInfo = upcomingNodes.map(n => `${n.name}(${n.date}, ${n.type})`).join('、')
  const hotContent = getRecentHotContent()
  const hotContentInfo = hotContent.map(c => `"${c.title}"(${c.platform}, 浏览${c.views}次, 点赞${c.likes})`).join('、')
  const platformRule = PLATFORM_RULES[platform] || PLATFORM_RULES['公众号']

  return `你是亚细亚百货商场的内容营销AI助手，专门为亚细亚零售企业创作高质量营销内容。

${BRAND_IDENTITY}

${VOICE_GUIDELINES}

${platformRule}

## 企业营销知识库（创作时必须参考，确保信息准确）
${knowledgeContext}

## 即将到来的营销节点（可结合创作）
${nodesInfo || '暂无临近节点'}

## 近期爆款内容参考（学习其成功要素）
${hotContentInfo || '暂无数据'}

## 当前创作任务
- 发布平台：${platform}
- 内容类型：${contentType}

## 输出要求
直接输出可发布的完整内容，不要输出任何解释性文字、创作思路或备注。内容必须可以直接复制使用。`
}

export async function generateArticle({ prompt, platform = '公众号', wordCount = '800-1200', tone = '专业温暖', useHotTopics = true, hotTopic = '' }) {
  const client = getClient()

  if (!client) {
    return generateArticleFallback({ prompt, platform, wordCount, tone, useHotTopics, hotTopic })
  }

  const systemPrompt = buildSystemPrompt(platform, '文章')

  let userPrompt = `请为亚细亚创作一篇${platform}文章。

创作主题：${prompt}
字数要求：${wordCount}字
语气风格：${tone}`

  if (useHotTopics && hotTopic) {
    userPrompt += `\n\n请自然地结合当前行业热点"${hotTopic}"进行创作，不要生硬植入，要让热点与亚细亚的品牌调性有机融合。`
  }

  const upcomingNodes = getUpcomingNodes()
  if (upcomingNodes.length > 0) {
    userPrompt += `\n\n当前临近营销节点：${upcomingNodes.map(n => n.name).join('、')}，可适当在文中提及相关活动或福利。`
  }

  userPrompt += `\n\n请确保：
1. 标题吸引人但不标题党
2. 开头3行抓住读者注意力
3. 正文有具体商品/活动细节，不空泛
4. 结尾有明确行动号召
5. 每300-500字标注[配图建议：xxx]`

  try {
    const completion = await client.chat.completions.create({
      model: process.env.AI_MODEL || 'qwen-plus',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.85,
      max_tokens: 3000
    })

    const content = completion.choices[0].message.content
    saveGeneratedContent(prompt, '文章', platform, content)
    return { success: true, content, source: 'ai' }
  } catch (err) {
    console.error('[AI] 文章生成失败:', err.message)
    return generateArticleFallback({ prompt, platform, wordCount, tone, useHotTopics, hotTopic })
  }
}

export async function generateImagePrompt({ prompt, style = '小红书种草', colorScheme = '品牌红', platform = '公众号' }) {
  const client = getClient()

  if (!client) {
    return generateImageFallback({ prompt, style, colorScheme, platform })
  }

  const systemPrompt = buildSystemPrompt(platform, '图文/海报')

  const userPrompt = `请为亚细亚创作一组图文/海报设计方案。

创作主题：${prompt}
图片风格：${style}
配色方案：${colorScheme}
发布平台：${platform}

请输出完整设计方案：

【主标题文案】
（吸引眼球的主标题，15字以内）

【副标题文案】
（补充说明的副标题，20字以内）

【画面描述】
（详细描述画面构图、主体元素、场景氛围，用于指导设计师或AI生图）

【AI生图英文Prompt】
（用于Midjourney/Stable Diffusion等AI图片生成工具的英文提示词，包含风格、构图、光影、色调等细节）

【配色方案】
- 主色：亚细亚品牌红 #C41230
- 辅色：（建议2-3个搭配色，标注色值和用途）
- 文字色：

【排版建议】
（文字位置、大小层级、视觉动线）

【多尺寸适配】
- 公众号封面（900x383）
- 朋友圈海报（1080x1920）
- 小红书配图（1080x1440）`

  try {
    const completion = await client.chat.completions.create({
      model: process.env.AI_MODEL || 'qwen-plus',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.8,
      max_tokens: 2000
    })

    const content = completion.choices[0].message.content
    return { success: true, content, source: 'ai' }
  } catch (err) {
    console.error('[AI] 图文生成失败:', err.message)
    return generateImageFallback({ prompt, style, colorScheme, platform })
  }
}

export async function generateVideoScript({ prompt, videoStyle = '种草推荐', duration = 30, platform = '抖音' }) {
  const client = getClient()

  if (!client) {
    return generateVideoFallback({ prompt, videoStyle, duration, platform })
  }

  const systemPrompt = buildSystemPrompt(platform, '短视频脚本')

  const userPrompt = `请为亚细亚创作一个短视频脚本。

创作主题：${prompt}
视频风格：${videoStyle}
视频时长：${duration}秒
发布平台：${platform}

请按以下格式输出完整脚本：

【钩子】(0-3秒)
画面：
台词/旁白：
（必须在前3秒制造悬念或冲突，让观众停下来）

【正文段落1】(3-X秒)
画面：
台词/旁白：
（核心卖点/故事展开，每5-8秒一个信息点）

【正文段落2】(X-Y秒)
画面：
台词/旁白：
（补充信息/使用场景/用户证言）

【结尾CTA】(Y-${duration}秒)
画面：
台词/旁白：
（行动号召+品牌露出，如"来亚细亚看看吧"+"关注我们"）

---
背景音乐建议：（具体到音乐风格和情绪）
配音风格建议：（性别、年龄感、语速、情绪）
画面整体风格：（色调、滤镜、拍摄手法）
字幕样式建议：（字体、颜色、位置）`

  try {
    const completion = await client.chat.completions.create({
      model: process.env.AI_MODEL || 'qwen-plus',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.85,
      max_tokens: 2500
    })

    const content = completion.choices[0].message.content
    saveGeneratedContent(prompt, '视频脚本', platform, content)
    return { success: true, content, source: 'ai' }
  } catch (err) {
    console.error('[AI] 视频脚本生成失败:', err.message)
    return generateVideoFallback({ prompt, videoStyle, duration, platform })
  }
}

export async function analyzeContent(contentId) {
  const client = getClient()
  const db = getDB()

  const item = db.prepare('SELECT * FROM content_items WHERE id = ?').get(contentId)
  if (!item) return { success: false, message: '内容不存在' }

  const engagementRate = item.views > 0
    ? ((item.likes + item.comments + item.shares) / item.views * 100).toFixed(1)
    : 0

  if (!client) {
    const fallbackInsight = generateFallbackInsight(item, engagementRate)
    db.prepare('INSERT INTO ai_insights (content_id, insight, deposited) VALUES (?, ?, 0)').run(contentId, fallbackInsight)
    return { success: true, insight: fallbackInsight, engagementRate, source: 'fallback' }
  }

  try {
    const knowledgeContext = getKnowledgeContext()
    const completion = await client.chat.completions.create({
      model: process.env.AI_MODEL || 'qwen-plus',
      messages: [
        {
          role: 'system',
          content: `你是亚细亚百货的内容营销数据分析师。请分析以下内容的数据表现，总结成功经验或失败原因，给出可落地的优化建议。参考知识库：${knowledgeContext}`
        },
        {
          role: 'user',
          content: `请分析以下内容：
标题：${item.title}
平台：${item.platform}
类型：${item.type}
触发方式：${item.trigger_type} - ${item.trigger_name}
浏览量：${item.views}
点赞：${item.likes}
评论：${item.comments}
分享：${item.shares}
互动率：${engagementRate}%

请总结：1.成功/失败原因 2.可复用的经验 3.优化建议`
        }
      ],
      temperature: 0.5,
      max_tokens: 1000
    })

    const insight = completion.choices[0].message.content
    db.prepare('INSERT INTO ai_insights (content_id, insight, deposited) VALUES (?, ?, 0)').run(contentId, insight)
    return { success: true, insight, engagementRate, source: 'ai' }
  } catch (err) {
    console.error('[AI] 内容分析失败:', err.message)
    const fallbackInsight = generateFallbackInsight(item, engagementRate)
    db.prepare('INSERT INTO ai_insights (content_id, insight, deposited) VALUES (?, ?, 0)').run(contentId, fallbackInsight)
    return { success: true, insight: fallbackInsight, engagementRate, source: 'fallback' }
  }
}

function saveGeneratedContent(prompt, type, platform, content) {
  try {
    const db = getDB()
    db.prepare(`
      INSERT INTO content_items (title, type, platform, status, content, trigger_type, trigger_name)
      VALUES (?, ?, ?, 'draft', ?, '手动创作', ?)
    `).run(prompt.slice(0, 50), type, platform, content, 'AI生成')
  } catch (err) {
    console.error('[数据库] 保存生成内容失败:', err.message)
  }
}

function generateArticleFallback({ prompt, platform, wordCount, tone, useHotTopics, hotTopic }) {
  const topicPart = useHotTopics && hotTopic ? `，结合"${hotTopic}"热点` : ''
  const content = `亲爱的亚细亚家人们，大家好！

今天为您带来精心准备的精彩内容——

亚细亚精选推荐

${prompt ? `主题：${prompt}${topicPart}` : ''}

在这个充满活力的季节里，亚细亚为您甄选最值得拥有的好物与体验。无论是品质生活的日常所需，还是节日馈赠的心意之选，我们都能满足您的期待。

本期亮点：

1. 品质之选 - 精选国际一线品牌，品质保证，让您购物无忧。从时尚服饰到精致美妆，从家居好物到数码科技，亚细亚汇聚全球好物，只为给您最好的。

[配图建议：精选商品拼图，突出品质感]

2. 会员专享 - 金卡及以上会员享受额外9折优惠，积分翻倍累积！现在升级会员，更多专属权益等您来解锁。

[配图建议：会员卡视觉+权益列表]

3. 限时特惠 - 本周精选商品低至5折起，数量有限，先到先得！快来亚细亚，开启您的品质购物之旅。

[配图建议：促销商品海报，突出折扣力度]

温馨提示：
- 会员日（每月15日）全场额外折扣
- 新会员注册即享200积分大礼包
- 关注亚细亚${platform}，获取最新优惠资讯

亚细亚商场——您身边的生活美学空间
服务热线：400-XXX-XXXX
营业时间：10:00-22:00

#亚细亚 #品质生活 #好物推荐 #会员福利`

  saveGeneratedContent(prompt || '未命名文章', '文章', platform, content)
  return { success: true, content, source: 'fallback' }
}

function generateImageFallback({ prompt, style, colorScheme, platform }) {
  const content = `图文设计方案

【主标题文案】
${prompt ? prompt.slice(0, 15) : '亚细亚精选'} | 品质生活之选

【副标题文案】
来亚细亚，发现你的生活美学

【画面描述】
以亚细亚品牌红为主色调，搭配温馨的购物场景。画面中心为精选商品展示区，周围辅以品牌标识和促销信息。整体氛围温暖、有质感，体现亚细亚"懂生活"的品牌调性。

【AI生图英文Prompt】
A warm and elegant retail scene, premium products display, red and gold color scheme, soft lighting, modern department store interior, lifestyle photography, high quality, 4k

【配色方案】
- 主色：亚细亚品牌红 #C41230
- 辅色1：暖金色 #D4A574（用于边框和点缀）
- 辅色2：米白色 #F5F0EB（用于背景）
- 文字色：深灰 #333333

【排版建议】
- 上方1/3：品牌Logo + 主标题
- 中间1/3：商品展示区（留白充足）
- 下方1/3：促销信息 + 行动号召

【多尺寸适配】
- 公众号封面（900x383）：横版，突出主标题
- 朋友圈海报（1080x1920）：竖版，商品居中
- 小红书配图（1080x1440）：竖版，偏生活化`

  return { success: true, content, source: 'fallback' }
}

function generateVideoFallback({ prompt, videoStyle, duration, platform }) {
  const content = `短视频脚本

视频风格：${videoStyle}
视频时长：${duration}秒
发布平台：${platform}

【钩子】(0-3秒)
画面：亚细亚商场外景快速推近 + 文字"这个宝藏商场你一定要知道！"
台词/旁白："等等！先别划走，这个发现你一定会感谢我"

【正文段落1】(3-15秒)
画面：商场内部精选商品特写，快节奏切换
台词/旁白："亚细亚最近上了好多新品，我帮你们挑了最值得入手的几件，件件都是闭眼入的节奏"

【正文段落2】(15-25秒)
画面：商品使用场景 + 价格标签 + 会员优惠信息
台词/旁白："而且金卡会员还有额外折扣，积分直接翻倍，这波真的太划算了"

【结尾CTA】(25-${duration}秒)
画面：亚细亚Logo + 门店地址 + "关注我们"引导
台词/旁白："快来亚细亚看看吧，地址就在二七广场，关注我了解更多好物推荐"

---
背景音乐建议：轻快时尚风，节奏感强，BPM 120左右
配音风格建议：女声，25-30岁，语速偏快，热情有感染力
画面整体风格：明亮暖色调，快节奏剪辑，适当加转场特效
字幕样式建议：白色粗体字，底部居中，关键词用品牌红高亮`

  saveGeneratedContent(prompt || '未命名视频', '视频脚本', platform, content)
  return { success: true, content, source: 'fallback' }
}

function generateFallbackInsight(item, engagementRate) {
  const isGood = parseFloat(engagementRate) > 8
  if (isGood) {
    return `该内容互动率达${engagementRate}%，表现优异。${item.trigger_type === '营销节点' ? '营销节点触发的内容效果显著，建议在类似节点提前准备同类型内容。' : '定时产出的内容质量稳定，建议保持当前创作方向。'}标题吸引力强，内容与目标受众匹配度高。建议将此内容风格作为后续创作的参考模板。`
  }
  return `该内容互动率为${engagementRate}%，有提升空间。建议优化标题吸引力，增强前3秒/首段的钩子效果，并尝试结合当前行业热点提升内容传播力。`
}

export function isAIConfigured() {
  const apiKey = process.env.AI_API_KEY
  return apiKey && apiKey !== 'your-api-key-here' && apiKey.length > 10
}
