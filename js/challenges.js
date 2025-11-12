// Challenges Manager
class ChallengesManager {
    constructor() {
        this.activeChallenges = [];
        this.completedChallenges = [];
        this.wordOfDay = null;
        this.activeTab = 'active'; // For multi-page view
    }

    async init() {
        await this.loadActiveChallenges();
        await this.createDailyChallenge();
        await this.loadWordOfDay();

        // Render on page if we're on challenges.html
        const wordOfDaySection = document.getElementById('wordOfDaySection');
        if (wordOfDaySection) {
            wordOfDaySection.innerHTML = this.wordOfDay ? this.renderWordOfDay() : '';
        }

        await this.renderChallenges();
    }

    async loadActiveChallenges() {
        try {
            const response = await api.getActiveChallenges();

            if (response.success) {
                this.activeChallenges = response.data;
                this.updateChallengesBadge();
            }
        } catch (error) {
            console.error('Failed to load challenges:', error);
        }
    }

    async createDailyChallenge() {
        try {
            await api.createDailyChallenge();
            await api.createWeeklyChallenge();
        } catch (error) {
            console.error('Failed to create challenges:', error);
        }
    }

    async loadWordOfDay() {
        try {
            const response = await api.getWordOfDay();

            if (response.success) {
                this.wordOfDay = response.data;
            }
        } catch (error) {
            console.error('Failed to load word of day:', error);
        }
    }

    async showDashboard() {
        await this.loadActiveChallenges();

        const modal = document.getElementById('challengesModal');
        const container = document.getElementById('challengesContainer');

        container.innerHTML = '';

        // Word of the Day
        if (this.wordOfDay) {
            container.innerHTML += this.renderWordOfDay();
        }

        // Active Challenges
        if (this.activeChallenges.length > 0) {
            container.innerHTML += '<h3 class="text-xl font-bold text-gray-800 mb-4 mt-6">📋 Thử thách đang diễn ra</h3>';

            for (const challenge of this.activeChallenges) {
                container.innerHTML += this.renderChallenge(challenge);
            }
        } else {
            container.innerHTML += `
                <div class="text-center py-8 text-gray-500">
                    <p class="text-xl mb-2">🎯</p>
                    <p>Không có thử thách nào đang diễn ra</p>
                </div>
            `;
        }

        // Completed challenges button
        container.innerHTML += `
            <button onclick="challengesManager.showCompleted()" class="mt-6 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold transition">
                📜 Xem thử thách đã hoàn thành
            </button>
        `;

        modal.classList.remove('hidden');
    }

    renderWordOfDay() {
        const progress = (this.wordOfDay.current / this.wordOfDay.target) * 100;
        const timeLeft = this.getTimeLeft(this.wordOfDay.endDate);

        return `
            <div class="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl p-6 text-white mb-6">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h3 class="text-2xl font-bold mb-2">📚 Word of the Day</h3>
                        <p class="text-lg font-semibold">"${this.wordOfDay.challengeData.word}"</p>
                        <p class="text-sm opacity-90">${this.wordOfDay.challengeData.definition}</p>
                    </div>
                    <div class="text-right">
                        <div class="text-xs opacity-75">${timeLeft}</div>
                        <div class="font-bold text-lg">+${this.wordOfDay.rewards.xp} XP</div>
                    </div>
                </div>
                <div class="bg-white bg-opacity-20 rounded-full h-3 overflow-hidden">
                    <div class="bg-white h-full rounded-full transition-all" style="width: ${progress}%"></div>
                </div>
                <div class="text-xs mt-2 opacity-90">${this.wordOfDay.current}/${this.wordOfDay.target} - ${this.wordOfDay.description}</div>
            </div>
        `;
    }

    renderChallenge(challenge) {
        const progress = (challenge.current / challenge.target) * 100;
        const timeLeft = this.getTimeLeft(challenge.endDate);

        const typeColors = {
            'daily': 'blue',
            'weekly': 'purple',
            'letter': 'green',
            'speed': 'red',
            'achievement': 'yellow'
        };

        const color = typeColors[challenge.type] || 'gray';

        return `
            <div class="bg-${color}-50 border-2 border-${color}-200 rounded-xl p-5 mb-4">
                <div class="flex justify-between items-start mb-3">
                    <div>
                        <div class="flex items-center gap-2 mb-2">
                            <span class="bg-${color}-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase">
                                ${this.getChallengeTypeLabel(challenge.type)}
                            </span>
                            ${challenge.status === 'completed' ? '<span class="text-green-600 font-bold">✓</span>' : ''}
                        </div>
                        <h4 class="font-bold text-lg text-${color}-900">${challenge.title}</h4>
                        <p class="text-sm text-${color}-700">${challenge.description}</p>
                    </div>
                    <div class="text-right">
                        <div class="text-xs text-${color}-600">${timeLeft}</div>
                        <div class="font-bold text-${color}-800">+${challenge.rewards.xp} XP</div>
                    </div>
                </div>
                <div class="bg-${color}-200 rounded-full h-3 overflow-hidden">
                    <div class="bg-${color}-500 h-full rounded-full transition-all" style="width: ${progress}%"></div>
                </div>
                <div class="flex justify-between text-xs mt-2 text-${color}-700">
                    <span>Tiến độ: ${challenge.current}/${challenge.target}</span>
                    <span>${Math.round(progress)}%</span>
                </div>
            </div>
        `;
    }

    getChallengeTypeLabel(type) {
        const labels = {
            'daily': 'Hàng ngày',
            'weekly': 'Hàng tuần',
            'letter': 'Chữ cái',
            'speed': 'Tốc độ',
            'achievement': 'Thành tựu',
            'word-of-day': 'Từ trong ngày'
        };

        return labels[type] || type;
    }

    getTimeLeft(endDate) {
        const now = new Date();
        const end = new Date(endDate);
        const diff = end - now;

        if (diff <= 0) return 'Hết hạn';

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days} ngày`;
        if (hours > 0) return `${hours} giờ`;

        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        return `${minutes} phút`;
    }

    async showCompleted() {
        try {
            const response = await api.getCompletedChallenges(20);

            if (response.success) {
                this.completedChallenges = response.data;

                const modal = document.getElementById('completedChallengesModal');
                const list = document.getElementById('completedChallengesList');

                list.innerHTML = '';

                if (this.completedChallenges.length === 0) {
                    list.innerHTML = `
                        <div class="text-center py-8 text-gray-500">
                            <p class="text-xl mb-2">🎯</p>
                            <p>Chưa hoàn thành thử thách nào</p>
                        </div>
                    `;
                } else {
                    for (const challenge of this.completedChallenges) {
                        const completedDate = new Date(challenge.completedAt).toLocaleDateString('vi-VN');

                        list.innerHTML += `
                            <div class="bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-3">
                                <div class="flex justify-between items-center">
                                    <div>
                                        <div class="text-green-600 font-bold text-lg mb-1">✓ ${challenge.title}</div>
                                        <div class="text-sm text-gray-600">${challenge.description}</div>
                                        <div class="text-xs text-gray-500 mt-1">Hoàn thành: ${completedDate}</div>
                                    </div>
                                    <div class="text-right">
                                        <div class="font-bold text-green-600">+${challenge.rewards.xp} XP</div>
                                        <div class="text-xs text-gray-500">${this.getChallengeTypeLabel(challenge.type)}</div>
                                    </div>
                                </div>
                            </div>
                        `;
                    }
                }

                modal.classList.remove('hidden');
            }
        } catch (error) {
            console.error('Failed to load completed challenges:', error);
        }
    }

    closeCompleted() {
        document.getElementById('completedChallengesModal').classList.add('hidden');
    }

    closeDashboard() {
        document.getElementById('challengesModal').classList.add('hidden');
    }

    updateChallengesBadge() {
        const badge = document.getElementById('challengesBadge');

        if (badge && this.activeChallenges.length > 0) {
            badge.textContent = this.activeChallenges.length;
            badge.classList.remove('hidden');
        }
    }

    async checkChallengeProgress(wordData) {
        // This will be called after each word submission to update challenges
        // The backend handles most logic, we just need to refresh
        await this.loadActiveChallenges();
    }

    // New method for multi-page rendering
    async renderChallenges() {
        const container = document.getElementById('challengesContainer');
        if (!container) return; // Not on challenges page

        // Update tab styling
        const activeTabBtn = document.getElementById('activeTab');
        const completedTabBtn = document.getElementById('completedTab');

        if (activeTabBtn && completedTabBtn) {
            if (this.activeTab === 'active') {
                activeTabBtn.className = 'px-6 py-3 font-semibold text-indigo-600 border-b-2 border-indigo-600';
                completedTabBtn.className = 'px-6 py-3 font-semibold text-gray-500 hover:text-indigo-600';
            } else {
                activeTabBtn.className = 'px-6 py-3 font-semibold text-gray-500 hover:text-indigo-600';
                completedTabBtn.className = 'px-6 py-3 font-semibold text-indigo-600 border-b-2 border-indigo-600';
            }
        }

        if (this.activeTab === 'active') {
            await this.renderActiveChallenges(container);
        } else {
            await this.renderCompletedChallenges(container);
        }
    }

    async renderActiveChallenges(container) {
        if (this.activeChallenges.length === 0) {
            container.innerHTML = `
                <div class="text-center py-12 text-gray-500">
                    <p class="text-5xl mb-4">🎯</p>
                    <p class="text-lg">Không có thử thách nào đang diễn ra</p>
                </div>
            `;
            return;
        }

        const html = this.activeChallenges.map(challenge => this.renderChallenge(challenge)).join('');
        container.innerHTML = `
            <div class="grid gap-4">
                ${html}
            </div>
        `;
    }

    async renderCompletedChallenges(container) {
        try {
            const response = await api.getCompletedChallenges(20);

            if (response.success) {
                this.completedChallenges = response.data;

                if (this.completedChallenges.length === 0) {
                    container.innerHTML = `
                        <div class="text-center py-12 text-gray-500">
                            <p class="text-5xl mb-4">🏆</p>
                            <p class="text-lg">Chưa hoàn thành thử thách nào</p>
                        </div>
                    `;
                } else {
                    const html = this.completedChallenges.map(challenge => {
                        const completedDate = new Date(challenge.completedAt).toLocaleDateString('vi-VN');

                        return `
                            <div class="bg-green-50 border-2 border-green-200 rounded-lg p-5 mb-3">
                                <div class="flex justify-between items-center">
                                    <div>
                                        <div class="text-green-600 font-bold text-lg mb-1">✓ ${challenge.title}</div>
                                        <div class="text-sm text-gray-600">${challenge.description}</div>
                                        <div class="text-xs text-gray-500 mt-1">Hoàn thành: ${completedDate}</div>
                                    </div>
                                    <div class="text-right">
                                        <div class="font-bold text-green-600">+${challenge.rewards.xp} XP</div>
                                        <div class="text-xs text-gray-500">${this.getChallengeTypeLabel(challenge.type)}</div>
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('');

                    container.innerHTML = `
                        <div class="grid gap-4">
                            ${html}
                        </div>
                    `;
                }
            }
        } catch (error) {
            console.error('Failed to load completed challenges:', error);
            container.innerHTML = '<div class="text-center py-8 text-red-500">Lỗi khi tải thử thách</div>';
        }
    }

    // Render full page for SPA
    async renderPage() {
        return `
            <div class="max-w-7xl mx-auto px-4 py-6">
                <div class="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
                    <h1 class="text-3xl font-bold text-indigo-400 mb-6">🎯 Thử thách</h1>

                    <!-- Word of the Day -->
                    <div id="wordOfDaySection" class="mb-8"></div>

                    <!-- Challenges Tabs -->
                    <div class="flex gap-2 mb-6 border-b border-gray-700">
                        <button onclick="challengesManager.activeTab = 'active'; challengesManager.renderChallenges()"
                            id="activeTab"
                            class="px-6 py-3 font-semibold text-indigo-400 border-b-2 border-indigo-500">
                            Đang hoạt động
                        </button>
                        <button onclick="challengesManager.activeTab = 'completed'; challengesManager.renderChallenges()"
                            id="completedTab"
                            class="px-6 py-3 font-semibold text-gray-400 hover:text-indigo-400">
                            Đã hoàn thành
                        </button>
                    </div>

                    <!-- Challenges Container -->
                    <div id="challengesContainer">
                        <div class="text-center py-8 text-gray-400">Đang tải...</div>
                    </div>
                </div>
            </div>
        `;
    }
}

// Create global instance
window.challengesManager = new ChallengesManager();
