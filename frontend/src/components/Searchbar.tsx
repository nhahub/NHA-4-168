import { Bell, BusFront, GraduationCap, HelpCircle, Loader2, Menu, MapPinned, Search, Settings } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { isAdmin } from '../utils/auth'
import { studentService } from '../services/api/studentService'
import type { StudentListItemDto } from '../services/api/studentService'
import { driverService } from '../services/api/driverService'
import type { DriverDto } from '../services/api/driverService'
import { tripService } from '../services/api/tripService'
import type { TripDto } from '../services/api/tripService'

type SearchbarProps = {
  query: string
  onQueryChange: (value: string) => void
  onMenuClick: () => void
}

type ResultGroup = {
  label: string
  icon: typeof GraduationCap
  items: { key: string; title: string; subtitle: string; to: string }[]
}

function Searchbar({ query, onQueryChange, onMenuClick }: SearchbarProps) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const canSeeStudents = isAdmin(user?.roles)

  const [isOpen, setIsOpen] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [groups, setGroups] = useState<ResultGroup[]>([])
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const term = query.trim()

    if (term.length < 2) {
      setGroups([])
      setIsOpen(false)
      return
    }

    let active = true
    setIsSearching(true)

    const timeoutId = window.setTimeout(async () => {
      try {
        const lowerTerm = term.toLowerCase()

        const [studentResults, driverResults, tripResults] = await Promise.all([
          canSeeStudents
            ? studentService
                .getStudents({ page: 1, pageSize: 5, search: term })
                .then((res) => res.data)
                .catch(() => [] as StudentListItemDto[])
            : Promise.resolve([] as StudentListItemDto[]),
          driverService
            .getDrivers({ page: 1, pageSize: 1000, search: undefined })
            .then((res) =>
              (res.data || []).filter((driver) =>
                [driver.firstName, driver.lastName, driver.licenseNumber, driver.phone || '', driver.carModel || '', driver.carPlate || '']
                  .join(' ')
                  .toLowerCase()
                  .includes(lowerTerm),
              ),
            )
            .catch(() => [] as DriverDto[]),
          tripService
            .getTrips()
            .then((trips) =>
              trips.filter((trip) =>
                [trip.destination, trip.pickupArea, trip.driverName].join(' ').toLowerCase().includes(lowerTerm),
              ),
            )
            .catch(() => [] as TripDto[]),
        ])

        if (!active) return

        const nextGroups: ResultGroup[] = []

        if (studentResults.length > 0) {
          nextGroups.push({
            label: 'Students',
            icon: GraduationCap,
            items: studentResults.slice(0, 5).map((student) => ({
              key: `student-${student.studentSsn}`,
              title: `${student.firstName} ${student.lastName}`,
              subtitle: student.email,
              to: `/students/${student.studentSsn}`,
            })),
          })
        }

        if (driverResults.length > 0) {
          nextGroups.push({
            label: 'Drivers',
            icon: BusFront,
            items: driverResults.slice(0, 5).map((driver) => ({
              key: `driver-${driver.driverSsn}`,
              title: `${driver.firstName} ${driver.lastName}`,
              subtitle: driver.licenseNumber,
              to: `/drivers/${driver.driverSsn}`,
            })),
          })
        }

        if (tripResults.length > 0) {
          nextGroups.push({
            label: 'Trips',
            icon: MapPinned,
            items: tripResults.slice(0, 5).map((trip) => ({
              key: `trip-${trip.tripId}`,
              title: `${trip.destination} · ${trip.pickupArea}`,
              subtitle: `Driver: ${trip.driverName}`,
              to: `/trips/${trip.tripId}`,
            })),
          })
        }

        setGroups(nextGroups)
        setIsOpen(true)
      } finally {
        if (active) setIsSearching(false)
      }
    }, 300)

    return () => {
      active = false
      window.clearTimeout(timeoutId)
    }
  }, [query, canSeeStudents])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const goTo = (to: string) => {
    setIsOpen(false)
    onQueryChange('')
    navigate(to)
  }

  const hasResults = groups.some((group) => group.items.length > 0)

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

          <div ref={containerRef} className="relative w-full max-w-2xl">
            {isSearching ? (
              <Loader2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-on-surface-variant" />
            ) : (
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
            )}
            <input
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              onFocus={() => {
                if (hasResults) setIsOpen(true)
              }}
              className="w-full rounded-lg border border-transparent bg-surface-container-low py-2 pl-10 pr-4 text-[14px] leading-5 text-on-surface outline-none transition focus:border-input-border-focus focus:bg-white focus:shadow-[0_0_0_3px_rgba(0,88,190,0.15)]"
              placeholder="Search students, drivers, or trips..."
              type="search"
            />

            {isOpen ? (
              <div className="absolute left-0 right-0 top-full z-40 mt-2 max-h-[70vh] overflow-y-auto rounded-lg border border-outline-variant bg-white shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)]">
                {!hasResults ? (
                  <p className="p-4 text-body-sm text-on-surface-variant">
                    {isSearching ? 'Searching...' : 'No matches found.'}
                  </p>
                ) : (
                  groups.map((group) => (
                    <div key={group.label} className="border-b border-outline-variant last:border-b-0">
                      <p className="px-4 pt-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-on-surface-variant">
                        {group.label}
                      </p>
                      <ul className="pb-2">
                        {group.items.map((item) => {
                          const Icon = group.icon
                          return (
                            <li key={item.key}>
                              <button
                                type="button"
                                onClick={() => goTo(item.to)}
                                className="flex w-full items-center gap-3 px-4 py-2 text-left hover:bg-surface-container-low"
                              >
                                <Icon className="h-4 w-4 shrink-0 text-on-surface-variant" />
                                <span className="min-w-0">
                                  <span className="block truncate text-body-sm font-semibold text-on-surface">{item.title}</span>
                                  <span className="block truncate text-body-sm text-on-surface-variant">{item.subtitle}</span>
                                </span>
                              </button>
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  ))
                )}
              </div>
            ) : null}
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

export default Searchbar