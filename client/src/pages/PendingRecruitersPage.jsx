import { useEffect, useState } from 'react'
import api from '../services/api'
import Spinner from '../components/Spinner'
import '../styles/AdminPages.css'

const formatDate = (value) =>
  new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

function PendingRecruitersPage() {
  const [recruiters, setRecruiters] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [pendingActionIds, setPendingActionIds] = useState([])

  useEffect(() => {
    const fetchRecruiters = async () => {
      setLoading(true)
      setError('')

      try {
        const { data } = await api.get('/users?role=recruiter&status=pending')
        setRecruiters(data.users || [])
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load pending recruiters.')
      } finally {
        setLoading(false)
      }
    }

    fetchRecruiters()
  }, [])

  const handleStatusUpdate = async (recruiter, status) => {
    const previousRecruiters = recruiters

    setPendingActionIds((current) => [...current, recruiter._id])
    setRecruiters((current) => current.filter((item) => item._id !== recruiter._id))
    setError('')

    try {
      await api.patch(`/users/${recruiter._id}/status`, { status })
    } catch (err) {
      setRecruiters(previousRecruiters)
      setError(err.response?.data?.message || `Failed to ${status} recruiter.`)
    } finally {
      setPendingActionIds((current) => current.filter((id) => id !== recruiter._id))
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
          <p className="admin-kicker">Recruiter Review Queue</p>
          <h1>Pending Recruiter Approvals</h1>
          <p className="admin-subtitle">
            Approve trusted recruiters quickly and keep the hiring side of the platform moving.
          </p>
        </div>
      </header>

      <section className="admin-card">
        <div className="admin-card-header">
          <div>
            <p className="admin-eyebrow">Approval Queue</p>
            <h2>Recruiters Awaiting Review</h2>
          </div>
          <span className="admin-pill">{recruiters.length} pending</span>
        </div>

        {error ? <p className="admin-error">{error}</p> : null}

        {recruiters.length === 0 ? (
          <div className="admin-empty-state">
            <h3>No Pending Recruiters</h3>
            <p>Every recruiter request has already been reviewed.</p>
          </div>
        ) : (
          <div className="admin-table-shell">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Registered</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recruiters.map((recruiter) => {
                  const actionPending = pendingActionIds.includes(recruiter._id)

                  return (
                    <tr key={recruiter._id}>
                      <td>{recruiter.name}</td>
                      <td>{recruiter.email}</td>
                      <td>{formatDate(recruiter.createdAt)}</td>
                      <td>
                        <div className="admin-action-group">
                          <button
                            type="button"
                            className="admin-button admin-button-primary"
                            onClick={() => handleStatusUpdate(recruiter, 'approved')}
                            disabled={actionPending}
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            className="admin-button admin-button-secondary"
                            onClick={() => handleStatusUpdate(recruiter, 'rejected')}
                            disabled={actionPending}
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  )
}

export default PendingRecruitersPage
