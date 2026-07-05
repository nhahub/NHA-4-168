import { BadgeDollarSign, BookOpenCheck, ChevronRight, CircleAlert, ClipboardList, Download, EllipsisVertical, GraduationCap, Layers3, Users, BusFront } from 'lucide-react'

const statCards = [
  { label: 'Total Students', value: '—', trend: 'Live data', tone: 'info', icon: Users },
  { label: 'Active Enrollments', value: '—', trend: 'Live data', tone: 'info', icon: BookOpenCheck },
  { label: 'Pending Payments', value: '—', trend: 'Live data', tone: 'info', icon: BadgeDollarSign },
  { label: 'Service Requests', value: '—', trend: 'Live data', tone: 'info', icon: ClipboardList },
  { label: 'Active Rides', value: '—', trend: 'Live data', tone: 'info', icon: BusFront },
  { label: 'Total Revenue', value: '—', trend: 'Live data', tone: 'info', icon: Layers3 },
]

const activities = [
  { title: 'Sarah Jenkins enrolled in Advanced UI Design', meta: '2 minutes ago', icon: BookOpenCheck, tone: 'info' },
  { title: 'John Doe processed payment #TRX-8821', meta: '15 minutes ago', icon: BadgeDollarSign, tone: 'success' },
  { title: 'System Alert: Driver Robert P. is 10 mins late for Pickup', meta: '42 minutes ago', icon: CircleAlert, tone: 'danger' },
  { title: 'Admin Alex updated the course syllabus for Python Fundamentals', meta: '1 hour ago', icon: Layers3, tone: 'neutral' },
  { title: 'New Student Registered: Michael Chen (ID: 4421)', meta: '2 hours ago', icon: GraduationCap, tone: 'info' },
]

const studentRows = [
  { name: 'Alice Thompson', course: 'Digital Marketing 101', date: 'Oct 24, 2023', status: 'Approved', tone: 'success' },
  { name: 'Marcus Webb', course: 'Fullstack Web Dev', date: 'Oct 23, 2023', status: 'Reviewing', tone: 'info' },
  { name: 'Elena Rodriguez', course: 'Cybersecurity Essentials', date: 'Oct 22, 2023', status: 'Pending', tone: 'danger' },
]

function AdminDashboardPage() {
  return (
    <main className="px-4 pb-12 pt-6 sm:px-6 lg:px-8 lg:pt-8">
      <section className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-[36px] leading-[44px] tracking-[-0.02em] font-bold text-on-background">Admin Dashboard</h2>
          <p className="mt-1 text-[16px] leading-6 text-on-surface-variant">Real-time overview of the academic and operational metrics.</p>
        </div>
        <button className="flex items-center gap-2 bg-secondary text-on-secondary px-6 py-2.5 rounded-lg text-[16px] font-semibold shadow-md hover:opacity-90 active:scale-95 transition-all" type="button">
          <Download className="h-4 w-4" />
          Export Report
        </button>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon

          return (
            <div key={card.label} className="bg-white p-6 rounded-xl border border-outline-variant shadow-sm flex flex-col gap-2 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="p-2 bg-secondary-fixed rounded-lg">
                  <Icon className="text-secondary h-5 w-5" />
                </div>
                <span className="text-xs font-bold text-secondary bg-blue-50 px-2 py-0.5 rounded-full">{card.trend}</span>
              </div>
              <p className="text-on-surface-variant text-[12px] font-semibold uppercase tracking-[0.08em] mt-2">{card.label}</p>
              <h3 className="text-[24px] leading-8 font-bold text-on-surface">{card.value}</h3>
            </div>
          )
        })}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-xl border border-outline-variant shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-outline-variant flex justify-between items-center">
            <div>
              <h4 className="text-title-sm font-semibold text-on-surface">Enrollment Trends</h4>
              <p className="text-body-sm text-on-surface-variant">Daily student registrations vs course completions</p>
            </div>
            <select className="bg-surface-container-low border-none rounded-lg text-body-sm focus:ring-secondary">
              <option>Last 30 Days</option>
              <option>Last 90 Days</option>
              <option>Year to Date</option>
            </select>
          </div>
          <div className="flex-1 p-6 flex flex-col justify-end gap-4 min-h-[350px]">
            <div className="w-full h-full relative flex items-end gap-4 px-4">
              {[40, 65, 55, 90, 75, 30, 85].map((height, index) => (
                <div key={`${index}-${height}`} className="flex-1 bg-secondary/10 rounded-t-lg relative group" style={{ height: `${height}%` }}>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 bg-primary text-on-primary text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity mb-2">
                    {'—'}
                  </div>
                  <div className={`absolute inset-x-0 bottom-0 rounded-t-lg ${index === 3 ? 'bg-secondary' : index === 6 ? 'bg-secondary/60' : index === 1 ? 'bg-secondary/30' : index === 4 ? 'bg-secondary/40' : index === 2 ? 'bg-secondary/20' : 'bg-secondary/10'}`} />
                </div>
              ))}
            </div>
            <div className="flex justify-between text-body-sm text-outline px-4">
              <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-outline-variant shadow-sm flex flex-col h-full">
          <div className="p-6 border-b border-outline-variant">
            <h4 className="text-title-sm font-semibold text-on-surface">Recent System Activity</h4>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {activities.map((activity) => {
              const Icon = activity.icon

              return (
                <div key={activity.title} className="flex gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${activity.tone === 'success' ? 'bg-status-success-container' : activity.tone === 'danger' ? 'bg-error-container' : activity.tone === 'neutral' ? 'bg-surface-container-high' : 'bg-secondary-fixed'}`}>
                    <Icon className={`scale-75 ${activity.tone === 'success' ? 'text-status-success' : activity.tone === 'danger' ? 'text-error' : activity.tone === 'neutral' ? 'text-on-surface-variant' : 'text-secondary'}`} />
                  </div>
                  <div>
                    <p className="text-body-sm text-on-surface"><span className="font-bold">{activity.title.split(' ')[0]} {activity.title.split(' ')[1]}</span> {activity.title.substring(activity.title.indexOf(' ') + 1)}</p>
                    <span className="text-[12px] text-outline">{activity.meta}</span>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="p-4 bg-surface-container-low border-t border-outline-variant text-center">
            <a className="text-secondary font-semibold text-[12px] uppercase tracking-[0.08em] hover:underline" href="#">View All Logs</a>
          </div>
        </div>
      </section>

      <section className="mt-8 bg-white rounded-xl border border-outline-variant shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center">
          <h4 className="text-title-sm font-semibold text-on-surface">Recent Student Applications</h4>
          <button className="text-secondary font-semibold text-[12px] uppercase tracking-[0.08em] flex items-center gap-1 hover:bg-secondary/5 px-3 py-1.5 rounded-lg transition-all" type="button">
            View Full Directory
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-container-low border-b border-outline-variant">
              <tr>
                <th className="px-6 py-4 font-table-header text-table-header text-outline">STUDENT NAME</th>
                <th className="px-6 py-4 font-table-header text-table-header text-outline">COURSE APPLIED</th>
                <th className="px-6 py-4 font-table-header text-table-header text-outline">APP DATE</th>
                <th className="px-6 py-4 font-table-header text-table-header text-outline">STATUS</th>
                <th className="px-6 py-4 font-table-header text-table-header text-outline">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/50">
              {studentRows.map((row) => (
                <tr key={row.name} className="hover:bg-surface-container-low transition-colors">
                  <td className="px-6 py-4 font-body-sm text-body-sm text-on-surface font-semibold">{row.name}</td>
                  <td className="px-6 py-4 font-body-sm text-body-sm text-on-surface-variant">{row.course}</td>
                  <td className="px-6 py-4 font-body-sm text-body-sm text-on-surface-variant">{row.date}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[12px] font-bold ${row.tone === 'success' ? 'bg-green-100 text-green-700' : row.tone === 'info' ? 'bg-secondary-fixed text-secondary' : 'bg-error-container text-error'}`}>{row.status}</span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="p-1 hover:text-secondary" type="button" aria-label={`More actions for ${row.name}`}><EllipsisVertical className="h-5 w-5" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}

export default AdminDashboardPage