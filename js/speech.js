// Speech Recognition Module for Speaking Mode
const SpeechManager = {
    recognition: null,
    isSupported: false,
    isListening: false,

    init() {
        // Check if browser supports Web Speech API
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (SpeechRecognition) {
            this.isSupported = true;
            this.recognition = new SpeechRecognition();
            this.recognition.lang = 'en-US';
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.maxAlternatives = 1;

            this.recognition.onstart = () => {
                this.isListening = true;
                this.updateMicButton(true);
                UIManager.showStatus('🎤 Listening... Speak now!', 'info');
            };

            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript.trim().toLowerCase();
                document.getElementById('wordInput').value = transcript;
                UIManager.showStatus(`✓ Heard: "${transcript}"`, 'success');
                AudioManager.play('success');
            };

            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                if (event.error === 'no-speech') {
                    UIManager.showStatus('⚠️ No speech detected. Try again!', 'error');
                } else if (event.error === 'not-allowed') {
                    UIManager.showStatus('⚠️ Microphone access denied!', 'error');
                } else {
                    UIManager.showStatus('⚠️ Speech recognition error!', 'error');
                }
                AudioManager.play('error');
            };

            this.recognition.onend = () => {
                this.isListening = false;
                this.updateMicButton(false);
            };
        } else {
            this.isSupported = false;
            const micBtn = document.getElementById('micBtn');
            if (micBtn) {
                micBtn.disabled = true;
                micBtn.title = 'Speech recognition not supported in this browser';
                micBtn.classList.add('opacity-50');
            }
        }
    },

    startListening() {
        if (!this.isSupported) {
            alert('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
            return;
        }

        if (!GameManager.isPlayerTurn || !GameManager.gameInProgress) {
            UIManager.showStatus('⚠️ You can only use voice input during your turn!', 'error');
            AudioManager.play('error');
            return;
        }

        if (this.isListening) {
            this.recognition.stop();
            return;
        }

        try {
            this.recognition.start();
            AudioManager.play('submit');
        } catch (error) {
            console.error('Error starting speech recognition:', error);
            UIManager.showStatus('⚠️ Could not start microphone!', 'error');
            AudioManager.play('error');
        }
    },

    updateMicButton(listening) {
        const micBtn = document.getElementById('micBtn');
        if (micBtn) {
            if (listening) {
                micBtn.className = 'px-4 py-3 bg-red-600 text-white font-semibold rounded-lg animate-pulse';
                micBtn.textContent = '🔴';
            } else {
                micBtn.className = 'px-4 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition';
                micBtn.textContent = '🎤';
            }
        }
    }
};
