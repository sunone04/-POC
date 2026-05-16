import { useState } from 'react'
import {
  Card, Row, Col, Tabs, Tag, Typography, Table, Space,
  Button, Badge, Tooltip, Progress, Divider, List, Modal,
  Descriptions, Alert, Statistic
} from 'antd'
import {
  BarChartOutlined, RiseOutlined, FallOutlined, EyeOutlined,
  LikeOutlined, ShareAltOutlined, MessageOutlined, ThunderboltOutlined,
  CheckCircleOutlined, RobotOutlined, LinkOutlined, DisconnectOutlined,
  ArrowUpOutlined, ArrowDownOutlined, BulbOutlined, StarOutlined,
  SyncOutlined, BookOutlined
} from '@ant-design/icons'
import { platformData, analyticsData, contentItems } from '../../mock/data'

const { Title, Text, Paragraph } = Typography

export default function DataAnalytics() {
  const [insightModalVisible, setInsightModalVisible] = useState(false)
  const [selectedInsight, setSelectedInsight] = useState(null)

  const handleViewInsight = (item) => {
    setSelectedInsight(item)
    setInsightModalVisible(true)
  }

  const handleAutoDeposit = (item) => {
    Modal.confirm({
      title: '确认沉淀到知识库',
      content: `将"${item.title}"的成功经验自动沉淀到营销知识库？AI将在后续创作中参考此经验。`,
      okText: '确认沉淀',
      cancelText: '取消',
      onOk: () => {
        Modal.success({
          title: '沉淀成功',
          content: '成功经验已自动沉淀到营销知识库，AI将在后续创作中参考此经验。'
        })
      }
    })
  }

  const contentColumns = [
    {
      title: '内容标题',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <Space>
          <Text strong style={{ cursor: 'pointer' }}>{text}</Text>
          {record.views > 20000 && <Tag color="gold"><StarOutlined /> 爆款</Tag>}
        </Space>
      )
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: t => <Tag>{t}</Tag>
    },
    {
      title: '平台',
      dataIndex: 'platform',
      key: 'platform',
      render: t => {
        const cls = t === '公众号' ? 'wechat' : t === '抖音' ? 'douyin' : t === '视频号' ? 'shipinhao' : 'qiwei'
        return <span className={`platform-badge ${cls}`}>{t}</span>
      }
    },
    {
      title: '触发',
      dataIndex: 'triggerType',
      key: 'triggerType',
      render: (t) => (
        <span className={`trigger-badge ${t === '定时' ? 'scheduled' : 'marketing'}`}>
          {t === '定时' ? '⏰' : '🎯'} {t}
        </span>
      )
    },
    {
      title: '浏览量',
      dataIndex: 'views',
      key: 'views',
      sorter: (a, b) => a.views - b.views,
      render: t => <Text strong style={{ color: '#e63946' }}>{t.toLocaleString()}</Text>
    },
    {
      title: '点赞',
      dataIndex: 'likes',
      key: 'likes',
      render: t => t.toLocaleString()
    },
    {
      title: '分享',
      dataIndex: 'shares',
      key: 'shares',
      render: t => t.toLocaleString()
    },
    {
      title: '互动率',
      key: 'engagement',
      render: (_, record) => {
        const rate = record.views > 0 ? ((record.likes + record.comments + record.shares) / record.views * 100).toFixed(1) : 0
        return (
          <Space>
            <Progress
              type="circle"
              percent={parseFloat(rate) * 5}
              size={32}
              strokeColor={parseFloat(rate) > 8 ? '#52c41a' : parseFloat(rate) > 5 ? '#fa8c16' : '#d9d9d9'}
              format={() => `${rate}%`}
            />
          </Space>
        )
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: t => {
        const map = { published: { color: 'green', text: '已发布' }, scheduled: { color: 'blue', text: '待发布' }, draft: { color: 'default', text: '草稿' } }
        const s = map[t] || map.draft
        return <Tag color={s.color}>{s.text}</Tag>
      }
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Tooltip title="查看分析">
            <Button type="text" icon={<EyeOutlined />} onClick={() => handleViewInsight(record)} />
          </Tooltip>
          {record.views > 10000 && (
            <Tooltip title="沉淀到知识库">
              <Button type="text" icon={<BookOutlined />} style={{ color: '#e63946' }} onClick={() => handleAutoDeposit(record)} />
            </Tooltip>
          )}
        </Space>
      )
    }
  ]

  return (
    <div>
      <Alert
        message="数据智能分析"
        description="系统已打通公众号、抖音、视频号、企微四个平台的数据。当内容数据表现优异时，系统会自动分析成功经验并沉淀到营销知识库，供AI后续创作参考。"
        type="info"
        showIcon
        icon={<ThunderboltOutlined />}
        style={{ marginBottom: 16, borderRadius: 8 }}
      />

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card className="stat-card" size="small">
            <Statistic
              title="今日总浏览"
              value={58900}
              suffix={
                <Text style={{ fontSize: 12, color: '#52c41a' }}>
                  <ArrowUpOutlined /> 12.5%
                </Text>
              }
              valueStyle={{ color: '#e63946', fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="stat-card" size="small">
            <Statistic
              title="今日互动量"
              value={4788}
              suffix={
                <Text style={{ fontSize: 12, color: '#52c41a' }}>
                  <ArrowUpOutlined /> 8.3%
                </Text>
              }
              valueStyle={{ color: '#fa8c16', fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="stat-card" size="small">
            <Statistic
              title="平均互动率"
              value={8.1}
              suffix="%"
              prefix={
                <Text style={{ fontSize: 12, color: '#52c41a' }}>
                  <ArrowUpOutlined />
                </Text>
              }
              valueStyle={{ color: '#52c41a', fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="stat-card" size="small">
            <Statistic
              title="已沉淀经验"
              value={12}
              suffix="条"
              prefix={<BookOutlined />}
              valueStyle={{ color: '#722ed1', fontWeight: 700 }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={24}>
          <Card className="content-card" title={
            <Space>
              <LinkOutlined style={{ color: '#e63946' }} />
              <span>已打通数据平台</span>
            </Space>
          }>
            <Row gutter={[16, 16]}>
              {platformData.map(p => (
                <Col span={5} key={p.name} style={{ maxWidth: '20%' }}>
                  <Card
                    size="small"
                    hoverable
                    style={{
                      textAlign: 'center',
                      opacity: p.connected ? 1 : 0.5,
                      border: p.connected ? `2px solid ${p.color}` : undefined
                    }}
                  >
                    <Badge status={p.connected ? 'success' : 'default'} />
                    <div style={{ fontSize: 16, fontWeight: 600, marginTop: 4, color: p.connected ? p.color : '#999' }}>
                      {p.name}
                    </div>
                    {p.connected ? (
                      <div style={{ marginTop: 8 }}>
                        <div><Text type="secondary" style={{ fontSize: 11 }}>粉丝 {p.followers > 0 ? (p.followers / 10000).toFixed(1) + '万' : '-'}</Text></div>
                        <div><Text type="secondary" style={{ fontSize: 11 }}>发布 {p.publishCount} 篇</Text></div>
                      </div>
                    ) : (
                      <div style={{ marginTop: 8 }}>
                        <Button size="small" type="link" icon={<LinkOutlined />}>连接</Button>
                      </div>
                    )}
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} lg={14}>
          <Card className="content-card" title={
            <Space>
              <BarChartOutlined style={{ color: '#e63946' }} />
              <span>内容数据趋势（近7天）</span>
            </Space>
          }>
            <div style={{ height: 300, display: 'flex', alignItems: 'flex-end', gap: 8, padding: '0 20px' }}>
              {analyticsData.contentTrend.map((d, i) => (
                <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <Tooltip title={`浏览量: ${d.totalViews.toLocaleString()}`}>
                      <div style={{
                        width: '100%',
                        height: Math.max(20, (d.totalViews / 80000) * 220),
                        background: 'linear-gradient(180deg, #e63946, #ff6b6b)',
                        borderRadius: '4px 4px 0 0',
                        transition: 'height 0.3s'
                      }} />
                    </Tooltip>
                  </div>
                  <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 4 }}>{d.date}</Text>
                  <div style={{ fontSize: 10, color: '#999' }}>
                    <div>文{d.articles} 视{d.videos}</div>
                  </div>
                </div>
              ))}
            </div>
            <Divider style={{ margin: '12px 0' }} />
            <Row justify="center" gutter={24}>
              <Col><Text style={{ fontSize: 12 }}><span style={{ display: 'inline-block', width: 12, height: 12, background: '#e63946', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }}></span>总浏览量</Text></Col>
            </Row>
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card className="content-card" title={
            <Space>
              <RiseOutlined style={{ color: '#52c41a' }} />
              <span>互动趋势（近7天）</span>
            </Space>
          }>
            {analyticsData.engagementTrend.map((d, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                <Text style={{ fontSize: 11, width: 40, color: '#999' }}>{d.date}</Text>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 2, height: 16 }}>
                    <Tooltip title={`点赞 ${d.likes}`}>
                      <div style={{ height: '100%', width: `${(d.likes / 5000) * 100}%`, background: '#e63946', borderRadius: 2, minWidth: 4 }} />
                    </Tooltip>
                    <Tooltip title={`评论 ${d.comments}`}>
                      <div style={{ height: '100%', width: `${(d.comments / 1000) * 100}%`, background: '#fa8c16', borderRadius: 2, minWidth: 4 }} />
                    </Tooltip>
                    <Tooltip title={`分享 ${d.shares}`}>
                      <div style={{ height: '100%', width: `${(d.shares / 2000) * 100}%`, background: '#1890ff', borderRadius: 2, minWidth: 4 }} />
                    </Tooltip>
                  </div>
                </div>
              </div>
            ))}
            <Divider style={{ margin: '8px 0' }} />
            <Row justify="center" gutter={16}>
              <Col><Text style={{ fontSize: 11 }}><span style={{ display: 'inline-block', width: 8, height: 8, background: '#e63946', borderRadius: 2, marginRight: 4 }}></span>点赞</Text></Col>
              <Col><Text style={{ fontSize: 11 }}><span style={{ display: 'inline-block', width: 8, height: 8, background: '#fa8c16', borderRadius: 2, marginRight: 4 }}></span>评论</Text></Col>
              <Col><Text style={{ fontSize: 11 }}><span style={{ display: 'inline-block', width: 8, height: 8, background: '#1890ff', borderRadius: 2, marginRight: 4 }}></span>分享</Text></Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <Card className="content-card" title={
        <Space>
          <StarOutlined style={{ color: '#fa8c16' }} />
          <span>爆款内容复盘与经验沉淀</span>
          <Tag color="gold">自动分析</Tag>
        </Space>
      } extra={
        <Space>
          <Button icon={<SyncOutlined />}>刷新数据</Button>
          <Button icon={<BookOutlined />}>查看知识库</Button>
        </Space>
      }>
        <Alert
          message="智能复盘机制"
          description="当内容互动率超过8%或浏览量超过2万时，系统自动触发复盘分析，总结成功经验并沉淀到营销知识库。"
          type="success"
          showIcon
          icon={<RobotOutlined />}
          style={{ marginBottom: 16, borderRadius: 8 }}
        />
        <Row gutter={[16, 16]}>
          {analyticsData.topPerformingContent.map(item => (
            <Col span={8} key={item.id}>
              <Card
                size="small"
                hoverable
                style={{ height: '100%' }}
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <Text strong style={{ fontSize: 14 }}>{item.title}</Text>
                  </div>
                  <Space>
                    <span className={`platform-badge ${item.platform === '抖音' ? 'douyin' : item.platform === '视频号' ? 'shipinhao' : 'wechat'}`}>
                      {item.platform}
                    </span>
                    <Tag color="gold"><StarOutlined /> 爆款</Tag>
                  </Space>
                  <Row gutter={8}>
                    <Col span={8}>
                      <div className="analytics-metric" style={{ padding: 8 }}>
                        <div style={{ fontSize: 16, fontWeight: 700, color: '#e63946' }}>{(item.views / 10000).toFixed(1)}万</div>
                        <div style={{ fontSize: 11, color: '#999' }}>浏览</div>
                      </div>
                    </Col>
                    <Col span={8}>
                      <div className="analytics-metric" style={{ padding: 8 }}>
                        <div style={{ fontSize: 16, fontWeight: 700, color: '#52c41a' }}>{item.engagement}%</div>
                        <div style={{ fontSize: 11, color: '#999' }}>互动率</div>
                      </div>
                    </Col>
                    <Col span={8}>
                      <div className="analytics-metric" style={{ padding: 8 }}>
                        <Tag color={item.analysisCompleted ? 'green' : 'default'} style={{ fontSize: 11 }}>
                          {item.analysisCompleted ? '已复盘' : '待复盘'}
                        </Tag>
                      </div>
                    </Col>
                  </Row>
                  {item.insights && (
                    <div className="insight-card">
                      <div className="insight-title"><BulbOutlined /> 成功经验</div>
                      <div className="insight-content">{item.insights}</div>
                    </div>
                  )}
                  <Space>
                    <Button size="small" icon={<EyeOutlined />} onClick={() => handleViewInsight(item)}>
                      详细分析
                    </Button>
                    <Button size="small" type="primary" icon={<BookOutlined />} style={{ background: '#e63946', borderColor: '#e63946' }} onClick={() => handleAutoDeposit(item)}>
                      沉淀到知识库
                    </Button>
                  </Space>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      <Card className="content-card" title={
        <Space>
          <BarChartOutlined style={{ color: '#1890ff' }} />
          <span>全部内容数据</span>
        </Space>
      } style={{ marginTop: 16 }}>
        <Table
          dataSource={contentItems}
          columns={contentColumns}
          rowKey="id"
          size="middle"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title="内容数据分析"
        open={insightModalVisible}
        onCancel={() => setInsightModalVisible(false)}
        width={700}
        footer={[
          <Button key="close" onClick={() => setInsightModalVisible(false)}>关闭</Button>,
          <Button key="deposit" type="primary" icon={<BookOutlined />} onClick={() => { setInsightModalVisible(false); handleAutoDeposit(selectedInsight) }} style={{ background: '#e63946', borderColor: '#e63946' }}>
            沉淀到知识库
          </Button>
        ]}
      >
        {selectedInsight && (
          <div>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="内容标题" span={2}>{selectedInsight.title}</Descriptions.Item>
              <Descriptions.Item label="平台">{selectedInsight.platform}</Descriptions.Item>
              <Descriptions.Item label="类型">{selectedInsight.type}</Descriptions.Item>
              <Descriptions.Item label="浏览量">
                <Text strong style={{ color: '#e63946' }}>{selectedInsight.views?.toLocaleString()}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="互动率">
                <Text strong style={{ color: '#52c41a' }}>{selectedInsight.engagement || ((selectedInsight.likes + (selectedInsight.comments || 0) + (selectedInsight.shares || 0)) / (selectedInsight.views || 1) * 100).toFixed(1)}%</Text>
              </Descriptions.Item>
            </Descriptions>
            {selectedInsight.insights && (
              <>
                <Divider>AI复盘分析</Divider>
                <div className="insight-card">
                  <div className="insight-title"><RobotOutlined /> AI成功经验总结</div>
                  <div className="insight-content">{selectedInsight.insights}</div>
                </div>
              </>
            )}
            <Divider>数据表现</Divider>
            <Row gutter={16}>
              <Col span={6}>
                <Statistic title="浏览量" value={selectedInsight.views || 0} valueStyle={{ fontSize: 16 }} />
              </Col>
              <Col span={6}>
                <Statistic title="点赞" value={selectedInsight.likes || 0} valueStyle={{ fontSize: 16 }} />
              </Col>
              <Col span={6}>
                <Statistic title="评论" value={selectedInsight.comments || 0} valueStyle={{ fontSize: 16 }} />
              </Col>
              <Col span={6}>
                <Statistic title="分享" value={selectedInsight.shares || 0} valueStyle={{ fontSize: 16 }} />
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  )
}
