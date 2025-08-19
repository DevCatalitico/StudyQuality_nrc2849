/**
 * STORAGE - StudyQuality System
 * Sistema de almacenamiento local con respaldo y recuperación
 */

import { STORAGE_KEYS, SAMPLE_USERS } from './constants.js';
import { Data } from './helpers.js';

/**
 * Clase principal de almacenamiento
 */
export class Storage {
    constructor() {
        this.prefix = 'studyquality_';
        this.initializeStorage();
    }

    /**
     * Inicializa el almacenamiento con datos por defecto
     */
    initializeStorage() {
        // Verificar si es la primera vez
        if (!this.get(STORAGE_KEYS.USER_DATA)) {
            this.set(STORAGE_KEYS.USER_DATA, SAMPLE_USERS);
            this.set(STORAGE_KEYS.SYSTEM_SETTINGS, {
                theme: 'auto',
                language: 'es',
                notifications: true,
                autoSave: true,
                debugMode: false
            });
            console.log('🔧 Storage initialized with default data');
        }
    }

    /**
     * Obtiene un valor del almacenamiento
     * @param {string} key - Clave
     * @param {any} defaultValue - Valor por defecto
     * @returns {any} Valor almacenado
     */
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(this.prefix + key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Error reading from storage:', error);
            return defaultValue;
        }
    }

    /**
     * Almacena un valor
     * @param {string} key - Clave
     * @param {any} value - Valor a almacenar
     * @returns {boolean} Éxito de la operación
     */
    set(key, value) {
        try {
            localStorage.setItem(this.prefix + key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Error writing to storage:', error);
            return false;
        }
    }

    /**
     * Elimina un valor del almacenamiento
     * @param {string} key - Clave
     */
    remove(key) {
        try {
            localStorage.removeItem(this.prefix + key);
        } catch (error) {
            console.error('Error removing from storage:', error);
        }
    }

    /**
     * Limpia todo el almacenamiento del sistema
     */
    clear() {
        try {
            Object.values(STORAGE_KEYS).forEach(key => {
                this.remove(key);
            });
        } catch (error) {
            console.error('Error clearing storage:', error);
        }
    }

    /**
     * Verifica si existe una clave
     * @param {string} key - Clave
     * @returns {boolean} True si existe
     */
    has(key) {
        return localStorage.getItem(this.prefix + key) !== null;
    }

    /**
     * Obtiene todas las claves del sistema
     * @returns {Array} Lista de claves
     */
    getKeys() {
        const keys = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(this.prefix)) {
                keys.push(key.replace(this.prefix, ''));
            }
        }
        return keys;
    }

    /**
     * Obtiene el tamaño usado en el almacenamiento
     * @returns {Object} Información de uso
     */
    getUsage() {
        let totalSize = 0;
        const itemSizes = {};

        this.getKeys().forEach(key => {
            const value = this.get(key);
            const size = JSON.stringify(value).length;
            itemSizes[key] = size;
            totalSize += size;
        });

        return {
            totalSize,
            itemSizes,
            formattedSize: this.formatBytes(totalSize),
            maxSize: 5 * 1024 * 1024 // 5MB aproximado para localStorage
        };
    }

    /**
     * Formatea bytes a una unidad legible
     * @param {number} bytes - Bytes
     * @returns {string} Tamaño formateado
     */
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

/**
 * Gestión específica de usuarios
 */
export class UserStorage extends Storage {
    constructor() {
        super();
        this.nextId = this.getNextUserId();
    }

    /**
     * Obtiene todos los usuarios
     * @returns {Array} Lista de usuarios
     */
    getUsers() {
        return this.get(STORAGE_KEYS.USER_DATA, []);
    }

    /**
     * Obtiene un usuario por ID
     * @param {number} id - ID del usuario
     * @returns {Object|null} Usuario encontrado
     */
    getUserById(id) {
        const users = this.getUsers();
        return users.find(user => user.id === id) || null;
    }

    /**
     * Obtiene un usuario por email
     * @param {string} email - Email del usuario
     * @returns {Object|null} Usuario encontrado
     */
    getUserByEmail(email) {
        const users = this.getUsers();
        return users.find(user => user.email.toLowerCase() === email.toLowerCase()) || null;
    }

    /**
     * Crea un nuevo usuario
     * @param {Object} userData - Datos del usuario
     * @returns {Object} Usuario creado
     */
    createUser(userData) {
        const users = this.getUsers();
        const newUser = {
            id: this.nextId++,
            ...userData,
            registeredDate: new Date().toISOString().split('T')[0],
            lastLogin: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        users.push(newUser);
        this.set(STORAGE_KEYS.USER_DATA, users);
        this.logUserAction('USER_CREATED', newUser.id, newUser);
        
        return newUser;
    }

    /**
     * Actualiza un usuario
     * @param {number} id - ID del usuario
     * @param {Object} updates - Actualizaciones
     * @returns {Object|null} Usuario actualizado
     */
    updateUser(id, updates) {
        const users = this.getUsers();
        const userIndex = users.findIndex(user => user.id === id);
        
        if (userIndex === -1) return null;

        const updatedUser = {
            ...users[userIndex],
            ...updates,
            updatedAt: new Date().toISOString()
        };

        users[userIndex] = updatedUser;
        this.set(STORAGE_KEYS.USER_DATA, users);
        this.logUserAction('USER_UPDATED', id, updatedUser);
        
        return updatedUser;
    }

    /**
     * Elimina un usuario
     * @param {number} id - ID del usuario
     * @returns {boolean} Éxito de la operación
     */
    deleteUser(id) {
        const users = this.getUsers();
        const userIndex = users.findIndex(user => user.id === id);
        
        if (userIndex === -1) return false;

        const deletedUser = users[userIndex];
        users.splice(userIndex, 1);
        this.set(STORAGE_KEYS.USER_DATA, users);
        this.logUserAction('USER_DELETED', id, deletedUser);
        
        return true;
    }

    /**
     * Elimina múltiples usuarios
     * @param {Array} ids - IDs de usuarios
     * @returns {number} Cantidad de usuarios eliminados
     */
    deleteUsers(ids) {
        let deletedCount = 0;
        ids.forEach(id => {
            if (this.deleteUser(id)) {
                deletedCount++;
            }
        });
        return deletedCount;
    }

    /**
     * Busca usuarios
     * @param {string} query - Consulta de búsqueda
     * @param {Object} filters - Filtros adicionales
     * @returns {Array} Usuarios encontrados
     */
    searchUsers(query = '', filters = {}) {
        let users = this.getUsers();

        // Filtrar por consulta de texto
        if (query) {
            const searchTerm = query.toLowerCase();
            users = users.filter(user =>
                user.name.toLowerCase().includes(searchTerm) ||
                user.email.toLowerCase().includes(searchTerm) ||
                (user.notes && user.notes.toLowerCase().includes(searchTerm))
            );
        }

        // Aplicar filtros adicionales
        Object.entries(filters).forEach(([key, value]) => {
            if (value) {
                users = users.filter(user => user[key] === value);
            }
        });

        return users;
    }

    /**
     * Obtiene estadísticas de usuarios
     * @returns {Object} Estadísticas
     */
    getUserStats() {
        const users = this.getUsers();
        
        return {
            total: users.length,
            active: users.filter(u => u.status === 'active').length,
            inactive: users.filter(u => u.status === 'inactive').length,
            admins: users.filter(u => u.role === 'admin').length,
            regularUsers: users.filter(u => u.role === 'user').length,
            recentRegistrations: users.filter(u => {
                const regDate = new Date(u.registeredDate);
                const monthAgo = new Date();
                monthAgo.setMonth(monthAgo.getMonth() - 1);
                return regDate > monthAgo;
            }).length
        };
    }

    /**
     * Obtiene el siguiente ID de usuario
     * @returns {number} Siguiente ID
     */
    getNextUserId() {
        const users = this.getUsers();
        return users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
    }

    /**
     * Registra una acción de usuario
     * @param {string} action - Acción realizada
     * @param {number} userId - ID del usuario
     * @param {Object} data - Datos adicionales
     */
    logUserAction(action, userId, data = {}) {
        const logs = this.get(STORAGE_KEYS.LOGS_DATA, []);
        const logEntry = {
            id: Date.now() + Math.random(),
            timestamp: new Date().toISOString(),
            action,
            userId,
            data: Data.deepClone(data),
            userAgent: navigator.userAgent
        };

        logs.push(logEntry);
        
        // Mantener solo los últimos 1000 logs
        if (logs.length > 1000) {
            logs.splice(0, logs.length - 1000);
        }

        this.set(STORAGE_KEYS.LOGS_DATA, logs);
    }
}

/**
 * Gestión de sesión de usuario
 */
export class SessionStorage extends Storage {
    /**
     * Inicia sesión de usuario
     * @param {Object} user - Datos del usuario
     */
    setCurrentUser(user) {
        const sessionData = {
            user,
            loginTime: new Date().toISOString(),
            lastActivity: new Date().toISOString(),
            sessionId: this.generateSessionId()
        };
        
        this.set(STORAGE_KEYS.CURRENT_USER, sessionData);
        this.set(STORAGE_KEYS.SESSION_DATA, {
            isLoggedIn: true,
            sessionStart: sessionData.loginTime,
            sessionId: sessionData.sessionId
        });

        // Actualizar último login del usuario
        const userStorage = new UserStorage();
        userStorage.updateUser(user.id, {
            lastLogin: new Date().toISOString()
        });
    }

    /**
     * Obtiene el usuario actual
     * @returns {Object|null} Usuario actual
     */
    getCurrentUser() {
        const sessionData = this.get(STORAGE_KEYS.CURRENT_USER);
        return sessionData ? sessionData.user : null;
    }

    /**
     * Verifica si hay una sesión activa
     * @returns {boolean} True si está logueado
     */
    isLoggedIn() {
        const sessionData = this.get(STORAGE_KEYS.SESSION_DATA);
        return sessionData && sessionData.isLoggedIn;
    }

    /**
     * Actualiza la actividad de la sesión
     */
    updateActivity() {
        const currentSession = this.get(STORAGE_KEYS.CURRENT_USER);
        if (currentSession) {
            currentSession.lastActivity = new Date().toISOString();
            this.set(STORAGE_KEYS.CURRENT_USER, currentSession);
        }
    }

    /**
     * Cierra la sesión
     */
    logout() {
        this.remove(STORAGE_KEYS.CURRENT_USER);
        this.remove(STORAGE_KEYS.SESSION_DATA);
    }

    /**
     * Verifica si la sesión ha expirado
     * @param {number} timeoutMinutes - Timeout en minutos
     * @returns {boolean} True si ha expirado
     */
    isSessionExpired(timeoutMinutes = 30) {
        const currentSession = this.get(STORAGE_KEYS.CURRENT_USER);
        if (!currentSession) return true;

        const lastActivity = new Date(currentSession.lastActivity);
        const now = new Date();
        const diffMinutes = (now - lastActivity) / (1000 * 60);

        return diffMinutes > timeoutMinutes;
    }

    /**
     * Genera un ID de sesión único
     * @returns {string} ID de sesión
     */
    generateSessionId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
}

/**
 * Gestión de respaldos
 */
export class BackupStorage extends Storage {
    /**
     * Crea un respaldo completo
     * @returns {Object} Datos de respaldo
     */
    createBackup() {
        const backupData = {
            version: '1.0.0',
            timestamp: new Date().toISOString(),
            data: {}
        };

        // Respaldar todos los datos del sistema
        Object.values(STORAGE_KEYS).forEach(key => {
            const data = this.get(key);
            if (data !== null) {
                backupData.data[key] = data;
            }
        });

        // Guardar el respaldo
        this.set(STORAGE_KEYS.BACKUP_DATA, backupData);
        
        return backupData;
    }

    /**
     * Restaura desde un respaldo
     * @param {Object} backupData - Datos de respaldo
     * @returns {boolean} Éxito de la operación
     */
    restoreBackup(backupData = null) {
        try {
            const backup = backupData || this.get(STORAGE_KEYS.BACKUP_DATA);
            
            if (!backup || !backup.data) {
                throw new Error('No backup data found');
            }

            // Restaurar cada elemento
            Object.entries(backup.data).forEach(([key, value]) => {
                if (key !== STORAGE_KEYS.BACKUP_DATA) { // No restaurar el respaldo mismo
                    this.set(key, value);
                }
            });

            return true;
        } catch (error) {
            console.error('Error restoring backup:', error);
            return false;
        }
    }

    /**
     * Exporta datos para descarga
     * @param {string} format - Formato de exportación (json, csv)
     * @returns {string} Datos exportados
     */
    exportData(format = 'json') {
        const backup = this.createBackup();
        
        if (format === 'json') {
            return JSON.stringify(backup, null, 2);
        } else if (format === 'csv') {
            // Solo exportar usuarios para CSV
            const users = backup.data[STORAGE_KEYS.USER_DATA] || [];
            return this.convertToCSV(users);
        }
        
        return '';
    }

    /**
     * Convierte usuarios a formato CSV
     * @param {Array} users - Lista de usuarios
     * @returns {string} CSV string
     */
    convertToCSV(users) {
        if (users.length === 0) return '';

        const headers = Object.keys(users[0]);
        const csvHeaders = headers.join(',');
        
        const csvRows = users.map(user => {
            return headers.map(header => {
                const value = user[header];
                // Escapar comillas y comas
                return `"${String(value).replace(/"/g, '""')}"`;
            }).join(',');
        });

        return [csvHeaders, ...csvRows].join('\n');
    }

    /**
     * Importa datos desde un archivo
     * @param {string} data - Datos a importar
     * @param {string} format - Formato de los datos
     * @returns {boolean} Éxito de la operación
     */
    importData(data, format = 'json') {
        try {
            if (format === 'json') {
                const backupData = JSON.parse(data);
                return this.restoreBackup(backupData);
            }
            // Agregar soporte para otros formatos si es necesario
            return false;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }
}

// Instancias singleton
export const storage = new Storage();
export const userStorage = new UserStorage();
export const sessionStorage = new SessionStorage();
export const backupStorage = new BackupStorage();

export default {
    Storage,
    UserStorage,
    SessionStorage,
    BackupStorage,
    storage,
    userStorage,
    sessionStorage,
    backupStorage
};