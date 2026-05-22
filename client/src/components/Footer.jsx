import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const TEAM = [
  'Ahmed Sanad',
  'Ziad Mohsen',
  'Abdelrahman ElGabarty',
  'Mohamed Walid',
  'Ali Issa',
  'Mohamed Nazmy',
  'Mostafa Ayman',
  'Baraa Tantawy',
  'Eyad Nader',
]

const getNav = (role, isAuthenticated) => {
  if (!isAuthenticated) {
    return [
      {
        heading: 'Account',
        items: [
          { label: 'Sign In', to: '/login' },
          { label: 'Create Account', to: '/register' },
        ],
      },
    ]
  }

  if (role === 'jobSeeker') {
    return [
      {
        heading: 'Platform',
        items: [
          { label: 'Browse Jobs', to: '/jobs' },
          { label: 'Recommended Jobs', to: '/jobs/recommended' },
          { label: 'Saved Jobs', to: '/jobs/saved' },
        ],
      },
      {
        heading: 'My Account',
        items: [
          { label: 'My Profile', to: '/profile' },
          { label: 'My Applications', to: '/applications/my' },
        ],
      },
    ]
  }

  if (role === 'recruiter') {
    return [
      {
        heading: 'My Account',
        items: [
          { label: 'Dashboard', to: '/recruiter/dashboard' },
          { label: 'Post a Job', to: '/recruiter/jobs/create' },
        ],
      },
    ]
  }

  if (role === 'admin') {
    return [
      {
        heading: 'Admin',
        items: [
          { label: 'Dashboard', to: '/admin/dashboard' },
          { label: 'Manage Users', to: '/admin/users' },
          { label: 'Manage Jobs', to: '/admin/jobs' },
          { label: 'Manage Recruiters', to: '/admin/recruiters' },
        ],
      },
    ]
  }

  return []
}

const Footer = () => {
  const { user, isAuthenticated } = useAuth()
  const nav = getNav(user?.role, isAuthenticated)

  return (
    <footer style={s.root}>
      <div style={s.inner}>
        <div style={s.brand}>
          <span style={s.logo}>
            <span style={{ color: '#2563EB' }}>GIU</span> Nexus
          </span>
          <p style={s.tagline}>
            AI-powered matching between talent and opportunity.
          </p>
        </div>

        <div style={s.nav}>
          {nav.map(({ heading, items }) => (
            <div key={heading} style={s.col}>
              <span style={s.colHead}>{heading}</span>
              {items.map(({ label, to }) => (
                <Link
                  key={to}
                  to={to}
                  style={s.link}
                  onMouseEnter={e => { e.currentTarget.style.color = '#2563EB' }}
                  onMouseLeave={e => { e.currentTarget.style.color = '#6B7280' }}
                >
                  {label}
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div style={s.bar}>
        <span style={s.meta}>© {new Date().getFullYear()} GIU Nexus. All rights reserved.</span>
        <span style={s.meta}>
          Built by {TEAM.join(' · ')}
        </span>
      </div>
    </footer>
  )
}

const s = {
  root: {
    background: 'var(--card-bg)',
    borderTop: '1px solid var(--border)',
    fontFamily: "'Inter', sans-serif",
    marginTop: 'auto',
  },
  inner: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '48px 2rem 32px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '3rem',
    flexWrap: 'wrap',
  },
  brand: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    flex: 1,
    minWidth: '180px',
    maxWidth: '280px',
  },
  logo: {
    fontSize: '20px',
    fontWeight: 800,
    color: 'var(--text-primary)',
    letterSpacing: '-0.03em',
  },
  tagline: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    lineHeight: 1.65,
    margin: 0,
  },
  nav: {
    display: 'flex',
    gap: '3rem',
    flexWrap: 'wrap',
  },
  col: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  colHead: {
    fontSize: '11px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: 'var(--text-primary)',
    marginBottom: '2px',
  },
  link: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    textDecoration: 'none',
    transition: 'color 0.15s',
  },
  bar: {
    borderTop: '1px solid var(--surface)',
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '18px 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '8px',
  },
  meta: {
    fontSize: '13px',
    color: 'var(--text-tertiary)',
  },
}

export default Footer
