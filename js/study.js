// Study Manager
class StudyManager {
    constructor() {
        this.currentQuiz = null;
        this.currentQuestion = 0;
        this.quizAnswers = [];
        this.flashcards = [];
        this.currentCard = 0;
        this.spellingTest = null;
    }

    async showStudyMenu() {
        const modal = document.getElementById('studyMenuModal');
        modal.classList.remove('hidden');
    }

    closeStudyMenu() {
        document.getElementById('studyMenuModal').classList.add('hidden');
    }

    // ========== QUIZ MODE ==========

    async startQuiz(difficulty = 'medium') {
        try {
            const response = await api.generateQuiz(10, 'definition', difficulty);

            if (response.success) {
                this.currentQuiz = response.data.questions;
                this.currentQuestion = 0;
                this.quizAnswers = [];

                this.closeStudyMenu();
                this.showQuizQuestion();
            }
        } catch (error) {
            console.error('Failed to generate quiz:', error);
            alert('Không đủ từ vựng để tạo quiz. Hãy học thêm từ!');
        }
    }

    showQuizQuestion() {
        const modal = document.getElementById('quizModal');
        const container = document.getElementById('quizContainer');

        const question = this.currentQuiz[this.currentQuestion];
        const progress = ((this.currentQuestion + 1) / this.currentQuiz.length) * 100;

        container.innerHTML = `
            <!-- Progress Bar -->
            <div class="mb-6">
                <div class="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Câu hỏi ${this.currentQuestion + 1}/${this.currentQuiz.length}</span>
                    <span>${Math.round(progress)}%</span>
                </div>
                <div class="bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div class="bg-indigo-500 h-full rounded-full transition-all" style="width: ${progress}%"></div>
                </div>
            </div>

            <!-- Question -->
            <div class="bg-indigo-50 border-2 border-indigo-200 rounded-xl p-6 mb-6">
                <h3 class="text-xl font-bold text-indigo-900 mb-2">Từ vựng:</h3>
                <p class="text-3xl font-bold text-indigo-600">${question.word}</p>
            </div>

            <!-- Options -->
            <div class="space-y-3">
                ${question.options.map((option, index) => `
                    <button onclick="studyManager.selectQuizAnswer('${this.escapeHtml(option)}')"
                        class="w-full text-left bg-white hover:bg-indigo-50 border-2 border-gray-200 hover:border-indigo-400 rounded-lg p-4 transition">
                        <span class="font-semibold text-gray-700">${String.fromCharCode(65 + index)}.</span> ${option}
                    </button>
                `).join('')}
            </div>
        `;

        modal.classList.remove('hidden');
    }

    selectQuizAnswer(answer) {
        const question = this.currentQuiz[this.currentQuestion];

        this.quizAnswers.push({
            word: question.word,
            userAnswer: answer,
            correctAnswer: question.correctAnswer
        });

        this.currentQuestion++;

        if (this.currentQuestion < this.currentQuiz.length) {
            this.showQuizQuestion();
        } else {
            this.finishQuiz();
        }
    }

    async finishQuiz() {
        try {
            const response = await api.submitQuiz(this.quizAnswers, 0);

            if (response.success) {
                const container = document.getElementById('quizContainer');

                container.innerHTML = `
                    <div class="text-center">
                        <div class="text-8xl mb-4">${response.data.score >= 70 ? '🎉' : '📚'}</div>
                        <h2 class="text-4xl font-bold text-gray-800 mb-4">Kết quả Quiz</h2>
                        <div class="text-6xl font-bold mb-4 ${response.data.score >= 70 ? 'text-green-600' : 'text-yellow-600'}">
                            ${response.data.score}%
                        </div>
                        <p class="text-xl text-gray-600 mb-6">
                            Đúng ${response.data.correct}/${response.data.total} câu
                        </p>
                        <div class="flex gap-3 justify-center">
                            <button onclick="studyManager.closeQuiz()" class="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600">
                                Đóng
                            </button>
                            <button onclick="studyManager.startQuiz()" class="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                                Làm quiz mới
                            </button>
                        </div>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Failed to submit quiz:', error);
        }
    }

    closeQuiz() {
        document.getElementById('quizModal').classList.add('hidden');
        this.currentQuiz = null;
    }

    // ========== FLASHCARDS ==========

    async startFlashcards(filter = 'all') {
        try {
            const response = await api.getFlashcards(filter, 20);

            if (response.success) {
                this.flashcards = response.data;
                this.currentCard = 0;

                if (this.flashcards.length === 0) {
                    alert('Không có từ vựng nào để ôn tập!');
                    return;
                }

                this.closeStudyMenu();
                this.showFlashcard();
            }
        } catch (error) {
            console.error('Failed to load flashcards:', error);
        }
    }

    showFlashcard() {
        const modal = document.getElementById('flashcardModal');
        const container = document.getElementById('flashcardContainer');

        const card = this.flashcards[this.currentCard];
        const progress = ((this.currentCard + 1) / this.flashcards.length) * 100;

        container.innerHTML = `
            <!-- Progress -->
            <div class="mb-6 text-center">
                <div class="text-sm text-gray-600 mb-2">${this.currentCard + 1} / ${this.flashcards.length}</div>
                <div class="bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div class="bg-purple-500 h-full rounded-full transition-all" style="width: ${progress}%"></div>
                </div>
            </div>

            <!-- Flashcard -->
            <div class="flashcard-flip bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-8 text-white text-center min-h-[300px] flex flex-col justify-center cursor-pointer mb-6"
                onclick="this.classList.toggle('flipped')">
                <div class="flashcard-front">
                    <div class="text-5xl font-bold mb-4">${card.word}</div>
                    <div class="text-sm opacity-75">Click để xem định nghĩa</div>
                </div>
                <div class="flashcard-back hidden">
                    <div class="text-2xl mb-3">${card.definition || 'Không có định nghĩa'}</div>
                    ${card.translation ? `<div class="text-xl opacity-90 mb-3">${card.translation}</div>` : ''}
                    ${card.phonetic ? `<div class="text-sm opacity-75">${card.phonetic}</div>` : ''}
                </div>
            </div>

            <!-- Navigation -->
            <div class="flex gap-3 justify-center">
                <button ${this.currentCard === 0 ? 'disabled' : ''}
                    onclick="studyManager.previousCard()"
                    class="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">
                    ← Trước
                </button>
                <button onclick="studyManager.closeFlashcards()"
                    class="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600">
                    Kết thúc
                </button>
                <button ${this.currentCard === this.flashcards.length - 1 ? 'disabled' : ''}
                    onclick="studyManager.nextCard()"
                    class="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed">
                    Sau →
                </button>
            </div>
        `;

        modal.classList.remove('hidden');
    }

    previousCard() {
        if (this.currentCard > 0) {
            this.currentCard--;
            this.showFlashcard();
        }
    }

    nextCard() {
        if (this.currentCard < this.flashcards.length - 1) {
            this.currentCard++;
            this.showFlashcard();
        }
    }

    closeFlashcards() {
        document.getElementById('flashcardModal').classList.add('hidden');
        this.flashcards = [];
    }

    // ========== SPELLING TEST ==========

    async startSpellingTest() {
        try {
            const response = await api.generateSpellingTest(10);

            if (response.success) {
                this.spellingTest = response.data.questions;
                this.currentQuestion = 0;
                this.quizAnswers = [];

                this.closeStudyMenu();
                this.showSpellingQuestion();
            }
        } catch (error) {
            console.error('Failed to generate spelling test:', error);
            alert('Không đủ từ vựng để tạo test!');
        }
    }

    showSpellingQuestion() {
        const modal = document.getElementById('spellingModal');
        const container = document.getElementById('spellingContainer');

        const question = this.spellingTest[this.currentQuestion];
        const progress = ((this.currentQuestion + 1) / this.spellingTest.length) * 100;

        container.innerHTML = `
            <!-- Progress -->
            <div class="mb-6">
                <div class="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Câu ${this.currentQuestion + 1}/${this.spellingTest.length}</span>
                    <span>${Math.round(progress)}%</span>
                </div>
                <div class="bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div class="bg-green-500 h-full rounded-full transition-all" style="width: ${progress}%"></div>
                </div>
            </div>

            <!-- Question -->
            <div class="bg-green-50 border-2 border-green-200 rounded-xl p-6 mb-6">
                <h3 class="font-bold text-green-900 mb-2">Định nghĩa:</h3>
                <p class="text-lg text-gray-700 mb-3">${question.definition}</p>
                ${question.phonetic ? `<p class="text-sm text-gray-600">Phát âm: ${question.phonetic}</p>` : ''}
            </div>

            <!-- Input -->
            <div class="mb-6">
                <label class="block text-sm font-semibold text-gray-700 mb-2">Nhập chính tả đúng:</label>
                <input type="text" id="spellingInput"
                    class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-lg"
                    placeholder="Nhập từ..."
                    onkeypress="if(event.key==='Enter') studyManager.submitSpelling()">
            </div>

            <!-- Submit -->
            <button onclick="studyManager.submitSpelling()"
                class="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700">
                Xác nhận
            </button>
        `;

        modal.classList.remove('hidden');

        // Focus input
        setTimeout(() => document.getElementById('spellingInput')?.focus(), 100);
    }

    submitSpelling() {
        const input = document.getElementById('spellingInput');
        const answer = input.value.trim();

        if (!answer) return;

        const question = this.spellingTest[this.currentQuestion];

        this.quizAnswers.push({
            wordId: question.wordId,
            userAnswer: answer,
            correctSpelling: question.correctSpelling
        });

        this.currentQuestion++;

        if (this.currentQuestion < this.spellingTest.length) {
            this.showSpellingQuestion();
        } else {
            this.finishSpellingTest();
        }
    }

    async finishSpellingTest() {
        try {
            const response = await api.submitSpellingTest(this.quizAnswers);

            if (response.success) {
                const container = document.getElementById('spellingContainer');

                container.innerHTML = `
                    <div class="text-center">
                        <div class="text-8xl mb-4">${response.data.score >= 70 ? '🎉' : '✍️'}</div>
                        <h2 class="text-4xl font-bold text-gray-800 mb-4">Kết quả Spelling Test</h2>
                        <div class="text-6xl font-bold mb-4 ${response.data.score >= 70 ? 'text-green-600' : 'text-yellow-600'}">
                            ${response.data.score}%
                        </div>
                        <p class="text-xl text-gray-600 mb-6">
                            Đúng ${response.data.correct}/${response.data.total} từ
                        </p>

                        <!-- Results -->
                        <div class="text-left mb-6 max-h-64 overflow-y-auto">
                            ${response.data.results.map(r => `
                                <div class="mb-3 p-3 rounded-lg ${r.correct ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}">
                                    <div class="flex justify-between items-center">
                                        <div>
                                            <div class="font-semibold ${r.correct ? 'text-green-700' : 'text-red-700'}">
                                                ${r.correct ? '✓' : '✗'} ${r.correctSpelling}
                                            </div>
                                            ${!r.correct ? `<div class="text-sm text-gray-600">Bạn viết: ${r.userAnswer}</div>` : ''}
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>

                        <div class="flex gap-3 justify-center">
                            <button onclick="studyManager.closeSpelling()" class="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600">
                                Đóng
                            </button>
                            <button onclick="studyManager.startSpellingTest()" class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700">
                                Test mới
                            </button>
                        </div>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Failed to submit spelling test:', error);
        }
    }

    closeSpelling() {
        document.getElementById('spellingModal').classList.add('hidden');
        this.spellingTest = null;
    }

    // ========== STUDY PLAN ==========

    async showStudyPlan() {
        try {
            const response = await api.getStudyPlan();

            if (response.success) {
                const modal = document.getElementById('studyPlanModal');
                const container = document.getElementById('studyPlanContainer');

                const plan = response.data;

                container.innerHTML = `
                    <div class="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white mb-6">
                        <h3 class="text-2xl font-bold mb-4">📅 Kế hoạch học hôm nay</h3>
                        <div class="grid grid-cols-2 gap-4">
                            <div class="bg-white bg-opacity-20 rounded-lg p-4">
                                <div class="text-3xl font-bold">${plan.today.review.count}</div>
                                <div class="text-sm opacity-90">Từ cần ôn</div>
                            </div>
                            <div class="bg-white bg-opacity-20 rounded-lg p-4">
                                <div class="text-3xl font-bold">${plan.today.learn.recommended}</div>
                                <div class="text-sm opacity-90">Từ mới nên học</div>
                            </div>
                        </div>
                    </div>

                    <!-- Recommendations -->
                    <h4 class="font-bold text-lg text-gray-800 mb-3">💡 Gợi ý</h4>
                    <div class="space-y-3 mb-6">
                        ${plan.recommendations.map(rec => `
                            <div class="bg-${rec.priority === 'high' ? 'red' : rec.priority === 'medium' ? 'yellow' : 'blue'}-50 border border-${rec.priority === 'high' ? 'red' : rec.priority === 'medium' ? 'yellow' : 'blue'}-200 rounded-lg p-4">
                                <div class="flex items-center gap-2">
                                    <span class="text-2xl">${rec.type === 'review' ? '🔄' : rec.type === 'practice' ? '📝' : '📊'}</span>
                                    <div>
                                        <div class="font-semibold text-gray-800">${rec.message}</div>
                                        <div class="text-xs text-gray-600">Ưu tiên: ${rec.priority === 'high' ? 'Cao' : rec.priority === 'medium' ? 'Trung bình' : 'Thấp'}</div>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>

                    <!-- Actions -->
                    <div class="space-y-2">
                        <button onclick="studyManager.startFlashcards('due')" class="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700">
                            🔄 Ôn từ cần xem lại (${plan.today.review.count})
                        </button>
                        <button onclick="studyManager.startQuiz()" class="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700">
                            📝 Làm Quiz
                        </button>
                    </div>
                `;

                this.closeStudyMenu();
                modal.classList.remove('hidden');
            }
        } catch (error) {
            console.error('Failed to load study plan:', error);
        }
    }

    closeStudyPlan() {
        document.getElementById('studyPlanModal').classList.add('hidden');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ========== MULTI-PAGE RENDERING ==========

    renderStudyModes() {
        return `
            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <!-- Quiz Mode -->
                <div class="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-6 hover:shadow-lg transition cursor-pointer"
                    onclick="studyManager.startQuiz('medium')">
                    <div class="text-5xl mb-4 text-center">❓</div>
                    <h3 class="text-xl font-bold text-blue-900 mb-2 text-center">Quiz Mode</h3>
                    <p class="text-sm text-blue-700 text-center mb-4">Kiểm tra kiến thức từ vựng với các câu hỏi trắc nghiệm</p>
                    <div class="text-center">
                        <span class="inline-block bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-semibold">
                            Bắt đầu Quiz
                        </span>
                    </div>
                </div>

                <!-- Flashcards -->
                <div class="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-xl p-6 hover:shadow-lg transition cursor-pointer"
                    onclick="studyManager.startFlashcards('all')">
                    <div class="text-5xl mb-4 text-center">🃏</div>
                    <h3 class="text-xl font-bold text-green-900 mb-2 text-center">Flashcards</h3>
                    <p class="text-sm text-green-700 text-center mb-4">Ôn tập từ vựng với thẻ ghi nhớ tương tác</p>
                    <div class="text-center">
                        <span class="inline-block bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-semibold">
                            Bắt đầu Flashcards
                        </span>
                    </div>
                </div>

                <!-- Spelling Test -->
                <div class="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-xl p-6 hover:shadow-lg transition cursor-pointer"
                    onclick="studyManager.startSpellingTest()">
                    <div class="text-5xl mb-4 text-center">✍️</div>
                    <h3 class="text-xl font-bold text-purple-900 mb-2 text-center">Spelling Test</h3>
                    <p class="text-sm text-purple-700 text-center mb-4">Kiểm tra khả năng đánh vần từ vựng</p>
                    <div class="text-center">
                        <span class="inline-block bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-semibold">
                            Bắt đầu Test
                        </span>
                    </div>
                </div>

                <!-- Study Plan -->
                <div class="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200 rounded-xl p-6 hover:shadow-lg transition cursor-pointer"
                    onclick="studyManager.showStudyPlan()">
                    <div class="text-5xl mb-4 text-center">📋</div>
                    <h3 class="text-xl font-bold text-orange-900 mb-2 text-center">Study Plan</h3>
                    <p class="text-sm text-orange-700 text-center mb-4">Xem kế hoạch học tập cá nhân hóa cho bạn</p>
                    <div class="text-center">
                        <span class="inline-block bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-semibold">
                            Xem kế hoạch
                        </span>
                    </div>
                </div>

                <!-- Pronunciation Practice -->
                <div class="bg-gradient-to-br from-pink-50 to-pink-100 border-2 border-pink-200 rounded-xl p-6 hover:shadow-lg transition opacity-50">
                    <div class="text-5xl mb-4 text-center">🔊</div>
                    <h3 class="text-xl font-bold text-pink-900 mb-2 text-center">Pronunciation</h3>
                    <p class="text-sm text-pink-700 text-center mb-4">Luyện phát âm với Text-to-Speech</p>
                    <div class="text-center">
                        <span class="inline-block bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-semibold">
                            Sắp ra mắt
                        </span>
                    </div>
                </div>

                <!-- Word Association -->
                <div class="bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-200 rounded-xl p-6 hover:shadow-lg transition opacity-50">
                    <div class="text-5xl mb-4 text-center">🔗</div>
                    <h3 class="text-xl font-bold text-yellow-900 mb-2 text-center">Word Association</h3>
                    <p class="text-sm text-yellow-700 text-center mb-4">Liên kết các từ có quan hệ với nhau</p>
                    <div class="text-center">
                        <span class="inline-block bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-semibold">
                            Sắp ra mắt
                        </span>
                    </div>
                </div>
            </div>
        `;
    }
}

// Create global instance
window.studyManager = new StudyManager();
