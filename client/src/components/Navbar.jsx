import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import styles from './Navbar.module.css'

const SunIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
)

const MoonIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
)

const ProfileIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="8" r="4"/>
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
  </svg>
)

const roleLabels = {
  admin: 'Admin',
  recruiter: 'Recruiter',
  jobSeeker: 'Job seeker',
}


const getLinks = (user) => {
  if (!user) return []

  if (user.role === 'jobSeeker') {
    return [
      { to: '/jobs', label: 'Jobs' },
      { to: '/jobs/recommended', label: 'Recommended' },
      { to: '/jobs/saved', label: 'Saved' },
      { to: '/applications/my', label: 'Applications' },
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
  const { isDark, toggleTheme } = useTheme()
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
              className={() => {
                const isActive = window.location.pathname === link.to;
                return `${styles.navLink} ${isActive ? styles.activeLink : ''}`;
              }}
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className={styles.actions}>
          <button className={styles.themeToggle} onClick={toggleTheme} title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
            {isDark ? <SunIcon /> : <MoonIcon />}
          </button>

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
              <Link
                to="/profile"
                className={styles.userPillLink}
                title="View your profile"
              >
                {user?.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt={user.name}
                    className={styles.userAvatar}
                  />
                ) : (
                  <span className={styles.userInitial}>
                    {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
                  </span>
                )}
                <span className={styles.userMeta}>
                  <span className={styles.userName}>{user?.name || 'Account'}</span>
                  <span className={styles.userRole}>{roleLabels[user?.role] || 'User'}</span>
                </span>
                <span className={styles.profileIconWrap}>
                  <ProfileIcon />
                </span>
              </Link>
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