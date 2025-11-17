/**
 * ReVive Dashboard v2 - Configuração Firebase
 *
 * INSTRUÇÕES:
 * 1. Crie um projeto no Firebase Console: https://console.firebase.google.com/
 * 2. Habilite Firestore, Storage e Authentication
 * 3. Copie as credenciais do seu projeto e cole abaixo
 * 4. Substitua os valores de exemplo pelas suas credenciais reais
 */

// ============================================
// CONFIGURAÇÃO DO FIREBASE
// ============================================

const firebaseConfig = {
    // Substitua com suas credenciais do Firebase
    apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    authDomain: "revive-dashboard.firebaseapp.com",
    projectId: "revive-dashboard",
    storageBucket: "revive-dashboard.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef123456"
};

// ============================================
// CONFIGURAÇÃO DE PLANILHAS GOOGLE SHEETS
// (Mantém compatibilidade com sistema legado)
// ============================================

const googleSheetsConfig = {
    ranking: {
        sheetId: "1YyyXkC2f3PU7_-IsO0ZgyusKVelyweZ301p63XFDrJ8",
        gid: "1686794249"
    },
    salesSC: {
        sheetId: "1fSTEyMmAEgfMnAFUTdYbJah5dr8OudsEsqjKHnHwFms",
        gid: "1536647709"
    },
    salesCE: {
        sheetId: "1fSTEyMmAEgfMnAFUTdYbJah5dr8OudsEsqjKHnHwFms",
        gid: "1480007459"
    },
    payments: {
        sheetId: "1fSTEyMmAEgfMnAFUTdYbJah5dr8OudsEsqjKHnHwFms",
        gid: "1456804198"
    },
    rtmPayments: {
        sheetId: "1KcEKtzGxSGEICRw14ctfCD4sDsQJuzl3OSwVZQcHSWE",
        gid: "485541894"
    },
    acordos: {
        sheetId: "1kwsL_Gkw-LC-n_E_nLUCzE9CuFtQDhRe",
        gid: "277487318"
    }
};

// ============================================
// CONFIGURAÇÕES PADRÃO DO SISTEMA
// ============================================

const defaultConfig = {
    // Intervalos de atualização (em segundos)
    refreshInterval: 30,        // Atualizar dados a cada 30 segundos
    carouselInterval: 35,       // Trocar página do carrossel a cada 35 segundos

    // Metas e contadores
    baseProcessCount: 20224,    // Contagem base de processos finalizados
    companyGoal: 100000,        // Meta de 100 mil processos até 2030

    // Recursos do dashboard
    autoPlayCarousel: true,     // Carrossel automático ativado
    showNotifications: true,    // Exibir notificações de vendas
    playSound: true,            // Tocar sons nas notificações

    // Cores padrão (Tema ReVive)
    theme: {
        name: "Tema ReVive",
        primary: "#8b5cf6",     // Roxo (Santa Catarina)
        secondary: "#10b981",   // Verde (Ceará)
        accent: "#ffc107"       // Amarelo (Destaques)
    },

    // Metas padrão mensais
    defaultGoals: {
        previdenciarios: 600,
        seguroTerceiro: 35,
        seguroVida: 100
    },

    // Regiões
    regions: {
        SC: {
            name: "Santa Catarina",
            color: "#8b5cf6",
            icon: "fa-map-marker-alt"
        },
        CE: {
            name: "Ceará",
            color: "#10b981",
            icon: "fa-sun"
        }
    }
};

// ============================================
// CONSULTORES CEARÁ (Lista hardcoded para compatibilidade)
// Futuramente será gerenciado via Firebase
// ============================================

const CONSULTORES_CEARA = [
    'WESLLEY',
    'LIVIA',
    'LÍVIA',
    'LUCAS',
    'VANESSA'
];

// ============================================
// TIPOS DE PROCESSOS (Mapeamento legado)
// Futuramente será gerenciado via Firebase
// ============================================

const PROCESS_TYPES = {
    previdenciarios: [
        'BPC',
        'AUXILIO DOENÇA',
        'APOSENTADORIA POR IDADE',
        'APOSENTADORIA POR INVALIDEZ',
        'PENSÃO POR MORTE',
        'SALARIO MATERNIDADE',
        'AUXÍLIO RECLUSÃO',
        'AUXÍLIO ACIDENTE'
    ],
    seguroTerceiro: [
        'DPVAT',
        'SEGURO INVALIDEZ'
    ],
    seguroVida: [
        'SEGURO DE VIDA',
        'SEGURO PRESTAMISTA'
    ]
};

// ============================================
// FUNÇÕES AUXILIARES DE CONFIGURAÇÃO
// ============================================

/**
 * Gera URL para exportar CSV do Google Sheets
 * @param {string} type - Tipo de planilha (ranking, salesSC, salesCE, etc.)
 * @returns {string} URL completa para fetch
 */
function getSheetCsvUrl(type) {
    const config = googleSheetsConfig[type];
    if (!config) {
        console.error(`Tipo de planilha inválido: ${type}`);
        return null;
    }

    const timestamp = new Date().getTime();
    return `https://docs.google.com/spreadsheets/d/${config.sheetId}/export?format=csv&gid=${config.gid}&_=${timestamp}`;
}

/**
 * Verifica se o Firebase foi configurado corretamente
 * @returns {boolean}
 */
function isFirebaseConfigured() {
    return firebaseConfig.apiKey !== "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" &&
           firebaseConfig.projectId !== "revive-dashboard";
}

/**
 * Retorna configuração mesclada (Firebase + padrão)
 * @param {Object} firebaseSettings - Configurações do Firebase
 * @returns {Object} Configuração final
 */
function getMergedConfig(firebaseSettings = {}) {
    return {
        ...defaultConfig,
        ...firebaseSettings
    };
}

// ============================================
// EXPORTAÇÃO
// ============================================

// Disponibiliza as configurações globalmente
if (typeof window !== 'undefined') {
    window.firebaseConfig = firebaseConfig;
    window.googleSheetsConfig = googleSheetsConfig;
    window.defaultConfig = defaultConfig;
    window.CONSULTORES_CEARA = CONSULTORES_CEARA;
    window.PROCESS_TYPES = PROCESS_TYPES;
    window.getSheetCsvUrl = getSheetCsvUrl;
    window.isFirebaseConfigured = isFirebaseConfigured;
    window.getMergedConfig = getMergedConfig;
}

console.log('✅ Configurações carregadas com sucesso!');
console.log('🔥 Firebase configurado:', isFirebaseConfigured() ? 'SIM' : 'NÃO - Configure suas credenciais');
