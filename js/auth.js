// Authentication Manager
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.isAuthenticated = false;
    }

    async init() {
        // Check if user is already logged in
        const token = localStorage.getItem('authToken');

        if (token) {
            try {
                const response = await api.getMe();

                if (response.success) {
                    this.currentUser = response.data;
                    this.isAuthenticated = true;
                    this.showApp();
                    this.updateUserDisplay();
                    return true;
                }
            } catch (error) {
                console.error('Auth check failed:', error);
                api.removeToken();
            }
        }

        this.showAuthScreen();
        return false;
    }

    showAuthScreen() {
        document.getElementById('authScreen').classList.remove('hidden');
        document.getElementById('appContainer').classList.add('hidden');
        this.showLogin();
    }

    showApp() {
        document.getElementById('authScreen').classList.add('hidden');
        document.getElementById('appContainer').classList.remove('hidden');
    }

    showLogin() {
        document.getElementById('loginForm').classList.remove('hidden');
        document.getElementById('registerForm').classList.add('hidden');
        document.getElementById('loginEmail').focus();
    }

    showRegister() {
        document.getElementById('loginForm').classList.add('hidden');
        document.getElementById('registerForm').classList.remove('hidden');
        document.getElementById('registerEmail').focus();
    }

    async handleLogin(event) {
        event.preventDefault();

        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        const errorDiv = document.getElementById('loginError');
        const submitBtn = document.getElementById('loginSubmitBtn');

        if (!email || !password) {
            this.showError(errorDiv, 'Vui lòng nhập email và mật khẩu');
            return;
        }

        try {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Đang đăng nhập...';
            errorDiv.classList.add('hidden');

            const response = await api.login(email, password);

            if (response.success) {
                this.currentUser = response.data.user;
                this.isAuthenticated = true;

                // Migrate local data to server if exists
                await this.migrateLocalData();

                this.showApp();
                this.updateUserDisplay();

                // Initialize game modules
                await this.initializeGameModules();

                // Show success message
                UIManager.showStatus('Đăng nhập thành công! Chào mừng trở lại!', 'success');
            }
        } catch (error) {
            this.showError(errorDiv, error.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Đăng nhập';
        }
    }

    async handleRegister(event) {
        event.preventDefault();

        const email = document.getElementById('registerEmail').value.trim();
        const username = document.getElementById('registerUsername').value.trim();
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('registerConfirmPassword').value;
        const errorDiv = document.getElementById('registerError');
        const submitBtn = document.getElementById('registerSubmitBtn');

        // Validation
        if (!email || !username || !password || !confirmPassword) {
            this.showError(errorDiv, 'Vui lòng điền đầy đủ thông tin');
            return;
        }

        if (password !== confirmPassword) {
            this.showError(errorDiv, 'Mật khẩu xác nhận không khớp');
            return;
        }

        if (password.length < 6) {
            this.showError(errorDiv, 'Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }

        if (username.length < 3 || username.length > 20) {
            this.showError(errorDiv, 'Username phải có từ 3-20 ký tự');
            return;
        }

        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            this.showError(errorDiv, 'Username chỉ được chứa chữ cái, số và dấu gạch dưới');
            return;
        }

        try {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Đang đăng ký...';
            errorDiv.classList.add('hidden');

            // Check username availability
            const checkResponse = await api.checkUsername(username);

            if (!checkResponse.available) {
                this.showError(errorDiv, 'Username đã được sử dụng. Vui lòng chọn username khác.');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Đăng ký';
                return;
            }

            const response = await api.register(email, password, username);

            if (response.success) {
                this.currentUser = response.data.user;
                this.isAuthenticated = true;

                // Migrate local data if exists
                await this.migrateLocalData();

                this.showApp();
                this.updateUserDisplay();

                // Initialize game modules
                await this.initializeGameModules();

                // Show welcome message
                UIManager.showStatus(`Chào mừng ${username} đến với Word Chain! 🎉`, 'success');
                AnimationManager.confetti();
            }
        } catch (error) {
            this.showError(errorDiv, error.message || 'Đăng ký thất bại. Vui lòng thử lại.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Đăng ký';
        }
    }

    async migrateLocalData() {
        try {
            // Migrate vocabulary from localStorage
            const localVocab = localStorage.getItem('wordChainVocabulary');

            if (localVocab) {
                const vocabData = JSON.parse(localVocab);

                if (vocabData.words && vocabData.words.length > 0) {
                    console.log(`Migrating ${vocabData.words.length} words to server...`);

                    for (const word of vocabData.words) {
                        try {
                            await api.addWord({
                                word: word.word,
                                translation: word.translation,
                                definition: word.definition || ''
                            });
                        } catch (error) {
                            console.error(`Failed to migrate word: ${word.word}`, error);
                        }
                    }

                    console.log('Vocabulary migration complete');
                }
            }

            // Clear local storage after migration
            localStorage.removeItem('wordChainVocabulary');
            localStorage.removeItem('wordChainProgress');
        } catch (error) {
            console.error('Data migration error:', error);
        }
    }

    async initializeGameModules() {
        // Load user data into game modules
        if (this.currentUser) {
            PlayerManager.loadFromServer(this.currentUser);
        }

        // Load vocabulary from server
        try {
            const vocabResponse = await api.getAllWords({ limit: 1000 });

            if (vocabResponse.success) {
                VocabularyManager.loadFromServer(vocabResponse.data.words);
            }
        } catch (error) {
            console.error('Failed to load vocabulary:', error);
        }

        // Create daily challenge if needed
        try {
            await api.createDailyChallenge();
        } catch (error) {
            console.error('Failed to create daily challenge:', error);
        }
    }

    updateUserDisplay() {
        if (this.currentUser) {
            // Update username display
            const usernameElements = document.querySelectorAll('.user-username');
            usernameElements.forEach(el => {
                el.textContent = this.currentUser.username;
            });

            // Update level and XP
            document.getElementById('playerLevel').textContent = this.currentUser.level;
            document.getElementById('totalXP').textContent = this.currentUser.xp;
            document.getElementById('totalWins').textContent = this.currentUser.totalWins;
            document.getElementById('winStreak').textContent = this.currentUser.currentStreak;

            // Update XP bar
            const xpNeeded = this.currentUser.level * 100;
            const xpPercent = (this.currentUser.xp / xpNeeded) * 100;

            document.getElementById('xpBar').style.width = `${xpPercent}%`;
            document.getElementById('xpText').textContent = `${this.currentUser.xp} / ${xpNeeded} XP`;
        }
    }

    async logout() {
        if (confirm('Bạn có chắc muốn đăng xuất?')) {
            api.logout();
            this.currentUser = null;
            this.isAuthenticated = false;
            this.showAuthScreen();

            // Clear form fields
            document.getElementById('loginEmail').value = '';
            document.getElementById('loginPassword').value = '';
            document.getElementById('registerEmail').value = '';
            document.getElementById('registerUsername').value = '';
            document.getElementById('registerPassword').value = '';
            document.getElementById('registerConfirmPassword').value = '';
        }
    }

    showError(element, message) {
        element.textContent = message;
        element.classList.remove('hidden');

        // Auto-hide after 5 seconds
        setTimeout(() => {
            element.classList.add('hidden');
        }, 5000);
    }

    async checkUsernameAvailability() {
        const username = document.getElementById('registerUsername').value.trim();
        const feedback = document.getElementById('usernameFeedback');

        if (username.length < 3) {
            feedback.textContent = '';
            return;
        }

        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            feedback.textContent = '❌ Chỉ được dùng chữ cái, số và _';
            feedback.className = 'text-xs text-red-600 mt-1';
            return;
        }

        try {
            const response = await api.checkUsername(username);

            if (response.available) {
                feedback.textContent = '✓ Username khả dụng';
                feedback.className = 'text-xs text-green-600 mt-1';
            } else {
                feedback.textContent = '❌ Username đã được sử dụng';
                feedback.className = 'text-xs text-red-600 mt-1';
            }
        } catch (error) {
            feedback.textContent = '';
        }
    }
}

// Create global instance
window.authManager = new AuthManager();
