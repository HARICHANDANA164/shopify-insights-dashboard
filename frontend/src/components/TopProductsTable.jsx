import './TopCustomersTable.css';

function TopProductsTable({ data, currency = 'USD' }) {
  if (!data || data.length === 0) {
    return <div className="table-empty">No product data available for the selected date range</div>;
  }

  const formatCurrency = (value, currencyCode = currency) => {
    const locale = currency === 'INR' ? 'en-IN' : 'en-US';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(value);
  };

  return (
    <div className="table-wrapper">
      <table className="customers-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Quantity Sold</th>
            <th>Revenue</th>
            <th>Orders</th>
          </tr>
        </thead>
        <tbody>
          {data.map((product) => (
            <tr key={product.id}>
              <td>{product.title}</td>
              <td className="number-cell">{product.quantity}</td>
              <td className="amount-cell">{formatCurrency(product.revenue)}</td>
              <td className="number-cell">{product.orders_count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TopProductsTable;

