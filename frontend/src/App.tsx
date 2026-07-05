import { useState } from 'react'
import { AdminSearchBar, AdminSidebar } from './components/admin'
import AdminDashboardPage from './pages/AdminDashboardPage'

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="min-h-svh bg-background text-on-surface">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <AdminSearchBar query={searchQuery} onQueryChange={setSearchQuery} onMenuClick={() => setSidebarOpen(true)} />
      <AdminDashboardPage />
    </div>
  )
}

export default App