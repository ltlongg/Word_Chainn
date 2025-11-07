// Player Progress and Achievements Module
const PlayerManager = {
    data: {
        level: 1,
        xp: 0,
        totalWins: 0,
        totalGames: 0,
        winStreak: 0,
        totalWordsUsed: 0,
        achievements: {},
        bestStreak: 0
    },

    achievements: {
        first_win: { name: '🏆 First Victory', desc: 'Win your first game', xp: 50, unlocked: false },
        streak_3: { name: '🔥 Hot Streak', desc: 'Win 3 games in a row', xp: 100, unlocked: false },
        streak_5: { name: '🔥🔥 On Fire!', desc: 'Win 5 games in a row', xp: 200, unlocked: false },
        streak_10: { name: '🔥🔥🔥 Unstoppable!', desc: 'Win 10 games in a row', xp: 500, unlocked: false },
        words_50: { name: '📚 Vocabulary Builder', desc: 'Use 50 unique words', xp: 75, unlocked: false },
        words_100: { name: '📚📚 Word Master', desc: 'Use 100 unique words', xp: 150, unlocked: false },
        words_200: { name: '📚📚📚 Dictionary Expert', desc: 'Use 200 unique words', xp: 300, unlocked: false },
        long_word: { name: '📏 Long Word', desc: 'Use a word with 8+ letters', xp: 50, unlocked: false },
        speed_win: { name: '⚡ Speed Demon', desc: 'Win in under 3 minutes', xp: 100, unlocked: false },
        perfect_game: { name: '💎 Perfect Game', desc: 'Win without any mistakes', xp: 200, unlocked: false },
        hard_win: { name: '🔴 Hard Mode Master', desc: 'Win on Hard difficulty', xp: 150, unlocked: false }
    },

    load() {
        const saved = localStorage.getItem('wordChainProgress');
        if (saved) {
            this.data = JSON.parse(saved);
            // Load achievement states
            for (const key in this.achievements) {
                this.achievements[key].unlocked = this.data.achievements[key] || false;
            }
        }
        this.updateUI();
    },

    save() {
        // Save achievement states to data
        this.data.achievements = {};
        for (const key in this.achievements) {
            this.data.achievements[key] = this.achievements[key].unlocked;
        }
        localStorage.setItem('wordChainProgress', JSON.stringify(this.data));
    },

    updateUI() {
        document.getElementById('playerLevel').textContent = this.data.level;
        document.getElementById('totalXP').textContent = this.data.xp;
        document.getElementById('totalWins').textContent = this.data.totalWins;
        document.getElementById('winStreak').textContent = this.data.winStreak;

        // XP Bar
        const xpForNextLevel = this.data.level * 100;
        const xpInCurrentLevel = this.data.xp % xpForNextLevel;
        const xpProgress = (xpInCurrentLevel / xpForNextLevel) * 100;

        document.getElementById('xpBar').style.width = xpProgress + '%';
        document.getElementById('xpText').textContent = `${xpInCurrentLevel} / ${xpForNextLevel} XP`;
    },

    addXP(amount, reason) {
        const oldLevel = this.data.level;
        this.data.xp += amount;

        // Check for level up
        const xpForNextLevel = this.data.level * 100;
        if (this.data.xp >= xpForNextLevel) {
            this.data.level++;
            this.showLevelUp(this.data.level);
        }

        this.updateUI();
        this.save();

        // Show XP gain message
        if (reason && window.UIManager) {
            window.UIManager.showStatus(`+${amount} XP: ${reason}`, 'success');
        }
    },

    showLevelUp(level) {
        document.getElementById('newLevel').textContent = level;
        document.getElementById('levelUpModal').classList.remove('hidden');

        setTimeout(() => {
            document.getElementById('levelUpModal').classList.add('hidden');
        }, 3000);
    },

    unlockAchievement(id) {
        if (this.achievements[id] && !this.achievements[id].unlocked) {
            this.achievements[id].unlocked = true;
            this.addXP(this.achievements[id].xp, null);
            this.showAchievementPopup(this.achievements[id]);
            this.save();
        }
    },

    showAchievementPopup(achievement) {
        document.getElementById('achievementTitle').textContent = achievement.name;
        document.getElementById('achievementDesc').textContent = achievement.desc;
        document.getElementById('achievementXP').textContent = achievement.xp;

        const popup = document.getElementById('achievementPopup');
        popup.classList.remove('hidden');

        setTimeout(() => {
            popup.classList.add('hidden');
        }, 4000);
    }
};
