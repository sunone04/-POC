import { useState, useEffect, useRef } from 'react'
import {
  Card, Typography, Space, Button, Input, Avatar, Tag,
  message, Spin, Empty, Tooltip, Divider
} from 'antd'
import {
  RobotOutlined, SendOutlined, DeleteOutlined,
  UserOutlined, MessageOutlined, ReloadOutlined,
  BulbOutlined, BarChartOutlined, AlertOutlined,
  ShopOutlined, DatabaseOutlined
} from '@ant-design/icons'
import { chatAPI } from '../services/api'

const { Title, Text, Paragraph } = Typography
const { TextArea } = Input

const quickQuestions = [
  { icon: <BarChartOutlined />, text: '今日经营数据如何？', color: '#1677ff' },
  { icon: <AlertOutlined />, text: '当前有哪些异常预警？', color: '#ff4d4f' },
  { icon: <BulbOutlined />, text: '给我一些经营建议', color: '#fa8c16' },
  { icon: <ShopOutlined />, text: '各门店经营情况如何？', color: '#52c41a' },
  { icon: <DatabaseOutlined />, text: '库存周转率怎么样？', color: '#722ed1' },
  { icon: <BarChartOutlined />, text: '会员营收占比多少？', color: '#13c2c2' }
]

export default function AgentChat() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    loadHistory()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadHistory = async () => {
    setLoading(true)
    const res = await chatAPI.getHistory({ limit: 50 })
    if (res.success) {
      setMessages(res.data.map(m => ({
        role: m.role,
        content: m.content,
        time: m.created_at
      })))
    }
    setLoading(false)
  }

  const handleSend = async (text) => {
    const msg = text || input.trim()
    if (!msg) return

    setMessages(prev => [...prev, { role: 'user', content: msg, time: new Date().toLocaleString() }])
    setInput('')
    setSending(true)

    const res = await chatAPI.send(msg)
    if (res.success) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: res.data.reply,
        time: new Date().toLocaleString()
      }])
    } else {
      message.error('发送失败，请重试')
    }
    setSending(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleClear = async () => {
    const res = await chatAPI.clearHistory()
    if (res.success) {
      setMessages([])
      message.success('对话历史已清除')
    }
  }

  return (
    <div>
      <Card
        className="content-card"
        style={{ height: 'calc(100vh - 140px)', display: 'flex', flexDirection: 'column' }}
        bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}
      >
        <div style={{
          padding: '12px 20px',
          borderBottom: '1px solid #f0f0f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #f0f5ff, #fff)'
        }}>
          <Space>
            <Avatar style={{ background: 'linear-gradient(135deg, #722ed1, #1677ff)' }} icon={<RobotOutlined />} />
            <div>
              <Text strong style={{ fontSize: 15 }}>亚细亚经营分析助手</Text>
              <div><Text type="secondary" style={{ fontSize: 12 }}>基于经营数据的智能对话，具备上下文记忆</Text></div>
            </div>
          </Space>
          <Space>
            <Tooltip title="刷新对话">
              <Button icon={<ReloadOutlined />} size="small" onClick={loadHistory} />
            </Tooltip>
            <Tooltip title="清除对话">
              <Button icon={<DeleteOutlined />} size="small" danger onClick={handleClear} />
            </Tooltip>
          </Space>
        </div>

        <div className="chat-messages" style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <RobotOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />
              <Title level={4} style={{ color: '#8c8c8c', marginTop: 16 }}>
                您好，我是亚细亚经营分析助手
              </Title>
              <Text type="secondary" style={{ fontSize: 15 }}>
                我可以帮您分析经营数据、解答经营问题、提供决策建议
              </Text>
              <div style={{ marginTop: 32, maxWidth: 600, margin: '32px auto 0' }}>
                <Text type="secondary" style={{ fontSize: 13, marginBottom: 12, display: 'block' }}>
                  您可以试试以下问题：
                </Text>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
                  {quickQuestions.map((q, i) => (
                    <Button
                      key={i}
                      icon={q.icon}
                      onClick={() => handleSend(q.text)}
                      style={{
                        borderRadius: 20,
                        border: `1px solid ${q.color}30`,
                        color: q.color,
                        background: `${q.color}08`
                      }}
                    >
                      {q.text}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div key={idx} className={`chat-message ${msg.role}`}>
              <div className="avatar">
                {msg.role === 'user' ? <UserOutlined /> : <RobotOutlined />}
              </div>
              <div>
                <div className="bubble">{msg.content}</div>
                <Text type="secondary" style={{ fontSize: 11, marginTop: 4, display: 'block' }}>
                  {msg.time}
                </Text>
              </div>
            </div>
          ))}

          {sending && (
            <div className="chat-message assistant">
              <div className="avatar">
                <RobotOutlined />
              </div>
              <div className="bubble" style={{ background: '#f0f5ff', border: '1px solid #d6e4ff' }}>
                <Spin size="small" /> <Text type="secondary">正在分析经营数据...</Text>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-area">
          {messages.length === 0 && (
            <div style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {quickQuestions.slice(0, 3).map((q, i) => (
                  <Tag
                    key={i}
                    style={{ cursor: 'pointer', borderRadius: 12, padding: '2px 10px' }}
                    color="blue"
                    onClick={() => handleSend(q.text)}
                  >
                    {q.icon} {q.text}
                  </Tag>
                ))}
              </div>
            </div>
          )}
          <div style={{ display: 'flex', gap: 8 }}>
            <TextArea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入您关于经营情况的问题...（Enter发送，Shift+Enter换行）"
              autoSize={{ minRows: 1, maxRows: 4 }}
              style={{ flex: 1, borderRadius: 8 }}
              disabled={sending}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={() => handleSend()}
              loading={sending}
              disabled={!input.trim()}
              style={{ borderRadius: 8, height: 40, width: 40 }}
            />
          </div>
        </div>
      </Card>
    </div>
  )
}
