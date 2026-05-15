import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import { CATEGORY_COLORS } from '../utils/categoryColors'
import SaveJobButton from '../components/SaveJobButton'
import ApplicationStatusBadge from '../components/ApplicationStatusBadge'
import Spinner from '../components/Spinner'
import Modal from '../components/Modal'

export default function JobDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()

  const [job,            setJob]           = useState(null)
  const [loading,        setLoading]       = useState(true)
  const [error,          setError]         = useState('')
  const [modalOpen,      setModalOpen]     = useState(false)
  const [authModalOpen,  setAuthModalOpen] = useState(false)
  const [authMessage,    setAuthMessage]   = useState('')
  const [toast,          setToast]         = useState(null)
  const [coverLetter,    setCoverLetter]   = useState('')
  const [applying,       setApplying]      = useState(false)
  const [applyError,     setApplyError]    = useState('')
  const [myApplication,  setMyApplication] = useState(null)

  const isJobSeeker = isAuthenticated && user?.role === 'jobSeeker'

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const { data } = await api.get(`/jobs/${id}`)
        const jobData = data.job ?? data.data ?? data
        setJob(jobData)

        // Check if current user already applied
        if (isJobSeeker) {
          try {
            const { data: appData } = await api.get('/applications/my')
            const apps = appData.applications ?? appData.data ?? appData
            const existing = apps.find(a => (a.job?._id ?? a.job) === id)
            if (existing) setMyApplication(existing)
          } catch { /* not critical */ }
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load this job.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, isJobSeeker])

  const handleApply = async () => {
    setApplying(true)
    setApplyError('')
    try {
      const body = {}
      if (coverLetter.trim()) body.coverLetter = coverLetter.trim()
      const { data } = await api.post(`/jobs/${id}/apply`, body)
      setMyApplication(data.application ?? data.data ?? data)
      setModalOpen(false)
      setCoverLetter('')
      setToast({ type: 'success', message: 'Application submitted successfully!' })
      setTimeout(() => setToast(null), 3000)
    } catch (err) {
      const message = err.response?.data?.message || 'Application failed. Please try again.'
      
      // Make error messages more user-friendly
      let userMessage = message
      if (message.includes('already applied')) {
        userMessage = 'You have already applied to this job. Check your applications for status updates.'
      } else if (message.includes('no longer accepting')) {
        userMessage = 'This job is no longer accepting applications.'
      } else if (err.response?.status === 401) {
        userMessage = 'You must be logged in to apply. Please log in and try again.'
      } else if (err.response?.status === 403) {
        userMessage = 'Only job seekers can apply. Your account type does not have this permission.'
      }
      
      setApplyError(userMessage)
    } finally {
      setApplying(false)
    }
  }

  const handleApplyClick = () => {
    if (myApplication) {
      setToast({ type: 'info', message: 'You already applied to this job' })
      setTimeout(() => setToast(null), 3000)
      return
    }

    if (job.status !== 'open') {
      setToast({ type: 'warning', message: 'This job is no longer accepting applications' })
      setTimeout(() => setToast(null), 3000)
      return
    }

    if (!isAuthenticated) {
      setAuthMessage('Log In to Apply')
      setAuthModalOpen(true)
      return
    }

    if (!isJobSeeker) {
      setAuthMessage('Only Job Seekers Can Apply')
      setAuthModalOpen(true)
      return
    }

    // User is authenticated and is a job seeker
    setModalOpen(true)
  }

  if (loading) return <Spinner />

  if (error) return (
    <div style={{ textAlign: 'center', padding: '4rem', fontFamily: 'sans-serif' }}>
      <p style={{ color: '#b91c1c', marginBottom: '1rem' }}>{error}</p>
      <button onClick={() => navigate('/jobs')} style={{ padding: '0.5rem 1.25rem', background: '#f3f4f6', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
        ← Back to Jobs
      </button>
    </div>
  )

  if (!job) return null

  const categoryColor = CATEGORY_COLORS[job.category] ?? 'gray'
  const recruiter     = job.createdBy ?? job.recruiter ?? job.postedBy ?? null

  return (
    <div style={s.page}>
      <button onClick={() => navigate(-1)} style={s.backLink} className="backLink">← Back</button>

      <div style={s.card}>
        {/* ── Header ── */}
        <div style={s.cardHeader}>
          <span style={{ ...s.badge, color: categoryColor, border: `1px solid ${categoryColor}`, background: `${categoryColor}18` }}>
            {job.category || 'Other'}
          </span>
          <h1 style={s.jobTitle}>{job.title}</h1>
          <p style={s.company}>{job.company}</p>
          
          {/* Meta row with location, type, status */}
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {job.location && <span style={s.metaItem}>📍 {job.location}</span>}
            {job.type     && <span style={s.metaItem}>{job.type}</span>}
            <span style={{
              ...s.metaItem,
              color: job.status === 'open' ? '#166534' : '#991b1b',
              background: job.status === 'open' ? '#dcfce7' : '#fee2e2',
              borderRadius: 12, padding: '2px 10px', fontSize: '0.8rem', fontWeight: 600,
            }}>
              {job.status?.toUpperCase()}
            </span>
          </div>

          {/* Save & Apply buttons - side by side */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', width: '100%' }}>
            <SaveJobButton jobId={job._id} status={job.status} initialSaved={job.isSaved ?? false} />
            <div style={{ marginLeft: 'auto' }}>
              {myApplication ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0 }}>You applied</p>
                  <ApplicationStatusBadge status={myApplication.status} />
                </div>
              ) : (
                <button 
                  onClick={handleApplyClick}
                  disabled={job.status !== 'open'}
                  style={{ ...s.applyBtn, ...(job.status !== 'open' ? { opacity: 0.6, cursor: 'not-allowed' } : {}), width: 'auto' }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#1d4ed8'
                    e.target.style.boxShadow = '0 8px 16px rgba(37, 99, 235, 0.3)'
                    e.target.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = '#2563EB'
                    e.target.style.boxShadow = 'none'
                    e.target.style.transform = 'scale(1)'
                  }}
                >
                  Apply Now
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <div style={s.body}>
          {/* Salary + slots */}
          {(job.salary || job.totalSlots) && (
            <div style={s.highlights}>
              {job.salary     && (
                <div style={s.highlight}>
                  <span style={s.hlLabel}>Salary</span>
                  <span style={s.hlValue}>${Number(job.salary).toLocaleString()}</span>
                </div>
              )}
              {job.totalSlots && (
                <div style={s.highlight}>
                  <span style={s.hlLabel}>Open Slots</span>
                  <span style={s.hlValue}>{job.totalSlots}</span>
                </div>
              )}
            </div>
          )}

          {/* Description */}
          <section style={s.section}>
            <h2 style={s.sectionTitle}>About the Role</h2>
            <p style={s.description}>{job.description}</p>
          </section>

          {/* Requirements */}
          {job.requirements?.length > 0 && (
            <section style={s.section}>
              <h2 style={s.sectionTitle}>Requirements</h2>
              <ul style={s.list}>
                {job.requirements.map((req, i) => (
                  <li key={i} style={s.listItem}>• {req}</li>
                ))}
              </ul>
            </section>
          )}

          {/* Recruiter info */}
          {recruiter && (
            <section style={s.section}>
              <h2 style={s.sectionTitle}>Posted by</h2>
              <div style={s.recruiterCard}>
                <div style={s.avatar}>{(recruiter.name || 'R')[0].toUpperCase()}</div>
                <div>
                  <p style={{ fontWeight: 600, color: '#111827', margin: 0 }}>{recruiter.name}</p>
                  {recruiter.email && (
                    <a href={`mailto:${recruiter.email}`} style={{ color: '#2563EB', fontSize: '0.875rem', textDecoration: 'none' }}>
                      {recruiter.email}
                    </a>
                  )}
                </div>
              </div>
            </section>
          )}
        </div>
      </div>

      {/* ── Apply Modal ── */}
      {modalOpen && (
        <div style={s.modalOverlay} onClick={() => { setModalOpen(false); setApplyError('') }}>
          <div style={s.modalContent} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.25rem', color: '#111827' }}>
              Apply — {job.title}
            </h2>
            <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: '0 0 1.25rem' }}>at {job.company}</p>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', color: '#374151', marginBottom: '0.5rem' }}>
              Cover Letter <span style={{ color: '#9ca3af', fontWeight: 400 }}>(optional)</span>
            </label>
            <textarea
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: 8, fontSize: '0.9rem', lineHeight: 1.6, resize: 'vertical', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
              rows={6}
              placeholder="Tell the recruiter why you're a great fit…"
              value={coverLetter}
              onChange={e => setCoverLetter(e.target.value)}
            />
            {applyError && (
              <div style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: 8,
                padding: '0.75rem',
                display: 'flex',
                gap: '0.5rem',
                alignItems: 'flex-start',
                marginTop: '0.75rem',
                animation: 'fadeInScale 0.3s ease-out'
              }}>
                <p style={{ color: '#b91c1c', fontSize: '0.875rem', margin: 0, lineHeight: 1.5 }}>{applyError}</p>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
              <button
                onClick={() => { setModalOpen(false); setApplyError('') }}
                disabled={applying}
                style={{ padding: '0.6rem 1.25rem', background: '#f3f4f6', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 500, transition: 'all 0.2s ease' }}
              >Cancel</button>
              <button
                onClick={handleApply}
                disabled={applying}
                style={{ padding: '0.6rem 1.5rem', background: '#2563EB', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s ease' }}
              >{applying ? 'Submitting…' : 'Submit Application'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Auth Modal (for login/role restrictions) ── */}
      {authModalOpen && (
        <div style={s.modalOverlay} onClick={() => setAuthModalOpen(false)}>
          <div style={s.modalContent} onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 0.5rem', color: '#111827' }}>
                {authMessage}
              </h2>
              <p style={{ color: '#6b7280', fontSize: '0.95rem', margin: '0 0 1.75rem', lineHeight: 1.6 }}>
                {authMessage.includes('Log In') ? 
                  'You need to log in to apply for this job. Create an account or log in with your existing credentials.' :
                  'This action is only available to job seekers. Log in as a job seeker or create a new account.'}
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  onClick={() => {
                    setAuthModalOpen(false)
                    navigate('/login')
                  }}
                  style={{ padding: '0.7rem 1.5rem', background: '#2563EB', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s ease' }}
                >
                  Log In
                </button>
                <button
                  onClick={() => {
                    setAuthModalOpen(false)
                    navigate('/register')
                  }}
                  style={{ padding: '0.7rem 1.5rem', background: '#f3f4f6', color: '#111827', border: '1px solid #e5e7eb', borderRadius: 8, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s ease' }}
                >
                  Create Account
                </button>
                <button
                  onClick={() => setAuthModalOpen(false)}
                  style={{ padding: '0.7rem 1.5rem', background: 'transparent', color: '#6b7280', border: 'none', borderRadius: 8, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s ease' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast Notification ── */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '1.5rem',
          right: '1.5rem',
          padding: '1rem 1.5rem',
          borderRadius: 10,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 9999,
          animation: 'slideIn 0.3s ease-out',
          background: toast.type === 'success' ? '#dcfce7' : toast.type === 'warning' ? '#fef3c7' : '#e0f2fe',
          border: `1px solid ${toast.type === 'success' ? '#bbf7d0' : toast.type === 'warning' ? '#fde68a' : '#bae6fd'}`,
          color: toast.type === 'success' ? '#166534' : toast.type === 'warning' ? '#92400e' : '#0c4a6e',
          fontWeight: 500,
          fontSize: '0.95rem'
        }}>
          {toast.message}
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes modalSlideIn {
          from {
            transform: scale(0.95) translateY(-20px);
            opacity: 0;
          }
          to {
            transform: scale(1) translateY(0);
            opacity: 1;
          }
        }
        @keyframes buttonHover {
          from {
            transform: scale(1);
            box-shadow: none;
          }
          to {
            transform: scale(1.05);
            box-shadow: 0 8px 16px rgba(37, 99, 235, 0.3);
          }
        }
        @keyframes buttonClick {
          0% {
            transform: scale(1.05);
          }
          50% {
            transform: scale(0.98);
          }
          100% {
            transform: scale(1.05);
          }
        }
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
        button {
          transition: all 0.3s ease;
        }
        button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
        }
        button.backLink:hover {
          transform: none;
          box-shadow: none;
        }
        button.backLink:active {
          transform: none;
          box-shadow: none;
        }
        button:active:not(:disabled) {
          transform: translateY(0);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  )
}

const s = {
  page:        { width: '720px', margin: '0 auto', padding: '2rem 1.5rem 4rem', fontFamily: 'sans-serif' },
  backLink:    { background: 'none', border: 'none', color: 'var(--text)', fontSize: '0.9rem', cursor: 'pointer', marginBottom: '1.25rem', padding: 0, transition: 'color 0.2s ease' },
  card:        { background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' },
  cardHeader:  { display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' },
  badge:       { display: 'inline-block', padding: '3px 12px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.75rem' },
  jobTitle:    { fontSize: '1.65rem', fontWeight: 700, color: 'var(--text-h)', margin: '0 0 0.375rem' },
  company:     { fontSize: '1rem', color: 'var(--text)', margin: '0 0 0.75rem', fontWeight: 500 },
  metaRow:     { display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', justifyContent: 'space-between' },
  metaItem:    { fontSize: '0.875rem', color: 'var(--text)' },
  actions:     { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem', minWidth: 160 },
  applyBtn:    { padding: '0.65rem 1.5rem', background: '#2563EB', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer', transition: 'all 0.3s ease', transform: 'scale(1)' },
  body:        { padding: '1.5rem' },
  highlights:  { display: 'flex', gap: '1.5rem', background: 'var(--code-bg)', borderRadius: 10, padding: '1rem 1.5rem', marginBottom: '2rem' },
  highlight:   { display: 'flex', flexDirection: 'column', gap: '0.2rem' },
  hlLabel:     { fontSize: '0.7rem', color: 'var(--text)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' },
  hlValue:     { fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-h)' },
  section:     { marginBottom: '2rem' },
  sectionTitle:{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' },
  description: { color: 'var(--text)', lineHeight: 1.7, whiteSpace: 'pre-wrap', margin: 0 },
  list:        { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  listItem:    { color: 'var(--text)', lineHeight: 1.6 },
  recruiterCard:{ display: 'flex', alignItems: 'center', gap: '0.875rem', background: 'var(--code-bg)', borderRadius: 10, padding: '1rem 1.25rem', border: '1px solid var(--border)' },
  avatar:      { width: 44, height: 44, borderRadius: '50%', background: '#2563EB', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.1rem', flexShrink: 0 },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9998, animation: 'fadeIn 0.2s ease-out' },
  modalContent: { background: 'var(--bg)', borderRadius: 16, padding: '2rem', maxWidth: 500, width: '90%', boxShadow: '0 20px 25px rgba(0,0,0,0.15)', animation: 'modalSlideIn 0.3s ease-out' },
}
