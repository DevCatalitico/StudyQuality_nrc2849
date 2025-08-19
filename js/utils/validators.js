/**
 * VALIDATORS - StudyQuality System
 * Sistema de validación robusto basado en principios de calidad
 */

import { VALIDATION_RULES, USER_ROLES, USER_STATUS } from './constants.js';
import { DOM } from './helpers.js';

/**
 * Clase principal de validación
 */
export class Validator {
    constructor() {
        this.rules = {};
        this.errors = {};
    }

    /**
     * Añade una regla de validación
     * @param {string} field - Campo a validar
     * @param {Function|Object} rule - Regla de validación
     * @returns {Validator} Instancia del validador
     */
    addRule(field, rule) {
        if (!this.rules[field]) {
            this.rules[field] = [];
        }
        this.rules[field].push(rule);
        return this;
    }

    /**
     * Valida todos los campos
     * @param {Object} data - Datos a validar
     * @returns {Object} Resultado de la validación
     */
    validate(data) {
        this.errors = {};
        let isValid = true;

        Object.entries(this.rules).forEach(([field, rules]) => {
            const value = data[field];
            const fieldErrors = [];

            rules.forEach(rule => {
                const result = typeof rule === 'function' ? rule(value, data) : this.executeRule(rule, value, data);
                
                if (!result.isValid) {
                    fieldErrors.push(result.message);
                    isValid = false;
                }
            });

            if (fieldErrors.length > 0) {
                this.errors[field] = fieldErrors;
            }
        });

        return {
            isValid,
            errors: this.errors
        };
    }

    /**
     * Ejecuta una regla de validación
     * @param {Object} rule - Regla a ejecutar
     * @param {any} value - Valor a validar
     * @param {Object} data - Todos los datos
     * @returns {Object} Resultado de la validación
     */
    executeRule(rule, value, data) {
        switch (rule.type) {
            case 'required':
                return this.validateRequired(value, rule.message);
            case 'email':
                return this.validateEmail(value, rule.message);
            case 'minLength':
                return this.validateMinLength(value, rule.min, rule.message);
            case 'maxLength':
                return this.validateMaxLength(value, rule.max, rule.message);
            case 'pattern':
                return this.validatePattern(value, rule.pattern, rule.message);
            case 'custom':
                return rule.validator(value, data);
            default:
                return { isValid: true };
        }
    }

    /**
     * Validaciones específicas
     */
    validateRequired(value, message = 'Este campo es obligatorio') {
        const isValid = value !== null && value !== undefined && String(value).trim().length > 0;
        return { isValid, message: isValid ? '' : message };
    }

    validateEmail(value, message = 'Formato de email inválido') {
        if (!value) return { isValid: true }; // Email opcional si no es requerido
        const isValid = VALIDATION_RULES.email.pattern.test(value);
        return { isValid, message: isValid ? '' : message };
    }

    validateMinLength(value, min, message = `Mínimo ${min} caracteres`) {
        if (!value) return { isValid: true };
        const isValid = String(value).length >= min;
        return { isValid, message: isValid ? '' : message };
    }

    validateMaxLength(value, max, message = `Máximo ${max} caracteres`) {
        if (!value) return { isValid: true };
        const isValid = String(value).length <= max;
        return { isValid, message: isValid ? '' : message };
    }

    validatePattern(value, pattern, message = 'Formato inválido') {
        if (!value) return { isValid: true };
        const isValid = pattern.test(value);
        return { isValid, message: isValid ? '' : message };
    }
}

/**
 * Validador de formularios en tiempo real
 */
export class FormValidator {
    constructor(formElement) {
        this.form = formElement;
        this.validator = new Validator();
        this.isValid = false;
        this.setupEventListeners();
    }

    /**
     * Configura los event listeners
     */
    setupEventListeners() {
        if (!this.form) return;

        // Validación en tiempo real para inputs
        this.form.addEventListener('input', (e) => {
            if (e.target.matches('input, select, textarea')) {
                this.validateField(e.target);
            }
        });

        // Validación al perder el foco
        this.form.addEventListener('blur', (e) => {
            if (e.target.matches('input, select, textarea')) {
                this.validateField(e.target);
            }
        }, true);

        // Validación del formulario completo al enviar
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            if (this.validateForm()) {
                this.onValidSubmit(this.getFormData());
            }
        });
    }

    /**
     * Valida un campo específico
     * @param {Element} field - Campo a validar
     */
    validateField(field) {
        const fieldName = field.name || field.id;
        const value = field.value;
        const formGroup = field.closest('.form-group');
        const errorElement = formGroup?.querySelector('.form-error');

        if (!fieldName || !formGroup) return;

        // Obtener reglas del campo
        const rules = this.getFieldRules(field);
        const tempValidator = new Validator();
        
        rules.forEach(rule => tempValidator.addRule(fieldName, rule));
        
        const result = tempValidator.validate({ [fieldName]: value });
        
        this.updateFieldUI(formGroup, errorElement, result.errors[fieldName]);
        
        // Actualizar estado global del formulario
        this.updateFormValidation();
    }

    /**
     * Obtiene las reglas de validación para un campo
     * @param {Element} field - Campo del formulario
     * @returns {Array} Reglas de validación
     */
    getFieldRules(field) {
        const rules = [];
        const fieldType = field.type;
        const fieldName = field.name || field.id;

        // Reglas basadas en atributos HTML
        if (field.required) {
            rules.push({ type: 'required' });
        }

        if (field.minLength) {
            rules.push({ type: 'minLength', min: parseInt(field.minLength) });
        }

        if (field.maxLength) {
            rules.push({ type: 'maxLength', max: parseInt(field.maxLength) });
        }

        if (field.pattern) {
            rules.push({ type: 'pattern', pattern: new RegExp(field.pattern) });
        }

        // Reglas específicas por tipo de campo
        if (fieldType === 'email') {
            rules.push({ type: 'email' });
        }

        // Reglas específicas por nombre de campo
        switch (fieldName) {
            case 'email':
            case 'loginEmail':
            case 'regEmail':
            case 'modalEmail':
                rules.push({ type: 'email' });
                break;

            case 'password':
            case 'loginPassword':
            case 'regPassword':
                rules.push({
                    type: 'custom',
                    validator: (value) => this.validatePassword(value)
                });
                break;

            case 'name':
            case 'regName':
            case 'modalName':
                rules.push({
                    type: 'pattern',
                    pattern: VALIDATION_RULES.name.pattern,
                    message: 'Solo se permiten letras y espacios'
                });
                break;

            case 'role':
            case 'regRole':
            case 'modalRole':
                rules.push({
                    type: 'custom',
                    validator: (value) => this.validateRole(value)
                });
                break;

            case 'status':
            case 'modalStatus':
                rules.push({
                    type: 'custom',
                    validator: (value) => this.validateStatus(value)
                });
                break;
        }

        return rules;
    }

    /**
     * Validaciones personalizadas
     */
    validatePassword(password) {
        if (!password) {
            return { isValid: false, message: 'La contraseña es obligatoria' };
        }

        const minLength = VALIDATION_RULES.password.minLength;
        if (password.length < minLength) {
            return { isValid: false, message: `Mínimo ${minLength} caracteres` };
        }

        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);

        if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
            return { isValid: false, message: 'Debe contener mayúsculas, minúsculas y números' };
        }

        return { isValid: true, message: '' };
    }

    validateRole(role) {
        const validRoles = Object.values(USER_ROLES);
        const isValid = validRoles.includes(role);
        return { 
            isValid, 
            message: isValid ? '' : 'Rol inválido' 
        };
    }

    validateStatus(status) {
        const validStatuses = Object.values(USER_STATUS);
        const isValid = validStatuses.includes(status);
        return { 
            isValid, 
            message: isValid ? '' : 'Estado inválido' 
        };
    }

    /**
     * Actualiza la UI del campo
     * @param {Element} formGroup - Grupo del formulario
     * @param {Element} errorElement - Elemento de error
     * @param {Array} errors - Errores del campo
     */
    updateFieldUI(formGroup, errorElement, errors) {
        if (!formGroup) return;

        DOM.removeClass(formGroup, 'has-error');
        DOM.removeClass(formGroup, 'has-success');

        if (errorElement) {
            errorElement.textContent = '';
            DOM.removeClass(errorElement, 'active');
        }

        if (errors && errors.length > 0) {
            DOM.addClass(formGroup, 'has-error');
            if (errorElement) {
                errorElement.textContent = errors[0];
                DOM.addClass(errorElement, 'active');
            }
        } else {
            const field = formGroup.querySelector('input, select, textarea');
            if (field && field.value) {
                DOM.addClass(formGroup, 'has-success');
            }
        }
    }

    /**
     * Valida todo el formulario
     * @returns {boolean} True si es válido
     */
    validateForm() {
        const formData = this.getFormData();
        const fields = this.form.querySelectorAll('input, select, textarea');
        
        let isValid = true;

        fields.forEach(field => {
            this.validateField(field);
            const formGroup = field.closest('.form-group');
            if (formGroup && DOM.hasClass(formGroup, 'has-error')) {
                isValid = false;
            }
        });

        this.isValid = isValid;
        return isValid;
    }

    /**
     * Actualiza el estado de validación del formulario
     */
    updateFormValidation() {
        const errorGroups = this.form.querySelectorAll('.form-group.has-error');
        this.isValid = errorGroups.length === 0;
        
        // Emitir evento de cambio de validación
        const event = new CustomEvent('validationChange', {
            detail: { isValid: this.isValid }
        });
        this.form.dispatchEvent(event);
    }

    /**
     * Obtiene los datos del formulario
     * @returns {Object} Datos del formulario
     */
    getFormData() {
        const formData = new FormData(this.form);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }

        // Incluir campos sin name pero con id
        this.form.querySelectorAll('input[id]:not([name]), select[id]:not([name]), textarea[id]:not([name])').forEach(field => {
            data[field.id] = field.value;
        });

        return data;
    }

    /**
     * Callback para formulario válido (debe ser sobrescrito)
     * @param {Object} data - Datos del formulario
     */
    onValidSubmit(data) {
        console.log('Form submitted with valid data:', data);
    }

    /**
     * Limpia el formulario y errores
     */
    reset() {
        this.form.reset();
        this.form.querySelectorAll('.form-group').forEach(group => {
            DOM.removeClass(group, 'has-error');
            DOM.removeClass(group, 'has-success');
        });
        this.form.querySelectorAll('.form-error').forEach(error => {
            error.textContent = '';
            DOM.removeClass(error, 'active');
        });
        this.isValid = false;
    }
}

/**
 * Validadores específicos para diferentes contextos
 */
export const FieldValidators = {
    /**
     * Valida un email único (no existe en el sistema)
     * @param {string} email - Email a validar
     * @param {Array} existingUsers - Usuarios existentes
     * @param {number} excludeId - ID a excluir (para edición)
     * @returns {Object} Resultado de la validación
     */
    uniqueEmail(email, existingUsers = [], excludeId = null) {
        if (!email) return { isValid: true, message: '' };

        const emailExists = existingUsers.some(user => 
            user.email.toLowerCase() === email.toLowerCase() && user.id !== excludeId
        );

        return {
            isValid: !emailExists,
            message: emailExists ? 'Este email ya está registrado' : ''
        };
    },

    /**
     * Valida que la confirmación de contraseña coincida
     * @param {string} password - Contraseña original
     * @param {string} confirmPassword - Confirmación de contraseña
     * @returns {Object} Resultado de la validación
     */
    passwordConfirmation(password, confirmPassword) {
        const isValid = password === confirmPassword;
        return {
            isValid,
            message: isValid ? '' : 'Las contraseñas no coinciden'
        };
    },

    /**
     * Valida una URL
     * @param {string} url - URL a validar
     * @returns {Object} Resultado de la validación
     */
    url(url) {
        if (!url) return { isValid: true, message: '' };

        try {
            new URL(url);
            return { isValid: true, message: '' };
        } catch {
            return { isValid: false, message: 'URL inválida' };
        }
    },

    /**
     * Valida un número en un rango
     * @param {string} value - Valor a validar
     * @param {number} min - Valor mínimo
     * @param {number} max - Valor máximo
     * @returns {Object} Resultado de la validación
     */
    numberRange(value, min, max) {
        if (!value) return { isValid: true, message: '' };

        const num = parseFloat(value);
        if (isNaN(num)) {
            return { isValid: false, message: 'Debe ser un número válido' };
        }

        if (num < min || num > max) {
            return { isValid: false, message: `Debe estar entre ${min} y ${max}` };
        }

        return { isValid: true, message: '' };
    },

    /**
     * Valida una fecha
     * @param {string} dateString - Fecha a validar
     * @param {boolean} futureOnly - Solo fechas futuras
     * @returns {Object} Resultado de la validación
     */
    date(dateString, futureOnly = false) {
        if (!dateString) return { isValid: true, message: '' };

        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return { isValid: false, message: 'Fecha inválida' };
        }

        if (futureOnly && date <= new Date()) {
            return { isValid: false, message: 'La fecha debe ser futura' };
        }

        return { isValid: true, message: '' };
    }
};

/**
 * Utilidades de validación
 */
export const ValidationUtils = {
    /**
     * Aplica validación en tiempo real a un formulario
     * @param {string|Element} formSelector - Selector o elemento del formulario
     * @returns {FormValidator} Instancia del validador
     */
    attachToForm(formSelector) {
        const form = typeof formSelector === 'string' 
            ? document.querySelector(formSelector) 
            : formSelector;
        
        if (!form) {
            console.error('Form not found:', formSelector);
            return null;
        }

        return new FormValidator(form);
    },

    /**
     * Valida un objeto de datos completo
     * @param {Object} data - Datos a validar
     * @param {Object} rules - Reglas de validación
     * @returns {Object} Resultado de la validación
     */
    validateData(data, rules) {
        const validator = new Validator();
        
        Object.entries(rules).forEach(([field, fieldRules]) => {
            fieldRules.forEach(rule => validator.addRule(field, rule));
        });

        return validator.validate(data);
    },

    /**
     * Crea reglas de validación rápidamente
     * @param {Object} config - Configuración de reglas
     * @returns {Object} Reglas formateadas
     */
    createRules(config) {
        const rules = {};

        Object.entries(config).forEach(([field, fieldConfig]) => {
            rules[field] = [];

            if (fieldConfig.required) {
                rules[field].push({ type: 'required' });
            }

            if (fieldConfig.email) {
                rules[field].push({ type: 'email' });
            }

            if (fieldConfig.minLength) {
                rules[field].push({ type: 'minLength', min: fieldConfig.minLength });
            }

            if (fieldConfig.maxLength) {
                rules[field].push({ type: 'maxLength', max: fieldConfig.maxLength });
            }

            if (fieldConfig.pattern) {
                rules[field].push({ type: 'pattern', pattern: fieldConfig.pattern });
            }

            if (fieldConfig.custom) {
                rules[field].push({ type: 'custom', validator: fieldConfig.custom });
            }
        });

        return rules;
    }
};

export default {
    Validator,
    FormValidator,
    FieldValidators,
    ValidationUtils
};