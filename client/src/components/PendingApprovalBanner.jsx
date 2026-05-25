import { Link } from 'react-router-dom'

const ClockIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)

const steps = [
  { label: 'Account submitted', done: true },
  { label: 'Admin review in progress', done: false, active: true },
  { label: 'Access granted — start posting', done: false },
]

export default function PendingApprovalBanner() {
  return (
    <div style={s.wrapper}>
      <div style={s.card}>
        <div style={s.iconRing}>
          <ClockIcon />
        </div>

        <h2 style={s.title}>Your account is under review</h2>
        <p style={s.sub}>
          Our admin team is verifying your recruiter account. This usually takes less than 24 hours.
          You'll be able to post jobs and review applicants as soon as you're approved.
        </p>

        <div style={s.steps}>
          {steps.map((step, i) => (
            <div key={i} style={s.step}>
              <div style={{
                ...s.dot,
                background: step.done ? '#10b981' : step.active ? '#f59e0b' : '#e5e7eb',
                border: step.active ? '2px solid #fbbf24' : 'none',
              }} />
              {i < steps.length - 1 && (
                <div style={{ ...s.line, background: step.done ? '#10b981' : '#e5e7eb' }} />
              )}
              <span style={{
                ...s.stepLabel,
                color: step.done ? '#065f46' : step.active ? '#92400e' : '#9ca3af',
                fontWeight: step.active ? 600 : 400,
              }}>
                {step.label}
              </span>
            </div>
          ))}
        </div>

        <Link to="/" style={s.btn}>Back to Home</Link>
      </div>
    </div>
  )
}

const s = {
  wrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    padding: '4rem 1.5rem',
    minHeight: '60vh',
  },
  card: {
    background: '#fff',
    border: '1.5px solid #fde68a',
    borderRadius: 16,
    padding: '2.5rem 2rem',
    maxWidth: 480,
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '1rem',
    boxShadow: '0 4px 24px rgba(251, 191, 36, 0.12)',
  },
  iconRing: {
    width: 72,
    height: 72,
    borderRadius: '50%',
    background: '#fffbeb',
    border: '1.5px solid #fde68a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '0.25rem',
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: '#111827',
    margin: 0,
  },
  sub: {
    fontSize: '0.9rem',
    color: '#6b7280',
    lineHeight: 1.65,
    margin: 0,
  },
  steps: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 0,
    width: '100%',
    margin: '0.5rem 0',
    padding: '1rem 1.25rem',
    background: '#fafafa',
    borderRadius: 10,
    border: '1px solid #f3f4f6',
  },
  step: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    position: 'relative',
    paddingBottom: 20,
    width: '100%',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: '50%',
    flexShrink: 0,
    zIndex: 1,
  },
  line: {
    position: 'absolute',
    left: 5,
    top: 14,
    width: 2,
    height: 20,
  },
  stepLabel: {
    fontSize: '0.85rem',
  },
  btn: {
    marginTop: '0.5rem',
    padding: '0.6rem 1.5rem',
    background: '#1f2937',
    color: '#fff',
    borderRadius: 8,
    textDecoration: 'none',
    fontSize: '0.875rem',
    fontWeight: 600,
    transition: 'opacity 0.15s',
  },
}
