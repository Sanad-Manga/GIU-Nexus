import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import styles from '../styles/ForgotPasswordPage.module.css';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setEmail(e.target.value);
  };

  const validateEmail = () => {
    if (!email.trim()) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Valid email required';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const error = validateEmail();
    if (error) return;

    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSubmitted(true);
      setEmail('');
    } catch (err) {
      // Always show generic success message regardless of response
      setSubmitted(true);
      setEmail('');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.header}>
            <h1 className={styles.title}>Check Your Email</h1>
            <p className={styles.subtitle}>
              If an account with that email exists, we've sent password reset instructions to your inbox.
              Please check your email and follow the link to reset your password.
            </p>
          </div>

          <div className={styles.successMessage}>
            <span className={styles.successIcon}>✓</span>
            <span>Password reset email sent successfully!</span>
          </div>

          <div className={styles.footer}>
            <Link to="/login" className={styles.footerLink}>Back to login</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>Forgot Password?</h1>
          <p className={styles.subtitle}>
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Email Address</label>
            <input
              className={styles.input}
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <button
            className={styles.button}
            type="submit"
            disabled={loading}
          >
            {loading && <span className={styles.loadingSpinner} />}
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <div className={styles.footer}>
          <Link to="/login" className={styles.footerLink}>Back to login</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
