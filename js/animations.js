// Animations Module
const Animations = {
    // Confetti Effect
    fireConfetti() {
        const duration = 3000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

        function randomInRange(min, max) {
            return Math.random() * (max - min) + min;
        }

        const interval = setInterval(function() {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti(Object.assign({}, defaults, {
                particleCount,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
            }));
            confetti(Object.assign({}, defaults, {
                particleCount,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
            }));
        }, 250);
    },

    // Shake Animation
    shake(elementId) {
        const element = document.getElementById(elementId);
        if (!element) return;

        element.classList.add('shake-animation');
        setTimeout(() => {
            element.classList.remove('shake-animation');
        }, 500);
    },

    // Fade Animation
    fade(elementId, type) {
        const element = document.getElementById(elementId);
        if (!element) return;

        if (type === 'in') {
            element.classList.add('fade-in');
            setTimeout(() => {
                element.classList.remove('fade-in');
            }, 300);
        } else {
            element.classList.add('fade-out');
            setTimeout(() => {
                element.classList.remove('fade-out');
            }, 300);
        }
    },

    // Pulse Animation
    pulse(elementId) {
        const element = document.getElementById(elementId);
        if (!element) return;

        element.classList.add('pulse-animation');
        setTimeout(() => {
            element.classList.remove('pulse-animation');
        }, 300);
    }
};
