import { useState, useEffect } from 'react'
import {
  Card, Row, Col, Statistic, Typography, Tag, Space, List,
  Badge, Button, Modal, Form, Select, Input, InputNumber,
  message, Tooltip, Progress, Descriptions, Divider, Switch
} from 'antd'
import {
  DatabaseOutlined, ApiOutlined, CheckCircleOutlined,
  CloseCircleOutlined, SyncOutlined, PlusOutlined,
  LinkOutlined, DisconnectOutlined, SettingOutlined,
  CloudServerOutlined, ReloadOutlined, InfoCircleOutlined
} from '@ant-design/icons'
import { datasourceAPI } from '../services/api'

const { Title, Text } = Typography

const typeConfig = {
  oa: { label: '企业OA', color: '#1677ff', icon: '🏢' },
  wecom: { label: '企业微信', color: '#2b7ce9', icon: '💬' },
  pos: { label: '收银系统', color: '#52c41a', icon: '💰' },
  erp: { label: 'ERP系统', color: '#722ed1', icon: '📊' },
  crm: { label: '会员系统', color: '#fa8c16', icon: '👤' },
  scm: { label: '供应链系统', color: '#13c2c2', icon: '🚚' },
  hr: { label: '人力资源', color: '#eb2f96', icon: '👥' },
  finance: { label: '财务系统', color: '#f5222d', icon: '🏦' },
  bi: { label: 'BI平台', color: '#2f54eb', icon: '📈' },
  other: { label: '其他', color: '#8c8c8c', icon: '🔌' }
}

export default function DataManagement() {
  const [sources, setSources] = useState([])
  const [status, setStatus] = useState({ total: 0, connected: 0, disconnected: 0 })
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [form] = Form.useForm()
  const [syncingIds, setSyncingIds] = useState(new Set())

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    const [srcRes, statRes] = await Promise.all([
      datasourceAPI.getAll(),
      datasourceAPI.getStatus()
    ])
    if (srcRes.success) setSources(srcRes.data)
    if (statRes.success) setStatus(statRes.data)
    setLoading(false)
  }

  const handleConnect = async (id) => {
    const res = await datasourceAPI.connect(id)
    if (res.success) {
      message.success('数据源连接成功')
      loadData()
    } else {
      message.error('连接失败：' + (res.message || '未知错误'))
    }
  }

  const handleDisconnect = async (id) => {
    const res = await datasourceAPI.disconnect(id)
    if (res.success) {
      message.success('数据源已断开')
      loadData()
    }
  }

  const handleSync = async (id) => {
    setSyncingIds(prev => new Set(prev).add(id))
    const res = await datasourceAPI.sync(id)
    if (res.success) {
      message.success('数据同步完成')
      loadData()
    }
    setSyncingIds(prev => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }

  const handleAdd = async (values) => {
    const res = await datasourceAPI.create(values)
    if (res.success) {
      message.success('数据源添加成功')
      setModalOpen(false)
      form.resetFields()
      loadData()
    }
  }

  const handleDelete = async (id) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除此数据源吗？',
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        const res = await datasourceAPI.delete(id)
        if (res.success) {
          message.success('已删除')
          loadData()
        }
      }
    })
  }

  const connectedPercent = status.total > 0 ? Math.round((status.connected / status.total) * 100) : 0

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card className="stat-card">
            <Statistic
              title="数据源总数"
              value={status.total}
              prefix={<DatabaseOutlined style={{ color: '#1677ff' }} />}
              valueStyle={{ color: '#1677ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="stat-card">
            <Statistic
              title="已连接"
              value={status.connected}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="stat-card">
            <Statistic
              title="未连接"
              value={status.disconnected}
              prefix={<CloseCircleOutlined style={{ color: '#d9d9d9' }} />}
              valueStyle={{ color: '#8c8c8c' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="stat-card">
            <div style={{ textAlign: 'center' }}>
              <Text type="secondary" style={{ fontSize: 14 }}>连接率</Text>
              <Progress
                type="circle"
                size={64}
                percent={connectedPercent}
                strokeColor={connectedPercent >= 80 ? '#52c41a' : connectedPercent >= 50 ? '#faad14' : '#ff4d4f'}
                format={p => `${p}%`}
              />
            </div>
          </Card>
        </Col>
      </Row>

      <Card
        className="content-card"
        title={
          <Space>
            <CloudServerOutlined style={{ color: '#1677ff' }} />
            <span>已接入数据平台</span>
          </Space>
        }
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={loadData}>刷新</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
              添加数据源
            </Button>
          </Space>
        }
      >
        <Row gutter={[16, 16]}>
          {sources.map(source => {
            const cfg = typeConfig[source.type] || typeConfig.other
            const isConnected = source.status === 'connected'
            const isSyncing = syncingIds.has(source.id)

            return (
              <Col xs={24} sm={12} lg={8} xl={6} key={source.id}>
                <Card
                  className={`datasource-card ${source.status}`}
                  size="small"
                >
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      background: `${cfg.color}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 22,
                      marginRight: 12,
                      flexShrink: 0
                    }}>
                      {cfg.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Text strong style={{ fontSize: 15 }}>{source.name}</Text>
                      </div>
                      <div style={{ marginTop: 2 }}>
                        <Tag color={cfg.color} style={{ fontSize: 11 }}>{cfg.label}</Tag>
                        <Badge
                          status={isConnected ? 'success' : 'default'}
                          text={
                            <Text style={{ fontSize: 12, color: isConnected ? '#52c41a' : '#8c8c8c' }}>
                              {isConnected ? '已连接' : '未连接'}
                            </Text>
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {isConnected && source.last_sync && (
                    <div style={{ marginBottom: 8 }}>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        <SyncOutlined spin={isSyncing} style={{ marginRight: 4 }} />
                        最近同步：{source.last_sync}
                      </Text>
                    </div>
                  )}

                  {isConnected && source.config && (
                    <div style={{ marginBottom: 8 }}>
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        同步表：{(() => {
                          try {
                            const c = JSON.parse(source.config)
                            return c.syncTables ? c.syncTables.join('、') : '-'
                          } catch { return '-' }
                        })()}
                      </Text>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                    {isConnected ? (
                      <>
                        <Button
                          size="small"
                          icon={<SyncOutlined spin={isSyncing} />}
                          onClick={() => handleSync(source.id)}
                          loading={isSyncing}
                        >
                          同步
                        </Button>
                        <Button
                          size="small"
                          danger
                          icon={<DisconnectOutlined />}
                          onClick={() => handleDisconnect(source.id)}
                        >
                          断开
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="small"
                        type="primary"
                        icon={<LinkOutlined />}
                        onClick={() => handleConnect(source.id)}
                      >
                        连接
                      </Button>
                    )}
                    <Button
                      size="small"
                      type="text"
                      danger
                      onClick={() => handleDelete(source.id)}
                    >
                      删除
                    </Button>
                  </div>
                </Card>
              </Col>
            )
          })}
        </Row>
      </Card>

      <Modal
        title="添加数据源"
        open={modalOpen}
        onCancel={() => { setModalOpen(false); form.resetFields() }}
        onOk={() => form.submit()}
        okText="添加"
        cancelText="取消"
      >
        <Form form={form} layout="vertical" onFinish={handleAdd}>
          <Form.Item name="name" label="数据源名称" rules={[{ required: true, message: '请输入名称' }]}>
            <Input placeholder="例如：财务管理系统" />
          </Form.Item>
          <Form.Item name="type" label="数据源类型" rules={[{ required: true, message: '请选择类型' }]}>
            <Select placeholder="请选择类型">
              {Object.entries(typeConfig).map(([key, cfg]) => (
                <Select.Option key={key} value={key}>
                  {cfg.icon} {cfg.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="sync_interval" label="同步间隔（秒）" initialValue={300}>
            <InputNumber min={60} max={86400} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="config" label="连接配置（JSON）">
            <Input.TextArea
              rows={4}
              placeholder='{"url":"https://...","syncTables":["table1","table2"]}'
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
