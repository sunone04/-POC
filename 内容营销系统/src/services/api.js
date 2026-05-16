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

export const aiAPI = {
  generateArticle: (params) => request('/ai/generate/article', { method: 'POST', body: JSON.stringify(params) }),
  generateImage: (params) => request('/ai/generate/image', { method: 'POST', body: JSON.stringify(params) }),
  generateVideo: (params) => request('/ai/generate/video', { method: 'POST', body: JSON.stringify(params) }),
  getStatus: () => request('/ai/status')
}

export const contentAPI = {
  getAll: () => request('/content'),
  getOne: (id) => request(`/content/${id}`),
  create: (data) => request('/content', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/content/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/content/${id}`, { method: 'DELETE' })
}

export const taskAPI = {
  getAll: () => request('/tasks'),
  getOne: (id) => request(`/tasks/${id}`),
  create: (data) => request('/tasks', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/tasks/${id}`, { method: 'DELETE' }),
  runNow: (id) => request(`/tasks/${id}/run`, { method: 'POST' })
}

export const calendarAPI = {
  getAll: () => request('/calendar'),
  getUpcoming: () => request('/calendar/upcoming'),
  getNearest: () => request('/calendar/nearest'),
  create: (data) => request('/calendar', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/calendar/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/calendar/${id}`, { method: 'DELETE' })
}

export const knowledgeAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString()
    return request(`/knowledge${query ? '?' + query : ''}`)
  },
  getCategories: () => request('/knowledge/categories'),
  getOne: (id) => request(`/knowledge/${id}`),
  create: (data) => request('/knowledge', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/knowledge/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/knowledge/${id}`, { method: 'DELETE' })
}

export const analyticsAPI = {
  getOverview: () => request('/analytics/overview'),
  getContent: (params = {}) => {
    const query = new URLSearchParams(params).toString()
    return request(`/analytics/content${query ? '?' + query : ''}`)
  },
  analyzeContent: (id) => request(`/analytics/analyze/${id}`, { method: 'POST' }),
  depositInsight: (id) => request(`/analytics/insights/${id}/deposit`, { method: 'POST' })
}
