import { useCallback, useEffect, useState } from 'react';
import Modal from '../components/Modal';
import api from '../services/api';
import '../styles/AdminPages.css';

const PAGE_SIZE = 10;

const ROLE_OPTIONS = [
  { value: 'jobSeeker', label: 'Job Seeker' },
  { value: 'recruiter', label: 'Recruiter' },
  { value: 'admin', label: 'Admin' },
];

const formatDate = (value) =>
  new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

const getTotalPages = (data) => {
  if (data.totalPages) return data.totalPages;
  return Math.max(1, Math.ceil((data.total || 0) / PAGE_SIZE));
};

const fetchGlobalStats = async () => {
  try {
    const res = await api.get('/users/stats');
    return res.data;
  } catch {
    const fallbackRes = await api.get('/users', { params: { page: 1, limit: 1000 } });
    const allUsers = fallbackRes.data.users || [];
    return {
      total: fallbackRes.data.total || allUsers.length,
      approved: allUsers.filter(u => u.status === 'approved').length,
      pending: allUsers.filter(u => u.status === 'pending').length,
      rejected: allUsers.filter(u => u.status === 'rejected').length,
    };
  }
};

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ role: '', status: '' });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modal, setModal] = useState({ open: false, userId: null, userName: '' });
  const [globalStats, setGlobalStats] = useState({ total: 0, approved: 0, pending: 0, rejected: 0 });

  const buildParams = useCallback(() => ({
    page,
    limit: PAGE_SIZE,
    ...(filters.role && { role: filters.role }),
    ...(filters.status && { status: filters.status }),
  }), [page, filters.role, filters.status]);

  const refreshUsers = async () => {
    const res = await api.get('/users', { params: buildParams() });
    setUsers(res.data.users || []);
    setTotalPages(getTotalPages(res.data));
  };

  const refreshStats = async () => {
    const stats = await fetchGlobalStats();
    setGlobalStats(stats);
  };

  useEffect(() => {
    let isMounted = true;
    fetchGlobalStats().then(stats => { if (isMounted) setGlobalStats(stats); });
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await api.get('/users', { params: buildParams() });
        if (isMounted) {
          setUsers(res.data.users || []);
          setTotalPages(getTotalPages(res.data));
          setError('');
        }
      } catch {
        if (isMounted) setError('Failed to load users.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchUsers();
    return () => { isMounted = false; };
  }, [page, filters.role, filters.status, buildParams]);

  const handleStatusFilter = (statusValue) => {
    setFilters(prev => ({ ...prev, status: statusValue }));
    setPage(1);
  };

  const handleStatusChange = async (userId, newStatus) => {
    try {
      await api.patch(`/users/${userId}/status`, { status: newStatus });
      await refreshUsers();
      await refreshStats();
    } catch {
      alert('Status update failed.');
    }
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/users/${modal.userId}`);
      setModal({ open: false, userId: null, userName: '' });
      await refreshUsers();
      await refreshStats();
    } catch {
      alert('Delete failed.');
    }
  };

  const roleLabel = (role) =>
    role === 'jobSeeker' ? 'Job Seeker' : role.charAt(0).toUpperCase() + role.slice(1);

  const roleClass = (role) => {
    if (role === 'admin') return 'admin-role-admin';
    if (role === 'recruiter') return 'admin-role-recruiter';
    return 'admin-role-seeker';
  };

  return (
    <section className="admin-page">
      <header className="admin-hero">
        <div>
          <p className="admin-kicker">User Governance</p>
          <h1>All Platform Users</h1>
          <p className="admin-subtitle">
            Review, moderate, and manage every account on the platform.
          </p>
        </div>
        <div className="admin-hero-stats">
          {[
            { label: 'Total Users', value: globalStats.total, filter: '' },
            { label: 'Approved', value: globalStats.approved, filter: 'approved' },
            { label: 'Pending', value: globalStats.pending, filter: 'pending' },
            { label: 'Rejected', value: globalStats.rejected, filter: 'rejected' },
          ].map(({ label, value, filter }) => (
            <div
              key={label}
              className={`admin-hero-stat${filters.status === filter ? ' admin-hero-stat-active' : ''}`}
              onClick={() => handleStatusFilter(filter)}
            >
              <span className="admin-stat-label">{label}</span>
              <span className="admin-stat-value">{value}</span>
            </div>
          ))}
        </div>
      </header>

      <section className="admin-card">
        <div className="admin-card-header">
          <div>
            <p className="admin-eyebrow">Users Registry</p>
            <h2>All Accounts</h2>
          </div>
          <span className="admin-pill">{globalStats.total} users</span>
        </div>

        <div className="admin-filter-bar">
          <select
            className="admin-filter-select"
            value={filters.role}
            onChange={e => { setFilters(prev => ({ ...prev, role: e.target.value })); setPage(1); }}
          >
            <option value="">All roles</option>
            {ROLE_OPTIONS.map(r => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
          {(filters.role || filters.status) && (
            <button
              className="admin-button admin-button-secondary"
              onClick={() => { setFilters({ role: '', status: '' }); setPage(1); }}
            >
              Clear filters
            </button>
          )}
        </div>

        {error ? <p className="admin-error">{error}</p> : null}

        {loading ? (
          <div className="admin-table-shell">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th><th>Email</th><th>Role</th>
                  <th>Status</th><th>Registered</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {[...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(6)].map((__, j) => (
                      <td key={j}>
                        <div className="admin-skeleton-line" style={{ width: j === 1 ? '80%' : '60%' }} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : users.length === 0 ? (
          <div className="admin-empty-state">
            <h3>No Users Found</h3>
            <p>Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="admin-table-shell">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th><th>Email</th><th>Role</th>
                  <th>Status</th><th>Registered</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id}>
                    <td>
                      <div className="admin-name-cell">
                        <div className="admin-avatar">
                          {user.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <span>{user.name}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{user.email}</td>
                    <td>
                      <span className={`admin-role-badge ${roleClass(user.role)}`}>
                        {roleLabel(user.role)}
                      </span>
                    </td>
                    <td>
                      <span className={`admin-status-badge admin-status-${user.status}`}>
                        {user.status}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                      {formatDate(user.createdAt)}
                    </td>
                    <td>
                      <div className="admin-action-group">
                        {user.status !== 'approved' && (
                          <button
                            type="button"
                            className="admin-button admin-button-success"
                            onClick={() => handleStatusChange(user._id, 'approved')}
                          >
                            Approve
                          </button>
                        )}
                        {user.status !== 'rejected' && (
                          <button
                            type="button"
                            className="admin-button admin-button-warn"
                            onClick={() => handleStatusChange(user._id, 'rejected')}
                          >
                            Reject
                          </button>
                        )}
                        <button
                          type="button"
                          className="admin-button admin-button-danger"
                          onClick={() => setModal({ open: true, userId: user._id, userName: user.name })}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && totalPages > 1 && (
          <div className="admin-pagination">
            <button
              className="admin-button admin-button-secondary"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </button>
            <div className="admin-page-numbers">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  className={`admin-page-num${page === i + 1 ? ' admin-page-num-active' : ''}`}
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              className="admin-button admin-button-secondary"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </section>

      <Modal
        isOpen={modal.open}
        onConfirm={confirmDelete}
        onCancel={() => setModal({ open: false, userId: null, userName: '' })}
        message={`Delete user "${modal.userName}"? This action cannot be undone.`}
      />
    </section>
  );
};

export default AdminUsersPage;
