import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios. create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor per errori
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 429) {
      console.warn('Rate limit exceeded, retrying...');
    }
    return Promise.reject(error);
  }
);

// CONTENT API
export const contentAPI = {
  getAll: (params) => api.get('/contents', { params }),
  getById: (id) => api.get(`/contents/${id}`),
  create: (data) => api.post('/contents', data),
  update: (id, data) => api.put(`/contents/${id}`, data),
  delete: (id) => api.delete(`/contents/${id}`),
  getByGenre: (genre, params) => api.get(`/contents/genre/${genre}`, { params }),
  getByActor: (actor, params) => api.get(`/contents/actor/${actor}`, { params }),
  getTopQuality: (params) => api.get('/contents/top-quality', { params }),
  search: (query, params) => api.get('/contents/search', { params: { q: query, ...params } }),
  getStats: () => api.get('/contents/stats')
};

// RATING API
export const ratingAPI = {
  getAll: (params) => api.get('/ratings', { params }),
  getById: (id) => api.get(`/ratings/${id}`),
  create: (data) => api.post('/ratings', data),
  update: (id, data) => api.put(`/ratings/${id}`, data),
  delete: (id) => api.delete(`/ratings/${id}`),
  getByContent: (contentId, params) => api.get(`/ratings/content/${contentId}`, { params }),
  getByUser: (userId, params) => api.get(`/ratings/user/${userId}`, { params }),
  update: (id, data) => api.put(`/ratings/${id}`, data)
};

// ANALYTICS API
export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getGenreStats: (params) => api.get('/analytics/genre-stats', { params }),
  getExcellencePipeline: (params) => api.get('/analytics/excellence-pipeline', { params }),
  getTrends: (params) => api.get('/analytics/trends', { params }),
  getMostPopular: (params) => api.get('/analytics/popular', { params }),
  getTopActors: (params) => api.get('/analytics/top-actors', { params })
};

export default api;