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

// Elementos do DOM
const loadingEl = document.getElementById('loading');
const categoriesViewEl = document.getElementById('categoriesView');
const linksViewEl = document.getElementById('linksView');
const categoriesGridEl = document.getElementById('categoriesGrid');
const linksGridEl = document.getElementById('linksGrid');
const breadcrumbEl = document.getElementById('breadcrumb');
const backBtnEl = document.getElementById('backBtn');
const currentCategoryEl = document.getElementById('currentCategory');
const linksHeaderIconEl = document.getElementById('linksHeaderIcon');
const linksTitleEl = document.getElementById('linksTitle');

// Estado da aplicação
let appData = {
    categories: [],
    links: []
};

let currentView = 'categories'; // 'categories' ou 'links'
let selectedCategory = null;

// ═══ Funções de Navegação ═══

function showCategories() {
    currentView = 'categories';
    selectedCategory = null;

    categoriesViewEl.style.display = 'block';
    linksViewEl.style.display = 'none';
    breadcrumbEl.style.display = 'none';

    renderCategories();
}

function showLinks(categoryId) {
    const category = appData.categories.find(c => c.id === categoryId);
    if (!category) return;

    currentView = 'links';
    selectedCategory = category;

    categoriesViewEl.style.display = 'none';
    linksViewEl.style.display = 'block';
    breadcrumbEl.style.display = 'flex';

    // Atualizar breadcrumb
    currentCategoryEl.textContent = category.name;

    // Atualizar header da tela de links
    linksHeaderIconEl.textContent = category.icon || '📁';
    linksTitleEl.textContent = category.name;

    renderLinks(categoryId);
}

// ═══ Funções de Renderização ═══

function renderCategories() {
    categoriesGridEl.innerHTML = '';

    if (!appData.categories || appData.categories.length === 0) {
        categoriesGridEl.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                <div style="font-size: 4rem; margin-bottom: 1rem; opacity: 0.3;">📭</div>
                <h3 style="font-size: 1.5rem; color: white; margin-bottom: 0.5rem;">Nenhuma categoria</h3>
                <p style="color: rgba(255,255,255,0.8);">Use o painel admin para criar categorias</p>
            </div>
        `;
        return;
    }

    // Ordenar categorias
    const sortedCategories = [...appData.categories].sort((a, b) => a.order - b.order);

    sortedCategories.forEach((category, index) => {
        // Contar links da categoria
        const linksCount = appData.links.filter(link => link.categoryId === category.id).length;

        const card = document.createElement('div');
        card.className = 'category-card';
        card.style.animationDelay = `${index * 0.1}s`;
        card.innerHTML = `
            <span class="category-card-icon">${category.icon || '📁'}</span>
            <h3 class="category-card-title">${category.name}</h3>
            <p class="category-card-count">${linksCount} ${linksCount === 1 ? 'item' : 'itens'}</p>
        `;

        card.addEventListener('click', () => showLinks(category.id));

        categoriesGridEl.appendChild(card);
    });
}

function renderLinks(categoryId) {
    linksGridEl.innerHTML = '';

    // Filtrar e ordenar links da categoria
    const categoryLinks = appData.links
        .filter(link => link.categoryId === categoryId)
        .sort((a, b) => a.order - b.order);

    if (categoryLinks.length === 0) {
        linksGridEl.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                <div style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.3;">📭</div>
                <h3 style="font-size: 1.25rem; color: #374151; margin-bottom: 0.5rem;">Nenhum link</h3>
                <p style="color: #6b7280;">Esta categoria ainda não possui links</p>
            </div>
        `;
        return;
    }

    categoryLinks.forEach((link, index) => {
        const card = document.createElement('a');
        card.href = link.url;
        card.target = '_blank';
        card.rel = 'noopener noreferrer';
        card.className = `link-card ${link.style || ''}`;
        card.style.animationDelay = `${index * 0.05}s`;
        card.innerHTML = `
            <span class="link-card-icon">${link.icon || '🔗'}</span>
            <span class="link-card-text">${link.title}</span>
        `;

        linksGridEl.appendChild(card);
    });
}

// ═══ Carregar Dados ═══

async function loadDataFromFirebase() {
    try {
        // Buscar categorias
        const categoriesSnapshot = await db.collection('categories')
            .orderBy('order', 'asc')
            .get();

        appData.categories = categoriesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Buscar todos os links
        const linksSnapshot = await db.collection('links')
            .orderBy('order', 'asc')
            .get();

        appData.links = linksSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        console.log('Dados carregados do Firebase:', appData);

    } catch (error) {
        console.error('Erro ao carregar dados do Firebase:', error);
        throw error;
    }
}

function loadDataFromLocal() {
    try {
        if (typeof VITA_DATA === 'undefined') {
            console.error('VITA_DATA não encontrado');
            appData = { categories: [], links: [] };
            return;
        }

        appData.categories = VITA_DATA.categories || [];
        appData.links = VITA_DATA.links || [];

        console.log('Dados locais carregados:', appData);

    } catch (error) {
        console.error('Erro ao carregar dados locais:', error);
        appData = { categories: [], links: [] };
    }
}

async function loadData() {
    try {
        if (USE_FIREBASE && db) {
            console.log('Carregando dados do Firebase...');
            await loadDataFromFirebase();
        } else {
            console.log('Carregando dados locais...');
            loadDataFromLocal();
        }
    } catch (error) {
        console.warn('Erro ao carregar dados do Firebase, usando dados locais:', error);
        loadDataFromLocal();
    } finally {
        // Esconder loading e mostrar categorias
        loadingEl.style.display = 'none';
        showCategories();
    }
}

// ═══ Event Listeners ═══

backBtnEl.addEventListener('click', () => {
    showCategories();
});

// Tecla ESC volta para categorias
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && currentView === 'links') {
        showCategories();
    }
});

// ═══ Inicializar ═══

document.addEventListener('DOMContentLoaded', loadData);
