// src/pages/AdminUsersPage.jsx
import { useEffect, useState } from 'react';
import Modal from '../components/Modal';
import api from '../services/api';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ role: '', status: '' });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modal, setModal] = useState({ open: false, userId: null, userName: '' });

  // Fetch users whenever filters or page change
  useEffect(() => {
    let isMounted = true;

    const fetchUsers = async () => {
      try {
        setLoading(true);
        const params = {
          page,
          limit: 10,
          ...(filters.role && { role: filters.role }),
          ...(filters.status && { status: filters.status }),
        };
        const res = await api.get('/users', { params });
        if (isMounted) {
          setUsers(res.data.data || []);
          setTotalPages(res.data.totalPages || 1);
          setError('');
        }
      } catch {
        if (isMounted) setError('Failed to load users');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchUsers();

    return () => {
      isMounted = false;
    };
  }, [page, filters.role, filters.status]); // dependencies directly on state

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleStatusChange = async (userId, newStatus) => {
    try {
      await api.patch(`/users/${userId}/status`, { status: newStatus });
      // Refetch users (effect will run because page/filters didn't change, but we need fresh data)
      // Better: update local state optimistically or call a manual refetch.
      // We'll just trigger a re-fetch by toggling a dummy state – but simplest is to call fetch again.
      // To avoid duplicating code, we can force effect to re-run by updating a key. Instead, let's just re-fetch manually.
      const params = {
        page,
        limit: 10,
        ...(filters.role && { role: filters.role }),
        ...(filters.status && { status: filters.status }),
      };
      const res = await api.get('/users', { params });
      setUsers(res.data.data || []);
      setTotalPages(res.data.totalPages || 1);
    } catch {
      alert('Status update failed');
    }
  };

  const openDeleteModal = (userId, userName) => {
    setModal({ open: true, userId, userName });
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/users/${modal.userId}`);
      setModal({ open: false, userId: null, userName: '' });
      // Refresh list
      const params = {
        page,
        limit: 10,
        ...(filters.role && { role: filters.role }),
        ...(filters.status && { status: filters.status }),
      };
      const res = await api.get('/users', { params });
      setUsers(res.data.data || []);
      setTotalPages(res.data.totalPages || 1);
    } catch {
      alert('Delete failed');
    }
  };

  if (loading && users.length === 0) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading users...</div>;
  }

  if (error) {
    return <div style={{ color: '#EF4444', textAlign: 'center', padding: '2rem' }}>{error}</div>;
  }

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1rem' }}>
      <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Manage Users</h1>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <select
          value={filters.role}
          onChange={(e) => handleFilterChange('role', e.target.value)}
          style={{ border: '1px solid #E5E7EB', borderRadius: '0.375rem', padding: '0.5rem 0.75rem' }}
        >
          <option value="">All roles</option>
          <option value="jobSeeker">Job Seeker</option>
          <option value="recruiter">Recruiter</option>
          <option value="admin">Admin</option>
        </select>
        <select
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          style={{ border: '1px solid #E5E7EB', borderRadius: '0.375rem', padding: '0.5rem 0.75rem' }}
        >
          <option value="">All status</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {/* Users Table */}
      <div style={{ overflowX: 'auto', border: '1px solid #E5E7EB', borderRadius: '0.5rem', background: '#FFFFFF' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#F9FAFB' }}>
            <tr>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Name</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Email</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Role</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Status</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Registered</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                <td style={{ padding: '0.75rem 1rem' }}>{user.name}</td>
                <td style={{ padding: '0.75rem 1rem' }}>{user.email}</td>
                <td style={{ padding: '0.75rem 1rem', textTransform: 'capitalize' }}>{user.role}</td>
                <td style={{ padding: '0.75rem 1rem' }}>
                  <select
                    value={user.status}
                    onChange={(e) => handleStatusChange(user._id, e.target.value)}
                    style={{ border: '1px solid #E5E7EB', borderRadius: '0.375rem', padding: '0.25rem 0.5rem' }}
                  >
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </td>
                <td style={{ padding: '0.75rem 1rem' }}>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td style={{ padding: '0.75rem 1rem' }}>
                  <button
                    onClick={() => openDeleteModal(user._id, user.name)}
                    style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer' }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem', alignItems: 'center' }}>
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
          style={{ border: '1px solid #E5E7EB', background: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', cursor: 'pointer' }}
        >
          Previous
        </button>
        <span>Page {page} of {totalPages}</span>
        <button
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          style={{ border: '1px solid #E5E7EB', background: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', cursor: 'pointer' }}
        >
          Next
        </button>
      </div>

      {/* Modal */}
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