const badgeStyles = {
  pending: { backgroundColor: '#f3f4f6', color: '#6b7280' },
  shortlisted: { backgroundColor: '#dcfce7', color: '#166534' },
  rejected: { backgroundColor: '#fee2e2', color: '#991b1b' },
}

const ApplicationStatusBadge = ({ status }) => (
  <span
    style={{
      ...badgeStyles[status],
      padding: '0.375rem 0.75rem',
      borderRadius: '0.375rem',
      fontSize: '0.875rem',
      fontWeight: '700',
      textTransform: 'capitalize',
      display: 'inline-block',
      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
      border: status === 'pending' ? '1px solid rgba(107, 114, 128, 0.15)' : 
              status === 'shortlisted' ? '1px solid rgba(22, 101, 52, 0.15)' :
              status === 'rejected' ? '1px solid rgba(153, 27, 27, 0.15)' : 'none',
    }}
  >
    {status}
  </span>
)

export default ApplicationStatusBadge
