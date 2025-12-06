import { useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import './Login.css';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await client.post('/auth/forgot-password', { email });
      setSuccess('If an account with that email exists, a password reset link has been sent.');
      setEmail('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Shopify Multi-Tenant</h1>
        <h2>Forgot Password</h2>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              placeholder="Enter your email address"
            />
          </div>
          
          <button type="submit" disabled={loading} className="submit-button">
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <div className="auth-links">
          <p>
            Remember your password? <Link to="/login">Sign In</Link>
          </p>
          <p>
            Don't have an account? <Link to="/signup">Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;

