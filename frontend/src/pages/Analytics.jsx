import React, { useState, useEffect } from 'react';
import { analyticsAPI } from '../services/api';
import { FiTrendingUp, FiAward, FiUsers, FiStar, FiFilm, FiBarChart2, FiActivity } from 'react-icons/fi';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import GenreStatsChart from '../components/GenreStatsChart';
import RatingDistributionChart from '../components/RatingDistributionChart';

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('Caricamento dati.. .');
  const [dashboardData, setDashboardData] = useState(null);
  const [genreStats, setGenreStats] = useState([]);
  const [excellencePipeline, setExcellencePipeline] = useState(null);
  const [topActors, setTopActors] = useState([]);
  const [mostPopular, setMostPopular] = useState([]);
  const [trends, setTrends] = useState([]);
  
  const [filters, setFilters] = useState({
    minRating: 4.5,
    minReviews: 100,
    days: 30
  });

  useEffect(() => {
    loadAllAnalytics();
  }, [filters]);

  // Funzione helper per delay
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const loadAllAnalytics = async () => {
    try {
      setLoading(true);
      
      // Carica dati UNO ALLA VOLTA con delay per evitare rate limiting
      
      setLoadingMessage('Caricamento dashboard...');
      const dashboardRes = await analyticsAPI.getDashboard();
      setDashboardData(dashboardRes.data. data);
      await delay(300); // Attendi 300ms
      
      setLoadingMessage('Caricamento statistiche generi...');
      const genreRes = await analyticsAPI.getGenreStats({ 
        minRating: filters. minRating, 
        minReviews: filters.minReviews 
      });
      setGenreStats(genreRes.data. data);
      await delay(300);
      
      setLoadingMessage('Caricamento pipeline eccellenza...');
      const pipelineRes = await analyticsAPI.getExcellencePipeline({ 
        minRating: filters.minRating, 
        minReviews: filters.minReviews 
      });
      setExcellencePipeline(pipelineRes.data.data);
      await delay(300);
      
      setLoadingMessage('Caricamento top attori...');
      const actorsRes = await analyticsAPI.getTopActors({ 
        minRating: filters.minRating, 
        minReviews: filters.minReviews 
      });
      setTopActors(actorsRes.data. data);
      await delay(300);
      
      setLoadingMessage('Caricamento contenuti popolari...');
      const popularRes = await analyticsAPI.getMostPopular({ limit: 10 });
      setMostPopular(popularRes. data.data);
      await delay(300);
      
      setLoadingMessage('Caricamento trend.. .');
      const trendsRes = await analyticsAPI.getTrends({ days: filters.days });
      setTrends(trendsRes. data.data);
      
    } catch (error) {
      if (error.response?.status === 429) {
        toast.error('Troppe richieste.  Attendi 15 secondi e ricarica la pagina.');
      } else {
        toast.error('Errore caricamento analytics: ' + error.message);
      }
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <LoadingSpinner />
        <p className="mt-4 text-gray-600">{loadingMessage}</p>
      </div>
    );
  }

  if (!dashboardData) {
    return <div className="text-center py-12">Nessun dato disponibile</div>;
  }

  const { overview, ratingDistribution } = dashboardData;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Avanzate</h1>
          <p className="text-gray-600 mt-1">Report completi e statistiche della piattaforma</p>
        </div>

        {/* Filters */}
        <div className="card p-4 bg-gray-50">
          <div className="text-sm font-medium text-gray-700 mb-2">Filtri Eccellenza</div>
          <div className="flex flex-wrap gap-3">
            <div>
              <label className="text-xs text-gray-600">Rating Minimo</label>
              <select
                value={filters.minRating}
                onChange={(e) => setFilters({ ...filters, minRating: parseFloat(e.target.value) })}
                className="input text-sm mt-1"
              >
                <option value="4.0">≥ 4.0</option>
                <option value="4.5">≥ 4.5</option>
                <option value="4.7">≥ 4.7</option>
                <option value="4.9">≥ 4.9</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-600">Recensioni Minime</label>
              <select
                value={filters.minReviews}
                onChange={(e) => setFilters({ ...filters, minReviews: parseInt(e.target.value) })}
                className="input text-sm mt-1"
              >
                <option value="50">≥ 50</option>
                <option value="100">≥ 100</option>
                <option value="200">≥ 200</option>
                <option value="500">≥ 500</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Contenuti Totali</p>
              <p className="text-4xl font-bold mt-2">{overview.totalContents}</p>
            </div>
            <div className="w-14 h-14 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <FiFilm size={28} />
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm">Valutazioni Totali</p>
              <p className="text-4xl font-bold mt-2">{overview. totalRatings. toLocaleString()}</p>
            </div>
            <div className="w-14 h-14 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <FiStar size={28} />
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Media Globale</p>
              <p className="text-4xl font-bold mt-2">{parseFloat(overview.averageRating).toFixed(2)}</p>
              <p className="text-green-100 text-xs mt-1">su 5.00</p>
            </div>
            <div className="w-14 h-14 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <FiTrendingUp size={28} />
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Con Recensioni</p>
              <p className="text-4xl font-bold mt-2">{overview.contentsWithReviews}</p>
              <p className="text-purple-100 text-xs mt-1">
                {((overview.contentsWithReviews / overview.totalContents) * 100).toFixed(1)}% del totale
              </p>
            </div>
            <div className="w-14 h-14 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <FiBarChart2 size={28} />
            </div>
          </div>
        </div>
      </div>

      {/* Excellence Pipeline */}
      {excellencePipeline && (
        <div className="card bg-gradient-to-r from-primary-500 to-primary-700 text-white">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <FiAward size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Pipeline di Eccellenza</h2>
              <p className="text-primary-100 mt-1">
                Contenuti con rating ≥ {filters.minRating} e ≥ {filters.minReviews} valutazioni
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white bg-opacity-10 p-4 rounded-lg">
              <p className="text-primary-200 text-sm">Generi Rappresentati</p>
              <p className="text-4xl font-bold mt-2">{excellencePipeline.totalGenres}</p>
            </div>
            <div className="bg-white bg-opacity-10 p-4 rounded-lg">
              <p className="text-primary-200 text-sm">Contenuti Totali</p>
              <p className="text-4xl font-bold mt-2">
                {excellencePipeline.genres.reduce((sum, g) => sum + g.totalContents, 0)}
              </p>
            </div>
            <div className="bg-white bg-opacity-10 p-4 rounded-lg">
              <p className="text-primary-200 text-sm">Valutazioni Totali</p>
              <p className="text-4xl font-bold mt-2">
                {excellencePipeline.genres.reduce((sum, g) => sum + g.totalReviews, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Genre Stats Chart */}
        {genreStats && genreStats.length > 0 && (
          <div className="card">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <FiBarChart2 className="text-primary-600" />
              Statistiche per Genere
            </h2>
            <GenreStatsChart data={genreStats} />
          </div>
        )}

        {/* Rating Distribution */}
        {ratingDistribution && (
          <div className="card">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <FiStar className="text-yellow-500" />
              Distribuzione Globale Voti
            </h2>
            <RatingDistributionChart data={ratingDistribution} />
          </div>
        )}
      </div>

      {/* Trends */}
      {trends && trends.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <FiActivity className="text-primary-600" />
            Trend Ultimi {filters.days} Giorni
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Data</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Valutazioni</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Media</th>
                </tr>
              </thead>
              <tbody>
                {trends.slice(0, 10).map((trend, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      {new Date(trend.date).toLocaleDateString('it-IT', { 
                        day: 'numeric', 
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="py-3 px-4 text-center font-medium">{trend.totalRatings}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 text-yellow-600 font-semibold">
                        <FiStar className="fill-current" size={14} />
                        {trend. averageRating.toFixed(2)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Excellence by Genre */}
      {excellencePipeline && excellencePipeline.genres.length > 0 && (
        <div className="card">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <FiAward className="text-primary-600" />
            Contenuti di Eccellenza per Genere
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Genere</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Contenuti</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Rating Medio</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Min Rating</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Max Rating</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Recensioni</th>
                </tr>
              </thead>
              <tbody>
                {excellencePipeline.genres.map((genre) => (
                  <tr key={genre.genre} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <span className="badge bg-primary-100 text-primary-700 text-sm">{genre.genre}</span>
                    </td>
                    <td className="py-3 px-4 text-center font-medium text-lg">{genre.totalContents}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-yellow-600 font-semibold text-lg">{genre.averageRating}</span>
                    </td>
                    <td className="py-3 px-4 text-center text-gray-600">{genre.minRating}</td>
                    <td className="py-3 px-4 text-center text-green-600 font-semibold">{genre.maxRating}</td>
                    <td className="py-3 px-4 text-center text-gray-600">{genre.totalReviews. toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Top Actors */}
      {topActors && topActors.length > 0 && (
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <FiUsers className="text-primary-600" size={28} />
            <h2 className="text-2xl font-semibold">Top 10 Attori in Contenuti di Qualità</h2>
          </div>
          <div className="grid grid-cols-1 md: grid-cols-2 gap-4">
            {topActors. slice(0, 10).map((actor, index) => (
              <div key={actor.actor} className="p-5 bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg
                      ${index === 0 ? 'bg-yellow-100 text-yellow-700' : 
                        index === 1 ?  'bg-gray-100 text-gray-700' :  
                        index === 2 ? 'bg-orange-100 text-orange-700' : 
                        'bg-primary-100 text-primary-700'}`}
                    >
                      #{index + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">{actor.actor}</h3>
                      <p className="text-sm text-gray-600">{actor.appearances} apparizioni</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-yellow-600 font-semibold text-xl">
                      <FiStar className="fill-current" />
                      {actor.averageRating}
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-500 font-medium mb-2">Top Contenuti: </p>
                  <div className="space-y-1">
                    {actor.topContents.slice(0, 2).map((content, idx) => (
                      <div key={idx} className="text-sm text-gray-700 flex items-center justify-between">
                        <span className="truncate flex-1">{content.title}</span>
                        <span className="text-yellow-600 font-semibold ml-2">★{content.rating}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Most Popular */}
      {mostPopular && mostPopular.length > 0 && (
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <FiTrendingUp className="text-primary-600" size={28} />
            <h2 className="text-2xl font-semibold">Top 10 Contenuti Più Popolari</h2>
            <span className="text-sm text-gray-500">(per numero recensioni)</span>
          </div>
          <div className="space-y-3">
            {mostPopular.map((content, index) => (
              <div key={content._id} className="flex items-center gap-4 p-5 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0
                  ${index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white' : 
                    index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-white' : 
                    index === 2 ?  'bg-gradient-to-br from-orange-400 to-orange-600 text-white' : 
                    'bg-primary-100 text-primary-700'}`}
                >
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-lg truncate">{content.title}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="badge bg-gray-100 text-gray-700 text-sm">{content. genre}</span>
                    <span className="text-sm text-gray-500">{content.year}</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="flex items-center gap-1 text-yellow-600 font-semibold text-xl">
                    <FiStar className="fill-current" />
                    {content.averageRating. toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {content.totalRatings. toLocaleString()} recensioni
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;