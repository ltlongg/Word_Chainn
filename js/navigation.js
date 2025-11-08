// Shared Navigation Component
class NavigationManager {
    constructor() {
        this.currentPage = window.location.pathname.split('/').pop() || 'index.html';
    }

    renderNavbar(container) {
        const nav = `
            <nav class="bg-white shadow-lg sticky top-0 z-40">
                <div class="max-w-7xl mx-auto px-4">
                    <div class="flex justify-between items-center h-16">
                        <!-- Logo -->
                        <div class="flex items-center">
                            <a href="index.html" class="flex items-center space-x-2">
                                <span class="text-3xl">🔗</span>
                                <span class="text-xl font-bold text-indigo-600">Word Chain</span>
                            </a>
                        </div>

                        <!-- Main Navigation -->
                        <div class="hidden md:flex items-center space-x-1">
                            ${this.renderNavLink('index.html', '🎮', 'Chơi', 'indigo')}
                            ${this.renderNavLink('challenges.html', '🎯', 'Thử thách', 'orange')}
                            ${this.renderNavLink('statistics.html', '📊', 'Thống kê', 'cyan')}
                            ${this.renderNavLink('study.html', '📖', 'Học tập', 'pink')}
                            ${this.renderNavLink('vocabulary.html', '📚', 'Từ vựng', 'green')}
                            ${this.renderNavLink('achievements.html', '🏆', 'Thành tựu', 'yellow')}
                        </div>

                        <!-- User Menu -->
                        <div class="flex items-center space-x-3">
                            <div class="text-right hidden sm:block">
                                <div class="text-sm font-semibold text-gray-700 user-username">User</div>
                                <div class="text-xs text-gray-500">Level <span id="navLevel">1</span> | <span id="navXP">0</span> XP</div>
                            </div>
                            <button onclick="authManager.logout()" class="text-red-600 hover:text-red-700 text-sm font-semibold px-3 py-2 rounded-lg hover:bg-red-50 transition">
                                Đăng xuất
                            </button>
                        </div>

                        <!-- Mobile menu button -->
                        <div class="md:hidden">
                            <button onclick="navigationManager.toggleMobileMenu()" class="text-gray-600 hover:text-gray-900 p-2">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Mobile Menu -->
                <div id="mobileMenu" class="hidden md:hidden bg-gray-50 border-t">
                    <div class="px-2 pt-2 pb-3 space-y-1">
                        ${this.renderMobileNavLink('index.html', '🎮', 'Chơi')}
                        ${this.renderMobileNavLink('challenges.html', '🎯', 'Thử thách')}
                        ${this.renderMobileNavLink('statistics.html', '📊', 'Thống kê')}
                        ${this.renderMobileNavLink('study.html', '📖', 'Học tập')}
                        ${this.renderMobileNavLink('vocabulary.html', '📚', 'Từ vựng')}
                        ${this.renderMobileNavLink('achievements.html', '🏆', 'Thành tựu')}
                    </div>
                </div>
            </nav>
        `;

        container.innerHTML = nav;
    }

    renderNavLink(href, icon, text, color) {
        const isActive = this.currentPage === href || (this.currentPage === '' && href === 'index.html');
        const activeClass = isActive
            ? `bg-${color}-100 text-${color}-700 border-${color}-500 border-b-2`
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900';

        return `
            <a href="${href}" class="${activeClass} px-4 py-2 rounded-t-lg text-sm font-medium transition flex items-center space-x-1">
                <span>${icon}</span>
                <span>${text}</span>
            </a>
        `;
    }

    renderMobileNavLink(href, icon, text) {
        const isActive = this.currentPage === href || (this.currentPage === '' && href === 'index.html');
        const activeClass = isActive
            ? 'bg-indigo-100 text-indigo-700 border-l-4 border-indigo-500'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900';

        return `
            <a href="${href}" class="${activeClass} block px-3 py-2 rounded-md text-base font-medium flex items-center space-x-2">
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
}

// Create global instance
window.navigationManager = new NavigationManager();
