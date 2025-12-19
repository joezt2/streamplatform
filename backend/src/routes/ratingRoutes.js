const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');

router.get('/content/:contentId', ratingController. getByContent.bind(ratingController));
router.get('/user/:userId', ratingController.getByUser.bind(ratingController));
router.get('/distribution/:contentId', ratingController.getDistribution.bind(ratingController));
router.get('/with-stats', ratingController.getWithStats);

router.get('/', ratingController.getAll.bind(ratingController));
router.get('/:id', ratingController. getById.bind(ratingController));
router.post('/', ratingController.create.bind(ratingController));
router.put('/:id', ratingController.update.bind(ratingController));
router.delete('/:id', ratingController.delete.bind(ratingController));

module.exports = router;