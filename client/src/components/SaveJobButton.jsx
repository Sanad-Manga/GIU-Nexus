import { useState } from 'react'
import api from '../services/api'
import styles from '../styles/SaveJobButton.module.css'

const SaveJobButton = ({ jobId, jobStatus, initialSaved = false, onUnsave }) => {
  const [saved, setSaved] = useState(initialSaved)
  const [loading, setLoading] = useState(false)

  const toggle = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (jobStatus !== 'open' || loading) return

    const nextSaved = !saved
    setSaved(nextSaved)

    try {
      setLoading(true)
      const { data } = await api.post(`/jobs/${jobId}/save`)
      setSaved(data.saved)
      if (!data.saved && onUnsave) {
        onUnsave(jobId)
      }
    } catch {
      setSaved(!nextSaved)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      className={`${styles.btn}${saved ? ` ${styles.saved}` : ''}`}
      onClick={toggle}
      disabled={jobStatus !== 'open' || loading}
      aria-label={saved ? 'Unsave job' : 'Save job'}
      title={jobStatus !== 'open' ? 'Job is closed' : saved ? 'Unsave' : 'Save'}
    >
      <svg
        className={styles.icon}
        viewBox="0 0 24 24"
        fill={saved ? '#2563EB' : 'none'}
        stroke={saved ? '#2563EB' : '#6B7280'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
    </button>
  )
}

export default SaveJobButton
