/**
 * ReVive Dashboard v2 - Lógica do Dashboard
 * Gerencia dados, visualizações, rankings e gráficos
 */

// ============================================
// VARIÁVEIS GLOBAIS
// ============================================

const dashboardApp = {
    // Dados
    salesDataSC: [],
    salesDataCE: [],
    rankingData: [],
    paymentsData: [],
    rtmPaymentsData: [],
    acordosData: [],

    // Configurações
    config: null,
    currentMonth: null,
    carouselInterval: null,
    carouselPlaying: true,
    currentPageIndex: 0,

    // Gráfico
    chart: null,

    // Estado
    initialized: false
};

// ============================================
// INICIALIZAÇÃO
// ============================================

/**
 * Inicializa o dashboard
 */
dashboardApp.init = async function() {
    if (this.initialized) return;

    console.log('🚀 Inicializando dashboard...');

    try {
        // Carrega configurações (Firebase ou padrão)
        await this.loadConfig();

        // Configura eventos
        this.setupEventListeners();

        // Popula seletor de meses
        this.populateMonthSelector();

        // Carrega dados iniciais
        await this.fetchAllData();

        // Inicia carrossel
        this.startCarousel();

        // Configura atualização automática
        this.startAutoRefresh();

        this.initialized = true;
        console.log('✅ Dashboard inicializado com sucesso');

    } catch (error) {
        console.error('❌ Erro ao inicializar dashboard:', error);
        this.showConnectionError();
    }
};

// ============================================
// CONFIGURAÇÕES
// ============================================

/**
 * Carrega configurações do Firebase ou usa padrão
 */
dashboardApp.loadConfig = async function() {
    try {
        if (typeof firebaseData !== 'undefined') {
            this.config = await firebaseData.loadConfig();
            console.log('✅ Configurações carregadas do Firebase');
        } else {
            this.config = defaultConfig;
            console.log('⚠️ Usando configurações padrão');
        }
    } catch (error) {
        console.error('❌ Erro ao carregar configurações:', error);
        this.config = defaultConfig;
    }
};

// ============================================
// BUSCA DE DADOS
// ============================================

/**
 * Busca todos os dados em paralelo
 */
dashboardApp.fetchAllData = async function() {
    console.log('📥 Buscando dados...');
    this.showConnectionStatus('loading', 'Carregando dados...');

    try {
        // Busca dados em paralelo
        const promises = [
            this.fetchSalesData('SC'),
            this.fetchSalesData('CE'),
            this.fetchRankingData(),
            this.fetchRTMPayments()
        ];

        await Promise.all(promises);

        // Atualiza interface
        this.updateDashboard();

        this.showConnectionStatus('connected', 'Conectado - Dados atualizados');
        console.log('✅ Dados carregados com sucesso');

    } catch (error) {
        console.error('❌ Erro ao buscar dados:', error);
        this.showConnectionStatus('error', 'Erro ao carregar dados');
    }
};

/**
 * Busca dados de vendas de uma região
 * @param {string} region - 'SC' ou 'CE'
 */
dashboardApp.fetchSalesData = async function(region) {
    try {
        const sheetKey = region === 'SC' ? 'salesSC' : 'salesCE';
        const url = getSheetCsvUrl(sheetKey);

        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const csvText = await response.text();
        const data = this.parseSalesCSV(csvText);

        if (region === 'SC') {
            this.salesDataSC = data;
        } else {
            this.salesDataCE = data;
        }

        console.log(`✅ Vendas ${region} carregadas:`, data.length);

    } catch (error) {
        console.error(`❌ Erro ao buscar vendas ${region}:`, error);
    }
};

/**
 * Busca dados de ranking
 */
dashboardApp.fetchRankingData = async function() {
    try {
        const url = getSheetCsvUrl('ranking');

        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const csvText = await response.text();
        this.rankingData = this.parseRankingCSV(csvText);

        console.log('✅ Ranking carregado:', this.rankingData.length);

    } catch (error) {
        console.error('❌ Erro ao buscar ranking:', error);
    }
};

/**
 * Busca pagamentos RTM
 */
dashboardApp.fetchRTMPayments = async function() {
    try {
        const url = getSheetCsvUrl('rtmPayments');

        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const csvText = await response.text();
        this.rtmPaymentsData = this.parseRTMCSV(csvText);

        console.log('✅ RTM carregado:', this.rtmPaymentsData.length);

    } catch (error) {
        console.error('❌ Erro ao buscar RTM:', error);
    }
};

// ============================================
// PARSING DE CSV
// ============================================

/**
 * Parse CSV de vendas
 * @param {string} csv
 * @returns {Array}
 */
dashboardApp.parseSalesCSV = function(csv) {
    const lines = csv.trim().split('\n');
    if (lines.length < 2) return [];

    const data = [];

    for (let i = 1; i < lines.length; i++) {
        const values = utils.parseCSVLine(lines[i]);

        if (values.length >= 4) {
            data.push({
                data: values[0] || '',
                cliente: values[1] || '',
                processo: values[2] || '',
                consultor: values[3] || ''
            });
        }
    }

    return data;
};

/**
 * Parse CSV de ranking
 * @param {string} csv
 * @returns {Array}
 */
dashboardApp.parseRankingCSV = function(csv) {
    const lines = csv.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = utils.parseCSVLine(lines[0]);
    const data = [];

    for (let i = 1; i < lines.length; i++) {
        const values = utils.parseCSVLine(lines[i]);

        if (values[0]) {
            const consultant = {
                name: values[0],
                details: {}
            };

            // Contabiliza processos por tipo
            let total = 0;
            for (let j = 1; j < headers.length; j++) {
                const count = parseInt(values[j]) || 0;
                consultant.details[headers[j]] = count;
                total += count;
            }

            consultant.sales = total;
            data.push(consultant);
        }
    }

    // Ordena por vendas
    return data.sort((a, b) => b.sales - a.sales);
};

/**
 * Parse CSV de RTM
 * @param {string} csv
 * @returns {Array}
 */
dashboardApp.parseRTMCSV = function(csv) {
    const lines = csv.trim().split('\n');
    if (lines.length < 2) return [];

    const data = [];

    for (let i = 1; i < lines.length; i++) {
        const values = utils.parseCSVLine(lines[i]);

        if (values.length >= 4) {
            data.push({
                cliente: values[0] || '',
                valor: values[1] || '',
                data: values[2] || '',
                cobrador: values[3] || ''
            });
        }
    }

    return data;
};

// ============================================
// ATUALIZAÇÃO DA UI
// ============================================

/**
 * Atualiza todo o dashboard
 */
dashboardApp.updateDashboard = function() {
    const month = this.currentMonth || this.getCurrentMonth();

    // Filtra dados do mês
    const salesSCMonth = this.filterByMonth(this.salesDataSC, month);
    const salesCEMonth = this.filterByMonth(this.salesDataCE, month);

    // Atualiza estatísticas
    this.updateStats(salesSCMonth, salesCEMonth, month);

    // Atualiza metas
    this.updateGoals(salesSCMonth, salesCEMonth, month);

    // Atualiza rankings
    this.updateRankings();

    // Atualiza tabelas
    this.updateSalesTables(salesSCMonth, salesCEMonth);

    // Atualiza RTM
    this.updateRTM();

    // Atualiza eventos
    this.updateEvents();

    // Atualiza gráfico (se estiver visível)
    this.updateChart();
};

/**
 * Atualiza estatísticas
 */
dashboardApp.updateStats = function(salesSC, salesCE, month) {
    const totalSC = salesSC.length;
    const totalCE = salesCE.length;
    const totalGlobal = totalSC + totalCE;

    // Total global
    document.getElementById('totalMonthGlobal').textContent = utils.formatNumber(totalGlobal);
    document.getElementById('monthLabelGlobal').textContent = `processos em ${this.getMonthName(month)}`;

    // Total SC
    document.getElementById('totalMonthSC').textContent = utils.formatNumber(totalSC);
    document.getElementById('monthLabelSC').textContent = `processos em ${this.getMonthName(month)}`;

    // Total CE
    document.getElementById('totalMonthCE').textContent = utils.formatNumber(totalCE);

    // Média diária SC
    const avgSC = this.calculateDailyAverage(salesSC, month);
    document.getElementById('dailyAverageSC').textContent = avgSC.toFixed(1);

    // Média diária CE
    const avgCE = this.calculateDailyAverage(salesCE, month);
    document.getElementById('dailyAverageCE').textContent = avgCE.toFixed(1);

    // Melhor consultor SC
    const topSC = this.getTopConsultant(salesSC);
    this.updateTopConsultant('SC', topSC);

    // Melhor consultor CE
    const topCE = this.getTopConsultant(salesCE);
    this.updateTopConsultant('CE', topCE);
};

/**
 * Atualiza metas de processos
 */
dashboardApp.updateGoals = async function(salesSC, salesCE, month) {
    const allSales = [...salesSC, ...salesCE];

    // Carrega metas do Firebase ou usa padrão
    let goals = this.config.defaultGoals;

    if (typeof firebaseData !== 'undefined') {
        try {
            const monthKey = utils.getMonthKey(new Date());
            goals = await firebaseData.loadGoals(monthKey);
        } catch (error) {
            console.log('Usando metas padrão');
        }
    }

    // Contabiliza por tipo
    const counts = this.countByProcessType(allSales);

    // Previdenciários
    document.getElementById('previdenciariosCount').textContent = utils.formatNumber(counts.previdenciarios);
    document.getElementById('previdenciariosGoal').textContent = utils.formatNumber(goals.previdenciarios);
    document.getElementById('previdenciariosPercent').textContent =
        utils.calculatePercentage(counts.previdenciarios, goals.previdenciarios, 1);

    // Seguro Terceiro
    document.getElementById('seguroTerceiroCount').textContent = utils.formatNumber(counts.seguroTerceiro);
    document.getElementById('seguroTerceiroGoal').textContent = utils.formatNumber(goals.seguroTerceiro);
    document.getElementById('seguroTerceiroPercent').textContent =
        utils.calculatePercentage(counts.seguroTerceiro, goals.seguroTerceiro, 1);

    // Seguro de Vida
    document.getElementById('seguroVidaCount').textContent = utils.formatNumber(counts.seguroVida);
    document.getElementById('seguroVidaGoal').textContent = utils.formatNumber(goals.seguroVida);
    document.getElementById('seguroVidaPercent').textContent =
        utils.calculatePercentage(counts.seguroVida, goals.seguroVida, 1);

    // Outros
    document.getElementById('outrosCount').textContent = utils.formatNumber(counts.outros);
};

/**
 * Atualiza rankings
 */
dashboardApp.updateRankings = function() {
    const rankingSC = this.rankingData.filter(c => !CONSULTORES_CEARA.includes(c.name.toUpperCase()));
    const rankingCE = this.rankingData.filter(c => CONSULTORES_CEARA.includes(c.name.toUpperCase()));

    this.renderRanking('consultantRankingSC', rankingSC, 'SC');
    this.renderRanking('consultantRankingCE', rankingCE, 'CE');
};

/**
 * Renderiza ranking
 */
dashboardApp.renderRanking = function(elementId, data, region) {
    const container = document.getElementById(elementId);
    if (!container) return;

    let html = '';

    data.slice(0, 10).forEach((consultant, index) => {
        const rankClass = region === 'CE' ? 'rank-number-ce' : '';

        html += `
            <div class="ranking-item">
                <div class="consultant-info">
                    <div class="rank-number ${rankClass}">${index + 1}</div>
                    <div class="consultant-name">${consultant.name}</div>
                </div>
                <div class="sales-count">${consultant.sales}</div>
            </div>
        `;
    });

    container.innerHTML = html || '<p style="text-align: center; color: var(--color-text-muted);">Nenhum dado disponível</p>';
};

/**
 * Atualiza tabelas de vendas
 */
dashboardApp.updateSalesTables = function(salesSC, salesCE) {
    this.renderSalesTable('recentSalesTableSC', salesSC.slice(0, 50));
    this.renderSalesTable('recentSalesTableCE', salesCE.slice(0, 50));

    // Popula filtros de consultores
    this.populateConsultantFilter('consultantFilterSC', salesSC);
    this.populateConsultantFilter('consultantFilterCE', salesCE);
};

/**
 * Renderiza tabela de vendas
 */
dashboardApp.renderSalesTable = function(tableId, sales) {
    const tbody = document.getElementById(tableId);
    if (!tbody) return;

    let html = '';

    sales.forEach(sale => {
        html += `
            <tr>
                <td>${sale.data}</td>
                <td>${sale.cliente}</td>
                <td><span class="process-badge">${sale.processo}</span></td>
                <td>${sale.consultor}</td>
            </tr>
        `;
    });

    tbody.innerHTML = html || '<tr><td colspan="4" style="text-align: center; color: var(--color-text-muted);">Nenhum processo encontrado</td></tr>';
};

/**
 * Atualiza RTM
 */
dashboardApp.updateRTM = function() {
    // Conta RTMs de hoje
    const today = utils.formatDateBR(new Date());
    const rtmToday = this.rtmPaymentsData.filter(rtm => rtm.data === today);

    document.getElementById('rtmTodayCounter').textContent = rtmToday.length;

    // Renderiza tabela
    const tbody = document.getElementById('rtmPaymentsTableBody');
    if (!tbody) return;

    let html = '';

    this.rtmPaymentsData.slice(0, 100).forEach(rtm => {
        html += `
            <tr>
                <td>${rtm.data}</td>
                <td>${rtm.cliente}</td>
                <td style="font-weight: 600; color: var(--color-success);">${utils.formatCurrency(rtm.valor)}</td>
                <td>${rtm.cobrador}</td>
            </tr>
        `;
    });

    tbody.innerHTML = html || '<tr><td colspan="4" style="text-align: center;">Nenhum pagamento encontrado</td></tr>';
};

/**
 * Atualiza eventos (carrega do Firebase se disponível)
 */
dashboardApp.updateEvents = async function() {
    const container = document.getElementById('eventsTimeline');
    if (!container) return;

    let events = [];

    // Tenta carregar do Firebase
    if (typeof firebaseData !== 'undefined') {
        try {
            events = await firebaseData.loadEvents();
        } catch (error) {
            console.log('Usando eventos padrão');
        }
    }

    // Se não houver eventos, usa padrão
    if (events.length === 0) {
        events = [{
            title: 'Evento de Final de Ano - ReVive',
            date: '2025-12-20',
            description: 'O maior evento já realizado pela ReVive, com música ao vivo, apresentação de resultados e novidades incríveis.',
            imageUrl: null
        }];
    }

    let html = '<div style="position: relative; max-width: 1040px; margin: 65px auto; padding: 26px 0;">';

    events.forEach((event, index) => {
        const side = index % 2 === 0 ? 'left' : 'right';
        const date = new Date(event.date + 'T00:00:00');

        html += `
            <div style="padding: 13px 52px; position: relative; width: 50%; ${side === 'left' ? 'left: 0; text-align: right;' : 'left: 50%; text-align: left;'}">
                <div style="background: white; padding: 2rem; border-radius: 20px; box-shadow: 0 10px 42px rgba(139, 92, 246, 0.1); position: relative;">
                    <div style="background: linear-gradient(135deg, var(--color-primary), var(--color-primary-light)); color: white; padding: 10px 20px; border-radius: 26px; font-weight: 600; display: inline-block; margin-bottom: 13px; font-size: 1.1rem;">
                        ${utils.formatDateBR(date)}
                    </div>
                    <h3 style="font-size: 1.8rem; color: var(--color-primary-dark); margin-bottom: 10px;">${event.title}</h3>
                    <p style="font-size: 1.3rem; color: #555;">${event.description}</p>
                    ${event.imageUrl ? `<img src="${event.imageUrl}" style="width: 100%; max-height: 300px; object-fit: cover; border-radius: 10px; margin-top: 1rem;" alt="${event.title}">` : ''}
                </div>
            </div>
        `;
    });

    html += '</div>';

    container.innerHTML = html;
};

/**
 * Atualiza gráfico de evolução
 */
dashboardApp.updateChart = function() {
    const ctx = document.getElementById('processEvolutionChart');
    if (!ctx) return;

    // Dados do ano corrente
    const currentYear = new Date().getFullYear();
    const months = [];
    const dataPoints = [];

    for (let i = 0; i < 12; i++) {
        const monthDate = new Date(currentYear, i, 1);
        months.push(utils.getMonthName(i));

        // Filtra vendas do mês
        const salesMonth = this.filterByMonth([...this.salesDataSC, ...this.salesDataCE], monthDate);
        dataPoints.push(salesMonth.length);
    }

    // Destrói gráfico anterior
    if (this.chart) {
        this.chart.destroy();
    }

    // Cria novo gráfico
    this.chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: months,
            datasets: [{
                label: 'Processos por Mês',
                data: dataPoints,
                borderColor: 'rgb(139, 92, 246)',
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                tension: 0.4,
                fill: true,
                pointRadius: 6,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    }
                }
            }
        }
    });
};

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

/**
 * Filtra vendas por mês
 */
dashboardApp.filterByMonth = function(sales, monthDate) {
    const month = monthDate.getMonth();
    const year = monthDate.getFullYear();

    return sales.filter(sale => {
        const saleDate = utils.parseDateBR(sale.data);
        if (!saleDate) return false;

        return saleDate.getMonth() === month && saleDate.getFullYear() === year;
    });
};

/**
 * Calcula média diária
 */
dashboardApp.calculateDailyAverage = function(sales, monthDate) {
    if (sales.length === 0) return 0;

    const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
    return sales.length / daysInMonth;
};

/**
 * Obtém melhor consultor
 */
dashboardApp.getTopConsultant = function(sales) {
    const counts = {};

    sales.forEach(sale => {
        const name = sale.consultor;
        counts[name] = (counts[name] || 0) + 1;
    });

    let topName = '';
    let topCount = 0;

    for (const [name, count] of Object.entries(counts)) {
        if (count > topCount) {
            topCount = count;
            topName = name;
        }
    }

    return { name: topName, count: topCount };
};

/**
 * Atualiza melhor consultor
 */
dashboardApp.updateTopConsultant = function(region, top) {
    const suffix = region === 'CE' ? 'CE' : '';
    const nameEl = document.getElementById(`topConsultant${suffix}`);
    const photoEl = document.getElementById(`topConsultantPhoto${suffix}`);

    if (nameEl) {
        nameEl.textContent = top.name || '-';
    }

    if (photoEl && top.name) {
        const photoUrl = this.getConsultantPhotoUrl(top.name);
        photoEl.src = photoUrl;
        photoEl.style.display = 'inline-block';

        photoEl.onerror = () => {
            photoEl.style.display = 'none';
        };
    }
};

/**
 * Obtém URL da foto do consultor
 */
dashboardApp.getConsultantPhotoUrl = function(name) {
    const firstName = name.split(' ')[0].toLowerCase();
    return `images/${firstName}.png`;
};

/**
 * Contabiliza por tipo de processo
 */
dashboardApp.countByProcessType = function(sales) {
    const counts = {
        previdenciarios: 0,
        seguroTerceiro: 0,
        seguroVida: 0,
        outros: 0
    };

    sales.forEach(sale => {
        const processo = sale.processo.toUpperCase();

        if (PROCESS_TYPES.previdenciarios.some(t => processo.includes(t))) {
            counts.previdenciarios++;
        } else if (PROCESS_TYPES.seguroTerceiro.some(t => processo.includes(t))) {
            counts.seguroTerceiro++;
        } else if (PROCESS_TYPES.seguroVida.some(t => processo.includes(t))) {
            counts.seguroVida++;
        } else {
            counts.outros++;
        }
    });

    return counts;
};

/**
 * Popula filtro de consultores
 */
dashboardApp.populateConsultantFilter = function(selectId, sales) {
    const select = document.getElementById(selectId);
    if (!select) return;

    const consultants = [...new Set(sales.map(s => s.consultor))].sort();

    let html = '<option value="all">Todos</option>';
    consultants.forEach(name => {
        html += `<option value="${name}">${name}</option>`;
    });

    select.innerHTML = html;
};

/**
 * Popula seletor de meses
 */
dashboardApp.populateMonthSelector = function() {
    const select = document.getElementById('monthFilter');
    if (!select) return;

    const currentDate = new Date();
    let html = '';

    // Últimos 12 meses
    for (let i = 0; i < 12; i++) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const value = utils.getMonthKey(date);
        const label = `${utils.getMonthName(date.getMonth())} ${date.getFullYear()}`;

        html += `<option value="${value}" ${i === 0 ? 'selected' : ''}>${label}</option>`;
    }

    select.innerHTML = html;
    this.currentMonth = this.getCurrentMonth();
};

/**
 * Obtém mês atual
 */
dashboardApp.getCurrentMonth = function() {
    return new Date();
};

/**
 * Obtém nome do mês
 */
dashboardApp.getMonthName = function(monthDate) {
    if (typeof monthDate === 'number') {
        return utils.getMonthName(monthDate);
    }
    return utils.getMonthName(monthDate.getMonth());
};

/**
 * Exibe status de conexão
 */
dashboardApp.showConnectionStatus = function(status, message) {
    const statusEl = document.getElementById('connectionStatus');
    const textEl = document.getElementById('statusText');

    if (!statusEl || !textEl) return;

    statusEl.className = 'connection-status';

    if (status === 'connected') {
        statusEl.classList.add('status-connected');
        textEl.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
    } else if (status === 'error') {
        statusEl.classList.add('status-error');
        textEl.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${message}`;
    } else {
        statusEl.classList.add('status-loading');
        textEl.innerHTML = `<i class="fas fa-sync fa-spin"></i> ${message}`;
    }
};

dashboardApp.showConnectionError = function() {
    this.showConnectionStatus('error', 'Falha na conexão. Tentando novamente...');
};

// ============================================
// CARROSSEL
// ============================================

/**
 * Inicia carrossel automático
 */
dashboardApp.startCarousel = function() {
    const interval = (this.config?.carouselInterval || 35) * 1000;

    this.carouselInterval = setInterval(() => {
        if (this.carouselPlaying) {
            this.nextPage();
        }
    }, interval);
};

/**
 * Para carrossel
 */
dashboardApp.stopCarousel = function() {
    if (this.carouselInterval) {
        clearInterval(this.carouselInterval);
    }
};

/**
 * Próxima página
 */
dashboardApp.nextPage = function() {
    const pages = document.querySelectorAll('.carousel-page');
    const currentPage = pages[this.currentPageIndex];

    currentPage.classList.remove('active');

    this.currentPageIndex = (this.currentPageIndex + 1) % pages.length;

    const nextPage = pages[this.currentPageIndex];
    nextPage.classList.add('active');
    nextPage.classList.add('fade-in');

    // Atualiza gráfico se for a página de charts
    if (nextPage.id === 'chart-view') {
        setTimeout(() => this.updateChart(), 100);
    }
};

/**
 * Página anterior
 */
dashboardApp.prevPage = function() {
    const pages = document.querySelectorAll('.carousel-page');
    const currentPage = pages[this.currentPageIndex];

    currentPage.classList.remove('active');

    this.currentPageIndex = (this.currentPageIndex - 1 + pages.length) % pages.length;

    const prevPage = pages[this.currentPageIndex];
    prevPage.classList.add('active');
    prevPage.classList.add('fade-in');
};

/**
 * Vai para página específica
 */
dashboardApp.goToPage = function(pageId) {
    const pages = document.querySelectorAll('.carousel-page');
    const targetPage = document.getElementById(pageId);

    if (!targetPage) return;

    pages.forEach((page, index) => {
        if (page === targetPage) {
            this.currentPageIndex = index;
            page.classList.add('active');
        } else {
            page.classList.remove('active');
        }
    });

    // Atualiza gráfico se necessário
    if (pageId === 'chart-view') {
        setTimeout(() => this.updateChart(), 100);
    }
};

/**
 * Toggle carrossel
 */
dashboardApp.toggleCarousel = function() {
    this.carouselPlaying = !this.carouselPlaying;

    const btn = document.getElementById('carouselToggleBtn');
    if (btn) {
        btn.innerHTML = this.carouselPlaying ?
            '<i class="fas fa-pause"></i>' :
            '<i class="fas fa-play"></i>';
        btn.title = this.carouselPlaying ? 'Pausar Carrossel' : 'Iniciar Carrossel';
    }
};

// ============================================
// ATUALIZAÇÃO AUTOMÁTICA
// ============================================

/**
 * Inicia atualização automática
 */
dashboardApp.startAutoRefresh = function() {
    const interval = (this.config?.refreshInterval || 30) * 1000;

    setInterval(() => {
        console.log('🔄 Atualizando dados...');
        this.fetchAllData();
    }, interval);
};

// ============================================
// EVENT LISTENERS
// ============================================

/**
 * Configura event listeners
 */
dashboardApp.setupEventListeners = function() {
    // Filtro de mês
    const monthFilter = document.getElementById('monthFilter');
    if (monthFilter) {
        monthFilter.addEventListener('change', (e) => {
            const [month, year] = e.target.value.split('-');
            this.currentMonth = new Date(parseInt(year), parseInt(month) - 1, 1);
            this.updateDashboard();
        });
    }

    // Seletor de página
    const pageSelector = document.getElementById('pageSelector');
    if (pageSelector) {
        pageSelector.addEventListener('change', (e) => {
            this.goToPage(e.target.value);
        });
    }

    // Botões do carrossel
    const prevBtn = document.getElementById('carouselPrevBtn');
    if (prevBtn) {
        prevBtn.addEventListener('click', () => this.prevPage());
    }

    const nextBtn = document.getElementById('carouselNextBtn');
    if (nextBtn) {
        nextBtn.addEventListener('click', () => this.nextPage());
    }

    const toggleBtn = document.getElementById('carouselToggleBtn');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => this.toggleCarousel());
    }

    // Filtros de consultores
    const filterSC = document.getElementById('consultantFilterSC');
    if (filterSC) {
        filterSC.addEventListener('change', (e) => {
            this.filterTableByConsultant('recentSalesTableSC', this.salesDataSC, e.target.value);
        });
    }

    const filterCE = document.getElementById('consultantFilterCE');
    if (filterCE) {
        filterCE.addEventListener('change', (e) => {
            this.filterTableByConsultant('recentSalesTableCE', this.salesDataCE, e.target.value);
        });
    }
};

/**
 * Filtra tabela por consultor
 */
dashboardApp.filterTableByConsultant = function(tableId, allSales, consultant) {
    const filtered = consultant === 'all' ?
        allSales :
        allSales.filter(s => s.consultor === consultant);

    const monthFiltered = this.filterByMonth(filtered, this.currentMonth || this.getCurrentMonth());
    this.renderSalesTable(tableId, monthFiltered.slice(0, 50));
};

// ============================================
// EXPORTAÇÃO
// ============================================

if (typeof window !== 'undefined') {
    window.dashboardApp = dashboardApp;
}

console.log('✅ Dashboard.js carregado');
