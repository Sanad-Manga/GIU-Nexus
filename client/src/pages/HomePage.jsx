import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import JobCard from '../components/JobCard';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import styles from './HomePage.module.css';

const hasScore = (score) => score !== undefined && score !== null;

const SkeletonCard = () => (
  <div className={styles.skeletonCard}>
    <div className={styles.skeletonLine} style={{ width: '60%', height: '18px' }} />
    <div className={styles.skeletonLine} style={{ width: '40%', height: '14px' }} />
    <div className={styles.skeletonLine} style={{ width: '50%', height: '14px' }} />
    <div className={styles.skeletonLine} style={{ width: '30%', height: '24px' }} />
  </div>
);

const SkeletonGrid = ({ count = 4 }) => (
  <div className={styles.grid}>
    {[...Array(count)].map((_, i) => <SkeletonCard key={i} />)}
  </div>
);

const NoSkillsState = () => (
  <div className={styles.noSkills}>
    <p className={styles.noSkillsText}>
      We need your skills to recommend jobs.{' '}
      <Link to="/profile" className={styles.link}>
        Go to your profile to extract skills -&gt;
      </Link>
    </p>
  </div>
);

const HomePage = () => {
  const { user, isAuthenticated } = useAuth();

  const isRecruiter = user?.role === 'recruiter';
  const isAdmin = user?.role === 'admin';
  const isPrivileged = isRecruiter || isAdmin;

  const [stats, setStats] = useState({ openPositions: null, companies: null });
  const [recruiterStats, setRecruiterStats] = useState({ jobsPosted: null, totalApplicants: null });
  const [myJobs, setMyJobs] = useState([]);
  const [adminStats, setAdminStats] = useState(null);
  const [pendingRecruiters, setPendingRecruiters] = useState([]);

  const [trendingJobs, setTrendingJobs] = useState([]);
  const [trendingLoading, setTrendingLoading] = useState(true);
  const [trendingError, setTrendingError] = useState('');

  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [recLoading, setRecLoading] = useState(false);
  const [recError, setRecError] = useState('');

  useEffect(() => {
    const fetchPublicStats = async () => {
      try {
        const res = await api.get('/jobs', { params: { status: 'open', limit: 1000 } });
        const jobs = res.data.jobs || [];
        const total = res.data.total ?? jobs.length;
        const companies = new Set(jobs.map(j => j.company?.trim().toLowerCase()).filter(Boolean)).size;
        setStats({ openPositions: total, companies });
      } catch { /* keep nulls */ }
    };

    const fetchTrending = async () => {
      try {
        setTrendingLoading(true);
        const res = await api.get('/jobs', { params: { status: 'open', limit: 8 } });
        setTrendingJobs(res.data.jobs || []);
      } catch {
        setTrendingError('Failed to load trending jobs.');
      } finally {
        setTrendingLoading(false);
      }
    };

    fetchPublicStats();
    if (isAuthenticated && !isPrivileged) fetchTrending();
  }, [isPrivileged]);

  useEffect(() => {
    if (!isAdmin) return;
    const fetchAdminData = async () => {
      try {
        const [statsRes, recruitersRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/users', { params: { role: 'recruiter', status: 'pending' } }),
        ]);
        setAdminStats(statsRes.data.stats);
        setPendingRecruiters((recruitersRes.data.users || []).slice(0, 5));
      } catch { /* keep nulls */ }
    };
    fetchAdminData();
  }, [isAdmin]);

  useEffect(() => {
    if (!isRecruiter) return;
    const fetchRecruiterStats = async () => {
      try {
        const res = await api.get('/jobs/my-jobs');
        const jobs = res.data.jobs || [];
        const totalApplicants = jobs.reduce((sum, j) => sum + (j.applicantCount || 0), 0);
        const openJobs = jobs.filter(j => j.status === 'open').length;
        setRecruiterStats({ jobsPosted: jobs.length, totalApplicants, openJobs });
        setMyJobs(jobs.slice(0, 4));
      } catch { /* keep nulls */ }
    };
    fetchRecruiterStats();
  }, [isRecruiter]);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'jobSeeker') return;

    const fetchRecommended = async () => {
      setRecLoading(true);
      setRecError('');
      try {
        const profileRes = await api.get('/profile');
        const skills = profileRes.data.user?.skills || [];
        if (skills.length === 0) {
          setRecError('NO_SKILLS');
          return;
        }
        const res = await api.get('/jobs/recommended');
        const sorted = [...(res.data.jobs || [])].sort((a, b) => (b.score || 0) - (a.score || 0));
        setRecommendedJobs(sorted.slice(0, 6));
      } catch {
        setRecError('Failed to load recommendations.');
      } finally {
        setRecLoading(false);
      }
    };
    fetchRecommended();
  }, [isAuthenticated, user]);

  const showRecommended = isAuthenticated && user?.role === 'jobSeeker';

  return (
    <div className={`${styles.page}${(!isAuthenticated && !isPrivileged) ? ' ' + styles.pageGuest : ''}`}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.heroBadge}>AI-powered job matching</span>
          <h1 className={styles.heroTitle}>
            Find your next role,<br />
            <span className={styles.heroAccent}>matched by AI</span>
          </h1>
          <p className={styles.heroSub}>
            We rank every open position by how well it fits your skills - not by how recent it was posted.
          </p>
          <div className={styles.heroCta}>
            <Link
              to={isAdmin ? '/admin/dashboard' : isRecruiter ? '/recruiter/dashboard' : '/jobs'}
              className={styles.btnPrimary}
            >
              {isAdmin ? 'Admin Dashboard' : isRecruiter ? 'Go to Dashboard' : 'Browse jobs'}
            </Link>
            {!isAuthenticated && (
              <Link to="/register" className={styles.btnOutline}>Get started</Link>
            )}
          </div>
          <div className={styles.heroStats}>
            {isAdmin && adminStats ? (
              <>
                <div className={styles.stat}>
                  <span className={styles.statNum}>{adminStats.usersByRole?.jobSeeker ?? '—'}</span>
                  <span className={styles.statLabel}>Job seekers</span>
                </div>
                <div className={styles.statDivider} />
                <div className={styles.stat}>
                  <span className={styles.statNum}>{adminStats.usersByRole?.recruiter ?? '—'}</span>
                  <span className={styles.statLabel}>Recruiters</span>
                </div>
                <div className={styles.statDivider} />
                <div className={styles.stat}>
                  <span className={styles.statNum}>{adminStats.jobsByStatus?.open ?? '—'}</span>
                  <span className={styles.statLabel}>Open jobs</span>
                </div>
                <div className={styles.statDivider} />
                <div className={styles.stat}>
                  <span className={styles.statNum}>{adminStats.appsByStatus?.pending ?? '—'}</span>
                  <span className={styles.statLabel}>Pending applications</span>
                </div>
              </>
            ) : isRecruiter ? (
              <>
                {recruiterStats.openJobs !== null && (
                  <>
                    <div className={styles.stat}>
                      <span className={styles.statNum}>{recruiterStats.openJobs}</span>
                      <span className={styles.statLabel}>Open listings</span>
                    </div>
                    <div className={styles.statDivider} />
                  </>
                )}
                {recruiterStats.jobsPosted !== null && (
                  <>
                    <div className={styles.stat}>
                      <span className={styles.statNum}>{recruiterStats.jobsPosted}</span>
                      <span className={styles.statLabel}>Total posted</span>
                    </div>
                    <div className={styles.statDivider} />
                  </>
                )}
                {recruiterStats.totalApplicants !== null && (
                  <>
                    <div className={styles.stat}>
                      <span className={styles.statNum}>{recruiterStats.totalApplicants}</span>
                      <span className={styles.statLabel}>Total applicants</span>
                    </div>
                    <div className={styles.statDivider} />
                  </>
                )}
                <div className={styles.stat}>
                  <span className={styles.statNum}>3 AI</span>
                  <span className={styles.statLabel}>Models working for you</span>
                </div>
              </>
            ) : (
              <>
                {stats.openPositions !== null && (
                  <>
                    <div className={styles.stat}>
                      <span className={styles.statNum}>{stats.openPositions}</span>
                      <span className={styles.statLabel}>Open positions</span>
                    </div>
                    <div className={styles.statDivider} />
                  </>
                )}
                {stats.companies !== null && (
                  <>
                    <div className={styles.stat}>
                      <span className={styles.statNum}>{stats.companies}</span>
                      <span className={styles.statLabel}>Companies hiring</span>
                    </div>
                    <div className={styles.statDivider} />
                  </>
                )}
                <div className={styles.stat}>
                  {isAuthenticated ? (
                    <>
                      <span className={styles.statNum}>3 AI</span>
                      <span className={styles.statLabel}>Models working for you</span>
                    </>
                  ) : (
                    <>
                      <span className={styles.statNum}>100%</span>
                      <span className={styles.statLabel}>Free to join</span>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {isRecruiter && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Your job listings</h2>
            <Link to="/recruiter/dashboard" className={styles.sectionLink}>View all →</Link>
          </div>
          <div className={styles.grid}>
            <Link to="/recruiter/jobs/create" className={styles.postJobCard}>
              <span className={styles.postJobPlus}>+</span>
              <span className={styles.postJobLabel}>Post a new job</span>
            </Link>
            {myJobs.map(job => (
              <Link key={job._id} to={`/recruiter/applicants/${job._id}`} className={styles.recruiterJobCard}>
                <div className={styles.recruiterJobTop}>
                  <span className={styles.recruiterJobTitle}>{job.title}</span>
                  <span className={`${styles.recruiterJobStatus} ${job.status === 'open' ? styles.statusOpen : styles.statusClosed}`}>
                    {job.status}
                  </span>
                </div>
                <span className={styles.recruiterJobCompany}>{job.company}</span>
                <div className={styles.recruiterJobFooter}>
                  <span className={styles.recruiterApplicants}>
                    {job.applicantCount || 0} applicant{job.applicantCount !== 1 ? 's' : ''}
                  </span>
                  <span className={styles.recruiterJobLocation}>{job.location}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {isAdmin && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Pending recruiter approvals</h2>
            <Link to="/admin/recruiters" className={styles.sectionLink}>View all →</Link>
          </div>
          {pendingRecruiters.length === 0 ? (
            <p className={styles.emptyText}>No pending approvals — you're all caught up.</p>
          ) : (
            <div className={styles.grid}>
              {pendingRecruiters.map(r => (
                <Link key={r._id} to="/admin/recruiters" className={styles.recruiterJobCard}>
                  <div className={styles.recruiterJobTop}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className={styles.adminPendingAvatar}>
                        {r.name?.charAt(0).toUpperCase()}
                      </div>
                      <span className={styles.recruiterJobTitle}>{r.name}</span>
                    </div>
                    <span className={styles.pendingBadge}>Pending</span>
                  </div>
                  <span className={styles.recruiterJobCompany}>{r.email}</span>
                  <div className={styles.recruiterJobFooter}>
                    <span className={styles.recruiterJobLocation}>Recruiter</span>
                    <span className={styles.adminPendingDate}>
                      {new Date(r.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}

      {isAuthenticated && !isPrivileged && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Trending jobs</h2>
            <Link to="/jobs" className={styles.sectionLink}>View all -&gt;</Link>
          </div>
          {trendingLoading && <SkeletonGrid count={8} />}
          {trendingError && <p className={styles.errorText}>{trendingError}</p>}
          {!trendingLoading && !trendingError && (
            <div className={styles.grid}>
              {trendingJobs.map(job => <JobCard key={job._id} job={job} />)}
            </div>
          )}
        </section>
      )}

      {showRecommended && (
        <section className={styles.recSection}>
          <div className={styles.recHeader}>
            <span className={styles.recBadge}>AI match</span>
            <h2 className={styles.sectionTitle}>Recommended for you</h2>
            <Link to="/jobs/recommended" className={styles.sectionLink}>View all -&gt;</Link>
          </div>

          {recLoading && <SkeletonGrid count={4} />}
          {!recLoading && recError === 'NO_SKILLS' && <NoSkillsState />}
          {!recLoading && recError && recError !== 'NO_SKILLS' && (
            <p className={styles.errorText}>{recError}</p>
          )}
          {!recLoading && !recError && recommendedJobs.length === 0 && (
            <p className={styles.emptyText}>No recommendations available right now.</p>
          )}
          {!recLoading && !recError && recommendedJobs.length > 0 && (
            <div className={styles.grid}>
              {recommendedJobs.map(job => (
                <div key={job._id} className={styles.recCardWrapper}>
                  <JobCard job={job} />
                  {hasScore(job.score) && (
                    <span className={styles.scoreBadge}>
                      {Math.round(job.score * 100)}% match
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default HomePage;