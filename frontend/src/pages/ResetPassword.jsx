import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import client from '../api/client';
import './Login.css';

function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setError('Invalid reset link. Please request a new password reset.');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!token) {
      setError('Invalid reset token');
      return;
    }

    setLoading(true);

    try {
      await client.post('/auth/reset-password', { token, password });
      setSuccess('Password has been reset successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Shopify Multi-Tenant</h1>
        <h2>Reset Password</h2>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        {token ? (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="password">New Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                minLength={6}
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
                minLength={6}
              />
            </div>
            
            <button type="submit" disabled={loading} className="submit-button">
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        ) : (
          <div>
            <p style={{ color: '#666', marginBottom: '1rem' }}>
              No reset token found. Please request a new password reset.
            </p>
            <Link to="/forgot-password" className="submit-button" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
              Request New Reset Link
            </Link>
          </div>
        )}

        <div className="auth-links">
          <p>
            <Link to="/login">Back to Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;

