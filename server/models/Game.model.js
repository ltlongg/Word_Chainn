const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
    // Player info
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },

    // Game mode
    mode: {
        type: String,
        enum: [
            'vs-ai',              // Original mode vs AI
            'multiplayer-local',  // 2 real players
            'time-attack',        // 60 seconds max words
            'survival',           // Play until can't think of word
            'practice',           // Unlimited time, no attempts limit
            'endless',            // No win/lose, just scoring
            'chain-challenge',    // Increasing word length
            'theme'               // Category-specific words
        ],
        required: true,
        default: 'vs-ai'
    },

    // Game settings
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium'
    },

    theme: {
        type: String,
        enum: ['animals', 'food', 'jobs', 'nature', 'technology', 'sports', 'general'],
        default: 'general'
    },

    // Game state
    status: {
        type: String,
        enum: ['in-progress', 'won', 'lost', 'draw', 'abandoned'],
        default: 'in-progress'
    },

    // Game data
    wordsUsed: [{
        word: String,
        player: {
            type: String,
            enum: ['user', 'ai', 'player1', 'player2']
        },
        timestamp: {
            type: Date,
            default: Date.now
        },
        responseTime: Number, // milliseconds
        wordLength: Number,
        isCorrect: {
            type: Boolean,
            default: true
        }
    }],

    // Scores
    score: {
        type: Number,
        default: 0
    },

    xpEarned: {
        type: Number,
        default: 0
    },

    // Time tracking
    startTime: {
        type: Date,
        default: Date.now
    },

    endTime: Date,

    duration: Number, // milliseconds

    // Statistics
    stats: {
        totalWords: {
            type: Number,
            default: 0
        },
        averageResponseTime: Number,
        longestWord: String,
        shortestWord: String,
        uniqueLettersUsed: [String],
        mistakes: {
            type: Number,
            default: 0
        }
    },

    // Chain Challenge specific
    chainProgress: {
        currentRequiredLength: {
            type: Number,
            default: 3
        },
        maxLengthReached: {
            type: Number,
            default: 0
        }
    },

    // Time Attack specific
    timeAttackData: {
        timeLimit: {
            type: Number,
            default: 60000 // 60 seconds
        },
        wordsPerMinute: Number
    },

    // Achievements unlocked during this game
    achievementsUnlocked: [String],

    // Timestamps
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Indexes for queries
gameSchema.index({ userId: 1, createdAt: -1 });
gameSchema.index({ mode: 1, createdAt: -1 });
gameSchema.index({ status: 1 });

// Method to add a word to the game
gameSchema.methods.addWord = function(word, player, responseTime) {
    this.wordsUsed.push({
        word,
        player,
        responseTime,
        wordLength: word.length
    });

    this.stats.totalWords = this.wordsUsed.length;

    // Update longest/shortest word
    if (!this.stats.longestWord || word.length > this.stats.longestWord.length) {
        this.stats.longestWord = word;
    }
    if (!this.stats.shortestWord || word.length < this.stats.shortestWord.length) {
        this.stats.shortestWord = word;
    }

    // Track unique letters
    const firstLetter = word[0].toLowerCase();
    if (!this.stats.uniqueLettersUsed.includes(firstLetter)) {
        this.stats.uniqueLettersUsed.push(firstLetter);
    }
};

// Method to end game
gameSchema.methods.endGame = function(status) {
    this.status = status;
    this.endTime = new Date();
    this.duration = this.endTime - this.startTime;

    // Calculate average response time
    const responseTimes = this.wordsUsed
        .filter(w => w.responseTime)
        .map(w => w.responseTime);

    if (responseTimes.length > 0) {
        this.stats.averageResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    }

    // Calculate WPM for time attack
    if (this.mode === 'time-attack') {
        const minutes = this.duration / 60000;
        this.timeAttackData.wordsPerMinute = Math.round(this.stats.totalWords / minutes);
    }
};

// Method to calculate score
gameSchema.methods.calculateScore = function() {
    let score = 0;

    // Base score from words
    this.wordsUsed.forEach(wordData => {
        // Length bonus
        score += (wordData.wordLength - 3) * 5;

        // Speed bonus (faster = more points)
        if (wordData.responseTime < 5000) {
            score += 10;
        }
    });

    // Win bonus
    if (this.status === 'won') {
        score += 50;
    }

    // Mode-specific bonuses
    if (this.mode === 'chain-challenge') {
        score += this.chainProgress.maxLengthReached * 10;
    }

    if (this.mode === 'time-attack') {
        score += this.stats.totalWords * 5;
    }

    this.score = score;
    return score;
};

module.exports = mongoose.model('Game', gameSchema);
