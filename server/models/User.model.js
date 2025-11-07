const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    // Authentication
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false // Don't return password by default
    },

    // Profile
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
        minlength: [3, 'Username must be at least 3 characters'],
        maxlength: [20, 'Username must not exceed 20 characters'],
        match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores']
    },
    displayName: {
        type: String,
        default: function() { return this.username; }
    },
    avatar: {
        type: String,
        default: 'default-avatar.png'
    },

    // Game Progress
    level: {
        type: Number,
        default: 1
    },
    xp: {
        type: Number,
        default: 0
    },
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
    currentStreak: {
        type: Number,
        default: 0
    },
    bestStreak: {
        type: Number,
        default: 0
    },
    totalWordsUsed: {
        type: Number,
        default: 0
    },

    // Achievements
    achievements: [{
        achievementId: String,
        unlockedAt: {
            type: Date,
            default: Date.now
        }
    }],

    // Settings
    settings: {
        soundEnabled: {
            type: Boolean,
            default: true
        },
        difficulty: {
            type: String,
            enum: ['easy', 'medium', 'hard'],
            default: 'medium'
        },
        theme: {
            type: String,
            enum: ['light', 'dark'],
            default: 'light'
        },
        language: {
            type: String,
            default: 'en'
        }
    },

    // Account status
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date,
        default: Date.now
    },

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

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Method to generate JWT token
userSchema.methods.generateAuthToken = function() {
    return jwt.sign(
        { userId: this._id, username: this.username },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
    );
};

// Method to add XP and level up
userSchema.methods.addXP = function(amount) {
    this.xp += amount;

    // Check for level up
    const xpNeeded = this.level * 100;
    if (this.xp >= xpNeeded) {
        this.level += 1;
        this.xp -= xpNeeded;
        return { leveledUp: true, newLevel: this.level };
    }

    return { leveledUp: false };
};

// Method to unlock achievement
userSchema.methods.unlockAchievement = function(achievementId) {
    const alreadyUnlocked = this.achievements.some(a => a.achievementId === achievementId);

    if (!alreadyUnlocked) {
        this.achievements.push({ achievementId });
        return true;
    }

    return false;
};

// Method to get public profile
userSchema.methods.getPublicProfile = function() {
    return {
        id: this._id,
        username: this.username,
        displayName: this.displayName,
        avatar: this.avatar,
        level: this.level,
        xp: this.xp,
        totalGames: this.totalGames,
        totalWins: this.totalWins,
        totalLosses: this.totalLosses,
        currentStreak: this.currentStreak,
        bestStreak: this.bestStreak,
        totalWordsUsed: this.totalWordsUsed,
        achievements: this.achievements,
        createdAt: this.createdAt
    };
};

// Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ level: -1 });

module.exports = mongoose.model('User', userSchema);
