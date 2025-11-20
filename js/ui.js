// UI Management Module
const UIManager = {
    // Show status message
    showStatus(message, type = 'info') {
        const statusDiv = document.getElementById('status');
        const statusText = document.getElementById('statusText');
        const spinner = document.getElementById('spinner');

        statusText.textContent = message;
        spinner.classList.add('hidden');

        statusDiv.className = 'mb-4 p-4 rounded-lg text-center font-medium min-h-[60px] flex items-center justify-center';

        if (type === 'error') {
            statusDiv.classList.add('bg-red-100', 'text-red-700', 'border', 'border-red-300');
        } else if (type === 'success') {
            statusDiv.classList.add('bg-green-100', 'text-green-700', 'border', 'border-green-300');
        } else if (type === 'loading') {
            statusDiv.classList.add('bg-blue-100', 'text-blue-700', 'border', 'border-blue-300');
            spinner.classList.remove('hidden');
        } else {
            statusDiv.classList.add('bg-gray-100', 'text-gray-700', 'border', 'border-gray-300');
        }
    },

    // Display current word
    displayWord(word, translation) {
        document.getElementById('currentWord').textContent = word.toUpperCase();
        document.getElementById('currentTranslation').textContent = translation;
    },

    // Add word to history
    addToHistory(word, translation, player, onClick = null, sentence = null, bonuses = [], sentenceTranslation = null) {
        const historyDiv = document.getElementById('history');
        if (document.querySelectorAll('#history > div').length === 0) {
            historyDiv.innerHTML = '';
        }

        const entry = document.createElement('div');
        entry.className = `mb-2 p-3 rounded-lg ${player === 'AI' ? 'bg-purple-100 border-l-4 border-purple-500' : 'bg-green-100 border-l-4 border-green-500'} ${onClick ? 'cursor-pointer hover:opacity-75 transition' : ''}`;

        if (onClick) {
            entry.onclick = () => onClick(word);
        }

        // Build bonuses badges
        let bonusesBadges = '';
        if (bonuses && bonuses.length > 0) {
            bonusesBadges = `<div class="mt-2 flex gap-1 flex-wrap">${bonuses.map(b =>
                `<span class="text-xs px-2 py-1 rounded-full ${b.type === 'toeic' ? 'bg-yellow-400 text-yellow-900' : b.type === 'sentence' ? 'bg-green-400 text-green-900' : 'bg-blue-400 text-blue-900'} font-semibold">${b.label}</span>`
            ).join('')}</div>`;
        }

        // Build sentence display
        let sentenceDisplay = '';
        if (sentence) {
            sentenceDisplay = `
                <div class="mt-2 bg-white bg-opacity-50 rounded p-2 border border-gray-300">
                    <div class="text-sm text-gray-800">📝 <span class="font-medium">${sentence}</span></div>
                    ${sentenceTranslation ? `<div class="text-xs text-gray-600 mt-1 italic">🇻🇳 ${sentenceTranslation}</div>` : ''}
                </div>
            `;
        }

        entry.innerHTML = `
            <div class="flex justify-between items-center">
                <span class="font-bold text-lg">${word.toUpperCase()}</span>
                <span class="text-xs text-gray-600">${player}</span>
            </div>
            <div class="text-sm text-gray-700 italic">${translation}</div>
            ${sentenceDisplay}
            ${bonusesBadges}
        `;
        historyDiv.appendChild(entry);
        historyDiv.scrollTop = historyDiv.scrollHeight;
    },

    // Update attempts display
    updateAttemptsDisplay(attemptsLeft) {
        const attemptsDiv = document.getElementById('playerAttempts');
        attemptsDiv.innerHTML = '';
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('div');
            dot.className = `w-4 h-4 rounded-full ${i < attemptsLeft ? 'bg-green-500' : 'bg-red-500'}`;
            attemptsDiv.appendChild(dot);
        }
    },

    // Update timer display
    updateTimerDisplay(timeLeft) {
        const timerDiv = document.getElementById('timer');
        timerDiv.textContent = timeLeft;

        if (timeLeft <= 5) {
            timerDiv.className = 'text-3xl font-bold text-red-600 animate-pulse';
            AudioManager.play('tick');
        } else if (timeLeft <= 10) {
            timerDiv.className = 'text-3xl font-bold text-orange-600';
        } else {
            timerDiv.className = 'text-3xl font-bold text-indigo-600';
        }
    },

    // Show word definition modal
    async showWordDefinition(word) {
        const modal = document.getElementById('wordDefinitionModal');
        const content = document.getElementById('wordDefinitionContent');

        content.innerHTML = '<div class="text-center py-8"><div class="spinner w-8 h-8 mx-auto"></div><p class="mt-2">Đang tải...</p></div>';
        modal.classList.remove('hidden');

        const definition = await VocabularyManager.fetchDefinition(word);

        if (!definition) {
            content.innerHTML = '<div class="text-center py-8 text-red-600">Không tìm thấy định nghĩa!</div>';
            return;
        }

        const isFavorite = VocabularyManager.isFavorite(word);
        const isDifficult = VocabularyManager.isDifficult(word);

        let html = `
            <div class="mb-6">
                <h3 class="text-3xl font-bold text-indigo-600 mb-2">${definition.word}</h3>
                ${definition.phonetic ? `<p class="text-lg text-gray-600 mb-2">${definition.phonetic}</p>` : ''}
                ${definition.audio ? `
                    <button onclick="new Audio('${definition.audio}').play()" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition">
                        🔊 Phát âm
                    </button>
                ` : ''}
            </div>

            <div class="mb-6">
                ${definition.meanings.map(m => `
                    <div class="mb-4">
                        <h4 class="text-lg font-semibold text-purple-600 mb-2">${m.partOfSpeech}</h4>
                        <ul class="space-y-2">
                            ${m.definitions.map(d => `
                                <li class="pl-4 border-l-2 border-gray-300">
                                    <p class="text-gray-800">${d.definition}</p>
                                    ${d.example ? `<p class="text-sm text-gray-600 italic mt-1">"${d.example}"</p>` : ''}
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                `).join('')}
            </div>

            <div class="flex gap-2">
                <button onclick="UIManager.toggleFavoriteWord('${word}')" id="favoriteBtn-${word}" class="flex-1 px-4 py-3 rounded-lg font-semibold transition ${isFavorite ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-700'}">
                    ${isFavorite ? '⭐ Đã yêu thích' : '☆ Yêu thích'}
                </button>
                ${isDifficult ? `<span class="flex items-center px-4 text-red-600 font-semibold">🔴 Từ khó</span>` : ''}
            </div>
        `;

        content.innerHTML = html;
    },

    closeWordDefinition() {
        document.getElementById('wordDefinitionModal').classList.add('hidden');
    },

    toggleFavoriteWord(word) {
        VocabularyManager.toggleFavorite(word);
        const btn = document.getElementById(`favoriteBtn-${word}`);
        const isFavorite = VocabularyManager.isFavorite(word);

        if (btn) {
            btn.className = `flex-1 px-4 py-3 rounded-lg font-semibold transition ${isFavorite ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-700'}`;
            btn.textContent = isFavorite ? '⭐ Đã yêu thích' : '☆ Yêu thích';
        }
    },

    // Show vocabulary tab
    showVocabularyTab(tab = 'all') {
        const modal = document.getElementById('vocabularyModal');
        const content = document.getElementById('vocabularyList');

        modal.classList.remove('hidden');

        let words = [];
        switch(tab) {
            case 'favorites':
                words = VocabularyManager.getFavorites();
                break;
            case 'difficult':
                words = VocabularyManager.getDifficult();
                break;
            default:
                words = VocabularyManager.getAll();
        }

        if (words.length === 0) {
            content.innerHTML = '<div class="text-center py-8 text-gray-500">Chưa có từ vựng nào!</div>';
            return;
        }

        content.innerHTML = words.map(w => `
            <div class="bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-indigo-400 transition cursor-pointer"
                 onclick="UIManager.showWordDefinition('${w.word}')">
                <div class="flex justify-between items-start mb-2">
                    <div>
                        <h4 class="text-xl font-bold text-indigo-600">${w.word}</h4>
                        <p class="text-sm text-gray-600">${w.translation || ''}</p>
                    </div>
                    <div class="flex gap-1">
                        ${VocabularyManager.isFavorite(w.word) ? '<span class="text-yellow-500">⭐</span>' : ''}
                        ${VocabularyManager.isDifficult(w.word) ? '<span class="text-red-500">🔴</span>' : ''}
                    </div>
                </div>
                <div class="flex justify-between text-xs text-gray-500">
                    <span>Đã dùng: ${w.count} lần</span>
                    <span>Lần cuối: ${new Date(w.lastUsed).toLocaleDateString('vi-VN')}</span>
                </div>
            </div>
        `).join('');
    },

    closeVocabulary() {
        document.getElementById('vocabularyModal').classList.add('hidden');
    },

    searchVocabulary() {
        const query = document.getElementById('vocabularySearch').value;
        const words = query ? VocabularyManager.search(query) : VocabularyManager.getAll();
        const content = document.getElementById('vocabularyList');

        if (words.length === 0) {
            content.innerHTML = '<div class="text-center py-8 text-gray-500">Không tìm thấy từ nào!</div>';
            return;
        }

        content.innerHTML = words.map(w => `
            <div class="bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-indigo-400 transition cursor-pointer"
                 onclick="UIManager.showWordDefinition('${w.word}')">
                <div class="flex justify-between items-start mb-2">
                    <div>
                        <h4 class="text-xl font-bold text-indigo-600">${w.word}</h4>
                        <p class="text-sm text-gray-600">${w.translation || ''}</p>
                    </div>
                    <div class="flex gap-1">
                        ${VocabularyManager.isFavorite(w.word) ? '<span class="text-yellow-500">⭐</span>' : ''}
                        ${VocabularyManager.isDifficult(w.word) ? '<span class="text-red-500">🔴</span>' : ''}
                    </div>
                </div>
                <div class="flex justify-between text-xs text-gray-500">
                    <span>Đã dùng: ${w.count} lần</span>
                    <span>Lần cuối: ${new Date(w.lastUsed).toLocaleDateString('vi-VN')}</span>
                </div>
            </div>
        `).join('');
    }
};
