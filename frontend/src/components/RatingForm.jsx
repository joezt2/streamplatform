import React, { useState } from 'react';
import { ratingAPI } from '../services/api';
import { FiStar } from 'react-icons/fi';
import toast from 'react-hot-toast';

const RatingForm = ({ contentId, onSuccess }) => {
  const [formData, setFormData] = useState({
    userId: '',
    rating: 0,
    comment: ''
  });
  const [hoveredRating, setHoveredRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (! formData.userId. trim()) {
      toast.error('Inserisci un ID utente');
      return;
    }

    if (formData.rating === 0) {
      toast. error('Seleziona un voto');
      return;
    }

    try {
      setSubmitting(true);
      await ratingAPI.create({
        userId: formData.userId. trim(),
        contentId,
        rating: formData.rating,
        comment: formData. comment. trim()
      });
      toast.success('Valutazione aggiunta con successo!');
      setFormData({ userId: '', rating: 0, comment: '' });
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error('Errore: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-lg space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Aggiungi la tua valutazione</h3>

      {/* User ID */}
      <div>
        <label className="label">ID Utente *</label>
        <input
          type="text"
          value={formData.userId}
          onChange={(e) => setFormData(prev => ({ ...prev, userId: e.target.value }))}
          className="input"
          placeholder="es: user_123"
          disabled={submitting}
        />
      </div>

      {/* Star Rating */}
      <div>
        <label className="label">Voto *</label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="transition-transform hover:scale-110 active:scale-95"
              disabled={submitting}
            >
              <FiStar
                size={32}
                className={`${
                  star <= (hoveredRating || formData.rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                } transition-colors`}
              />
            </button>
          ))}
          {formData.rating > 0 && (
            <span className="ml-2 text-gray-600 self-center">
              {formData.rating}/5
            </span>
          )}
        </div>
      </div>

      {/* Comment */}
      <div>
        <label className="label">Commento (opzionale)</label>
        <textarea
          value={formData.comment}
          onChange={(e) => setFormData(prev => ({ ...prev, comment: e. target.value }))}
          className="input min-h-[100px]"
          placeholder="Condividi la tua opinione..."
          maxLength={1000}
          disabled={submitting}
        />
        <p className="text-sm text-gray-500 mt-1">{formData.comment. length}/1000</p>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={submitting}
        className="btn btn-primary w-full"
      >
        {submitting ? 'Invio...' : 'Invia Valutazione'}
      </button>
    </form>
  );
};

export default RatingForm;