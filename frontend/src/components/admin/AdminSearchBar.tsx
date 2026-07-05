import { Bell, HelpCircle, Menu, Search, Settings } from 'lucide-react'

type AdminSearchBarProps = {
  query: string
  onQueryChange: (value: string) => void
  onMenuClick: () => void
}

function AdminSearchBar({ query, onQueryChange, onMenuClick }: AdminSearchBarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-outline-variant bg-surface/95 backdrop-blur">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:pl-[calc(280px+24px)] lg:pr-6">
        <div className="flex flex-1 items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-low lg:hidden"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="relative w-full max-w-2xl">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
            <input
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              className="w-full rounded-lg border border-transparent bg-surface-container-low py-2 pl-10 pr-4 text-[14px] leading-5 text-on-surface outline-none transition focus:border-input-border-focus focus:bg-white focus:shadow-[0_0_0_3px_rgba(0,88,190,0.15)]"
              placeholder="Search student ID, payment ref, or course name..."
              type="search"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 text-on-surface-variant">
          <button type="button" className="rounded-full p-2 transition-colors hover:bg-surface-container-low" aria-label="Notifications">
            <Bell className="h-5 w-5" />
          </button>
          <button type="button" className="rounded-full p-2 transition-colors hover:bg-surface-container-low" aria-label="Help">
            <HelpCircle className="h-5 w-5" />
          </button>
          <button type="button" className="rounded-full p-2 transition-colors hover:bg-surface-container-low" aria-label="Settings">
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  )
}

export default AdminSearchBar