import { useState } from 'react'
import api from '../services/api'

const BookmarkIcon = ({ filled }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 2h12v18l-6-3-6 3V2z" fill={filled ? '#2563EB' : 'none'} stroke={filled ? '#2563EB' : '#6b7280'} strokeWidth="1.2" strokeLinejoin="round"/>
  </svg>
)

const SaveJobButton = ({ jobId, jobStatus, status, initialSaved = false, onUnsave }) => {
  const jsStatus = jobStatus ?? status
  const storageKey = `saved_job_${jobId}`
  const [saved, setSaved] = useState(() => {
    const stored = localStorage.getItem(storageKey)
    return stored !== null ? stored === 'true' : initialSaved
  })
  const [busy, setBusy] = useState(false)

  const toggle = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (jsStatus !== 'open' || busy) return

    const prev = saved
    const newState = !prev
    setSaved(newState)
    localStorage.setItem(storageKey, String(newState))
    setBusy(true)

    try {
      await api.post(`/jobs/${jobId}/save`)
      if (!newState && onUnsave) {
        onUnsave(jobId)
      }
    } catch {
      setSaved(prev)
      localStorage.setItem(storageKey, String(prev))
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={jsStatus !== 'open'}
      aria-pressed={saved}
      style={{
        background: 'transparent',
        border: 'none',
        padding: 8,
        cursor: jsStatus !== 'open' ? 'not-allowed' : 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        opacity: jsStatus !== 'open' ? 0.5 : 1
      }}
      title={saved ? 'Saved' : 'Save job'}
    >
      <BookmarkIcon filled={saved} />
    </button>
  )
}

export default SaveJobButton
