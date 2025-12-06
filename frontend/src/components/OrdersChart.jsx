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

function OrdersChart({ data }) {
  if (!data || data.length === 0) {
    return <div className="chart-empty">No data available for the selected date range</div>;
  }

  const chartData = {
    labels: data.map(item => item.date),
    datasets: [
      {
        label: 'Orders',
        data: data.map(item => item.orders),
        borderColor: 'rgb(102, 126, 234)',
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
        yAxisID: 'y',
        tension: 0.4
      },
      {
        label: 'Revenue ($)',
        data: data.map(item => item.revenue),
        borderColor: 'rgb(118, 75, 162)',
        backgroundColor: 'rgba(118, 75, 162, 0.1)',
        yAxisID: 'y1',
        tension: 0.4
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
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
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Orders'
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Revenue ($)'
        },
        grid: {
          drawOnChartArea: false,
        },
      }
    }
  };

  return (
    <div className="orders-chart-container">
      <Line data={chartData} options={options} />
    </div>
  );
}

export default OrdersChart;

