import { useState, useEffect } from 'react'
import {
  Card, Row, Col, Statistic, Typography, Tag, Space, List,
  Badge, Button, Table, Descriptions, Steps, Spin, message,
  Timeline, Divider, Alert, Modal, Tooltip
} from 'antd'
import {
  RobotOutlined, ThunderboltOutlined, CheckCircleOutlined,
  SearchOutlined, SendOutlined, EyeOutlined,
  BranchesOutlined, BugOutlined, SolutionOutlined,
  NotificationOutlined, FileAddOutlined, ReloadOutlined,
  DatabaseOutlined, CloudServerOutlined,
  ExperimentOutlined, RightOutlined, ClockCircleOutlined,
  WarningOutlined, CloseCircleOutlined
} from '@ant-design/icons'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  ResponsiveContainer, ReferenceLine
} from 'recharts'
import { agentAPI, monitorAPI } from '../services/api'

const { Title, Text, Paragraph } = Typography

const severityConfig = {
  critical: { label: '严重', color: '#ff4d4f', bg: '#fff1f0' },
  warning: { label: '警告', color: '#faad14', bg: '#fffbe6' },
  info: { label: '提示', color: '#1677ff', bg: '#e6f7ff' }
}

const eventStatusConfig = {
  pending: { label: '待处理', color: 'default' },
  processing: { label: '推理中', color: 'processing' },
  resolved: { label: '已解决', color: 'success' }
}

const flowSteps = [
  { key: 'detect', title: '异常检测', desc: '规则引擎7×24h监控', icon: <BugOutlined />, color: '#ff4d4f' },
  { key: 'trigger', title: '触发Agent', desc: '异常事件进入推理层', icon: <ThunderboltOutlined />, color: '#fa8c16' },
  { key: 'analyze', title: '跨系统归因', desc: '关联多数据源分析根因', icon: <SearchOutlined />, color: '#1677ff' },
  { key: 'solve', title: '生成方案', desc: '给出解决方案和行动建议', icon: <SolutionOutlined />, color: '#52c41a' },
  { key: 'execute', title: '自动执行', desc: '推送通知、创建工单', icon: <SendOutlined />, color: '#722ed1' }
]

export default function AgentReasoning() {
  const [tasks, setTasks] = useState([])
  const [events, setEvents] = useState([])
  const [agentStats, setAgentStats] = useState({})
  const [loading, setLoading] = useState(false)
  const [detailVisible, setDetailVisible] = useState(false)
  const [detailData, setDetailData] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [tasksRes, eventsRes, statsRes] = await Promise.all([
        agentAPI.getTasks({ limit: 20 }),
        monitorAPI.getEvents({ limit: 20 }),
        agentAPI.getStats()
      ])
      if (tasksRes.success) setTasks(tasksRes.data)
      if (eventsRes.success) setEvents(eventsRes.data)
      if (statsRes.success) setAgentStats(statsRes.data)
    } catch (err) {
      console.error('加载数据失败:', err)
    }
    setLoading(false)
  }

  const handleAnalyze = async (eventId) => {
    setAnalyzing(eventId)
    try {
      const res = await agentAPI.analyze(eventId)
      if (res.success) {
        message.success('Agent归因分析完成，已生成解决方案')
        loadData()
      } else {
        message.error('分析失败：' + (res.message || '未知错误'))
      }
    } catch (err) {
      message.error('分析请求失败')
    }
    setAnalyzing(null)
  }

  const handleViewDetail = async (eventId) => {
    setDetailLoading(true)
    setDetailVisible(true)
    try {
      const res = await agentAPI.getEventDetail(eventId)
      if (res.success) {
        setDetailData(res.data)
      } else {
        message.error('获取详情失败')
        setDetailVisible(false)
      }
    } catch (err) {
      message.error('获取详情失败')
      setDetailVisible(false)
    }
    setDetailLoading(false)
  }

  const pendingEvents = events.filter(e => e.status === 'pending')
  const processingEvents = events.filter(e => e.status === 'processing')

  return (
    <div>
      <Card className="content-card" style={{ marginBottom: 16 }}>
        <Alert
          message={
            <Space>
              <RobotOutlined />
              <Text strong>Agent归因推理引擎</Text>
            </Space>
          }
          description="当异常监控层检测到异常时，Agent自动进行跨系统归因推理，关联OA、ERP、POS、CRM等多个数据源，分析根因并给出解决方案，自动推送通知和创建工单"
          type="info"
          showIcon={false}
          style={{ borderRadius: 8, background: 'linear-gradient(135deg, #f0f5ff, #e6f7ff)', border: '1px solid #adc6ff' }}
        />
      </Card>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={4}>
          <Card className="stat-card">
            <Statistic
              title="分析任务总数"
              value={agentStats.totalTasks || 0}
              prefix={<RobotOutlined style={{ color: '#1677ff' }} />}
              valueStyle={{ color: '#1677ff' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card className="stat-card">
            <Statistic
              title="已完成"
              value={agentStats.completedTasks || 0}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card className="stat-card">
            <Statistic
              title="分析中"
              value={agentStats.runningTasks || 0}
              prefix={<ThunderboltOutlined spin style={{ color: '#1677ff' }} />}
              valueStyle={{ color: '#1677ff' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card className="stat-card">
            <Statistic
              title="待分析"
              value={agentStats.pendingTasks || 0}
              prefix={<BugOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card className="stat-card">
            <Statistic
              title="通知已发送"
              value={agentStats.notificationsSent || 0}
              prefix={<NotificationOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card className="stat-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Button icon={<ReloadOutlined />} onClick={loadData} block>刷新状态</Button>
          </Card>
        </Col>
      </Row>

      <Card className="content-card" title={
        <Space>
          <BranchesOutlined style={{ color: '#1677ff' }} />
          <span>Agent推理流程</span>
        </Space>
      } style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0' }}>
          {flowSteps.map((step, idx) => (
            <div key={step.key} style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
              <div style={{
                flex: 1, textAlign: 'center', padding: '12px 8px',
                background: `${step.color}10`, borderRadius: 10,
                border: `1px solid ${step.color}30`
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: `linear-gradient(135deg, ${step.color}, ${step.color}88)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 8px', color: '#fff', fontSize: 18
                }}>
                  {step.icon}
                </div>
                <div style={{ fontWeight: 600, fontSize: 13, color: step.color }}>{step.title}</div>
                <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 2 }}>{step.desc}</div>
              </div>
              {idx < flowSteps.length - 1 && (
                <RightOutlined style={{ color: '#d9d9d9', fontSize: 16, margin: '0 4px', flexShrink: 0 }} />
              )}
            </div>
          ))}
        </div>
      </Card>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={12}>
          <Card className="content-card" title={
            <Space>
              <BugOutlined style={{ color: '#ff4d4f' }} />
              <span>待处理异常</span>
              <Badge count={pendingEvents.length} />
            </Space>
          }>
            {pendingEvents.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40 }}>
                <CheckCircleOutlined style={{ fontSize: 48, color: '#52c41a' }} />
                <div style={{ marginTop: 12, color: '#8c8c8c' }}>暂无待处理异常</div>
              </div>
            ) : (
              <List
                dataSource={pendingEvents}
                renderItem={event => {
                  const sevCfg = severityConfig[event.severity] || severityConfig.warning
                  return (
                    <List.Item
                      actions={[
                        <Button
                          type="primary"
                          size="small"
                          icon={<RobotOutlined />}
                          loading={analyzing === event.id}
                          onClick={() => handleAnalyze(event.id)}
                        >
                          启动归因分析
                        </Button>,
                        <Button size="small" icon={<EyeOutlined />} onClick={() => handleViewDetail(event.id)}>
                          详情
                        </Button>
                      ]}
                    >
                      <List.Item.Meta
                        avatar={
                          <div style={{
                            width: 40, height: 40, borderRadius: 8,
                            background: sevCfg.bg, display: 'flex',
                            alignItems: 'center', justifyContent: 'center'
                          }}>
                            <WarningOutlined style={{ color: sevCfg.color, fontSize: 20 }} />
                          </div>
                        }
                        title={
                          <Space>
                            <Text strong>{event.rule_name}</Text>
                            <Tag color={sevCfg.color}>{sevCfg.label}</Tag>
                          </Space>
                        }
                        description={
                          <Space split="·">
                            <Text type="secondary">当前值: {event.current_value}</Text>
                            <Text type="secondary">阈值: {event.threshold_value}</Text>
                            <Text type="secondary">{event.created_at}</Text>
                          </Space>
                        }
                      />
                    </List.Item>
                  )
                }}
              />
            )}
          </Card>
        </Col>

        <Col span={12}>
          <Card className="content-card" title={
            <Space>
              <ExperimentOutlined style={{ color: '#1677ff' }} />
              <span>推理中</span>
              <Badge count={processingEvents.length} />
            </Space>
          }>
            {processingEvents.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40 }}>
                <ThunderboltOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
                <div style={{ marginTop: 12, color: '#8c8c8c' }}>暂无进行中的推理任务</div>
              </div>
            ) : (
              <List
                dataSource={processingEvents}
                renderItem={event => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <div style={{
                          width: 40, height: 40, borderRadius: 8,
                          background: '#e6f7ff', display: 'flex',
                          alignItems: 'center', justifyContent: 'center'
                        }}>
                          <ThunderboltOutlined spin style={{ color: '#1677ff', fontSize: 20 }} />
                        </div>
                      }
                      title={
                        <Space>
                          <Text strong>{event.rule_name}</Text>
                          <Tag color="processing">推理中</Tag>
                        </Space>
                      }
                      description={
                        <div>
                          <Text type="secondary">正在关联POS、ERP、CRM等数据源进行归因分析...</Text>
                          <div style={{ marginTop: 4 }}>
                            <Space>
                              <Tag style={{ fontSize: 10 }}><DatabaseOutlined /> POS</Tag>
                              <Tag style={{ fontSize: 10 }}><CloudServerOutlined /> ERP</Tag>
                              <Tag style={{ fontSize: 10 }}><DatabaseOutlined /> CRM</Tag>
                              <Tag style={{ fontSize: 10 }}><CloudServerOutlined /> 企微</Tag>
                            </Space>
                          </div>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>
      </Row>

      <Card className="content-card" title={
        <Space>
          <CheckCircleOutlined style={{ color: '#52c41a' }} />
          <span>已完成归因分析</span>
        </Space>
      }>
        <Table
          dataSource={tasks.filter(t => t.status === 'completed')}
          rowKey="id"
          size="small"
          pagination={{ pageSize: 5 }}
          columns={[
            {
              title: '异常事件', dataIndex: 'event_id', width: 80,
              render: v => <Tag color="blue">#{v}</Tag>
            },
            {
              title: '归因分析', dataIndex: 'reasoning',
              render: v => <Text style={{ fontSize: 13 }} ellipsis={{ tooltip: v }}>{v}</Text>
            },
            {
              title: '解决方案', dataIndex: 'solution',
              render: v => <Text style={{ fontSize: 13 }} ellipsis={{ tooltip: v }}>{v}</Text>
            },
            {
              title: '执行动作', dataIndex: 'actions', width: 220,
              render: v => {
                if (!v) return '-'
                try {
                  const actions = JSON.parse(v)
                  return (
                    <Space wrap size={4}>
                      {actions.map((a, i) => (
                        <Tag key={i} color={a.type === 'send_notification' ? 'blue' : 'green'} style={{ fontSize: 11 }}>
                          {a.type === 'send_notification' ? <NotificationOutlined /> : <FileAddOutlined />}
                          {' '}{a.type === 'send_notification' ? `通知 ${a.target}` : `工单: ${a.title}`}
                        </Tag>
                      ))}
                    </Space>
                  )
                } catch { return '-' }
              }
            },
            {
              title: '完成时间', dataIndex: 'completed_at', width: 140
            }
          ]}
        />
      </Card>

      <Modal
        title={
          <Space>
            <RobotOutlined style={{ color: '#1677ff' }} />
            <span>异常事件详情</span>
          </Space>
        }
        open={detailVisible}
        onCancel={() => { setDetailVisible(false); setDetailData(null) }}
        footer={null}
        width={760}
        destroyOnClose
      >
        {detailLoading ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <Spin size="large" />
          </div>
        ) : detailData ? (
          <div>
            <Descriptions bordered size="small" column={2} style={{ marginBottom: 16 }}>
              <Descriptions.Item label="规则名称">{detailData.event?.rule_name}</Descriptions.Item>
              <Descriptions.Item label="严重级别">
                <Tag color={severityConfig[detailData.event?.severity]?.color || 'orange'}>
                  {severityConfig[detailData.event?.severity]?.label || detailData.event?.severity}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="当前值">
                <Text strong style={{ color: severityConfig[detailData.event?.severity]?.color }}>
                  {detailData.event?.current_value}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="阈值">{detailData.event?.threshold_value}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={eventStatusConfig[detailData.event?.status]?.color}>
                  {eventStatusConfig[detailData.event?.status]?.label}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="发现时间">{detailData.event?.created_at}</Descriptions.Item>
            </Descriptions>

            {detailData.event?.agent_analysis && (
              <div className="agent-reasoning-card">
                <Space>
                  <RobotOutlined style={{ color: '#1677ff' }} />
                  <Text strong style={{ color: '#1677ff', fontSize: 15 }}>Agent归因推理</Text>
                </Space>
                <Paragraph style={{ marginTop: 8, color: '#333', lineHeight: 1.8, marginBottom: 0 }}>
                  {detailData.event.agent_analysis}
                </Paragraph>
              </div>
            )}

            {detailData.event?.agent_solution && (
              <div className="agent-solution-card">
                <Space>
                  <SolutionOutlined style={{ color: '#52c41a' }} />
                  <Text strong style={{ color: '#52c41a', fontSize: 15 }}>解决方案</Text>
                </Space>
                <Paragraph style={{ marginTop: 8, color: '#333', lineHeight: 1.8, marginBottom: 0 }}>
                  {detailData.event.agent_solution}
                </Paragraph>
              </div>
            )}

            {detailData.tasks && detailData.tasks.length > 0 && (
              <Card size="small" title="执行动作记录" style={{ marginTop: 16 }}>
                <Timeline
                  items={detailData.tasks.map(task => ({
                    color: task.status === 'completed' ? 'green' : 'blue',
                    children: (
                      <div>
                        <Space>
                          <Tag color={task.status === 'completed' ? 'success' : 'processing'}>
                            {task.status === 'completed' ? '已完成' : '进行中'}
                          </Tag>
                          <Text strong>{task.task_type === 'attribution_analysis' ? '归因分析' : task.task_type}</Text>
                        </Space>
                        {task.result && <div style={{ marginTop: 4, fontSize: 13, color: '#595959' }}>{task.result}</div>}
                        {task.completed_at && <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 2 }}>{task.completed_at}</div>}
                      </div>
                    )
                  }))}
                />
              </Card>
            )}

            {detailData.relatedMetrics && detailData.relatedMetrics.length > 0 && (
              <Card size="small" title="指标趋势（近7天）" style={{ marginTop: 16 }}>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={detailData.relatedMetrics.map(m => ({
                    date: m.date.slice(5),
                    value: m.value
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <RTooltip />
                    <Line type="monotone" dataKey="value" stroke="#1677ff" strokeWidth={2} dot={{ r: 3 }} />
                    {detailData.event?.threshold_value && (
                      <ReferenceLine y={detailData.event.threshold_value} stroke="#ff4d4f" strokeDasharray="5 5" label="阈值" />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Text type="secondary">暂无数据</Text>
          </div>
        )}
      </Modal>
    </div>
  )
}
