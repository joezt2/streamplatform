const contentService = require('../services/ContentService');
const { validateContent, validateId } = require('../validators/contentValidator');

class ContentController {
  async getAll(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query. limit) || 20;
      const sortBy = req.query.sortBy || 'createdAt';
      const sortOrder = req.query.sortOrder || 'desc';
      const result = await contentService.getAllContents(page, limit, sortBy, sortOrder);
      res. json({ success: true, data: result. contents, pagination: result.pagination });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const { error } = validateId(req.params.id);
      if (error) return res.status(400). json({ success: false, error: error.details[0]. message });
      const content = await contentService.getContentById(req.params.id);
      res.json({ success: true, data: content });
    } catch (error) {
      if (error.message === 'Contenuto non trovato') {
        return res.status(404).json({ success: false, error: error.message });
      }
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const { error, value } = validateContent(req.body);
      if (error) return res.status(400).json({ success: false, error: error. details[0].message });
      const content = await contentService.createContent(value);
      res. status(201).json({ success: true, data: content });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { error: idError } = validateId(req.params. id);
      if (idError) return res.status(400). json({ success: false, error: idError.details[0].message });
      const { error, value } = validateContent(req.body);
      if (error) return res.status(400).json({ success: false, error: error.details[0]. message });
      const content = await contentService.updateContent(req. params.id, value);
      res.json({ success: true, data: content });
    } catch (error) {
      if (error.message === 'Contenuto non trovato') {
        return res.status(404). json({ success: false, error: error.message });
      }
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { error } = validateId(req.params.id);
      if (error) return res.status(400). json({ success: false, error: error.details[0].message });
      await contentService.deleteContent(req.params.id);
      res.json({ success: true, message: 'Contenuto eliminato' });
    } catch (error) {
      if (error.message === 'Contenuto non trovato') {
        return res. status(404).json({ success: false, error: error.message });
      }
      next(error);
    }
  }

  async getByGenre(req, res, next) {
    try {
      const { genre } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const result = await contentService.getContentsByGenre(genre, page, limit);
      res.json({ success: true, data: result.contents, pagination: result.pagination });
    } catch (error) {
      next(error);
    }
  }

  async getByActor(req, res, next) {
    try {
      const { actor } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const result = await contentService.getContentsByActor(actor, page, limit);
      res.json({ success: true, data: result.contents, pagination: result.pagination });
    } catch (error) {
      next(error);
    }
  }

  async getTopQuality(req, res, next) {
    try {
      const minRating = parseFloat(req. query.minRating) || 4.5;
      const minReviews = parseInt(req.query.minReviews) || 100;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query. limit) || 20;
      const result = await contentService.getTopQualityContents(minRating, minReviews, page, limit);
      res.json({ success: true, data: result.contents, pagination: result.pagination });
    } catch (error) {
      next(error);
    }
  }

  async search(req, res, next) {
    try {
      const { q } = req.query;
      if (! q) return res.status(400).json({ success: false, error: 'Parametro "q" obbligatorio' });
      const page = parseInt(req.query. page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const result = await contentService. searchContents(q, page, limit);
      res.json({ success: true, data: result. contents, pagination: result.pagination });
    } catch (error) {
      next(error);
    }
  }

  async getStats(req, res, next) {
    try {
      const stats = await contentService.getStatistics();
      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ContentController();