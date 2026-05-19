import { CATEGORY_COLORS } from '../utils/categoryColors'
import SaveJobButton from './SaveJobButton'
import { useAuth } from '../context/AuthContext'

const JobCard = ({ job }) => {
  const { title, company, type, location, category } = job
  const { isAuthenticated, user } = useAuth()
  const categoryColor = CATEGORY_COLORS[category] ?? '#6b7280'

  const s = {
    card: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.875rem',
      padding: '1.5rem',
      background: '#ffffff',
      border: '1.5px solid #dbeafe',
      borderRadius: 12,
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      height: '100%',
      flex: 1,
      boxSizing: 'border-box',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
      position: 'relative',
    },
    title: {
      fontSize: '1.1rem',
      fontWeight: 700,
      margin: 0,
      color: '#111827',
      lineHeight: 1.3,
      textAlign: 'center',
    },
    company: {
      fontSize: '0.95rem',
      color: '#6b7280',
      margin: 0,
      fontWeight: 500,
      textAlign: 'center',
    },
    meta: {
      fontSize: '0.85rem',
      color: '#6b7280',
      margin: 0,
      display: 'flex',
      gap: '0.375rem',
      justifyContent: 'center',
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
      margin: '0 auto',
    },
  }

  return (
    <div
      style={s.card}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#60a5fa'
        e.currentTarget.style.boxShadow = '0 8px 16px rgba(96, 165, 250, 0.2)'
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.zIndex = 10
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#dbeafe'
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)'
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.zIndex = 0
      }}
    >
      {/* Save button for job seekers */}
      <div style={{ position: 'absolute', top: 10, right: 10 }}>
        {isAuthenticated && user?.role === 'jobSeeker' && (
          <SaveJobButton jobId={job._id} status={job.status} initialSaved={job.isSaved ?? false} />
        )}
      </div>
      <div style={{ textAlign: 'center' }}>
        <h3 style={s.title}>{title}</h3>
        <p style={s.company}>{company}</p>
        <p style={s.meta}>{type} · {location}</p>
      </div>
      <span style={s.badge}>{category || 'Other'}</span>
    </div>
  )
}

// no-op

export default JobCard
