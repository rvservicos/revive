/**
 * ReVive Dashboard v2 - Funções Utilitárias
 * Funções auxiliares reutilizáveis em todo o sistema
 */

// ============================================
// FORMATAÇÃO DE DATAS
// ============================================

/**
 * Formata data para padrão brasileiro (DD/MM/YYYY)
 * @param {Date|string} date
 * @returns {string}
 */
function formatDateBR(date) {
    if (!date) return '-';

    const d = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(d.getTime())) return '-';

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    return `${day}/${month}/${year}`;
}

/**
 * Formata data e hora para padrão brasileiro
 * @param {Date|string} date
 * @returns {string}
 */
function formatDateTimeBR(date) {
    if (!date) return '-';

    const d = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(d.getTime())) return '-';

    const datePart = formatDateBR(d);
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');

    return `${datePart} ${hours}:${minutes}`;
}

/**
 * Converte data brasileira (DD/MM/YYYY) para Date
 * @param {string} dateStr
 * @returns {Date}
 */
function parseDateBR(dateStr) {
    if (!dateStr) return null;

    const parts = dateStr.split('/');
    if (parts.length !== 3) return null;

    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);

    return new Date(year, month, day);
}

/**
 * Retorna nome do mês em português
 * @param {number} month - Mês (0-11)
 * @returns {string}
 */
function getMonthName(month) {
    const months = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return months[month] || '';
}

/**
 * Retorna chave do mês no formato MM-YYYY
 * @param {Date} date
 * @returns {string}
 */
function getMonthKey(date) {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}-${year}`;
}

/**
 * Verifica se a data é hoje
 * @param {Date|string} date
 * @returns {boolean}
 */
function isToday(date) {
    const d = typeof date === 'string' ? parseDateBR(date) : date;
    if (!d) return false;

    const today = new Date();
    return d.getDate() === today.getDate() &&
           d.getMonth() === today.getMonth() &&
           d.getFullYear() === today.getFullYear();
}

// ============================================
// FORMATAÇÃO DE NÚMEROS E MOEDA
// ============================================

/**
 * Formata número com separador de milhares
 * @param {number} num
 * @returns {string}
 */
function formatNumber(num) {
    if (num === null || num === undefined) return '0';
    return num.toLocaleString('pt-BR');
}

/**
 * Formata valor monetário em BRL
 * @param {number|string} value
 * @returns {string}
 */
function formatCurrency(value) {
    if (!value) return 'R$ 0,00';

    const numValue = typeof value === 'string' ?
        parseFloat(value.replace(/[^\d,]/g, '').replace(',', '.')) :
        value;

    if (isNaN(numValue)) return 'R$ 0,00';

    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(numValue);
}

/**
 * Calcula porcentagem
 * @param {number} value
 * @param {number} total
 * @param {number} decimals
 * @returns {string}
 */
function calculatePercentage(value, total, decimals = 1) {
    if (!total || total === 0) return '0%';

    const percent = (value / total) * 100;
    return `${percent.toFixed(decimals)}%`;
}

// ============================================
// MANIPULAÇÃO DE STRINGS
// ============================================

/**
 * Capitaliza primeira letra
 * @param {string} str
 * @returns {string}
 */
function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Normaliza nome (primeira letra maiúscula em cada palavra)
 * @param {string} name
 * @returns {string}
 */
function normalizeName(name) {
    if (!name) return '';

    return name
        .toLowerCase()
        .split(' ')
        .map(word => capitalize(word))
        .join(' ');
}

/**
 * Remove acentos de string
 * @param {string} str
 * @returns {string}
 */
function removeAccents(str) {
    if (!str) return '';

    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Gera slug a partir de string
 * @param {string} str
 * @returns {string}
 */
function slugify(str) {
    if (!str) return '';

    return removeAccents(str)
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

/**
 * Trunca texto com elipse
 * @param {string} text
 * @param {number} maxLength
 * @returns {string}
 */
function truncate(text, maxLength) {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

// ============================================
// PARSING DE CSV
// ============================================

/**
 * Faz parse de linha CSV considerando vírgulas dentro de aspas
 * @param {string} line
 * @returns {Array<string>}
 */
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }

    result.push(current.trim());
    return result;
}

/**
 * Converte CSV completo em array de objetos
 * @param {string} csv
 * @param {boolean} hasHeader
 * @returns {Array<Object>}
 */
function parseCSV(csv, hasHeader = true) {
    const lines = csv.trim().split('\n');
    if (lines.length === 0) return [];

    const headers = hasHeader ? parseCSVLine(lines[0]) : null;
    const startIndex = hasHeader ? 1 : 0;

    const data = [];
    for (let i = startIndex; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);

        if (hasHeader) {
            const obj = {};
            headers.forEach((header, index) => {
                obj[header] = values[index] || '';
            });
            data.push(obj);
        } else {
            data.push(values);
        }
    }

    return data;
}

// ============================================
// VALIDAÇÃO
// ============================================

/**
 * Valida email
 * @param {string} email
 * @returns {boolean}
 */
function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

/**
 * Valida URL
 * @param {string} url
 * @returns {boolean}
 */
function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

/**
 * Valida senha (mínimo 6 caracteres)
 * @param {string} password
 * @returns {boolean}
 */
function isValidPassword(password) {
    return password && password.length >= 6;
}

// ============================================
// DEBOUNCE E THROTTLE
// ============================================

/**
 * Debounce - executa função após delay sem novos calls
 * @param {Function} func
 * @param {number} wait
 * @returns {Function}
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle - executa função no máximo uma vez por intervalo
 * @param {Function} func
 * @param {number} limit
 * @returns {Function}
 */
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ============================================
// STORAGE LOCAL
// ============================================

/**
 * Salva item no localStorage
 * @param {string} key
 * @param {any} value
 */
function saveToStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error('Erro ao salvar no localStorage:', error);
    }
}

/**
 * Carrega item do localStorage
 * @param {string} key
 * @param {any} defaultValue
 * @returns {any}
 */
function loadFromStorage(key, defaultValue = null) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error('Erro ao carregar do localStorage:', error);
        return defaultValue;
    }
}

/**
 * Remove item do localStorage
 * @param {string} key
 */
function removeFromStorage(key) {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error('Erro ao remover do localStorage:', error);
    }
}

// ============================================
// ANIMAÇÕES E UI
// ============================================

/**
 * Adiciona classe com delay e remove após duração
 * @param {HTMLElement} element
 * @param {string} className
 * @param {number} duration
 */
function flashClass(element, className, duration = 1000) {
    if (!element) return;

    element.classList.add(className);
    setTimeout(() => {
        element.classList.remove(className);
    }, duration);
}

/**
 * Scroll suave até elemento
 * @param {HTMLElement|string} target
 */
function scrollToElement(target) {
    const element = typeof target === 'string' ?
        document.querySelector(target) :
        target;

    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

/**
 * Copia texto para área de transferência
 * @param {string} text
 * @returns {Promise<boolean>}
 */
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (error) {
        console.error('Erro ao copiar:', error);
        return false;
    }
}

// ============================================
// ARRAYS E OBJETOS
// ============================================

/**
 * Ordena array de objetos por propriedade
 * @param {Array} array
 * @param {string} property
 * @param {boolean} ascending
 * @returns {Array}
 */
function sortByProperty(array, property, ascending = true) {
    return [...array].sort((a, b) => {
        const aVal = a[property];
        const bVal = b[property];

        if (aVal < bVal) return ascending ? -1 : 1;
        if (aVal > bVal) return ascending ? 1 : -1;
        return 0;
    });
}

/**
 * Agrupa array de objetos por propriedade
 * @param {Array} array
 * @param {string} property
 * @returns {Object}
 */
function groupBy(array, property) {
    return array.reduce((acc, obj) => {
        const key = obj[property];
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(obj);
        return acc;
    }, {});
}

/**
 * Remove duplicatas de array
 * @param {Array} array
 * @returns {Array}
 */
function unique(array) {
    return [...new Set(array)];
}

// ============================================
// EXPORTAÇÃO
// ============================================

if (typeof window !== 'undefined') {
    window.utils = {
        // Datas
        formatDateBR,
        formatDateTimeBR,
        parseDateBR,
        getMonthName,
        getMonthKey,
        isToday,

        // Números
        formatNumber,
        formatCurrency,
        calculatePercentage,

        // Strings
        capitalize,
        normalizeName,
        removeAccents,
        slugify,
        truncate,

        // CSV
        parseCSVLine,
        parseCSV,

        // Validação
        isValidEmail,
        isValidUrl,
        isValidPassword,

        // Performance
        debounce,
        throttle,

        // Storage
        saveToStorage,
        loadFromStorage,
        removeFromStorage,

        // UI
        flashClass,
        scrollToElement,
        copyToClipboard,

        // Arrays
        sortByProperty,
        groupBy,
        unique
    };
}

console.log('✅ Utilitários carregados');
