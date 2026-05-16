import { useState } from 'react'
import {
  Card, Row, Col, Input, Select, Button, Tabs, Tag, Space, Typography,
  Divider, Spin, message, Progress, List, Slider, Tooltip, Timeline
} from 'antd'
import {
  RobotOutlined, VideoCameraOutlined, PlayCircleOutlined,
  SaveOutlined, SendOutlined, FireOutlined, BulbOutlined,
  ScissorOutlined, SoundOutlined, FileTextOutlined
} from '@ant-design/icons'
import { hotTopics, aiTemplates } from '../../mock/data'
import { aiAPI } from '../../services/api'

const { TextArea } = Input
const { Title, Text, Paragraph } = Typography
const { Option } = Select

const videoStyles = [
  { id: 1, name: '种草推荐', duration: '15-30秒', desc: '快节奏商品展示' },
  { id: 2, name: '品牌故事', duration: '30-120秒', desc: '情感叙事风格' },
  { id: 3, name: '探店打卡', duration: '30-60秒', desc: '沉浸式体验' },
  { id: 4, name: '穿搭展示', duration: '15-45秒', desc: '真人试穿效果' },
  { id: 5, name: '活动预告', duration: '15-30秒', desc: '促销信息传达' },
  { id: 6, name: '知识科普', duration: '30-90秒', desc: '专业内容讲解' }
]

const videoPlatforms = [
  { name: '抖音', maxDuration: 300, icon: '🎵', color: '#fe2c55' },
  { name: '视频号', maxDuration: 900, icon: '📹', color: '#fa9d3b' }
]

export default function VideoCreation() {
  const [prompt, setPrompt] = useState('')
  const [videoStyle, setVideoStyle] = useState(videoStyles[0])
  const [platform, setPlatform] = useState('抖音')
  const [duration, setDuration] = useState(30)
  const [generating, setGenerating] = useState(false)
  const [generateStep, setGenerateStep] = useState(0)
  const [generatedScript, setGeneratedScript] = useState(null)
  const [generatedVideo, setGeneratedVideo] = useState(false)

  const steps = [
    '分析创作需求...',
    '检索知识库素材...',
    '生成视频脚本...',
    '匹配视觉风格...',
    '合成视频内容...',
    '品牌合规审核...'
  ]

  const handleGenerate = async () => {
    if (!prompt) {
      message.warning('请输入视频创作需求')
      return
    }
    setGenerating(true)
    setGenerateStep(0)
    setGeneratedScript(null)
    setGeneratedVideo(false)

    const stepInterval = setInterval(() => {
      setGenerateStep(prev => {
        if (prev >= steps.length - 1) {
          clearInterval(stepInterval)
          return prev
        }
        return prev + 1
      })
    }, 800)

    try {
      const result = await aiAPI.generateVideo({
        prompt,
        videoStyle: videoStyle.name,
        duration,
        platform
      })
      clearInterval(stepInterval)
      setGenerateStep(steps.length)

      if (result.success) {
        setGeneratedScript({
          title: prompt.slice(0, 20) || '亚细亚精选推荐',
          rawContent: result.content,
          scenes: [
            { id: 1, duration: '0-3秒', type: '开场', description: '品牌Logo动画 + 吸引眼球的文字钩子', visual: '亚细亚品牌标识', audio: '轻快背景音乐渐入' },
            { id: 2, duration: '3-10秒', type: '痛点引入', description: '展示用户痛点场景，引发共鸣', visual: '日常场景画面 + 痛点文字叠加', audio: '旁白引入' },
            { id: 3, duration: '10-22秒', type: '产品展示', description: '核心商品/服务展示，突出卖点', visual: '商品特写 + 使用效果 + 价格标签', audio: '旁白介绍' },
            { id: 4, duration: '22-28秒', type: '优惠信息', description: '促销活动信息，制造紧迫感', visual: '活动海报 + 倒计时 + 优惠码', audio: '旁白促销' },
            { id: 5, duration: '28-30秒', type: '结尾CTA', description: '行动号召 + 品牌标识', visual: '亚细亚Logo + "关注我们"', audio: '品牌音效' }
          ],
          totalDuration: `${duration}秒`,
          bgMusic: '轻快活力 - 时尚购物风',
          voiceType: '女声 - 温暖亲切'
        })
        setGeneratedVideo(true)
        message.success(result.source === 'ai' ? 'AI视频脚本生成完成！' : '视频脚本生成完成（使用内置模板，配置API Key后可使用AI）')
      } else {
        message.error(result.message || '生成失败')
      }
    } catch (err) {
      clearInterval(stepInterval)
      message.error('生成失败: ' + err.message)
    }
    setGenerating(false)
  }

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card className="content-card" title={
            <Space>
              <VideoCameraOutlined style={{ color: '#e63946' }} />
              <span>AI视频创作</span>
            </Space>
          }>
            <Tabs defaultActiveKey="script" items={[
              {
                key: 'script',
                label: '脚本+视频生成',
                children: (
                  <div>
                    <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
                      <Col span={8}>
                        <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>发布平台</Text>
                        <Select value={platform} onChange={setPlatform} style={{ width: '100%' }}>
                          {videoPlatforms.map(p => (
                            <Option key={p.name} value={p.name}>{p.icon} {p.name}</Option>
                          ))}
                        </Select>
                      </Col>
                      <Col span={8}>
                        <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>视频风格</Text>
                        <Select value={videoStyle.name} onChange={v => setVideoStyle(videoStyles.find(s => s.name === v))} style={{ width: '100%' }}>
                          {videoStyles.map(s => (
                            <Option key={s.name} value={s.name}>{s.name} ({s.duration})</Option>
                          ))}
                        </Select>
                      </Col>
                      <Col span={8}>
                        <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>视频时长（秒）</Text>
                        <Slider min={15} max={platform === '视频号' ? 120 : 60} value={duration} onChange={setDuration} />
                      </Col>
                    </Row>

                    <TextArea
                      rows={3}
                      value={prompt}
                      onChange={e => setPrompt(e.target.value)}
                      placeholder="请描述视频创作需求，例如：制作一条夏日护肤好物推荐短视频，重点推荐防晒和补水产品，目标受众25-35岁女性..."
                      style={{ marginBottom: 12 }}
                    />

                    <Row justify="space-between" align="middle">
                      <Col>
                        <Space>
                          <Button
                            type="primary"
                            icon={<RobotOutlined />}
                            onClick={handleGenerate}
                            loading={generating}
                            style={{ background: '#e63946', borderColor: '#e63946' }}
                          >
                            {generating ? 'AI创作中...' : '一键生成视频'}
                          </Button>
                          <Button icon={<FileTextOutlined />}>仅生成脚本</Button>
                        </Space>
                      </Col>
                      <Col>
                        <Space>
                          <Tooltip title="配音设置">
                            <Button icon={<SoundOutlined />} />
                          </Tooltip>
                          <Tooltip title="剪辑设置">
                            <Button icon={<ScissorOutlined />} />
                          </Tooltip>
                        </Space>
                      </Col>
                    </Row>
                  </div>
                )
              },
              {
                key: 'template',
                label: '视频模板',
                children: (
                  <Row gutter={[12, 12]}>
                    {aiTemplates.filter(t => t.type === '视频').map(t => (
                      <Col span={12} key={t.id}>
                        <Card size="small" hoverable>
                          <Space direction="vertical" size={4}>
                            <Text strong>{t.name}</Text>
                            <Text type="secondary" style={{ fontSize: 12 }}>{t.description}</Text>
                            <div>
                              {t.fields.map(f => (
                                <Tag key={f} color="default" style={{ fontSize: 11 }}>{f}</Tag>
                              ))}
                            </div>
                          </Space>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                )
              }
            ]} />
          </Card>

          {generating && (
            <Card className="content-card">
              <div style={{ textAlign: 'center', padding: '30px 0' }}>
                <Spin size="large" />
                <div style={{ marginTop: 16 }}>
                  <Text className="ai-generating" style={{ fontSize: 16, color: '#e63946' }}>
                    <RobotOutlined /> {steps[generateStep]}
                  </Text>
                </div>
                <Progress
                  percent={Math.round((generateStep / steps.length) * 100)}
                  status="active"
                  strokeColor="#e63946"
                  style={{ maxWidth: 400, margin: '16px auto' }}
                />
                <Timeline
                  style={{ textAlign: 'left', maxWidth: 400, margin: '0 auto' }}
                  items={steps.map((s, i) => ({
                    color: i < generateStep ? 'green' : i === generateStep ? 'red' : 'gray',
                    children: (
                      <Text type={i <= generateStep ? undefined : 'secondary'} style={{ fontSize: 13 }}>
                        {i < generateStep ? '✓ ' : i === generateStep ? '→ ' : '○ '}{s}
                      </Text>
                    )
                  }))}
                />
              </div>
            </Card>
          )}

          {generatedScript && (
            <Card className="content-card" title={
              <Space>
                <VideoCameraOutlined style={{ color: '#52c41a' }} />
                <span>生成结果</span>
                <Tag color="green">已完成</Tag>
              </Space>
            } extra={
              <Space>
                <Button icon={<SaveOutlined />}>保存脚本</Button>
                <Button type="primary" icon={<SendOutlined />} style={{ background: '#e63946', borderColor: '#e63946' }}>
                  发布视频
                </Button>
              </Space>
            }>
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <div style={{
                    background: '#000',
                    borderRadius: 8,
                    height: 300,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    position: 'relative'
                  }}>
                    <PlayCircleOutlined style={{ fontSize: 48, opacity: 0.8 }} />
                    <div style={{ position: 'absolute', bottom: 12, left: 12, right: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={{ color: '#fff', fontSize: 12 }}>0:00</Text>
                        <Text style={{ color: '#fff', fontSize: 12 }}>0:{generatedScript.totalDuration.replace('秒', '')}</Text>
                      </div>
                      <Progress percent={0} showInfo={false} strokeColor="#e63946" style={{ margin: 0 }} />
                    </div>
                    <div style={{ position: 'absolute', top: 12, left: 12 }}>
                      <Tag color="red">预览</Tag>
                    </div>
                    <div style={{ position: 'absolute', top: 12, right: 12 }}>
                      <Tag color="blue">{platform}</Tag>
                    </div>
                  </div>
                </Col>

                <Col span={24}>
                  <Title level={5}>视频脚本</Title>
                  <Timeline items={generatedScript.scenes.map(scene => ({
                    color: 'red',
                    children: (
                      <Card size="small" style={{ marginBottom: 4 }}>
                        <Row gutter={8}>
                          <Col span={4}>
                            <Tag color="blue">{scene.duration}</Tag>
                          </Col>
                          <Col span={20}>
                            <Text strong style={{ fontSize: 13 }}>{scene.type}</Text>
                            <br />
                            <Text style={{ fontSize: 12 }}>{scene.description}</Text>
                            <br />
                            <Text type="secondary" style={{ fontSize: 11 }}>画面：{scene.visual}</Text>
                            <br />
                            <Text type="secondary" style={{ fontSize: 11 }}>音频：{scene.audio}</Text>
                          </Col>
                        </Row>
                      </Card>
                    )
                  }))} />
                </Col>

                <Col span={24}>
                  <Divider style={{ margin: '8px 0' }} />
                  <Row gutter={16}>
                    <Col span={6}>
                      <Text type="secondary">视频时长</Text><br />
                      <Text strong>{generatedScript.totalDuration}</Text>
                    </Col>
                    <Col span={6}>
                      <Text type="secondary">背景音乐</Text><br />
                      <Tag>{generatedScript.bgMusic}</Tag>
                    </Col>
                    <Col span={6}>
                      <Text type="secondary">配音风格</Text><br />
                      <Tag>{generatedScript.voiceType}</Tag>
                    </Col>
                    <Col span={6}>
                      <Text type="secondary">品牌合规</Text><br />
                      <Tag color="green">已通过</Tag>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Card>
          )}
        </Col>

        <Col xs={24} lg={8}>
          <Card className="content-card" title={
            <Space>
              <FireOutlined style={{ color: '#e63946' }} />
              <span>行业热点</span>
            </Space>
          } size="small">
            <List
              size="small"
              dataSource={hotTopics.slice(0, 5)}
              renderItem={item => (
                <List.Item style={{ cursor: 'pointer', padding: '8px 0' }}>
                  <List.Item.Meta
                    avatar={
                      <div className={`hot-topic-rank ${item.rank <= 3 ? 'top3' : 'normal'}`}>
                        {item.rank}
                      </div>
                    }
                    title={<Text style={{ fontSize: 13 }}>{item.title}</Text>}
                    description={<Text type="secondary" style={{ fontSize: 11 }}>热度 {(item.heat / 10000).toFixed(0)}万</Text>}
                  />
                </List.Item>
              )}
            />
          </Card>

          <Card className="content-card" title={
            <Space>
              <BulbOutlined style={{ color: '#fa8c16' }} />
              <span>视频风格</span>
            </Space>
          } size="small">
            <List
              size="small"
              dataSource={videoStyles}
              renderItem={s => (
                <List.Item
                  style={{ cursor: 'pointer', padding: '8px 0', background: videoStyle.id === s.id ? '#fff1f0' : undefined }}
                  onClick={() => setVideoStyle(s)}
                >
                  <List.Item.Meta
                    title={<Text style={{ fontSize: 13, fontWeight: videoStyle.id === s.id ? 600 : 400 }}>{s.name}</Text>}
                    description={<Text type="secondary" style={{ fontSize: 11 }}>{s.desc} · {s.duration}</Text>}
                  />
                </List.Item>
              )}
            />
          </Card>

          <Card className="content-card" title="近期视频数据" size="small">
            <div style={{ marginBottom: 12 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>抖音近7天</Text>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#fe2c55' }}>7</div>
                  <div style={{ fontSize: 11, color: '#999' }}>发布</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#e63946' }}>12.5万</div>
                  <div style={{ fontSize: 11, color: '#999' }}>播放</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#fa8c16' }}>8.2%</div>
                  <div style={{ fontSize: 11, color: '#999' }}>互动率</div>
                </div>
              </div>
            </div>
            <Divider style={{ margin: '8px 0' }} />
            <Text type="secondary" style={{ fontSize: 12 }}>视频号近7天</Text>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#fa9d3b' }}>5</div>
                <div style={{ fontSize: 11, color: '#999' }}>发布</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#e63946' }}>6.8万</div>
                <div style={{ fontSize: 11, color: '#999' }}>播放</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#fa8c16' }}>11.5%</div>
                <div style={{ fontSize: 11, color: '#999' }}>互动率</div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
