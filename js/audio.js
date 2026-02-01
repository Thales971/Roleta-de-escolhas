const musicas = {
    'wheel-fortune': {
        url: 'audio/wheel-fortune.mp3',
        nome: 'Wheel of Fortune'
    },
    'carnival': {
        url: 'audio/carnival.mp3',
        nome: 'Carnival Music'
    },
    'suspense': {
        url: 'audio/suspense.mp3',
        nome: 'Suspense'
    },
    'happy': {
        url: 'audio/happy-upbeat.mp3',
        nome: 'Happy Upbeat'
    },
    'retro': {
        url: 'audio/retro-arcade.mp3',
        nome: 'Retro Arcade'
    }
};

let audioAtual = null;
let somGiro = null;
let somParada = null;
let volume = 0.7;
let audioContext = null;

function getAudioConfig() {
    const saved = localStorage.getItem('configuracoesRoleta');
    if (saved) {
        const config = JSON.parse(saved);
        return {
            musica: config.musica || 'wheel-fortune',
            musicaAtivada: config.musicaAtivada ?? true,
            volume: parseFloat(config.volume ?? 0.7)
        };
    }
    return { musica: 'wheel-fortune', musicaAtivada: true, volume: 0.7 };
}

// Inicializar áudio
function inicializarAudio() {
    if (typeof Howler !== 'undefined') {
        Howler.autoUnlock = true;
    }

    Object.keys(musicas).forEach(key => {
        const musica = musicas[key];
        musica.sound = new Howl({
            src: [musica.url],
            loop: true,
            volume: volume
        });
    });

    somGiro = new Howl({
        src: ['audio/spin-sound.mp3'],
        volume: 0.7
    });

    somParada = new Howl({
        src: ['audio/win-sound.mp3'],
        volume: 1.0
    });

    const config = getAudioConfig();
    volume = config.volume;
    atualizarVolume(volume);
    
    // Inicializar AudioContext para o tick
    try {
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        audioContext = new AudioContext();
    } catch(e) {
        console.warn('Web Audio API não suportada');
    }
}

// Tocar música
function tocarMusica() {
    const musicaToggle = document.getElementById('musica-toggle');
    const select = document.getElementById('musica-select');
    const config = getAudioConfig();

    const musicaAtiva = musicaToggle ? musicaToggle.checked : config.musicaAtivada;
    if (!musicaAtiva) return;

    Object.values(musicas).forEach(m => {
        if (m.sound) m.sound.stop();
    });

    const musicaSelecionada = select ? select.value : config.musica;
    if (musicas[musicaSelecionada] && musicas[musicaSelecionada].sound) {
        audioAtual = musicas[musicaSelecionada].sound;
        audioAtual.play();
    }

    if (somGiro) somGiro.play();
}

// Parar música
function pararMusica() {
    if (audioAtual) {
        audioAtual.stop();
        audioAtual = null;
    }
    setTimeout(() => {
        tocarVitoria();
    }, 120);
}

// Tocar som de vitória (sintetizado + arquivo)
function tocarVitoria() {
    // Tenta tocar o arquivo se existir
    if (somParada) {
        somParada.volume(1.0); // Força volume máximo
        somParada.play();
    }

    // Som sintetizado de vitória (Ta-da!)
    if (!audioContext) return;
    if (audioContext.state === 'suspended') audioContext.resume();

    const now = audioContext.currentTime;

    // Arpeggio C Major
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    
    notes.forEach((freq, i) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        
        osc.connect(gain);
        gain.connect(audioContext.destination);
        
        osc.type = 'sine';
        osc.frequency.value = freq;
        
        const startTime = now + i * 0.1;
        
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(Math.max(volume, 0.9) * 0.6, startTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4);
        
        osc.start(startTime);
        osc.stop(startTime + 0.4);
    });
}

// Tocar som de tick (sintetizado)
function tocarTick() {
    if (!audioContext) return;
    
    // Resume context if suspended (browser policy)
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.1);

    gainNode.gain.setValueAtTime(volume * 0.3, audioContext.currentTime); // Volume reduzido para não irritar
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.1);
}

// Atualizar volume
function atualizarVolume(novoVolume) {
    volume = novoVolume;
    Object.values(musicas).forEach(m => {
        if (m.sound) m.sound.volume(volume);
    });

    if (somGiro) somGiro.volume(volume * 0.7);
    if (somParada) somParada.volume(Math.max(volume, 0.9));
}

document.addEventListener('DOMContentLoaded', inicializarAudio);
