const ratingRepository = require('../repositories/RatingRepository');
const contentService = require('./ContentService');
const logger = require('../utils/logger');

class RatingService {
  async getAllRatings(page, limit) {
    return await ratingRepository.findAll(page, limit);
  }

  async getRatingById(id) {
    const rating = await ratingRepository.findById(id);
    if (! rating) throw new Error('Valutazione non trovata');
    return rating;
  }

  async getRatingsByContent(contentId, page, limit) {
    return await ratingRepository.findByContent(contentId, page, limit);
  }

  async getRatingsByUser(userId, page, limit) {
    return await ratingRepository.findByUser(userId, page, limit);
  }

  async createRating(data) {
    const { userId, contentId, rating, comment } = data;
    const content = await contentService.getContentById(contentId);
    if (!content) throw new Error('Contenuto non trovato');
    
    const existing = await ratingRepository.findUserRatingForContent(userId, contentId);
    if (existing) throw new Error('Hai già valutato questo contenuto');
    
    const newRating = await ratingRepository.create({ userId, contentId, rating, comment });
    await contentService.updateContentRatingStats(contentId);
    logger.info(`Nuova valutazione: User ${userId} -> Content ${contentId} (${rating}/5)`);
    return newRating;
  }

  async updateRating(id, data) {
    const rating = await ratingRepository.update(id, data);
    if (!rating) throw new Error('Valutazione non trovata');
    await contentService.updateContentRatingStats(rating.contentId);
    logger. info(`Valutazione aggiornata: ${id}`);
    return rating;
  }

  async deleteRating(id) {
    const rating = await ratingRepository.delete(id);
    if (!rating) throw new Error('Valutazione non trovata');
    await contentService.updateContentRatingStats(rating.contentId);
    logger.info(`Valutazione eliminata: ${id}`);
    return rating;
  }

  async getRatingDistribution(contentId) {
    return await ratingRepository.getRatingDistribution(contentId);
  }

  async getUserStats(userId) {
    return await ratingRepository.getUserAverageRating(userId);
  }

  async getGlobalStats() {
    const allRatings = await ratingRepository.findAll(1, 100000); // Tutti
    
    const starCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let totalRating = 0;

    allRatings.ratings.forEach(rating => {
      starCounts[rating.rating]++;
      totalRating += rating.rating;
    });

    const average = allRatings.ratings.length > 0 
      ? (totalRating / allRatings.ratings.length). toFixed(1) 
      : 0;

    return {
      total: allRatings.pagination.total,
      stars: starCounts,
      average: parseFloat(average)
    };
  }
}

module. exports = new RatingService();