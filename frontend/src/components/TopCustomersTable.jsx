import './TopCustomersTable.css';

function TopCustomersTable({ data, currency = 'USD' }) {
  if (!data || data.length === 0) {
    return <div className="table-empty">No customer data available for the selected date range</div>;
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
            <th>Name</th>
            <th>Email</th>
            <th>Total Spent</th>
            <th>Orders</th>
          </tr>
        </thead>
        <tbody>
          {data.map((customer) => (
            <tr key={customer.id}>
              <td>
                {customer.firstName || ''} {customer.lastName || ''}
                {!customer.firstName && !customer.lastName && 'N/A'}
              </td>
              <td>{customer.email || 'N/A'}</td>
              <td className="amount-cell">{formatCurrency(customer.total_spent)}</td>
              <td className="number-cell">{customer.orders_count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TopCustomersTable;

