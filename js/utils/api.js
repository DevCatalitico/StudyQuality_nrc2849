/**
 * API - StudyQuality System
 * Simulador de API con funcionalidades completas
 */

import { API_ENDPOINTS, MESSAGES, DEV_CONFIG } from './constants.js';
import { userStorage, sessionStorage } from './storage.js';
import { Time } from './helpers.js';

/**
 * Clase principal de API simulada
 */
export class API {
    constructor() {
        this.baseURL = '';
        this.defaultDelay = DEV_CONFIG.apiMockDelay || 1000;
        this.requestId = 0;
    }

    /**
     * Simula una petición HTTP
     * @param {string} method - Método HTTP
     * @param {string} endpoint - Endpoint de la API
     * @param {Object} data - Datos de la petición
     * @param {Object} options - Opciones adicionales
     * @returns {Promise} Respuesta simulada
     */
    async request(method, endpoint, data = null, options = {}) {
        const requestId = ++this.requestId;
        const delay = options.delay || this.defaultDelay;

        console.log(`🌐 API Request ${requestId}: ${method} ${endpoint}`, data);

        // Simular delay de red
        await Time.delay(delay);

        try {
            const response = await this.processRequest(method, endpoint, data, options);
            console.log(`✅ API Response ${requestId}:`, response);
            return response;
        } catch (error) {
            console.error(`❌ API Error ${requestId}:`, error);
            throw error;
        }
    }

    /**
     * Procesa la petición según el endpoint
     * @param {string} method - Método HTTP
     * @param {string} endpoint - Endpoint
     * @param {Object} data - Datos
     * @param {Object} options - Opciones
     * @returns {Object} Respuesta
     */
    async processRequest(method, endpoint, data, options) {
        // Autenticación
        if (endpoint.includes('/auth/')) {
            return this.handleAuthRequest(method, endpoint, data);
        }

        // Usuarios
        if (endpoint.includes('/users')) {
            return this.handleUsersRequest(method, endpoint, data);
        }

        // Reportes
        if (endpoint.includes('/reports')) {
            return this.handleReportsRequest(method, endpoint, data);
        }

        // Métricas
        if (endpoint.includes('/metrics')) {
            return this.handleMetricsRequest(method, endpoint, data);
        }

        throw new APIError('Endpoint not found', 404);
    }

    /**
     * Maneja peticiones de autenticación
     */
    async handleAuthRequest(method, endpoint, data) {
        if (endpoint.includes('/login')) {
            return this.login(data);
        }

        if (endpoint.includes('/logout')) {
            return this.logout();
        }

        if (endpoint.includes('/register')) {
            return this.register(data);
        }

        throw new APIError('Auth endpoint not found', 404);
    }

    /**
     * Maneja peticiones de usuarios
     */
    async handleUsersRequest(method, endpoint, data) {
        // Verificar autenticación
        if (!sessionStorage.isLoggedIn()) {
            throw new APIError('Unauthorized', 401);
        }

        if (method === 'GET' && endpoint === API_ENDPOINTS.USERS.LIST) {
            return this.getUsers();
        }

        if (method === 'POST' && endpoint === API_ENDPOINTS.USERS.CREATE) {
            return this.createUser(data);
        }

        if (method === 'PUT' && endpoint.includes('/users/')) {
            const id = this.extractIdFromEndpoint(endpoint);
            return this.updateUser(id, data);
        }

        if (method === 'DELETE' && endpoint.includes('/users/')) {
            const id = this.extractIdFromEndpoint(endpoint);
            return this.deleteUser(id);
        }

        if (method === 'POST' && endpoint === API_ENDPOINTS.USERS.BULK) {
            return this.bulkUserOperation(data);
        }

        throw new APIError('Users endpoint not found', 404);
    }

    /**
     * Maneja peticiones de reportes
     */
    async handleReportsRequest(method, endpoint, data) {
        if (!sessionStorage.isLoggedIn()) {
            throw new APIError('Unauthorized', 401);
        }

        if (method === 'POST' && endpoint === API_ENDPOINTS.REPORTS.GENERATE) {
            return this.generateReport(data);
        }

        if (method === 'POST' && endpoint === API_ENDPOINTS.REPORTS.EXPORT) {
            return this.exportData(data);
        }

        if (method === 'GET' && endpoint === API_ENDPOINTS.REPORTS.LIST) {
            return this.getReports();
        }

        throw new APIError('Reports endpoint not found', 404);
    }

    /**
     * Maneja peticiones de métricas
     */
    async handleMetricsRequest(method, endpoint, data) {
        if (!sessionStorage.isLoggedIn()) {
            throw new APIError('Unauthorized', 401);
        }

        if (endpoint === API_ENDPOINTS.METRICS.SYSTEM) {
            return this.getSystemMetrics();
        }

        if (endpoint === API_ENDPOINTS.METRICS.USERS) {
            return this.getUserMetrics();
        }

        if (endpoint === API_ENDPOINTS.METRICS.PERFORMANCE) {
            return this.getPerformanceMetrics();
        }

        throw new APIError('Metrics endpoint not found', 404);
    }

    /**
     * Implementación de endpoints específicos
     */

    async login(credentials) {
        const { email, password } = credentials;

        // Validar credenciales demo
        if (email === 'admin@demo.com' && password === 'demo123') {
            const user = {
                id: 0,
                name: 'Administrador Demo',
                email: email,
                role: 'admin',
                status: 'active'
            };

            sessionStorage.setCurrentUser(user);

            return {
                success: true,
                message: MESSAGES.SUCCESS.LOGIN,
                data: {
                    user,
                    token: 'demo_token_' + Date.now(),
                    expiresIn: 30 * 60 // 30 minutos
                }
            };
        }

        // Buscar en usuarios almacenados
        const user = userStorage.getUserByEmail(email);
        if (user && user.status === 'active') {
            // En un sistema real, aquí validaríamos la contraseña
            sessionStorage.setCurrentUser(user);

            return {
                success: true,
                message: MESSAGES.SUCCESS.LOGIN,
                data: {
                    user,
                    token: 'user_token_' + Date.now(),
                    expiresIn: 30 * 60
                }
            };
        }

        throw new APIError(MESSAGES.ERROR.LOGIN_FAILED, 401);
    }

    async logout() {
        sessionStorage.logout();
        return {
            success: true,
            message: MESSAGES.SUCCESS.LOGOUT
        };
    }

    async register(userData) {
        const { email } = userData;

        // Verificar si el usuario ya existe
        if (userStorage.getUserByEmail(email)) {
            throw new APIError(MESSAGES.ERROR.USER_EXISTS, 409);
        }

        // Crear nuevo usuario
        const newUser = userStorage.createUser({
            ...userData,
            status: 'active'
        });

        return {
            success: true,
            message: MESSAGES.SUCCESS.USER_CREATED,
            data: { user: newUser }
        };
    }

    async getUsers() {
        const users = userStorage.getUsers();
        return {
            success: true,
            data: {
                users,
                total: users.length,
                page: 1,
                pageSize: users.length
            }
        };
    }

    async createUser(userData) {
        const { email } = userData;

        if (userStorage.getUserByEmail(email)) {
            throw new APIError(MESSAGES.ERROR.USER_EXISTS, 409);
        }

        const newUser = userStorage.createUser(userData);

        return {
            success: true,
            message: MESSAGES.SUCCESS.USER_CREATED,
            data: { user: newUser }
        };
    }

    async updateUser(id, updates) {
        const updatedUser = userStorage.updateUser(parseInt(id), updates);

        if (!updatedUser) {
            throw new APIError(MESSAGES.ERROR.USER_NOT_FOUND, 404);
        }

        return {
            success: true,
            message: MESSAGES.SUCCESS.USER_UPDATED,
            data: { user: updatedUser }
        };
    }

    async deleteUser(id) {
        const success = userStorage.deleteUser(parseInt(id));

        if (!success) {
            throw new APIError(MESSAGES.ERROR.USER_NOT_FOUND, 404);
        }

        return {
            success: true,
            message: MESSAGES.SUCCESS.USER_DELETED
        };
    }

    async bulkUserOperation(data) {
        const { operation, userIds } = data;

        switch (operation) {
            case 'delete':
                const deletedCount = userStorage.deleteUsers(userIds);
                return {
                    success: true,
                    message: `${deletedCount} usuarios eliminados`,
                    data: { deletedCount }
                };

            case 'activate':
                let activatedCount = 0;
                userIds.forEach(id => {
                    if (userStorage.updateUser(id, { status: 'active' })) {
                        activatedCount++;
                    }
                });
                return {
                    success: true,
                    message: `${activatedCount} usuarios activados`,
                    data: { activatedCount }
                };

            case 'deactivate':
                let deactivatedCount = 0;
                userIds.forEach(id => {
                    if (userStorage.updateUser(id, { status: 'inactive' })) {
                        deactivatedCount++;
                    }
                });
                return {
                    success: true,
                    message: `${deactivatedCount} usuarios desactivados`,
                    data: { deactivatedCount }
                };

            default:
                throw new APIError('Operación no válida', 400);
        }
    }

    async generateReport(data) {
        const { type, filters, format } = data;

        // Simular generación de reporte
        await Time.delay(2000);

        const reportData = {
            id: Date.now(),
            type,
            format,
            filters,
            generatedAt: new Date().toISOString(),
            size: Math.floor(Math.random() * 1000) + 100 // KB
        };

        return {
            success: true,
            message: MESSAGES.SUCCESS.DATA_EXPORTED,
            data: { report: reportData }
        };
    }

    async exportData(data) {
        const { format, filters } = data;

        let users = userStorage.getUsers();

        // Aplicar filtros
        if (filters) {
            users = userStorage.searchUsers('', filters);
        }

        const exportData = {
            format,
            recordCount: users.length,
            generatedAt: new Date().toISOString(),
            data: users
        };

        return {
            success: true,
            message: MESSAGES.SUCCESS.DATA_EXPORTED,
            data: exportData
        };
    }

    async getReports() {
        // Simular lista de reportes generados
        const reports = [
            {
                id: 1,
                name: 'Reporte de Usuarios',
                type: 'users',
                format: 'pdf',
                generatedAt: '2024-03-15T10:30:00Z',
                size: '245 KB'
            },
            {
                id: 2,
                name: 'Reporte de Actividad',
                type: 'activity',
                format: 'csv',
                generatedAt: '2024-03-14T15:45:00Z',
                size: '156 KB'
            }
        ];

        return {
            success: true,
            data: { reports }
        };
    }

    async getSystemMetrics() {
        const users = userStorage.getUsers();
        const stats = userStorage.getUserStats();

        return {
            success: true,
            data: {
                uptime: Math.floor(Math.random() * 100000),
                responseTime: Math.floor(Math.random() * 100) + 50,
                activeUsers: stats.active,
                totalUsers: stats.total,
                memoryUsage: Math.floor(Math.random() * 80) + 20,
                cpuUsage: Math.floor(Math.random() * 60) + 10
            }
        };
    }

    async getUserMetrics() {
        const stats = userStorage.getUserStats();

        return {
            success: true,
            data: {
                ...stats,
                growthRate: Math.floor(Math.random() * 20) + 5,
                retention: Math.floor(Math.random() * 30) + 70,
                satisfaction: Math.floor(Math.random() * 20) + 80
            }
        };
    }

    async getPerformanceMetrics() {
        return {
            success: true,
            data: {
                loadTime: Math.floor(Math.random() * 500) + 100,
                renderTime: Math.floor(Math.random() * 200) + 50,
                networkTime: Math.floor(Math.random() * 300) + 100,
                cacheHitRate: Math.floor(Math.random() * 20) + 80,
                errorRate: Math.random() * 2
            }
        };
    }

    /**
     * Utilidades
     */
    extractIdFromEndpoint(endpoint) {
        const matches = endpoint.match(/\/(\d+)(?:\/|$)/);
        return matches ? parseInt(matches[1]) : null;
    }
}

/**
 * Clase de error de API
 */
export class APIError extends Error {
    constructor(message, status = 500, data = null) {
        super(message);
        this.name = 'APIError';
        this.status = status;
        this.data = data;
    }
}

/**
 * Cliente HTTP simplificado
 */
export class HTTPClient {
    constructor(api) {
        this.api = api || new API();
    }

    async get(endpoint, options = {}) {
        return this.api.request('GET', endpoint, null, options);
    }

    async post(endpoint, data, options = {}) {
        return this.api.request('POST', endpoint, data, options);
    }

    async put(endpoint, data, options = {}) {
        return this.api.request('PUT', endpoint, data, options);
    }

    async delete(endpoint, options = {}) {
        return this.api.request('DELETE', endpoint, null, options);
    }

    async patch(endpoint, data, options = {}) {
        return this.api.request('PATCH', endpoint, data, options);
    }
}

/**
 * Servicios de API específicos
 */
export const AuthAPI = {
    async login(credentials) {
        const client = new HTTPClient();
        return client.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
    },

    async logout() {
        const client = new HTTPClient();
        return client.post(API_ENDPOINTS.AUTH.LOGOUT);
    },

    async register(userData) {
        const client = new HTTPClient();
        return client.post(API_ENDPOINTS.AUTH.REGISTER, userData);
    }
};

export const UsersAPI = {
    async getUsers() {
        const client = new HTTPClient();
        return client.get(API_ENDPOINTS.USERS.LIST);
    },

    async createUser(userData) {
        const client = new HTTPClient();
        return client.post(API_ENDPOINTS.USERS.CREATE, userData);
    },

    async updateUser(id, updates) {
        const client = new HTTPClient();
        const endpoint = API_ENDPOINTS.USERS.UPDATE.replace(':id', id);
        return client.put(endpoint, updates);
    },

    async deleteUser(id) {
        const client = new HTTPClient();
        const endpoint = API_ENDPOINTS.USERS.DELETE.replace(':id', id);
        return client.delete(endpoint);
    },

    async bulkOperation(operation, userIds) {
        const client = new HTTPClient();
        return client.post(API_ENDPOINTS.USERS.BULK, { operation, userIds });
    }
};

export const ReportsAPI = {
    async generateReport(type, filters = {}, format = 'pdf') {
        const client = new HTTPClient();
        return client.post(API_ENDPOINTS.REPORTS.GENERATE, { type, filters, format });
    },

    async exportData(format = 'csv', filters = {}) {
        const client = new HTTPClient();
        return client.post(API_ENDPOINTS.REPORTS.EXPORT, { format, filters });
    },

    async getReports() {
        const client = new HTTPClient();
        return client.get(API_ENDPOINTS.REPORTS.LIST);
    }
};

export const MetricsAPI = {
    async getSystemMetrics() {
        const client = new HTTPClient();
        return client.get(API_ENDPOINTS.METRICS.SYSTEM);
    },

    async getUserMetrics() {
        const client = new HTTPClient();
        return client.get(API_ENDPOINTS.METRICS.USERS);
    },

    async getPerformanceMetrics() {
        const client = new HTTPClient();
        return client.get(API_ENDPOINTS.METRICS.PERFORMANCE);
    }
};

// Instancia global
export const api = new API();
export const httpClient = new HTTPClient();

export default {
    API,
    APIError,
    HTTPClient,
    AuthAPI,
    UsersAPI,
    ReportsAPI,
    MetricsAPI,
    api,
    httpClient
};