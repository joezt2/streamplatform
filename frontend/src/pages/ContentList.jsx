import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { contentAPI } from '../services/api';
import { FiPlus, FiSearch, FiFilter, FiStar, FiClock, FiCalendar, FiEdit2, FiTrash2, FiEye, FiUsers, FiGrid, FiList } from 'react-icons/fi';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import Pagination from '../components/Pagination';

const ContentList = () => {
  const navigate = useNavigate();
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState('grid');
  
  const [filters, setFilters] = useState({
    search: '',
    genre: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    minRating: 0
  });

  const genres = [
    'Tutti',
    'Azione',
    'Commedia',
    'Drammatico',
    'Thriller',
    'Sci-Fi',
    'Horror',
    'Romantico',
    'Animazione',
    'Documentario',
    'Fantasy'
  ];

  useEffect(() => {
    loadContents();
  }, [page, filters]);

  const loadContents = async () => {
    try {
      setLoading(true);
      let response;

      if (filters.search) {
        response = await contentAPI.search(filters.search, { 
          page, 
          limit: 12,
          sortBy: filters.sortBy,
          sortOrder: filters.sortOrder
        });
      } else if (filters.genre && filters.genre !== 'Tutti') {
        response = await contentAPI.getByGenre(filters.genre, { 
          page, 
          limit: 12,
          sortBy: filters. sortBy,
          sortOrder:  filters.sortOrder
        });
      } else {
        response = await contentAPI.getAll({ 
          page, 
          limit: 12,
          sortBy: filters.sortBy,
          sortOrder: filters.sortOrder
        });
      }

      let filteredContents = response.data. data;

      if (filters.minRating > 0) {
        filteredContents = filteredContents.filter(c => c.averageRating >= filters.minRating);
      }

      setContents(filteredContents);
      setPagination(response. data. pagination);
    } catch (error) {
      toast.error('Errore caricamento contenuti:  ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (! window.confirm(`Eliminare "${title}"?`)) return;

    try {
      await contentAPI.delete(id);
      toast.success('Contenuto eliminato');
      loadContents();
    } catch (error) {
      toast.error('Errore eliminazione:  ' + error.message);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    loadContents();
  };

  const clearFilters = () => {
    setFilters({
      search:  '',
      genre: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
      minRating:  0
    });
    setPage(1);
  };

  const getGenreColor = (genre) => {
    const colors = {
      'Azione': 'bg-red-100 text-red-700 border-red-200',
      'Commedia':  'bg-yellow-100 text-yellow-700 border-yellow-200',
      'Drammatico': 'bg-purple-100 text-purple-700 border-purple-200',
      'Thriller': 'bg-gray-800 text-white border-gray-900',
      'Sci-Fi': 'bg-blue-100 text-blue-700 border-blue-200',
      'Horror': 'bg-red-900 text-white border-red-950',
      'Romantico':  'bg-pink-100 text-pink-700 border-pink-200',
      'Animazione': 'bg-green-100 text-green-700 border-green-200',
      'Documentario': 'bg-orange-100 text-orange-700 border-orange-200',
      'Fantasy': 'bg-indigo-100 text-indigo-700 border-indigo-200'
    };
    return colors[genre] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const renderStars = (rating) => {
    return [... Array(5)].map((_, i) => (
      <FiStar
        key={i}
        size={16}
        className={i < Math.round(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
      />
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contenuti</h1>
          <p className="text-gray-600 mt-1">
            {pagination.total || 0} contenuti totali
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-white text-primary-600 shadow-sm' 
                  :  'text-gray-600 hover:text-gray-900'
              }`}
              title="Vista griglia"
            >
              <FiGrid size={20} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'list' 
                  ? 'bg-white text-primary-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Vista lista"
            >
              <FiList size={20} />
            </button>
          </div>

          <Link
            to="/contents/new"
            className="btn btn-primary flex items-center gap-2 whitespace-nowrap"
          >
            <FiPlus size={20} />
            <span className="hidden sm:inline">Nuovo Contenuto</span>
            <span className="sm:hidden">Nuovo</span>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="card bg-gradient-to-br from-gray-50 to-white">
        <div className="flex items-center gap-2 mb-4">
          <FiFilter className="text-primary-600" />
          <h2 className="text-lg font-semibold">Filtri e Ricerca</h2>
        </div>

        <div className="space-y-4">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Cerca per titolo o descrizione..."
                value={filters. search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="input pl-10"
              />
            </div>
            <button type="submit" className="btn btn-primary whitespace-nowrap">
              Cerca
            </button>
          </form>

          {/* Filter Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="label">Genere</label>
              <select
                value={filters. genre}
                onChange={(e) => { setFilters({ ...filters, genre: e.target.value }); setPage(1); }}
                className="input"
              >
                {genres.map(genre => (
                  <option key={genre} value={genre === 'Tutti' ? '' :  genre}>
                    {genre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Ordina per</label>
              <select
                value={filters.sortBy}
                onChange={(e) => { setFilters({ ...filters, sortBy: e.target.value }); setPage(1); }}
                className="input"
              >
                <option value="createdAt">Data Creazione</option>
                <option value="title">Titolo</option>
                <option value="year">Anno</option>
                <option value="averageRating">Valutazione</option>
                <option value="totalRatings">N° Recensioni</option>
              </select>
            </div>

            <div>
              <label className="label">Direzione</label>
              <select
                value={filters.sortOrder}
                onChange={(e) => { setFilters({ ...filters, sortOrder: e.target.value }); setPage(1); }}
                className="input"
              >
                <option value="desc">Decrescente</option>
                <option value="asc">Crescente</option>
              </select>
            </div>

            <div>
              <label className="label">Rating Minimo</label>
              <select
                value={filters.minRating}
                onChange={(e) => { setFilters({ ...filters, minRating: parseFloat(e.target.value) }); setPage(1); }}
                className="input"
              >
                <option value="0">Tutti</option>
                <option value="3. 0">≥ 3.0</option>
                <option value="4.0">≥ 4.0</option>
                <option value="4.5">≥ 4.5</option>
              </select>
            </div>
          </div>

          {/* Active Filters */}
          {(filters.search || filters.genre || filters.minRating > 0) && (
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <span className="text-sm text-blue-700 font-medium">Filtri attivi: </span>
              <div className="flex flex-wrap gap-2">
                {filters.search && (
                  <span className="badge bg-blue-100 text-blue-700 border border-blue-300">
                    Ricerca: "{filters.search}"
                  </span>
                )}
                {filters.genre && (
                  <span className="badge bg-blue-100 text-blue-700 border border-blue-300">
                    Genere: {filters.genre}
                  </span>
                )}
                {filters.minRating > 0 && (
                  <span className="badge bg-blue-100 text-blue-700 border border-blue-300">
                    Rating ≥ {filters.minRating}
                  </span>
                )}
              </div>
              <button onClick={clearFilters} className="ml-auto text-sm text-blue-600 hover:text-blue-800 underline whitespace-nowrap">
                Rimuovi tutti
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content Grid/List */}
      {loading ? (
        <LoadingSpinner />
      ) : contents.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-gray-400 mb-4">
            <FiSearch size={64} className="mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Nessun contenuto trovato</h3>
          <p className="text-gray-500 mb-6">Prova a modificare i filtri di ricerca</p>
          <button onClick={clearFilters} className="btn btn-secondary">
            Rimuovi Filtri
          </button>
        </div>
      ) : (
        <>
          {/* GRID VIEW */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {contents. map((content) => (
                <div
                  key={content._id}
                  className="card group hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-primary-200 flex flex-col"
                >
                  {/* Image Placeholder */}
                  <div 
                    className="h-48 bg-gradient-to-br from-primary-100 via-primary-200 to-primary-300 relative overflow-hidden cursor-pointer"
                    onClick={() => navigate(`/contents/${content._id}`)}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-6xl text-white opacity-50">🎬</div>
                    </div>
                    <div className="absolute top-3 left-3">
                      <span className={`badge border ${getGenreColor(content.genre)} font-semibold shadow-lg`}>
                        {content.genre}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3 bg-black bg-opacity-75 text-white px-3 py-1 rounded-full flex items-center gap-1">
                      <FiStar className="fill-yellow-400 text-yellow-400" size={14} />
                      <span className="font-bold">{content.averageRating. toFixed(1)}</span>
                    </div>
                  </div>

                  {/* Content Info */}
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex-1">
                      <h3 
                        className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors cursor-pointer"
                        onClick={() => navigate(`/contents/${content._id}`)}
                      >
                        {content.title}
                      </h3>

                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          <FiCalendar size={14} />
                          <span>{content.year}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FiClock size={14} />
                          <span>{content.duration}m</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex gap-0.5">
                          {renderStars(content.averageRating)}
                        </div>
                        <span className="text-sm text-gray-600">
                          ({content.totalRatings})
                        </span>
                      </div>

                      <div className="flex items-start gap-2 mb-4">
                        <FiUsers size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {content.actors.slice(0, 3).join(', ')}
                          {content.actors.length > 3 && '... '}
                        </p>
                      </div>
                    </div>

                    {/* Actions - Solo Icone */}
                    <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100">
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/contents/${content._id}`); }}
                        className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title="Visualizza dettagli"
                      >
                        <FiEye size={20} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/contents/edit/${content._id}`); }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Modifica contenuto"
                      >
                        <FiEdit2 size={20} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(content._id, content.title); }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Elimina contenuto"
                      >
                        <FiTrash2 size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* LIST VIEW */}
          {viewMode === 'list' && (
            <div className="space-y-4">
              {contents. map((content) => (
                <div
                  key={content._id}
                  className="card hover:shadow-lg transition-shadow border-l-4 border-primary-500"
                >
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Image */}
                    <div 
                      className="w-full md:w-48 h-32 bg-gradient-to-br from-primary-100 to-primary-300 rounded-lg flex items-center justify-center flex-shrink-0 cursor-pointer"
                      onClick={() => navigate(`/contents/${content._id}`)}
                    >
                      <div className="text-5xl text-white opacity-50">🎬</div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 flex flex-col">
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-3">
                          <div className="flex-1 min-w-0">
                            <h3 
                              className="text-xl font-bold text-gray-900 mb-2 hover:text-primary-600 transition-colors cursor-pointer"
                              onClick={() => navigate(`/contents/${content._id}`)}
                            >
                              {content. title}
                            </h3>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                              <span className={`badge border ${getGenreColor(content. genre)} font-semibold`}>
                                {content.genre}
                              </span>
                              <div className="flex items-center gap-1">
                                <FiCalendar size={14} />
                                {content.year}
                              </div>
                              <div className="flex items-center gap-1">
                                <FiClock size={14} />
                                {content.duration}m
                              </div>
                            </div>
                          </div>

                          <div className="text-left sm:text-right flex-shrink-0">
                            <div className="flex items-center gap-1 text-yellow-600 font-bold text-2xl">
                              <FiStar className="fill-current" />
                              {content.averageRating.toFixed(1)}
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                              {content.totalRatings} recensioni
                            </p>
                          </div>
                        </div>

                        <p className="text-gray-700 mb-3 line-clamp-2">
                          {content.description}
                        </p>

                        <div className="flex items-center gap-2 mb-4">
                          <FiUsers size={16} className="text-gray-400 flex-shrink-0" />
                          <p className="text-sm text-gray-600">
                            {content.actors. slice(0, 5).join(', ')}
                            {content.actors.length > 5 && ` +${content.actors.length - 5} altri`}
                          </p>
                        </div>
                      </div>

                      {/* Actions - Solo Icone */}
                      <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(`/contents/${content._id}`); }}
                          className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          title="Visualizza dettagli"
                        >
                          <FiEye size={20} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(`/contents/edit/${content._id}`); }}
                          className="p-2 text-blue-600 hover: bg-blue-50 rounded-lg transition-colors"
                          title="Modifica contenuto"
                        >
                          <FiEdit2 size={20} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(content._id, content.title); }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Elimina contenuto"
                        >
                          <FiTrash2 size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

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

export default ContentList;