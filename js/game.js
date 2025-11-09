// Main Game Logic Module
const GameManager = {
    // Game state
    usedWords: new Set(),
    currentWord: '',
    isPlayerTurn: false,
    playerAttemptsLeft: 3,
    timeLeft: 20,
    timerInterval: null,
    gameStartTime: null,
    currentDifficulty: 'easy',
    wordsUsedThisGame: 0,
    perfectGame: true,
    gameInProgress: false,
    hintsRemaining: 3,

    init() {
        this.loadDifficulty();
        this.updateDifficultyUI();
    },

    loadDifficulty() {
        const saved = localStorage.getItem('gameDifficulty');
        if (saved) {
            this.currentDifficulty = saved;
        }
    },

    saveDifficulty() {
        localStorage.setItem('gameDifficulty', this.currentDifficulty);
    },

    setDifficulty(level) {
        // Only allow changing difficulty when game is not in progress
        if (this.gameInProgress) {
            UIManager.showStatus('⚠️ Không thể đổi chế độ khi đang chơi!', 'error');
            AudioManager.play('error');
            return;
        }
        
        this.currentDifficulty = level;
        this.saveDifficulty();
        this.updateDifficultyUI();
        UIManager.showStatus(`✓ Đã chọn chế độ ${level.toUpperCase()}`, 'success');
        AudioManager.play('submit');
    },

    updateDifficultyUI() {
        ['easy', 'medium', 'hard'].forEach(diff => {
            const btn = document.getElementById('diff' + diff.charAt(0).toUpperCase() + diff.slice(1));
            if (btn) {
                if (diff === this.currentDifficulty) {
                    btn.className = 'px-6 py-2 rounded-lg font-semibold transition shadow-lg text-white ' +
                        (diff === 'easy' ? 'bg-green-500' : diff === 'medium' ? 'bg-yellow-500' : 'bg-red-500');
                } else {
                    btn.className = 'px-6 py-2 rounded-lg font-semibold transition bg-gray-300 text-gray-700';
                }
                
                // Disable buttons when game is in progress
                btn.disabled = this.gameInProgress;
                if (this.gameInProgress) {
                    btn.classList.add('cursor-not-allowed', 'opacity-50');
                } else {
                    btn.classList.remove('cursor-not-allowed', 'opacity-50');
                }
            }
        });
    },

    async restartGame() {
        this.stopTimer();
        this.usedWords.clear();
        this.currentWord = '';
        this.isPlayerTurn = false;
        this.wordsUsedThisGame = 0;
        this.perfectGame = true;
        this.gameStartTime = Date.now();
        this.gameInProgress = true;
        this.hintsRemaining = 3;

        // Get dynamic config from game mode manager
        const config = window.gameModeManager.getModeConfig();

        // Set attempts based on config
        if (config.hasAttempts) {
            this.playerAttemptsLeft = config.maxAttempts;
        } else {
            this.playerAttemptsLeft = Infinity; // No attempts limit
        }

        // Set timer based on config
        if (config.hasTimer) {
            this.timeLeft = config.timerDuration;
        } else {
            this.timeLeft = 0; // No timer
        }

        document.getElementById('history').innerHTML = '<p class="text-gray-400 text-center">Chưa có từ nào...</p>';
        document.getElementById('currentWord').textContent = '---';
        document.getElementById('currentTranslation').textContent = '---';
        document.getElementById('wordInput').value = '';
        document.getElementById('wordInput').disabled = false;
        document.getElementById('submitBtn').disabled = false;
        document.getElementById('wordCount').textContent = '0';
        document.getElementById('hintsLeft').textContent = '3';
        document.getElementById('hintBtn').disabled = false;
        document.getElementById('endBtn').disabled = false;
        document.getElementById('hintsContainer').classList.add('hidden');

        // Update UI based on config
        if (config.hasAttempts) {
            UIManager.updateAttemptsDisplay(this.playerAttemptsLeft);
            // Show attempts counter
            const attemptsEl = document.getElementById('attempts');
            if (attemptsEl) attemptsEl.classList.remove('hidden');
        } else {
            // Hide attempts counter for modes without attempts
            const attemptsEl = document.getElementById('attempts');
            if (attemptsEl) attemptsEl.classList.add('hidden');
        }

        if (config.hasTimer) {
            UIManager.updateTimerDisplay(this.timeLeft);
            // Show timer
            const timerEl = document.getElementById('timer');
            if (timerEl) timerEl.classList.remove('hidden');
        } else {
            // Hide timer for modes without timer
            const timerEl = document.getElementById('timer');
            if (timerEl) timerEl.classList.add('hidden');
        }

        AudioManager.play('submit');

        // Update difficulty UI to disable buttons during game
        this.updateDifficultyUI();

        // Check if this mode has AI
        if (config.hasAI) {
            // For AI modes, randomly decide who starts
            const playerStarts = Math.random() < 0.5;

            if (playerStarts) {
                this.isPlayerTurn = true;
                UIManager.showStatus('Bạn chơi trước! Nhập từ tiếng Anh bất kỳ.', 'success');
                if (config.hasTimer) {
                    this.startTimer();
                }
            } else {
                this.isPlayerTurn = false;
                UIManager.showStatus('AI chơi trước!', 'info');
                await this.aiTurn(true);
            }
        } else {
            // For non-AI modes, player always starts
            this.isPlayerTurn = true;
            UIManager.showStatus('Bắt đầu! Nhập từ tiếng Anh bất kỳ.', 'success');
            if (config.hasTimer) {
                this.startTimer();
            }
        }
    },

    confirmEndGame() {
        if (!this.gameInProgress) {
            UIManager.showStatus('⚠️ Chưa có ván đấu nào đang diễn ra!', 'error');
            AudioManager.play('error');
            return;
        }
        document.getElementById('endGameModal').classList.remove('hidden');
        AudioManager.play('error');
    },

    closeEndGameModal() {
        document.getElementById('endGameModal').classList.add('hidden');
    },

    forceEndGame() {
        this.closeEndGameModal();
        this.stopTimer();
        this.gameInProgress = false;

        document.getElementById('wordInput').disabled = true;
        document.getElementById('submitBtn').disabled = true;
        document.getElementById('hintBtn').disabled = true;
        document.getElementById('endBtn').disabled = true;
        
        // Update difficulty UI to enable buttons after game ends
        this.updateDifficultyUI();

        // Count as a loss (no streak break, no stats change)
        UIManager.showStatus('🛑 Ván đấu đã kết thúc. Nhấn "Start Game" để chơi lại!', 'error');
        AudioManager.play('defeat');
    },

    startTimer() {
        this.stopTimer();

        // Get config to check if this mode has timer
        const config = window.gameModeManager.getModeConfig();

        // Only start timer if mode requires it
        if (!config.hasTimer) {
            return;
        }

        this.timeLeft = config.timerDuration;
        UIManager.updateTimerDisplay(this.timeLeft);

        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            UIManager.updateTimerDisplay(this.timeLeft);

            if (this.timeLeft <= 0) {
                this.stopTimer();
                this.handleTimeout();
            }
        }, 1000);
    },

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    },

    handleTimeout() {
        if (!this.isPlayerTurn) return;

        const config = window.gameModeManager.getModeConfig();

        // Only deduct attempts if mode has attempts system
        if (config.hasAttempts) {
            this.playerAttemptsLeft--;
            this.perfectGame = false;
            UIManager.updateAttemptsDisplay(this.playerAttemptsLeft);
            AudioManager.play('error');
            Animations.shake('wordInput');

            if (this.playerAttemptsLeft <= 0) {
                this.endGame(false);
                return;
            }

            UIManager.showStatus(`⏰ Hết thời gian! Còn ${this.playerAttemptsLeft} lượt.`, 'error');
        } else {
            // For modes without attempts, just show timeout message and continue
            AudioManager.play('error');
            Animations.shake('wordInput');
            UIManager.showStatus('⏰ Hết thời gian! Hãy thử lại!', 'error');
        }

        document.getElementById('wordInput').value = '';
        document.getElementById('wordInput').focus();

        // Restart timer if config requires it
        if (config.hasTimer) {
            this.startTimer();
        }
    },

    async aiTurn(isFirstTurn = false) {
        UIManager.showStatus('AI đang suy nghĩ...', 'loading');
        document.getElementById('wordInput').disabled = true;
        document.getElementById('submitBtn').disabled = true;

        try {
            await new Promise(resolve => setTimeout(resolve, this.getAIThinkingTime()));

            const aiWord = await this.selectAIWord(isFirstTurn);

            if (this.usedWords.has(aiWord)) {
                await this.aiTurn(isFirstTurn);
                return;
            }

            const dictResponse = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${aiWord}`);
            if (!dictResponse.ok) {
                await this.aiTurn(isFirstTurn);
                return;
            }

            const transResponse = await fetch(`https://api.mymemory.translated.net/get?q=${aiWord}&langpair=en|vi`);
            const transData = await transResponse.json();
            const aiTranslation = transData.responseData.translatedText;

            this.usedWords.add(aiWord);
            this.wordsUsedThisGame++;
            document.getElementById('wordCount').textContent = this.wordsUsedThisGame;
            UIManager.displayWord(aiWord, aiTranslation);
            UIManager.addToHistory(aiWord, aiTranslation, 'AI', (word) => UIManager.showWordDefinition(word));

            // Save to vocabulary
            VocabularyManager.addWord(aiWord, aiTranslation);

            this.isPlayerTurn = true;
            this.currentWord = aiWord;
            document.getElementById('wordInput').disabled = false;
            document.getElementById('submitBtn').disabled = false;
            UIManager.showStatus(`Đến lượt bạn! Nhập từ bắt đầu bằng "${aiWord.slice(-1).toUpperCase()}"`, 'success');
            this.startTimer();

        } catch (error) {
            console.error('AI Error:', error);
            UIManager.showStatus('Lỗi AI! Đang thử lại...', 'error');
            setTimeout(() => this.aiTurn(isFirstTurn), 1000);
        }
    },

    async selectAIWord(isFirstTurn) {
        if (isFirstTurn) {
            const commonWords = ['apple', 'book', 'cat', 'dog', 'fish', 'game', 'house', 'lion', 'moon', 'rain'];
            return commonWords[Math.floor(Math.random() * commonWords.length)];
        }

        const lastLetter = this.currentWord.slice(-1);
        const response = await fetch(`https://api.datamuse.com/words?sp=${lastLetter}*&max=100`);
        const words = await response.json();

        if (!words || words.length === 0) throw new Error('No words found');

        const availableWords = words.filter(w => !this.usedWords.has(w.word.toLowerCase()));
        if (availableWords.length === 0) throw new Error('No available words');

        let filteredWords = availableWords;
        if (this.currentDifficulty === 'easy') {
            filteredWords = availableWords.filter(w => w.word.length >= 3 && w.word.length <= 5);
        } else if (this.currentDifficulty === 'medium') {
            filteredWords = availableWords.filter(w => w.word.length >= 4 && w.word.length <= 6);
        } else if (this.currentDifficulty === 'hard') {
            filteredWords = availableWords.filter(w => w.word.length >= 6);
            const hardEndingWords = filteredWords.filter(w => ['q', 'x', 'z', 'j', 'k'].includes(w.word.slice(-1)));
            if (hardEndingWords.length > 0) filteredWords = hardEndingWords;
        }

        if (filteredWords.length === 0) filteredWords = availableWords;

        return filteredWords[Math.floor(Math.random() * filteredWords.length)].word.toLowerCase();
    },

    getAIThinkingTime() {
        if (this.currentDifficulty === 'easy') return 3000;
        if (this.currentDifficulty === 'medium') return 2000;
        return 1500;
    },

    async submitWord() {
        if (!this.isPlayerTurn) {
            UIManager.showStatus('Chưa đến lượt bạn!', 'error');
            AudioManager.play('error');
            return;
        }

        this.stopTimer();
        AudioManager.play('submit');

        const input = document.getElementById('wordInput');
        const playerWord = input.value.trim().toLowerCase();

        if (!playerWord) {
            UIManager.showStatus('Vui lòng nhập từ!', 'error');
            AudioManager.play('error');
            Animations.shake('wordInput');
            this.startTimer();
            return;
        }

        if (this.currentWord && playerWord[0] !== this.currentWord.slice(-1)) {
            UIManager.showStatus(`⚠️ Từ phải bắt đầu bằng "${this.currentWord.slice(-1).toUpperCase()}"!`, 'error');
            AudioManager.play('error');
            Animations.shake('wordInput');
            input.value = '';
            input.focus();
            this.startTimer();
            return;
        }

        if (this.usedWords.has(playerWord)) {
            UIManager.showStatus('⚠️ Từ đã được sử dụng!', 'error');
            AudioManager.play('error');
            Animations.shake('wordInput');
            input.value = '';
            input.focus();
            this.startTimer();
            return;
        }

        document.getElementById('wordInput').disabled = true;
        document.getElementById('submitBtn').disabled = true;
        this.isPlayerTurn = false;

        try {
            UIManager.showStatus('Đang kiểm tra từ...', 'loading');

            const dictResponse = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${playerWord}`);

            if (!dictResponse.ok) {
                const config = window.gameModeManager.getModeConfig();

                // Only deduct attempts if mode has attempts system
                if (config.hasAttempts) {
                    this.playerAttemptsLeft--;
                    this.perfectGame = false;
                    UIManager.updateAttemptsDisplay(this.playerAttemptsLeft);
                    AudioManager.play('error');
                    Animations.shake('wordInput');

                    // Mark as difficult
                    VocabularyManager.markDifficult(playerWord);

                    if (this.playerAttemptsLeft <= 0) {
                        this.endGame(false);
                        return;
                    }

                    UIManager.showStatus(`❌ Từ không hợp lệ! Còn ${this.playerAttemptsLeft} lượt.`, 'error');
                } else {
                    // For modes without attempts, just show error and continue
                    AudioManager.play('error');
                    Animations.shake('wordInput');
                    VocabularyManager.markDifficult(playerWord);
                    UIManager.showStatus('❌ Từ không hợp lệ! Hãy thử lại!', 'error');
                }

                this.isPlayerTurn = true;
                document.getElementById('wordInput').disabled = false;
                document.getElementById('submitBtn').disabled = false;
                input.value = '';
                input.focus();
                this.startTimer();
                return;
            }

            const transResponse = await fetch(`https://api.mymemory.translated.net/get?q=${playerWord}&langpair=en|vi`);
            const transData = await transResponse.json();
            const translation = transData.responseData.translatedText;

            // Reset attempts based on mode config (only if mode has attempts system)
            const config = window.gameModeManager.getModeConfig();
            if (config.hasAttempts) {
                this.playerAttemptsLeft = config.maxAttempts;
                UIManager.updateAttemptsDisplay(this.playerAttemptsLeft);
            }

            this.stopTimer();
            AudioManager.play('success');
            Animations.pulse('currentWord');

            this.usedWords.add(playerWord);
            this.wordsUsedThisGame++;
            PlayerManager.data.totalWordsUsed++;
            document.getElementById('wordCount').textContent = this.wordsUsedThisGame;
            UIManager.displayWord(playerWord, translation);
            UIManager.addToHistory(playerWord, translation, 'Player', (word) => UIManager.showWordDefinition(word));
            input.value = '';

            // Save to vocabulary
            VocabularyManager.addWord(playerWord, translation);

            // Hide hints
            document.getElementById('hintsContainer').classList.add('hidden');

            // Check achievements
            if (playerWord.length >= 8 && !PlayerManager.achievements.long_word.unlocked) {
                PlayerManager.unlockAchievement('long_word');
            }

            if (PlayerManager.data.totalWordsUsed >= 50 && !PlayerManager.achievements.words_50.unlocked) {
                PlayerManager.unlockAchievement('words_50');
            }
            if (PlayerManager.data.totalWordsUsed >= 100 && !PlayerManager.achievements.words_100.unlocked) {
                PlayerManager.unlockAchievement('words_100');
            }
            if (PlayerManager.data.totalWordsUsed >= 200 && !PlayerManager.achievements.words_200.unlocked) {
                PlayerManager.unlockAchievement('words_200');
            }

            // XP bonus for word length
            const wordLengthXP = (playerWord.length - 3) * 5;
            if (wordLengthXP > 0) {
                PlayerManager.addXP(wordLengthXP, `Long word bonus (${playerWord.length} letters)`);
            }

            this.currentWord = playerWord;

            // Check if this mode has AI
            const config = window.gameModeManager.getModeConfig();
            if (config.hasAI) {
                UIManager.showStatus('✅ Tuyệt! Đang đợi AI...', 'success');
                this.isPlayerTurn = false;
                setTimeout(() => {
                    this.checkIfWordsAvailable(playerWord.slice(-1)).then(canAIContinue => {
                        if (!canAIContinue) {
                            this.endGame(true);
                        } else {
                            this.aiTurn(false);
                        }
                    });
                }, 1000);
            } else {
                // For non-AI modes (like multiplayer, time-attack), player continues or switches turn
                UIManager.showStatus('✅ Tuyệt! Tiếp tục...', 'success');
                this.isPlayerTurn = true;
                document.getElementById('wordInput').value = '';
                document.getElementById('wordInput').disabled = false;
                document.getElementById('submitBtn').disabled = false;
                document.getElementById('wordInput').focus();

                // Restart timer if mode has timer
                if (config.hasTimer) {
                    this.startTimer();
                }
            }

        } catch (error) {
            console.error('Error:', error);
            UIManager.showStatus('Có lỗi xảy ra!', 'error');
            this.isPlayerTurn = true;
            document.getElementById('wordInput').disabled = false;
            document.getElementById('submitBtn').disabled = false;
            this.startTimer();
        }
    },

    async checkIfWordsAvailable(letter) {
        try {
            const response = await fetch(`https://api.datamuse.com/words?sp=${letter}*&max=50`);
            const words = await response.json();
            const availableWords = words.filter(w => !this.usedWords.has(w.word.toLowerCase()));
            return availableWords.length > 0;
        } catch {
            return true;
        }
    },

    async getHint() {
        if (this.hintsRemaining <= 0) {
            UIManager.showStatus('⚠️ Đã hết lượt gợi ý!', 'error');
            AudioManager.play('error');
            return;
        }

        if (!this.isPlayerTurn || !this.currentWord) {
            UIManager.showStatus('⚠️ Chỉ có thể dùng gợi ý khi đến lượt bạn!', 'error');
            AudioManager.play('error');
            return;
        }

        AudioManager.play('hint');
        this.hintsRemaining--;
        document.getElementById('hintsLeft').textContent = this.hintsRemaining;

        if (this.hintsRemaining === 0) {
            document.getElementById('hintBtn').disabled = true;
        }

        // Deduct XP
        if (PlayerManager.data.xp >= 10) {
            PlayerManager.data.xp -= 10;
            PlayerManager.updateUI();
            PlayerManager.save();
        }

        try {
            const lastLetter = this.currentWord.slice(-1);
            const response = await fetch(`https://api.datamuse.com/words?sp=${lastLetter}*&max=50`);
            const words = await response.json();

            const availableWords = words
                .filter(w => !this.usedWords.has(w.word.toLowerCase()))
                .map(w => w.word.toLowerCase())
                .slice(0, 5);

            if (availableWords.length === 0) {
                UIManager.showStatus('💡 Không tìm thấy gợi ý phù hợp!', 'info');
                return;
            }

            const hintWordsDiv = document.getElementById('hintWords');
            hintWordsDiv.innerHTML = '';
            availableWords.slice(0, 3).forEach(word => {
                const wordSpan = document.createElement('span');
                wordSpan.className = 'bg-yellow-200 px-3 py-1 rounded-lg font-semibold cursor-pointer hover:bg-yellow-300 transition';
                wordSpan.textContent = word;
                wordSpan.onclick = () => {
                    document.getElementById('wordInput').value = word;
                    document.getElementById('wordInput').focus();
                };
                hintWordsDiv.appendChild(wordSpan);
            });

            document.getElementById('hintsContainer').classList.remove('hidden');
            Animations.fade('hintsContainer', 'in');

            setTimeout(() => {
                Animations.fade('hintsContainer', 'out');
                setTimeout(() => {
                    document.getElementById('hintsContainer').classList.add('hidden');
                }, 300);
            }, 10000);

        } catch (error) {
            console.error('Hint error:', error);
            UIManager.showStatus('❌ Lỗi khi lấy gợi ý!', 'error');
            AudioManager.play('error');
        }
    },

    endGame(playerWon) {
        this.stopTimer();
        document.getElementById('wordInput').disabled = true;
        document.getElementById('submitBtn').disabled = true;
        document.getElementById('hintBtn').disabled = true;
        document.getElementById('endBtn').disabled = true;
        this.gameInProgress = false;
        
        // Update difficulty UI to enable buttons after game ends
        this.updateDifficultyUI();

        PlayerManager.data.totalGames++;

        if (playerWon) {
            const gameTime = (Date.now() - this.gameStartTime) / 1000;

            PlayerManager.data.totalWins++;
            PlayerManager.data.winStreak++;
            if (PlayerManager.data.winStreak > PlayerManager.data.bestStreak) {
                PlayerManager.data.bestStreak = PlayerManager.data.winStreak;
            }

            AudioManager.play('victory');
            Animations.fireConfetti();

            PlayerManager.addXP(50, 'Winning the game');

            // Check achievements
            if (PlayerManager.data.totalWins === 1 && !PlayerManager.achievements.first_win.unlocked) {
                PlayerManager.unlockAchievement('first_win');
            }
            if (PlayerManager.data.winStreak >= 3 && !PlayerManager.achievements.streak_3.unlocked) {
                PlayerManager.unlockAchievement('streak_3');
            }
            if (PlayerManager.data.winStreak >= 5 && !PlayerManager.achievements.streak_5.unlocked) {
                PlayerManager.unlockAchievement('streak_5');
            }
            if (PlayerManager.data.winStreak >= 10 && !PlayerManager.achievements.streak_10.unlocked) {
                PlayerManager.unlockAchievement('streak_10');
            }
            if (gameTime < 180 && !PlayerManager.achievements.speed_win.unlocked) {
                PlayerManager.unlockAchievement('speed_win');
            }
            if (this.perfectGame && !PlayerManager.achievements.perfect_game.unlocked) {
                PlayerManager.unlockAchievement('perfect_game');
            }
            if (this.currentDifficulty === 'hard' && !PlayerManager.achievements.hard_win.unlocked) {
                PlayerManager.unlockAchievement('hard_win');
            }

            UIManager.showStatus('🎉 BẠN THẮNG! Chúc mừng!', 'success');
        } else {
            PlayerManager.data.winStreak = 0;
            AudioManager.play('defeat');
            UIManager.showStatus('❌ BẠN THUA! AI thắng!', 'error');
        }

        PlayerManager.updateUI();
        PlayerManager.save();

        setTimeout(() => {
            if (confirm(playerWon ? 'Bạn thắng! Chơi lại?' : 'Bạn thua! Thử lại?')) {
                this.restartGame();
            }
        }, 2000);
    }
};
