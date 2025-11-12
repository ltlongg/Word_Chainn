const mongoose = require('mongoose');

const vocabularySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },

    word: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },

    translation: {
        type: String,
        default: ''
    },

    definition: {
        type: String,
        default: ''
    },

    // Usage tracking
    timesUsed: {
        type: Number,
        default: 1
    },

    firstUsedAt: {
        type: Date,
        default: Date.now
    },

    lastUsedAt: {
        type: Date,
        default: Date.now
    },

    usageDates: [{
        type: Date
    }],

    // Learning status
    isFavorite: {
        type: Boolean,
        default: false
    },

    isDifficult: {
        type: Boolean,
        default: false
    },

    masteryLevel: {
        type: Number,
        min: 0,
        max: 5,
        default: 0 // 0: new, 1-2: learning, 3-4: familiar, 5: mastered
    },

    // Spaced Repetition System (SRS)
    srs: {
        nextReviewDate: {
            type: Date,
            default: Date.now
        },
        interval: {
            type: Number,
            default: 1 // days
        },
        easeFactor: {
            type: Number,
            default: 2.5
        },
        repetitions: {
            type: Number,
            default: 0
        }
    },

    // Study data
    studyStats: {
        correctReviews: {
            type: Number,
            default: 0
        },
        incorrectReviews: {
            type: Number,
            default: 0
        },
        totalReviews: {
            type: Number,
            default: 0
        },
        averageResponseTime: {
            type: Number,
            default: 0
        }
    },

    // Word metadata
    phonetic: String,
    partOfSpeech: [String],
    examples: [String],
    synonyms: [String],
    antonyms: [String],

    // Game context
    gamesUsedIn: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Game'
    }],

    // Timestamps
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Compound index for userId + word (unique combination)
vocabularySchema.index({ userId: 1, word: 1 }, { unique: true });
vocabularySchema.index({ userId: 1, 'srs.nextReviewDate': 1 });
vocabularySchema.index({ userId: 1, isFavorite: 1 });
vocabularySchema.index({ userId: 1, isDifficult: 1 });

// Method to update usage
vocabularySchema.methods.recordUsage = function() {
    this.timesUsed += 1;
    this.lastUsedAt = new Date();
    this.usageDates.push(new Date());

    // Increase mastery level based on usage
    if (this.timesUsed >= 20) {
        this.masteryLevel = 5;
    } else if (this.timesUsed >= 15) {
        this.masteryLevel = 4;
    } else if (this.timesUsed >= 10) {
        this.masteryLevel = 3;
    } else if (this.timesUsed >= 5) {
        this.masteryLevel = 2;
    } else if (this.timesUsed >= 2) {
        this.masteryLevel = 1;
    }
};

// Spaced Repetition Algorithm (SM-2)
vocabularySchema.methods.updateSRS = function(quality) {
    // quality: 0-5 (0: total blackout, 5: perfect response)

    if (quality >= 3) {
        // Correct response
        if (this.srs.repetitions === 0) {
            this.srs.interval = 1;
        } else if (this.srs.repetitions === 1) {
            this.srs.interval = 6;
        } else {
            this.srs.interval = Math.round(this.srs.interval * this.srs.easeFactor);
        }

        this.srs.repetitions += 1;
        this.studyStats.correctReviews += 1;
    } else {
        // Incorrect response
        this.srs.repetitions = 0;
        this.srs.interval = 1;
        this.studyStats.incorrectReviews += 1;
    }

    // Update ease factor
    this.srs.easeFactor = Math.max(
        1.3,
        this.srs.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    );

    // Calculate next review date
    this.srs.nextReviewDate = new Date(Date.now() + this.srs.interval * 24 * 60 * 60 * 1000);

    this.studyStats.totalReviews += 1;
};

// Method to get words due for review
vocabularySchema.statics.getDueWords = async function(userId, limit = 20) {
    return this.find({
        userId,
        'srs.nextReviewDate': { $lte: new Date() }
    })
    .sort({ 'srs.nextReviewDate': 1 })
    .limit(limit);
};

// Method to get statistics
vocabularySchema.statics.getStatistics = async function(userId) {
    const words = await this.find({ userId });

    const stats = {
        totalWords: words.length,
        favorites: words.filter(w => w.isFavorite).length,
        difficult: words.filter(w => w.isDifficult).length,
        mastered: words.filter(w => w.masteryLevel === 5).length,
        learning: words.filter(w => w.masteryLevel >= 1 && w.masteryLevel < 5).length,
        new: words.filter(w => w.masteryLevel === 0).length,
        dueForReview: words.filter(w => w.srs.nextReviewDate <= new Date()).length,
        averageTimesUsed: words.reduce((sum, w) => sum + w.timesUsed, 0) / (words.length || 1)
    };

    return stats;
};

module.exports = mongoose.model('Vocabulary', vocabularySchema);
