let itensDaRoleta = [];
let cheatAtivado = false;

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
        wheelColors: [],
        useThemePalette: true,
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

function carregarConfiguracoes() {
    const config = getConfig();
    itensDaRoleta = config.itens || [];
    cheatAtivado = config.cheatAtivado || false;

    setThemeFromConfig(config);

    const musicaToggle = document.getElementById('musica-toggle');
    const musicaSelect = document.getElementById('musica-select');
    const volumeControl = document.getElementById('volume-control');
    const cheatToggle = document.getElementById('cheat-toggle');
    const useThemePaletteToggle = document.getElementById('usar-paleta-tema');
    const corBase = document.getElementById('cor-base');
    const saturacao = document.getElementById('saturacao');
    const brilho = document.getElementById('brilho');

    if (musicaToggle) musicaToggle.checked = config.musicaAtivada ?? true;
    if (musicaSelect) musicaSelect.value = config.musica || 'wheel-fortune';
    if (volumeControl) volumeControl.value = config.volume ?? 0.7;
    if (cheatToggle) cheatToggle.checked = cheatAtivado;
    if (useThemePaletteToggle) useThemePaletteToggle.checked = config.useThemePalette ?? true;

    if (config.rgb) {
        if (corBase) corBase.value = config.rgb.corBase || '#ff0000';
        if (saturacao) saturacao.value = config.rgb.saturacao ?? 80;
        if (brilho) brilho.value = config.rgb.brilho ?? 50;
    }

    const cores = config.wheelColors || [];
    for (let i = 0; i < 6; i++) {
        const input = document.getElementById(`roleta-cor-${i + 1}`);
        if (input && cores[i]) input.value = cores[i];
    }

    atualizarStatusCheat();
}

function salvarConfiguracoes(showAlert = false) {
    const wheelColors = [];
    for (let i = 0; i < 6; i++) {
        const input = document.getElementById(`roleta-cor-${i + 1}`);
        if (input && input.value) wheelColors.push(input.value);
    }

    const config = {
        itens: itensDaRoleta,
        tema: document.body.className.replace('theme-', ''),
        musica: document.getElementById('musica-select')?.value || 'wheel-fortune',
        volume: parseFloat(document.getElementById('volume-control')?.value || '0.7'),
        musicaAtivada: document.getElementById('musica-toggle')?.checked ?? true,
        cheatAtivado: document.getElementById('cheat-toggle')?.checked ?? false,
        wheelColors,
        useThemePalette: document.getElementById('usar-paleta-tema')?.checked ?? true,
        dataSalvamento: new Date().toISOString(),
        rgb: {
            corBase: document.getElementById('cor-base')?.value || '#ff0000',
            saturacao: parseInt(document.getElementById('saturacao')?.value || '80', 10),
            brilho: parseInt(document.getElementById('brilho')?.value || '50', 10)
        }
    };

    localStorage.setItem('configuracoesRoleta', JSON.stringify(config));

    if (showAlert) {
        alert('✅ Configurações salvas com sucesso!');
    }
}

function carregarPadrao() {
    if (confirm('🔄 Deseja restaurar as configurações padrão?')) {
        localStorage.removeItem('configuracoesRoleta');
        location.reload();
    }
}

// Sistema de Itens
function adicionarItem() {
    const input = document.getElementById('novo-item');
    const valor = input.value.trim();

    if (valor) {
        itensDaRoleta.push(valor);
        input.value = '';
        atualizarListaItens();
        salvarConfiguracoes();
    }
}

function removerItem(index) {
    itensDaRoleta.splice(index, 1);
    atualizarListaItens();
    salvarConfiguracoes();
}

function limparItens() {
    if (confirm('🗑️ Deseja limpar todos os itens?')) {
        itensDaRoleta = [];
        atualizarListaItens();
        salvarConfiguracoes();
    }
}

function atualizarListaItens() {
    const lista = document.getElementById('itens-lista');
    if (!lista) return;

    lista.innerHTML = itensDaRoleta.map((item, index) => `
        <div class="item-row">
            <span>${item}</span>
            <button onclick="removerItem(${index})" class="btn-remove">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');
}

// Sistema de Temas
function mudarTema(nomeTema) {
    document.body.className = `theme-${nomeTema}`;
    salvarConfiguracoes();
}

function aplicarTemaRGB() {
    const corBase = document.getElementById('cor-base').value;
    const saturacao = document.getElementById('saturacao').value;
    const brilho = document.getElementById('brilho').value;

    document.documentElement.style.setProperty('--cor-base', corBase);
    document.documentElement.style.setProperty('--saturacao', `${saturacao}%`);
    document.documentElement.style.setProperty('--brilho', `${brilho}%`);

    salvarConfiguracoes();
    alert('🎨 Tema RGB aplicado!');
}

function aplicarCoresRoleta() {
    salvarConfiguracoes(true);
}

// Sistema de Cheat
function atualizarStatusCheat() {
    const status = document.getElementById('cheat-status');
    if (!status) return;
    status.textContent = cheatAtivado ? 'ATIVADO 🔥' : 'DESATIVADO';
}

function handleCheatToggle() {
    cheatAtivado = document.getElementById('cheat-toggle').checked;
    atualizarStatusCheat();
    salvarConfiguracoes();
}

// Tabs
function showTab(tabName, evt) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));

    document.getElementById(tabName).classList.add('active');
    if (evt?.target) evt.target.classList.add('active');
}

function bindAutoSave() {
    document.getElementById('musica-toggle')?.addEventListener('change', salvarConfiguracoes);
    document.getElementById('musica-select')?.addEventListener('change', salvarConfiguracoes);
    document.getElementById('volume-control')?.addEventListener('input', salvarConfiguracoes);
    document.getElementById('cheat-toggle')?.addEventListener('change', handleCheatToggle);
    document.getElementById('usar-paleta-tema')?.addEventListener('change', salvarConfiguracoes);
}

// Carregar ao iniciar
document.addEventListener('DOMContentLoaded', () => {
    carregarConfiguracoes();
    atualizarListaItens();
    bindAutoSave();
});
