import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import JobCard from '../components/JobCard'
import Spinner from '../components/Spinner'
import styles from '../styles/SavedJobsPage.module.css'

const SavedJobsPage = () => {
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
        <p className={styles.subtitle}>{jobs.length} job{jobs.length !== 1 ? 's' : ''} saved</p>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {!error && jobs.length === 0 ? (
        <div className={styles.empty}>
          <p>You have no saved jobs yet. <Link to="/jobs" className={styles.link}>Browse jobs to save some!</Link></p>
        </div>
      ) : (
        <div className={styles.grid}>
          {jobs.map(job => (
            <Link key={job._id} to={`/jobs/${job._id}`} style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column' }}>
              <JobCard job={job} initialSaved={true} onUnsave={handleUnsave} />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default SavedJobsPage
