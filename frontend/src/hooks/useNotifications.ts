import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { isAdmin } from '../utils/auth'
import { driverService } from '../services/api/driverService'
import { studentService } from '../services/api/studentService'
import { tripService } from '../services/api/tripService'
import paymentService from '../services/api/paymentService'
import { loadTripSuggestions } from '../utils/tripSuggestions'

export type NotificationItem = {
  id: string
  text: string
}

const SEEN_KEY = 'notifications_seen_ids'

function getSeenIds(): string[] {
  try {
    const raw = localStorage.getItem(SEEN_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

export function useNotifications() {
  const { user } = useAuth()
  const canSeeAdminNotifications = isAdmin(user?.roles)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [seenIds, setSeenIds] = useState<string[]>(getSeenIds)

  useEffect(() => {
    let active = true

    const refreshAdmin = async () => {
      const items: NotificationItem[] = []

      const suggestions = loadTripSuggestions()
      suggestions.forEach((suggestion) => {
        items.push({
          id: `suggestion-${suggestion.id}`,
          text: `New trip suggestion: ${suggestion.destination} · ${suggestion.pickupArea} (by ${suggestion.submittedByName})`,
        })
      })

      try {
        const driversRes = await driverService.getDrivers({ page: 1, pageSize: 1000, search: undefined })
        const suspended = (driversRes.data || []).filter((driver) => driver.status === 'Suspended')
        suspended.forEach((driver) => {
          items.push({
            id: `driver-${driver.driverSsn}`,
            text: `Driver ${driver.firstName} ${driver.lastName} is suspended`,
          })
        })
      } catch {
        // best-effort
      }

      if (active) setNotifications(items)
    }

    const refreshStudent = async () => {
      const items: NotificationItem[] = []

      try {
        const match = await studentService.getStudents({ page: 1, pageSize: 1, search: user?.email })
        const me = match.data[0]
        if (!me) {
          if (active) setNotifications([])
          return
        }

        try {
          const payments = await paymentService.getStudentPayments(me.studentSsn)
          payments
            .filter((p) => p.status?.toLowerCase() === 'pending')
            .forEach((p) => {
              items.push({
                id: `payment-${p.paymentId}`,
                text: `Payment pending for ${p.courseName} — ${p.amount.toFixed(2)}`,
              })
            })
        } catch {
          // best-effort
        }

        try {
          const trips = await tripService.getTripsByStudent(me.studentSsn)
          trips
            .filter((t) => t.status === 'Cancelled')
            .forEach((t) => {
              items.push({
                id: `trip-${t.tripId}`,
                text: `Your trip to ${t.destination} was cancelled`,
              })
            })
        } catch {
          // best-effort
        }
      } catch {
        // best-effort
      }

      if (active) setNotifications(items)
    }

    if (canSeeAdminNotifications) {
      refreshAdmin()
      window.addEventListener('trip-suggestions-changed', refreshAdmin)
      window.addEventListener('storage', refreshAdmin)
      return () => {
        active = false
        window.removeEventListener('trip-suggestions-changed', refreshAdmin)
        window.removeEventListener('storage', refreshAdmin)
      }
    }

    refreshStudent()
    return () => {
      active = false
    }
  }, [canSeeAdminNotifications, user?.email])

  const markAllSeen = () => {
    const ids = notifications.map((n) => n.id)
    setSeenIds(ids)
    localStorage.setItem(SEEN_KEY, JSON.stringify(ids))
  }

  const hasUnseen = notifications.some((n) => !seenIds.includes(n.id))

  return { notifications, hasUnseen, markAllSeen }
}