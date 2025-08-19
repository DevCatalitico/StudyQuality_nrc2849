/**
 * NOTIFICATIONS MODULE - StudyQuality System
 * Sistema de notificaciones avanzado
 */

import { DOM, Time } from '../utils/helpers.js';
import { NOTIFICATION_TYPES } from '../utils/constants.js';

/**
 * Clase principal de notificaciones
 */
export class NotificationManager {
    constructor() {
        this.notifications = [];
        this.container = null;
        this.maxVisible = 3;
        this.defaultDuration = 5000;
        this.nextId = 1;
        
        this.init();
    }

    /**
     * Inicializa el sistema de notificaciones
     */
    init() {
        this.createContainer();
        this.setupKeyboardShortcuts();
    }

    /**
     * Crea el contenedor de notificaciones
     */
    createContainer() {
        this.container = DOM.$('#notificationContainer');
        
        if (!this.container) {
            this.container = DOM.createElement('div', {
                id: 'notificationContainer',
                className: 'notification-container'
            });
            document.body.appendChild(this.container);
        }

        // Aplicar estilos si no existen
        this.injectStyles();
    }

    /**
     * Inyecta estilos de notificaciones
     */
    injectStyles() {
        if (DOM.$('#notification-styles')) return;

        const styles = `
            .notification-container {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 1070;
                pointer-events: none;
            }

            .notification {
                background: var(--surface-color);
                border-radius: var(--border-radius-lg);
                box-shadow: var(--shadow-xl);
                margin-bottom: var(--spacing-md);
                min-width: 350px;
                max-width: 450px;
                overflow: hidden;
                pointer-events: auto;
                transform: translateX(100%);
                transition: all var(--transition-normal);
                border-left: 4px solid var(--primary-color);
            }

            .notification.show {
                transform: translateX(0);
            }

            .notification.hide {
                transform: translateX(100%);
                opacity: 0;
            }

            .notification-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: var(--spacing-md) var(--spacing-lg);
                border-bottom: 1px solid var(--border-light);
            }

            .notification-title {
                display: flex;
                align-items: center;
                gap: var(--spacing-sm);
                font-weight: var(--font-weight-semibold);
                color: var(--text-primary);
                font-size: var(--font-size-sm);
            }

            .notification-icon {
                font-size: var(--font-size-lg);
            }

            .notification-close {
                background: none;
                border: none;
                color: var(--text-secondary);
                cursor: pointer;
                font-size: var(--font-size-lg);
                padding: var(--spacing-xs);
                border-radius: var(--border-radius-sm);
                transition: all var(--transition-fast);
            }

            .notification-close:hover {
                background: var(--border-light);
                color: var(--text-primary);
            }

            .notification-body {
                padding: var(--spacing-md) var(--spacing-lg);
                color: var(--text-secondary);
                font-size: var(--font-size-sm);
                line-height: var(--line-height-relaxed);
            }

            .notification-progress {
                position: absolute;
                bottom: 0;
                left: 0;
                height: 3px;
                background: currentColor;
                opacity: 0.3;
                transition: width linear;
            }

            .notification-actions {
                padding: var(--spacing-sm) var(--spacing-lg);
                border-top: 1px solid var(--border-light);
                display: flex;
                gap: var(--spacing-sm);
                justify-content: flex-end;
            }

            .notification-action {
                padding: var(--spacing-xs) var(--spacing-md);
                border: 1px solid var(--border-color);
                border-radius: var(--border-radius-sm);
                background: var(--surface-color);
                color: var(--text-primary);
                cursor: pointer;
                font-size: var(--font-size-xs);
                transition: all var(--transition-fast);
            }

            .notification-action:hover {
                background: var(--border-light);
            }

            .notification-action.primary {
                background: var(--primary-color);
                color: var(--text-inverse);
                border-color: var(--primary-color);
            }

            .notification-action.primary:hover {
                background: var(--primary-dark);
            }

            /* Tipos de notificación */
            .notification.success {
                border-left-color: var(--success-color);
            }

            .notification.success .notification-title {
                color: var(--success-color);
            }

            .notification.error {
                border-left-color: var(--danger-color);
            }

            .notification.error .notification-title {
                color: var(--danger-color);
            }

            .notification.warning {
                border-left-color: var(--warning-color);
            }

            .notification.warning .notification-title {
                color: var(--warning-color);
            }

            .notification.info {
                border-left-color: var(--info-color);
            }

            .notification.info .notification-title {
                color: var(--info-color);
            }

            /* Responsive */
            @media (max-width: 768px) {
                .notification-container {
                    top: 10px;
                    right: 10px;
                    left: 10px;
                }

                .notification {
                    min-width: auto;
                    max-width: none;
                }
            }
        `;

        const styleElement = DOM.createElement('style', {
            id: 'notification-styles'
        }, styles);
        document.head.appendChild(styleElement);
    }

    /**
     * Configura atajos de teclado
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Escape para cerrar todas las notificaciones
            if (e.key === 'Escape') {
                this.clearAll();
            }
        });
    }

    /**
     * Muestra una notificación
     * @param {string} message - Mensaje de la notificación
     * @param {string} type - Tipo de notificación
     * @param {Object} options - Opciones adicionales
     * @returns {Object} Notificación creada
     */
    show(message, type = NOTIFICATION_TYPES.INFO, options = {}) {
        const notification = this.createNotification(message, type, options);
        this.addNotification(notification);
        return notification;
    }

    /**
     * Crea una notificación
     * @param {string} message - Mensaje
     * @param {string} type - Tipo
     * @param {Object} options - Opciones
     * @returns {Object} Notificación
     */
    createNotification(message, type, options) {
        const id = this.nextId++;
        const duration = options.duration !== undefined ? options.duration : this.defaultDuration;
        
        const notification = {
            id,
            message,
            type,
            title: options.title || this.getDefaultTitle(type),
            duration,
            persistent: options.persistent || false,
            actions: options.actions || [],
            createdAt: new Date(),
            element: null,
            timer: null
        };

        notification.element = this.createElement(notification);
        return notification;
    }

    /**
     * Crea el elemento DOM de la notificación
     * @param {Object} notification - Datos de la notificación
     * @returns {Element} Elemento DOM
     */
    createElement(notification) {
        const element = DOM.createElement('div', {
            className: `notification ${notification.type}`,
            'data-notification-id': notification.id
        });

        // Header
        const header = DOM.createElement('div', {
            className: 'notification-header'
        });

        const title = DOM.createElement('div', {
            className: 'notification-title'
        });

        const icon = DOM.createElement('span', {
            className: 'notification-icon'
        }, this.getIcon(notification.type));

        const titleText = DOM.createElement('span', {}, notification.title);

        title.appendChild(icon);
        title.appendChild(titleText);

        const closeButton = DOM.createElement('button', {
            className: 'notification-close',
            'aria-label': 'Cerrar notificación'
        }, '×');

        closeButton.addEventListener('click', () => {
            this.remove(notification.id);
        });

        header.appendChild(title);
        header.appendChild(closeButton);

        // Body
        const body = DOM.createElement('div', {
            className: 'notification-body'
        }, notification.message);

        element.appendChild(header);
        element.appendChild(body);

        // Actions
        if (notification.actions.length > 0) {
            const actionsContainer = DOM.createElement('div', {
                className: 'notification-actions'
            });

            notification.actions.forEach(action => {
                const actionButton = DOM.createElement('button', {
                    className: `notification-action ${action.primary ? 'primary' : ''}`
                }, action.text);

                actionButton.addEventListener('click', () => {
                    if (action.handler) {
                        action.handler(notification);
                    }
                    if (action.dismiss !== false) {
                        this.remove(notification.id);
                    }
                });

                actionsContainer.appendChild(actionButton);
            });

            element.appendChild(actionsContainer);
        }

        // Progress bar para notificaciones con duración
        if (!notification.persistent && notification.duration > 0) {
            const progress = DOM.createElement('div', {
                className: 'notification-progress'
            });
            element.appendChild(progress);
        }

        return element;
    }

    /**
     * Añade una notificación al contenedor
     * @param {Object} notification - Notificación a añadir
     */
    addNotification(notification) {
        this.notifications.push(notification);
        
        // Limitar notificaciones visibles
        this.enforceMaxVisible();
        
        // Añadir al DOM
        this.container.appendChild(notification.element);
        
        // Animar entrada
        setTimeout(() => {
            DOM.addClass(notification.element, 'show');
        }, 10);

        // Configurar auto-remove
        if (!notification.persistent && notification.duration > 0) {
            this.setupAutoRemove(notification);
        }

        // Emitir evento
        this.emit('notification:show', notification);
    }

    /**
     * Configura la eliminación automática
     * @param {Object} notification - Notificación
     */
    setupAutoRemove(notification) {
        // Progress bar
        const progressBar = notification.element.querySelector('.notification-progress');
        if (progressBar) {
            progressBar.style.width = '100%';
            progressBar.style.transitionDuration = `${notification.duration}ms`;
            
            setTimeout(() => {
                progressBar.style.width = '0%';
            }, 10);
        }

        // Timer de eliminación
        notification.timer = setTimeout(() => {
            this.remove(notification.id);
        }, notification.duration);

        // Pausar en hover
        notification.element.addEventListener('mouseenter', () => {
            if (notification.timer) {
                clearTimeout(notification.timer);
                if (progressBar) {
                    progressBar.style.animationPlayState = 'paused';
                }
            }
        });

        notification.element.addEventListener('mouseleave', () => {
            if (!notification.persistent && notification.duration > 0) {
                notification.timer = setTimeout(() => {
                    this.remove(notification.id);
                }, 1000); // Tiempo reducido al salir del hover
                
                if (progressBar) {
                    progressBar.style.animationPlayState = 'running';
                }
            }
        });
    }

    /**
     * Elimina una notificación
     * @param {number} id - ID de la notificación
     */
    remove(id) {
        const notification = this.notifications.find(n => n.id === id);
        if (!notification) return;

        // Limpiar timer
        if (notification.timer) {
            clearTimeout(notification.timer);
        }

        // Animar salida
        DOM.addClass(notification.element, 'hide');

        setTimeout(() => {
            // Remover del DOM
            if (notification.element.parentNode) {
                notification.element.parentNode.removeChild(notification.element);
            }

            // Remover del array
            const index = this.notifications.findIndex(n => n.id === id);
            if (index > -1) {
                this.notifications.splice(index, 1);
            }

            // Emitir evento
            this.emit('notification:remove', notification);
        }, 300);
    }

    /**
     * Limita las notificaciones visibles
     */
    enforceMaxVisible() {
        if (this.notifications.length > this.maxVisible) {
            const oldestNotification = this.notifications[0];
            this.remove(oldestNotification.id);
        }
    }

    /**
     * Elimina todas las notificaciones
     */
    clearAll() {
        const notificationIds = this.notifications.map(n => n.id);
        notificationIds.forEach(id => this.remove(id));
    }

    /**
     * Obtiene el título por defecto según el tipo
     * @param {string} type - Tipo de notificación
     * @returns {string} Título
     */
    getDefaultTitle(type) {
        const titles = {
            [NOTIFICATION_TYPES.SUCCESS]: 'Éxito',
            [NOTIFICATION_TYPES.ERROR]: 'Error',
            [NOTIFICATION_TYPES.WARNING]: 'Advertencia',
            [NOTIFICATION_TYPES.INFO]: 'Información'
        };
        return titles[type] || 'Notificación';
    }

    /**
     * Obtiene el icono según el tipo
     * @param {string} type - Tipo de notificación
     * @returns {string} Icono
     */
    getIcon(type) {
        const icons = {
            [NOTIFICATION_TYPES.SUCCESS]: '✅',
            [NOTIFICATION_TYPES.ERROR]: '❌',
            [NOTIFICATION_TYPES.WARNING]: '⚠️',
            [NOTIFICATION_TYPES.INFO]: 'ℹ️'
        };
        return icons[type] || 'ℹ️';
    }

    /**
     * Emite un evento personalizado
     * @param {string} eventName - Nombre del evento
     * @param {any} detail - Datos del evento
     */
    emit(eventName, detail) {
        const event = new CustomEvent(eventName, { detail });
        document.dispatchEvent(event);
    }

    /**
     * Configura opciones globales
     * @param {Object} options - Opciones
     */
    configure(options) {
        if (options.maxVisible !== undefined) {
            this.maxVisible = options.maxVisible;
        }
        if (options.defaultDuration !== undefined) {
            this.defaultDuration = options.defaultDuration;
        }
    }
}

// Instancia global
export const notificationManager = new NotificationManager();

/**
 * Funciones de conveniencia
 */
export function showNotification(message, type = NOTIFICATION_TYPES.INFO, options = {}) {
    return notificationManager.show(message, type, options);
}

export function showSuccess(message, options = {}) {
    return showNotification(message, NOTIFICATION_TYPES.SUCCESS, options);
}

export function showError(message, options = {}) {
    return showNotification(message, NOTIFICATION_TYPES.ERROR, options);
}

export function showWarning(message, options = {}) {
    return showNotification(message, NOTIFICATION_TYPES.WARNING, options);
}

export function showInfo(message, options = {}) {
    return showNotification(message, NOTIFICATION_TYPES.INFO, options);
}

/**
 * Notificaciones especiales
 */
export function showConfirmation(message, onConfirm, onCancel = null) {
    return showNotification(message, NOTIFICATION_TYPES.WARNING, {
        title: 'Confirmación',
        persistent: true,
        actions: [
            {
                text: 'Cancelar',
                handler: onCancel || (() => {}),
                dismiss: true
            },
            {
                text: 'Confirmar',
                primary: true,
                handler: onConfirm,
                dismiss: true
            }
        ]
    });
}

export function showProgress(message, promise, options = {}) {
    const notification = showNotification(message, NOTIFICATION_TYPES.INFO, {
        title: 'Procesando...',
        persistent: true,
        ...options
    });

    promise
        .then((result) => {
            notificationManager.remove(notification.id);
            if (options.onSuccess) {
                options.onSuccess(result);
            } else {
                showSuccess('Operación completada exitosamente');
            }
        })
        .catch((error) => {
            notificationManager.remove(notification.id);
            if (options.onError) {
                options.onError(error);
            } else {
                showError(`Error: ${error.message || 'Operación fallida'}`);
            }
        });

    return notification;
}

export function showSystemStatus(status) {
    const messages = {
        online: 'Sistema conectado',
        offline: 'Sistema desconectado',
        maintenance: 'Sistema en mantenimiento',
        error: 'Error del sistema'
    };

    const types = {
        online: NOTIFICATION_TYPES.SUCCESS,
        offline: NOTIFICATION_TYPES.WARNING,
        maintenance: NOTIFICATION_TYPES.INFO,
        error: NOTIFICATION_TYPES.ERROR
    };

    return showNotification(
        messages[status] || 'Estado desconocido',
        types[status] || NOTIFICATION_TYPES.INFO,
        { title: 'Estado del Sistema' }
    );
}

export default {
    NotificationManager,
    notificationManager,
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirmation,
    showProgress,
    showSystemStatus
};