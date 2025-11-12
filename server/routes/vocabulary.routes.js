const express = require('express');
const router = express.Router();
const vocabularyController = require('../controllers/vocabulary.controller');
const { protect } = require('../middleware/auth.middleware');

// All routes are protected
router.use(protect);

router.get('/', vocabularyController.getAllWords);
router.post('/', vocabularyController.addWord);
router.get('/review/due', vocabularyController.getDueWords);
router.get('/:word', vocabularyController.getWord);
router.put('/:word/favorite', vocabularyController.toggleFavorite);
router.put('/:word/difficult', vocabularyController.toggleDifficult);
router.post('/:word/review', vocabularyController.reviewWord);
router.delete('/:word', vocabularyController.deleteWord);

module.exports = router;
