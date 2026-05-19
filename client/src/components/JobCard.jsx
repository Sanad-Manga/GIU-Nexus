import { CATEGORY_COLORS } from '../utils/categoryColors'
import SaveJobButton from './SaveJobButton'

const JobCard = ({ job }) => {
  const { _id, title, company, type, location, category, status } = job
  return (
    <div className="job-card">
      <h3>{title}</h3>
      <p>{company}</p>
      <p>{type} · {location}</p>
      <span style={{ color: CATEGORY_COLORS[category] }}>{category}</span>
      <SaveJobButton jobId={_id} status={status} />
    </div>
  )
}

export default JobCard
