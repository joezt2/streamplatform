import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ratingAPI } from '../services/api';
import { FiStar, FiTrash2, FiFilter, FiUser, FiFilm, FiTrendingUp, FiEdit2, FiSave, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import Pagination from '../components/Pagination';

const Ratings = () => {
  const [ratings, setRatings] = useState([]);
  const [allRatings, setAllRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [filterUserId, setFilterUserId] = useState('');
  const [filterContentId, setFilterContentId] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    stars: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    average: 0
  });

  // Edit state
  const [editingRatingId, setEditingRatingId] = useState(null);
  const [editRatingData, setEditRatingData] = useState({
    rating: 0,
    comment: ''
  });
  const [editHoveredStar, setEditHoveredStar] = useState(0);

  useEffect(() => {
    loadRatings();
    loadAllRatingsForStats();
  }, [page, filterUserId, filterContentId]);

  const loadRatings = async () => {
    try {
      setLoading(true);
      let response;

      if (filterUserId) {
        response = await ratingAPI.getByUser(filterUserId, { page, limit: 20 });
      } else if (filterContentId) {
        response = await ratingAPI.getByContent(filterContentId, { page, limit: 20 });
      } else {
        response = await ratingAPI.getAll({ page, limit: 20 });
      }

      setRatings(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      toast.error('Errore caricamento valutazioni:  ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadAllRatingsForStats = async () => {
    try {
      const response = await ratingAPI.getAll({ page:  1, limit: 10000 });
      const allData = response.data.data;
      setAllRatings(allData);

      const starCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      let totalRating = 0;

      allData.forEach(rating => {
        starCounts[rating.rating]++;
        totalRating += rating.rating;
      });

      const average = allData.length > 0 ? (totalRating / allData.length).toFixed(1) : 0;

      setStats({
        total:  allData.length,
        stars: starCounts,
        average: parseFloat(average)
      });
    } catch (error) {
      console.error('Errore caricamento statistiche:', error);
    }
  };

  const handleDelete = async (id) => {
    if (! window.confirm('Eliminare questa valutazione?')) return;

    try {
      await ratingAPI.delete(id);
      toast.success('Valutazione eliminata');
      loadRatings();
      loadAllRatingsForStats();
    } catch (error) {
      toast.error('Errore eliminazione: ' + error. message);
    }
  };

  // Inizia modifica
  const handleStartEdit = (rating) => {
    setEditingRatingId(rating._id);
    setEditRatingData({
      rating: rating. rating,
      comment: rating. comment || ''
    });
    setEditHoveredStar(0);
  };

  // Annulla modifica
  const handleCancelEdit = () => {
    setEditingRatingId(null);
    setEditRatingData({ rating: 0, comment: '' });
    setEditHoveredStar(0);
  };

  // Salva modifica
  const handleSaveEdit = async (ratingId) => {
    if (editRatingData.rating === 0) {
      toast.error('Seleziona una valutazione');
      return;
    }

    try {
      await ratingAPI.update(ratingId, {
        rating: editRatingData.rating,
        comment: editRatingData.comment
      });

      toast.success('Valutazione aggiornata! ');
      setEditingRatingId(null);
      setEditRatingData({ rating: 0, comment: '' });
      loadRatings();
      loadAllRatingsForStats();
    } catch (error) {
      toast.error('Errore aggiornamento: ' + (error.response?.data?.error || error.message));
    }
  };

  const clearFilters = () => {
    setFilterUserId('');
    setFilterContentId('');
    setPage(1);
  };

  const renderStars = (rating, interactive = false, onStarClick = null, onStarHover = null, hoveredValue = 0) => {
    return [... Array(5)].map((_, i) => {
      const starValue = i + 1;
      const isFilled = interactive 
        ? starValue <= (hoveredValue || rating)
        : i < rating;

      return (
        <FiStar
          key={i}
          size={interactive ? 28 : 16}
          className={`${isFilled ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} ${
            interactive ? 'cursor-pointer transition-all hover:scale-110' : ''
          }`}
          onClick={interactive ? () => onStarClick(starValue) : undefined}
          onMouseEnter={interactive ? () => onStarHover(starValue) : undefined}
          onMouseLeave={interactive ? () => onStarHover(0) : undefined}
        />
      );
    });
  };

  const getStarColor = (stars) => {
    const colors = {
      5: 'from-green-50 to-green-100 text-green-700 border-green-200',
      4: 'from-blue-50 to-blue-100 text-blue-700 border-blue-200',
      3: 'from-yellow-50 to-yellow-100 text-yellow-700 border-yellow-200',
      2: 'from-orange-50 to-orange-100 text-orange-700 border-orange-200',
      1: 'from-red-50 to-red-100 text-red-700 border-red-200'
    };
    return colors[stars] || 'from-gray-50 to-gray-100 text-gray-700 border-gray-200';
  };

  const getPercentage = (count) => {
    return stats.total > 0 ? ((count / stats.total) * 100).toFixed(1) : 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Valutazioni</h1>
          <p className="text-gray-600 mt-1">Gestisci tutte le recensioni degli utenti</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-yellow-600 bg-yellow-50 px-4 py-2 rounded-lg border border-yellow-200">
            <FiStar className="fill-current" size={20} />
            <span className="text-2xl font-bold">{stats.average}</span>
            <span className="text-sm text-yellow-700">/5</span>
          </div>
        </div>
      </div>

      {/* Stats Cards - Distribuzione Stelle */}
      <div className="card bg-gradient-to-br from-gray-50 to-white">
        <div className="flex items-center gap-2 mb-4">
          <FiTrendingUp className="text-primary-600" size={20} />
          <h2 className="text-lg font-semibold text-gray-900">Distribuzione Valutazioni</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Totale */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1 card bg-gradient-to-br from-primary-50 to-primary-100 border-2 border-primary-200">
            <div className="text-sm text-primary-600 font-medium mb-1">Totale</div>
            <div className="text-4xl font-bold text-primary-700">{stats.total}</div>
            <div className="text-xs text-primary-600 mt-2">Valutazioni</div>
          </div>

          {/* 5 Stelle */}
          <div className={`card bg-gradient-to-br border ${getStarColor(5)}`}>
            <div className="flex items-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <FiStar key={i} size={12} className="fill-current text-green-600" />
              ))}
            </div>
            <div className="text-3xl font-bold">{stats.stars[5]}</div>
            <div className="text-xs mt-1 opacity-75">{getPercentage(stats.stars[5])}%</div>
          </div>

          {/* 4 Stelle */}
          <div className={`card bg-gradient-to-br border ${getStarColor(4)}`}>
            <div className="flex items-center gap-1 mb-2">
              {[...Array(4)].map((_, i) => (
                <FiStar key={i} size={12} className="fill-current text-blue-600" />
              ))}
              <FiStar size={12} className="text-gray-300" />
            </div>
            <div className="text-3xl font-bold">{stats. stars[4]}</div>
            <div className="text-xs mt-1 opacity-75">{getPercentage(stats. stars[4])}%</div>
          </div>

          {/* 3 Stelle */}
          <div className={`card bg-gradient-to-br border ${getStarColor(3)}`}>
            <div className="flex items-center gap-1 mb-2">
              {[...Array(3)].map((_, i) => (
                <FiStar key={i} size={12} className="fill-current text-yellow-600" />
              ))}
              {[...Array(2)].map((_, i) => (
                <FiStar key={i} size={12} className="text-gray-300" />
              ))}
            </div>
            <div className="text-3xl font-bold">{stats. stars[3]}</div>
            <div className="text-xs mt-1 opacity-75">{getPercentage(stats. stars[3])}%</div>
          </div>

          {/* 2 Stelle */}
          <div className={`card bg-gradient-to-br border ${getStarColor(2)}`}>
            <div className="flex items-center gap-1 mb-2">
              {[...Array(2)].map((_, i) => (
                <FiStar key={i} size={12} className="fill-current text-orange-600" />
              ))}
              {[...Array(3)].map((_, i) => (
                <FiStar key={i} size={12} className="text-gray-300" />
              ))}
            </div>
            <div className="text-3xl font-bold">{stats.stars[2]}</div>
            <div className="text-xs mt-1 opacity-75">{getPercentage(stats.stars[2])}%</div>
          </div>

          {/* 1 Stella */}
          <div className={`card bg-gradient-to-br border ${getStarColor(1)}`}>
            <div className="flex items-center gap-1 mb-2">
              <FiStar size={12} className="fill-current text-red-600" />
              {[...Array(4)].map((_, i) => (
                <FiStar key={i} size={12} className="text-gray-300" />
              ))}
            </div>
            <div className="text-3xl font-bold">{stats.stars[1]}</div>
            <div className="text-xs mt-1 opacity-75">{getPercentage(stats.stars[1])}%</div>
          </div>
        </div>

        {/* Barre di Progresso */}
        <div className="mt-6 space-y-3">
          {[5, 4, 3, 2, 1].map(star => (
            <div key={star} className="flex items-center gap-3">
              <div className="flex items-center gap-1 w-20">
                {[...Array(star)].map((_, i) => (
                  <FiStar key={i} size={12} className="fill-yellow-400 text-yellow-400" />
                ))}
                {[...Array(5 - star)].map((_, i) => (
                  <FiStar key={i} size={12} className="text-gray-300" />
                ))}
              </div>
              <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    star === 5 ? 'bg-green-500' : 
                    star === 4 ? 'bg-blue-500' :
                    star === 3 ? 'bg-yellow-500' :
                    star === 2 ? 'bg-orange-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${getPercentage(stats.stars[star])}%` }}
                />
              </div>
              <div className="w-20 text-right">
                <span className="text-sm font-semibold text-gray-700">{stats.stars[star]}</span>
                <span className="text-xs text-gray-500 ml-1">({getPercentage(stats.stars[star])}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <FiFilter className="text-gray-500" />
          <h2 className="text-lg font-semibold">Filtri</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label">
              <FiUser className="inline mr-1" /> Filtra per Utente
            </label>
            <input
              type="text"
              placeholder="user_123"
              value={filterUserId}
              onChange={(e) => { setFilterUserId(e.target.value); setPage(1); }}
              className="input"
            />
          </div>

          <div>
            <label className="label">
              <FiFilm className="inline mr-1" /> Filtra per ID Contenuto
            </label>
            <input
              type="text"
              placeholder="ID contenuto"
              value={filterContentId}
              onChange={(e) => { setFilterContentId(e.target.value); setPage(1); }}
              className="input"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="btn btn-secondary w-full"
            >
              Rimuovi Filtri
            </button>
          </div>
        </div>

        {(filterUserId || filterContentId) && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
            Filtri attivi: {filterUserId && `Utente: ${filterUserId}`} {filterContentId && `Contenuto: ${filterContentId}`}
          </div>
        )}
      </div>

      {/* Ratings List */}
      {loading ?  (
        <LoadingSpinner />
      ) : ratings.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500">Nessuna valutazione trovata</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {ratings.map((rating) => (
              <div key={rating._id} className="card hover:shadow-lg transition-shadow">
                {/* MODE:  Visualizzazione */}
                {editingRatingId !== rating._id ?  (
                  <div className="flex items-start justify-between">
                    {/* Left Side */}
                    <div className="flex-1">
                      {/* User Info */}
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-semibold">
                          {rating.userId?. substring(0, 2).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{rating.userId}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(rating.createdAt).toLocaleDateString('it-IT', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>

                      {/* Content Info */}
                      {rating.contentId && (
                        <Link
                          to={`/contents/${rating.contentId._id}`}
                          className="inline-flex items-center gap-2 mb-3 text-primary-600 hover:text-primary-700 hover:underline"
                        >
                          <FiFilm size={18} />
                          <span className="font-medium">{rating. contentId.title}</span>
                          <span className="badge bg-gray-100 text-gray-700">
                            {rating.contentId.genre}
                          </span>
                          <span className="text-sm text-gray-500">
                            ({rating.contentId.year})
                          </span>
                        </Link>
                      )}

                      {/* Rating Stars */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex gap-1">
                          {renderStars(rating.rating)}
                        </div>
                        <span className="text-sm font-semibold text-gray-700">
                          {rating.rating}/5
                        </span>
                      </div>

                      {/* Comment */}
                      {rating.comment && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-gray-700 italic">"{rating.comment}"</p>
                        </div>
                      )}
                    </div>

                    {/* Right Side - Actions */}
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleStartEdit(rating)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Modifica valutazione"
                      >
                        <FiEdit2 size={20} />
                      </button>
                      <button
                        onClick={() => handleDelete(rating._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Elimina valutazione"
                      >
                        <FiTrash2 size={20} />
                      </button>
                    </div>
                  </div>
                ) : (
                  /* MODE: Modifica */
                  <div className="space-y-4 bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border-2 border-blue-200">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-gray-900 flex items-center gap-2 text-lg">
                        <FiEdit2 className="text-blue-600" />
                        Modifica Valutazione
                      </h4>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                          {rating.userId?.substring(0, 2).toUpperCase() || 'U'}
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">{rating.userId}</p>
                          {rating.contentId && (
                            <Link
                              to={`/contents/${rating.contentId._id}`}
                              className="text-xs text-primary-600 hover:underline"
                            >
                              {rating.contentId.title}
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="label">Valutazione</label>
                      <div className="flex items-center gap-3 bg-white p-4 rounded-lg">
                        {renderStars(
                          editRatingData.rating,
                          true,
                          (value) => setEditRatingData({ ...editRatingData, rating: value }),
                          setEditHoveredStar,
                          editHoveredStar
                        )}
                        {editRatingData.rating > 0 && (
                          <span className="ml-4 text-2xl font-bold text-primary-700">
                            {editRatingData.rating}/5
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="label">Commento</label>
                      <textarea
                        value={editRatingData.comment}
                        onChange={(e) => setEditRatingData({ ... editRatingData, comment: e.target.value })}
                        className="input min-h-24"
                        placeholder="Scrivi un commento..."
                        rows={4}
                      />
                    </div>

                    <div className="flex gap-2 pt-4 border-t border-blue-200">
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(rating._id)}
                        className="btn btn-primary flex items-center gap-2 flex-1"
                      >
                        <FiSave size={20} />
                        Salva Modifiche
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="btn btn-secondary flex items-center gap-2"
                      >
                        <FiX size={20} />
                        Annulla
                      </button>
                    </div>
                  </div>
                )}

                {/* Rating ID */}
                {editingRatingId !== rating._id && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-400 font-mono">ID: {rating._id}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.pages}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
};

export default Ratings;