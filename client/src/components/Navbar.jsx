import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import styles from './Navbar.module.css'

const roleLabels = {
  admin: 'Admin',
  recruiter: 'Recruiter',
  jobSeeker: 'Job seeker',
}


const getLinks = (user) => {
  if (!user) return [{ to: '/jobs', label: 'Jobs' }]

  if (user.role === 'jobSeeker') {
    return [
      { to: '/jobs', label: 'Jobs' },
      { to: '/jobs/recommended', label: 'Recommended' },
      { to: '/jobs/saved', label: 'Saved' },
      { to: '/applications/my', label: 'Applications' },
      { to: '/profile', label: 'Profile' },
    ]
  }

  if (user.role === 'recruiter') {
    return [
      { to: '/recruiter/dashboard', label: 'Dashboard' },
      { to: '/recruiter/jobs/create', label: 'Post job' },
    ]
  }

  if (user.role === 'admin') {
    return [
      { to: '/admin/dashboard', label: 'Dashboard' },
      { to: '/admin/recruiters', label: 'Recruiters' },
      { to: '/admin/jobs', label: 'Jobs' },
      { to: '/admin/users', label: 'Users' },
    ]
  }

  return []
}

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth()
  const links = getLinks(user)

  return (
    <header className={styles.shell}>
      <nav className={styles.nav} aria-label="Main navigation">
        <Link to="/" className={styles.brand}>
          <span className={styles.brandMark}>GN</span>
          <span className={styles.brandText}>
            <span className={styles.brandName}>GIU Nexus</span>
            <span className={styles.brandTag}>AI careers</span>
          </span>
        </Link>

        <div className={styles.links}>
          {links.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.activeLink : ''}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className={styles.actions}>
          {!isAuthenticated && (
            <>
              <NavLink to="/login" className={styles.loginLink}>
                Login
              </NavLink>
              <Link to="/register" className={styles.primaryAction}>
                Register
              </Link>
            </>
          )}

          {isAuthenticated && (
            <>
              <span className={styles.welcomeText}>
                Welcome, {user?.name?.split(' ')[0] || 'there'}
              </span>
              <div className={styles.userPill}>
                <span className={styles.userInitial}>
                  {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
                </span>
                <span className={styles.userMeta}>
                  <span className={styles.userName}>{user?.name || 'Account'}</span>
                  <span className={styles.userRole}>{roleLabels[user?.role] || 'User'}</span>
                </span>
              </div>
              <button className={styles.logoutBtn} type="button" onClick={logout}>
                Logout
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}

export default Navbar
