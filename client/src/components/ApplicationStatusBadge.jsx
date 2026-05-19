const colors = { pending: 'gray', shortlisted: 'green', rejected: 'red' }

const ApplicationStatusBadge = ({ status }) => (
  <span style={{ color: colors[status] }}>{status}</span>
)

export default ApplicationStatusBadge
