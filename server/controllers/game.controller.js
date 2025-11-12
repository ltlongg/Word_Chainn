const Game = require('../models/Game.model');
const User = require('../models/User.model');
const Statistics = require('../models/Statistics.model');
const Vocabulary = require('../models/Vocabulary.model');
const Challenge = require('../models/Challenge.model');

// @desc    Create new game
// @route   POST /api/games
// @access  Private
exports.createGame = async (req, res) => {
    try {
        const { mode, difficulty, theme } = req.body;

        const game = await Game.create({
            userId: req.user.id,
            mode: mode || 'vs-ai',
            difficulty: difficulty || req.user.settings.difficulty,
            theme: theme || 'general',
            startTime: new Date()
        });

        res.status(201).json({
            success: true,
            message: 'Game created successfully',
            data: game
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating game',
            error: error.message
        });
    }
};

// @desc    Add word to game
// @route   POST /api/games/:id/word
// @access  Private
exports.addWord = async (req, res) => {
    try {
        const { word, player, responseTime } = req.body;
        const game = await Game.findById(req.params.id);

        if (!game) {
            return res.status(404).json({
                success: false,
                message: 'Game not found'
            });
        }

        if (game.userId.toString() !== req.user.id && player !== 'ai' && player !== 'player2') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        if (game.status !== 'in-progress') {
            return res.status(400).json({
                success: false,
                message: 'Game is not in progress'
            });
        }

        // Add word to game
        game.addWord(word, player, responseTime);

        // Handle Chain Challenge mode
        if (game.mode === 'chain-challenge') {
            if (word.length >= game.chainProgress.currentRequiredLength) {
                game.chainProgress.currentRequiredLength += 1;
                game.chainProgress.maxLengthReached = Math.max(
                    game.chainProgress.maxLengthReached,
                    word.length
                );
            }
        }

        // Save or update vocabulary
        if (player === 'user' || player === 'player1' || player === 'player2') {
            try {
                let vocab = await Vocabulary.findOne({
                    userId: req.user.id,
                    word: word.toLowerCase()
                });

                if (vocab) {
                    vocab.recordUsage();
                    vocab.gamesUsedIn.push(game._id);
                    await vocab.save();
                } else {
                    // Create new vocabulary entry
                    vocab = await Vocabulary.create({
                        userId: req.user.id,
                        word: word.toLowerCase(),
                        gamesUsedIn: [game._id]
                    });
                }
            } catch (vocabError) {
                console.error('Vocabulary error:', vocabError);
                // Continue even if vocabulary save fails
            }
        }

        await game.save();

        res.json({
            success: true,
            message: 'Word added successfully',
            data: game
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error adding word',
            error: error.message
        });
    }
};

// @desc    End game
// @route   PUT /api/games/:id/end
// @access  Private
exports.endGame = async (req, res) => {
    try {
        const { status } = req.body; // won, lost, draw, abandoned

        const game = await Game.findById(req.params.id);

        if (!game) {
            return res.status(404).json({
                success: false,
                message: 'Game not found'
            });
        }

        if (game.userId.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        // End game
        game.endGame(status);

        // Calculate score
        const score = game.calculateScore();

        // Calculate XP
        let xpEarned = 0;

        if (status === 'won') {
            xpEarned = 50; // Base win XP
        }

        // Word bonuses
        game.wordsUsed.forEach(wordData => {
            if (wordData.player === 'user' || wordData.player === 'player1') {
                xpEarned += (wordData.wordLength - 3) * 5;
            }
        });

        game.xpEarned = xpEarned;

        await game.save();

        // Update user stats
        const user = await User.findById(req.user.id);

        user.totalGames += 1;
        user.totalWordsUsed += game.stats.totalWords;

        if (status === 'won') {
            user.totalWins += 1;
            user.currentStreak += 1;

            if (user.currentStreak > user.bestStreak) {
                user.bestStreak = user.currentStreak;
            }
        } else if (status === 'lost') {
            user.currentStreak = 0;
        }

        // Add XP and check level up
        const levelUpResult = user.addXP(xpEarned);

        await user.save();

        // Update statistics
        let stats = await Statistics.findOne({ userId: req.user.id });

        if (!stats) {
            stats = await Statistics.create({ userId: req.user.id });
        }

        stats.updateAfterGame(game);
        stats.updateDailyPerformance(new Date(), game);

        await stats.save();

        // Check and update challenges
        const activeChallenges = await Challenge.getActiveChallenges(req.user.id);

        const challengeUpdates = [];

        for (const challenge of activeChallenges) {
            let shouldUpdate = false;
            let amount = 1;

            switch (challenge.challengeData?.taskType) {
                case 'win-games':
                    if (status === 'won') shouldUpdate = true;
                    break;

                case 'use-long-words':
                    const longWords = game.wordsUsed.filter(
                        w => w.wordLength >= (challenge.challengeData.minWordLength || 6)
                    );
                    if (longWords.length > 0) {
                        shouldUpdate = true;
                        amount = longWords.length;
                    }
                    break;

                case 'perfect-games':
                    if (status === 'won' && game.stats.mistakes === 0) {
                        shouldUpdate = true;
                    }
                    break;

                case 'time-attack-score':
                    if (game.mode === 'time-attack') {
                        shouldUpdate = true;
                        amount = score;
                    }
                    break;
            }

            if (shouldUpdate) {
                const result = challenge.updateProgress(amount);
                if (result.completed) {
                    // Award challenge rewards
                    if (result.rewards.xp) {
                        user.addXP(result.rewards.xp);
                    }
                    challengeUpdates.push({
                        challenge: challenge.title,
                        completed: true,
                        rewards: result.rewards
                    });
                }
                await challenge.save();
            }
        }

        await user.save();

        res.json({
            success: true,
            message: 'Game ended successfully',
            data: {
                game,
                xpEarned,
                score,
                levelUp: levelUpResult,
                challengeUpdates
            }
        });
    } catch (error) {
        console.error('End game error:', error);
        res.status(500).json({
            success: false,
            message: 'Error ending game',
            error: error.message
        });
    }
};

// @desc    Get game by ID
// @route   GET /api/games/:id
// @access  Private
exports.getGame = async (req, res) => {
    try {
        const game = await Game.findById(req.params.id);

        if (!game) {
            return res.status(404).json({
                success: false,
                message: 'Game not found'
            });
        }

        if (game.userId.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        res.json({
            success: true,
            data: game
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching game',
            error: error.message
        });
    }
};

// @desc    Get user's game history
// @route   GET /api/games
// @access  Private
exports.getGameHistory = async (req, res) => {
    try {
        const { mode, status, limit = 20, skip = 0 } = req.query;

        const filter = { userId: req.user.id };

        if (mode) filter.mode = mode;
        if (status) filter.status = status;

        const games = await Game.find(filter)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(parseInt(skip));

        const total = await Game.countDocuments(filter);

        res.json({
            success: true,
            data: {
                games,
                total,
                limit: parseInt(limit),
                skip: parseInt(skip)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching game history',
            error: error.message
        });
    }
};

// @desc    Delete game
// @route   DELETE /api/games/:id
// @access  Private
exports.deleteGame = async (req, res) => {
    try {
        const game = await Game.findById(req.params.id);

        if (!game) {
            return res.status(404).json({
                success: false,
                message: 'Game not found'
            });
        }

        if (game.userId.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        await game.deleteOne();

        res.json({
            success: true,
            message: 'Game deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting game',
            error: error.message
        });
    }
};
