const API_BASE = '/api'

async function request(url, options = {}) {
  try {
    const response = await fetch(`${API_BASE}${url}`, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options
    })
    const data = await response.json()
    return data
  } catch (err) {
    console.error('[API] 请求失败:', err.message)
    return { success: false, message: '网络请求失败，请检查后端服务是否启动' }
  }
}

export const datasourceAPI = {
  getAll: () => request('/datasource'),
  getStatus: () => request('/datasource/status'),
  create: (data) => request('/datasource', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/datasource/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/datasource/${id}`, { method: 'DELETE' }),
  connect: (id) => request(`/datasource/${id}/connect`, { method: 'POST' }),
  disconnect: (id) => request(`/datasource/${id}/disconnect`, { method: 'POST' }),
  sync: (id) => request(`/datasource/${id}/sync`, { method: 'POST' })
}

export const overviewAPI = {
  getDashboard: (params = {}) => {
    const query = new URLSearchParams(params).toString()
    return request(`/overview/dashboard${query ? '?' + query : ''}`)
  },
  getTrend: (params = {}) => {
    const query = new URLSearchParams(params).toString()
    return request(`/overview/trend${query ? '?' + query : ''}`)
  },
  getStore: (params = {}) => {
    const query = new URLSearchParams(params).toString()
    return request(`/overview/store${query ? '?' + query : ''}`)
  },
  getCategory: (params = {}) => {
    const query = new URLSearchParams(params).toString()
    return request(`/overview/category${query ? '?' + query : ''}`)
  },
  getReports: (params = {}) => {
    const query = new URLSearchParams(params).toString()
    return request(`/overview/reports${query ? '?' + query : ''}`)
  },
  generateReport: (data) => request('/overview/reports/generate', { method: 'POST', body: JSON.stringify(data) }),
  getCalendar: (params = {}) => {
    const query = new URLSearchParams(params).toString()
    return request(`/overview/calendar${query ? '?' + query : ''}`)
  }
}

export const monitorAPI = {
  getRules: () => request('/monitor/rules'),
  createRule: (data) => request('/monitor/rules', { method: 'POST', body: JSON.stringify(data) }),
  updateRule: (id, data) => request(`/monitor/rules/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteRule: (id) => request(`/monitor/rules/${id}`, { method: 'DELETE' }),
  getEvents: (params = {}) => {
    const query = new URLSearchParams(params).toString()
    return request(`/monitor/events${query ? '?' + query : ''}`)
  },
  resolveEvent: (id) => request(`/monitor/events/${id}/resolve`, { method: 'PUT' }),
  getStats: () => request('/monitor/stats'),
  runCheck: () => request('/monitor/check', { method: 'POST' })
}

export const agentAPI = {
  getTasks: (params = {}) => {
    const query = new URLSearchParams(params).toString()
    return request(`/agent/tasks${query ? '?' + query : ''}`)
  },
  analyze: (eventId) => request(`/agent/analyze/${eventId}`, { method: 'POST' }),
  getEventDetail: (eventId) => request(`/agent/events/${eventId}/detail`),
  getStats: () => request('/agent/stats')
}

export const chatAPI = {
  getHistory: (params = {}) => {
    const query = new URLSearchParams(params).toString()
    return request(`/chat/history${query ? '?' + query : ''}`)
  },
  send: (message) => request('/chat/send', { method: 'POST', body: JSON.stringify({ message }) }),
  clearHistory: () => request('/chat/history', { method: 'DELETE' })
}
