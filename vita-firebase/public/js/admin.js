// Configuração do Firebase (OPCIONAL - deixe vazio para apenas visualizar)
const firebaseConfig = {
    apiKey: "",  // Adicione suas credenciais do Firebase aqui
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: ""
};

// Verificar se deve usar Firebase
const USE_FIREBASE = firebaseConfig.apiKey !== "";
let db = null;

// Inicializar Firebase se configurado
if (USE_FIREBASE && typeof firebase !== 'undefined') {
    try {
        firebase.initializeApp(firebaseConfig);
        db = firebase.firestore();
        console.log('Firebase inicializado - painel admin habilitado');
    } catch (error) {
        console.error('Erro ao inicializar Firebase:', error);
        alert('Erro ao conectar com Firebase. Configure as credenciais em admin.js');
    }
}

// Estado da aplicação
let currentCategoryId = null;
let currentLinkId = null;
let categoriesCache = [];

// ===== FUNÇÕES DE UI =====

function showAlert(message, type = 'success') {
    const alertEl = document.getElementById('alert');
    alertEl.className = `alert alert-${type} active`;
    alertEl.textContent = message;

    setTimeout(() => {
        alertEl.classList.remove('active');
    }, 5000);
}

// ===== CATEGORY MODAL =====

function openCategoryModal(categoryId = null) {
    const modal = document.getElementById('category-modal');
    const title = document.getElementById('category-modal-title');
    const form = document.getElementById('category-form');

    form.reset();
    currentCategoryId = categoryId;

    if (categoryId) {
        title.textContent = 'Editar Categoria';
        loadCategoryData(categoryId);
    } else {
        title.textContent = 'Nova Categoria';
    }

    modal.classList.add('active');
}

function closeCategoryModal() {
    document.getElementById('category-modal').classList.remove('active');
    currentCategoryId = null;
}

async function loadCategoryData(categoryId) {
    try {
        const doc = await db.collection('categories').doc(categoryId).get();
        if (doc.exists) {
            const data = doc.data();
            document.getElementById('category-name').value = data.name;
            document.getElementById('category-icon').value = data.icon;
            document.getElementById('category-order').value = data.order;
        }
    } catch (error) {
        showAlert('Erro ao carregar categoria: ' + error.message, 'error');
    }
}

async function saveCategory(event) {
    event.preventDefault();

    const name = document.getElementById('category-name').value;
    const icon = document.getElementById('category-icon').value;
    const order = parseInt(document.getElementById('category-order').value);

    const categoryData = { name, icon, order };

    try {
        if (currentCategoryId) {
            await db.collection('categories').doc(currentCategoryId).update(categoryData);
            showAlert('Categoria atualizada com sucesso!');
        } else {
            await db.collection('categories').add(categoryData);
            showAlert('Categoria criada com sucesso!');
        }

        closeCategoryModal();
        loadCategories();
    } catch (error) {
        showAlert('Erro ao salvar categoria: ' + error.message, 'error');
    }
}

async function deleteCategory(categoryId) {
    if (!confirm('Tem certeza que deseja excluir esta categoria? Todos os links associados também serão excluídos.')) {
        return;
    }

    try {
        // Excluir todos os links da categoria
        const linksSnapshot = await db.collection('links')
            .where('categoryId', '==', categoryId)
            .get();

        const batch = db.batch();
        linksSnapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });

        // Excluir a categoria
        batch.delete(db.collection('categories').doc(categoryId));

        await batch.commit();

        showAlert('Categoria excluída com sucesso!');
        loadCategories();
        loadLinks();
    } catch (error) {
        showAlert('Erro ao excluir categoria: ' + error.message, 'error');
    }
}

async function loadCategories() {
    const listEl = document.getElementById('categories-list');

    try {
        // Se Firebase não estiver configurado, usar dados locais
        if (!USE_FIREBASE || !db) {
            if (typeof VITA_DATA !== 'undefined') {
                categoriesCache = VITA_DATA.categories;
            } else {
                categoriesCache = [];
            }
        } else {
            const snapshot = await db.collection('categories')
                .orderBy('order', 'asc')
                .get();

            categoriesCache = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        }

        if (categoriesCache.length === 0) {
            listEl.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #6b7280;">
                    <p>Nenhuma categoria cadastrada</p>
                    <p style="font-size: 0.875rem; margin-top: 0.5rem;">
                        ${USE_FIREBASE ? 'Clique em "+ Nova Categoria" para começar' : 'Configure o Firebase para gerenciar categorias'}
                    </p>
                </div>
            `;
            return;
        }

        listEl.innerHTML = categoriesCache.map(category => `
            <div class="item-card">
                <div class="item-header">
                    <div class="item-title">
                        <span style="font-size: 1.5rem;">${category.icon}</span>
                        ${category.name}
                    </div>
                </div>
                <div class="item-meta">
                    Ordem: ${category.order}
                </div>
                <div class="item-actions">
                    <button onclick="openCategoryModal('${category.id}')" class="btn btn-secondary btn-sm">
                        ✏️ Editar
                    </button>
                    <button onclick="deleteCategory('${category.id}')" class="btn btn-danger btn-sm">
                        🗑️ Excluir
                    </button>
                </div>
            </div>
        `).join('');

        // Atualizar select de categorias no modal de links
        updateCategorySelect();

    } catch (error) {
        listEl.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #ef4444;">
                <p>Erro ao carregar categorias</p>
                <p style="font-size: 0.875rem; margin-top: 0.5rem;">${error.message}</p>
            </div>
        `;
    }
}

// ===== LINK MODAL =====

function updateCategorySelect() {
    const select = document.getElementById('link-category');
    select.innerHTML = '<option value="">Selecione uma categoria</option>' +
        categoriesCache.map(cat => `
            <option value="${cat.id}">${cat.icon} ${cat.name}</option>
        `).join('');
}

function openLinkModal(linkId = null) {
    const modal = document.getElementById('link-modal');
    const title = document.getElementById('link-modal-title');
    const form = document.getElementById('link-form');

    form.reset();
    currentLinkId = linkId;

    if (linkId) {
        title.textContent = 'Editar Link';
        loadLinkData(linkId);
    } else {
        title.textContent = 'Novo Link';
    }

    modal.classList.add('active');
}

function closeLinkModal() {
    document.getElementById('link-modal').classList.remove('active');
    currentLinkId = null;
}

async function loadLinkData(linkId) {
    try {
        const doc = await db.collection('links').doc(linkId).get();
        if (doc.exists) {
            const data = doc.data();
            document.getElementById('link-category').value = data.categoryId;
            document.getElementById('link-title').value = data.title;
            document.getElementById('link-url').value = data.url;
            document.getElementById('link-icon').value = data.icon;
            document.getElementById('link-style').value = data.style || '';
            document.getElementById('link-order').value = data.order;
        }
    } catch (error) {
        showAlert('Erro ao carregar link: ' + error.message, 'error');
    }
}

async function saveLink(event) {
    event.preventDefault();

    const categoryId = document.getElementById('link-category').value;
    const title = document.getElementById('link-title').value;
    const url = document.getElementById('link-url').value;
    const icon = document.getElementById('link-icon').value;
    const style = document.getElementById('link-style').value;
    const order = parseInt(document.getElementById('link-order').value);

    const linkData = { categoryId, title, url, icon, style, order };

    try {
        if (currentLinkId) {
            await db.collection('links').doc(currentLinkId).update(linkData);
            showAlert('Link atualizado com sucesso!');
        } else {
            await db.collection('links').add(linkData);
            showAlert('Link criado com sucesso!');
        }

        closeLinkModal();
        loadLinks();
    } catch (error) {
        showAlert('Erro ao salvar link: ' + error.message, 'error');
    }
}

async function deleteLink(linkId) {
    if (!confirm('Tem certeza que deseja excluir este link?')) {
        return;
    }

    try {
        await db.collection('links').doc(linkId).delete();
        showAlert('Link excluído com sucesso!');
        loadLinks();
    } catch (error) {
        showAlert('Erro ao excluir link: ' + error.message, 'error');
    }
}

async function loadLinks() {
    const listEl = document.getElementById('links-list');

    try {
        let links = [];

        // Se Firebase não estiver configurado, usar dados locais
        if (!USE_FIREBASE || !db) {
            if (typeof VITA_DATA !== 'undefined') {
                links = VITA_DATA.links;
            }
        } else {
            const snapshot = await db.collection('links')
                .orderBy('order', 'asc')
                .get();

            links = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        }

        if (links.length === 0) {
            listEl.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #6b7280;">
                    <p>Nenhum link cadastrado</p>
                    <p style="font-size: 0.875rem; margin-top: 0.5rem;">
                        ${USE_FIREBASE ? 'Clique em "+ Novo Link" para começar' : 'Configure o Firebase para gerenciar links'}
                    </p>
                </div>
            `;
            return;
        }

        listEl.innerHTML = links.map(link => {
            const category = categoriesCache.find(c => c.id === link.categoryId);
            const categoryName = category ? category.name : 'Sem categoria';

            return `
                <div class="item-card">
                    <div class="item-header">
                        <div class="item-title">
                            <span style="font-size: 1.5rem;">${link.icon}</span>
                            ${link.title}
                        </div>
                    </div>
                    <div class="item-meta">
                        Categoria: ${categoryName} | Ordem: ${link.order}
                    </div>
                    <div class="item-meta" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                        <a href="${link.url}" target="_blank" style="color: var(--primary);">${link.url}</a>
                    </div>
                    <div class="item-actions">
                        <button onclick="openLinkModal('${link.id}')" class="btn btn-secondary btn-sm">
                            ✏️ Editar
                        </button>
                        <button onclick="deleteLink('${link.id}')" class="btn btn-danger btn-sm">
                            🗑️ Excluir
                        </button>
                    </div>
                </div>
            `;
        }).join('');

    } catch (error) {
        listEl.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #ef4444;">
                <p>Erro ao carregar links</p>
                <p style="font-size: 0.875rem; margin-top: 0.5rem;">${error.message}</p>
            </div>
        `;
    }
}

// ===== IMPORTAÇÃO DE DADOS INICIAIS =====

async function importInitialData() {
    if (!USE_FIREBASE || !db) {
        alert('Firebase não configurado! Configure as credenciais do Firebase em admin.js para usar esta função.');
        return;
    }

    if (!confirm('Isto irá importar todos os dados da página original VITA para o Firebase. Continuar?')) {
        return;
    }

    try {
        // Usar dados do VITA_DATA (arquivo data.js)
        if (typeof VITA_DATA === 'undefined') {
            throw new Error('VITA_DATA não encontrado. Certifique-se que data.js está carregado.');
        }

        const batch = db.batch();
        const { categories, links } = VITA_DATA;

        // Importar categorias
        categories.forEach(cat => {
            const { id, ...data } = cat;
            batch.set(db.collection('categories').doc(id), data);
        });

        // Importar links
        links.forEach(link => {
            const { id, ...data } = link;
            batch.set(db.collection('links').doc(), data);
        });

        await batch.commit();

        showAlert('Dados importados com sucesso!');
        loadCategories();
        loadLinks();

    } catch (error) {
        showAlert('Erro ao importar dados: ' + error.message, 'error');
        console.error('Erro detalhado:', error);
    }
}

// ===== INICIALIZAÇÃO =====

document.addEventListener('DOMContentLoaded', () => {
    loadCategories();
    loadLinks();
});
