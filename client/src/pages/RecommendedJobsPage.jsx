import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import JobCard from '../components/JobCard';
import api from '../services/api';

const SkeletonGrid = () => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
    {[...Array(6)].map((_, i) => (
      <div key={i} style={{ height: '200px', background: '#E5E7EB', borderRadius: '0.75rem', animation: 'pulse 1.5s infinite' }} />
    ))}
  </div>
);

const RecommendedJobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRecommended = async () => {
      try {
        setLoading(true);
        const res = await api.get('/jobs/recommended');
        setJobs(res.data.data || []);
      } catch (err) {
        if (err.response?.status === 400 && err.response?.data?.message?.includes('skills')) {
          setError('NO_SKILLS');
        } else {
          setError('Unable to load recommendations');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchRecommended();
  }, []); // runs once

  if (loading) {
    return (
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Recommended Jobs</h1>
        <SkeletonGrid />
      </div>
    );
  }

  if (error === 'NO_SKILLS') {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>No Recommendations Yet</h1>
        <p>We need your skills to find matching jobs.</p>
        <Link to="/profile" style={{ color: '#2563EB', textDecoration: 'underline', display: 'inline-block', marginTop: '1rem' }}>
          Go to profile & extract skills
        </Link>
      </div>
    );
  }

  if (error) {
    return <div style={{ color: '#EF4444', textAlign: 'center', padding: '2rem' }}>{error}</div>;
  }

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Recommended Jobs</h1>
      <p style={{ color: '#6B7280', marginBottom: '2rem' }}>Based on your skills and profile</p>
      {jobs.length === 0 ? (
        <p>No jobs match your skills right now.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {jobs.map(job => (
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
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default RecommendedJobsPage;