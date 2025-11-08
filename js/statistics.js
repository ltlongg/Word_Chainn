// Statistics Manager
class StatisticsManager {
    constructor() {
        this.stats = null;
        this.performanceChart = null;
    }

    async init() {
        await this.loadStats();
    }

    async loadStats() {
        try {
            const response = await api.getDashboard();

            if (response.success) {
                this.stats = response.data;
            }
        } catch (error) {
            console.error('Failed to load statistics:', error);
        }
    }

    async showDashboard() {
        await this.loadStats();

        const modal = document.getElementById('statisticsModal');
        const container = document.getElementById('statisticsContainer');

        container.innerHTML = this.renderDashboard();

        modal.classList.remove('hidden');

        // Render charts after modal is visible
        setTimeout(() => {
            this.renderPerformanceChart();
            this.renderWinRateChart();
        }, 100);
    }

    renderDashboard() {
        if (!this.stats) {
            return '<div class="text-center py-8">Đang tải...</div>';
        }

        const overall = this.stats.overall || {};
        const records = this.stats.records || {};

        return `
            <!-- Overview Cards -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                ${this.renderStatCard('Tổng ván', overall.totalGames || 0, '🎮', 'blue')}
                ${this.renderStatCard('Tỉ lệ thắng', `${(overall.winRate || 0).toFixed(1)}%`, '🏆', 'green')}
                ${this.renderStatCard('Từ vựng', this.stats.vocabulary?.totalWords || 0, '📚', 'purple')}
                ${this.renderStatCard('Level', authManager.currentUser?.level || 1, '⭐', 'yellow')}
            </div>

            <!-- Records -->
            <div class="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-5 mb-6">
                <h3 class="font-bold text-lg text-gray-800 mb-4">🏅 Kỷ lục cá nhân</h3>
                <div class="grid grid-cols-2 gap-4">
                    ${this.renderRecordItem('Điểm cao nhất', records.highestScore || 0)}
                    ${this.renderRecordItem('Nhiều từ nhất', records.mostWordsInGame || 0)}
                    ${this.renderRecordItem('Thắng nhanh nhất', this.formatDuration(records.fastestWin || 0))}
                    ${this.renderRecordItem('Streak dài nhất', records.longestWinStreak || 0)}
                </div>
            </div>

            <!-- Performance Chart -->
            <div class="bg-white rounded-xl p-5 mb-6 border border-gray-200">
                <h3 class="font-bold text-lg text-gray-800 mb-4">📈 Hiệu suất 30 ngày</h3>
                <canvas id="performanceChart" height="80"></canvas>
            </div>

            <!-- Win Rate by Difficulty -->
            <div class="bg-white rounded-xl p-5 mb-6 border border-gray-200">
                <h3 class="font-bold text-lg text-gray-800 mb-4">🎯 Tỉ lệ thắng theo độ khó</h3>
                <canvas id="winRateChart" height="80"></canvas>
            </div>

            <!-- Word Stats -->
            <div class="bg-white rounded-xl p-5 mb-6 border border-gray-200">
                <h3 class="font-bold text-lg text-gray-800 mb-4">📊 Thống kê từ vựng</h3>
                ${this.renderWordStats()}
            </div>

            <!-- Letter Frequency -->
            <button onclick="statisticsManager.showLetterFrequency()" class="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-3 rounded-lg font-semibold mb-4">
                🔤 Xem phân tích chữ cái
            </button>

            <!-- Session History -->
            <button onclick="statisticsManager.showSessionHistory()" class="w-full bg-purple-500 hover:bg-purple-600 text-white py-3 rounded-lg font-semibold">
                📜 Xem lịch sử ván đấu
            </button>
        `;
    }

    renderStatCard(label, value, icon, color) {
        return `
            <div class="bg-${color}-50 border border-${color}-200 rounded-lg p-4 text-center">
                <div class="text-3xl mb-2">${icon}</div>
                <div class="text-2xl font-bold text-${color}-700">${value}</div>
                <div class="text-xs text-${color}-600">${label}</div>
            </div>
        `;
    }

    renderRecordItem(label, value) {
        return `
            <div class="text-center">
                <div class="font-bold text-xl text-orange-600">${value}</div>
                <div class="text-xs text-gray-600">${label}</div>
            </div>
        `;
    }

    renderWordStats() {
        const vocab = this.stats.vocabulary || {};
        const wordStats = this.stats.wordStats || {};

        return `
            <div class="grid grid-cols-3 gap-4">
                <div class="text-center p-3 bg-blue-50 rounded-lg">
                    <div class="font-bold text-2xl text-blue-600">${vocab.totalWords || 0}</div>
                    <div class="text-xs text-gray-600">Tổng từ</div>
                </div>
                <div class="text-center p-3 bg-green-50 rounded-lg">
                    <div class="font-bold text-2xl text-green-600">${vocab.mastered || 0}</div>
                    <div class="text-xs text-gray-600">Thành thạo</div>
                </div>
                <div class="text-center p-3 bg-yellow-50 rounded-lg">
                    <div class="font-bold text-2xl text-yellow-600">${vocab.learning || 0}</div>
                    <div class="text-xs text-gray-600">Đang học</div>
                </div>
            </div>
            <div class="mt-4 text-sm text-gray-600">
                <div>Từ dài nhất: <span class="font-semibold">${wordStats.longestWord?.word || 'N/A'}</span> (${wordStats.longestWord?.length || 0} chữ)</div>
                <div>Độ dài TB: <span class="font-semibold">${(wordStats.averageWordLength || 0).toFixed(1)}</span> chữ</div>
            </div>
        `;
    }

    renderPerformanceChart() {
        const canvas = document.getElementById('performanceChart');

        if (!canvas || !this.stats.performanceHistory) return;

        const ctx = canvas.getContext('2d');

        const history = this.stats.performanceHistory.slice(-30);
        const labels = history.map(h => new Date(h.date).toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' }));
        const gamesData = history.map(h => h.games || 0);
        const winsData = history.map(h => h.wins || 0);

        if (this.performanceChart) {
            this.performanceChart.destroy();
        }

        this.performanceChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [
                    {
                        label: 'Ván chơi',
                        data: gamesData,
                        borderColor: 'rgb(59, 130, 246)',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        tension: 0.4
                    },
                    {
                        label: 'Thắng',
                        data: winsData,
                        borderColor: 'rgb(34, 197, 94)',
                        backgroundColor: 'rgba(34, 197, 94, 0.1)',
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }

    renderWinRateChart() {
        const canvas = document.getElementById('winRateChart');

        if (!canvas || !this.stats.byDifficulty) return;

        const ctx = canvas.getContext('2d');

        const difficulties = this.stats.byDifficulty;

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Dễ', 'Trung bình', 'Khó'],
                datasets: [{
                    label: 'Tỉ lệ thắng (%)',
                    data: [
                        difficulties.easy?.winRate || 0,
                        difficulties.medium?.winRate || 0,
                        difficulties.hard?.winRate || 0
                    ],
                    backgroundColor: [
                        'rgba(34, 197, 94, 0.8)',
                        'rgba(234, 179, 8, 0.8)',
                        'rgba(239, 68, 68, 0.8)'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                }
            }
        });
    }

    async showLetterFrequency() {
        try {
            const response = await api.getLetterFrequency();

            if (response.success) {
                const modal = document.getElementById('letterFrequencyModal');
                const container = document.getElementById('letterFrequencyContent');

                const data = response.data;

                container.innerHTML = `
                    <div class="mb-6">
                        <h3 class="font-bold text-lg text-green-700 mb-3">✅ Chữ cái hay dùng nhất</h3>
                        <div class="grid grid-cols-5 gap-2">
                            ${data.mostUsed.slice(0, 10).map(item => `
                                <div class="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                                    <div class="font-bold text-2xl text-green-600">${item.letter.toUpperCase()}</div>
                                    <div class="text-xs text-gray-600">${item.count} lần</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    <div>
                        <h3 class="font-bold text-lg text-red-700 mb-3">❌ Chữ cái ít dùng nhất</h3>
                        <div class="grid grid-cols-5 gap-2">
                            ${data.leastUsed.slice(0, 10).map(item => `
                                <div class="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                                    <div class="font-bold text-2xl text-red-600">${item.letter.toUpperCase()}</div>
                                    <div class="text-xs text-gray-600">${item.count} lần</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;

                modal.classList.remove('hidden');
            }
        } catch (error) {
            console.error('Failed to load letter frequency:', error);
        }
    }

    async showSessionHistory() {
        try {
            const response = await api.getSessionHistory(50, 0);

            if (response.success) {
                const modal = document.getElementById('sessionHistoryModal');
                const container = document.getElementById('sessionHistoryContent');

                const sessions = response.data.sessions;

                if (sessions.length === 0) {
                    container.innerHTML = '<div class="text-center py-8 text-gray-500">Chưa có lịch sử ván đấu</div>';
                } else {
                    container.innerHTML = sessions.map(session => {
                        const date = new Date(session.createdAt).toLocaleString('vi-VN');
                        const modeNames = {
                            'vs-ai': 'VS AI',
                            'multiplayer-local': 'Multiplayer',
                            'time-attack': 'Time Attack',
                            'survival': 'Survival',
                            'practice': 'Practice',
                            'endless': 'Endless',
                            'chain-challenge': 'Chain Challenge',
                            'theme': 'Theme Mode'
                        };

                        const statusColors = {
                            'won': 'green',
                            'lost': 'red',
                            'draw': 'yellow'
                        };

                        const color = statusColors[session.status] || 'gray';

                        return `
                            <div class="bg-${color}-50 border border-${color}-200 rounded-lg p-4 mb-3">
                                <div class="flex justify-between items-start">
                                    <div>
                                        <div class="font-bold text-${color}-800">${modeNames[session.mode] || session.mode}</div>
                                        <div class="text-sm text-gray-600">${date}</div>
                                        <div class="text-xs text-gray-500 mt-1">
                                            Độ khó: ${session.difficulty} | Từ: ${session.stats.totalWords} | Thời gian: ${this.formatDuration(session.duration)}
                                        </div>
                                    </div>
                                    <div class="text-right">
                                        <div class="font-bold text-xl text-${color}-600">${session.score}</div>
                                        <div class="text-xs text-gray-500">+${session.xpEarned} XP</div>
                                        <div class="text-xs font-semibold text-${color}-600 mt-1">${session.status === 'won' ? '✓ Thắng' : session.status === 'lost' ? '✗ Thua' : 'Hòa'}</div>
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('');
                }

                modal.classList.remove('hidden');
            }
        } catch (error) {
            console.error('Failed to load session history:', error);
        }
    }

    formatDuration(ms) {
        if (!ms) return '0:00';

        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;

        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    closeDashboard() {
        document.getElementById('statisticsModal').classList.add('hidden');
    }

    closeLetterFrequency() {
        document.getElementById('letterFrequencyModal').classList.add('hidden');
    }

    closeSessionHistory() {
        document.getElementById('sessionHistoryModal').classList.add('hidden');
    }
}

// Create global instance
window.statisticsManager = new StatisticsManager();
