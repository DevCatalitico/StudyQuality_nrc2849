/**
 * APP.JS - StudyQuality System
 * Aplicación principal basada en principios de Calidad de Software
 */

import { SYSTEM_INFO, DEV_CONFIG, PERFORMANCE_TARGETS } from './utils/constants.js';
import { DOM, Performance, Events } from './utils/helpers.js';
import { authManager, setupPasswordStrengthIndicator, setupDemoCredentialsHelper } from './modules/auth.js';
import { notificationManager, showNotification, showSystemStatus } from './modules/notifications.js';

/**
 * Clase principal de la aplicación
 */
class StudyQualityApp {
    constructor() {
        this.version = SYSTEM_INFO.version;
        this.isLoaded = false;
        this.startTime = performance.now();
        this.modules = {};
        
        this.init();
    }

    /**
     * Inicializa la aplicación
     */
    async init() {
        try {
            console.log(`🚀 ${SYSTEM_INFO.name} v${SYSTEM_INFO.version} - Iniciando...`);
            console.log(`📚 ${SYSTEM_INFO.description}`);
            
            // Mostrar pantalla de carga
            this.showLoadingScreen();
            
            // Inicializar módulos base
            await this.initializeCore();
            
            // Cargar módulos dinámicamente
            await this.loadModules();
            
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

    /**
     * Inicializa los módulos core
     */
    async initializeCore() {
        // Los módulos core ya están inicializados por sus importaciones
        this.modules.auth = authManager;
        this.modules.notifications = notificationManager;
        
        console.log('📦 Módulos core inicializados');
    }

    /**
     * Carga módulos dinámicamente
     */
    async loadModules() {
        const modulePromises = [];
        
        // Cargar módulos solo cuando son necesarios
        if (authManager.isLoggedIn()) {
            modulePromises.push(this.loadDashboardModules());
        }
        
        await Promise.all(modulePromises);
        console.log('🔄 Módulos dinámicos cargados');
    }

    /**
     * Carga módulos del dashboard
     */
    async loadDashboardModules() {
        try {
            // Simular carga de módulos (en una app real sería import() dinámico)
            await this.simulateModuleLoad('users');
            await this.simulateModuleLoad('reports');
            await this.simulateModuleLoad('analytics');
            
            console.log('📊 Módulos del dashboard cargados');
        } catch (error) {
            console.error('Error cargando módulos del dashboard:', error);
        }
    }

    /**
     * Simula la carga de un módulo
     */
    async simulateModuleLoad(moduleName) {
        const loadTime = Math.random() * 500 + 100; // 100-600ms
        await new Promise(resolve => setTimeout(resolve, loadTime));
        console.log(`  ✓ Módulo ${moduleName} cargado en ${loadTime.toFixed(0)}ms`);
    }

    /**
     * Configura la aplicación
     */
    setupApplication() {
        this.setupServiceWorker();
        this.setupErrorHandling();
        this.setupPerformanceMonitoring();
        this.setupKeyboardShortcuts();
        this.setupAccessibility();
        this.setupTheme();
        
        // Configurar helpers específicos
        setupPasswordStrengthIndicator();
        setupDemoCredentialsHelper();
        
        console.log('⚙️ Configuración de aplicación completada');
    }

    /**
     * Configura Service Worker
     */
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

    /**
     * Configura manejo de errores globales
     */
    setupErrorHandling() {
        window.addEventListener('error', (event) => {
            console.error('💥 Error global:', event.error);
            this.logError('JavaScript Error', event.error);
        });

        window.addEventListener('unhandledrejection', (event) => {
            console.error('💥 Promise rejection no manejada:', event.reason);
            this.logError('Unhandled Promise Rejection', event.reason);
        });
    }

    /**
     * Configura monitoreo de rendimiento
     */
    setupPerformanceMonitoring() {
        // Monitorear métricas de rendimiento
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.entryType === 'navigation') {
                        this.logPerformanceMetric('Navigation', entry);
                    }
                }
            });
            
            observer.observe({ entryTypes: ['navigation'] });
        }

        // Monitorear cada 30 segundos
        setInterval(() => {
            this.checkPerformanceTargets();
        }, 30000);
    }

    /**
     * Configura atajos de teclado globales
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Solo procesar si no estamos en un input
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
                return;
            }

            // Ctrl/Cmd + K para búsqueda
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.openSearch();
            }

            // F1 para ayuda
            if (e.key === 'F1') {
                e.preventDefault();
                this.openHelp();
            }

            // Escape para cerrar modales/notificaciones
            if (e.key === 'Escape') {
                this.closeActiveModals();
            }
        });
    }

    /**
     * Configura accesibilidad
     */
    setupAccessibility() {
        // Configurar navegación por teclado
        this.setupKeyboardNavigation();
        
        // Configurar anuncios para lectores de pantalla
        this.setupScreenReaderAnnouncements();
        
        // Configurar modo alto contraste
        this.setupHighContrastMode();
    }

    /**
     * Configura navegación por teclado
     */
    setupKeyboardNavigation() {
        // Agregar indicadores de foco visibles
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
        });

        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });
    }

    /**
     * Configura anuncios para lectores de pantalla
     */
    setupScreenReaderAnnouncements() {
        // Crear elemento para anuncios
        const announcer = DOM.createElement('div', {
            id: 'sr-announcer',
            'aria-live': 'polite',
            'aria-atomic': 'true',
            className: 'sr-only'
        });
        document.body.appendChild(announcer);
    }

    /**
     * Configura modo alto contraste
     */
    setupHighContrastMode() {
        // Detectar preferencia de alto contraste
        if (window.matchMedia('(prefers-contrast: high)').matches) {
            document.body.classList.add('high-contrast');
        }
    }

    /**
     * Configura tema
     */
    setupTheme() {
        // Detectar preferencia de tema oscuro
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
        
        const updateTheme = (e) => {
            if (e.matches) {
                document.body.classList.add('dark-theme');
            } else {
                document.body.classList.remove('dark-theme');
            }
        };

        prefersDark.addEventListener('change', updateTheme);
        updateTheme(prefersDark);
    }

    /**
     * Inicializa sistema de testing
     */
    initializeTesting() {
        if (DEV_CONFIG.enableTesting) {
            // Cargar módulo de testing después de 2 segundos
            setTimeout(async () => {
                try {
                    // En una app real, esto sería: const testing = await import('./modules/testing.js');
                    console.log('🧪 Sistema de testing listo');
                    this.runInitialTests();
                } catch (error) {
                    console.warn('⚠️ No se pudo cargar el sistema de testing:', error);
                }
            }, 2000);
        }
    }

    /**
     * Ejecuta tests iniciales
     */
    runInitialTests() {
        console.log('🔄 Ejecutando tests iniciales...');
        
        const tests = [
            () => this.testDOMReady(),
            () => this.testModulesLoaded(),
            () => this.testLocalStorage(),
            () => this.testAPISimulation()
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

    /**
     * Tests específicos
     */
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

    testAPISimulation() {
        return typeof this.modules.auth.isLoggedIn === 'function';
    }

    /**
     * UI Helpers
     */

    showLoadingScreen() {
        const loadingScreen = DOM.$('#loadingScreen');
        if (loadingScreen) {
            DOM.removeClass(loadingScreen, 'hidden');
        }
    }

    async hideLoadingScreen() {
        const loadingScreen = DOM.$('#loadingScreen');
        if (loadingScreen) {
            await new Promise(resolve => setTimeout(resolve, 500));
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
            showNotification('Búsqueda activada', 'info', { duration: 2000 });
        }
    }

    openHelp() {
        showNotification('Ayuda: Use Alt+L para login, Ctrl+K para búsqueda, F1 para ayuda', 'info', {
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

    /**
     * Utilidades de rendimiento y logging
     */

    checkPerformanceTargets() {
        const metrics = Performance.getMetrics();
        
        if (metrics.loadTime > PERFORMANCE_TARGETS.loadTime) {
            console.warn('⚠️ Tiempo de carga por encima del objetivo:', metrics.loadTime);
        }

        if (metrics.responseTime > PERFORMANCE_TARGETS.responseTime) {
            console.warn('⚠️ Tiempo de respuesta por encima del objetivo:', metrics.responseTime);
        }
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

    logError(type, error) {
        const errorInfo = {
            type,
            message: error.message || error,
            stack: error.stack,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        
        console.error('Error logged:', errorInfo);
        
        // En una app real, aquí se enviaría a un servicio de logging
        if (DEV_CONFIG.enableLogs) {
            this.sendErrorToLoggingService(errorInfo);
        }
    }

    logPerformanceMetric(type, data) {
        if (DEV_CONFIG.enableMetrics) {
            console.log(`📊 Performance ${type}:`, {
                name: data.name,
                duration: data.duration,
                startTime: data.startTime
            });
        }
    }

    sendErrorToLoggingService(errorInfo) {
        // Simular envío a servicio de logging
        console.log('📡 Enviando error a servicio de logging:', errorInfo.type);
    }

    /**
     * Manejo de errores de inicialización
     */
    handleInitError(error) {
        // Ocultar pantalla de carga
        this.hideLoadingScreen();
        
        // Mostrar error al usuario
        const errorMessage = `Error inicializando aplicación: ${error.message}`;
        
        // Crear notificación de error persistente
        if (notificationManager) {
            showNotification(errorMessage, 'error', {
                persistent: true,
                title: 'Error Crítico',
                actions: [
                    {
                        text: 'Recargar página',
                        primary: true,
                        handler: () => window.location.reload()
                    }
                ]
            });
        } else {
            // Fallback si las notificaciones no están disponibles
            alert(errorMessage + '\n\nHaga clic en OK para recargar la página.');
            window.location.reload();
        }
        
        // Log del error
        this.logError('Initialization Error', error);
    }

    /**
     * API pública de la aplicación
     */
    getModule(name) {
        return this.modules[name];
    }

    isReady() {
        return this.isLoaded;
    }

    getVersion() {
        return this.version;
    }

    restart() {
        window.location.reload();
    }
}

/**
 * Función de inicialización global
 */
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
        auth: () => window.studyQualityApp.getModule('auth'),
        notifications: () => window.studyQualityApp.getModule('notifications')
    };
}

/**
 * Verificar compatibilidad del navegador
 */
function checkBrowserCompatibility() {
    const requiredFeatures = [
        'localStorage' in window,
        'Promise' in window,
        'fetch' in window,
        'CustomEvent' in window
    ];
    
    return requiredFeatures.every(feature => feature);
}

/**
 * Mostrar error de compatibilidad
 */
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
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

// Exportar para módulos
export default StudyQualityApp;