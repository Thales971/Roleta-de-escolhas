const PRESETS = {
    pessoas: ['Thales', 'Po', 'Amanda', 'Bruno', 'Carla', 'Diego', 'Letícia', 'Rafa'],
    jogos: ['Minecraft', 'Valorant', 'FIFA', 'Among Us', 'CS2', 'Roblox', 'Fortnite'],
    brincadeiras: ['Mímica', 'Desenho Rápido', 'Verdade ou Desafio', 'Stop', 'Karaokê'],
    funcoes: ['Cozinha', 'Limpeza', 'Playlist', 'Fotos', 'Organização', 'Decoração']
};

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

function applyThemeFromConfig() {
    const config = getConfig();
    document.body.className = `theme-${config.tema || 'rgb'}`;

    if (config.rgb) {
        document.documentElement.style.setProperty('--cor-base', config.rgb.corBase || '#ff0000');
        document.documentElement.style.setProperty('--saturacao', `${config.rgb.saturacao ?? 80}%`);
        document.documentElement.style.setProperty('--brilho', `${config.rgb.brilho ?? 50}%`);
    }
}

function loadPreset(tipo) {
    const preset = PRESETS[tipo];
    if (!preset) return;

    const config = getConfig();
    config.itens = [...preset];
    localStorage.setItem('configuracoesRoleta', JSON.stringify(config));

    window.location.href = 'wheel.html';
}

document.addEventListener('DOMContentLoaded', applyThemeFromConfig);
