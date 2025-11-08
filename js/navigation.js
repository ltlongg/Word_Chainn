// Shared Navigation Component for SPA
class NavigationManager {
    constructor() {
        this.currentPage = 'game';
        this.pages = {
            'game': { title: 'Chơi game', icon: '🎮', manager: null },
            'challenges': { title: 'Thử thách', icon: '🎯', manager: 'challengesManager' },
            'statistics': { title: 'Thống kê', icon: '📊', manager: 'statisticsManager' },
            'study': { title: 'Học tập', icon: '📖', manager: 'studyManager' },
            'vocabulary': { title: 'Từ vựng', icon: '📚', manager: 'vocabularyManager' },
            'achievements': { title: 'Thành tựu', icon: '🏆', manager: 'achievementsManager' }
        };
    }

    renderNavbar(container) {
        const nav = `
            <nav class="bg-gray-800 shadow-lg sticky top-0 z-40">
                <div class="max-w-7xl mx-auto px-4">
                    <div class="flex justify-between items-center h-16">
                        <!-- Logo -->
                        <div class="flex items-center">
                            <a href="#" onclick="navigationManager.navigateTo('game'); return false;" class="flex items-center space-x-2">
                                <span class="text-3xl">🔗</span>
                                <span class="text-xl font-bold text-indigo-400">Word Chain</span>
                            </a>
                        </div>

                        <!-- Main Navigation -->
                        <div class="hidden md:flex items-center space-x-1">
                            ${this.renderNavLink('game', '🎮', 'Chơi', 'indigo')}
                            ${this.renderNavLink('challenges', '🎯', 'Thử thách', 'orange')}
                            ${this.renderNavLink('statistics', '📊', 'Thống kê', 'cyan')}
                            ${this.renderNavLink('study', '📖', 'Học tập', 'pink')}
                            ${this.renderNavLink('vocabulary', '📚', 'Từ vựng', 'green')}
                            ${this.renderNavLink('achievements', '🏆', 'Thành tựu', 'yellow')}
                        </div>

                        <!-- User Menu -->
                        <div class="flex items-center space-x-3">
                            <div class="text-right hidden sm:block">
                                <div class="text-sm font-semibold text-gray-200 user-username">User</div>
                                <div class="text-xs text-gray-400">Level <span id="navLevel">1</span> | <span id="navXP">0</span> XP</div>
                            </div>
                            <button onclick="authManager.logout()" class="text-red-400 hover:text-red-300 text-sm font-semibold px-3 py-2 rounded-lg hover:bg-red-900 hover:bg-opacity-30 transition">
                                Đăng xuất
                            </button>
                        </div>

                        <!-- Mobile menu button -->
                        <div class="md:hidden">
                            <button onclick="navigationManager.toggleMobileMenu()" class="text-gray-400 hover:text-gray-200 p-2">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Mobile Menu -->
                <div id="mobileMenu" class="hidden md:hidden bg-gray-700 border-t border-gray-600">
                    <div class="px-2 pt-2 pb-3 space-y-1">
                        ${this.renderMobileNavLink('game', '🎮', 'Chơi')}
                        ${this.renderMobileNavLink('challenges', '🎯', 'Thử thách')}
                        ${this.renderMobileNavLink('statistics', '📊', 'Thống kê')}
                        ${this.renderMobileNavLink('study', '📖', 'Học tập')}
                        ${this.renderMobileNavLink('vocabulary', '📚', 'Từ vựng')}
                        ${this.renderMobileNavLink('achievements', '🏆', 'Thành tựu')}
                    </div>
                </div>
            </nav>
        `;

        container.innerHTML = nav;
    }

    renderNavLink(page, icon, text, color) {
        const isActive = this.currentPage === page;
        const activeClass = isActive
            ? `text-${color}-400 border-${color}-500 border-b-2`
            : 'text-gray-400 hover:bg-gray-700 hover:text-gray-200';

        return `
            <a href="#" onclick="navigationManager.navigateTo('${page}'); return false;"
               class="${activeClass} px-4 py-2 rounded-t-lg text-sm font-medium transition flex items-center space-x-1">
                <span>${icon}</span>
                <span>${text}</span>
            </a>
        `;
    }

    renderMobileNavLink(page, icon, text) {
        const isActive = this.currentPage === page;
        const activeClass = isActive
            ? 'bg-indigo-900 bg-opacity-50 text-indigo-400 border-l-4 border-indigo-500'
            : 'text-gray-400 hover:bg-gray-700 hover:text-gray-200';

        return `
            <a href="#" onclick="navigationManager.navigateTo('${page}'); navigationManager.toggleMobileMenu(); return false;"
               class="${activeClass} block px-3 py-2 rounded-md text-base font-medium flex items-center space-x-2">
                <span class="text-xl">${icon}</span>
                <span>${text}</span>
            </a>
        `;
    }

    toggleMobileMenu() {
        const menu = document.getElementById('mobileMenu');
        menu.classList.toggle('hidden');
    }

    updateUserInfo(user) {
        // Update user info in navbar
        document.querySelectorAll('.user-username').forEach(el => {
            el.textContent = user.username;
        });

        const levelEl = document.getElementById('navLevel');
        const xpEl = document.getElementById('navXP');

        if (levelEl) levelEl.textContent = user.level;
        if (xpEl) xpEl.textContent = user.xp;
    }

    // SPA Router - Navigate between pages without reloading
    async navigateTo(page) {
        if (!this.pages[page]) {
            console.error('Unknown page:', page);
            return;
        }

        this.currentPage = page;

        // Update page title
        document.title = `${this.pages[page].title} - Word Chain`;

        // Update navbar to show active page
        this.renderNavbar(document.getElementById('navbar'));

        // Get content container
        const contentContainer = document.getElementById('page-content');
        if (!contentContainer) {
            console.error('Content container #page-content not found');
            return;
        }

        // Show loading state
        contentContainer.innerHTML = `
            <div class="flex items-center justify-center min-h-[400px]">
                <div class="text-center">
                    <div class="text-6xl mb-4">⏳</div>
                    <div class="text-xl text-gray-400">Đang tải...</div>
                </div>
            </div>
        `;

        // Load page content
        try {
            let html = '';

            switch(page) {
                case 'game':
                    // Game page content is already in index.html
                    // Just show the game container
                    document.getElementById('gameContainer').classList.remove('hidden');
                    document.getElementById('page-content').classList.add('hidden');
                    return;

                case 'challenges':
                    html = await window.challengesManager.renderPage();
                    break;

                case 'statistics':
                    html = await window.statisticsManager.renderPage();
                    break;

                case 'study':
                    html = window.studyManager.renderPage();
                    break;

                case 'vocabulary':
                    html = await window.vocabularyManager.renderPage();
                    break;

                case 'achievements':
                    html = await window.achievementsManager.renderPage();
                    break;

                default:
                    html = '<div class="text-center py-12"><p class="text-2xl text-red-400">Trang không tồn tại</p></div>';
            }

            // Hide game container, show page content
            document.getElementById('gameContainer').classList.add('hidden');
            document.getElementById('page-content').classList.remove('hidden');

            // Render content
            contentContainer.innerHTML = html;

            // Initialize page if needed
            if (page === 'challenges' && window.challengesManager.init) {
                await window.challengesManager.init();
            }
            if (page === 'statistics' && window.statisticsManager.initPage) {
                await window.statisticsManager.initPage();
            }
            if (page === 'vocabulary' && window.vocabularyManager.initPage) {
                await window.vocabularyManager.initPage();
            }
            if (page === 'achievements' && window.achievementsManager.initPage) {
                await window.achievementsManager.initPage();
            }

        } catch (error) {
            console.error('Error loading page:', error);
            contentContainer.innerHTML = `
                <div class="text-center py-12">
                    <div class="text-6xl mb-4">❌</div>
                    <p class="text-2xl text-red-400">Lỗi khi tải trang</p>
                    <p class="text-gray-500 mt-2">${error.message}</p>
                </div>
            `;
        }
    }
}

// Create global instance
window.navigationManager = new NavigationManager();
