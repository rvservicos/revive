// ═══════════════════════════════════════════════════════════
// VITA Admin - Gerenciamento de Múltiplas Versões
// ═══════════════════════════════════════════════════════════

// Configuração do Firebase (mesma do app.js)
const firebaseConfig = {
    apiKey: "",  // Deixe vazio para usar apenas dados locais
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
        console.log('🔥 Firebase inicializado com sucesso no Admin');
    } catch (error) {
        console.warn('⚠️ Erro ao inicializar Firebase, usando apenas localStorage:', error);
    }
}

// Estado Global
let currentVersion = 'normal';
let allVersions = {};
let editingCategoryId = null;
let editingLinkId = null;

// ═══ Inicialização ═══

function init() {
    loadFromLocalStorage();
    renderVersionTabs();
    switchVersion('normal');
    updateFirebaseStatus();
}

function updateFirebaseStatus() {
    const statusEl = document.getElementById('firebaseStatus');
    if (statusEl) {
        if (USE_FIREBASE && db) {
            statusEl.innerHTML = '☁️ <strong>Modo Firebase</strong> - Os dados são sincronizados automaticamente entre todos os computadores!';
            statusEl.parentElement.className = 'alert alert-success';
        } else {
            statusEl.innerHTML = '⚠️ <strong>Modo Local</strong> - Os dados são salvos apenas neste navegador. Para sincronizar entre computadores, configure o Firebase no arquivo <code>js/admin-app.js</code>';
            statusEl.parentElement.className = 'alert alert-info';
        }
    }
}

// ═══ LocalStorage ═══

function loadFromLocalStorage() {
    const stored = localStorage.getItem('VITA_VERSIONS');
    if (stored) {
        try {
            allVersions = JSON.parse(stored);
            console.log('Dados carregados do localStorage:', allVersions);
        } catch (e) {
            console.error('Erro ao carregar dados:', e);
            allVersions = { ...VITA_VERSIONS };
        }
    } else {
        // Carregar dados iniciais
        allVersions = JSON.parse(JSON.stringify(VITA_VERSIONS));
    }
}

async function saveToLocalStorage() {
    // SEMPRE salvar no localStorage (backup local)
    localStorage.setItem('VITA_VERSIONS', JSON.stringify(allVersions));
    window.VITA_VERSIONS = allVersions;
    console.log('💾 Dados salvos no localStorage');

    // Se Firebase estiver configurado, salvar também na nuvem
    if (USE_FIREBASE && db) {
        try {
            await saveToFirebase();
            console.log('☁️ Dados sincronizados com Firebase');
        } catch (error) {
            console.error('❌ Erro ao salvar no Firebase:', error);
            showAlert('Dados salvos localmente, mas erro ao sincronizar com Firebase', 'warning');
        }
    }
}

async function saveToFirebase() {
    if (!db) return;

    const batch = db.batch();

    // Para cada versão, salvar categorias e links
    for (const versionId in allVersions) {
        const version = allVersions[versionId];

        // Salvar/atualizar categorias
        if (version.categories) {
            for (const category of version.categories) {
                const docRef = db.collection('categories').doc(category.id);
                batch.set(docRef, {
                    ...category,
                    version: versionId,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true });
            }
        }

        // Salvar/atualizar links
        if (version.links) {
            for (const link of version.links) {
                const docRef = db.collection('links').doc(link.id);
                batch.set(docRef, {
                    ...link,
                    version: versionId,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true });
            }
        }
    }

    // Executar todas as operações em batch
    await batch.commit();
}

// ═══ Tabs de Versões ═══

function renderVersionTabs() {
    const container = document.getElementById('versionTabs');
    container.innerHTML = '';

    Object.keys(allVersions).forEach(versionId => {
        const version = allVersions[versionId];
        const btn = document.createElement('button');
        btn.className = `tab-btn ${versionId === currentVersion ? 'active' : ''}`;
        btn.textContent = version.name || versionId;
        btn.onclick = () => switchVersion(versionId);
        container.appendChild(btn);
    });
}

function switchVersion(versionId) {
    if (!allVersions[versionId]) return;

    currentVersion = versionId;
    renderVersionTabs();
    loadVersionData();
}

// ═══ Carregar Dados da Versão ═══

function loadVersionData() {
    const version = allVersions[currentVersion];

    // Atualizar badge e info
    document.getElementById('currentVersionBadge').textContent = version.name || currentVersion;
    document.getElementById('versionName').value = version.name || '';
    document.getElementById('versionDescription').value = version.description || '';

    // Renderizar categorias e links
    renderCategories();
    renderLinks();
    updateCategorySelects();
}

// ═══ Salvar Info da Versão ═══

async function saveVersionInfo() {
    const name = document.getElementById('versionName').value;
    const description = document.getElementById('versionDescription').value;

    allVersions[currentVersion].name = name;
    allVersions[currentVersion].description = description;

    await saveToLocalStorage();
    renderVersionTabs();
    showAlert('Informações da versão salvas!', 'success');
}

// ═══ Categorias ═══

function renderCategories() {
    const container = document.getElementById('categoriesList');
    const categories = allVersions[currentVersion].categories || [];

    if (categories.length === 0) {
        container.innerHTML = '<p style="color: #6b7280; text-align: center;">Nenhuma categoria criada ainda</p>';
        return;
    }

    container.innerHTML = '';
    categories.sort((a, b) => a.order - b.order).forEach(category => {
        const card = document.createElement('div');
        card.className = 'item-card';
        card.innerHTML = `
            <div class="item-header">
                <div class="item-title">${category.icon} ${category.name}</div>
                <div class="item-actions">
                    <button class="btn btn-sm btn-primary" onclick="editCategory('${category.id}')">✏️ Editar</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteCategory('${category.id}')">🗑️</button>
                </div>
            </div>
            <div style="font-size: 0.875rem; color: #6b7280;">Ordem: ${category.order}</div>
        `;
        container.appendChild(card);
    });
}

function openCategoryModal(categoryId = null) {
    editingCategoryId = categoryId;

    if (categoryId) {
        const category = allVersions[currentVersion].categories.find(c => c.id === categoryId);
        document.getElementById('categoryModalTitle').textContent = 'Editar Categoria';
        document.getElementById('categoryId').value = category.id;
        document.getElementById('categoryName').value = category.name;
        document.getElementById('categoryIcon').value = category.icon;
        document.getElementById('categoryOrder').value = category.order;
    } else {
        document.getElementById('categoryModalTitle').textContent = 'Nova Categoria';
        document.getElementById('categoryId').value = '';
        document.getElementById('categoryName').value = '';
        document.getElementById('categoryIcon').value = '';
        document.getElementById('categoryOrder').value = (allVersions[currentVersion].categories?.length || 0) + 1;
    }

    document.getElementById('categoryModal').classList.add('active');
}

function closeCategoryModal() {
    document.getElementById('categoryModal').classList.remove('active');
    editingCategoryId = null;
}

async function saveCategory(event) {
    event.preventDefault();

    const id = document.getElementById('categoryId').value || 'cat' + Date.now();
    const name = document.getElementById('categoryName').value;
    const icon = document.getElementById('categoryIcon').value;
    const order = parseInt(document.getElementById('categoryOrder').value);

    const category = { id, name, icon, order };

    if (!allVersions[currentVersion].categories) {
        allVersions[currentVersion].categories = [];
    }

    const index = allVersions[currentVersion].categories.findIndex(c => c.id === id);
    if (index >= 0) {
        allVersions[currentVersion].categories[index] = category;
    } else {
        allVersions[currentVersion].categories.push(category);
    }

    await saveToLocalStorage();
    renderCategories();
    updateCategorySelects();
    closeCategoryModal();
    showAlert('Categoria salva!', 'success');
}

function editCategory(categoryId) {
    openCategoryModal(categoryId);
}

async function deleteCategory(categoryId) {
    if (!confirm('Tem certeza que deseja deletar esta categoria e todos os seus links?')) return;

    // Deletar categoria
    allVersions[currentVersion].categories = allVersions[currentVersion].categories.filter(c => c.id !== categoryId);

    // Deletar links da categoria
    allVersions[currentVersion].links = allVersions[currentVersion].links.filter(l => l.categoryId !== categoryId);

    await saveToLocalStorage();
    renderCategories();
    renderLinks();
    updateCategorySelects();
    showAlert('Categoria deletada!', 'success');
}

// ═══ Links ═══

function renderLinks() {
    const container = document.getElementById('linksList');
    const filterCat = document.getElementById('filterCategory').value;
    let links = allVersions[currentVersion].links || [];

    if (filterCat) {
        links = links.filter(l => l.categoryId === filterCat);
    }

    if (links.length === 0) {
        container.innerHTML = '<p style="color: #6b7280; text-align: center;">Nenhum link criado ainda</p>';
        return;
    }

    container.innerHTML = '';
    links.sort((a, b) => a.order - b.order).forEach(link => {
        const category = allVersions[currentVersion].categories?.find(c => c.id === link.categoryId);
        const card = document.createElement('div');
        card.className = 'item-card';
        card.innerHTML = `
            <div class="item-header">
                <div class="item-title">${link.icon} ${link.title}</div>
                <div class="item-actions">
                    <button class="btn btn-sm btn-primary" onclick="editLink('${link.id}')">✏️ Editar</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteLink('${link.id}')">🗑️</button>
                </div>
            </div>
            <div style="font-size: 0.875rem; color: #6b7280;">
                Categoria: ${category?.name || 'N/A'} | Ordem: ${link.order} | Estilo: ${link.style || 'Padrão'}
            </div>
            <div style="font-size: 0.8125rem; color: #9ca3af; margin-top: 0.5rem; word-break: break-all;">${link.url}</div>
        `;
        container.appendChild(card);
    });
}

function openLinkModal(linkId = null) {
    editingLinkId = linkId;

    if (linkId) {
        const link = allVersions[currentVersion].links.find(l => l.id === linkId);
        document.getElementById('linkModalTitle').textContent = 'Editar Link';
        document.getElementById('linkId').value = link.id;
        document.getElementById('linkCategory').value = link.categoryId;
        document.getElementById('linkTitle').value = link.title;
        document.getElementById('linkUrl').value = link.url;
        document.getElementById('linkIcon').value = link.icon;
        document.getElementById('linkStyle').value = link.style || '';
        document.getElementById('linkOrder').value = link.order;
    } else {
        document.getElementById('linkModalTitle').textContent = 'Novo Link';
        document.getElementById('linkId').value = '';
        document.getElementById('linkCategory').value = '';
        document.getElementById('linkTitle').value = '';
        document.getElementById('linkUrl').value = '';
        document.getElementById('linkIcon').value = '🔗';
        document.getElementById('linkStyle').value = '';
        document.getElementById('linkOrder').value = (allVersions[currentVersion].links?.length || 0) + 1;
    }

    document.getElementById('linkModal').classList.add('active');
}

function closeLinkModal() {
    document.getElementById('linkModal').classList.remove('active');
    editingLinkId = null;
}

async function saveLink(event) {
    event.preventDefault();

    const id = document.getElementById('linkId').value || 'link' + Date.now();
    const categoryId = document.getElementById('linkCategory').value;
    const title = document.getElementById('linkTitle').value;
    const url = document.getElementById('linkUrl').value;
    const icon = document.getElementById('linkIcon').value;
    const style = document.getElementById('linkStyle').value;
    const order = parseInt(document.getElementById('linkOrder').value);

    const link = { id, categoryId, title, url, icon, style, order };

    if (!allVersions[currentVersion].links) {
        allVersions[currentVersion].links = [];
    }

    const index = allVersions[currentVersion].links.findIndex(l => l.id === id);
    if (index >= 0) {
        allVersions[currentVersion].links[index] = link;
    } else {
        allVersions[currentVersion].links.push(link);
    }

    await saveToLocalStorage();
    renderLinks();
    closeLinkModal();
    showAlert('Link salvo!', 'success');
}

function editLink(linkId) {
    openLinkModal(linkId);
}

async function deleteLink(linkId) {
    if (!confirm('Tem certeza que deseja deletar este link?')) return;

    allVersions[currentVersion].links = allVersions[currentVersion].links.filter(l => l.id !== linkId);

    await saveToLocalStorage();
    renderLinks();
    showAlert('Link deletado!', 'success');
}

function updateCategorySelects() {
    const categories = allVersions[currentVersion].categories || [];
    const selects = [document.getElementById('linkCategory'), document.getElementById('filterCategory')];

    selects.forEach((select, index) => {
        const currentValue = select.value;
        select.innerHTML = index === 1 ? '<option value="">Todas as Categorias</option>' : '<option value="">Selecione uma categoria</option>';

        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.id;
            option.textContent = `${cat.icon} ${cat.name}`;
            select.appendChild(option);
        });

        select.value = currentValue;
    });
}

// ═══ Nova Versão ═══

function openNewVersionModal() {
    document.getElementById('newVersionId').value = '';
    document.getElementById('newVersionName').value = '';
    document.getElementById('newVersionDescription').value = '';
    document.getElementById('newVersionModal').classList.add('active');
}

function closeNewVersionModal() {
    document.getElementById('newVersionModal').classList.remove('active');
}

async function createNewVersion(event) {
    event.preventDefault();

    const id = document.getElementById('newVersionId').value;
    const name = document.getElementById('newVersionName').value;
    const description = document.getElementById('newVersionDescription').value;

    if (allVersions[id]) {
        alert('Já existe uma versão com este ID!');
        return;
    }

    allVersions[id] = {
        id,
        name,
        description,
        categories: [],
        links: []
    };

    await saveToLocalStorage();
    renderVersionTabs();
    closeNewVersionModal();
    switchVersion(id);
    showAlert(`Versão "${name}" criada com sucesso!`, 'success');
}

async function deleteCurrentVersion() {
    if (currentVersion === 'normal') {
        alert('Não é possível deletar a versão Normal!');
        return;
    }

    if (!confirm(`Tem certeza que deseja deletar a versão "${allVersions[currentVersion].name}"?`)) return;

    delete allVersions[currentVersion];
    await saveToLocalStorage();
    renderVersionTabs();
    switchVersion('normal');
    showAlert('Versão deletada!', 'success');
}

// ═══ Export/Import ═══

function exportData() {
    const dataStr = JSON.stringify(allVersions, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vita-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showAlert('Dados exportados!', 'success');
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async function(e) {
        try {
            const data = JSON.parse(e.target.result);
            allVersions = data;
            await saveToLocalStorage();
            renderVersionTabs();
            switchVersion('normal');
            showAlert('Dados importados com sucesso!', 'success');
        } catch (error) {
            alert('Erro ao importar dados: ' + error.message);
        }
    };
    reader.readAsText(file);
}

// ═══ Utilidades ═══

function showAlert(message, type) {
    // Criar e mostrar notificação temporária
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    alertDiv.style.position = 'fixed';
    alertDiv.style.top = '2rem';
    alertDiv.style.right = '2rem';
    alertDiv.style.zIndex = '99999';
    alertDiv.style.minWidth = '300px';
    document.body.appendChild(alertDiv);

    setTimeout(() => {
        alertDiv.remove();
    }, 3000);
}

// ═══ Inicializar ao Carregar ═══

document.addEventListener('DOMContentLoaded', init);
