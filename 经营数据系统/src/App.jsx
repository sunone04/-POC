import { Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import DataManagement from './pages/DataManagement'
import BusinessOverview from './pages/BusinessOverview'
import AnomalyMonitor from './pages/AnomalyMonitor'
import AgentReasoning from './pages/AgentReasoning'
import AgentChat from './pages/AgentChat'

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Navigate to="/overview" replace />} />
        <Route path="overview" element={<BusinessOverview />} />
        <Route path="data" element={<DataManagement />} />
        <Route path="monitor" element={<AnomalyMonitor />} />
        <Route path="agent" element={<AgentReasoning />} />
        <Route path="chat" element={<AgentChat />} />
        <Route path="*" element={<Navigate to="/overview" replace />} />
      </Route>
    </Routes>
  )
}

export default App
