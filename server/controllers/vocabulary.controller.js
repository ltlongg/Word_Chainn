const Vocabulary = require('../models/Vocabulary.model');

// @desc    Get all vocabulary words
// @route   GET /api/vocabulary
// @access  Private
exports.getAllWords = async (req, res) => {
    try {
        const { search, filter, sort = '-lastUsedAt', limit = 100, skip = 0 } = req.query;

        let query = { userId: req.user.id };

        // Apply filters
        if (filter === 'favorites') {
            query.isFavorite = true;
        } else if (filter === 'difficult') {
            query.isDifficult = true;
        } else if (filter === 'mastered') {
            query.masteryLevel = 5;
        } else if (filter === 'learning') {
            query.masteryLevel = { $gte: 1, $lt: 5 };
        }

        // Apply search
        if (search) {
            query.word = { $regex: search, $options: 'i' };
        }

        const words = await Vocabulary.find(query)
            .sort(sort)
            .limit(parseInt(limit))
            .skip(parseInt(skip));

        const total = await Vocabulary.countDocuments(query);

        const stats = await Vocabulary.getStatistics(req.user.id);

        res.json({
            success: true,
            data: {
                words,
                total,
                stats
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching vocabulary',
            error: error.message
        });
    }
};

// @desc    Get single word
// @route   GET /api/vocabulary/:word
// @access  Private
exports.getWord = async (req, res) => {
    try {
        const word = await Vocabulary.findOne({
            userId: req.user.id,
            word: req.params.word.toLowerCase()
        });

        if (!word) {
            return res.status(404).json({
                success: false,
                message: 'Word not found in your vocabulary'
            });
        }

        res.json({
            success: true,
            data: word
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching word',
            error: error.message
        });
    }
};

// @desc    Add or update word
// @route   POST /api/vocabulary
// @access  Private
exports.addWord = async (req, res) => {
    try {
        const { word, translation, definition, phonetic, partOfSpeech, examples, synonyms, antonyms } = req.body;

        let vocab = await Vocabulary.findOne({
            userId: req.user.id,
            word: word.toLowerCase()
        });

        if (vocab) {
            // Update existing
            if (translation) vocab.translation = translation;
            if (definition) vocab.definition = definition;
            if (phonetic) vocab.phonetic = phonetic;
            if (partOfSpeech) vocab.partOfSpeech = partOfSpeech;
            if (examples) vocab.examples = examples;
            if (synonyms) vocab.synonyms = synonyms;
            if (antonyms) vocab.antonyms = antonyms;

            vocab.recordUsage();
            await vocab.save();

            res.json({
                success: true,
                message: 'Word updated successfully',
                data: vocab
            });
        } else {
            // Create new
            vocab = await Vocabulary.create({
                userId: req.user.id,
                word: word.toLowerCase(),
                translation,
                definition,
                phonetic,
                partOfSpeech,
                examples,
                synonyms,
                antonyms
            });

            res.status(201).json({
                success: true,
                message: 'Word added to vocabulary',
                data: vocab
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error adding word',
            error: error.message
        });
    }
};

// @desc    Toggle favorite
// @route   PUT /api/vocabulary/:word/favorite
// @access  Private
exports.toggleFavorite = async (req, res) => {
    try {
        const word = await Vocabulary.findOne({
            userId: req.user.id,
            word: req.params.word.toLowerCase()
        });

        if (!word) {
            return res.status(404).json({
                success: false,
                message: 'Word not found'
            });
        }

        word.isFavorite = !word.isFavorite;
        await word.save();

        res.json({
            success: true,
            message: word.isFavorite ? 'Added to favorites' : 'Removed from favorites',
            data: word
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating favorite',
            error: error.message
        });
    }
};

// @desc    Toggle difficult
// @route   PUT /api/vocabulary/:word/difficult
// @access  Private
exports.toggleDifficult = async (req, res) => {
    try {
        const word = await Vocabulary.findOne({
            userId: req.user.id,
            word: req.params.word.toLowerCase()
        });

        if (!word) {
            return res.status(404).json({
                success: false,
                message: 'Word not found'
            });
        }

        word.isDifficult = !word.isDifficult;
        await word.save();

        res.json({
            success: true,
            message: word.isDifficult ? 'Marked as difficult' : 'Removed from difficult',
            data: word
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating difficult status',
            error: error.message
        });
    }
};

// @desc    Get words due for review (SRS)
// @route   GET /api/vocabulary/review/due
// @access  Private
exports.getDueWords = async (req, res) => {
    try {
        const { limit = 20 } = req.query;

        const words = await Vocabulary.getDueWords(req.user.id, parseInt(limit));

        res.json({
            success: true,
            data: words
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching due words',
            error: error.message
        });
    }
};

// @desc    Update SRS review
// @route   POST /api/vocabulary/:word/review
// @access  Private
exports.reviewWord = async (req, res) => {
    try {
        const { quality, responseTime } = req.body; // quality: 0-5

        const word = await Vocabulary.findOne({
            userId: req.user.id,
            word: req.params.word.toLowerCase()
        });

        if (!word) {
            return res.status(404).json({
                success: false,
                message: 'Word not found'
            });
        }

        word.updateSRS(quality);

        if (responseTime) {
            const totalReviews = word.studyStats.totalReviews;
            word.studyStats.averageResponseTime =
                ((word.studyStats.averageResponseTime * (totalReviews - 1)) + responseTime) / totalReviews;
        }

        await word.save();

        res.json({
            success: true,
            message: 'Review recorded',
            data: {
                nextReviewDate: word.srs.nextReviewDate,
                interval: word.srs.interval
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error recording review',
            error: error.message
        });
    }
};

// @desc    Delete word
// @route   DELETE /api/vocabulary/:word
// @access  Private
exports.deleteWord = async (req, res) => {
    try {
        const word = await Vocabulary.findOneAndDelete({
            userId: req.user.id,
            word: req.params.word.toLowerCase()
        });

        if (!word) {
            return res.status(404).json({
                success: false,
                message: 'Word not found'
            });
        }

        res.json({
            success: true,
            message: 'Word deleted from vocabulary'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting word',
            error: error.message
        });
    }
};
