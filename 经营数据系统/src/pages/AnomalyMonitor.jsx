import { useState, useEffect } from 'react'
import {
  Card, Row, Col, Statistic, Typography, Tag, Space, List,
  Badge, Button, Table, Modal, Form, Select, Input, InputNumber,
  message, Switch, Descriptions, Timeline, Tooltip, Tabs, Alert
} from 'antd'
import {
  AlertOutlined, ThunderboltOutlined, CheckCircleOutlined,
  ExclamationCircleOutlined, InfoCircleOutlined, PlusOutlined,
  ReloadOutlined, RobotOutlined, SafetyCertificateOutlined,
  ClockCircleOutlined, WarningOutlined, CloseCircleOutlined,
  SettingOutlined, EyeOutlined
} from '@ant-design/icons'
import { monitorAPI } from '../services/api'

const { Title, Text } = Typography

const severityConfig = {
  critical: { label: '严重', color: '#ff4d4f', bg: '#fff1f0', icon: <CloseCircleOutlined /> },
  warning: { label: '警告', color: '#faad14', bg: '#fffbe6', icon: <ExclamationCircleOutlined /> },
  info: { label: '提示', color: '#1677ff', bg: '#e6f7ff', icon: <InfoCircleOutlined /> }
}

const statusConfig = {
  pending: { label: '待处理', color: 'default', icon: <ClockCircleOutlined /> },
  processing: { label: '处理中', color: 'processing', icon: <ThunderboltOutlined spin /> },
  resolved: { label: '已解决', color: 'success', icon: <CheckCircleOutlined /> }
}

const conditionLabels = {
  absolute: '绝对值',
  day_over_day: '日环比',
  week_over_week: '周环比'
}

export default function AnomalyMonitor() {
  const [rules, setRules] = useState([])
  const [events, setEvents] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(false)
  const [ruleModalOpen, setRuleModalOpen] = useState(false)
  const [eventDetail, setEventDetail] = useState(null)
  const [form] = Form.useForm()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    const [rulesRes, eventsRes, statsRes] = await Promise.all([
      monitorAPI.getRules(),
      monitorAPI.getEvents({ limit: 30 }),
      monitorAPI.getStats()
    ])
    if (rulesRes.success) setRules(rulesRes.data)
    if (eventsRes.success) setEvents(eventsRes.data)
    if (statsRes.success) setStats(statsRes.data)
    setLoading(false)
  }

  const handleAddRule = async (values) => {
    const res = await monitorAPI.createRule(values)
    if (res.success) {
      message.success('规则添加成功')
      setRuleModalOpen(false)
      form.resetFields()
      loadData()
    }
  }

  const handleToggleRule = async (id, enabled) => {
    const res = await monitorAPI.updateRule(id, { enabled: enabled ? 0 : 1 })
    if (res.success) {
      message.success(enabled ? '规则已禁用' : '规则已启用')
      loadData()
    }
  }

  const handleDeleteRule = async (id) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除此监控规则吗？',
      onOk: async () => {
        const res = await monitorAPI.deleteRule(id)
        if (res.success) { message.success('已删除'); loadData() }
      }
    })
  }

  const handleResolve = async (id) => {
    const res = await monitorAPI.resolveEvent(id)
    if (res.success) { message.success('已标记为解决'); loadData() }
  }

  const handleRunCheck = async () => {
    const res = await monitorAPI.runCheck()
    if (res.success) {
      message.success(`检查完成，发现 ${res.data.newEvents.length} 个新异常`)
      loadData()
    }
  }

  const ruleColumns = [
    {
      title: '规则名称', dataIndex: 'name',
      render: (v, r) => (
        <Space>
          <Text strong>{v}</Text>
          {!r.enabled && <Tag color="default">已禁用</Tag>}
        </Space>
      )
    },
    {
      title: '监控指标', dataIndex: 'metric_type',
      render: v => <Tag color="blue">{v}</Tag>
    },
    {
      title: '条件', dataIndex: 'condition_type',
      render: (v, r) => `${conditionLabels[v] || v} ${r.comparison === 'lt' ? '<' : '>'} ${r.threshold}${r.metric_type.includes('rate') || r.metric_type.includes('ratio') ? '%' : ''}`
    },
    {
      title: '严重级别', dataIndex: 'severity',
      render: v => {
        const cfg = severityConfig[v]
        return <Tag color={cfg.color}>{cfg.label}</Tag>
      }
    },
    {
      title: '通知渠道', dataIndex: 'notify_channels',
      render: v => {
        try {
          const channels = JSON.parse(v)
          return channels.map(c => <Tag key={c} style={{ fontSize: 11 }}>{c === 'oa' ? 'OA系统' : c === 'wecom' ? '企微' : c}</Tag>)
        } catch { return '-' }
      }
    },
    {
      title: '状态', dataIndex: 'enabled',
      render: (v, r) => <Switch checked={!!v} size="small" onChange={() => handleToggleRule(r.id, v)} />
    },
    {
      title: '操作', width: 80,
      render: (_, r) => <Button type="text" danger size="small" onClick={() => handleDeleteRule(r.id)}>删除</Button>
    }
  ]

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={4}>
          <Card className="stat-card">
            <Statistic
              title="监控规则"
              value={stats.rulesCount || 0}
              prefix={<SafetyCertificateOutlined style={{ color: '#1677ff' }} />}
              valueStyle={{ color: '#1677ff' }}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>已启用 {stats.enabledRules || 0}</Text>
          </Card>
        </Col>
        <Col span={4}>
          <Card className="stat-card">
            <Statistic
              title="待处理"
              value={stats.pending || 0}
              prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card className="stat-card">
            <Statistic
              title="处理中"
              value={stats.processing || 0}
              prefix={<ThunderboltOutlined style={{ color: '#1677ff' }} />}
              valueStyle={{ color: '#1677ff' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card className="stat-card">
            <Statistic
              title="严重异常"
              value={stats.critical || 0}
              prefix={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card className="stat-card">
            <Statistic
              title="已解决"
              value={stats.resolved || 0}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card className="stat-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Button type="primary" icon={<ThunderboltOutlined />} onClick={handleRunCheck} block>
              立即巡检
            </Button>
          </Card>
        </Col>
      </Row>

      <Card className="content-card" style={{ marginBottom: 16 }}>
        <Alert
          message={
            <Space>
              <RobotOutlined />
              <Text strong>7×24小时自动监控运行中</Text>
            </Space>
          }
          description="规则引擎持续对建模后的经营数据进行分析，发现异常自动触发Agent归因推理层进行跨系统归因分析并给出解决方案"
          type="info"
          showIcon={false}
          style={{ borderRadius: 8, background: 'linear-gradient(135deg, #e6f7ff, #f0f5ff)', border: '1px solid #91caff' }}
        />
      </Card>

      <Card
        className="content-card"
        title={
          <Space>
            <SafetyCertificateOutlined style={{ color: '#1677ff' }} />
            <span>监控规则引擎</span>
          </Space>
        }
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={loadData}>刷新</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setRuleModalOpen(true)}>
              添加规则
            </Button>
          </Space>
        }
        style={{ marginBottom: 16 }}
      >
        <Table
          dataSource={rules}
          columns={ruleColumns}
          rowKey="id"
          size="small"
          pagination={false}
        />
      </Card>

      <Card
        className="content-card"
        title={
          <Space>
            <AlertOutlined style={{ color: '#ff4d4f' }} />
            <span>异常事件记录</span>
          </Space>
        }
      >
        <Timeline
          items={events.map(event => {
            const sevCfg = severityConfig[event.severity] || severityConfig.warning
            const statCfg = statusConfig[event.status] || statusConfig.pending
            return {
              color: event.severity === 'critical' ? 'red' : event.severity === 'warning' ? 'gold' : 'blue',
              children: (
                <div className={`event-timeline-item ${event.severity}`}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <Space>
                      <Tag color={sevCfg.color}>{sevCfg.label}</Tag>
                      <Tag color={statCfg.color}>{statCfg.label}</Tag>
                      <Text strong>{event.rule_name}</Text>
                    </Space>
                    <Space>
                      <Text type="secondary" style={{ fontSize: 12 }}>{event.created_at}</Text>
                      {event.status !== 'resolved' && (
                        <Button size="small" type="link" onClick={() => handleResolve(event.id)}>
                          标记解决
                        </Button>
                      )}
                    </Space>
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <Space split="·">
                      <Text type="secondary">当前值: <Text strong style={{ color: sevCfg.color }}>{event.current_value}</Text></Text>
                      <Text type="secondary">阈值: <Text strong>{event.threshold_value}</Text></Text>
                    </Space>
                  </div>
                  {event.agent_analysis && (
                    <div style={{
                      background: '#f0f5ff', padding: '8px 12px', borderRadius: 6,
                      borderLeft: '3px solid #1677ff', marginBottom: 6
                    }}>
                      <Space><RobotOutlined style={{ color: '#1677ff' }} /><Text strong style={{ color: '#1677ff' }}>Agent归因分析：</Text></Space>
                      <div style={{ marginTop: 4, fontSize: 13, color: '#595959' }}>{event.agent_analysis}</div>
                    </div>
                  )}
                  {event.agent_solution && (
                    <div style={{
                      background: '#f6ffed', padding: '8px 12px', borderRadius: 6,
                      borderLeft: '3px solid #52c41a'
                    }}>
                      <Space><CheckCircleOutlined style={{ color: '#52c41a' }} /><Text strong style={{ color: '#52c41a' }}>解决方案：</Text></Space>
                      <div style={{ marginTop: 4, fontSize: 13, color: '#595959' }}>{event.agent_solution}</div>
                    </div>
                  )}
                </div>
              )
            }
          })}
        />
      </Card>

      <Modal
        title="添加监控规则"
        open={ruleModalOpen}
        onCancel={() => { setRuleModalOpen(false); form.resetFields() }}
        onOk={() => form.submit()}
        okText="添加"
        cancelText="取消"
      >
        <Form form={form} layout="vertical" onFinish={handleAddRule}>
          <Form.Item name="name" label="规则名称" rules={[{ required: true }]}>
            <Input placeholder="例如：日营业额下降预警" />
          </Form.Item>
          <Form.Item name="metric_type" label="监控指标" rules={[{ required: true }]}>
            <Select placeholder="选择指标">
              <Select.Option value="revenue">营业额</Select.Option>
              <Select.Option value="profit">毛利润</Select.Option>
              <Select.Option value="profit_rate">毛利率</Select.Option>
              <Select.Option value="customer_count">客流量</Select.Option>
              <Select.Option value="avg_transaction">客单价</Select.Option>
              <Select.Option value="online_revenue">线上营收</Select.Option>
              <Select.Option value="return_rate">退货率</Select.Option>
              <Select.Option value="inventory_turnover">库存周转率</Select.Option>
            </Select>
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="condition_type" label="条件类型" rules={[{ required: true }]}>
                <Select>
                  <Select.Option value="absolute">绝对值</Select.Option>
                  <Select.Option value="day_over_day">日环比</Select.Option>
                  <Select.Option value="week_over_week">周环比</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="comparison" label="比较方式" initialValue="lt">
                <Select>
                  <Select.Option value="lt">小于 (&lt;)</Select.Option>
                  <Select.Option value="gt">大于 (&gt;)</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="threshold" label="阈值" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} placeholder="输入阈值" />
          </Form.Item>
          <Form.Item name="severity" label="严重级别" initialValue="warning">
            <Select>
              <Select.Option value="critical">严重</Select.Option>
              <Select.Option value="warning">警告</Select.Option>
              <Select.Option value="info">提示</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="notify_channels" label="通知渠道">
            <Select mode="multiple" placeholder="选择通知渠道">
              <Select.Option value="oa">OA系统</Select.Option>
              <Select.Option value="wecom">企业微信</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
