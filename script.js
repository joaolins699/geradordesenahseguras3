// ============================================================
//  CONFIGURAÇÕES
// ============================================================

const CHARACTER_SETS = {
    emoji: ['😀', '😎', '🚀', '🔒', '💎', '🔥', '🌟', '🍀', '👾', '🎨', '🦁', '🦊', '🌈', '⭐', '🎯', '🏆'],
    upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lower: 'abcdefghijklmnopqrstuvwxyz',
    number: '0123456789',
    symbol: '!@#$%^&*()_+~`|}{[]:;?><,./-='
};

// ============================================================
//  DOM REFERÊNCIAS
// ============================================================

const passwordOutput = document.getElementById('passwordOutput');
const lengthSlider = document.getElementById('lengthSlider');
const lengthDisplay = document.getElementById('lengthDisplay');
const generateBtn = document.getElementById('generateBtn');
const copyBtn = document.getElementById('copyBtn');
const progressBar = document.getElementById('progressBar');
const strengthText = document.getElementById('strengthText');
const toggleBtns = document.querySelectorAll('.toggle-btn[data-option]');
const decrementBtn = document.getElementById('decrementBtn');
const incrementBtn = document.getElementById('incrementBtn');

// ============================================================
//  ESTADO
// ============================================================

let currentLength = 12;
let options = {
    emoji: true,
    upper: true,
    lower: true,
    number: true,
    symbol: true
};

// ============================================================
//  FUNÇÕES PRINCIPAIS
// ============================================================

function getRandomChar(array) {
    if (!array || array.length === 0) return '';
    return array[Math.floor(Math.random() * array.length)];
}

function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function generatePassword() {
    // Verifica se pelo menos uma opção está ativa
    const hasAnyOption = Object.values(options).some(v => v === true);
    
    if (!hasAnyOption) {
        passwordOutput.innerHTML = '<span class="placeholder">Selecione pelo menos uma opção!</span>';
        updateStrength(0, 0);
        return;
    }

    // Constrói o pool de caracteres
    let pool = '';
    let usedTypes = [];
    let guaranteedChars = [];

    if (options.emoji) {
        pool += CHARACTER_SETS.emoji.join('');
        usedTypes.push('emoji');
        guaranteedChars.push(getRandomChar(CHARACTER_SETS.emoji));
    }
    if (options.upper) {
        pool += CHARACTER_SETS.upper;
        usedTypes.push('upper');
        guaranteedChars.push(getRandomChar(CHARACTER_SETS.upper));
    }
    if (options.lower) {
        pool += CHARACTER_SETS.lower;
        usedTypes.push('lower');
        guaranteedChars.push(getRandomChar(CHARACTER_SETS.lower));
    }
    if (options.number) {
        pool += CHARACTER_SETS.number;
        usedTypes.push('number');
        guaranteedChars.push(getRandomChar(CHARACTER_SETS.number));
    }
    if (options.symbol) {
        pool += CHARACTER_SETS.symbol;
        usedTypes.push('symbol');
        guaranteedChars.push(getRandomChar(CHARACTER_SETS.symbol));
    }

    // Se o pool estiver vazio (caso apenas emojis), usa emojis
    if (pool === '' && options.emoji) {
        let password = '';
        for (let i = 0; i < currentLength; i++) {
            password += getRandomChar(CHARACTER_SETS.emoji);
        }
        passwordOutput.innerHTML = password;
        updateStrength(password.length, 1);
        return;
    }

    // Se o pool estiver vazio (nenhuma opção selecionada)
    if (pool === '') {
        passwordOutput.innerHTML = '<span class="placeholder">Selecione pelo menos uma opção!</span>';
        updateStrength(0, 0);
        return;
    }

    const poolArray = [...pool];
    
    // Remove caracteres garantidos duplicados
    let passwordArray = [...guaranteedChars].filter(c => c !== '');

    // Preenche o resto
    while (passwordArray.length < currentLength) {
        passwordArray.push(getRandomChar(poolArray));
    }

    // Embaralha
    shuffleArray(passwordArray);

    const password = passwordArray.join('');
    passwordOutput.innerHTML = password;

    // Atualiza força
    updateStrength(password.length, usedTypes.length);
}

function updateStrength(length, typesCount) {
    if (length === 0 || typesCount === 0) {
        progressBar.style.width = '0%';
        progressBar.style.backgroundColor = '#dce4ef';
        strengthText.textContent = '—';
        strengthText.style.color = '#7a8da6';
        return;
    }

    // Pontuação: comprimento + variedade
    let score = length * 2 + typesCount * 15;

    if (typesCount >= 4) score += 10;
    if (typesCount >= 5) score += 10;
    if (length >= 20) score += 10;
    if (length >= 28) score += 10;

    if (score < 30) {
        progressBar.style.width = '30%';
        progressBar.style.backgroundColor = '#ef4444';
        strengthText.textContent = '🔴 Fraca';
        strengthText.style.color = '#ef4444';
    } else if (score >= 30 && score < 55) {
        progressBar.style.width = '60%';
        progressBar.style.backgroundColor = '#f59e0b';
        strengthText.textContent = '🟡 Média';
        strengthText.style.color = '#f59e0b';
    } else if (score >= 55 && score < 80) {
        progressBar.style.width = '85%';
        progressBar.style.backgroundColor = '#3b82f6';
        strengthText.textContent = '🔵 Forte';
        strengthText.style.color = '#3b82f6';
    } else {
        progressBar.style.width = '100%';
        progressBar.style.backgroundColor = '#10b981';
        strengthText.textContent = '🟢 Muito Forte!';
        strengthText.style.color = '#10b981';
    }
}

// ============================================================
//  COPIAR SENHA
// ============================================================

function copyPassword() {
    const text = passwordOutput.textContent;

    if (!text || text === 'Selecione pelo menos uma opção!' || text === 'Clique em "Gerar"') {
        showToast('⚠️ Gere uma senha primeiro!', '#f59e0b');
        return;
    }

    navigator.clipboard.writeText(text)
        .then(() => {
            showToast('✅ Senha copiada!', '#10b981');
        })
        .catch(() => {
            // Fallback para navegadores antigos
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.opacity = '0';
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            showToast('✅ Senha copiada!', '#10b981');
        });
}

// ============================================================
//  TOAST
// ============================================================

function showToast(message, color = '#10b981') {
    const existing = document.querySelector('.toast-message');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.textContent = message;
    toast.style.background = color;
    document.body.appendChild(toast);

    // Anima entrada
    requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(-50%) translateY(0)';
    });

    // Remove após 2.5s
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(20px)';
        setTimeout(() => toast.remove(), 400);
    }, 2500);
}

// ============================================================
//  EVENT LISTENERS
// ============================================================

// Slider de comprimento
lengthSlider.addEventListener('input', function() {
    currentLength = parseInt(this.value, 10);
    lengthDisplay.textContent = currentLength;
    generatePassword();
});

// Botões + e -
decrementBtn.addEventListener('click', function() {
    if (currentLength > 4) {
        currentLength--;
        lengthSlider.value = currentLength;
        lengthDisplay.textContent = currentLength;
        generatePassword();
    }
});

incrementBtn.addEventListener('click', function() {
    if (currentLength < 32) {
        currentLength++;
        lengthSlider.value = currentLength;
        lengthDisplay.textContent = currentLength;
        generatePassword();
    }
});

// Botões de toggle
toggleBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        const option = this.dataset.option;
        options[option] = !options[option];
        this.classList.toggle('active');
        generatePassword();
    });
});

// Botão gerar
generateBtn.addEventListener('click', generatePassword);

// Botão copiar
copyBtn.addEventListener('click', copyPassword);

// ============================================================
//  INICIALIZAÇÃO
// ============================================================

// Gera uma senha ao carregar a página
generatePassword();
