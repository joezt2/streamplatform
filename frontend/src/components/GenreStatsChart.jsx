import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS. register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const GenreStatsChart = ({ data }) => {
  if (!data || data.length === 0) {
    return <p className="text-gray-500 text-center py-8">Nessun dato disponibile</p>;
  }

  const chartData = {
    labels: data.map(item => item.genre),
    datasets: [
      {
        label: 'Numero di Contenuti',
        data: data. map(item => item.totalContents),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 2,
        yAxisID: 'y'
      },
      {
        label: 'Rating Medio',
        data: data.map(item => item.averageRating),
        backgroundColor: 'rgba(250, 204, 21, 0.8)',
        borderColor: 'rgb(250, 204, 21)',
        borderWidth: 2,
        yAxisID: 'y1'
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false
    },
    plugins: {
      legend: {
        position: 'top'
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: ${value}`;
          }
        }
      }
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        beginAtZero: true,
        title: {
          display: true,
          text: 'Numero Contenuti'
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        min: 0,
        max: 5,
        title: {
          display: true,
          text: 'Rating Medio'
        },
        grid: {
          drawOnChartArea: false
        }
      }
    }
  };

  return (
    <div className="h-96">
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default GenreStatsChart;