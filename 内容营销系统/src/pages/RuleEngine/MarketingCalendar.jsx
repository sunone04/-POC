import { useState } from 'react'
import {
  Card, Row, Col, Tag, Typography, Calendar, Badge, List, Space,
  Button, Modal, Descriptions, Divider, Timeline, Alert, Tabs,
  Switch, message, Tooltip
} from 'antd'
import {
  CalendarOutlined, BellOutlined, ThunderboltOutlined,
  ClockCircleOutlined, CheckCircleOutlined, ExclamationCircleOutlined,
  RobotOutlined, PlusOutlined, EditOutlined, EyeOutlined
} from '@ant-design/icons'
import { marketingNodes } from '../../mock/data'
import dayjs from 'dayjs'

const { Title, Text } = Typography

const typeColorMap = {
  '公历节日': { bg: '#fff1f0', color: '#e63946', border: '#e63946' },
  '农历节日': { bg: '#fff1f0', color: '#cf1322', border: '#cf1322' },
  '农历节气': { bg: '#f6ffed', color: '#389e0d', border: '#52c41a' },
  '店庆日': { bg: '#e6f7ff', color: '#096dd9', border: '#1890ff' },
  '会员日': { bg: '#fff7e6', color: '#d46b08', border: '#fa8c16' },
  '购物节': { bg: '#f9f0ff', color: '#531dab', border: '#722ed1' }
}

const typeIconMap = {
  '公历节日': '🎉',
  '农历节日': '🧧',
  '农历节气': '🌿',
  '店庆日': '🎂',
  '会员日': '💎',
  '购物节': '🛍️'
}

export default function MarketingCalendar() {
  const [nodes, setNodes] = useState(marketingNodes)
  const [selectedDate, setSelectedDate] = useState(dayjs('2026-05-13'))
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [selectedNode, setSelectedNode] = useState(null)
  const [autoPrepare, setAutoPrepare] = useState(true)

  const upcomingNodes = nodes
    .filter(n => n.status === 'upcoming')
    .sort((a, b) => dayjs(a.date).diff(dayjs(b.date)))

  const nearestNode = upcomingNodes[0]
  const daysToNearest = nearestNode ? dayjs(nearestNode.date).diff(dayjs('2026-05-13'), 'day') : 0

  const getDateEvents = (date) => {
    const dateStr = date.format('YYYY-MM-DD')
    return nodes.filter(n => n.date === dateStr)
  }

  const dateCellRender = (date) => {
    const events = getDateEvents(date)
    if (events.length === 0) return null
    return (
      <div style={{ padding: '0 4px' }}>
        {events.map(event => {
          const style = typeColorMap[event.type] || typeColorMap['公历节日']
          return (
            <div
              key={event.id}
              className={`calendar-event ${event.type === '农历节气' ? 'solar-term' : event.type === '店庆日' ? 'anniversary' : event.type === '会员日' ? 'member-day' : 'festival'}`}
              style={{ cursor: 'pointer' }}
              onClick={() => { setSelectedNode(event); setDetailModalVisible(true) }}
            >
              {typeIconMap[event.type]} {event.name}
            </div>
          )
        })}
      </div>
    )
  }

  const cellRender = (current, info) => {
    if (info.type === 'date') return dateCellRender(current)
    return info.originNode
  }

  const handleNodeClick = (node) => {
    setSelectedNode(node)
    setDetailModalVisible(true)
  }

  const handleAutoPrepare = (node) => {
    message.loading({ content: `正在为"${node.name}"准备营销内容...`, key: 'prepare', duration: 2 })
    setTimeout(() => {
      message.success({ content: `"${node.name}"营销内容已自动生成3篇草稿`, key: 'prepare' })
    }, 2000)
  }

  return (
    <div>
      {nearestNode && (
        <Alert
          message={
            <Space>
              <BellOutlined />
              <span>即将到来的营销节点</span>
            </Space>
          }
          description={
            <span>
              距离 <Text strong style={{ color: '#e63946' }}>{nearestNode.name}</Text>（{nearestNode.date}）
              还有 <Text strong style={{ color: '#e63946' }}>{daysToNearest} 天</Text>
              {autoPrepare && daysToNearest <= nearestNode.advanceDays && (
                <Tag color="green" style={{ marginLeft: 8 }}>
                  <ThunderboltOutlined /> 系统已自动准备内容
                </Tag>
              )}
            </span>
          }
          type="warning"
          showIcon={false}
          style={{ marginBottom: 16, borderRadius: 8, border: '1px solid #ffe7ba', background: '#fffbe6' }}
          action={
            <Button size="small" type="primary" icon={<EyeOutlined />} onClick={() => handleNodeClick(nearestNode)}>
              查看详情
            </Button>
          }
        />
      )}

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card className="content-card" title={
            <Space>
              <CalendarOutlined style={{ color: '#e63946' }} />
              <span>营销节点日历</span>
            </Space>
          } extra={
            <Space>
              <Text type="secondary">自动内容准备</Text>
              <Switch
                checked={autoPrepare}
                onChange={setAutoPrepare}
                checkedChildren="开"
                unCheckedChildren="关"
              />
              <Button type="primary" icon={<PlusOutlined />} size="small" style={{ background: '#e63946', borderColor: '#e63946' }}>
                添加节点
              </Button>
            </Space>
          }>
            <Calendar
              value={selectedDate}
              onSelect={setSelectedDate}
              cellRender={cellRender}
            />
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card className="content-card" title={
            <Space>
              <ClockCircleOutlined style={{ color: '#fa8c16' }} />
              <span>即将到来</span>
            </Space>
          } size="small">
            <List
              size="small"
              dataSource={upcomingNodes.slice(0, 8)}
              renderItem={node => {
                const daysLeft = dayjs(node.date).diff(dayjs('2026-05-13'), 'day')
                const style = typeColorMap[node.type] || typeColorMap['公历节日']
                return (
                  <List.Item
                    style={{ cursor: 'pointer', padding: '10px 0' }}
                    onClick={() => handleNodeClick(node)}
                  >
                    <List.Item.Meta
                      avatar={
                        <div style={{
                          width: 40,
                          height: 40,
                          borderRadius: 8,
                          background: style.bg,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 18
                        }}>
                          {typeIconMap[node.type]}
                        </div>
                      }
                      title={
                        <Space>
                          <Text strong style={{ fontSize: 13 }}>{node.name}</Text>
                          <Tag style={{ fontSize: 10, background: style.bg, color: style.color, border: `1px solid ${style.border}` }}>
                            {node.type}
                          </Tag>
                        </Space>
                      }
                      description={
                        <Space>
                          <Text type="secondary" style={{ fontSize: 11 }}>{node.date}</Text>
                          <Tag color={daysLeft <= node.advanceDays ? 'red' : 'default'} style={{ fontSize: 10 }}>
                            {daysLeft}天后
                          </Tag>
                          {autoPrepare && daysLeft <= node.advanceDays && (
                            <Tag color="green" style={{ fontSize: 10 }}>
                              <ThunderboltOutlined /> 已准备
                            </Tag>
                          )}
                        </Space>
                      }
                    />
                  </List.Item>
                )
              }}
            />
          </Card>

          <Card className="content-card" title={
            <Space>
              <CheckCircleOutlined style={{ color: '#52c41a' }} />
              <span>已完成</span>
            </Space>
          } size="small">
            <List
              size="small"
              dataSource={nodes.filter(n => n.status === 'completed').slice(-5)}
              renderItem={node => {
                const style = typeColorMap[node.type] || typeColorMap['公历节日']
                return (
                  <List.Item style={{ padding: '6px 0' }}>
                    <List.Item.Meta
                      avatar={<span style={{ fontSize: 14 }}>{typeIconMap[node.type]}</span>}
                      title={<Text style={{ fontSize: 12 }}>{node.name}</Text>}
                      description={
                        <Space>
                          <Text type="secondary" style={{ fontSize: 11 }}>{node.date}</Text>
                          <Tag color="green" style={{ fontSize: 10 }}>已完成</Tag>
                        </Space>
                      }
                    />
                  </List.Item>
                )
              }}
            />
          </Card>

          <Card className="content-card" title="节点类型说明" size="small">
            {Object.entries(typeColorMap).map(([type, style]) => (
              <div key={type} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 14, marginRight: 8 }}>{typeIconMap[type]}</span>
                <Tag style={{ background: style.bg, color: style.color, border: `1px solid ${style.border}`, fontSize: 11 }}>
                  {type}
                </Tag>
              </div>
            ))}
          </Card>
        </Col>
      </Row>

      <Modal
        title={selectedNode ? `${typeIconMap[selectedNode.type]} ${selectedNode.name} — 营销节点详情` : ''}
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        width={700}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>关闭</Button>,
          <Button key="prepare" type="primary" icon={<RobotOutlined />} onClick={() => handleAutoPrepare(selectedNode)} style={{ background: '#e63946', borderColor: '#e63946' }}>
            AI生成营销内容
          </Button>
        ]}
      >
        {selectedNode && (
          <div>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="节点名称" span={2}>
                <Text strong style={{ fontSize: 16 }}>{selectedNode.name}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="日期">{selectedNode.date}</Descriptions.Item>
              <Descriptions.Item label="类型">
                <Tag style={{
                  background: typeColorMap[selectedNode.type]?.bg,
                  color: typeColorMap[selectedNode.type]?.color,
                  border: `1px solid ${typeColorMap[selectedNode.type]?.border}`
                }}>
                  {selectedNode.type}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="提前准备天数">{selectedNode.advanceDays} 天</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={selectedNode.status === 'completed' ? 'green' : 'orange'}>
                  {selectedNode.status === 'completed' ? '已完成' : '待准备'}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            <Divider>内容准备计划</Divider>

            <Timeline items={[
              {
                color: selectedNode.status === 'completed' ? 'green' : 'blue',
                children: (
                  <Card size="small">
                    <Text strong>T-14：营销策略制定</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      确定营销主题、目标人群、促销力度、内容形式
                    </Text>
                  </Card>
                )
              },
              {
                color: selectedNode.status === 'completed' ? 'green' : 'blue',
                children: (
                  <Card size="small">
                    <Text strong>T-7：内容创作启动</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      AI自动生成公众号文章、短视频脚本、朋友圈海报等
                    </Text>
                  </Card>
                )
              },
              {
                color: selectedNode.status === 'completed' ? 'green' : 'blue',
                children: (
                  <Card size="small">
                    <Text strong>T-3：内容审核与优化</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      人工审核AI生成内容，结合品牌规范调整优化
                    </Text>
                  </Card>
                )
              },
              {
                color: selectedNode.status === 'completed' ? 'green' : 'gray',
                children: (
                  <Card size="small">
                    <Text strong>T-1：预热发布</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      企微社群预告、公众号预热推文、短视频预告
                    </Text>
                  </Card>
                )
              },
              {
                color: 'red',
                children: (
                  <Card size="small">
                    <Text strong>T-Day：正式发布</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      全平台同步发布营销内容，实时监控数据表现
                    </Text>
                  </Card>
                )
              }
            ]} />
          </div>
        )}
      </Modal>
    </div>
  )
}
