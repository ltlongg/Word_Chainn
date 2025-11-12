// API Client for Word Chain Backend
class API {
    constructor() {
        this.baseURL = 'http://localhost:3000/api';
        this.token = localStorage.getItem('authToken');
    }

    // Set auth token
    setToken(token) {
        this.token = token;
        localStorage.setItem('authToken', token);
    }

    // Remove auth token
    removeToken() {
        this.token = null;
        localStorage.removeItem('authToken');
    }

    // Get auth headers
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        return headers;
    }

    // Generic fetch wrapper
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            ...options,
            headers: this.getHeaders()
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Request failed');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // ==================== AUTH ====================

    async register(email, password, username) {
        const data = await this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, password, username })
        });

        if (data.success && data.data.token) {
            this.setToken(data.data.token);
        }

        return data;
    }

    async login(email, password) {
        const data = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });

        if (data.success && data.data.token) {
            this.setToken(data.data.token);
        }

        return data;
    }

    async getMe() {
        return this.request('/auth/me');
    }

    async updateProfile(profileData) {
        return this.request('/auth/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });
    }

    async changePassword(currentPassword, newPassword) {
        return this.request('/auth/password', {
            method: 'PUT',
            body: JSON.stringify({ currentPassword, newPassword })
        });
    }

    async checkUsername(username) {
        return this.request(`/auth/check-username/${username}`);
    }

    logout() {
        this.removeToken();
    }

    // ==================== USERS ====================

    async getProfile() {
        return this.request('/users/profile');
    }

    async getLeaderboard(sortBy = 'level', limit = 100) {
        return this.request(`/users/leaderboard?sortBy=${sortBy}&limit=${limit}`);
    }

    async getAchievements() {
        return this.request('/users/achievements');
    }

    async unlockAchievement(achievementId) {
        return this.request(`/users/achievements/${achievementId}`, {
            method: 'POST'
        });
    }

    // ==================== GAMES ====================

    async createGame(mode, difficulty, theme = 'general') {
        return this.request('/games', {
            method: 'POST',
            body: JSON.stringify({ mode, difficulty, theme })
        });
    }

    async getGame(gameId) {
        return this.request(`/games/${gameId}`);
    }

    async getGameHistory(filters = {}) {
        const params = new URLSearchParams(filters).toString();
        return this.request(`/games?${params}`);
    }

    async addWordToGame(gameId, word, player, responseTime) {
        return this.request(`/games/${gameId}/word`, {
            method: 'POST',
            body: JSON.stringify({ word, player, responseTime })
        });
    }

    async endGame(gameId, status) {
        return this.request(`/games/${gameId}/end`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
    }

    async deleteGame(gameId) {
        return this.request(`/games/${gameId}`, {
            method: 'DELETE'
        });
    }

    // ==================== VOCABULARY ====================

    async getAllWords(filters = {}) {
        const params = new URLSearchParams(filters).toString();
        return this.request(`/vocabulary?${params}`);
    }

    async getWord(word) {
        return this.request(`/vocabulary/${word}`);
    }

    async addWord(wordData) {
        return this.request('/vocabulary', {
            method: 'POST',
            body: JSON.stringify(wordData)
        });
    }

    async toggleFavorite(word) {
        return this.request(`/vocabulary/${word}/favorite`, {
            method: 'PUT'
        });
    }

    async toggleDifficult(word) {
        return this.request(`/vocabulary/${word}/difficult`, {
            method: 'PUT'
        });
    }

    async getDueWords(limit = 20) {
        return this.request(`/vocabulary/review/due?limit=${limit}`);
    }

    async reviewWord(word, quality, responseTime) {
        return this.request(`/vocabulary/${word}/review`, {
            method: 'POST',
            body: JSON.stringify({ quality, responseTime })
        });
    }

    async deleteWord(word) {
        return this.request(`/vocabulary/${word}`, {
            method: 'DELETE'
        });
    }

    // ==================== CHALLENGES ====================

    async getActiveChallenges() {
        return this.request('/challenges');
    }

    async getChallenge(challengeId) {
        return this.request(`/challenges/${challengeId}`);
    }

    async getCompletedChallenges(limit = 50) {
        return this.request(`/challenges/completed?limit=${limit}`);
    }

    async getWordOfDay() {
        return this.request('/challenges/word-of-day');
    }

    async createDailyChallenge() {
        return this.request('/challenges/daily', {
            method: 'POST'
        });
    }

    async createWeeklyChallenge() {
        return this.request('/challenges/weekly', {
            method: 'POST'
        });
    }

    async createChallenge(challengeData) {
        return this.request('/challenges', {
            method: 'POST',
            body: JSON.stringify(challengeData)
        });
    }

    async updateChallengeProgress(challengeId, amount = 1) {
        return this.request(`/challenges/${challengeId}/progress`, {
            method: 'PUT',
            body: JSON.stringify({ amount })
        });
    }

    // ==================== STATISTICS ====================

    async getStatistics() {
        return this.request('/statistics');
    }

    async getDashboard() {
        return this.request('/statistics/dashboard');
    }

    async getPerformanceHistory(days = 30) {
        return this.request(`/statistics/performance?days=${days}`);
    }

    async getLetterFrequency() {
        return this.request('/statistics/letter-frequency');
    }

    async getWinRateByDifficulty() {
        return this.request('/statistics/win-rate');
    }

    async getSessionHistory(limit = 50, skip = 0) {
        return this.request(`/statistics/sessions?limit=${limit}&skip=${skip}`);
    }

    async getProgressCalendar(year, month) {
        const params = new URLSearchParams({ year, month }).toString();
        return this.request(`/statistics/calendar?${params}`);
    }

    // ==================== STUDY ====================

    async generateQuiz(count = 10, type = 'definition', difficulty) {
        return this.request('/study/quiz/generate', {
            method: 'POST',
            body: JSON.stringify({ count, type, difficulty })
        });
    }

    async submitQuiz(answers, timeSpent) {
        return this.request('/study/quiz/submit', {
            method: 'POST',
            body: JSON.stringify({ answers, timeSpent })
        });
    }

    async getFlashcards(filter, limit = 20) {
        const params = new URLSearchParams({ filter, limit }).toString();
        return this.request(`/study/flashcards?${params}`);
    }

    async generateSpellingTest(count = 10) {
        return this.request('/study/spelling/generate', {
            method: 'POST',
            body: JSON.stringify({ count })
        });
    }

    async submitSpellingTest(answers) {
        return this.request('/study/spelling/submit', {
            method: 'POST',
            body: JSON.stringify({ answers })
        });
    }

    async generateSynonymAntonymQuiz(count = 10) {
        return this.request('/study/synonym-antonym/generate', {
            method: 'POST',
            body: JSON.stringify({ count })
        });
    }

    async getStudyPlan() {
        return this.request('/study/plan');
    }
}

// Create global API instance
window.api = new API();
