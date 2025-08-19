/**
 * HELPERS - StudyQuality System
 * Funciones de utilidad general para el sistema
 */

import { NOTIFICATION_TYPES, MESSAGES, VALIDATION_RULES } from './constants.js';

/**
 * Utilidades de DOM
 */
export const DOM = {
    /**
     * Selecciona un elemento del DOM
     * @param {string} selector - Selector CSS
     * @returns {Element|null} Elemento encontrado
     */
    $(selector) {
        return document.querySelector(selector);
    },

    /**
     * Selecciona múltiples elementos del DOM
     * @param {string} selector - Selector CSS
     * @returns {NodeList} Lista de elementos
     */
    $$(selector) {
        return document.querySelectorAll(selector);
    },

    /**
     * Crea un elemento con atributos y contenido
     * @param {string} tag - Etiqueta HTML
     * @param {Object} attributes - Atributos del elemento
     * @param {string|Element} content - Contenido del elemento
     * @returns {Element} Elemento creado
     */
    createElement(tag, attributes = {}, content = '') {
        const element = document.createElement(tag);
        
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'className') {
                element.className = value;
            } else if (key === 'innerHTML') {
                element.innerHTML = value;
            } else {
                element.setAttribute(key, value);
            }
        });
        
        if (typeof content === 'string') {
            element.textContent = content;
        } else if (content instanceof Element) {
            element.appendChild(content);
        }
        
        return element;
    },

    /**
     * Añade una clase CSS a un elemento
     * @param {Element} element - Elemento DOM
     * @param {string} className - Nombre de la clase
     */
    addClass(element, className) {
        if (element && className) {
            element.classList.add(className);
        }
    },

    /**
     * Remueve una clase CSS de un elemento
     * @param {Element} element - Elemento DOM
     * @param {string} className - Nombre de la clase
     */
    removeClass(element, className) {
        if (element && className) {
            element.classList.remove(className);
        }
    },

    /**
     * Alterna una clase CSS en un elemento
     * @param {Element} element - Elemento DOM
     * @param {string} className - Nombre de la clase
     */
    toggleClass(element, className) {
        if (element && className) {
            element.classList.toggle(className);
        }
    },

    /**
     * Verifica si un elemento tiene una clase
     * @param {Element} element - Elemento DOM
     * @param {string} className - Nombre de la clase
     * @returns {boolean} True si tiene la clase
     */
    hasClass(element, className) {
        return element && className && element.classList.contains(className);
    },

    /**
     * Muestra un elemento
     * @param {Element} element - Elemento DOM
     */
    show(element) {
        if (element) {
            element.style.display = 'block';
            this.removeClass(element, 'hidden');
        }
    },

    /**
     * Oculta un elemento
     * @param {Element} element - Elemento DOM
     */
    hide(element) {
        if (element) {
            element.style.display = 'none';
            this.addClass(element, 'hidden');
        }
    },

    /**
     * Obtiene los datos de un formulario
     * @param {Element} form - Elemento formulario
     * @returns {Object} Datos del formulario
     */
    getFormData(form) {
        const formData = new FormData(form);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        return data;
    },

    /**
     * Limpia un formulario
     * @param {Element} form - Elemento formulario
     */
    clearForm(form) {
        if (form) {
            form.reset();
            // Limpiar errores de validación
            this.$$('.form-error', form).forEach(error => {
                error.textContent = '';
                this.removeClass(error, 'active');
            });
            this.$$('.form-group', form).forEach(group => {
                this.removeClass(group, 'has-error');
                this.removeClass(group, 'has-success');
            });
        }
    }
};

/**
 * Utilidades de validación
 */
export const Validation = {
    /**
     * Valida un email
     * @param {string} email - Email a validar
     * @returns {boolean} True si es válido
     */
    isValidEmail(email) {
        return VALIDATION_RULES.email.pattern.test(email);
    },

    /**
     * Valida una contraseña
     * @param {string} password - Contraseña a validar
     * @returns {Object} Resultado de la validación
     */
    validatePassword(password) {
        const result = {
            isValid: false,
            strength: 'weak',
            errors: []
        };

        if (!password) {
            result.errors.push('La contraseña es obligatoria');
            return result;
        }

        if (password.length < VALIDATION_RULES.password.minLength) {
            result.errors.push(`Mínimo ${VALIDATION_RULES.password.minLength} caracteres`);
        }

        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        if (!hasUpperCase) result.errors.push('Debe contener mayúsculas');
        if (!hasLowerCase) result.errors.push('Debe contener minúsculas');
        if (!hasNumbers) result.errors.push('Debe contener números');

        // Calcular fortaleza
        let strength = 0;
        if (password.length >= 8) strength++;
        if (hasUpperCase) strength++;
        if (hasLowerCase) strength++;
        if (hasNumbers) strength++;
        if (hasSpecialChars) strength++;

        if (strength <= 2) result.strength = 'weak';
        else if (strength === 3) result.strength = 'fair';
        else if (strength === 4) result.strength = 'good';
        else result.strength = 'strong';

        result.isValid = result.errors.length === 0;
        return result;
    },

    /**
     * Valida un nombre
     * @param {string} name - Nombre a validar
     * @returns {Object} Resultado de la validación
     */
    validateName(name) {
        const result = { isValid: false, errors: [] };

        if (!name || name.trim().length === 0) {
            result.errors.push('El nombre es obligatorio');
            return result;
        }

        const trimmedName = name.trim();

        if (trimmedName.length < VALIDATION_RULES.name.minLength) {
            result.errors.push(`Mínimo ${VALIDATION_RULES.name.minLength} caracteres`);
        }

        if (trimmedName.length > VALIDATION_RULES.name.maxLength) {
            result.errors.push(`Máximo ${VALIDATION_RULES.name.maxLength} caracteres`);
        }

        if (!VALIDATION_RULES.name.pattern.test(trimmedName)) {
            result.errors.push('Solo se permiten letras y espacios');
        }

        result.isValid = result.errors.length === 0;
        return result;
    },

    /**
     * Valida un campo requerido
     * @param {any} value - Valor a validar
     * @returns {boolean} True si no está vacío
     */
    isRequired(value) {
        if (typeof value === 'string') {
            return value.trim().length > 0;
        }
        return value !== null && value !== undefined;
    }
};

/**
 * Utilidades de formato
 */
export const Format = {
    /**
     * Formatea una fecha
     * @param {string|Date} date - Fecha a formatear
     * @param {Object} options - Opciones de formato
     * @returns {string} Fecha formateada
     */
    date(date, options = {}) {
        const defaultOptions = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };

        const formatOptions = { ...defaultOptions, ...options };
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        
        return dateObj.toLocaleDateString('es-ES', formatOptions);
    },

    /**
     * Formatea una fecha relativa (ej: "hace 2 horas")
     * @param {string|Date} date - Fecha a formatear
     * @returns {string} Fecha relativa
     */
    relativeDate(date) {
        const now = new Date();
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        const diffMs = now - dateObj;
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMinutes / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMinutes < 1) return 'ahora';
        if (diffMinutes < 60) return `hace ${diffMinutes} minuto${diffMinutes > 1 ? 's' : ''}`;
        if (diffHours < 24) return `hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
        if (diffDays < 7) return `hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
        
        return this.date(dateObj, { year: 'numeric', month: 'short', day: 'numeric' });
    },

    /**
     * Capitaliza la primera letra de un string
     * @param {string} str - String a capitalizar
     * @returns {string} String capitalizado
     */
    capitalize(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    },

    /**
     * Trunca un texto
     * @param {string} text - Texto a truncar
     * @param {number} maxLength - Longitud máxima
     * @returns {string} Texto truncado
     */
    truncate(text, maxLength = 50) {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    },

    /**
     * Formatea un número con separadores de miles
     * @param {number} number - Número a formatear
     * @returns {string} Número formateado
     */
    number(number) {
        return new Intl.NumberFormat('es-ES').format(number);
    },

    /**
     * Formatea un tamaño de archivo
     * @param {number} bytes - Tamaño en bytes
     * @returns {string} Tamaño formateado
     */
    fileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
};

/**
 * Utilidades de tiempo
 */
export const Time = {
    /**
     * Espera un tiempo determinado
     * @param {number} ms - Milisegundos a esperar
     * @returns {Promise} Promesa que se resuelve después del tiempo
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    /**
     * Debounce para funciones
     * @param {Function} func - Función a debounce
     * @param {number} wait - Tiempo de espera
     * @returns {Function} Función debounced
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Throttle para funciones
     * @param {Function} func - Función a throttle
     * @param {number} limit - Límite de tiempo
     * @returns {Function} Función throttled
     */
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
};

/**
 * Utilidades de datos
 */
export const Data = {
    /**
     * Clona profundamente un objeto
     * @param {any} obj - Objeto a clonar
     * @returns {any} Objeto clonado
     */
    deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => this.deepClone(item));
        if (typeof obj === 'object') {
            const clonedObj = {};
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    clonedObj[key] = this.deepClone(obj[key]);
                }
            }
            return clonedObj;
        }
    },

    /**
     * Compara dos objetos profundamente
     * @param {any} obj1 - Primer objeto
     * @param {any} obj2 - Segundo objeto
     * @returns {boolean} True si son iguales
     */
    deepEqual(obj1, obj2) {
        if (obj1 === obj2) return true;
        if (obj1 == null || obj2 == null) return false;
        if (typeof obj1 !== typeof obj2) return false;
        
        if (typeof obj1 === 'object') {
            const keys1 = Object.keys(obj1);
            const keys2 = Object.keys(obj2);
            
            if (keys1.length !== keys2.length) return false;
            
            for (let key of keys1) {
                if (!keys2.includes(key) || !this.deepEqual(obj1[key], obj2[key])) {
                    return false;
                }
            }
            return true;
        }
        
        return obj1 === obj2;
    },

    /**
     * Genera un ID único
     * @returns {string} ID único
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    /**
     * Ordena un array por una propiedad
     * @param {Array} array - Array a ordenar
     * @param {string} property - Propiedad por la que ordenar
     * @param {string} direction - Dirección (asc|desc)
     * @returns {Array} Array ordenado
     */
    sortBy(array, property, direction = 'asc') {
        return [...array].sort((a, b) => {
            const aVal = a[property];
            const bVal = b[property];
            
            if (direction === 'desc') {
                return aVal < bVal ? 1 : -1;
            }
            return aVal > bVal ? 1 : -1;
        });
    },

    /**
     * Filtra un array por múltiples criterios
     * @param {Array} array - Array a filtrar
     * @param {Object} filters - Filtros a aplicar
     * @returns {Array} Array filtrado
     */
    filterBy(array, filters) {
        return array.filter(item => {
            return Object.entries(filters).every(([key, value]) => {
                if (!value) return true;
                
                const itemValue = item[key];
                if (typeof itemValue === 'string') {
                    return itemValue.toLowerCase().includes(value.toLowerCase());
                }
                return itemValue === value;
            });
        });
    },

    /**
     * Pagina un array
     * @param {Array} array - Array a paginar
     * @param {number} page - Página actual
     * @param {number} pageSize - Tamaño de página
     * @returns {Object} Resultado paginado
     */
    paginate(array, page = 1, pageSize = 10) {
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const items = array.slice(startIndex, endIndex);
        
        return {
            items,
            totalItems: array.length,
            totalPages: Math.ceil(array.length / pageSize),
            currentPage: page,
            pageSize,
            hasNext: endIndex < array.length,
            hasPrev: page > 1
        };
    }
};

/**
 * Utilidades de URL
 */
export const URL = {
    /**
     * Obtiene parámetros de la URL
     * @returns {Object} Parámetros de la URL
     */
    getParams() {
        const params = {};
        const searchParams = new URLSearchParams(window.location.search);
        
        for (let [key, value] of searchParams) {
            params[key] = value;
        }
        
        return params;
    },

    /**
     * Actualiza parámetros de la URL
     * @param {Object} params - Parámetros a actualizar
     */
    updateParams(params) {
        const url = new URL(window.location);
        
        Object.entries(params).forEach(([key, value]) => {
            if (value) {
                url.searchParams.set(key, value);
            } else {
                url.searchParams.delete(key);
            }
        });
        
        window.history.replaceState({}, '', url);
    }
};

/**
 * Utilidades de performance
 */
export const Performance = {
    /**
     * Mide el tiempo de ejecución de una función
     * @param {Function} func - Función a medir
     * @param {string} label - Etiqueta para la medición
     * @returns {any} Resultado de la función
     */
    measure(func, label = 'Function') {
        const start = performance.now();
        const result = func();
        const end = performance.now();
        
        console.log(`${label} took ${(end - start).toFixed(2)}ms`);
        return result;
    },

    /**
     * Obtiene métricas de rendimiento
     * @returns {Object} Métricas de rendimiento
     */
    getMetrics() {
        const navigation = performance.getEntriesByType('navigation')[0];
        
        return {
            loadTime: Math.round(navigation.loadEventEnd - navigation.fetchStart),
            domContentLoaded: Math.round(navigation.domContentLoadedEventEnd - navigation.fetchStart),
            responseTime: Math.round(navigation.responseEnd - navigation.requestStart),
            renderTime: Math.round(navigation.loadEventEnd - navigation.responseEnd)
        };
    }
};

/**
 * Utilidades de eventos
 */
export const Events = {
    /**
     * Emite un evento personalizado
     * @param {string} eventName - Nombre del evento
     * @param {any} detail - Datos del evento
     * @param {Element} target - Elemento objetivo
     */
    emit(eventName, detail = null, target = document) {
        const event = new CustomEvent(eventName, { detail });
        target.dispatchEvent(event);
    },

    /**
     * Escucha un evento
     * @param {string} eventName - Nombre del evento
     * @param {Function} handler - Manejador del evento
     * @param {Element} target - Elemento objetivo
     */
    on(eventName, handler, target = document) {
        target.addEventListener(eventName, handler);
    },

    /**
     * Remueve un listener de evento
     * @param {string} eventName - Nombre del evento
     * @param {Function} handler - Manejador del evento
     * @param {Element} target - Elemento objetivo
     */
    off(eventName, handler, target = document) {
        target.removeEventListener(eventName, handler);
    }
};

// Exportar todo por defecto
export default {
    DOM,
    Validation,
    Format,
    Time,
    Data,
    URL,
    Performance,
    Events
};