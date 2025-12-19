const express = require('express');
const router = express.Router();
const contentController = require('../controllers/contentController');

// Specifiche routes prima delle parametriche
router.get('/stats', contentController.getStats. bind(contentController));
router. get('/search', contentController.search.bind(contentController));
router.get('/top-quality', contentController.getTopQuality.bind(contentController));
router.get('/genre/:genre', contentController.getByGenre.bind(contentController));
router.get('/actor/:actor', contentController.getByActor.bind(contentController));

// CRUD
router.get('/', contentController.getAll.bind(contentController));
router.get('/:id', contentController.getById.bind(contentController));
router.post('/', contentController. create.bind(contentController));
router.put('/:id', contentController.update.bind(contentController));
router.delete('/:id', contentController.delete.bind(contentController));

module.exports = router;