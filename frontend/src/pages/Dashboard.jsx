import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { analyticsAPI, contentAPI, ratingAPI } from '../services/api';
import { FiFilm, FiStar, FiTrendingUp, FiUsers, FiAward, FiMessageSquare, FiActivity, FiPlusCircle, FiArrowRight, FiCalendar, FiBarChart2, FiClock, FiEye } from 'react-icons/fi';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import { Line, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [topContents, setTopContents] = useState([]);
  const [recentRatings, setRecentRatings] = useState([]);
  const [genreStats, setGenreStats] = useState([]);
  const [trends, setTrends] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const [dashboardRes, topContentsRes, recentRatingsRes, genreRes, trendsRes] = await Promise.all([
        analyticsAPI.getDashboard(),
        analyticsAPI.getMostPopular({ limit: 5 }),
        ratingAPI.getAll({ page: 1, limit: 5 }),
        analyticsAPI.getGenreStats({ minRating: 0, minReviews: 0 }),
        analyticsAPI.getTrends({ days: 7 })
      ]);

      setDashboardData(dashboardRes. data. data);
      setTopContents(topContentsRes.data. data);
      setRecentRatings(recentRatingsRes.data.data);
      setGenreStats(genreRes.data.data);
      setTrends(trendsRes. data.data);
      
    } catch (error) {
      toast.error('Errore caricamento dashboard:  ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!dashboardData) return <div className="text-center py-12">Nessun dato disponibile</div>;

  const { overview, ratingDistribution } = dashboardData;

  // Dati per grafico trend
  const trendChartData = {
    labels:  trends.map(t => new Date(t.date).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })),
    datasets: [
      {
        label: 'Valutazioni',
        data: trends.map(t => t.totalRatings),
        borderColor: 'rgb(14, 165, 233)',
        backgroundColor: 'rgba(14, 165, 233, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius:  6
      },
      {
        label: 'Rating Medio',
        data: trends. map(t => t.averageRating * 10), // Scala x10 per visibilità
        borderColor: 'rgb(250, 204, 21)',
        backgroundColor: 'rgba(250, 204, 21, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6
      }
    ]
  };

  const trendChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: { size: 12, weight: '500' }
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
        ticks: { font: { size: 11 } }
      },
      x: {
        grid: { display: false },
        ticks:  { font: { size: 11 } }
      }
    }
  };

  // Dati per grafico distribuzione generi
  const genreChartData = {
    labels: genreStats.slice(0, 6).map(g => g.genre),
    datasets: [{
      data: genreStats.slice(0, 6).map(g => g.totalContents),
      backgroundColor: [
        'rgba(239, 68, 68, 0.8)',
        'rgba(250, 204, 21, 0.8)',
        'rgba(147, 51, 234, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(249, 115, 22, 0.8)'
      ],
      borderColor: [
        'rgb(239, 68, 68)',
        'rgb(250, 204, 21)',
        'rgb(147, 51, 234)',
        'rgb(59, 130, 246)',
        'rgb(34, 197, 94)',
        'rgb(249, 115, 22)'
      ],
      borderWidth: 2
    }]
  };

  const genreChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          padding: 15,
          font:  { size: 12, weight:  '500' },
          usePointStyle: true
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont:  { size: 13 }
      }
    }
  };

  const renderStars = (rating) => {
    return [... Array(5)].map((_, i) => (
      <FiStar
        key={i}
        size={14}
        className={i < Math.round(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
      />
    ));
  };

  const getQualityBadge = (rating) => {
    if (rating >= 4.5) return { text: 'Eccellente', color: 'bg-green-100 text-green-700 border-green-300' };
    if (rating >= 4.0) return { text: 'Ottimo', color: 'bg-blue-100 text-blue-700 border-blue-300' };
    if (rating >= 3.5) return { text: 'Buono', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' };
    return { text: 'Discreto', color: 'bg-orange-100 text-orange-700 border-orange-300' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            Dashboard
          </h1>
          <p className="text-gray-600 mt-1">Panoramica completa della piattaforma</p>
        </div>
        
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => navigate('/contents/new')}
            className="btn btn-primary flex items-center gap-2"
          >
            <FiPlusCircle size={20} />
            Nuovo Contenuto
          </button>
          <button
            onClick={() => navigate('/analytics')}
            className="btn btn-secondary flex items-center gap-2"
          >
            <FiBarChart2 size={20} />
            Analytics
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Contenuti Totali */}
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:shadow-2xl transition-all duration-300 group cursor-pointer"
             onClick={() => navigate('/contents')}>
          <div className="flex items-center justify-between mb-4">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <FiFilm size={32} />
            </div>
            <FiArrowRight size={24} className="opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <p className="text-blue-100 text-sm font-medium mb-1">Contenuti Totali</p>
          <p className="text-4xl font-bold mb-2">{overview.totalContents}</p>
          <div className="flex items-center gap-2 text-blue-100 text-sm">
            <FiActivity size={16} />
            <span>{overview.contentsWithReviews} con recensioni</span>
          </div>
        </div>

        {/* Valutazioni Totali */}
        <div className="card bg-gradient-to-br from-yellow-500 to-yellow-600 text-white hover:shadow-2xl transition-all duration-300 group cursor-pointer"
             onClick={() => navigate('/ratings')}>
          <div className="flex items-center justify-between mb-4">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <FiMessageSquare size={32} />
            </div>
            <FiArrowRight size={24} className="opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <p className="text-yellow-100 text-sm font-medium mb-1">Valutazioni</p>
          <p className="text-4xl font-bold mb-2">{overview.totalRatings. toLocaleString()}</p>
          <div className="flex items-center gap-2 text-yellow-100 text-sm">
            <FiTrendingUp size={16} />
            <span>{trends.length > 0 ? `+${trends[trends.length - 1].totalRatings}` : '0'} oggi</span>
          </div>
        </div>

        {/* Rating Medio */}
        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white hover:shadow-2xl transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <FiStar size={32} className="fill-current" />
            </div>
            <div className={`badge ${getQualityBadge(overview.averageRating).color} border`}>
              {getQualityBadge(overview.averageRating).text}
            </div>
          </div>
          <p className="text-green-100 text-sm font-medium mb-1">Rating Medio Globale</p>
          <p className="text-4xl font-bold mb-2">{parseFloat(overview.averageRating).toFixed(2)}</p>
          <div className="flex items-center gap-1 text-green-100">
            {renderStars(overview.averageRating)}
          </div>
        </div>

        {/* Eccellenza */}
        <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white hover:shadow-2xl transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <FiAward size={32} />
            </div>
            <FiArrowRight size={24} className="opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <p className="text-purple-100 text-sm font-medium mb-1">Contenuti Eccellenza</p>
          <p className="text-4xl font-bold mb-2">
            {Math.round((overview.contentsWithReviews / overview. totalContents) * 100)}%
          </p>
          <div className="flex items-center gap-2 text-purple-100 text-sm">
            <FiTrendingUp size={16} />
            <span>Rating ≥ 4.5</span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Chart */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <FiActivity className="text-primary-600" />
              Trend Ultimi 7 Giorni
            </h2>
            <Link to="/analytics" className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
              Dettagli <FiArrowRight size={14} />
            </Link>
          </div>
          <div className="h-64">
            <Line data={trendChartData} options={trendChartOptions} />
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
            <span className="font-medium">Nota:</span> Rating Medio mostrato in scala x10 per migliore visualizzazione
          </div>
        </div>

        {/* Genre Distribution */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <FiFilm className="text-primary-600" />
              Distribuzione per Genere
            </h2>
            <Link to="/analytics" className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
              Dettagli <FiArrowRight size={14} />
            </Link>
          </div>
          <div className="h-64">
            <Doughnut data={genreChartData} options={genreChartOptions} />
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-2 text-xs">
              {genreStats.slice(0, 6).map((genre, index) => (
                <div key={genre.genre} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full`} style={{ 
                    backgroundColor: genreChartData.datasets[0].backgroundColor[index] 
                  }} />
                  <span className="text-gray-600">{genre.genre}:  <span className="font-semibold">{genre.totalContents}</span></span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content Lists Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Contents */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <FiTrendingUp className="text-primary-600" />
              Top 5 Contenuti
            </h2>
            <Link to="/contents" className="text-sm text-primary-600 hover: text-primary-700 flex items-center gap-1">
              Vedi tutti <FiArrowRight size={14} />
            </Link>
          </div>

          {topContents.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <FiFilm size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">Nessun contenuto disponibile</p>
            </div>
          ) : (
            <div className="space-y-3">
              {topContents. map((content, index) => (
                <div
                  key={content._id}
                  className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 hover: shadow-md hover:border-primary-200 transition-all cursor-pointer group"
                  onClick={() => navigate(`/contents/${content._id}`)}
                >
                  {/* Rank Badge */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 ${
                    index === 0 ?  'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white shadow-lg' : 
                    index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-white' :
                    index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {index + 1}
                  </div>

                  {/* Content Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate group-hover:text-primary-600 transition-colors">
                      {content.title}
                    </h3>
                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                      <span className="badge bg-gray-100 text-gray-700 text-xs">
                        {content.genre}
                      </span>
                      <span className="flex items-center gap-1">
                        <FiCalendar size={12} />
                        {content.year}
                      </span>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="text-right flex-shrink-0">
                    <div className="flex items-center gap-1 text-yellow-600 font-bold text-lg mb-1">
                      <FiStar className="fill-current" size={16} />
                      {content.averageRating.toFixed(1)}
                    </div>
                    <p className="text-xs text-gray-500">
                      {content.totalRatings} voti
                    </p>
                  </div>

                  {/* Arrow */}
                  <FiArrowRight size={20} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Ratings */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <FiClock className="text-primary-600" />
              Recensioni Recenti
            </h2>
            <Link to="/ratings" className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
              Vedi tutte <FiArrowRight size={14} />
            </Link>
          </div>

          {recentRatings.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <FiMessageSquare size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">Nessuna recensione recente</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentRatings.map((rating) => (
                <div
                  key={rating._id}
                  className="p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 hover:shadow-md hover:border-primary-200 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                        {rating.userId?. substring(0, 2).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{rating.userId}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(rating.createdAt).toLocaleDateString('it-IT', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {renderStars(rating.rating)}
                    </div>
                  </div>

                  {rating.contentId && (
                    <Link
                      to={`/contents/${rating.contentId._id}`}
                      className="text-sm text-primary-600 hover:text-primary-700 hover:underline flex items-center gap-1 mb-2"
                    >
                      <FiFilm size={14} />
                      {rating.contentId.title}
                    </Link>
                  )}

                  {rating.comment && (
                    <p className="text-sm text-gray-700 italic line-clamp-2 bg-white p-3 rounded-lg border border-gray-100">
                      "{rating.comment}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stats Summary */}
      <div className="card bg-gradient-to-br from-primary-50 to-primary-100 border-2 border-primary-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center text-white">
            <FiBarChart2 size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-primary-900">Riepilogo Statistiche</h2>
            <p className="text-sm text-primary-700">Panoramica generale della piattaforma</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border border-primary-200">
            <p className="text-xs text-gray-600 mb-1">Contenuti con Recensioni</p>
            <p className="text-2xl font-bold text-primary-700">{overview.contentsWithReviews}</p>
            <p className="text-xs text-gray-500 mt-1">
              {Math.round((overview. contentsWithReviews / overview.totalContents) * 100)}% del totale
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg border border-primary-200">
            <p className="text-xs text-gray-600 mb-1">Media Recensioni</p>
            <p className="text-2xl font-bold text-primary-700">
              {overview.totalContents > 0 ? Math.round(overview.totalRatings / overview.totalContents) : 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">per contenuto</p>
          </div>

          <div className="bg-white p-4 rounded-lg border border-primary-200">
            <p className="text-xs text-gray-600 mb-1">Generi Attivi</p>
            <p className="text-2xl font-bold text-primary-700">{genreStats.length}</p>
            <p className="text-xs text-gray-500 mt-1">categorie diverse</p>
          </div>

          <div className="bg-white p-4 rounded-lg border border-primary-200">
            <p className="text-xs text-gray-600 mb-1">Valutazioni 5 Stelle</p>
            <p className="text-2xl font-bold text-primary-700">
              {ratingDistribution[5] || 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {overview.totalRatings > 0 ?  Math.round((ratingDistribution[5] / overview.totalRatings) * 100) : 0}% del totale
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;