import './KpiCards.css';

function KpiCards({ data }) {
  if (!data) return null;

  const currency = data.currency || 'USD';

  const formatCurrency = (value, currencyCode = currency) => {
    // Map currency codes to symbols
    const currencyMap = {
      'INR': '₹',
      'USD': '$',
      'EUR': '€',
      'GBP': '£'
    };
    
    const symbol = currencyMap[currency] || currency;
    
    // Format number with appropriate locale
    const locale = currency === 'INR' ? 'en-IN' : 'en-US';
    
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  return (
    <div className="kpi-cards">
      <div className="kpi-card">
        <div className="kpi-label">Total Customers</div>
        <div className="kpi-value">{formatNumber(data.totalCustomers)}</div>
      </div>
      
      <div className="kpi-card">
        <div className="kpi-label">Total Orders</div>
        <div className="kpi-value">{formatNumber(data.totalOrders)}</div>
      </div>
      
      <div className="kpi-card">
        <div className="kpi-label">Total Revenue</div>
        <div className="kpi-value">{formatCurrency(data.totalRevenue)}</div>
      </div>
      
      <div className="kpi-card">
        <div className="kpi-label">Avg Order Value</div>
        <div className="kpi-value">{formatCurrency(data.avgOrderValue)}</div>
      </div>
    </div>
  );
}

export default KpiCards;

