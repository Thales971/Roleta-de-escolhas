function mostrarConfetes() {
    const styles = getComputedStyle(document.body);
    const accent = styles.getPropertyValue('--accent').trim() || '#ffd700';
    const textPrimary = styles.getPropertyValue('--text-primary').trim() || '#ffffff';
    const palette = [accent, textPrimary, '#00ffcc', '#ff3cac', '#3a86ff', '#ffd166'];

    confetti({
        particleCount: 150,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: palette
    });

    confetti({
        particleCount: 150,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: palette
    });
}

function mostrarEmojis() {
    const emojis = ['🎉', '🎊', '✨', '⭐', '💫', '🎁', '🏆', '🎈'];
    const container = document.querySelector('.wheel-container');

    for (let i = 0; i < 20; i++) {
        setTimeout(() => {
            const emoji = document.createElement('div');
            emoji.className = 'floating-emoji';
            emoji.textContent = emojis[Math.floor(Math.random() * emojis.length)];

            const left = Math.random() * 100;
            emoji.style.left = `${left}%`;
            emoji.style.top = '100%';

            const size = 20 + Math.random() * 30;
            emoji.style.fontSize = `${size}px`;

            container.appendChild(emoji);

            setTimeout(() => {
                emoji.remove();
            }, 3000);
        }, i * 100);
    }
}

function pulsarResultado() {
    const resultText = document.getElementById('result-text');
    if (!resultText) return;
    resultText.style.animation = 'pulse 0.5s';

    setTimeout(() => {
        resultText.style.animation = '';
    }, 500);
}
