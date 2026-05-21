import { useState, useEffect } from 'react'
`import { useNavigate, useParams } from 'react-router-dom'
import api from '../services/api'
import Spinner from '../components/Spinner'
import JobForm from '../components/JobForm'

const JOB_TYPES = ['full-time', 'part-time', 'internship', 'contract']

const EditJobPage = () => {
  const navigate = useNavigate()
  const { id } = useParams()

  const [job, setJob] = useState(null)
  const [form, setForm] = useState({
    title: '',
    company: '',
    description: '',
    location: '',
    type: 'full-time',
    status: 'open',
    salary: '',
    totalSlots: '',
  })
  const [requirements, setRequirements] = useState([''])
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true)
        const { data } = await api.get(`/jobs/${id}`)
        const jobData = data.job
        setJob(jobData)
        setForm({
          title: jobData.title || '',
          company: jobData.company || '',
          description: jobData.description || '',
          location: jobData.location || '',
          type: jobData.type || 'full-time',
          status: jobData.status || 'open',
          salary: jobData.salary ? String(jobData.salary) : '',
          totalSlots: jobData.totalSlots ? String(jobData.totalSlots) : '',
        })
        setRequirements(jobData.requirements?.length ? jobData.requirements : [''])
      } catch (err) {
        console.error('fetchJob error:', err)
        if (err.response?.status === 404) {
          setSubmitError('Job not found.')
        } else if (err.response?.status === 403) {
          setSubmitError('You are not allowed to edit this job.')
        } else {
          setSubmitError(err.response?.data?.message || 'Failed to load job details.')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchJob()
  }, [id])

  const validate = () => {
    const e = {}
    if (!form.title.trim()) e.title = 'Title is required.'
    if (!form.company.trim()) e.company = 'Company is required.'
    if (!form.description.trim()) e.description = 'Description is required.'
    if (!form.location.trim()) e.location = 'Location is required.'
    if (!form.type) e.type = 'Type is required.'
    if (!form.status) e.status = 'Status is required.'
    if (form.salary && isNaN(Number(form.salary))) e.salary = 'Salary must be a number.'
    if (form.totalSlots && (isNaN(Number(form.totalSlots)) || Number(form.totalSlots) < 1))
      e.totalSlots = 'Must be a positive number.'
    if (requirements.filter((r) => r.trim()).length === 0)
      e.requirements = 'Add at least one requirement.'
    return e
  }

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  const updateReq = (index, value) => {
    const next = [...requirements]
    next[index] = value
    setRequirements(next)
    if (errors.requirements) {
      setErrors((prev) => {
        const nextErr = { ...prev }
        delete nextErr.requirements
        return nextErr
      })
    }
  }

  const addReq = () => setRequirements((prev) => [...prev, ''])
  const removeReq = (index) => setRequirements((prev) => prev.filter((_, idx) => idx !== index))

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors)
      return
    }

    setSubmitting(true)
    setSubmitError('')
    try {
      const payload = {
        title: form.title.trim(),
        company: form.company.trim(),
        description: form.description.trim(),
        location: form.location.trim(),
        type: form.type,
        status: form.status,
        requirements: requirements.filter((req) => req.trim()),
      }
      if (form.salary) payload.salary = Number(form.salary)
      if (form.totalSlots) payload.totalSlots = Number(form.totalSlots)

      const { data } = await api.patch(`/jobs/${id}`, payload)
      setJob(data.job ?? data)
      setSuccessMessage('Job updated successfully.')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      let message = err.response?.data?.message || 'Failed to update job. Please try again.'
      if (err.response?.status === 403) {
        message = 'You are not authorised to edit this job.'
      } else if (err.response?.status === 400) {
        message = 'Please check all required fields are filled in correctly.'
      }
      setSubmitError(message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <Spinner />

  return (
    <div style={s.page}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={s.heading}>Edit Job</h1>
        <p style={s.subtitle}>Update your job post details and AI will re-classify the category if the description changes.</p>
      </div>

      {submitError && (
        <div style={s.errorBanner}>
          <span style={s.bannerIcon}>⚠️</span>
          <div>
            <p style={s.bannerTitle}>Unable to update job</p>
            <p style={s.bannerText}>{submitError}</p>
          </div>
        </div>
      )}

      {successMessage && (
        <div style={s.successBanner}>
          <span style={s.bannerIcon}>✓</span>
          <div>
            <p style={s.bannerTitle}>Success</p>
            <p style={s.bannerText}>{successMessage}</p>
          </div>
        </div>
      )}

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
        submitLabel={submitting ? 'Saving…' : 'Save Changes'}
        cancelLabel="Cancel"
        onCancel={() => navigate(-1)}
        showStatus={true}
        jobCategory={job?.category}
      />
    </div>
  )
}

const s = {
  page: { width: '720px', margin: '0 auto', padding: '2rem 1.5rem 4rem' },
  heading: { fontSize: '1.75rem', fontWeight: 700, margin: '0 0 0.375rem', color: '#111827' },
  subtitle: { color: '#6b7280', margin: 0 },
  form: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '0.375rem' },
  label: { fontSize: '0.875rem', fontWeight: 600, color: '#374151' },
  input: { padding: '0.75rem 1rem', border: '1px solid #d1d5db', borderRadius: 10, fontSize: '0.95rem', outline: 'none', width: '100%', boxSizing: 'border-box', background: '#fff' },
  inputErr: { borderColor: '#ef4444', background: '#fef2f2' },
  ferr: { color: '#ef4444', fontSize: '0.8rem', margin: 0 },
  cancelBtn: { padding: '0.75rem 1.25rem', background: '#f3f4f6', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 },
  submitBtn: { padding: '0.75rem 1.5rem', background: '#2563EB', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer' },
  addReqBtn: { alignSelf: 'flex-start', padding: '0.5rem 1rem', background: '#eff6ff', color: '#2563EB', border: '1px solid #bfdbfe', borderRadius: 8, cursor: 'pointer', fontWeight: 600 },
  removeReqBtn: { width: 32, height: 32, background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: '1.1rem' },
  infoCard: { background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '1rem', color: '#475569' },
  errorBanner: { display: 'flex', gap: '0.75rem', padding: '1rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, marginBottom: '1rem' },
  successBanner: { display: 'flex', gap: '0.75rem', padding: '1rem', background: '#ecfdf5', border: '1px solid #bbf7d0', borderRadius: 12, marginBottom: '1rem' },
  bannerIcon: { fontSize: '1.25rem' },
  bannerTitle: { margin: 0, fontWeight: 700, color: '#111827' },
  bannerText: { margin: 0, color: '#374151' },
}

export default EditJobPage;

