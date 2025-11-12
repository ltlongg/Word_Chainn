const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },

    // Challenge type
    type: {
        type: String,
        enum: [
            'daily',           // Daily challenges
            'weekly',          // Weekly challenges
            'achievement',     // Special achievement challenges
            'word-of-day',     // Word of the Day challenge
            'letter',          // Letter-specific challenge
            'speed'            // Speed challenges
        ],
        required: true
    },

    // Challenge details
    title: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true
    },

    // Challenge parameters
    target: {
        type: Number,
        required: true
    },

    current: {
        type: Number,
        default: 0
    },

    // Challenge specific data
    challengeData: {
        // For letter challenges
        letter: String,

        // For word-of-day
        word: String,
        definition: String,

        // For speed challenges
        timeLimit: Number, // milliseconds
        requiredStreak: Number,

        // For achievement challenges
        achievementId: String,

        // For daily/weekly challenges
        taskType: {
            type: String,
            enum: [
                'use-long-words',      // Use N words with 6+ letters
                'win-games',           // Win N games
                'perfect-games',       // Win N games without mistakes
                'chain-length',        // Reach chain of N words
                'time-attack-score',   // Score N points in time attack
                'learn-words',         // Learn N new words
                'review-words'         // Review N words
            ]
        },

        minWordLength: Number,
        requiredWins: Number
    },

    // Status
    status: {
        type: String,
        enum: ['active', 'completed', 'failed', 'expired'],
        default: 'active'
    },

    // Rewards
    rewards: {
        xp: {
            type: Number,
            default: 0
        },
        achievementId: String,
        badge: String
    },

    // Timing
    startDate: {
        type: Date,
        required: true
    },

    endDate: {
        type: Date,
        required: true
    },

    completedAt: Date,

    // Timestamps
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Indexes
challengeSchema.index({ userId: 1, status: 1, endDate: 1 });
challengeSchema.index({ type: 1, startDate: 1 });

// Method to update progress
challengeSchema.methods.updateProgress = function(amount = 1) {
    this.current += amount;

    if (this.current >= this.target) {
        this.status = 'completed';
        this.completedAt = new Date();
        return { completed: true, rewards: this.rewards };
    }

    return { completed: false };
};

// Method to check if expired
challengeSchema.methods.checkExpiration = function() {
    if (this.status === 'active' && new Date() > this.endDate) {
        this.status = 'expired';
        return true;
    }
    return false;
};

// Static method to get active challenges for user
challengeSchema.statics.getActiveChallenges = async function(userId) {
    return this.find({
        userId,
        status: 'active',
        endDate: { $gt: new Date() }
    }).sort({ endDate: 1 });
};

// Static method to create daily challenge
challengeSchema.statics.createDailyChallenge = async function(userId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Check if daily challenge already exists for today
    const existing = await this.findOne({
        userId,
        type: 'daily',
        startDate: { $gte: today, $lt: tomorrow }
    });

    if (existing) {
        return existing;
    }

    // Generate random daily challenge
    const challenges = [
        {
            title: 'Long Word Master',
            description: 'Use 5 words with 6+ letters',
            target: 5,
            challengeData: {
                taskType: 'use-long-words',
                minWordLength: 6
            },
            rewards: { xp: 100 }
        },
        {
            title: 'Victory Streak',
            description: 'Win 3 games today',
            target: 3,
            challengeData: {
                taskType: 'win-games',
                requiredWins: 3
            },
            rewards: { xp: 150 }
        },
        {
            title: 'Perfect Performance',
            description: 'Win 2 games without any mistakes',
            target: 2,
            challengeData: {
                taskType: 'perfect-games'
            },
            rewards: { xp: 200 }
        },
        {
            title: 'Vocabulary Builder',
            description: 'Learn 10 new words',
            target: 10,
            challengeData: {
                taskType: 'learn-words'
            },
            rewards: { xp: 120 }
        }
    ];

    const randomChallenge = challenges[Math.floor(Math.random() * challenges.length)];

    return this.create({
        userId,
        type: 'daily',
        ...randomChallenge,
        startDate: today,
        endDate: tomorrow
    });
};

// Static method to create weekly challenge
challengeSchema.statics.createWeeklyChallenge = async function(userId) {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    // Check if weekly challenge exists
    const existing = await this.findOne({
        userId,
        type: 'weekly',
        startDate: { $gte: startOfWeek, $lt: endOfWeek }
    });

    if (existing) {
        return existing;
    }

    // Weekly challenges are more demanding
    const challenges = [
        {
            title: 'Weekly Champion',
            description: 'Win 10 games this week',
            target: 10,
            challengeData: {
                taskType: 'win-games',
                requiredWins: 10
            },
            rewards: { xp: 500 }
        },
        {
            title: 'Vocabulary Mastery',
            description: 'Learn 50 new words this week',
            target: 50,
            challengeData: {
                taskType: 'learn-words'
            },
            rewards: { xp: 600 }
        },
        {
            title: 'Time Attack Expert',
            description: 'Score 500+ points in Time Attack mode',
            target: 500,
            challengeData: {
                taskType: 'time-attack-score'
            },
            rewards: { xp: 700 }
        }
    ];

    const randomChallenge = challenges[Math.floor(Math.random() * challenges.length)];

    return this.create({
        userId,
        type: 'weekly',
        ...randomChallenge,
        startDate: startOfWeek,
        endDate: endOfWeek
    });
};

// Static method to create Word of the Day challenge
challengeSchema.statics.createWordOfDayChallenge = async function(userId, wordData) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.create({
        userId,
        type: 'word-of-day',
        title: 'Word of the Day',
        description: `Use the word "${wordData.word}" in a game`,
        target: 1,
        challengeData: {
            word: wordData.word,
            definition: wordData.definition
        },
        rewards: { xp: 50 },
        startDate: today,
        endDate: tomorrow
    });
};

module.exports = mongoose.model('Challenge', challengeSchema);
