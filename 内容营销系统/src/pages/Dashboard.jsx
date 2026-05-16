import { useNavigate } from 'react-router-dom'
import {
  Card, Row, Col, Statistic, Typography, Tag, Space, List,
  Badge, Progress, Divider, Button, Tooltip, Alert
} from 'antd'
import {
  EditOutlined, PictureOutlined, VideoCameraOutlined,
  ClockCircleOutlined, ThunderboltOutlined, BookOutlined,
  BarChartOutlined, RiseOutlined, ArrowUpOutlined,
  RobotOutlined, FireOutlined, CalendarOutlined,
  CheckCircleOutlined, StarOutlined, RightOutlined
} from '@ant-design/icons'
import { scheduledTasks, marketingNodes, contentItems, platformData, analyticsData, hotTopics } from '../mock/data'

const { Title, Text } = Typography

export default function Dashboard() {
  const navigate = useNavigate()

  const upcomingNodes = marketingNodes
    .filter(n => n.status === 'upcoming')
    .sort((a, b) => new Date(a.date) - new Date(b.date))

  const nearestNode = upcomingNodes[0]
  const activeTasks = scheduledTasks.filter(t => t.status === 'active')
  const todayContent = contentItems.filter(c => c.createdAt.includes('2026-05-13'))
  const totalViews = analyticsData.contentTrend.reduce((sum, d) => sum + d.totalViews, 0)

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={24}>
          <Alert
            message={
              <Space>
                <RobotOutlined />
                <span>亚细亚AI内容营销系统运行正常</span>
              </Space>
            }
            description={
              <span>
                当前有 <Text strong style={{ color: '#e63946' }}>{activeTasks.length}</Text> 个定时任务运行中，
                今日已产出 <Text strong style={{ color: '#e63946' }}>{todayContent.length}</Text> 条内容，
                近7天总浏览量 <Text strong style={{ color: '#e63946' }}>{(totalViews / 10000).toFixed(1)}万</Text>
                {nearestNode && (
                  <span>，距 <Text strong style={{ color: '#fa8c16' }}>{nearestNode.name}</Text> 还有 {Math.ceil((new Date(nearestNode.date) - new Date('2026-05-13')) / (1000 * 60 * 60 * 24))} 天</span>
                )}
              </span>
            }
            type="success"
            showIcon={false}
            style={{ borderRadius: 8, background: 'linear-gradient(135deg, #f6ffed, #e6f7ff)', border: '1px solid #b7eb8f' }}
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card
            className="stat-card"
            hoverable
            onClick={() => navigate('/creation/text')}
          >
            <Statistic
              title="今日内容产出"
              value={todayContent.length}
              suffix="条"
              prefix={<EditOutlined style={{ color: '#e63946' }} />}
              valueStyle={{ color: '#e63946' }}
            />
            <div style={{ marginTop: 8 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                文章 {todayContent.filter(c => c.type === '文章').length} ·
                视频 {todayContent.filter(c => c.type === '视频').length} ·
                图文 {todayContent.filter(c => c.type === '图文').length}
              </Text>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card
            className="stat-card"
            hoverable
            onClick={() => navigate('/analytics')}
          >
            <Statistic
              title="7日总浏览"
              value={(totalViews / 10000).toFixed(1)}
              suffix="万"
              prefix={<RiseOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
            <div style={{ marginTop: 8 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                <ArrowUpOutlined style={{ color: '#52c41a' }} /> 较上周 +15.3%
              </Text>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card
            className="stat-card"
            hoverable
            onClick={() => navigate('/rule/scheduled')}
          >
            <Statistic
              title="运行中任务"
              value={activeTasks.length}
              suffix={`/ ${scheduledTasks.length}`}
              prefix={<ClockCircleOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
            <div style={{ marginTop: 8 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                累计产出 {scheduledTasks.reduce((s, t) => s + t.totalProduced, 0)} 条
              </Text>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card
            className="stat-card"
            hoverable
            onClick={() => navigate('/knowledge')}
          >
            <Statistic
              title="知识库条目"
              value={47}
              suffix="条"
              prefix={<BookOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#722ed1' }}
            />
            <div style={{ marginTop: 8 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                本周新增 <Tag color="green">3</Tag> 条经验沉淀
              </Text>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={24}>
          <Card className="content-card" title={
            <Space>
              <span style={{ fontSize: 18 }}>🚀</span>
              <span>快速创作</span>
            </Space>
          }>
            <Row gutter={16}>
              <Col span={8}>
                <Card
                  className="creation-type-card"
                  onClick={() => navigate('/creation/text')}
                  style={{ background: 'linear-gradient(135deg, #fff1f0, #fff)', border: '1px solid #ffccc7' }}
                >
                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <EditOutlined style={{ fontSize: 36, color: '#e63946' }} />
                    <Title level={4} style={{ margin: '12px 0 4px', color: '#e63946' }}>文章创作</Title>
                    <Text type="secondary">AI一键生成公众号文章、企微推送</Text>
                    <div style={{ marginTop: 12 }}>
                      <Tag color="red">公众号</Tag>
                      <Tag color="blue">企微</Tag>
                      <Tag color="pink">小红书</Tag>
                    </div>
                  </div>
                </Card>
              </Col>
              <Col span={8}>
                <Card
                  className="creation-type-card"
                  onClick={() => navigate('/creation/image')}
                  style={{ background: 'linear-gradient(135deg, #e6f7ff, #fff)', border: '1px solid #91d5ff' }}
                >
                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <PictureOutlined style={{ fontSize: 36, color: '#1890ff' }} />
                    <Title level={4} style={{ margin: '12px 0 4px', color: '#1890ff' }}>图文创作</Title>
                    <Text type="secondary">AI生成营销海报、朋友圈图文</Text>
                    <div style={{ marginTop: 12 }}>
                      <Tag color="green">朋友圈</Tag>
                      <Tag color="red">小红书</Tag>
                      <Tag color="blue">公众号</Tag>
                    </div>
                  </div>
                </Card>
              </Col>
              <Col span={8}>
                <Card
                  className="creation-type-card"
                  onClick={() => navigate('/creation/video')}
                  style={{ background: 'linear-gradient(135deg, #fff7e6, #fff)', border: '1px solid #ffd591' }}
                >
                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <VideoCameraOutlined style={{ fontSize: 36, color: '#fa8c16' }} />
                    <Title level={4} style={{ margin: '12px 0 4px', color: '#fa8c16' }}>视频创作</Title>
                    <Text type="secondary">AI生成短视频脚本+视频内容</Text>
                    <div style={{ marginTop: 12 }}>
                      <Tag color="red">抖音</Tag>
                      <Tag color="orange">视频号</Tag>
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card className="content-card" title={
            <Space>
              <ClockCircleOutlined style={{ color: '#1890ff' }} />
              <span>定时任务状态</span>
            </Space>
          } extra={
            <Button type="link" onClick={() => navigate('/rule/scheduled')}>查看全部 <RightOutlined /></Button>
          }>
            <List
              size="small"
              dataSource={scheduledTasks}
              renderItem={task => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Badge status={task.status === 'active' ? 'success' : 'warning'} />
                    }
                    title={
                      <Space>
                        <Text strong style={{ fontSize: 13 }}>{task.name}</Text>
                        <Tag color={task.platform === '公众号' ? 'green' : task.platform === '抖音' ? 'red' : task.platform === '视频号' ? 'orange' : 'blue'}>
                          {task.platform}
                        </Tag>
                        {task.config?.useHotTopics && <Tag color="volcano"><ThunderboltOutlined /> 热点</Tag>}
                      </Space>
                    }
                    description={
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        {task.schedule} · 下次执行 {task.nextRun} · 已产出 {task.totalProduced} 条
                      </Text>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card className="content-card" title={
            <Space>
              <CalendarOutlined style={{ color: '#fa8c16' }} />
              <span>营销节点提醒</span>
            </Space>
          } extra={
            <Button type="link" onClick={() => navigate('/rule/calendar')}>查看日历 <RightOutlined /></Button>
          }>
            <List
              size="small"
              dataSource={upcomingNodes.slice(0, 6)}
              renderItem={node => {
                const daysLeft = Math.ceil((new Date(node.date) - new Date('2026-05-13')) / (1000 * 60 * 60 * 24))
                const isUrgent = daysLeft <= node.advanceDays
                return (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <div style={{
                          width: 36,
                          height: 36,
                          borderRadius: 8,
                          background: isUrgent ? '#fff1f0' : '#f5f5f5',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 16
                        }}>
                          {node.type === '公历节日' || node.type === '农历节日' ? '🎉' :
                            node.type === '农历节气' ? '🌿' :
                              node.type === '店庆日' ? '🎂' :
                                node.type === '会员日' ? '💎' : '🛍️'}
                        </div>
                      }
                      title={
                        <Space>
                          <Text strong style={{ fontSize: 13 }}>{node.name}</Text>
                          <Tag style={{ fontSize: 10 }}>{node.type}</Tag>
                        </Space>
                      }
                      description={
                        <Space>
                          <Text type="secondary" style={{ fontSize: 11 }}>{node.date}</Text>
                          <Tag color={isUrgent ? 'red' : 'default'} style={{ fontSize: 10 }}>
                            {daysLeft}天后
                          </Tag>
                          {isUrgent && <Tag color="green" style={{ fontSize: 10 }}><CheckCircleOutlined /> 已准备</Tag>}
                        </Space>
                      }
                    />
                  </List.Item>
                )
              }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card className="content-card" title={
            <Space>
              <FireOutlined style={{ color: '#e63946' }} />
              <span>行业热点</span>
            </Space>
          } size="small">
            <List
              size="small"
              dataSource={hotTopics.slice(0, 6)}
              renderItem={item => (
                <List.Item style={{ padding: '6px 0' }}>
                  <List.Item.Meta
                    avatar={
                      <div className={`hot-topic-rank ${item.rank <= 3 ? 'top3' : 'normal'}`}>
                        {item.rank}
                      </div>
                    }
                    title={<Text style={{ fontSize: 13 }}>{item.title}</Text>}
                    description={
                      <Space>
                        <Text type="secondary" style={{ fontSize: 11 }}>热度 {(item.heat / 10000).toFixed(0)}万</Text>
                        {item.trend === 'up' && <Tag color="red" style={{ fontSize: 10 }}>↑ 上升</Tag>}
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card className="content-card" title={
            <Space>
              <BarChartOutlined style={{ color: '#52c41a' }} />
              <span>平台数据概览</span>
            </Space>
          } extra={
            <Button type="link" onClick={() => navigate('/analytics')}>详细分析 <RightOutlined /></Button>
          } size="small">
            <List
              size="small"
              dataSource={platformData.filter(p => p.connected)}
              renderItem={p => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <div style={{
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        background: `${p.color}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: p.color,
                        fontWeight: 700,
                        fontSize: 12
                      }}>
                        {p.name.slice(0, 2)}
                      </div>
                    }
                    title={
                      <Space>
                        <Text strong style={{ fontSize: 13 }}>{p.name}</Text>
                        <Badge status="success" style={{ marginLeft: 0 }} />
                      </Space>
                    }
                    description={
                      <Space split="·" style={{ fontSize: 11 }}>
                        <Text type="secondary">粉丝 {(p.followers / 10000).toFixed(1)}万</Text>
                        <Text type="secondary">发布 {p.publishCount}篇</Text>
                        <Text type="secondary">均浏览 {p.avgViews.toLocaleString()}</Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}
