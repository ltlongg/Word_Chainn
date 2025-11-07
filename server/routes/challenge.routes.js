const express = require('express');
const router = express.Router();
const challengeController = require('../controllers/challenge.controller');
const { protect } = require('../middleware/auth.middleware');

// All routes are protected
router.use(protect);

router.get('/', challengeController.getActiveChallenges);
router.post('/', challengeController.createChallenge);
router.get('/completed', challengeController.getCompletedChallenges);
router.get('/word-of-day', challengeController.getWordOfDay);
router.post('/daily', challengeController.createDailyChallenge);
router.post('/weekly', challengeController.createWeeklyChallenge);
router.get('/:id', challengeController.getChallenge);
router.put('/:id/progress', challengeController.updateProgress);

module.exports = router;
