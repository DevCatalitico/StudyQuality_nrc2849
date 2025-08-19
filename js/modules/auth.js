/**
 * AUTH MODULE - StudyQuality System
 * Módulo de autenticación y autorización
 */

import { DOM, Time } from '../utils/helpers.js';
import { FormValidator } from '../utils/validators.js';
import { AuthAPI } from '../utils/api.js';
import { sessionStorage } from '../utils/storage.js';
import { showNotification } from './notifications.js';

/**
 * Clase principal de autenticación
 */
export class AuthManager {
    constructor() {
        this.loginValidator = null;
        this.registerValidator = null;
        this.currentUser = null;
        this.sessionTimeout = 30 * 60 * 1000; // 30 minutos
        this.sessionTimer = null;
        
        this.init();
    }

    /**
     * Inicializa el módulo de autenticación
     */
    init() {
        this.setupEventListeners();
        this.setupFormValidators();
        this.checkExistingSession();
        this.setupPasswordToggles();
        this.startSessionMonitoring();
    }

    /**
     * Configura los event listeners
     */
    setupEventListeners() {
        // Cambio de pestañas
        const tabButtons = DOM.$$('.tab-button');
        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const tab = e.target.dataset.tab;
                if (tab) {
                    this.switchTab(tab);
                }
            });
        });

        // Logout
        const logoutBtn = DOM.$('#logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.logout();
            });
        }

        // Teclas de acceso rápido
        document.addEventListener('keydown', (e) => {
            // Alt + L para abrir login
            if (e.altKey && e.key === 'l') {
                e.preventDefault();
                this.focusLoginForm();
            }
        });
    }

    /**
     * Configura los validadores de formularios
     */
    setupFormValidators() {
        const loginForm = DOM.$('#loginForm');
        const registerForm = DOM.$('#registerForm');

        if (loginForm) {
            this.loginValidator = new FormValidator(loginForm);
            this.loginValidator.onValidSubmit = (data) => {
                this.handleLogin(data);
            };
        }

        if (registerForm) {
            this.registerValidator = new FormValidator(registerForm);
            this.registerValidator.onValidSubmit = (data) => {
                this.handleRegister(data);
            };
        }
    }

    /**
     * Configura los toggles de contraseña
     */
    setupPasswordToggles() {
        const passwordToggles = DOM.$$('.password-toggle');
        passwordToggles.forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = toggle.dataset.target;
                const passwordField = DOM.$(`#${targetId}`);
                
                if (passwordField) {
                    const isPassword = passwordField.type === 'password';
                    passwordField.type = isPassword ? 'text' : 'password';
                    toggle.textContent = isPassword ? '🙈' : '👁️';
                }
            });
        });
    }

    /**
     * Cambia entre pestañas de autenticación
     * @param {string} tabName - Nombre de la pestaña
     */
    switchTab(tabName) {
        // Actualizar botones
        DOM.$$('.tab-button').forEach(btn => {
            DOM.removeClass(btn, 'active');
        });
        DOM.addClass(DOM.$(`[data-tab="${tabName}"]`), 'active');

        // Actualizar contenido
        DOM.$$('.tab-content').forEach(content => {
            DOM.removeClass(content, 'active');
        });
        DOM.addClass(DOM.$(`#${tabName}Tab`), 'active');

        // Limpiar formularios
        this.clearForms();

        // Enfocar primer campo
        setTimeout(() => {
            const activeTab = DOM.$(`#${tabName}Tab`);
            const firstInput = activeTab?.querySelector('input');
            if (firstInput) {
                firstInput.focus();
            }
        }, 100);
    }

    /**
     * Maneja el proceso de login
     * @param {Object} credentials - Credenciales de usuario
     */
    async handleLogin(credentials) {
        try {
            this.setFormLoading('loginForm', true);

            const response = await AuthAPI.login(credentials);

            if (response.success) {
                this.currentUser = response.data.user;
                this.onLoginSuccess(response.data.user);
                showNotification(response.message, 'success');
            }
        } catch (error) {
            this.handleAuthError(error);
        } finally {
            this.setFormLoading('loginForm', false);
        }
    }

    /**
     * Maneja el proceso de registro
     * @param {Object} userData - Datos del usuario
     */
    async handleRegister(userData) {
        try {
            this.setFormLoading('registerForm', true);

            const response = await AuthAPI.register(userData);

            if (response.success) {
                this.currentUser = response.data.user;
                this.onLoginSuccess(response.data.user);
                showNotification(response.message, 'success');
            }
        } catch (error) {
            this.handleAuthError(error);
        } finally {
            this.setFormLoading('registerForm', false);
        }
    }

    /**
     * Maneja el logout
     */
    async logout() {
        try {
            await AuthAPI.logout();
            this.onLogoutSuccess();
            showNotification('Sesión cerrada correctamente', 'success');
        } catch (error) {
            console.error('Error during logout:', error);
            // Forzar logout local incluso si hay error en API
            this.onLogoutSuccess();
        }
    }

    /**
     * Callback de login exitoso
     * @param {Object} user - Datos del usuario
     */
    onLoginSuccess(user) {
        this.currentUser = user;
        this.hideAuthSection();
        this.showDashboard(user);
        this.startSessionTimer();
        this.logAuthEvent('LOGIN_SUCCESS', user);
    }

    /**
     * Callback de logout exitoso
     */
    onLogoutSuccess() {
        this.currentUser = null;
        this.stopSessionTimer();
        this.showAuthSection();
        this.hideDashboard();
        this.clearForms();
        this.logAuthEvent('LOGOUT_SUCCESS');
    }

    /**
     * Maneja errores de autenticación
     * @param {Error} error - Error ocurrido
     */
    handleAuthError(error) {
        let message = 'Error de autenticación';
        
        if (error.status === 401) {
            message = 'Credenciales incorrectas';
        } else if (error.status === 409) {
            message = 'El usuario ya existe';
        } else if (error.message) {
            message = error.message;
        }

        showNotification(message, 'error');
        this.logAuthEvent('AUTH_ERROR', null, { error: error.message });
    }

    /**
     * Verifica si existe una sesión activa
     */
    checkExistingSession() {
        if (sessionStorage.isLoggedIn() && !sessionStorage.isSessionExpired()) {
            const user = sessionStorage.getCurrentUser();
            if (user) {
                this.onLoginSuccess(user);
            }
        } else {
            // Limpiar sesión expirada
            sessionStorage.logout();
        }
    }

    /**
     * Inicia el monitoreo de sesión
     */
    startSessionMonitoring() {
        // Actualizar actividad en cada interacción
        ['click', 'keypress', 'mousemove', 'scroll'].forEach(event => {
            document.addEventListener(event, Time.throttle(() => {
                if (this.currentUser) {
                    sessionStorage.updateActivity();
                }
            }, 60000), { passive: true }); // Cada minuto máximo
        });

        // Verificar expiración cada minuto
        setInterval(() => {
            if (this.currentUser && sessionStorage.isSessionExpired()) {
                this.handleSessionExpired();
            }
        }, 60000);
    }

    /**
     * Maneja la expiración de sesión
     */
    handleSessionExpired() {
        showNotification('Su sesión ha expirado. Por favor, inicie sesión nuevamente.', 'warning');
        this.logout();
    }

    /**
     * Inicia el temporizador de sesión
     */
    startSessionTimer() {
        this.stopSessionTimer();
        
        this.sessionTimer = setTimeout(() => {
            this.handleSessionExpired();
        }, this.sessionTimeout);
    }

    /**
     * Detiene el temporizador de sesión
     */
    stopSessionTimer() {
        if (this.sessionTimer) {
            clearTimeout(this.sessionTimer);
            this.sessionTimer = null;
        }
    }

    /**
     * UI Helpers
     */
    
    hideAuthSection() {
        const authSection = DOM.$('#authSection');
        if (authSection) {
            DOM.hide(authSection);
        }
    }

    showAuthSection() {
        const authSection = DOM.$('#authSection');
        if (authSection) {
            DOM.show(authSection);
        }
    }

    showDashboard(user) {
        const dashboard = DOM.$('#dashboard');
        if (dashboard) {
            DOM.addClass(dashboard, 'active');
            this.updateDashboardUser(user);
        }
    }

    hideDashboard() {
        const dashboard = DOM.$('#dashboard');
        if (dashboard) {
            DOM.removeClass(dashboard, 'active');
        }
    }

    updateDashboardUser(user) {
        const userName = DOM.$('#userName');
        const userRole = DOM.$('#userRole');
        const userAvatar = DOM.$('#userAvatar');

        if (userName) userName.textContent = user.name;
        if (userRole) {
            userRole.textContent = user.role === 'admin' ? 'Administrador' : 'Usuario';
        }
        if (userAvatar) {
            userAvatar.textContent = user.name.charAt(0).toUpperCase();
        }
    }

    setFormLoading(formId, isLoading) {
        const form = DOM.$(`#${formId}`);
        const submitBtn = form?.querySelector('button[type="submit"]');
        
        if (submitBtn) {
            if (isLoading) {
                DOM.addClass(submitBtn, 'loading');
                submitBtn.disabled = true;
            } else {
                DOM.removeClass(submitBtn, 'loading');
                submitBtn.disabled = false;
            }
        }
        
        if (form) {
            if (isLoading) {
                DOM.addClass(form, 'form-loading');
            } else {
                DOM.removeClass(form, 'form-loading');
            }
        }
    }

    clearForms() {
        if (this.loginValidator) {
            this.loginValidator.reset();
        }
        if (this.registerValidator) {
            this.registerValidator.reset();
        }
    }

    focusLoginForm() {
        this.switchTab('login');
        const emailField = DOM.$('#loginEmail');
        if (emailField) {
            emailField.focus();
        }
    }

    /**
     * Utilidades
     */

    isLoggedIn() {
        return this.currentUser !== null;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    hasRole(role) {
        return this.currentUser && this.currentUser.role === role;
    }

    isAdmin() {
        return this.hasRole('admin');
    }

    logAuthEvent(event, user = null, data = {}) {
        console.log(`🔐 Auth Event: ${event}`, {
            user: user ? { id: user.id, email: user.email } : null,
            timestamp: new Date().toISOString(),
            ...data
        });
    }
}

/**
 * Validación de fortaleza de contraseña en tiempo real
 */
export function setupPasswordStrengthIndicator() {
    const passwordFields = DOM.$$('input[type="password"]');
    
    passwordFields.forEach(field => {
        const strengthIndicator = field.parentElement.parentElement.querySelector('.password-strength');
        
        if (strengthIndicator) {
            field.addEventListener('input', () => {
                const password = field.value;
                const strength = calculatePasswordStrength(password);
                
                strengthIndicator.className = `password-strength ${strength}`;
            });
        }
    });
}

/**
 * Calcula la fortaleza de una contraseña
 * @param {string} password - Contraseña a evaluar
 * @returns {string} Nivel de fortaleza
 */
function calculatePasswordStrength(password) {
    if (!password) return '';
    
    let score = 0;
    
    // Longitud
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    
    // Tipos de caracteres
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;
    
    // Patrones comunes (penalizar)
    if (/(.)\1{2,}/.test(password)) score--; // Caracteres repetidos
    if (/123|abc|qwe/i.test(password)) score--; // Secuencias comunes
    
    if (score <= 2) return 'weak';
    if (score === 3) return 'fair';
    if (score === 4) return 'good';
    return 'strong';
}

/**
 * Autocompletar credenciales demo
 */
export function setupDemoCredentialsHelper() {
    const demoCredentials = DOM.$('.demo-credentials');
    
    if (demoCredentials) {
        demoCredentials.addEventListener('click', () => {
            const emailField = DOM.$('#loginEmail');
            const passwordField = DOM.$('#loginPassword');
            
            if (emailField && passwordField) {
                emailField.value = 'admin@demo.com';
                passwordField.value = 'demo123';
                
                // Disparar eventos de validación
                emailField.dispatchEvent(new Event('input', { bubbles: true }));
                passwordField.dispatchEvent(new Event('input', { bubbles: true }));
            }
        });
    }
}

// Instancia global
export const authManager = new AuthManager();

// Funciones de utilidad exportadas
export const auth = {
    isLoggedIn: () => authManager.isLoggedIn(),
    getCurrentUser: () => authManager.getCurrentUser(),
    hasRole: (role) => authManager.hasRole(role),
    isAdmin: () => authManager.isAdmin(),
    logout: () => authManager.logout()
};

export default {
    AuthManager,
    authManager,
    auth,
    setupPasswordStrengthIndicator,
    setupDemoCredentialsHelper
};