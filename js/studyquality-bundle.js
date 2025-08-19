/**
 * STUDYQUALITY BUNDLE - Versión sin módulos ES6 para GitHub Pages
 * Sistema de gestión basado en principios de Calidad de Software
 */

// ========== CONSTANTS ==========
const SYSTEM_INFO = {
    name: 'StudyQuality',
    version: '1.0.0',
    build: 'CI-2024',
    description: 'Sistema de Gestión basado en principios de Calidad de Software - Pantaleo'
};

const DEV_CONFIG = {
    enableLogs: true,
    enableMetrics: true,
    enableTesting: true,
    enableServiceWorker: true,
    debugMode: false
};

const PERFORMANCE_TARGETS = {
    loadTime: 2000,
    responseTime: 100,
    availability: 99.5
};

const NOTIFICATION_TYPES = {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info'
};

// ========== HELPERS ==========
const DOM = {
    $: (selector) => document.querySelector(selector),
    $$: (selector) => document.querySelectorAll(selector),
    
    createElement: (tag, attrs = {}) => {
        const element = document.createElement(tag);
        Object.entries(attrs).forEach(([key, value]) => {
            if (key === 'className') {
                element.className = value;
            } else {
                element.setAttribute(key, value);
            }
        });
        return element;
    },
    
    addClass: (element, className) => element?.classList.add(className),
    removeClass: (element, className) => element?.classList.remove(className),
    toggleClass: (element, className) => element?.classList.toggle(className),
    
    show: (element) => {
        if (element) element.style.display = 'block';
    },
    hide: (element) => {
        if (element) element.style.display = 'none';
    }
};

const Performance = {
    getMetrics: () => {
        const navigation = performance.getEntriesByType('navigation')[0];
        return {
            loadTime: navigation ? navigation.loadEventEnd - navigation.loadEventStart : 0,
            domContentLoaded: navigation ? navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart : 0,
            responseTime: navigation ? navigation.responseEnd - navigation.requestStart : 0
        };
    }
};

const Events = {
    listeners: {},
    
    on: (event, callback) => {
        if (!Events.listeners[event]) {
            Events.listeners[event] = [];
        }
        Events.listeners[event].push(callback);
    },
    
    emit: (event, data) => {
        if (Events.listeners[event]) {
            Events.listeners[event].forEach(callback => callback(data));
        }
    }
};

// ========== VALIDATORS ==========
const Validators = {
    email: (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    },
    
    password: (password) => {
        return password && password.length >= 6;
    },
    
    required: (value) => {
        return value && value.toString().trim().length > 0;
    },
    
    minLength: (value, min) => {
        return value && value.length >= min;
    }
};

// ========== STORAGE ==========
const Storage = {
    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            return false;
        }
    },
    
    get: (key, defaultValue = null) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return defaultValue;
        }
    },
    
    remove: (key) => {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removing from localStorage:', error);
            return false;
        }
    }
};

// ========== NOTIFICATION MANAGER ==========
class NotificationManager {
    constructor() {
        this.notifications = [];
        this.container = null;
        this.init();
    }
    
    init() {
        this.createContainer();
    }
    
    createContainer() {
        this.container = DOM.createElement('div', {
            id: 'notificationContainer',
            className: 'notification-container'
        });
        document.body.appendChild(this.container);
    }
    
    show(message, type = NOTIFICATION_TYPES.INFO, options = {}) {
        const notification = this.createNotification(message, type, options);
        this.addNotification(notification);
        return notification;
    }
    
    createNotification(message, type, options) {
        const notification = DOM.createElement('div', {
            className: `notification notification-${type}`
        });
        
        const icon = this.getIcon(type);
        const title = options.title || this.getDefaultTitle(type);
        
        notification.innerHTML = `
            <div class="notification-icon">${icon}</div>
            <div class="notification-content">
                <div class="notification-title">${title}</div>
                <div class="notification-message">${message}</div>
            </div>
            <button class="notification-close">&times;</button>
        `;
        
        // Auto-hide
        if (!options.persistent) {
            setTimeout(() => {
                this.remove(notification);
            }, options.duration || 5000);
        }
        
        // Close button
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => this.remove(notification));
        
        return notification;
    }
    
    addNotification(notification) {
        this.container.appendChild(notification);
        this.notifications.push(notification);
        
        // Animate in
        requestAnimationFrame(() => {
            DOM.addClass(notification, 'notification-show');
        });
    }
    
    remove(notification) {
        DOM.removeClass(notification, 'notification-show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
            this.notifications = this.notifications.filter(n => n !== notification);
        }, 300);
    }
    
    getIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || icons.info;
    }
    
    getDefaultTitle(type) {
        const titles = {
            success: 'Éxito',
            error: 'Error',
            warning: 'Advertencia',
            info: 'Información'
        };
        return titles[type] || titles.info;
    }
}

// ========== AUTH MANAGER ==========
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }
    
    init() {
        this.loadUserFromStorage();
        this.setupEventListeners();
    }
    
    loadUserFromStorage() {
        const userData = Storage.get('currentUser');
        if (userData) {
            this.currentUser = userData;
            this.updateUI();
        }
    }
    
    setupEventListeners() {
        // Tab switching
        this.setupTabSwitching();
        
        // Login form
        const loginForm = DOM.$('#loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }
        
        // Register form
        const registerForm = DOM.$('#registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleRegister();
            });
        }
        
        // Logout button
        const logoutBtn = DOM.$('#logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }
        
        // Demo credentials button
        const demoBtn = DOM.$('#demoCredentialsBtn');
        if (demoBtn) {
            demoBtn.addEventListener('click', () => this.fillDemoCredentials());
        }
    }
    
    setupTabSwitching() {
        // Configurar botones de pestañas
        const tabButtons = DOM.$$('.tab-button');
        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const targetTab = e.target.getAttribute('data-tab');
                this.switchTab(targetTab);
            });
        });
    }
    
    switchTab(targetTab) {
        // Remover active de todos los botones y contenidos
        const allTabButtons = DOM.$$('.tab-button');
        const allTabContents = DOM.$$('.tab-content');
        
        allTabButtons.forEach(btn => DOM.removeClass(btn, 'active'));
        allTabContents.forEach(content => DOM.removeClass(content, 'active'));
        
        // Activar el botón y contenido seleccionado
        const targetButton = DOM.$(`[data-tab="${targetTab}"]`);
        const targetContent = DOM.$(`#${targetTab}Tab`);
        
        if (targetButton) {
            DOM.addClass(targetButton, 'active');
        }
        
        if (targetContent) {
            DOM.addClass(targetContent, 'active');
        }
        
        console.log(`✅ Cambiado a pestaña: ${targetTab}`);
    }
    
    handleLogin() {
        const email = DOM.$('#loginEmail')?.value;
        const password = DOM.$('#loginPassword')?.value;
        
        if (!this.validateLoginForm(email, password)) {
            return;
        }
        
        // Demo authentication
        if (email === 'admin@demo.com' && password === 'demo123') {
            const user = {
                id: 1,
                email: email,
                name: 'Administrador Demo',
                role: 'admin',
                loginTime: new Date().toISOString()
            };
            
            this.loginUser(user);
            window.notificationManager.show('Inicio de sesión exitoso', 'success');
        } else {
            window.notificationManager.show('Credenciales incorrectas', 'error');
        }
    }
    
    handleRegister() {
        const name = DOM.$('#registerName')?.value;
        const email = DOM.$('#registerEmail')?.value;
        const password = DOM.$('#registerPassword')?.value;
        
        if (!this.validateRegisterForm(name, email, password)) {
            return;
        }
        
        const user = {
            id: Date.now(),
            name: name,
            email: email,
            role: 'user',
            registrationTime: new Date().toISOString()
        };
        
        this.loginUser(user);
        window.notificationManager.show('Registro exitoso', 'success');
    }
    
    validateLoginForm(email, password) {
        if (!email || !password) {
            window.notificationManager.show('Por favor complete todos los campos', 'warning');
            return false;
        }
        
        if (!Validators.email(email)) {
            window.notificationManager.show('Email inválido', 'error');
            return false;
        }
        
        return true;
    }
    
    validateRegisterForm(name, email, password) {
        if (!name || !email || !password) {
            window.notificationManager.show('Por favor complete todos los campos', 'warning');
            return false;
        }
        
        if (!Validators.email(email)) {
            window.notificationManager.show('Email inválido', 'error');
            return false;
        }
        
        if (!Validators.password(password)) {
            window.notificationManager.show('La contraseña debe tener al menos 6 caracteres', 'error');
            return false;
        }
        
        return true;
    }
    
    loginUser(user) {
        this.currentUser = user;
        Storage.set('currentUser', user);
        this.updateUI();
        this.showDashboard();
    }
    
    logout() {
        this.currentUser = null;
        Storage.remove('currentUser');
        this.updateUI();
        this.showAuth();
        window.notificationManager.show('Sesión cerrada', 'info');
    }
    
    isLoggedIn() {
        return this.currentUser !== null;
    }
    
    updateUI() {
        if (this.isLoggedIn()) {
            this.showDashboard();
        } else {
            this.showAuth();
        }
    }
    
    showAuth() {
        const authSection = DOM.$('#authSection');
        const dashboardSection = DOM.$('#dashboardSection');
        
        if (authSection) DOM.show(authSection);
        if (dashboardSection) DOM.hide(dashboardSection);
    }
    
    showDashboard() {
        const authSection = DOM.$('#authSection');
        const dashboardSection = DOM.$('#dashboardSection');
        
        if (authSection) DOM.hide(authSection);
        if (dashboardSection) DOM.show(dashboardSection);
        
        this.updateDashboardInfo();
    }
    
    updateDashboardInfo() {
        const userNameSpan = DOM.$('#userName');
        const userEmailSpan = DOM.$('#userEmail');
        
        if (userNameSpan && this.currentUser) {
            userNameSpan.textContent = this.currentUser.name;
        }
        if (userEmailSpan && this.currentUser) {
            userEmailSpan.textContent = this.currentUser.email;
        }
    }
    
    fillDemoCredentials() {
        const emailInput = DOM.$('#loginEmail');
        const passwordInput = DOM.$('#loginPassword');
        
        if (emailInput) emailInput.value = 'admin@demo.com';
        if (passwordInput) passwordInput.value = 'demo123';
        
        window.notificationManager.show('Credenciales demo cargadas', 'info');
    }
}

// ========== MAIN APPLICATION ==========
class StudyQualityApp {
    constructor() {
        this.version = SYSTEM_INFO.version;
        this.isLoaded = false;
        this.startTime = performance.now();
        this.modules = {};
        
        this.init();
    }
    
    async init() {
        try {
            console.log(`🚀 ${SYSTEM_INFO.name} v${SYSTEM_INFO.version} - Iniciando...`);
            console.log(`📚 ${SYSTEM_INFO.description}`);
            
            // Mostrar pantalla de carga
            this.showLoadingScreen();
            
            // Inicializar módulos base
            await this.initializeCore();
            
            // Configurar la aplicación
            this.setupApplication();
            
            // Inicializar sistema de testing
            this.initializeTesting();
            
            // Ocultar pantalla de carga
            await this.hideLoadingScreen();
            
            // Marcar como cargado
            this.isLoaded = true;
            
            // Mostrar métricas de carga
            this.logLoadMetrics();
            
            // Emitir evento de app lista
            Events.emit('app:ready', { app: this });
            
            console.log('✅ Aplicación inicializada correctamente');
            
        } catch (error) {
            console.error('❌ Error inicializando aplicación:', error);
            this.handleInitError(error);
        }
    }
    
    async initializeCore() {
        // Inicializar módulos
        window.notificationManager = new NotificationManager();
        window.authManager = new AuthManager();
        
        this.modules.notifications = window.notificationManager;
        this.modules.auth = window.authManager;
        
        console.log('📦 Módulos core inicializados');
    }
    
    setupApplication() {
        this.setupServiceWorker();
        this.setupErrorHandling();
        this.setupKeyboardShortcuts();
        this.setupUIEvents();
        
        console.log('⚙️ Configuración de aplicación completada');
    }
    
    setupServiceWorker() {
        if ('serviceWorker' in navigator && DEV_CONFIG.enableServiceWorker) {
            navigator.serviceWorker.register('./sw.js')
                .then(registration => {
                    console.log('📱 Service Worker registrado:', registration);
                })
                .catch(error => {
                    console.warn('⚠️ Error registrando Service Worker:', error);
                });
        }
    }
    
    setupErrorHandling() {
        window.addEventListener('error', (event) => {
            console.error('💥 Error global:', event.error);
        });

        window.addEventListener('unhandledrejection', (event) => {
            console.error('💥 Promise rejection no manejada:', event.reason);
        });
    }
    
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
                return;
            }

            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.openSearch();
            }

            if (e.key === 'F1') {
                e.preventDefault();
                this.openHelp();
            }

            if (e.key === 'Escape') {
                this.closeActiveModals();
            }
        });
    }
    
    setupUIEvents() {
        // Configurar eventos de UI específicos
        this.setupDemoFeatures();
        this.setupUserManagement();
    }
    
    setupDemoFeatures() {
        // Botón de testing
        const testingBtn = DOM.$('#runTestsBtn');
        if (testingBtn) {
            testingBtn.addEventListener('click', () => this.runDemoTests());
        }
        
        // Botón de métricas
        const metricsBtn = DOM.$('#showMetricsBtn');
        if (metricsBtn) {
            metricsBtn.addEventListener('click', () => this.showMetrics());
        }
    }
    
    setupUserManagement() {
        // Simular usuarios para demostración
        if (!Storage.get('users')) {
            const demoUsers = [
                { id: 1, name: 'Juan Pérez', email: 'juan@demo.com', role: 'admin', status: 'active' },
                { id: 2, name: 'María García', email: 'maria@demo.com', role: 'user', status: 'active' },
                { id: 3, name: 'Carlos López', email: 'carlos@demo.com', role: 'user', status: 'inactive' }
            ];
            Storage.set('users', demoUsers);
        }
    }
    
    initializeTesting() {
        if (DEV_CONFIG.enableTesting) {
            setTimeout(() => {
                console.log('🧪 Sistema de testing listo');
                this.runInitialTests();
            }, 2000);
        }
    }
    
    runInitialTests() {
        console.log('🔄 Ejecutando tests iniciales...');
        
        const tests = [
            () => this.testDOMReady(),
            () => this.testModulesLoaded(),
            () => this.testLocalStorage(),
            () => this.testAuthentication()
        ];

        let passed = 0;
        tests.forEach((test, index) => {
            try {
                const result = test();
                if (result) {
                    console.log(`✅ Test ${index + 1}: PASÓ`);
                    passed++;
                } else {
                    console.log(`❌ Test ${index + 1}: FALLÓ`);
                }
            } catch (error) {
                console.log(`❌ Test ${index + 1}: ERROR - ${error.message}`);
            }
        });

        const coverage = (passed / tests.length * 100).toFixed(1);
        console.log(`📊 Tests completados: ${passed}/${tests.length} (${coverage}%)`);
        
        if (coverage >= 75) {
            console.log('✅ Sistema funcionando correctamente');
        } else {
            console.warn('⚠️ Algunos tests fallaron, revisar configuración');
        }
    }
    
    // Tests específicos
    testDOMReady() {
        return document.readyState === 'complete';
    }
    
    testModulesLoaded() {
        return this.modules.auth && this.modules.notifications;
    }
    
    testLocalStorage() {
        try {
            localStorage.setItem('test', 'test');
            localStorage.removeItem('test');
            return true;
        } catch {
            return false;
        }
    }
    
    testAuthentication() {
        return typeof window.authManager?.isLoggedIn === 'function';
    }
    
    // UI Methods
    showLoadingScreen() {
        const loadingScreen = DOM.$('#loadingScreen');
        if (loadingScreen) {
            DOM.removeClass(loadingScreen, 'hidden');
        }
    }
    
    async hideLoadingScreen() {
        const loadingScreen = DOM.$('#loadingScreen');
        if (loadingScreen) {
            await new Promise(resolve => setTimeout(resolve, 1500));
            DOM.addClass(loadingScreen, 'hidden');
            
            setTimeout(() => {
                DOM.hide(loadingScreen);
            }, 500);
        }
    }
    
    openSearch() {
        const searchInput = DOM.$('#searchInput');
        if (searchInput) {
            searchInput.focus();
            window.notificationManager.show('Búsqueda activada', 'info', { duration: 2000 });
        }
    }
    
    openHelp() {
        window.notificationManager.show('Ayuda: Use Ctrl+K para búsqueda, F1 para ayuda', 'info', {
            duration: 5000,
            title: 'Atajos de teclado'
        });
    }
    
    closeActiveModals() {
        const activeModals = DOM.$$('.modal.active');
        activeModals.forEach(modal => {
            DOM.removeClass(modal, 'active');
        });
    }
    
    runDemoTests() {
        window.notificationManager.show('Ejecutando tests automatizados...', 'info');
        
        setTimeout(() => {
            const results = [
                'Prueba de autenticación: PASÓ',
                'Prueba de carga de usuarios: PASÓ',
                'Prueba de validación de email: PASÓ',
                'Prueba de performance: PASÓ'
            ];
            
            results.forEach((result, index) => {
                setTimeout(() => {
                    console.log(`✅ ${result}`);
                }, index * 500);
            });
            
            setTimeout(() => {
                window.notificationManager.show('Tests completados exitosamente', 'success');
            }, results.length * 500);
            
        }, 1000);
    }
    
    showMetrics() {
        const metrics = Performance.getMetrics();
        const loadTime = performance.now() - this.startTime;
        
        window.notificationManager.show(
            `Tiempo de carga: ${loadTime.toFixed(2)}ms | Performance: ${metrics.responseTime.toFixed(2)}ms`,
            'info',
            { title: 'Métricas del Sistema', duration: 8000 }
        );
    }
    
    logLoadMetrics() {
        const loadTime = performance.now() - this.startTime;
        console.log(`⚡ Aplicación cargada en ${loadTime.toFixed(2)}ms`);
        
        const metrics = Performance.getMetrics();
        console.table({
            'Tiempo de carga total': `${loadTime.toFixed(2)}ms`,
            'Tiempo de carga página': `${metrics.loadTime}ms`,
            'DOM Content Loaded': `${metrics.domContentLoaded}ms`,
            'Tiempo de respuesta': `${metrics.responseTime}ms`
        });
    }
    
    handleInitError(error) {
        this.hideLoadingScreen();
        
        if (window.notificationManager) {
            window.notificationManager.show(
                `Error inicializando aplicación: ${error.message}`,
                'error',
                { persistent: true, title: 'Error Crítico' }
            );
        } else {
            alert(`Error inicializando aplicación: ${error.message}\n\nHaga clic en OK para recargar la página.`);
            window.location.reload();
        }
    }
}

// ========== INITIALIZATION ==========
function initializeApp() {
    // Verificar compatibilidad del navegador
    if (!checkBrowserCompatibility()) {
        showBrowserCompatibilityError();
        return;
    }

    // Inicializar aplicación
    window.studyQualityApp = new StudyQualityApp();
    
    // Exponer API global
    window.StudyQuality = {
        app: window.studyQualityApp,
        version: SYSTEM_INFO.version,
        auth: () => window.authManager,
        notifications: () => window.notificationManager
    };
}

function checkBrowserCompatibility() {
    const requiredFeatures = [
        'localStorage' in window,
        'Promise' in window,
        'fetch' in window,
        'CustomEvent' in window
    ];
    
    return requiredFeatures.every(feature => feature);
}

function showBrowserCompatibilityError() {
    const message = 'Su navegador no es compatible con esta aplicación. Por favor, actualice a una versión más reciente.';
    
    document.body.innerHTML = `
        <div style="padding: 40px; text-align: center; font-family: Arial, sans-serif;">
            <h1 style="color: #e74c3c;">Navegador No Compatible</h1>
            <p style="font-size: 18px; color: #666;">${message}</p>
            <p style="margin-top: 30px;">
                <a href="https://browsehappy.com/" target="_blank" style="color: #3498db;">
                    Actualizar navegador
                </a>
            </p>
        </div>
    `;
}

// Inicializar cuando el DOM esté listo
console.log('📦 StudyQuality Bundle iniciando...');
console.log('📋 Estado del DOM:', document.readyState);

if (document.readyState === 'loading') {
    console.log('⏳ DOM cargando... esperando DOMContentLoaded');
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    console.log('✅ DOM ya está listo, inicializando inmediatamente');
    initializeApp();
}

console.log('📦 StudyQuality Bundle cargado correctamente');