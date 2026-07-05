import { BusFront, BookOpen, GraduationCap, LayoutDashboard, LifeBuoy, Users, Wallet, X } from 'lucide-react'

type AdminSidebarProps = {
  isOpen: boolean
  onClose: () => void
}

const navigationItems = [
  { label: 'Dashboard', icon: LayoutDashboard, active: true },
  { label: 'Students', icon: GraduationCap },
  { label: 'Instructors', icon: Users },
  { label: 'Courses', icon: BookOpen },
  { label: 'Enrollments', icon: BookOpen },
  { label: 'Payments', icon: Wallet },
  { label: 'Services', icon: LifeBuoy },
  { label: 'Drivers', icon: BusFront },
  { label: 'Ride Bookings', icon: BusFront },
]

function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
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
              {navigationItems.map((item) => {
                const Icon = item.icon

                return (
                  <li key={item.label}>
                    <a
                      href="#"
                      className={`flex items-center gap-3 border-l-4 px-6 py-3 transition-colors ${item.active ? 'border-secondary bg-white/10 text-on-primary font-semibold' : 'border-transparent text-sidebar-inactive hover:bg-white/5 hover:text-on-primary'}`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="text-[12px] font-semibold uppercase tracking-[0.08em]">{item.label}</span>
                    </a>
                  </li>
                )
              })}
            </ul>
          </nav>

          <div className="mt-auto p-6">
            <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/20 text-sm font-semibold text-on-primary">
                AM
              </div>
              <div className="min-w-0 overflow-hidden">
                <p className="truncate text-[14px] font-bold leading-5 text-on-primary">Alex Morgan</p>
                <p className="text-[11px] uppercase tracking-[0.12em] text-on-primary-container/80">Super Admin</p>
              </div>
            </div>
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

export default AdminSidebar