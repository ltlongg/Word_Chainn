// Main Game Logic Module
const GameManager = {
    // Game state
    usedWords: new Set(),
    currentWord: '',
    currentWordHidden: false, // For Listening Blitz mode
    currentAudioUrl: null, // Store audio URL for replay
    audioReplaysLeft: 3, // Number of replays allowed
    isPlayerTurn: false,
    playerAttemptsLeft: 3,
    timeLeft: 20,
    timerInterval: null,
    gameStartTime: null,
    currentDifficulty: 'easy',
    currentGameMode: 'classic', // classic, sentence, listening
    currentTopic: 'general',
    wordsUsedThisGame: 0,
    perfectGame: true,
    gameInProgress: false,
    hintsRemaining: 3,

    init() {
        this.loadDifficulty();
        this.loadGameMode();
        this.loadTopic();
        this.updateDifficultyUI();
        this.updateGameModeUI();
        this.updateTopicUI();
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

    loadGameMode() {
        const saved = localStorage.getItem('gameMode');
        if (saved) {
            this.currentGameMode = saved;
        }
    },

    saveGameMode() {
        localStorage.setItem('gameMode', this.currentGameMode);
    },

    loadTopic() {
        const saved = localStorage.getItem('gameTopic');
        if (saved) {
            this.currentTopic = saved;
        }
    },

    saveTopic() {
        localStorage.setItem('gameTopic', this.currentTopic);
    },

    setGameMode(mode) {
        if (this.gameInProgress) {
            UIManager.showStatus('⚠️ Cannot change mode during game!', 'error');
            AudioManager.play('error');
            return;
        }

        this.currentGameMode = mode;
        this.saveGameMode();
        this.updateGameModeUI();

        // Update input placeholder based on mode
        const input = document.getElementById('wordInput');
        if (mode === 'sentence') {
            input.placeholder = 'Enter: Word - Sentence (e.g., Apple - I eat an apple daily)';
        } else if (mode === 'listening') {
            input.placeholder = 'Listen to the word and type it...';
        } else {
            input.placeholder = 'Nhập từ tiếng Anh...';
        }

        const modeNames = {
            classic: 'Classic',
            sentence: 'Sentence Master',
            listening: 'Listening Blitz'
        };
        UIManager.showStatus(`✓ Mode: ${modeNames[mode]}`, 'success');
        AudioManager.play('submit');
    },

    updateGameModeUI() {
        ['classic', 'sentence', 'listening'].forEach(mode => {
            const btn = document.getElementById('mode' + mode.charAt(0).toUpperCase() + mode.slice(1));
            if (btn) {
                if (mode === this.currentGameMode) {
                    const colors = {
                        classic: 'bg-green-500',
                        sentence: 'bg-blue-500',
                        listening: 'bg-purple-500'
                    };
                    btn.className = `px-6 py-2 rounded-lg font-semibold transition shadow-lg text-white ${colors[mode]}`;
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

    setTopic(topic) {
        if (this.gameInProgress) {
            UIManager.showStatus('⚠️ Cannot change topic during game!', 'error');
            AudioManager.play('error');
            return;
        }

        this.currentTopic = topic;
        this.saveTopic();

        const topicNames = {
            general: 'General',
            business: 'Business',
            travel: 'Travel'
        };
        UIManager.showStatus(`✓ Topic: ${topicNames[topic]}`, 'success');
        AudioManager.play('submit');
    },

    updateTopicUI() {
        const selector = document.getElementById('topicSelector');
        if (selector) {
            selector.value = this.currentTopic;
            selector.disabled = this.gameInProgress;
        }
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
        this.currentWordHidden = false;
        this.currentAudioUrl = null;
        this.audioReplaysLeft = 3;
        this.isPlayerTurn = false;
        this.playerAttemptsLeft = 3;
        this.timeLeft = 20;
        this.wordsUsedThisGame = 0;
        this.perfectGame = true;
        this.gameStartTime = Date.now();
        this.gameInProgress = true;
        this.hintsRemaining = 3;

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
        document.getElementById('listeningControls').classList.add('hidden');
        document.getElementById('replaysLeft').textContent = '3';
        UIManager.updateAttemptsDisplay(3);
        UIManager.updateTimerDisplay(20);
        AudioManager.play('submit');

        // Update UI to disable mode/difficulty/topic selection during game
        this.updateDifficultyUI();
        this.updateGameModeUI();
        this.updateTopicUI();

        const playerStarts = Math.random() < 0.5;

        if (playerStarts) {
            this.isPlayerTurn = true;
            UIManager.showStatus('Bạn chơi trước! Nhập từ tiếng Anh bất kỳ.', 'success');
            this.startTimer();
        } else {
            this.isPlayerTurn = false;
            UIManager.showStatus('AI chơi trước!', 'info');
            await this.aiTurn(true);
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

        // Update UI to enable buttons after game ends
        this.updateDifficultyUI();
        this.updateGameModeUI();
        this.updateTopicUI();

        // Count as a loss (no streak break, no stats change)
        UIManager.showStatus('🛑 Ván đấu đã kết thúc. Nhấn "Start Game" để chơi lại!', 'error');
        AudioManager.play('defeat');
    },

    startTimer() {
        this.stopTimer();
        this.timeLeft = 20;
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
        document.getElementById('wordInput').value = '';
        document.getElementById('wordInput').focus();
        this.startTimer();
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

            // Handle Listening Blitz Mode
            if (this.currentGameMode === 'listening') {
                this.currentWordHidden = true;
                this.audioReplaysLeft = 3;
                document.getElementById('replaysLeft').textContent = '3';

                // Display word as stars
                const hiddenWord = '*'.repeat(aiWord.length);
                document.getElementById('currentWord').textContent = hiddenWord;
                document.getElementById('currentTranslation').textContent = '??? (Listen carefully!)';

                // Try to get and play pronunciation
                let audioPlayed = false;

                try {
                    const dictResponse = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${aiWord}`);
                    if (dictResponse.ok) {
                        const dictData = await dictResponse.json();
                        const phonetics = dictData[0]?.phonetics || [];

                        // Try to find audio URL (prefer US pronunciation)
                        let audioUrl = phonetics.find(p => p.audio && p.audio.includes('-us.mp3'))?.audio;
                        if (!audioUrl) {
                            audioUrl = phonetics.find(p => p.audio)?.audio;
                        }

                        if (audioUrl) {
                            this.currentAudioUrl = audioUrl;
                            const audio = new Audio(audioUrl);
                            await audio.play();
                            audioPlayed = true;
                            console.log('Playing audio from Dictionary API:', audioUrl);
                        }
                    }
                } catch (error) {
                    console.log('Dictionary API audio failed:', error);
                }

                // Fallback: Use Web Speech API (Text-to-Speech)
                if (!audioPlayed) {
                    console.log('Using Text-to-Speech fallback');
                    this.currentAudioUrl = null; // No URL for TTS
                    this.speakWord(aiWord);
                }

                // Show listening controls and enable reveal button
                document.getElementById('listeningControls').classList.remove('hidden');
                document.getElementById('replayAudioBtn').disabled = false;
                document.getElementById('revealWordBtn').disabled = false;
                UIManager.addToHistory(hiddenWord, '??? (Hidden)', 'AI', null);
            } else {
                UIManager.displayWord(aiWord, aiTranslation);
                UIManager.addToHistory(aiWord, aiTranslation, 'AI', (word) => UIManager.showWordDefinition(word));
            }

            // Save to vocabulary
            VocabularyManager.addWord(aiWord, aiTranslation);

            this.isPlayerTurn = true;
            this.currentWord = aiWord;
            document.getElementById('wordInput').disabled = false;
            document.getElementById('submitBtn').disabled = false;

            if (this.currentGameMode === 'listening') {
                UIManager.showStatus(`🎧 Listening Mode: Type the word you heard!`, 'success');
            } else {
                UIManager.showStatus(`Đến lượt bạn! Nhập từ bắt đầu bằng "${aiWord.slice(-1).toUpperCase()}"`, 'success');
            }
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
        let rawInput = input.value.trim();

        if (!rawInput) {
            UIManager.showStatus('Vui lòng nhập từ!', 'error');
            AudioManager.play('error');
            Animations.shake('wordInput');
            this.startTimer();
            return;
        }

        // Parse input based on game mode
        let playerWord = '';
        let sentence = null;

        if (this.currentGameMode === 'sentence') {
            // Expected format: "Word - Sentence"
            if (!rawInput.includes(' - ')) {
                UIManager.showStatus('⚠️ Sentence Mode: Use format "Word - Sentence"', 'error');
                AudioManager.play('error');
                Animations.shake('wordInput');
                this.startTimer();
                return;
            }

            const parts = rawInput.split(' - ');
            playerWord = parts[0].trim().toLowerCase();
            sentence = parts.slice(1).join(' - ').trim();

            // Validate sentence
            if (sentence.split(' ').length < 3) {
                UIManager.showStatus('⚠️ Sentence must have at least 3 words!', 'error');
                AudioManager.play('error');
                Animations.shake('wordInput');
                this.startTimer();
                return;
            }

            // Check if sentence contains the word
            if (!sentence.toLowerCase().includes(playerWord)) {
                UIManager.showStatus('⚠️ Sentence must contain the word!', 'error');
                AudioManager.play('error');
                Animations.shake('wordInput');
                this.startTimer();
                return;
            }
        } else {
            playerWord = rawInput.toLowerCase();
        }

        // Listening Blitz Mode: Check if word matches the hidden word
        if (this.currentGameMode === 'listening' && this.currentWordHidden) {
            // Player must guess the exact word AI played
            // No need to check first letter matching
        } else if (this.currentWord && playerWord[0] !== this.currentWord.slice(-1)) {
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

            this.playerAttemptsLeft = 3;
            UIManager.updateAttemptsDisplay(this.playerAttemptsLeft);
            this.stopTimer();
            AudioManager.play('success');
            Animations.pulse('currentWord');

            this.usedWords.add(playerWord);
            this.wordsUsedThisGame++;
            PlayerManager.data.totalWordsUsed++;
            document.getElementById('wordCount').textContent = this.wordsUsedThisGame;

            // Reveal word in Listening Blitz mode
            if (this.currentGameMode === 'listening' && this.currentWordHidden) {
                UIManager.displayWord(this.currentWord, translation);
                this.currentWordHidden = false;
            } else {
                UIManager.displayWord(playerWord, translation);
            }

            // Check for bonuses
            const bonuses = [];
            let bonusXP = 0;

            // TOEIC Vocabulary Bonus
            if (VocabularyManager.isTOEICWord(playerWord)) {
                bonuses.push({ type: 'toeic', label: '🌟 TOEIC Word' });
                bonusXP += 20; // Double base XP (10 -> 20)
                AudioManager.play('toeic_bonus');
                setTimeout(() => {
                    Animations.fireConfetti();
                }, 200);
            }

            // Topic Specialist Bonus
            if (VocabularyManager.matchesTopic(playerWord, this.currentTopic)) {
                bonuses.push({ type: 'topic', label: `📚 ${this.currentTopic.charAt(0).toUpperCase() + this.currentTopic.slice(1)} Context` });
                bonusXP += 15;
            }

            // Sentence Mode Bonus
            if (this.currentGameMode === 'sentence') {
                bonuses.push({ type: 'sentence', label: '✍️ Sentence Bonus' });
                bonusXP += 10;
            }

            // Award bonuses
            if (bonusXP > 0) {
                PlayerManager.addXP(bonusXP, bonuses.map(b => b.label).join(' + '));
            }

            // Add to history with sentence and bonuses
            UIManager.addToHistory(playerWord, translation, 'Player', (word) => UIManager.showWordDefinition(word), sentence, bonuses);
            input.value = '';

            // Save to vocabulary
            VocabularyManager.addWord(playerWord, translation);

            // Hide hints and listening controls
            document.getElementById('hintsContainer').classList.add('hidden');
            document.getElementById('listeningControls').classList.add('hidden');

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

            UIManager.showStatus('✅ Tuyệt! Đang đợi AI...', 'success');

            this.currentWord = playerWord;
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

        // Update UI to enable buttons after game ends
        this.updateDifficultyUI();
        this.updateGameModeUI();
        this.updateTopicUI();

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
    },

    // Text-to-Speech for Listening Mode
    speakWord(word) {
        if ('speechSynthesis' in window) {
            // Cancel any ongoing speech
            window.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(word);
            utterance.lang = 'en-US';
            utterance.rate = 0.8; // Slower for clarity
            utterance.pitch = 1;
            utterance.volume = 1;

            window.speechSynthesis.speak(utterance);
        } else {
            console.error('Text-to-Speech not supported');
            UIManager.showStatus('⚠️ Browser does not support audio playback!', 'error');
        }
    },

    // Replay audio in Listening Mode
    replayAudio() {
        if (this.audioReplaysLeft <= 0) {
            UIManager.showStatus('⚠️ Đã hết lượt nghe lại!', 'error');
            AudioManager.play('error');
            return;
        }

        this.audioReplaysLeft--;
        document.getElementById('replaysLeft').textContent = this.audioReplaysLeft;

        if (this.audioReplaysLeft === 0) {
            document.getElementById('replayAudioBtn').disabled = true;
        }

        // Play audio
        if (this.currentAudioUrl) {
            // Play from URL
            const audio = new Audio(this.currentAudioUrl);
            audio.play().catch(err => {
                console.error('Audio replay failed:', err);
                // Fallback to TTS
                this.speakWord(this.currentWord);
            });
        } else {
            // Use Text-to-Speech
            this.speakWord(this.currentWord);
        }

        AudioManager.play('hint');
    },

    // Reveal hidden word in Listening Mode
    revealHiddenWord() {
        if (!this.currentWordHidden) {
            return;
        }

        // Deduct XP
        if (PlayerManager.data.xp >= 5) {
            PlayerManager.data.xp -= 5;
            PlayerManager.updateUI();
            PlayerManager.save();
        }

        // Reveal the word
        this.currentWordHidden = false;
        document.getElementById('currentWord').textContent = this.currentWord.toUpperCase();

        // Get translation
        fetch(`https://api.mymemory.translated.net/get?q=${this.currentWord}&langpair=en|vi`)
            .then(response => response.json())
            .then(data => {
                const translation = data.responseData.translatedText;
                document.getElementById('currentTranslation').textContent = translation;
            })
            .catch(err => {
                console.error('Translation failed:', err);
                document.getElementById('currentTranslation').textContent = 'Translation unavailable';
            });

        UIManager.showStatus('👁️ Từ đã được hiển thị (-5 XP)', 'info');
        AudioManager.play('hint');

        // Disable reveal button
        document.getElementById('revealWordBtn').disabled = true;
    }
};
