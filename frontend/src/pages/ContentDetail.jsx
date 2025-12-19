import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { contentAPI, ratingAPI } from '../services/api';
import { FiArrowLeft, FiEdit2, FiTrash2, FiStar, FiClock, FiCalendar, FiUsers, FiMessageSquare, FiTrendingUp, FiAward, FiFilm, FiPlusCircle, FiBarChart2, FiSave, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

const ContentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratingsPage, setRatingsPage] = useState(1);
  const [hasMoreRatings, setHasMoreRatings] = useState(true);
  const [showNewRatingForm, setShowNewRatingForm] = useState(false);

  // Nuovo rating form
  const [newRating, setNewRating] = useState({
    userId: '',
    rating: 0,
    comment: ''
  });
  const [hoveredStar, setHoveredStar] = useState(0);

  // Edit rating state
  const [editingRatingId, setEditingRatingId] = useState(null);
  const [editRatingData, setEditRatingData] = useState({
    rating: 0,
    comment:  ''
  });
  const [editHoveredStar, setEditHoveredStar] = useState(0);

  useEffect(() => {
    loadContent();
    loadRatings();
  }, [id]);

  const loadContent = async () => {
    try {
      setLoading(true);
      const response = await contentAPI.getById(id);
      setContent(response.data. data);
    } catch (error) {
      toast.error('Errore caricamento contenuto:  ' + error.message);
      navigate('/contents');
    } finally {
      setLoading(false);
    }
  };

  const loadRatings = async (page = 1) => {
    try {
      const response = await ratingAPI.getByContent(id, { page, limit: 10 });
      if (page === 1) {
        setRatings(response.data. data);
      } else {
        setRatings(prev => [...prev, ... response.data.data]);
      }
      setHasMoreRatings(response.data.pagination.page < response.data.pagination.pages);
      setRatingsPage(page);
    } catch (error) {
      console.error('Errore caricamento recensioni:', error);
    }
  };

  const handleDelete = async () => {
    if (! window.confirm(`Eliminare "${content.title}"?\n\nQuesta azione eliminerà anche tutte le ${content.totalRatings} recensioni associate. `)) return;

    try {
      await contentAPI.delete(id);
      toast.success('Contenuto eliminato con successo');
      navigate('/contents');
    } catch (error) {
      toast.error('Errore eliminazione:  ' + error.message);
    }
  };

  const handleDeleteRating = async (ratingId) => {
    if (!window.confirm('Eliminare questa recensione?')) return;

    try {
      await ratingAPI. delete(ratingId);
      toast.success('Recensione eliminata');
      loadContent();
      loadRatings(1);
    } catch (error) {
      toast.error('Errore eliminazione recensione: ' + error.message);
    }
  };

  const handleSubmitNewRating = async (e) => {
    e.preventDefault();

    if (!newRating.userId. trim()) {
      toast.error('Inserisci ID utente');
      return;
    }

    if (newRating.rating === 0) {
      toast.error('Seleziona una valutazione');
      return;
    }

    try {
      await ratingAPI.create({
        userId: newRating.userId,
        contentId: id,
        rating:  newRating.rating,
        comment: newRating.comment
      });

      toast.success('Recensione aggiunta! ');
      setNewRating({ userId: '', rating: 0, comment: '' });
      setShowNewRatingForm(false);
      loadContent();
      loadRatings(1);
    } catch (error) {
      toast.error('Errore: ' + (error.response?.data?.error || error.message));
    }
  };

  // Inizia modifica recensione
  const handleStartEditRating = (rating) => {
    setEditingRatingId(rating._id);
    setEditRatingData({
      rating: rating. rating,
      comment: rating. comment || ''
    });
    setEditHoveredStar(0);
  };

  // Annulla modifica
  const handleCancelEditRating = () => {
    setEditingRatingId(null);
    setEditRatingData({ rating: 0, comment: '' });
    setEditHoveredStar(0);
  };

  // Salva modifica recensione
  const handleSaveEditRating = async (ratingId) => {
    if (editRatingData.rating === 0) {
      toast.error('Seleziona una valutazione');
      return;
    }

    try {
      await ratingAPI.update(ratingId, {
        rating: editRatingData.rating,
        comment: editRatingData.comment
      });

      toast.success('Recensione aggiornata!');
      setEditingRatingId(null);
      setEditRatingData({ rating: 0, comment: '' });
      loadContent();
      loadRatings(1);
    } catch (error) {
      toast.error('Errore aggiornamento: ' + (error.response?.data?.error || error.message));
    }
  };

  const getGenreColor = (genre) => {
    const colors = {
      'Azione': 'from-red-500 to-red-600',
      'Commedia': 'from-yellow-500 to-yellow-600',
      'Drammatico': 'from-purple-500 to-purple-600',
      'Thriller': 'from-gray-700 to-gray-900',
      'Sci-Fi': 'from-blue-500 to-blue-600',
      'Horror': 'from-red-800 to-red-950',
      'Romantico': 'from-pink-500 to-pink-600',
      'Animazione': 'from-green-500 to-green-600',
      'Documentario': 'from-orange-500 to-orange-600',
      'Fantasy': 'from-indigo-500 to-indigo-600'
    };
    return colors[genre] || 'from-gray-500 to-gray-600';
  };

  const getGenreBadgeColor = (genre) => {
    const colors = {
      'Azione': 'bg-red-100 text-red-700 border-red-200',
      'Commedia':  'bg-yellow-100 text-yellow-700 border-yellow-200',
      'Drammatico': 'bg-purple-100 text-purple-700 border-purple-200',
      'Thriller': 'bg-gray-800 text-white border-gray-900',
      'Sci-Fi': 'bg-blue-100 text-blue-700 border-blue-200',
      'Horror': 'bg-red-900 text-white border-red-950',
      'Romantico': 'bg-pink-100 text-pink-700 border-pink-200',
      'Animazione': 'bg-green-100 text-green-700 border-green-200',
      'Documentario': 'bg-orange-100 text-orange-700 border-orange-200',
      'Fantasy':  'bg-indigo-100 text-indigo-700 border-indigo-200'
    };
    return colors[genre] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const renderStars = (rating, interactive = false, onStarClick = null, onStarHover = null, hoveredValue = 0) => {
    return [... Array(5)].map((_, i) => {
      const starValue = i + 1;
      const isFilled = interactive 
        ? starValue <= (hoveredValue || rating)
        : i < Math.round(rating);

      return (
        <FiStar
          key={i}
          size={interactive ? 32 : 20}
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

  if (loading) return <LoadingSpinner />;
  if (!content) return null;

  const ratingDistribution = ratings.reduce((acc, r) => {
    acc[r.rating] = (acc[r.rating] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <button
          onClick={() => navigate('/contents')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors w-fit group"
        >
          <div className="p-2 group-hover:bg-gray-100 rounded-lg transition-colors">
            <FiArrowLeft size={20} />
          </div>
          <span className="font-medium">Torna alla lista</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/contents/edit/${id}`)}
            className="p-3 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-2 border border-blue-200"
            title="Modifica contenuto"
          >
            <FiEdit2 size={20} />
            <span className="hidden sm:inline text-sm font-medium">Modifica</span>
          </button>
          <button
            onClick={handleDelete}
            className="p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2 border border-red-200"
            title="Elimina contenuto"
          >
            <FiTrash2 size={20} />
            <span className="hidden sm:inline text-sm font-medium">Elimina</span>
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className={`card overflow-hidden bg-gradient-to-br ${getGenreColor(content.genre)} text-white relative`}>
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }} />

        <div className="p-8 md:p-12 relative z-10">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="w-full lg:w-80 h-[480px] bg-black bg-opacity-30 rounded-2xl flex flex-col items-center justify-center flex-shrink-0 border-4 border-white border-opacity-20 shadow-2xl backdrop-blur-sm">
              <div className="text-9xl mb-4 opacity-50">🎬</div>
              <div className="text-center">
                <p className="text-white text-opacity-80 text-sm font-medium">POSTER</p>
                <p className="text-white text-opacity-60 text-xs mt-1">{content.year}</p>
              </div>
            </div>

            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-start gap-4 mb-4">
                  <h1 className="text-4xl md:text-6xl font-bold leading-tight flex-1">
                    {content. title}
                  </h1>
                  <span className={`badge ${getGenreBadgeColor(content.genre)} border-2 text-lg px-5 py-2 whitespace-nowrap shadow-lg`}>
                    {content.genre}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-6 text-lg mb-6 text-white text-opacity-90">
                  <div className="flex items-center gap-2 bg-white bg-opacity-20 px-4 py-2 rounded-full backdrop-blur-sm">
                    <FiCalendar size={20} />
                    <span className="font-semibold">{content.year}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white bg-opacity-20 px-4 py-2 rounded-full backdrop-blur-sm">
                    <FiClock size={20} />
                    <span className="font-semibold">
                      {Math.floor(content.duration / 60)}h {content.duration % 60}m
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-white bg-opacity-20 px-4 py-2 rounded-full backdrop-blur-sm">
                    <FiMessageSquare size={20} />
                    <span className="font-semibold">{content.totalRatings} recensioni</span>
                  </div>
                </div>

                <div className="bg-white bg-opacity-20 backdrop-blur-md rounded-2xl p-6 mb-6 border border-white border-opacity-30">
                  <div className="flex items-center gap-6">
                    <div className="flex flex-col items-center">
                      <div className="text-6xl font-bold mb-2">
                        {content.averageRating.toFixed(1)}
                      </div>
                      <div className="flex gap-1 mb-2">
                        {renderStars(content.averageRating)}
                      </div>
                      <p className="text-sm text-white text-opacity-80">
                        su {content.totalRatings} voti
                      </p>
                    </div>
                    
                    {content.averageRating >= 4.5 && (
                      <div className="flex items-center gap-2 bg-yellow-400 bg-opacity-90 text-yellow-900 px-4 py-2 rounded-full">
                        <FiAward size={20} />
                        <span className="font-bold">Eccellenza</span>
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-xl leading-relaxed text-white text-opacity-95 mb-6 font-light">
                  {content.description}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-4 text-white text-opacity-90">
                  <FiUsers size={24} />
                  <h3 className="font-semibold text-xl">Cast Principale</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {content.actors.map((actor, index) => (
                    <span
                      key={index}
                      className="px-5 py-2 bg-white bg-opacity-25 rounded-full text-sm font-medium backdrop-blur-sm border border-white border-opacity-30 hover:bg-opacity-35 transition-all"
                    >
                      {actor}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-200 hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-yellow-200 rounded-xl flex items-center justify-center shadow-inner">
              <FiStar size={28} className="text-yellow-700 fill-current" />
            </div>
            <div>
              <p className="text-sm text-yellow-700 font-medium">Valutazione</p>
              <p className="text-3xl font-bold text-yellow-800">{content.averageRating.toFixed(2)}</p>
              <p className="text-xs text-yellow-600">su 5.00</p>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-200 rounded-xl flex items-center justify-center shadow-inner">
              <FiMessageSquare size={28} className="text-blue-700" />
            </div>
            <div>
              <p className="text-sm text-blue-700 font-medium">Recensioni</p>
              <p className="text-3xl font-bold text-blue-800">{content.totalRatings}</p>
              <p className="text-xs text-blue-600">totali</p>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-purple-200 rounded-xl flex items-center justify-center shadow-inner">
              <FiTrendingUp size={28} className="text-purple-700" />
            </div>
            <div>
              <p className="text-sm text-purple-700 font-medium">Popolarità</p>
              <p className="text-2xl font-bold text-purple-800">
                {content.totalRatings > 200 ? 'Alta' : content.totalRatings > 50 ? 'Media' : 'Bassa'}
              </p>
              <p className="text-xs text-purple-600">
                {content.totalRatings > 200 ? '🔥 Trending' : content.totalRatings > 50 ? '📈 Crescente' : '🌱 Emergente'}
              </p>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-green-200 rounded-xl flex items-center justify-center shadow-inner">
              <FiUsers size={28} className="text-green-700" />
            </div>
            <div>
              <p className="text-sm text-green-700 font-medium">Cast</p>
              <p className="text-3xl font-bold text-green-800">{content.actors.length}</p>
              <p className="text-xs text-green-600">attori</p>
            </div>
          </div>
        </div>
      </div>

      {/* Rating Distribution */}
      {content.totalRatings > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <FiBarChart2 className="text-primary-600" />
              Distribuzione Valutazioni
            </h2>
            <div className="text-sm text-gray-500">
              Basato su {content.totalRatings} recensioni
            </div>
          </div>
          <div className="space-y-4">
            {[5, 4, 3, 2, 1].map(star => {
              const count = ratingDistribution[star] || 0;
              const percentage = content.totalRatings > 0 ?  (count / content.totalRatings * 100) : 0;
              return (
                <div key={star} className="flex items-center gap-4">
                  <div className="flex items-center gap-1 w-28">
                    {[...Array(star)].map((_, i) => (
                      <FiStar key={i} size={16} className="fill-yellow-400 text-yellow-400" />
                    ))}
                    {[...Array(5 - star)].map((_, i) => (
                      <FiStar key={i} size={16} className="text-gray-300" />
                    ))}
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 flex items-center justify-end pr-2 text-white text-xs font-bold ${
                        star === 5 ? 'bg-gradient-to-r from-green-400 to-green-500' : 
                        star === 4 ?  'bg-gradient-to-r from-blue-400 to-blue-500' :
                        star === 3 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' :
                        star === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-500' :
                        'bg-gradient-to-r from-red-400 to-red-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    >
                      {percentage > 10 && `${percentage.toFixed(0)}%`}
                    </div>
                  </div>
                  <div className="w-28 text-right">
                    <span className="text-base font-bold text-gray-700">{count}</span>
                    <span className="text-sm text-gray-500 ml-2">({percentage.toFixed(1)}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Reviews Section */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <FiMessageSquare className="text-primary-600" />
            Recensioni ({content.totalRatings})
          </h2>
          <button
            onClick={() => setShowNewRatingForm(! showNewRatingForm)}
            className={`btn ${showNewRatingForm ? 'btn-secondary' : 'btn-primary'} flex items-center gap-2`}
          >
            {showNewRatingForm ? <FiX size={20} /> : <FiPlusCircle size={20} />}
            {showNewRatingForm ? 'Annulla' : 'Nuova Recensione'}
          </button>
        </div>

        {/* New Rating Form */}
        {showNewRatingForm && (
          <form onSubmit={handleSubmitNewRating} className="p-6 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl border-2 border-primary-200 mb-6">
            <h3 className="text-lg font-semibold text-primary-900 mb-4">Aggiungi una recensione</h3>
            
            <div className="space-y-4">
              <div>
                <label className="label">ID Utente</label>
                <input
                  type="text"
                  value={newRating.userId}
                  onChange={(e) => setNewRating({ ...newRating, userId: e.target.value })}
                  className="input"
                  placeholder="user_123"
                  required
                />
              </div>

              <div>
                <label className="label">Valutazione</label>
                <div className="flex items-center gap-2">
                  {renderStars(
                    newRating.rating,
                    true,
                    (value) => setNewRating({ ... newRating, rating: value }),
                    setHoveredStar,
                    hoveredStar
                  )}
                  {newRating.rating > 0 && (
                    <span className="ml-4 text-2xl font-bold text-primary-700">
                      {newRating.rating}/5
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="label">Commento (opzionale)</label>
                <textarea
                  value={newRating.comment}
                  onChange={(e) => setNewRating({ ...newRating, comment: e.target.value })}
                  className="input min-h-24"
                  placeholder="Scrivi la tua recensione..."
                  rows={4}
                />
              </div>

              <button type="submit" className="btn btn-primary w-full">
                <FiSave size={20} className="inline mr-2" />
                Pubblica Recensione
              </button>
            </div>
          </form>
        )}

        {/* Reviews List */}
        {ratings.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-xl">
            <FiMessageSquare size={64} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600 text-xl font-medium mb-2">Nessuna recensione ancora</p>
            <p className="text-gray-400">Sii il primo a lasciare una valutazione! </p>
            <button
              onClick={() => setShowNewRatingForm(true)}
              className="btn btn-primary mt-6"
            >
              Scrivi la prima recensione
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {ratings.map((rating) => (
                <div key={rating._id} className="p-6 bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-gray-200 hover:shadow-lg hover:border-primary-200 transition-all">
                  {/* MODE:  Visualizzazione */}
                  {editingRatingId !== rating._id ? (
                    <>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                            {rating.userId?. substring(0, 2).toUpperCase() || 'U'}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-lg">{rating.userId}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(rating.createdAt).toLocaleDateString('it-IT', {
                                day: 'numeric',
                                month:  'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col items-end">
                            <div className="flex items-center gap-1 mb-1">
                              {renderStars(rating.rating)}
                            </div>
                            <span className="text-lg font-bold text-primary-700">
                              {rating.rating}/5
                            </span>
                          </div>
                          <button
                            onClick={() => handleStartEditRating(rating)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Modifica recensione"
                          >
                            <FiEdit2 size={20} />
                          </button>
                          <button
                            onClick={() => handleDeleteRating(rating._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Elimina recensione"
                          >
                            <FiTrash2 size={20} />
                          </button>
                        </div>
                      </div>
                      {rating.comment && (
                        <div className="pl-18 bg-white p-4 rounded-lg border border-gray-200">
                          <p className="text-gray-800 leading-relaxed italic">"{rating.comment}"</p>
                        </div>
                      )}
                    </>
                  ) : (
                    /* MODE: Modifica */
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                          <FiEdit2 className="text-blue-600" />
                          Modifica Recensione
                        </h4>
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                            {rating.userId?. substring(0, 2).toUpperCase() || 'U'}
                          </div>
                          <span className="text-sm text-gray-600">{rating.userId}</span>
                        </div>
                      </div>

                      <div>
                        <label className="label">Valutazione</label>
                        <div className="flex items-center gap-2">
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
                          onChange={(e) => setEditRatingData({ ...editRatingData, comment: e.target.value })}
                          className="input min-h-24"
                          placeholder="Scrivi la tua recensione..."
                          rows={4}
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleSaveEditRating(rating._id)}
                          className="btn btn-primary flex items-center gap-2 flex-1"
                        >
                          <FiSave size={20} />
                          Salva Modifiche
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelEditRating}
                          className="btn btn-secondary flex items-center gap-2"
                        >
                          <FiX size={20} />
                          Annulla
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {hasMoreRatings && (
              <div className="text-center mt-6">
                <button
                  onClick={() => loadRatings(ratingsPage + 1)}
                  className="btn btn-secondary"
                >
                  Carica altre recensioni
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Metadata */}
      <div className="card bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <FiFilm className="text-gray-500" />
          <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Informazioni Tecniche</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-gray-500 font-medium min-w-32">ID Contenuto:</span>
            <span className="font-mono text-gray-900 bg-white px-2 py-1 rounded border border-gray-200">{content._id}</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-gray-500 font-medium min-w-32">Creato il:</span>
            <span className="text-gray-900">
              {new Date(content. createdAt).toLocaleDateString('it-IT', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-gray-500 font-medium min-w-32">Ultima modifica: </span>
            <span className="text-gray-900">
              {new Date(content.updatedAt).toLocaleDateString('it-IT', {
                day:  'numeric',
                month:  'long',
                year:  'numeric',
                hour:  '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-gray-500 font-medium min-w-32">Durata (minuti):</span>
            <span className="text-gray-900">{content.duration} min</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentDetail;