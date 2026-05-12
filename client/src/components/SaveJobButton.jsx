import { useState } from 'react'
import api from '../services/api'

const SaveJobButton = ({ jobId, status, initialSaved = false }) => {
  const [saved, setSaved] = useState(initialSaved)

  const toggle = async () => {
    if (status !== 'open') return
    const { data } = await api.post(`/jobs/${jobId}/save`)
    setSaved(data.saved)
  }

  return (
    <button onClick={toggle} disabled={status !== 'open'}>
      {saved ? 'Unsave' : 'Save'}
    </button>
  )
}

export default SaveJobButton
