import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import client from '../api/client';
import './Login.css';

function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tenantName, setTenantName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      const response = await client.post('/auth/register', { 
        email, 
        password, 
        tenantName 
      });
      const { token } = response.data;
      
      localStorage.setItem('token', token);
      navigate('/dashboard');
    } catch (err) {
      const errorMessage = err.response?.data?.error || 
                          err.response?.data?.message || 
                          err.message || 
                          'Registration failed. Please check your connection and try again.';
      setError(errorMessage);
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Shopify Multi-Tenant</h1>
        <h2>Create Account</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="tenantName">Tenant Name</label>
            <input
              type="text"
              id="tenantName"
              value={tenantName}
              onChange={(e) => setTenantName(e.target.value)}
              required
              disabled={loading}
              placeholder="Your store name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
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
          
          <button type="submit" disabled={loading} className="submit-button">
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <div className="auth-links">
          <p>
            Already have an account? <Link to="/login">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;

