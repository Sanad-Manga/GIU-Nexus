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

  const [trendingJobs, setTrendingJobs] = useState([]);
  const [trendingLoading, setTrendingLoading] = useState(true);
  const [trendingError, setTrendingError] = useState('');

  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [recLoading, setRecLoading] = useState(false);
  const [recError, setRecError] = useState('');

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        setTrendingLoading(true);
        const res = await api.get('/jobs', { params: { limit: 8 } });
        setTrendingJobs(res.data.jobs || []);
      } catch {
        setTrendingError('Failed to load trending jobs.');
      } finally {
        setTrendingLoading(false);
      }
    };
    fetchTrending();
  }, []);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'jobSeeker') {
      setRecommendedJobs([]);
      setRecLoading(false);
      setRecError('');
      return;
    }

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
    <div className={styles.page}>
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
            <Link to="/jobs" className={styles.btnPrimary}>Browse jobs</Link>
            {!isAuthenticated && (
              <Link to="/register" className={styles.btnOutline}>Get started</Link>
            )}
          </div>
          <div className={styles.heroStats}>
            <div className={styles.stat}>
              <span className={styles.statNum}>420+</span>
              <span className={styles.statLabel}>Open positions</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={styles.statNum}>38</span>
              <span className={styles.statLabel}>Companies hiring</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={styles.statNum}>3 AI</span>
              <span className={styles.statLabel}>Models working for you</span>
            </div>
          </div>
        </div>
      </section>

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
