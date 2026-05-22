import { useEffect, useState } from 'react'
import Modal from '../components/Modal'
import Spinner from '../components/Spinner'
import api from '../services/api'
import { CATEGORY_COLORS } from '../utils/categoryColors'
import '../styles/AdminPages.css'

const formatDate = (value) =>
  new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

const getCategoryStyle = (category) => ({
  '--badge-color': CATEGORY_COLORS[category] || CATEGORY_COLORS.Other,
})

function AdminJobsPage() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [jobToDelete, setJobToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true)
      setError('')

      try {
        const { data } = await api.get('/jobs?limit=1000')
        setJobs(data.jobs || [])
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load jobs.')
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [])

  const confirmDelete = async () => {
    if (!jobToDelete) return

    setIsDeleting(true)
    setError('')

    try {
      await api.delete(`/jobs/${jobToDelete._id}`)
      setJobs((current) => current.filter((job) => job._id !== jobToDelete._id))
      setJobToDelete(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete the selected job.')
    } finally {
      setIsDeleting(false)
    }
  }

  if (loading) {
    return (
      <section className="admin-page admin-loading-state">
        <Spinner />
      </section>
    )
  }

  return (
    <section className="admin-page">
      <header className="admin-hero">
        <div>
          <p className="admin-kicker">Job Governance</p>
          <h1>All Platform Job Listings</h1>
          <p className="admin-subtitle">
            Review every open and closed listing, then remove posts that should no longer stay live.
          </p>
        </div>
      </header>

      <section className="admin-card">
        <div className="admin-card-header">
          <div>
            <p className="admin-eyebrow">Jobs Registry</p>
            <h2>Open And Closed Posts</h2>
          </div>
          <span className="admin-pill">{jobs.length} jobs</span>
        </div>

        {error ? <p className="admin-error">{error}</p> : null}

        {/* Testing note: real rows, category badges, and delete flow need recruiter job creation UI/data. */}
        {jobs.length === 0 ? (
          <div className="admin-empty-state">
            <h3>No Jobs Found</h3>
            <p>There are currently no job listings to manage.</p>
          </div>
        ) : (
          <div className="admin-table-shell">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Company</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job._id}>
                    <td>{job.title}</td>
                    <td>{job.company}</td>
                    <td>
                      <span className="admin-category-badge" style={getCategoryStyle(job.category)}>
                        {job.category || 'Other'}
                      </span>
                    </td>
                    <td>
                      <span className={`admin-status-badge admin-status-${job.status}`}>
                        {job.status}
                      </span>
                    </td>
                    <td>{formatDate(job.createdAt)}</td>
                    <td>
                      <button
                        type="button"
                        className="admin-button admin-button-danger"
                        onClick={() => setJobToDelete(job)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Testing note: modal wiring is present, but full manual verification needs a real job row. */}
      <Modal
        isOpen={Boolean(jobToDelete)}
        onConfirm={confirmDelete}
        onCancel={() => (isDeleting ? null : setJobToDelete(null))}
        message={
          jobToDelete
            ? `Delete "${jobToDelete.title}" from ${jobToDelete.company}? This action cannot be undone.`
            : ''
        }
      />
    </section>
  )
}

export default AdminJobsPage
