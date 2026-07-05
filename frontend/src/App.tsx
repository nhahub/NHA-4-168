import { useState } from 'react'
import { Searchbar, Sidebar } from './components'
import AdminDashboardPage from './pages/AdminDashboardPage'

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="min-h-svh bg-background text-on-surface">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Searchbar query={searchQuery} onQueryChange={setSearchQuery} onMenuClick={() => setSidebarOpen(true)} />
      <AdminDashboardPage />
    </div>
  )
}

export default App