import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import SkillChip from '../components/SkillChip'
import styles from '../styles/ProfilePage.module.css'

const ProfilePage = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState('')
  const [extracting, setExtracting] = useState(false)
  const [extractError, setExtractError] = useState('')

  useEffect(() => {
    api.get('/profile')
      .then(res => setUser(res.data.user))
      .catch(() => setPageError('Failed to load profile. Please try again.'))
      .finally(() => setLoading(false))
  }, [])

  const handleExtractSkills = async () => {
    setExtracting(true)
    setExtractError('')
    try {
      const res = await api.post('/profile/extract-skills')
      setUser(prev => ({ ...prev, skills: res.data.skills }))
    } catch (err) {
      if (err.response?.status === 400) {
        setExtractError('Bio is empty. Update your profile first.')
      } else {
        setExtractError('Failed to extract skills. Try again.')
      }
    } finally {
      setExtracting(false)
    }
  }

  if (loading) return <div className={styles.center}><div className={styles.spinner} /></div>
  if (pageError) return <div className={styles.center}><p className={styles.error}>{pageError}</p></div>
  if (!user) return null

  return (
    <div className={styles.page}>
      <div className={styles.card}>

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
            <span className={styles.roleBadge}>{user.role}</span>
          </div>
        </div>

        {/* Bio */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Bio</h2>
          {user.bio
            ? <p className={styles.bio}>{user.bio}</p>
            : <p className={styles.empty}>No bio yet. <Link to="/profile/edit" className={styles.link}>Add one</Link></p>
          }
        </section>

        {/* Skills */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Skills</h2>
          <div className={styles.chips}>
            {user.skills?.length > 0
              ? user.skills.map((skill) => (
                  <SkillChip
                    key={`${skill}-${user.skills.indexOf(skill)}`}
                    skill={skill}
                  />
                ))
              : <p className={styles.empty}>No skills extracted yet.</p>
            }
          </div>
          <button
            className={styles.extractBtn}
            onClick={handleExtractSkills}
            disabled={extracting}
          >
            {extracting ? <><span className={styles.btnSpinner} /> Extracting...</> : 'Extract Skills from Bio'}
          </button>
          {extractError && (
            <p className={styles.extractError}>
              {extractError}{' '}
              {extractError.includes('Bio is empty') && (
                <Link to="/profile/edit" className={styles.link}>Edit Profile</Link>
              )}
            </p>
          )}
        </section>

        {/* Action links */}
        <div className={styles.actions}>
          <Link to="/profile/edit" className={styles.btnPrimary}>Edit Profile</Link>
          <Link to="/profile/change-password" className={styles.btnSecondary}>Change Password</Link>
        </div>

      </div>
    </div>
  )
}

export default ProfilePage
