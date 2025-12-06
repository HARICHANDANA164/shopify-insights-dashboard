import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import KpiCards from '../components/KpiCards';
import OrdersChart from '../components/OrdersChart';
import RevenueTrendChart from '../components/RevenueTrendChart';
import TopCustomersTable from '../components/TopCustomersTable';
import TopProductsTable from '../components/TopProductsTable';
import ConversionMetrics from '../components/ConversionMetrics';
import './Dashboard.css';

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [summary, setSummary] = useState(null);
  const [ordersByDate, setOrdersByDate] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);
  const [revenueTrend, setRevenueTrend] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [conversionMetrics, setConversionMetrics] = useState(null);
  const [trendPeriod, setTrendPeriod] = useState('day');
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  // Default date range: last 30 days
  const getDefaultDates = () => {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - 30);
    return {
      from: from.toISOString().split('T')[0],
      to: to.toISOString().split('T')[0]
    };
  };

  const [dateRange, setDateRange] = useState(getDefaultDates());

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetchData();
  }, [dateRange, trendPeriod, navigate]);

  const fetchData = async () => {
    setLoading(true);
    setError('');

    try {
      const [summaryRes, ordersRes, customersRes, revenueRes, productsRes, conversionRes] = await Promise.all([
        client.get(`/insights/summary?from=${dateRange.from}&to=${dateRange.to}`),
        client.get(`/insights/orders-by-date?from=${dateRange.from}&to=${dateRange.to}`),
        client.get(`/insights/top-customers?limit=5&from=${dateRange.from}&to=${dateRange.to}`),
        client.get(`/insights/revenue-trend?from=${dateRange.from}&to=${dateRange.to}&period=${trendPeriod}`),
        client.get(`/insights/top-products?limit=5&from=${dateRange.from}&to=${dateRange.to}`),
        client.get(`/insights/conversion-metrics?from=${dateRange.from}&to=${dateRange.to}`)
      ]);

      setSummary(summaryRes.data);
      setOrdersByDate(ordersRes.data);
      setTopCustomers(customersRes.data);
      setRevenueTrend(revenueRes.data);
      setTopProducts(productsRes.data);
      setConversionMetrics(conversionRes.data);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login');
      } else {
        setError(err.response?.data?.error || 'Failed to load data');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    setError('');

    try {
      const response = await client.post('/ingest/full-sync');
      // Refresh data after sync
      await fetchData();
      
      const synced = response.data.synced;
      alert(`Sync completed successfully!\n\nSynced:\n- ${synced.customers} customers\n- ${synced.products} products\n- ${synced.orders} orders`);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          err.message || 
                          'Sync failed. Please check your Shopify configuration.';
      setError(errorMessage);
      
      // If it's a configuration error, suggest going to config page
      if (errorMessage.includes('not configured') || errorMessage.includes('missing Shopify')) {
        setTimeout(() => {
          if (confirm('Shopify store not configured. Would you like to configure it now?')) {
            navigate('/shopify-config');
          }
        }, 1000);
      }
    } finally {
      setSyncing(false);
    }
  };

  const handleDateChange = (field, value) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading && !summary) {
    return (
      <div className="dashboard-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Shopify Insights Dashboard</h1>
        <div style={{display: 'flex', gap: '1rem'}}>
          <button 
            onClick={() => navigate('/shopify-config')}
            className="sync-button"
            style={{background: '#6c757d'}}
          >
            Configure Shopify
          </button>
          <button 
            onClick={handleSync} 
            disabled={syncing}
            className="sync-button"
          >
            {syncing ? 'Syncing...' : 'Sync Now'}
          </button>
        </div>
      </header>

      {error && <div className="error-banner">{error}</div>}

      <div className="date-range-selector">
        <div className="date-input-group">
          <label htmlFor="from">From:</label>
          <input
            type="date"
            id="from"
            value={dateRange.from}
            onChange={(e) => handleDateChange('from', e.target.value)}
          />
        </div>
        <div className="date-input-group">
          <label htmlFor="to">To:</label>
          <input
            type="date"
            id="to"
            value={dateRange.to}
            onChange={(e) => handleDateChange('to', e.target.value)}
          />
        </div>
      </div>

      {summary && <KpiCards data={summary} currency={summary.currency} />}

      {conversionMetrics && (
        <div className="metrics-section">
          <h2>Conversion Metrics</h2>
          <ConversionMetrics data={conversionMetrics} />
        </div>
      )}

      <div className="charts-section">
        <div className="chart-container">
          <div className="chart-header">
            <h2>Orders & Revenue Over Time</h2>
          </div>
          <OrdersChart data={ordersByDate} />
        </div>
        
        <div className="chart-container">
          <div className="chart-header">
            <h2>Revenue Trend</h2>
            <select 
              value={trendPeriod} 
              onChange={(e) => setTrendPeriod(e.target.value)}
              className="period-selector"
            >
              <option value="day">Daily</option>
              <option value="week">Weekly</option>
              <option value="month">Monthly</option>
            </select>
          </div>
          <RevenueTrendChart data={revenueTrend} period={trendPeriod} />
        </div>
      </div>

      <div className="tables-section">
        <div className="table-section">
          <h2>Top Customers</h2>
          <TopCustomersTable data={topCustomers} currency={summary?.currency || 'USD'} />
        </div>

        <div className="table-section">
          <h2>Top Products</h2>
          <TopProductsTable data={topProducts} currency={summary?.currency || 'USD'} />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

