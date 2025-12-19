const ratingService = require('../services/RatingService');
const { validateRating, validateId } = require('../validators/ratingValidator');

class RatingController {
  async getAll(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query. limit) || 20;
      const result = await ratingService.getAllRatings(page, limit);
      res.json({ success: true, data: result.ratings, pagination: result.pagination });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const { error } = validateId(req. params.id);
      if (error) return res.status(400).json({ success: false, error: error.details[0].message });
      const rating = await ratingService.getRatingById(req.params.id);
      res.json({ success: true, data: rating });
    } catch (error) {
      if (error.message === 'Valutazione non trovata') {
        return res.status(404). json({ success: false, error: error.message });
      }
      next(error);
    }
  }

  async getByContent(req, res, next) {
    try {
      const { contentId } = req.params;
      const page = parseInt(req. query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const result = await ratingService.getRatingsByContent(contentId, page, limit);
      res.json({ success: true, data: result.ratings, pagination: result.pagination });
    } catch (error) {
      next(error);
    }
  }

  async getByUser(req, res, next) {
    try {
      const { userId } = req.params;
      const page = parseInt(req. query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const result = await ratingService.getRatingsByUser(userId, page, limit);
      res.json({ success: true, data: result.ratings, pagination: result.pagination });
    } catch (error) {
      next(error);
    }
  }

  async getWithStats(req, res, next) {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const result = await ratingService.getAll(page, limit);
    
    const stats = await ratingService.getGlobalStats();
    
    res.json({
      success: true,
      data: result.ratings,
      pagination: result.pagination,
      stats: stats
    });
  } catch (error) {
    next(error);
  }
}

  async create(req, res, next) {
    try {
      const { error, value } = validateRating(req.body);
      if (error) return res.status(400).json({ success: false, error: error.details[0]. message });
      const rating = await ratingService.createRating(value);
      res.status(201).json({ success: true, data: rating, message: 'Valutazione creata.  Statistiche aggiornate.' });
    } catch (error) {
      if (error.message. includes('già valutato')) {
        return res.status(409).json({ success: false, error: error.message });
      }
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { error: idError } = validateId(req.params.id);
      if (idError) return res.status(400).json({ success: false, error: idError.details[0].message });
      const { error, value } = validateRating(req.body, true);
      if (error) return res.status(400).json({ success: false, error: error. details[0].message });
      const rating = await ratingService. updateRating(req.params. id, value);
      res. json({ success: true, data: rating, message: 'Valutazione aggiornata' });
    } catch (error) {
      if (error.message === 'Valutazione non trovata') {
        return res. status(404).json({ success: false, error: error.message });
      }
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { error } = validateId(req.params.id);
      if (error) return res. status(400).json({ success: false, error: error.details[0].message });
      await ratingService.deleteRating(req.params.id);
      res.json({ success: true, message: 'Valutazione eliminata' });
    } catch (error) {
      if (error.message === 'Valutazione non trovata') {
        return res.status(404).json({ success: false, error: error.message });
      }
      next(error);
    }
  }

  async getDistribution(req, res, next) {
    try {
      const { contentId } = req.params;
      const distribution = await ratingService.getRatingDistribution(contentId);
      res.json({ success: true, data: distribution });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new RatingController();