import { CATEGORY_COLORS } from '../utils/categoryColors'
import SaveJobButton from './SaveJobButton'
import { useAuth } from '../context/AuthContext'

const TYPE_LABELS = {
  'full-time': 'Full-time',
  'part-time': 'Part-time',
  internship: 'Internship',
  freelance: 'Freelance',
}

const BriefcaseIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"></path>
  </svg>
)

const MapPinIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  </svg>
)

const JobCard = ({ job }) => {
  const { title, company, type, location, category } = job
  const { isAuthenticated, user } = useAuth()
  const categoryColor = CATEGORY_COLORS[category] ?? '#6b7280'
  const companyInitials = company?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() ?? '?'
  const typeLabel = TYPE_LABELS[type] || type

  const s = {
    card: {
      display: 'flex',
      flexDirection: 'column',
      gap: 0,
      padding: '0.875rem 1rem',
      background: '#ffffff',
      border: '1.5px solid #dbeafe',
      borderRadius: 12,
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      height: '100%',
      flex: 1,
      boxSizing: 'border-box',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
    },
    topRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    title: {
      fontSize: '0.95rem',
      fontWeight: 600,
      marginTop: 0,
      marginRight: 0,
      marginBottom: 2,
      marginLeft: 0,
      color: '#111827',
      lineHeight: 1.3,
    },
    companyRow: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      marginBottom: 10,
    },
    avatar: {
      width: '28px',
      height: '28px',
      borderRadius: 6,
      background: '#e5e7eb',
      color: '#374151',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '0.75rem',
      fontWeight: 700,
      flexShrink: 0,
    },
    company: {
      fontSize: '0.8rem',
      color: '#111827',
      marginTop: 0,
      marginRight: 0,
      marginBottom: 0,
      marginLeft: 0,
      fontWeight: 600,
    },
    divider: {
      height: '1px',
      background: '#e5e7eb',
      border: 'none',
      marginTop: 0,
      marginRight: '-1rem',
      marginBottom: 8,
      marginLeft: '-1rem',
    },
    meta: {
      fontSize: '0.78rem',
      color: '#6b7280',
      marginTop: 0,
      marginRight: 0,
      marginBottom: 8,
      marginLeft: 0,
      display: 'flex',
      gap: '0.5rem',
      alignItems: 'center',
    },
    metaItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.375rem',
      color: 'inherit',
    },
    badge: {
      display: 'inline-block',
      padding: '4px 12px',
      borderRadius: 16,
      fontSize: '0.75rem',
      fontWeight: 600,
      color: categoryColor,
      border: `1px solid ${categoryColor}`,
      background: `${categoryColor}18`,
      width: 'fit-content',
    },
    pendingBadge: {
      display: 'inline-block',
      padding: '4px 12px',
      borderRadius: 16,
      fontSize: '0.75rem',
      fontWeight: 600,
      color: '#1e40af',
      border: '1px solid #60a5fa',
      background: '#eff6ff',
      width: 'fit-content',
    },
  }

  return (
    <div
      style={s.card}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#60a5fa'
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#dbeafe'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      {/* Top row */}
      <div style={s.topRow}>
        {job.myApplication && job.myApplication.status === 'pending' ? (
          <span style={s.pendingBadge}>Pending</span>
        ) : (
          <span />
        )}
        {isAuthenticated && user?.role === 'jobSeeker' && (
          <SaveJobButton jobId={job._id} status={job.status} initialSaved={job.isSaved ?? false} />
        )}
      </div>

      {/* Title */}
      <h3 style={s.title}>{title}</h3>

      {/* Company row */}
      <div style={s.companyRow}>
        <div style={s.avatar}>{companyInitials}</div>
        <p style={s.company}>{company}</p>
      </div>

      {/* Divider */}
      <div style={s.divider} />

      {/* Meta row */}
      <p style={s.meta}>
        <span style={s.metaItem}>
          <BriefcaseIcon />
          {typeLabel}
        </span>
        <span>•</span>
        <span style={s.metaItem}>
          <MapPinIcon />
          {location}
        </span>
      </p>

      {/* Category badge */}
      <span style={s.badge}>{category || 'Other'}</span>
    </div>
  )
}

// no-op

export default JobCard
