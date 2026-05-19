import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import ApplicationStatusBadge from '../components/ApplicationStatusBadge'
import Spinner from '../components/Spinner'
import styles from '../styles/MyApplicationsPage.module.css'

const MyApplicationsPage = () => {
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
          <p>
            You haven't applied to any jobs yet.{' '}
            <Link to="/jobs" className={styles.link}>Browse available jobs.</Link>
          </p>
        </div>
      ) : (
        <div className={styles.list}>
          {applications.map(app => (
            <div key={app._id} className={styles.card}>
              <div className={styles.info}>
                <h3 className={styles.jobTitle}>{app.job?.title ?? 'Unknown Job'}</h3>
                <p className={styles.meta}>
                  <span>{app.job?.company}</span>
                  {app.job?.type && (
                    <>
                      <span className={styles.dot}>·</span>
                      <span>{app.job.type}</span>
                    </>
                  )}
                </p>
              </div>
              <div className={styles.right}>
                <ApplicationStatusBadge status={app.status} />
                <span className={styles.date}>
                  {new Date(app.appliedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MyApplicationsPage
