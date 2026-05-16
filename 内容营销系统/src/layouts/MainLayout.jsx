import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu, Typography, Avatar, Badge, Dropdown, Space } from 'antd'
import {
  DashboardOutlined,
  EditOutlined,
  PictureOutlined,
  VideoCameraOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  BookOutlined,
  BarChartOutlined,
  BellOutlined,
  SettingOutlined,
  UserOutlined,
  ThunderboltOutlined
} from '@ant-design/icons'

const { Header, Sider, Content } = Layout
const { Title } = Typography

const menuItems = [
  {
    key: '/',
    icon: <DashboardOutlined />,
    label: '总览仪表盘'
  },
  {
    key: 'creation',
    icon: <EditOutlined />,
    label: '创作工作台',
    children: [
      { key: '/creation/text', icon: <EditOutlined />, label: '文章创作' },
      { key: '/creation/image', icon: <PictureOutlined />, label: '图文创作' },
      { key: '/creation/video', icon: <VideoCameraOutlined />, label: '视频创作' }
    ]
  },
  {
    key: 'rule',
    icon: <ThunderboltOutlined />,
    label: '规则触发引擎',
    children: [
      { key: '/rule/scheduled', icon: <ClockCircleOutlined />, label: '定时任务' },
      { key: '/rule/calendar', icon: <CalendarOutlined />, label: '营销节点日历' }
    ]
  },
  {
    key: '/knowledge',
    icon: <BookOutlined />,
    label: '营销知识库'
  },
  {
    key: '/analytics',
    icon: <BarChartOutlined />,
    label: '数据分析'
  }
]

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const getOpenKeys = () => {
    if (location.pathname.startsWith('/creation')) return ['creation']
    if (location.pathname.startsWith('/rule')) return ['rule']
    return []
  }

  const handleMenuClick = ({ key }) => {
    navigate(key)
  }

  const userMenuItems = [
    { key: 'profile', icon: <UserOutlined />, label: '个人信息' },
    { key: 'settings', icon: <SettingOutlined />, label: '系统设置' }
  ]

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={240}
        style={{
          background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)',
          boxShadow: '2px 0 8px rgba(0,0,0,0.15)'
        }}
        theme="dark"
      >
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: 'linear-gradient(135deg, #e63946, #ff6b6b)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 700,
            fontSize: 18,
            marginRight: collapsed ? 0 : 12,
            fontFamily: 'serif'
          }}>
            亚
          </div>
          {!collapsed && (
            <Title level={5} style={{ color: '#fff', margin: 0, whiteSpace: 'nowrap' }}>
              亚细亚营销系统
            </Title>
          )}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          defaultOpenKeys={getOpenKeys()}
          items={menuItems}
          onClick={handleMenuClick}
          style={{
            background: 'transparent',
            borderRight: 0
          }}
        />
      </Sider>
      <Layout>
        <Header style={{
          padding: '0 24px',
          background: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
          zIndex: 10
        }}>
          <Title level={4} style={{ margin: 0, color: '#1a1a2e' }}>
            内容营销系统
          </Title>
          <Space size={20}>
            <Badge count={5} size="small">
              <BellOutlined style={{ fontSize: 18, cursor: 'pointer', color: '#595959' }} />
            </Badge>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Space style={{ cursor: 'pointer' }}>
                <Avatar style={{ background: '#e63946' }} icon={<UserOutlined />} />
                <span style={{ color: '#333' }}>管理员</span>
              </Space>
            </Dropdown>
          </Space>
        </Header>
        <Content style={{
          margin: 16,
          padding: 24,
          background: '#f5f5f5',
          borderRadius: 8,
          overflow: 'auto'
        }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
