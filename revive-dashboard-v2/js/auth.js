/**
 * ReVive Dashboard v2 - Sistema de Autenticação
 * Gerencia login, logout e verificação de permissões
 */

// ============================================
// VARIÁVEIS GLOBAIS
// ============================================

let auth = null;
let db = null;
let currentUser = null;

// ============================================
// INICIALIZAÇÃO
// ============================================

/**
 * Inicializa o sistema de autenticação
 */
async function initAuth() {
    try {
        // Inicializa Firebase se ainda não foi inicializado
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }

        auth = firebase.auth();
        db = firebase.firestore();

        console.log('✅ Sistema de autenticação inicializado');

        // Observa mudanças no estado de autenticação
        auth.onAuthStateChanged(async (user) => {
            if (user) {
                console.log('👤 Usuário autenticado:', user.email);
                currentUser = user;
                await loadUserData(user.uid);
            } else {
                console.log('🚪 Usuário desconectado');
                currentUser = null;
            }
        });

    } catch (error) {
        console.error('❌ Erro ao inicializar autenticação:', error);
        showError('Erro ao conectar com Firebase. Verifique as configurações.');
    }
}

// ============================================
// FUNÇÕES DE LOGIN/LOGOUT
// ============================================

/**
 * Realiza login com email e senha
 * @param {string} email
 * @param {string} password
 * @returns {Promise<Object>}
 */
async function login(email, password) {
    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        console.log('✅ Login realizado com sucesso');
        return { success: true, user: userCredential.user };
    } catch (error) {
        console.error('❌ Erro no login:', error);
        return {
            success: false,
            error: getErrorMessage(error.code)
        };
    }
}

/**
 * Cria nova conta de usuário
 * @param {string} email
 * @param {string} password
 * @returns {Promise<Object>}
 */
async function signup(email, password) {
    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // Cria documento de admin no Firestore
        await db.collection('admins').doc(user.uid).set({
            email: email,
            role: 'admin',
            permissions: ['all'],
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        console.log('✅ Conta criada com sucesso');
        return { success: true, user: user };
    } catch (error) {
        console.error('❌ Erro ao criar conta:', error);
        return {
            success: false,
            error: getErrorMessage(error.code)
        };
    }
}

/**
 * Realiza logout do usuário
 * @returns {Promise<boolean>}
 */
async function logout() {
    try {
        await auth.signOut();
        console.log('✅ Logout realizado com sucesso');
        currentUser = null;
        return true;
    } catch (error) {
        console.error('❌ Erro ao fazer logout:', error);
        return false;
    }
}

/**
 * Reseta senha do usuário
 * @param {string} email
 * @returns {Promise<Object>}
 */
async function resetPassword(email) {
    try {
        await auth.sendPasswordResetEmail(email);
        console.log('✅ Email de recuperação enviado');
        return {
            success: true,
            message: 'Email de recuperação enviado. Verifique sua caixa de entrada.'
        };
    } catch (error) {
        console.error('❌ Erro ao resetar senha:', error);
        return {
            success: false,
            error: getErrorMessage(error.code)
        };
    }
}

// ============================================
// VERIFICAÇÃO DE PERMISSÕES
// ============================================

/**
 * Carrega dados do usuário do Firestore
 * @param {string} uid
 */
async function loadUserData(uid) {
    try {
        const doc = await db.collection('admins').doc(uid).get();

        if (doc.exists) {
            const userData = doc.data();
            currentUser = {
                ...currentUser,
                ...userData
            };
            console.log('✅ Dados do usuário carregados:', userData);
        } else {
            console.warn('⚠️ Usuário sem documento de admin');
        }
    } catch (error) {
        console.error('❌ Erro ao carregar dados do usuário:', error);
    }
}

/**
 * Verifica se o usuário atual é admin
 * @returns {boolean}
 */
function isAdmin() {
    return currentUser && currentUser.role === 'admin';
}

/**
 * Verifica se usuário está autenticado
 * @returns {boolean}
 */
function isAuthenticated() {
    return currentUser !== null;
}

/**
 * Verifica se usuário tem uma permissão específica
 * @param {string} permission
 * @returns {boolean}
 */
function hasPermission(permission) {
    if (!currentUser || !currentUser.permissions) return false;

    return currentUser.permissions.includes('all') ||
           currentUser.permissions.includes(permission);
}

/**
 * Obtém usuário atual
 * @returns {Object|null}
 */
function getCurrentUser() {
    return currentUser;
}

// ============================================
// PROTEÇÃO DE PÁGINAS
// ============================================

/**
 * Protege página administrativa
 * Redireciona para login se não autenticado
 */
function requireAuth() {
    auth.onAuthStateChanged((user) => {
        if (!user) {
            console.warn('🚫 Acesso negado - redirecionando para login');
            window.location.href = 'login.html';
        }
    });
}

/**
 * Protege página administrativa com verificação de admin
 * Redireciona para login se não for admin
 */
function requireAdmin() {
    auth.onAuthStateChanged(async (user) => {
        if (!user) {
            console.warn('🚫 Acesso negado - redirecionando para login');
            window.location.href = 'login.html';
            return;
        }

        await loadUserData(user.uid);

        if (!isAdmin()) {
            console.warn('🚫 Acesso negado - usuário não é admin');
            alert('Você não tem permissão para acessar esta página.');
            window.location.href = 'index.html';
        }
    });
}

/**
 * Verifica se já está autenticado (para página de login)
 * Redireciona para dashboard se já estiver logado
 */
function redirectIfAuthenticated() {
    auth.onAuthStateChanged((user) => {
        if (user) {
            console.log('✅ Usuário já autenticado - redirecionando');
            window.location.href = 'admin.html';
        }
    });
}

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

/**
 * Traduz códigos de erro do Firebase
 * @param {string} errorCode
 * @returns {string}
 */
function getErrorMessage(errorCode) {
    const errorMessages = {
        'auth/email-already-in-use': 'Este email já está em uso.',
        'auth/invalid-email': 'Email inválido.',
        'auth/operation-not-allowed': 'Operação não permitida.',
        'auth/weak-password': 'Senha muito fraca. Use pelo menos 6 caracteres.',
        'auth/user-disabled': 'Esta conta foi desabilitada.',
        'auth/user-not-found': 'Usuário não encontrado.',
        'auth/wrong-password': 'Senha incorreta.',
        'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde.',
        'auth/network-request-failed': 'Erro de conexão. Verifique sua internet.'
    };

    return errorMessages[errorCode] || 'Erro desconhecido. Tente novamente.';
}

/**
 * Exibe mensagem de erro
 * @param {string} message
 */
function showError(message) {
    console.error('❌', message);

    // Se houver um elemento de erro na página, exibe lá
    const errorElement = document.getElementById('error-message');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';

        // Esconde após 5 segundos
        setTimeout(() => {
            errorElement.style.display = 'none';
        }, 5000);
    } else {
        alert(message);
    }
}

/**
 * Exibe mensagem de sucesso
 * @param {string} message
 */
function showSuccess(message) {
    console.log('✅', message);

    const successElement = document.getElementById('success-message');
    if (successElement) {
        successElement.textContent = message;
        successElement.style.display = 'block';

        setTimeout(() => {
            successElement.style.display = 'none';
        }, 3000);
    } else {
        alert(message);
    }
}

// ============================================
// EXPORTAÇÃO
// ============================================

if (typeof window !== 'undefined') {
    window.authSystem = {
        init: initAuth,
        login,
        signup,
        logout,
        resetPassword,
        isAdmin,
        isAuthenticated,
        hasPermission,
        getCurrentUser,
        requireAuth,
        requireAdmin,
        redirectIfAuthenticated,
        showError,
        showSuccess
    };
}

console.log('✅ Sistema de autenticação carregado');
