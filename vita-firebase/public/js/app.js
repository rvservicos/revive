// ═══════════════════════════════════════════════════════════
// VITA - Sistema com Suporte a Múltiplas Versões
// ═══════════════════════════════════════════════════════════

// Configuração do Firebase (OPCIONAL - deixe vazio para usar dados locais)
const firebaseConfig = {
    apiKey: "",  // Deixe vazio para usar dados locais
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: ""
};

// Verificar se deve usar Firebase ou dados locais
const USE_FIREBASE = firebaseConfig.apiKey !== "";
let db = null;

// Inicializar Firebase se configurado
if (USE_FIREBASE && typeof firebase !== 'undefined') {
    try {
        firebase.initializeApp(firebaseConfig);
        db = firebase.firestore();
        console.log('Firebase inicializado com sucesso');
    } catch (error) {
        console.warn('Erro ao inicializar Firebase, usando dados locais:', error);
    }
}

// ═══ Detectar Versão ═══
// A versão pode ser definida de 3 formas (em ordem de prioridade):
// 1. Via atributo data-version no script
// 2. Via variável global VITA_VERSION
// 3. Padrão: 'normal'

function detectVersion() {
    // 1. Verificar atributo data-version no script
    const scripts = document.getElementsByTagName('script');
    for (let script of scripts) {
        if (script.src.includes('app.js')) {
            const version = script.getAttribute('data-version');
            if (version) return version;
        }
    }

    // 2. Verificar variável global
    if (typeof VITA_VERSION !== 'undefined') {
        return VITA_VERSION;
    }

    // 3. Padrão
    return 'normal';
}

const CURRENT_VERSION = detectVersion();
console.log(`VITA versão: ${CURRENT_VERSION}`);

// Elementos do DOM
const loadingEl = document.getElementById('loading');
const mainContentEl = document.getElementById('main-content');

// Estado da aplicação
let appData = {
    categories: [],
    links: []
};

// ═══ Funções de Criação de Elementos ═══

function createCategorySection(category, links) {
    const section = document.createElement('section');
    section.className = 'category-section';
    section.innerHTML = `
        <div class="category-header">
            <div class="category-icon">${category.icon || '📁'}</div>
            <h2 class="category-title">${category.name}</h2>
        </div>
        <div class="button-grid" id="category-${category.id}"></div>
    `;

    const buttonGrid = section.querySelector(`#category-${category.id}`);

    // Adicionar links à categoria
    links.forEach(link => {
        const button = document.createElement('a');
        button.href = link.url;
        button.className = `action-button ${link.style || ''}`;
        button.target = '_blank';
        button.rel = 'noopener noreferrer';
        button.innerHTML = `
            <span class="button-icon">${link.icon || '🔗'}</span>
            <span class="button-text">${link.title}</span>
        `;
        buttonGrid.appendChild(button);
    });

    return section;
}

function showEmptyState() {
    mainContentEl.innerHTML = `
        <div class="category-section">
            <div class="empty-state">
                <div class="empty-state-icon">📭</div>
                <h3>Nenhum link cadastrado</h3>
                <p>Use o painel admin para adicionar seus primeiros links</p>
            </div>
        </div>
    `;
}

// ═══ Carregar Dados do Firebase ═══

async function loadDataFromFirebase() {
    try {
        // Buscar categorias da versão específica
        const categoriesSnapshot = await db.collection('categories')
            .where('version', '==', CURRENT_VERSION)
            .orderBy('order', 'asc')
            .get();

        if (categoriesSnapshot.empty) {
            // Tentar buscar categorias sem filtro de versão (compatibilidade)
            const allCategoriesSnapshot = await db.collection('categories')
                .orderBy('order', 'asc')
                .get();

            appData.categories = allCategoriesSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } else {
            appData.categories = categoriesSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        }

        // Buscar links da versão específica
        const linksSnapshot = await db.collection('links')
            .where('version', '==', CURRENT_VERSION)
            .orderBy('order', 'asc')
            .get();

        if (linksSnapshot.empty) {
            // Tentar buscar links sem filtro de versão (compatibilidade)
            const allLinksSnapshot = await db.collection('links')
                .orderBy('order', 'asc')
                .get();

            appData.links = allLinksSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } else {
            appData.links = linksSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        }

        console.log(`Dados do Firebase carregados (versão: ${CURRENT_VERSION}):`, appData);

    } catch (error) {
        console.error('Erro ao carregar dados do Firebase:', error);
        throw error;
    }
}

// ═══ Carregar Dados Locais ═══

function loadDataFromLocal() {
    try {
        if (typeof VITA_VERSIONS === 'undefined') {
            console.error('VITA_VERSIONS não encontrado');
            showEmptyState();
            return;
        }

        // Obter dados da versão específica
        const versionData = VITA_VERSIONS[CURRENT_VERSION];

        if (!versionData) {
            console.error(`Versão '${CURRENT_VERSION}' não encontrada`);
            showEmptyState();
            return;
        }

        appData.categories = versionData.categories || [];
        appData.links = versionData.links || [];

        console.log(`Dados locais carregados (versão: ${CURRENT_VERSION}):`, appData);

        if (!appData.categories || appData.categories.length === 0) {
            showEmptyState();
            return;
        }

        // Ordenar categorias
        const sortedCategories = [...appData.categories].sort((a, b) => a.order - b.order);

        // Para cada categoria, buscar seus links
        sortedCategories.forEach(category => {
            // Filtrar links da categoria
            const categoryLinks = appData.links
                .filter(link => link.categoryId === category.id)
                .sort((a, b) => a.order - b.order);

            // Criar e adicionar seção da categoria
            if (categoryLinks.length > 0) {
                const section = createCategorySection(category, categoryLinks);
                mainContentEl.appendChild(section);
            }
        });

        // Se não houver nenhum link
        if (mainContentEl.children.length === 0) {
            showEmptyState();
        }

    } catch (error) {
        console.error('Erro ao carregar dados locais:', error);
        mainContentEl.innerHTML = `
            <div class="category-section">
                <div class="empty-state">
                    <div class="empty-state-icon">⚠️</div>
                    <h3>Erro ao carregar dados</h3>
                    <p>${error.message}</p>
                </div>
            </div>
        `;
    }
}

// ═══ Carregar e Renderizar Dados do Firebase ═══

async function renderFirebaseData() {
    if (!appData.categories || appData.categories.length === 0) {
        showEmptyState();
        return;
    }

    // Ordenar categorias
    const sortedCategories = [...appData.categories].sort((a, b) => a.order - b.order);

    // Para cada categoria, buscar seus links
    sortedCategories.forEach(category => {
        // Filtrar links da categoria
        const categoryLinks = appData.links
            .filter(link => link.categoryId === category.id)
            .sort((a, b) => a.order - b.order);

        // Criar e adicionar seção da categoria
        if (categoryLinks.length > 0) {
            const section = createCategorySection(category, categoryLinks);
            mainContentEl.appendChild(section);
        }
    });

    // Se não houver nenhum link
    if (mainContentEl.children.length === 0) {
        showEmptyState();
    }
}

// ═══ Função Principal de Carregamento ═══

async function loadData() {
    try {
        if (USE_FIREBASE && db) {
            console.log(`Carregando dados do Firebase (versão: ${CURRENT_VERSION})...`);
            await loadDataFromFirebase();
            await renderFirebaseData();
        } else {
            console.log(`Carregando dados locais (versão: ${CURRENT_VERSION})...`);
            loadDataFromLocal();
        }
    } catch (error) {
        console.warn('Erro ao carregar dados do Firebase, tentando dados locais:', error);
        // Fallback para dados locais se Firebase falhar
        loadDataFromLocal();
    } finally {
        // Esconder loading e mostrar conteúdo
        loadingEl.style.display = 'none';
        mainContentEl.style.display = 'block';
    }
}

// ═══ Inicializar ═══

document.addEventListener('DOMContentLoaded', loadData);
