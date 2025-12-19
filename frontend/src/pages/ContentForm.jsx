import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { contentAPI } from '../services/api';
import { FiSave, FiX, FiPlus, FiTrash2, FiArrowLeft, FiFilm } from 'react-icons/fi';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

const ContentForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [actorInput, setActorInput] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    year: new Date().getFullYear(),
    duration: 0,
    genre: 'Azione',
    actors: [],
    description: ''
  });

  const [errors, setErrors] = useState({});

  const genres = [
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
    if (isEdit) {
      loadContent();
    }
  }, [id]);

  const loadContent = async () => {
    try {
      setLoading(true);
      const response = await contentAPI. getById(id);
      const content = response.data.data;
      setFormData({
        title: content.title,
        year: content.year,
        duration: content.duration,
        genre: content.genre,
        actors: content.actors,
        description: content.description
      });
    } catch (error) {
      toast.error('Errore caricamento contenuto: ' + error.message);
      navigate('/contents');
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.title. trim()) {
      newErrors.title = 'Il titolo è obbligatorio';
    } else if (formData.title. length > 200) {
      newErrors.title = 'Massimo 200 caratteri';
    }

    const currentYear = new Date().getFullYear();
    if (formData.year < 1900 || formData.year > currentYear + 2) {
      newErrors.year = `Anno deve essere tra 1900 e ${currentYear + 2}`;
    }

    if (formData.duration < 1) {
      newErrors.duration = 'La durata deve essere maggiore di 0';
    }

    if (formData.actors.length === 0) {
      newErrors.actors = 'Aggiungi almeno un attore';
    }

    if (! formData.description.trim()) {
      newErrors.description = 'La descrizione è obbligatoria';
    } else if (formData.description.length < 10) {
      newErrors.description = 'Minimo 10 caratteri';
    } else if (formData.description. length > 2000) {
      newErrors.description = 'Massimo 2000 caratteri';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      toast.error('Controlla i campi del form');
      return;
    }

    try {
      setSubmitting(true);

      if (isEdit) {
        await contentAPI.update(id, formData);
        toast.success('Contenuto aggiornato con successo!');
      } else {
        await contentAPI.create(formData);
        toast.success('Contenuto creato con successo!');
      }

      navigate('/contents');
    } catch (error) {
      toast.error('Errore:  ' + (error.response?.data?.error || error.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddActor = (e) => {
    e.preventDefault();
    const actor = actorInput.trim();

    if (! actor) {
      toast.error('Inserisci il nome dell\'attore');
      return;
    }

    if (formData.actors.includes(actor)) {
      toast.error('Attore già aggiunto');
      return;
    }

    setFormData({ ...formData, actors: [...formData.actors, actor] });
    setActorInput('');
  };

  const handleRemoveActor = (index) => {
    setFormData({
      ...formData,
      actors: formData.actors.filter((_, i) => i !== index)
    });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/contents')}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Torna indietro"
          >
            <FiArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <FiFilm className="text-primary-600" />
              {isEdit ? 'Modifica Contenuto' : 'Nuovo Contenuto'}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEdit ? 'Aggiorna le informazioni del contenuto' : 'Inserisci i dettagli del nuovo contenuto'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main Info Card */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-6 pb-3 border-b border-gray-200">
            Informazioni Principali
          </h2>

          <div className="space-y-5">
            {/* Title */}
            <div>
              <label className="label">
                Titolo <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className={`input ${errors.title ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Es: Il Padrino"
                maxLength={200}
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
              <p className="text-gray-500 text-xs mt-1">{formData.title.length}/200 caratteri</p>
            </div>

            {/* Year and Duration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="label">
                  Anno <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                  className={`input ${errors.year ? 'border-red-500 focus:ring-red-500' :  ''}`}
                  min={1900}
                  max={new Date().getFullYear() + 2}
                />
                {errors.year && <p className="text-red-500 text-sm mt-1">{errors. year}</p>}
              </div>

              <div>
                <label className="label">
                  Durata (minuti) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                  className={`input ${errors.duration ? 'border-red-500 focus:ring-red-500' : ''}`}
                  min={1}
                  placeholder="Es: 120"
                />
                {errors.duration && <p className="text-red-500 text-sm mt-1">{errors.duration}</p>}
                {formData.duration > 0 && (
                  <p className="text-gray-500 text-xs mt-1">
                    ≈ {Math.floor(formData.duration / 60)}h {formData.duration % 60}m
                  </p>
                )}
              </div>
            </div>

            {/* Genre */}
            <div>
              <label className="label">
                Genere <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.genre}
                onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                className="input"
              >
                {genres.map(genre => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="label">
                Descrizione <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className={`input min-h-32 ${errors.description ? 'border-red-500 focus: ring-red-500' : ''}`}
                placeholder="Inserisci una descrizione dettagliata del contenuto..."
                maxLength={2000}
                rows={6}
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
              <p className="text-gray-500 text-xs mt-1">{formData.description.length}/2000 caratteri</p>
            </div>
          </div>
        </div>

        {/* Cast Card */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-6 pb-3 border-b border-gray-200">
            Cast <span className="text-red-500">*</span>
          </h2>

          <div className="space-y-4">
            {/* Add Actor */}
            <div className="flex gap-2">
              <input
                type="text"
                value={actorInput}
                onChange={(e) => setActorInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddActor(e)}
                className="input flex-1"
                placeholder="Nome attore/attrice"
              />
              <button
                type="button"
                onClick={handleAddActor}
                className="btn btn-primary flex items-center gap-2 whitespace-nowrap"
              >
                <FiPlus size={20} />
                Aggiungi
              </button>
            </div>

            {errors.actors && <p className="text-red-500 text-sm">{errors.actors}</p>}

            {/* Actors List */}
            {formData.actors.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-gray-600 font-medium">
                  {formData.actors.length} {formData.actors.length === 1 ? 'attore' : 'attori'} aggiunti
                </p>
                <div className="flex flex-wrap gap-2">
                  {formData.actors. map((actor, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-700 rounded-full border border-primary-200 group hover:bg-primary-100 transition-colors"
                    >
                      <span className="font-medium">{actor}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveActor(index)}
                        className="p-1 text-primary-600 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                        title="Rimuovi"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 sticky bottom-4 bg-white p-4 rounded-xl shadow-lg border border-gray-200">
          <button
            type="button"
            onClick={() => navigate('/contents')}
            className="btn btn-secondary flex items-center justify-center gap-2 flex-1 sm:flex-initial"
            disabled={submitting}
          >
            <FiX size={20} />
            Annulla
          </button>
          <button
            type="submit"
            className="btn btn-primary flex items-center justify-center gap-2 flex-1"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Salvataggio...
              </>
            ) : (
              <>
                <FiSave size={20} />
                {isEdit ? 'Aggiorna Contenuto' : 'Crea Contenuto'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContentForm;