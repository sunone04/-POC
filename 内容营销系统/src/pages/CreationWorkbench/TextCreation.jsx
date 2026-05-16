import { useState } from 'react'
import {
  Card, Row, Col, Input, Select, Button, Tabs, Tag, Space, Typography,
  Divider, Spin, message, Modal, Tooltip, Progress, List, Badge
} from 'antd'
import {
  RobotOutlined, SendOutlined, CopyOutlined, SaveOutlined,
  FireOutlined, BulbOutlined, FileTextOutlined, ReloadOutlined,
  BookOutlined, ThunderboltOutlined, ExpandOutlined
} from '@ant-design/icons'
import { hotTopics, aiTemplates, brandStories, memberBenefits } from '../../mock/data'
import { aiAPI } from '../../services/api'

const { TextArea } = Input
const { Title, Text, Paragraph } = Typography
const { Option } = Select

export default function TextCreation() {
  const [prompt, setPrompt] = useState('')
  const [template, setTemplate] = useState(null)
  const [platform, setPlatform] = useState('公众号')
  const [generating, setGenerating] = useState(false)
  const [generatedContent, setGeneratedContent] = useState('')
  const [wordCount, setWordCount] = useState('800-1200')
  const [tone, setTone] = useState('专业温暖')
  const [useHotTopic, setUseHotTopic] = useState(true)
  const [selectedHotTopic, setSelectedHotTopic] = useState(null)
  const [saveModalVisible, setSaveModalVisible] = useState(false)

  const handleGenerate = async () => {
    if (!prompt && !template) {
      message.warning('请输入创作要求或选择创作模板')
      return
    }
    setGenerating(true)
    setGeneratedContent('')
    try {
      const result = await aiAPI.generateArticle({
        prompt: prompt || (template ? `使用${template.name}模板创作` : ''),
        platform,
        wordCount,
        tone,
        useHotTopics: useHotTopic,
        hotTopic: selectedHotTopic || ''
      })
      if (result.success) {
        setGeneratedContent(result.content)
        message.success(result.source === 'ai' ? 'AI内容生成完成！' : '内容生成完成（使用内置模板，配置API Key后可使用AI）')
      } else {
        message.error(result.message || '生成失败')
      }
    } catch (err) {
      message.error('生成失败: ' + err.message)
    }
    setGenerating(false)
  }

  const handleCopy = () => {
    navigator.clipboard?.writeText(generatedContent)
    message.success('已复制到剪贴板')
  }

  const handleSave = () => {
    setSaveModalVisible(true)
  }

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card className="content-card" title={
            <Space>
              <FileTextOutlined style={{ color: '#e63946' }} />
              <span>AI文章创作</span>
            </Space>
          }>
            <Tabs defaultActiveKey="custom" items={[
              {
                key: 'custom',
                label: '自由创作',
                children: (
                  <div>
                    <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
                      <Col span={8}>
                        <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>发布平台</Text>
                        <Select value={platform} onChange={setPlatform} style={{ width: '100%' }}>
                          <Option value="公众号">公众号</Option>
                          <Option value="企微">企业微信</Option>
                          <Option value="小红书">小红书</Option>
                        </Select>
                      </Col>
                      <Col span={8}>
                        <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>字数要求</Text>
                        <Select value={wordCount} onChange={setWordCount} style={{ width: '100%' }}>
                          <Option value="300-500">短文 (300-500字)</Option>
                          <Option value="800-1200">中篇 (800-1200字)</Option>
                          <Option value="1500-2000">长文 (1500-2000字)</Option>
                        </Select>
                      </Col>
                      <Col span={8}>
                        <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>语气风格</Text>
                        <Select value={tone} onChange={setTone} style={{ width: '100%' }}>
                          <Option value="专业温暖">专业温暖</Option>
                          <Option value="活泼有趣">活泼有趣</Option>
                          <Option value="高端优雅">高端优雅</Option>
                          <Option value="亲切家常">亲切家常</Option>
                        </Select>
                      </Col>
                    </Row>
                    <TextArea
                      rows={4}
                      value={prompt}
                      onChange={e => setPrompt(e.target.value)}
                      placeholder="请描述您想要创作的内容，例如：写一篇关于520浪漫好物推荐的文章，重点推荐珠宝和香水品类..."
                      style={{ marginBottom: 12 }}
                    />
                    <Row justify="space-between" align="middle">
                      <Col>
                        <Space>
                          <Checkbox checked={useHotTopic} onChange={e => setUseHotTopic(e.target.checked)}>
                            结合行业热点
                          </Checkbox>
                          <Button
                            type="primary"
                            icon={<RobotOutlined />}
                            onClick={handleGenerate}
                            loading={generating}
                            style={{ background: '#e63946', borderColor: '#e63946' }}
                          >
                            {generating ? 'AI创作中...' : 'AI生成内容'}
                          </Button>
                        </Space>
                      </Col>
                      <Col>
                        <Space>
                          <Tooltip title="参考知识库">
                            <Button icon={<BookOutlined />} />
                          </Tooltip>
                          <Tooltip title="重新生成">
                            <Button icon={<ReloadOutlined />} onClick={handleGenerate} />
                          </Tooltip>
                        </Space>
                      </Col>
                    </Row>
                  </div>
                )
              },
              {
                key: 'template',
                label: '模板创作',
                children: (
                  <div>
                    <Row gutter={[12, 12]}>
                      {aiTemplates.filter(t => t.type === '文章').map(t => (
                        <Col span={12} key={t.id}>
                          <Card
                            size="small"
                            hoverable
                            style={{
                              borderColor: template?.id === t.id ? '#e63946' : undefined,
                              background: template?.id === t.id ? '#fff1f0' : undefined
                            }}
                            onClick={() => setTemplate(t)}
                          >
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
                    {template && (
                      <div style={{ marginTop: 16 }}>
                        <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
                          当前模板：{template.name} — {template.description}
                        </Text>
                        <TextArea
                          rows={3}
                          placeholder={`请输入创作要求，模板需要：${template.fields.join('、')}`}
                          value={prompt}
                          onChange={e => setPrompt(e.target.value)}
                          style={{ marginBottom: 12 }}
                        />
                        <Button
                          type="primary"
                          icon={<ThunderboltOutlined />}
                          onClick={handleGenerate}
                          loading={generating}
                          style={{ background: '#e63946', borderColor: '#e63946' }}
                        >
                          基于模板生成
                        </Button>
                      </div>
                    )}
                  </div>
                )
              }
            ]} />
          </Card>

          {generatedContent && (
            <Card className="content-card" title={
              <Space>
                <FileTextOutlined style={{ color: '#52c41a' }} />
                <span>生成结果</span>
                <Tag color="green">已完成</Tag>
              </Space>
            } extra={
              <Space>
                <Button icon={<CopyOutlined />} onClick={handleCopy}>复制</Button>
                <Button icon={<SaveOutlined />} onClick={handleSave}>保存</Button>
                <Button type="primary" icon={<SendOutlined />} style={{ background: '#e63946', borderColor: '#e63946' }}>
                  发布
                </Button>
              </Space>
            }>
              <div style={{
                whiteSpace: 'pre-wrap',
                lineHeight: 1.8,
                padding: 16,
                background: '#fafafa',
                borderRadius: 8,
                border: '1px solid #f0f0f0'
              }}>
                {generatedContent}
              </div>
              <Divider />
              <Row gutter={16}>
                <Col span={6}>
                  <Text type="secondary">字数</Text>
                  <br />
                  <Text strong>{generatedContent.length} 字</Text>
                </Col>
                <Col span={6}>
                  <Text type="secondary">目标平台</Text>
                  <br />
                  <Tag color="green">{platform}</Tag>
                </Col>
                <Col span={6}>
                  <Text type="secondary">创作方式</Text>
                  <br />
                  <Tag>{template ? '模板创作' : '自由创作'}</Tag>
                </Col>
                <Col span={6}>
                  <Text type="secondary">品牌合规</Text>
                  <br />
                  <Tag color="green">已通过</Tag>
                </Col>
              </Row>
            </Card>
          )}

          {generating && (
            <Card className="content-card">
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <Spin size="large" />
                <div style={{ marginTop: 16 }}>
                  <Text className="ai-generating" style={{ fontSize: 16, color: '#e63946' }}>
                    <RobotOutlined /> AI正在创作中...
                  </Text>
                </div>
                <Progress
                  percent={75}
                  status="active"
                  strokeColor="#e63946"
                  style={{ maxWidth: 400, margin: '16px auto' }}
                />
                <Text type="secondary">正在分析热点、匹配知识库、生成内容...</Text>
              </div>
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
              dataSource={hotTopics}
              renderItem={item => (
                <List.Item
                  style={{ cursor: 'pointer', padding: '8px 0' }}
                  onClick={() => {
                    setSelectedHotTopic(item.title)
                    setPrompt(prev => prev + (prev ? ' ' : '') + `结合热点"${item.title}"`)
                    message.info(`已添加热点：${item.title}`)
                  }}
                >
                  <List.Item.Meta
                    avatar={
                      <div className={`hot-topic-rank ${item.rank <= 3 ? 'top3' : 'normal'}`}>
                        {item.rank}
                      </div>
                    }
                    title={
                      <Space>
                        <span style={{ fontSize: 13 }}>{item.title}</span>
                        {item.trend === 'up' && <Tag color="red" style={{ fontSize: 10 }}>↑ 热</Tag>}
                        {item.trend === 'down' && <Tag color="default" style={{ fontSize: 10 }}>↓ 降</Tag>}
                      </Space>
                    }
                    description={
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        热度 {(item.heat / 10000).toFixed(0)}万
                      </Text>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>

          <Card className="content-card" title={
            <Space>
              <BulbOutlined style={{ color: '#fa8c16' }} />
              <span>知识库参考</span>
            </Space>
          } size="small">
            <Tabs size="small" items={[
              {
                key: 'brand',
                label: '品牌故事',
                children: (
                  <List
                    size="small"
                    dataSource={brandStories}
                    renderItem={item => (
                      <List.Item style={{ cursor: 'pointer' }}>
                        <List.Item.Meta
                          title={<Text style={{ fontSize: 13 }}>{item.title}</Text>}
                          description={
                            <Text type="secondary" style={{ fontSize: 11 }} ellipsis>
                              {item.content}
                            </Text>
                          }
                        />
                      </List.Item>
                    )}
                  />
                )
              },
              {
                key: 'member',
                label: '会员权益',
                children: (
                  <List
                    size="small"
                    dataSource={memberBenefits}
                    renderItem={item => (
                      <List.Item>
                        <List.Item.Meta
                          title={<Text style={{ fontSize: 13 }}>{item.title}</Text>}
                          description={
                            <div>
                              {item.benefits.slice(0, 2).map(b => (
                                <Tag key={b} style={{ fontSize: 11, marginBottom: 2 }}>{b}</Tag>
                              ))}
                            </div>
                          }
                        />
                      </List.Item>
                    )}
                  />
                )
              }
            ]} />
          </Card>
        </Col>
      </Row>

      <Modal
        title="保存内容"
        open={saveModalVisible}
        onOk={() => { setSaveModalVisible(false); message.success('内容已保存到草稿箱') }}
        onCancel={() => setSaveModalVisible(false)}
      >
        <div style={{ marginBottom: 12 }}>
          <Text type="secondary">内容标题</Text>
          <Input placeholder="请输入内容标题" defaultValue={prompt?.slice(0, 20) || '未命名文章'} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <Text type="secondary">发布平台</Text>
          <Select defaultValue={platform} style={{ width: '100%' }}>
            <Option value="公众号">公众号</Option>
            <Option value="企微">企业微信</Option>
            <Option value="小红书">小红书</Option>
          </Select>
        </div>
        <div>
          <Text type="secondary">标签</Text>
          <Select mode="tags" placeholder="添加标签" style={{ width: '100%' }} defaultValue={['AI生成', '好物推荐']} />
        </div>
      </Modal>
    </div>
  )
}

function Checkbox({ checked, onChange, children }) {
  return (
    <label style={{ cursor: 'pointer', userSelect: 'none' }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        style={{ marginRight: 6 }}
      />
      {children}
    </label>
  )
}
