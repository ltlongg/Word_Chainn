const Challenge = require('../models/Challenge.model');

// @desc    Get active challenges
// @route   GET /api/challenges
// @access  Private
exports.getActiveChallenges = async (req, res) => {
    try {
        const challenges = await Challenge.getActiveChallenges(req.user.id);

        // Check and update expired challenges
        for (const challenge of challenges) {
            challenge.checkExpiration();
            await challenge.save();
        }

        res.json({
            success: true,
            data: challenges
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching challenges',
            error: error.message
        });
    }
};

// @desc    Get challenge by ID
// @route   GET /api/challenges/:id
// @access  Private
exports.getChallenge = async (req, res) => {
    try {
        const challenge = await Challenge.findById(req.params.id);

        if (!challenge) {
            return res.status(404).json({
                success: false,
                message: 'Challenge not found'
            });
        }

        if (challenge.userId.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        res.json({
            success: true,
            data: challenge
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching challenge',
            error: error.message
        });
    }
};

// @desc    Create daily challenge
// @route   POST /api/challenges/daily
// @access  Private
exports.createDailyChallenge = async (req, res) => {
    try {
        const challenge = await Challenge.createDailyChallenge(req.user.id);

        res.json({
            success: true,
            message: challenge._id ? 'Daily challenge created' : 'Daily challenge already exists',
            data: challenge
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating daily challenge',
            error: error.message
        });
    }
};

// @desc    Create weekly challenge
// @route   POST /api/challenges/weekly
// @access  Private
exports.createWeeklyChallenge = async (req, res) => {
    try {
        const challenge = await Challenge.createWeeklyChallenge(req.user.id);

        res.json({
            success: true,
            message: challenge._id ? 'Weekly challenge created' : 'Weekly challenge already exists',
            data: challenge
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating weekly challenge',
            error: error.message
        });
    }
};

// @desc    Create custom challenge
// @route   POST /api/challenges
// @access  Private
exports.createChallenge = async (req, res) => {
    try {
        const { type, title, description, target, challengeData, rewards, endDate } = req.body;

        const challenge = await Challenge.create({
            userId: req.user.id,
            type,
            title,
            description,
            target,
            challengeData,
            rewards,
            startDate: new Date(),
            endDate: new Date(endDate)
        });

        res.status(201).json({
            success: true,
            message: 'Challenge created successfully',
            data: challenge
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating challenge',
            error: error.message
        });
    }
};

// @desc    Update challenge progress
// @route   PUT /api/challenges/:id/progress
// @access  Private
exports.updateProgress = async (req, res) => {
    try {
        const { amount = 1 } = req.body;

        const challenge = await Challenge.findById(req.params.id);

        if (!challenge) {
            return res.status(404).json({
                success: false,
                message: 'Challenge not found'
            });
        }

        if (challenge.userId.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        const result = challenge.updateProgress(amount);
        await challenge.save();

        res.json({
            success: true,
            message: result.completed ? 'Challenge completed!' : 'Progress updated',
            data: {
                challenge,
                ...result
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating progress',
            error: error.message
        });
    }
};

// @desc    Get completed challenges
// @route   GET /api/challenges/completed
// @access  Private
exports.getCompletedChallenges = async (req, res) => {
    try {
        const { limit = 50 } = req.query;

        const challenges = await Challenge.find({
            userId: req.user.id,
            status: 'completed'
        })
        .sort({ completedAt: -1 })
        .limit(parseInt(limit));

        res.json({
            success: true,
            data: challenges
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching completed challenges',
            error: error.message
        });
    }
};

// @desc    Get word of the day
// @route   GET /api/challenges/word-of-day
// @access  Private
exports.getWordOfDay = async (req, res) => {
    try {
        // Check if already exists for today
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        let challenge = await Challenge.findOne({
            userId: req.user.id,
            type: 'word-of-day',
            startDate: { $gte: today, $lt: tomorrow }
        });

        if (!challenge) {
            // Generate a random difficult word
            const difficultWords = [
                { word: 'ephemeral', definition: 'Lasting for a very short time' },
                { word: 'ubiquitous', definition: 'Present, appearing, or found everywhere' },
                { word: 'serendipity', definition: 'The occurrence of events by chance in a happy way' },
                { word: 'eloquent', definition: 'Fluent or persuasive in speaking or writing' },
                { word: 'pragmatic', definition: 'Dealing with things sensibly and realistically' }
            ];

            const randomWord = difficultWords[Math.floor(Math.random() * difficultWords.length)];

            challenge = await Challenge.createWordOfDayChallenge(req.user.id, randomWord);
        }

        res.json({
            success: true,
            data: challenge
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching word of the day',
            error: error.message
        });
    }
};
