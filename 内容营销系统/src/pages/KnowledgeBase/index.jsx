import { useState } from 'react'
import {
  Card, Row, Col, Tabs, Tag, Typography, Input, List, Space,
  Button, Modal, Descriptions, Divider, Table, Badge, Tooltip,
  message, Empty, Progress, Breadcrumb, Drawer, Form, Select
} from 'antd'
import {
  BookOutlined, SearchOutlined, PlusOutlined, EditOutlined,
  DeleteOutlined, EyeOutlined, FolderOutlined, FileTextOutlined,
  CrownOutlined, SafetyOutlined, StarOutlined, HistoryOutlined,
  ThunderboltOutlined, UploadOutlined, DownloadOutlined
} from '@ant-design/icons'
import { brandStories, memberBenefits, qualityArticles, rulesAndPolicies } from '../../mock/data'

const { Title, Text, Paragraph } = Typography
const { Option } = Select

const knowledgeCategories = [
  { key: 'brand', name: '品牌文化故事', icon: <StarOutlined />, count: brandStories.length, color: '#e63946' },
  { key: 'member', name: '会员权益', icon: <CrownOutlined />, count: memberBenefits.length, color: '#fa8c16' },
  { key: 'articles', name: '优质文章', icon: <FileTextOutlined />, count: qualityArticles.length, color: '#1890ff' },
  { key: 'rules', name: '规则条款', icon: <SafetyOutlined />, count: rulesAndPolicies.length, color: '#52c41a' }
]

export default function KnowledgeBase() {
  const [activeCategory, setActiveCategory] = useState('brand')
  const [searchText, setSearchText] = useState('')
  const [detailVisible, setDetailVisible] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [addModalVisible, setAddModalVisible] = useState(false)
  const [form] = Form.useForm()

  const getDataSource = () => {
    switch (activeCategory) {
      case 'brand': return brandStories
      case 'member': return memberBenefits
      case 'articles': return qualityArticles
      case 'rules': return rulesAndPolicies
      default: return []
    }
  }

  const handleSearch = () => {
    if (!searchText) return
    message.info(`搜索"${searchText}"，在知识库中找到相关内容`)
  }

  const handleViewItem = (item) => {
    setSelectedItem(item)
    setDetailVisible(true)
  }

  const handleAddItem = () => {
    form.resetFields()
    setAddModalVisible(true)
  }

  const handleSaveItem = () => {
    form.validateFields().then(() => {
      setAddModalVisible(false)
      message.success('知识条目添加成功，AI将参考此内容进行创作')
    })
  }

  const renderBrandStoryList = () => (
    <List
      dataSource={brandStories}
      renderItem={item => (
        <List.Item
          actions={[
            <Tooltip title="查看"><Button type="text" icon={<EyeOutlined />} onClick={() => handleViewItem(item)} /></Tooltip>,
            <Tooltip title="编辑"><Button type="text" icon={<EditOutlined />} /></Tooltip>,
            <Tooltip title="删除"><Button type="text" danger icon={<DeleteOutlined />} /></Tooltip>
          ]}
        >
          <List.Item.Meta
            avatar={
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 8,
                background: 'linear-gradient(135deg, #e63946, #ff6b6b)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 20
              }}>
                <StarOutlined />
              </div>
            }
            title={
              <Space>
                <Text strong>{item.title}</Text>
                <Tag color="red">{item.category}</Tag>
              </Space>
            }
            description={
              <div>
                <Paragraph ellipsis={{ rows: 2 }} style={{ marginBottom: 4, fontSize: 13 }}>
                  {item.content}
                </Paragraph>
                <Space>
                  {item.tags.map(tag => (
                    <Tag key={tag} style={{ fontSize: 11 }}>{tag}</Tag>
                  ))}
                  <Text type="secondary" style={{ fontSize: 11 }}>{item.createdAt}</Text>
                </Space>
              </div>
            }
          />
        </List.Item>
      )}
    />
  )

  const renderMemberBenefitsList = () => (
    <List
      dataSource={memberBenefits}
      renderItem={item => (
        <List.Item
          actions={[
            <Tooltip title="查看"><Button type="text" icon={<EyeOutlined />} onClick={() => handleViewItem(item)} /></Tooltip>,
            <Tooltip title="编辑"><Button type="text" icon={<EditOutlined />} /></Tooltip>
          ]}
        >
          <List.Item.Meta
            avatar={
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 8,
                background: item.level === '钻石卡' ? 'linear-gradient(135deg, #722ed1, #b37feb)' :
                  item.level === '金卡' ? 'linear-gradient(135deg, #fa8c16, #ffc53d)' :
                  'linear-gradient(135deg, #8c8c8c, #bfbfbf)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 20
              }}>
                <CrownOutlined />
              </div>
            }
            title={
              <Space>
                <Text strong>{item.title}</Text>
                <Tag color={item.level === '钻石卡' ? 'purple' : item.level === '金卡' ? 'gold' : 'default'}>
                  {item.level}
                </Tag>
              </Space>
            }
            description={
              <div>
                <div style={{ marginBottom: 4 }}>
                  {item.benefits.map(b => (
                    <Tag key={b} color="blue" style={{ fontSize: 11, marginBottom: 2 }}>{b}</Tag>
                  ))}
                </div>
                <Text type="secondary" style={{ fontSize: 11 }}>升级条件：{item.condition}</Text>
              </div>
            }
          />
        </List.Item>
      )}
    />
  )

  const renderArticlesList = () => (
    <Table
      dataSource={qualityArticles}
      rowKey="id"
      size="middle"
      columns={[
        {
          title: '标题',
          dataIndex: 'title',
          key: 'title',
          render: (text, record) => (
            <Space>
              <Text strong style={{ cursor: 'pointer' }} onClick={() => handleViewItem(record)}>{text}</Text>
              {record.status === 'published' ? <Tag color="green">已发布</Tag> : <Tag>草稿</Tag>}
            </Space>
          )
        },
        { title: '分类', dataIndex: 'category', key: 'category', render: t => <Tag>{t}</Tag> },
        { title: '平台', dataIndex: 'platform', key: 'platform', render: t => <Tag color="blue">{t}</Tag> },
        {
          title: '浏览量', dataIndex: 'views', key: 'views',
          sorter: (a, b) => a.views - b.views,
          render: t => <Text style={{ color: '#e63946' }}>{t.toLocaleString()}</Text>
        },
        { title: '点赞', dataIndex: 'likes', key: 'likes', render: t => t.toLocaleString() },
        { title: '分享', dataIndex: 'shares', key: 'shares', render: t => t.toLocaleString() },
        { title: '日期', dataIndex: 'createdAt', key: 'createdAt' },
        {
          title: '操作', key: 'action',
          render: (_, record) => (
            <Space>
              <Button type="text" icon={<EyeOutlined />} onClick={() => handleViewItem(record)} />
              <Button type="text" icon={<EditOutlined />} />
            </Space>
          )
        }
      ]}
    />
  )

  const renderRulesList = () => (
    <List
      dataSource={rulesAndPolicies}
      renderItem={item => (
        <List.Item
          actions={[
            <Tooltip title="查看"><Button type="text" icon={<EyeOutlined />} onClick={() => handleViewItem(item)} /></Tooltip>,
            <Tooltip title="编辑"><Button type="text" icon={<EditOutlined />} /></Tooltip>,
            <Tooltip title="删除"><Button type="text" danger icon={<DeleteOutlined />} /></Tooltip>
          ]}
        >
          <List.Item.Meta
            avatar={
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 8,
                background: '#f6ffed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#52c41a',
                fontSize: 20
              }}>
                <SafetyOutlined />
              </div>
            }
            title={
              <Space>
                <Text strong>{item.title}</Text>
                <Tag color="green">{item.category}</Tag>
              </Space>
            }
            description={<Text type="secondary">{item.content}</Text>}
          />
        </List.Item>
      )}
    />
  )

  const renderContent = () => {
    switch (activeCategory) {
      case 'brand': return renderBrandStoryList()
      case 'member': return renderMemberBenefitsList()
      case 'articles': return renderArticlesList()
      case 'rules': return renderRulesList()
      default: return <Empty />
    }
  }

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={24}>
          <Card className="content-card" size="small">
            <Row gutter={16} align="middle">
              <Col flex="auto">
                <Input.Search
                  placeholder="搜索知识库内容..."
                  value={searchText}
                  onChange={e => setSearchText(e.target.value)}
                  onSearch={handleSearch}
                  size="large"
                  style={{ maxWidth: 500 }}
                  prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                />
              </Col>
              <Col>
                <Space>
                  <Button icon={<UploadOutlined />}>导入</Button>
                  <Button icon={<DownloadOutlined />}>导出</Button>
                  <Button type="primary" icon={<PlusOutlined />} onClick={handleAddItem} style={{ background: '#e63946', borderColor: '#e63946' }}>
                    添加知识
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        {knowledgeCategories.map(cat => (
          <Col span={6} key={cat.key}>
            <Card
              className="stat-card"
              hoverable
              style={{
                borderColor: activeCategory === cat.key ? cat.color : undefined,
                background: activeCategory === cat.key ? `${cat.color}10` : undefined
              }}
              onClick={() => setActiveCategory(cat.key)}
            >
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: `${cat.color}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 8px',
                  color: cat.color,
                  fontSize: 22
                }}>
                  {cat.icon}
                </div>
                <Text strong style={{ display: 'block', fontSize: 14 }}>{cat.name}</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>{cat.count} 条</Text>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Card className="content-card" title={
        <Space>
          {knowledgeCategories.find(c => c.key === activeCategory)?.icon}
          <span>{knowledgeCategories.find(c => c.key === activeCategory)?.name}</span>
          <Tag color="blue">{getDataSource().length} 条</Tag>
        </Space>
      } extra={
        <Space>
          <Text type="secondary" style={{ fontSize: 12 }}>
            <ThunderboltOutlined /> AI创作时自动参考此知识库
          </Text>
        </Space>
      }>
        {renderContent()}
      </Card>

      <Drawer
        title={selectedItem ? selectedItem.title : ''}
        open={detailVisible}
        onClose={() => setDetailVisible(false)}
        width={600}
      >
        {selectedItem && (
          <div>
            {selectedItem.category && (
              <Tag color="blue" style={{ marginBottom: 12 }}>{selectedItem.category}</Tag>
            )}
            {selectedItem.level && (
              <Tag color={selectedItem.level === '钻石卡' ? 'purple' : selectedItem.level === '金卡' ? 'gold' : 'default'} style={{ marginBottom: 12 }}>
                {selectedItem.level}
              </Tag>
            )}
            {selectedItem.content && (
              <Paragraph style={{ fontSize: 14, lineHeight: 1.8 }}>{selectedItem.content}</Paragraph>
            )}
            {selectedItem.benefits && (
              <div style={{ marginTop: 16 }}>
                <Title level={5}>权益详情</Title>
                {selectedItem.benefits.map((b, i) => (
                  <div key={i} style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                    <CheckIcon /> {b}
                  </div>
                ))}
                <Divider />
                <Text type="secondary">升级条件：{selectedItem.condition}</Text>
              </div>
            )}
            {selectedItem.views !== undefined && (
              <Descriptions bordered column={2} size="small" style={{ marginTop: 16 }}>
                <Descriptions.Item label="浏览量">{selectedItem.views?.toLocaleString()}</Descriptions.Item>
                <Descriptions.Item label="点赞数">{selectedItem.likes?.toLocaleString()}</Descriptions.Item>
                <Descriptions.Item label="分享数">{selectedItem.shares?.toLocaleString()}</Descriptions.Item>
                <Descriptions.Item label="平台">{selectedItem.platform}</Descriptions.Item>
                <Descriptions.Item label="创建日期">{selectedItem.createdAt}</Descriptions.Item>
                <Descriptions.Item label="状态">
                  <Tag color={selectedItem.status === 'published' ? 'green' : 'default'}>
                    {selectedItem.status === 'published' ? '已发布' : '草稿'}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>
            )}
            {selectedItem.tags && (
              <div style={{ marginTop: 12 }}>
                {selectedItem.tags.map(tag => (
                  <Tag key={tag} style={{ marginBottom: 4 }}>{tag}</Tag>
                ))}
              </div>
            )}
          </div>
        )}
      </Drawer>

      <Modal
        title="添加知识条目"
        open={addModalVisible}
        onOk={handleSaveItem}
        onCancel={() => setAddModalVisible(false)}
        width={600}
        okText="添加"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="category" label="知识分类" rules={[{ required: true, message: '请选择分类' }]}>
            <Select placeholder="选择分类">
              {knowledgeCategories.map(cat => (
                <Option key={cat.key} value={cat.key}>{cat.name}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="title" label="标题" rules={[{ required: true, message: '请输入标题' }]}>
            <Input placeholder="请输入知识条目标题" />
          </Form.Item>
          <Form.Item name="content" label="内容" rules={[{ required: true, message: '请输入内容' }]}>
            <Input.TextArea rows={6} placeholder="请输入知识条目内容，AI创作时将参考此内容" />
          </Form.Item>
          <Form.Item name="tags" label="标签">
            <Select mode="tags" placeholder="添加标签" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

function CheckIcon() {
  return <span style={{ color: '#52c41a', marginRight: 8 }}>✓</span>
}
