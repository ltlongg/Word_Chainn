const User = require('../models/User.model');
const Statistics = require('../models/Statistics.model');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        res.json({
            success: true,
            data: user.getPublicProfile()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching profile',
            error: error.message
        });
    }
};

// @desc    Get user leaderboard
// @route   GET /api/users/leaderboard
// @access  Public
exports.getLeaderboard = async (req, res) => {
    try {
        const { limit = 100, sortBy = 'level' } = req.query;

        let sortField = {};

        switch (sortBy) {
            case 'level':
                sortField = { level: -1, xp: -1 };
                break;
            case 'wins':
                sortField = { totalWins: -1 };
                break;
            case 'streak':
                sortField = { bestStreak: -1 };
                break;
            case 'words':
                sortField = { totalWordsUsed: -1 };
                break;
            default:
                sortField = { level: -1 };
        }

        const users = await User.find({ isActive: true })
            .select('username displayName avatar level xp totalWins totalGames bestStreak totalWordsUsed')
            .sort(sortField)
            .limit(parseInt(limit));

        const leaderboard = users.map((user, index) => ({
            rank: index + 1,
            username: user.username,
            displayName: user.displayName,
            avatar: user.avatar,
            level: user.level,
            xp: user.xp,
            totalWins: user.totalWins,
            totalGames: user.totalGames,
            bestStreak: user.bestStreak,
            totalWordsUsed: user.totalWordsUsed
        }));

        res.json({
            success: true,
            data: leaderboard
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching leaderboard',
            error: error.message
        });
    }
};

// @desc    Get user achievements
// @route   GET /api/users/achievements
// @access  Private
exports.getAchievements = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        // Define all available achievements
        const allAchievements = [
            {
                id: 'first-victory',
                title: 'First Victory',
                description: 'Win your first game',
                xp: 50,
                icon: '🏆'
            },
            {
                id: 'win-streak-3',
                title: 'Hot Streak',
                description: 'Win 3 games in a row',
                xp: 100,
                icon: '🔥'
            },
            {
                id: 'win-streak-5',
                title: 'On Fire',
                description: 'Win 5 games in a row',
                xp: 200,
                icon: '🔥🔥'
            },
            {
                id: 'win-streak-10',
                title: 'Unstoppable',
                description: 'Win 10 games in a row',
                xp: 500,
                icon: '🔥🔥🔥'
            },
            {
                id: 'vocabulary-50',
                title: 'Word Collector',
                description: 'Learn 50 unique words',
                xp: 75,
                icon: '📚'
            },
            {
                id: 'vocabulary-100',
                title: 'Wordsmith',
                description: 'Learn 100 unique words',
                xp: 150,
                icon: '📖'
            },
            {
                id: 'vocabulary-200',
                title: 'Lexicon Master',
                description: 'Learn 200 unique words',
                xp: 300,
                icon: '📗'
            },
            {
                id: 'long-word',
                title: 'Sesquipedalian',
                description: 'Use a word with 8+ letters',
                xp: 50,
                icon: '📏'
            },
            {
                id: 'speed-demon',
                title: 'Speed Demon',
                description: 'Win a game in under 3 minutes',
                xp: 100,
                icon: '⚡'
            },
            {
                id: 'perfect-game',
                title: 'Flawless',
                description: 'Win a game without any mistakes',
                xp: 200,
                icon: '💎'
            },
            {
                id: 'hard-mode-master',
                title: 'Hard Mode Master',
                description: 'Win 10 games on hard difficulty',
                xp: 150,
                icon: '🎯'
            }
        ];

        // Mark which achievements are unlocked
        const achievements = allAchievements.map(achievement => {
            const unlocked = user.achievements.find(a => a.achievementId === achievement.id);

            return {
                ...achievement,
                unlocked: !!unlocked,
                unlockedAt: unlocked?.unlockedAt || null
            };
        });

        const unlockedCount = achievements.filter(a => a.unlocked).length;
        const totalCount = achievements.length;

        res.json({
            success: true,
            data: {
                achievements,
                progress: {
                    unlocked: unlockedCount,
                    total: totalCount,
                    percentage: Math.round((unlockedCount / totalCount) * 100)
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching achievements',
            error: error.message
        });
    }
};

// @desc    Unlock achievement
// @route   POST /api/users/achievements/:achievementId
// @access  Private
exports.unlockAchievement = async (req, res) => {
    try {
        const { achievementId } = req.params;

        const user = await User.findById(req.user.id);

        const wasUnlocked = user.unlockAchievement(achievementId);

        if (wasUnlocked) {
            await user.save();

            res.json({
                success: true,
                message: 'Achievement unlocked!',
                data: {
                    achievementId,
                    newlyUnlocked: true
                }
            });
        } else {
            res.json({
                success: true,
                message: 'Achievement already unlocked',
                data: {
                    achievementId,
                    newlyUnlocked: false
                }
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error unlocking achievement',
            error: error.message
        });
    }
};
