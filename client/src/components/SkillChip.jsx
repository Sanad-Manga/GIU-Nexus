import styles from '../styles/SkillChip.module.css'

const SkillChip = ({ skill }) => (
  <span className={styles.chip}>{skill}</span>
)

export default SkillChip
