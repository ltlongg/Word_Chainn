// Smart Review and Spaced Repetition Module
const SmartReviewManager = {
    quizQuestions: [],
    userAnswers: {},

    checkAndShowQuiz() {
        // Check if there are at least 5 difficult words
        const difficultWords = VocabularyManager.getDifficult();

        if (difficultWords.length >= 5) {
            // Check if quiz was shown recently (don't show more than once per hour)
            const lastQuizTime = localStorage.getItem('lastQuizTime');
            const now = Date.now();

            if (!lastQuizTime || (now - parseInt(lastQuizTime)) > 3600000) { // 1 hour
                this.showQuiz();
            }
        }
    },

    async showQuiz() {
        const difficultWords = VocabularyManager.getDifficult();

        // Select 3 random difficult words
        const selectedWords = this.shuffleArray(difficultWords).slice(0, 3);

        this.quizQuestions = [];
        this.userAnswers = {};

        for (const wordData of selectedWords) {
            const definition = await VocabularyManager.fetchDefinition(wordData.word);

            if (definition && definition.meanings.length > 0) {
                // Get the first definition
                const mainDefinition = definition.meanings[0].definitions[0].definition;

                // Generate wrong answers
                const wrongAnswers = await this.generateWrongAnswers(wordData.word, difficultWords);

                this.quizQuestions.push({
                    word: wordData.word,
                    definition: mainDefinition,
                    correctAnswer: wordData.word,
                    options: this.shuffleArray([wordData.word, ...wrongAnswers])
                });
            }
        }

        if (this.quizQuestions.length > 0) {
            this.renderQuiz();
            document.getElementById('smartReviewModal').classList.remove('hidden');
        }
    },

    async generateWrongAnswers(correctWord, difficultWords) {
        // Get other difficult words as wrong options
        const wrongOptions = difficultWords
            .filter(w => w.word !== correctWord)
            .map(w => w.word);

        // Shuffle and take 3
        return this.shuffleArray(wrongOptions).slice(0, 3);
    },

    renderQuiz() {
        const quizContent = document.getElementById('quizContent');
        quizContent.innerHTML = '';

        this.quizQuestions.forEach((q, index) => {
            const questionDiv = document.createElement('div');
            questionDiv.className = 'mb-6 p-4 bg-gray-50 rounded-lg';
            questionDiv.innerHTML = `
                <div class="mb-3">
                    <div class="font-semibold text-lg text-gray-800 mb-2">Question ${index + 1}:</div>
                    <div class="text-gray-700 italic">"${q.definition}"</div>
                </div>
                <div class="space-y-2">
                    ${q.options.map((option, optIndex) => `
                        <label class="flex items-center p-3 bg-white border-2 border-gray-200 rounded-lg cursor-pointer hover:border-indigo-400 transition">
                            <input type="radio" name="q${index}" value="${option}" onchange="SmartReviewManager.selectAnswer(${index}, '${option}')" class="mr-3 w-4 h-4">
                            <span class="font-medium">${option}</span>
                        </label>
                    `).join('')}
                </div>
            `;
            quizContent.appendChild(questionDiv);
        });
    },

    selectAnswer(questionIndex, answer) {
        this.userAnswers[questionIndex] = answer;
    },

    submitQuiz() {
        let correctCount = 0;

        this.quizQuestions.forEach((q, index) => {
            if (this.userAnswers[index] === q.correctAnswer) {
                correctCount++;
            }
        });

        const score = (correctCount / this.quizQuestions.length) * 100;

        // Award XP based on performance
        const xpReward = Math.floor(score / 10) * 10; // 10 XP per 10% score
        if (xpReward > 0) {
            PlayerManager.addXP(xpReward, `Smart Review Quiz (${correctCount}/${this.quizQuestions.length})`);
        }

        // Show results
        alert(`Quiz Complete!\nScore: ${correctCount}/${this.quizQuestions.length} (${Math.round(score)}%)\nXP Earned: +${xpReward}`);

        // Mark difficult words as reviewed if score is good
        if (score >= 70) {
            this.quizQuestions.forEach(q => {
                VocabularyManager.difficult.delete(q.word);
            });
            VocabularyManager.save();
        }

        // Update last quiz time
        localStorage.setItem('lastQuizTime', Date.now().toString());

        this.closeQuiz();
        AudioManager.play('victory');
    },

    skipQuiz() {
        // Update last quiz time so it doesn't show again immediately
        localStorage.setItem('lastQuizTime', Date.now().toString());
        this.closeQuiz();
    },

    closeQuiz() {
        document.getElementById('smartReviewModal').classList.add('hidden');
    },

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
};
