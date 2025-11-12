// Achievements Manager for SPA
class AchievementsManager {
    constructor() {
        this.achievements = [];
        this.user = null;
    }

    // All available achievements
    getAllAchievements() {
        return [
            { id: 'first_victory', name: 'Chiến thắng đầu tiên', description: 'Thắng ván đầu tiên', icon: '🎉', xp: 50 },
            { id: 'hot_streak', name: 'Hot Streak', description: 'Thắng 3 ván liên tiếp', icon: '🔥', xp: 100 },
            { id: 'on_fire', name: 'On Fire', description: 'Thắng 5 ván liên tiếp', icon: '🔥🔥', xp: 200 },
            { id: 'unstoppable', name: 'Không thể cản', description: 'Thắng 10 ván liên tiếp', icon: '⚡', xp: 500 },
            { id: 'word_collector', name: 'Người sưu tập từ', description: 'Học 50 từ vựng', icon: '📚', xp: 75 },
            { id: 'wordsmith', name: 'Thợ rèn từ', description: 'Học 100 từ vựng', icon: '📖', xp: 150 },
            { id: 'lexicon_master', name: 'Bậc thầy từ vựng', description: 'Học 200 từ vựng', icon: '🎓', xp: 300 },
            { id: 'sesquipedalian', name: 'Sesquipedalian', description: 'Dùng từ có 8+ chữ cái', icon: '📏', xp: 50 },
            { id: 'speed_demon', name: 'Ác quỷ tốc độ', description: 'Thắng dưới 3 phút', icon: '⚡', xp: 100 },
            { id: 'flawless', name: 'Hoàn hảo', description: 'Thắng không sai lần nào', icon: '💎', xp: 200 },
            { id: 'hard_mode_master', name: 'Bậc thầy Hard Mode', description: 'Thắng 10 ván ở độ khó Hard', icon: '💪', xp: 150 }
        ];
    }

    async initPage() {
        try {
            const response = await api.getProfile();
            if (response.success) {
                this.achievements = response.data.achievements || [];
                this.user = response.data;
                this.updatePlayerProgress();
            }
        } catch (error) {
            console.error('Failed to load achievements:', error);
        }
    }

    updatePlayerProgress() {
        const playerNameEl = document.getElementById('playerName');
        const playerLevelEl = document.getElementById('playerLevel');
        const playerXPEl = document.getElementById('playerXP');
        const playerStreakEl = document.getElementById('playerStreak');
        const xpProgressEl = document.getElementById('xpProgress');
        const xpBarEl = document.getElementById('xpBar');

        if (!this.user) return;

        if (playerNameEl) playerNameEl.textContent = this.user.username || 'Player';
        if (playerLevelEl) playerLevelEl.textContent = this.user.level || 1;
        if (playerXPEl) playerXPEl.textContent = this.user.xp || 0;
        if (playerStreakEl) playerStreakEl.textContent = this.user.winStreak || 0;

        // Calculate XP for next level
        const currentLevel = this.user.level || 1;
        const xpForNextLevel = currentLevel * 100;
        const currentXP = this.user.xp || 0;
        const xpInCurrentLevel = currentXP % 100;

        if (xpProgressEl) xpProgressEl.textContent = `${xpInCurrentLevel} / ${xpForNextLevel}`;
        if (xpBarEl) {
            const progress = (xpInCurrentLevel / xpForNextLevel) * 100;
            xpBarEl.style.width = `${progress}%`;
        }

        // Render achievements
        this.renderAchievementsList();
    }

    renderAchievementsList() {
        const container = document.getElementById('achievementsContainer');
        if (!container) return;

        const allAchievements = this.getAllAchievements();
        const html = allAchievements.map(achievement => {
            const unlocked = this.achievements.some(a => a.achievementId === achievement.id);
            const unlockedData = this.achievements.find(a => a.achievementId === achievement.id);

            return `
                <div class="bg-${unlocked ? 'green' : 'gray'}-900 bg-opacity-20 border border-${unlocked ? 'green' : 'gray'}-700 rounded-lg p-4 ${unlocked ? '' : 'opacity-50'}">
                    <div class="flex items-start gap-4">
                        <div class="text-4xl">${achievement.icon}</div>
                        <div class="flex-1">
                            <div class="font-bold text-lg text-${unlocked ? 'green' : 'gray'}-200">
                                ${achievement.name}
                                ${unlocked ? '<span class="text-green-400 ml-2">✓</span>' : ''}
                            </div>
                            <div class="text-sm text-gray-400">${achievement.description}</div>
                            <div class="text-xs text-gray-500 mt-1">
                                Phần thưởng: ${achievement.xp} XP
                                ${unlocked && unlockedData ? `| Mở khóa: ${new Date(unlockedData.unlockedAt).toLocaleDateString('vi-VN')}` : ''}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = `
            <div class="mb-4 text-sm text-gray-400">
                Đã mở khóa: <span class="font-bold text-green-400">${this.achievements.length}</span> / ${allAchievements.length}
            </div>
            <div class="grid md:grid-cols-2 gap-4">
                ${html}
            </div>
        `;
    }

    // Render full page for SPA
    async renderPage() {
        return `
            <div class="max-w-7xl mx-auto px-4 py-6">
                <div class="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
                    <h1 class="text-3xl font-bold text-indigo-400 mb-6">🏆 Thành tích</h1>

                    <!-- Player Progress Summary -->
                    <div id="playerProgress" class="mb-8">
                        <div class="bg-gradient-to-r from-indigo-900 to-purple-900 bg-opacity-30 border border-indigo-700 rounded-xl p-6 mb-6">
                            <div class="flex items-center justify-between">
                                <div>
                                    <h2 class="text-2xl font-bold text-indigo-300" id="playerName">Loading...</h2>
                                    <div class="flex items-center gap-4 mt-2">
                                        <div class="text-gray-200">
                                            <span class="font-semibold">Level:</span>
                                            <span id="playerLevel" class="text-xl font-bold text-indigo-400">1</span>
                                        </div>
                                        <div class="text-gray-200">
                                            <span class="font-semibold">XP:</span>
                                            <span id="playerXP" class="text-xl font-bold text-purple-400">0</span>
                                        </div>
                                        <div class="text-gray-200">
                                            <span class="font-semibold">Streak:</span>
                                            <span id="playerStreak" class="text-xl font-bold text-orange-400">0</span> 🔥
                                        </div>
                                    </div>
                                </div>
                                <div class="text-6xl">🎯</div>
                            </div>
                            <!-- XP Progress Bar -->
                            <div class="mt-4">
                                <div class="flex justify-between text-sm text-gray-400 mb-1">
                                    <span>Tiến độ lên cấp</span>
                                    <span id="xpProgress">0 / 100</span>
                                </div>
                                <div class="w-full bg-gray-700 rounded-full h-3">
                                    <div id="xpBar" class="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all" style="width: 0%"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Achievements Grid -->
                    <div class="mb-6">
                        <h3 class="text-xl font-bold text-gray-200 mb-4">🏅 Tất cả thành tích</h3>
                        <div id="achievementsContainer">
                            <div class="text-center py-8 text-gray-400">Đang tải...</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

// Create global instance
window.achievementsManager = new AchievementsManager();
