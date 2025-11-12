const express = require('express');
const router = express.Router();
const statisticsController = require('../controllers/statistics.controller');
const { protect } = require('../middleware/auth.middleware');

// All routes are protected
router.use(protect);

router.get('/', statisticsController.getStatistics);
router.get('/dashboard', statisticsController.getDashboard);
router.get('/performance', statisticsController.getPerformanceHistory);
router.get('/letter-frequency', statisticsController.getLetterFrequency);
router.get('/win-rate', statisticsController.getWinRateByDifficulty);
router.get('/sessions', statisticsController.getSessionHistory);
router.get('/calendar', statisticsController.getProgressCalendar);

module.exports = router;
