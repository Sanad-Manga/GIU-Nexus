import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'
import SkillChip from '../components/SkillChip'
import styles from '../styles/ProfilePage.module.css'

const ROLE_LABEL = {
  jobSeeker: 'Job Seeker',
  recruiter: 'Recruiter',
  admin: 'Admin',
}

export default function PublicProfilePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState('')

  useEffect(() => {
    api.get(`/users/${id}/profile`)
      .then(res => setUser(res.data.user))
      .catch(err => {
        if (err.response?.status === 404) {
          setPageError('User not found.')
        } else {
          setPageError('Failed to load profile. Please try again.')
        }
      })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className={styles.center}><div className={styles.spinner} /></div>
  if (pageError) return (
    <div className={styles.center}>
      <div style={{ textAlign: 'center' }}>
        <p className={styles.error}>{pageError}</p>
        <button
          onClick={() => navigate(-1)}
          className={styles.btnSecondary}
          style={{ marginTop: '1rem', cursor: 'pointer', border: 'none' }}
        >
          ← Go back
        </button>
      </div>
    </div>
  )
  if (!user) return null

  return (
    <div className={styles.page}>
      <div className={styles.card}>

        <button
          onClick={() => navigate(-1)}
          className={styles.btnSecondary}
          style={{ marginBottom: '1.5rem', cursor: 'pointer', border: '1px solid #E5E7EB', display: 'inline-block' }}
        >
          ← Back
        </button>

        {/* Avatar + name */}
        <div className={styles.header}>
          {user.profilePicture ? (
            <img src={user.profilePicture} alt={user.name} className={styles.avatar} />
          ) : (
            <div className={styles.avatarPlaceholder}>
              {user.name?.charAt(0).toUpperCase()}
            </div>
          )}
          <div className={styles.headerInfo}>
            <h1 className={styles.name}>{user.name}</h1>
            <p className={styles.email}>{user.email}</p>
            <span className={styles.roleBadge}>{ROLE_LABEL[user.role] ?? user.role}</span>
          </div>
        </div>

        {/* Bio */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Bio</h2>
          {user.bio
            ? <p className={styles.bio}>{user.bio}</p>
            : <p className={styles.empty}>No bio added yet.</p>
          }
        </section>

        {/* Skills */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Skills</h2>
          <div className={styles.chips}>
            {user.skills?.length > 0
              ? user.skills.map((skill, i) => (
                  <SkillChip key={`${skill}-${i}`} skill={skill} />
                ))
              : <p className={styles.empty}>No skills listed yet.</p>
            }
          </div>
        </section>

      </div>
    </div>
  )
}
