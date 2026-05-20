import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useThemeStore } from './store/themeStore'
import LandingPage from './components/pages/LandingPage'
import DashboardPage from './components/pages/DashboardPage'
import UploadPage from './components/pages/UploadPage'
import RoadmapPage from './components/pages/RoadmapPage'
import MindmapPage from './components/pages/MindmapPage'
import MCQPage from './components/pages/MCQPage'
import TasksPage from './components/pages/TasksPage'
import KeywordsPage from './components/pages/KeywordsPage'
import RefsPage from './components/pages/RefsPage'
import AppLayout from './components/layout/AppLayout'

export default function App() {
  const { dark } = useThemeStore()
  return (
    <div className={dark ? 'dark' : ''}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/roadmap" element={<RoadmapPage />} />
            <Route path="/mindmap" element={<MindmapPage />} />
            <Route path="/mcq" element={<MCQPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/keywords" element={<KeywordsPage />} />
            <Route path="/refs" element={<RefsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  )
}
