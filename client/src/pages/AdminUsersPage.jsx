import { useCallback, useEffect, useState } from 'react';
import Modal from '../components/Modal';
import api from '../services/api';
import styles from './AdminUsersPage.module.css';

const PAGE_SIZE = 10;

const STATUS_OPTIONS = [
  { value: 'approved', label: 'Approved' },
  { value: 'pending', label: 'Pending' },
  { value: 'rejected', label: 'Rejected' },
];

const getTotalPages = (data) => {
  if (data.totalPages) return data.totalPages;
  return Math.max(1, Math.ceil((data.total || 0) / PAGE_SIZE));
};

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ role: '', status: '' });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modal, setModal] = useState({ open: false, userId: null, userName: '' });

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

  useEffect(() => {
    let isMounted = true;
    const fetchUsers = async () => {
      try {
        setLoading(true);
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

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleStatusChange = async (userId, newStatus) => {
    try {
      await api.patch(`/users/${userId}/status`, { status: newStatus });
      await refreshUsers();
    } catch {
      alert('Status update failed.');
    }
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/users/${modal.userId}`);
      setModal({ open: false, userId: null, userName: '' });
      await refreshUsers();
    } catch {
      alert('Delete failed.');
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Manage Users</h1>
        <p className={styles.pageSub}>View, filter, and manage all platform users</p>
      </div>

      <div className={styles.content}>
        <div className={styles.filterBar}>
          <select
            className={styles.filterSelect}
            value={filters.role}
            onChange={e => handleFilterChange('role', e.target.value)}
          >
            <option value="">All roles</option>
            <option value="jobSeeker">Job Seeker</option>
            <option value="recruiter">Recruiter</option>
            <option value="admin">Admin</option>
          </select>
          <select
            className={styles.filterSelect}
            value={filters.status}
            onChange={e => handleFilterChange('status', e.target.value)}
          >
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          {(filters.role || filters.status) && (
            <button
              className={styles.clearBtn}
              onClick={() => { setFilters({ role: '', status: '' }); setPage(1); }}
            >
              Clear filters
            </button>
          )}
        </div>

        {loading && (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>Name</th>
                  <th className={styles.th}>Email</th>
                  <th className={styles.th}>Role</th>
                  <th className={styles.th}>Status</th>
                  <th className={styles.th}>Registered</th>
                  <th className={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {[...Array(5)].map((_, i) => (
                  <tr key={i} className={styles.tr}>
                    {[...Array(6)].map((__, j) => (
                      <td key={j} className={styles.td}>
                        <div className={styles.skeletonLine} style={{ width: j === 1 ? '80%' : '60%' }} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && error && (
          <p className={styles.errorText}>{error}</p>
        )}

        {!loading && !error && (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>Name</th>
                  <th className={styles.th}>Email</th>
                  <th className={styles.th}>Role</th>
                  <th className={styles.th}>Status</th>
                  <th className={styles.th}>Registered</th>
                  <th className={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 && (
                  <tr>
                    <td colSpan={6} className={styles.emptyRow}>No users found.</td>
                  </tr>
                )}
                {users.map(user => (
                  <tr key={user._id} className={styles.tr}>
                    <td className={styles.td}>
                      <div className={styles.nameCell}>
                        <div className={styles.avatar}>
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <span className={styles.userName}>{user.name}</span>
                      </div>
                    </td>
                    <td className={styles.td}>
                      <span className={styles.emailText}>{user.email}</span>
                    </td>
                    <td className={styles.td}>
                      <span className={styles.roleText}>{user.role}</span>
                    </td>
                    <td className={styles.td}>
                      <select
                        className={styles.statusSelect}
                        value={user.status}
                        onChange={e => handleStatusChange(user._id, e.target.value)}
                      >
                        {STATUS_OPTIONS.map(s => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className={styles.td}>
                      <span className={styles.dateText}>
                        {new Date(user.createdAt).toLocaleDateString('en-GB', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </span>
                    </td>
                    <td className={styles.td}>
                      <button
                        className={styles.deleteBtn}
                        onClick={() => setModal({ open: true, userId: user._id, userName: user.name })}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && totalPages > 1 && (
          <div className={styles.pagination}>
            <button
              className={styles.pageBtn}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </button>
            <div className={styles.pageNumbers}>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  className={`${styles.pageNum} ${page === i + 1 ? styles.pageNumActive : ''}`}
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              className={styles.pageBtn}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>

      <Modal
        isOpen={modal.open}
        onConfirm={confirmDelete}
        onCancel={() => setModal({ open: false, userId: null, userName: '' })}
        message={`Delete user "${modal.userName}"? This action cannot be undone.`}
      />
    </div>
  );
};

export default AdminUsersPage;