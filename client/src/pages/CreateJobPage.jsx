import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import { CATEGORY_COLORS } from '../utils/categoryColors'
import PendingApprovalBanner from '../components/PendingApprovalBanner'
import JobForm from '../components/JobForm'

const JOB_TYPES = ['full-time', 'part-time', 'internship', 'contract']

export default function CreateJobPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [form, setForm] = useState({
    title: '', company: '', description: '',
    location: '', type: 'full-time', salary: '', totalSlots: '',
  })
  const [requirements, setRequirements] = useState([''])
  const [errors,       setErrors]       = useState({})
  const [submitting,   setSubmitting]   = useState(false)
  const [submitError,  setSubmitError]  = useState('')
  const [createdJob,   setCreatedJob]   = useState(null)

  if (user?.status === 'pending') return <PendingApprovalBanner />

  // ── Validation ──
  const validate = () => {
    const e = {}
    if (!form.title.trim())       e.title       = 'Title is required.'
    if (!form.company.trim())     e.company     = 'Company is required.'
    if (!form.description.trim()) e.description = 'Description is required.'
    if (!form.location.trim())    e.location    = 'Location is required.'
    if (!form.type)               e.type        = 'Type is required.'
    if (form.salary && isNaN(Number(form.salary)))
      e.salary = 'Salary must be a number.'
    if (form.totalSlots && (isNaN(Number(form.totalSlots)) || Number(form.totalSlots) < 1))
      e.totalSlots = 'Must be a positive number.'
    if (requirements.filter(r => r.trim()).length === 0)
      e.requirements = 'Add at least one requirement.'
    return e
  }

  const handleChange = field => e => {
    setForm(f => ({ ...f, [field]: e.target.value }))
    if (errors[field]) setErrors(er => { const n = { ...er }; delete n[field]; return n })
  }

  // ── Requirements helpers ──
  const updateReq = (i, val) => {
    const next = [...requirements]
    next[i] = val
    setRequirements(next)
    if (errors.requirements) setErrors(er => { const n = { ...er }; delete n.requirements; return n })
  }
  const addReq    = () => setRequirements(r => [...r, ''])
  const removeReq = i  => setRequirements(r => r.filter((_, idx) => idx !== i))

  // ── Submit ──
  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setSubmitting(true)
    setSubmitError('')
    try {
      const payload = {
        title:        form.title.trim(),
        company:      form.company.trim(),
        description:  form.description.trim(),
        location:     form.location.trim(),
        type:         form.type,
        requirements: requirements.filter(r => r.trim()),
      }
      if (form.salary)     payload.salary     = Number(form.salary)
      if (form.totalSlots) payload.totalSlots = Number(form.totalSlots)

      const { data } = await api.post('/jobs', payload)
      setCreatedJob(data.job ?? data.data ?? data)
    } catch (err) {
      let userMessage = err.response?.data?.message || 'Failed to create job. Please try again.'
      
      // Make error messages more helpful
      if (err.response?.status === 403) {
        userMessage = 'Your recruiter account is pending admin approval. You can only post jobs once approved.'
      } else if (err.response?.status === 401) {
        userMessage = 'You must be logged in as a recruiter to post jobs.'
      } else if (err.response?.status === 400) {
        userMessage = 'Please check all required fields are filled in correctly.'
      }
      
      setSubmitError(userMessage)
    } finally {
      setSubmitting(false)
    }
  }

  // ── Success screen ──
  if (createdJob) {
    const categoryColor = CATEGORY_COLORS[createdJob.category] ?? 'gray'
    return (
      <div style={s.pageWrapper}>
        <div style={s.page}>
          <div style={s.successCard}>
          <div style={s.successIcon}>✓</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 0.375rem', color: '#111827' }}>
            Job Posted!
          </h2>
          <p style={{ color: '#6b7280', margin: '0 0 2rem' }}>
            Your listing is live. The AI assigned a category automatically.
          </p>

          <div style={s.resultJob}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              {/* AI-assigned category — read only */}
              <span style={{
                display: 'inline-block', padding: '3px 12px', borderRadius: 20,
                fontSize: '0.8rem', fontWeight: 600,
                color: categoryColor, border: `1px solid ${categoryColor}`, background: `${categoryColor}18`,
              }}>
                {createdJob.category || 'Other'}
              </span>
              <span style={{ fontSize: '0.75rem', color: '#7c3aed', background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: 20, padding: '2px 10px', fontWeight: 500 }}>
                ✨ AI-assigned
              </span>
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 0.375rem', color: '#111827' }}>
              {createdJob.title}
            </h3>
            <p style={{ color: '#4b5563', margin: '0 0 0.375rem', fontSize: '0.9rem' }}>
              {createdJob.company} · {createdJob.location}
            </p>
            {createdJob.salary && (
              <p style={{ color: '#166534', fontWeight: 600, margin: 0, fontSize: '0.9rem' }}>
                ${Number(createdJob.salary).toLocaleString()} / yr
              </p>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate(`/jobs/${createdJob._id}`)}
              style={s.submitBtn}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#1d4ed8'
                e.currentTarget.style.boxShadow = '0 8px 16px rgba(37, 99, 235, 0.3)'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#2563EB'
                e.currentTarget.style.boxShadow = 'none'
                e.currentTarget.style.transform = 'scale(1)'
              }}
            >
              View Listing
            </button>
            <button
              onClick={() => {
                setCreatedJob(null)
                setForm({ title: '', company: '', description: '', location: '', type: 'full-time', salary: '', totalSlots: '' })
                setRequirements([''])
              }}
              style={s.cancelBtn}
              onMouseEnter={e => e.currentTarget.style.filter = 'brightness(0.97)'}
              onMouseLeave={e => e.currentTarget.style.filter = 'none'}
            >
              Post Another
            </button>
          </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Form ──
  return (
    <div style={s.pageWrapper}>
      <div style={s.page}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={s.heading}>Post a New Job</h1>
          <p style={s.subtitle}>Fill in the details. The AI will automatically assign a category to your listing.</p>
        </div>

        <div style={s.card}>
          <JobForm
            form={form}
            errors={errors}
            requirements={requirements}
            onChange={handleChange}
            onUpdateRequirement={updateReq}
            onAddRequirement={addReq}
            onRemoveRequirement={removeReq}
            onSubmit={handleSubmit}
            submitting={submitting}
            submitError={submitError}
            submitLabel={'Post Job'}
            cancelLabel={'Cancel'}
            onCancel={() => navigate(-1)}
            showStatus={false}
            showAiNotice={true}
          />
        </div>
      </div>
    </div>
  )
}

const s = {
  pageWrapper: { minHeight: '100vh', width: '100%', background: 'radial-gradient(circle at top right, rgba(16, 185, 129, 0.16), transparent 28%), linear-gradient(135deg, rgba(37, 99, 235, 0.09), rgba(255, 255, 255, 0.94))' },
  page: { width: '720px', margin: '0 auto', padding: '2rem 1.5rem 4rem' },
  card: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '1.25rem', boxShadow: '0 6px 18px rgba(2,6,23,0.06)' },
  heading: { fontSize: '1.75rem', fontWeight: 700, margin: '0 0 0.375rem', color: '#111827' },
  subtitle: { color: '#6b7280', margin: 0 },
  pendingBanner:{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12, padding: '1.5rem' },
  form: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '0.375rem' },
  label: { fontSize: '0.875rem', fontWeight: 600, color: '#374151' },
  input: { padding: '0.75rem 1rem', border: '1px solid #d1d5db', borderRadius: 10, fontSize: '0.95rem', outline: 'none', width: '100%', boxSizing: 'border-box', background: '#fff' },
  inputErr: { borderColor: '#ef4444', background: '#fef2f2' },
  ferr: { color: '#ef4444', fontSize: '0.8rem', margin: 0 },
  cancelBtn: { padding: '0.5rem 1.25rem', background: '#f3f4f6', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, minWidth:44, minHeight:44, display:'inline-flex', alignItems:'center', justifyContent:'center' },
  submitBtn: { padding: '0.5rem 1.5rem', background: '#2563EB', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer', minWidth:44, minHeight:44, display:'inline-flex', alignItems:'center', justifyContent:'center' },
  addReqBtn: { alignSelf: 'flex-start', padding: '0.4rem 1rem', background: '#eff6ff', color: '#2563EB', border: '1px solid #bfdbfe', borderRadius: 8, cursor: 'pointer', fontWeight: 600, minHeight:44, minWidth:44, display:'inline-flex', alignItems:'center', justifyContent:'center' },
  removeReqBtn: { width: 44, height: 44, minWidth:44, minHeight:44, background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: '1.1rem' },
  infoCard: { background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '1rem', color: '#475569' },
  errorBanner: { display: 'flex', gap: '0.75rem', padding: '1rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, marginBottom: '1rem' },
  successBanner: { display: 'flex', gap: '0.75rem', padding: '1rem', background: '#ecfdf5', border: '1px solid #bbf7d0', borderRadius: 12, marginBottom: '1rem' },
  bannerIcon: { fontSize: '1.25rem' },
  bannerTitle: { margin: 0, fontWeight: 700, color: '#111827' },
  bannerText: { margin: 0, color: '#374151' },
  successCard: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '2.5rem', textAlign: 'center' },
  successIcon: { width: 56, height: 56, background: '#dcfce7', color: '#166534', borderRadius: '50%', fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' },
  resultJob: { background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 12, padding: '1.5rem', marginBottom: '2rem', textAlign: 'left' },
}
