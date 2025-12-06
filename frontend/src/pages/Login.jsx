import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import client from '../api/client';
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await client.post('/auth/login', { email, password });
      const { token } = response.data;
      
      localStorage.setItem('token', token);
      navigate('/dashboard');
    } catch (err) {
      const errorMessage = err.response?.data?.error || 
                          err.response?.data?.message || 
                          err.message || 
                          'Login failed. Please check your connection and try again.';
      setError(errorMessage);
      console.error('Login error:', err);
      
      // If it's a network error, provide helpful message
      if (!err.response) {
        setError('Cannot connect to server. Please make sure the backend is running on ' + (import.meta.env.VITE_API_URL || 'http://localhost:4000'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Shopify Multi-Tenant</h1>
        <h2>Sign In</h2>
        
        {error && <div className="error-message">{error}</div>}
        
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
            />
          </div>
          
          <div className="form-group">
            <div className="forgot-password-link">
              <Link to="/forgot-password">Forgot password?</Link>
            </div>
          </div>

          <button type="submit" disabled={loading} className="submit-button">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-links">
          <p>
            Don't have an account? <Link to="/signup">Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;

