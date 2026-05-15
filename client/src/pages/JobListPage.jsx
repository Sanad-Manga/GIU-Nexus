import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import api from '../services/api'
import JobCard from '../components/JobCard'
import Spinner from '../components/Spinner'

const JOB_TYPES    = ['full-time', 'part-time', 'internship', 'contract']
const JOB_STATUSES = ['open', 'closed']
const LIMIT = 12

export default function JobListPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  const keyword  = searchParams.get('keyword')  || ''
  const location = searchParams.get('location') || ''
  const type     = searchParams.get('type')     || ''
  const status   = searchParams.get('status')   || ''
  const page     = parseInt(searchParams.get('page') || '1', 10)

  const [jobs,    setJobs]    = useState([])
  const [total,   setTotal]   = useState(0)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  // Draft state for filter form — only pushed to URL on submit
  const [draft, setDraft] = useState({ keyword, location, type, status })
  
  // Dropdown open states
  const [typeOpen, setTypeOpen] = useState(false)
  const [statusOpen, setStatusOpen] = useState(false)
  const typeRef = useRef(null)
  const statusRef = useRef(null)

  const fetchJobs = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = { page, limit: LIMIT }
      if (keyword)  params.keyword  = keyword
      if (location) params.location = location
      if (type)     params.type     = type
      if (status)   params.status   = status
      const { data } = await api.get('/jobs', { params })
      setJobs(data.jobs ?? data.data ?? [])
      setTotal(data.total ?? 0)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load jobs. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [keyword, location, type, status, page])

  useEffect(() => { fetchJobs() }, [fetchJobs])

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (typeRef.current && !typeRef.current.contains(e.target)) setTypeOpen(false)
      if (statusRef.current && !statusRef.current.contains(e.target)) setStatusOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Keep draft in sync when URL changes (back/forward browser nav)
  useEffect(() => {
    setDraft({ keyword, location, type, status })
  }, [keyword, location, type, status])

  const handleSubmit = (e) => {
    e.preventDefault()
    const next = { page: '1' }
    if (draft.keyword)  next.keyword  = draft.keyword
    if (draft.location) next.location = draft.location
    if (draft.type)     next.type     = draft.type
    if (draft.status)   next.status   = draft.status
    setSearchParams(next)
  }

  const handleReset = () => {
    setDraft({ keyword: '', location: '', type: '', status: '' })
    setSearchParams({ page: '1' })
  }

  const removeFilter = (key) => {
    const next = Object.fromEntries(searchParams.entries())
    delete next[key]
    next.page = '1'
    setSearchParams(next)
  }

  const goToPage = (p) => {
    const next = Object.fromEntries(searchParams.entries())
    next.page = String(p)
    setSearchParams(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const totalPages = Math.ceil(total / LIMIT)

  return (
    <div style={s.page}>
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      <div style={s.header}>
        <h1 style={s.title}>Find Your Next Role</h1>
        <p style={s.subtitle}>
          {total > 0 ? `${total} job${total !== 1 ? 's' : ''} available` : 'Browse open positions'}
        </p>
      </div>

      {/* ── Filter bar ── */}
      <form onSubmit={handleSubmit} style={s.filterBar}>
        <input
          style={s.input}
          type="text"
          placeholder="Keyword (title, company…)"
          value={draft.keyword}
          onChange={e => setDraft(d => ({ ...d, keyword: e.target.value }))}
        />
        <input
          style={s.input}
          type="text"
          placeholder="Location"
          value={draft.location}
          onChange={e => setDraft(d => ({ ...d, location: e.target.value }))}
        />
        <div ref={typeRef} style={{ position: 'relative', flex: '1 1 140px' }}>
          <button
            style={s.select}
            onClick={() => { setTypeOpen(!typeOpen); setStatusOpen(false) }}
            onMouseEnter={e => e.target.style.borderColor = 'var(--accent)'}
            onMouseLeave={e => e.target.style.borderColor = typeOpen ? 'var(--accent)' : 'var(--border)'}
          >
            <span style={{ flex: 1, textAlign: 'center' }}>{draft.type ? draft.type.charAt(0).toUpperCase() + draft.type.slice(1) : 'All types'}</span>
            <span style={{ fontSize: '0.7rem', opacity: 0.6, marginLeft: 'auto' }}>▼</span>
          </button>
          {typeOpen && (
            <div style={{ position: 'absolute', top: '100%', left: 0, width: '100%', marginTop: '1rem', backgroundColor: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)', zIndex: 1001, maxHeight: '220px', overflowY: 'auto' }}>
              <div style={{ padding: '0.5rem 0.75rem', cursor: 'pointer', color: 'var(--text-h)', fontSize: '0.9rem', backgroundColor: !draft.type ? 'var(--code-bg)' : 'transparent' }} onClick={() => { setDraft(d => ({ ...d, type: '' })); setTypeOpen(false) }}>All types</div>
              {JOB_TYPES.map(t => (
                <div key={t} style={{ padding: '0.5rem 0.75rem', cursor: 'pointer', color: 'var(--text-h)', fontSize: '0.9rem', backgroundColor: draft.type === t ? 'var(--code-bg)' : 'transparent' }} onMouseEnter={e => draft.type !== t && (e.currentTarget.style.backgroundColor = 'var(--code-bg)')} onMouseLeave={e => draft.type !== t && (e.currentTarget.style.backgroundColor = 'transparent')} onClick={() => { setDraft(d => ({ ...d, type: t })); setTypeOpen(false) }}>{t.charAt(0).toUpperCase() + t.slice(1)}</div>
              ))}
            </div>
          )}
        </div>
        
        <div ref={statusRef} style={{ position: 'relative', flex: '1 1 140px' }}>
          <button
            style={s.select}
            onClick={() => { setStatusOpen(!statusOpen); setTypeOpen(false) }}
            onMouseEnter={e => e.target.style.borderColor = 'var(--accent)'}
            onMouseLeave={e => e.target.style.borderColor = statusOpen ? 'var(--accent)' : 'var(--border)'}
          >
            <span style={{ flex: 1, textAlign: 'center' }}>{draft.status ? draft.status.charAt(0).toUpperCase() + draft.status.slice(1) : 'Any Status'}</span>
            <span style={{ fontSize: '0.7rem', opacity: 0.6, marginLeft: 'auto' }}>▼</span>
          </button>
          {statusOpen && (
            <div style={{ position: 'absolute', top: '100%', left: 0, width: '100%', marginTop: '1rem', backgroundColor: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)', zIndex: 1001, maxHeight: '220px', overflowY: 'auto' }}>
              <div style={{ padding: '0.5rem 0.75rem', cursor: 'pointer', color: 'var(--text-h)', fontSize: '0.9rem', backgroundColor: !draft.status ? 'var(--code-bg)' : 'transparent' }} onClick={() => { setDraft(d => ({ ...d, status: '' })); setStatusOpen(false) }}>Any Status</div>
              {JOB_STATUSES.map(st => (
                <div key={st} style={{ padding: '0.5rem 0.75rem', cursor: 'pointer', color: 'var(--text-h)', fontSize: '0.9rem', backgroundColor: draft.status === st ? 'var(--code-bg)' : 'transparent' }} onMouseEnter={e => draft.status !== st && (e.currentTarget.style.backgroundColor = 'var(--code-bg)')} onMouseLeave={e => draft.status !== st && (e.currentTarget.style.backgroundColor = 'transparent')} onClick={() => { setDraft(d => ({ ...d, status: st })); setStatusOpen(false) }}>{st.charAt(0).toUpperCase() + st.slice(1)}</div>
              ))}
            </div>
          )}
        </div>
        <button type="submit" style={s.searchBtn}>Search</button>
        <button type="button" onClick={handleReset} style={s.resetBtn}>Reset</button>
      </form>

      {/* ── Active filter chips ── */}
      {(keyword || location || type || status) && (
        <div style={s.chips}>
          {[
            keyword  && { label: `"${keyword}"`,   key: 'keyword' },
            location && { label: `📍 ${location}`, key: 'location' },
            type     && { label: type,              key: 'type' },
            status   && { label: status,            key: 'status' },
          ].filter(Boolean).map(chip => (
            <span key={chip.key} style={s.chip}>
              {chip.label}
              <button style={s.chipX} onClick={() => removeFilter(chip.key)}>×</button>
            </span>
          ))}
        </div>
      )}

      {/* ── Body ── */}
      {loading ? (
        <Spinner />
      ) : error ? (
        <div style={s.error}>
          <p>{error}</p>
          <button onClick={fetchJobs} style={s.retryBtn}>Try again</button>
        </div>
      ) : jobs.length === 0 ? (
        <div style={s.empty}>
          <p style={{ color: '#6b7280', marginBottom: '1rem' }}>No jobs match your filters.</p>
          <button onClick={handleReset} style={s.resetBtn}>Clear filters</button>
        </div>
      ) : (
        <>
          <div style={s.grid}>
            {jobs.map(job => (
              <Link key={job._id} to={`/jobs/${job._id}`} style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column' }}>
                <JobCard job={job} />
              </Link>
            ))}
          </div>

          {/* ── Pagination ── */}
          {totalPages > 1 && (
            <div style={s.pagination}>
              <button
                style={{ ...s.pageBtn, opacity: page <= 1 ? 0.4 : 1 }}
                disabled={page <= 1}
                onClick={() => goToPage(page - 1)}
              >← Prev</button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => Math.abs(p - page) <= 2 || p === 1 || p === totalPages)
                .reduce((acc, p, idx, arr) => {
                  if (idx > 0 && p - arr[idx - 1] > 1) acc.push('…')
                  acc.push(p)
                  return acc
                }, [])
                .map((p, i) => p === '…'
                  ? <span key={`d${i}`} style={{ padding: '0 0.25rem', color: '#9ca3af' }}>…</span>
                  : <button
                      key={p}
                      style={{ ...s.pageBtn, ...(p === page ? s.pageActive : {}) }}
                      onClick={() => goToPage(p)}
                    >{p}</button>
                )}

              <button
                style={{ ...s.pageBtn, opacity: page >= totalPages ? 0.4 : 1 }}
                disabled={page >= totalPages}
                onClick={() => goToPage(page + 1)}
              >Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

const s = {
  page:      { maxWidth: 'none', margin: '0 auto', padding: '2rem 0.5rem 4rem', fontFamily: 'sans-serif' },
  header:    { marginBottom: '2rem', animation: 'fadeInDown 0.6s ease-out' },
  title:     { fontSize: '2rem', fontWeight: 700, color: 'var(--text-h)', margin: 0 },
  subtitle:  { color: 'var(--text)', marginTop: '0.375rem', fontSize: '0.95rem' },
  filterBar: { display: 'flex', flexWrap: 'wrap', gap: '0.625rem', marginBottom: '1rem', background: 'var(--bg)', border: '1px solid var(--accent)', borderRadius: 12, padding: '0.75rem', animation: 'fadeInDown 0.6s ease-out 0.1s backwards', overflow: 'visible', position: 'relative', boxShadow: '0 6px 20px var(--accent-bg)' },
  input:     { flex: '1 1 180px', padding: '0.6rem 0.875rem', border: '1px solid var(--border)', borderRadius: 8, fontSize: '0.9rem', outline: 'none', background: 'var(--code-bg)', color: 'var(--text-h)' },
  select:    { width: '100%', padding: '0.6rem 0.875rem', border: '1px solid var(--border)', borderRadius: 12, fontSize: '0.9rem', background: 'var(--code-bg)', color: 'var(--text-h)', cursor: 'pointer', transition: 'all 0.2s ease', appearance: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'center' },
  searchBtn: { padding: '0.6rem 1.5rem', background: '#2563EB', color: '#fff', border: 'none', borderRadius: 8, fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' },
  resetBtn:  { padding: '0.6rem 1rem', background: 'transparent', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 8, fontSize: '0.9rem', cursor: 'pointer' },
  chips:     { display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem', animation: 'fadeIn 0.4s ease-out 0.2s backwards' },
  chip:      { display: 'inline-flex', alignItems: 'center', gap: '0.375rem', background: 'var(--accent-bg)', color: 'var(--accent)', border: '1px solid var(--accent-border)', borderRadius: 20, padding: '0.25rem 0.75rem', fontSize: '0.8rem', fontWeight: 500 },
  chipX:     { background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: '1rem', lineHeight: 1, padding: 0 },
  error:     { textAlign: 'center', padding: '3rem', color: '#b91c1c', animation: 'fadeIn 0.5s ease-out' },
  retryBtn:  { marginTop: '1rem', padding: '0.5rem 1.25rem', background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: 8, cursor: 'pointer' },
  empty:     { textAlign: 'center', padding: '4rem 0', animation: 'fadeIn 0.5s ease-out' },
  grid:      { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem', alignItems: 'stretch', animation: 'fadeIn 0.5s ease-out 0.2s backwards' },
  pagination:{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap', animation: 'fadeIn 0.5s ease-out 0.3s backwards' },
  pageBtn:   { padding: '0.5rem 0.875rem', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--code-bg)', color: 'var(--text)', fontSize: '0.9rem', cursor: 'pointer' },
  pageActive:{ background: '#2563EB', color: '#fff', border: '1px solid #2563EB', fontWeight: 600 },
}
