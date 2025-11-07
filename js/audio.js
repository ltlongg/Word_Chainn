// Audio and Sound Effects Module
const AudioManager = {
    context: new (window.AudioContext || window.webkitAudioContext)(),
    enabled: true,

    init() {
        const saved = localStorage.getItem('soundEnabled');
        if (saved !== null) {
            this.enabled = saved === 'true';
        }
    },

    toggle() {
        this.enabled = !this.enabled;
        localStorage.setItem('soundEnabled', this.enabled);
        this.updateUI();
    },

    updateUI() {
        const btn = document.getElementById('soundToggle');
        if (btn) {
            btn.textContent = this.enabled ? '🔊' : '🔇';
            btn.className = this.enabled ?
                'bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg font-semibold shadow-lg transition' :
                'bg-gray-400 hover:bg-gray-500 text-white px-3 py-2 rounded-lg font-semibold shadow-lg transition';
        }
    },

    play(type) {
        if (!this.enabled) return;

        const oscillator = this.context.createOscillator();
        const gainNode = this.context.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(this.context.destination);

        switch(type) {
            case 'submit':
                oscillator.frequency.value = 400;
                oscillator.type = 'sine';
                gainNode.gain.setValueAtTime(0.3, this.context.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.1);
                oscillator.start();
                oscillator.stop(this.context.currentTime + 0.1);
                break;

            case 'success':
                // Success chime (C-E-G chord)
                [523.25, 659.25, 783.99].forEach((freq, i) => {
                    const osc = this.context.createOscillator();
                    const gain = this.context.createGain();
                    osc.connect(gain);
                    gain.connect(this.context.destination);
                    osc.frequency.value = freq;
                    osc.type = 'sine';
                    gain.gain.setValueAtTime(0.2, this.context.currentTime + i * 0.1);
                    gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + i * 0.1 + 0.3);
                    osc.start(this.context.currentTime + i * 0.1);
                    osc.stop(this.context.currentTime + i * 0.1 + 0.3);
                });
                break;

            case 'error':
                oscillator.frequency.value = 200;
                oscillator.type = 'sawtooth';
                gainNode.gain.setValueAtTime(0.3, this.context.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.3);
                oscillator.start();
                oscillator.stop(this.context.currentTime + 0.3);
                break;

            case 'victory':
                const melody = [523.25, 659.25, 783.99, 1046.50];
                melody.forEach((freq, i) => {
                    const osc = this.context.createOscillator();
                    const gain = this.context.createGain();
                    osc.connect(gain);
                    gain.connect(this.context.destination);
                    osc.frequency.value = freq;
                    osc.type = 'square';
                    gain.gain.setValueAtTime(0.2, this.context.currentTime + i * 0.15);
                    gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + i * 0.15 + 0.2);
                    osc.start(this.context.currentTime + i * 0.15);
                    osc.stop(this.context.currentTime + i * 0.15 + 0.2);
                });
                break;

            case 'defeat':
                [400, 300, 200].forEach((freq, i) => {
                    const osc = this.context.createOscillator();
                    const gain = this.context.createGain();
                    osc.connect(gain);
                    gain.connect(this.context.destination);
                    osc.frequency.value = freq;
                    osc.type = 'sawtooth';
                    gain.gain.setValueAtTime(0.2, this.context.currentTime + i * 0.2);
                    gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + i * 0.2 + 0.3);
                    osc.start(this.context.currentTime + i * 0.2);
                    osc.stop(this.context.currentTime + i * 0.2 + 0.3);
                });
                break;

            case 'tick':
                oscillator.frequency.value = 800;
                oscillator.type = 'sine';
                gainNode.gain.setValueAtTime(0.1, this.context.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.05);
                oscillator.start();
                oscillator.stop(this.context.currentTime + 0.05);
                break;

            case 'hint':
                oscillator.frequency.value = 600;
                oscillator.type = 'triangle';
                gainNode.gain.setValueAtTime(0.2, this.context.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.2);
                oscillator.start();
                oscillator.stop(this.context.currentTime + 0.2);
                break;
        }
    }
};
