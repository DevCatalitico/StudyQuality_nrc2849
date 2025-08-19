/**
 * CONSTANTS - StudyQuality System
 * Constantes globales del sistema basado en principios de Calidad de Software
 */

// Información del Sistema
export const SYSTEM_INFO = {
    name: 'StudyQuality',
    version: '1.0.0',
    build: 'CI-2024',
    description: 'Sistema de Gestión basado en principios de Calidad de Software - Pantaleo',
    author: 'StudyQuality NRC2849',
    repository: 'https://github.com/DevCatalitico/StudyQuality_nrc2849'
};

// Configuración de la aplicación
export const APP_CONFIG = {
    // Configuración de autenticación
    auth: {
        sessionTimeout: 30 * 60 * 1000, // 30 minutos en millisegundos
        maxLoginAttempts: 3,
        lockoutDuration: 15 * 60 * 1000 // 15 minutos
    },
    
    // Configuración de paginación
    pagination: {
        defaultPageSize: 10,
        maxPageSize: 100,
        pageSizeOptions: [5, 10, 25, 50, 100]
    },
    
    // Configuración de la tabla de usuarios
    table: {
        defaultSortColumn: 'id',
        defaultSortDirection: 'asc',
        searchDebounceDelay: 300
    },
    
    // Configuración de notificaciones
    notifications: {
        defaultDuration: 5000,
        position: 'top-right',
        maxVisible: 3
    },
    
    // Configuración de reportes
    reports: {
        maxExportRows: 10000,
        supportedFormats: ['csv', 'json', 'pdf'],
        defaultFormat: 'csv'
    },
    
    // Configuración de métricas
    metrics: {
        updateInterval: 30000, // 30 segundos
        retentionDays: 30
    }
};

// Credenciales demo
export const DEMO_CREDENTIALS = {
    email: 'admin@demo.com',
    password: 'demo123',
    user: {
        id: 0,
        name: 'Administrador Demo',
        email: 'admin@demo.com',
        role: 'admin',
        status: 'active',
        avatar: 'A'
    }
};

// Datos de usuarios de ejemplo
export const SAMPLE_USERS = [
    {
        id: 1,
        name: "Juan Pérez",
        email: "juan@demo.com",
        role: "admin",
        status: "active",
        registeredDate: "2024-01-15",
        notes: "Usuario administrador principal",
        lastLogin: "2024-03-15T10:30:00Z"
    },
    {
        id: 2,
        name: "María García",
        email: "maria@demo.com",
        role: "user",
        status: "active",
        registeredDate: "2024-02-20",
        notes: "Usuario regular del sistema",
        lastLogin: "2024-03-14T15:45:00Z"
    },
    {
        id: 3,
        name: "Carlos López",
        email: "carlos@demo.com",
        role: "user",
        status: "inactive",
        registeredDate: "2024-01-30",
        notes: "Usuario temporal",
        lastLogin: "2024-02-28T09:15:00Z"
    },
    {
        id: 4,
        name: "Ana Martínez",
        email: "ana@demo.com",
        role: "user",
        status: "active",
        registeredDate: "2024-03-01",
        notes: "Usuario departamento de ventas",
        lastLogin: "2024-03-15T14:20:00Z"
    },
    {
        id: 5,
        name: "Roberto Silva",
        email: "roberto@demo.com",
        role: "admin",
        status: "active",
        registeredDate: "2024-02-10",
        notes: "Administrador técnico",
        lastLogin: "2024-03-15T08:00:00Z"
    }
];

// Roles del sistema
export const USER_ROLES = {
    ADMIN: 'admin',
    USER: 'user',
    MODERATOR: 'moderator',
    GUEST: 'guest'
};

// Estados de usuario
export const USER_STATUS = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    PENDING: 'pending',
    SUSPENDED: 'suspended'
};

// Tipos de notificación
export const NOTIFICATION_TYPES = {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info'
};

// Eventos del sistema
export const SYSTEM_EVENTS = {
    USER_LOGIN: 'user_login',
    USER_LOGOUT: 'user_logout',
    USER_CREATED: 'user_created',
    USER_UPDATED: 'user_updated',
    USER_DELETED: 'user_deleted',
    REPORT_GENERATED: 'report_generated',
    DATA_EXPORTED: 'data_exported',
    SYSTEM_ERROR: 'system_error',
    CI_PIPELINE_START: 'ci_pipeline_start',
    CI_PIPELINE_COMPLETE: 'ci_pipeline_complete'
};

// Configuración de testing
export const TEST_CONFIG = {
    // Tests automatizados
    tests: [
        {
            name: 'Prueba de autenticación',
            description: 'Verifica que el sistema de login funcione correctamente',
            category: 'auth',
            critical: true
        },
        {
            name: 'Prueba de carga de usuarios',
            description: 'Verifica que los usuarios se carguen correctamente',
            category: 'users',
            critical: true
        },
        {
            name: 'Prueba de validación de email',
            description: 'Verifica que los emails sean válidos',
            category: 'validation',
            critical: false
        },
        {
            name: 'Prueba de roles válidos',
            description: 'Verifica que los roles sean válidos',
            category: 'users',
            critical: true
        },
        {
            name: 'Prueba de estados válidos',
            description: 'Verifica que los estados de usuario sean válidos',
            category: 'users',
            critical: true
        },
        {
            name: 'Prueba de rendimiento',
            description: 'Mide el tiempo de respuesta del sistema',
            category: 'performance',
            critical: false
        },
        {
            name: 'Prueba de exportación',
            description: 'Verifica la funcionalidad de exportación de datos',
            category: 'reports',
            critical: false
        },
        {
            name: 'Prueba de búsqueda',
            description: 'Verifica que la función de búsqueda funcione',
            category: 'search',
            critical: false
        }
    ],
    
    // Configuración de CI/CD
    pipeline: {
        stages: [
            { name: 'Compilación', duration: 500, icon: '📦' },
            { name: 'Pruebas Unitarias', duration: 1000, icon: '🧪' },
            { name: 'Análisis de Código', duration: 800, icon: '🔍' },
            { name: 'Pruebas de Integración', duration: 1200, icon: '🔗' },
            { name: 'Análisis de Rendimiento', duration: 600, icon: '📊' },
            { name: 'Despliegue', duration: 400, icon: '🚀' }
        ]
    }
};

// Métricas de rendimiento objetivo
export const PERFORMANCE_TARGETS = {
    loadTime: 2000, // ms
    responseTime: 1500, // ms
    coverage: 85, // %
    availability: 99.5, // %
    concurrentUsers: 100
};

// Configuración de almacenamiento local
export const STORAGE_KEYS = {
    CURRENT_USER: 'studyquality_current_user',
    USER_DATA: 'studyquality_users',
    SYSTEM_SETTINGS: 'studyquality_settings',
    BACKUP_DATA: 'studyquality_backup',
    SESSION_DATA: 'studyquality_session',
    METRICS_DATA: 'studyquality_metrics',
    LOGS_DATA: 'studyquality_logs'
};

// Configuración de API (simulada)
export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: '/api/auth/login',
        LOGOUT: '/api/auth/logout',
        REGISTER: '/api/auth/register',
        REFRESH: '/api/auth/refresh'
    },
    USERS: {
        LIST: '/api/users',
        CREATE: '/api/users',
        UPDATE: '/api/users/:id',
        DELETE: '/api/users/:id',
        BULK: '/api/users/bulk'
    },
    REPORTS: {
        GENERATE: '/api/reports/generate',
        EXPORT: '/api/reports/export',
        LIST: '/api/reports'
    },
    METRICS: {
        SYSTEM: '/api/metrics/system',
        USERS: '/api/metrics/users',
        PERFORMANCE: '/api/metrics/performance'
    }
};

// Mensajes del sistema
export const MESSAGES = {
    SUCCESS: {
        LOGIN: 'Inicio de sesión exitoso',
        LOGOUT: 'Sesión cerrada correctamente',
        USER_CREATED: 'Usuario creado exitosamente',
        USER_UPDATED: 'Usuario actualizado exitosamente',
        USER_DELETED: 'Usuario eliminado exitosamente',
        DATA_EXPORTED: 'Datos exportados correctamente',
        BACKUP_CREATED: 'Respaldo creado exitosamente',
        BACKUP_RESTORED: 'Datos restaurados exitosamente',
        TESTS_PASSED: 'Todas las pruebas pasaron exitosamente',
        CI_COMPLETED: 'Pipeline CI/CD completado exitosamente'
    },
    ERROR: {
        LOGIN_FAILED: 'Credenciales incorrectas',
        USER_EXISTS: 'El usuario ya existe',
        USER_NOT_FOUND: 'Usuario no encontrado',
        INVALID_EMAIL: 'Email inválido',
        INVALID_DATA: 'Datos inválidos',
        EXPORT_FAILED: 'Error al exportar datos',
        BACKUP_FAILED: 'Error al crear respaldo',
        RESTORE_FAILED: 'Error al restaurar datos',
        NETWORK_ERROR: 'Error de conexión',
        PERMISSION_DENIED: 'Permisos insuficientes',
        SESSION_EXPIRED: 'Sesión expirada'
    },
    WARNING: {
        UNSAVED_CHANGES: 'Hay cambios sin guardar',
        DELETE_CONFIRM: '¿Está seguro de eliminar este elemento?',
        BULK_DELETE_CONFIRM: '¿Está seguro de eliminar los elementos seleccionados?',
        SESSION_EXPIRING: 'Su sesión expirará pronto',
        HIGH_MEMORY_USAGE: 'Uso alto de memoria detectado'
    },
    INFO: {
        LOADING: 'Cargando...',
        PROCESSING: 'Procesando...',
        GENERATING_REPORT: 'Generando reporte...',
        RUNNING_TESTS: 'Ejecutando pruebas...',
        NO_DATA: 'No hay datos disponibles',
        SEARCH_NO_RESULTS: 'No se encontraron resultados',
        CI_RUNNING: 'Pipeline CI/CD en progreso...'
    }
};

// Configuración de validación
export const VALIDATION_RULES = {
    email: {
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: 'Formato de email inválido'
    },
    password: {
        minLength: 6,
        pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        message: 'La contraseña debe tener al menos 6 caracteres, una mayúscula, una minúscula y un número'
    },
    name: {
        minLength: 2,
        maxLength: 50,
        pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
        message: 'El nombre solo puede contener letras y espacios'
    },
    required: {
        message: 'Este campo es obligatorio'
    }
};

// Configuración de temas
export const THEMES = {
    LIGHT: 'light',
    DARK: 'dark',
    AUTO: 'auto'
};

// Configuración de idiomas
export const LANGUAGES = {
    ES: 'es',
    EN: 'en'
};

// URLs de recursos externos
export const EXTERNAL_RESOURCES = {
    DOCUMENTATION: 'https://devcatalitico.github.io/StudyQuality_nrc2849/docs/',
    REPOSITORY: 'https://github.com/DevCatalitico/StudyQuality_nrc2849',
    ISSUES: 'https://github.com/DevCatalitico/StudyQuality_nrc2849/issues',
    PANTALEO_BOOK: 'https://www.alfaomega.com.mx/default/calidad-en-el-desarrollo-de-software.html'
};

// Configuración de desarrollo
export const DEV_CONFIG = {
    debug: false,
    enableLogs: true,
    enableMetrics: true,
    enableTesting: true,
    apiMockDelay: 1000,
    enableServiceWorker: true
};

// Exportar todo como objeto por defecto también
export default {
    SYSTEM_INFO,
    APP_CONFIG,
    DEMO_CREDENTIALS,
    SAMPLE_USERS,
    USER_ROLES,
    USER_STATUS,
    NOTIFICATION_TYPES,
    SYSTEM_EVENTS,
    TEST_CONFIG,
    PERFORMANCE_TARGETS,
    STORAGE_KEYS,
    API_ENDPOINTS,
    MESSAGES,
    VALIDATION_RULES,
    THEMES,
    LANGUAGES,
    EXTERNAL_RESOURCES,
    DEV_CONFIG
};