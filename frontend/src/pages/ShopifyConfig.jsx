import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import './Dashboard.css';

function ShopifyConfig() {
  const [shopDomain, setShopDomain] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentConfig, setCurrentConfig] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Fetch current config if exists
    fetchCurrentConfig();
  }, [navigate]);

  const fetchCurrentConfig = async () => {
    try {
      // Note: We don't have a GET endpoint, but we can try to sync to see if config exists
      // For now, we'll just show the form
    } catch (err) {
      // Ignore errors - config might not exist yet
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Validate shop domain format
      const shopDomainTrimmed = shopDomain.trim();
      if (!shopDomainTrimmed.includes('.myshopify.com')) {
        setError('Shop domain must include .myshopify.com (e.g., your-store.myshopify.com)');
        setLoading(false);
        return;
      }
      
      // Remove protocol if user pasted full URL
      let cleanDomain = shopDomainTrimmed.replace(/^https?:\/\//, '').replace(/\/$/, '');
      
      // Validate format
      if (!/^[a-zA-Z0-9-]+\.myshopify\.com$/.test(cleanDomain)) {
        setError('Invalid shop domain format. Should be: your-store.myshopify.com (no email, no special characters)');
        setLoading(false);
        return;
      }

      const response = await client.put('/tenant/shopify-config', {
        shopDomain: cleanDomain,
        accessToken: accessToken.trim()
      });

      setSuccess('Shopify configuration saved successfully!');
      setCurrentConfig({
        shopDomain: response.data.tenant.shopDomain
      });
      
      // Clear form
      setAccessToken('');
      
      // Optionally redirect to dashboard
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save configuration');
      console.error('Config error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Shopify Store Configuration</h1>
        <button 
          onClick={() => navigate('/dashboard')}
          className="sync-button"
        >
          Back to Dashboard
        </button>
      </header>

      {error && <div className="error-banner">{error}</div>}
      {success && <div className="success-banner" style={{backgroundColor: '#d4edda', color: '#155724', padding: '1rem', borderRadius: '6px', marginBottom: '1.5rem'}}>{success}</div>}

      <div className="chart-container" style={{maxWidth: '600px', margin: '0 auto'}}>
        <h2>Connect Your Shopify Store</h2>
        
        <div style={{marginBottom: '2rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '6px'}}>
          <h3 style={{fontSize: '1.1rem', marginBottom: '0.5rem'}}>How to get your Shopify credentials:</h3>
          <ol style={{paddingLeft: '1.5rem', lineHeight: '1.8'}}>
            <li>Go to your Shopify Admin → Settings → Apps and sales channels</li>
            <li>Click "Develop apps" → "Create an app"</li>
            <li>Name it "Data Ingestion App"</li>
            <li>Configure Admin API scopes: <code>read_products</code>, <code>read_orders</code>, <code>read_customers</code></li>
            <li>Install the app and copy the Admin API access token</li>
          </ol>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{marginBottom: '1.5rem'}}>
            <label htmlFor="shopDomain" style={{display: 'block', marginBottom: '0.5rem', fontWeight: '500'}}>
              Shop Domain *
            </label>
            <input
              type="text"
              id="shopDomain"
              value={shopDomain}
              onChange={(e) => setShopDomain(e.target.value)}
              placeholder="your-store.myshopify.com"
              required
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '1rem'
              }}
            />
            <small style={{color: '#666', display: 'block', marginTop: '0.25rem'}}>
              Your Shopify store domain (e.g., my-store.myshopify.com)
            </small>
          </div>

          <div className="form-group" style={{marginBottom: '1.5rem'}}>
            <label htmlFor="accessToken" style={{display: 'block', marginBottom: '0.5rem', fontWeight: '500'}}>
              Admin API Access Token *
            </label>
            <input
              type="password"
              id="accessToken"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              placeholder="shpat_xxxxx"
              required
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '1rem'
              }}
            />
            <small style={{color: '#666', display: 'block', marginTop: '0.25rem'}}>
              Your Shopify Admin API access token (starts with shpat_)
            </small>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="sync-button"
            style={{width: '100%'}}
          >
            {loading ? 'Saving...' : 'Save Configuration'}
          </button>
        </form>

        {currentConfig && (
          <div style={{marginTop: '2rem', padding: '1rem', backgroundColor: '#e7f3ff', borderRadius: '6px'}}>
            <strong>Current Configuration:</strong>
            <p>Shop Domain: {currentConfig.shopDomain}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ShopifyConfig;

