const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

router.get('/dashboard', analyticsController.getDashboard);
router.get('/genre-stats', analyticsController. getGenreStats);
router.get('/excellence-pipeline', analyticsController.getExcellencePipeline);
router.get('/trends', analyticsController.getTrends);
router.get('/popular', analyticsController.getMostPopular);
router.get('/top-actors', analyticsController.getTopActors);

module.exports = router;