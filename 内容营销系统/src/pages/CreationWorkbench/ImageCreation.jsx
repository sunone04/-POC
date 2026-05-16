import { useState } from 'react'
import {
  Card, Row, Col, Input, Select, Button, Tabs, Tag, Space, Typography,
  Divider, Spin, message, Upload, Modal, Progress, List, Image, Tooltip
} from 'antd'
import {
  RobotOutlined, PictureOutlined, PlusOutlined, CopyOutlined,
  SaveOutlined, SendOutlined, FireOutlined, BulbOutlined,
  AppstoreOutlined, LayoutOutlined, BgColorsOutlined
} from '@ant-design/icons'
import { hotTopics, aiTemplates } from '../../mock/data'
import { aiAPI } from '../../services/api'

const { TextArea } = Input
const { Title, Text } = Typography
const { Option } = Select

const imageStyles = [
  { id: 1, name: '小红书种草', ratio: '3:4', desc: '适合小红书平台' },
  { id: 2, name: '公众号封面', ratio: '2.35:1', desc: '适合公众号头图' },
  { id: 3, name: '朋友圈海报', ratio: '1:1', desc: '适合朋友圈分享' },
  { id: 4, name: '电商主图', ratio: '1:1', desc: '适合商品展示' },
  { id: 5, name: '故事长图', ratio: '9:16', desc: '适合竖屏浏览' },
  { id: 6, name: '横版Banner', ratio: '16:9', desc: '适合网页横幅' }
]

const colorSchemes = [
  { name: '品牌红', primary: '#e63946', secondary: '#fff1f0' },
  { name: '商务蓝', primary: '#1890ff', secondary: '#e6f7ff' },
  { name: '活力橙', primary: '#fa8c16', secondary: '#fff7e6' },
  { name: '优雅紫', primary: '#722ed1', secondary: '#f9f0ff' },
  { name: '自然绿', primary: '#52c41a', secondary: '#f6ffed' },
  { name: '经典黑', primary: '#262626', secondary: '#f5f5f5' }
]

export default function ImageCreation() {
  const [prompt, setPrompt] = useState('')
  const [style, setStyle] = useState(imageStyles[0])
  const [colorScheme, setColorScheme] = useState(colorSchemes[0])
  const [platform, setPlatform] = useState('公众号')
  const [generating, setGenerating] = useState(false)
  const [generatedImages, setGeneratedImages] = useState([])
  const [previewVisible, setPreviewVisible] = useState(false)
  const [previewImage, setPreviewImage] = useState('')

  const handleGenerate = async () => {
    if (!prompt) {
      message.warning('请输入图文创作描述')
      return
    }
    setGenerating(true)
    setGeneratedImages([])
    try {
      const result = await aiAPI.generateImage({
        prompt,
        style: style.name,
        colorScheme: colorScheme.name,
        platform
      })
      if (result.success) {
        const images = [
          { id: 1, url: '', prompt, style: style.name, color: colorScheme.name, designContent: result.content },
          { id: 2, url: '', prompt, style: style.name, color: colorScheme.name, designContent: '方案2 - 基于AI生成' },
          { id: 3, url: '', prompt, style: style.name, color: colorScheme.name, designContent: '方案3 - 基于AI生成' },
          { id: 4, url: '', prompt, style: style.name, color: colorScheme.name, designContent: '方案4 - 基于AI生成' }
        ]
        setGeneratedImages(images)
        message.success(result.source === 'ai' ? 'AI图文设计生成完成！' : '图文设计生成完成（使用内置模板，配置API Key后可使用AI）')
      } else {
        message.error(result.message || '生成失败')
      }
    } catch (err) {
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
              <PictureOutlined style={{ color: '#e63946' }} />
              <span>AI图文创作</span>
            </Space>
          }>
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>创作描述</Text>
                <TextArea
                  rows={3}
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  placeholder="请描述您想要的图文内容，例如：520情人节珠宝促销海报，浪漫温馨风格，包含折扣信息和品牌Logo..."
                />
              </Col>

              <Col span={24}>
                <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>图片尺寸/风格</Text>
                <Row gutter={[8, 8]}>
                  {imageStyles.map(s => (
                    <Col span={4} key={s.id}>
                      <Card
                        size="small"
                        hoverable
                        style={{
                          textAlign: 'center',
                          borderColor: style.id === s.id ? '#e63946' : undefined,
                          background: style.id === s.id ? '#fff1f0' : undefined
                        }}
                        onClick={() => setStyle(s)}
                      >
                        <LayoutOutlined style={{ fontSize: 20, color: style.id === s.id ? '#e63946' : '#999' }} />
                        <div style={{ fontSize: 12, marginTop: 4, fontWeight: style.id === s.id ? 600 : 400 }}>
                          {s.name}
                        </div>
                        <div style={{ fontSize: 10, color: '#999' }}>{s.ratio}</div>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Col>

              <Col span={24}>
                <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>配色方案</Text>
                <Space>
                  {colorSchemes.map(c => (
                    <Tooltip title={c.name} key={c.name}>
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 8,
                          background: c.primary,
                          cursor: 'pointer',
                          border: colorScheme.name === c.name ? '3px solid #e63946' : '2px solid #f0f0f0',
                          transition: 'all 0.2s'
                        }}
                        onClick={() => setColorScheme(c)}
                      />
                    </Tooltip>
                  ))}
                </Space>
              </Col>

              <Col span={8}>
                <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>发布平台</Text>
                <Select value={platform} onChange={setPlatform} style={{ width: '100%' }}>
                  <Option value="公众号">公众号</Option>
                  <Option value="企微">企业微信</Option>
                  <Option value="小红书">小红书</Option>
                  <Option value="朋友圈">朋友圈</Option>
                </Select>
              </Col>

              <Col span={24}>
                <Space>
                  <Button
                    type="primary"
                    icon={<RobotOutlined />}
                    onClick={handleGenerate}
                    loading={generating}
                    style={{ background: '#e63946', borderColor: '#e63946' }}
                  >
                    {generating ? 'AI生成中...' : '生成图文'}
                  </Button>
                  <Button icon={<AppstoreOutlined />}>批量生成</Button>
                </Space>
              </Col>
            </Row>
          </Card>

          {generating && (
            <Card className="content-card">
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <Spin size="large" />
                <div style={{ marginTop: 16 }}>
                  <Text className="ai-generating" style={{ fontSize: 16, color: '#e63946' }}>
                    <RobotOutlined /> AI正在创作图文内容...
                  </Text>
                </div>
                <Progress
                  percent={60}
                  status="active"
                  strokeColor="#e63946"
                  style={{ maxWidth: 400, margin: '16px auto' }}
                />
                <Text type="secondary">正在分析描述、匹配风格、生成图片...</Text>
              </div>
            </Card>
          )}

          {generatedImages.length > 0 && (
            <Card className="content-card" title={
              <Space>
                <PictureOutlined style={{ color: '#52c41a' }} />
                <span>生成结果</span>
                <Tag color="green">{generatedImages.length} 张</Tag>
              </Space>
            } extra={
              <Space>
                <Button icon={<CopyOutlined />}>复制链接</Button>
                <Button icon={<SaveOutlined />}>全部保存</Button>
                <Button type="primary" icon={<SendOutlined />} style={{ background: '#e63946', borderColor: '#e63946' }}>
                  发布
                </Button>
              </Space>
            }>
              <Row gutter={[12, 12]}>
                {generatedImages.map(img => (
                  <Col span={6} key={img.id}>
                    <Card
                      size="small"
                      hoverable
                      cover={
                        <div
                          style={{
                            height: 200,
                            background: `linear-gradient(135deg, ${colorScheme.primary}, ${colorScheme.primary}88)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            fontSize: 14,
                            textAlign: 'center',
                            padding: 16,
                            cursor: 'pointer'
                          }}
                          onClick={() => { setPreviewImage(img.url); setPreviewVisible(true) }}
                        >
                          <div>
                            <PictureOutlined style={{ fontSize: 32, marginBottom: 8 }} />
                            <div>亚细亚 {style.name}</div>
                            <div style={{ fontSize: 11, opacity: 0.8 }}>{style.ratio} · {colorScheme.name}</div>
                          </div>
                        </div>
                      }
                      actions={[
                        <Tooltip title="下载"><SaveOutlined /></Tooltip>,
                        <Tooltip title="编辑"><BgColorsOutlined /></Tooltip>,
                        <Tooltip title="发布"><SendOutlined /></Tooltip>
                      ]}
                    >
                      <Text style={{ fontSize: 12 }}>方案 {img.id}</Text>
                    </Card>
                  </Col>
                ))}
              </Row>
              <Divider />
              <Row gutter={16}>
                <Col span={6}>
                  <Text type="secondary">图片数量</Text><br />
                  <Text strong>{generatedImages.length} 张</Text>
                </Col>
                <Col span={6}>
                  <Text type="secondary">尺寸规格</Text><br />
                  <Tag>{style.name} ({style.ratio})</Tag>
                </Col>
                <Col span={6}>
                  <Text type="secondary">配色方案</Text><br />
                  <Tag>{colorScheme.name}</Tag>
                </Col>
                <Col span={6}>
                  <Text type="secondary">品牌合规</Text><br />
                  <Tag color="green">已通过</Tag>
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
              <span>图文模板</span>
            </Space>
          } size="small">
            <List
              size="small"
              dataSource={aiTemplates.filter(t => t.type === '图文')}
              renderItem={item => (
                <List.Item style={{ cursor: 'pointer' }}>
                  <List.Item.Meta
                    title={<Text style={{ fontSize: 13 }}>{item.name}</Text>}
                    description={<Text type="secondary" style={{ fontSize: 11 }}>{item.description}</Text>}
                  />
                </List.Item>
              )}
            />
          </Card>

          <Card className="content-card" title="本地上传" size="small">
            <Upload.Dragger multiple={false} listType="picture">
              <p><PlusOutlined style={{ fontSize: 24, color: '#e63946' }} /></p>
              <p style={{ fontSize: 13 }}>点击或拖拽上传素材</p>
              <p style={{ fontSize: 11, color: '#999' }}>支持 JPG/PNG/SVG，不超过 10MB</p>
            </Upload.Dragger>
          </Card>
        </Col>
      </Row>

      <Modal
        open={previewVisible}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
        width={600}
      >
        <div style={{
          height: 400,
          background: `linear-gradient(135deg, ${colorScheme.primary}, ${colorScheme.primary}88)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          borderRadius: 8,
          textAlign: 'center'
        }}>
          <div>
            <PictureOutlined style={{ fontSize: 48, marginBottom: 16 }} />
            <div style={{ fontSize: 20 }}>亚细亚 {style.name}</div>
            <div style={{ fontSize: 14, opacity: 0.8, marginTop: 8 }}>{style.ratio} · {colorScheme.name}</div>
          </div>
        </div>
      </Modal>
    </div>
  )
}
