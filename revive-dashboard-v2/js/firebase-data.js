/**
 * ReVive Dashboard v2 - Gerenciamento de Dados Firebase
 * Funções para CRUD no Firestore e Storage
 */

// ============================================
// VARIÁVEIS GLOBAIS
// ============================================

let db = null;
let storage = null;

// ============================================
// INICIALIZAÇÃO
// ============================================

/**
 * Inicializa Firestore e Storage
 */
function initFirebaseData() {
    try {
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }

        db = firebase.firestore();
        storage = firebase.storage();

        console.log('✅ Firestore e Storage inicializados');
    } catch (error) {
        console.error('❌ Erro ao inicializar Firebase Data:', error);
    }
}

// ============================================
// CONFIGURAÇÕES GERAIS
// ============================================

/**
 * Carrega configurações do sistema
 * @returns {Promise<Object>}
 */
async function loadConfig() {
    try {
        const doc = await db.collection('config').doc('settings').get();

        if (doc.exists) {
            console.log('✅ Configurações carregadas do Firebase');
            return doc.data();
        } else {
            console.log('⚠️ Configurações não encontradas, usando padrões');
            return defaultConfig;
        }
    } catch (error) {
        console.error('❌ Erro ao carregar configurações:', error);
        return defaultConfig;
    }
}

/**
 * Salva configurações do sistema
 * @param {Object} config
 * @returns {Promise<boolean>}
 */
async function saveConfig(config) {
    try {
        await db.collection('config').doc('settings').set(config, { merge: true });
        console.log('✅ Configurações salvas');
        return true;
    } catch (error) {
        console.error('❌ Erro ao salvar configurações:', error);
        return false;
    }
}

// ============================================
// EVENTOS
// ============================================

/**
 * Carrega todos os eventos
 * @returns {Promise<Array>}
 */
async function loadEvents() {
    try {
        const snapshot = await db.collection('events')
            .orderBy('date', 'desc')
            .get();

        const events = [];
        snapshot.forEach(doc => {
            events.push({
                id: doc.id,
                ...doc.data()
            });
        });

        console.log(`✅ ${events.length} eventos carregados`);
        return events;
    } catch (error) {
        console.error('❌ Erro ao carregar eventos:', error);
        return [];
    }
}

/**
 * Adiciona novo evento
 * @param {Object} eventData
 * @returns {Promise<string|null>}
 */
async function addEvent(eventData) {
    try {
        const docRef = await db.collection('events').add({
            ...eventData,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        console.log('✅ Evento adicionado:', docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('❌ Erro ao adicionar evento:', error);
        return null;
    }
}

/**
 * Atualiza evento existente
 * @param {string} eventId
 * @param {Object} eventData
 * @returns {Promise<boolean>}
 */
async function updateEvent(eventId, eventData) {
    try {
        await db.collection('events').doc(eventId).update(eventData);
        console.log('✅ Evento atualizado:', eventId);
        return true;
    } catch (error) {
        console.error('❌ Erro ao atualizar evento:', error);
        return false;
    }
}

/**
 * Remove evento
 * @param {string} eventId
 * @returns {Promise<boolean>}
 */
async function deleteEvent(eventId) {
    try {
        await db.collection('events').doc(eventId).delete();
        console.log('✅ Evento removido:', eventId);
        return true;
    } catch (error) {
        console.error('❌ Erro ao remover evento:', error);
        return false;
    }
}

// ============================================
// METAS
// ============================================

/**
 * Carrega metas de um mês específico
 * @param {string} monthKey - Formato: "MM-YYYY"
 * @returns {Promise<Object>}
 */
async function loadGoals(monthKey) {
    try {
        const doc = await db.collection('goals').doc(monthKey).get();

        if (doc.exists) {
            console.log(`✅ Metas carregadas para ${monthKey}`);
            return doc.data();
        } else {
            console.log(`⚠️ Metas não encontradas para ${monthKey}, usando padrões`);
            return defaultConfig.defaultGoals;
        }
    } catch (error) {
        console.error('❌ Erro ao carregar metas:', error);
        return defaultConfig.defaultGoals;
    }
}

/**
 * Salva metas de um mês
 * @param {string} monthKey - Formato: "MM-YYYY"
 * @param {Object} goals
 * @returns {Promise<boolean>}
 */
async function saveGoals(monthKey, goals) {
    try {
        await db.collection('goals').doc(monthKey).set({
            month: monthKey,
            ...goals,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        console.log(`✅ Metas salvas para ${monthKey}`);
        return true;
    } catch (error) {
        console.error('❌ Erro ao salvar metas:', error);
        return false;
    }
}

/**
 * Carrega todas as metas (histórico)
 * @returns {Promise<Array>}
 */
async function loadAllGoals() {
    try {
        const snapshot = await db.collection('goals')
            .orderBy('month', 'desc')
            .get();

        const goals = [];
        snapshot.forEach(doc => {
            goals.push({
                id: doc.id,
                ...doc.data()
            });
        });

        console.log(`✅ ${goals.length} metas carregadas`);
        return goals;
    } catch (error) {
        console.error('❌ Erro ao carregar todas as metas:', error);
        return [];
    }
}

// ============================================
// CONSULTORES
// ============================================

/**
 * Carrega todos os consultores
 * @returns {Promise<Array>}
 */
async function loadConsultants() {
    try {
        const snapshot = await db.collection('consultants')
            .where('active', '==', true)
            .get();

        const consultants = [];
        snapshot.forEach(doc => {
            consultants.push({
                id: doc.id,
                ...doc.data()
            });
        });

        console.log(`✅ ${consultants.length} consultores carregados`);
        return consultants;
    } catch (error) {
        console.error('❌ Erro ao carregar consultores:', error);
        return [];
    }
}

/**
 * Adiciona novo consultor
 * @param {Object} consultantData
 * @returns {Promise<string|null>}
 */
async function addConsultant(consultantData) {
    try {
        const docRef = await db.collection('consultants').add({
            ...consultantData,
            active: true,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        console.log('✅ Consultor adicionado:', docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('❌ Erro ao adicionar consultor:', error);
        return null;
    }
}

/**
 * Atualiza consultor
 * @param {string} consultantId
 * @param {Object} consultantData
 * @returns {Promise<boolean>}
 */
async function updateConsultant(consultantId, consultantData) {
    try {
        await db.collection('consultants').doc(consultantId).update(consultantData);
        console.log('✅ Consultor atualizado:', consultantId);
        return true;
    } catch (error) {
        console.error('❌ Erro ao atualizar consultor:', error);
        return false;
    }
}

/**
 * Desativa consultor (soft delete)
 * @param {string} consultantId
 * @returns {Promise<boolean>}
 */
async function deactivateConsultant(consultantId) {
    try {
        await db.collection('consultants').doc(consultantId).update({
            active: false
        });
        console.log('✅ Consultor desativado:', consultantId);
        return true;
    } catch (error) {
        console.error('❌ Erro ao desativar consultor:', error);
        return false;
    }
}

// ============================================
// CATEGORIAS DE PROCESSOS
// ============================================

/**
 * Carrega todas as categorias de processos
 * @returns {Promise<Array>}
 */
async function loadProcessCategories() {
    try {
        const snapshot = await db.collection('processCategories')
            .orderBy('order')
            .get();

        const categories = [];
        snapshot.forEach(doc => {
            categories.push({
                id: doc.id,
                ...doc.data()
            });
        });

        console.log(`✅ ${categories.length} categorias carregadas`);
        return categories;
    } catch (error) {
        console.error('❌ Erro ao carregar categorias:', error);
        return [];
    }
}

/**
 * Adiciona nova categoria
 * @param {Object} categoryData
 * @returns {Promise<string|null>}
 */
async function addProcessCategory(categoryData) {
    try {
        const docRef = await db.collection('processCategories').add(categoryData);
        console.log('✅ Categoria adicionada:', docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('❌ Erro ao adicionar categoria:', error);
        return null;
    }
}

/**
 * Atualiza categoria
 * @param {string} categoryId
 * @param {Object} categoryData
 * @returns {Promise<boolean>}
 */
async function updateProcessCategory(categoryId, categoryData) {
    try {
        await db.collection('processCategories').doc(categoryId).update(categoryData);
        console.log('✅ Categoria atualizada:', categoryId);
        return true;
    } catch (error) {
        console.error('❌ Erro ao atualizar categoria:', error);
        return false;
    }
}

// ============================================
// TEMAS
// ============================================

/**
 * Carrega tema ativo
 * @returns {Promise<Object>}
 */
async function loadActiveTheme() {
    try {
        const doc = await db.collection('themes').doc('active').get();

        if (doc.exists) {
            console.log('✅ Tema ativo carregado');
            return doc.data();
        } else {
            console.log('⚠️ Tema não encontrado, usando padrão');
            return defaultConfig.theme;
        }
    } catch (error) {
        console.error('❌ Erro ao carregar tema:', error);
        return defaultConfig.theme;
    }
}

/**
 * Salva tema ativo
 * @param {Object} themeData
 * @returns {Promise<boolean>}
 */
async function saveTheme(themeData) {
    try {
        await db.collection('themes').doc('active').set(themeData);
        console.log('✅ Tema salvo');
        return true;
    } catch (error) {
        console.error('❌ Erro ao salvar tema:', error);
        return false;
    }
}

// ============================================
// UPLOAD DE IMAGENS
// ============================================

/**
 * Faz upload de imagem para Storage
 * @param {File} file
 * @param {string} path - Caminho no Storage (ex: 'events/foto.jpg')
 * @param {Function} onProgress - Callback de progresso (opcional)
 * @returns {Promise<string|null>} - URL da imagem ou null
 */
async function uploadImage(file, path, onProgress = null) {
    try {
        const storageRef = storage.ref(path);
        const uploadTask = storageRef.put(file);

        return new Promise((resolve, reject) => {
            uploadTask.on(
                'state_changed',
                (snapshot) => {
                    // Progresso do upload
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    console.log(`Upload: ${progress.toFixed(0)}%`);

                    if (onProgress) {
                        onProgress(progress);
                    }
                },
                (error) => {
                    // Erro no upload
                    console.error('❌ Erro no upload:', error);
                    reject(error);
                },
                async () => {
                    // Upload completo, obtém URL
                    try {
                        const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
                        console.log('✅ Upload concluído:', downloadURL);
                        resolve(downloadURL);
                    } catch (error) {
                        console.error('❌ Erro ao obter URL:', error);
                        reject(error);
                    }
                }
            );
        });
    } catch (error) {
        console.error('❌ Erro ao fazer upload:', error);
        return null;
    }
}

/**
 * Remove imagem do Storage
 * @param {string} url - URL completa da imagem
 * @returns {Promise<boolean>}
 */
async function deleteImage(url) {
    try {
        const storageRef = storage.refFromURL(url);
        await storageRef.delete();
        console.log('✅ Imagem removida');
        return true;
    } catch (error) {
        console.error('❌ Erro ao remover imagem:', error);
        return false;
    }
}

// ============================================
// LISTENERS EM TEMPO REAL
// ============================================

/**
 * Escuta mudanças em eventos em tempo real
 * @param {Function} callback
 * @returns {Function} - Função para cancelar listener
 */
function listenEvents(callback) {
    return db.collection('events')
        .orderBy('date', 'desc')
        .onSnapshot(
            (snapshot) => {
                const events = [];
                snapshot.forEach(doc => {
                    events.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });
                callback(events);
            },
            (error) => {
                console.error('❌ Erro no listener de eventos:', error);
            }
        );
}

/**
 * Escuta mudanças em configurações
 * @param {Function} callback
 * @returns {Function} - Função para cancelar listener
 */
function listenConfig(callback) {
    return db.collection('config').doc('settings')
        .onSnapshot(
            (doc) => {
                if (doc.exists) {
                    callback(doc.data());
                }
            },
            (error) => {
                console.error('❌ Erro no listener de config:', error);
            }
        );
}

// ============================================
// EXPORTAÇÃO
// ============================================

if (typeof window !== 'undefined') {
    window.firebaseData = {
        init: initFirebaseData,

        // Configurações
        loadConfig,
        saveConfig,

        // Eventos
        loadEvents,
        addEvent,
        updateEvent,
        deleteEvent,

        // Metas
        loadGoals,
        saveGoals,
        loadAllGoals,

        // Consultores
        loadConsultants,
        addConsultant,
        updateConsultant,
        deactivateConsultant,

        // Categorias
        loadProcessCategories,
        addProcessCategory,
        updateProcessCategory,

        // Temas
        loadActiveTheme,
        saveTheme,

        // Upload
        uploadImage,
        deleteImage,

        // Listeners
        listenEvents,
        listenConfig
    };
}

console.log('✅ Firebase Data carregado');
