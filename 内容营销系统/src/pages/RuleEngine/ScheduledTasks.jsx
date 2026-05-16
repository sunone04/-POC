import { useState } from 'react'
import {
  Card, Table, Tag, Button, Space, Switch, Modal, Form, Input,
  Select, InputNumber, TimePicker, Typography, Row, Col, Badge,
  Tooltip, message, Descriptions, Divider, Alert, Popconfirm
} from 'antd'
import {
  ClockCircleOutlined, PlusOutlined, PlayCircleOutlined,
  PauseCircleOutlined, EditOutlined, DeleteOutlined,
  EyeOutlined, ThunderboltOutlined, CheckCircleOutlined,
  ExclamationCircleOutlined, SyncOutlined
} from '@ant-design/icons'
import { scheduledTasks, hotTopics } from '../../mock/data'

const { Title, Text } = Typography
const { Option } = Select

export default function ScheduledTasks() {
  const [tasks, setTasks] = useState(scheduledTasks)
  const [modalVisible, setModalVisible] = useState(false)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [form] = Form.useForm()

  const handleToggle = (id) => {
    setTasks(prev => prev.map(t =>
      t.id === id ? { ...t, status: t.status === 'active' ? 'paused' : 'active' } : t
    ))
    message.success('任务状态已更新')
  }

  const handleRunNow = (task) => {
    message.loading({ content: `正在执行"${task.name}"...`, key: 'run', duration: 2 })
    setTimeout(() => {
      message.success({ content: `"${task.name}"执行完成，已生成1条内容`, key: 'run' })
    }, 2000)
  }

  const handleAddTask = () => {
    form.resetFields()
    setModalVisible(true)
  }

  const handleSaveTask = () => {
    form.validateFields().then(values => {
      const newTask = {
        id: tasks.length + 1,
        name: values.name,
        type: '定时',
        platform: values.platform,
        contentType: values.contentType,
        schedule: values.schedule,
        cronExpression: '0 8 * * *',
        status: 'active',
        lastRun: '-',
        nextRun: '2026-05-14 08:00:00',
        totalProduced: 0,
        config: {
          useHotTopics: values.useHotTopics || false,
          hotTopicSource: values.hotTopicSource || '',
          template: values.template || '',
          wordCount: values.wordCount || '800-1200'
        }
      }
      setTasks(prev => [...prev, newTask])
      setModalVisible(false)
      message.success('定时任务创建成功')
    })
  }

  const columns = [
    {
      title: '任务名称',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <ClockCircleOutlined style={{ color: record.status === 'active' ? '#52c41a' : '#d9d9d9' }} />
          <Text strong>{text}</Text>
        </Space>
      )
    },
    {
      title: '平台',
      dataIndex: 'platform',
      key: 'platform',
      render: (text) => {
        const colorMap = { '公众号': 'green', '抖音': 'red', '视频号': 'orange', '企微': 'blue' }
        return <Tag color={colorMap[text] || 'default'}>{text}</Tag>
      }
    },
    {
      title: '内容类型',
      dataIndex: 'contentType',
      key: 'contentType',
      render: (text) => <Tag>{text}</Tag>
    },
    {
      title: '执行计划',
      dataIndex: 'schedule',
      key: 'schedule',
      render: (text) => (
        <Space>
          <ClockCircleOutlined style={{ color: '#1890ff' }} />
          <Text>{text}</Text>
        </Space>
      )
    },
    {
      title: '行业热点',
      dataIndex: 'config',
      key: 'hotTopic',
      render: (config) => config?.useHotTopics
        ? <Tag color="volcano"><ThunderboltOutlined /> 已启用</Tag>
        : <Tag>未启用</Tag>
    },
    {
      title: '累计产出',
      dataIndex: 'totalProduced',
      key: 'totalProduced',
      sorter: (a, b) => a.totalProduced - b.totalProduced,
      render: (text) => <Text strong style={{ color: '#e63946' }}>{text}</Text>
    },
    {
      title: '下次执行',
      dataIndex: 'nextRun',
      key: 'nextRun',
      render: (text) => <Text style={{ fontSize: 12 }}>{text}</Text>
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => (
        <Switch
          checked={status === 'active'}
          onChange={() => handleToggle(record.id)}
          checkedChildren="运行中"
          unCheckedChildren="已暂停"
        />
      )
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Tooltip title="立即执行">
            <Button
              type="text"
              icon={<PlayCircleOutlined style={{ color: '#52c41a' }} />}
              onClick={() => handleRunNow(record)}
            />
          </Tooltip>
          <Tooltip title="查看详情">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => { setSelectedTask(record); setDetailModalVisible(true) }}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button type="text" icon={<EditOutlined />} />
          </Tooltip>
          <Popconfirm title="确定删除此任务？" okText="确定" cancelText="取消">
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card className="stat-card" size="small">
            <div style={{ textAlign: 'center' }}>
              <ClockCircleOutlined style={{ fontSize: 24, color: '#e63946' }} />
              <div style={{ fontSize: 24, fontWeight: 700, marginTop: 8 }}>{tasks.length}</div>
              <Text type="secondary">定时任务总数</Text>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card className="stat-card" size="small">
            <div style={{ textAlign: 'center' }}>
              <CheckCircleOutlined style={{ fontSize: 24, color: '#52c41a' }} />
              <div style={{ fontSize: 24, fontWeight: 700, marginTop: 8, color: '#52c41a' }}>
                {tasks.filter(t => t.status === 'active').length}
              </div>
              <Text type="secondary">运行中</Text>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card className="stat-card" size="small">
            <div style={{ textAlign: 'center' }}>
              <PauseCircleOutlined style={{ fontSize: 24, color: '#fa8c16' }} />
              <div style={{ fontSize: 24, fontWeight: 700, marginTop: 8, color: '#fa8c16' }}>
                {tasks.filter(t => t.status === 'paused').length}
              </div>
              <Text type="secondary">已暂停</Text>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card className="stat-card" size="small">
            <div style={{ textAlign: 'center' }}>
              <ThunderboltOutlined style={{ fontSize: 24, color: '#1890ff' }} />
              <div style={{ fontSize: 24, fontWeight: 700, marginTop: 8, color: '#1890ff' }}>
                {tasks.reduce((sum, t) => sum + t.totalProduced, 0)}
              </div>
              <Text type="secondary">累计产出内容</Text>
            </div>
          </Card>
        </Col>
      </Row>

      <Alert
        message="定时任务说明"
        description='定时任务会按照设定的时间自动触发AI内容创作。开启"行业热点"后，系统会在创作前自动抓取当前热点话题，结合热点生成更具传播力的内容。'
        type="info"
        showIcon
        icon={<ExclamationCircleOutlined />}
        style={{ marginBottom: 16, borderRadius: 8 }}
      />

      <Card className="content-card" title={
        <Space>
          <ClockCircleOutlined style={{ color: '#e63946' }} />
          <span>定时任务管理</span>
        </Space>
      } extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddTask} style={{ background: '#e63946', borderColor: '#e63946' }}>
          新建任务
        </Button>
      }>
        <Table
          dataSource={tasks}
          columns={columns}
          rowKey="id"
          pagination={false}
          size="middle"
        />
      </Card>

      <Modal
        title="新建定时任务"
        open={modalVisible}
        onOk={handleSaveTask}
        onCancel={() => setModalVisible(false)}
        width={600}
        okText="创建"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" label="任务名称" rules={[{ required: true, message: '请输入任务名称' }]}>
                <Input placeholder="例如：每日公众号文章" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="platform" label="发布平台" rules={[{ required: true, message: '请选择平台' }]}>
                <Select placeholder="选择平台">
                  <Option value="公众号">公众号</Option>
                  <Option value="抖音">抖音</Option>
                  <Option value="视频号">视频号</Option>
                  <Option value="企微">企业微信</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="contentType" label="内容类型" rules={[{ required: true, message: '请选择内容类型' }]}>
                <Select placeholder="选择内容类型">
                  <Option value="文章">文章</Option>
                  <Option value="图文">图文</Option>
                  <Option value="视频">视频</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="schedule" label="执行时间" rules={[{ required: true, message: '请输入执行计划' }]}>
                <Input placeholder="例如：每日 08:00" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="useHotTopics" label="结合行业热点" valuePropName="checked">
            <Switch checkedChildren="开启" unCheckedChildren="关闭" defaultChecked />
          </Form.Item>
          <Form.Item name="hotTopicSource" label="热点来源">
            <Select placeholder="选择热点来源" mode="multiple">
              <Option value="微博热搜">微博热搜</Option>
              <Option value="百度热搜">百度热搜</Option>
              <Option value="抖音热点">抖音热点</Option>
              <Option value="小红书趋势">小红书趋势</Option>
            </Select>
          </Form.Item>
          <Form.Item name="template" label="创作模板">
            <Select placeholder="选择创作模板">
              <Option value="每日推荐">每日推荐</Option>
              <Option value="品牌故事">品牌故事</Option>
              <Option value="种草推荐">种草推荐</Option>
              <Option value="节日营销">节日营销</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="任务详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={600}
      >
        {selectedTask && (
          <div>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="任务名称" span={2}>{selectedTask.name}</Descriptions.Item>
              <Descriptions.Item label="平台"><Tag color="blue">{selectedTask.platform}</Tag></Descriptions.Item>
              <Descriptions.Item label="内容类型"><Tag>{selectedTask.contentType}</Tag></Descriptions.Item>
              <Descriptions.Item label="执行计划">{selectedTask.schedule}</Descriptions.Item>
              <Descriptions.Item label="Cron表达式"><Text code>{selectedTask.cronExpression}</Text></Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={selectedTask.status === 'active' ? 'green' : 'orange'}>
                  {selectedTask.status === 'active' ? '运行中' : '已暂停'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="累计产出"><Text strong style={{ color: '#e63946' }}>{selectedTask.totalProduced} 条</Text></Descriptions.Item>
              <Descriptions.Item label="上次执行">{selectedTask.lastRun}</Descriptions.Item>
              <Descriptions.Item label="下次执行">{selectedTask.nextRun}</Descriptions.Item>
            </Descriptions>
            <Divider>任务配置</Divider>
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="行业热点">
                {selectedTask.config?.useHotTopics
                  ? <Tag color="volcano"><ThunderboltOutlined /> 已启用</Tag>
                  : <Tag>未启用</Tag>}
              </Descriptions.Item>
              {selectedTask.config?.hotTopicSource && (
                <Descriptions.Item label="热点来源">{selectedTask.config.hotTopicSource}</Descriptions.Item>
              )}
              {selectedTask.config?.template && (
                <Descriptions.Item label="创作模板">{selectedTask.config.template}</Descriptions.Item>
              )}
              {selectedTask.config?.wordCount && (
                <Descriptions.Item label="字数要求">{selectedTask.config.wordCount}</Descriptions.Item>
              )}
              {selectedTask.config?.videoDuration && (
                <Descriptions.Item label="视频时长">{selectedTask.config.videoDuration}</Descriptions.Item>
              )}
              {selectedTask.config?.style && (
                <Descriptions.Item label="内容风格">{selectedTask.config.style}</Descriptions.Item>
              )}
            </Descriptions>
          </div>
        )}
      </Modal>
    </div>
  )
}
