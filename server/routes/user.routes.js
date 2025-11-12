const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { protect, optionalAuth } = require('../middleware/auth.middleware');

// Protected routes
router.get('/profile', protect, userController.getProfile);
router.get('/achievements', protect, userController.getAchievements);
router.post('/achievements/:achievementId', protect, userController.unlockAchievement);

// Public routes (optional auth for personalization)
router.get('/leaderboard', optionalAuth, userController.getLeaderboard);

module.exports = router;
