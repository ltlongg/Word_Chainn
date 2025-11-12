const Statistics = require('../models/Statistics.model');
const Game = require('../models/Game.model');
const Vocabulary = require('../models/Vocabulary.model');

// @desc    Get user statistics
// @route   GET /api/statistics
// @access  Private
exports.getStatistics = async (req, res) => {
    try {
        let stats = await Statistics.findOne({ userId: req.user.id });

        if (!stats) {
            stats = await Statistics.create({ userId: req.user.id });
        }

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching statistics',
            error: error.message
        });
    }
};

// @desc    Get performance history
// @route   GET /api/statistics/performance
// @access  Private
exports.getPerformanceHistory = async (req, res) => {
    try {
        const { days = 30 } = req.query;

        const stats = await Statistics.findOne({ userId: req.user.id });

        if (!stats) {
            return res.json({
                success: true,
                data: []
            });
        }

        // Get last N days
        const history = stats.performanceHistory
            .sort((a, b) => b.date - a.date)
            .slice(0, parseInt(days))
            .reverse();

        res.json({
            success: true,
            data: history
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching performance history',
            error: error.message
        });
    }
};

// @desc    Get letter frequency analysis
// @route   GET /api/statistics/letter-frequency
// @access  Private
exports.getLetterFrequency = async (req, res) => {
    try {
        const stats = await Statistics.findOne({ userId: req.user.id });

        if (!stats) {
            return res.json({
                success: true,
                data: {
                    mostUsed: [],
                    leastUsed: [],
                    hardestLetters: []
                }
            });
        }

        // Recalculate letter frequency
        await stats.calculateLetterFrequency();
        await stats.save();

        res.json({
            success: true,
            data: stats.letterFrequency
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching letter frequency',
            error: error.message
        });
    }
};

// @desc    Get win rate by difficulty
// @route   GET /api/statistics/win-rate
// @access  Private
exports.getWinRateByDifficulty = async (req, res) => {
    try {
        const stats = await Statistics.findOne({ userId: req.user.id });

        if (!stats) {
            return res.json({
                success: true,
                data: {
                    easy: { winRate: 0, games: 0, wins: 0 },
                    medium: { winRate: 0, games: 0, wins: 0 },
                    hard: { winRate: 0, games: 0, wins: 0 }
                }
            });
        }

        res.json({
            success: true,
            data: stats.byDifficulty
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching win rate',
            error: error.message
        });
    }
};

// @desc    Get session history
// @route   GET /api/statistics/sessions
// @access  Private
exports.getSessionHistory = async (req, res) => {
    try {
        const { limit = 50, skip = 0 } = req.query;

        const games = await Game.find({
            userId: req.user.id,
            status: { $ne: 'in-progress' }
        })
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(parseInt(skip))
        .select('mode difficulty status score xpEarned stats createdAt duration');

        const total = await Game.countDocuments({
            userId: req.user.id,
            status: { $ne: 'in-progress' }
        });

        res.json({
            success: true,
            data: {
                sessions: games,
                total
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching session history',
            error: error.message
        });
    }
};

// @desc    Get progress calendar
// @route   GET /api/statistics/calendar
// @access  Private
exports.getProgressCalendar = async (req, res) => {
    try {
        const { year, month } = req.query;

        const startDate = new Date(year || new Date().getFullYear(), month || new Date().getMonth(), 1);
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 1);

        // Get all games in the date range
        const games = await Game.find({
            userId: req.user.id,
            createdAt: { $gte: startDate, $lt: endDate }
        }).select('createdAt status');

        // Group by day
        const calendar = {};

        games.forEach(game => {
            const dateKey = game.createdAt.toISOString().split('T')[0];

            if (!calendar[dateKey]) {
                calendar[dateKey] = {
                    date: dateKey,
                    games: 0,
                    wins: 0
                };
            }

            calendar[dateKey].games += 1;
            if (game.status === 'won') {
                calendar[dateKey].wins += 1;
            }
        });

        // Calculate streak
        const stats = await Statistics.findOne({ userId: req.user.id });

        res.json({
            success: true,
            data: {
                calendar: Object.values(calendar),
                currentStreak: stats?.streaks.current || 0,
                bestStreak: stats?.streaks.best || 0,
                playDays: stats?.streaks.playDays || 0
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching progress calendar',
            error: error.message
        });
    }
};

// @desc    Get dashboard summary
// @route   GET /api/statistics/dashboard
// @access  Private
exports.getDashboard = async (req, res) => {
    try {
        const stats = await Statistics.findOne({ userId: req.user.id });
        const vocabStats = await Vocabulary.getStatistics(req.user.id);

        // Get recent games
        const recentGames = await Game.find({
            userId: req.user.id,
            status: { $ne: 'in-progress' }
        })
        .sort({ createdAt: -1 })
        .limit(10)
        .select('mode difficulty status score createdAt');

        res.json({
            success: true,
            data: {
                overall: stats?.overall || {},
                byDifficulty: stats?.byDifficulty || {},
                byMode: stats?.byMode || {},
                wordStats: stats?.wordStats || {},
                responseTime: stats?.responseTime || {},
                streaks: stats?.streaks || {},
                records: stats?.records || {},
                vocabulary: vocabStats,
                recentGames
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard',
            error: error.message
        });
    }
};
