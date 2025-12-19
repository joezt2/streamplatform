const contentRepository = require('../repositories/ContentRepository');
const ratingRepository = require('../repositories/RatingRepository');
const logger = require('../utils/logger');

class ContentService {
  async getAllContents(page, limit, sortBy = 'createdAt', sortOrder = 'desc') {
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
    return await contentRepository.findAll(page, limit, sort);
  }

  async getContentById(id) {
    const content = await contentRepository.findById(id);
    if (!content) throw new Error('Contenuto non trovato');
    const { ratings } = await ratingRepository.findByContent(id, 1, 5);
    return { ... content, recentReviews: ratings };
  }

  async createContent(data) {
    if (data.year > new Date().getFullYear() + 2) {
      throw new Error('Anno troppo nel futuro');
    }
    const content = await contentRepository.create(data);
    logger.info(`Contenuto creato: ${content.title} (${content._id})`);
    return content;
  }

  async updateContent(id, data) {
    const content = await contentRepository. update(id, data);
    if (!content) throw new Error('Contenuto non trovato');
    logger.info(`Contenuto aggiornato: ${content.title}`);
    return content;
  }

  async deleteContent(id) {
    const content = await contentRepository.delete(id);
    if (!content) throw new Error('Contenuto non trovato');
    logger. info(`Contenuto eliminato: ${content.title}`);
    return content;
  }

  async getContentsByGenre(genre, page, limit) {
    return await contentRepository.findByGenre(genre, page, limit);
  }

  async getContentsByActor(actor, page, limit) {
    return await contentRepository.findByActor(actor, page, limit);
  }

  async getTopQualityContents(minRating, minReviews, page, limit) {
    return await contentRepository.findTopQuality(minRating, minReviews, page, limit);
  }

  async searchContents(searchTerm, page, limit) {
    return await contentRepository.search(searchTerm, page, limit);
  }

  async getStatistics() {
    return await contentRepository.getStats();
  }

  async updateContentRatingStats(contentId) {
    const Content = require('../models/Content');
    const content = await Content.findById(contentId);
    if (!content) throw new Error('Contenuto non trovato');
    await content.updateRatingStats();
    logger.info(`Stats aggiornate: ${content.title}`);
  }
}

module.exports = new ContentService();