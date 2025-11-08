// Game Mode Manager
class GameModeManager {
    constructor() {
        this.currentMode = 'vs-ai';
        this.currentTheme = 'general';

        this.modes = {
            'vs-ai': {
                name: 'VS AI',
                icon: '🤖',
                description: 'Chơi với AI, 3 độ khó',
                color: 'indigo'
            },
            'multiplayer-local': {
                name: 'Multiplayer Local',
                icon: '👥',
                description: '2 người chơi thật',
                color: 'blue'
            },
            'time-attack': {
                name: 'Time Attack',
                icon: '⚡',
                description: '60 giây dùng nhiều từ nhất',
                color: 'yellow'
            },
            'survival': {
                name: 'Survival',
                icon: '💪',
                description: 'Chơi đến khi không nghĩ ra từ',
                color: 'red'
            },
            'practice': {
                name: 'Practice',
                icon: '📝',
                description: 'Không giới hạn thời gian',
                color: 'green'
            },
            'endless': {
                name: 'Endless',
                icon: '♾️',
                description: 'Không thắng/thua, chỉ ghi điểm',
                color: 'purple'
            },
            'chain-challenge': {
                name: 'Chain Challenge',
                icon: '🔗',
                description: 'Độ dài từ tăng dần (3→4→5...)',
                color: 'pink'
            },
            'theme': {
                name: 'Theme Mode',
                icon: '🎨',
                description: 'Chỉ dùng từ trong chủ đề',
                color: 'orange'
            }
        };

        this.themes = {
            'general': { name: 'Tổng hợp', icon: '🌐' },
            'animals': { name: 'Động vật', icon: '🦁' },
            'food': { name: 'Thức ăn', icon: '🍔' },
            'jobs': { name: 'Nghề nghiệp', icon: '👔' },
            'nature': { name: 'Thiên nhiên', icon: '🌳' },
            'technology': { name: 'Công nghệ', icon: '💻' },
            'sports': { name: 'Thể thao', icon: '⚽' }
        };
    }

    showModeSelection() {
        const modal = document.getElementById('gameModeModal');
        const grid = document.getElementById('gameModeGrid');

        grid.innerHTML = '';

        for (const [modeId, mode] of Object.entries(this.modes)) {
            const card = document.createElement('div');
            card.className = `bg-${mode.color}-50 border-2 border-${mode.color}-200 rounded-xl p-6 cursor-pointer hover:shadow-lg transition transform hover:scale-105`;
            card.onclick = () => this.selectMode(modeId);

            card.innerHTML = `
                <div class="text-center">
                    <div class="text-5xl mb-3">${mode.icon}</div>
                    <h3 class="font-bold text-lg text-${mode.color}-800 mb-2">${mode.name}</h3>
                    <p class="text-sm text-${mode.color}-600">${mode.description}</p>
                    ${modeId === this.currentMode ? '<div class="mt-3 text-green-600 font-semibold">✓ Đã chọn</div>' : ''}
                </div>
            `;

            grid.appendChild(card);
        }

        modal.classList.remove('hidden');
    }

    selectMode(modeId) {
        this.currentMode = modeId;

        // Show immediate feedback
        const mode = this.modes[modeId];
        UIManager.showStatus(`✓ Đã chọn chế độ ${mode.icon} ${mode.name}!`, 'success');
        AudioManager.play('submit');

        // Show theme selector for theme mode
        if (modeId === 'theme') {
            this.showThemeSelection();
        } else {
            this.closeModeSelection();
            this.startGameWithMode();
        }
    }

    showThemeSelection() {
        const container = document.getElementById('themeSelectionContainer');
        const grid = document.getElementById('themeGrid');

        grid.innerHTML = '';

        for (const [themeId, theme] of Object.entries(this.themes)) {
            if (themeId === 'general') continue; // Skip general for theme mode

            const card = document.createElement('div');
            card.className = 'bg-white border-2 border-gray-200 rounded-lg p-4 cursor-pointer hover:border-orange-400 hover:shadow transition';
            card.onclick = () => this.selectTheme(themeId);

            card.innerHTML = `
                <div class="text-center">
                    <div class="text-4xl mb-2">${theme.icon}</div>
                    <h4 class="font-semibold text-gray-800">${theme.name}</h4>
                    ${themeId === this.currentTheme ? '<div class="mt-2 text-green-600 text-sm">✓ Đã chọn</div>' : ''}
                </div>
            `;

            grid.appendChild(card);
        }

        container.classList.remove('hidden');
    }

    selectTheme(themeId) {
        this.currentTheme = themeId;

        // Show immediate feedback for theme selection
        const theme = this.themes[themeId];
        UIManager.showStatus(`✓ Đã chọn chủ đề ${theme.icon} ${theme.name}!`, 'success');
        AudioManager.play('submit');

        document.getElementById('themeSelectionContainer').classList.add('hidden');
        this.closeModeSelection();
        this.startGameWithMode();
    }

    closeModeSelection() {
        document.getElementById('gameModeModal').classList.add('hidden');
    }

    async startGameWithMode() {
        const mode = this.modes[this.currentMode];
        UIManager.showStatus(`⏳ Đang khởi tạo chế độ ${mode.icon} ${mode.name}...`, 'info');

        try {
            // Create game on server
            const response = await api.createGame(
                this.currentMode,
                GameManager.difficulty,
                this.currentTheme
            );

            if (response.success) {
                GameManager.currentGameId = response.data._id;
                GameManager.currentMode = this.currentMode;
                GameManager.currentTheme = this.currentTheme;

                // Update UI based on mode
                this.updateUIForMode();

                // Show success message with confetti
                const successMsg = this.currentMode === 'theme'
                    ? `🎉 Chế độ ${mode.icon} ${mode.name} - ${this.themes[this.currentTheme].icon} ${this.themes[this.currentTheme].name} đã sẵn sàng!`
                    : `🎉 Chế độ ${mode.icon} ${mode.name} đã sẵn sàng!`;

                UIManager.showStatus(successMsg, 'success');
                AudioManager.play('success');

                // Add visual feedback
                if (typeof Animations !== 'undefined' && Animations.pulse) {
                    Animations.pulse('currentModeInfo');
                }

                // Start the game
                GameManager.restartGame();
            }
        } catch (error) {
            console.error('Failed to create game:', error);
            UIManager.showStatus('❌ Lỗi tạo game. Vui lòng thử lại.', 'error');
            AudioManager.play('error');
        }
    }

    updateUIForMode() {
        const modeInfo = document.getElementById('currentModeInfo');
        const mode = this.modes[this.currentMode];

        // Create prominent mode banner with Dark Mode styling
        modeInfo.innerHTML = `
            <div class="relative bg-gradient-to-r from-${mode.color}-900 to-${mode.color}-700 border-2 border-${mode.color}-500 rounded-xl px-6 py-4 shadow-lg transform transition-all hover:scale-102">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-4">
                        <span class="text-5xl animate-bounce">${mode.icon}</span>
                        <div>
                            <div class="text-xs text-${mode.color}-300 uppercase tracking-wide mb-1">Chế độ hiện tại</div>
                            <div class="font-bold text-2xl text-white">${mode.name}</div>
                            ${this.currentMode === 'theme' ? `
                                <div class="flex items-center gap-2 mt-2 text-sm text-${mode.color}-200">
                                    <span class="text-xl">${this.themes[this.currentTheme].icon}</span>
                                    <span>Chủ đề: ${this.themes[this.currentTheme].name}</span>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                    <div class="bg-white bg-opacity-20 px-4 py-2 rounded-lg">
                        <div class="text-xs text-${mode.color}-100 text-center">✓ Đã kích hoạt</div>
                    </div>
                </div>
            </div>
        `;

        // Update game rules display based on mode
        this.updateGameRules();
    }

    updateGameRules() {
        const rulesEl = document.getElementById('gameRules');

        const rules = {
            'vs-ai': 'Chơi với AI. 20 giây/lượt. 3 lượt thử.',
            'multiplayer-local': 'Lượt chơi của Player 1 → Player 2. Chuyền điện thoại!',
            'time-attack': '60 giây! Dùng nhiều từ nhất có thể!',
            'survival': 'Chơi đến khi không nghĩ ra từ. Không giới hạn thời gian.',
            'practice': 'Luyện tập tự do. Không giới hạn thời gian và lượt thử.',
            'endless': 'Chơi vô tận. Không thắng/thua, chỉ tích điểm.',
            'chain-challenge': 'Từ phải dài hơn dần: 3 chữ → 4 → 5 → 6...',
            'theme': `Chỉ dùng từ về ${this.themes[this.currentTheme].name.toLowerCase()}`
        };

        rulesEl.innerHTML = `
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                <strong>📋 Luật chơi:</strong> ${rules[this.currentMode]}
            </div>
        `;
    }

    getModeConfig() {
        const configs = {
            'vs-ai': {
                hasTimer: true,
                timerDuration: 20,
                hasAttempts: true,
                maxAttempts: 3,
                hasAI: true
            },
            'multiplayer-local': {
                hasTimer: true,
                timerDuration: 20,
                hasAttempts: true,
                maxAttempts: 3,
                hasAI: false,
                isMultiplayer: true
            },
            'time-attack': {
                hasTimer: true,
                timerDuration: 60,
                hasAttempts: false,
                hasAI: false,
                isTimeAttack: true
            },
            'survival': {
                hasTimer: false,
                hasAttempts: false,
                hasAI: false
            },
            'practice': {
                hasTimer: false,
                hasAttempts: false,
                hasAI: true,
                isPractice: true
            },
            'endless': {
                hasTimer: false,
                hasAttempts: false,
                hasAI: true,
                isEndless: true
            },
            'chain-challenge': {
                hasTimer: true,
                timerDuration: 30,
                hasAttempts: true,
                maxAttempts: 3,
                hasAI: false,
                isChainChallenge: true,
                requiredLength: 3
            },
            'theme': {
                hasTimer: true,
                timerDuration: 20,
                hasAttempts: true,
                maxAttempts: 3,
                hasAI: true,
                isThemeMode: true
            }
        };

        return configs[this.currentMode] || configs['vs-ai'];
    }
}

// Create global instance
window.gameModeManager = new GameModeManager();
