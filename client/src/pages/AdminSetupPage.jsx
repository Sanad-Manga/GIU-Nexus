import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/LoginPage.module.css';

const AdminSetupPage = () => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={styles.container}>
      <div className={styles.card} style={{ maxWidth: '600px' }}>
        <div className={styles.header}>
          <h1 className={styles.title}>Admin Setup Required</h1>
          <p className={styles.subtitle}>Initialize your admin account</p>
        </div>

        <div style={{ padding: '20px', backgroundColor: '#f0f8ff', borderRadius: '8px', marginBottom: '20px' }}>
          <h3 style={{ marginTop: 0, color: '#333' }}>Step 1: Run Seed Script</h3>
          <p style={{ color: '#666' }}>
            To create the admin user, you need to run the seed script from your terminal:
          </p>
          
          <div style={{
            backgroundColor: '#fff',
            padding: '12px',
            borderRadius: '4px',
            fontFamily: 'monospace',
            fontSize: '14px',
            border: '1px solid #ddd',
            marginBottom: '10px',
            wordBreak: 'break-all'
          }}>
            cd backend && node seed.js
          </div>

          <button
            onClick={() => copyToClipboard('cd backend && node seed.js')}
            style={{
              padding: '8px 16px',
              backgroundColor: '#007bff',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            {copied ? '✓ Copied!' : 'Copy Command'}
          </button>
        </div>

        <div style={{ padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px', marginBottom: '20px' }}>
          <h3 style={{ marginTop: 0, color: '#333' }}>Admin Credentials</h3>
          <p style={{ color: '#666', marginBottom: '10px' }}>
            Once the seed script runs successfully, use these credentials to log in:
          </p>
          
          <div style={{ backgroundColor: '#fff', padding: '12px', borderRadius: '4px', border: '1px solid #ddd', marginBottom: '10px' }}>
            <div style={{ marginBottom: '8px' }}>
              <strong>Email:</strong> admin@giu.edu
            </div>
            <div>
              <strong>Password:</strong> adminpass123
            </div>
          </div>
        </div>

        <div style={{ padding: '20px', backgroundColor: '#fff3cd', borderRadius: '8px', marginBottom: '20px' }}>
          <h4 style={{ marginTop: 0, color: '#856404' }}>Troubleshooting</h4>
          <ul style={{ color: '#856404', marginBottom: 0 }}>
            <li>Make sure MongoDB is connected</li>
            <li>Run the seed script from the <code>backend</code> directory</li>
            <li>You should see: "Admin user created successfully" or "Admin already exists. Password reset to default."</li>
            <li>If it fails, check that your MONGO_URI is correct in the .env file</li>
          </ul>
        </div>

        <button
          onClick={() => navigate('/login')}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#28a745',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Try Login Again
        </button>

        <button
          onClick={() => navigate('/')}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#6c757d',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px',
            marginTop: '10px'
          }}
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default AdminSetupPage;
