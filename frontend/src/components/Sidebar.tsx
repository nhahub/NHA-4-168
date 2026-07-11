import { BusFront, BookOpen, GraduationCap, LayoutDashboard, LifeBuoy, LogOut, Users, Wallet, X } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { isAdmin } from '../utils/auth'

type SidebarProps = {
  isOpen: boolean
  onClose: () => void
}

const navigationItems = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/admin', enabled: true, adminOnly: true },
  { label: 'Students', icon: GraduationCap, to: '/students', enabled: true, adminOnly: true },
  { label: 'Instructors', icon: Users, to: '/instructors', enabled: false, adminOnly: true },
  { label: 'Courses', icon: BookOpen, to: '/courses', enabled: false, adminOnly: true },
  { label: 'Enrollments', icon: BookOpen, to: '/enrollments', enabled: false, adminOnly: true },
  { label: 'Payments', icon: Wallet, to: '/payments', enabled: false, adminOnly: true },
  { label: 'Services', icon: LifeBuoy, to: '/services', enabled: false, adminOnly: true },
  { label: 'Drivers', icon: BusFront, to: '/drivers', enabled: true, adminOnly: false },
  { label: 'Trips', icon: BusFront, to: '/trips', enabled: true, adminOnly: false },
]

function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const firstName = user?.firstName || user?.email?.split('@')[0] || 'User'
  const lastName = user?.lastName || ''
  const displayName = `${firstName}${lastName ? ' ' + lastName : ''}`
  const roleLabel = user?.roles?.join(', ') || 'User'
  const avatarChar = firstName.charAt(0).toUpperCase()
  const canAccessAdminViews = isAdmin(user?.roles)
  const visibleNavigationItems = navigationItems.filter((item) => !item.adminOnly || canAccessAdminViews)

  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[280px] bg-primary text-on-primary shadow-[0_20px_40px_rgba(2,6,23,0.24)] transition-transform duration-300 ease-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex h-full flex-col overflow-hidden">
          <div className="flex items-start justify-between gap-4 px-6 py-8 lg:items-center">
            <div>
              <h1 className="text-[24px] font-bold leading-8 tracking-tight text-on-primary">EduManager</h1>
              <p className="mt-1 text-[14px] leading-5 text-on-primary-container/80">Administration Portal</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-on-primary-container transition-colors hover:bg-white/10 lg:hidden"
              aria-label="Close navigation menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-2 pb-6">
            <ul className="space-y-1">
              {visibleNavigationItems.map((item) => {
                const Icon = item.icon
                const active = location.pathname === item.to || location.pathname.startsWith(`${item.to}/`)

                return (
                  <li key={item.label}>
                    {item.enabled ? (
                      <Link
                        to={item.to}
                        onClick={onClose}
                        className={`flex items-center gap-3 border-l-4 px-6 py-3 transition-colors ${active ? 'border-secondary bg-white/10 text-on-primary font-semibold' : 'border-transparent text-sidebar-inactive hover:bg-white/5 hover:text-on-primary'}`}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="text-[12px] font-semibold uppercase tracking-[0.08em]">{item.label}</span>
                      </Link>
                    ) : (
                      <div className="flex cursor-not-allowed items-center gap-3 border-l-4 border-transparent px-6 py-3 text-sidebar-inactive/45">
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="text-[12px] font-semibold uppercase tracking-[0.08em]">{item.label}</span>
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          </nav>

          <div className="mt-auto space-y-2 p-6">
            <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/20 text-sm font-semibold text-on-primary">
                {avatarChar}
              </div>
              <div className="min-w-0 overflow-hidden">
                <p className="truncate text-[14px] font-bold leading-5 text-on-primary">{displayName}</p>
                <p className="truncate text-[11px] uppercase tracking-[0.12em] text-on-primary-container/80">{roleLabel}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-error px-4 py-2 text-[13px] font-semibold text-on-error transition-opacity hover:opacity-90"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {isOpen ? (
        <button
          type="button"
          aria-label="Close navigation overlay"
          onClick={onClose}
          className="fixed inset-0 z-40 cursor-default bg-slate-950/40 lg:hidden"
        />
      ) : null}
    </>
  )
}

export default Sidebar
