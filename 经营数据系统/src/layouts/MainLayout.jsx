import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu, Typography, Avatar, Badge, Dropdown, Space, Breadcrumb } from 'antd'
import {
  DatabaseOutlined,
  DashboardOutlined,
  AlertOutlined,
  RobotOutlined,
  MessageOutlined,
  BellOutlined,
  SettingOutlined,
  UserOutlined,
  ThunderboltOutlined,
  HomeOutlined,
  BranchesOutlined
} from '@ant-design/icons'

const { Header, Sider, Content } = Layout
const { Title, Text } = Typography

const menuItems = [
  {
    key: '/overview',
    icon: <DashboardOutlined />,
    label: '经营总览'
  },
  {
    key: '/data',
    icon: <DatabaseOutlined />,
    label: '数据管理'
  },
  {
    key: 'monitor-group',
    icon: <AlertOutlined />,
    label: '智能分析',
    children: [
      { key: '/monitor', icon: <AlertOutlined />, label: '异常监控' },
      { key: '/agent', icon: <BranchesOutlined />, label: 'Agent归因推理' }
    ]
  },
  {
    key: '/chat',
    icon: <MessageOutlined />,
    label: 'Agent智能对话'
  }
]

const breadcrumbMap = {
  '/overview': [{ title: '首页' }, { title: '经营总览' }],
  '/data': [{ title: '首页' }, { title: '数据管理' }],
  '/monitor': [{ title: '首页' }, { title: '智能分析' }, { title: '异常监控' }],
  '/agent': [{ title: '首页' }, { title: '智能分析' }, { title: 'Agent归因推理' }],
  '/chat': [{ title: '首页' }, { title: 'Agent智能对话' }]
}

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const getOpenKeys = () => {
    if (location.pathname.startsWith('/monitor') || location.pathname.startsWith('/agent')) return ['monitor-group']
    return []
  }

  const handleMenuClick = ({ key }) => {
    navigate(key)
  }

  const userMenuItems = [
    { key: 'profile', icon: <UserOutlined />, label: '个人信息' },
    { key: 'settings', icon: <SettingOutlined />, label: '系统设置' }
  ]

  const breadcrumbs = breadcrumbMap[location.pathname] || [{ title: '首页' }]

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={240}
        style={{
          background: 'linear-gradient(180deg, #001529 0%, #002140 50%, #001529 100%)',
          boxShadow: '2px 0 8px rgba(0,0,0,0.15)',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
          overflow: 'auto'
        }}
        theme="dark"
      >
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          padding: '0 16px'
        }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #1677ff, #69b1ff)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 700,
            fontSize: 18,
            marginRight: collapsed ? 0 : 12,
            fontFamily: 'serif',
            flexShrink: 0
          }}>
            亚
          </div>
          {!collapsed && (
            <div style={{ overflow: 'hidden' }}>
              <div style={{ color: '#fff', fontWeight: 600, fontSize: 15, whiteSpace: 'nowrap' }}>
                亚细亚经营分析
              </div>
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, whiteSpace: 'nowrap' }}>
                Business Intelligence
              </div>
            </div>
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
            borderRight: 0,
            marginTop: 8
          }}
        />

        {!collapsed && (
          <div style={{
            position: 'absolute',
            bottom: 16,
            left: 0,
            right: 0,
            padding: '0 16px'
          }}>
            <div style={{
              padding: '12px',
              background: 'rgba(255,255,255,0.04)',
              borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.06)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <ThunderboltOutlined style={{ color: '#52c41a', fontSize: 12 }} />
                <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 11 }}>系统状态</Text>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Badge status="success" />
                <Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11 }}>所有服务运行正常</Text>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                <Badge count={3} size="small" style={{ backgroundColor: '#faad14' }} />
                <Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11 }}>3个活跃预警</Text>
              </div>
            </div>
          </div>
        )}
      </Sider>
      <Layout style={{ marginLeft: collapsed ? 80 : 240, transition: 'margin-left 0.2s' }}>
        <Header style={{
          padding: '0 24px',
          background: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          zIndex: 10,
          position: 'sticky',
          top: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Breadcrumb
              items={breadcrumbs.map((item, idx) => ({
                title: idx === 0
                  ? <span style={{ cursor: 'pointer' }} onClick={() => navigate('/overview')}><HomeOutlined /> {item.title}</span>
                  : item.title
              }))}
            />
          </div>
          <Space size={20}>
            <Badge count={3} size="small">
              <BellOutlined style={{ fontSize: 18, cursor: 'pointer', color: '#595959' }} />
            </Badge>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Space style={{ cursor: 'pointer' }}>
                <Avatar size={32} style={{ background: 'linear-gradient(135deg, #1677ff, #69b1ff)' }} icon={<UserOutlined />} />
                <div>
                  <div style={{ fontSize: 13, color: '#333', lineHeight: 1.2 }}>管理员</div>
                  <div style={{ fontSize: 11, color: '#8c8c8c', lineHeight: 1.2 }}>超级管理员</div>
                </div>
              </Space>
            </Dropdown>
          </Space>
        </Header>
        <Content style={{
          margin: 16,
          padding: 20,
          background: '#f0f2f5',
          borderRadius: 8,
          overflow: 'auto',
          minHeight: 'calc(100vh - 80px)'
        }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
