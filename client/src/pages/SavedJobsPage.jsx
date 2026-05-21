import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import JobCard from '../components/JobCard'
import Spinner from '../components/Spinner'
import styles from '../styles/SavedJobsPage.module.css'

export default function SavedJobsPage() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/jobs/saved')
      .then(({ data }) => setJobs(data.jobs ?? []))
      .catch(err => setError(err.response?.data?.message || 'Failed to load saved jobs.'))
      .finally(() => setLoading(false))
  }, [])

  const handleUnsave = (jobId) => {
    setJobs(prev => prev.filter(j => j._id !== jobId))
  }

  if (loading) return <Spinner />

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Saved Jobs</h1>
        <p className={styles.subtitle}>
          {jobs.length} job{jobs.length !== 1 ? 's' : ''} saved
        </p>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {!error && jobs.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>🔖</div>
          <p className={styles.emptyText}>You haven't saved any jobs yet.</p>
          <Link to="/jobs" className={styles.browseBtn}>Browse Jobs</Link>
        </div>
      ) : (
        <div className={styles.grid}>
          {jobs.map(job => (
            <Link
              key={job._id}
              to={`/jobs/${job._id}`}
              style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column' }}
            >
              <JobCard job={{ ...job, isSaved: true }} onUnsave={handleUnsave} />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
