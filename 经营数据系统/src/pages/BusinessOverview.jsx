import { useState, useEffect } from 'react'
import {
  Card, Row, Col, Statistic, Typography, Tag, Space, Tabs,
  Button, Table, Alert, Divider, Spin, Select, DatePicker,
  Calendar, Badge, Tooltip as AntTooltip, Segmented, Radio
} from 'antd'
import {
  RiseOutlined, FallOutlined, ArrowUpOutlined, ArrowDownOutlined,
  DashboardOutlined, AlertOutlined, BarChartOutlined,
  AppstoreOutlined, FileTextOutlined, TeamOutlined,
  ReloadOutlined, CalendarOutlined, LeftOutlined, RightOutlined,
  FireOutlined, WarningOutlined, ClockCircleOutlined,
  CheckCircleOutlined, InfoCircleOutlined, SyncOutlined,
  RobotOutlined, BulbOutlined, ThunderboltOutlined
} from '@ant-design/icons'
import {
  LineChart, Line, BarChart, Bar, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { overviewAPI } from '../services/api'
import dayjs from 'dayjs'

const { Title, Text, Paragraph } = Typography

const COLORS = ['#1677ff', '#52c41a', '#fa8c16', '#722ed1', '#13c2c2', '#eb2f96']

const PERIOD_CONFIG = {
  daily: { label: '今日', prevLabel: '昨日', metricPrefix: '今日', trendLabel: '近14天趋势' },
  weekly: { label: '本周', prevLabel: '上周', metricPrefix: '本周累计', trendLabel: '近14天趋势' },
  monthly: { label: '本月', prevLabel: '上月同期', metricPrefix: '本月累计', trendLabel: '近14天趋势' }
}

const getChangeTag = (current, prev, prevLabel, invert = false) => {
  if (!current || !prev) return <span style={{ fontSize: 12, color: '#8c8c8c' }}>暂无对比</span>
  const change = ((current - prev) / prev * 100).toFixed(1)
  const isUp = change > 0
  const isGood = invert ? !isUp : isUp
  return (
    <span style={{ fontSize: 12 }}>
      <span style={{ color: '#8c8c8c', marginRight: 4 }}>较{prevLabel}</span>
      <span style={{ color: isGood ? '#52c41a' : '#ff4d4f' }}>
        {isUp ? <ArrowUpOutlined /> : <ArrowDownOutlined />} {Math.abs(change)}%
      </span>
    </span>
  )
}

function generateAIAnalysis(period, today, yesterday, categoryBreakdown, activeAlerts) {
  const cfg = PERIOD_CONFIG[period]
  const sections = []

  const revenue = today.revenue?.value
  const prevRevenue = yesterday.revenue
  const profit = today.profit?.value
  const profitRate = today.profit_rate?.value
  const prevProfitRate = yesterday.profit_rate
  const customerCount = today.customer_count?.value
  const prevCustomerCount = yesterday.customer_count
  const avgTransaction = today.avg_transaction?.value
  const prevAvgTransaction = yesterday.avg_transaction
  const onlineRevenue = today.online_revenue?.value
  const prevOnlineRevenue = yesterday.online_revenue

  const revChange = revenue && prevRevenue ? ((revenue - prevRevenue) / prevRevenue * 100).toFixed(1) : null
  const profitRateChange = profitRate && prevProfitRate ? (profitRate - prevProfitRate).toFixed(1) : null
  const custChange = customerCount && prevCustomerCount ? ((customerCount - prevCustomerCount) / prevCustomerCount * 100).toFixed(1) : null
  const avgChange = avgTransaction && prevAvgTransaction ? ((avgTransaction - prevAvgTransaction) / prevAvgTransaction * 100).toFixed(1) : null

  if (period === 'daily') {
    sections.push({
      title: '整体经营评估',
      icon: <DashboardOutlined />,
      color: '#1677ff',
      content: revChange !== null
        ? `今日营业额${(revenue / 10000).toFixed(1)}万元，${revChange > 0 ? '较昨日增长' + revChange + '%' : '较昨日下降' + Math.abs(revChange) + '%'}。毛利率${profitRate?.toFixed(1) || '-'}%，${profitRateChange > 0 ? '较昨日提升' + profitRateChange + '个百分点' : profitRateChange < 0 ? '较昨日下降' + Math.abs(profitRateChange) + '个百分点' : '与昨日持平'}。客流量${customerCount?.toLocaleString() || '-'}人，客单价${avgTransaction?.toFixed(0) || '-'}元，整体经营${revChange > 0 && profitRate >= 18 ? '状况良好' : revChange < -5 || profitRate < 18 ? '需重点关注' : '基本平稳'}。`
        : '暂无足够数据进行今日经营评估。'
    })
  } else if (period === 'weekly') {
    sections.push({
      title: '周度经营评估',
      icon: <DashboardOutlined />,
      color: '#1677ff',
      content: revChange !== null
        ? `本周累计营业额${(revenue / 10000).toFixed(1)}万元，日均${(revenue / 70000).toFixed(1)}万元，${revChange > 0 ? '较上周同期增长' + revChange + '%' : '较上周同期下降' + Math.abs(revChange) + '%'}。周均毛利率${profitRate?.toFixed(1) || '-'}%，客流量合计${customerCount?.toLocaleString() || '-'}人次。${revChange > 3 ? '本周经营表现优于上周，建议保持当前策略。' : revChange < -3 ? '本周经营出现下滑，需深入分析下降原因并制定改善方案。' : '本周经营与上周基本持平，建议寻找增量突破点。'}`
        : '暂无足够数据进行周度经营评估。'
    })
  } else {
    sections.push({
      title: '月度经营评估',
      icon: <DashboardOutlined />,
      color: '#1677ff',
      content: revChange !== null
        ? `本月累计营业额${(revenue / 10000).toFixed(1)}万元，日均${(revenue / (14 * 10000)).toFixed(1)}万元，${revChange > 0 ? '较上月同期增长' + revChange + '%' : '较上月同期下降' + Math.abs(revChange) + '%'}。月均毛利率${profitRate?.toFixed(1) || '-'}%，累计客流量${customerCount?.toLocaleString() || '-'}人次。${revChange > 5 ? '本月经营增长显著，建议总结成功经验并持续推广。' : revChange < -5 ? '本月经营明显下滑，需紧急启动经营改善计划。' : '本月经营基本稳定，建议在现有基础上优化运营效率。'}`
        : '暂无足够数据进行月度经营评估。'
    })
  }

  if (profitRate !== null && profitRate < 18) {
    sections.push({
      title: '毛利率预警',
      icon: <WarningOutlined />,
      color: '#ff4d4f',
      content: `${cfg.metricPrefix}毛利率${profitRate.toFixed(1)}%，低于安全线18%。${profitRateChange < 0 ? '较' + cfg.prevLabel + '下降' + Math.abs(profitRateChange) + '个百分点，呈持续恶化趋势。' : ''}可能原因：1) 采购成本上升未及时调价；2) 促销折扣力度过大；3) 高毛利品类占比下降。建议：立即核查各品类毛利结构，对低毛利品类启动价格调整机制，同时优化促销策略，避免过度打折。`
    })
  } else if (profitRate !== null && profitRate >= 20) {
    sections.push({
      title: '毛利率分析',
      icon: <CheckCircleOutlined />,
      color: '#52c41a',
      content: `${cfg.metricPrefix}毛利率${profitRate.toFixed(1)}%，处于健康水平。${profitRateChange > 0 ? '较' + cfg.prevLabel + '提升' + profitRateChange + '个百分点，盈利能力增强。' : '建议持续关注成本端变化，维持当前毛利水平。'}`
    })
  }

  if (custChange !== null && custChange < -5) {
    sections.push({
      title: '客流量分析',
      icon: <FallOutlined />,
      color: '#fa8c16',
      content: `${cfg.metricPrefix}客流量较${cfg.prevLabel}下降${Math.abs(custChange)}%，需重点关注。${avgChange > 0 ? '客单价同比提升' + avgChange + '%，部分弥补了客流下降的影响，但营收增长仍不可持续。' : '客单价未出现明显提升，客流下降直接冲击营收。'}建议：1) 分析客流下降是否与天气、节假日等外部因素相关；2) 检查各门店客流分布，定位下降集中区域；3) 启动引流活动，如限时折扣、会员专享等。`
    })
  } else if (custChange !== null && custChange > 5) {
    sections.push({
      title: '客流量分析',
      icon: <RiseOutlined />,
      color: '#52c41a',
      content: `${cfg.metricPrefix}客流量较${cfg.prevLabel}增长${custChange}%，表现良好。${avgChange > 0 ? '客单价同步提升' + avgChange + '%，量价齐升态势明显。' : avgChange < -3 ? '但客单价下降' + Math.abs(avgChange) + '%，需警惕"增量不增利"风险，建议优化商品结构。' : '客单价基本稳定，客流增长有效转化为营收增长。'}`
    })
  }

  if (categoryBreakdown && categoryBreakdown.length > 0) {
    const top = categoryBreakdown[0]
    const bottom = categoryBreakdown[categoryBreakdown.length - 1]
    sections.push({
      title: '品类结构分析',
      icon: <AppstoreOutlined />,
      color: '#722ed1',
      content: `${cfg.label}品类营收中，${top.category}以${(top.value / 10000).toFixed(1)}万元位居首位，${bottom.category}以${(bottom.value / 10000).toFixed(1)}万元排名末位。${categoryBreakdown.length >= 3 ? `前三大品类（${categoryBreakdown.slice(0, 3).map(c => c.category).join('、')}）合计占比${(categoryBreakdown.slice(0, 3).reduce((s, c) => s + c.value, 0) / categoryBreakdown.reduce((s, c) => s + c.value, 0) * 100).toFixed(0)}%，品类集中度${categoryBreakdown.slice(0, 3).reduce((s, c) => s + c.value, 0) / categoryBreakdown.reduce((s, c) => s + c.value, 0) > 0.7 ? '较高，需注意分散经营风险' : '适中，结构较为均衡'}。` : ''}建议：加强高毛利品类的陈列和推广，优化低效品类的库存配置。`
    })
  }

  if (onlineRevenue && revenue) {
    const onlineRatio = (onlineRevenue / revenue * 100).toFixed(1)
    sections.push({
      title: '线上渠道洞察',
      icon: <ThunderboltOutlined />,
      color: '#13c2c2',
      content: `${cfg.metricPrefix}线上营收${(onlineRevenue / 10000).toFixed(1)}万元，占总营收${onlineRatio}%。${onlineRatio > 25 ? '线上占比较高，渠道融合效果良好，建议继续加大线上营销投入。' : onlineRatio < 15 ? '线上占比较低，线下依赖度较高，建议加速数字化转型，拓展线上获客渠道。' : '线上线下结构基本均衡，建议持续优化全渠道协同运营。'}${prevOnlineRevenue ? `线上营收${onlineRevenue > prevOnlineRevenue ? '同比增长' + ((onlineRevenue - prevOnlineRevenue) / prevOnlineRevenue * 100).toFixed(1) + '%' : '同比下降' + ((prevOnlineRevenue - onlineRevenue) / prevOnlineRevenue * 100).toFixed(1) + '%'}。` : ''}`
    })
  }

  if (activeAlerts > 0) {
    sections.push({
      title: '风险提示',
      icon: <AlertOutlined />,
      color: '#ff4d4f',
      content: `当前有${activeAlerts}个活跃异常预警待处理。建议立即前往「异常监控」模块查看详情，Agent归因推理系统正在自动分析处理中。及时响应预警可有效降低经营风险，避免小问题演变为大损失。`
    })
  }

  return sections
}

export default function BusinessOverview() {
  const [dashboard, setDashboard] = useState(null)
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('today')
  const [calendarData, setCalendarData] = useState({ metrics: {}, events: {} })
  const [calendarMonth, setCalendarMonth] = useState(dayjs('2026-05-14'))
  const [calendarLoading, setCalendarLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState(null)
  const [period, setPeriod] = useState('daily')

  useEffect(() => {
    loadData()
  }, [period])

  useEffect(() => {
    loadCalendarData()
  }, [calendarMonth])

  const loadData = async () => {
    setLoading(true)
    const [dashRes, reportRes] = await Promise.all([
      overviewAPI.getDashboard({ period }),
      overviewAPI.getReports()
    ])
    if (dashRes.success) setDashboard(dashRes.data)
    if (reportRes.success) setReports(reportRes.data)
    setLoading(false)
  }

  const loadCalendarData = async () => {
    setCalendarLoading(true)
    const res = await overviewAPI.getCalendar({
      year: calendarMonth.year(),
      month: calendarMonth.month() + 1
    })
    if (res.success) setCalendarData(res.data)
    setCalendarLoading(false)
  }

  const handleGenerateReport = async (type) => {
    const today = dayjs('2026-05-14')
    let periodStart, periodEnd
    if (type === 'daily') {
      periodStart = periodEnd = today.format('YYYY-MM-DD')
    } else if (type === 'weekly') {
      periodStart = today.subtract(6, 'day').format('YYYY-MM-DD')
      periodEnd = today.format('YYYY-MM-DD')
    } else {
      periodStart = today.subtract(29, 'day').format('YYYY-MM-DD')
      periodEnd = today.format('YYYY-MM-DD')
    }
    const res = await overviewAPI.generateReport({ report_type: type, period_start: periodStart, period_end: periodEnd })
    if (res.success) loadData()
  }

  const getRevenueColor = (value) => {
    if (!value) return '#f0f0f0'
    if (value >= 800000) return '#52c41a'
    if (value >= 600000) return '#1677ff'
    if (value >= 400000) return '#faad14'
    return '#ff4d4f'
  }

  const getRevenueBg = (value) => {
    if (!value) return 'transparent'
    if (value >= 800000) return '#f6ffed'
    if (value >= 600000) return '#e6f7ff'
    if (value >= 400000) return '#fffbe6'
    return '#fff1f0'
  }

  const dateCellRender = (date) => {
    const dateStr = date.format('YYYY-MM-DD')
    const dayMetrics = calendarData.metrics[dateStr]
    const dayEvents = calendarData.events[dateStr]

    if (!dayMetrics && !dayEvents) return null

    const revenue = dayMetrics?.revenue
    const profitRate = dayMetrics?.profit_rate
    const customerCount = dayMetrics?.customer_count

    return (
      <div style={{ padding: '0 4px' }}>
        {revenue && (
          <div style={{
            fontSize: 11, fontWeight: 600,
            color: getRevenueColor(revenue)
          }}>
            {(revenue / 10000).toFixed(0)}万
          </div>
        )}
        {profitRate && (
          <div style={{ fontSize: 10, color: '#8c8c8c' }}>
            利{profitRate.toFixed(1)}%
          </div>
        )}
        {customerCount && (
          <div style={{ fontSize: 10, color: '#8c8c8c' }}>
            客{customerCount}
          </div>
        )}
        {dayEvents && (
          <div style={{ marginTop: 2 }}>
            {dayEvents.critical > 0 && <Badge status="error" style={{ marginLeft: 2 }} />}
            {dayEvents.warning > 0 && <Badge status="warning" style={{ marginLeft: 2 }} />}
            {dayEvents.info > 0 && <Badge status="processing" style={{ marginLeft: 2 }} />}
          </div>
        )}
      </div>
    )
  }

  const cellRender = (current, info) => {
    if (info.type === 'date') return dateCellRender(current)
    return info.originNode
  }

  const handleCalendarSelect = (date) => {
    setSelectedDate(date.format('YYYY-MM-DD'))
  }

  const handlePanelChange = (date) => {
    setCalendarMonth(date)
  }

  if (!dashboard) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />

  const { today, yesterday, trends, categoryBreakdown, activeAlerts, periodLabel, prevLabel, dateRange } = dashboard
  const periodCfg = PERIOD_CONFIG[period]

  const trendChartData = Object.entries(trends).map(([date, metrics]) => ({
    date: date.slice(5),
    营业额: metrics.revenue ? Math.round(metrics.revenue / 10000) : 0,
    毛利润: metrics.profit ? Math.round(metrics.profit / 10000) : 0,
    客流量: metrics.customer_count || 0,
    毛利率: metrics.profit_rate || 0
  }))

  const categoryData = categoryBreakdown.map(c => ({
    name: c.category,
    value: Math.round(c.value / 10000)
  }))

  const metricCards = [
    {
      key: 'revenue', label: '营业额', icon: <RiseOutlined />,
      color: '#1677ff', value: today.revenue?.value, unit: '元',
      yesterday: yesterday.revenue, format: v => (v / 10000).toFixed(1) + '万'
    },
    {
      key: 'profit', label: '毛利润', icon: <BarChartOutlined />,
      color: '#52c41a', value: today.profit?.value, unit: '元',
      yesterday: yesterday.profit, format: v => (v / 10000).toFixed(1) + '万'
    },
    {
      key: 'profit_rate', label: '毛利率', icon: <DashboardOutlined />,
      color: today.profit_rate?.value < 18 ? '#ff4d4f' : '#52c41a',
      value: today.profit_rate?.value, unit: '%',
      yesterday: yesterday.profit_rate, format: v => v.toFixed(1) + '%',
      invert: true
    },
    {
      key: 'customer_count', label: '客流量', icon: <TeamOutlined />,
      color: '#fa8c16', value: today.customer_count?.value, unit: '人',
      yesterday: yesterday.customer_count, format: v => v.toLocaleString()
    },
    {
      key: 'avg_transaction', label: '客单价', icon: <AppstoreOutlined />,
      color: '#722ed1', value: today.avg_transaction?.value, unit: '元',
      yesterday: yesterday.avg_transaction, format: v => v.toFixed(0) + '元'
    },
    {
      key: 'online_revenue', label: '线上营收', icon: <RiseOutlined />,
      color: '#13c2c2', value: today.online_revenue?.value, unit: '元',
      yesterday: yesterday.online_revenue, format: v => (v / 10000).toFixed(1) + '万'
    }
  ]

  const getSummaryInsights = () => {
    const insights = []
    if (today.revenue?.value && yesterday.revenue) {
      const revChange = ((today.revenue.value - yesterday.revenue) / yesterday.revenue * 100).toFixed(1)
      if (revChange > 0) {
        insights.push({ type: 'success', text: `${periodCfg.metricPrefix}营业额${periodCfg.prevLabel}增长${revChange}%` })
      } else if (revChange < -5) {
        insights.push({ type: 'warning', text: `${periodCfg.metricPrefix}营业额${periodCfg.prevLabel}下降${Math.abs(revChange)}%，需关注` })
      }
    }
    if (today.profit_rate?.value) {
      if (today.profit_rate.value < 18) {
        insights.push({ type: 'error', text: `毛利率${today.profit_rate.value.toFixed(1)}%低于安全线18%` })
      } else {
        insights.push({ type: 'success', text: `毛利率${today.profit_rate.value.toFixed(1)}%，处于健康水平` })
      }
    }
    if (activeAlerts > 0) {
      insights.push({ type: 'warning', text: `当前${activeAlerts}个活跃异常预警待处理` })
    }
    return insights
  }

  const insights = getSummaryInsights()
  const aiSections = generateAIAnalysis(period, today, yesterday, categoryBreakdown, activeAlerts)

  const reportColumns = [
    {
      title: '报告类型', dataIndex: 'report_type', width: 100,
      render: v => <Tag color={v === 'daily' ? 'blue' : v === 'weekly' ? 'green' : 'orange'}>
        {v === 'daily' ? '日报' : v === 'weekly' ? '周报' : '月报'}
      </Tag>
    },
    { title: '统计周期', dataIndex: 'period_start', render: (_, r) => `${r.period_start} ~ ${r.period_end}` },
    { title: '摘要', dataIndex: 'summary', ellipsis: true },
    { title: '生成时间', dataIndex: 'created_at', width: 160 }
  ]

  const selectedDayMetrics = selectedDate ? calendarData.metrics[selectedDate] : null
  const selectedDayEvents = selectedDate ? calendarData.events[selectedDate] : null

  const weekDays = ['日', '一', '二', '三', '四', '五', '六']
  const currentDate = dayjs('2026-05-14')

  return (
    <div>
      {activeAlerts > 0 && (
        <Alert
          message={
            <Space>
              <AlertOutlined />
              <span>当前有 <Text strong style={{ color: '#ff4d4f' }}>{activeAlerts}</Text> 个活跃异常预警</span>
            </Space>
          }
          description="请前往「异常监控」模块查看详情，Agent归因推理层正在自动分析处理"
          type="warning"
          showIcon={false}
          style={{ marginBottom: 16, borderRadius: 8 }}
        />
      )}

      <Card className="content-card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Title level={4} style={{ margin: 0 }}>经营总览</Title>
              <Tag color="blue" style={{ fontSize: 13, padding: '2px 12px', borderRadius: 12 }}>
                <ClockCircleOutlined style={{ marginRight: 4 }} />
                {currentDate.format('YYYY年M月D日')} 周{weekDays[currentDate.day()]}
              </Tag>
              {period !== 'daily' && (
                <Tag style={{ fontSize: 12, color: '#8c8c8c' }}>
                  统计区间: {dateRange?.start} ~ {dateRange?.end}
                </Tag>
              )}
            </div>
            {insights.length > 0 && (
              <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                {insights.map((ins, idx) => (
                  <Tag key={idx} color={ins.type === 'error' ? 'error' : ins.type === 'warning' ? 'warning' : 'success'} style={{ fontSize: 12 }}>
                    {ins.type === 'error' ? <WarningOutlined /> : ins.type === 'warning' ? <AlertOutlined /> : <CheckCircleOutlined />}
                    {' '}{ins.text}
                  </Tag>
                ))}
              </div>
            )}
          </div>
          <Space size={16}>
            <Segmented
              value={period}
              onChange={setPeriod}
              options={[
                { label: '今日', value: 'daily' },
                { label: '本周', value: 'weekly' },
                { label: '本月', value: 'monthly' }
              ]}
            />
            <Button icon={<ReloadOutlined />} onClick={loadData}>刷新</Button>
          </Space>
        </div>
      </Card>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        {metricCards.map(card => (
          <Col span={4} key={card.key}>
            <Card className="stat-card" size="small">
              <Statistic
                title={
                  <Space size={4}>
                    <span style={{ color: card.color }}>{card.icon}</span>
                    <span>{periodCfg.metricPrefix}{card.label}</span>
                  </Space>
                }
                value={card.value ? card.format(card.value) : '-'}
                valueStyle={{ color: card.color, fontSize: 20 }}
              />
              <div style={{ marginTop: 4 }}>
                {getChangeTag(card.value, card.yesterday, prevLabel, card.invert)}
                {card.key === 'profit_rate' && card.value < 18 && (
                  <Tag color="red" style={{ marginLeft: 4, fontSize: 10 }}>低于安全线</Tag>
                )}
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Card
        className="content-card"
        style={{ marginBottom: 16, background: 'linear-gradient(135deg, #f0f5ff 0%, #e6f7ff 50%, #f9f0ff 100%)', border: '1px solid #d6e4ff' }}
        title={
          <Space>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'linear-gradient(135deg, #1677ff, #722ed1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <RobotOutlined style={{ color: '#fff', fontSize: 18 }} />
            </div>
            <span style={{ fontSize: 16, fontWeight: 600 }}>AI 经营分析</span>
            <Tag color="purple" style={{ fontSize: 11 }}>
              <BulbOutlined /> {periodCfg.label}智能报告
            </Tag>
          </Space>
        }
        extra={
          <Space size={8}>
            <Tag style={{ fontSize: 11, color: '#8c8c8c' }}>
              <ClockCircleOutlined /> 分析时间: {currentDate.format('HH:mm')}
            </Tag>
            <Tag color="green" style={{ fontSize: 11 }}>
              <CheckCircleOutlined /> 分析完成
            </Tag>
          </Space>
        }
      >
        <Row gutter={[16, 16]}>
          {aiSections.map((section, idx) => (
            <Col span={12} key={idx}>
              <Card
                size="small"
                style={{
                  borderRadius: 10,
                  border: `1px solid ${section.color}22`,
                  background: '#fff',
                  height: '100%'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 6,
                    background: `${section.color}15`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: section.color, fontSize: 14
                  }}>
                    {section.icon}
                  </div>
                  <Text strong style={{ fontSize: 14, color: section.color }}>{section.title}</Text>
                </div>
                <Paragraph style={{ fontSize: 13, lineHeight: 1.8, color: '#595959', margin: 0 }}>
                  {section.content}
                </Paragraph>
              </Card>
            </Col>
          ))}
        </Row>
        <Divider style={{ margin: '12px 0 8px' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 12, color: '#8c8c8c' }}>
            <RobotOutlined /> 本分析由AI智能引擎基于跨系统数据自动生成，结合POS收银、ERP采购、CRM会员等多源数据综合研判
          </Text>
          <Space size={8}>
            <Button size="small" type="link" icon={<FileTextOutlined />}>导出分析报告</Button>
            <Button size="small" type="link" icon={<SyncOutlined />}>重新分析</Button>
          </Space>
        </div>
      </Card>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={14}>
          <Card className="content-card" title={
            <Space><BarChartOutlined style={{ color: '#1677ff' }} /><span>{periodCfg.trendLabel}</span></Space>
          }>
            <Tabs defaultActiveKey="revenue" items={[
              {
                key: 'revenue', label: '营业额/利润',
                children: (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={trendChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={v => v + '万'} />
                      <Legend />
                      <Line type="monotone" dataKey="营业额" stroke="#1677ff" strokeWidth={2} dot={{ r: 3 }} />
                      <Line type="monotone" dataKey="毛利润" stroke="#52c41a" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                )
              },
              {
                key: 'customer', label: '客流量',
                children: (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={trendChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="客流量" fill="#fa8c16" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )
              },
              {
                key: 'profit_rate', label: '毛利率',
                children: (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={trendChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[15, 25]} />
                      <Tooltip formatter={v => v + '%'} />
                      <Legend />
                      <Line type="monotone" dataKey="毛利率" stroke="#722ed1" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                )
              }
            ]} />
          </Card>
        </Col>

        <Col span={10}>
          <Card className="content-card" title={
            <Space><AppstoreOutlined style={{ color: '#722ed1' }} /><span>品类营收分布</span></Space>
          } extra={<Tag style={{ fontSize: 11 }}>{periodCfg.label}</Tag>}>
            <ResponsiveContainer width="100%" height={420}>
              <BarChart data={categoryData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={60} />
                <Tooltip formatter={v => v + '万'} />
                <Bar dataKey="value" fill="#722ed1" radius={[0, 4, 4, 0]} barSize={24}>
                  {categoryData.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Card className="content-card" title={
        <Space><CalendarOutlined style={{ color: '#1677ff' }} /><span>经营日历</span></Space>
      } style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={18}>
            <Spin spinning={calendarLoading}>
              <Calendar
                value={calendarMonth}
                onPanelChange={handlePanelChange}
                onSelect={handleCalendarSelect}
                cellRender={cellRender}
              />
            </Spin>
          </Col>
          <Col span={6}>
            <Card
              size="small"
              title={
                <Space>
                  <FireOutlined style={{ color: '#1677ff' }} />
                  <span>{selectedDate || '点击日期查看详情'}</span>
                </Space>
              }
              style={{ minHeight: 200 }}
            >
              {selectedDayMetrics ? (
                <div>
                  <div style={{
                    padding: '12px', borderRadius: 8,
                    background: getRevenueBg(selectedDayMetrics.revenue),
                    marginBottom: 8, textAlign: 'center'
                  }}>
                    <div style={{ fontSize: 12, color: '#8c8c8c' }}>营业额</div>
                    <div style={{
                      fontSize: 22, fontWeight: 700,
                      color: getRevenueColor(selectedDayMetrics.revenue)
                    }}>
                      {selectedDayMetrics.revenue ? (selectedDayMetrics.revenue / 10000).toFixed(1) + '万' : '-'}
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div style={{ padding: 8, background: '#f6ffed', borderRadius: 6, textAlign: 'center' }}>
                      <div style={{ fontSize: 11, color: '#8c8c8c' }}>毛利润</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#52c41a' }}>
                        {selectedDayMetrics.profit ? (selectedDayMetrics.profit / 10000).toFixed(1) + '万' : '-'}
                      </div>
                    </div>
                    <div style={{ padding: 8, background: '#e6f7ff', borderRadius: 6, textAlign: 'center' }}>
                      <div style={{ fontSize: 11, color: '#8c8c8c' }}>毛利率</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#1677ff' }}>
                        {selectedDayMetrics.profit_rate ? selectedDayMetrics.profit_rate.toFixed(1) + '%' : '-'}
                      </div>
                    </div>
                    <div style={{ padding: 8, background: '#fff7e6', borderRadius: 6, textAlign: 'center' }}>
                      <div style={{ fontSize: 11, color: '#8c8c8c' }}>客流量</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#fa8c16' }}>
                        {selectedDayMetrics.customer_count || '-'}
                      </div>
                    </div>
                    <div style={{ padding: 8, background: '#f9f0ff', borderRadius: 6, textAlign: 'center' }}>
                      <div style={{ fontSize: 11, color: '#8c8c8c' }}>客单价</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#722ed1' }}>
                        {selectedDayMetrics.avg_transaction ? selectedDayMetrics.avg_transaction.toFixed(0) + '元' : '-'}
                      </div>
                    </div>
                  </div>
                  {selectedDayEvents && (
                    <div style={{ marginTop: 8 }}>
                      <Divider style={{ margin: '8px 0' }} />
                      <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 4 }}>异常事件：</div>
                      {selectedDayEvents.critical > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <Badge status="error" /> 严重异常 {selectedDayEvents.critical}个
                        </div>
                      )}
                      {selectedDayEvents.warning > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <Badge status="warning" /> 警告异常 {selectedDayEvents.warning}个
                        </div>
                      )}
                      {selectedDayEvents.info > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Badge status="processing" /> 提示信息 {selectedDayEvents.info}个
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px 0', color: '#bfbfbf' }}>
                  <CalendarOutlined style={{ fontSize: 32, marginBottom: 8 }} />
                  <div>点击日历中的日期查看经营详情</div>
                </div>
              )}
            </Card>

            <Card size="small" title={<span style={{ fontSize: 13 }}>图例说明</span>} style={{ marginTop: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <div style={{ width: 12, height: 12, borderRadius: 2, background: '#52c41a' }} />
                营业额 ≥ 80万
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <div style={{ width: 12, height: 12, borderRadius: 2, background: '#1677ff' }} />
                营业额 60-80万
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <div style={{ width: 12, height: 12, borderRadius: 2, background: '#faad14' }} />
                营业额 40-60万
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <div style={{ width: 12, height: 12, borderRadius: 2, background: '#ff4d4f' }} />
                营业额 &lt; 40万
              </div>
              <Divider style={{ margin: '8px 0' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <Badge status="error" /> 严重异常
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <Badge status="warning" /> 警告异常
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Badge status="processing" /> 提示信息
              </div>
            </Card>
          </Col>
        </Row>
      </Card>

      <Card className="content-card" title={
        <Space><FileTextOutlined style={{ color: '#1677ff' }} /><span>经营报告</span></Space>
      } extra={
        <Space>
          <Button size="small" onClick={() => handleGenerateReport('daily')}>生成日报</Button>
          <Button size="small" onClick={() => handleGenerateReport('weekly')}>生成周报</Button>
          <Button size="small" onClick={() => handleGenerateReport('monthly')}>生成月报</Button>
        </Space>
      }>
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={[
          { key: 'today', label: '全部报告' },
          { key: 'daily', label: '日报' },
          { key: 'weekly', label: '周报' },
          { key: 'monthly', label: '月报' }
        ]} />
        <Table
          dataSource={activeTab === 'today' ? reports : reports.filter(r => r.report_type === activeTab)}
          columns={reportColumns}
          rowKey="id"
          size="small"
          pagination={{ pageSize: 5 }}
          expandable={{
            expandedRowRender: record => (
              <div>
                <Text strong>详细数据：</Text>
                <Row gutter={16} style={{ marginTop: 8 }}>
                  {Object.entries(record.content).map(([key, val]) => (
                    <Col span={6} key={key}>
                      <div className="metric-highlight">
                        <div className="value" style={{ color: '#1677ff' }}>
                          {typeof val === 'number' ? (val >= 10000 ? (val / 10000).toFixed(1) + '万' : val.toLocaleString()) : val}
                        </div>
                        <div className="label">{key}</div>
                      </div>
                    </Col>
                  ))}
                </Row>
              </div>
            )
          }}
        />
      </Card>
    </div>
  )
}
