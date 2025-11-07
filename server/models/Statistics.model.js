const mongoose = require('mongoose');

const statisticsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
        index: true
    },

    // Overall game statistics
    overall: {
        totalGames: {
            type: Number,
            default: 0
        },
        totalWins: {
            type: Number,
            default: 0
        },
        totalLosses: {
            type: Number,
            default: 0
        },
        winRate: {
            type: Number,
            default: 0
        },
        totalPlayTime: {
            type: Number,
            default: 0 // milliseconds
        },
        averageGameDuration: {
            type: Number,
            default: 0
        }
    },

    // Statistics by difficulty
    byDifficulty: {
        easy: {
            games: { type: Number, default: 0 },
            wins: { type: Number, default: 0 },
            losses: { type: Number, default: 0 },
            winRate: { type: Number, default: 0 }
        },
        medium: {
            games: { type: Number, default: 0 },
            wins: { type: Number, default: 0 },
            losses: { type: Number, default: 0 },
            winRate: { type: Number, default: 0 }
        },
        hard: {
            games: { type: Number, default: 0 },
            wins: { type: Number, default: 0 },
            losses: { type: Number, default: 0 },
            winRate: { type: Number, default: 0 }
        }
    },

    // Statistics by game mode
    byMode: {
        'vs-ai': {
            games: { type: Number, default: 0 },
            wins: { type: Number, default: 0 },
            bestScore: { type: Number, default: 0 }
        },
        'multiplayer-local': {
            games: { type: Number, default: 0 },
            player1Wins: { type: Number, default: 0 },
            player2Wins: { type: Number, default: 0 }
        },
        'time-attack': {
            games: { type: Number, default: 0 },
            bestScore: { type: Number, default: 0 },
            mostWords: { type: Number, default: 0 },
            bestWPM: { type: Number, default: 0 }
        },
        'survival': {
            games: { type: Number, default: 0 },
            longestChain: { type: Number, default: 0 },
            bestScore: { type: Number, default: 0 }
        },
        'practice': {
            games: { type: Number, default: 0 },
            totalWords: { type: Number, default: 0 }
        },
        'endless': {
            games: { type: Number, default: 0 },
            bestScore: { type: Number, default: 0 },
            longestSession: { type: Number, default: 0 }
        },
        'chain-challenge': {
            games: { type: Number, default: 0 },
            maxLengthReached: { type: Number, default: 0 },
            bestScore: { type: Number, default: 0 }
        },
        'theme': {
            games: { type: Number, default: 0 },
            bestScore: { type: Number, default: 0 }
        }
    },

    // Word statistics
    wordStats: {
        totalWordsUsed: {
            type: Number,
            default: 0
        },
        uniqueWords: {
            type: Number,
            default: 0
        },
        longestWord: {
            word: String,
            length: Number
        },
        averageWordLength: {
            type: Number,
            default: 0
        },
        mostUsedWords: [{
            word: String,
            count: Number
        }]
    },

    // Letter frequency analysis
    letterFrequency: {
        mostUsed: [{
            letter: String,
            count: Number
        }],
        leastUsed: [{
            letter: String,
            count: Number
        }],
        hardestLetters: [{
            letter: String,
            failureRate: Number
        }]
    },

    // Response time tracking
    responseTime: {
        average: {
            type: Number,
            default: 0
        },
        fastest: {
            type: Number,
            default: 0
        },
        slowest: {
            type: Number,
            default: 0
        },
        byDifficulty: {
            easy: { type: Number, default: 0 },
            medium: { type: Number, default: 0 },
            hard: { type: Number, default: 0 }
        }
    },

    // Streaks
    streaks: {
        current: {
            type: Number,
            default: 0
        },
        best: {
            type: Number,
            default: 0
        },
        playDays: {
            type: Number,
            default: 0
        },
        lastPlayDate: Date
    },

    // Performance over time (last 30 days)
    performanceHistory: [{
        date: {
            type: Date,
            required: true
        },
        games: Number,
        wins: Number,
        totalWords: Number,
        averageScore: Number,
        playTime: Number
    }],

    // Achievements
    achievementProgress: {
        totalUnlocked: {
            type: Number,
            default: 0
        },
        completionRate: {
            type: Number,
            default: 0
        }
    },

    // Study statistics
    studyStats: {
        totalReviews: {
            type: Number,
            default: 0
        },
        correctReviews: {
            type: Number,
            default: 0
        },
        reviewAccuracy: {
            type: Number,
            default: 0
        },
        quizzesTaken: {
            type: Number,
            default: 0
        },
        averageQuizScore: {
            type: Number,
            default: 0
        }
    },

    // Personal records
    records: {
        highestScore: {
            type: Number,
            default: 0
        },
        mostWordsInGame: {
            type: Number,
            default: 0
        },
        fastestWin: {
            type: Number,
            default: 0 // milliseconds
        },
        longestWinStreak: {
            type: Number,
            default: 0
        }
    },

    // Timestamps
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Method to update statistics after a game
statisticsSchema.methods.updateAfterGame = function(game) {
    // Overall stats
    this.overall.totalGames += 1;

    if (game.status === 'won') {
        this.overall.totalWins += 1;
    } else if (game.status === 'lost') {
        this.overall.totalLosses += 1;
    }

    this.overall.winRate = (this.overall.totalWins / this.overall.totalGames) * 100;
    this.overall.totalPlayTime += game.duration || 0;
    this.overall.averageGameDuration = this.overall.totalPlayTime / this.overall.totalGames;

    // Update by difficulty
    const diffStats = this.byDifficulty[game.difficulty];
    if (diffStats) {
        diffStats.games += 1;
        if (game.status === 'won') {
            diffStats.wins += 1;
        } else if (game.status === 'lost') {
            diffStats.losses += 1;
        }
        diffStats.winRate = (diffStats.wins / diffStats.games) * 100;
    }

    // Update by mode
    const modeStats = this.byMode[game.mode];
    if (modeStats) {
        modeStats.games += 1;

        if (game.status === 'won') {
            if (modeStats.wins !== undefined) {
                modeStats.wins += 1;
            }
        }

        if (modeStats.bestScore !== undefined && game.score > modeStats.bestScore) {
            modeStats.bestScore = game.score;
        }

        // Mode-specific updates
        if (game.mode === 'time-attack' && game.stats.totalWords > modeStats.mostWords) {
            modeStats.mostWords = game.stats.totalWords;
        }

        if (game.mode === 'survival' && game.stats.totalWords > modeStats.longestChain) {
            modeStats.longestChain = game.stats.totalWords;
        }
    }

    // Word stats
    this.wordStats.totalWordsUsed += game.stats.totalWords || 0;

    if (game.stats.longestWord) {
        const currentLongest = this.wordStats.longestWord?.length || 0;
        if (game.stats.longestWord.length > currentLongest) {
            this.wordStats.longestWord = {
                word: game.stats.longestWord,
                length: game.stats.longestWord.length
            };
        }
    }

    // Response time
    if (game.stats.averageResponseTime) {
        const totalResponses = this.overall.totalGames;
        this.responseTime.average =
            ((this.responseTime.average * (totalResponses - 1)) + game.stats.averageResponseTime) / totalResponses;

        if (!this.responseTime.fastest || game.stats.averageResponseTime < this.responseTime.fastest) {
            this.responseTime.fastest = game.stats.averageResponseTime;
        }

        if (game.stats.averageResponseTime > this.responseTime.slowest) {
            this.responseTime.slowest = game.stats.averageResponseTime;
        }
    }

    // Records
    if (game.score > this.records.highestScore) {
        this.records.highestScore = game.score;
    }

    if (game.stats.totalWords > this.records.mostWordsInGame) {
        this.records.mostWordsInGame = game.stats.totalWords;
    }

    if (game.status === 'won' && game.duration) {
        if (!this.records.fastestWin || game.duration < this.records.fastestWin) {
            this.records.fastestWin = game.duration;
        }
    }

    this.lastUpdated = new Date();
};

// Method to update daily performance
statisticsSchema.methods.updateDailyPerformance = function(date, gameData) {
    const dateStr = new Date(date).toDateString();

    let dayRecord = this.performanceHistory.find(
        p => new Date(p.date).toDateString() === dateStr
    );

    if (!dayRecord) {
        dayRecord = {
            date: new Date(date),
            games: 0,
            wins: 0,
            totalWords: 0,
            averageScore: 0,
            playTime: 0
        };
        this.performanceHistory.push(dayRecord);
    }

    dayRecord.games += 1;
    if (gameData.status === 'won') {
        dayRecord.wins += 1;
    }
    dayRecord.totalWords += gameData.stats.totalWords || 0;
    dayRecord.playTime += gameData.duration || 0;
    dayRecord.averageScore =
        ((dayRecord.averageScore * (dayRecord.games - 1)) + gameData.score) / dayRecord.games;

    // Keep only last 30 days
    if (this.performanceHistory.length > 30) {
        this.performanceHistory.sort((a, b) => b.date - a.date);
        this.performanceHistory = this.performanceHistory.slice(0, 30);
    }
};

// Method to calculate letter frequency
statisticsSchema.methods.calculateLetterFrequency = async function() {
    const Vocabulary = require('./Vocabulary.model');
    const words = await Vocabulary.find({ userId: this.userId });

    const letterCount = {};

    words.forEach(vocabItem => {
        const firstLetter = vocabItem.word[0].toLowerCase();
        letterCount[firstLetter] = (letterCount[firstLetter] || 0) + vocabItem.timesUsed;
    });

    const sorted = Object.entries(letterCount).sort((a, b) => b[1] - a[1]);

    this.letterFrequency.mostUsed = sorted.slice(0, 10).map(([letter, count]) => ({ letter, count }));
    this.letterFrequency.leastUsed = sorted.slice(-10).reverse().map(([letter, count]) => ({ letter, count }));
};

module.exports = mongoose.model('Statistics', statisticsSchema);
