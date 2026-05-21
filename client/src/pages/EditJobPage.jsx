import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'
import styles from '../styles/EditJobPage.module.css'
import { categoryColors } from '../utils/categoryColors'

const EditJobPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    title: '', company: '', description: '',
    requirements: '', location: '', type: 'full-time',
    salary: '', totalSlots: '',
  })
  const [category, setCategory] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [pageError, setPageError] = useState('')
  const [formError, setFormError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    api.get(`/jobs/${id}`)
      .then(res => {
        const j = res.data.job
        setForm({
          title: j.title || '',
          company: j.company || '',
          description: j.description || '',
          requirements: Array.isArray(j.requirements) ? j.requirements.join(', ') : '',
          location: j.location || '',
          type: j.type || 'full-time',
          salary: j.salary ?? '',
          totalSlots: j.totalSlots ?? '',
        })
        setCategory(j.category || '')
      })
      .catch(err => {
        if (err.response?.status === 403) {
          setPageError('You are not authorised to edit this job.')
        } else {
          setPageError('Failed to load job. Please try again.')
        }
      })
      .finally(() => setLoading(false))
  }, [id])

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setFormError('')
    setSuccess(false)

    try {
      const payload = {
        ...form,
        requirements: form.requirements.split(',').map(r => r.trim()).filter(Boolean),
        salary: form.salary ? Number(form.salary) : undefined,
        totalSlots: form.totalSlots ? Number(form.totalSlots) : undefined,
      }

      const res = await api.patch(`/jobs/${id}`, payload)
      setCategory(res.data.job.category || '')
      setSuccess(true)
      window.scrollTo(0, 0)
    } catch (err) {
      if (err.response?.status === 403) {
        setFormError('You are not authorised to edit this job.')
      } else {
        setFormError(err.response?.data?.message || 'Failed to save changes.')
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className={styles.center}><div className={styles.spinner} /></div>
  if (pageError) return (
    <div className={styles.center}>
      <p className={styles.error}>{pageError}</p>
      <button className={styles.backBtn} onClick={() => navigate('/recruiter/dashboard')}>Back to Dashboard</button>
    </div>
  )

  const badgeColors = categoryColors[category] || categoryColors.Other

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h1 className={styles.title}>Edit Job</h1>
          {category && (
            <span className={styles.categoryBadge} style={{ backgroundColor: badgeColors?.bg, color: badgeColors?.text }}>
              {category}
            </span>
          )}
        </div>

        {success && <p className={styles.successMsg}>Job updated successfully!</p>}
        {formError && <p className={styles.error}>{formError}</p>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Job Title *</label>
            <input name="title" value={form.title} onChange={handleChange} required className={styles.input} />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Company *</label>
            <input name="company" value={form.company} onChange={handleChange} required className={styles.input} />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Description * <span className={styles.hint}>(changing this re-classifies the AI category)</span></label>
            <textarea name="description" value={form.description} onChange={handleChange} required rows={5} className={styles.textarea} />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Requirements <span className={styles.hint}>(comma-separated)</span></label>
            <input name="requirements" value={form.requirements} onChange={handleChange} className={styles.input} placeholder="React, Node.js, MongoDB" />
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Location *</label>
              <input name="location" value={form.location} onChange={handleChange} required className={styles.input} />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Type *</label>
              <select name="type" value={form.type} onChange={handleChange} required className={styles.select}>
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="internship">Internship</option>
                <option value="remote">Remote</option>
              </select>
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Salary (optional)</label>
              <input name="salary" type="number" value={form.salary} onChange={handleChange} className={styles.input} placeholder="e.g. 5000" />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Total Slots (optional)</label>
              <input name="totalSlots" type="number" value={form.totalSlots} onChange={handleChange} className={styles.input} placeholder="e.g. 3" />
            </div>
          </div>

          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={() => navigate('/recruiter/dashboard')}>Cancel</button>
            <button type="submit" className={styles.saveBtn} disabled={saving}>
              {saving ? <><span className={styles.btnSpinner} /> Saving...</> : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditJobPage
