import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import './OrdersChart.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function RevenueTrendChart({ data, period = 'day' }) {
  if (!data || data.length === 0) {
    return <div className="chart-empty">No data available for the selected date range</div>;
  }

  const chartData = {
    labels: data.map(item => item.period),
    datasets: [
      {
        label: 'Revenue ($)',
        data: data.map(item => item.revenue),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Revenue ($)'
        }
      }
    }
  };

  return (
    <div className="orders-chart-container">
      <Line data={chartData} options={options} />
    </div>
  );
}

export default RevenueTrendChart;

