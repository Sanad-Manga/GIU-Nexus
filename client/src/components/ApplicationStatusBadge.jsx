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
      fontWeight: '500',
      textTransform: 'capitalize',
      display: 'inline-block',
    }}
  >
    {status}
  </span>
)

export default ApplicationStatusBadge
