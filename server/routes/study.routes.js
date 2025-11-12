const express = require('express');
const router = express.Router();
const studyController = require('../controllers/study.controller');
const { protect } = require('../middleware/auth.middleware');

// All routes are protected
router.use(protect);

// Quiz
router.post('/quiz/generate', studyController.generateQuiz);
router.post('/quiz/submit', studyController.submitQuiz);

// Flashcards
router.get('/flashcards', studyController.getFlashcards);

// Spelling test
router.post('/spelling/generate', studyController.generateSpellingTest);
router.post('/spelling/submit', studyController.submitSpellingTest);

// Synonym/Antonym quiz
router.post('/synonym-antonym/generate', studyController.generateSynonymAntonymQuiz);

// Study plan
router.get('/plan', studyController.getStudyPlan);

module.exports = router;
