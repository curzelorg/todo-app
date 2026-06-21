/**
 * 💾 Local Storage Handler
 * Manages all data persistence operations
 */

class TodoStorage {
    constructor() {
        this.storageKey = 'todoAppData';
        this.settingsKey = 'todoAppSettings';
        this.init();
    }

    /**
     * Initialize storage with default data if empty
     */
    init() {
        if (!this.get('todos')) {
            this.set('todos', []);
        }
        if (!this.getSettings()) {
            this.setSettings({
                darkMode: false,
                defaultPriority: 'medium',
                sortBy: 'dueDate'
            });
        }
    }

    /**
     * Get all todos
     */
    getTodos() {
        const todos = this.get('todos') || [];
        return todos.map(todo => ({
            ...todo,
            dueDate: todo.dueDate ? new Date(todo.dueDate) : null,
            createdAt: new Date(todo.createdAt),
            updatedAt: new Date(todo.updatedAt)
        }));
    }

    /**
     * Add new todo
     */
    addTodo(todo) {
        const todos = this.get('todos') || [];
        const newTodo = {
            id: this.generateId(),
            ...todo,
            completed: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        todos.push(newTodo);
        this.set('todos', todos);
        return newTodo;
    }

    /**
     * Update existing todo
     */
    updateTodo(id, updates) {
        const todos = this.get('todos') || [];
        const index = todos.findIndex(t => t.id === id);
        
        if (index !== -1) {
            todos[index] = {
                ...todos[index],
                ...updates,
                updatedAt: new Date().toISOString()
            };
            this.set('todos', todos);
            return todos[index];
        }
        return null;
    }

    /**
     * Delete todo
     */
    deleteTodo(id) {
        const todos = this.get('todos') || [];
        const filtered = todos.filter(t => t.id !== id);
        this.set('todos', filtered);
        return filtered.length < todos.length;
    }

    /**
     * Toggle todo completed status
     */
    toggleTodo(id) {
        const todos = this.get('todos') || [];
        const todo = todos.find(t => t.id === id);
        
        if (todo) {
            todo.completed = !todo.completed;
            todo.updatedAt = new Date().toISOString();
            this.set('todos', todos);
            return todo;
        }
        return null;
    }

    /**
     * Get todo by ID
     */
    getTodoById(id) {
        const todos = this.get('todos') || [];
        return todos.find(t => t.id === id);
    }

    /**
     * Get settings
     */
    getSettings() {
        return this.get('settings') || {
            darkMode: false,
            defaultPriority: 'medium',
            sortBy: 'dueDate'
        };
    }

    /**
     * Update settings
     */
    setSettings(settings) {
        this.set('settings', settings);
    }

    /**
     * Update single setting
     */
    updateSetting(key, value) {
        const settings = this.getSettings();
        settings[key] = value;
        this.setSettings(settings);
    }

    /**
     * Clear all todos
     */
    clearAllTodos() {
        this.set('todos', []);
    }

    /**
     * Clear all data
     */
    clearAll() {
        localStorage.removeItem(this.storageKey);
        localStorage.removeItem(this.settingsKey);
        this.init();
    }

    /**
     * Export todos as JSON
     */
    export() {
        return {
            todos: this.get('todos'),
            settings: this.getSettings(),
            exportedAt: new Date().toISOString()
        };
    }

    /**
     * Import todos from JSON
     */
    import(data) {
        if (data.todos && Array.isArray(data.todos)) {
            this.set('todos', data.todos);
        }
        if (data.settings && typeof data.settings === 'object') {
            this.setSettings(data.settings);
        }
    }

    /**
     * Get storage statistics
     */
    getStats() {
        const todos = this.get('todos') || [];
        const completed = todos.filter(t => t.completed).length;
        const active = todos.length - completed;

        return {
            total: todos.length,
            completed: completed,
            active: active,
            completionRate: todos.length > 0 ? Math.round((completed / todos.length) * 100) : 0
        };
    }

    /**
     * Get used storage size
     */
    getStorageSize() {
        let size = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                size += localStorage[key].length + key.length;
            }
        }
        return (size / 1024).toFixed(2);
    }

    /**
     * Private methods
     */

    /**
     * Get data from localStorage
     */
    get(key) {
        try {
            const data = localStorage.getItem(this.storageKey);
            const parsed = data ? JSON.parse(data) : {};
            return parsed[key];
        } catch (error) {
            console.error('Error reading from storage:', error);
            return null;
        }
    }

    /**
     * Set data in localStorage
     */
    set(key, value) {
        try {
            let data = {};
            const existing = localStorage.getItem(this.storageKey);
            if (existing) {
                data = JSON.parse(existing);
            }
            data[key] = value;
            localStorage.setItem(this.storageKey, JSON.stringify(data));
        } catch (error) {
            console.error('Error writing to storage:', error);
        }
    }

    /**
     * Generate unique ID
     */
    generateId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
}

// Create global instance
const todoStorage = new TodoStorage();
