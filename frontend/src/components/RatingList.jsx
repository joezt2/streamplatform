import React, { useState, useEffect } from 'react';
import { ratingAPI } from '../services/api';
import { FiStar, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import LoadingSpinner from './LoadingSpinner';
import Pagination from './Pagination';

const RatingList = ({ contentId, recentReviews = [] }) => {
  const [ratings, setRatings] = useState(recentReviews);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (showAll) {
      loadAllRatings();
    }
  }, [page, showAll]);

  const loadAllRatings = async () => {
    try {
      setLoading(true);
      const response = await ratingAPI.getByContent(contentId, { page, limit: 10 });
      setRatings(response.data. data);
      setPagination(response.data.pagination);
    } catch (error) {
      toast.error('Errore caricamento valutazioni: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (ratingId) => {
    if (! window.confirm('Eliminare questa valutazione?')) return;

    try {
      await ratingAPI.delete(ratingId);
      toast.success('Valutazione eliminata');
      if (showAll) {
        loadAllRatings();
      } else {
        setRatings(prev => prev.filter(r => r._id !== ratingId));
      }
    } catch (error) {
      toast.error('Errore eliminazione: ' + error.message);
    }
  };

  if (! showAll && ratings.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Nessuna valutazione ancora.  Sii il primo! </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {! showAll && ratings.length > 0 && (
        <button
          onClick={() => setShowAll(true)}
          className="text-primary-600 hover:underline text-sm"
        >
          Mostra tutte le valutazioni →
        </button>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          <div className="space-y-4">
            {ratings.map((rating) => (
              <div key={rating._id} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-semibold">
                      {rating.userId?. substring(0, 2). toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{rating. userId}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[... Array(5)].map((_, i) => (
                            <FiStar
                              key={i}
                              size={16}
                              className={i < rating.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(rating.createdAt). toLocaleDateString('it-IT')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(rating._id)}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <FiTrash2 size={18} />
                  </button>
                </div>
                {rating.comment && (
                  <p className="text-gray-700 mt-2 pl-13">{rating.comment}</p>
                )}
              </div>
            ))}
          </div>

          {showAll && pagination.pages > 1 && (
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination. pages}
              onPageChange={setPage}
            />
          )}
        </>
      )}
    </div>
  );
};

export default RatingList;