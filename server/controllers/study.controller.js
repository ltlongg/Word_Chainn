const Vocabulary = require('../models/Vocabulary.model');
const Statistics = require('../models/Statistics.model');

// @desc    Generate quiz
// @route   POST /api/study/quiz/generate
// @access  Private
exports.generateQuiz = async (req, res) => {
    try {
        const { count = 10, type = 'definition', difficulty } = req.body;

        let query = { userId: req.user.id };

        // Filter by difficulty/mastery level
        if (difficulty === 'easy') {
            query.masteryLevel = { $gte: 3 };
        } else if (difficulty === 'medium') {
            query.masteryLevel = { $gte: 1, $lt: 3 };
        } else if (difficulty === 'hard') {
            query.masteryLevel = { $lt: 1 };
        }

        const words = await Vocabulary.find(query).limit(parseInt(count) * 4);

        if (words.length < parseInt(count)) {
            return res.status(400).json({
                success: false,
                message: 'Not enough words in vocabulary for quiz'
            });
        }

        // Shuffle and select words
        const shuffled = words.sort(() => 0.5 - Math.random());
        const selectedWords = shuffled.slice(0, parseInt(count));

        const questions = selectedWords.map((word, index) => {
            // Get wrong options from other words
            const wrongOptions = shuffled
                .filter(w => w.word !== word.word)
                .slice(0, 3)
                .map(w => type === 'definition' ? w.definition : w.word);

            const correctAnswer = type === 'definition' ? word.definition : word.word;

            const options = [correctAnswer, ...wrongOptions].sort(() => 0.5 - Math.random());

            return {
                questionNumber: index + 1,
                word: type === 'definition' ? word.word : word.definition,
                options,
                correctAnswer,
                type
            };
        });

        res.json({
            success: true,
            data: {
                questions,
                totalQuestions: questions.length
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error generating quiz',
            error: error.message
        });
    }
};

// @desc    Submit quiz results
// @route   POST /api/study/quiz/submit
// @access  Private
exports.submitQuiz = async (req, res) => {
    try {
        const { answers, timeSpent } = req.body;

        let correct = 0;
        const results = [];

        for (const answer of answers) {
            const isCorrect = answer.userAnswer === answer.correctAnswer;

            if (isCorrect) {
                correct += 1;
            }

            results.push({
                word: answer.word,
                correct: isCorrect,
                userAnswer: answer.userAnswer,
                correctAnswer: answer.correctAnswer
            });

            // Update vocabulary SRS based on result
            const vocab = await Vocabulary.findOne({
                userId: req.user.id,
                $or: [
                    { word: answer.word },
                    { definition: answer.word }
                ]
            });

            if (vocab) {
                const quality = isCorrect ? 5 : 2;
                vocab.updateSRS(quality);
                await vocab.save();
            }
        }

        const score = Math.round((correct / answers.length) * 100);

        // Update statistics
        const stats = await Statistics.findOne({ userId: req.user.id });

        if (stats) {
            stats.studyStats.quizzesTaken += 1;
            stats.studyStats.totalReviews += answers.length;
            stats.studyStats.correctReviews += correct;
            stats.studyStats.reviewAccuracy = (stats.studyStats.correctReviews / stats.studyStats.totalReviews) * 100;
            stats.studyStats.averageQuizScore =
                ((stats.studyStats.averageQuizScore * (stats.studyStats.quizzesTaken - 1)) + score) /
                stats.studyStats.quizzesTaken;

            await stats.save();
        }

        res.json({
            success: true,
            data: {
                score,
                correct,
                total: answers.length,
                results,
                timeSpent
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error submitting quiz',
            error: error.message
        });
    }
};

// @desc    Get flashcards
// @route   GET /api/study/flashcards
// @access  Private
exports.getFlashcards = async (req, res) => {
    try {
        const { filter, limit = 20 } = req.query;

        let query = { userId: req.user.id };

        if (filter === 'due') {
            query['srs.nextReviewDate'] = { $lte: new Date() };
        } else if (filter === 'favorites') {
            query.isFavorite = true;
        } else if (filter === 'difficult') {
            query.isDifficult = true;
        }

        const words = await Vocabulary.find(query)
            .sort({ 'srs.nextReviewDate': 1 })
            .limit(parseInt(limit));

        const flashcards = words.map(word => ({
            id: word._id,
            word: word.word,
            translation: word.translation,
            definition: word.definition,
            phonetic: word.phonetic,
            examples: word.examples,
            synonyms: word.synonyms,
            antonyms: word.antonyms,
            masteryLevel: word.masteryLevel
        }));

        res.json({
            success: true,
            data: flashcards
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching flashcards',
            error: error.message
        });
    }
};

// @desc    Generate spelling test
// @route   POST /api/study/spelling/generate
// @access  Private
exports.generateSpellingTest = async (req, res) => {
    try {
        const { count = 10 } = req.body;

        const words = await Vocabulary.find({ userId: req.user.id })
            .limit(parseInt(count) * 2);

        if (words.length < parseInt(count)) {
            return res.status(400).json({
                success: false,
                message: 'Not enough words for spelling test'
            });
        }

        const shuffled = words.sort(() => 0.5 - Math.random()).slice(0, parseInt(count));

        const questions = shuffled.map((word, index) => ({
            questionNumber: index + 1,
            wordId: word._id,
            definition: word.definition,
            phonetic: word.phonetic,
            correctSpelling: word.word
        }));

        res.json({
            success: true,
            data: {
                questions,
                totalQuestions: questions.length
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error generating spelling test',
            error: error.message
        });
    }
};

// @desc    Submit spelling test
// @route   POST /api/study/spelling/submit
// @access  Private
exports.submitSpellingTest = async (req, res) => {
    try {
        const { answers } = req.body;

        const results = [];
        let correct = 0;

        for (const answer of answers) {
            const isCorrect = answer.userAnswer.toLowerCase().trim() === answer.correctSpelling.toLowerCase();

            if (isCorrect) {
                correct += 1;
            }

            results.push({
                ...answer,
                correct: isCorrect
            });

            // Update SRS
            const vocab = await Vocabulary.findById(answer.wordId);
            if (vocab) {
                vocab.updateSRS(isCorrect ? 5 : 1);
                await vocab.save();
            }
        }

        const score = Math.round((correct / answers.length) * 100);

        res.json({
            success: true,
            data: {
                score,
                correct,
                total: answers.length,
                results
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error submitting spelling test',
            error: error.message
        });
    }
};

// @desc    Generate synonym/antonym quiz
// @route   POST /api/study/synonym-antonym/generate
// @access  Private
exports.generateSynonymAntonymQuiz = async (req, res) => {
    try {
        const { count = 10 } = req.body;

        // Get words that have synonyms or antonyms
        const words = await Vocabulary.find({
            userId: req.user.id,
            $or: [
                { synonyms: { $exists: true, $ne: [] } },
                { antonyms: { $exists: true, $ne: [] } }
            ]
        }).limit(parseInt(count) * 2);

        if (words.length < parseInt(count)) {
            return res.status(400).json({
                success: false,
                message: 'Not enough words with synonyms/antonyms'
            });
        }

        const shuffled = words.sort(() => 0.5 - Math.random()).slice(0, parseInt(count));

        const questions = shuffled.map((word, index) => {
            const hasSynonyms = word.synonyms && word.synonyms.length > 0;
            const hasAntonyms = word.antonyms && word.antonyms.length > 0;

            let type, correctAnswer, options;

            if (hasSynonyms && hasAntonyms) {
                type = Math.random() > 0.5 ? 'synonym' : 'antonym';
            } else if (hasSynonyms) {
                type = 'synonym';
            } else {
                type = 'antonym';
            }

            const correctList = type === 'synonym' ? word.synonyms : word.antonyms;
            correctAnswer = correctList[0];

            // Generate wrong options from other words
            const wrongOptions = shuffled
                .filter(w => w.word !== word.word)
                .flatMap(w => [...(w.synonyms || []), ...(w.antonyms || [])])
                .filter(w => w !== correctAnswer)
                .slice(0, 3);

            options = [correctAnswer, ...wrongOptions].sort(() => 0.5 - Math.random());

            return {
                questionNumber: index + 1,
                word: word.word,
                type,
                options,
                correctAnswer
            };
        });

        res.json({
            success: true,
            data: {
                questions,
                totalQuestions: questions.length
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error generating quiz',
            error: error.message
        });
    }
};

// @desc    Get study plan
// @route   GET /api/study/plan
// @access  Private
exports.getStudyPlan = async (req, res) => {
    try {
        const vocabStats = await Vocabulary.getStatistics(req.user.id);
        const dueWords = await Vocabulary.getDueWords(req.user.id, 20);

        const plan = {
            today: {
                review: {
                    count: dueWords.length,
                    words: dueWords.map(w => w.word)
                },
                learn: {
                    target: 5,
                    recommended: vocabStats.new >= 5 ? 5 : vocabStats.new
                },
                practice: {
                    quiz: vocabStats.totalWords >= 10,
                    flashcards: vocabStats.totalWords >= 5
                }
            },
            week: {
                totalWords: vocabStats.totalWords,
                mastered: vocabStats.mastered,
                learning: vocabStats.learning,
                target: {
                    newWords: 35,
                    reviews: 50,
                    masteredWords: Math.ceil(vocabStats.totalWords * 0.1)
                }
            },
            recommendations: []
        };

        // Generate recommendations
        if (dueWords.length > 0) {
            plan.recommendations.push({
                type: 'review',
                priority: 'high',
                message: `You have ${dueWords.length} words due for review`
            });
        }

        if (vocabStats.difficult > 10) {
            plan.recommendations.push({
                type: 'practice',
                priority: 'medium',
                message: 'Practice your difficult words with flashcards'
            });
        }

        if (vocabStats.totalWords >= 20) {
            plan.recommendations.push({
                type: 'quiz',
                priority: 'medium',
                message: 'Test your knowledge with a quiz'
            });
        }

        res.json({
            success: true,
            data: plan
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching study plan',
            error: error.message
        });
    }
};
