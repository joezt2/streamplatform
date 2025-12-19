const analyticsService = require('../services/AnalyticsService');

class AnalyticsController {
  async getDashboard(req, res, next) {
    try {
      const data = await analyticsService.getDashboard();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getGenreStats(req, res, next) {
    try {
      const { minRating, minReviews } = req.query;
      const rating = minRating ?  parseFloat(minRating) : 4.5;
      const reviews = minReviews ? parseInt(minReviews) : 100;
      
      const data = await analyticsService.getGenreStats(rating, reviews);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getExcellencePipeline(req, res, next) {
    try {
      const { minRating, minReviews } = req.query;
      const rating = minRating ? parseFloat(minRating) : 4.5;
      const reviews = minReviews ? parseInt(minReviews) : 100;
      
      const data = await analyticsService.getExcellencePipeline(rating, reviews);
      res.json({ 
        success: true, 
        data,
        criteria: { minRating: rating, minReviews: reviews }
      });
    } catch (error) {
      next(error);
    }
  }

  async getTrends(req, res, next) {
    try {
      const { days } = req.query;
      const daysCount = days ? parseInt(days) : 30;
      
      const data = await analyticsService.getTrends(daysCount);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getMostPopular(req, res, next) {
    try {
      const { limit } = req.query;
      const limitCount = limit ? parseInt(limit) : 20;
      
      const data = await analyticsService.getMostPopular(limitCount);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getTopActors(req, res, next) {
    try {
      const { minRating, minReviews, limit } = req.query;
      const rating = minRating ?  parseFloat(minRating) : 4.5;
      const reviews = minReviews ? parseInt(minReviews) : 100;
      const limitCount = limit ? parseInt(limit) : 20;
      
      const data = await analyticsService. getTopActors(rating, reviews, limitCount);
      res. json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AnalyticsController();