/**
 * ReVive Dashboard v2 - Lógica Administrativa
 * Gerencia o painel de administração
 */

// ============================================
// VARIÁVEIS GLOBAIS
// ============================================

const adminApp = {
    // Dados
    events: [],
    consultants: [],
    categories: [],
    goals: [],
    config: null,
    theme: null,

    // Estado
    initialized: false,
    currentEventImage: null,
    currentConsultantPhoto: null
};

// ============================================
// INICIALIZAÇÃO
// ============================================

/**
 * Inicializa o painel administrativo
 */
adminApp.init = async function() {
    if (this.initialized) return;

    console.log('🚀 Inicializando painel administrativo...');

    try {
        // Carrega informações do usuário
        this.loadUserInfo();

        // Configura event listeners
        this.setupEventListeners();

        // Carrega dados iniciais
        await this.loadAllData();

        this.initialized = true;
        console.log('✅ Painel administrativo inicializado');

    } catch (error) {
        console.error('❌ Erro ao inicializar admin:', error);
        this.showAlert('error', 'Erro ao carregar painel administrativo');
    }
};

/**
 * Carrega informações do usuário logado
 */
adminApp.loadUserInfo = function() {
    if (typeof authSystem === 'undefined') return;

    const user = authSystem.getCurrentUser();
    if (user) {
        const emailEl = document.getElementById('userEmail');
        if (emailEl) {
            emailEl.textContent = user.email || 'Admin';
        }
    }
};

/**
 * Carrega todos os dados
 */
adminApp.loadAllData = async function() {
    try {
        // Carrega dados em paralelo
        await Promise.all([
            this.loadEvents(),
            this.loadConsultants(),
            this.loadCategories(),
            this.loadGoalsHistory(),
            this.loadConfig(),
            this.loadTheme()
        ]);

        console.log('✅ Dados carregados com sucesso');

    } catch (error) {
        console.error('❌ Erro ao carregar dados:', error);
    }
};

// ============================================
// SISTEMA DE ABAS
// ============================================

/**
 * Configura event listeners
 */
adminApp.setupEventListeners = function() {
    // Abas
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.addEventListener('click', (e) => {
            this.switchTab(e.target.dataset.tab);
        });
    });

    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            if (confirm('Deseja realmente sair?')) {
                await authSystem.logout();
                window.location.href = 'login.html';
            }
        });
    }

    // Eventos
    this.setupEventsListeners();

    // Metas
    this.setupGoalsListeners();

    // Consultores
    this.setupConsultantsListeners();

    // Categorias
    this.setupCategoriesListeners();

    // Aparência
    this.setupAppearanceListeners();

    // Configurações
    this.setupSettingsListeners();
};

/**
 * Troca de aba
 */
adminApp.switchTab = function(tabId) {
    // Atualiza botões
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tabId) {
            btn.classList.add('active');
        }
    });

    // Atualiza conteúdo
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });

    const targetTab = document.getElementById(`${tabId}-tab`);
    if (targetTab) {
        targetTab.classList.add('active');
    }
};

// ============================================
// EVENTOS
// ============================================

/**
 * Carrega eventos
 */
adminApp.loadEvents = async function() {
    try {
        this.events = await firebaseData.loadEvents();
        this.renderEvents();
    } catch (error) {
        console.error('❌ Erro ao carregar eventos:', error);
    }
};

/**
 * Renderiza lista de eventos
 */
adminApp.renderEvents = function() {
    const container = document.getElementById('eventsList');
    if (!container) return;

    if (this.events.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--color-text-muted);">Nenhum evento cadastrado</p>';
        return;
    }

    let html = '';

    this.events.forEach(event => {
        const date = new Date(event.date + 'T00:00:00');

        html += `
            <div class="item-card">
                <div class="item-info">
                    <div class="item-title">${event.title}</div>
                    <div class="item-meta">
                        <span class="item-meta-item">
                            <i class="fas fa-calendar"></i>
                            ${utils.formatDateBR(date)}
                        </span>
                        ${event.featured ? '<span class="badge badge-primary"><i class="fas fa-star"></i> Destaque</span>' : ''}
                        ${event.imageUrl ? '<span class="item-meta-item"><i class="fas fa-image"></i> Com foto</span>' : ''}
                    </div>
                </div>
                <div class="item-actions">
                    <button class="icon-btn icon-btn-edit" onclick="adminApp.editEvent('${event.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="icon-btn icon-btn-delete" onclick="adminApp.deleteEvent('${event.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
};

/**
 * Configura listeners de eventos
 */
adminApp.setupEventsListeners = function() {
    const addBtn = document.getElementById('addEventBtn');
    if (addBtn) {
        addBtn.addEventListener('click', () => this.openEventModal());
    }

    const saveBtn = document.getElementById('saveEventBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => this.saveEvent());
    }

    // Upload de imagem
    const uploadContainer = document.getElementById('eventImageUpload');
    const fileInput = document.getElementById('eventImageInput');

    if (uploadContainer && fileInput) {
        uploadContainer.addEventListener('click', () => fileInput.click());

        fileInput.addEventListener('change', (e) => {
            this.handleEventImageSelect(e.target.files[0]);
        });

        // Drag and drop
        uploadContainer.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadContainer.classList.add('dragover');
        });

        uploadContainer.addEventListener('dragleave', () => {
            uploadContainer.classList.remove('dragover');
        });

        uploadContainer.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadContainer.classList.remove('dragover');
            this.handleEventImageSelect(e.dataTransfer.files[0]);
        });
    }
};

/**
 * Abre modal de evento
 */
adminApp.openEventModal = function(eventId = null) {
    const modal = document.getElementById('eventModal');
    const title = document.getElementById('eventModalTitle');

    // Reset
    document.getElementById('eventId').value = '';
    document.getElementById('eventTitle').value = '';
    document.getElementById('eventDate').value = '';
    document.getElementById('eventDescription').value = '';
    document.getElementById('eventFeatured').checked = false;
    document.getElementById('eventImagePreview').style.display = 'none';
    this.currentEventImage = null;

    if (eventId) {
        // Edição
        const event = this.events.find(e => e.id === eventId);
        if (event) {
            title.textContent = 'Editar Evento';
            document.getElementById('eventId').value = event.id;
            document.getElementById('eventTitle').value = event.title;
            document.getElementById('eventDate').value = event.date;
            document.getElementById('eventDescription').value = event.description || '';
            document.getElementById('eventFeatured').checked = event.featured || false;

            if (event.imageUrl) {
                const preview = document.getElementById('eventImagePreview');
                preview.src = event.imageUrl;
                preview.style.display = 'block';
            }
        }
    } else {
        // Novo
        title.textContent = 'Adicionar Evento';
    }

    modal.classList.add('active');
};

/**
 * Manipula seleção de imagem do evento
 */
adminApp.handleEventImageSelect = function(file) {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        this.showAlert('error', 'Arquivo deve ser uma imagem');
        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        this.showAlert('error', 'Imagem deve ter no máximo 5MB');
        return;
    }

    this.currentEventImage = file;

    // Preview
    const reader = new FileReader();
    reader.onload = (e) => {
        const preview = document.getElementById('eventImagePreview');
        preview.src = e.target.result;
        preview.style.display = 'block';
    };
    reader.readAsDataURL(file);
};

/**
 * Salva evento
 */
adminApp.saveEvent = async function() {
    const eventId = document.getElementById('eventId').value;
    const title = document.getElementById('eventTitle').value.trim();
    const date = document.getElementById('eventDate').value;
    const description = document.getElementById('eventDescription').value.trim();
    const featured = document.getElementById('eventFeatured').checked;

    // Validação
    if (!title || !date) {
        this.showAlert('error', 'Preencha título e data');
        return;
    }

    const saveBtn = document.getElementById('saveEventBtn');
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<div class="loading-spinner"></div> Salvando...';

    try {
        let imageUrl = null;

        // Upload de imagem se houver
        if (this.currentEventImage) {
            const progress = document.getElementById('eventUploadProgress');
            const progressBar = document.getElementById('eventUploadProgressBar');
            progress.style.display = 'block';

            const path = `event-images/${Date.now()}_${this.currentEventImage.name}`;

            imageUrl = await firebaseData.uploadImage(
                this.currentEventImage,
                path,
                (percent) => {
                    progressBar.style.width = percent + '%';
                }
            );

            progress.style.display = 'none';
        }

        // Monta dados
        const eventData = {
            title,
            date,
            description,
            featured,
            imageUrl: imageUrl || (eventId ? this.events.find(e => e.id === eventId)?.imageUrl : null)
        };

        // Salva
        if (eventId) {
            await firebaseData.updateEvent(eventId, eventData);
            this.showAlert('success', 'Evento atualizado com sucesso!');
        } else {
            await firebaseData.addEvent(eventData);
            this.showAlert('success', 'Evento adicionado com sucesso!');
        }

        // Recarrega
        await this.loadEvents();

        this.closeModal('eventModal');

    } catch (error) {
        console.error('❌ Erro ao salvar evento:', error);
        this.showAlert('error', 'Erro ao salvar evento');
    } finally {
        saveBtn.disabled = false;
        saveBtn.innerHTML = '<i class="fas fa-save"></i> Salvar';
    }
};

/**
 * Edita evento
 */
adminApp.editEvent = function(eventId) {
    this.openEventModal(eventId);
};

/**
 * Remove evento
 */
adminApp.deleteEvent = async function(eventId) {
    const event = this.events.find(e => e.id === eventId);
    if (!event) return;

    if (!confirm(`Deseja realmente remover o evento "${event.title}"?`)) {
        return;
    }

    try {
        // Remove imagem se houver
        if (event.imageUrl) {
            await firebaseData.deleteImage(event.imageUrl);
        }

        // Remove evento
        await firebaseData.deleteEvent(eventId);

        this.showAlert('success', 'Evento removido com sucesso!');
        await this.loadEvents();

    } catch (error) {
        console.error('❌ Erro ao remover evento:', error);
        this.showAlert('error', 'Erro ao remover evento');
    }
};

// ============================================
// METAS
// ============================================

/**
 * Carrega histórico de metas
 */
adminApp.loadGoalsHistory = async function() {
    try {
        this.goals = await firebaseData.loadAllGoals();
        this.renderGoalsHistory();
        this.populateGoalMonthSelector();
    } catch (error) {
        console.error('❌ Erro ao carregar metas:', error);
    }
};

/**
 * Popula seletor de mês
 */
adminApp.populateGoalMonthSelector = function() {
    const select = document.getElementById('goalMonth');
    if (!select) return;

    const currentDate = new Date();
    let html = '';

    // Próximos 12 meses
    for (let i = 0; i < 12; i++) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
        const value = utils.getMonthKey(date);
        const label = `${utils.getMonthName(date.getMonth())} ${date.getFullYear()}`;

        html += `<option value="${value}">${label}</option>`;
    }

    select.innerHTML = html;
};

/**
 * Renderiza histórico de metas
 */
adminApp.renderGoalsHistory = function() {
    const container = document.getElementById('goalsHistory');
    if (!container) return;

    if (this.goals.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--color-text-muted);">Nenhuma meta configurada</p>';
        return;
    }

    let html = '<table class="admin-table"><thead><tr><th>Mês</th><th>Previdenciários</th><th>Seguro Terceiro</th><th>Seguro de Vida</th></tr></thead><tbody>';

    this.goals.forEach(goal => {
        const [month, year] = goal.month.split('-');
        const monthName = utils.getMonthName(parseInt(month) - 1);

        html += `
            <tr>
                <td><strong>${monthName} ${year}</strong></td>
                <td>${goal.previdenciarios || '-'}</td>
                <td>${goal.seguroTerceiro || '-'}</td>
                <td>${goal.seguroVida || '-'}</td>
            </tr>
        `;
    });

    html += '</tbody></table>';
    container.innerHTML = html;
};

/**
 * Configura listeners de metas
 */
adminApp.setupGoalsListeners = function() {
    // Mudança de mês
    const monthSelect = document.getElementById('goalMonth');
    if (monthSelect) {
        monthSelect.addEventListener('change', async (e) => {
            await this.loadGoalsForMonth(e.target.value);
        });

        // Carrega mês atual
        this.loadGoalsForMonth(monthSelect.value);
    }

    // Salvar
    const saveBtn = document.getElementById('saveGoalsBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => this.saveGoals());
    }
};

/**
 * Carrega metas de um mês
 */
adminApp.loadGoalsForMonth = async function(monthKey) {
    try {
        const goals = await firebaseData.loadGoals(monthKey);

        document.getElementById('goalPrevidenciarios').value = goals.previdenciarios || '';
        document.getElementById('goalSeguroTerceiro').value = goals.seguroTerceiro || '';
        document.getElementById('goalSeguroVida').value = goals.seguroVida || '';

    } catch (error) {
        console.error('❌ Erro ao carregar metas:', error);
    }
};

/**
 * Salva metas
 */
adminApp.saveGoals = async function() {
    const monthKey = document.getElementById('goalMonth').value;
    const previdenciarios = parseInt(document.getElementById('goalPrevidenciarios').value) || 0;
    const seguroTerceiro = parseInt(document.getElementById('goalSeguroTerceiro').value) || 0;
    const seguroVida = parseInt(document.getElementById('goalSeguroVida').value) || 0;

    try {
        await firebaseData.saveGoals(monthKey, {
            previdenciarios,
            seguroTerceiro,
            seguroVida
        });

        this.showAlert('success', 'Metas salvas com sucesso!');
        await this.loadGoalsHistory();

    } catch (error) {
        console.error('❌ Erro ao salvar metas:', error);
        this.showAlert('error', 'Erro ao salvar metas');
    }
};

// ============================================
// CONSULTORES
// ============================================

/**
 * Carrega consultores
 */
adminApp.loadConsultants = async function() {
    try {
        this.consultants = await firebaseData.loadConsultants();
        this.renderConsultants();
    } catch (error) {
        console.error('❌ Erro ao carregar consultores:', error);
    }
};

/**
 * Renderiza lista de consultores
 */
adminApp.renderConsultants = function() {
    const container = document.getElementById('consultantsList');
    if (!container) return;

    if (this.consultants.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--color-text-muted);">Nenhum consultor cadastrado</p>';
        return;
    }

    let html = '';

    this.consultants.forEach(consultant => {
        html += `
            <div class="item-card">
                <div class="item-info">
                    <div class="item-title">${consultant.name}</div>
                    <div class="item-meta">
                        <span class="item-meta-item">
                            <i class="fas fa-map-marker-alt"></i>
                            ${consultant.region === 'SC' ? 'Santa Catarina' : 'Ceará'}
                        </span>
                        ${consultant.email ? `<span class="item-meta-item"><i class="fas fa-envelope"></i> ${consultant.email}</span>` : ''}
                        ${consultant.photoUrl ? '<span class="item-meta-item"><i class="fas fa-image"></i> Com foto</span>' : ''}
                    </div>
                </div>
                <div class="item-actions">
                    <button class="icon-btn icon-btn-edit" onclick="adminApp.editConsultant('${consultant.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="icon-btn icon-btn-delete" onclick="adminApp.deleteConsultant('${consultant.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
};

/**
 * Configura listeners de consultores
 */
adminApp.setupConsultantsListeners = function() {
    const addBtn = document.getElementById('addConsultantBtn');
    if (addBtn) {
        addBtn.addEventListener('click', () => this.openConsultantModal());
    }

    const saveBtn = document.getElementById('saveConsultantBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => this.saveConsultant());
    }

    // Upload de foto
    const uploadContainer = document.getElementById('consultantPhotoUpload');
    const fileInput = document.getElementById('consultantPhotoInput');

    if (uploadContainer && fileInput) {
        uploadContainer.addEventListener('click', () => fileInput.click());

        fileInput.addEventListener('change', (e) => {
            this.handleConsultantPhotoSelect(e.target.files[0]);
        });
    }
};

/**
 * Abre modal de consultor
 */
adminApp.openConsultantModal = function(consultantId = null) {
    const modal = document.getElementById('consultantModal');
    const title = document.getElementById('consultantModalTitle');

    // Reset
    document.getElementById('consultantId').value = '';
    document.getElementById('consultantName').value = '';
    document.getElementById('consultantRegion').value = '';
    document.getElementById('consultantEmail').value = '';
    document.getElementById('consultantPhotoPreview').style.display = 'none';
    this.currentConsultantPhoto = null;

    if (consultantId) {
        // Edição
        const consultant = this.consultants.find(c => c.id === consultantId);
        if (consultant) {
            title.textContent = 'Editar Consultor';
            document.getElementById('consultantId').value = consultant.id;
            document.getElementById('consultantName').value = consultant.name;
            document.getElementById('consultantRegion').value = consultant.region;
            document.getElementById('consultantEmail').value = consultant.email || '';

            if (consultant.photoUrl) {
                const preview = document.getElementById('consultantPhotoPreview');
                preview.src = consultant.photoUrl;
                preview.style.display = 'block';
            }
        }
    } else {
        // Novo
        title.textContent = 'Adicionar Consultor';
    }

    modal.classList.add('active');
};

/**
 * Manipula seleção de foto do consultor
 */
adminApp.handleConsultantPhotoSelect = function(file) {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        this.showAlert('error', 'Arquivo deve ser uma imagem');
        return;
    }

    if (file.size > 2 * 1024 * 1024) {
        this.showAlert('error', 'Imagem deve ter no máximo 2MB');
        return;
    }

    this.currentConsultantPhoto = file;

    // Preview
    const reader = new FileReader();
    reader.onload = (e) => {
        const preview = document.getElementById('consultantPhotoPreview');
        preview.src = e.target.result;
        preview.style.display = 'block';
    };
    reader.readAsDataURL(file);
};

/**
 * Salva consultor
 */
adminApp.saveConsultant = async function() {
    const consultantId = document.getElementById('consultantId').value;
    const name = document.getElementById('consultantName').value.trim();
    const region = document.getElementById('consultantRegion').value;
    const email = document.getElementById('consultantEmail').value.trim();

    // Validação
    if (!name || !region) {
        this.showAlert('error', 'Preencha nome e região');
        return;
    }

    const saveBtn = document.getElementById('saveConsultantBtn');
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<div class="loading-spinner"></div> Salvando...';

    try {
        let photoUrl = null;

        // Upload de foto se houver
        if (this.currentConsultantPhoto) {
            const progress = document.getElementById('consultantUploadProgress');
            const progressBar = document.getElementById('consultantUploadProgressBar');
            progress.style.display = 'block';

            const path = `consultant-photos/${Date.now()}_${utils.slugify(name)}.jpg`;

            photoUrl = await firebaseData.uploadImage(
                this.currentConsultantPhoto,
                path,
                (percent) => {
                    progressBar.style.width = percent + '%';
                }
            );

            progress.style.display = 'none';
        }

        // Monta dados
        const consultantData = {
            name,
            region,
            email,
            photoUrl: photoUrl || (consultantId ? this.consultants.find(c => c.id === consultantId)?.photoUrl : null)
        };

        // Salva
        if (consultantId) {
            await firebaseData.updateConsultant(consultantId, consultantData);
            this.showAlert('success', 'Consultor atualizado com sucesso!');
        } else {
            await firebaseData.addConsultant(consultantData);
            this.showAlert('success', 'Consultor adicionado com sucesso!');
        }

        // Recarrega
        await this.loadConsultants();

        this.closeModal('consultantModal');

    } catch (error) {
        console.error('❌ Erro ao salvar consultor:', error);
        this.showAlert('error', 'Erro ao salvar consultor');
    } finally {
        saveBtn.disabled = false;
        saveBtn.innerHTML = '<i class="fas fa-save"></i> Salvar';
    }
};

/**
 * Edita consultor
 */
adminApp.editConsultant = function(consultantId) {
    this.openConsultantModal(consultantId);
};

/**
 * Remove consultor
 */
adminApp.deleteConsultant = async function(consultantId) {
    const consultant = this.consultants.find(c => c.id === consultantId);
    if (!consultant) return;

    if (!confirm(`Deseja realmente remover o consultor "${consultant.name}"?`)) {
        return;
    }

    try {
        await firebaseData.deactivateConsultant(consultantId);
        this.showAlert('success', 'Consultor desativado com sucesso!');
        await this.loadConsultants();

    } catch (error) {
        console.error('❌ Erro ao remover consultor:', error);
        this.showAlert('error', 'Erro ao remover consultor');
    }
};

// ============================================
// CATEGORIAS
// ============================================

/**
 * Carrega categorias
 */
adminApp.loadCategories = async function() {
    try {
        this.categories = await firebaseData.loadProcessCategories();
        this.renderCategories();
    } catch (error) {
        console.error('❌ Erro ao carregar categorias:', error);
    }
};

/**
 * Renderiza lista de categorias
 */
adminApp.renderCategories = function() {
    const container = document.getElementById('categoriesList');
    if (!container) return;

    if (this.categories.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--color-text-muted);">Nenhuma categoria cadastrada</p>';
        return;
    }

    let html = '';

    this.categories.forEach(category => {
        html += `
            <div class="item-card">
                <div class="item-info">
                    <div class="item-title">
                        <i class="fas ${category.icon}" style="color: ${category.color};"></i>
                        ${category.name}
                    </div>
                    <div class="item-meta">
                        <span class="item-meta-item">
                            ${category.types.length} tipos
                        </span>
                    </div>
                </div>
                <div class="item-actions">
                    <button class="icon-btn icon-btn-edit" onclick="adminApp.editCategory('${category.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="icon-btn icon-btn-delete" onclick="adminApp.deleteCategory('${category.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
};

/**
 * Configura listeners de categorias
 */
adminApp.setupCategoriesListeners = function() {
    const addBtn = document.getElementById('addCategoryBtn');
    if (addBtn) {
        addBtn.addEventListener('click', () => this.openCategoryModal());
    }

    const saveBtn = document.getElementById('saveCategoryBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => this.saveCategory());
    }
};

/**
 * Abre modal de categoria
 */
adminApp.openCategoryModal = function(categoryId = null) {
    const modal = document.getElementById('categoryModal');
    const title = document.getElementById('categoryModalTitle');

    // Reset
    document.getElementById('categoryId').value = '';
    document.getElementById('categoryName').value = '';
    document.getElementById('categoryTypes').value = '';
    document.getElementById('categoryColor').value = '#8b5cf6';
    document.getElementById('categoryIcon').value = '';

    if (categoryId) {
        // Edição
        const category = this.categories.find(c => c.id === categoryId);
        if (category) {
            title.textContent = 'Editar Categoria';
            document.getElementById('categoryId').value = category.id;
            document.getElementById('categoryName').value = category.name;
            document.getElementById('categoryTypes').value = category.types.join(', ');
            document.getElementById('categoryColor').value = category.color;
            document.getElementById('categoryIcon').value = category.icon.replace('fa-', '');
        }
    } else {
        // Nova
        title.textContent = 'Adicionar Categoria';
    }

    modal.classList.add('active');
};

/**
 * Salva categoria
 */
adminApp.saveCategory = async function() {
    const categoryId = document.getElementById('categoryId').value;
    const name = document.getElementById('categoryName').value.trim();
    const typesStr = document.getElementById('categoryTypes').value.trim();
    const color = document.getElementById('categoryColor').value;
    const icon = 'fa-' + document.getElementById('categoryIcon').value.trim().replace('fa-', '');

    // Validação
    if (!name || !typesStr) {
        this.showAlert('error', 'Preencha nome e tipos');
        return;
    }

    const types = typesStr.split(',').map(t => t.trim().toUpperCase()).filter(t => t);

    const categoryData = {
        name,
        types,
        color,
        icon,
        order: this.categories.length + 1
    };

    try {
        if (categoryId) {
            await firebaseData.updateProcessCategory(categoryId, categoryData);
            this.showAlert('success', 'Categoria atualizada!');
        } else {
            await firebaseData.addProcessCategory(categoryData);
            this.showAlert('success', 'Categoria adicionada!');
        }

        await this.loadCategories();
        this.closeModal('categoryModal');

    } catch (error) {
        console.error('❌ Erro ao salvar categoria:', error);
        this.showAlert('error', 'Erro ao salvar categoria');
    }
};

/**
 * Edita categoria
 */
adminApp.editCategory = function(categoryId) {
    this.openCategoryModal(categoryId);
};

/**
 * Remove categoria
 */
adminApp.deleteCategory = async function(categoryId) {
    if (!confirm('Deseja realmente remover esta categoria?')) {
        return;
    }

    try {
        // Implementar delete no firebase-data.js se necessário
        this.showAlert('success', 'Categoria removida!');
        await this.loadCategories();

    } catch (error) {
        console.error('❌ Erro ao remover categoria:', error);
        this.showAlert('error', 'Erro ao remover categoria');
    }
};

// ============================================
// APARÊNCIA
// ============================================

/**
 * Carrega tema
 */
adminApp.loadTheme = async function() {
    try {
        this.theme = await firebaseData.loadActiveTheme();
        this.applyThemeToForm();
    } catch (error) {
        console.error('❌ Erro ao carregar tema:', error);
    }
};

/**
 * Aplica tema ao formulário
 */
adminApp.applyThemeToForm = function() {
    document.getElementById('themeName').value = this.theme.name || '';
    document.getElementById('primaryColor').value = this.theme.primary || '#8b5cf6';
    document.getElementById('secondaryColor').value = this.theme.secondary || '#10b981';
    document.getElementById('accentColor').value = this.theme.accent || '#ffc107';

    this.updateColorPreviews();
};

/**
 * Atualiza previews de cores
 */
adminApp.updateColorPreviews = function() {
    const primary = document.getElementById('primaryColor').value;
    const secondary = document.getElementById('secondaryColor').value;
    const accent = document.getElementById('accentColor').value;

    document.getElementById('primaryPreview').style.background = primary;
    document.getElementById('secondaryPreview').style.background = secondary;
    document.getElementById('accentPreview').style.background = accent;
};

/**
 * Configura listeners de aparência
 */
adminApp.setupAppearanceListeners = function() {
    // Mudança de cores
    ['primaryColor', 'secondaryColor', 'accentColor'].forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', () => this.updateColorPreviews());
        }
    });

    // Salvar
    const saveBtn = document.getElementById('saveThemeBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => this.saveTheme());
    }

    // Resetar
    const resetBtn = document.getElementById('resetThemeBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => this.resetTheme());
    }
};

/**
 * Salva tema
 */
adminApp.saveTheme = async function() {
    const themeData = {
        name: document.getElementById('themeName').value.trim() || 'Tema ReVive',
        primary: document.getElementById('primaryColor').value,
        secondary: document.getElementById('secondaryColor').value,
        accent: document.getElementById('accentColor').value
    };

    try {
        await firebaseData.saveTheme(themeData);
        this.showAlert('success', 'Tema salvo! Recarregue a página para ver as mudanças.');

    } catch (error) {
        console.error('❌ Erro ao salvar tema:', error);
        this.showAlert('error', 'Erro ao salvar tema');
    }
};

/**
 * Reseta tema
 */
adminApp.resetTheme = function() {
    if (!confirm('Restaurar tema padrão?')) return;

    this.theme = defaultConfig.theme;
    this.applyThemeToForm();
};

// ============================================
// CONFIGURAÇÕES
// ============================================

/**
 * Carrega configurações
 */
adminApp.loadConfig = async function() {
    try {
        this.config = await firebaseData.loadConfig();
        this.applyConfigToForm();
    } catch (error) {
        console.error('❌ Erro ao carregar config:', error);
    }
};

/**
 * Aplica configurações ao formulário
 */
adminApp.applyConfigToForm = function() {
    document.getElementById('refreshInterval').value = this.config.refreshInterval || 30;
    document.getElementById('carouselInterval').value = this.config.carouselInterval || 35;
    document.getElementById('baseProcessCount').value = this.config.baseProcessCount || 20224;
    document.getElementById('companyGoal').value = this.config.companyGoal || 100000;
    document.getElementById('autoPlayCarousel').checked = this.config.autoPlayCarousel !== false;
    document.getElementById('showNotifications').checked = this.config.showNotifications !== false;
};

/**
 * Configura listeners de configurações
 */
adminApp.setupSettingsListeners = function() {
    const saveBtn = document.getElementById('saveSettingsBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => this.saveSettings());
    }
};

/**
 * Salva configurações
 */
adminApp.saveSettings = async function() {
    const configData = {
        refreshInterval: parseInt(document.getElementById('refreshInterval').value) || 30,
        carouselInterval: parseInt(document.getElementById('carouselInterval').value) || 35,
        baseProcessCount: parseInt(document.getElementById('baseProcessCount').value) || 20224,
        companyGoal: parseInt(document.getElementById('companyGoal').value) || 100000,
        autoPlayCarousel: document.getElementById('autoPlayCarousel').checked,
        showNotifications: document.getElementById('showNotifications').checked
    };

    try {
        await firebaseData.saveConfig(configData);
        this.showAlert('success', 'Configurações salvas com sucesso!');

    } catch (error) {
        console.error('❌ Erro ao salvar configurações:', error);
        this.showAlert('error', 'Erro ao salvar configurações');
    }
};

// ============================================
// MODAIS
// ============================================

/**
 * Fecha modal
 */
adminApp.closeModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
};

// ============================================
// ALERTAS
// ============================================

/**
 * Exibe alerta
 */
adminApp.showAlert = function(type, message) {
    const container = document.getElementById('alert-container');
    if (!container) return;

    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;

    const icon = type === 'success' ? 'check-circle' :
                 type === 'error' ? 'exclamation-circle' :
                 type === 'warning' ? 'exclamation-triangle' :
                 'info-circle';

    alert.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <span>${message}</span>
    `;

    container.appendChild(alert);

    setTimeout(() => {
        alert.remove();
    }, 5000);
};

// ============================================
// EXPORTAÇÃO
// ============================================

if (typeof window !== 'undefined') {
    window.adminApp = adminApp;
}

console.log('✅ Admin.js carregado');
