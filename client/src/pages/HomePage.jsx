import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import JobCard from '../components/JobCard';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

// Skeleton component defined outside (to avoid re-creation on each render)
const SkeletonGrid = () => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
    {[...Array(4)].map((_, i) => (
      <div key={i} style={{ height: '200px', background: '#E5E7EB', borderRadius: '0.75rem', animation: 'pulse 1.5s infinite' }} />
    ))}
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

  // Fetch trending jobs
  useEffect(() => {
    const fetchTrending = async () => {
      try {
        setTrendingLoading(true);
        const res = await api.get('/jobs', { params: { limit: 8, sort: '-createdAt' } });
        setTrendingJobs(res.data.data || []);
      } catch {
        setTrendingError('Failed to load trending jobs');
      } finally {
        setTrendingLoading(false);
      }
    };
    fetchTrending();
  }, []); // runs once

  // Fetch recommended jobs (only for jobSeeker)
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'jobSeeker') return;

    const fetchRecommended = async () => {
      setRecLoading(true);
      setRecError('');
      try {
        const res = await api.get('/jobs/recommended');
        setRecommendedJobs(res.data.data || []);
      } catch (err) {
        if (err.response?.status === 400 && err.response?.data?.message?.includes('skills')) {
          setRecError('NO_SKILLS');
        } else {
          setRecError('Failed to load recommendations');
        }
      } finally {
        setRecLoading(false);
      }
    };
    fetchRecommended();
  }, [isAuthenticated, user]); // re-run only when auth state changes

  const showRecommended = isAuthenticated && user?.role === 'jobSeeker';

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1rem' }}>
      {/* Trending Jobs */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>🔥 Trending Jobs</h2>
        {trendingLoading && <SkeletonGrid />}
        {trendingError && <p style={{ color: '#EF4444' }}>{trendingError}</p>}
        {!trendingLoading && !trendingError && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {trendingJobs.map(job => <JobCard key={job._id} job={job} />)}
          </div>
        )}
      </section>

      {/* Recommended for You (job seekers only) */}
      {showRecommended && (
        <section>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>🎯 Recommended for You</h2>
          {recLoading && <SkeletonGrid />}
          {recError === 'NO_SKILLS' && (
            <div style={{ background: '#FEF3C7', borderLeft: '4px solid #F59E0B', padding: '1rem', borderRadius: '0.5rem' }}>
              <p>
                We need your skills to recommend jobs.{' '}
                <Link to="/profile" style={{ color: '#2563EB', textDecoration: 'underline' }}>
                  Go to profile → Extract Skills from Bio
                </Link>
              </p>
            </div>
          )}
          {recError && recError !== 'NO_SKILLS' && <p style={{ color: '#EF4444' }}>{recError}</p>}
          {!recLoading && !recError && recommendedJobs.length === 0 && (
            <p>No recommendations yet. Update your bio.</p>
          )}
          {!recLoading && !recError && recommendedJobs.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {recommendedJobs.map(job => (
                <div key={job._id} style={{ position: 'relative' }}>
                  <JobCard job={job} />
                  {job.score && (
                    <span style={{
                      position: 'absolute', top: '8px', right: '8px',
                      background: '#10B981', color: 'white', fontSize: '0.7rem',
                      padding: '0.2rem 0.5rem', borderRadius: '9999px'
                    }}>
                      {Math.round(job.score * 100)}% match
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default HomePage;