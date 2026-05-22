import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import Spinner from '../components/Spinner'
import styles from '../styles/MyApplicationsPage.module.css'

const STATUS_CLASS = {
  pending:     styles.pending,
  shortlisted: styles.shortlisted,
  rejected:    styles.rejected,
}

export default function MyApplicationsPage() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/applications/my')
      .then(({ data }) => setApplications(data.applications ?? data.data ?? []))
      .catch(err => setError(err.response?.data?.message || 'Failed to load applications.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner />

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>My Applications</h1>
        <p className={styles.subtitle}>
          {applications.length} application{applications.length !== 1 ? 's' : ''}
        </p>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {!error && applications.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>📋</div>
          <p className={styles.emptyText}>You haven't applied to any jobs yet.</p>
          <Link to="/jobs" className={styles.browseBtn}>Browse Jobs</Link>
        </div>
      ) : (
        <div className={styles.grid}>
          {applications.map(app => {
            const company = app.job?.company ?? ''
            const initials = company.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?'
            return (
              <Link
                key={app._id}
                to={app.job?._id ? `/jobs/${app.job._id}` : '/jobs'}
                className={styles.card}
              >
                <div className={styles.cardTop}>
                  <span className={`${styles.badge} ${STATUS_CLASS[app.status] ?? ''}`}>
                    {app.status}
                  </span>
                  <span className={styles.date}>
                    {new Date(app.appliedAt).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric',
                    })}
                  </span>
                </div>

                <h3 className={styles.jobTitle}>{app.job?.title ?? 'Unknown Job'}</h3>

                <div className={styles.companyRow}>
                  <div className={styles.avatar}>{initials}</div>
                  <p className={styles.company}>{company}</p>
                </div>

                <div className={styles.divider} />

                <p className={styles.meta}>
                  {app.job?.type && <span>{app.job.type}</span>}
                  {app.job?.type && app.job?.location && <span className={styles.dot}>•</span>}
                  {app.job?.location && <span>{app.job.location}</span>}
                </p>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
