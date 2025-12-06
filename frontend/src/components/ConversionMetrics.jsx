import './KpiCards.css';

function ConversionMetrics({ data }) {
  if (!data) return null;

  return (
    <div className="kpi-cards">
      <div className="kpi-card">
        <div className="kpi-label">Active Customers</div>
        <div className="kpi-value">{data.activeCustomers}</div>
        <div className="kpi-subtext">of {data.totalCustomers} total</div>
      </div>
      
      <div className="kpi-card">
        <div className="kpi-label">Conversion Rate</div>
        <div className="kpi-value">{data.conversionRate}%</div>
        <div className="kpi-subtext">customers with orders</div>
      </div>
      
      <div className="kpi-card">
        <div className="kpi-label">Repeat Customers</div>
        <div className="kpi-value">{data.repeatCustomers}</div>
        <div className="kpi-subtext">multiple orders</div>
      </div>
      
      <div className="kpi-card">
        <div className="kpi-label">Avg Days Between Orders</div>
        <div className="kpi-value">{data.avgDaysBetweenOrders ? data.avgDaysBetweenOrders.toFixed(1) : '0.0'}</div>
        <div className="kpi-subtext">for repeat customers</div>
      </div>
    </div>
  );
}

export default ConversionMetrics;

