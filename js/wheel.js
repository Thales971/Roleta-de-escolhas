let itensDaRoleta = [];
let isSpinning = false;
let cheatAtivado = false;
let currentRotation = 0;
let spinVelocity = 0;
let animationId = null;
let lastTickIndex = -1;
let lastResultIndex = -1;
let lastResultWasCheat = false;
let pendingRemovalIndex = -1;
let pendingRemovalValue = null;
let pendingRemovalCheat = false;
let wheelColors = [];
let currentTheme = 'rgb';
let useThemePalette = true;
let rgbHueShift = 0;
let rgbAnimationId = null;

const themePalettes = {
    rgb: ['#00f5d4', '#00bbf9', '#2d00f7', '#f72585', '#f9c74f', '#7209b7'],
    neon: ['#00ffcc', '#ff00ff', '#00c6ff', '#ff5d8f', '#7b2cbf', '#ffee32'],
    pastel: ['#ff9a9e', '#fad0c4', '#fbc2eb', '#a6c1ee', '#b5ead7', '#ffdac1'],
    dark: ['#3a86ff', '#8338ec', '#ff006e', '#00f5d4', '#ffd166', '#06d6a0'],
    colorido: ['#ff416c', '#ff4b2b', '#ffd166', '#06d6a0', '#3a86ff', '#8338ec'],
    minimalista: ['#111111', '#333333', '#555555', '#777777', '#999999', '#bbbbbb'],
    fire: ['#ff512f', '#ff7b00', '#ff9a00', '#ff4b2b', '#ffd166', '#ff006e'],
    ice: ['#a1c4fd', '#c2e9fb', '#d4fc79', '#96e6a1', '#7bc8ff', '#4facfe'],
    nature: ['#0f9b0f', '#12d8a0', '#2ecc71', '#a8e063', '#f3f9a7', '#00b09b'],
    retro: ['#f72585', '#7209b7', '#3a0ca3', '#4361ee', '#4cc9f0', '#ffd166'],
    space: ['#3a0ca3', '#7209b7', '#4895ef', '#4cc9f0', '#f72585', '#8338ec'],
    citrus: ['#f9d423', '#ff4e50', '#ff9f1c', '#ffd166', '#ffe259', '#fcbf49'],
    goth: ['#0b0f1a', '#1f1b2e', '#2a0a3d', '#9b5de5', '#f15bb5', '#00f5d4'],
    tropical: ['#06d6a0', '#1b9aaa', '#ef476f', '#ffd166', '#f72585', '#00bbf9'],
    gaming: ['#00f5d4', '#00bbf9', '#2d00f7', '#f72585', '#7b2cbf', '#ffee32']
};

// Canvas setup
const canvas = document.getElementById('wheel');
const ctx = canvas.getContext('2d');
const centerX = canvas.width / 2;
const centerY = canvas.height / 2;
const radius = canvas.width / 2 - 20; // Padding

function getConfig() {
    const saved = localStorage.getItem('configuracoesRoleta');
    if (saved) {
        return JSON.parse(saved);
    }
    return {
        itens: ['Pessoa 1', 'Pessoa 2', 'Pessoa 3', 'Pessoa 4'],
        tema: 'rgb',
        musica: 'wheel-fortune',
        volume: 0.7,
        musicaAtivada: true,
        cheatAtivado: false,
        rgb: {
            corBase: '#ff0000',
            saturacao: 80,
            brilho: 50
        }
    };
}

function setThemeFromConfig(config) {
    document.body.className = `theme-${config.tema || 'rgb'}`;
    if (config.rgb) {
        document.documentElement.style.setProperty('--cor-base', config.rgb.corBase || '#ff0000');
        document.documentElement.style.setProperty('--saturacao', `${config.rgb.saturacao ?? 80}%`);
        document.documentElement.style.setProperty('--brilho', `${config.rgb.brilho ?? 50}%`);
    }
}

// Inicializar roleta
function inicializarRoleta() {
    carregarConfiguracoes();
    drawWheel();
    atualizarContadorItens();
    document.getElementById('result-display')?.classList.add('show');
    document.getElementById('spin-btn')?.classList.add('pulse');
    iniciarAnimacaoRgb();
}

// Carregar configurações
function carregarConfiguracoes() {
    const config = getConfig();
    itensDaRoleta = config.itens && config.itens.length ? config.itens : ['Pessoa 1', 'Pessoa 2'];
    cheatAtivado = config.cheatAtivado || false;
    wheelColors = config.wheelColors || [];
    currentTheme = config.tema || 'rgb';
    useThemePalette = config.useThemePalette ?? true;

    if (cheatAtivado) {
        const temThales = itensDaRoleta.some(item => normalizarItem(item) === 'thales');
        if (!temThales) {
            itensDaRoleta.push('Thales');
        }
    }

    setThemeFromConfig(config);
    atualizarIndicadorCheat('idle');
    iniciarAnimacaoRgb();
}

// Desenhar roleta no Canvas
function drawWheel() {
    if (!itensDaRoleta.length) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.font = '30px Arial';
        ctx.fillStyle = '#666';
        ctx.textAlign = 'center';
        ctx.fillText('Sem itens', centerX, centerY);
        document.getElementById('spin-btn').disabled = true;
        document.getElementById('empty-warning')?.classList.add('show');
        return;
    }

    document.getElementById('empty-warning')?.classList.remove('show');

    const numSegments = itensDaRoleta.length;
    const anglePerSegment = (2 * Math.PI) / numSegments;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(currentRotation);

    for (let i = 0; i < numSegments; i++) {
        const startAngle = i * anglePerSegment;
        const endAngle = (i + 1) * anglePerSegment;
        
        // Desenhar segmento
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, radius, startAngle, endAngle);
        ctx.closePath();
        
        ctx.fillStyle = getCorSegmento(i, numSegments);
        ctx.fill();
        ctx.stroke();

        // Desenhar texto
        ctx.save();
        ctx.rotate(startAngle + anglePerSegment / 2);
        ctx.textAlign = 'right';
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 24px Arial';
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        ctx.fillText(itensDaRoleta[i], radius - 40, 10);
        ctx.restore();
    }
    
    ctx.restore();

    // Desenhar borda externa
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.lineWidth = 10;
    ctx.strokeStyle = '#333';
    ctx.stroke();
    
    // Desenhar centro
    ctx.beginPath();
    ctx.arc(centerX, centerY, 30, 0, 2 * Math.PI);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#333';
    ctx.stroke();
}

// Sistema de Cheat
function normalizarItem(valor) {
    return valor
        .toLowerCase()
        .replace(/[\.\s]/g, '')
        .trim();
}

function verificarCheat() {
    if (!cheatAtivado) return null;

    const indexThales = itensDaRoleta.findIndex(item => normalizarItem(item) === 'thales');
    if (indexThales !== -1) {
        return indexThales;
    }

    return null;
}

function escolherResultado() {
    const resultadoCheat = verificarCheat();

    if (resultadoCheat !== null) {
        console.log('🕵️ Cheat ativado: Resultado forçado para Thales');
        atualizarIndicadorCheat('used');
        return { resultado: itensDaRoleta[resultadoCheat], index: resultadoCheat, cheat: true };
    }

    const randomIndex = Math.floor(Math.random() * itensDaRoleta.length);
    return { resultado: itensDaRoleta[randomIndex], index: randomIndex, cheat: false };
}

// Girar roleta
function girarRoleta() {
    if (isSpinning || !itensDaRoleta.length) return;

    aplicarRemocaoPendente();

    if (!itensDaRoleta.length) {
        drawWheel();
        return;
    }

    isSpinning = true;
    const spinBtn = document.getElementById('spin-btn');
    const wheelContainer = document.querySelector('.wheel-container');
    spinBtn.disabled = true;

    atualizarIndicadorCheat('active');
    wheelContainer?.classList.add('spinning');
    wheelContainer?.classList.remove('winner');
    spinBtn.classList.remove('pulse');

    const { resultado, index, cheat } = escolherResultado();
    lastResultIndex = index;
    lastResultWasCheat = cheat;
    
    // Calcular rotação alvo
    // O ponteiro está em 270 graus (3π/2). Queremos o centro do segmento alinhado com ele.
    const numSegments = itensDaRoleta.length;
    const extraRotations = (5 + Math.random() * 5) * 2 * Math.PI;
    const baseRotation = getRotationToIndex(index, numSegments, currentRotation);
    const targetRotation = baseRotation + extraRotations;

    const duration = 5000; // 5 segundos
    const startTime = performance.now();
    const startRotation = currentRotation;
    
    tocarMusica();

    function animate(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function: cubic-bezier(0.2, 0.8, 0, 1) equivalent
        // Ease out quart
        const ease = 1 - Math.pow(1 - progress, 4);
        
        currentRotation = startRotation + (targetRotation - startRotation) * ease;
        
        drawWheel();
        checkTick();

        if (progress < 1) {
            animationId = requestAnimationFrame(animate);
        } else {
            isSpinning = false;
            spinBtn.disabled = false;
            wheelContainer?.classList.remove('spinning');
            wheelContainer?.classList.add('winner');
            spinBtn.classList.add('pulse');
            const finalIndex = getIndexAtPointer(currentRotation, itensDaRoleta.length);
            const finalResultado = itensDaRoleta[finalIndex] ?? resultado;
            mostrarResultado(finalResultado);
            mostrarConfetes();
            mostrarEmojis();
            pararMusica();
            agendarRemocaoAposGiro(finalResultado, finalIndex, cheat);
        }
    }

    animationId = requestAnimationFrame(animate);
}

function checkTick() {
    const numSegments = itensDaRoleta.length;
    const currentIndex = getIndexAtPointer(currentRotation, numSegments);
    
    if (currentIndex !== lastTickIndex) {
        if (lastTickIndex !== -1) {
            tocarTick(); // Função no audio.js
        }
        lastTickIndex = currentIndex;
    }
}

function normalizeAngle(angle) {
    let a = angle % (2 * Math.PI);
    if (a < 0) a += 2 * Math.PI;
    return a;
}

function getIndexAtPointer(rotation, total) {
    if (!total) return 0;
    const anglePerSegment = (2 * Math.PI) / total;
    const normalizedRotation = normalizeAngle(rotation);
    let pointerAngle = (3 * Math.PI / 2) - normalizedRotation;
    pointerAngle = normalizeAngle(pointerAngle);
    const epsilon = 1e-6;
    return Math.floor((pointerAngle + epsilon) / anglePerSegment) % total;
}

function getRotationToIndex(index, total, baseRotation) {
    const anglePerSegment = (2 * Math.PI) / total;
    const segmentCenter = index * anglePerSegment + anglePerSegment / 2;
    const desiredAngle = normalizeAngle((3 * Math.PI / 2) - segmentCenter);
    const currentAngle = normalizeAngle(baseRotation);
    const delta = normalizeAngle(desiredAngle - currentAngle);
    return baseRotation + delta;
}

// Mostrar resultado
function mostrarResultado(resultado) {
    const resultText = document.getElementById('result-text');
    const resultModal = document.getElementById('result-display');
    resultText.textContent = resultado;
    resultText.classList.remove('sparkle');
    void resultText.offsetWidth;
    resultText.classList.add('sparkle');
    resultModal?.classList.add('show');
    resultModal?.classList.remove('flash');
    void resultModal?.offsetWidth;
    resultModal?.classList.add('flash');
    pulsarResultado();
    salvarNoHistorico(resultado);
}

function novoGiro() {
    const resultText = document.getElementById('result-text');
    const resultModal = document.getElementById('result-display');
    const wheelContainer = document.querySelector('.wheel-container');
    resultText.textContent = 'Clique em GIRAR para começar!';
    resultText.classList.remove('sparkle');
    resultModal?.classList.add('show');
    wheelContainer?.classList.remove('winner');
    atualizarIndicadorCheat('idle');
}

function removerItemAposGiro() {
    // Mantido apenas por compatibilidade; remoção agora é aplicada no próximo giro.
    return;
}

function agendarRemocaoAposGiro(resultado, index, cheat) {
    pendingRemovalIndex = index;
    pendingRemovalValue = resultado;
    pendingRemovalCheat = cheat;
    lastResultIndex = index;
    lastResultWasCheat = cheat;
}

function aplicarRemocaoPendente() {
    if (pendingRemovalIndex < 0 || !pendingRemovalValue) return;

    // Tentar remover pelo valor para evitar descompasso se a lista mudar
    const targetNorm = normalizarItem(pendingRemovalValue);
    const idxByValue = itensDaRoleta.findIndex(item => normalizarItem(item) === targetNorm);
    const idx = idxByValue !== -1 ? idxByValue : pendingRemovalIndex;

    if (idx >= 0 && idx < itensDaRoleta.length) {
        const removido = itensDaRoleta.splice(idx, 1)[0];

        const config = getConfig();
        config.itens = itensDaRoleta;

        // Se o cheat estava ativo e removeu o Thales, desativa o cheat
        const aindaTemThales = itensDaRoleta.some(item => normalizarItem(item) === 'thales');
        if (cheatAtivado && !aindaTemThales) {
            cheatAtivado = false;
            config.cheatAtivado = false;
        }

        localStorage.setItem('configuracoesRoleta', JSON.stringify(config));

        atualizarContadorItens();
        drawWheel();
        atualizarIndicadorCheat('idle');

        if (pendingRemovalCheat && removido) {
            pendingRemovalCheat = false;
        }
    }

    pendingRemovalIndex = -1;
    pendingRemovalValue = null;
}

function atualizarIndicadorCheat(status) {
    const indicador = document.getElementById('cheat-indicator');
    if (!indicador) return;
    indicador.className = 'cheat-indicator';
    indicador.textContent = '';
    indicador.style.display = 'none';
}

function irParaConfiguracoes() {
    window.location.href = 'settings.html';
}

// Funções auxiliares
function getCorSegmento(index, total) {
    if (currentTheme === 'rgb' && useThemePalette) {
        const baseHue = (index * 360 / total + rgbHueShift) % 360;
        return `hsl(${baseHue}, 90%, 55%)`;
    }
    if (!useThemePalette && wheelColors && wheelColors.length) {
        return wheelColors[index % wheelColors.length];
    }
    const palette = themePalettes[currentTheme] || themePalettes.rgb;
    if (palette && palette.length) {
        return palette[index % palette.length];
    }
    const hue = (index * 360 / total) % 360;
    return `hsl(${hue}, 80%, 50%)`;
}

function iniciarAnimacaoRgb() {
    if (rgbAnimationId) {
        cancelAnimationFrame(rgbAnimationId);
        rgbAnimationId = null;
    }

    if (currentTheme !== 'rgb' || !useThemePalette) return;

    const animate = () => {
        if (!isSpinning && itensDaRoleta.length) {
            rgbHueShift = (rgbHueShift + 0.6) % 360;
            drawWheel();
        }
        rgbAnimationId = requestAnimationFrame(animate);
    };

    rgbAnimationId = requestAnimationFrame(animate);
}

function atualizarContadorItens() {
    document.getElementById('item-count').textContent = `${itensDaRoleta.length} itens`;
}

function salvarNoHistorico(resultado) {
    let historico = JSON.parse(localStorage.getItem('historicoRoleta') || '[]');
    historico.unshift({
        resultado: resultado,
        data: new Date().toLocaleString('pt-BR')
    });

    if (historico.length > 10) historico.pop();
    localStorage.setItem('historicoRoleta', JSON.stringify(historico));
}

// Inicializar ao carregar
document.addEventListener('DOMContentLoaded', inicializarRoleta);
