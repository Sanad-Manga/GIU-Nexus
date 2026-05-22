import { useEffect, useMemo, useState } from 'react'
import api from '../services/api'
import Spinner from '../components/Spinner'
import '../styles/AdminPages.css'

const formatLabel = (value) =>
  value
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (match) => match.toUpperCase())

const formatWeekLabel = (label, fallbackIndex) => {
  if (!label) return `Week ${fallbackIndex + 1}`

  const date = new Date(label)
  if (!Number.isNaN(date.getTime())) {
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  }

  return String(label)
}

const normalizeWeeklyStats = (stats) => {
  const weeklySeries =
    stats?.applicationsPerWeek ||
    stats?.applicationsByWeek ||
    stats?.weeklyApplications ||
    stats?.last4WeeksApplications ||
    []

  if (!Array.isArray(weeklySeries) || weeklySeries.length === 0) {
    return []
  }

  return weeklySeries.map((item, index) => ({
    label: formatWeekLabel(item.week || item.label || item._id, index),
    value: Number(item.count ?? item.total ?? item.applications ?? item.value ?? 0),
  }))
}

const SummarySection = ({ title, data }) => (
  <section className="admin-card">
    <div className="admin-card-header">
      <div>
        <p className="admin-eyebrow">Snapshot</p>
        <h2>{title}</h2>
      </div>
    </div>
    <div className="admin-stat-grid">
      {Object.entries(data).map(([key, value]) => (
        <article key={key} className="admin-stat-tile">
          <span className="admin-stat-label">{formatLabel(key)}</span>
          <strong className="admin-stat-value">{value}</strong>
        </article>
      ))}
    </div>
  </section>
)

const ApplicationsTrendChart = ({ points }) => {
  const maxValue = Math.max(...points.map((point) => point.value), 1)
  const coordinates = points.map((point, index) => {
    const x = (index / Math.max(points.length - 1, 1)) * 100
    const y = 100 - (point.value / maxValue) * 100
    return `${x},${y}`
  })

  return (
    <section className="admin-card">
      <div className="admin-card-header">
        <div>
          <p className="admin-eyebrow">Extended Stats</p>
          <h2>Applications Over The Last 4 Weeks</h2>
        </div>
      </div>
      <div className="admin-chart-shell">
        <svg viewBox="0 0 100 100" className="admin-chart" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="adminTrendFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="rgba(37, 99, 235, 0.32)" />
              <stop offset="100%" stopColor="rgba(37, 99, 235, 0.04)" />
            </linearGradient>
          </defs>
          <polyline
            fill="none"
            stroke="var(--primary)"
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
            points={coordinates.join(' ')}
          />
          <polygon
            fill="url(#adminTrendFill)"
            points={`0,100 ${coordinates.join(' ')} 100,100`}
          />
          {points.map((point, index) => {
            const x = (index / Math.max(points.length - 1, 1)) * 100
            const y = 100 - (point.value / maxValue) * 100
            return <circle key={point.label} cx={x} cy={y} r="2.6" fill="var(--accent)" />
          })}
        </svg>
        <div className="admin-chart-labels">
          {points.map((point) => (
            <div key={point.label} className="admin-chart-label">
              <span>{point.label}</span>
              <strong>{point.value}</strong>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true)
      setError('')

      try {
        const { data } = await api.get('/admin/stats')
        setStats(data.stats)
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load admin statistics.')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const weeklyStats = useMemo(() => normalizeWeeklyStats(stats), [stats])

  if (loading) {
    return (
      <section className="admin-page admin-loading-state">
        <Spinner />
      </section>
    )
  }

  if (error) {
    return (
      <section className="admin-page">
        <div className="admin-card admin-empty-state">
          <h1>Admin Dashboard</h1>
          <p>{error}</p>
        </div>
      </section>
    )
  }

  return (
    <section className="admin-page">
      <header className="admin-hero">
        <div>
          <p className="admin-kicker">Admin Control Center</p>
          <h1>Platform Health At A Glance</h1>
          <p className="admin-subtitle">
            Review user growth, job activity, and application flow from one place.
          </p>
        </div>
      </header>

      <div className="admin-grid">
        <section className="admin-card">
          <div className="admin-card-header">
            <div>
              <p className="admin-eyebrow">Leaderboard</p>
              <h2>Top Jobs</h2>
            </div>
          </div>

          {/* Testing note: the non-empty leaderboard needs job/application flows to create real application data. */}
          {stats?.topJobs?.length ? (
            <ol className="admin-leaderboard">
              {stats.topJobs.map((job, index) => {
                const applicationCount = Number(job.applicationCount || 0)
                const applicationLabel = applicationCount === 1 ? 'application' : 'applications'

                return (
                  <li key={job._id || `${job.title}-${index}`} className="admin-leaderboard-row">
                    <span className="admin-rank">{index + 1}</span>

                    <div className="admin-leaderboard-info">
                      <strong className="admin-leaderboard-title">
                        {job.title || 'Untitled Job'}
                      </strong>
                      <p className="admin-leaderboard-company">
                        {job.company || 'Unknown Company'}
                      </p>
                    </div>

                    <span className="admin-pill">
                      {applicationCount} {applicationLabel}
                    </span>
                  </li>
                )
              })}
            </ol>
          ) : (
            <div className="admin-empty-state">
              <p>No applications have been submitted yet, so there are no top jobs to rank.</p>
            </div>
          )}
        </section>

        <SummarySection title="Jobs By Status" data={stats?.jobsByStatus || {}} />
        <SummarySection title="Applications By Status" data={stats?.appsByStatus || {}} />
        <SummarySection title="Users By Role" data={stats?.usersByRole || {}} />
      </div>

      {/* Testing note: the SCRUM-64 chart appears only when the backend returns weekly application stats. */}
      {weeklyStats.length > 0 ? <ApplicationsTrendChart points={weeklyStats} /> : null}
    </section>
  )
}

export default AdminDashboard