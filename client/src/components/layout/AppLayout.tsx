import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useThemeStore } from '../../store/themeStore'

const NAV = [
  { to: '/upload', icon: '↑', label: 'Upload PDF', section: 'Study' },
  { to: '/dashboard', icon: '⚃', label: 'Dashboard', section: 'Study' },
  { to: '/roadmap', icon: '→', label: 'Roadmap', section: 'Study' },
  { to: '/mindmap', icon: '⬡', label: 'Mindmap', section: 'Study' },
  { to: '/mcq', icon: '✓', label: 'MCQ test', section: 'Practice' },
  { to: '/tasks', icon: '☑', label: 'Tasks', section: 'Practice' },
  { to: '/refs', icon: '↗', label: 'Web refs', section: 'Reference' },
  { to: '/keywords', icon: '#', label: 'Keywords', section: 'Reference' },

]

export default function AppLayout() {
  const { dark, toggle } = useThemeStore()
  const navigate = useNavigate()

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#0e0e10] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-48 bg-white dark:bg-[#111112] border-r border-black/[0.07] dark:border-white/[0.07] flex flex-col shrink-0">
        <div className="h-14 flex items-center gap-2.5 px-4 border-b border-black/[0.07] dark:border-white/[0.07] cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-7 h-7 rounded-lg bg-orange-400 flex items-center justify-center text-white text-sm font-medium">P</div>
          <div>
            <div className="text-sm font-medium dark:text-gray-50">PrepWise</div>
            <div className="text-[10px] text-gray-400">AI study companion</div>
          </div>
        </div>
        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
          {['Study','Practice','Reference'].map(section => (
            <div key={section}>
              <div className="text-[10px] font-medium text-gray-400 px-2 py-2 uppercase tracking-widest">{section}</div>
              {NAV.filter(n => n.section === section).map(n => (
                <NavLink key={n.to} to={n.to} className={({ isActive }) =>
                  `flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs transition-colors ${isActive
                    ? 'bg-orange-50 dark:bg-orange-900 text-orange-600 dark:text-orange-300 font-medium'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-800 dark:hover:text-gray-200'}`
                }>
                  <span>{n.icon}</span>{n.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <div className="p-3 border-t border-black/[0.07] dark:border-white/[0.07]">
          <button onClick={toggle} className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
            {dark ? '☀ Light mode' : '☾ Dark mode'}
          </button>
        </div>
      </aside>
      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
