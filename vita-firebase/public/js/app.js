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
const mainContentEl = document.getElementById('main-content');

// Função para criar elemento de categoria
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

// Função para mostrar estado vazio
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

// Carregar dados do Firestore
async function loadDataFromFirebase() {
    try {
        // Buscar categorias
        const categoriesSnapshot = await db.collection('categories')
            .orderBy('order', 'asc')
            .get();

        if (categoriesSnapshot.empty) {
            showEmptyState();
            return;
        }

        // Para cada categoria, buscar seus links
        for (const categoryDoc of categoriesSnapshot.docs) {
            const category = { id: categoryDoc.id, ...categoryDoc.data() };

            // Buscar links da categoria
            const linksSnapshot = await db.collection('links')
                .where('categoryId', '==', category.id)
                .orderBy('order', 'asc')
                .get();

            const links = linksSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Criar e adicionar seção da categoria
            if (links.length > 0) {
                const section = createCategorySection(category, links);
                mainContentEl.appendChild(section);
            }
        }

        // Se não houver nenhum link em nenhuma categoria
        if (mainContentEl.children.length === 0) {
            showEmptyState();
        }

    } catch (error) {
        console.error('Erro ao carregar dados do Firebase:', error);
        throw error;
    }
}

// Carregar dados locais do arquivo data.js
function loadDataFromLocal() {
    try {
        if (typeof VITA_DATA === 'undefined') {
            console.error('VITA_DATA não encontrado');
            showEmptyState();
            return;
        }

        const { categories, links } = VITA_DATA;

        if (!categories || categories.length === 0) {
            showEmptyState();
            return;
        }

        // Ordenar categorias
        const sortedCategories = [...categories].sort((a, b) => a.order - b.order);

        // Para cada categoria, buscar seus links
        sortedCategories.forEach(category => {
            // Filtrar links da categoria
            const categoryLinks = links
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

        console.log('Dados locais carregados com sucesso');

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

// Carregar dados (Firebase ou local)
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
        console.warn('Erro ao carregar dados do Firebase, tentando dados locais:', error);
        // Fallback para dados locais se Firebase falhar
        loadDataFromLocal();
    } finally {
        // Esconder loading e mostrar conteúdo
        loadingEl.style.display = 'none';
        mainContentEl.style.display = 'block';
    }
}

// Carregar dados quando a página carregar
document.addEventListener('DOMContentLoaded', loadData);
