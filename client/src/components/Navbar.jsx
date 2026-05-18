import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout(navigate)
  }

  return (
    <nav>
      <Link to="/">GIU Nexus</Link>
      {!isAuthenticated && (
        <>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </>
      )}
      {isAuthenticated && user?.role === 'jobSeeker' && (
        <>
          <Link to="/jobs">Jobs</Link>
          <Link to="/jobs/recommended">Recommended</Link>
          <Link to="/jobs/saved">Saved</Link>
          <Link to="/applications/my">My Applications</Link>
          <Link to="/profile">Profile</Link>
        </>
      )}
      {isAuthenticated && user?.role === 'recruiter' && (
        <>
          <Link to="/recruiter/dashboard">Dashboard</Link>
          <Link to="/recruiter/jobs/create">Post Job</Link>
        </>
      )}
      {isAuthenticated && user?.role === 'admin' && (
        <>
          <Link to="/admin/dashboard">Dashboard</Link>
          <Link to="/admin/recruiters">Recruiters</Link>
          <Link to="/admin/jobs">Jobs</Link>
          <Link to="/admin/users">Users</Link>
        </>
      )}
      {isAuthenticated && <button onClick={handleLogout}>Logout</button>}
    </nav>
  )
}

export default Navbar
