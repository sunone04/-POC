import { Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import Dashboard from './pages/Dashboard'
import TextCreation from './pages/CreationWorkbench/TextCreation'
import ImageCreation from './pages/CreationWorkbench/ImageCreation'
import VideoCreation from './pages/CreationWorkbench/VideoCreation'
import ScheduledTasks from './pages/RuleEngine/ScheduledTasks'
import MarketingCalendar from './pages/RuleEngine/MarketingCalendar'
import KnowledgeBase from './pages/KnowledgeBase'
import DataAnalytics from './pages/DataAnalytics'

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="creation/text" element={<TextCreation />} />
        <Route path="creation/image" element={<ImageCreation />} />
        <Route path="creation/video" element={<VideoCreation />} />
        <Route path="rule/scheduled" element={<ScheduledTasks />} />
        <Route path="rule/calendar" element={<MarketingCalendar />} />
        <Route path="knowledge" element={<KnowledgeBase />} />
        <Route path="analytics" element={<DataAnalytics />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default App
