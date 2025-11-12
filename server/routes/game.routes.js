const express = require('express');
const router = express.Router();
const gameController = require('../controllers/game.controller');
const { protect } = require('../middleware/auth.middleware');

// All routes are protected (require authentication)
router.use(protect);

router.post('/', gameController.createGame);
router.get('/', gameController.getGameHistory);
router.get('/:id', gameController.getGame);
router.post('/:id/word', gameController.addWord);
router.put('/:id/end', gameController.endGame);
router.delete('/:id', gameController.deleteGame);

module.exports = router;
